import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { addToCart } from "@/lib/cart-store";

const INK = "#17222B";
const MUTED = "#6D7A83";
const CREAM = "#F7F5F0";
const CARD = "#FFFFFF";
const GOLD = "#C8974B";
const SAGE = "#C9D8D0";
const BLUE = "#DCEAF0";
const LILAC = "#E9E1EC";
const PEACH = "#F5DDD0";
const SUCCESS = "#2F805A";
const WARNING = "#B77A18";
const ERROR = "#A94D49";

type Screen = "home" | "unknown" | "upload" | "analysis" | "recommendation" | "print" | "passport";
type Intent = {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
};

type PhotoMeta = {
  uri: string;
  width?: number;
  height?: number;
  fileName?: string;
};

const intents: Intent[] = [
  { id: "official", title: "جواز / هوية / فيزا", subtitle: "استخدام رسمي", icon: "badge", color: PEACH },
  { id: "enhance", title: "تحسين الجودة", subtitle: "أوضح وأنقى", icon: "auto-fix-high", color: BLUE },
  { id: "print", title: "طباعة صورة", subtitle: "مقاس مناسب", icon: "print", color: SAGE },
  { id: "old", title: "تكبير صورة قديمة", subtitle: "إنقاذ الذكريات", icon: "zoom-in", color: LILAC },
  { id: "background", title: "تنظيف الخلفية", subtitle: "خلفية أهدأ", icon: "layers-clear", color: PEACH },
  { id: "portrait", title: "صورة شخصية", subtitle: "احترافية", icon: "person", color: SAGE },
  { id: "linkedin", title: "LinkedIn / Business", subtitle: "حضور مهني", icon: "work-outline", color: BLUE },
  { id: "canvas", title: "Canvas / Wall Art", subtitle: "لفتة جميلة", icon: "crop-square", color: LILAC },
  { id: "size", title: "أفضل مقاس للطباعة", subtitle: "بدون حيرة", icon: "straighten", color: PEACH },
  { id: "unknown", title: "لا أعرف — ساعدني", subtitle: "نكتشفها معًا", icon: "lightbulb-outline", color: GOLD },
];

const passportTypes = ["جواز سعودي", "هوية سعودية", "تأشيرة شنغن", "تأشيرة أمريكية", "أخرى"];
const printGroups = {
  "طباعة صورة": [
    { name: "A6", size: "10 × 15 سم", price: "12 ر.س" },
    { name: "A5", size: "15 × 21 سم", price: "18 ر.س" },
    { name: "A4", size: "21 × 30 سم", price: "29 ر.س" },
    { name: "A3", size: "30 × 42 سم", price: "49 ر.س" },
  ],
  Canvas: [
    { name: "Square", size: "30 × 30 سم", price: "119 ر.س" },
    { name: "Portrait", size: "30 × 45 سم", price: "139 ر.س" },
    { name: "Landscape", size: "45 × 30 سم", price: "139 ر.س" },
  ],
  Frame: [
    { name: "Standard", size: "إطار أساسي", price: "89 ر.س" },
    { name: "Premium", size: "إطار فاخر", price: "159 ر.س" },
  ],
};

type PrintGroup = keyof typeof printGroups;

export default function HomeScreen() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedIntent, setSelectedIntent] = useState<Intent | null>(null);
  const [photo, setPhoto] = useState<PhotoMeta | null>(null);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [passportType, setPassportType] = useState(passportTypes[0]);
  const [passportResult, setPassportResult] = useState<"PASS" | "NEEDS ADJUSTMENT" | "UNSUITABLE" | null>(null);
  const [unknownStep, setUnknownStep] = useState(0);
  const [unknownAnswers, setUnknownAnswers] = useState<string[]>([]);
  const [printGroup, setPrintGroup] = useState<PrintGroup>("طباعة صورة");
  const [printOption, setPrintOption] = useState(printGroups["طباعة صورة"][1].name);
  const [doneMessage, setDoneMessage] = useState<string | null>(null);
  const [productPreview, setProductPreview] = useState<{ group: PrintGroup; name: string; size: string; price: string } | null>(null);
  const [previewQuantity, setPreviewQuantity] = useState(1);
  const [compareMode, setCompareMode] = useState(false);
  const addScale = useRef(new Animated.Value(1)).current;

  const selectedRecommendation = useMemo(() => {
    if (!selectedIntent) return { use: "استخدام مناسب", quality: "جيدة", size: "A4 — 21 × 30 سم", best: "طباعة صورة بجودة متوازنة" };
    const recommendations: Record<string, { use: string; quality: string; size: string; best: string }> = {
      enhance: { use: "تحسين جودة الصورة", quality: "متوسطة وتتحسن", size: "A4 — 21 × 30 سم", best: "تنظيف وتحسين قبل الطباعة" },
      print: { use: "طباعة منزلية أو هدية", quality: "جيدة", size: "A5 — 15 × 21 سم", best: "طباعة صورة لامعة" },
      old: { use: "تكبير ذكرى قديمة", quality: "متوسطة", size: "A4 — 21 × 30 سم", best: "ترميم وتكبير ذكي" },
      background: { use: "صورة بخلفية أنظف", quality: "جيدة", size: "A5 — 15 × 21 سم", best: "تنظيف الخلفية" },
      portrait: { use: "صورة شخصية احترافية", quality: "جيدة", size: "4 × 6 سم أو ملف رقمي", best: "تحسين الإضاءة والقص" },
      linkedin: { use: "ملف LinkedIn مهني", quality: "جيدة", size: "مربع 1:1", best: "قص احترافي وخلفية هادئة" },
      canvas: { use: "لوحة جدارية", quality: "جيدة", size: "Square — 30 × 30 سم", best: "Canvas مطفي" },
      size: { use: "اختيار مقاس طباعة", quality: "جيدة", size: "A5 — الخيار الآمن", best: "ابدأ بـ A5" },
      official: { use: passportType, quality: "تحتاج فحصًا", size: "حسب الجهة", best: "فحص متطلبات الصورة" },
    };
    return recommendations[selectedIntent.id] ?? recommendations.print;
  }, [passportType, selectedIntent]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setPhoto({ uri: asset.uri, width: asset.width, height: asset.height, fileName: asset.fileName ?? undefined });
      setDoneMessage(null);
    }
  };

  const chooseIntent = (intent: Intent) => {
    setSelectedIntent(intent);
    setAnalysisDone(false);
    setDoneMessage(null);
    if (intent.id === "official") {
      setPassportResult(null);
      setScreen("passport");
    } else if (intent.id === "unknown") {
      setUnknownStep(0);
      setUnknownAnswers([]);
      setScreen("unknown");
    } else {
      setScreen("upload");
    }
  };

  const completeUnknownAnswer = (answer: string) => {
    const nextAnswers = [...unknownAnswers, answer];
    setUnknownAnswers(nextAnswers);
    if (unknownStep < 2) {
      setUnknownStep(unknownStep + 1);
    } else {
      setSelectedIntent(intents.find((item) => item.id === "print") ?? null);
      setScreen("recommendation");
    }
  };

  const runAnalysis = () => {
    setAnalysisDone(true);
    setScreen("analysis");
  };

  const runPassportCheck = () => {
    const result = passportType === "هوية سعودية" ? "PASS" : passportType === "تأشيرة أمريكية" ? "UNSUITABLE" : "NEEDS ADJUSTMENT";
    setPassportResult(result);
  };

  const choosePrintGroup = (group: PrintGroup) => {
    setPrintGroup(group);
    setPrintOption(printGroups[group][0].name);
  };

  const goHome = () => {
    setScreen("home");
    setDoneMessage(null);
  };

  const renderTopBar = (back?: () => void, eyebrow = "مساعد استديو الوليد") => (
    <View style={styles.topBar}>
      {back ? (
        <Pressable accessibilityLabel="رجوع" onPress={back} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
          <MaterialIcons name="arrow-forward" size={22} color={INK} />
        </Pressable>
      ) : <View style={styles.iconButtonGhost} />}
      <View style={styles.brandLockup}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.brand}>ALWALEED <Text style={styles.brandDot}>●</Text></Text>
      </View>
      <Pressable accessibilityLabel="معلومات النموذج" onPress={() => setDoneMessage("هذا نموذج تجريبي محلي — لا توجد أي بيانات إنتاجية أو عمليات دفع حقيقية.")} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
        <MaterialIcons name="info-outline" size={22} color={INK} />
      </Pressable>
    </View>
  );

  const renderHome = () => (
    <>
      {renderTopBar()}
      <View style={styles.hero}>
        <View style={styles.heroGlowOne} />
        <View style={styles.heroGlowTwo} />
        <Text style={styles.heroKicker}>SMART PHOTO ASSISTANT · V0</Text>
        <Text style={styles.heroTitle}>صورتك تستحق{`\n`}الخيار الصح.</Text>
        <Text style={styles.heroBody}>ارفع صورة، وسنساعدك تفهم أفضل استخدام لها في 3 خطوات بسيطة.</Text>
        <View style={styles.heroFooter}>
          <View style={styles.heroBadge}><MaterialIcons name="auto-awesome" size={15} color={GOLD} /><Text style={styles.heroBadgeText}>نتيجة تجريبية ذكية</Text></View>
          <Text style={styles.heroNumber}>01 / 03</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <View><Text style={styles.sectionTitle}>ماذا تريد أن تفعل بصورتك؟</Text><Text style={styles.sectionSubtitle}>اختر أقرب شيء في بالك — ولا تحتاج تعرف التفاصيل.</Text></View>
        <View style={styles.stepDot}><Text style={styles.stepDotText}>1</Text></View>
      </View>

      <View style={styles.intentGrid}>
        {intents.map((intent) => (
          <Pressable key={intent.id} onPress={() => chooseIntent(intent)} style={({ pressed }) => [styles.intentCard, { backgroundColor: intent.color }, pressed && styles.cardPressed]}>
            <View style={styles.intentIcon}><MaterialIcons name={intent.icon} size={23} color={INK} /></View>
            <Text style={styles.intentTitle}>{intent.title}</Text>
            <Text style={styles.intentSubtitle}>{intent.subtitle}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.reassurance}><MaterialIcons name="verified-user" size={18} color={SUCCESS} /><Text style={styles.reassuranceText}>تجربة محلية فقط · لا يتم إرسال صورك لأي خدمة خارجية</Text></View>
    </>
  );

  const renderUnknown = () => {
    const questions = [
      { title: "ماذا تريد من الصورة؟", options: ["استخدام رسمي", "طباعة", "تحسين", "هدية", "سوشيال ميديا", "لا أعرف"] },
      { title: "أين ستستخدمها غالبًا؟", options: ["على الجوال", "في البيت", "للعمل", "لشخص أحبه"] },
      { title: "هل تفضل نتيجة سريعة؟", options: ["نعم، اختر لي", "أريد مقارنة الخيارات"] },
    ];
    const question = questions[unknownStep];
    return (
      <>
        {renderTopBar(goHome, "نكتشفها معًا")}
        <View style={styles.progressRow}><Text style={styles.progressLabel}>سؤال {unknownStep + 1} من 3</Text><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${((unknownStep + 1) / 3) * 100}%` }]} /></View></View>
        <View style={styles.simpleIntro}><Text style={styles.pageKicker}>لا تحتاج تعرف المصطلح</Text><Text style={styles.pageTitle}>{question.title}</Text><Text style={styles.pageBody}>اختر إجابة واحدة فقط، وسنقترح عليك الخطوة الأقرب.</Text></View>
        <View style={styles.optionStack}>{question.options.map((option) => <Pressable key={option} onPress={() => completeUnknownAnswer(option)} style={({ pressed }) => [styles.optionButton, pressed && styles.cardPressed]}><Text style={styles.optionText}>{option}</Text><MaterialIcons name="arrow-back-ios" size={16} color={GOLD} /></Pressable>)}</View>
        <View style={styles.microNote}><MaterialIcons name="lock-outline" size={16} color={MUTED} /><Text style={styles.microNoteText}>3 أسئلة فقط، ثم توصية واضحة.</Text></View>
      </>
    );
  };

  const renderUpload = () => (
    <>
      {renderTopBar(goHome, "خطوة 02 · الصورة")}
      <View style={styles.simpleIntro}><Text style={styles.pageKicker}>اختيارك: {selectedIntent?.title}</Text><Text style={styles.pageTitle}>خلّنا نشوف الصورة</Text><Text style={styles.pageBody}>ارفع صورة واحدة فقط. التحليل التالي محاكاة تعليمية لنسخة V0.</Text></View>
      {photo ? (
        <View style={styles.photoCard}><Image source={{ uri: photo.uri }} style={styles.photoPreview} /><View style={styles.photoOverlay}><View style={styles.photoChip}><MaterialIcons name="check-circle" size={16} color={SUCCESS} /><Text style={styles.photoChipText}>تم اختيار الصورة</Text></View></View><Text style={styles.photoName}>{photo.fileName ?? "صورة من جهازك"}</Text></View>
      ) : (
        <Pressable onPress={pickImage} style={({ pressed }) => [styles.uploadCard, pressed && styles.cardPressed]}><View style={styles.uploadOrb}><MaterialIcons name="add-photo-alternate" size={34} color={INK} /></View><Text style={styles.uploadTitle}>اضغط لاختيار صورة</Text><Text style={styles.uploadBody}>من ألبوم الصور · لا يتم رفعها خارج النموذج</Text><View style={styles.uploadButton}><Text style={styles.uploadButtonText}>اختيار صورة</Text><MaterialIcons name="photo-library" size={18} color={CREAM} /></View></Pressable>
      )}
      <View style={styles.metricPreview}><Text style={styles.metricPreviewTitle}>ما الذي سنفحصه؟</Text><View style={styles.metricPills}>{["الدقة", "الأبعاد", "القص", "الخلفية", "جودة الطباعة"].map((item) => <View key={item} style={styles.metricPill}><Text style={styles.metricPillText}>{item}</Text></View>)}</View></View>
      <Pressable onPress={runAnalysis} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, !photo && styles.primaryButtonMuted]}><Text style={styles.primaryButtonText}>حلّل الصورة تجريبيًا</Text><MaterialIcons name="arrow-back" size={20} color={CREAM} /></Pressable>
      {!photo && <Text style={styles.centerHint}>يمكنك المتابعة بدون صورة لرؤية تجربة التحليل.</Text>}
    </>
  );

  const renderAnalysis = () => {
    const metrics = [
      ["الدقة", photo?.width && photo?.height ? `${photo.width} × ${photo.height}` : "1280 × 960 px", "مقبولة"],
      ["نسبة الأبعاد", "4 : 3", "مرنة للقص"],
      ["جودة الطباعة", "حتى A4", "جيدة"],
      ["الخلفية", "واضحة", "مناسبة"],
      ["تموضع الوجه", "في المنتصف", "ممتاز"],
    ];
    return (
      <>
        {renderTopBar(() => setScreen("upload"), "خطوة 03 · التحليل")}
        <View style={styles.resultHeader}><View><Text style={styles.pageKicker}>نتيجة محاكاة الذكاء الاصطناعي</Text><Text style={styles.pageTitle}>الصورة مفهومة الآن</Text></View><View style={styles.prototypePill}><MaterialIcons name="science" size={15} color={WARNING} /><Text style={styles.prototypeText}>PROTOTYPE</Text></View></View>        <View style={styles.analysisHero}>{photo ? <Image source={{ uri: photo.uri }} style={styles.analysisImage} /> : <View style={styles.analysisPlaceholder}><MaterialIcons name="image" size={40} color={MUTED} /></View>}<View style={styles.analysisStamp}><MaterialIcons name="auto-awesome" size={18} color={GOLD} /><Text style={styles.analysisStampText}>تحل
(Content truncated due to size limit. Use line ranges to read remaining content)