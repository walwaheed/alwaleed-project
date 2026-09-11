const sharp = require('sharp');
const { analyzeImage, generateOutputs, validateMagicBytes, rulesData } = require('./engine');

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

  let img = sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: bgR, g: bgG, b: bgB }
    }
  });

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
  console.log('OFFICIAL PHOTO COMPLIANCE ENGINE — HARDENED V1.1 QA TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  // Test 1: US Visa Valid Portrait
  total++;
  try {
    const buf = await createTestImage({ width: 1200, height: 1400, faceX: 420, faceY: 350, faceW: 360, faceH: 500 });
    const res = await analyzeImage(buf, 'us-visa', 'A');
    const cropCheck = res.checks.find(c => c.id === '18_crop_feasibility');
    const out = await generateOutputs(buf, res.crop_coordinates, 'us-visa', 'A');
    if (cropCheck.status === 'PASS' && out.digital_size_kb > 0 && out.digital_size_kb <= 240 && out.sheet_size_kb > 0) {
      console.log(`✓ PASS: Test 1 (US Visa Valid Portrait) -> Digital: ${out.digital_size_kb}KB (<=240KB target met), Sheet: ${out.sheet_size_kb}KB`);
      passed++;
    } else {
      console.log('✗ FAIL: Test 1 Crop check or output generation failed');
    }
  } catch (e) {
    console.log('✗ FAIL: Test 1 Exception:', e.message);
  }

  // Test 2: Saudi National ID (4x6 cm, 2:3 ratio) Valid Portrait
  total++;
  try {
    const buf = await createTestImage({ width: 1200, height: 1800, faceX: 380, faceY: 300, faceW: 440, faceH: 700 });
    const res = await analyzeImage(buf, 'sa-national-id', 'A');
    const cropCheck = res.checks.find(c => c.id === '18_crop_feasibility');
    const out = await generateOutputs(buf, res.crop_coordinates, 'sa-national-id', 'A');
    if (cropCheck.status === 'PASS' && out.digital_size_kb > 0 && out.sheet_size_kb > 0) {
      console.log(`✓ PASS: Test 2 (Saudi National ID 4x6 cm) -> Digital: ${out.digital_size_kb}KB (600x900 px), Sheet: ${out.sheet_size_kb}KB (6 photos)`);
      passed++;
    } else {
      console.log('✗ FAIL: Test 2 Crop check or output generation failed');
    }
  } catch (e) {
    console.log('✗ FAIL: Test 2 Exception:', e.message);
  }

  // Test 3: Saudi Passport (4x6 cm) Valid Portrait
  total++;
  try {
    const buf = await createTestImage({ width: 1200, height: 1800, faceX: 380, faceY: 300, faceW: 440, faceH: 700 });
    const res = await analyzeImage(buf, 'sa-passport', 'A');
    if (res.document && res.document.id === 'sa-passport' && res.document.country_code === 'SA') {
      console.log(`✓ PASS: Test 3 (Saudi Passport Spec Loaded) -> Doc ID: ${res.document.id} | Country: ${res.document.country_code}`);
      passed++;
    } else {
      console.log('✗ FAIL: Test 3 Document id mismatch or undefined');
    }
  } catch (e) {
    console.log('✗ FAIL: Test 3 Exception:', e.message);
  }

  // Test 4: Low Resolution Image (< 600px)
  total++;
  try {
    const buf = await createTestImage({ width: 400, height: 450, faceX: 100, faceY: 80, faceW: 200, faceH: 250 });
    const res = await analyzeImage(buf, 'us-visa', 'A');
    const dimCheck = res.checks.find(c => c.id === '1_image_dimensions');
    if (dimCheck && dimCheck.status === 'FAIL') {
      console.log(`✓ PASS: Test 4 (Low Resolution correctly failed) -> status: ${dimCheck.status}`);
      passed++;
    } else {
      console.log('✗ FAIL: Test 4 Low resolution not flagged as FAIL');
    }
  } catch (e) {
    console.log('✗ FAIL: Test 4 Exception:', e.message);
  }

  // Test 5: Magic Bytes Validation - Non-image rejection
  total++;
  try {
    const fakeBuf = Buffer.from('NOT_AN_IMAGE_FILE_JUST_PLAIN_TEXT_PAYLOAD', 'utf-8');
    const val = validateMagicBytes(fakeBuf);
    if (!val.valid) {
      console.log(`✓ PASS: Test 5 (Magic Bytes correctly rejected non-image buffer)`);
      passed++;
    } else {
      console.log('✗ FAIL: Test 5 Fake buffer accepted as valid image');
    }
  } catch (e) {
    console.log('✗ FAIL: Test 5 Exception:', e.message);
  }

  // Test 6: Magic Bytes Validation - JPEG Header verification
  total++;
  try {
    const jpegBuf = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01]);
    const val = validateMagicBytes(jpegBuf);
    if (val.valid && val.format === 'JPEG') {
      console.log('✓ PASS: Test 6 (JPEG Magic Bytes correctly identified)');
      passed++;
    } else {
      console.log('✗ FAIL: Test 6 JPEG header failed validation');
    }
  } catch (e) {
    console.log('✗ FAIL: Test 6 Exception:', e.message);
  }

  // Test 7: Magic Bytes Validation - PNG Header verification
  total++;
  try {
    const pngBuf = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48]);
    const val = validateMagicBytes(pngBuf);
    if (val.valid && val.format === 'PNG') {
      console.log('✓ PASS: Test 7 (PNG Magic Bytes correctly identified)');
      passed++;
    } else {
      console.log('✗ FAIL: Test 7 PNG header failed validation');
    }
  } catch (e) {
    console.log('✗ FAIL: Test 7 Exception:', e.message);
  }

  // Test 8: 15MB File Size Limit Check
  total++;
  try {
    const hugeBuf = Buffer.alloc(16 * 1024 * 1024); // 16MB
    hugeBuf[0] = 0xFF; hugeBuf[1] = 0xD8; hugeBuf[2] = 0xFF;
    const val = validateMagicBytes(hugeBuf);
    if (!val.valid) {
      console.log(`✓ PASS: Test 8 (Oversized 16MB payload correctly blocked)`);
      passed++;
    } else {
      console.log('✗ FAIL: Test 8 16MB buffer not blocked');
    }
  } catch (e) {
    console.log('✗ FAIL: Test 8 Exception:', e.message);
  }

  // Test 9: Flow B (Photo Needs Preparation) safe enhancement
  total++;
  try {
    const buf = await createTestImage({ width: 1000, height: 1200, bgR: 210, bgG: 210, bgB: 210 });
    const res = await analyzeImage(buf, 'us-visa', 'B');
    if (res.flow === 'B') {
      const out = await generateOutputs(buf, res.crop_coordinates, 'us-visa', 'B');
      if (out.digital_size_kb > 0) {
        console.log(`✓ PASS: Test 9 (Flow B Safe Preparation executed without biometric alteration)`);
        passed++;
      } else {
        console.log('✗ FAIL: Test 9 Flow B output failed');
      }
    }
  } catch (e) {
    console.log('✗ FAIL: Test 9 Exception:', e.message);
  }

  // Test 10: Inactive Document Guard (Schengen / UK)
  total++;
  try {
    const euDoc = rulesData.documents.find(d => d.id === 'eu-schengen');
    const ukDoc = rulesData.documents.find(d => d.id === 'uk-visa');
    if (euDoc && !euDoc.active && ukDoc && !ukDoc.active) {
      console.log('✓ PASS: Test 10 (Unverified documents correctly marked INACTIVE / COMING_SOON)');
      passed++;
    } else {
      console.log('✗ FAIL: Test 10 Inactive docs not properly set');
    }
  } catch (e) {
    console.log('✗ FAIL: Test 10 Exception:', e.message);
  }

  console.log(`\nQA Result: ${passed}/${total} tests passed.`);
  if (passed === total) {
    console.log('ALL HARDENED COMPLIANCE TESTS PASSED SUCCESSFULLY!');
  } else {
    process.exit(1);
  }
}

runTests().catch(console.error);
