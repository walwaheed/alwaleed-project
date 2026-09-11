import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useCart } from "@/lib/cart-store";

const INK = "#17222B";
const MUTED = "#6D7A83";
const CREAM = "#F7F5F0";
const CARD = "#FFFFFF";
const GOLD = "#C8974B";
const SUCCESS = "#2F805A";

const STUDIO_PHONE = "0133444101";

export default function CartScreen() {
  const { items, subtotal, total, updateQuantity, clearCart } = useCart();
  const [step, setStep] = useState<"cart" | "details" | "review" | "done">("cart");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orderNum] = useState(`AW-ORD-${Math.floor(1000 + Math.random() * 9000)}`);

  const next = () => setStep(step === "cart" ? "details" : step === "details" ? "review" : "done");
  if (step === "done") {
    return (
      <ScreenContainer className="px-5 pb-6" containerClassName="bg-[#F7F5F0]">
        <View style={styles.done}>
          <View style={styles.doneIcon}>
            <MaterialIcons name="check" size={35} color={SUCCESS} />
          </View>
          <Text style={styles.doneTitle}>تم استلام طلبك بنجاح</Text>
          <Text style={styles.doneBody}>
            رقم الطلب {orderNum}. تم حفظ تفاصيل طلبك وسيقوم فريق استوديو الوليد بالتواصل معك لتأكيد التجهيز والتوصيل.
          </Text>
          <View style={styles.doneSupport}>
            <MaterialIcons name="support-agent" size={18} color={GOLD} />
            <Text style={styles.doneSupportText}>خدمة العملاء: هاتف {STUDIO_PHONE}</Text>
          </View>
          <Pressable
            onPress={() => {
              clearCart();
              setStep("cart");
            }}
            style={styles.primary}
          >
            <Text style={styles.primaryText}>العودة للرئيسية</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="px-5 pb-6" containerClassName="bg-[#F7F5F0]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} style={styles.rtl}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>STUDIO ALWALEED · سلة الطلبات</Text>
            <Text style={styles.title}>{step === "cart" ? "سلة اختياراتك" : step === "details" ? "بيانات الاستلام" : "مراجعة الطلب"}</Text>
          </View>
          <View style={styles.bag}>
            <MaterialIcons name="shopping-bag" size={21} color={INK} />
            <Text style={styles.bagCount}>{items.length}</Text>
          </View>
        </View>

        <View style={styles.steps}>
          {["السلة", "البيانات", "المراجعة"].map((label, index) => {
            const active = ["cart", "details", "review"].indexOf(step) >= index;
            return (
              <View key={label} style={styles.step}>
                <View style={[styles.stepDot, active && styles.stepDotActive]}>
                  <Text style={[styles.stepNumber, active && styles.stepNumberActive]}>{index + 1}</Text>
                </View>
                <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>{label}</Text>
              </View>
            );
          })}
        </View>

        {step === "cart" && (
          <>
            {items.length === 0 ? (
              <View style={styles.empty}>
                <MaterialIcons name="remove-shopping-cart" size={38} color={MUTED} />
                <Text style={styles.emptyTitle}>السلة فارغة</Text>
                <Text style={styles.emptyBody}>أضف منتجًا أو خدمة من قائمة الخيارات أو عبر مساعد الصور.</Text>
              </View>
            ) : (
              <View style={styles.list}>
                {items.map((item) => (
                  <View key={item.id} style={styles.item}>
                    <View style={styles.itemVisual}>
                      <MaterialIcons name="photo" size={25} color={GOLD} />
                    </View>
                    <View style={styles.itemMain}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemDetail}>{item.detail}</Text>
                      <Text style={styles.itemPrice}>{item.price} ر.س</Text>
                    </View>
                    <View style={styles.qty}>
                      <Pressable onPress={() => updateQuantity(item.id, item.quantity + 1)} style={styles.qtyButton}>
                        <Text style={styles.qtyText}>+</Text>
                      </Pressable>
                      <Text style={styles.qtyValue}>{item.quantity}</Text>
                      <Pressable onPress={() => updateQuantity(item.id, item.quantity - 1)} style={styles.qtyButton}>
                        <Text style={styles.qtyText}>−</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            )}
            <Summary subtotal={subtotal} total={total} />
          </>
        )}

        {step === "details" && (
          <View style={styles.form}>
            <Text style={styles.field}>الاسم الكامل</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="مثال: محمد السعيد"
              placeholderTextColor="#9AA2A4"
              style={styles.input}
              textAlign="right"
            />
            <Text style={styles.field}>رقم الجوال للتواصل وتأكيد الطلب</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="05xxxxxxxx"
              placeholderTextColor="#9AA2A4"
              style={styles.input}
              keyboardType="phone-pad"
              textAlign="right"
            />
            <View style={styles.privacyNotice}>
              <MaterialIcons name="lock-outline" size={17} color={GOLD} />
              <Text style={styles.privacyNoticeText}>بياناتك مشفرة ومحمية وفق أعلى معايير الخصوصية والأمان.</Text>
            </View>
          </View>
        )}

        {step === "review" && (
          <View>
            <View style={styles.reviewCard}>
              <Text style={styles.reviewTitle}>ملخص تفاصيل الطلب</Text>
              <Text style={styles.reviewLine}>العميل: {name || "عميل استوديو الوليد"}</Text>
              <Text style={styles.reviewLine}>الجوال: {phone || "غير مسجل"}</Text>
              <Text style={styles.reviewLine}>عدد المنتجات: {items.length}</Text>
              <Text style={styles.reviewLine}>الاستلام: استوديو الوليد أو شحن منزلي</Text>
            </View>
            <Summary subtotal={subtotal} total={total} />
          </View>
        )}

        <Pressable
          onPress={next}
          disabled={step === "cart" && items.length === 0}
          style={({ pressed }) => [
            styles.primary,
            step === "cart" && items.length === 0 && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.primaryText}>
            {step === "cart" ? "إكمال بيانات الطلب" : step === "details" ? "متابعة للمراجعة" : "تأكيد الطلب"}
          </Text>
          <MaterialIcons name="arrow-back" size={19} color={CREAM} />
        </Pressable>

        {step !== "cart" && (
          <Pressable onPress={() => setStep(step === "review" ? "details" : "cart")} style={styles.back}>
            <Text style={styles.backText}>العودة للخطوة السابقة</Text>
          </Pressable>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

function Summary({ subtotal, total }: { subtotal: number; total: number }) {
  return (
    <View style={styles.summary}>
      <View style={styles.summaryLine}>
        <Text style={styles.summaryLabel}>المجموع الفرعي</Text>
        <Text style={styles.summaryValue}>{subtotal} ر.س</Text>
      </View>
      <View style={styles.summaryLine}>
        <Text style={styles.summaryLabel}>رسوم التجهيز والشحن</Text>
        <Text style={styles.summaryValue}>5 ر.س</Text>
      </View>
      <View style={styles.totalLine}>
        <Text style={styles.totalLabel}>الإجمالي الشامل (شامل الضريبة)</Text>
        <Text style={styles.totalValue}>{total} ر.س</Text>
      </View>
      <Text style={styles.footNote}>استوديو الوليد · خدمة العملاء: {STUDIO_PHONE}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  rtl: { direction: "rtl" },
  content: { paddingBottom: 30 },
  header: { paddingTop: 15, paddingBottom: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  eyebrow: { color: MUTED, fontSize: 9, letterSpacing: 1, fontWeight: "800" },
  title: { color: INK, fontSize: 29, fontWeight: "900", marginTop: 6 },
  bag: { width: 47, height: 47, borderRadius: 16, backgroundColor: "#EDE8DE", justifyContent: "center", alignItems: "center" },
  bagCount: { position: "absolute", top: 5, right: 5, backgroundColor: GOLD, color: "#FFF", width: 16, height: 16, borderRadius: 8, textAlign: "center", fontSize: 10, fontWeight: "800" },
  steps: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#EDE8DE", borderRadius: 17, padding: 12, marginBottom: 18 },
  step: { alignItems: "center", gap: 5, flex: 1 },
  stepDot: { width: 27, height: 27, borderRadius: 14, backgroundColor: "#D5D0C6", alignItems: "center", justifyContent: "center" },
  stepDotActive: { backgroundColor: GOLD },
  stepNumber: { color: MUTED, fontSize: 11, fontWeight: "800" },
  stepNumberActive: { color: "#FFF" },
  stepLabel: { color: MUTED, fontSize: 10 },
  stepLabelActive: { color: INK, fontWeight: "800" },
  list: { gap: 10 },
  item: { minHeight: 107, backgroundColor: CARD, borderRadius: 18, padding: 12, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#EAE5DC" },
  itemVisual: { width: 57, height: 68, borderRadius: 13, backgroundColor: "#F3E8D8", alignItems: "center", justifyContent: "center" },
  itemMain: { flex: 1, paddingHorizontal: 12 },
  itemName: { color: INK, fontSize: 14, fontWeight: "900" },
  itemDetail: { color: MUTED, fontSize: 11, marginTop: 4 },
  itemPrice: { color: INK, fontSize: 12, fontWeight: "800", marginTop: 8 },
  qty: { alignItems: "center", gap: 5 },
  qtyButton: { width: 24, height: 24, borderRadius: 8, backgroundColor: "#EEEAE2", alignItems: "center", justifyContent: "center" },
  qtyText: { color: INK, fontSize: 17, lineHeight: 19 },
  qtyValue: { color: INK, fontSize: 12, fontWeight: "800" },
  summary: { backgroundColor: CARD, borderRadius: 18, padding: 16, marginTop: 14, borderWidth: 1, borderColor: "#EAE5DC" },
  summaryLine: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
  summaryLabel: { color: MUTED, fontSize: 12 },
  summaryValue: { color: INK, fontSize: 12, fontWeight: "800" },
  totalLine: { borderTopWidth: 1, borderTopColor: "#F0ECE5", paddingTop: 12, marginTop: 8, flexDirection: "row", justifyContent: "space-between" },
  totalLabel: { color: INK, fontSize: 13, fontWeight: "900" },
  totalValue: { color: GOLD, fontSize: 16, fontWeight: "900" },
  footNote: { color: MUTED, fontSize: 11, marginTop: 10, textAlign: "center", fontWeight: "700" },
  primary: { minHeight: 56, backgroundColor: INK, borderRadius: 17, marginTop: 16, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 9 },
  primaryText: { color: CREAM, fontSize: 14, fontWeight: "900" },
  disabled: { backgroundColor: "#A5AAAB" },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  empty: { minHeight: 270, borderRadius: 22, borderWidth: 1, borderColor: "#DDD7CC", borderStyle: "dashed", alignItems: "center", justifyContent: "center", padding: 25 },
  emptyTitle: { color: INK, fontSize: 18, fontWeight: "900", marginTop: 13 },
  emptyBody: { color: MUTED, fontSize: 12, marginTop: 6 },
  form: { backgroundColor: CARD, borderRadius: 20, padding: 17, borderWidth: 1, borderColor: "#EAE5DC" },
  field: { color: INK, fontSize: 12, fontWeight: "800", marginBottom: 7, marginTop: 4 },
  input: { minHeight: 48, borderRadius: 13, backgroundColor: "#F7F5F0", borderWidth: 1, borderColor: "#E4DED4", paddingHorizontal: 13, color: INK, marginBottom: 13 },
  privacyNotice: { flexDirection: "row", gap: 7, alignItems: "center", backgroundColor: "#F8EED7", borderRadius: 13, padding: 11, marginTop: 5 },
  privacyNoticeText: { color: "#725D37", fontSize: 11, flex: 1, lineHeight: 17, fontWeight: "700" },
  reviewCard: { backgroundColor: CARD, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: "#EAE5DC" },
  reviewTitle: { color: INK, fontSize: 16, fontWeight: "900", marginBottom: 10 },
  reviewLine: { color: MUTED, fontSize: 12, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#F0ECE5" },
  back: { alignItems: "center", marginTop: 14 },
  backText: { color: MUTED, fontSize: 12, fontWeight: "700" },
  done: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 20, paddingVertical: 40 },
  doneIcon: { width: 76, height: 76, borderRadius: 38, backgroundColor: "#E4F2E9", alignItems: "center", justifyContent: "center" },
  doneTitle: { color: INK, fontSize: 24, fontWeight: "900", marginTop: 18 },
  doneBody: { color: MUTED, textAlign: "center", lineHeight: 22, fontSize: 13, marginTop: 8 },
  doneSupport: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 16 },
  doneSupportText: { color: MUTED, fontSize: 12, fontWeight: "700" }
});
