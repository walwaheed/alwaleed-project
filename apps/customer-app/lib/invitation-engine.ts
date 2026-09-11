export type InvitationOccasion = "wedding" | "engagement" | "henna" | "graduation" | "new-baby" | "corporate" | "private-event";
export type InvitationStyle = "saudi-luxury" | "white-gold" | "contemporary-floral";

export type InvitationTemplate = {
  template_id: string;
  occasion_type: InvitationOccasion[];
  style: InvitationStyle;
  label: string;
  aspect_ratio: "9:16";
  background: string;
  font_rules: string;
  text_zones: string[];
  image_zone: boolean;
  logo_zone: boolean;
  qr_zone: "maps" | "rsvp" | "guest" | "none";
  supported_languages: ("ar" | "en")[];
  export_formats: ("story" | "whatsapp" | "jpg" | "png" | "pdf")[];
};

export type InvitationDraft = {
  occasion_type: InvitationOccasion;
  template_id: string;
  occasion_title: string;
  family_name: string;
  groom_name: string;
  bride_name?: string;
  host_name: string;
  guest_name?: string;
  event_date_hijri: string;
  event_date_gregorian: string;
  event_time: string;
  venue_name: string;
  city: string;
  maps_url?: string;
  contact_number?: string;
  rsvp: boolean;
  special_message?: string;
};

export type InvitationEventType = "INVITATION_STARTED" | "TEMPLATE_VIEWED" | "TEMPLATE_SELECTED" | "INVITATION_PREVIEWED" | "GUEST_LIST_UPLOADED" | "ORDER_STARTED" | "ORDER_COMPLETED" | "RSVP_RECEIVED";

export const invitationTemplates: InvitationTemplate[] = [
  { template_id: "tmpl-luxury-black-gold", occasion_type: ["wedding", "engagement", "henna"], style: "saudi-luxury", label: "فاخر أسود وذهبي", aspect_ratio: "9:16", background: "أسود حريري مع تفاصيل ذهبية", font_rules: "خط عربي احتفالي للعناوين وخط واضح للنص", text_zones: ["title", "names", "date", "venue"], image_zone: false, logo_zone: false, qr_zone: "maps", supported_languages: ["ar"], export_formats: ["story", "whatsapp", "jpg", "png", "pdf"] },
  { template_id: "tmpl-white-gold-minimal", occasion_type: ["wedding", "engagement", "graduation", "new-baby"], style: "white-gold", label: "أبيض وذهبي بسيط", aspect_ratio: "9:16", background: "أبيض دافئ بإطار ذهبي", font_rules: "مساحات بيضاء واسعة وتسلسل بصري هادئ", text_zones: ["title", "names", "date", "venue", "message"], image_zone: true, logo_zone: false, qr_zone: "rsvp", supported_languages: ["ar", "en"], export_formats: ["story", "whatsapp", "jpg", "png", "pdf"] },
  { template_id: "tmpl-contemporary-floral", occasion_type: ["wedding", "engagement", "private-event", "corporate"], style: "contemporary-floral", label: "زهور معاصرة", aspect_ratio: "9:16", background: "درجات عاجية مع زهور ناعمة", font_rules: "عنوان بارز ونص قصير قابل للقراءة على الهاتف", text_zones: ["title", "names", "date", "venue", "message"], image_zone: true, logo_zone: true, qr_zone: "guest", supported_languages: ["ar", "en"], export_formats: ["story", "whatsapp", "jpg", "png"] },
];

export const invitationOccasions: { value: InvitationOccasion; label: string }[] = [
  { value: "wedding", label: "زواج" }, { value: "engagement", label: "خطوبة" }, { value: "henna", label: "حنة" }, { value: "graduation", label: "تخرج" }, { value: "new-baby", label: "مولود جديد" }, { value: "corporate", label: "دعوة شركة" },
];

export const createMockInvitation = (template_id: string): InvitationDraft => ({ occasion_type: "wedding", template_id, occasion_title: "أفراح ومسرات آل الوليد", family_name: "آل الوليد", groom_name: "محمد", bride_name: "نورة", host_name: "عائلة الوليد", event_date_hijri: "15 شعبان 1448هـ", event_date_gregorian: "3 فبراير 2027", event_time: "9:00 مساءً", venue_name: "قاعة النخبة", city: "الرياض", maps_url: "https://maps.google.com/?q=mock", guest_name: "ضيفنا العزيز", rsvp: true, special_message: "يسرنا دعوتكم لمشاركتنا فرحتنا" });

export const getInvitationPreviewText = (draft: InvitationDraft) => `${draft.occasion_title}\nيتشرف ${draft.host_name} بدعوتكم\n${draft.groom_name} و ${draft.bride_name ?? "أحبابنا"}\n${draft.event_date_gregorian} · ${draft.event_time}\n${draft.venue_name} · ${draft.city}`;

export const getMockExportResult = (template: InvitationTemplate) => ({ status: "MOCK_READY" as const, formats: template.export_formats, message: "تم تجهيز معاينة التصدير فقط. لا يتم إنشاء ملف نهائي في V1." });

export const createInvitationEvent = (event_type: InvitationEventType, template_id: string) => ({ event_id: `invite_evt_mock_${Date.now()}`, event_type, template_id, source_system: "manus_invitation_engine", timestamp: new Date().toISOString() });
