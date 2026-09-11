const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { analyzeImage, generateOutputs, validateMagicBytes, rulesData } = require('./engine');

const app = express();
const PORT = process.env.PORT || 3301;

// Upload limit: 15 MB maximum payload
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Ephemeral In-memory cache for generated files (TTL 20 minutes)
const fileCache = new Map();

function cleanCache() {
  const now = Date.now();
  for (const [id, item] of fileCache.entries()) {
    if (now - item.created > 20 * 60 * 1000) {
      fileCache.delete(id);
    }
  }
}
setInterval(cleanCache, 3 * 60 * 1000);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'manus-compliance-api',
    version: '1.1.0',
    retention_ttl_minutes: 20,
    max_payload_mb: 15
  });
});

// Requirements DB
app.get('/api/compliance/requirements', (req, res) => {
  res.json({
    status: 'success',
    data: rulesData
  });
});

// Analyze image
app.post('/api/compliance/analyze', async (req, res) => {
  try {
    const { image, document_type = 'us-visa', flow = 'A' } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'يرجى تقديم بيانات الصورة' });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Magic bytes & file size security check
    const validation = validateMagicBytes(buffer);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const result = await analyzeImage(buffer, document_type, flow);
    res.json({ status: 'success', data: result });
  } catch (err) {
    console.error('Compliance analysis error:', err.message);
    res.status(400).json({ error: 'فشل فحص الصورة', details: err.message });
  }
});

// Process and generate outputs
app.post('/api/compliance/process', async (req, res) => {
  try {
    const { image, crop_coordinates, document_type = 'us-visa', flow = 'A' } = req.body;
    if (!image || !crop_coordinates) {
      return res.status(400).json({ error: 'بيانات الصورة أو إحداثيات القص ناقصة' });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const validation = validateMagicBytes(buffer);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const outputs = await generateOutputs(buffer, crop_coordinates, document_type, flow);

    const fileId = crypto.randomUUID();
    fileCache.set(fileId, {
      created: Date.now(),
      document_type,
      flow,
      digital: outputs.digital,
      print: outputs.print,
      sheet: outputs.sheet,
    });

    const isSquare = (document_type === 'us-visa');
    const docMeta = rulesData.documents.find(d => d.id === document_type) || rulesData.documents[0];

    res.json({
      status: 'success',
      data: {
        file_id: fileId,
        document_type,
        flow,
        ttl_minutes: 20,
        digital: {
          download_url: `/api/compliance/download/${fileId}/digital`,
          size_kb: outputs.digital_size_kb,
          format: 'JPEG',
          dimensions: isSquare ? '600 × 600 px' : '600 × 900 px',
          color_space: 'sRGB',
          compliance: docMeta.authority
        },
        print: {
          download_url: `/api/compliance/download/${fileId}/print`,
          size_kb: outputs.print_size_kb,
          dimensions: isSquare ? '2 × 2 inches (51 × 51 mm) @ 300 DPI' : '4 × 6 cm (40 × 60 mm) @ 300 DPI'
        },
        sheet: {
          download_url: `/api/compliance/download/${fileId}/sheet`,
          size_kb: outputs.sheet_size_kb,
          dimensions: isSquare ? '4 × 6 inches (4 photos + guides)' : '4 × 6 inches (6 photos + guides)'
        }
      }
    });
  } catch (err) {
    console.error('Compliance generation error:', err.message);
    res.status(400).json({ error: 'فشل معالجة الصورة', details: err.message });
  }
});

// Direct Download endpoint
app.get('/api/compliance/download/:fileId/:type', (req, res) => {
  const { fileId, type } = req.params;
  const item = fileCache.get(fileId);

  if (!item || !item[type]) {
    return res.status(404).send('انتهت صلاحية الملف المؤقت (20 دقيقة). يرجى إعادة فحص الصورة.');
  }

  const isSquare = (item.document_type === 'us-visa');
  const prefix = isSquare ? 'US_Visa' : (item.document_type === 'sa-passport' ? 'Saudi_Passport' : 'Saudi_NationalID');

  const filenameMap = {
    digital: `${prefix}_Photo_Digital_StudioAlWaleed.jpg`,
    print: `${prefix}_Photo_Print_StudioAlWaleed.jpg`,
    sheet: `${prefix}_Photo_PrintSheet_StudioAlWaleed.jpg`
  };

  const filename = filenameMap[type] || `${prefix}_Photo.jpg`;

  res.setHeader('Content-Type', 'image/jpeg');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.send(item[type]);
});

// Customer deletion endpoint (Instant privacy purge)
app.delete('/api/compliance/session/:fileId', (req, res) => {
  const { fileId } = req.params;
  const existed = fileCache.delete(fileId);
  res.json({
    status: 'success',
    deleted: existed,
    message: existed ? 'تم حذف الملف المؤقت بنجاح وبشكل فوري.' : 'الملف غير موجود أو منتهي الصلاحية مسبقاً.'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Hardened Compliance API listening on port ${PORT}`);
});
