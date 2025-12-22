const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const authenticate = require('../middleware/auth');
const Joi = require('joi');

// Validation schema for cart items
const cartItemSchema = Joi.object({
    photo_id: Joi.string().uuid().required(),
    photo_title: Joi.string().required(),
    photo_url: Joi.string().uri().required(),
    print_size: Joi.string().allow('', null).default('8x10'),
    quantity: Joi.number().integer().min(1).default(1),
    price_per_item: Joi.number().min(0).required(),
    editing_settings: Joi.object().default({})
});

// GET /api/cart - Get all cart items for authenticated user
router.get('/', authenticate, async (req, res, next) => {
    try {
        const userEmail = req.user.email;

        const { data, error } = await supabase
            .from('cart_items')
            .select('*')
            .eq('user_email', userEmail)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ items: data || [] });
    } catch (error) {
        next(error);
    }
});

// POST /api/cart - Add item to cart
router.post('/', authenticate, async (req, res, next) => {
    try {
        const { error: validationError, value } = cartItemSchema.validate(req.body);
        if (validationError) {
            return res.status(400).json({ error: validationError.details[0].message });
        }

        const userEmail = req.user.email;
        const total_price = value.price_per_item * value.quantity;

        const cartData = {
            ...value,
            user_email: userEmail,
            total_price
        };

        const { data, error } = await supabase
            .from('cart_items')
            .insert([cartData])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ item: data });
    } catch (error) {
        next(error);
    }
});

// PUT /api/cart/:id - Update cart item quantity
router.put('/:id', authenticate, async (req, res, next) => {
    try {
        const { id } = req.params;
        const userEmail = req.user.email;

        const updateSchema = Joi.object({
            quantity: Joi.number().integer().min(1).required(),
            print_size: Joi.string().valid('8x10', '11x14', '16x20', '24x36')
        });

        const { error: validationError, value } = updateSchema.validate(req.body);
        if (validationError) {
            return res.status(400).json({ error: validationError.details[0].message });
        }

        // Get current cart item to calculate new total
        const { data: currentItem, error: fetchError } = await supabase
            .from('cart_items')
            .select('*')
            .eq('id', id)
            .eq('user_email', userEmail)
            .single();

        if (fetchError) throw fetchError;

        if (!currentItem) {
            return res.status(404).json({ error: 'Cart item not found' });
        }

        const total_price = currentItem.price_per_item * value.quantity;

        const { data, error } = await supabase
            .from('cart_items')
            .update({ ...value, total_price })
            .eq('id', id)
            .eq('user_email', userEmail)
            .select()
            .single();

        if (error) throw error;

        res.json({ item: data });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/cart/:id - Remove item from cart
router.delete('/:id', authenticate, async (req, res, next) => {
    try {
        const { id } = req.params;
        const userEmail = req.user.email;

        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', id)
            .eq('user_email', userEmail);

        if (error) throw error;

        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/cart - Clear all cart items
router.delete('/', authenticate, async (req, res, next) => {
    try {
        const userEmail = req.user.email;

        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('user_email', userEmail);

        if (error) throw error;

        res.json({ message: 'Cart cleared' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
