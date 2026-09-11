import { MaterialIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

const INK = "#17222B";
const MUTED = "#6D7A83";
const CREAM = "#F7F5F0";
const CARD = "#FFFFFF";
const GOLD = "#C8974B";
const SAGE = "#C9D8D0";

const STUDIO_PHONE = "0133444101";

type Range = "اليوم" | "7 أيام" | "30 يوم";
type Sort = "sessions" | "uploads" | "abandoned";
const rows = [
  { id: 1, intent: "طباعة", product: "طباعة صورة فاخرة", sessions: 48, uploads: 31, abandoned: 12, range: "اليوم" },
  { id: 2, intent: "استخدام رسمي", product: "صورة جواز / فيزا", sessions: 36, uploads: 26, abandoned: 9, range: "7 أيام" },
  { id: 3, intent: "هدية", product: "لوحة كانفاس Canvas", sessions: 29, uploads: 21, abandoned: 4, range: "7 أيام" },
  { id: 4, intent: "تحسين", product: "تحسين وترميم", sessions: 22, uploads: 16, abandoned: 8, range: "30 يوم" },
  { id: 5, intent: "استشارة", product: "مقاس مقترح A5/A4", sessions: 17, uploads: 11, abandoned: 6, range: "30 يوم" },
];

export default function DashboardScreen() {
  const [range, setRange] = useState<Range>("اليوم");
  const [intent, setIntent] = useState("الكل");
  const [sort, setSort] = useState<Sort>("sessions");

  const filtered = useMemo(
    () =>
      rows
        .filter((row) => (range === "اليوم" ? row.range === "اليوم" : range === "7 أيام" ? row.range !== "30 يوم" : true))
        .filter((row) => intent === "الكل" || row.intent === intent)
        .sort((a, b) => b[sort] - a[sort]),
    [intent, range, sort]
  );

  return (
    <ScreenContainer className="px-5 pb-6" containerClassName="bg-[#F7F5F0]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} style={styles.rtl}>
        <View style={styles.top}>
          <View>
            <Text style={styles.eyebrow}>STUDIO ALWALEED · إدارة العمليات</Text>
            <Text style={styles.title}>مؤشرات الطلبات</Text>
            <Text style={styles.subtitle}>متابعة وتحليل اهتمامات العملاء وطلبات الطباعة.</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>SA</Text>
          </View>
        </View>

        <View style={styles.mockBanner}>
          <MaterialIcons name="insights" size={18} color={GOLD} />
          <Text style={styles.mockText}>مؤشرات الأداء اللحظية لخدمات استوديو الوليد</Text>
        </View>

        <Text style={styles.sectionTitle}>الفترة الزمنية</Text>
        <View style={styles.chips}>
          {(["اليوم", "7 أيام", "30 يوم"] as Range[]).map((value) => (
            <Chip key={value} label={value} active={range === value} onPress={() => setRange(value)} />
          ))}
        </View>

        <Text style={styles.sectionTitle}>تصنيف الخدمة</Text>
        <View style={styles.chips}>
          {["الكل", "طباعة", "استخدام رسمي", "هدية", "تحسين", "استشارة"].map((value) => (
            <Chip key={value} label={value} active={intent === value} onPress={() => setIntent(value)} />
          ))}
        </View>

        <View style={styles.sortRow}>
          <Text style={styles.sectionTitle}>النتائج ({filtered.length})</Text>
          <View style={styles.sortSelect}>
            <MaterialIcons name="sort" size={16} color={GOLD} />
            <Text style={styles.sortLabel}>ترتيب حسب</Text>
          </View>
        </View>

        <View style={styles.sortChips}>
          {(["sessions", "uploads", "abandoned"] as Sort[]).map((value) => (
            <Pressable
              key={value}
              onPress={() => setSort(value)}
              style={[styles.sortChip, sort === value && styles.sortChipActive]}
            >
              <Text style={[styles.sortChipText, sort === value && styles.sortChipTextActive]}>
                {value === "sessions" ? "الجلسات" : value === "uploads" ? "الصور المرفوعة" : "قيد المتابعة"}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.resultList}>
          {filtered.map((row, index) => (
            <View key={row.id} style={styles.resultCard}>
              <View style={styles.rank}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <View style={styles.resultMain}>
                <Text style={styles.resultProduct}>{row.product}</Text>
                <Text style={styles.resultIntent}>
                  تصنيف: {row.intent} · النطاق: {row.range}
                </Text>
                <View style={styles.miniStats}>
                  <Stat label="زيارات" value={row.sessions} />
                  <Stat label="صور" value={row.uploads} />
                  <Stat label="قيد المتابعة" value={row.abandoned} />
                </View>
              </View>
              <MaterialIcons name="chevron-left" size={21} color="#A4AAAB" />
            </View>
          ))}
        </View>

        <View style={styles.insight}>
          <MaterialIcons name="auto-awesome" size={22} color={GOLD} />
          <View>
            <Text style={styles.insightTitle}>ملخص الأداء</Text>
            <Text style={styles.insightText}>
              {filtered.length
                ? `الخدمة الأكثر طلباً: ${filtered[0].product} · سجلت ${
                    sort === "uploads" ? filtered[0].uploads : sort === "abandoned" ? filtered[0].abandoned : filtered[0].sessions
                  } تفاعل.`
                : "لا توجد نتائج لهذا التصنيف حالياً."}
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>استوديو الوليد · خدمة العملاء: {STUDIO_PHONE}</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  rtl: { direction: "rtl" },
  content: { paddingBottom: 30 },
  top: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", paddingTop: 15, paddingBottom: 17 },
  eyebrow: { color: MUTED, fontSize: 9, letterSpacing: 1, fontWeight: "800" },
  title: { color: INK, fontSize: 31, fontWeight: "900", marginTop: 6 },
  subtitle: { color: MUTED, fontSize: 12, marginTop: 5 },
  avatar: { width: 46, height: 46, borderRadius: 16, backgroundColor: INK, alignItems: "center", justifyContent: "center" },
  avatarText: { color: CREAM, fontWeight: "900" },
  mockBanner: { backgroundColor: "#F5EBD7", borderRadius: 15, padding: 12, flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 18 },
  mockText: { color: "#725D37", fontSize: 11, fontWeight: "700", flex: 1 },
  sectionTitle: { color: INK, fontSize: 14, fontWeight: "900", marginBottom: 9, marginTop: 3 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 13 },
  chip: { backgroundColor: CARD, borderWidth: 1, borderColor: "#E4DED4", borderRadius: 12, paddingHorizontal: 11, paddingVertical: 9 },
  chipActive: { backgroundColor: INK, borderColor: INK },
  chipText: { color: MUTED, fontSize: 11, fontWeight: "700" },
  chipTextActive: { color: CREAM },
  sortRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6 },
  sortSelect: { flexDirection: "row", gap: 5, alignItems: "center" },
  sortLabel: { color: MUTED, fontSize: 11 },
  sortChips: { flexDirection: "row", gap: 7, marginBottom: 12 },
  sortChip: { backgroundColor: "#EDE8DE", borderRadius: 11, paddingHorizontal: 10, paddingVertical: 8 },
  sortChipActive: { backgroundColor: "#F1E0BD" },
  sortChipText: { color: MUTED, fontSize: 10, fontWeight: "700" },
  sortChipTextActive: { color: "#7C5D24" },
  resultList: { gap: 9 },
  resultCard: { backgroundColor: CARD, borderRadius: 18, padding: 12, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#EAE5DC" },
  rank: { width: 30, height: 30, borderRadius: 10, backgroundColor: SAGE, alignItems: "center", justifyContent: "center" },
  rankText: { color: INK, fontSize: 12, fontWeight: "900" },
  resultMain: { flex: 1, paddingHorizontal: 10 },
  resultProduct: { color: INK, fontSize: 14, fontWeight: "900" },
  resultIntent: { color: MUTED, fontSize: 10, marginTop: 3 },
  miniStats: { flexDirection: "row", gap: 15, marginTop: 9 },
  stat: { flexDirection: "row", gap: 4, alignItems: "baseline" },
  statValue: { color: GOLD, fontSize: 12, fontWeight: "900" },
  statLabel: { color: MUTED, fontSize: 9 },
  insight: { backgroundColor: INK, borderRadius: 18, padding: 15, flexDirection: "row", gap: 10, alignItems: "flex-start", marginTop: 14 },
  insightTitle: { color: "#FFF", fontSize: 13, fontWeight: "900", marginBottom: 4 },
  insightText: { color: "#C6D0D0", fontSize: 11, lineHeight: 17, maxWidth: 270 },
  footer: { color: MUTED, fontSize: 11, lineHeight: 16, textAlign: "center", marginTop: 18, fontWeight: "700" }
});
