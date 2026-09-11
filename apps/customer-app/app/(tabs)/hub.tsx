import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { getMockCustomerProfile, getNextBestAction } from "@/lib/customer-intelligence";

const INK = "#17222B";
const MUTED = "#6D7A83";
const CREAM = "#F7F5F0";
const CARD = "#FFFFFF";
const GOLD = "#C8974B";

const STUDIO_PHONE = "0133444101";

type Service = {
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  mode: "booking" | "order" | "upload" | "passport" | "corporate" | "tracking" | "payment" | "quote" | "support";
};

const services: Service[] = [
  { title: "احجز موعد تصوير", subtitle: "جلسات استوديو وتغطيات", icon: "event", color: "#F5DDD0", mode: "booking" },
  { title: "اطبع صورك", subtitle: "مقاسات ومنتجات فاخرة", icon: "print", color: "#C9D8D0", mode: "order" },
  { title: "ارفع صورتك", subtitle: "فحص أولي لجودة الصورة", icon: "cloud-upload", color: "#DCEAF0", mode: "upload" },
  { title: "صورة جواز / فيزا", subtitle: "مطابقة لاشتراطات السفر", icon: "badge", color: "#E9E1EC", mode: "passport" },
  { title: "صورة شخصية احترافية", subtitle: "حضور مهني متميز", icon: "person", color: "#C9D8D0", mode: "booking" },
  { title: "تصوير الشركات والمنتجات", subtitle: "حلول بصرية للأعمال", icon: "business", color: "#F5DDD0", mode: "corporate" },
  { title: "متابعة طلب", subtitle: "اعرف حالة طلبك فورًا", icon: "local-shipping", color: "#DCEAF0", mode: "tracking" },
  { title: "دفع فاتورة", subtitle: "سداد آمن ومعتمد", icon: "receipt-long", color: "#E9E1EC", mode: "payment" },
  { title: "طلب عرض سعر", subtitle: "للمشاريع والمناسبات", icon: "request-quote", color: "#F5DDD0", mode: "quote" },
  { title: "خدمة العملاء والدعم", subtitle: `هاتف: ${STUDIO_PHONE}`, icon: "support-agent", color: "#C9D8D0", mode: "support" },
];

const labels: Record<Service["mode"], { title: string; body: string; button: string; action?: () => void }> = {
  booking: {
    title: "احجز بخطوات بسيطة",
    body: "اختر الخدمة وموعدك المناسب. فريق الاستوديو يراجع الحجز ويؤكده معك مباشرة.",
    button: "اختيار موعد الحجز",
  },
  order: {
    title: "اطبع صورك بجودة فاخرة",
    body: "استخدم مساعد الصور لاختيار أفضل مقاس لطباعة صورك ثم أضفها إلى السلة بسهولة.",
    button: "فتح مساعد الصور",
  },
  upload: {
    title: "فحص ومعاينة الصورة",
    body: "اختر صورة من جهازك للتحقق من الدقة وملاءمة الأبعاد لأفضل جودة طباعة.",
    button: "اختيار صورة",
  },
  passport: {
    title: "فحص صورة جواز أو تأشيرة",
    body: "تحقق إرشادي من مقاسات وخلفية الصورة لتطابق معايير السفر والوثائق الرسمية.",
    button: "بدء الفحص",
  },
  corporate: {
    title: "تصوير الشركات والمؤسسات",
    body: "نقدم حلولاً تصويرية متكاملة لمنتجاتك ومناسبات شركتك. شاركنا التفاصيل وسنتواصل معك.",
    button: "إرسال تفاصيل المشروع",
  },
  tracking: {
    title: "متابعة حالة الطلب",
    body: "أدخل رقم الطلب أو رقم الجوال للاطلاع على التحديثات الحالية لتجهيز طلبك.",
    button: "بحث عن الطلب",
  },
  payment: {
    title: "سداد الفاتورة",
    body: "سداد آمن لطلبات واستشارات الاستوديو عبر بوابة الدفع الإلكتروني المعتمدة.",
    button: "متابعة السداد",
  },
  quote: {
    title: "طلب عرض سعر مخصص",
    body: "أرسل نطاق مشروعك وسيقوم فريق الاستوديو بإعداد عرض سعر مفصل ومناسب لاحتياجك.",
    button: "إضافة تفاصيل الطلب",
  },
  support: {
    title: "خدمة العملاء والدعم المباشر",
    body: `فريق استوديو الوليد في خدمتكم للإجابة على جميع الاستفسارات وتأكيد المواعيد.\n\n📞 هاتف الاستوديو: ${STUDIO_PHONE}\n📍 استوديو الوليد — القطيف، المنطقة الشرقية\n🚚 شحن وطباعة فاخرة لكافة مناطق المملكة العربية السعودية`,
    button: `الاتصال بالاستوديو (${STUDIO_PHONE})`,
  },
};

export default function HubScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const cardWidth = isDesktop ? "23.5%" : isTablet ? "31.5%" : "48.2%";

  const [selected, setSelected] = useState<Service | null>(null);
  const [input, setInput] = useState("");
  const [complete, setComplete] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(true);
  const nextBestAction = getNextBestAction(getMockCustomerProfile("new-customer"));

  const handleAction = (mode: Service["mode"]) => {
    if (mode === "support") {
      const telUrl = `tel:${STUDIO_PHONE}`;
      if (Platform.OS === "web") {
        window.open(telUrl, "_self");
      } else {
        Linking.openURL(telUrl).catch(() => {});
      }
      return;
    }
    setComplete(true);
  };

  if (selected) {
    const copy = labels[selected.mode];
    return (
      <ScreenContainer maxWidth={1180}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <Pressable
            onPress={() => {
              setSelected(null);
              setComplete(false);
            }}
            style={styles.back}
          >
            <MaterialIcons name="arrow-forward" size={21} color={INK} />
            <Text style={styles.backText}>الخدمات</Text>
          </Pressable>

          <View style={[styles.serviceHero, { backgroundColor: selected.color }]}>
            <View style={styles.serviceIcon}>
              <MaterialIcons name={selected.icon} size={29} color={INK} />
            </View>
            <Text style={styles.pageKicker}>استوديو الوليد · خدمات العملاء</Text>
            <Text style={styles.pageTitle}>{copy.title}</Text>
            <Text style={styles.pageBody}>{copy.body}</Text>
          </View>

          {selected.mode === "tracking" || selected.mode === "corporate" || selected.mode === "quote" ? (
            <View style={styles.form}>
              <Text style={styles.field}>
                {selected.mode === "tracking" ? "رقم الطلب أو الجوال" : "وصف موجز للمشروع أو المناسبة"}
              </Text>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder={selected.mode === "tracking" ? "مثال: ORD-10023 أو 05xxxxxxxx" : "اكتب التفاصيل هنا"}
                placeholderTextColor={MUTED}
                style={styles.input}
              />
            </View>
          ) : (
            <View style={styles.checkCard}>
              <Text style={styles.checkTitle}>خطوات تنفيذ الخدمة</Text>
              <View style={styles.checkRow}>
                <View style={styles.checkDot}><Text style={styles.checkNumber}>1</Text></View>
                <Text style={styles.checkText}>تأكيد التفاصيل مع فريق استوديو الوليد</Text>
              </View>
              <View style={styles.checkRow}>
                <View style={styles.checkDot}><Text style={styles.checkNumber}>2</Text></View>
                <Text style={styles.checkText}>جلسة التصوير أو تدقيق ومعاينة الملفات</Text>
              </View>
              <View style={styles.checkRow}>
                <View style={styles.checkDot}><Text style={styles.checkNumber}>3</Text></View>
                <Text style={styles.checkText}>طباعة فاخرة وتسليم مباشر أو شحن موثوق</Text>
              </View>
            </View>
          )}

          <Pressable onPress={() => handleAction(selected.mode)} style={styles.primary}>
            <Text style={styles.primaryText}>{copy.button}</Text>
            <MaterialIcons name="check" size={20} color={CREAM} />
          </Pressable>

          {complete && (
            <View style={styles.success}>
              <MaterialIcons name="check-circle" size={20} color="#2F805A" />
              <Text style={styles.successText}>
                تم استلام طلبك بنجاح وسيتواصل معك فريق استوديو الوليد عبر الهاتف لتأكيد الموعد والتفاصيل.
              </Text>
            </View>
          )}
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer maxWidth={1180}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>STUDIO ALWALEED</Text>
            <Text style={styles.title}>كيف نقدر نخدمك اليوم؟</Text>
            <Text style={styles.subtitle}>كل احتياجات التصوير والطباعة في مكان واحد.</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>SA</Text>
          </View>
        </View>

        <View style={styles.banner}>
          <Text style={styles.bannerKicker}>مركز خدمات العملاء</Text>
          <Text style={styles.bannerTitle}>من أول استفسار إلى استلام طلبك.</Text>
          <Text style={styles.bannerBody}>تجربة تصوير وطباعة احترافية بخطوات سهلة ومباشرة.</Text>
        </View>

        {showSuggestion && (
          <View style={styles.suggestion}>
            <View style={styles.suggestionIcon}>
              <MaterialIcons name="auto-awesome" size={22} color={GOLD} />
            </View>
            <View style={styles.suggestionCopy}>
              <Text style={styles.suggestionKicker}>اقتراح مخصص لك</Text>
              <Text style={styles.suggestionTitle}>{nextBestAction.title}</Text>
              <Text style={styles.suggestionBody}>{nextBestAction.body}</Text>
            </View>
            <Pressable onPress={() => setShowSuggestion(false)} accessibilityLabel="إخفاء الاقتراح">
              <MaterialIcons name="close" size={18} color={MUTED} />
            </Pressable>
          </View>
        )}

        <View style={styles.grid}>
          {services.map((service) => (
            <Pressable
              key={service.title}
              onPress={() => setSelected(service)}
              style={({ pressed }) => [
                styles.card,
                { width: cardWidth, backgroundColor: service.color },
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.cardIcon}>
                <MaterialIcons name={service.icon} size={22} color={INK} />
              </View>
              <View>
                <Text style={styles.cardTitle}>{service.title}</Text>
                <Text style={styles.cardSubtitle}>{service.subtitle}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.disclaimer}>
          <MaterialIcons name="verified" size={17} color="#2F805A" />
          <Text style={styles.disclaimerText}>استوديو الوليد · خدمة العملاء متوفرة عبر الهاتف: {STUDIO_PHONE}</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1, width: "100%" },
  content: { paddingBottom: 60, width: "100%", direction: "rtl" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingTop: 15, paddingBottom: 18 },
  eyebrow: { color: MUTED, fontSize: 9, letterSpacing: 1.1, fontWeight: "800" },
  title: { color: INK, fontSize: 27, lineHeight: 34, fontWeight: "900", marginTop: 7 },
  subtitle: { color: MUTED, fontSize: 12, marginTop: 5 },
  avatar: { width: 45, height: 45, borderRadius: 15, backgroundColor: INK, alignItems: "center", justifyContent: "center" },
  avatarText: { color: CREAM, fontWeight: "900" },
  banner: { backgroundColor: INK, borderRadius: 22, padding: 20, marginBottom: 17 },
  bannerKicker: { color: "#AEBABC", fontSize: 9, letterSpacing: 1.4, fontWeight: "800" },
  bannerTitle: { color: "#FFF", fontSize: 23, fontWeight: "900", marginTop: 12 },
  bannerBody: { color: "#C6D0D0", fontSize: 12, marginTop: 7 },
  suggestion: { flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: "#FFF8E9", borderRadius: 19, padding: 14, marginBottom: 17, borderWidth: 1, borderColor: "#EBD9AF" },
  suggestionIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: "#F1E0BD", alignItems: "center", justifyContent: "center" },
  suggestionCopy: { flex: 1 },
  suggestionKicker: { color: GOLD, fontSize: 9, fontWeight: "900", letterSpacing: 0.5 },
  suggestionTitle: { color: INK, fontSize: 16, fontWeight: "900", marginTop: 4 },
  suggestionBody: { color: MUTED, fontSize: 11, lineHeight: 17, marginTop: 3 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: { minHeight: 128, borderRadius: 19, padding: 14, justifyContent: "space-between" },
  cardIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: "#FFFFFF99", alignItems: "center", justifyContent: "center" },
  cardTitle: { color: INK, fontSize: 14, fontWeight: "900", marginTop: 11 },
  cardSubtitle: { color: "#5F6B70", fontSize: 10, marginTop: 3 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
  disclaimer: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 19 },
  disclaimerText: { color: MUTED, fontSize: 11, fontWeight: "700" },
  back: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 12, marginBottom: 18 },
  backText: { color: INK, fontWeight: "800", fontSize: 13 },
  serviceHero: { borderRadius: 22, padding: 20, marginBottom: 15, maxWidth: 640, alignSelf: "center", width: "100%" },
  serviceIcon: { width: 53, height: 53, borderRadius: 17, backgroundColor: "#FFFFFF99", alignItems: "center", justifyContent: "center", marginBottom: 18 },
  pageKicker: { color: GOLD, fontSize: 10, fontWeight: "900", letterSpacing: 0.7, marginBottom: 7 },
  pageTitle: { color: INK, fontSize: 28, lineHeight: 35, fontWeight: "900" },
  pageBody: { color: MUTED, fontSize: 13, lineHeight: 22, marginTop: 8 },
  checkCard: { backgroundColor: CARD, borderRadius: 19, padding: 17, borderWidth: 1, borderColor: "#EAE5DC", maxWidth: 640, alignSelf: "center", width: "100%" },
  checkTitle: { color: INK, fontSize: 14, fontWeight: "900", marginBottom: 8 },
  checkRow: { minHeight: 46, flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: 1, borderBottomColor: "#F0ECE5" },
  checkDot: { width: 25, height: 25, borderRadius: 13, backgroundColor: "#F1E0BD", alignItems: "center", justifyContent: "center" },
  checkNumber: { color: GOLD, fontSize: 11, fontWeight: "900" },
  checkText: { color: MUTED, fontSize: 12 },
  form: { backgroundColor: CARD, borderRadius: 19, padding: 16, borderWidth: 1, borderColor: "#EAE5DC", maxWidth: 640, alignSelf: "center", width: "100%" },
  field: { color: INK, fontSize: 12, fontWeight: "800", marginBottom: 8 },
  input: { minHeight: 50, backgroundColor: "#F7F5F0", borderRadius: 13, borderWidth: 1, borderColor: "#E4DED4", paddingHorizontal: 13, color: INK },
  primary: { minHeight: 55, backgroundColor: INK, borderRadius: 17, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 9, marginTop: 16, maxWidth: 440, alignSelf: "center", width: "100%" },
  primaryText: { color: CREAM, fontWeight: "900", fontSize: 14 },
  success: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#E4F2E9", borderRadius: 14, padding: 12, marginTop: 14, maxWidth: 640, alignSelf: "center", width: "100%" },
  successText: { flex: 1, color: "#2F805A", fontSize: 11, lineHeight: 17, fontWeight: "700" },
});
