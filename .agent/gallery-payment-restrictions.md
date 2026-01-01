# Gallery Payment Restrictions & Navbar Updates

## Overview
Added payment-based download restrictions to the Gallery page and added Cart and Gallery icons to the navigation bar.

## Changes Made

### 1. Navbar Updates (Layout.jsx)

**New Navigation Items (Authenticated Users):**
```javascript
[
  { name: 'Home', path: '/Home', icon: Home },
  { name: 'Edit Photo', path: '/EditPhoto', icon: Sparkles },
  { name: 'Print Products', path: '/PrintProducts', icon: Image },
  { name: 'Pricing', path: '/Pricing', icon: Star },
  { name: 'Gallery', path: '/Gallery', icon: Image },        // ← NEW
  { name: 'Cart', path: '/Cart', icon: ShoppingCart, badge: cartCount }, // ← NEW (with count)
  { name: 'Profile', path: '/Profile', icon: User },
]
```

**Visual:**
```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Home | Edit Photo | Print | Pricing | Gallery | Cart(3) | Profile │
└─────────────────────────────────────────────────────────────────────┘
```

### 2. Gallery Download Restrictions (Gallery.jsx)

**New Imports:**
- `Download` - for download button
- `Lock` - for unpaid badge
- `CreditCard` - for pay button

**New Functions:**

#### `handleDownloadPhoto(photo)`
- Only allows download for paid photos
- Checks `photo.status === 'paid'` OR `photo.editing_settings?.paid === true`
- Shows alert if photo is unpaid

#### `isPhotoPaid(photo)`
- Helper function to check payment status
- Returns `true` if photo is paid

**Photo Card Changes:**

| Before | After (Unpaid) | After (Paid) |
|--------|----------------|--------------|
| Add to Cart button | Pay to Download button | Download button (green) |
| No status badge | Yellow "Unpaid" badge with lock | Green "Paid" badge |

**UI Preview - Paid Photo:**
```
┌─────────────────────────────┐
│ [Photo Image]           📗  │ ← Green "Paid" badge
│ [Visa Photo Badge]          │
├─────────────────────────────┤
│ Photo Title                 │
│ A5 • 35 SAR                 │
│                             │
│ [📥 Download] [Share]       │ ← Green download button
└─────────────────────────────┘
```

**UI Preview - Unpaid Photo:**
```
┌─────────────────────────────┐
│ [Photo Image]           🔒  │ ← Yellow "Unpaid" badge with lock
│ [Visa Photo Badge]          │
├─────────────────────────────┤
│ Photo Title                 │
│ A5 • 35 SAR                 │
│                             │
│ [💳 Pay to Download] [Share]│ ← Black pay button
└─────────────────────────────┘
```

### 3. Slideshow Updates

The slideshow dialog now also shows:
- **Paid photos**: Green "Download" button
- **Unpaid photos**: "Pay to Download" button that adds to cart

## Payment Flow

### Complete User Journey:

```
1. User edits photo at /EditPhoto
   └→ Sees "Pay XX SAR" button

2. User clicks Pay
   └→ Payment dialog opens (Paylink)

3. User completes payment
   └→ Photo saved with status: "paid"

4. User redirected to Gallery
   └→ Sees green "Paid" badge
   └→ Sees green "Download" button

5. User clicks Download
   └→ Photo downloads to device ✅
```

### Unpaid Photo Journey:

```
1. User sees unpaid photo in Gallery
   └→ Yellow "Unpaid" badge with lock

2. User clicks "Pay to Download"
   └→ Photo added to Cart

3. User goes to Cart and pays
   └→ Photo status updated to "paid"

4. User returns to Gallery
   └→ Photo now shows "Download" button
```

## Files Modified

### Layout.jsx
- ✅ Added Gallery nav item with Image icon
- ✅ Added Cart nav item with ShoppingCart icon and badge
- ✅ Removed badge from Profile (moved to Cart)

### Gallery.jsx
- ✅ Added Download, Lock, CreditCard icons
- ✅ Added `handleDownloadPhoto()` function
- ✅ Added `isPhotoPaid()` helper function
- ✅ Updated photo cards with payment status badge
- ✅ Conditional Download/Pay buttons in grid
- ✅ Updated slideshow action buttons

## Payment Status Check

Photos are considered "paid" if either:
1. `photo.status === 'paid'`
2. `photo.editing_settings?.paid === true`

This allows compatibility with both the new EditPhoto flow and any backend updates.

## Security Note

The download restriction is client-side for UX purposes. For full security, the backend should also verify payment status before serving images. Currently:
- Client checks before allowing download
- Photo URLs are still accessible if known
- Consider adding signed URLs or download tokens for production

## Testing Checklist

### Navbar:
- [ ] Gallery icon appears for authenticated users
- [ ] Cart icon appears with badge showing item count
- [ ] Click Gallery → navigates to /Gallery
- [ ] Click Cart → navigates to /Cart
- [ ] Badge updates when items added/removed

### Gallery - Unpaid Photos:
- [ ] Yellow "Unpaid" badge with lock icon appears
- [ ] "Pay to Download" button shows (black, with credit card icon)
- [ ] Clicking "Pay to Download" adds to cart
- [ ] Download NOT possible for unpaid photos

### Gallery - Paid Photos:
- [ ] Green "Paid" badge appears
- [ ] Green "Download" button appears
- [ ] Clicking "Download" downloads the photo
- [ ] File saved as `{title}-edited.png`

### Slideshow:
- [ ] Unpaid: Shows "Pay to Download" button
- [ ] Paid: Shows green "Download" button
- [ ] Download works from slideshow view

## Arabic/English Support

| Term | English | Arabic |
|------|---------|--------|
| Gallery | Gallery | المعرض |
| Cart | Cart | السلة |
| Paid | Paid | مدفوع |
| Unpaid | Unpaid | غير مدفوع |
| Download | Download | تنزيل |
| Pay to Download | Pay to Download | ادفع للتنزيل |
