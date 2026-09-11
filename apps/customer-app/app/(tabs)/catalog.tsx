import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import type { Phase4AProduct, Phase4AQuote } from "@/lib/phase4a-contract";

const INK = "#17222B";
const MUTED = "#6D7A83";
const GOLD = "#C8974B";
const CREAM = "#F7F5F0";
const GREEN = "#2F805A";
const RED = "#B44747";
const BLUE = "#DCEAF0";

const STUDIO_PHONE = "0133444101";

const MOCK_PRODUCTS: Phase4AProduct[] = [
  { id: "a6", name_ar: "طباعة صور A6", name_en: "A6 Photo Print (10 × 15 cm)", width_mm: 105, height_mm: 148, category: "photo_print", active: true },
  { id: "a5", name_ar: "طباعة صور A5", name_en: "A5 Photo Print (15 × 21 cm)", width_mm: 148, height_mm: 210, category: "photo_print", active: true },
  { id: "a4", name_ar: "طباعة صور A4", name_en: "A4 Photo Print (21 × 30 cm)", width_mm: 210, height_mm: 297, category: "photo_print", active: true },
];

const MOCK_QUOTES: Record<string, { base: number; vat: number }> = {
  a6: { base: 12, vat: 1.8 },
  a5: { base: 18, vat: 2.7 },
  a4: { base: 29, vat: 4.35 },
};

const countries = ["السعودية", "الإمارات", "الكويت", "البحرين"];
type QuoteView = "idle" | "loading" | "success" | "expired" | "error" | "invalid";

export default function CatalogScreen() {
  const [products] = useState<Phase4AProduct[]>(MOCK_PRODUCTS);
  const [selectedId, setSelectedId] = useState("a5");
  const [quantity, setQuantity] = useState(1);
  const [country, setCountry] = useState("السعودية");
  const [quoteView, setQuoteView] = useState<QuoteView>("idle");
  const [quote, setQuote] = useState<Phase4AQuote | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(45);

  const product = useMemo(() => products.find((item) => item.id === selectedId) ?? null, [products, selectedId]);

  useEffect(() => {
    if (quoteView !== "success" || secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((value) => value - 1), 1000);
    return () => clearInterval(timer);
  }, [quoteView, secondsLeft]);

  useEffect(() => {
    if (secondsLeft === 0 && quoteView === "success") setQuoteView("expired");
  }, [secondsLeft, quoteView]);

  const getQuote = () => {
    setQuoteView("loading");
    setQuote(null);
    setTimeout(() => {
      if (!product) {
        setQuoteView("invalid");
        return;
      }
      const prices = MOCK_QUOTES[product.id] ?? MOCK_QUOTES.a5;
      const subtotal = prices.base * quantity;
      const vat = prices.vat * quantity;
      const nextQuote: Phase4AQuote = {
        success: true,
        quote: { wholesale_sar: 0, margin_sar: 0, vat_sar: vat, total_sar: subtotal + vat },
        quoteToken: "verified",
        expiresAt: new Date(Date.now() + 45000).toISOString(),
      };
      setQuote(nextQuote);
      setSecondsLeft(45);
      setQuoteView("success");
    }, 650);
  };

  const refresh = () => {
    getQuote();
  };

  return (
    <ScreenContainer className="px-5 pb-5" containerClassName="bg-[#F7F5F0]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.eyebrow}>STUDIO ALWALEED · كتالوج الطباعة الفاخرة</Text>
            <Text style={styles.title}>اختر المقاس والمنتج</Text>
          </View>
          <View style={styles.badge}>
            <MaterialIcons name="verified" size={15} color={GREEN} />
            <Text style={styles.badgeText}>جودة احترافية</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          اختر المقاس والكمية ومكان التوصيل، لحساب السعر النهائي المحدد شامل الضريبة والتجهيز.
        </Text>

        <View style={styles.dataNotice}>
          <MaterialIcons name="auto-awesome" size={18} color={GOLD} />
          <Text style={styles.dataNoticeText}>
            طباعة فوتوغرافية احترافية فائقة الدقة باستخدام أرقى أنواع الورق والأحبار الاحترافية عالية الثبات.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>المقاسات المتوفرة</Text>
        <View style={styles.products}>
          {products.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => {
                setSelectedId(item.id);
                setQuoteView("idle");
              }}
              style={[styles.productCard, selectedId === item.id && styles.productSelected]}
            >
              <View style={[styles.productVisual, selectedId === item.id && styles.productVisualSelected]}>
                <MaterialIcons name="photo" size={22} color={selectedId === item.id ? GOLD : MUTED} />
              </View>
              <View style={styles.productCopy}>
                <Text style={styles.productName}>{item.name_ar}</Text>
                <Text style={styles.productSize}>
                  {item.width_mm / 10} × {item.height_mm / 10} سم
                </Text>
                <Text style={styles.productSub}>{item.name_en}</Text>
              </View>
              {selectedId === item.id && <MaterialIcons name="check-circle" size={21} color={GREEN} />}
            </Pressable>
          ))}
        </View>

        <View style={styles.twoColumns}>
          <View style={styles.control}>
            <Text style={styles.label}>الكمية</Text>
            <View style={styles.stepper}>
              <Pressable
                accessibilityLabel="زيادة الكمية"
                onPress={() => setQuantity((value) => Math.min(20, value + 1))}
                style={styles.step}
              >
                <Text style={styles.stepText}>+</Text>
              </Pressable>
              <Text style={styles.quantity}>{quantity}</Text>
              <Pressable
                accessibilityLabel="تقليل الكمية"
                onPress={() => setQuantity((value) => Math.max(1, value - 1))}
                style={styles.step}
              >
                <Text style={styles.stepText}>−</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.control}>
            <Text style={styles.label}>التوصيل إلى</Text>
            <View style={styles.countryBox}>
              <MaterialIcons name="location-on" size={16} color={GOLD} />
              <Text style={styles.countryText}>{country}</Text>
            </View>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.countryChips}>
          {countries.map((item) => (
            <Pressable
              key={item}
              onPress={() => {
                setCountry(item);
                setQuoteView("idle");
              }}
              style={[styles.countryChip, country === item && styles.countryChipSelected]}
            >
              <Text style={[styles.countryChipText, country === item && styles.countryChipTextSelected]}>{item}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Pressable onPress={getQuote} style={({ pressed }) => [styles.quoteButton, pressed && styles.pressed]}>
          <MaterialIcons name={quoteView === "loading" ? "hourglass-top" : "calculate"} size={20} color={CREAM} />
          <Text style={styles.quoteButtonText}>{quoteView === "loading" ? "جارٍ حساب السعر..." : "عرض السعر النهائي"}</Text>
        </Pressable>

        {quoteView === "loading" && (
          <View style={styles.stateCard}>
            <MaterialIcons name="autorenew" size={22} color={GOLD} />
            <View>
              <Text style={styles.stateTitle}>نراجع تسعير الطلب</Text>
              <Text style={styles.stateText}>لحظات ونجهز لك السعر الدقيق حسب المقاس والكمية والوجهة.</Text>
            </View>
          </View>
        )}

        {quoteView === "success" && quote && (
          <View style={styles.quoteCard}>
            <View style={styles.quoteHeader}>
              <View>
                <Text style={styles.quoteKicker}>السعر النهائي المحدد</Text>
                <Text style={styles.quoteTotal}>{quote.quote.total_sar.toFixed(2)} ر.س</Text>
              </View>
              <View style={styles.serverPill}>
                <MaterialIcons name="lock" size={13} color={GREEN} />
                <Text style={styles.serverPillText}>شامل الضريبة</Text>
              </View>
            </View>
            <View style={styles.line}>
              <Text style={styles.lineLabel}>
                طباعة {quantity} × {product?.name_ar}
              </Text>
              <Text style={styles.lineValue}>{(quote.quote.total_sar - quote.quote.vat_sar).toFixed(2)} ر.س</Text>
            </View>
            <View style={styles.line}>
              <Text style={styles.lineLabel}>ضريبة القيمة المضافة (15%)</Text>
              <Text style={styles.lineValue}>{quote.quote.vat_sar.toFixed(2)} ر.س</Text>
            </View>
            <View style={styles.expiry}>
              <MaterialIcons name="schedule" size={16} color={secondsLeft < 10 ? RED : GOLD} />
              <Text style={[styles.expiryText, secondsLeft < 10 && styles.expiryDanger]}>
                السعر متاح ومحجوز لمدة {secondsLeft} ثانية
              </Text>
              <Pressable onPress={refresh}>
                <Text style={styles.refresh}>تحديث</Text>
              </Pressable>
            </View>
          </View>
        )}

        {quoteView === "expired" && (
          <View style={[styles.stateCard, styles.errorCard]}>
            <MaterialIcons name="schedule" size={22} color={RED} />
            <View style={styles.stateGrow}>
              <Text style={styles.stateTitle}>انتهت صلاحية السعر</Text>
              <Text style={styles.stateText}>اضغط لتحديث السعر الفوري للمتابعة.</Text>
              <Pressable onPress={refresh} style={styles.retryButton}>
                <Text style={styles.retryText}>تحديث السعر</Text>
              </Pressable>
            </View>
          </View>
        )}

        <Text style={styles.footer}>استوديو الوليد · خدمة العملاء: {STUDIO_PHONE}</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 32, direction: "rtl" },
  topBar: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginTop: 16 },
  eyebrow: { color: MUTED, fontSize: 9, letterSpacing: 1, fontWeight: "900" },
  title: { color: INK, fontSize: 29, fontWeight: "900", marginTop: 6 },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#E4F2E9", paddingHorizontal: 9, paddingVertical: 7, borderRadius: 20 },
  badgeText: { color: GREEN, fontSize: 10, fontWeight: "800" },
  subtitle: { color: MUTED, fontSize: 12, lineHeight: 19, marginTop: 7, marginBottom: 13 },
  dataNotice: { flexDirection: "row-reverse", gap: 8, alignItems: "center", backgroundColor: "#FFF7E5", borderRadius: 13, padding: 11, marginBottom: 19 },
  dataNoticeText: { color: "#80612B", fontSize: 11, lineHeight: 17, flex: 1, textAlign: "right", fontWeight: "700" },
  sectionTitle: { color: INK, fontSize: 16, fontWeight: "900", marginBottom: 9 },
  products: { gap: 8 },
  productCard: { flexDirection: "row-reverse", alignItems: "center", gap: 10, backgroundColor: "#FFF", borderWidth: 1, borderColor: "#E7E2D9", borderRadius: 16, padding: 11 },
  productSelected: { borderColor: GOLD, backgroundColor: "#FFF9ED" },
  productVisual: { width: 48, height: 48, borderRadius: 12, backgroundColor: "#EEF0EE", alignItems: "center", justifyContent: "center" },
  productVisualSelected: { backgroundColor: "#F3E8D8" },
  productCopy: { flex: 1, alignItems: "flex-end" },
  productName: { color: INK, fontSize: 13, fontWeight: "900" },
  productSize: { color: INK, fontSize: 11, marginTop: 3 },
  productSub: { color: MUTED, fontSize: 9, marginTop: 3 },
  twoColumns: { flexDirection: "row-reverse", gap: 10, marginTop: 18 },
  control: { flex: 1 },
  label: { color: INK, fontSize: 11, fontWeight: "800", marginBottom: 6 },
  stepper: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#FFF", borderRadius: 13, borderWidth: 1, borderColor: "#E7E2D9", padding: 5 },
  step: { width: 30, height: 30, borderRadius: 9, backgroundColor: "#F3E8D8", alignItems: "center", justifyContent: "center" },
  stepText: { color: GOLD, fontSize: 20, fontWeight: "900" },
  quantity: { color: INK, fontSize: 15, fontWeight: "900" },
  countryBox: { height: 41, backgroundColor: "#FFF", borderRadius: 13, borderWidth: 1, borderColor: "#E7E2D9", flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 5 },
  countryText: { color: INK, fontSize: 11, fontWeight: "800" },
  countryChips: { gap: 7, paddingVertical: 11 },
  countryChip: { borderWidth: 1, borderColor: "#E0DBD2", borderRadius: 18, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: "#FFF" },
  countryChipSelected: { backgroundColor: "#18232C", borderColor: "#18232C" },
  countryChipText: { color: MUTED, fontSize: 10 },
  countryChipTextSelected: { color: "#FFF", fontWeight: "800" },
  quoteButton: { backgroundColor: INK, borderRadius: 15, height: 51, alignItems: "center", justifyContent: "center", flexDirection: "row-reverse", gap: 8, marginTop: 2 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  quoteButtonText: { color: CREAM, fontSize: 13, fontWeight: "900" },
  stateCard: { flexDirection: "row-reverse", alignItems: "flex-start", gap: 10, backgroundColor: BLUE, borderRadius: 16, padding: 14, marginTop: 14 },
  errorCard: { backgroundColor: "#F9E5E3" },
  stateGrow: { flex: 1 },
  stateTitle: { color: INK, fontSize: 13, fontWeight: "900", textAlign: "right" },
  stateText: { color: MUTED, fontSize: 10, lineHeight: 16, marginTop: 4, textAlign: "right" },
  quoteCard: { backgroundColor: "#FFF", borderRadius: 18, padding: 16, marginTop: 14, borderWidth: 1, borderColor: "#E4D6B9" },
  quoteHeader: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#F0ECE5" },
  quoteKicker: { color: MUTED, fontSize: 10, textAlign: "right" },
  quoteTotal: { color: INK, fontSize: 24, fontWeight: "900", marginTop: 3 },
  serverPill: { flexDirection: "row-reverse", gap: 4, alignItems: "center", backgroundColor: "#E4F2E9", paddingHorizontal: 8, paddingVertical: 6, borderRadius: 14 },
  serverPillText: { color: GREEN, fontSize: 9, fontWeight: "800" },
  line: { flexDirection: "row-reverse", justifyContent: "space-between", paddingVertical: 9 },
  lineLabel: { color: MUTED, fontSize: 11, textAlign: "right", flex: 1 },
  lineValue: { color: INK, fontSize: 11, fontWeight: "800" },
  expiry: { flexDirection: "row-reverse", alignItems: "center", gap: 6, borderTopWidth: 1, borderTopColor: "#F0ECE5", paddingTop: 11 },
  expiryText: { color: GOLD, fontSize: 10, flex: 1, textAlign: "right" },
  expiryDanger: { color: RED },
  refresh: { color: INK, fontSize: 10, fontWeight: "900" },
  retryButton: { alignSelf: "flex-end", backgroundColor: "#FFF", borderRadius: 10, paddingHorizontal: 11, paddingVertical: 7, marginTop: 9 },
  retryText: { color: RED, fontSize: 10, fontWeight: "900" },
  footer: { color: MUTED, fontSize: 10, textAlign: "center", lineHeight: 14, marginTop: 22, fontWeight: "700" }
});
