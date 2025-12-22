const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const authenticate = require('../middleware/auth');
const Joi = require('joi');

// Validation schema for orders
const orderSchema = Joi.object({
    items: Joi.array().items(Joi.object({
        photo_title: Joi.string().required(),
        photo_url: Joi.string().uri().required(),
        print_size: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
        price: Joi.number().min(0).required()
    })).min(1).required(),
    subtotal: Joi.number().min(0).required(),
    shipping_cost: Joi.number().min(0).default(0),
    shipping_address: Joi.object({
        full_name: Joi.string().required(),
        address_line1: Joi.string().required(),
        address_line2: Joi.string().allow(''),
        city: Joi.string().required(),
        state: Joi.string().required(),
        postal_code: Joi.string().required(),
        country: Joi.string().required()
    }).required()
});

// Helper to generate unique order number
const generateOrderNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `ORD-${timestamp}-${random}`;
};

// GET /api/orders - Get all orders for authenticated user
router.get('/', authenticate, async (req, res, next) => {
    try {
        const userEmail = req.user.email;

        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_email', userEmail)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ orders: data || [] });
    } catch (error) {
        next(error);
    }
});

// GET /api/orders/:id - Get single order
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const { id } = req.params;
        const userEmail = req.user.email;

        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .eq('user_email', userEmail)
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ order: data });
    } catch (error) {
        next(error);
    }
});

// POST /api/orders - Create new order
router.post('/', authenticate, async (req, res, next) => {
    try {
        const { error: validationError, value } = orderSchema.validate(req.body);
        if (validationError) {
            return res.status(400).json({ error: validationError.details[0].message });
        }

        const userEmail = req.user.email;

        // Calculate VAT and total
        const vat_percentage = 0.15; // 15% VAT
        const vat_amount = (value.subtotal + value.shipping_cost) * vat_percentage;
        const total_amount = value.subtotal + value.shipping_cost + vat_amount;

        const orderData = {
            ...value,
            user_email: userEmail,
            order_number: generateOrderNumber(),
            vat_percentage,
            vat_amount: parseFloat(vat_amount.toFixed(2)),
            total_amount: parseFloat(total_amount.toFixed(2)),
            status: 'processing',
            order_date: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('orders')
            .insert([orderData])
            .select()
            .single();

        if (error) throw error;

        // Clear the user's cart after successful order
        await supabase
            .from('cart_items')
            .delete()
            .eq('user_email', userEmail);

        res.status(201).json({ order: data });
    } catch (error) {
        next(error);
    }
});

// PUT /api/orders/:id/status - Update order status (admin functionality)
router.put('/:id/status', authenticate, async (req, res, next) => {
    try {
        const { id } = req.params;
        const userEmail = req.user.email;

        const statusSchema = Joi.object({
            status: Joi.string().valid('processing', 'shipped', 'delivered', 'cancelled').required(),
            tracking_number: Joi.string().allow('')
        });

        const { error: validationError, value } = statusSchema.validate(req.body);
        if (validationError) {
            return res.status(400).json({ error: validationError.details[0].message });
        }

        const { data, error } = await supabase
            .from('orders')
            .update(value)
            .eq('id', id)
            .eq('user_email', userEmail)
            .select()
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ order: data });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
