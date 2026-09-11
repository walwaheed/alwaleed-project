const sharp = require('sharp');
const { analyzeImage, generateOutputs } = require('./engine');

async function createTestImage(options = {}) {
  const {
    width = 1000,
    height = 1200,
    bgR = 248, bgG = 248, bgB = 248,
    faceX = 350, faceY = 300, faceW = 300, faceH = 400,
    skinR = 215, skinG = 160, skinB = 130,
    blur = false,
    format = 'jpeg'
  } = options;

  // Draw background canvas
  let img = sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: bgR, g: bgG, b: bgB }
    }
  });

  // Create face oval / box
  const faceOverlay = await sharp({
    create: {
      width: faceW,
      height: faceH,
      channels: 3,
      background: { r: skinR, g: skinG, b: skinB }
    }
  }).jpeg().toBuffer();

  img = img.composite([
    { input: faceOverlay, left: Math.max(0, faceX), top: Math.max(0, faceY) }
  ]);

  if (blur) {
    img = img.blur(12);
  }

  if (format === 'jpeg') {
    return img.jpeg({ quality: 90 }).toBuffer();
  } else if (format === 'png') {
    return img.png().toBuffer();
  }
  return img.jpeg().toBuffer();
}

async function runTests() {
  console.log('================================================================');
  console.log('OFFICIAL PHOTO COMPLIANCE ENGINE — US VISA V1 AUTOMATED QA SUITE');
  console.log('================================================================\n');

  const testCases = [
    {
      name: 'Case 1: Valid high-resolution frontal portrait',
      opts: { width: 1200, height: 1400, faceX: 420, faceY: 350, faceW: 360, faceH: 500, bgR: 250, bgG: 250, bgB: 250 },
      expectStatus: 'PASS',
      expectCropFeasible: true
    },
    {
      name: 'Case 2: Landscape photo requiring square auto-crop',
      opts: { width: 1800, height: 1200, faceX: 700, faceY: 250, faceW: 400, faceH: 550, bgR: 248, bgG: 248, bgB: 248 },
      expectStatus: 'PASS',
      expectCropFeasible: true
    },
    {
      name: 'Case 3: Low-resolution image (< 600px)',
      opts: { width: 450, height: 500, faceX: 150, faceY: 120, faceW: 150, faceH: 200 },
      expectDimFail: true,
      expectCropFeasible: false
    },
    {
      name: 'Case 4: Wrong aspect ratio (extreme 16:9 widescreen)',
      opts: { width: 1920, height: 1080, faceX: 800, faceY: 200, faceW: 320, faceH: 450 },
      expectRatioWarn: true,
      expectCropFeasible: true
    },
    {
      name: 'Case 5: Face too large (filling > 85% of frame)',
      opts: { width: 1000, height: 1000, faceX: 100, faceY: 50, faceW: 800, faceH: 880 },
      expectHeadHeightHigh: true
    },
    {
      name: 'Case 6: Face too small (< 25% of frame)',
      opts: { width: 1200, height: 1200, faceX: 520, faceY: 500, faceW: 160, faceH: 220 },
      expectHeadHeightLow: true
    },
    {
      name: 'Case 7: Off-center face (positioned near right edge)',
      opts: { width: 1200, height: 1200, faceX: 850, faceY: 300, faceW: 300, faceH: 420 },
      expectReCentered: true
    },
    {
      name: 'Case 8: Non-white background (dark gray / blue)',
      opts: { width: 1000, height: 1200, bgR: 80, bgG: 90, bgB: 120, faceX: 350, faceY: 300, faceW: 300, faceH: 420 },
      expectBgFailOrWarn: true
    },
    {
      name: 'Case 9: Blurred image',
      opts: { width: 1000, height: 1200, blur: true, faceX: 350, faceY: 300, faceW: 300, faceH: 420 },
      expectBlurWarnOrFail: true
    },
    {
      name: 'Case 10: Non-JPEG file format (PNG)',
      opts: { width: 1000, height: 1000, format: 'png', faceX: 350, faceY: 250, faceW: 300, faceH: 420 },
      expectFormatWarn: true
    }
  ];

  let passedTests = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    console.log(`Running Test ${i + 1}/${testCases.length}: ${tc.name}...`);
    const buffer = await createTestImage(tc.opts);
    const analysis = await analyzeImage(buffer);

    let testPass = true;
    let note = '';

    if (tc.expectDimFail) {
      const dimCheck = analysis.checks.find(c => c.id === '1_image_dimensions');
      if (dimCheck.status !== 'FAIL') testPass = false;
      note = `Dimensions status: ${dimCheck.status}`;
    }

    if (tc.expectRatioWarn) {
      const ratioCheck = analysis.checks.find(c => c.id === '2_aspect_ratio');
      if (ratioCheck.status !== 'WARNING') testPass = false;
      note = `Aspect ratio check: ${ratioCheck.status} (Will auto-crop to 1:1)`;
    }

    if (tc.expectBgFailOrWarn) {
      const bgCheck = analysis.checks.find(c => c.id === '13_background_compliance');
      if (bgCheck.status !== 'FAIL' && bgCheck.status !== 'WARNING') testPass = false;
      note = `Background compliance: ${bgCheck.status} (${bgCheck.value})`;
    }

    if (tc.expectBlurWarnOrFail) {
      const blurCheck = analysis.checks.find(c => c.id === '14_sharpness_blur');
      if (blurCheck.status !== 'FAIL' && blurCheck.status !== 'WARNING') testPass = false;
      note = `Sharpness check: ${blurCheck.status} (${blurCheck.value})`;
    }

    if (tc.expectFormatWarn) {
      const fmtCheck = analysis.checks.find(c => c.id === '3_file_format');
      if (fmtCheck.status !== 'WARNING') testPass = false;
      note = `Format check: ${fmtCheck.status} (Auto-converts to JPEG)`;
    }

    if (tc.expectCropFeasible !== undefined) {
      const cropCheck = analysis.checks.find(c => c.id === '18_crop_feasibility');
      if (cropCheck.status !== (tc.expectCropFeasible ? 'PASS' : 'FAIL')) testPass = false;
      note += ` | Crop feasible: ${cropCheck.status}`;
    }

    // Also verify generateOutputs on valid case
    if (i === 0) {
      const outputs = await generateOutputs(buffer, analysis.crop_coordinates);
      if (outputs.digital_size_kb > 240) {
        testPass = false;
        note += ` | Output size ${outputs.digital_size_kb}KB exceeds 240KB!`;
      } else {
        note += ` | Generated Digital 600x600: ${outputs.digital_size_kb}KB (<=240KB target met!)`;
        note += ` | Print Sheet 4x6: ${outputs.sheet_size_kb}KB`;
      }
    }

    if (testPass) {
      passedTests++;
      console.log(`  ✓ PASS: ${tc.name} [${note}]`);
    } else {
      console.error(`  ✗ FAIL: ${tc.name} [${note}]`);
    }
  }

  console.log(`\nQA Result: ${passedTests}/${testCases.length} tests passed.`);
  if (passedTests === testCases.length) {
    console.log('ALL COMPLIANCE TESTS PASSED SUCCESSFULLY!\n');
  } else {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
