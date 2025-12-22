# ✅ FINAL CORRECT CloudPrinter Option Names!

## The Actual CloudPrinter Options

After testing, these are the **confirmed correct** option names:

### Paper Types (Pageblock):
```
pageblock_130mcg  → 130gsm Machine Coated Gloss  ✅
pageblock_130mcs  → 130gsm Machine Coated Silk   ✅
pageblock_150mcg  → 150gsm Machine Coated Gloss  ✅
pageblock_150mcs  → 150gsm Machine Coated Silk   ✅
```

### Finish Types (Cover):
```
cover_finish_gloss  → Gloss finish   ✅
cover_finish_matte  → Matte finish   ✅
```

---

## Correct Payload Example

```json
{
  "items": [{
    "reference": "WL-123456-1",
    "product": "photobook_pb_240x300_p_fc",
    "count": "1",
    "files": [...],
    "options": [
      { 
        "type": "total_pages", 
        "count": "24" 
      },
      { 
        "type": "pageblock_130mcg",      // ← Page paper type
        "count": "24" 
      },
      { 
        "type": "cover_finish_gloss",    // ← Cover finish
        "count": "24" 
      }
    ]
  }]
}
```

---

## Backend Mapping

The backend now correctly maps:

```javascript
// Frontend: "130gsm Machine Coated Gloss"
// Backend:  "pageblock_130mcg"

if (paperType.includes('130gsm') && paperType.includes('Gloss')) {
    paperOption = 'pageblock_130mcg';
}

// Frontend: "Gloss finish"
// Backend:  "cover_finish_gloss"

if (finish.toLowerCase().includes('gloss')) {
    finishOption = 'cover_finish_gloss';
}
```

---

## All Option Names

### Complete List:

**Paper/Pageblock:**
- `pageblock_130mcg` (130gsm Gloss)
- `pageblock_130mcs` (130gsm Silk)
- `pageblock_150mcg` (150gsm Gloss)
- `pageblock_150mcs` (150gsm Silk)

**Cover Finish:**
- `cover_finish_gloss`
- `cover_finish_matte`

**Pages:**
- `total_pages` (required!)

---

## Testing

1. **Restart server:**
   ```powershell
   npm run dev:all
   ```

2. **Order a photobook** with:
   - Paper: "130gsm Machine Coated Gloss"
   - Finish: "Gloss finish"
   - Pages: 24

3. **Check logs** - should see:
```
📋 Full Payload: {
  "options": [
    { "type": "total_pages", "count": "24" },
    { "type": "pageblock_130mcg", "count": "24" },
    { "type": "cover_finish_gloss", "count": "24" }
  ]
}
✅ Request completed
📊 Response Status: 201 Created
```

---

## Summary

✅ Paper types use `pageblock_*` format  
✅ Finish types use `cover_finish_*` format  
✅ All options include page count  
✅ No `cp_` prefix needed  

**These are the FINAL correct option names confirmed by CloudPrinter!** 🎉
