const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const supabase = require('../lib/supabase');

// Environment variables
const APP_ID = process.env.PAYLINK_APP_ID;
const SECRET_KEY = process.env.PAYLINK_SECRET_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const IS_TEST_MODE = process.env.PAYLINK_TEST_MODE || 'true';

// Paylink API Endpoints
// Production: https://restapi.paylink.sa/api
// Testing: https://restpilot.paylink.sa/api
const PAYLINK_BASE_URL = IS_TEST_MODE
    ? 'https://restpilot.paylink.sa/api'
    : 'https://restapi.paylink.sa/api';

console.log(`💳 Paylink Mode: ${IS_TEST_MODE ? 'TEST (restpilot)' : 'PRODUCTION (restapi)'}`);

/**
 * Authenticate with Paylink to get a Bearer token
 */
async function getPaylinkToken() {
    if (!APP_ID || !SECRET_KEY) {
        throw new Error('Paylink credentials (APP_ID, SECRET_KEY) are missing in environment variables.');
    }

    const response = await fetch(`${PAYLINK_BASE_URL}/auth`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'accept': '*/*'
        },
        body: JSON.stringify({
            apiId: APP_ID,
            secretKey: SECRET_KEY,
            persistToken: false // We get a fresh one each time for safety, or we could cache it
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Paylink Auth Failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.id_token;
}

/**
 * @route POST /api/paylink/create-payment
 * @desc Create a payment invoice
 * @access Public (or Protected if you add auth middleware)
 */
router.post('/create-payment', async (req, res) => {
    try {
        const { amount, clientName, clientMobile, clientEmail, items, address, bookingDate, packageTitle } = req.body;

        if (!amount || !clientName || !clientMobile) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // 1. Create a Pending Order in Database
        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Construct items for order table compatibility
        // If coming from Pricing page, 'items' might be null, so we construct from packageTitle
        const orderItems = items ? items.map(item => ({
            photo_title: item.title || 'Product',
            photo_url: 'https://placehold.co/400?text=Package', // Placeholder
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

        // Construct Address
        // If address is a string (from Pricing), parse it loosely
        const shippingAddress = typeof address === 'object' ? address : {
            full_name: clientName,
            address_line1: address || 'No Address Provided',
            city: 'Saudi Arabia', // Default
            state: 'N/A',
            postal_code: '00000',
            country: 'Saudi Arabia'
        };

        const vat_percentage = 0.15;
        const subtotal = parseFloat(amount);
        // Assuming amount is total (inclusive), we back-calculate or just set total.
        // Let's set total = amount for simplicity in this flow

        // Determine User Email
        let userEmail = (clientEmail || 'guest@alwaleed.pro').toLowerCase().trim();

        // Check if user is logged in via Authorization header
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const { data: { user }, error } = await supabase.auth.getUser(token);

            if (user && !error) {
                console.log('🔗 Authenticated User Found:', user.email);
                userEmail = user.email.toLowerCase().trim(); // OVERRIDE with actual account email
            }
        }

        const normalizedEmail = userEmail;

        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert([{
                user_email: normalizedEmail, // Fallback if not provided
                order_number: orderNumber,
                items: orderItems,
                subtotal: subtotal,
                shipping_cost: 0,
                vat_percentage: vat_percentage,
                vat_amount: subtotal * vat_percentage, // Approximate
                total_amount: subtotal,
                status: 'processing', // DB constraint only allows: processing, shipped, delivered, cancelled
                shipping_address: shippingAddress,
                order_date: new Date().toISOString()
            }])
            .select()
            .single();

        if (orderError) {
            console.error('Database Insert Error:', orderError);
            // Proceeding without DB save is risky, but maybe we just warn? 
            // Better to fail here.
            return res.status(500).json({ error: 'Failed to create order record' });
        }

        // 2. Initiate Paylink Payment
        const token = await getPaylinkToken();
        const callBackUrl = `${FRONTEND_URL}/payment-status`; // Paylink adds ?transactionNo=...

        const payload = {
            amount: parseFloat(amount),
            callBackUrl: callBackUrl,
            clientEmail: clientEmail || 'test@test.com',
            clientMobile: clientMobile,
            clientName: clientName,
            note: `Order #${orderNumber} - ${bookingDate || ''}`,
            orderNumber: orderNumber,
            products: orderItems.map(item => ({
                title: item.photo_title,
                price: item.price,
                qty: item.quantity,
                description: item.print_size
            }))
        };

        const response = await fetch(`${PAYLINK_BASE_URL}/addInvoice`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Paylink Create Invoice Error:', errorText);
            return res.status(response.status).json({ error: 'Failed to create payment invoice' });
        }

        const data = await response.json();

        // Update order with Paylink transaction number
        if (data.transactionNo) {
            await supabase
                .from('orders')
                .update({ tracking_number: data.transactionNo })
                .eq('order_number', orderNumber);

            console.log('💾 Stored Paylink transactionNo:', data.transactionNo, 'for order:', orderNumber);
        }

        res.json({
            success: true,
            paymentUrl: data.url,
            transactionNo: data.transactionNo,
            orderNumber: orderNumber
        });

    } catch (error) {
        console.error('Paylink Create Payment Error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route GET /api/paylink/verify-payment/:transactionNo
 * @desc Verify the status of a payment
 * @access Public
 */
router.get('/verify-payment/:transactionNo', async (req, res) => {
    try {
        const { transactionNo } = req.params;

        if (!transactionNo) {
            return res.status(400).json({ error: 'Transaction number is required' });
        }

        console.log('🔍 Verifying payment for transaction:', transactionNo);

        const token = await getPaylinkToken();

        const response = await fetch(`${PAYLINK_BASE_URL}/getInvoice/${transactionNo}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Paylink Get Invoice Error:', errorText);
            return res.status(response.status).json({ error: 'Failed to retrieve payment status' });
        }

        const data = await response.json();
        console.log('💳 Paylink Full Response:', JSON.stringify(data, null, 2));
        console.log('💳 Paylink Response Summary:', {
            orderStatus: data.orderStatus,
            orderNumber: data.orderNumber,
            amount: data.amount,
            transactionNo: data.transactionNo,
            gatewayOrderRequest: data.gatewayOrderRequest
        });

        // Map authentication result codes to user-friendly messages
        const getAuthenticationDetails = (paylinkData) => {
            const authCode = paylinkData.gatewayOrderRequest?.authenticationResult;
            const orderStatus = paylinkData.orderStatus;

            // Define all possible authentication result codes
            const authResultMap = {
                'Y': {
                    code: 'Y',
                    status: 'success',
                    title: 'Authentication Successful',
                    message: 'Your account has been verified successfully and the payment is complete.',
                    dbStatus: 'paid',
                    icon: 'success'
                },
                'N': {
                    code: 'N',
                    status: 'denied',
                    title: 'Transaction Denied',
                    message: 'Authentication failed. The account could not be verified. Transaction has been denied.',
                    dbStatus: 'cancelled',
                    icon: 'error'
                },
                'cancelled': {
                    code: 'N',
                    status: 'cancelled',
                    title: 'Authentication Cancelled',
                    message: 'The authentication process was cancelled by you or timed out.',
                    dbStatus: 'cancelled',
                    icon: 'warning'
                },
                'U': {
                    code: 'U',
                    status: 'unavailable',
                    title: 'Authentication Unavailable',
                    message: 'Authentication service is currently unavailable. Please try again later or use a different payment method.',
                    dbStatus: 'cancelled',
                    icon: 'warning'
                },
                'R': {
                    code: 'R',
                    status: 'rejected',
                    title: 'Authentication Rejected',
                    message: 'The authentication was rejected. Please contact your bank for more information.',
                    dbStatus: 'cancelled',
                    icon: 'error'
                },
                'E': {
                    code: 'E',
                    status: 'server_error',
                    title: 'Authentication Server Error',
                    message: 'A server error occurred during authentication. Please try again or contact support.',
                    dbStatus: 'cancelled',
                    icon: 'error'
                },
                'AI': {
                    code: 'AI',
                    status: 'gateway_error',
                    title: 'API Gateway Error',
                    message: 'An API Gateway ASM Policy Error occurred. Please contact support.',
                    dbStatus: 'cancelled',
                    icon: 'error'
                }
            };

            // Determine the authentication result
            // IMPORTANT: Check authentication code FIRST before orderStatus
            // This ensures rejected/failed payments are caught even if orderStatus is 'Pending'
            let authResult = null;

            // Priority 1: Check for authentication code (most reliable indicator)
            if (authCode && authResultMap[authCode]) {
                console.log(`🔐 Authentication Code Found: ${authCode}`);
                authResult = authResultMap[authCode];
            }
            // Priority 2: Check if payment is confirmed as Paid
            else if (orderStatus === 'Paid') {
                authResult = authResultMap['Y'];
            }
            // Priority 3: Check if explicitly cancelled
            else if (orderStatus === 'Cancelled' || orderStatus === 'Canceled') {
                authResult = authResultMap['cancelled'];
            }
            // Priority 4: Still pending (no auth code, not paid, not cancelled)
            else if (orderStatus === 'Pending') {
                authResult = {
                    code: 'PENDING',
                    status: 'pending',
                    title: 'Payment Pending',
                    message: 'Your payment is being processed. Please wait a moment.',
                    dbStatus: 'processing',
                    icon: 'pending'
                };
            }
            // Priority 5: Fallback for unknown statuses
            else {
                authResult = {
                    code: 'UNKNOWN',
                    status: 'failed',
                    title: 'Payment Failed',
                    message: `Payment could not be completed. Status: ${orderStatus}`,
                    dbStatus: 'cancelled',
                    icon: 'error'
                };
            }

            return authResult;
        };

        const authDetails = getAuthenticationDetails(data);
        console.log('🔐 Authentication Details:', authDetails);

        // Update Order Status in Database
        if (authDetails.dbStatus === 'paid') {
            console.log('✅ Payment confirmed as Paid. Finding order by transactionNo:', transactionNo);

            // Find order by tracking_number (we stored the Paylink transactionNo there)
            // Note: Receipt URL can be retrieved from Paylink API using tracking_number
            const { data: updateData, error: updateError } = await supabase
                .from('orders')
                .update({ status: 'paid' })
                .eq('tracking_number', transactionNo)
                .select();

            if (updateError) {
                console.error('❌ Database Update Error:', updateError);
                console.error('   This usually means the database constraint does not allow "paid" status.');
                console.error('   Please run the SQL command in supabase_update_status.sql');
            } else if (updateData && updateData.length > 0) {
                console.log('✅ Order status updated to PAID with receipt URL:', updateData);

                // Clear the cart for this user after successful payment
                const userEmail = updateData[0].user_email;
                if (userEmail) {
                    const { error: cartDeleteError } = await supabase
                        .from('cart')
                        .delete()
                        .eq('user_email', userEmail);

                    if (cartDeleteError) {
                        console.error('⚠️ Failed to clear cart:', cartDeleteError);
                    } else {
                        console.log('🛒 Cart cleared for user:', userEmail);
                    }
                }
            } else {
                console.error('⚠️ No order found with tracking_number:', transactionNo);
            }
        } else if (authDetails.dbStatus === 'cancelled') {
            console.log('⚠️ Payment cancelled/rejected. Finding order by transactionNo:', transactionNo);

            // Update order to cancelled status
            const { data: updateData, error: updateError } = await supabase
                .from('orders')
                .update({ status: 'cancelled' })
                .eq('tracking_number', transactionNo)
                .select();

            if (updateError) {
                console.error('❌ Database Update Error:', updateError);
            } else if (updateData && updateData.length > 0) {
                console.log('✅ Order status updated to CANCELLED:', updateData);
            } else {
                console.error('⚠️ No order found with tracking_number:', transactionNo);
            }
        } else {
            console.log('⚠️ Payment not confirmed. Status:', data.orderStatus);
        }

        res.json({
            success: true,
            status: data.orderStatus,
            authenticationResult: authDetails,
            amount: data.amount,
            orderNumber: data.orderNumber,
            receiptUrl: data.url,
            transactionNo: data.transactionNo
        });

    } catch (error) {
        console.error('❌ Paylink Verify Payment Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
