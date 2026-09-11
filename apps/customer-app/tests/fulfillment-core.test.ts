import { describe, expect, it } from "vitest";
import { cloudprinterAdapterContract, routeFulfillment, type FulfillmentQuote } from "../lib/fulfillment-core";

describe("provider-agnostic fulfillment layer", () => {
  const quotes: FulfillmentQuote[] = [
    { provider_id: "cloudprinter", production_cost: 40, shipping_cost: 20, estimated_delivery_days: 5, margin: 30, sla_hours: 120, availability: "available", fallback_rank: 2 },
    { provider_id: "saudi_local_lab", production_cost: 45, shipping_cost: 12, estimated_delivery_days: 3, margin: 38, sla_hours: 72, availability: "available", fallback_rank: 1 },
  ];

  it("routes by policy without hardcoding a provider", () => {
    expect(routeFulfillment(quotes, { destination_country: "SA", require_available: true, fallback_enabled: true })?.provider_id).toBe("saudi_local_lab");
    expect(routeFulfillment(quotes, { destination_country: "SA", require_available: true, fallback_enabled: true, excluded_providers: ["saudi_local_lab"] })?.provider_id).toBe("cloudprinter");
  });

  it("keeps Cloudprinter behind an adapter boundary", () => {
    expect(cloudprinterAdapterContract.provider_id).toBe("cloudprinter");
    expect(cloudprinterAdapterContract.mock_only).toBe(true);
    expect(cloudprinterAdapterContract.adapter_boundary).toContain("Only the Fulfillment Adapter");
  });
});
