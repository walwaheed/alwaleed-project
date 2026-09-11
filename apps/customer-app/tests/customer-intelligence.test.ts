import { describe, expect, it } from "vitest";
import { createCustomerEvent, getMockCustomerProfile, getNextBestAction, mockScenarioNames } from "../lib/customer-intelligence";

describe("shared customer intelligence mock", () => {
  it("provides five approved demonstration profiles", () => {
    expect(mockScenarioNames).toHaveLength(5);
    expect(getMockCustomerProfile("active-order").transactional.active_order.type).toBe("OBSERVED");
  });

  it("keeps predicted preferences separate from observed facts", () => {
    const profile = getMockCustomerProfile("returning-print");
    expect(profile.preferences.preferred_product.type).toBe("INFERRED");
    expect(profile.preferences.preferred_product.confidence).toBeLessThan(1);
  });

  it("returns safe next actions for the five scenarios", () => {
    expect(getNextBestAction(getMockCustomerProfile("new-customer")).code).toBe("SHOW_RELEVANT_CONTENT");
    expect(getNextBestAction(getMockCustomerProfile("active-order")).code).toBe("TRACK_ACTIVE_ORDER");
    expect(getNextBestAction(getMockCustomerProfile("b2b-customer")).code).toBe("SHOW_CORPORATE_INTAKE");
    expect(getNextBestAction(getMockCustomerProfile("abandoned-checkout")).code).toBe("COMPLETE_PAYMENT");
    expect(getNextBestAction(getMockCustomerProfile("returning-print")).code).toBe("REORDER_PREVIOUS_PRODUCT");
  });

  it("creates a channel-aware event contract without sensitive data", () => {
    const event = createCustomerEvent("cus_mock_new_001", "SERVICE_VIEWED", { service: "print" });
    expect(event.channel).toBe("manus_app");
    expect(event.source_system).toBe("manus_app");
    expect(event.metadata.service).toBe("print");
  });
});
