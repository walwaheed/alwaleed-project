const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const crypto = require('crypto');

const CLOUDPRINTER_API_KEY = process.env.CLOUD_PRINTER_KEY;
const CLOUDPRINTER_API_URL = 'https://api.cloudprinter.com/cloudcore/1.0';

// Debug: Log API key status on module load
console.log('🔑 CloudPrinter API Key Status:', CLOUDPRINTER_API_KEY ? '✅ Loaded' : '❌ Not Found');
if (!CLOUDPRINTER_API_KEY) {
    console.log('⚠️  Available environment variables:', Object.keys(process.env).filter(k => k.includes('CLOUD')));
}

/**
 * GET /api/cloudprinter/test
 * Test endpoint to verify route is working
 */
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'CloudPrinter route is working!',
        apiKeyConfigured: !!CLOUDPRINTER_API_KEY,
        apiUrl: CLOUDPRINTER_API_URL,
        timestamp: new Date().toISOString()
    });
});

/**
 * POST /api/cloudprinter/test-connection
 * Test actual API connection to CloudPrinter
 */
router.post('/test-connection', async (req, res) => {
    try {
        if (!CLOUDPRINTER_API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'CloudPrinter API key not configured'
            });
        }

        console.log('🧪 Testing CloudPrinter API connection...');
        console.log('API URL:', CLOUDPRINTER_API_URL);
        console.log('API Key (first 10 chars):', CLOUDPRINTER_API_KEY.substring(0, 10) + '...');

        // Try to fetch products list as a connectivity test
        const testUrl = `${CLOUDPRINTER_API_URL}/products`;
        console.log('Test endpoint:', testUrl);

        const response = await fetch(testUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                apikey: CLOUDPRINTER_API_KEY
            })
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        const responseText = await response.text();
        console.log('Response body:', responseText);

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            data = { raw: responseText };
        }

        if (response.ok) {
            return res.json({
                success: true,
                message: 'Successfully connected to CloudPrinter API!',
                status: response.status,
                data: data
            });
        } else {
            return res.status(response.status).json({
                success: false,
                message: 'CloudPrinter API returned an error',
                status: response.status,
                error: data
            });
        }

    } catch (error) {
        console.error('❌ Connection test failed:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to connect to CloudPrinter',
            message: error.message,
            details: error.toString()
        });
    }
});

/**
 * POST /api/cloudprinter/order
 * Submit a print order to CloudPrinter
 * Uses CloudCore API v1.0: https://docs.cloudprinter.com/client/cloudprinter-core-api-v1-0
 */
router.post('/order', async (req, res) => {
    try {
        const {
            productType,
            size,
            imageUrl,
            shippingAddress,
            shippingLevel,
            finish,
            paperType,
            coverUrl,
            bookUrl,
            quantity = 1,
            title
        } = req.body;

        // Validate required fields
        if (!productType || !size || !shippingAddress) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: productType, size, or shippingAddress'
            });
        }

        // Validate API key
        if (!CLOUDPRINTER_API_KEY) {
            console.error('❌ CLOUDPRINTER_API_KEY not found in environment variables');
            return res.status(500).json({
                success: false,
                error: 'CloudPrinter API key not configured'
            });
        }

        // Map product types to CloudPrinter product reference codes
        // These are the actual codes from CloudPrinter's API
        const productMappingBySize = {
            'aluminum': {
                '300x300 mm': 'wall_decor_300x300_alu_fc',
                '400x400 mm': 'wall_decor_400x400_alu_fc',
                '450x450 mm': 'wall_decor_450x450_alu_fc',
                '500x500 mm': 'wall_decor_500x500_alu_fc',
                '700x700 mm': 'wall_decor_700x700_alu_fc',
                '300x450 mm': 'wall_decor_300x450_alu_p_fc',
                '500x600 mm': 'wall_decor_500x600_alu_p_fc',
                '600x800 mm': 'wall_decor_600x800_alu_p_fc',
                '600x900 mm': 'wall_decor_600x900_alu_p_fc',
            },
            'wood': {
                '300x300 mm': 'wall_decor_300x300_wood_fc',
                '400x400 mm': 'wall_decor_400x400_wood_fc',
                '450x450 mm': 'wall_decor_450x450_wood_fc',
                '500x500 mm': 'wall_decor_500x500_wood_fc',
                '700x700 mm': 'wall_decor_700x700_wood_fc',
                '300x450 mm': 'wall_decor_300x450_wood_p_fc',
                '400x600 mm': 'wall_decor_400x600_wood_p_fc',
                '600x800 mm': 'wall_decor_600x800_wood_p_fc',
                '600x900 mm': 'wall_decor_600x900_wood_p_fc',
            },
            'canva': {
                '1000x500 mm': 'wall_decor_1000x500_mm_canvas_fc',
                '200x200 mm': 'wall_decor_200x200_mm_canvas_fc',
                '200x300 mm': 'wall_decor_200x300_mm_canvas_fc',
                '300x300 mm': 'wall_decor_300x300_mm_canvas_fc',
                '300x400 mm': 'wall_decor_300x400_mm_canvas_fc',
                '300x450 mm': 'wall_decor_300x450_mm_canvas_fc',
                '400x400 mm': 'wall_decor_400x400_mm_canvas_fc',
                '400x600 mm': 'wall_decor_400x600_mm_canvas_fc',
                '500x700 mm': 'wall_decor_500x700_mm_canvas_fc',
                '500x750 mm': 'wall_decor_500x750_mm_canvas_fc',
                '600x600 mm': 'wall_decor_600x600_mm_canvas_fc',
                '600x800 mm': 'wall_decor_600x800_mm_canvas_fc',
                '800x800 mm': 'wall_decor_800x800_mm_canvas_fc',
            },
            'photobook': {
                'A6 Portrait': 'photobook_pb_148x200_mm_p_fc',
                'A6 Landscape': 'photobook_pb_200x148mm_l_fc',
                'A5 Portrait': 'photobook_pb_210x250_mm_p_fc',
                'A5 Landscape': 'photobook_pb_250x210_mm_l_fc',
                'A4 Portrait': 'photobook_pb_240x300_p_fc',
                'A4 Landscape': 'photobook_pb_270x200_mm_l_fc',
            }
        };

        // Get product code from mapping
        let productCode;
        if (productMappingBySize[productType] && productMappingBySize[productType][size]) {
            productCode = productMappingBySize[productType][size];
        } else {
            // Fallback if size not found
            console.warn(`⚠️  No CloudPrinter product code found for ${productType} ${size}`);
            return res.status(400).json({
                success: false,
                error: `Product configuration not supported: ${productType} ${size}. Please choose a different size.`
            });
        }

        const orderReference = `WL-${Date.now()}`;
        const itemReference = `${orderReference}-1`;

        // Helper function to calculate MD5 from URL
        async function calculateMD5FromUrl(url) {
            try {
                const response = await fetch(url);
                const buffer = await response.buffer();
                const hash = crypto.createHash('md5').update(buffer).digest('hex');
                console.log(`✅ Calculated MD5 for ${url.substring(url.lastIndexOf('/') + 1)}: ${hash}`);
                return hash;
            } catch (error) {
                console.error(`❌ Failed to calculate MD5 for ${url}:`, error.message);
                throw new Error(`Failed to calculate MD5 checksum for file: ${error.message}`);
            }
        }

        // Build files array based on product type with MD5 checksums
        console.log('📥 Downloading files to calculate MD5 checksums...');
        let files = [];

        if (productType === 'photobook') {
            const [coverMd5, bookMd5] = await Promise.all([
                calculateMD5FromUrl(coverUrl),
                calculateMD5FromUrl(bookUrl)
            ]);
            files = [
                { type: 'cover', url: coverUrl, md5sum: coverMd5 },
                { type: 'book', url: bookUrl, md5sum: bookMd5 }
            ];
        } else {
            const imageMd5 = await calculateMD5FromUrl(imageUrl);
            files = [
                { type: 'product', url: imageUrl, md5sum: imageMd5 }
            ];
        }

        console.log('✅ MD5 checksums calculated successfully');

        // Build options array if needed
        let options = [];

        // For photobooks, page count is REQUIRED in options
        if (productType === 'photobook') {
            // Default to 24 pages if not specified
            const pageCount = req.body.pageCount || 24;

            options.push({
                type: 'total_pages',
                count: String(pageCount)
            });

            // Map paper type to CloudPrinter's exact option names
            if (paperType) {
                let paperOption = null;

                // Parse paper type from frontend format to CloudPrinter format
                // CloudPrinter uses: pageblock_130mcg, pageblock_130mcs, pageblock_150mcg, pageblock_150mcs
                if (paperType.includes('130gsm') && paperType.includes('Gloss')) {
                    paperOption = 'pageblock_130mcg';
                } else if (paperType.includes('130gsm') && paperType.includes('Silk')) {
                    paperOption = 'pageblock_130mcs';
                } else if (paperType.includes('150gsm') && paperType.includes('Gloss')) {
                    paperOption = 'pageblock_150mcg';
                } else if (paperType.includes('150gsm') && paperType.includes('Silk')) {
                    paperOption = 'pageblock_150mcs';
                }

                if (paperOption) {
                    options.push({
                        type: paperOption,
                        count: String(pageCount)
                    });
                }
            }

            // Map finish type to CloudPrinter's exact option names
            if (finish) {
                let finishOption = null;

                // CloudPrinter uses: cover_finish_gloss, cover_finish_matte
                if (finish.toLowerCase().includes('gloss')) {
                    finishOption = 'cover_finish_gloss';
                } else if (finish.toLowerCase().includes('matt') || finish.toLowerCase().includes('matte')) {
                    finishOption = 'cover_finish_matte';
                }

                if (finishOption) {
                    options.push({
                        type: finishOption,
                        count: String(pageCount)
                    });
                }
            }
        } else {
            // For other products (aluminum, wood, canvas)
            // These don't typically need options, but keep for future use
            if (finish) {
                options.push({ type: 'finish', value: finish });
            }
            if (paperType) {
                options.push({ type: 'paper', value: paperType });
            }
        }

        // Build CloudPrinter order payload according to API v1.0 spec
        const orderPayload = {
            apikey: CLOUDPRINTER_API_KEY,
            reference: orderReference,
            email: shippingAddress.email,
            addresses: [
                {
                    type: 'delivery',
                    firstname: shippingAddress.firstname,
                    lastname: shippingAddress.lastname,
                    street1: shippingAddress.street1,
                    zip: shippingAddress.zip,
                    city: shippingAddress.city,
                    country: shippingAddress.country,
                    email: shippingAddress.email,
                    phone: shippingAddress.phone || ''
                }
            ],
            items: [
                {
                    reference: itemReference,
                    product: productCode,
                    shipping_level: shippingLevel || 'cp_postal',
                    title: title || `${productType} - ${size}`,
                    count: String(quantity),
                    files: files,
                    ...(options.length > 0 && { options: options })
                }
            ]
        };

        console.log('📦 Submitting order to CloudPrinter...');
        console.log('═══════════════════════════════════════');
        console.log('🌐 Target URL:', `${CLOUDPRINTER_API_URL}/orders/add`);
        console.log('🔑 API Key:', CLOUDPRINTER_API_KEY ? `${CLOUDPRINTER_API_KEY.substring(0, 10)}...` : 'NOT SET');
        console.log('📄 Order Reference:', orderPayload.reference);
        console.log('📦 Product Code:', productCode);
        console.log('📏 Size:', size);
        console.log('🏠 Shipping Country:', shippingAddress.country);
        console.log('📧 Customer Email:', shippingAddress.email);
        console.log('📋 Full Payload:', JSON.stringify(orderPayload, null, 2));
        console.log('═══════════════════════════════════════');

        // Submit order to CloudPrinter
        console.log('⏳ Sending request to CloudPrinter...');
        const startTime = Date.now();

        const response = await fetch(`${CLOUDPRINTER_API_URL}/orders/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderPayload)
        });

        const requestTime = Date.now() - startTime;
        console.log(`✅ Request completed in ${requestTime}ms`);
        console.log('📊 Response Status:', response.status, response.statusText);
        console.log('📋 Response Headers:', Object.fromEntries(response.headers.entries()));

        const responseText = await response.text();
        console.log('Response Status:', response.status);
        console.log('Response Text:', responseText);

        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            responseData = { raw: responseText };
        }

        if (!response.ok) {
            console.error('❌ CloudPrinter API Error (Status:', response.status, '):', responseData);
            return res.status(response.status).json({
                success: false,
                error: responseData.message || 'CloudPrinter order failed',
                details: responseData,
                httpStatus: response.status
            });
        }

        console.log('✅ Order submitted successfully!');
        console.log('CloudPrinter Response:', responseData);

        return res.json({
            success: true,
            orderReference: orderPayload.reference,
            cloudPrinterOrderId: responseData.order_reference || responseData.reference,
            data: responseData
        });

    } catch (error) {
        console.error('❌ Error submitting CloudPrinter order:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to submit order to CloudPrinter',
            message: error.message
        });
    }
});

/**
 * POST /api/cloudprinter/quote
 * Get a quote for an order from CloudPrinter
 */
router.post('/quote', async (req, res) => {
    try {
        const { productType, size, shippingAddress, quantity = 1 } = req.body;

        if (!CLOUDPRINTER_API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'CloudPrinter API key not configured'
            });
        }

        const quotePayload = {
            apikey: CLOUDPRINTER_API_KEY,
            country: shippingAddress?.country || 'SA',
            items: [
                {
                    product: productType || 'alu_dibond_30x30',
                    count: String(quantity),
                    shipping_level: 'cp_postal'
                }
            ]
        };

        const response = await fetch(`${CLOUDPRINTER_API_URL}/orders/quote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(quotePayload)
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                success: false,
                error: data.message || 'Failed to get quote',
                details: data
            });
        }

        return res.json({
            success: true,
            quote: data
        });

    } catch (error) {
        console.error('Error getting quote:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/cloudprinter/products
 * List available products from CloudPrinter
 */
router.get('/products', async (req, res) => {
    try {
        if (!CLOUDPRINTER_API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'CloudPrinter API key not configured'
            });
        }

        const response = await fetch(`${CLOUDPRINTER_API_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                apikey: CLOUDPRINTER_API_KEY
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                success: false,
                error: data.message || 'Failed to list products'
            });
        }

        return res.json({
            success: true,
            products: data
        });

    } catch (error) {
        console.error('Error listing products:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/cloudprinter/order/:reference
 * Get order status from CloudPrinter
 */
router.get('/order/:reference', async (req, res) => {
    try {
        const { reference } = req.params;

        if (!CLOUDPRINTER_API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'CloudPrinter API key not configured'
            });
        }

        const response = await fetch(`${CLOUDPRINTER_API_URL}/orders/info`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                apikey: CLOUDPRINTER_API_KEY,
                reference: reference
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                success: false,
                error: data.message || 'Failed to fetch order status'
            });
        }

        return res.json({
            success: true,
            order: data
        });

    } catch (error) {
        console.error('Error fetching order status:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
