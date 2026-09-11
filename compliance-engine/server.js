const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { analyzeImage, generateOutputs, rulesData } = require('./engine');

const app = express();
const PORT = process.env.PORT || 3301;

// Generous body limit for image uploads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(cors());

// In-memory cache for generated files (TTL 30 minutes)
const fileCache = new Map();

function cleanCache() {
  const now = Date.now();
  for (const [id, item] of fileCache.entries()) {
    if (now - item.created > 30 * 60 * 1000) {
      fileCache.delete(id);
    }
  }
}
setInterval(cleanCache, 5 * 60 * 1000);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'manus-compliance-api', version: '1.0.0' });
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
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Missing image data (base64 string required)' });
    }

    // Extract base64
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const result = await analyzeImage(buffer);
    res.json({ status: 'success', data: result });
  } catch (err) {
    console.error('Compliance analysis error:', err);
    res.status(500).json({ error: 'Analysis failed', details: err.message });
  }
});

// Process and generate outputs
app.post('/api/compliance/process', async (req, res) => {
  try {
    const { image, crop_coordinates } = req.body;
    if (!image || !crop_coordinates) {
      return res.status(400).json({ error: 'Missing image or crop_coordinates' });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const outputs = await generateOutputs(buffer, crop_coordinates);

    const fileId = crypto.randomUUID();
    fileCache.set(fileId, {
      created: Date.now(),
      digital: outputs.digital,
      print: outputs.print,
      sheet: outputs.sheet,
    });

    res.json({
      status: 'success',
      data: {
        file_id: fileId,
        digital: {
          download_url: `/api/compliance/download/${fileId}/digital`,
          size_kb: outputs.digital_size_kb,
          format: 'JPEG',
          dimensions: '600 × 600 px',
          color_space: 'sRGB',
          compliance: 'U.S. Department of State Official Visa Specifications'
        },
        print: {
          download_url: `/api/compliance/download/${fileId}/print`,
          size_kb: outputs.print_size_kb,
          dimensions: '2 × 2 inches (51 × 51 mm) @ 300 DPI'
        },
        sheet: {
          download_url: `/api/compliance/download/${fileId}/sheet`,
          size_kb: outputs.sheet_size_kb,
          dimensions: '4 × 6 inches with 4 photos & cutting guides'
        }
      }
    });
  } catch (err) {
    console.error('Compliance generation error:', err);
    res.status(500).json({ error: 'Generation failed', details: err.message });
  }
});

// Direct Download endpoint
app.get('/api/compliance/download/:fileId/:type', (req, res) => {
  const { fileId, type } = req.params;
  const item = fileCache.get(fileId);

  if (!item || !item[type]) {
    return res.status(404).send('File expired or not found. Please re-run photo analysis.');
  }

  const filenameMap = {
    digital: 'US_Visa_Photo_600x600_StudioAlWaleed.jpg',
    print: 'US_Visa_Photo_Print_2x2_StudioAlWaleed.jpg',
    sheet: 'US_Visa_Photo_PrintSheet_4x6_StudioAlWaleed.jpg'
  };

  const filename = filenameMap[type] || 'US_Visa_Photo.jpg';

  res.setHeader('Content-Type', 'image/jpeg');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Cache-Control', 'no-store');
  res.send(item[type]);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Compliance API listening on port ${PORT}`);
});
