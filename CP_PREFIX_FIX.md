# ✅ Added cp_ Prefix to CloudPrinter Options

## The Fix

All CloudPrinter option types need the `cp_` prefix!

### Updated Paper Types:
```
cp_paper_130gsm_gloss  ✅
cp_paper_130gsm_silk   ✅
cp_paper_150gsm_gloss  ✅
cp_paper_150gsm_silk   ✅
```

### Updated Finish Types:
```
cp_finish_lam_gloss  ✅
cp_finish_lam_matt   ✅
```

## Example Payload

```json
{
  "items": [{
    "options": [
      { "type": "total_pages", "count": "24" },
      { "type": "cp_paper_130gsm_gloss", "count": "24" },  ← With cp_ prefix!
      { "type": "cp_finish_lam_gloss", "count": "24" }     ← With cp_ prefix!
    ]
  }]
}
```

## Testing

**Server is updated!** Just restart:
```powershell
npm run dev:all
```

Then submit a photobook order - should work now! 🎉
