# CloudPrinter Integration - Final Steps

## ✅ What Was Fixed

1. **Actual Product Codes**: Updated to use real CloudPrinter reference codes
   - Aluminum: `wall_decor_[size]_alu_fc`
   - Wood: `wall_decor_[size]_wood_fc`  
   - Canvas: `wall_decor_[size]_mm_canvas_fc`
   - Photobook: `photobook_pb_[size]_[orientation]_fc`

2. **MD5 Checksums**: Backend now downloads files and calculates actual MD5 hashes

3. **File Type Parameter**: Added required `type` parameter to all file objects

---

## 🚀 Next Steps

### 1. Restart the Backend Server

**Option A: Kill and restart**
```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
npm run dev:all
```

**Option B: Just restart npm**
```powershell
# Press Ctrl+C in the terminal running npm
# Then run:
npm run dev:all
```

### 2. Test Order Submission

1. Go to http://localhost:5173/PrintProducts
2. Select a product (Aluminum, Wood, or Canvas)
3. Upload a PDF file (will be used to calculate MD5)
4. Fill in shipping information
5. Click "Submit Order"

### 3. Watch the Logs

You should see:
```
📥 Downloading files to calculate MD5 checksums...
✅ Calculated MD5 for [filename]: a1b2c3d4...
✅ MD5 checksums calculated successfully
📦 Submitting order to CloudPrinter...
🌐 Target URL: https://api.cloudprinter.com/cloudcore/1.0/orders/add
📦 Product Code: wall_decor_400x400_alu_fc  ← Real CloudPrinter code!
⏳ Sending request to CloudPrinter...
✅ Request completed in XXXms
📊 Response Status: 201 Created  ← SUCCESS!
```

---

## ⚠️ Important Notes

### Supported Sizes

**Aluminum:**
- 300x300 mm, 400x400 mm, 450x450 mm, 500x500 mm, 700x700 mm
- 300x450 mm, 500x600 mm, 600x800 mm, 600x900 mm

**Wood:**
- 300x300 mm, 400x400 mm, 450x450 mm, 500x500 mm, 700x700 mm
- 300x450 mm, 400x600 mm, 600x800 mm, 600x900 mm

**Canvas:**
- 200x200 mm, 200x300 mm, 300x300 mm, 300x400 mm, 300x450 mm
- 400x400 mm, 400x600 mm, 500x700 mm, 500x750 mm
- 600x600 mm, 600x800 mm, 800x800 mm, 1000x500 mm

**Photobook:**
- A6 Portrait, A6 Landscape
- A5 Portrait, A5 Landscape
- A4 Portrait, A4 Landscape

### If You Get "Product configuration not supported"

The size you selected doesn't have a CloudPrinter mapping. Either:
1. Choose a different size from the list above
2. Add the mapping to `productMappingBySize` in `cloudprinter.js`

---

## 🎯 Expected Success Response

```json
{
  "success": true,
  "orderReference": "WL-1766433871613",
  "cloudPrinterOrderId": "CP-12345",
  "data": {
    "order_reference": "WL-1766433871613",
    "status": "pending",
    ...
  }
}
```

The order will then be visible in your CloudPrinter dashboard!

---

## 🐛 Troubleshooting

### Error: "Failed to calculate MD5 checksum"
- The PDF file URL is not accessible
- Check Supabase storage permissions

### Error: "Product configuration not supported"
- The selected size doesn't have a CloudPrinter mapping
- Add it to `productMappingBySize` or choose a different size

### Error: "Invalid product code"
- CloudPrinter doesn't recognize the product code
- Verify the code exists in CloudPrinter's product list
- Use `/api/cloudprinter/products` to see all available products
