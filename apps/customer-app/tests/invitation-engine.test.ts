import { describe, expect, it } from "vitest";
import { createInvitationEvent, createMockInvitation, getInvitationPreviewText, getMockExportResult, invitationTemplates } from "../lib/invitation-engine";

describe("digital invitation engine mock", () => {
  it("ships three approved Arabic-first templates", () => {
    expect(invitationTemplates).toHaveLength(3);
    expect(invitationTemplates.map((template) => template.style)).toEqual(["saudi-luxury", "white-gold", "contemporary-floral"]);
  });

  it("creates a structured invitation preview without uncontrolled design", () => {
    const draft = createMockInvitation(invitationTemplates[0].template_id);
    expect(getInvitationPreviewText(draft)).toContain("محمد");
    expect(draft.rsvp).toBe(true);
    expect(draft.maps_url).toContain("mock");
  });

  it("keeps export and events explicitly mock", () => {
    const result = getMockExportResult(invitationTemplates[1]);
    expect(result.status).toBe("MOCK_READY");
    expect(result.message).toContain("لا يتم إنشاء ملف نهائي");
    expect(createInvitationEvent("TEMPLATE_SELECTED", invitationTemplates[1].template_id).source_system).toBe("manus_invitation_engine");
  });
});
