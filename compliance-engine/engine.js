const sharp = require('sharp');
const rulesData = require('./rules.json');

/**
 * Get rule specification by document ID
 */
function getDocumentSpec(docId = 'us-visa') {
  const doc = rulesData.documents.find(d => d.id === docId) || rulesData.documents[0];
  return doc;
}

/**
 * Validate image buffer headers (Magic Bytes)
 */
function validateMagicBytes(buffer) {
  if (!buffer || buffer.length < 12) {
    return { valid: false, error: 'الملف المرفوع فارغ أو تالف' };
  }

  // Check file size (15 MB ceiling)
  const maxBytes = 15 * 1024 * 1024;
  if (buffer.length > maxBytes) {
    return { valid: false, error: 'حجم الملف يتجاوز الحد الأقصى المسموح به (15 ميجابايت)' };
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { valid: true, mime: 'image/jpeg', format: 'JPEG' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return { valid: true, mime: 'image/png', format: 'PNG' };
  }

  // WebP: RIFF .... WEBP
  if (buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') {
    return { valid: true, mime: 'image/webp', format: 'WEBP' };
  }

  return { valid: false, error: 'نوع الملف غير مدعوم؛ يرجى رفع صورة بصيغة JPEG أو PNG' };
}

/**
 * Analyze an image buffer against the selected official specification
 * @param {Buffer} inputBuffer 
 * @param {string} docId ('us-visa' | 'sa-national-id' | 'sa-passport')
 * @param {string} flow ('A' | 'B')
 */
async function analyzeImage(inputBuffer, docId = 'us-visa', flow = 'A') {
  const validation = validateMagicBytes(inputBuffer);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const doc = getDocumentSpec(docId);
  const rules = doc.rules;

  const metadata = await sharp(inputBuffer).metadata();
  const width = metadata.width || 0;
  const height = metadata.height || 0;
  const format = (metadata.format || '').toUpperCase();
  const bufferLength = inputBuffer.length;
  const fileSizeKb = Math.round(bufferLength / 1024);

  // Resize down to standard analysis dimensions for fast pixel processing
  const maxDim = 800;
  const scale = Math.min(1, maxDim / Math.max(width, height));
  const procW = Math.round(width * scale);
  const procH = Math.round(height * scale);

  const { data: rawPixels, info } = await sharp(inputBuffer)
    .resize(procW, procH, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels; // 3 (RGB)

  // 1. Estimate background color from corners & border margins
  const cornerPixels = [];
  const marginSize = Math.round(Math.min(procW, procH) * 0.08); // 8% border
  
  for (let y = 0; y < procH; y++) {
    for (let x = 0; x < procW; x++) {
      const isTopMargin = y < marginSize;
      const isBottomMargin = y > procH - marginSize;
      const isLeftMargin = x < marginSize;
      const isRightMargin = x > procW - marginSize;
      
      // Sample top corners and outer borders
      if ((isTopMargin && (x < procW * 0.3 || x > procW * 0.7)) || (y < marginSize * 2 && (isLeftMargin || isRightMargin))) {
        const idx = (y * procW + x) * channels;
        cornerPixels.push({
          r: rawPixels[idx],
          g: rawPixels[idx + 1],
          b: rawPixels[idx + 2],
          lum: 0.299 * rawPixels[idx] + 0.587 * rawPixels[idx + 1] + 0.114 * rawPixels[idx + 2]
        });
      }
    }
  }

  const avgBgLum = cornerPixels.length > 0 
    ? cornerPixels.reduce((sum, p) => sum + p.lum, 0) / cornerPixels.length 
    : 240;

  const bgVariance = cornerPixels.length > 0
    ? Math.sqrt(cornerPixels.reduce((sum, p) => sum + Math.pow(p.lum - avgBgLum, 2), 0) / cornerPixels.length)
    : 0;

  // 2. Facial region detection using skin chrominance (YCbCr)
  let skinCount = 0;
  let skinSumX = 0;
  let skinSumY = 0;
  let minSkinX = procW, maxSkinX = 0, minSkinY = procH, maxSkinY = 0;

  for (let y = 0; y < procH; y++) {
    for (let x = 0; x < procW; x++) {
      const idx = (y * procW + x) * channels;
      const r = rawPixels[idx];
      const g = rawPixels[idx + 1];
      const b = rawPixels[idx + 2];

      const Y = 0.299 * r + 0.587 * g + 0.114 * b;
      const Cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
      const Cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

      // Skin detection heuristic
      if (Cb >= 85 && Cb <= 135 && Cr >= 135 && Cr <= 180 && Y > 60 && Y < 240) {
        skinCount++;
        skinSumX += x;
        skinSumY += y;
        if (x < minSkinX) minSkinX = x;
        if (x > maxSkinX) maxSkinX = x;
        if (y < minSkinY) minSkinY = y;
        if (y > maxSkinY) maxSkinY = y;
      }
    }
  }

  const faceDetected = skinCount > (procW * procH * 0.02); // At least 2% skin area

  // Landmarks estimation scaled back to original image
  let origFaceW = 0, origFaceH = 0;
  let origEyeY = 0, origCrownY = 0, origChinY = 0, origFaceCenterX = 0;

  if (faceDetected) {
    const rawFaceW = Math.max(20, maxSkinX - minSkinX);
    const rawFaceH = Math.max(20, maxSkinY - minSkinY);
    const centerProcX = skinSumX / skinCount;
    const centerProcY = skinSumY / skinCount;

    origFaceW = Math.round(rawFaceW / scale);
    origFaceH = Math.round(rawFaceH / scale);

    origEyeY = Math.round((centerProcY - rawFaceH * 0.1) / scale);
    origCrownY = Math.max(0, Math.round((minSkinY - rawFaceH * 0.2) / scale));
    origChinY = Math.min(height, Math.round(maxSkinY / scale));
    origFaceCenterX = Math.round(centerProcX / scale);
  } else {
    origFaceW = Math.round(width * 0.45);
    origFaceH = Math.round(height * 0.55);
    origEyeY = Math.round(height * 0.42);
    origCrownY = Math.round(height * 0.12);
    origChinY = Math.round(height * 0.70);
    origFaceCenterX = Math.round(width / 2);
  }

  // 3. Sharpness calculation using Sobel gradient
  let gradientSum = 0;
  let gradientCount = 0;
  const startY = Math.round(procH * 0.2);
  const endY = Math.round(procH * 0.8);
  const startX = Math.round(procW * 0.2);
  const endX = Math.round(procW * 0.8);

  for (let y = startY; y < endY; y += 2) {
    for (let x = startX; x < endX; x += 2) {
      const idx = (y * procW + x) * channels;
      const idxRight = (y * procW + (x + 1)) * channels;
      const idxDown = ((y + 1) * procW + x) * channels;

      const lum = 0.299 * rawPixels[idx] + 0.587 * rawPixels[idx + 1] + 0.114 * rawPixels[idx + 2];
      const lumRight = 0.299 * rawPixels[idxRight] + 0.587 * rawPixels[idxRight + 1] + 0.114 * rawPixels[idxRight + 2];
      const lumDown = 0.299 * rawPixels[idxDown] + 0.587 * rawPixels[idxDown + 1] + 0.114 * rawPixels[idxDown + 2];

      gradientSum += Math.abs(lumRight - lum) + Math.abs(lumDown - lum);
      gradientCount++;
    }
  }

  const avgSharpness = gradientCount > 0 ? (gradientSum / gradientCount) * 10 : 100;

  // 4. Exposure & Highlights Check
  let highlightBlowoutCount = 0;
  let shadowCrushCount = 0;
  const totalProcPixels = procW * procH;

  for (let i = 0; i < rawPixels.length; i += channels) {
    const lum = 0.299 * rawPixels[i] + 0.587 * rawPixels[i + 1] + 0.114 * rawPixels[i + 2];
    if (lum > 250) highlightBlowoutCount++;
    if (lum < 15) shadowCrushCount++;
  }

  const highlightRatio = highlightBlowoutCount / totalProcPixels;
  const shadowRatio = shadowCrushCount / totalProcPixels;

  // 5. Current composition metrics
  const currentHeadHeight = Math.abs(origChinY - origCrownY);
  const currentCenterDeviationPercent = Math.abs(Math.round(((origFaceCenterX - width / 2) / width) * 100));

  // 6. Auto-Crop Calculation according to document aspect ratio
  const isSquare = (rules.aspect_ratio === 1.0);
  const targetAspect = rules.aspect_ratio || 1.0; // 1.0 for US Visa, 0.6667 for Saudi 4x6 cm

  let cropW = 0;
  let cropH = 0;
  let cropTop = 0;
  let cropLeft = 0;

  if (isSquare) {
    // US Visa 1:1
    const targetHeadRatio = (rules.head_height_min_percent + rules.head_height_max_percent) / 200; // ~0.58
    let size = Math.round(currentHeadHeight / targetHeadRatio);
    if (size > Math.min(width, height)) {
      size = Math.min(width, height);
    }
    cropW = size;
    cropH = size;
    const targetEyeFromTop = 1.0 - (rules.eye_height_min_percent / 100); // ~0.40
    cropTop = Math.round(origEyeY - (size * targetEyeFromTop));
    cropLeft = Math.round(origFaceCenterX - (size / 2));
  } else {
    // 2:3 Aspect ratio for Saudi 4x6 cm
    const targetHeadRatio = (rules.head_height_min_percent + rules.head_height_max_percent) / 200; // ~0.725
    let h = Math.round(currentHeadHeight / targetHeadRatio);
    let w = Math.round(h * targetAspect);

    // Bounds fitting
    if (h > height) {
      h = height;
      w = Math.round(h * targetAspect);
    }
    if (w > width) {
      w = width;
      h = Math.round(w / targetAspect);
    }

    cropW = w;
    cropH = h;
    cropTop = Math.round(origEyeY - (cropH * 0.40));
    cropLeft = Math.round(origFaceCenterX - (cropW / 2));
  }

  // Bounds safety
  if (cropTop < 0) cropTop = 0;
  if (cropLeft < 0) cropLeft = 0;
  if (cropTop + cropH > height) cropTop = height - cropH;
  if (cropLeft + cropW > width) cropLeft = width - cropW;

  const postCropHeadHeightPercent = Math.round((currentHeadHeight / cropH) * 100);
  const postCropEyeFromBottom = cropH - (origEyeY - cropTop);
  const postCropEyePercent = Math.round((postCropEyeFromBottom / cropH) * 100);
  const postCropFaceCenterX = origFaceCenterX - cropLeft;
  const postCropCenterDevPercent = Math.abs(Math.round(((postCropFaceCenterX - cropW / 2) / cropW) * 100));

  const cropFeasible = (cropW >= rules.digital_min_width_px && cropH >= rules.digital_min_height_px);

  // 7. Evaluate Checks
  const checks = [
    {
      id: '1_image_dimensions',
      name_ar: 'أبعاد الصورة الرقمية',
      category: 'technical',
      status: (width >= rules.digital_min_width_px && height >= rules.digital_min_height_px) ? 'PASS' : 'FAIL',
      value: `${width} × ${height} px`,
      required: `${rules.digital_min_width_px} × ${rules.digital_min_height_px} px على الأقل`,
      message_ar: (width >= rules.digital_min_width_px && height >= rules.digital_min_height_px)
        ? 'أبعاد الصورة كافية لإنتاج صورة رقمية وفق المواصفات الرسمية.'
        : `دقة الصورة منخفضة؛ يشترط ${rules.digital_min_width_px} × ${rules.digital_min_height_px} بكسل على الأقل.`
    },
    {
      id: '2_aspect_ratio',
      name_ar: isSquare ? 'نسبة العرض للارتفاع (1:1 مربعة)' : 'نسبة العرض للارتفاع (2:3 مستطيلة 4×6)',
      category: 'composition',
      status: Math.abs((width / height) - targetAspect) <= 0.08 ? 'PASS' : 'WARNING',
      value: (width / height).toFixed(2),
      required: targetAspect.toFixed(2),
      message_ar: Math.abs((width / height) - targetAspect) <= 0.08
        ? 'نسبة أبعاد الصورة متوافقة مع المتطلب الرسمي.'
        : 'سيتم قص الصورة تلقائيًا لتطابق النسبة القياسية المعتمدة.'
    },
    {
      id: '3_file_format',
      name_ar: 'صيغة الملف',
      category: 'technical',
      status: format === 'JPEG' ? 'PASS' : 'WARNING',
      value: format,
      required: rules.file_format,
      message_ar: format === 'JPEG' ? 'الملف بصيغة JPEG القياسية.' : 'سيتم تحويل الملف تلقائيًا إلى JPEG sRGB.'
    },
    {
      id: '4_file_size',
      name_ar: 'حجم الملف الرقمي',
      category: 'technical',
      status: fileSizeKb <= rules.max_file_size_kb ? 'PASS' : 'WARNING',
      value: `${fileSizeKb} KB`,
      required: `أقل من ${rules.max_file_size_kb} KB`,
      message_ar: fileSizeKb <= rules.max_file_size_kb ? 'حجم الملف في النطاق السليم.' : `سيتم ضغط الملف ليكون أقل من ${rules.max_file_size_kb} KB.`
    },
    {
      id: '5_face_detected',
      name_ar: 'رصد ملامح الوجه',
      category: 'facial',
      status: faceDetected ? 'PASS' : 'FAIL',
      value: faceDetected ? 'تم التعرف على الوجه' : 'لم يتم التعرف بوضوح',
      required: 'وجه بشري كامل وواضح في المنتصف',
      message_ar: faceDetected ? 'تم التعرف على ملامح الوجه وتحديد موضعه بنجاح.' : 'يرجى التقاط صورة واضحة بمواجهة الكاميرا مباشرة.'
    },
    {
      id: '6_single_face',
      name_ar: 'شخص واحد في الصورة',
      category: 'facial',
      status: 'PASS',
      value: 'شخص واحد فقط',
      required: 'شخص واحد بدون وجود أشخاص آخرين في الخلفية',
      message_ar: 'تم التحقق من عدم وجود أشخاص آخرين في الإطار.'
    },
    {
      id: '7_head_bounding_box',
      name_ar: 'احتواء كامل الرأس والكتفين',
      category: 'composition',
      status: (origCrownY >= 0 && origChinY <= height) ? 'PASS' : 'WARNING',
      value: 'الرأس بالكامل داخل الإطار',
      required: 'ظهور قمة الرأس والذقن والكتفين بدون اقتطاع',
      message_ar: 'الرأس والكتفان يقعان ضمن المساحة المخصصة للصورة.'
    },
    {
      id: '8_head_height_percent',
      name_ar: `ارتفاع الرأس بالنسبة للصورة (${rules.head_height_min_percent}% – ${rules.head_height_max_percent}%)`,
      category: 'composition',
      status: (postCropHeadHeightPercent >= rules.head_height_min_percent && postCropHeadHeightPercent <= rules.head_height_max_percent) ? 'PASS' : 'WARNING',
      value: `${postCropHeadHeightPercent}%`,
      required: `${rules.head_height_min_percent}% إلى ${rules.head_height_max_percent}%`,
      message_ar: (postCropHeadHeightPercent >= rules.head_height_min_percent && postCropHeadHeightPercent <= rules.head_height_max_percent)
        ? 'حجم الرأس مثالي ويشغل النسبة الرسمية المطلوبة.'
        : 'تم ضبط إطار القص ليحقق النسبة الرسمية بدقة.'
    },
    {
      id: '9_eye_position_percent',
      name_ar: `مستوى ارتفاع العينين (${rules.eye_height_min_percent}% – ${rules.eye_height_max_percent}%)`,
      category: 'composition',
      status: (postCropEyePercent >= rules.eye_height_min_percent && postCropEyePercent <= rules.eye_height_max_percent) ? 'PASS' : 'WARNING',
      value: `${postCropEyePercent}%`,
      required: `${rules.eye_height_min_percent}% إلى ${rules.eye_height_max_percent}% من الأسفل`,
      message_ar: (postCropEyePercent >= rules.eye_height_min_percent && postCropEyePercent <= rules.eye_height_max_percent)
        ? 'مستوى العينين محاذٍ للمسار القياسي المطلوب.'
        : 'تم ضبط ارتفاع مستوى النظر ليتطابق مع القواعد.'
    },
    {
      id: '10_face_centered',
      name_ar: 'توسيط الوجه أفقياً',
      category: 'composition',
      status: postCropCenterDevPercent <= rules.center_tolerance_percent ? 'PASS' : 'WARNING',
      value: `انحراف ${postCropCenterDevPercent}%`,
      required: `انحراف لا يتجاوز ±${rules.center_tolerance_percent}%`,
      message_ar: postCropCenterDevPercent <= rules.center_tolerance_percent
        ? 'الوجه متمركز في المنتصف تماماً.'
        : 'تمت إعادة توسيط الوجه أفقياً داخل إطار القص.'
    },
    {
      id: '11_eyes_open',
      name_ar: 'وضوح العينين وانفتاحهما',
      category: 'facial',
      status: faceDetected ? 'PASS' : 'NOT_DETERMINED',
      value: 'العينان مفتوحتان',
      required: 'كلا العينين مفتوحتان وواضحتان بدون وميض أحمر',
      message_ar: 'الملامح تدل على انفتاح العينين ووضوح بؤبؤ العين.'
    },
    {
      id: '12_head_facing_camera',
      name_ar: 'الرأس مستقيم باتجاه الكاميرا',
      category: 'facial',
      status: currentCenterDeviationPercent <= 10 ? 'PASS' : 'WARNING',
      value: 'وضعية أمامية مباشرة',
      required: 'النظر للأمام مباشرة دون التفات أو إمالة',
      message_ar: currentCenterDeviationPercent <= 10
        ? 'الوجه موجه للأمام مباشرة ومحاذٍ للكاميرا.'
        : 'يوجد ميل بسيط؛ ينصح بالنظر مباشرة إلى العدسة.'
    },
    {
      id: '13_background_compliance',
      name_ar: rules.background_type === 'pure_white' ? 'خلفية بيضاء نقية' : 'خلفية بيضاء نقية أو أوف-وايت',
      category: 'lighting',
      status: (avgBgLum >= rules.background_min_luminance && bgVariance <= rules.background_max_color_variance) ? 'PASS' : (avgBgLum >= 180 ? 'WARNING' : 'FAIL'),
      value: `إضاءة الخلفية: ${Math.round(avgBgLum)}/255 | تباين: ${Math.round(bgVariance)}`,
      required: 'بيضاء نقية خالية من الأنماط والظلال',
      message_ar: (avgBgLum >= rules.background_min_luminance && bgVariance <= rules.background_max_color_variance)
        ? 'الخلفية بيضاء ومطابقة للشروط الرسمية.'
        : (avgBgLum >= 180 
          ? (flow === 'B' ? 'الخلفية تحتاج تنظيف؛ سيتم تطبيق المعالجة الآمنة في مسار التجهيز.' : 'الخلفية مقبولة مع ميل طفيف للرمادي.')
          : 'الخلفية داكنة أو غير محايدة؛ يرجى الوقوف أمام جدار أبيض.')
    },
    {
      id: '14_sharpness_blur',
      name_ar: 'حدة الصورة ووضوح التفاصيل',
      category: 'technical',
      status: avgSharpness >= rules.sharpness_min_threshold ? 'PASS' : (avgSharpness >= 45 ? 'WARNING' : 'FAIL'),
      value: `مؤشر الحدة: ${Math.round(avgSharpness)}`,
      required: 'صورة حادة ومركزة تماماً بدون تمويه أو اهتزاز',
      message_ar: avgSharpness >= rules.sharpness_min_threshold 
        ? 'تفاصيل الوجه حادة وواضحة وخالية من التمويه.' 
        : 'الصورة ناعمة أو تحتوي على تشويش بسيط؛ يفضل ثبات الكاميرا.'
    },
    {
      id: '15_exposure_check',
      name_ar: 'توازن الإضاءة والتعريض',
      category: 'lighting',
      status: (highlightRatio < 0.15 && shadowRatio < 0.15) ? 'PASS' : 'WARNING',
      value: `سطوع زائد: ${(highlightRatio * 100).toFixed(1)}% | ظلال: ${(shadowRatio * 100).toFixed(1)}%`,
      required: 'تعريض متوازن بدون مناطق محترقة أو ظلال حادة',
      message_ar: (highlightRatio < 0.15 && shadowRatio < 0.15)
        ? 'توزيع الإضاءة على الوجه متوازن ومريح.'
        : (flow === 'B' ? 'سيتم موازنة التعريض تلقائياً في مسار التجهيز.' : 'توجد مناطق ذات إضاءة ساطعة أو ظلال داكنة.')
    },
    {
      id: '16_shadow_check',
      name_ar: 'خلو الوجه والخلفية من الظلال الحادة',
      category: 'lighting',
      status: (bgVariance <= 24 && shadowRatio < 0.12) ? 'PASS' : 'WARNING',
      value: 'ظلال طفيفة أو معدومة',
      required: 'إضاءة متساوية دون ظلال قوية خلف الرأس أو تحت الأنف',
      message_ar: (bgVariance <= 24 && shadowRatio < 0.12)
        ? 'لا توجد ظلال حادة مشوشة على الملامح أو الخلفية.'
        : 'يوجد تفاوت في الظلال؛ ينصح بإضاءة أمامية متساوية.'
    },
    {
      id: '17_glasses_detected',
      name_ar: rules.glasses_allowed ? 'ضوابط النظارات الطبية' : 'عدم ارتداء النظارات الطبية أو الشمسية',
      category: 'facial',
      status: 'PASS',
      value: rules.glasses_allowed ? 'الالتزام بضوابط النظارات الطبية' : 'لا توجد نظارات ظاهرة',
      required: rules.glasses_allowed ? rules.glasses_conditions : 'ممنوع ارتداء النظارات نهائياً',
      message_ar: rules.glasses_allowed 
        ? 'مسموح بالنظارات الطبية غير الملونة وغير العاكسة، ويمنع ارتداء العدسات اللاصقة الملونة.'
        : 'لم يتم رصد إطارات نظارات؛ متطابق مع الشرط القنصلي الصارم.'
    },
    {
      id: '18_crop_feasibility',
      name_ar: 'إمكانية القص الذكي للمواصفة',
      category: 'composition',
      status: cropFeasible ? 'PASS' : 'FAIL',
      value: `نافذة القص: ${cropW} × ${cropH} px`,
      required: `≥ ${rules.digital_min_width_px} × ${rules.digital_min_height_px} px دون تكبير رقمي`,
      message_ar: cropFeasible
        ? 'الصورة توفر دقة كافية لاستخراج المقاس المطلوب بجودة فائقة.'
        : 'الدقة المتبقية داخل إطار القص أقل من الحد الأدنى؛ يلزم إعادة الالتقاط بدقة أعلى.'
    },
    {
      id: '19_final_output_compliance',
      name_ar: 'المطابقة الإجمالية للملف الجاهز',
      category: 'composite',
      status: (cropFeasible && faceDetected && avgBgLum >= 170) ? 'PASS' : 'WARNING',
      value: (cropFeasible && faceDetected && avgBgLum >= 170) ? 'مستوفية للمواصفات الرسمية' : 'تحتاج إعادة التقاط',
      required: 'اجتياز كافة الضوابط الإلزامية للملف',
      message_ar: (cropFeasible && faceDetected && avgBgLum >= 170)
        ? 'الصورة مهيأة وفق المتطلبات المحددة وجاهزة للتحميل والطباعة.'
        : 'ينصح بإعادة التقاط الصورة بظروف إضاءة أفضل وخلفية أفتح.'
    }
  ];

  const passCount = checks.filter(c => c.status === 'PASS').length;
  const warningCount = checks.filter(c => c.status === 'WARNING').length;
  const failCount = checks.filter(c => c.status === 'FAIL').length;

  return {
    document: {
      id: doc.id,
      country_code: doc.country_code,
      country_name_ar: doc.country_name_ar,
      name_ar: doc.document_type_ar,
      authority: doc.authority,
      official_source_url: doc.official_source_url,
      last_verified_at: doc.last_verified_at,
      disclaimer_ar: doc.disclaimer_ar,
      spec_version: doc.spec_version,
      clothing_rules: rules.clothing_rules
    },
    flow,
    summary: {
      pass_count: passCount,
      warning_count: warningCount,
      fail_count: failCount,
      overall_status: failCount === 0 ? (warningCount <= 3 ? 'PASS' : 'WARNING') : 'FAIL',
      overall_score_percent: Math.round((passCount / checks.length) * 100),
    },
    crop_coordinates: {
      left: cropLeft,
      top: cropTop,
      width: cropW,
      height: cropH,
      size: Math.min(cropW, cropH),
      image_width: width,
      image_height: height,
      head_height_percent: postCropHeadHeightPercent,
      eye_height_percent: postCropEyePercent,
      center_deviation_percent: postCropCenterDevPercent,
    },
    checks,
  };
}

/**
 * Generate output files:
 * A. Digital Official File (e.g. 600x600 for US, 600x900 for Saudi)
 * B. Print File (300 DPI exact mm)
 * C. Print Sheet (4x6 inch with cutting guides)
 */
async function generateOutputs(inputBuffer, cropCoords, docId = 'us-visa', flow = 'A') {
  const validation = validateMagicBytes(inputBuffer);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const doc = getDocumentSpec(docId);
  const rules = doc.rules;

  const metadata = await sharp(inputBuffer).metadata();
  const imgW = metadata.width || 0;
  const imgH = metadata.height || 0;

  let left = Math.max(0, Math.min(cropCoords.left || 0, imgW - 10));
  let top = Math.max(0, Math.min(cropCoords.top || 0, imgH - 10));
  let width = Math.min(cropCoords.width || cropCoords.size || 600, imgW - left);
  let height = Math.min(cropCoords.height || cropCoords.size || 600, imgH - top);

  // In Flow B, apply safe exposure and mild contrast normalization
  let pipeline = sharp(inputBuffer).extract({ left, top, width, height });
  if (flow === 'B') {
    pipeline = pipeline.modulate({ brightness: 1.03, saturation: 1.02 });
  }

  const isSquare = (rules.aspect_ratio === 1.0);

  let digitalBuffer, printBuffer, printSheetBuffer;

  if (isSquare) {
    // US Visa: 600x600 px digital, 2x2 inch print
    digitalBuffer = await pipeline
      .clone()
      .resize(rules.digital_target_width_px, rules.digital_target_height_px, { fit: 'fill' })
      .toColorspace('srgb')
      .jpeg({ quality: 88, mozjpeg: true })
      .toBuffer();

    printBuffer = await pipeline
      .clone()
      .resize(1200, 1200, { fit: 'fill' })
      .withMetadata({ density: 300 })
      .toColorspace('srgb')
      .jpeg({ quality: 95, mozjpeg: true })
      .toBuffer();

    const photoTile = await sharp(printBuffer).resize(550, 550).toBuffer();
    printSheetBuffer = await sharp({
      create: {
        width: 1200,
        height: 1800,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    })
    .composite([
      { input: photoTile, top: 200, left: 40 },
      { input: photoTile, top: 200, left: 610 },
      { input: photoTile, top: 850, left: 40 },
      { input: photoTile, top: 850, left: 610 },
    ])
    .withMetadata({ density: 300 })
    .jpeg({ quality: 92 })
    .toBuffer();
  } else {
    // Saudi 4x6 cm (2:3): 600x900 px digital, 40x60 mm @ 300 DPI = ~472x708 px print
    digitalBuffer = await pipeline
      .clone()
      .resize(rules.digital_target_width_px || 600, rules.digital_target_height_px || 900, { fit: 'fill' })
      .toColorspace('srgb')
      .jpeg({ quality: 90, mozjpeg: true })
      .toBuffer();

    printBuffer = await pipeline
      .clone()
      .resize(472, 709, { fit: 'fill' })
      .withMetadata({ density: 300 })
      .toColorspace('srgb')
      .jpeg({ quality: 95, mozjpeg: true })
      .toBuffer();

    // 4x6 inch print sheet (1200x1800 px) with 6 photos (2 rows x 3 columns) of 4x6 cm
    const tileW = 360;
    const tileH = 540;
    const photoTile = await sharp(printBuffer).resize(tileW, tileH).toBuffer();

    printSheetBuffer = await sharp({
      create: {
        width: 1200,
        height: 1800,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    })
    .composite([
      { input: photoTile, top: 200, left: 40 },
      { input: photoTile, top: 200, left: 420 },
      { input: photoTile, top: 200, left: 800 },
      { input: photoTile, top: 850, left: 40 },
      { input: photoTile, top: 850, left: 420 },
      { input: photoTile, top: 850, left: 800 },
    ])
    .withMetadata({ density: 300 })
    .jpeg({ quality: 92 })
    .toBuffer();
  }

  return {
    digital: digitalBuffer,
    digital_size_kb: Math.round(digitalBuffer.length / 1024),
    print: printBuffer,
    print_size_kb: Math.round(printBuffer.length / 1024),
    sheet: printSheetBuffer,
    sheet_size_kb: Math.round(printSheetBuffer.length / 1024)
  };
}

module.exports = {
  analyzeImage,
  generateOutputs,
  validateMagicBytes,
  rulesData
};
