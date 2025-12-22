# CloudPrinter API Connection Testing Guide

## Quick Tests

### 1. Test if Route is Working
```bash
# Open in browser or use curl:
curl http://localhost:5000/api/cloudprinter/test
```

**Expected Response:**
```json
{
  "success": true,
  "message": "CloudPrinter route is working!",
  "apiKeyConfigured": true,
  "apiUrl": "https://api.cloudprinter.com/cloudcore/1.0",
  "timestamp": "2025-12-22T19:49:00.000Z"
}
```

### 2. Test Actual CloudPrinter API Connection
```bash
# Use Postman or curl:
curl -X POST http://localhost:5000/api/cloudprinter/test-connection \
  -H "Content-Type: application/json"
```

**Expected Success Response:**
```json
{
  "success": true,
  "message": "Successfully connected to CloudPrinter API!",
  "status": 200,
  "data": {
    "products": [...]
  }
}
```

**If API Key is Invalid:**
```json
{
  "success": false,
  "message": "CloudPrinter API returned an error",
  "status": 401,
  "error": {
    "message": "Unauthorized"
  }
}
```

---

## Detailed Logging

When you submit an order, you'll now see detailed logs in the terminal:

```
📦 Submitting order to CloudPrinter...
═══════════════════════════════════════
🌐 Target URL: https://api.cloudprinter.com/cloudcore/1.0/orders/add
🔑 API Key: ae0f66617a...
📄 Order Reference: WL-1766432096123
📦 Product Code: alu_dibond_30x30
📏 Size: 300x300 mm
🏠 Shipping Country: SA
📧 Customer Email: customer@example.com
📋 Full Payload: { ... }
═══════════════════════════════════════
⏳ Sending request to CloudPrinter...
✅ Request completed in 456ms
📊 Response Status: 200 OK
📋 Response Headers: { ... }
```

---

## Troubleshooting

### Issue: Connection Timeout
**Symptoms:** Request hangs or times out
**Solution:** Check internet connection and CloudPrinter service status

### Issue: 401 Unauthorized
**Symptoms:** `"status": 401` in response
**Solution:** Verify `CLOUD_PRINTER_KEY` in `.env` is correct

### Issue: 405 Method Not Allowed
**Symptoms:** `"status": 405` in response
**Possible Causes:**
- Wrong API endpoint URL
- Wrong HTTP method
- API key not in request body

### Issue: Network Error
**Symptoms:** `"Failed to connect to CloudPrinter"` error
**Solution:** 
1. Check if server can reach external APIs
2. Verify firewall settings
3. Check DNS resolution

---

## Testing Checklist

- [ ] `/api/cloudprinter/test` returns success
- [ ] `/api/cloudprinter/test-connection` connects successfully
- [ ] API key shows as configured
- [ ] Terminal shows detailed logs when submitting order
- [ ] Response headers are visible in logs
- [ ] Request timing is shown

---

## Next Steps

1. **Get Real Product Codes:**
   Run the test-connection endpoint to see available products
   
2. **Update Product Mapping:**
   Replace example codes in `cloudprinter.js` with real codes

3. **Test Order Submission:**
   Submit a real order and check the detailed logs

4. **Monitor CloudPrinter Dashboard:**
   Check if orders appear in your CloudPrinter account
