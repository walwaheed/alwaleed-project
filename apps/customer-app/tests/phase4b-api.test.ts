import { describe, expect, it } from "vitest";
import { getProducts, getQuote } from "../lib/phase4b-api";

describe("Phase 4B API binding", () => {
  it("does not call a guessed backend when the sandbox URL is absent", async () => {
    delete process.env.EXPO_PUBLIC_TRANSACTION_API_BASE_URL;
    await expect(getProducts()).rejects.toThrow("TRANSACTION_API_BASE_URL_MISSING");
  });
  it("normalizes approved product and quote responses when a sandbox base URL exists", async () => {
    process.env.EXPO_PUBLIC_TRANSACTION_API_BASE_URL = "https://sandbox.example";
    const fetcher = async (url: RequestInfo | URL, init?: RequestInit) => {
      const value = String(url);
      if (value.endsWith("/products")) return new Response(JSON.stringify({ products: [{ id: "a5", name_ar: "طباعة A5", name_en: "A5 Print", width_mm: 148, height_mm: 210, category: "photo_print", active: true }] }), { status: 200 });
      expect(init?.method).toBe("POST");
      return new Response(JSON.stringify({ success: true, quote: { wholesale_sar: 10, margin_sar: 5, vat_sar: 2.25, total_sar: 17.25 }, quoteToken: "server-token", expiresAt: "2026-09-10T01:00:00.000Z" }), { status: 200 });
    };
    await expect(getProducts(fetcher)).resolves.toHaveLength(1);
    await expect(getQuote({ productId: "a5", country: "SA", count: 1 }, fetcher)).resolves.toMatchObject({ quote: { total_sar: 17.25 }, quoteToken: "server-token" });
  });
});
