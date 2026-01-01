# EditPhoto Paywall Integration

## Overview
Integrated Paylink payment paywall into the EditPhoto page. Users must now pay before their edited photo is saved to gallery. Download is only available from the gallery for paid photos.

## New Flow

### Old Flow (Before)
```
1. User uploads photo
2. AI processes photo (webhook)
3. User sees "Download Photo" button
4. Photo downloads AND saves to gallery/cart
5. User pays later at /cart page
```

### New Flow (After)
```
1. User uploads photo
2. AI processes photo (webhook)
3. User sees "Pay XX SAR" button (red gradient)
4. User clicks Pay → Payment dialog opens
5. User completes Paylink payment
6. Photo saves to gallery with "paid" status
7. User redirected to gallery
8. Download available from gallery for paid photos
```

## Changes Made

### 1. New Imports
```javascript
import PaymentOptions from "../components/PaymentOptions";
import { CreditCard } from "lucide-react";
```

### 2. New State
```javascript
const [showPaymentDialog, setShowPaymentDialog] = useState(false);
```

### 3. New Functions

#### `handlePayAndSave()`
- Validates user authentication
- Validates photo title
- Opens payment dialog

#### `savePhotoToGallery()`
- Saves photo with `status: "paid"` and `paid: true` flag
- Redirects to gallery after save
- Called after successful payment

### 4. Updated Button
**Before:**
- Black "Download Photo" button
- Downloads photo immediately

**After:**
- Red gradient "Pay XX SAR" button
- Opens payment dialog
- Shows price dynamically

### 5. Payment Dialog
- Uses existing `PaymentOptions` component
- Passes user info and package details
- Shows Paylink payment option

### 6. Success Dialog Updated
**Before:**
- "Photo saved to gallery and cart"
- Buttons: "Try Another Tool", "Proceed to Cart"

**After:**
- "Payment Successful!"
- Buttons: "Open Gallery to Download", "Edit Another Photo"

## UI Changes

### Before (Old):
```
┌────────────────────────────────────┐
│ 🖼️ Processing Complete!            │
│                                    │
│ [Before/After Image]               │
│                                    │
│ [Edit Another] [📥 Download Photo] │
│                                    │
│ (black button)                     │
└────────────────────────────────────┘
```

### After (New):
```
┌────────────────────────────────────┐
│ 🖼️ Processing Complete!            │
│                                    │
│ [Before/After Image]               │
│                                    │
│ [Edit Another] [💳 Pay 35 SAR]     │
│                                    │
│ (red gradient button)              │
└────────────────────────────────────┘
```

## Payment Dialog
```
┌────────────────────────────────────┐
│ 💳 Complete Payment                │
│                                    │
│ Package: Absher Photo - photo.jpg  │
│ Amount: 35.00 SAR                  │
│                                    │
│ [Paylink Payment Option]           │
│                                    │
│ [← Back]                           │
└────────────────────────────────────┘
```

## Photo Status

### Before Payment
- Photo NOT saved to database
- No download available

### After Payment
```javascript
{
  status: "paid",
  editing_settings: {
    // ...other settings
    paid: true
  }
}
```

## Files Modified

- ✅ `src/pages/EditPhoto.jsx`
  - Added PaymentOptions import
  - Added CreditCard icon import
  - Added `showPaymentDialog` state
  - Added `handlePayAndSave` function
  - Added `savePhotoToGallery` function
  - Updated button from Download to Pay
  - Added Payment Dialog
  - Updated Success Dialog

## Next Steps

### For Gallery Page (`Profile.jsx`)
The gallery should check the `paid` status and only show download option for paid photos:

```javascript
// Example implementation for gallery
{photo.status === 'paid' && (
  <Button onClick={() => downloadPhoto(photo)}>
    <Download /> Download
  </Button>
)}
```

### Database Schema
Consider adding a `paid` column to the photos table:
```sql
ALTER TABLE photos ADD COLUMN paid BOOLEAN DEFAULT false;
```

## Testing Checklist

- [ ] User can upload and process photo
- [ ] "Pay XX SAR" button shows correct price
- [ ] Payment dialog opens on button click
- [ ] Paylink payment flow works
- [ ] Photo saves to gallery after payment
- [ ] Photo has `status: "paid"` and `paid: true`
- [ ] User redirected to gallery
- [ ] Download works from gallery for paid photos
- [ ] Unpaid photos cannot be downloaded

## Benefits

✅ Payment required before photo access
✅ No free downloads
✅ Clear pricing displayed
✅ Seamless payment flow
✅ Gallery-based download system
✅ Payment status tracked in database
