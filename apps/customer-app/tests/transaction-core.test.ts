import { describe, expect, it } from "vitest";
import { mockPaymentStates, runMockPhotoPrintTransaction } from "../lib/transaction-core";

describe("generic transaction core", () => {
  it("supports the four payment outcomes without live credentials", () => {
    expect(mockPaymentStates).toEqual(["VERIFIED", "FAILED", "CANCELLED", "EXPIRED"]);
    expect(runMockPhotoPrintTransaction("VERIFIED").verification.verified).toBe(true);
    expect(runMockPhotoPrintTransaction("FAILED").verification.failure_reason).toBe("DECLINED");
    expect(runMockPhotoPrintTransaction("CANCELLED").order.status).toBe("CANCELLED");
    expect(runMockPhotoPrintTransaction("EXPIRED").payment.status).toBe("EXPIRED");
  });

  it("keeps payment verification as the source of paid state", () => {
    const failed = runMockPhotoPrintTransaction("FAILED");
    expect(failed.order.payment_status).not.toBe("VERIFIED");
    expect(failed.order.status).not.toBe("PAID");
    expect(failed.order.source_of_truth).toBe("existing_supabase_orders");
  });

  it("returns a reusable reference transaction with an order number", () => {
    const result = runMockPhotoPrintTransaction("VERIFIED");
    expect(result.customer.identity_source).toBe("guest");
    expect(result.upload.status).toBe("VALIDATED");
    expect(result.pricing.total).toBe(41);
    expect(result.order.order_number).toContain("MOCK-PRINT");
    expect(result.tracking.order_number).toBe(result.order.order_number);
  });
});
