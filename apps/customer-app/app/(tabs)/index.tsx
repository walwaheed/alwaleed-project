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
const STUDIO_PHONE = "0133444101";

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
      <Pressable accessibilityLabel="معلومات الاستوديو" onPress={() => setDoneMessage(`استوديو الوليد — تصوير فوتوغرافي وطباعة فاخرة · خدمة العملاء: ${STUDIO_PHONE}`)} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
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
        <Text style={styles.heroKicker}>SMART PHOTO ASSISTANT · استوديو الوليد</Text>
        <Text style={styles.heroTitle}>صورتك تستحق{`\n`}الخيار الصح.</Text>
        <Text style={styles.heroBody}>ارفع صورة، وسنساعدك تفهم أفضل استخدام لها في 3 خطوات بسيطة.</Text>
        <View style={styles.heroFooter}>
          <View style={styles.heroBadge}><MaterialIcons name="auto-awesome" size={15} color={GOLD} /><Text style={styles.heroBadgeText}>تحليل بصري ذكي</Text></View>
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

      <View style={styles.studioContact}><MaterialIcons name="support-agent" size={17} color={GOLD} /><Text style={styles.studioContactText}>خدمة العملاء والدعم: 0133444101</Text></View>
      <View style={styles.reassurance}><MaterialIcons name="verified-user" size={18} color={SUCCESS} /><Text style={styles.reassuranceText}>خصوصية تامة · صورك محمية ولا تُشارك مع أي جهة · هاتف: 0133444101</Text></View>
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
      <View style={styles.simpleIntro}><Text style={styles.pageKicker}>اختيارك: {selectedIntent?.title}</Text><Text style={styles.pageTitle}>خلّنا نشوف الصورة</Text><Text style={styles.pageBody}>ارفع صورة واحدة فقط. نحلل دقة وجودة الصورة لنقترح المقاس الأنسب للطباعة الفاخرة.</Text></View>
      {photo ? (
        <View style={styles.photoCard}><Image source={{ uri: photo.uri }} style={styles.photoPreview} /><View style={styles.photoOverlay}><View style={styles.photoChip}><MaterialIcons name="check-circle" size={16} color={SUCCESS} /><Text style={styles.photoChipText}>تم اختيار الصورة</Text></View></View><Text style={styles.photoName}>{photo.fileName ?? "صورة من جهازك"}</Text></View>
      ) : (
        <Pressable onPress={pickImage} style={({ pressed }) => [styles.uploadCard, pressed && styles.cardPressed]}><View style={styles.uploadOrb}><MaterialIcons name="add-photo-alternate" size={34} color={INK} /></View><Text style={styles.uploadTitle}>اضغط لاختيار صورة</Text><Text style={styles.uploadBody}>من ألبوم الصور · حفظ مشفر وآمن للطلب</Text><View style={styles.uploadButton}><Text style={styles.uploadButtonText}>اختيار صورة</Text><MaterialIcons name="photo-library" size={18} color={CREAM} /></View></Pressable>
      )}
      <View style={styles.metricPreview}><Text style={styles.metricPreviewTitle}>ما الذي سنفحصه؟</Text><View style={styles.metricPills}>{["الدقة", "الأبعاد", "القص", "الخلفية", "جودة الطباعة"].map((item) => <View key={item} style={styles.metricPill}><Text style={styles.metricPillText}>{item}</Text></View>)}</View></View>
      <Pressable onPress={runAnalysis} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, !photo && styles.primaryButtonMuted]}><Text style={styles.primaryButtonText}>تحليل جودة الصورة</Text><MaterialIcons name="arrow-back" size={20} color={CREAM} /></Pressable>
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
        <View style={styles.resultHeader}>
          <View>
            <Text style={styles.pageKicker}>نتيجة التحليل البصري الذكي</Text>
            <Text style={styles.pageTitle}>الصورة مفهومة الآن</Text>
          </View>
          <View style={styles.prototypePill}>
            <MaterialIcons name="science" size={15} color={WARNING} />
            <Text style={styles.prototypeText}>فحص آلي</Text>
          </View>
        </View>
        <View style={styles.analysisHero}>
          {photo ? (
            <Image source={{ uri: photo.uri }} style={styles.analysisImage} />
          ) : (
            <View style={styles.analysisPlaceholder}>
              <MaterialIcons name="image" size={40} color={MUTED} />
            </View>
          )}
          <View style={styles.analysisStamp}>
            <MaterialIcons name="auto-awesome" size={18} color={GOLD} />
            <Text style={styles.analysisStampText}>تحليل الصورة</Text>
          </View>
        </View>
        <View style={styles.metricList}>
          {metrics.map(([label, value, status]) => (
            <View key={label} style={styles.metricRow}>
              <Text style={styles.metricLabel}>{label}</Text>
              <View style={styles.metricRight}>
                <Text style={styles.metricValue}>{value}</Text>
                <Text style={styles.metricStatus}>{status}</Text>
              </View>
            </View>
          ))}
        </View>
        <Pressable
          onPress={() => setScreen("recommendation")}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.primaryButtonText}>عرض التوصية الذكية</Text>
          <MaterialIcons name="arrow-back" size={20} color={CREAM} />
        </Pressable>
      </>
    );
  };

  const renderRecommendation = () => (
    <>
      {renderTopBar(() => setScreen("analysis"), "خطوة 04 · التوصية")}
      <View style={styles.simpleIntro}>
        <Text style={styles.pageKicker}>التوصية المخصصة</Text>
        <Text style={styles.pageTitle}>أفضل خيار لصورتك</Text>
        <Text style={styles.pageBody}>بناءً على دقة الصورة واستخدامك المستهدف، نوصي بالتالي:</Text>
      </View>
      <View style={styles.recommendationCard}>
        <View style={styles.recIconWrap}>
          <MaterialIcons name="auto-awesome" size={28} color={GOLD} />
        </View>
        <Text style={styles.recTitle}>{selectedRecommendation.best}</Text>
        <Text style={styles.recSubtitle}>المقاس المقترح: {selectedRecommendation.size}</Text>
        <View style={styles.recPill}>
          <Text style={styles.recPillText}>الجودة المتوقعة: {selectedRecommendation.quality}</Text>
        </View>
      </View>
      <Pressable
        onPress={() => setScreen("print")}
        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
      >
        <Text style={styles.primaryButtonText}>اختيار المقاس والطلب</Text>
        <MaterialIcons name="arrow-back" size={20} color={CREAM} />
      </Pressable>
      <Pressable
        onPress={() => setScreen("passport")}
        style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
      >
        <Text style={styles.secondaryButtonText}>فحص متطلبات الجواز / الفيزا</Text>
      </Pressable>
    </>
  );

  const renderPrint = () => {
    const options = printGroups[printGroup];
    return (
      <>
        {renderTopBar(() => setScreen("recommendation"), "خطوة 05 · المقاسات")}
        <View style={styles.simpleIntro}>
          <Text style={styles.pageKicker}>كتالوج الطباعة</Text>
          <Text style={styles.pageTitle}>اختر مقاس الطباعة</Text>
          <Text style={styles.pageBody}>أسعار استرشادية واضحة ومقاسات معتمدة لطباعة عالية الدقة.</Text>
        </View>
        <View style={styles.groupTabs}>
          {(Object.keys(printGroups) as PrintGroup[]).map((group) => (
            <Pressable
              key={group}
              onPress={() => choosePrintGroup(group)}
              style={[styles.groupTab, printGroup === group && styles.groupTabActive]}
            >
              <Text style={[styles.groupTabText, printGroup === group && styles.groupTabTextActive]}>{group}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.optionsList}>
          {options.map((opt) => (
            <Pressable
              key={opt.name}
              onPress={() => {
                setPrintOption(opt.name);
                setProductPreview({ group: printGroup, name: opt.name, size: opt.size, price: opt.price });
              }}
              style={[styles.optionCard, printOption === opt.name && styles.optionCardActive]}
            >
              <View>
                <Text style={styles.optionCardName}>{opt.name}</Text>
                <Text style={styles.optionCardSize}>{opt.size}</Text>
              </View>
              <Text style={styles.optionCardPrice}>{opt.price}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.quantityRow}>
          <Text style={styles.quantityLabel}>الكمية:</Text>
          <View style={styles.quantityControls}>
            <Pressable
              onPress={() => setPreviewQuantity((q) => Math.max(1, q - 1))}
              style={styles.quantityBtn}
            >
              <Text style={styles.quantityBtnText}>-</Text>
            </Pressable>
            <Text style={styles.quantityValue}>{previewQuantity}</Text>
            <Pressable
              onPress={() => setPreviewQuantity((q) => q + 1)}
              style={styles.quantityBtn}
            >
              <Text style={styles.quantityBtnText}>+</Text>
            </Pressable>
          </View>
        </View>
        <Pressable
          onPress={() => {
            const selectedOpt = options.find((o) => o.name === printOption) ?? options[0];
            addToCart({
              id: `${printGroup}-${selectedOpt.name}`,
              name: `${printGroup} · ${selectedOpt.name}`,
              detail: selectedOpt.size,
              price: parseFloat(selectedOpt.price.replace(/[^0-9.]/g, "")) || 18,
            });
            setDoneMessage(`تمت إضافة ${selectedOpt.name} إلى السلة بنجاح.`);
          }}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.primaryButtonText}>إضافة إلى السلة</Text>
          <MaterialIcons name="add-shopping-cart" size={20} color={CREAM} />
        </Pressable>
      </>
    );
  };

  const renderPassport = () => (
    <>
      {renderTopBar(goHome, "فحص الجواز والهوية")}
      <View style={styles.simpleIntro}>
        <Text style={styles.pageKicker}>الاستخدام الرسمي</Text>
        <Text style={styles.pageTitle}>فحص صورة الجواز والفيزا</Text>
        <Text style={styles.pageBody}>حدد نوع الوثيقة لمعرفة الاشتراطات القياسية.</Text>
      </View>
      <View style={styles.passportTypes}>
        {passportTypes.map((type) => (
          <Pressable
            key={type}
            onPress={() => {
              setPassportType(type);
              setPassportResult(null);
            }}
            style={[styles.passportTypeCard, passportType === type && styles.passportTypeCardActive]}
          >
            <Text style={[styles.passportTypeText, passportType === type && styles.passportTypeTextActive]}>{type}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        onPress={runPassportCheck}
        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
      >
        <Text style={styles.primaryButtonText}>فحص اشتراطات {passportType}</Text>
        <MaterialIcons name="verified-user" size={20} color={CREAM} />
      </Pressable>
      {passportResult && (
        <View
          style={[
            styles.passportResultCard,
            passportResult === "PASS"
              ? styles.resultPass
              : passportResult === "NEEDS ADJUSTMENT"
              ? styles.resultWarn
              : styles.resultFail,
          ]}
        >
          <MaterialIcons
            name={passportResult === "PASS" ? "check-circle" : passportResult === "NEEDS ADJUSTMENT" ? "warning" : "error"}
            size={24}
            color={passportResult === "PASS" ? SUCCESS : passportResult === "NEEDS ADJUSTMENT" ? WARNING : ERROR}
          />
          <View style={styles.passportResultCopy}>
            <Text style={styles.passportResultTitle}>
              {passportResult === "PASS"
                ? "مطابقة للاشتراطات الأساسية"
                : passportResult === "NEEDS ADJUSTMENT"
                ? "تحتاج إلى ضبط بسيط"
                : "غير مطابقة للمواصفات"}
            </Text>
            <Text style={styles.passportResultBody}>
              {passportResult === "PASS"
                ? "خلفية بيضاء نقية، الوجه في المنتصف، والملامح واضحة بدون ظلال حادة."
                : "تأكد من استقامة الرأس وإزالة النظارات الشمسية وأن تكون الخلفية بيضاء موحدة."}
            </Text>
          </View>
        </View>
      )}
      <Pressable
        onPress={() => setScreen("upload")}
        style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed, { marginTop: 12 }]}
      >
        <Text style={styles.secondaryButtonText}>رفع صورة للفحص</Text>
      </Pressable>
    </>
  );

  return (
    <ScreenContainer className="px-5 pb-6" containerClassName="bg-[#F7F5F0]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} style={styles.rtl}>
        {screen === "home" && renderHome()}
        {screen === "unknown" && renderUnknown()}
        {screen === "upload" && renderUpload()}
        {screen === "analysis" && renderAnalysis()}
        {screen === "recommendation" && renderRecommendation()}
        {screen === "print" && renderPrint()}
        {screen === "passport" && renderPassport()}
        {doneMessage && (
          <View style={styles.doneCard}>
            <MaterialIcons name="info" size={18} color={INK} />
            <Text style={styles.doneText}>{doneMessage}</Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  rtl: { direction: "rtl" },
  content: { paddingBottom: 35 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 14, paddingBottom: 16 },
  iconButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#EDE8DE", alignItems: "center", justifyContent: "center" },
  iconButtonGhost: { width: 40, height: 40 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  brandLockup: { alignItems: "center" },
  eyebrow: { color: MUTED, fontSize: 9, letterSpacing: 1.1, fontWeight: "800" },
  brand: { color: INK, fontSize: 13, fontWeight: "900", letterSpacing: 0.5 },
  brandDot: { color: GOLD },
  hero: { backgroundColor: INK, borderRadius: 24, padding: 22, marginBottom: 20, overflow: "hidden", position: "relative" },
  heroGlowOne: { position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: 50, backgroundColor: "#C8974B22" },
  heroGlowTwo: { position: "absolute", bottom: -20, left: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: "#C9D8D022" },
  heroKicker: { color: GOLD, fontSize: 10, fontWeight: "900", letterSpacing: 0.8 },
  heroTitle: { color: "#FFF", fontSize: 26, fontWeight: "900", lineHeight: 34, marginTop: 10 },
  heroBody: { color: "#C6D0D0", fontSize: 12, lineHeight: 19, marginTop: 8 },
  heroFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 18, paddingTop: 14, borderTopWidth: 0.5, borderTopColor: "#ffffff22" },
  heroBadge: { backgroundColor: "#ffffff18", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  heroBadgeText: { color: CREAM, fontSize: 10, fontWeight: "700" },
  heroNumber: { color: GOLD, fontSize: 12, fontWeight: "900" },
  sectionHeader: { marginBottom: 14 },
  sectionTitle: { color: INK, fontSize: 18, fontWeight: "900" },
  sectionSubtitle: { color: MUTED, fontSize: 11, marginTop: 3 },
  stepDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: GOLD, alignItems: "center", justifyContent: "center" },
  stepDotText: { color: "#FFF", fontSize: 10, fontWeight: "900" },
  intentGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  intentCard: { width: "48.2%", minHeight: 110, borderRadius: 18, padding: 13, justifyContent: "space-between" },
  cardPressed: { opacity: 0.78, transform: [{ scale: 0.97 }] },
  intentIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#ffffffaa", alignItems: "center", justifyContent: "center" },
  intentTitle: { color: INK, fontSize: 13, fontWeight: "900", marginTop: 8 },
  intentSubtitle: { color: "#5F6B70", fontSize: 10, marginTop: 2 },
  studioContact: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14 },
  studioContactText: { color: INK, fontSize: 11, fontWeight: "800" },
  reassurance: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 18 },
  reassuranceText: { color: MUTED, fontSize: 10 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  progressLabel: { color: MUTED, fontSize: 10, fontWeight: "800" },
  progressTrack: { flex: 1, height: 5, backgroundColor: "#E4DED4", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: GOLD, borderRadius: 3 },
  simpleIntro: { marginBottom: 16 },
  pageKicker: { color: GOLD, fontSize: 10, fontWeight: "900", letterSpacing: 0.6 },
  pageTitle: { color: INK, fontSize: 24, fontWeight: "900", marginTop: 4 },
  pageBody: { color: MUTED, fontSize: 12, lineHeight: 19, marginTop: 6 },
  optionStack: { gap: 10, marginVertical: 14 },
  optionButton: { backgroundColor: CARD, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#E8E2D8" },
  optionText: { color: INK, fontSize: 14, fontWeight: "800", textAlign: "right" },
  microNote: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 },
  microNoteText: { color: MUTED, fontSize: 10 },
  photoCard: { backgroundColor: CARD, borderRadius: 20, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: "#E8E2D8" },
  photoPreview: { width: "100%", height: 200, borderRadius: 14 },
  photoOverlay: { position: "absolute", top: 22, right: 22 },
  photoChip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FFFFFFEE", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  photoChipText: { color: INK, fontSize: 10, fontWeight: "800" },
  photoName: { color: MUTED, fontSize: 11, textAlign: "center", marginTop: 10 },
  uploadCard: { backgroundColor: CARD, borderRadius: 20, borderWidth: 1.5, borderColor: "#DCD5C9", borderStyle: "dashed", alignItems: "center", paddingVertical: 32, paddingHorizontal: 20, marginBottom: 16 },
  uploadOrb: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#F0EAE0", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  uploadTitle: { color: INK, fontSize: 16, fontWeight: "900" },
  uploadBody: { color: MUTED, fontSize: 11, marginTop: 4, textAlign: "center" },
  uploadButton: { backgroundColor: INK, borderRadius: 14, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 18, paddingVertical: 10, marginTop: 14 },
  uploadButtonText: { color: CREAM, fontWeight: "900", fontSize: 13 },
  metricPreview: { backgroundColor: CARD, borderRadius: 18, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: "#E8E2D8" },
  metricPreviewTitle: { color: INK, fontSize: 12, fontWeight: "900", marginBottom: 10 },
  metricPills: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metricPill: { backgroundColor: "#F0EAE0", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  metricPillText: { color: INK, fontSize: 11, fontWeight: "700" },
  primaryButton: { minHeight: 52, backgroundColor: INK, borderRadius: 16, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 8 },
  primaryButtonMuted: { opacity: 0.6 },
  primaryButtonText: { color: CREAM, fontWeight: "900", fontSize: 14 },
  secondaryButton: { minHeight: 48, backgroundColor: CARD, borderRadius: 16, flexDirection: "row", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#DCD5C9", marginTop: 8 },
  secondaryButtonText: { color: INK, fontWeight: "800", fontSize: 13 },
  centerHint: { color: MUTED, fontSize: 10, textAlign: "center", marginTop: 10 },
  resultHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  prototypePill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FFF4DD", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  prototypeText: { color: WARNING, fontSize: 9, fontWeight: "900" },
  analysisHero: { backgroundColor: CARD, borderRadius: 20, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: "#E8E2D8", position: "relative" },
  analysisImage: { width: "100%", height: 200, borderRadius: 14 },
  analysisPlaceholder: { width: "100%", height: 160, borderRadius: 14, backgroundColor: "#EDE8DE", alignItems: "center", justifyContent: "center" },
  analysisStamp: { position: "absolute", bottom: 22, right: 22, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FFFFFFEE", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  analysisStampText: { color: INK, fontSize: 11, fontWeight: "900" },
  metricList: { backgroundColor: CARD, borderRadius: 18, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: "#E8E2D8" },
  metricRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 9, borderBottomWidth: 0.5, borderBottomColor: "#F0ECE5" },
  metricLabel: { color: MUTED, fontSize: 12, fontWeight: "700" },
  metricRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  metricValue: { color: INK, fontSize: 12, fontWeight: "800" },
  metricStatus: { color: SUCCESS, fontSize: 10, fontWeight: "900", backgroundColor: "#E6F4EA", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  recommendationCard: { backgroundColor: CARD, borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: "#E8E2D8", alignItems: "center" },
  recIconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#FFF8E9", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  recTitle: { color: INK, fontSize: 18, fontWeight: "900", textAlign: "center" },
  recSubtitle: { color: MUTED, fontSize: 12, marginTop: 4, textAlign: "center" },
  recPill: { backgroundColor: "#F0EAE0", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginTop: 12 },
  recPillText: { color: INK, fontSize: 11, fontWeight: "700" },
  groupTabs: { flexDirection: "row", gap: 8, marginBottom: 14 },
  groupTab: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: "#EDE8DE", alignItems: "center" },
  groupTabActive: { backgroundColor: INK },
  groupTabText: { color: MUTED, fontSize: 12, fontWeight: "800" },
  groupTabTextActive: { color: CREAM },
  optionsList: { gap: 8, marginBottom: 16 },
  optionCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: CARD, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#E8E2D8" },
  optionCardActive: { borderColor: GOLD, backgroundColor: "#FFFBF2" },
  optionCardName: { color: INK, fontSize: 14, fontWeight: "900" },
  optionCardSize: { color: MUTED, fontSize: 11, marginTop: 2 },
  optionCardPrice: { color: GOLD, fontSize: 14, fontWeight: "900" },
  quantityRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: CARD, borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: "#E8E2D8" },
  quantityLabel: { color: INK, fontSize: 13, fontWeight: "800" },
  quantityControls: { flexDirection: "row", alignItems: "center", gap: 14 },
  quantityBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: "#EDE8DE", alignItems: "center", justifyContent: "center" },
  quantityBtnText: { color: INK, fontSize: 16, fontWeight: "900" },
  quantityValue: { color: INK, fontSize: 15, fontWeight: "900", minWidth: 20, textAlign: "center" },
  passportTypes: { gap: 8, marginBottom: 16 },
  passportTypeCard: { backgroundColor: CARD, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#E8E2D8" },
  passportTypeCardActive: { borderColor: GOLD, backgroundColor: "#FFFBF2" },
  passportTypeText: { color: INK, fontSize: 13, fontWeight: "800", textAlign: "right" },
  passportTypeTextActive: { color: GOLD },
  passportResultCard: { flexDirection: "row", gap: 12, padding: 16, borderRadius: 16, marginTop: 14, borderWidth: 1 },
  resultPass: { backgroundColor: "#E6F4EA", borderColor: SUCCESS },
  resultWarn: { backgroundColor: "#FFF8E9", borderColor: WARNING },
  resultFail: { backgroundColor: "#FCE8E6", borderColor: ERROR },
  passportResultCopy: { flex: 1 },
  passportResultTitle: { color: INK, fontSize: 13, fontWeight: "900" },
  passportResultBody: { color: MUTED, fontSize: 11, lineHeight: 17, marginTop: 4 },
  doneCard: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#E6F4EA", borderRadius: 14, padding: 12, marginTop: 14 },
  doneText: { color: SUCCESS, fontSize: 12, fontWeight: "800", flex: 1 }
});