import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

const INK = "#17222B";
const MUTED = "#6D7A83";
const GOLD = "#C8974B";
const CREAM = "#F7F5F0";
const GREEN = "#2F805A";
const RED = "#B44747";

type Quality = "GOOD" | "ACCEPTABLE" | "LOW_RESOLUTION";
type CreateState = "idle" | "creating" | "created" | "failed" | "duplicate" | "quote_expired" | "upload_expired";
type Photo = { uri: string; name: string; width?: number; height?: number };

const STUDIO_PHONE = "0133444101";

export default function CheckoutScreen() {
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [uploading, setUploading] = useState(false);
  const [quality, setQuality] = useState<Quality>("GOOD");
  const [createState, setCreateState] = useState<CreateState>("idle");
  const [step, setStep] = useState<"upload" | "quality" | "review" | "ready">("upload");
  const [lowConfirmed, setLowConfirmed] = useState(false);
  const [quoteValid, setQuoteValid] = useState(true);
  const [orderRef, setOrderRef] = useState<string>("");

  const choosePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    setUploading(true);
    setCreateState("idle");
    setTimeout(() => {
      setPhoto({ uri: asset.uri, name: asset.fileName ?? "صورة من جهازك", width: asset.width, height: asset.height });
      setUploading(false);
      setStep("quality");
    }, 750);
  };

  const removePhoto = () => {
    setPhoto(null);
    setStep("upload");
    setCreateState("idle");
    setLowConfirmed(false);
  };

  const beginOrder = () => {
    if (!photo || !quoteValid) return;
    if (quality === "LOW_RESOLUTION" && !lowConfirmed) {
      setLowConfirmed(true);
      return;
    }
    setCreateState("creating");
    const ref = `AW-PR-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderRef(ref);
    setTimeout(() => {
      setCreateState("created");
      setStep("ready");
    }, 800);
  };

  const qualityCopy =
    quality === "GOOD"
      ? "جودة الصورة ممتازة للطباعة عالية الدقة"
      : quality === "ACCEPTABLE"
      ? "جودة الصورة مناسبة، وتمنح نتائج جيدة عند الطباعة"
      : "دقة الصورة منخفضة لهذا المقاس المختار";

  const canReview = Boolean(photo) && (quality !== "LOW_RESOLUTION" || lowConfirmed);

  return (
    <ScreenContainer className="px-5 pb-6" containerClassName="bg-[#F7F5F0]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>STUDIO ALWALEED · طباعة الصور الفاخرة</Text>
            <Text style={styles.title}>أكمل طلبك بسهولة</Text>
          </View>
          <View style={styles.verifiedBadge}>
            <MaterialIcons name="verified" size={14} color={GREEN} />
            <Text style={styles.verifiedBadgeText}>طلب موثق</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>طباعة صور A5 فاخرة · الكمية 1 · توصيل لكافة مدن المملكة</Text>

        <View style={styles.steps}>
          {[
            ["upload", "الصورة"],
            ["quality", "الجودة"],
            ["review", "المراجعة"],
            ["ready", "جاهز للدفع"],
          ].map(([key, label], index) => (
            <View key={key} style={styles.stepItem}>
              <View
                style={[
                  styles.stepDot,
                  step === key && styles.stepDotActive,
                  ["quality", "review", "ready"].indexOf(step) > index && styles.stepDotDone,
                ]}
              >
                <Text style={styles.stepNumber}>{index + 1}</Text>
              </View>
              <Text style={[styles.stepLabel, step === key && styles.stepLabelActive]}>{label}</Text>
            </View>
          ))}
        </View>

        {step === "upload" && (
          <View>
            <View style={styles.intro}>
              <Text style={styles.sectionTitle}>أضف صورتك</Text>
              <Text style={styles.body}>اختر صورة من جهازك. يمكنك معاينتها واستبدالها بحرية قبل تأكيد الطلب.</Text>
            </View>

            {uploading ? (
              <View style={styles.uploading}>
                <MaterialIcons name="cloud-upload" size={27} color={GOLD} />
                <Text style={styles.stateTitle}>جارٍ فحص أبعاد الصورة...</Text>
                <Text style={styles.stateText}>نجهز معاينة فورية للتحقق من ملاءمة الطباعة</Text>
                <View style={styles.progress}>
                  <View style={styles.progressFill} />
                </View>
              </View>
            ) : photo ? (
              <PhotoCard photo={photo} onReplace={choosePhoto} onRemove={removePhoto} />
            ) : (
              <Pressable onPress={choosePhoto} style={({ pressed }) => [styles.dropzone, pressed && styles.pressed]}>
                <View style={styles.uploadIcon}>
                  <MaterialIcons name="add-photo-alternate" size={34} color={INK} />
                </View>
                <Text style={styles.dropTitle}>اختر صورة للطباعة</Text>
                <Text style={styles.dropBody}>من ألبوم الصور أو اسحبها هنا مباشرة</Text>
                <View style={styles.primary}>
                  <Text style={styles.primaryText}>اختيار صورة</Text>
                  <MaterialIcons name="photo-library" size={18} color={CREAM} />
                </View>
              </Pressable>
            )}

            {!photo && <Text style={styles.privacy}>خصوصيتك أولويتنا · جميع الصور مشفرة ولا يتم نشرها</Text>}
          </View>
        )}

        {step === "quality" && photo && (
          <View>
            <View style={styles.intro}>
              <Text style={styles.sectionTitle}>معاينة وفحص الصورة</Text>
              <Text style={styles.body}>راجع تفاصيل الصورة لضمان أفضل دقة طباعة احترافية.</Text>
            </View>

            <PhotoCard photo={photo} onReplace={choosePhoto} onRemove={removePhoto} />

            <View style={[styles.qualityCard, quality === "GOOD" ? styles.good : quality === "ACCEPTABLE" ? styles.acceptable : styles.low]}>
              <MaterialIcons
                name={quality === "GOOD" ? "check-circle" : quality === "ACCEPTABLE" ? "info" : "warning"}
                size={23}
                color={quality === "GOOD" ? GREEN : quality === "ACCEPTABLE" ? GOLD : RED}
              />
              <View style={styles.qualityCopy}>
                <Text style={styles.qualityTitle}>{qualityCopy}</Text>
                <Text style={styles.qualityHint}>يمكنك تعديل الصورة أو تغيير المقاس في أي وقت.</Text>
              </View>
            </View>

            {quality === "LOW_RESOLUTION" && (
              <View style={styles.lowActions}>
                <Text style={styles.lowTitle}>خيارات مقترحة:</Text>
                <Pressable onPress={choosePhoto} style={styles.actionRow}>
                  <MaterialIcons name="swap-horiz" size={18} color={GOLD} />
                  <Text style={styles.actionText}>اختيار صورة بديلة أعلى دقة</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setQuality("ACCEPTABLE");
                    setLowConfirmed(false);
                  }}
                  style={styles.actionRow}
                >
                  <MaterialIcons name="photo-size-select-small" size={18} color={GOLD} />
                  <Text style={styles.actionText}>اختيار مقاس أصغر مناسب</Text>
                </Pressable>
                <Pressable onPress={() => setLowConfirmed(true)} style={styles.actionRow}>
                  <MaterialIcons name="check" size={18} color={GOLD} />
                  <Text style={styles.actionText}>المتابعة بهذا المقاس</Text>
                </Pressable>
              </View>
            )}

            <Pressable
              onPress={() => setStep("review")}
              disabled={!canReview}
              style={[styles.primaryButton, !canReview && styles.disabled]}
            >
              <Text style={styles.primaryText}>متابعة إلى مراجعة الطلب</Text>
              <MaterialIcons name="arrow-back" size={20} color={CREAM} />
            </Pressable>
          </View>
        )}

        {step === "review" && photo && (
          <View>
            <View style={styles.intro}>
              <Text style={styles.sectionTitle}>مراجعة تفاصيل الطلب</Text>
              <Text style={styles.body}>كل شيء جاهز للطباعة. راجع تفاصيل المنتج والسعر قبل التأكيد.</Text>
            </View>

            <View style={styles.reviewCard}>
              <Image source={{ uri: photo.uri }} style={styles.reviewPhoto} />
              <View style={styles.reviewDetails}>
                <Text style={styles.productName}>طباعة صور فاخرة A5</Text>
                <Text style={styles.productMeta}>15 × 21 سم · ورق فوتوغرافي لامع</Text>
                <Text style={styles.productMeta}>الكمية: 1</Text>
                <Text style={styles.productMeta}>التوصيل إلى: المملكة العربية السعودية</Text>
              </View>
            </View>

            <View style={styles.priceCard}>
              <Row label="سعر الطباعة" value="18.00 ر.س" />
              <Row label="ضريبة القيمة المضافة (15%)" value="2.70 ر.س" />
              <Row label="رسوم التجهيز والشحن" value="5.00 ر.س" />
              <View style={styles.total}>
                <Text style={styles.totalLabel}>الإجمالي النهائي</Text>
                <Text style={styles.totalValue}>25.70 ر.س</Text>
              </View>
            </View>

            {!quoteValid && (
              <View style={styles.alert}>
                <MaterialIcons name="schedule" size={20} color={RED} />
                <Text style={styles.alertText}>انتهت صلاحية التسعيرة. اضغط لتحديث السعر بأمان.</Text>
                <Pressable onPress={() => setQuoteValid(true)}>
                  <Text style={styles.retry}>تحديث</Text>
                </Pressable>
              </View>
            )}

            <Pressable onPress={() => setStep("quality")} style={styles.editButton}>
              <MaterialIcons name="edit" size={16} color={INK} />
              <Text style={styles.editText}>تعديل الصورة أو المقاس</Text>
            </Pressable>

            <Pressable
              onPress={beginOrder}
              disabled={!quoteValid}
              style={[styles.primaryButton, !quoteValid && styles.disabled]}
            >
              <Text style={styles.primaryText}>تأكيد وإنشاء الطلب</Text>
              <MaterialIcons name="arrow-back" size={20} color={CREAM} />
            </Pressable>
          </View>
        )}

        {step === "ready" && <OrderReadyView photo={photo} orderRef={orderRef} />}

        {createState === "creating" && (
          <ModalState
            icon="hourglass-top"
            title="جارٍ إنشاء وتأكيد طلبك..."
            text="نحفظ بياناتك وتفاصيل طلبك بأمان في نظام استوديو الوليد."
          />
        )}

        {createState === "failed" && (
          <ModalState
            icon="error-outline"
            title="تعذر إنشاء الطلب"
            text="حدث عارض غير متوقع. بياناتك محفوظة ويمكنك إعادة المحاولة."
            action="إعادة المحاولة"
            onAction={() => {
              setCreateState("idle");
              beginOrder();
            }}
            error
          />
        )}

        <View style={styles.supportFooter}>
          <Text style={styles.footerText}>استوديو الوليد · خدمة العملاء متوفرة عبر الهاتف: {STUDIO_PHONE}</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function PhotoCard({ photo, onReplace, onRemove }: { photo: Photo; onReplace: () => void; onRemove: () => void }) {
  return (
    <View style={styles.photoCard}>
      <Image source={{ uri: photo.uri }} style={styles.photo} />
      <View style={styles.photoInfo}>
        <Text style={styles.fileName} numberOfLines={1}>
          {photo.name}
        </Text>
        <Text style={styles.fileMeta}>
          {photo.width && photo.height ? `${photo.width} × ${photo.height} بكسل` : "تم اختيار الصورة"}
        </Text>
        <View style={styles.photoActions}>
          <Pressable onPress={onReplace}>
            <Text style={styles.link}>استبدال</Text>
          </Pressable>
          <Pressable onPress={onRemove}>
            <Text style={styles.remove}>حذف</Text>
          </Pressable>
        </View>
      </View>
    </View>
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

function ModalState({
  icon,
  title,
  text,
  action,
  onAction,
  error = false,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  text: string;
  action?: string;
  onAction?: () => void;
  error?: boolean;
}) {
  return (
    <View style={[styles.modalState, error && styles.modalError]}>
      <MaterialIcons name={icon} size={25} color={error ? RED : GOLD} />
      <View style={styles.stateGrow}>
        <Text style={styles.stateTitle}>{title}</Text>
        <Text style={styles.stateText}>{text}</Text>
        {action && onAction && (
          <Pressable onPress={onAction} style={styles.retryButton}>
            <Text style={styles.retryText}>{action}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function OrderReadyView({ photo, orderRef }: { photo: Photo | null; orderRef: string }) {
  return (
    <View>
      <View style={styles.readyHero}>
        <MaterialIcons name="check-circle" size={42} color={GREEN} />
        <Text style={styles.readyTitle}>تم تأكيد طلبك بنجاح</Text>
        <Text style={styles.readyBody}>تم استلام طلبك وجارٍ تجهيزه للطباعة الفاخرة والشحن.</Text>
      </View>
      <View style={styles.readyCard}>
        {photo && <Image source={{ uri: photo.uri }} style={styles.readyPhoto} />}
        <View style={styles.readyDetails}>
          <Text style={styles.orderNumber}>رقم الطلب: {orderRef || "AW-PR-102488"}</Text>
          <Text style={styles.productName}>طباعة صور A5 فاخرة · كمية 1</Text>
          <Text style={styles.productMeta}>الإجمالي: 25.70 ر.س</Text>
        </View>
      </View>
      <View style={styles.readySupport}>
        <MaterialIcons name="support-agent" size={18} color={GOLD} />
        <Text style={styles.readySupportText}>للمتابعة المباشرة مع الاستوديو: هاتف {STUDIO_PHONE}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 35, direction: "rtl" },
  header: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "flex-start", marginTop: 16 },
  eyebrow: { color: MUTED, fontSize: 9, letterSpacing: 1, fontWeight: "900" },
  title: { color: INK, fontSize: 28, fontWeight: "900", marginTop: 6 },
  verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#E4F2E9", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 18 },
  verifiedBadgeText: { color: GREEN, fontSize: 10, fontWeight: "900" },
  subtitle: { color: MUTED, fontSize: 11, marginTop: 6, textAlign: "right" },
  steps: { flexDirection: "row-reverse", justifyContent: "space-between", marginVertical: 18, paddingHorizontal: 3 },
  stepItem: { alignItems: "center", gap: 5 },
  stepDot: { width: 25, height: 25, borderRadius: 13, backgroundColor: "#DED8CF", alignItems: "center", justifyContent: "center" },
  stepDotActive: { backgroundColor: GOLD },
  stepDotDone: { backgroundColor: GREEN },
  stepNumber: { color: "#FFF", fontSize: 10, fontWeight: "900" },
  stepLabel: { color: MUTED, fontSize: 9 },
  stepLabelActive: { color: INK, fontWeight: "900" },
  intro: { marginBottom: 12 },
  sectionTitle: { color: INK, fontSize: 18, fontWeight: "900", textAlign: "right" },
  body: { color: MUTED, fontSize: 11, lineHeight: 18, marginTop: 4, textAlign: "right" },
  dropzone: { backgroundColor: "#FFF", borderWidth: 1, borderColor: "#E2DCD3", borderStyle: "dashed", borderRadius: 19, alignItems: "center", paddingVertical: 31 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  uploadIcon: { width: 63, height: 63, borderRadius: 32, backgroundColor: "#F4EFE6", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  dropTitle: { color: INK, fontSize: 16, fontWeight: "900", marginBottom: 4 },
  dropBody: { color: MUTED, fontSize: 12, marginBottom: 14 },
  primary: { backgroundColor: INK, borderRadius: 14, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 18, paddingVertical: 10 },
  primaryText: { color: CREAM, fontWeight: "900", fontSize: 13 },
  privacy: { color: MUTED, fontSize: 10, textAlign: "center", marginTop: 12 },
  uploading: { backgroundColor: "#FFF", borderRadius: 18, padding: 24, alignItems: "center", borderWidth: 1, borderColor: "#EAE5DC" },
  stateTitle: { color: INK, fontSize: 15, fontWeight: "900", marginTop: 8 },
  stateText: { color: MUTED, fontSize: 11, marginTop: 4, textAlign: "center" },
  progress: { width: "80%", height: 6, backgroundColor: "#EAE5DC", borderRadius: 3, marginTop: 14, overflow: "hidden" },
  progressFill: { width: "60%", height: "100%", backgroundColor: GOLD, borderRadius: 3 },
  qualityCard: { backgroundColor: "#FFF", borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, marginTop: 14, borderWidth: 1, borderColor: "#EAE5DC" },
  good: { borderLeftWidth: 4, borderLeftColor: GREEN },
  acceptable: { borderLeftWidth: 4, borderLeftColor: GOLD },
  low: { borderLeftWidth: 4, borderLeftColor: RED },
  qualityCopy: { flex: 1 },
  qualityTitle: { color: INK, fontSize: 13, fontWeight: "900" },
  qualityHint: { color: MUTED, fontSize: 10, marginTop: 3 },
  lowActions: { backgroundColor: "#FFF", borderRadius: 14, padding: 12, marginTop: 10, borderWidth: 1, borderColor: "#EAE5DC" },
  lowTitle: { color: INK, fontSize: 12, fontWeight: "800", marginBottom: 8 },
  actionRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: "#F0ECE5" },
  actionText: { color: INK, fontSize: 11, fontWeight: "700" },
  primaryButton: { minHeight: 52, backgroundColor: INK, borderRadius: 16, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 18 },
  disabled: { opacity: 0.5 },
  reviewCard: { backgroundColor: "#FFF", borderRadius: 18, padding: 14, flexDirection: "row", alignItems: "center", gap: 14, borderWidth: 1, borderColor: "#EAE5DC" },
  reviewPhoto: { width: 70, height: 70, borderRadius: 12, backgroundColor: "#EAE5DC" },
  reviewDetails: { flex: 1 },
  productName: { color: INK, fontSize: 14, fontWeight: "900" },
  productMeta: { color: MUTED, fontSize: 10, marginTop: 3 },
  priceCard: { backgroundColor: "#FFF", borderRadius: 18, padding: 14, marginTop: 12, borderWidth: 1, borderColor: "#EAE5DC" },
  total: { flexDirection: "row", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#F0ECE5" },
  totalLabel: { color: INK, fontWeight: "900", fontSize: 13 },
  totalValue: { color: GOLD, fontWeight: "900", fontSize: 15 },
  alert: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FDE8E8", borderRadius: 12, padding: 10, marginTop: 10 },
  alertText: { flex: 1, color: RED, fontSize: 11, fontWeight: "700" },
  retry: { color: RED, fontWeight: "900", fontSize: 11, textDecorationLine: "underline" },
  editButton: { minHeight: 44, backgroundColor: "#FFF", borderRadius: 14, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 10, borderWidth: 1, borderColor: "#E0DAD0" },
  editText: { color: INK, fontSize: 11, fontWeight: "800" },
  photoCard: { backgroundColor: "#FFF", borderRadius: 18, padding: 14, flexDirection: "row", alignItems: "center", gap: 14, borderWidth: 1, borderColor: "#EAE5DC" },
  photo: { width: 70, height: 70, borderRadius: 12, backgroundColor: "#EAE5DC" },
  photoInfo: { flex: 1 },
  fileName: { color: INK, fontSize: 13, fontWeight: "900" },
  fileMeta: { color: MUTED, fontSize: 10, marginTop: 3 },
  photoActions: { flexDirection: "row", gap: 12, marginTop: 8 },
  link: { color: GOLD, fontSize: 11, fontWeight: "800" },
  remove: { color: RED, fontSize: 11, fontWeight: "800" },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  rowLabel: { color: MUTED, fontSize: 11 },
  rowValue: { color: INK, fontSize: 11, fontWeight: "800" },
  modalState: { backgroundColor: "#FFF", borderRadius: 16, padding: 14, marginTop: 12, flexDirection: "row", gap: 10, alignItems: "center", borderWidth: 1, borderColor: "#EAE5DC" },
  modalError: { borderColor: RED, backgroundColor: "#FFF5F5" },
  stateGrow: { flex: 1 },
  retryButton: { marginTop: 6 },
  retryText: { color: GOLD, fontSize: 11, fontWeight: "800" },
  readyHero: { alignItems: "center", paddingVertical: 20 },
  readyTitle: { color: INK, fontSize: 22, fontWeight: "900", marginTop: 10 },
  readyBody: { color: MUTED, fontSize: 12, marginTop: 4, textAlign: "center" },
  readyCard: { backgroundColor: "#FFF", borderRadius: 18, padding: 14, flexDirection: "row", alignItems: "center", gap: 14, marginVertical: 14, borderWidth: 1, borderColor: "#EAE5DC" },
  readyPhoto: { width: 60, height: 60, borderRadius: 12 },
  readyDetails: { flex: 1 },
  orderNumber: { color: GOLD, fontSize: 12, fontWeight: "900", marginBottom: 4 },
  readySupport: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 10 },
  readySupportText: { color: MUTED, fontSize: 11, fontWeight: "700" },
  supportFooter: { marginTop: 24, paddingVertical: 12, alignItems: "center" },
  footerText: { color: MUTED, fontSize: 11, fontWeight: "700" },
});
