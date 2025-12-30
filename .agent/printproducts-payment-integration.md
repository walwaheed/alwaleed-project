# PrintProducts Payment Integration

## Overview
Added Paylink payment integration to the PrintProducts page. Users must complete payment before their print order is submitted to CloudPrinter.

## Implementation Status

### ✅ Completed
1. **PaymentOptions Component Import** - Added to PrintProducts page
2. **Payment Dialog State** - Added `showPaymentDialog` and `pendingOrderData` state
3. **Payment Dialog UI** - Shows payment options before order submission
4. **Order Data Preparation** - Collects all order info (product, size, shipping, etc.)  
5. **Submit Button Modified** - Now shows payment dialog instead of directly submitting

### ⚠️ Remaining Work
The payment flow needs adjustments because:

**Current Issue:**
- PaymentOptions redirects to Paylink payment page
- After payment, user returns to PaymentStatus page
- At this point, we need to submit the CloudPrinter order

**Solutions Needed:**

**Option 1: Store Order Data in Database (Recommended)**
1. When user clicks "Submit Order", create a pending order in database
2. Show payment dialog with Paylink
3. After successful Paylink payment, backend retrieves pending order
4. Backend submits to CloudPrinter  
5. Update order status

**Option 2: Session Storage**
1. Store pending order data in sessionStorage
2. After payment success & redirect back
3. Check sessionStorage for pending order
4. Submit to CloudPrinter if found

**Option 3: URL Parameters**
1. Pass order ID in Paylink callback URL
2. After payment, retrieve order data
3. Submit to CloudPrinter

## Current Code Structure

### PrintProducts.jsx

**State Added:**
```javascript
const [showPaymentDialog, setShowPaymentDialog] = useState(false);
const [pendingOrderData, setPendingOrderData] = useState(null);
```

**Functions:**
1. `handleSubmitOrder()` - Validates and shows payment dialog
2. `actualSubmitOrder()` - Submits to CloudPrinter (needs integration)

**Payment Dialog:**
- Shows after form validation
- Displays Paylink payment options
- Currently has `onPaymentSuccess` callback (not standard for PaymentOptions)

## Next Steps

1. **Choose Implementation Approach** (recommended: Option 1 - database storage)

2. **Create Database Table** for pending print orders:
```sql
CREATE TABLE printing_orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  user_email text NOT NULL,
  product_type text NOT NULL,
  order_data jsonb NOT NULL,
  payment_status text DEFAULT  'pending',
  paylink_transaction_id text,
  cloudprinter_order_ref text,
  status text DEFAULT 'pending'
);
```

3. **Update handleSubmitOrder:**
   - Save order to `printing_orders` table
   - Get order ID
   - Show payment dialog with order ID

4. **Update PaymentOptions:**
   - Pass order ID to Paylink
   - Include in metadata or callback URL

5. **Update Paylink verify-payment endpoint:**
   - After successful payment verification
   - Check for printing order
   - Submit to CloudPrinter API
   - Update printing_orders status

6. **Update PaymentStatus page:**
   - Show print order submitted message
   - Display CloudPrinter order reference

## Benefits

✅ Payment required before order submission
✅ No wasted CloudPrinter API calls for unpaid orders
✅ Clear separation of payment and printing
✅ Proper order tracking
✅ Prevents fraudulent orders

## Files Modified

- `src/pages/PrintProducts.jsx` - Added payment dialog and flow
- (Pending) `server/routes/paylink.js` - CloudPrinter integration
- (Pending) Database schema - Printing orders table
