const express = require('express');
const router = express.Router();
const multer = require('multer');
const supabase = require('../lib/supabase');
const authenticate = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Validation schema for process image request
const processImageSchema = Joi.object({
    aiTool: Joi.string().valid(
        'visa-photo',
        'absher-photo',
        'absher-photo-female',
        'saudi-look',
        'baby-photo',
        'family-photo'
    ).required(),
    title: Joi.string().required(),
    printSize: Joi.string().default('A5'),
    price: Joi.number().default(45)
});

/**
 * POST /api/process-image
 * Complete workflow: Upload → Process with n8n → Save edited → Create DB record
 */
router.post('/', authenticate, upload.single('image'), async (req, res, next) => {
    try {
        // Validate request
        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        const { error: validationError, value } = processImageSchema.validate(req.body);
        if (validationError) {
            return res.status(400).json({ error: validationError.details[0].message });
        }

        const { aiTool, title, printSize, price } = value;
        const userEmail = req.user.email;
        const file = req.file;

        // Step 1: Upload original image to Supabase Storage
        console.log('📤 Step 1: Uploading original image to Supabase...');
        const fileExt = file.originalname.split('.').pop();
        const originalFileName = `${uuidv4()}.${fileExt}`;
        const originalFilePath = `${userEmail}/original/${originalFileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('photos')
            .upload(originalFilePath, file.buffer, {
                contentType: file.mimetype,
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            throw new Error(`Failed to upload original image: ${uploadError.message}`);
        }

        // Get public URL for original image
        const { data: { publicUrl: originalUrl } } = supabase.storage
            .from('photos')
            .getPublicUrl(originalFilePath);

        console.log('✅ Original image uploaded:', originalUrl);

        // Step 2: Send to n8n webhook for AI processing
        console.log('🤖 Step 2: Sending to n8n for AI processing...');

        // Determine n8n webhook path based on AI tool
        const webhookPaths = {
            'visa-photo': '/webhook/visa-photo',
            'absher-photo': '/webhook/absher-photo',
            'absher-photo-female': '/webhook/absher-photo-female',
            'saudi-look': '/webhook/saudi-look',
            'baby-photo': '/webhook/baby-photo',
            'family-photo': '/webhook/family-photo'
        };

        const webhookUrl = `https://n8n.renovaai.cloud${webhookPaths[aiTool] || '/webhook'}`;

        const n8nResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                imageUrl: originalUrl,
                aiTool: aiTool,
                userEmail: userEmail,
                title: title
            })
        });

        if (!n8nResponse.ok) {
            throw new Error(`n8n webhook failed: ${n8nResponse.status} ${n8nResponse.statusText}`);
        }

        const n8nResult = await n8nResponse.json();
        console.log('✅ n8n processing complete:', n8nResult);

        // Extract edited image URL from n8n response
        // Adjust this based on actual n8n response structure
        const editedImageUrl = n8nResult.editedImageUrl || n8nResult.resultUrl || n8nResult.url;

        if (!editedImageUrl) {
            throw new Error('n8n did not return an edited image URL');
        }

        // Step 3: Download edited image from n8n result
        console.log('📥 Step 3: Downloading edited image from n8n result...');
        const editedImageResponse = await fetch(editedImageUrl);

        if (!editedImageResponse.ok) {
            throw new Error('Failed to download edited image from n8n');
        }

        const editedImageBuffer = Buffer.from(await editedImageResponse.arrayBuffer());

        // Step 4: Upload edited image to Supabase Storage
        console.log('📤 Step 4: Uploading edited image to Supabase...');
        const editedFileName = `${uuidv4()}_edited.${fileExt}`;
        const editedFilePath = `${userEmail}/edited/${editedFileName}`;

        const { error: editedUploadError } = await supabase.storage
            .from('photos')
            .upload(editedFilePath, editedImageBuffer, {
                contentType: file.mimetype,
                cacheControl: '3600',
                upsert: false
            });

        if (editedUploadError) {
            console.error('Edited upload error:', editedUploadError);
            throw new Error(`Failed to upload edited image: ${editedUploadError.message}`);
        }

        // Get public URL for edited image
        const { data: { publicUrl: editedUrl } } = supabase.storage
            .from('photos')
            .getPublicUrl(editedFilePath);

        console.log('✅ Edited image uploaded:', editedUrl);

        // Step 5: Create thumbnail (optional - use edited image resized)
        // For now, we'll use the edited image as thumbnail
        const thumbnailUrl = editedUrl;

        // Step 6: Save record to database
        console.log('💾 Step 5: Saving photo record to database...');
        const { data: photo, error: dbError } = await supabase
            .from('photos')
            .insert({
                user_email: userEmail,
                title: title,
                ai_tool: aiTool,
                original_url: originalUrl,
                edited_url: editedUrl,
                thumbnail_url: thumbnailUrl,
                editing_settings: n8nResult.settings || {},
                price: price,
                print_size: printSize,
                status: 'published'
            })
            .select()
            .single();

        if (dbError) {
            console.error('Database error:', dbError);
            throw new Error(`Failed to save photo record: ${dbError.message}`);
        }

        console.log('✅ Photo record created:', photo.id);

        // Return success response
        res.status(201).json({
            message: 'Image processed successfully',
            photo: {
                id: photo.id,
                title: photo.title,
                originalUrl: photo.original_url,
                editedUrl: photo.edited_url,
                thumbnailUrl: photo.thumbnail_url,
                aiTool: photo.ai_tool,
                price: photo.price,
                printSize: photo.print_size,
                status: photo.status,
                createdAt: photo.created_at
            }
        });

    } catch (error) {
        console.error('❌ Process image error:', error);
        next(error);
    }
});

module.exports = router;
