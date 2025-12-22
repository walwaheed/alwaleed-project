const express = require('express');
const router = express.Router();
const multer = require('multer');
const supabase = require('../lib/supabase');
const authenticate = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

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

// POST /api/upload - Upload photo to Supabase Storage
router.post('/', authenticate, upload.single('photo'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const userEmail = req.user.email;
        const file = req.file;
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${userEmail}/${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('photos')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('photos')
            .getPublicUrl(filePath);

        res.status(200).json({
            message: 'File uploaded successfully',
            url: publicUrl,
            path: filePath,
            fileName
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/upload/multiple - Upload multiple photos
router.post('/multiple', authenticate, upload.array('photos', 10), async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const userEmail = req.user.email;
        const uploadPromises = req.files.map(async (file) => {
            const fileExt = file.originalname.split('.').pop();
            const fileName = `${uuidv4()}.${fileExt}`;
            const filePath = `${userEmail}/${fileName}`;

            const { data, error } = await supabase.storage
                .from('photos')
                .upload(filePath, file.buffer, {
                    contentType: file.mimetype,
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('photos')
                .getPublicUrl(filePath);

            return {
                url: publicUrl,
                path: filePath,
                fileName,
                originalName: file.originalname
            };
        });

        const results = await Promise.all(uploadPromises);

        res.status(200).json({
            message: 'Files uploaded successfully',
            files: results
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/upload - Delete photo from storage
router.delete('/', authenticate, async (req, res, next) => {
    try {
        const { filePath } = req.body;

        if (!filePath) {
            return res.status(400).json({ error: 'File path is required' });
        }

        const userEmail = req.user.email;

        // Ensure user can only delete their own files
        if (!filePath.startsWith(userEmail + '/')) {
            return res.status(403).json({ error: 'Unauthorized to delete this file' });
        }

        const { error } = await supabase.storage
            .from('photos')
            .remove([filePath]);

        if (error) throw error;

        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
