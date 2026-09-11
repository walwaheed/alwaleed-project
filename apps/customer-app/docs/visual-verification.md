# Visual verification notes

- Mobile viewport verified at approximately 390×844 through the live Metro preview.
- Home screen renders Arabic RTL correctly with brand lockup, dark hero, ten intent cards, reassurance copy, and two-tab bottom navigation.
- Owner dashboard renders Arabic KPI cards, mock weekly bar chart, popular products, customer intentions, analytics events, and a clear mock-data disclaimer.
- Live preview URLs used: `/` and `/dashboard` on the current WebDev Metro preview.
- No visual blocker observed in the captured viewport; browser extraction confirmed all intended labels and navigation links.

## Cart and dashboard update verification

The cart preview rendered with a seeded recommended A5 item, quantity controls, subtotal, experimental preparation fee, and the three-step checkout labels. The owner dashboard rendered the range filters, intent chips, sorting controls, one filtered result card, and an insight summary in the mobile viewport.

## Customer Operations Hub V1 verification

The new `/hub` preview rendered on mobile with ten Arabic-first service cards: bookings, prints, uploads, passport/visa, portraits, corporate requests, tracking, invoices, quotations, and support. The page clearly labels V1 as mock and preserves bottom navigation to the assistant, owner dashboard, and cart.

## Shared Customer Intelligence verification

The `/hub` mobile preview rendered the Arabic «اقتراحك التالي · Mock» card above the service grid with a clear reason/confidence line and an accessible dismiss action. The UI explicitly states that the recommendation is mock and does not use sensitive data.

## Profiles and invitation engine verification

The invitation tab rendered with the four-step Arabic flow, three approved template cards, language/aspect-ratio metadata, and a clear Mock-only boundary. The navigation shows the new دعوات tab alongside الخدمات, المساعد, لوحة المالك, and السلة.

The expanded Customer Intelligence data is covered by unit tests for five distinct purchase histories, product preferences, quantities, materials, and order statuses.

## Mock transaction UI verification

The new `/transaction` tab rendered a complete Arabic RTL Photo Print reference flow with product summary, file validation, pricing, order creation, payment simulation, verification contract, and tracking timeline. The payment selector successfully switched from VERIFIED to FAILED and displayed a safe recovery message, `MOCK-PRINT-FAILED`, `Payment: FAILED`, and `Verification: DECLINED` without showing the order as paid.

## Phase 4A Product Selection and Quote UI verification

The new `/catalog` mobile-first Arabic RTL screen rendered product cards with names and dimensions, quantity controls, delivery-country chips, quote loading state, final total, VAT line, expiry countdown, refresh action, invalid-product state, and quote-failure retry state. The internal review controls switch between success, quote failure, and invalid product scenarios. The UI explicitly labels the current catalog and quote as demo data because no real backend base URL is configured; upload, order, payment, fulfillment, and tracking remain unavailable.

## Phase 4B upload, quality, review, and order UI verification

The `/checkout` screen rendered the Arabic RTL mobile-first flow from Photo Print selection to image upload, preview, quality review, order review, and ready-for-payment. The upload card supports phone/computer selection through Expo ImagePicker, shows a progress state, preview, replace, and remove actions. Quality messaging supports GOOD, ACCEPTABLE, and LOW_RESOLUTION with three recovery actions. The review state preserves the photo and shows product, size, quantity, price, VAT, delivery, and total. Internal scenario controls cover order created, failure, duplicate recovery, quote expiry, and upload expiry. Payment remains unimplemented.
