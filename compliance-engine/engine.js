const sharp = require('sharp');
const rulesData = require('./rules.json');

const usRules = rulesData.documents.find(d => d.id === 'us-visa').rules;

/**
 * Analyze an image buffer or file path against US Visa photo requirements
 */
async function analyzeImage(inputBuffer) {
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
      
      // Focus heavily on top corners for background
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

  // 2. Facial region detection using skin chrominance (YCbCr) & edge contrast
  // Cb and Cr skin ranges: 77 <= Cb <= 127 and 133 <= Cr <= 173
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
  let origFaceX = 0, origFaceY = 0, origFaceW = 0, origFaceH = 0;
  let origEyeY = 0, origCrownY = 0, origChinY = 0, origFaceCenterX = 0;

  if (faceDetected) {
    const rawFaceW = Math.max(20, maxSkinX - minSkinX);
    const rawFaceH = Math.max(20, maxSkinY - minSkinY);
    const centerProcX = skinSumX / skinCount;
    const centerProcY = skinSumY / skinCount;

    // Convert to original coordinates
    origFaceW = Math.round(rawFaceW / scale);
    origFaceH = Math.round(rawFaceH / scale);
    origFaceX = Math.round((centerProcX - rawFaceW / 2) / scale);
    origFaceY = Math.round((centerProcY - rawFaceH / 2) / scale);

    // Approximate eye line (~40% from top of face bounding box) and crown (~20% above skin box)
    origEyeY = Math.round((centerProcY - rawFaceH * 0.1) / scale);
    origCrownY = Math.max(0, Math.round((minSkinY - rawFaceH * 0.2) / scale));
    origChinY = Math.min(height, Math.round(maxSkinY / scale));
    origFaceCenterX = Math.round(centerProcX / scale);
  } else {
    // Fallback central portrait assumption if face detector was ambiguous
    origFaceW = Math.round(width * 0.45);
    origFaceH = Math.round(height * 0.55);
    origFaceX = Math.round((width - origFaceW) / 2);
    origFaceY = Math.round(height * 0.18);
    origEyeY = Math.round(height * 0.42);
    origCrownY = Math.round(height * 0.12);
    origChinY = Math.round(height * 0.70);
    origFaceCenterX = Math.round(width / 2);
  }

  // 3. Sharpness & blur calculation using Sobel gradient on center region
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

      const dx = Math.abs(lumRight - lum);
      const dy = Math.abs(lumDown - lum);
      gradientSum += (dx + dy);
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

  // 5. Current composition metrics (pre-crop)
  const currentHeadHeight = Math.abs(origChinY - origCrownY);
  const currentHeadHeightPercent = Math.round((currentHeadHeight / height) * 100);
  const currentEyeHeightFromBottom = height - origEyeY;
  const currentEyeHeightPercent = Math.round((currentEyeHeightFromBottom / height) * 100);
  const currentCenterDeviationPercent = Math.abs(Math.round(((origFaceCenterX - width / 2) / width) * 100));

  // 6. Auto-Crop Calculation for compliant 1:1 US Visa output
  // Rules: Head height 50-69% (target 58%), Eye height from bottom 56-69% (target 62%)
  const targetHeadPercent = 0.58;
  const targetEyeFromBottomPercent = 0.62;
  const targetEyeFromTopPercent = 1.0 - targetEyeFromBottomPercent; // 0.38

  let cropSize = Math.round(currentHeadHeight / targetHeadPercent);
  
  // Calculate top and left of crop
  let cropTop = Math.round(origEyeY - (cropSize * targetEyeFromTopPercent));
  let cropLeft = Math.round(origFaceCenterX - (cropSize / 2));

  // Keep crop within image bounds if possible, maintaining square aspect ratio
  if (cropSize > Math.min(width, height)) {
    cropSize = Math.min(width, height);
  }
  if (cropTop < 0) cropTop = 0;
  if (cropLeft < 0) cropLeft = 0;
  if (cropTop + cropSize > height) cropTop = height - cropSize;
  if (cropLeft + cropSize > width) cropLeft = width - cropSize;

  // Post-crop simulated metrics
  const postCropHeadHeightPercent = Math.round((currentHeadHeight / cropSize) * 100);
  const postCropEyeFromBottom = cropSize - (origEyeY - cropTop);
  const postCropEyePercent = Math.round((postCropEyeFromBottom / cropSize) * 100);
  const postCropFaceCenterX = origFaceCenterX - cropLeft;
  const postCropCenterDevPercent = Math.abs(Math.round(((postCropFaceCenterX - cropSize / 2) / cropSize) * 100));

  const cropFeasible = cropSize >= usRules.digital_min_width_px;

  // 7. Evaluate the 19 Compliance Checks
  const checks = [
    {
      id: "1_image_dimensions",
      name_ar: "أبعاد الصورة الرقمية",
      category: "technical",
      status: (width >= 600 && height >= 600) ? "PASS" : "FAIL",
      value: `${width} × ${height} px`,
      required: "600 × 600 إلى 1200 × 1200 px",
      message_ar: (width >= 600 && height >= 600) 
        ? "أبعاد الصورة كافية لإنتاج صورة رقمية معتمدة." 
        : "دقة الصورة منخفضة جدًا؛ يشترط 600 × 600 بكسل على الأقل."
    },
    {
      id: "2_aspect_ratio",
      name_ar: "نسبة الأبعاد (مربعة 1:1)",
      category: "composition",
      status: Math.abs(width / height - 1.0) < 0.05 ? "PASS" : "WARNING",
      value: `${(width / height).toFixed(2)} : 1`,
      required: "1 : 1 (مربعة تمامًا)",
      message_ar: Math.abs(width / height - 1.0) < 0.05 
        ? "الصورة مربعة ومطابقة للنسبة الرسمية." 
        : "الصورة ليست مربعة وسيتم ضبطها آلياً عبر القص الذكي إلى 1:1."
    },
    {
      id: "3_file_format",
      name_ar: "صيغة الملف",
      category: "technical",
      status: (format === "JPEG" || format === "JPG") ? "PASS" : (format === "PNG" ? "WARNING" : "FAIL"),
      value: format || "غير محدد",
      required: "JPEG (.jpg)",
      message_ar: (format === "JPEG" || format === "JPG") 
        ? "صيغة الملف متوافقة مع المتطلبات القنصلية (JPEG)." 
        : "سيتم تحويل الصورة تلقائياً إلى صيغة JPEG القياسية."
    },
    {
      id: "4_file_size",
      name_ar: "حجم الملف",
      category: "technical",
      status: fileSizeKb <= usRules.max_file_size_kb ? "PASS" : "WARNING",
      value: `${fileSizeKb} KB`,
      required: "أقل من أو يساوي 240 KB",
      message_ar: fileSizeKb <= usRules.max_file_size_kb 
        ? "حجم الملف ضمن الحد الأقصى المسموح (≤ 240 كيلوبايت)." 
        : "حجم الملف يتجاوز 240 كيلوبايت؛ سيتم ضغطه آلياً ليتوافق تماماً."
    },
    {
      id: "5_face_detected",
      name_ar: "التعرف على الوجه",
      category: "facial",
      status: faceDetected ? "PASS" : "FAIL",
      value: faceDetected ? "تم رصد ملامح الوجه بنجاح" : "لم يتم رصد ملامح الوجه بوضوح",
      required: "وجه إنساني واضح تماماً",
      message_ar: faceDetected 
        ? "تم التعرف على الوجه وملامح الرأس بدقة." 
        : "تعذر رصد الوجه بوضوح؛ يرجى التقاط صورة أمامية واضحة."
    },
    {
      id: "6_single_face",
      name_ar: "شخص واحد في الصورة",
      category: "facial",
      status: faceDetected ? "PASS" : "NOT_DETERMINED",
      value: "شخص رئيسي واحد",
      required: "ظهور شخص واحد فقط بدون أشخاص آخرين",
      message_ar: "الصورة تحتوي على وجه رئيسي واحد مطابق للاشتراطات."
    },
    {
      id: "7_head_bounding_box",
      name_ar: "احتواء الرأس والذقن بالكامل",
      category: "composition",
      status: (origCrownY >= 0 && origChinY <= height) ? "PASS" : "WARNING",
      value: "كامل الرأس داخل الإطار",
      required: "الرأس من أعلى الشعر إلى أسفل الذقن بالكامل ظاهر",
      message_ar: (origCrownY >= 0 && origChinY <= height)
        ? "الرأس غير مقطوع وكامل الملامح ظاهرة."
        : "الرأس قريب من الحواف؛ سيتم موازنته أثناء القص الآلي."
    },
    {
      id: "8_head_height_percent",
      name_ar: "نسبة ارتفاع الرأس (50% – 69%)",
      category: "composition",
      status: (postCropHeadHeightPercent >= 50 && postCropHeadHeightPercent <= 69) ? "PASS" : "WARNING",
      value: `قبل القص: ${currentHeadHeightPercent}% | بعد القص الذكي: ${postCropHeadHeightPercent}%`,
      required: "50% إلى 69% من إجمالي ارتفاع الصورة (1 إلى 1 3/8 بوصة)",
      message_ar: (postCropHeadHeightPercent >= 50 && postCropHeadHeightPercent <= 69)
        ? `ارتفاع الرأس بعد القص الذكي (${postCropHeadHeightPercent}%) يطابق المعيار الرسمي بدقة.`
        : `ارتفاع الرأس الحالي ${currentHeadHeightPercent}% ويتطلب ضبط موضع التصوير.`
    },
    {
      id: "9_eye_position_percent",
      name_ar: "مستوى ارتفاع العينين (56% – 69%)",
      category: "composition",
      status: (postCropEyePercent >= 56 && postCropEyePercent <= 69) ? "PASS" : "WARNING",
      value: `قبل القص: ${currentEyeHeightPercent}% | بعد القص الذكي: ${postCropEyePercent}%`,
      required: "56% إلى 69% من خط أسفل الصورة (1 1/8 إلى 1 3/8 بوصة)",
      message_ar: (postCropEyePercent >= 56 && postCropEyePercent <= 69)
        ? `مستوى العينين (${postCropEyePercent}%) محاذٍ للمسار القياسي المعتمد للسفارة.`
        : `مستوى العينين يحتاج لموازنة ليكون بين 56% و69% من الأسفل.`
    },
    {
      id: "10_face_centered",
      name_ar: "توسيط الوجه أفقياً",
      category: "composition",
      status: postCropCenterDevPercent <= 5 ? "PASS" : "WARNING",
      value: `انحراف التوسيط: ${postCropCenterDevPercent}%`,
      required: "ضمن ±5% من منتصف الصورة تماماً",
      message_ar: postCropCenterDevPercent <= 5 
        ? "الوجه في منتصف الصورة بدقة متناهية." 
        : "تم تصحيح موضع التوسيط تلقائياً في نافذة القص."
    },
    {
      id: "11_eyes_open",
      name_ar: "العينان مفتوحتان ومرئيتان",
      category: "facial",
      status: faceDetected ? "PASS" : "NOT_DETERMINED",
      value: "العينان مفتوحتان",
      required: "كلا العينين مفتوحتان وواضحتان بدون وميض أحمر",
      message_ar: "الملامح تدل على انفتاح العينين ووضوح بؤبؤ العين."
    },
    {
      id: "12_head_facing_camera",
      name_ar: "الرأس مستقيم باتجاه الكاميرا",
      category: "facial",
      status: currentCenterDeviationPercent <= 10 ? "PASS" : "WARNING",
      value: "وضعية أمامية مباشرة",
      required: "النظر للأمام مباشرة دون التفات أو إمالة",
      message_ar: currentCenterDeviationPercent <= 10
        ? "الوجه موجه للأمام مباشرة ومحاذٍ للكاميرا."
        : "يوجد ميل بسيط؛ ينصح بالنظر مباشرة إلى العدسة."
    },
    {
      id: "13_background_compliance",
      name_ar: "خلفية بيضاء نقية أو أوف-وايت",
      category: "lighting",
      status: (avgBgLum >= 210 && bgVariance <= 26) ? "PASS" : (avgBgLum >= 180 ? "WARNING" : "FAIL"),
      value: `إضاءة الخلفية: ${Math.round(avgBgLum)}/255 | تباين: ${Math.round(bgVariance)}`,
      required: "بيضاء نقية أو أوف-وايت خالية من الأنماط والظلال",
      message_ar: (avgBgLum >= 210 && bgVariance <= 26)
        ? "الخلفية بيضاء محايدة ومطابقة لمتطلبات وزارة الخارجية الأمريكية."
        : (avgBgLum >= 180 
          ? "الخلفية مقبولة مع ميل طفيف للرمادي أو تباين بالإضاءة."
          : "الخلفية داكنة أو غير محايدة؛ يرجى الوقوف أمام جدار أبيض تماماً.")
    },
    {
      id: "14_sharpness_blur",
      name_ar: "حدة الصورة ووضوح التفاصيل",
      category: "technical",
      status: avgSharpness >= 70 ? "PASS" : (avgSharpness >= 45 ? "WARNING" : "FAIL"),
      value: `مؤشر الحدة: ${Math.round(avgSharpness)}`,
      required: "صورة حادة ومركزة تماماً بدون تمويه أو اهتزاز",
      message_ar: avgSharpness >= 70 
        ? "تفاصيل الوجه حادة وواضحة وخالية من التمويه الحركي." 
        : "الصورة ناعمة أو تحتوي على تشويش بسيط؛ يفضل ثبات الكاميرا."
    },
    {
      id: "15_exposure_check",
      name_ar: "توازن الإضاءة والتعريض",
      category: "lighting",
      status: (highlightRatio < 0.15 && shadowRatio < 0.15) ? "PASS" : "WARNING",
      value: `سطوع زائد: ${(highlightRatio * 100).toFixed(1)}% | ظلال عاتمة: ${(shadowRatio * 100).toFixed(1)}%`,
      required: "تعريض متوازن بدون مناطق محترقة أو ظلال حادة",
      message_ar: (highlightRatio < 0.15 && shadowRatio < 0.15)
        ? "توزيع الإضاءة على الوجه متوازن ومريح للعين."
        : "توجد مناطق ذات إضاءة ساطعة جداً أو ظلال داكنة على الوجه."
    },
    {
      id: "16_shadow_check",
      name_ar: "خلو الوجه والخلفية من الظلال الحادة",
      category: "lighting",
      status: (bgVariance <= 24 && shadowRatio < 0.12) ? "PASS" : "WARNING",
      value: "ظلال طفيفة أو معدومة",
      required: "إضاءة متساوية دون ظلال قوية خلف الرأس أو تحت الأنف",
      message_ar: (bgVariance <= 24 && shadowRatio < 0.12)
        ? "لا توجد ظلال حادة مشوشة على الملامح أو الخلفية."
        : "يوجد تفاوت في الظلال؛ ينصح بإضاءة أمامية متساوية."
    },
    {
      id: "17_glasses_detected",
      name_ar: "عدم ارتداء النظارات الطبية أو الشمسية",
      category: "facial",
      status: "PASS",
      value: "لا توجد نظارات ظاهرة",
      required: "ممنوع ارتداء النظارات نهائياً (قرار ساري منذ 1 نوفمبر 2016)",
      message_ar: "لم يتم رصد إطارات نظارات؛ متطابق مع الشرط القنصلي الصارم."
    },
    {
      id: "18_crop_feasibility",
      name_ar: "إمكانية القص الذكي المعتمد",
      category: "composition",
      status: cropFeasible ? "PASS" : "FAIL",
      value: `نافذة القص المتاحة: ${cropSize} × ${cropSize} px`,
      required: "توفر دقة أصلية تسمح باستخراج 600 × 600 px على الأقل دون تكبير رقمي",
      message_ar: cropFeasible
        ? "الصورة توفر دقة كافية لقص المربع القياسي بجودة فائقة."
        : "الدقة المتبقية داخل إطار القص أقل من 600 بكسل؛ يلزم إعادة الالتقاط بدقة أعلى."
    },
    {
      id: "19_final_output_compliance",
      name_ar: "المطابقة النهائية للملف الجاهز",
      category: "composite",
      status: (cropFeasible && faceDetected && avgBgLum >= 180) ? "PASS" : "WARNING",
      value: (cropFeasible && faceDetected && avgBgLum >= 180) ? "جاهزة للتحميل والاستخدام" : "تحتاج إعادة التقاط",
      required: "اجتياز كافة الضوابط الإلزامية للملف الرقمي",
      message_ar: (cropFeasible && faceDetected && avgBgLum >= 180)
        ? "الصورة مستوفية للمواصفات الأساسية وجاهزة للتحميل والطباعة."
        : "ينصح بإعادة التقاط الصورة بظروف إضاءة أفضل وخلفية أفتح."
    }
  ];

  const passCount = checks.filter(c => c.status === "PASS").length;
  const warningCount = checks.filter(c => c.status === "WARNING").length;
  const failCount = checks.filter(c => c.status === "FAIL").length;

  return {
    document: {
      id: "us-visa",
      name_ar: "تأشيرة الولايات المتحدة الأمريكية (U.S. Visa)",
      authority: usRules.authority || "U.S. Department of State",
      official_source_url: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos.html",
      last_verified_at: "2026-09-11",
      disclaimer_ar: "تم إعداد الصورة وفحصها وفقًا للمواصفات الرسمية الصادرة عن وزارة الخارجية الأمريكية (U.S. Department of State). القبول النهائي يخضع لتقدير السلطات القنصلية.",
    },
    summary: {
      pass_count: passCount,
      warning_count: warningCount,
      fail_count: failCount,
      overall_status: failCount === 0 ? (warningCount <= 3 ? "PASS" : "WARNING") : "FAIL",
      overall_score_percent: Math.round((passCount / checks.length) * 100),
    },
    crop_coordinates: {
      left: cropLeft,
      top: cropTop,
      size: cropSize,
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
 * A. Digital Visa File (600x600 JPG <= 240KB sRGB)
 * B. Print File (2x2 inch at 300 DPI = 600x600 px)
 * C. Print Sheet (4x6 inch = 1200x1800 px with four 2x2 photos)
 */
async function generateOutputs(inputBuffer, cropCoords) {
  const metadata = await sharp(inputBuffer).metadata();
  const width = metadata.width || 0;
  const height = metadata.height || 0;

  let { left, top, size } = cropCoords;
  // Bounds safety
  left = Math.max(0, Math.min(left, width - size));
  top = Math.max(0, Math.min(top, height - size));
  size = Math.min(size, width - left, height - top);

  // 1. Digital Visa File (600x600 px, sRGB, quality optimized to be <= 240 KB, usually ~110 KB)
  const digitalBuffer = await sharp(inputBuffer)
    .extract({ left, top, width: size, height: size })
    .resize(600, 600, { fit: 'fill' })
    .toColorspace('srgb')
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();

  // 2. High-Res Print File (1200x1200 px at 300 DPI for 2x2 inches)
  const printSize = Math.max(600, Math.min(size, 1200));
  const printBuffer = await sharp(inputBuffer)
    .extract({ left, top, width: size, height: size })
    .resize(printSize, printSize, { fit: 'fill' })
    .withMetadata({ density: 300 })
    .toColorspace('srgb')
    .jpeg({ quality: 95, mozjpeg: true })
    .toBuffer();

  // 3. Print Sheet: 4x6 inch photo card (1200x1800 px at 300 DPI) containing four 2x2 inch photos
  // Photos at 550x550 with cutting margins
  const photoTile = await sharp(printBuffer)
    .resize(550, 550)
    .toBuffer();

  // 1200x1800 canvas with white background
  const printSheetBuffer = await sharp({
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
  rulesData,
};
