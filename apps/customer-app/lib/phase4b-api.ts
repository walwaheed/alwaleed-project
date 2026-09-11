import { normalizeProduct, normalizeQuote, type Phase4AProduct, type Phase4AQuote, type Phase4AQuoteRequest, validateQuoteRequest } from "./phase4a-contract";

export type Phase4BUpload = { file_id: string; filename: string; mime_type: string; size_bytes: number; width?: number; height?: number; purpose: "print"; status: "PENDING" | "VALIDATED" | "REJECTED" };
export type Phase4BOrder = { order_id: string; order_number: string; status: "PENDING_PAYMENT" | "PROCESSING" | "CANCELLED"; payment_status: "UNPAID" | "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "EXPIRED"; amount: number; currency: "SAR" };
export type Phase4BStatus = { order: Phase4BOrder; payment_verification: { verified: boolean; amount_match: boolean; currency_match: boolean }; fulfillment: unknown | null; tracking: unknown };

export type BookingRequest = {
  service: string;
  package?: string;
  bookingDate: string;
  timeSlot?: string;
  customerName: string;
  mobile: string;
  email?: string;
  notes?: string;
};

export type BookingResponse = {
  success: boolean;
  bookingReference: string;
  message?: string;
};

export type UnifiedStatusLookup = {
  success: boolean;
  type: "booking" | "order";
  reference: string;
  status: string;
  statusAr: string;
  details?: Record<string, unknown>;
};

function baseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_TRANSACTION_API_BASE_URL || process.env.EXPO_PUBLIC_API_BASE_URL || "";
  if (envUrl && /^https?:\/\//.test(envUrl)) {
    return envUrl.replace(/\/$/, "");
  }
  if (typeof window !== "undefined" && window.location && window.location.origin) {
    return "";
  }
  return "https://api.alwaleed.pro";
}

async function request(path: string, init?: RequestInit, fetcher: typeof fetch = fetch): Promise<Response> {
  const url = `${baseUrl()}${path}`;
  const response = await fetcher(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    throw new Error(`TRANSACTION_API_HTTP_${response.status}`);
  }
  return response;
}

export async function getProducts(fetcher: typeof fetch = fetch): Promise<Phase4AProduct[]> {
  const payload = (await (await request("/api/cloudprinter/products", undefined, fetcher)).json()) as { products?: unknown[] };
  if (!Array.isArray(payload.products)) throw new Error("PRODUCTS_RESPONSE_INVALID");
  return payload.products.map(normalizeProduct);
}

export async function getQuote(input: Phase4AQuoteRequest, fetcher: typeof fetch = fetch): Promise<Phase4AQuote> {
  const body = validateQuoteRequest(input);
  return normalizeQuote(
    await (
      await request(
        "/api/cloudprinter/quote",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
        fetcher
      )
    ).json()
  );
}

export async function uploadPhoto(file: { uri: string; name: string; type?: string; size?: number }, fetcher: typeof fetch = fetch): Promise<Phase4BUpload> {
  const form = new FormData();
  form.append("file", { uri: file.uri, name: file.name, type: file.type ?? "image/jpeg" } as unknown as Blob);
  form.append("purpose", "print");
  const payload = (await (await request("/api/upload", { method: "POST", body: form }, fetcher)).json()) as { upload?: Phase4BUpload; file?: { url: string; id: string } };
  if (payload.upload) return payload.upload;
  if (payload.file) {
    return {
      file_id: payload.file.id || "upload-" + Date.now(),
      filename: file.name,
      mime_type: file.type ?? "image/jpeg",
      size_bytes: file.size ?? 0,
      purpose: "print",
      status: "VALIDATED",
      url: payload.file.url,
    };
  }
  throw new Error("UPLOAD_RESPONSE_INVALID");
}

export async function createPrintOrder(
  input: { customer_id: string; quote_id: string; product_id: string; quantity: number; upload_ids: string[]; idempotency_key: string; customer?: { email?: string; name?: string; phone?: string } },
  fetcher: typeof fetch = fetch
): Promise<Phase4BOrder> {
  const payload = (await (
    await request(
      "/api/print-orders/create",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": input.idempotency_key },
        body: JSON.stringify(input),
      },
      fetcher
    )
  ).json()) as { order?: Phase4BOrder };
  if (!payload.order) throw new Error("ORDER_RESPONSE_INVALID");
  return payload.order;
}

export async function getPrintOrderStatus(id: string, fetcher: typeof fetch = fetch): Promise<Phase4BStatus> {
  if (!id) throw new Error("ORDER_ID_MISSING");
  return (await (await request(`/api/print-orders/status/${encodeURIComponent(id)}`, undefined, fetcher)).json()) as Phase4BStatus;
}

export async function createBooking(input: BookingRequest, fetcher: typeof fetch = fetch): Promise<BookingResponse> {
  const response = await request(
    "/api/bookings/create",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    fetcher
  );
  return (await response.json()) as BookingResponse;
}

export async function lookupStatus(query: string, fetcher: typeof fetch = fetch): Promise<UnifiedStatusLookup> {
  if (!query) throw new Error("QUERY_MISSING");
  const response = await request(`/api/status/lookup/${encodeURIComponent(query.trim())}`, undefined, fetcher);
  return (await response.json()) as UnifiedStatusLookup;
}

export async function trackAnalyticsEvent(
  event: { event_name: string; properties?: Record<string, unknown> },
  fetcher: typeof fetch = fetch
): Promise<void> {
  try {
    await request(
      "/api/analytics/events",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...event,
          timestamp: new Date().toISOString(),
          source: "manus-customer-app",
        }),
      },
      fetcher
    );
  } catch {
    // Fail-open for analytics
  }
}
