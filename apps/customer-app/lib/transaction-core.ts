export type TransactionProductType = "photo_print" | "print_product" | "studio_booking" | "digital_invitation" | "future_service";
export type OrderStatus = "DRAFT" | "PENDING_UPLOAD" | "READY_FOR_PRICING" | "PENDING_PAYMENT" | "PAYMENT_PROCESSING" | "PAID" | "PROCESSING" | "READY" | "DELIVERED" | "CANCELLED" | "FAILED";
export type PaymentStatus = "NOT_REQUIRED" | "PENDING" | "PROCESSING" | "VERIFIED" | "FAILED" | "CANCELLED" | "EXPIRED";
export type PaymentFailureReason = "DECLINED" | "CANCELLED_BY_CUSTOMER" | "EXPIRED" | "VERIFICATION_FAILED";

export type CustomerContract = { customer_id: string; phone?: string; email?: string; locale: "ar" | "en"; identity_source: "guest" | "verified_phone" | "verified_email" | "crm_mapping" };
export type ProductContract = { product_id: string; product_type: TransactionProductType; name: string; size?: string; material?: string; finish?: string; unit_price: number; currency: "SAR"; availability: "available" | "quotation_required" | "unavailable" };
export type CartContract = { cart_id: string; customer_id: string; items: { product: ProductContract; quantity: number; file_ids: string[] }[]; subtotal: number; shipping: number; tax: number; total: number; pricing_version: string };
export type FileUploadContract = { file_id: string; customer_id: string; filename: string; mime_type: "image/jpeg" | "image/png" | "application/pdf"; size_bytes: number; width?: number; height?: number; purpose: "print" | "invitation" | "booking_brief"; retention_expires_at: string; status: "PENDING" | "VALIDATED" | "REJECTED" };
export type OrderContract = { order_id: string; order_number?: string; customer_id: string; cart_id: string; product_type: TransactionProductType; status: OrderStatus; payment_status: PaymentStatus; amount: number; currency: "SAR"; source_of_truth: "existing_supabase_orders"; created_at: string };
export type PricingContract = { cart_id: string; subtotal: number; shipping: number; tax: number; total: number; currency: "SAR"; pricing_version: string; valid_until: string; source: "mock_pricing" | "catalog_api" };
export type PaymentContract = { payment_id: string; order_id: string; provider: "moyasar"; amount: number; currency: "SAR"; status: PaymentStatus; return_url: string; callback_reference?: string };
export type PaymentVerificationContract = { payment_id: string; order_id: string; provider: "moyasar"; provider_status: string; verified: boolean; verified_at?: string; failure_reason?: PaymentFailureReason; source_of_truth: "moyasar_server_verification" };
export type TrackingContract = { order_number: string; status: OrderStatus; payment_status: PaymentStatus; production_stage: "not_started" | "printing" | "ready" | "delivery"; estimated_ready_at?: string; delivery_status: "not_applicable" | "awaiting_pickup" | "out_for_delivery" | "delivered" };

export const transactionApiContracts = {
  customer: "POST /customers/resolve",
  products: "GET /products?product_type={type}",
  cart: "POST /carts + PATCH /carts/{cart_id}",
  upload: "POST /uploads/initiate + POST /uploads/{file_id}/complete",
  pricing: "POST /pricing/quote",
  order: "POST /orders + GET /orders/{order_id}",
  checkout: "POST /checkout",
  payment: "GET /payments/{payment_id}",
  paymentVerification: "POST /payments/{payment_id}/verify",
  status: "GET /orders/{order_id}/status",
  tracking: "GET /order-status/{order_number}",
} as const;

export const mockPaymentStates: PaymentStatus[] = ["VERIFIED", "FAILED", "CANCELLED", "EXPIRED"];

export const runMockPhotoPrintTransaction = (outcome: PaymentStatus = "VERIFIED") => {
  const orderNumber = `MOCK-PRINT-${outcome === "VERIFIED" ? "2048" : outcome}`;
  const paymentStatus: PaymentStatus = outcome;
  const status: OrderStatus = outcome === "VERIFIED" ? "PAID" : outcome === "CANCELLED" ? "CANCELLED" : outcome === "EXPIRED" ? "FAILED" : "FAILED";
  return {
    customer: { customer_id: "cus_mock_print_002", locale: "ar", identity_source: "guest" } as CustomerContract,
    upload: { file_id: "file_mock_photo_01", customer_id: "cus_mock_print_002", filename: "family-photo.jpg", mime_type: "image/jpeg", size_bytes: 480000, width: 2400, height: 1600, purpose: "print", retention_expires_at: "2026-09-16T16:00:00.000Z", status: "VALIDATED" } as FileUploadContract,
    pricing: { cart_id: "cart_mock_01", subtotal: 36, shipping: 5, tax: 0, total: 41, currency: "SAR", pricing_version: "mock-v1", valid_until: "2026-09-09T17:00:00.000Z", source: "mock_pricing" } as PricingContract,
    order: { order_id: "ord_mock_print_01", order_number: orderNumber, customer_id: "cus_mock_print_002", cart_id: "cart_mock_01", product_type: "photo_print", status, payment_status: paymentStatus, amount: 41, currency: "SAR", source_of_truth: "existing_supabase_orders", created_at: "2026-09-09T16:00:00.000Z" } as OrderContract,
    payment: { payment_id: `pay_mock_${outcome.toLowerCase()}`, order_id: "ord_mock_print_01", provider: "moyasar", amount: 41, currency: "SAR", status: paymentStatus, return_url: "manus://payment-return" } as PaymentContract,
    verification: { payment_id: `pay_mock_${outcome.toLowerCase()}`, order_id: "ord_mock_print_01", provider: "moyasar", provider_status: outcome, verified: outcome === "VERIFIED", verified_at: outcome === "VERIFIED" ? "2026-09-09T16:01:00.000Z" : undefined, failure_reason: outcome === "FAILED" ? "DECLINED" : outcome === "CANCELLED" ? "CANCELLED_BY_CUSTOMER" : outcome === "EXPIRED" ? "EXPIRED" : undefined, source_of_truth: "moyasar_server_verification" } as PaymentVerificationContract,
    tracking: { order_number: orderNumber, status, payment_status: paymentStatus, production_stage: outcome === "VERIFIED" ? "not_started" : "not_started", delivery_status: "not_applicable" } as TrackingContract,
  };
};
