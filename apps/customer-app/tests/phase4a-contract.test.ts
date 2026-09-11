import { describe, expect, it } from "vitest";
import { buildPhase4aUrl, normalizeProduct, normalizeQuote, validateQuoteRequest } from "../lib/phase4a-contract";

describe("Phase 4A products + quote contract", () => {
  it("normalizes the approved product schema with Arabic and English names", () => {
    const product = normalizeProduct({ id: "a5", name_ar: "طباعة A5", name_en: "A5 Print", width_mm: 148, height_mm: 210, category: "photo_print", active: true });
    expect(product.name_ar).toBe("طباعة A5");
    expect(product.name_en).toBe("A5 Print");
  });

  it("normalizes a server-authoritative quote and preserves the signed token", () => {
    const quote = normalizeQuote({ success: true, quote: { wholesale_sar: 10, margin_sar: 5, vat_sar: 2.25, total_sar: 17.25 }, quoteToken: "hmac.mock.token", expiresAt: "2026-09-09T19:00:00.000Z" });
    expect(quote.quote.total_sar).toBe(17.25);
    expect(quote.quoteToken).toBe("hmac.mock.token");
  });

  it("rejects invalid quantity and never accepts client price fields", () => {
    expect(() => validateQuoteRequest({ productId: "a5", country: "SA", count: 0 })).toThrow("QUOTE_REQUEST_INVALID");
    const request = validateQuoteRequest({ productId: "a5", country: "SA", count: 2, ...( { total_sar: 1 } as never) });
    expect(request).not.toHaveProperty("total_sar");
  });

  it("requires an explicitly configured backend URL", () => {
    expect(buildPhase4aUrl("https://backend.example", "products")).toBe("https://backend.example/api/cloudprinter/products");
    expect(() => buildPhase4aUrl("", "quote")).toThrow("PHASE4A_BACKEND_URL_MISSING");
  });
});
