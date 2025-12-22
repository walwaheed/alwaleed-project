# Image Processing Workflow with n8n

## Overview

This system provides a complete image processing workflow that:
1. Uploads original image to Supabase Storage
2. Sends image to n8n webhook for AI processing
3. Downloads the edited image from n8n
4. Saves edited image to Supabase Storage
5. Creates a database record with both original and edited URLs

## API Endpoint

**POST** `/api/process-image`

### Request

**Headers:**
```
Authorization: Bearer {supabase_jwt_token}
Content-Type: multipart/form-data
```

**Body (FormData):**
- `image` (File) - Image file to process
- `aiTool` (string) - AI tool to use (required)
  - Options: `visa-photo`, `absher-photo`, `absher-photo-female`, `saudi-look`, `baby-photo`, `family-photo`
- `title` (string) - Photo title (required)
- `printSize` (string) - Print size (optional, default: "A5")
- `price` (number) - Price in SAR (optional, default: 45)

### Response

**Success (201):**
```json
{
  "message": "Image processed successfully",
  "photo": {
    "id": "uuid",
    "title": "My Photo",
    "originalUrl": "https://...supabase.co/storage/.../original/...",
    "editedUrl": "https://...supabase.co/storage/.../edited/...",
    "thumbnailUrl": "https://...supabase.co/storage/.../edited/...",
    "aiTool": "visa-photo",
    "price": 45,
    "printSize": "A5",
    "status": "published",
    "createdAt": "2025-12-22T00:00:00.000Z"
  }
}
```

**Error (400/500):**
```json
{
  "error": "Error message"
}
```

---

## n8n Webhook Configuration

### Webhook URLs

Base URL: `https://n8n.renovaai.cloud`

Paths for different AI tools:
- Visa Photo: `/webhook/visa-photo`
- Absher Photo (Male): `/webhook/absher-photo`
- Absher Photo (Female): `/webhook/absher-photo-female`
- Saudi Look: `/webhook/saudi-look`
- Baby Photo: `/webhook/baby-photo`
- Family Photo: `/webhook/family-photo`

### Expected n8n Request Payload

```json
{
  "imageUrl": "https://...supabase.co/storage/.../original/image.jpg",
  "aiTool": "visa-photo",
  "userEmail": "user@example.com",
  "title": "My Photo"
}
```

### Expected n8n Response

n8n should return a JSON response with the edited image URL:

```json
{
  "editedImageUrl": "https://...edited-image-url.jpg",
  "settings": {
    "filterApplied": "visa-standard",
    "processingTime": "5.2s"
  }
}
```

**Alternative response formats supported:**
- `{ "resultUrl": "..." }`
- `{ "url": "..." }`

---

## Frontend Usage

### Using React

```javascript
import { processImageAPI } from '../api';
import { useState } from 'react';

function ImageUploader() {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ step: '', progress: 0 });

  const handleImageUpload = async (file, aiTool) => {
    setProcessing(true);

    try {
      const result = await processImageAPI.process(
        file,
        {
          aiTool: aiTool, // e.g., 'visa-photo'
          title: `Photo processed with ${aiTool}`,
          printSize: 'A5',
          price: 45
        },
        (progressInfo) => {
          setProgress(progressInfo);
          console.log('Progress:', progressInfo);
        }
      );

      console.log('Success!', result.photo);
      alert(`Image processed! ID: ${result.photo.id}`);
      
      // Redirect to gallery or show the edited image
      // window.location.href = `/gallery`;
      
    } catch (error) {
      console.error('Processing failed:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            handleImageUpload(file, 'visa-photo');
          }
        }}
        disabled={processing}
      />
      
      {processing && (
        <div>
          Processing... {progress.step} ({progress.progress}%)
        </div>
      )}
    </div>
  );
}
```

### Using the Compatibility Layer (legacy base44 style)

You can also use it through the base44 compatibility layer:

```javascript
import { base44 } from '@/api/base44Client';

// This will need to be added to the compatibility layer
```

---

## Workflow Steps (Backend)

### Step 1: Upload Original Image
- Generates unique filename with UUID
- Uploads to `photos` bucket in path: `{userEmail}/original/{filename}`
- Gets public URL

### Step 2: Send to n8n
- Determines correct webhook path based on `aiTool`
- Sends POST request with image URL and metadata
- Waits for n8n response

### Step 3: Download Edited Image
- Fetches edited image from URL provided by n8n
- Converts to buffer

### Step 4: Upload Edited Image
- Uploads edited image to `photos` bucket
- Path: `{userEmail}/edited/{filename}_edited.ext`
- Gets public URL

### Step 5: Save to Database
- Creates record in `photos` table
- Includes both URLs, AI tool, price, size, etc.
- Sets status to 'published'

---

## Storage Structure

```
photos/ (Supabase Storage Bucket)
├── user@example.com/
│   ├── original/
│   │   ├── uuid1.jpg
│   │   ├── uuid2.png
│   │   └── ...
│   └── edited/
│       ├── uuid1_edited.jpg
│       ├── uuid2_edited.png
│       └── ...
```

---

## Error Handling

The endpoint handles various error scenarios:

1. **No file uploaded** → 400 Bad Request
2. **Invalid AI tool** → 400 Validation Error
3. **Upload failure** → 500 Internal Server Error
4. **n8n webhook failure** → 500 with n8n status
5. **n8n doesn't return URL** → 500 Error
6. **Download failure** → 500 Error
7. **Database error** → 500 Error

All errors are logged to console for debugging.

---

## Testing

### Test with cURL

```bash
curl -X POST http://localhost:5000/api/process-image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/image.jpg" \
  -F "aiTool=visa-photo" \
  -F "title=Test Photo" \
  -F "printSize=A5" \
  -F "price=45"
```

### Test with Thunder Client / Postman

1. Create POST request to `http://localhost:5000/api/process-image`
2. Add Authorization header with Bearer token
3. Set body to form-data
4. Add fields: image (file), aiTool, title, printSize, price
5. Send request

---

## Monitoring & Logs

The backend logs each step:
```
📤 Step 1: Uploading original image to Supabase...
✅ Original image uploaded: https://...
🤖 Step 2: Sending to n8n for AI processing...
✅ n8n processing complete: {...}
📥 Step 3: Downloading edited image from n8n result...
📤 Step 4: Uploading edited image to Supabase...
✅ Edited image uploaded: https://...
💾 Step 5: Saving photo record to database...
✅ Photo record created: uuid
```

Check your terminal running the backend server to see these logs.

---

## Next Steps

1. **Integrate in EditPhoto.jsx** - Add button to process images
2. **Show processing progress** - Use progress callback
3. **Display results in Gallery** - Fetch and show processed images
4. **Add to PrintProducts** - Allow ordering processed images

---

## Environment Variables

Make sure these are set in your `.env` file:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

No additional env vars needed for n8n - the webhook URL is hardcoded in the route.
