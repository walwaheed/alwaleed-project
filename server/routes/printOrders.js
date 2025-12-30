const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Create a print order (saves to database before payment)
router.post('/create', async (req, res) => {
    try {
        const { userEmail, productType, orderData, totalAmount } = req.body;

        if (!userEmail || !productType || !orderData) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Insert print order into database
        const { data: printOrder, error } = await supabase
            .from('print_orders')
            .insert({
                user_email: userEmail,
                product_type: productType,
                order_data: orderData,
                total_amount: totalAmount,
                status: 'payment_pending'
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating print order:', error);
            return res.status(500).json({ error: 'Failed to create print order' });
        }

        console.log('✅ Print order created:', printOrder.id);

        res.json({
            success: true,
            printOrderId: printOrder.id,
            message: 'Print order created successfully'
        });

    } catch (error) {
        console.error('Print order creation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Submit print order to CloudPrinter after successful payment
router.post('/submit/:printOrderId', async (req, res) => {
    try {
        const { printOrderId } = req.params;
        const { transactionId } = req.body;

        // Get print order from database
        const { data: printOrder, error: fetchError } = await supabase
            .from('print_orders')
            .select('*')
            .eq('id', printOrderId)
            .single();

        if (fetchError || !printOrder) {
            return res.status(404).json({ error: 'Print order not found' });
        }

        // Check if already submitted
        if (printOrder.status === 'submitted') {
            return res.json({
                success: true,
                message: 'Order already submitted',
                orderReference: printOrder.cloudprinter_order_ref
            });
        }

        // Update with transaction ID
        await supabase
            .from('print_orders')
            .update({
                paylink_transaction_id: transactionId,
                payment_status: 'paid',
                status: 'paid'
            })
            .eq('id', printOrderId);

        // Submit to CloudPrinter
        console.log('📤 Submitting order to CloudPrinter...');
        const cloudPrinterResponse = await fetch('http://localhost:5000/api/cloudprinter/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(printOrder.order_data)
        });

        const cloudPrinterData = await cloudPrinterResponse.json();

        if (cloudPrinterData.success) {
            // Update print order with CloudPrinter reference
            await supabase
                .from('print_orders')
                .update({
                    cloudprinter_order_ref: cloudPrinterData.orderReference,
                    cloudprinter_status: 'submitted',
                    status: 'submitted'
                })
                .eq('id', printOrderId);

            console.log('✅ Order submitted to CloudPrinter:', cloudPrinterData.orderReference);

            res.json({
                success: true,
                orderReference: cloudPrinterData.orderReference,
                message: 'Order submitted successfully'
            });
        } else {
            throw new Error(cloudPrinterData.error || 'CloudPrinter submission failed');
        }

    } catch (error) {
        console.error('Print order submission error:', error);

        // Update status to failed
        await supabase
            .from('print_orders')
            .update({ status: 'failed' })
            .eq('id', req.params.printOrderId);

        res.status(500).json({ error: error.message });
    }
});

// Get user's print orders
router.get('/user/:email', async (req, res) => {
    try {
        const { email } = req.params;

        const { data: orders, error } = await supabase
            .from('print_orders')
            .select('*')
            .eq('user_email', email)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            orders
        });

    } catch (error) {
        console.error('Error fetching print orders:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
