const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const supabase = require('../lib/supabase');
const paymentProvider = require('../lib/payment-providers');
const { advanceCrmStage } = require('../lib/crm-stage');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

/**
 * @route POST /api/moyasar/create-payment
 * @desc Create a payment via whichever provider is configured, return the
 *       hosted checkout URL. Route/URL path kept as "moyasar" for now to
 *       avoid an unnecessary frontend redeploy — the actual gateway used
 *       is controlled entirely by PAYMENT_PROVIDER, not this path name.
 * @access Public (or Protected if you add auth middleware)
 */
router.post('/create-payment', async (req, res) => {
    try {
        const { amount, clientName, clientMobile, clientEmail, items, address, bookingDate, packageTitle, printOrderId } = req.body;

        if (!amount || !clientName) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const mobileNumber = clientMobile || '0500000000';

        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const orderItems = items ? items.map(item => ({
            photo_title: item.title || 'Product',
            photo_url: 'https://placehold.co/400?text=Package',
            print_size: 'Package',
            quantity: parseInt(item.qty || 1),
            price: parseFloat(item.price || 0)
        })) : [{
            photo_title: packageTitle || 'Service Package',
            photo_url: 'https://placehold.co/400?text=Service',
            print_size: 'Service',
            quantity: 1,
            price: parseFloat(amount)
        }];

        const shippingAddress = typeof address === 'object' ? address : {
            full_name: clientName,
            address_line1: address || 'No Address Provided',
            city: 'Saudi Arabia',
            state: 'N/A',
            postal_code: '00000',
            country: 'Saudi Arabia'
        };

        const vat_percentage = 0.15;
        const subtotal = parseFloat(amount);

        let userEmail = (clientEmail || 'guest@alwaleed.pro').toLowerCase().trim();

        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const { data: { user }, error } = await supabase.auth.getUser(token);

            if (user && !error) {
                console.log('🔗 Authenticated User Found:', user.email);
                userEmail = user.email.toLowerCase().trim();
            }
        }

        const normalizedEmail = userEmail;

        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert([{
                user_email: normalizedEmail,
                order_number: orderNumber,
                items: orderItems,
                subtotal: subtotal,
                shipping_cost: 0,
                vat_percentage: vat_percentage,
                vat_amount: subtotal * vat_percentage,
                total_amount: subtotal,
                status: 'processing',
                shipping_address: shippingAddress,
                order_date: new Date().toISOString()
            }])
            .select()
            .single();

        if (orderError) {
            console.error('Database Insert Error:', orderError);
            return res.status(500).json({ error: 'Failed to create order record' });
        }

        // Create the payment via whichever provider is configured — the
        // route has no idea which gateway this actually is.
        let payment;
        try {
            payment = await paymentProvider.createPayment({
                amount: subtotal,
                description: `Order #${orderNumber} - ${packageTitle || 'Studio AlWaleed purchase'}`,
                callbackUrl: `${BACKEND_URL}/api/moyasar/webhook`,
                successUrl: `${FRONTEND_URL}/payment-status?orderNumber=${orderNumber}`,
                backUrl: `${FRONTEND_URL}/payment-status?orderNumber=${orderNumber}&cancelled=true`
            });
        } catch (providerError) {
            console.error('Payment Provider Create Error:', providerError);
            return res.status(502).json({ error: 'Failed to create payment invoice' });
        }

        // Store the provider's payment id on the order (reusing tracking_number,
        // same role Paylink's transactionNo played) so the webhook can match
        // it back to this order regardless of which provider generated it.
        if (payment.id) {
            await supabase
                .from('orders')
                .update({ tracking_number: payment.id })
                .eq('order_number', orderNumber);

            console.log('💾 Stored payment id:', payment.id, 'for order:', orderNumber);

            if (printOrderId) {
                await supabase
                    .from('print_orders')
                    .update({ paylink_transaction_id: payment.id }) // column reused across providers
                    .eq('id', printOrderId);

                console.log('🖨️ Linked print order:', printOrderId, 'with payment:', payment.id);
            }
        }

        // Advance the CRM lead to Payment Pending (forward-only — a no-op
        // if they're somehow already further along than this).
        advanceCrmStage(normalizedEmail, 'payment_pending', {
            payment_pending_at: new Date().toISOString()
        }).catch(err => console.error('❌ CRM stage advance (payment_pending) failed:', err));

        res.json({
            success: true,
            paymentUrl: payment.checkoutUrl,
            invoiceId: payment.id,
            orderNumber: orderNumber
        });

    } catch (error) {
        console.error('Create Payment Error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route POST /api/moyasar/webhook
 * @desc Receives the provider's payment-status notification. Does NOT
 *       trust the body directly — re-fetches the payment status via the
 *       provider's authenticated API, and only acts on that response.
 * @access Public (called by the payment provider's servers)
 */
router.post('/webhook', async (req, res) => {
    try {
        const paymentId = paymentProvider.getPaymentIdFromWebhookBody(req.body);

        if (!paymentId) {
            console.warn('⚠️ Webhook received with no payment id in body');
            return res.status(400).json({ error: 'Missing payment id' });
        }

        console.log('🔔 Webhook received for payment:', paymentId);

        let paymentStatus;
        try {
            paymentStatus = await paymentProvider.getPaymentStatus(paymentId);
        } catch (verifyError) {
            console.error('❌ Could not verify payment with provider:', verifyError.message);
            // Acknowledge receipt anyway so the provider doesn't endlessly
            // retry a request we can't currently verify; log for follow-up.
            return res.status(200).json({ received: true, verified: false });
        }

        console.log('✅ Verified payment status from provider:', paymentStatus.status);

        // Acknowledge receipt immediately — everything below is our own
        // processing and shouldn't hold up the response to the provider.
        res.status(200).json({ received: true, verified: true });

        const { data: orders, error: findError } = await supabase
            .from('orders')
            .select('*')
            .eq('tracking_number', paymentId)
            .limit(1);

        if (findError) {
            console.error('❌ Database lookup error:', findError);
            return;
        }

        if (!orders || orders.length === 0) {
            console.error('⚠️ No order found with tracking_number:', paymentId);
            return;
        }

        const order = orders[0];

        if (paymentStatus.status === 'paid') {
            await handlePaymentSuccess(order, paymentId);
        } else if (paymentStatus.status === 'failed') {
            await handlePaymentFailure(order, paymentStatus.status);
        } else {
            console.log(`ℹ️ Payment status "${paymentStatus.status}" — no action taken yet.`);
        }

    } catch (error) {
        console.error('❌ Webhook Error:', error);
        if (!res.headersSent) {
            res.status(200).json({ received: true, error: error.message });
        }
    }
});

/**
 * All the side effects on successful payment: cart clearing, CloudPrinter
 * submission, marking photos paid. Provider-agnostic — runs the same way
 * regardless of which gateway confirmed the payment.
 */
async function handlePaymentSuccess(order, paymentId) {
    console.log('✅ Payment confirmed as Paid for order:', order.order_number);

    const { data: updateData, error: updateError } = await supabase
        .from('orders')
        .update({ status: 'paid' })
        .eq('tracking_number', paymentId)
        .select();

    if (updateError) {
        console.error('❌ Database Update Error:', updateError);
        return;
    }

    if (!updateData || updateData.length === 0) {
        console.error('⚠️ Order update matched no rows for:', paymentId);
        return;
    }

    const userEmail = updateData[0].user_email;

    // Advance the CRM lead to Paid + Booked together — for website
    // bookings there's no separate "staff confirms booking" step today,
    // so both fire on the same webhook event.
    if (userEmail) {
        const now = new Date().toISOString();
        advanceCrmStage(userEmail, 'booked', {
            paid_at: now,
            booked_at: now
        }).catch(err => console.error('❌ CRM stage advance (paid/booked) failed:', err));
    }

    if (userEmail) {
        const { error: cartDeleteError } = await supabase
            .from('cart_items')
            .delete()
            .eq('user_email', userEmail);

        if (cartDeleteError) {
            console.error('⚠️ Failed to clear cart:', cartDeleteError);
        } else {
            console.log('🛒 Cart cleared for user:', userEmail);
        }

        const { data: printOrders } = await supabase
            .from('print_orders')
            .select('*')
            .eq('paylink_transaction_id', paymentId)
            .eq('status', 'payment_pending');

        if (printOrders && printOrders.length > 0) {
            console.log(`📦 Found ${printOrders.length} print order(s) to submit to CloudPrinter`);

            for (const printOrder of printOrders) {
                try {
                    await supabase
                        .from('print_orders')
                        .update({ payment_status: 'paid', status: 'paid' })
                        .eq('id', printOrder.id);

                    console.log(`🚀 Submitting print order ${printOrder.id} to CloudPrinter...`);
                    const cloudPrinterResponse = await fetch('http://localhost:5000/api/cloudprinter/order', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(printOrder.order_data)
                    });

                    const cloudPrinterData = await cloudPrinterResponse.json();

                    if (cloudPrinterData.success) {
                        await supabase
                            .from('print_orders')
                            .update({
                                cloudprinter_order_ref: cloudPrinterData.orderReference,
                                cloudprinter_status: 'submitted',
                                status: 'submitted'
                            })
                            .eq('id', printOrder.id);

                        console.log(`✅ Print order submitted to CloudPrinter: ${cloudPrinterData.orderReference}`);
                    } else {
                        throw new Error(cloudPrinterData.error || 'CloudPrinter submission failed');
                    }
                } catch (printError) {
                    console.error(`❌ Error submitting print order ${printOrder.id}:`, printError);
                    await supabase
                        .from('print_orders')
                        .update({ status: 'failed' })
                        .eq('id', printOrder.id);
                }
            }
        }
    }

    const orderItems = updateData[0].items;
    const photoIdsInOrder = [];
    for (const item of orderItems || []) {
        if (item.photo_id) {
            photoIdsInOrder.push(item.photo_id);
        }
    }

    if (photoIdsInOrder.length > 0) {
        console.log(`📸 Found ${photoIdsInOrder.length} photo(s) in this order to mark as paid`);

        for (const photoId of photoIdsInOrder) {
            const { data: photo } = await supabase
                .from('photos')
                .select('*')
                .eq('id', photoId)
                .single();

            if (photo && photo.status === 'pending') {
                const updatedSettings = {
                    ...photo.editing_settings,
                    paid: true
                };

                await supabase
                    .from('photos')
                    .update({
                        status: 'paid',
                        editing_settings: updatedSettings
                    })
                    .eq('id', photoId);

                console.log(`✅ Photo ${photoId} marked as paid`);
            }
        }
    }
}

async function handlePaymentFailure(order, status) {
    console.log(`⚠️ Payment ${status} for order:`, order.order_number);

    const { data: updateData, error: updateError } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('order_number', order.order_number)
        .select();

    if (updateError) {
        console.error('❌ Database Update Error:', updateError);
    } else if (!updateData || updateData.length === 0) {
        console.error('⚠️ No order found with order_number:', order.order_number);
    } else {
        console.log('✅ Order status updated to CANCELLED');
    }
}

/**
 * @route GET /api/moyasar/order-status/:orderNumber
 * @desc Lightweight status check the frontend polls after redirect back
 *       from the provider's checkout page. Reads only from Supabase — the
 *       webhook is what actually keeps this value current.
 * @access Public
 */
router.get('/order-status/:orderNumber', async (req, res) => {
    try {
        const { orderNumber } = req.params;

        if (!orderNumber) {
            return res.status(400).json({ error: 'Order number is required' });
        }

        const { data: order, error } = await supabase
            .from('orders')
            .select('order_number, status, total_amount, tracking_number, updated_at')
            .eq('order_number', orderNumber)
            .single();

        if (error || !order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const statusMap = {
            processing: { status: 'pending', title: 'Payment Pending', message: 'Your payment is being processed. Please wait a moment.' },
            paid: { status: 'success', title: 'Payment Successful', message: 'Your payment has been confirmed. Thank you!' },
            cancelled: { status: 'failed', title: 'Payment Failed', message: 'Your payment could not be completed. Please try again or contact support.' }
        };

        const statusInfo = statusMap[order.status] || {
            status: 'unknown',
            title: 'Status Unknown',
            message: `Order status: ${order.status}`
        };

        res.json({
            success: true,
            orderNumber: order.order_number,
            orderStatus: order.status,
            amount: order.total_amount,
            ...statusInfo
        });

    } catch (error) {
        console.error('❌ Order Status Check Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

/**
 * @route POST /api/moyasar/retry-payment/:orderNumber
 * @desc Generate a new Moyasar invoice for an existing order (failed/cancelled payment).
 *       Prevents duplicate bookings by only allowing retry on processing/cancelled orders.
 * @access Public
 */
router.post('/retry-payment/:orderNumber', async (req, res) => {
    try {
        const { orderNumber } = req.params;

        if (!orderNumber) {
            return res.status(400).json({ error: 'Order number is required' });
        }

        // Fetch the existing order
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('*')
            .eq('order_number', orderNumber)
            .single();

        if (fetchError || !order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Only allow retry on processing or cancelled orders  never on paid orders
        if (order.status === 'paid') {
            return res.status(400).json({ error: 'This order has already been paid.' });
        }

        // Get the package title from order items for the description
        const packageTitle = order.items?.[0]?.photo_title || 'Studio AlWaleed purchase';

        // Create a new Moyasar invoice for the same amount
        let payment;
        try {
            payment = await paymentProvider.createPayment({
                amount: parseFloat(order.total_amount),
                description: `Order #${orderNumber} (retry) - ${packageTitle}`,
                callbackUrl: `${BACKEND_URL}/api/moyasar/webhook`,
                successUrl: `${FRONTEND_URL}/payment-status?orderNumber=${orderNumber}`,
                backUrl: `${FRONTEND_URL}/payment-status?orderNumber=${orderNumber}&cancelled=true`
            });
        } catch (providerError) {
            console.error('Payment Provider Retry Error:', providerError);
            return res.status(502).json({ error: 'Failed to create new payment invoice' });
        }

        // Update the order with the new invoice id and reset status to processing
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                tracking_number: payment.id,
                status: 'processing',
                updated_at: new Date().toISOString()
            })
            .eq('order_number', orderNumber);

        if (updateError) {
            console.error('Order Update Error on Retry:', updateError);
            return res.status(500).json({ error: 'Failed to update order record' });
        }

        console.log(' Retry payment created for order:', orderNumber, '| New invoice:', payment.id);

        // Notify n8n to update Google Sheet with Payment Retry status
        fetch('https://n8n.alwaleed.pro/webhook/e732c27e-382f-4bfd-8b25-578deee4fcd3', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_email: order.user_email, order_number: orderNumber })
        }).catch(err => console.error('Sheet sync webhook error:', err));

        res.json({
            success: true,
            paymentUrl: payment.checkoutUrl,
            invoiceId: payment.id,
            orderNumber: orderNumber
        });

    } catch (error) {
        console.error('Retry Payment Error:', error);
        res.status(500).json({ error: error.message });
    }
});
module.exports = router;
