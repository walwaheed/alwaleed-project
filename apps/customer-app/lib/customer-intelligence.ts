export type IntelligenceKind = "OBSERVED" | "CALCULATED" | "INFERRED" | "PREDICTED";

export type IntelligenceField<T> = {
  value: T;
  type: IntelligenceKind;
  confidence: number;
  source: string;
  updated_at: string;
};

export type CustomerEventType =
  | "APP_OPENED"
  | "SERVICE_VIEWED"
  | "PRODUCT_VIEWED"
  | "PHOTO_UPLOADED"
  | "BOOKING_STARTED"
  | "BOOKING_COMPLETED"
  | "CHECKOUT_STARTED"
  | "PAYMENT_COMPLETED"
  | "PAYMENT_FAILED"
  | "ORDER_CREATED"
  | "ORDER_REPEATED"
  | "QUOTE_REQUESTED"
  | "ORDER_STATUS_VIEWED"
  | "SUPPORT_REQUESTED";

export type CustomerEvent = {
  event_id: string;
  customer_id: string;
  event_type: CustomerEventType;
  timestamp: string;
  channel: "manus_app" | "website" | "whatsapp" | "email" | "staff";
  session_id: string;
  object_type?: string;
  object_id?: string;
  metadata: Record<string, string | number | boolean>;
  source_system: string;
};

export type NextBestActionCode =
  | "CONTINUE_BOOKING"
  | "COMPLETE_PAYMENT"
  | "TRACK_ACTIVE_ORDER"
  | "REORDER_PREVIOUS_PRODUCT"
  | "UPLOAD_BETTER_IMAGE"
  | "RECOMMEND_PRINT_SIZE"
  | "SHOW_CORPORATE_INTAKE"
  | "REQUEST_QUOTATION"
  | "SHOW_RELEVANT_CONTENT"
  | "NO_ACTION";

export type NextBestAction = {
  code: NextBestActionCode;
  title: string;
  body: string;
  reason: IntelligenceField<string>;
  source: "mock_customer_intelligence";
  dismissible: true;
};

export type Customer360Profile = {
  customer_id: string;
  identity: {
    language: IntelligenceField<"ar" | "en">;
    verified_channels: IntelligenceField<string[]>;
  };
  relationship: {
    lifecycle_stage: IntelligenceField<string>;
    customer_type: IntelligenceField<"B2B" | "B2C">;
    repeat_customer: IntelligenceField<boolean>;
  };
  transactional: {
    active_booking: IntelligenceField<boolean>;
    active_order: IntelligenceField<boolean>;
    payment_pending: IntelligenceField<boolean>;
  };
  behavioral: {
    services_viewed: IntelligenceField<string[]>;
    products_viewed: IntelligenceField<string[]>;
    checkout_abandoned: IntelligenceField<boolean>;
    app_sessions: IntelligenceField<number>;
  };
  preferences: {
    preferred_product: IntelligenceField<string | null>;
    preferred_size: IntelligenceField<string | null>;
  };
  intelligence: {
    intent_score: IntelligenceField<number>;
    engagement_score: IntelligenceField<number>;
    churn_risk: IntelligenceField<"low" | "medium" | "high">;
  };
};

const now = "2026-09-09T16:00:00.000Z";
const field = <T>(value: T, type: IntelligenceKind, source: string, confidence = 1): IntelligenceField<T> => ({ value, type, source, confidence, updated_at: now });

const profiles: Record<string, Customer360Profile> = {
  "new-customer": { customer_id: "cus_mock_new_001", identity: { language: field("ar", "OBSERVED", "manus_app"), verified_channels: field([], "OBSERVED", "identity_resolution") }, relationship: { lifecycle_stage: field("new", "CALCULATED", "customer_intelligence", 0.99), customer_type: field("B2C", "INFERRED", "first_session", 0.7), repeat_customer: field(false, "CALCULATED", "orders", 1) }, transactional: { active_booking: field(false, "OBSERVED", "bookings"), active_order: field(false, "OBSERVED", "orders"), payment_pending: field(false, "OBSERVED", "payments") }, behavioral: { services_viewed: field(["hub"], "OBSERVED", "manus_app"), products_viewed: field([], "OBSERVED", "manus_app"), checkout_abandoned: field(false, "OBSERVED", "checkout"), app_sessions: field(1, "OBSERVED", "manus_app") }, preferences: { preferred_product: field(null, "INFERRED", "insufficient_signal", 0.1), preferred_size: field(null, "INFERRED", "insufficient_signal", 0.1) }, intelligence: { intent_score: field(0.25, "CALCULATED", "customer_intelligence", 0.82), engagement_score: field(0.2, "CALCULATED", "customer_intelligence", 0.82), churn_risk: field("low", "PREDICTED", "customer_intelligence", 0.55) } },
  "returning-print": { customer_id: "cus_mock_print_002", identity: { language: field("ar", "OBSERVED", "manus_app"), verified_channels: field(["phone"], "OBSERVED", "identity_resolution") }, relationship: { lifecycle_stage: field("returning", "CALCULATED", "orders", 1), customer_type: field("B2C", "OBSERVED", "orders"), repeat_customer: field(true, "CALCULATED", "orders", 1) }, transactional: { active_booking: field(false, "OBSERVED", "bookings"), active_order: field(false, "OBSERVED", "orders"), payment_pending: field(false, "OBSERVED", "payments") }, behavioral: { services_viewed: field(["print"], "OBSERVED", "manus_app"), products_viewed: field(["Photo Prints"], "OBSERVED", "manus_app"), checkout_abandoned: field(false, "OBSERVED", "checkout"), app_sessions: field(4, "OBSERVED", "manus_app") }, preferences: { preferred_product: field("Photo Prints", "INFERRED", "repeat_orders", 0.91), preferred_size: field("A5", "INFERRED", "repeat_orders", 0.84) }, intelligence: { intent_score: field(0.86, "CALCULATED", "customer_intelligence", 0.91), engagement_score: field(0.8, "CALCULATED", "customer_intelligence", 0.9), churn_risk: field("low", "PREDICTED", "customer_intelligence", 0.72) } },
  "active-order": { customer_id: "cus_mock_order_003", identity: { language: field("ar", "OBSERVED", "manus_app"), verified_channels: field(["phone"], "OBSERVED", "identity_resolution") }, relationship: { lifecycle_stage: field("active", "CALCULATED", "orders", 1), customer_type: field("B2C", "OBSERVED", "orders"), repeat_customer: field(false, "CALCULATED", "orders", 0.8) }, transactional: { active_booking: field(false, "OBSERVED", "bookings"), active_order: field(true, "OBSERVED", "orders"), payment_pending: field(false, "OBSERVED", "payments") }, behavioral: { services_viewed: field(["tracking"], "OBSERVED", "manus_app"), products_viewed: field(["Canvas"], "OBSERVED", "manus_app"), checkout_abandoned: field(false, "OBSERVED", "checkout"), app_sessions: field(3, "OBSERVED", "manus_app") }, preferences: { preferred_product: field("Canvas", "INFERRED", "order", 0.72), preferred_size: field("30 × 30 سم", "OBSERVED", "orders") }, intelligence: { intent_score: field(0.78, "CALCULATED", "customer_intelligence", 0.89), engagement_score: field(0.74, "CALCULATED", "customer_intelligence", 0.86), churn_risk: field("low", "PREDICTED", "customer_intelligence", 0.65) } },
  "abandoned-checkout": { customer_id: "cus_mock_abandon_004", identity: { language: field("ar", "OBSERVED", "manus_app"), verified_channels: field([], "OBSERVED", "identity_resolution") }, relationship: { lifecycle_stage: field("consideration", "CALCULATED", "checkout", 0.8), customer_type: field("B2C", "INFERRED", "behavior", 0.6), repeat_customer: field(false, "CALCULATED", "orders", 1) }, transactional: { active_booking: field(false, "OBSERVED", "bookings"), active_order: field(false, "OBSERVED", "orders"), payment_pending: field(true, "OBSERVED", "payments") }, behavioral: { services_viewed: field(["print"], "OBSERVED", "manus_app"), products_viewed: field(["Photo Prints"], "OBSERVED", "manus_app"), checkout_abandoned: field(true, "OBSERVED", "checkout"), app_sessions: field(2, "OBSERVED", "manus_app") }, preferences: { preferred_product: field("Photo Prints", "INFERRED", "checkout", 0.68), preferred_size: field("A5", "INFERRED", "checkout", 0.61) }, intelligence: { intent_score: field(0.9, "CALCULATED", "customer_intelligence", 0.88), engagement_score: field(0.61, "CALCULATED", "customer_intelligence", 0.77), churn_risk: field("medium", "PREDICTED", "customer_intelligence", 0.62) } },
  "b2b-customer": { customer_id: "cus_mock_b2b_005", identity: { language: field("ar", "OBSERVED", "manus_app"), verified_channels: field(["email"], "OBSERVED", "identity_resolution") }, relationship: { lifecycle_stage: field("qualified", "CALCULATED", "corporate_request", 0.8), customer_type: field("B2B", "OBSERVED", "corporate_request"), repeat_customer: field(false, "CALCULATED", "orders", 1) }, transactional: { active_booking: field(false, "OBSERVED", "bookings"), active_order: field(false, "OBSERVED", "orders"), payment_pending: field(false, "OBSERVED", "payments") }, behavioral: { services_viewed: field(["corporate"], "OBSERVED", "manus_app"), products_viewed: field(["Wall Art"], "OBSERVED", "manus_app"), checkout_abandoned: field(false, "OBSERVED", "checkout"), app_sessions: field(2, "OBSERVED", "manus_app") }, preferences: { preferred_product: field("Wall Art", "INFERRED", "corporate_request", 0.7), preferred_size: field(null, "INFERRED", "insufficient_signal", 0.2) }, intelligence: { intent_score: field(0.82, "CALCULATED", "customer_intelligence", 0.84), engagement_score: field(0.67, "CALCULATED", "customer_intelligence", 0.8), churn_risk: field("low", "PREDICTED", "customer_intelligence", 0.58) } },
};

export const getMockCustomerProfile = (scenario = "new-customer"): Customer360Profile => profiles[scenario] ?? profiles["new-customer"];

export const getNextBestAction = (profile: Customer360Profile): NextBestAction => {
  let code: NextBestActionCode = "SHOW_RELEVANT_CONTENT";
  let title = "اكتشف ما يناسبك";
  let body = "ابدأ بخدمة بسيطة، وسنساعدك في الخطوة التالية.";
  if (profile.transactional.payment_pending.value) { code = "COMPLETE_PAYMENT"; title = "أكمل طلبك"; body = "بقيت خطوة واحدة لمتابعة الطلب التجريبي."; }
  else if (profile.transactional.active_order.value) { code = "TRACK_ACTIVE_ORDER"; title = "تابع طلبك النشط"; body = "اعرف آخر حالة للطلب دون البحث الطويل."; }
  else if (profile.relationship.customer_type.value === "B2B") { code = "SHOW_CORPORATE_INTAKE"; title = "أكمل طلب شركتك"; body = "أرسل نطاق المشروع لنجهز المراجعة الأولى."; }
  else if (profile.relationship.repeat_customer.value && profile.preferences.preferred_product.value) { code = "REORDER_PREVIOUS_PRODUCT"; title = "إعادة آخر طلب"; body = `يمكنك إعادة اختيار ${profile.preferences.preferred_product.value} بمقاس ${profile.preferences.preferred_size.value ?? "مناسب"}.`; }
  else if (profile.behavioral.checkout_abandoned.value) { code = "COMPLETE_PAYMENT"; title = "أكمل طلبك"; body = "وجدنا طلبًا تجريبيًا غير مكتمل. يمكنك المتابعة أو البدء من جديد."; }
  else if (profile.relationship.lifecycle_stage.value === "new") { code = "SHOW_RELEVANT_CONTENT"; title = "ابدأ باكتشاف الخدمات"; body = "اختر أقرب احتياج لك، ولا تحتاج معرفة اسم المنتج."; }
  return { code, title, body, reason: field(`اختيار Mock مبني على ${profile.relationship.lifecycle_stage.value}`, "CALCULATED", "next_best_action_mock", 0.76), source: "mock_customer_intelligence", dismissible: true };
};

export const createCustomerEvent = (customer_id: string, event_type: CustomerEventType, metadata: CustomerEvent["metadata"] = {}): CustomerEvent => ({ event_id: `evt_mock_${Date.now()}`, customer_id, event_type, timestamp: new Date().toISOString(), channel: "manus_app", session_id: "ses_mock_current", metadata, source_system: "manus_app" });

export const mockCustomerIntelligenceApi = {
  getProfile: (customerId: string) => getMockCustomerProfile(customerId),
  getNextBestAction: (customerId: string) => getNextBestAction(getMockCustomerProfile(customerId)),
  recordEvent: createCustomerEvent,
};

export const mockScenarioNames = Object.keys(profiles);
