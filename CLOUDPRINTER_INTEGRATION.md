# CloudPrinter Integration Guide

## Overview

The Print Products page now integrates directly with CloudPrinter API to submit print orders for:
- Aluminum prints
- Wood prints
- Canvas prints
- Photo books

## Setup

### 1. Get Your CloudPrinter API Key

1. Sign up or log in to [CloudPrinter](https://www.cloudprinter.com/)
2. Navigate to **Settings** → **API**
3. Generate a new API key or copy your existing key
4. Keep this key secure - do NOT commit it to version control

### 2. Add API Key to Environment Variables

Add the CloudPrinter API key to your `.env` file (server-side):

```bash
CLOUD_PRINTER_KEY=your_actual_cloudprinter_api_key_here
```

**Important:** The `.env` file is gitignored. Never commit API keys to the repository.

### 3. Restart the Server

After adding the API key, restart your development server:

```bash
npm run dev:all
```

## How It Works

### Frontend Flow

1. **User selects a product** (Aluminum, Wood, Canvas, or PhotoBook)
2. **User uploads PDF file(s)** to Supabase Storage (`pdf-prints` bucket)
3. **User fills shipping information** and selects size/options
4. **User clicks "Submit Order"**
5. **Frontend sends request** to `/api/cloudprinter/order`

### Backend Flow

1. **Backend receives order** at `/api/cloudprinter/order`
2. **Validates required fields** (product type, size, shipping address)
3. **Builds CloudPrinter API payload** with:
   - Order reference (e.g., `WL-1766429704421`)
   - Product details
   - PDF file URLs from Supabase
   - Shipping information
4. **Submits order to CloudPrinter API**
5. **Returns response** to frontend with order reference

## API Endpoints

### POST /api/cloudprinter/order

Submit a new print order to CloudPrinter.

**Request Body:**
```json
{
  "productType": "aluminum",
  "size": "300x300 mm",
  "imageUrl": "https://sfraqqkmzzdtcynyyebj.supabase.co/storage/v1/object/public/pdf-prints/file.pdf",
  "shippingAddress": {
    "firstname": "John",
    "lastname": "Doe",
    "street1": "123 Main St",
    "zip": "12345",
    "city": "Riyadh",
    "country": "SA",
    "email": "john@example.com",
    "phone": "+966501234567"
  },
  "shippingLevel": "cp_postal",
  "finish": "gloss",
  "paperType": "130gsm Machine Coated Gloss"
}
```

**Response (Success):**
```json
{
  "success": true,
  "orderReference": "WL-1766429704421",
  "cloudPrinterOrderId": "cp_order_123456",
  "data": { /* CloudPrinter response */ }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Error message",
  "details": { /* Error details */ }
}
```

### GET /api/cloudprinter/order/:reference

Get the status of an existing order.

**Example:**
```
GET /api/cloudprinter/order/WL-1766429704421
```

**Response:**
```json
{
  "success": true,
  "order": {
    "reference": "WL-1766429704421",
    "status": "processing",
    /* Other order details */
  }
}
```

## Product Type Mapping

The backend maps internal product types to CloudPrinter product IDs:

| Internal Type | CloudPrinter Product ID |
|--------------|------------------------|
| `aluminum`   | `aluminum-print`       |
| `wood`       | `wood-print`           |
| `canva`      | `canvas-print`         |
| `photobook`  | `photobook`            |

## File Upload Flow

1. **Frontend uploads PDF** → Supabase Storage (`pdf-prints` bucket)
2. **Supabase returns public URL** (e.g., `https://...supabase.co/.../file.pdf`)
3. **Order submission includes URL** in the payload
4. **CloudPrinter downloads file** from the public URL

## Error Handling

### Common Errors

**"CloudPrinter API key not configured"**
- **Solution:** Add `CLOUDPRINTER_API_KEY` to your `.env` file

**"Missing required fields"**
- **Solution:** Ensure `productType`, `size`, and `shippingAddress` are provided

**CloudPrinter API Errors**
- **Check:** CloudPrinter dashboard for account status
- **Check:** API key validity
- **Check:** Product availability in your region

## Testing

### 1. Test File Upload
- Go to Print Products page
- Select a product
- Upload a test PDF (< 5MB)
- Verify file appears in Supabase Storage

### 2. Test Order Submission
- Fill in shipping information
- Click "Submit Order"
- Check browser console for logs
- Verify order in CloudPrinter dashboard

### 3. Check Server Logs
```bash
# Server logs show:
📦 Submitting order to CloudPrinter...
Order Payload: {...}
✅ Order submitted successfully!
CloudPrinter Response: {...}
```

## Troubleshooting

### Upload fails: "mime type not supported"
- **Fix:** Update Supabase bucket settings to allow PDFs
- See: `SUPABASE_STORAGE_SETUP.md`

### Upload fails: "row-level security policy"
- **Fix:** Run storage policies SQL
- See: `database/storage-policies.sql`

### Order fails: "base44.functions.invoke is not a function"
- **Fix:** This is now resolved - using direct API calls
- Clear browser cache and refresh

### Order fails: API key error
- **Fix:** Verify `CLOUDPRINTER_API_KEY` in `.env`
- Restart server after adding key

## Development Notes

### Files Changed
- ✅ `server/routes/cloudprinter.js` - New CloudPrinter API route
- ✅ `server/app.js` - Registered CloudPrinter route
- ✅ `src/pages/PrintProducts.jsx` - Updated to use backend API
- ✅ `.env.example` - Added CLOUDPRINTER_API_KEY

### Dependencies
- `node-fetch` - Already installed (for API calls)
- `express` - Already installed (server framework)

## Production Checklist

Before deploying to production:

- [ ] Verify CloudPrinter API key is set in production environment
- [ ] Test all product types (Aluminum, Wood, Canvas, PhotoBook)
- [ ] Verify PDF file size limits (5MB)
- [ ] Test shipping to all supported countries
- [ ] Set up error monitoring/logging
- [ ] Configure CloudPrinter webhook for order status updates
- [ ] Add order tracking feature
- [ ] Set up automated order confirmation emails

## Support

- CloudPrinter API Docs: https://www.cloudprinter.com/docs/api
- CloudPrinter Support: support@cloudprinter.com
