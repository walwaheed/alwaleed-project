/**
 * Al-Waleed Studio: Global Print Products API Router (Express)
 * Serves normalized, commercially approved Cloudprinter products to the React frontend.
 * Evaluates image technical readiness and provides customer-safe live quotes without leaking internal supplier wholesale costs or margins.
 */

const express = require('express');
const router = express.Router();

// 4 Commercially Approved Real Cloudprinter Products
const APPROVED_CLOUDPRINTER_PRODUCTS = [
  {
    global_product_id: "GLOBAL_AW_PHOTO_4X6",
    product_reference: "aw_photo_print_4x6_in",
    cloudprinter_product_reference: "aw_photo_print_4x6_in",
    category: "PHOTO_PRINT",
    display_name: "Fine Art Photo Print (4 × 6 inch)",
    display_name_ar: "طباعة فوتوغرافية فاخرة (4 × 6 بوصة)",
    description: "Classic 10 × 15 cm photographic print on 260gsm archival stock with exceptional color gamut.",
    description_ar: "طباعة فوتوغرافية كلاسيكية عالية الوضوح 10 × 15 سم على ورق فاخر 260gsm مع تباين لوني فائق.",
    dimensions_mm: { width: 101.6, height: 152.4 },
    display_unit: "in",
    starting_price_sar: 18.00,
    mockup_image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&h=800&fit=crop",
    features: [
      "ورق فوتوغرافي أرشيفي فاخر 260gsm",
      "تشطيبات متعددة: لامع، مطفي، وحريري",
      "شحن وتوصيل عالمي موثوق مع رقم تتبع"
    ],
    features_en: [
      "Premium 260gsm archival photo paper",
      "Finishes: Glossy, Matte, and Luster",
      "Reliable global tracked shipping"
    ],
    available_sizes: [
      { id: "4x6_in", label: "4 × 6 inch (101.6 × 152.4 mm)", label_ar: "4 × 6 بوصة (101.6 × 152.4 مم)", price_delta_sar: 0 }
    ],
    finishes: ["GLOSSY", "MATTE", "LUSTER"],
    materials: [
      { id: "luster_260", name: "Premium Luster 260gsm", name_ar: "ورق حريري فاخر 260 جم/م²" },
      { id: "gloss_250", name: "High Gloss 250gsm", name_ar: "ورق لامع عالي البريق 250 جم/م²" },
      { id: "matte_230", name: "Archival Matte 230gsm", name_ar: "ورق مطفي أرشيفي 230 جم/م²" }
    ],
    supported_destinations: ["SA", "AE", "KW", "BH", "QA", "OM", "GB", "US", "DE", "FR"]
  },
  {
    global_product_id: "GLOBAL_AW_PHOTO_5X7",
    product_reference: "aw_photo_print_5x7_in",
    cloudprinter_product_reference: "aw_photo_print_5x7_in",
    category: "PHOTO_PRINT",
    display_name: "Studio Portrait Print (5 × 7 inch)",
    display_name_ar: "طباعة بورتريه استوديو (5 × 7 بوصة)",
    description: "Studio portrait print 13 × 18 cm ideal for framing and desk displays.",
    description_ar: "طباعة بورتريه احترافية 13 × 18 سم مثالية للإطارات وتوثيق اللحظات العائلية والمناسبات.",
    dimensions_mm: { width: 127.0, height: 177.8 },
    display_unit: "in",
    starting_price_sar: 25.00,
    mockup_image: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&h=800&fit=crop",
    features: [
      "مقاس بورتريه مثالي للإطارات المكتبية",
      "ألوان نقية وثبات لعقود دون بهتان",
      "تشطيب حريري ناعم ومقاوم للبصمات"
    ],
    features_en: [
      "Ideal portrait desk frame format",
      "Vibrant colors & archival longevity",
      "Smooth fingerprint-resistant finish"
    ],
    available_sizes: [
      { id: "5x7_in", label: "5 × 7 inch (127.0 × 177.8 mm)", label_ar: "5 × 7 بوصة (127.0 × 177.8 مم)", price_delta_sar: 0 }
    ],
    finishes: ["GLOSSY", "MATTE", "LUSTER"],
    materials: [
      { id: "luster_260", name: "Premium Luster 260gsm", name_ar: "ورق حريري فاخر 260 جم/م²" },
      { id: "matte_230", name: "Archival Matte 230gsm", name_ar: "ورق مطفي أرشيفي 230 جم/م²" }
    ],
    supported_destinations: ["SA", "AE", "KW", "BH", "QA", "OM", "GB", "US", "DE", "FR"]
  },
  {
    global_product_id: "GLOBAL_AW_CANVAS_30X40",
    product_reference: "aw_canvas_mounted_30x40_cm",
    cloudprinter_product_reference: "aw_canvas_mounted_30x40_cm",
    category: "CANVAS",
    display_name: "Gallery Wrapped Canvas (30 × 40 cm)",
    display_name_ar: "لوحة كانفاس جدارية فاخرة (30 × 40 سم)",
    description: "Gallery wrapped canvas mounted on solid wood frame, ready to hang.",
    description_ar: "لوحة كانفاس مشدودة على إطار خشبي متين وجاهزة للتعليق الفوري في الصالات والمكاتب.",
    dimensions_mm: { width: 300.0, height: 400.0 },
    display_unit: "cm",
    starting_price_sar: 195.00,
    mockup_image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&h=800&fit=crop",
    features: [
      "قماش كانفاس قطني 100% 380gsm",
      "إطار خشبي مشدود ومجهز للتعليق",
      "طبقة حماية من الأشعة فوق البنفسجية"
    ],
    features_en: [
      "100% cotton canvas 380gsm",
      "Solid gallery wooden frame ready to hang",
      "Protective UV archival coating"
    ],
    available_sizes: [
      { id: "30x40_cm", label: "30 × 40 cm (300 × 400 mm)", label_ar: "30 × 40 سم (300 × 400 مم)", price_delta_sar: 0 },
      { id: "40x60_cm", label: "40 × 60 cm (400 × 600 mm)", label_ar: "40 × 60 سم (400 × 600 مم)", price_delta_sar: 60 },
      { id: "50x75_cm", label: "50 × 75 cm (500 × 750 mm)", label_ar: "50 × 75 سم (500 × 750 مم)", price_delta_sar: 120 }
    ],
    finishes: ["SATIN_VARNISH", "MATTE_PROTECTIVE"],
    materials: [
      { id: "cotton_canvas_380", name: "Pure Cotton Canvas 380gsm", name_ar: "كانفاس قطني نقي 380 جم/م²" }
    ],
    supported_destinations: ["SA", "AE", "KW", "BH", "QA", "OM", "GB", "US", "DE", "FR"]
  },
  {
    global_product_id: "GLOBAL_AW_POSTER_A3",
    product_reference: "aw_fineart_poster_a3",
    cloudprinter_product_reference: "aw_fineart_poster_a3",
    category: "POSTER",
    display_name: "Archival Fine Art Poster (A3 Size)",
    display_name_ar: "بوستر فني أرشيفي (مقاس A3)",
    description: "Fine art poster on archival acid-free cotton rag for galleries & exhibitions.",
    description_ar: "بوستر فني عالي التباين على ورق قطني فاخر للمعارض والمجموعات الفنية.",
    dimensions_mm: { width: 297.0, height: 420.0 },
    display_unit: "mm",
    starting_price_sar: 75.00,
    mockup_image: "https://images.unsplash.com/photo-1582561424760-0321d75e81fa?w=800&h=800&fit=crop",
    features: [
      "ورق قطني أرشيفي 310gsm خالٍ من الأحماض",
      "تباين لوني مذهل للمعارض والمجموعات الفنية",
      "شحن آمن في أسطوانات واقية"
    ],
    features_en: [
      "Acid-free cotton rag paper 310gsm",
      "Museum grade color gamut & contrast",
      "Secure protective tube shipping"
    ],
    available_sizes: [
      { id: "a3", label: "A3 (297 × 420 mm)", label_ar: "A3 (297 × 420 مم)", price_delta_sar: 0 },
      { id: "a2", label: "A2 (420 × 594 mm)", label_ar: "A2 (420 × 594 مم)", price_delta_sar: 45 }
    ],
    finishes: ["MATTE", "VELVET"],
    materials: [
      { id: "cotton_rag_310", name: "Cotton Rag 310gsm", name_ar: "ورق قطني نقي 310 جم/م²" }
    ],
    supported_destinations: ["SA", "AE", "KW", "BH", "QA", "OM", "GB", "US", "DE", "FR"]
  }
];

const QUALITY_THRESHOLDS = {
  PHOTO_PRINT: { ready_dpi: 240, warning_min_dpi: 150, optimal_dpi: 300 },
  POSTER: { ready_dpi: 200, warning_min_dpi: 120, optimal_dpi: 300 },
  CANVAS: { ready_dpi: 150, warning_min_dpi: 100, optimal_dpi: 200 },
  DEFAULT: { ready_dpi: 200, warning_min_dpi: 120, optimal_dpi: 300 }
};

const priceSnapshots = new Map();

/**
 * GET /api/global-products
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    catalog_version: "2026.8.0",
    products_count: APPROVED_CLOUDPRINTER_PRODUCTS.length,
    products: APPROVED_CLOUDPRINTER_PRODUCTS
  });
});

/**
 * GET /api/global-products/:productReference
 */
router.get('/:productReference', (req, res) => {
  const prod = APPROVED_CLOUDPRINTER_PRODUCTS.find(p => p.product_reference === req.params.productReference);
  if (!prod) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }
  res.json({ success: true, product: prod });
});

/**
 * POST /api/global-products/analyze-image
 * AI Print Quality Guard & Smart Preview Analysis
 */
router.post('/analyze-image', (req, res) => {
  const { image, productReference, customCrop, enableAiUpscale } = req.body;

  if (!image || !image.width || !image.height) {
    return res.status(400).json({ success: false, error: 'Image width and height are required.' });
  }

  const prod = APPROVED_CLOUDPRINTER_PRODUCTS.find(p => p.product_reference === productReference);
  if (!prod) {
    return res.status(404).json({ success: false, error: 'Product reference not found.' });
  }

  const imgW = image.width;
  const imgH = image.height;
  const printW = prod.dimensions_mm.width;
  const printH = prod.dimensions_mm.height;

  // Aspect ratio crop calculation
  const imgAspect = imgW / imgH;
  const isImageLandscape = imgW >= imgH;
  const isPrintLandscape = printW >= printH;
  let targetW = printW;
  let targetH = printH;
  if (isImageLandscape !== isPrintLandscape) {
    targetW = printH;
    targetH = printW;
  }
  const targetAspect = targetW / targetH;

  let activeCrop = { x: 0, y: 0, width: imgW, height: imgH };
  let cropLossPercent = 0;
  if (imgAspect > targetAspect) {
    const newW = Math.round(imgH * targetAspect);
    activeCrop = { x: Math.round((imgW - newW) / 2), y: 0, width: newW, height: imgH };
    cropLossPercent = +(((imgW - newW) / imgW) * 100).toFixed(1);
  } else if (imgAspect < targetAspect) {
    const newH = Math.round(imgW / targetAspect);
    activeCrop = { x: 0, y: Math.round((imgH - newH) / 2), width: imgW, height: newH };
    cropLossPercent = +(((imgH - newH) / imgH) * 100).toFixed(1);
  }

  if (customCrop && customCrop.width && customCrop.height) {
    activeCrop = customCrop;
    cropLossPercent = +(((imgW * imgH - customCrop.width * customCrop.height) / (imgW * imgH)) * 100).toFixed(1);
  }

  // Effective DPI
  const widthInches = targetW / 25.4;
  const heightInches = targetH / 25.4;
  const dpiX = activeCrop.width / widthInches;
  const dpiY = activeCrop.height / heightInches;
  const effectiveDpi = Math.round(Math.min(dpiX, dpiY));

  const threshold = QUALITY_THRESHOLDS[prod.category] || QUALITY_THRESHOLDS.DEFAULT;
  let status = 'PRINT_READY';
  let qualityRating = 'EXCELLENT';
  let messageAr = `جودة ممتازة (${effectiveDpi} DPI). الصورة جاهزة للطباعة الفاخرة بأعلى وضوح.`;
  let messageEn = `Excellent quality (${effectiveDpi} DPI). Image is fully ready for high-definition fine art printing.`;

  if (effectiveDpi < threshold.warning_min_dpi) {
    status = 'PRINT_BLOCKED';
    qualityRating = 'INSUFFICIENT_RESOLUTION';
    messageAr = `دقة غير كافية (${effectiveDpi} DPI). الحد الأدنى المطلوب هو ${threshold.warning_min_dpi} DPI. ستظهر الصورة مشوشة عند هذا المقاس.`;
    messageEn = `Insufficient resolution (${effectiveDpi} DPI). Minimum required is ${threshold.warning_min_dpi} DPI. Image will appear pixelated at this print size.`;
  } else if (effectiveDpi < threshold.ready_dpi) {
    status = 'PRINT_WARNING';
    qualityRating = 'ACCEPTABLE_WITH_RECOMMENDATION';
    messageAr = `جودة مقبولة (${effectiveDpi} DPI). يُنصح بتفعيل التحسين الذكي AI Upscale لضمان حدة مثالية.`;
    messageEn = `Acceptable quality (${effectiveDpi} DPI). AI Upscale enhancement is recommended for optimal sharpness.`;
  }

  let finalStatus = status;
  let aiUpscaleMetrics = null;
  if (status === 'PRINT_WARNING' || (status === 'PRINT_BLOCKED' && effectiveDpi >= threshold.warning_min_dpi * 0.6)) {
    const scaleFactor = effectiveDpi < threshold.ready_dpi ? 2 : 4;
    const enhancedDpi = Math.min(300, effectiveDpi * scaleFactor);
    aiUpscaleMetrics = {
      eligible: true,
      scale_factor: scaleFactor,
      original_dpi: effectiveDpi,
      projected_dpi: enhancedDpi,
      projected_status: enhancedDpi >= threshold.ready_dpi ? 'PRINT_READY' : 'PRINT_WARNING',
      is_active: !!enableAiUpscale
    };
    if (enableAiUpscale && aiUpscaleMetrics.projected_status === 'PRINT_READY') {
      finalStatus = 'PRINT_READY';
    }
  }

  res.json({
    success: true,
    status: finalStatus,
    raw_status: status,
    is_orderable: finalStatus !== 'PRINT_BLOCKED',
    quality_rating: qualityRating,
    effective_dpi: effectiveDpi,
    optimal_dpi: threshold.optimal_dpi,
    message_ar: messageAr,
    message_en: messageEn,
    image_technical_specs: {
      width_px: imgW,
      height_px: imgH,
      aspect_ratio: +(imgW / imgH).toFixed(4),
      format: image.format || 'JPEG'
    },
    target_product_specs: {
      product_reference: prod.product_reference,
      display_name: prod.display_name,
      display_name_ar: prod.display_name_ar,
      category: prod.category,
      dimensions_mm: prod.dimensions_mm
    },
    crop_and_framing: {
      crop_box: activeCrop,
      crop_loss_percent: cropLossPercent,
      has_significant_crop_loss: cropLossPercent > 15.0,
      preview_framing: {
        crop_overlay_normalized: {
          left_percent: +((activeCrop.x / imgW) * 100).toFixed(2),
          top_percent: +((activeCrop.y / imgH) * 100).toFixed(2),
          width_percent: +((activeCrop.width / imgW) * 100).toFixed(2),
          height_percent: +((activeCrop.height / imgH) * 100).toFixed(2)
        }
      }
    },
    ai_upscale: aiUpscaleMetrics,
    processing_pipeline: {
      file_mode: enableAiUpscale ? 'AI_ENHANCED' : 'ORIGINAL',
      original_preserved: true,
      validated_at: new Date().toISOString()
    }
  });
});

/**
 * POST /api/global-products/quote
 */
router.post('/quote', (req, res) => {
  const { productReference, quantity = 1, destination = 'SA', shippingMethod = 'STANDARD_SHIPPING', selectedOptions = {} } = req.body;
  const prod = APPROVED_CLOUDPRINTER_PRODUCTS.find(p => p.product_reference === productReference);

  if (!prod) {
    return res.status(404).json({ success: false, error: 'Product reference not found: ' + productReference });
  }

  let basePrice = prod.starting_price_sar;
  if (selectedOptions.size) {
    const sizeOpt = prod.available_sizes.find(s => s.id === selectedOptions.size || s.label.includes(selectedOptions.size));
    if (sizeOpt) basePrice += sizeOpt.price_delta_sar;
  }

  const productPrice = Number((basePrice * Number(quantity)).toFixed(2));

  let shippingCost = 25.00;
  if (['AE', 'KW', 'BH', 'QA', 'OM', 'United Arab Emirates', 'Kuwait', 'Bahrain', 'Qatar', 'Oman'].includes(destination)) {
    shippingCost = 35.00;
  } else if (['GB', 'US', 'DE', 'FR', 'United Kingdom', 'United States'].includes(destination)) {
    shippingCost = 50.00;
  }

  if (shippingMethod === 'EXPRESS_COURIER' || shippingMethod === 'cp_fast') {
    shippingCost += 20.00;
  }

  const subtotal = Number((productPrice + shippingCost).toFixed(2));
  const isKsa = destination === 'SA' || destination === 'Saudi Arabia' || !destination;
  const taxAmount = isKsa ? Number(((subtotal * 15) / 100).toFixed(2)) : 0.00;
  const grandTotal = Number((subtotal + taxAmount).toFixed(2));

  const quoteId = 'QUO-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase();
  const snapshot = {
    quote_id: quoteId,
    product_reference: productReference,
    quantity: Number(quantity),
    destination,
    shipping_method: shippingMethod,
    customer_pricing: {
      currency: "SAR",
      product_price: productPrice,
      shipping_price: shippingCost,
      tax_amount: taxAmount,
      grand_total: grandTotal
    },
    locked_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    status: "PRICE_SNAPSHOT_LOCKED"
  };

  priceSnapshots.set(quoteId, snapshot);

  res.json({
    success: true,
    quote_id: quoteId,
    product_reference: productReference,
    status: "PRICE_SNAPSHOT_LOCKED",
    customer_pricing: snapshot.customer_pricing,
    valid_until: snapshot.expires_at
  });
});

module.exports = router;
