import { describe, expect, it } from "vitest";

import { getEventNames, getPassportResult, recommendForIntent } from "../lib/prototype-engine";

describe("prototype recommendation engine", () => {
  it("recommends a safe print option for a print intent", () => {
    const recommendation = recommendForIntent("print");
    expect(recommendation.use).toContain("طباعة");
    expect(recommendation.size).toContain("A5");
  });

  it("keeps official journeys explicitly prototype-oriented", () => {
    const recommendation = recommendForIntent("official", "جواز سعودي");
    expect(recommendation.quality).toContain("فحص");
    expect(recommendation.best).toContain("فحص");
  });

  it("returns all three simulated passport states", () => {
    expect(getPassportResult("هوية سعودية")).toBe("PASS");
    expect(getPassportResult("تأشيرة أمريكية")).toBe("UNSUITABLE");
    expect(getPassportResult("جواز سعودي")).toBe("NEEDS ADJUSTMENT");
  });

  it("exposes the planned analytics event contract", () => {
    expect(getEventNames()).toHaveLength(9);
    expect(getEventNames()).toContain("photo_uploaded");
    expect(getEventNames()).toContain("journey_abandoned");
  });
});
