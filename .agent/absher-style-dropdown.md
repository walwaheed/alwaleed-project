# Absher Photo Style Dropdown Implementation

## Overview
Added style dropdown selector to **Absher Photo (Male)** upload dialog only, matching the Saudi Look dialog functionality. Absher Photo (Female) does NOT have style options.

## Changes Made

### 1. State Management
Added new state variable for Absher style selection:
```javascript
const [selectedAbsherStyle, setSelectedAbsherStyle] = useState("Royal");
```

### 2. Upload Dialog UI
Added dropdown selector ONLY for:
- ✅ **Absher Photo (Male)** (`absher-photo`) - HAS dropdown
- ❌ **Absher Photo (Female)** (`absher-photo-female`) - NO dropdown

**UI Components (Male only):**
- Label: "Style:" (English) / "النمط:" (Arabic)
- Dropdown with 6 style options:
  1. **Royal** (الملكية)
  2. **Sheyoukh** (الشيوخ)
  3. **Eagle** (الصقر)
  4. **Practical** (العملية)
  5. **Youth** (الشبابية)
  6. **Knight** (الفارس)

### 3. Webhook Integration
Updated `processPhoto` function to include style parameter ONLY for male:

```javascript
const requestData = {
  image_url: file_url,
  editing_type: selectedOption.id,
  original_url: file_url,
  // For Absher MALE photo only - include style
  ...(selectedOption.id === "absher-photo" && 
      { style: selectedAbsherStyle })
};
```

**Webhook Behavior:**

**Absher Male** (`absher-photo`):
```json
{
  "image_url": "...",
  "editing_type": "absher-photo",
  "original_url": "...",
  "style": "Royal"  // ✅ Included
}
```

**Absher Female** (`absher-photo-female`):
```json
{
  "image_url": "...",
  "editing_type": "absher-photo-female",
  "original_url": "..."
  // ❌ NO style parameter
}
```

## Dialog Comparison

### Absher Photo (Male) - WITH Style
```
┌─────────────────────────────────────┐
│  📤 Absher Photo (Male)             │
│                                     │
│  Style:                             │
│  ┌───────────────────────────────┐ │
│  │ Royal                      ▼ │ │  ✅ Has dropdown
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 📤 Upload from Device          │ │
│  └───────────────────────────────┘ │
│                                     │
│              or                     │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 📷 Take a Photo                │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Absher Photo (Female) - NO Style
```
┌─────────────────────────────────────┐
│  📤 Absher Photo (Female)           │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 📤 Upload from Device          │ │  ❌ No dropdown
│  └───────────────────────────────┘ │
│                                     │
│              or                     │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 📷 Take a Photo                │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Style Options (Male Only)

| Value | English | Arabic |
|-------|---------|--------|
| `Royal` | Royal | الملكية |
| `sheyoukh` | Sheyoukh | الشيوخ |
| `Eagle` | Eagle | الصقر |
| `practical` | Practical | العملية |
| `youth` | Youth | الشبابية |
| `knight` | Knight | الفارس |

## Backend Requirements

### Absher Male Webhook
`https://n8n.renovaai.cloud/webhook/absher` should:
1. Accept `style` parameter in the request body
2. Apply the appropriate style transformation based on the value
3. Return the processed image with the selected style applied

### Absher Female Webhook
`https://n8n.renovaai.cloud/webhook/absher` should:
1. Process without expecting a `style` parameter
2. Apply default female Absher photo processing
3. Return the processed image

## Files Modified

- ✅ `src/pages/EditPhoto.jsx`
  - Added `selectedAbsherStyle` state
  - Added style dropdown UI (male only)
  - Updated webhook request payload (male only)

## Testing Checklist

**Absher Photo (Male):**
- [x] Dropdown appears in upload dialog
- [ ] All 6 styles selectable
- [ ] Upload image - webhook receives style parameter
- [ ] Capture photo - webhook receives style parameter
- [ ] Test with Arabic language

**Absher Photo (Female):**
- [x] NO dropdown in upload dialog
- [ ] Upload image - webhook does NOT receive style parameter
- [ ] Capture photo - webhook does NOT receive style parameter
- [ ] Verify female-specific processing works

## Key Differences

| Feature | Male | Female |
|---------|------|--------|
| Style Dropdown | ✅ Yes | ❌ No |
| Style Parameter in Webhook | ✅ Yes | ❌ No |
| Editing Type | `absher-photo` | `absher-photo-female` |
| Webhook URL | Same URL | Same URL |
| Default Style | Royal | N/A |

## Benefits

✅ Male photos have more customization options  
✅ Female photos have simpler upload flow  
✅ Clear separation of male/female processing  
✅ Consistent with Saudi Look male-only pattern  
✅ Bilingual support (English/Arabic)  
