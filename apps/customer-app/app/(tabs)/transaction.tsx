import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

const INK = "#17222B";
const MUTED = "#6D7A83";
const CREAM = "#F7F5F0";
const GOLD = "#C8974B";
const GREEN = "#2F805A";

const STUDIO_PHONE = "0133444101";
const steps = ["اختيار المقاس", "رفع الصورة", "تأكيد السعر", "إنشاء الطلب", "تأكيد الدفع", "التجهيز والشحن"];

export default function TransactionScreen() {
  const [orderRef] = useState("AW-PR-849201");
  const success = true;

  return (
    <ScreenContainer className="px-5 pb-6" containerClassName="bg-[#F7F5F0]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} style={styles.rtl}>
        <Text style={styles.eyebrow}>STUDIO ALWALEED · تتبع المعاملة</Text>
        <Text style={styles.title}>حالة طلب طباعة الصور</Text>
        <Text style={styles.subtitle}>
          متابعة فورية لحالة طلبك ومعاملتك المسجلة في استوديو الوليد.
        </Text>

        <View style={styles.reference}>
          <View style={styles.refIcon}>
            <MaterialIcons name="photo" size={23} color={GOLD} />
          </View>
          <View style={styles.refCopy}>
            <Text style={styles.refTitle}>طباعة صور فاخرة A5</Text>
            <Text style={styles.refMeta}>15 × 21 سم · ورق فوتوغرافي لامع · الكمية 2</Text>
            <Text style={styles.refPrice}>36.00 ر.س</Text>
          </View>
          <MaterialIcons name="verified" size={20} color={GREEN} />
        </View>

        <View style={styles.flow}>
          {steps.map((step, index) => (
            <View key={step} style={styles.flowStep}>
              <View style={[styles.dot, styles.dotDone]}>
                <Text style={styles.dotTextActive}>{index + 1}</Text>
              </View>
              <Text style={styles.stepTextActive}>{step}</Text>
              {index < steps.length - 1 && <View style={[styles.connector, styles.connectorDone]} />}
            </View>
          ))}
        </View>

        <View style={[styles.status, styles.statusSuccess]}>
          <MaterialIcons name="check-circle" size={24} color={GREEN} />
          <View style={styles.statusCopy}>
            <Text style={styles.statusTitle}>الطلب مؤكد وجارٍ تجهيزه</Text>
            <Text style={styles.statusBody}>تم تأكيد الطلب ونقله إلى خط الطباعة الاحترافي.</Text>
          </View>
        </View>

        <View style={styles.summary}>
          <Text style={styles.cardTitle}>ملخص المعاملة</Text>
          <Row label="رقم الطلب" value={orderRef} />
          <Row label="العميل" value="عميل استوديو الوليد" />
          <Row label="الملف" value="صورة فوتوغرافية رسمية" />
          <Row label="قيمة الطباعة" value="36.00 ر.س" />
          <Row label="رسوم التجهيز" value="5.00 ر.س" />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>الإجمالي النهائي</Text>
            <Text style={styles.totalValue}>41.00 ر.س</Text>
          </View>
        </View>

        <View style={styles.tracking}>
          <Text style={styles.cardTitle}>مراحل تنفيذ الطلب</Text>
          <Track label="تم تسجيل وتأكيد الطلب" active />
          <Track label="جارٍ فحص ومعالجة الألوان" active />
          <Track label="الطباعة والتغليف الفاخر" active={false} />
          <Track label="جاهز للاستلام من الاستوديو أو الشحن" active={false} />
          <Text style={styles.orderNumber}>رقم التتبع: {orderRef}</Text>
        </View>

        <View style={styles.recovery}>
          <MaterialIcons name="support-agent" size={20} color={GOLD} />
          <Text style={styles.recoveryText}>
            لأي استفسار بخصوص طلبك، تواصل مع فريق الاستوديو مباشرة عبر الهاتف: {STUDIO_PHONE}
          </Text>
        </View>

        <Text style={styles.footer}>استوديو الوليد · المنطقة الشرقية — القطيف · هاتف: {STUDIO_PHONE}</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function Track({ label, active }: { label: string; active: boolean }) {
  return (
    <View style={styles.track}>
      <View style={[styles.trackDot, active && styles.trackDotActive]} />
      <Text style={[styles.trackText, active && styles.trackTextActive]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  rtl: { direction: "rtl" },
  content: { paddingBottom: 34 },
  eyebrow: { color: MUTED, fontSize: 9, letterSpacing: 1, fontWeight: "900", marginTop: 17 },
  title: { color: INK, fontSize: 29, fontWeight: "900", marginTop: 7 },
  subtitle: { color: MUTED, fontSize: 12, lineHeight: 19, marginTop: 6, marginBottom: 17 },
  reference: { backgroundColor: "#FFF", borderRadius: 19, padding: 13, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#EAE5DC" },
  refIcon: { width: 52, height: 59, borderRadius: 13, backgroundColor: "#F3E8D8", alignItems: "center", justifyContent: "center" },
  refCopy: { flex: 1, paddingHorizontal: 11 },
  refTitle: { color: INK, fontSize: 14, fontWeight: "900" },
  refMeta: { color: MUTED, fontSize: 10, marginTop: 4 },
  refPrice: { color: INK, fontWeight: "900", fontSize: 13, marginTop: 7 },
  flow: { backgroundColor: "#EDE8DE", borderRadius: 17, padding: 12, marginTop: 15, marginBottom: 20 },
  flowStep: { flexDirection: "row", alignItems: "center", minHeight: 31 },
  dot: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#D6D0C6", alignItems: "center", justifyContent: "center" },
  dotDone: { backgroundColor: GOLD },
  dotTextActive: { color: "#FFF", fontSize: 10, fontWeight: "900" },
  stepTextActive: { color: INK, fontWeight: "800", fontSize: 11, marginHorizontal: 8 },
  connector: { width: 1, height: 10, backgroundColor: "#D1CBC0", position: "absolute", right: 11, top: 27 },
  connectorDone: { backgroundColor: GOLD },
  status: { borderRadius: 16, padding: 14, marginTop: 15, flexDirection: "row", alignItems: "center", gap: 10 },
  statusSuccess: { backgroundColor: "#E4F2E9" },
  statusCopy: { flex: 1 },
  statusTitle: { color: INK, fontSize: 14, fontWeight: "900" },
  statusBody: { color: MUTED, fontSize: 11, lineHeight: 17, marginTop: 3 },
  summary: { backgroundColor: "#FFF", borderRadius: 18, padding: 16, marginTop: 14, borderWidth: 1, borderColor: "#EAE5DC" },
  cardTitle: { color: INK, fontSize: 14, fontWeight: "900", marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: "#F1EEE8" },
  rowLabel: { color: MUTED, fontSize: 11 },
  rowValue: { color: INK, fontSize: 11, fontWeight: "800" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  totalLabel: { color: INK, fontWeight: "900" },
  totalValue: { color: GOLD, fontSize: 17, fontWeight: "900" },
  tracking: { backgroundColor: "#FFF", borderRadius: 18, padding: 16, marginTop: 14, borderWidth: 1, borderColor: "#EAE5DC" },
  track: { flexDirection: "row", alignItems: "center", gap: 9, marginTop: 10 },
  trackDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: "#D6D0C6" },
  trackDotActive: { backgroundColor: GREEN },
  trackText: { color: MUTED, fontSize: 11 },
  trackTextActive: { color: INK, fontWeight: "800" },
  orderNumber: { color: GOLD, fontSize: 12, fontWeight: "900", marginTop: 14 },
  recovery: { backgroundColor: "#FFF8E9", borderRadius: 16, padding: 14, marginTop: 14, flexDirection: "row", gap: 9, alignItems: "center" },
  recoveryText: { color: "#725D37", fontSize: 11, flex: 1, lineHeight: 17, fontWeight: "700" },
  footer: { color: MUTED, textAlign: "center", fontSize: 10, marginTop: 20, fontWeight: "700" }
});
