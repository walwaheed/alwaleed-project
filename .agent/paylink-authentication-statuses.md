# Paylink 3DS Authentication Result Codes

This document describes how different 3DS (3D Secure) authentication results are handled in the Alwaleed Backend application.

## Authentication Result Codes

### ✅ (Y) Authentication/Account Verification Successful
- **Status**: `success`
- **Database Status**: `paid`
- **Icon**: Green checkmark circle
- **Message**: "Your account has been verified successfully and the payment is complete."
- **Available Actions**:
  - View Receipt
  - View My Orders
  - Return to Home

---

### ❌ (N) Not Authenticated / Account Not Verified Transaction Denied
- **Status**: `denied`
- **Database Status**: `cancelled`
- **Icon**: Red X circle
- **Message**: "Authentication failed. The account could not be verified. Transaction has been denied."
- **Available Actions**:
  - Try Again
  - Return to Home

---

### ⚠️ (N) Authentication Cancelled
- **Status**: `cancelled`
- **Database Status**: `cancelled`
- **Icon**: Yellow warning triangle
- **Message**: "The authentication process was cancelled by you or timed out."
- **Available Actions**:
  - Try Again
  - Return to Home

---

### ⚠️ (U) Authentication Not Available
- **Status**: `unavailable`
- **Database Status**: `cancelled`
- **Icon**: Yellow warning triangle
- **Message**: "Authentication service is currently unavailable. Please try again later or use a different payment method."
- **Available Actions**:
  - Try Again
  - Return to Home

---

### ❌ (R) Authentication Rejected
- **Status**: `rejected`
- **Database Status**: `cancelled`
- **Icon**: Red X circle
- **Message**: "The authentication was rejected. Please contact your bank for more information."
- **Available Actions**:
  - Try Again
  - Contact Support via WhatsApp
  - Return to Home

---

### 🔴 (E) Authentication Server Error
- **Status**: `server_error`
- **Database Status**: `cancelled`
- **Icon**: Red X circle
- **Message**: "A server error occurred during authentication. Please try again or contact support."
- **Available Actions**:
  - Try Again
  - Contact Support via WhatsApp
  - Return to Home

---

### 🔴 (AI) API Gateway ASM Policy Error
- **Status**: `gateway_error`
- **Database Status**: `cancelled`
- **Icon**: Red X circle
- **Message**: "An API Gateway ASM Policy Error occurred. Please contact support."
- **Available Actions**:
  - Try Again
  - Contact Support via WhatsApp
  - Return to Home

---

## Implementation Details

### Backend (`server/routes/paylink.js`)
The `verify-payment` endpoint now:
1. Retrieves payment information from Paylink
2. Maps the authentication result code to a detailed status object
3. Updates the order status in the database (`paid` or `cancelled`)
4. Returns comprehensive authentication details to the frontend

### Frontend (`src/pages/PaymentStatus.jsx`)
The PaymentStatus page now:
1. Displays appropriate icons and colors for each status
2. Shows detailed, user-friendly messages
3. Displays transaction details (transaction number, order number, amount, auth code)
4. Provides contextual action buttons based on the authentication result
5. Uses colored cards and styling to visually distinguish between success, warning, and error states

### Color Scheme
- **Success (Green)**: Payment successful
- **Error (Red)**: Authentication denied, rejected, or server/gateway errors
- **Warning (Amber/Yellow)**: Authentication cancelled or unavailable
- **Info (Blue)**: Payment pending

## Database Order Statuses
When a payment is processed, the order status is updated to:
- `paid` - For successful authentication (Y)
- `cancelled` - For failed, denied, rejected, cancelled, or error scenarios
- `processing` - For pending payments (rare, but handled)
