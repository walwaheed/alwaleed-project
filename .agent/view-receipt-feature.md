# View Receipt Button Feature

## Overview
Added a "View Receipt" button to the Profile page that allows clients to view their Paylink payment receipts directly from their order history.

## Implementation Details

### Backend Changes (`server/routes/paylink.js`)
When a payment is verified as successful, the system now:
1. Updates the order status to `paid`
2. Stores the receipt URL in the `notes` field as a JSON object:
   ```json
   {
     "receiptUrl": "https://paylink.sa/receipt/...",
     "paidAt": "2025-12-26T18:33:00.000Z"
   }
   ```

### Frontend Changes (`src/pages/Profile.jsx`)

#### Added Helper Function
```javascript
const getReceiptUrl = (order) => {
  try {
    if (order.notes && typeof order.notes === 'string') {
      const notesData = JSON.parse(order.notes);
      return notesData.receiptUrl;
    }
  } catch (error) {
    console.error('Error parsing order notes:', error);
  }
  return null;
};
```

#### Added UI Button
- Appears **only** for orders with status = `paid` that have a receipt URL
- Located at the bottom of each order card, after the order items
- Styled with green color scheme to match the "paid" status badge
- Opens the receipt in a new browser tab when clicked
- Supports both English and Arabic languages

### Translations Added
- **English**: "View Receipt"
- **Arabic**: "عرض الإيصال"

## User Experience

### What Users See:
1. **Paid Orders**: Display a green "View Receipt" button at the bottom of the order card
2. **Other Orders**: No receipt button (processing, shipped, delivered, cancelled)
3. **Click Behavior**: Opens Paylink receipt in a new tab for easy viewing/printing

### Visual Design:
- 🎨 **Color**: Green background (`bg-green-600`) matching the paid status
- 📱 **Responsive**: Full-width button on all screen sizes
- 🔄 **Interactive**: Hover effect with darker green
- 📋 **Icon**: Receipt icon from lucide-react for clarity

## Data Flow
```
Payment Verified (Paylink)
    ↓
Backend saves receipt URL in order.notes
    ↓
Frontend fetches orders
    ↓
Profile page parses notes field
    ↓
If order.status === 'paid' && receiptUrl exists
    ↓
Display "View Receipt" button
    ↓
User clicks → Opens receipt in new tab
```

## Benefits
- ✅ Easy access to payment receipts
- ✅ No need to search through emails
- ✅ Professional appearance
- ✅ Bilingual support (EN/AR)
- ✅ Direct integration with Paylink
