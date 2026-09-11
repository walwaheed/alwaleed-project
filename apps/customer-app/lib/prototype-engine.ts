export type PrototypeRecommendation = {
  use: string;
  quality: string;
  size: string;
  best: string;
};

const recommendations: Record<string, PrototypeRecommendation> = {
  enhance: { use: "تحسين جودة الصورة", quality: "متوسطة وتتحسن", size: "A4 — 21 × 30 سم", best: "تنظيف وتحسين قبل الطباعة" },
  print: { use: "طباعة منزلية أو هدية", quality: "جيدة", size: "A5 — 15 × 21 سم", best: "طباعة صورة لامعة" },
  old: { use: "تكبير ذكرى قديمة", quality: "متوسطة", size: "A4 — 21 × 30 سم", best: "ترميم وتكبير ذكي" },
  background: { use: "صورة بخلفية أنظف", quality: "جيدة", size: "A5 — 15 × 21 سم", best: "تنظيف الخلفية" },
  portrait: { use: "صورة شخصية احترافية", quality: "جيدة", size: "4 × 6 سم أو ملف رقمي", best: "تحسين الإضاءة والقص" },
  linkedin: { use: "ملف LinkedIn مهني", quality: "جيدة", size: "مربع 1:1", best: "قص احترافي وخلفية هادئة" },
  canvas: { use: "لوحة جدارية", quality: "جيدة", size: "Square — 30 × 30 سم", best: "Canvas مطفي" },
  size: { use: "اختيار مقاس طباعة", quality: "جيدة", size: "A5 — الخيار الآمن", best: "ابدأ بـ A5" },
};

export function recommendForIntent(intentId: string | undefined, passportType = "جواز سعودي"): PrototypeRecommendation {
  if (intentId === "official") {
    return { use: passportType, quality: "تحتاج فحصًا", size: "حسب الجهة", best: "فحص متطلبات الصورة" };
  }
  return recommendations[intentId ?? "print"] ?? recommendations.print;
}

export type PassportResult = "PASS" | "NEEDS ADJUSTMENT" | "UNSUITABLE";

export function getPassportResult(passportType: string): PassportResult {
  if (passportType === "هوية سعودية") return "PASS";
  if (passportType === "تأشيرة أمريكية") return "UNSUITABLE";
  return "NEEDS ADJUSTMENT";
}

export function getEventNames() {
  return [
    "app_started",
    "photo_uploaded",
    "intent_selected",
    "analysis_completed",
    "recommendation_viewed",
    "product_selected",
    "price_viewed",
    "checkout_started",
    "journey_abandoned",
  ] as const;
}
