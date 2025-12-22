# CloudPrinter Order Error - Troubleshooting Guide

## Error Details
```
405 Method Not Allowed on POST /api/cloudprinter/order
```

## Root Causes & Solutions

### 1. Backend Server Not Running Properly ✅ RESTART NEEDED

**Issue:** The backend server stopped or crashed.

**Solution:**
```bash
# Stop all node processes
Get-Process -Name node | Stop-Process -Force

# Restart the servers
npm run dev:all
```

**Verify it's working:**
- You should see: `🚀 Server running on http://localhost:5000`
- Test the route: Open http://localhost:5000/api/cloudprinter/test in your browser
  - Should return: `{"success": true, "message": "CloudPrinter route is working!"}`

---

### 2. Missing CloudPrinter API Key ⚠️ CHECK YOUR .ENV

**Issue:** The `CLOUD_PRINTER_KEY` environment variable is not set.

**Solution:**
1. Open `.env` file (at project root)
2. Add this line:
```env
CLOUD_PRINTER_KEY=your_actual_cloudprinter_api_key_here
```

3. **Restart the backend** after adding the key
4. Look for this log message when server starts:
   - ✅ `🔑 CloudPrinter API Key Status: ✅ Loaded`
   - ❌ `🔑 CloudPrinter API Key Status: ❌ Not Found`

**Where to get the API key:**
- CloudPrinter Dashboard: https://www.cloudprinter.com/
- Account Settings → API Keys

---

### 3. Frontend Making Wrong Request

**Current Request (from console):**
```javascript
{
  "productType": "aluminum",
  "size": "300x300 mm",
  "imageUrl": "https://sfraqqkmzzdtcynyyebj.supabase.co/storage/v1/object/public/pdf-prints/...",
  "shippingAddress": {...},
  "shippingLevel": "cp_postal"
}
```

**This looks correct!** ✅

The backend route expects exactly these fields and they're all present.

---

## Quick Fix Steps

### Step 1: Restart Backend
```bash
npm run dev:all
```

### Step 2: Check Logs
Look for these messages in the terminal:
```
🔍 Checking CLOUD_PRINTER_KEY: ✅ Found
🔑 CloudPrinter API Key Status: ✅ Loaded
🚀 Server running on http://localhost:5000
```

### Step 3: Test the Route
Open browser: http://localhost:5000/api/cloudprinter/test

Expected response:
```json
{
  "success": true,
  "message": "CloudPrinter route is working!",
  "apiKeyConfigured": true
}
```

If `apiKeyConfigured: false`, add the API key to `.env`

### Step 4: Try Order Again
Go back to PrintProducts page and submit the order.

---

## Common Errors & Fixes

### Error: "CloudPrinter API key not configured"
**Fix:** Add `CLOUD_PRINTER_KEY=...` to `.env` and restart server

### Error: "Route not found" (404)
**Fix:** Make sure backend is running and the route is registered in `server/app.js` line 42

### Error: "Internal Server Error" (500)
**Check:** Backend terminal for detailed error logs

---

## Backend Code Location

- Route file: `server/routes/cloudprinter.js`
- Registered in: `server/app.js` (line 42)
- Uses: `CLOUD_PRINTER_KEY` from `.env`

---

## Next Steps

1. ✅ Restart backend (`npm run dev:all`)
2. ✅ Verify API key is in `.env`
3. ✅ Test endpoint: http://localhost:5000/api/cloudprinter/test
4. ✅ Check backend logs for errors
5. ✅ Try submitting order again

If still not working, check the backend terminal output for specific error messages!
