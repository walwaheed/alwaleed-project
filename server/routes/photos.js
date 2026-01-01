const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const authenticate = require('../middleware/auth');
const Joi = require('joi');

// Validation schema for creating/updating photos
const photoSchema = Joi.object({
    title: Joi.string().required(),
    ai_tool: Joi.string().valid('visa-photo', 'absher-photo', 'absher-photo-female', 'saudi-look', 'baby-photo', 'family-photo'),
    original_url: Joi.string().uri().allow(null, ''),
    edited_url: Joi.string().uri().allow(null, ''),
    thumbnail_url: Joi.string().uri().allow(null, ''),
    editing_settings: Joi.object().default({}),
    price: Joi.number().min(0).default(0),
    print_size: Joi.string().allow(null, ''),
    status: Joi.string().valid('draft', 'published', 'ordered', 'pending', 'paid').default('draft')
});

// GET /api/photos - Get all photos for authenticated user
router.get('/', authenticate, async (req, res, next) => {
    try {
        const userEmail = req.user.email;

        const { data, error } = await supabase
            .from('photos')
            .select('*')
            .eq('user_email', userEmail)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ photos: data || [] });
    } catch (error) {
        next(error);
    }
});

// GET /api/photos/:id - Get single photo
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const { id } = req.params;
        const userEmail = req.user.email;

        const { data, error } = await supabase
            .from('photos')
            .select('*')
            .eq('id', id)
            .eq('user_email', userEmail)
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ error: 'Photo not found' });
        }

        res.json({ photo: data });
    } catch (error) {
        next(error);
    }
});

// POST /api/photos - Create new photo
router.post('/', authenticate, async (req, res, next) => {
    try {
        const { error: validationError, value } = photoSchema.validate(req.body);
        if (validationError) {
            return res.status(400).json({ error: validationError.details[0].message });
        }

        const userEmail = req.user.email;
        const photoData = {
            ...value,
            user_email: userEmail
        };

        const { data, error } = await supabase
            .from('photos')
            .insert([photoData])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ photo: data });
    } catch (error) {
        next(error);
    }
});

// PUT /api/photos/:id - Update photo
router.put('/:id', authenticate, async (req, res, next) => {
    try {
        const { id } = req.params;
        const userEmail = req.user.email;

        const { error: validationError, value } = photoSchema.validate(req.body);
        if (validationError) {
            return res.status(400).json({ error: validationError.details[0].message });
        }

        const { data, error } = await supabase
            .from('photos')
            .update(value)
            .eq('id', id)
            .eq('user_email', userEmail)
            .select()
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ error: 'Photo not found' });
        }

        res.json({ photo: data });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/photos/:id - Delete photo
router.delete('/:id', authenticate, async (req, res, next) => {
    try {
        const { id } = req.params;
        const userEmail = req.user.email;

        // First, get the photo to retrieve storage URLs
        const { data: photo, error: fetchError } = await supabase
            .from('photos')
            .select('*')
            .eq('id', id)
            .eq('user_email', userEmail)
            .single();

        if (fetchError) throw fetchError;

        if (!photo) {
            return res.status(404).json({ error: 'Photo not found' });
        }

        // Delete files from storage if they exist
        const filesToDelete = [];
        if (photo.original_url) {
            const path = photo.original_url.split('/').pop();
            if (path) filesToDelete.push(path);
        }
        if (photo.edited_url) {
            const path = photo.edited_url.split('/').pop();
            if (path) filesToDelete.push(path);
        }
        if (photo.thumbnail_url) {
            const path = photo.thumbnail_url.split('/').pop();
            if (path) filesToDelete.push(path);
        }

        if (filesToDelete.length > 0) {
            await supabase.storage
                .from('photos')
                .remove(filesToDelete);
        }

        // Delete from database
        const { error: deleteError } = await supabase
            .from('photos')
            .delete()
            .eq('id', id)
            .eq('user_email', userEmail);

        if (deleteError) throw deleteError;

        res.json({ message: 'Photo deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
