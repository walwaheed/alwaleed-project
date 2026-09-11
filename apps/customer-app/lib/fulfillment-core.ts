export type FulfillmentProviderId = "cloudprinter" | "gelato" | "printful" | "printify" | "saudi_local_lab" | "in_house";
export type FulfillmentStatus = "NOT_SUBMITTED" | "ROUTING" | "SUBMITTED" | "IN_PRODUCTION" | "READY_TO_SHIP" | "SHIPPED" | "IN_TRANSIT" | "DELIVERED" | "ON_HOLD" | "FAILED" | "CANCELLED";

export type FulfillmentOrder = { order_id: string; order_number: string; product_type: string; product_id: string; quantity: number; destination_country: string; destination_city?: string; production_location?: string; quality_tier?: "standard" | "premium" | "fine_art"; margin_target?: number; sla_hours?: number };
export type ProviderCapabilities = { provider_id: FulfillmentProviderId; supported_product_types: string[]; supported_countries: string[]; quality_tiers: string[]; available: boolean };
export type FulfillmentQuote = { provider_id: FulfillmentProviderId; production_cost: number; shipping_cost: number; estimated_delivery_days: number; margin: number; sla_hours: number; availability: "available" | "unavailable"; fallback_rank: number };
export type FulfillmentJob = { fulfillment_id: string; order_id: string; provider_id: FulfillmentProviderId; status: FulfillmentStatus; external_reference?: string; tracking_reference?: string; created_at: string };

export interface FulfillmentProviderAdapter {
  readonly providerId: FulfillmentProviderId;
  getCapabilities(): ProviderCapabilities;
  quote(order: FulfillmentOrder): Promise<FulfillmentQuote>;
  submit(order: FulfillmentOrder): Promise<FulfillmentJob>;
  getStatus(job: FulfillmentJob): Promise<FulfillmentJob>;
  cancel(job: FulfillmentJob): Promise<FulfillmentJob>;
}

export type FulfillmentRoutingPolicy = { preferred_quality_tier?: "standard" | "premium" | "fine_art"; max_delivery_days?: number; destination_country: string; require_available: boolean; fallback_enabled: boolean; excluded_providers?: FulfillmentProviderId[] };

export const routeFulfillment = (quotes: FulfillmentQuote[], policy: FulfillmentRoutingPolicy) => quotes.filter((quote) => !policy.excluded_providers?.includes(quote.provider_id)).filter((quote) => !policy.require_available || quote.availability === "available").filter((quote) => !policy.max_delivery_days || quote.estimated_delivery_days <= policy.max_delivery_days).sort((a, b) => a.fallback_rank - b.fallback_rank || b.margin - a.margin)[0] ?? null;

export const cloudprinterAdapterContract = {
  provider_id: "cloudprinter" as const,
  adapter_boundary: "Only the Fulfillment Adapter knows Cloudprinter endpoints, payloads, credentials, and external references.",
  required_mapping: ["product_id", "quantity", "file_ids", "shipping_address", "destination_country"],
  returned_mapping: ["external_reference", "production_status", "tracking_reference", "estimated_delivery"],
  failure_mapping: ["validation_failed", "provider_unavailable", "production_failed", "shipping_failed"],
  mock_only: true,
};
