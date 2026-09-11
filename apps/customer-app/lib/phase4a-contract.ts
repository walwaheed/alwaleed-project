export type Phase4AProduct = { id: string; name_ar: string; name_en: string; width_mm: number; height_mm: number; category: string; active: boolean };
export type Phase4AQuote = { success: boolean; quote: { wholesale_sar: number; margin_sar: number; vat_sar: number; total_sar: number }; quoteToken: string; expiresAt: string };
export type Phase4AQuoteRequest = { productId: string; country: string; count: number };

export const phase4aEndpoints = {
  products: "/api/cloudprinter/products",
  quote: "/api/cloudprinter/quote",
} as const;

export function normalizeProduct(input: unknown): Phase4AProduct {
  const value = input as Record<string, unknown>;
  if (typeof value.id !== "string" || typeof value.name_ar !== "string" || typeof value.name_en !== "string" || typeof value.width_mm !== "number" || typeof value.height_mm !== "number" || typeof value.category !== "string" || typeof value.active !== "boolean") {
    throw new Error("PRODUCT_SCHEMA_INVALID");
  }
  return { id: value.id, name_ar: value.name_ar, name_en: value.name_en, width_mm: value.width_mm, height_mm: value.height_mm, category: value.category, active: value.active };
}

export function normalizeQuote(input: unknown): Phase4AQuote {
  const value = input as Record<string, unknown>;
  const quote = value.quote as Record<string, unknown> | undefined;
  if (typeof value.success !== "boolean" || !quote || typeof quote.wholesale_sar !== "number" || typeof quote.margin_sar !== "number" || typeof quote.vat_sar !== "number" || typeof quote.total_sar !== "number" || typeof value.quoteToken !== "string" || typeof value.expiresAt !== "string") {
    throw new Error("QUOTE_SCHEMA_INVALID");
  }
  return { success: value.success, quote: { wholesale_sar: quote.wholesale_sar, margin_sar: quote.margin_sar, vat_sar: quote.vat_sar, total_sar: quote.total_sar }, quoteToken: value.quoteToken, expiresAt: value.expiresAt };
}

export function validateQuoteRequest(input: Phase4AQuoteRequest): Phase4AQuoteRequest {
  if (!input.productId || !input.country || !Number.isInteger(input.count) || input.count < 1 || input.count > 500) throw new Error("QUOTE_REQUEST_INVALID");
  return { productId: input.productId, country: input.country, count: input.count };
}

export function buildPhase4aUrl(baseUrl: string, endpoint: keyof typeof phase4aEndpoints) {
  if (!baseUrl || !/^https?:\/\//.test(baseUrl)) throw new Error("PHASE4A_BACKEND_URL_MISSING");
  return `${baseUrl.replace(/\/$/, "")}${phase4aEndpoints[endpoint]}`;
}

export async function fetchRealProducts(baseUrl: string, fetcher: typeof fetch = fetch): Promise<Phase4AProduct[]> {
  const response = await fetcher(buildPhase4aUrl(baseUrl, "products"), { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`PRODUCTS_HTTP_${response.status}`);
  const payload = await response.json() as { products?: unknown[] };
  if (!Array.isArray(payload.products)) throw new Error("PRODUCTS_RESPONSE_INVALID");
  return payload.products.map(normalizeProduct);
}

export async function fetchRealQuote(baseUrl: string, request: Phase4AQuoteRequest, fetcher: typeof fetch = fetch): Promise<Phase4AQuote> {
  const body = validateQuoteRequest(request);
  const response = await fetcher(buildPhase4aUrl(baseUrl, "quote"), { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!response.ok) throw new Error(`QUOTE_HTTP_${response.status}`);
  return normalizeQuote(await response.json());
}
