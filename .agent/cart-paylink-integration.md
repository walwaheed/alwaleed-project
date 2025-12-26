# Cart Paylink Integration

## Overview
Added full Paylink payment integration to the Cart page, allowing customers to purchase their cart items using online payment (Mada/Visa/Apple Pay) or other payment methods.

## Implementation

### Two-Step Checkout Process

#### Step 1: Shipping Information Form
When clicking "Buy & Ship Now", users are presented with a shipping form to collect:
- Full Name
- Phone Number **(required for Paylink)**
- Address Line 1
- Address Line 2 (optional)
- City
- State/Province
- Postal Code
- Country (defaults to "Saudi Arabia")

**Validation**: All fields except Address Line 2 and State are required.

#### Step 2: Payment Options
After submitting shipping information, the PaymentOptions component appears with:
- **Online Payment (Paylink)**: Mada, Visa, Apple Pay
- **Bank Transfer - SNB**
- **STC Pay QR Code**
- **Bank Transfer - INMA**

**Back Button**: Users can go back to edit shipping information if needed.

### Components Updated

#### 1. `Cart.jsx`
**Added State:**
```javascript
const [shippingInfo, setShippingInfo] = useState(null);
const [showPaymentOptions, setShowPaymentOptions] = useState(false);
```

**Dialog Content:**
- Shows shipping form initially
- After submission, shows PaymentOptions component
- Properly formats shipping data for Paylink API

**Items Passed:**
- Cart items are passed to PaymentOptions component
- Items include: photo_title, photo_url, print_size, quantity, total_price

#### 2. `PaymentOptions.jsx`
**Updated Function Signature:**
```javascript
export default function PaymentOptions({ bookingData, packageInfo, onBack, items })
```

**Enhanced Payment Request:**
- Accepts optional `items` prop
- When items provided (from Cart), maps them to Paylink format:
  - `title`: photo_title
  - `price`: unit price (total_price / quantity)
  - `qty`: quantity
  - `description`: print_size
- When no items (from Pricing page), uses packageTitle as before

#### 3. `LanguageContext.jsx`
**Added Translations:**
- English: "Phone Number", "Optional", "Continue to Payment"
- Arabic: "رقم الهاتف", "اختياري", "متابعة إلى الدفع"

### Backend Integration
The existing `/api/paylink/create-payment` endpoint already supports:
- Creating orders with items array
- Mapping items to Paylink products format
- Storing order in database with all cart items
- Redirecting to Paylink payment page

### User Flow

```
Cart Page
    ↓
Click "Buy & Ship Now"
    ↓
Shipping Form Dialog Opens
    ↓
User fills: Name, Phone, Address, City, Postal Code, Country
    ↓
Click "Continue to Payment"
    ↓
Payment Options Appear (with Back button)
    ↓
Select Payment Method (e.g., Paylink)
    ↓
Click "Pay [Amount] SAR"
    ↓
Redirect to Paylink Payment Page
    ↓
Complete 3DS Authentication
    ↓
Redirect to PaymentStatus Page
    ↓
Shows Success/Error with Order Details
```

## Benefits
✅ Full Paylink integration for cart purchases
✅ Collects shipping information before payment  
✅ Sends all cart items to Paylink invoice
✅ Creates proper order in database with all items
✅ Supports multiple payment methods
✅ Bilingual (English/Arabic)
✅ Validates required fields
✅ Allows users to go back and edit shipping info
✅ Shows clear order summary with VAT and shipping costs

## Testing Checklist
- [ ] Add items to cart
- [ ] Click "Buy & Ship Now"
- [ ] Fill shipping form
- [ ] Click "Continue to Payment"
- [ ] Select Paylink payment
- [ ] Click pay button - should redirect to Paylink
- [ ] Complete payment - should redirect back with status
- [ ] Verify order appears in Profile with all items
- [ ] Verify receipt URL is saved and viewable
