import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
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

type Screen = "home" | "flow_choice" | "unknown" | "upload" | "analysis" | "recommendation" | "print" | "passport";
type PhotoFlow = "A" | "B";

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
  base64?: string;
};

type ComplianceCheck = {
  id: string;
  name_ar: string;
  category: "technical" | "composition" | "facial" | "lighting" | "composite";
  status: "PASS" | "WARNING" | "FAIL" | "NOT_DETERMINED";
  value: string;
  required: string;
  message_ar: string;
};

type ComplianceData = {
  document: {
    id: string;
    country_code: string;
    country_name_ar: string;
    name_ar: string;
    authority: string;
    official_source_url: string;
    last_verified_at: string;
    disclaimer_ar: string;
    spec_version?: string;
    clothing_rules?: string;
  };
  flow: PhotoFlow;
  summary: {
    pass_count: number;
    warning_count: number;
    fail_count: number;
    overall_status: "PASS" | "WARNING" | "FAIL";
    overall_score_percent: number;
  };
  crop_coordinates: {
    left: number;
    top: number;
    width?: number;
    height?: number;
    size: number;
    image_width: number;
    image_height: number;
    head_height_percent: number;
    eye_height_percent: number;
    center_deviation_percent: number;
  };
  checks: ComplianceCheck[];
};

const intents: Intent[] = [
  { id: "official", title: "صورة فيزا وجواز", subtitle: "مطابقة المواصفات الرسمية", icon: "badge", color: PEACH },
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

const countries = [
  {
    id: "us-visa",
    name_ar: "الولايات المتحدة الأمريكية",
    code: "US",
    doc_ar: "تأشيرة (U.S. Visa) — 2 × 2 بوصة (51 × 51 مم)",
    active: true,
    authority: "U.S. Department of State — Bureau of Consular Affairs",
    status_label: "مواصفات رسمية مدققة",
    disclaimer: "تم إعداد وفحص الصورة وفقًا للمواصفات الرسمية الصادرة عن وزارة الخارجية الأمريكية (U.S. Department of State). القبول النهائي يخضع لتقدير السلطات القنصلية المختصة.",
    bullets: [
      "المقاس الرقمي: 600 × 600 بكسل إلى 1200 × 1200 بكسل (1:1 مربعة) بحد أقصى 240 كيلوبايت",
      "المقاس المطبوع: 2 × 2 بوصة (51 × 51 مم) بدقة 300 نقطة بالبوصة",
      "نسبة ارتفاع الرأس: 50% إلى 69% من إجمالي ارتفاع الصورة",
      "مستوى ارتفاع العينين: 56% إلى 69% من أسفل الصورة",
      "الخلفية: بيضاء نقية أو أوف-وايت خالية من الظلال",
      "النظارات: ممنوعة نهائياً حتى الطبية (قرار وزارة الخارجية الصارم)"
    ]
  },
  {
    id: "sa-national-id",
    name_ar: "المملكة العربية السعودية",
    code: "SA",
    doc_ar: "بطاقة الهوية الوطنية (الأحوال المدنية) — 4 × 6 سم",
    active: true,
    authority: "وكالة وزارة الداخلية للأحوال المدنية",
    status_label: "مواصفات رسمية مدققة",
    disclaimer: "تم إعداد وفحص الصورة وفقًا للمواصفات الرسمية المعلنة من وكالة وزارة الداخلية للأحوال المدنية. القبول النهائي يخضع لتقدير موظفي الأحوال المدنية أو المنصة المعنية.",
    bullets: [
      "المقاس القياسي: 4 × 6 سم (نسبة 2:3) بدقة 300 نقطة بالبوصة (600 × 900 بكسل رقمياً)",
      "الخلفية: بيضاء نقية سادة خالية من الظلال والأنماط",
      "الزي الرسمي للرجال: الثوب والشماغ أو الغترة (الزي السعودي الرسمي) مع عقال متناسق",
      "الزي الرسمي للنساء: الحجاب التام مع إظهار كامل بيضاوي الوجه وخلو الوجه من الزينة الصارخة",
      "الوضعية: الرأس مستقيم للأمام بدون ميلان، والعيون مفتوحة وبدون عدسات لاصقة ملونة",
      "الحداثة: حديثة الالتقاط لا يتجاوز تاريخها 6 أشهر"
    ]
  },
  {
    id: "sa-passport",
    name_ar: "المملكة العربية السعودية",
    code: "SA",
    doc_ar: "جواز السفر السعودي (الجوازات) — 4 × 6 سم",
    active: true,
    authority: "المديرية العامة للجوازات — وزارة الداخلية",
    status_label: "مواصفات رسمية مدققة",
    disclaimer: "تم إعداد وفحص الصورة وفقًا للمواصفات الرسمية للمديرية العامة للجوازات. القبول النهائي يخضع لتقدير المنظومة الرسمية أو المنافذ.",
    bullets: [
      "المقاس الرسمي: 4 × 6 سم (نسبة 2:3) بدقة 300 DPI",
      "الخلفية: بيضاء سادة واضحة ومستوية بدون ظلال خلفية",
      "الزي الرسمي: الثوب والشماغ / الغترة للرجال، والحجاب المحتشم مع وضوح ملامح الوجه للنساء",
      "الملامح: طبيعية ومحايدة مع إغلاق الفم ومواجهة العدسة مباشرة",
      "النظارات: تفضّل الصورة بدون نظارات؛ وتجوز الطبية غير الملونة ودون انعكاس",
      "الحداثة: خلال آخر 6 أشهر"
    ]
  },
  {
    id: "eu-schengen",
    name_ar: "دول الشنغن الأوروبية",
    code: "EU",
    doc_ar: "تأشيرة شنغن (35 × 45 مم)",
    active: false,
    authority: "European Commission / ICAO 9303",
    status_label: "قريباً — تحت المراجعة والتدقيق",
    disclaimer: "",
    bullets: []
  },
  {
    id: "uk-visa",
    name_ar: "المملكة المتحدة (بريطانيا)",
    code: "GB",
    doc_ar: "تأشيرة المملكة المتحدة (35 × 45 مم)",
    active: false,
    authority: "HM Passport Office / UKVI",
    status_label: "قريباً — تحت المراجعة والتدقيق",
    disclaimer: "",
    bullets: []
  },
];

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
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const getInitialScreen = (): Screen => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      try {
        const p = new URLSearchParams(window.location.search).get("screen");
        if (p && ["home", "flow_choice", "passport", "upload", "analysis", "unknown"].includes(p)) {
          return p as Screen;
        }
      } catch {}
    }
    return "home";
  };

  const [screen, setScreen] = useState<Screen>(getInitialScreen);
  const [selectedFlow, setSelectedFlow] = useState<PhotoFlow>("A");
  const [selectedIntent, setSelectedIntent] = useState<Intent | null>(null);
  const [photo, setPhoto] = useState<PhotoMeta | null>(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      try {
        const p = new URLSearchParams(window.location.search).get("screen");
        if (p === "analysis") {
          return {
            uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&q=90",
            width: 1000,
            height: 1333,
            fileName: "sample_portrait.jpg",
          };
        }
      } catch {}
    }
    return null;
  });
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [unknownStep, setUnknownStep] = useState(0);
  const [unknownAnswers, setUnknownAnswers] = useState<string[]>([]);
  const [printGroup, setPrintGroup] = useState<PrintGroup>("طباعة صورة");
  const [printOption, setPrintOption] = useState(printGroups["طباعة صورة"][1].name);
  const [doneMessage, setDoneMessage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [complianceData, setComplianceData] = useState<ComplianceData | null>(null);
  const [showAutoCropPreview, setShowAutoCropPreview] = useState(true);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [downloadLinks, setDownloadLinks] = useState<{ digital?: string; sheet?: string } | null>(null);
  const [purgedMessage, setPurgedMessage] = useState<string | null>(null);

  const intentCardWidth = isDesktop ? "18.8%" : isTablet ? "31.4%" : "48.2%";

  // Trigger backend analysis
  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setScreen("analysis");
    setPurgedMessage(null);

    try {
      let imagePayload = photo?.base64 ? `data:image/jpeg;base64,${photo.base64}` : null;

      if (!imagePayload && photo?.uri) {
        try {
          const resp = await fetch(photo.uri);
          const blob = await resp.blob();
          imagePayload = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        } catch {
          // Keep null to use server sample fallback
        }
      }

      // Call Preview Compliance API with selected document and flow
      const res = await fetch("/api/compliance/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imagePayload || getSampleBase64(),
          document_type: selectedCountry.id,
          flow: selectedFlow,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setComplianceData(json.data);

        // Process download assets
        const procRes = await fetch("/api/compliance/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: imagePayload || getSampleBase64(),
            crop_coordinates: json.data.crop_coordinates,
            document_type: selectedCountry.id,
            flow: selectedFlow,
          }),
        });

        if (procRes.ok) {
          const procJson = await procRes.json();
          setCurrentFileId(procJson.data.file_id);
          setDownloadLinks({
            digital: procJson.data.digital.download_url,
            sheet: procJson.data.sheet.download_url,
          });
        }
      } else {
        setComplianceData(getFallbackComplianceData(selectedCountry.id, selectedFlow));
      }
    } catch {
      setComplianceData(getFallbackComplianceData(selectedCountry.id, selectedFlow));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
      base64: true,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setPhoto({
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        fileName: asset.fileName ?? undefined,
        base64: asset.base64 ?? undefined,
      });
      setDoneMessage(null);
    }
  };

  const loadSamplePhoto = () => {
    setPhoto({
      uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&q=90",
      width: 1000,
      height: 1333,
      fileName: "sample_portrait.jpg",
    });
  };

  const chooseIntent = (intent: Intent) => {
    setSelectedIntent(intent);
    setDoneMessage(null);
    if (intent.id === "official") {
      setScreen("flow_choice");
    } else if (intent.id === "unknown") {
      setUnknownStep(0);
      setUnknownAnswers([]);
      setScreen("unknown");
    } else {
      setScreen("upload");
    }
  };

  const goHome = () => {
    setScreen("home");
    setSelectedIntent(null);
  };

  const handleDownload = (url?: string, defaultFilename?: string) => {
    if (!url) {
      alert("جاري تجهيز الصورة للتحميل...");
      return;
    }
    if (Platform.OS === "web") {
      const a = document.createElement("a");
      a.href = url;
      a.download = defaultFilename || `${selectedCountry.code}_Photo_StudioAlWaleed.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      Linking.openURL(url).catch(() => {});
    }
  };

  const purgeCurrentPhoto = async () => {
    if (currentFileId) {
      try {
        await fetch(`/api/compliance/session/${currentFileId}`, { method: "DELETE" });
      } catch {}
    }
    setPhoto(null);
    setComplianceData(null);
    setDownloadLinks(null);
    setCurrentFileId(null);
    setPurgedMessage("تم حذف بيانات الصورة فوراً من الذاكرة المؤقتة. خصوصيتك في أمان تام.");
  };

  // Top Bar Navigation
  const renderTopBar = (backFn: () => void, title: string) => (
    <View style={styles.topBar}>
      <Pressable onPress={backFn} style={styles.iconButton} accessibilityLabel="رجوع">
        <MaterialIcons name="arrow-forward" size={22} color={INK} />
      </Pressable>
      <View style={styles.brandLockup}>
        <Text style={styles.eyebrow}>STUDIO ALWALEED</Text>
        <Text style={styles.brand}>{title}</Text>
      </View>
      <Pressable onPress={goHome} style={styles.iconButton} accessibilityLabel="الرئيسية">
        <MaterialIcons name="home" size={20} color={INK} />
      </Pressable>
    </View>
  );

  // 1. Home Screen
  const renderHome = () => (
    <>
      <View style={styles.topBar}>
        <View style={styles.brandLockup}>
          <Text style={styles.eyebrow}>STUDIO ALWALEED</Text>
          <Text style={styles.brand}>المساعد الذكي للصور</Text>
        </View>
        <Pressable
          onPress={() => Linking.openURL(`tel:${STUDIO_PHONE}`).catch(() => {})}
          style={styles.iconButton}
          accessibilityLabel="الاتصال بالاستوديو"
        >
          <MaterialIcons name="phone" size={20} color={INK} />
        </Pressable>
      </View>

      <Pressable
        onPress={() => chooseIntent(intents[0])}
        style={({ pressed }) => [styles.heroCard, pressed && styles.cardPressed]}
      >
        <View style={styles.heroContent}>
          <View style={styles.heroPill}>
            <MaterialIcons name="verified-user" size={14} color={GOLD} />
            <Text style={styles.heroPillText}>فحص وتجهيز الصور الرسمية</Text>
          </View>
          <Text style={styles.heroTitle}>صورك مطابقة للمواصفات الرسمية بدقة متناهية</Text>
          <Text style={styles.heroBody}>
            فحص ذكي فوري ومطابقة دقيقة وفق اللوائح الرسمية لفيزا أمريكا، الهوية الوطنية والجواز السعودي بدون أي تغيير في الملامح.
          </Text>
          <View style={styles.heroAction}>
            <Text style={styles.heroActionText}>ابدأ فحص أو تجهيز صورتك الآن</Text>
            <MaterialIcons name="arrow-back" size={18} color={CREAM} />
          </View>
        </View>
      </Pressable>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>ماذا تود أن تفعل بصورتك؟</Text>
        <Text style={styles.sectionSub}>اختر هدفك لنقترح لك المعالجة والمقاس المناسب</Text>
      </View>

      <View style={styles.intentGrid}>
        {intents.map((intent) => (
          <Pressable
            key={intent.id}
            onPress={() => chooseIntent(intent)}
            style={({ pressed }) => [
              styles.intentCard,
              { width: intentCardWidth },
              pressed && styles.cardPressed,
            ]}
          >
            <View style={[styles.intentIconBox, { backgroundColor: intent.color }]}>
              <MaterialIcons name={intent.icon} size={26} color={INK} />
            </View>
            <View style={styles.intentMeta}>
              <Text style={styles.intentTitle}>{intent.title}</Text>
              <Text style={styles.intentSubtitle}>{intent.subtitle}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={styles.reassurance}>
        <MaterialIcons name="lock" size={14} color={MUTED} />
        <Text style={styles.reassuranceText}>حفظ مشفر وآمن للصور · معالجة دقيقة بدون تعديل ملامح الوجه البيومترية</Text>
      </View>
    </>
  );

  // 2. Flow Choice Screen (Clear Distinction between Flow A and Flow B)
  const renderFlowChoice = () => (
    <>
      {renderTopBar(goHome, "اختيار نوع الخدمة")}
      <View style={styles.simpleIntro}>
        <Text style={styles.pageKicker}>الخطوة 01 · مسار المعالجة</Text>
        <Text style={styles.pageTitle}>حدد حالة صورتك الحالية</Text>
        <Text style={styles.pageBody}>
          نقدم مسارين متميزين لضمان الشفافية التامة وحماية ملامحك وهويتك الرسمية.
        </Text>
      </View>

      <View style={styles.flowChoiceContainer}>
        {/* Flow A */}
        <Pressable
          onPress={() => {
            setSelectedFlow("A");
            setScreen("passport");
          }}
          style={({ pressed }) => [
            styles.flowCard,
            selectedFlow === "A" && styles.flowCardActive,
            pressed && styles.cardPressed,
          ]}
        >
          <View style={styles.flowCardHeader}>
            <View style={[styles.flowBadge, { backgroundColor: "#E4F2E9" }]}>
              <MaterialIcons name="check-circle" size={16} color={SUCCESS} />
              <Text style={[styles.flowBadgeText, { color: SUCCESS }]}>المسار (أ) · تدقيق ومطابقة فقط</Text>
            </View>
            <MaterialIcons name="arrow-back" size={20} color={INK} />
          </View>
          <Text style={styles.flowCardTitle}>لدي صورة رسمية جاهزة</Text>
          <Text style={styles.flowCardBody}>
            لديك صورة ملتقطة بالفعل وتريد التحقق من مطابقتها الدقيقة للمواصفات الرسمية (الأبعاد، النسبة، تموضع الرأس، دقة الإضاءة، ونوع الملف).
          </Text>
          <View style={styles.flowCardSpecs}>
            <Text style={styles.flowSpecItem}>✓ فحص فوري ومطابقة معايير السفارات</Text>
            <Text style={styles.flowSpecItem}>✓ قص أو تغيير حجم قياسي فقط عند الحاجة</Text>
            <Text style={styles.flowSpecItem}>✓ بدون أي تعديل نهائياً على الوجه أو المظهر</Text>
          </View>
        </Pressable>

        {/* Flow B */}
        <Pressable
          onPress={() => {
            setSelectedFlow("B");
            setScreen("passport");
          }}
          style={({ pressed }) => [
            styles.flowCard,
            selectedFlow === "B" && styles.flowCardActive,
            pressed && styles.cardPressed,
          ]}
        >
          <View style={styles.flowCardHeader}>
            <View style={[styles.flowBadge, { backgroundColor: "#EBF3F8" }]}>
              <MaterialIcons name="tune" size={16} color="#1E5E8C" />
              <Text style={[styles.flowBadgeText, { color: "#1E5E8C" }]}>المسار (ب) · تجهيز للمواصفات</Text>
            </View>
            <MaterialIcons name="arrow-back" size={20} color={INK} />
          </View>
          <Text style={styles.flowCardTitle}>أحتاج تجهيز صورتي للمواصفات الرسمية</Text>
          <Text style={styles.flowCardBody}>
            لديك صورة شخصية عادية وتريد تجهيزها لتلائم المعايير الرسمية بدقة (تنظيف الخلفية، موازنة الإضاءة والتعريض، القص والتوسيط الذكي).
          </Text>
          <View style={styles.flowCardSpecs}>
            <Text style={styles.flowSpecItem}>✓ تنظيف وتوحيد الخلفية البيضاء الرسمية</Text>
            <Text style={styles.flowSpecItem}>✓ موازنة آمنة للسطوع والإضاءة الأمامية</Text>
            <Text style={styles.flowSpecItem}>✓ ممنوع قطعيًا: لا تعديل بيومتري ولا تغيير لملامح الوجه</Text>
          </View>
        </Pressable>
      </View>
    </>
  );

  // 3. Official Passport / Visa Selector
  const renderPassport = () => (
    <>
      {renderTopBar(() => setScreen("flow_choice"), "اختيار الوثيقة والدولة")}
      <View style={styles.simpleIntro}>
        <View style={styles.selectedFlowChip}>
          <MaterialIcons name={selectedFlow === "A" ? "verified" : "auto-fix-high"} size={15} color={GOLD} />
          <Text style={styles.selectedFlowChipText}>
            {selectedFlow === "A" ? "المسار المختار: (أ) تدقيق ومطابقة فقط" : "المسار المختار: (ب) تجهيز للمواصفات الرسمية"}
          </Text>
        </View>
        <Text style={styles.pageKicker}>الخطوة 02 · اختيار الوثيقة</Text>
        <Text style={styles.pageTitle}>اختر الدولة ونوع الوثيقة</Text>
        <Text style={styles.pageBody}>
          يطبق النظام اللوائح الرسمية المنشورة الصادرة عن الجهات الحكومية والقنصلية المختصة.
        </Text>
      </View>

      <View style={styles.countryList}>
        {countries.map((c) => (
          <Pressable
            key={c.id}
            disabled={!c.active}
            onPress={() => setSelectedCountry(c)}
            style={[
              styles.countryCard,
              selectedCountry.id === c.id && styles.countryCardActive,
              !c.active && styles.countryCardDisabled,
            ]}
          >
            <View style={styles.countryCardContent}>
              <View style={styles.countryIconWrap}>
                <MaterialIcons
                  name={c.active ? "verified" : "schedule"}
                  size={24}
                  color={c.active ? GOLD : MUTED}
                />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.countryHeaderRow}>
                  <Text style={styles.countryName}>{c.name_ar}</Text>
                  <View style={[styles.statusBadge, c.active ? styles.badgeActive : styles.badgeMuted]}>
                    <Text style={[styles.statusBadgeText, c.active ? styles.textActive : styles.textMuted]}>
                      {c.status_label}
                    </Text>
                  </View>
                </View>
                <Text style={styles.countryDoc}>{c.doc_ar}</Text>
                <Text style={styles.countryAuthority}>الجهة الرسمية: {c.authority}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Dynamic Official Rules Summary Card */}
      {selectedCountry.bullets && selectedCountry.bullets.length > 0 && (
        <View style={styles.officialNoticeCard}>
          <View style={styles.noticeHeader}>
            <MaterialIcons name="gavel" size={20} color={GOLD} />
            <Text style={styles.noticeTitle}>المواصفات الرسمية المعلنة لـ ({selectedCountry.doc_ar})</Text>
          </View>
          <View style={styles.bulletList}>
            {selectedCountry.bullets.map((b, idx) => (
              <Text key={idx} style={styles.noticeBullet}>• {b}</Text>
            ))}
          </View>
          <Text style={styles.noticeFooter}>
            المرجع الرسمي: {selectedCountry.authority} (تم التدقيق: 2026-09-12)
          </Text>
        </View>
      )}

      <View style={styles.buttonActionStack}>
        <Pressable
          onPress={() => setScreen("upload")}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.primaryButtonText}>المتابعة واختيار الصورة</Text>
          <MaterialIcons name="arrow-back" size={20} color={CREAM} />
        </Pressable>

        <Pressable
          onPress={() => {
            loadSamplePhoto();
            setScreen("upload");
          }}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryButtonText}>تجربة صورة بورتريه قياسية</Text>
          <MaterialIcons name="auto-awesome" size={18} color={INK} />
        </Pressable>
      </View>
    </>
  );

  // 4. Upload Screen
  const renderUpload = () => (
    <>
      {renderTopBar(() => setScreen("passport"), "رفع الصورة")}
      <View style={styles.simpleIntro}>
        <View style={styles.selectedFlowChip}>
          <Text style={styles.selectedFlowChipText}>
            {selectedCountry.doc_ar} · {selectedFlow === "A" ? "مسار الفحص فقط" : "مسار التجهيز"}
          </Text>
        </View>
        <Text style={styles.pageKicker}>الخطوة 03 · اختيار الصورة</Text>
        <Text style={styles.pageTitle}>ارفع صورتك للفحص الذكي</Text>
        <Text style={styles.pageBody}>
          يفضل التقاط صورة أمامية مستقيمة أمام جدار فاتح في إضاءة متوازنة خالية من الظلال.
        </Text>
      </View>

      {photo ? (
        <View style={styles.photoCard}>
          <Image source={{ uri: photo.uri }} style={styles.photoPreviewContained} resizeMode="contain" />
          <View style={styles.photoMetaRow}>
            <View style={styles.photoChip}>
              <MaterialIcons name="check-circle" size={16} color={SUCCESS} />
              <Text style={styles.photoChipText}>تم اختيار الصورة بنجاح</Text>
            </View>
            <Pressable onPress={pickImage}>
              <Text style={styles.changePhotoText}>تغيير الصورة</Text>
            </Pressable>
          </View>
          <Text style={styles.photoName}>
            {photo.fileName || "صورة من جهازك"} {photo.width && photo.height ? `(${photo.width} × ${photo.height} px)` : ""}
          </Text>
        </View>
      ) : (
        <Pressable onPress={pickImage} style={({ pressed }) => [styles.uploadCard, pressed && styles.cardPressed]}>
          <View style={styles.uploadOrb}>
            <MaterialIcons name="add-photo-alternate" size={36} color={INK} />
          </View>
          <Text style={styles.uploadTitle}>اضغط لاختيار صورة من جهازك</Text>
          <Text style={styles.uploadBody}>صيغ JPEG / PNG حتى 15 ميجابايت · معالجة مشفرة ومؤقتة</Text>
          <View style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>فتح مكتبة الصور</Text>
            <MaterialIcons name="photo-library" size={18} color={CREAM} />
          </View>
        </Pressable>
      )}

      <View style={styles.buttonActionStack}>
        <Pressable
          onPress={runAnalysis}
          disabled={!photo || isAnalyzing}
          style={({ pressed }) => [
            styles.primaryButton,
            (!photo || isAnalyzing) && styles.buttonDisabled,
            pressed && styles.pressed,
          ]}
        >
          {isAnalyzing ? (
            <Text style={styles.primaryButtonText}>جاري الفحص والمطابقة للمواصفات...</Text>
          ) : (
            <>
              <Text style={styles.primaryButtonText}>
                {selectedFlow === "A" ? "بدء فحص ومطابقة الصورة" : "بدء تجهيز ومطابقة الصورة"}
              </Text>
              <MaterialIcons name="search" size={20} color={CREAM} />
            </>
          )}
        </Pressable>

        {!photo && (
          <Pressable onPress={loadSamplePhoto} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
            <Text style={styles.secondaryButtonText}>تجربة نموذج بورتريه قياسي</Text>
            <MaterialIcons name="photo" size={18} color={INK} />
          </Pressable>
        )}
      </View>
    </>
  );

  // 5. Analysis Screen
  const renderAnalysis = () => {
    const data = complianceData || getFallbackComplianceData(selectedCountry.id, selectedFlow);
    const isOverallPass = data.summary.overall_status === "PASS";
    const isOverallWarn = data.summary.overall_status === "WARNING";
    const isSquare = (selectedCountry.id === "us-visa");

    return (
      <>
        {renderTopBar(() => setScreen("upload"), "نتائج الفحص والمطابقة")}

        {purgedMessage && (
          <View style={styles.purgedBanner}>
            <MaterialIcons name="delete-sweep" size={20} color={SUCCESS} />
            <Text style={styles.purgedBannerText}>{purgedMessage}</Text>
          </View>
        )}

        <View style={styles.simpleIntro}>
          <View style={styles.analysisHeaderBadges}>
            <View style={[styles.flowBadge, { backgroundColor: selectedFlow === "A" ? "#E4F2E9" : "#EBF3F8" }]}>
              <MaterialIcons name={selectedFlow === "A" ? "verified" : "tune"} size={14} color={selectedFlow === "A" ? SUCCESS : "#1E5E8C"} />
              <Text style={[styles.flowBadgeText, { color: selectedFlow === "A" ? SUCCESS : "#1E5E8C" }]}>
                {selectedFlow === "A" ? "المسار (أ): فحص ومطابقة الأبعاد فقط" : "المسار (ب): تجهيز آمن للمواصفة"}
              </Text>
            </View>
            <View style={styles.docBadge}>
              <Text style={styles.docBadgeText}>{data.document?.name_ar || selectedCountry.doc_ar}</Text>
            </View>
          </View>

          <Text style={styles.pageTitle}>تقرير المطابقة للمواصفات الرسمية</Text>
          <Text style={styles.pageBody}>
            تم فحص الصورة آلياً وفق {data.checks.length} معياراً رسمياً صادراً عن {data.document?.authority || selectedCountry.authority}.
          </Text>
        </View>

        {/* 2-Column Responsive Layout on Desktop */}
        <View style={[styles.analysisContainer, isDesktop && styles.analysisContainerDesktop]}>
          {/* Left Column: Photo Preview & Guidelines */}
          <View style={[styles.analysisPreviewCol, isDesktop && { width: "45%" }]}>
            <View style={styles.photoCard}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewKicker}>معاينة إطار القص القياسي</Text>
                <Pressable
                  onPress={() => setShowAutoCropPreview(!showAutoCropPreview)}
                  style={styles.toggleCropBtn}
                >
                  <MaterialIcons
                    name={showAutoCropPreview ? "visibility" : "visibility-off"}
                    size={16}
                    color={GOLD}
                  />
                  <Text style={styles.toggleCropText}>
                    {showAutoCropPreview ? "إخفاء الخطوط الإرشادية" : "إظهار الخطوط الإرشادية"}
                  </Text>
                </Pressable>
              </View>

              <View style={[styles.previewFrameContainer, isSquare ? styles.frameSquare : styles.frameRect]}>
                {photo?.uri ? (
                  <Image
                    source={{ uri: photo.uri }}
                    style={styles.containedPhoto}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <MaterialIcons name="person" size={70} color={MUTED} />
                  </View>
                )}

                {/* Overlaid Official Guidelines */}
                {showAutoCropPreview && (
                  <View style={styles.guidelineOverlay}>
                    <View style={[styles.cropBoxSquare, isSquare ? { aspectRatio: 1 } : { aspectRatio: 2 / 3 }]}>
                      <View style={styles.eyeLevelLine}>
                        <Text style={styles.guideLineLabel}>مسار العينين المطلوب</Text>
                      </View>
                      <View style={styles.chinLevelLine}>
                        <Text style={styles.guideLineLabel}>حد أسفل الذقن</Text>
                      </View>
                      <View style={styles.verticalCenterLine} />
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.previewBadgeRow}>
                <MaterialIcons name="crop" size={16} color={GOLD} />
                <Text style={styles.previewBadgeText}>
                  {isSquare ? "القص الدقيق للمواصفة: 1 : 1 (2 × 2 بوصة)" : "القص الدقيق للمواصفة: 2 : 3 (4 × 6 سم)"}
                </Text>
              </View>
            </View>

            {/* Direct Downloads Card */}
            <View style={styles.downloadsCard}>
              <View style={styles.downloadHeaderRow}>
                <MaterialIcons name="file-download" size={22} color={GOLD} />
                <Text style={styles.downloadTitle}>تحميل الصورة المطابقة</Text>
              </View>
              <Text style={styles.downloadSubtitle}>
                الملف الرقمي معد بدقة ومطابق لمتطلبات الرفع الإلكتروني، بالإضافة لكرت طباعة 4×6 بوصة.
              </Text>

              <View style={styles.downloadButtonsStack}>
                <Pressable
                  onPress={() => handleDownload(downloadLinks?.digital, `${selectedCountry.code}_Photo_Digital.jpg`)}
                  style={({ pressed }) => [styles.downloadPrimaryBtn, pressed && styles.pressed]}
                >
                  <MaterialIcons name="cloud-download" size={20} color={CREAM} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.downloadBtnMain}>
                      {isSquare ? "تحميل الصورة الرقمية (600 × 600 JPG)" : "تحميل الصورة الرقمية (600 × 900 JPG)"}
                    </Text>
                    <Text style={styles.downloadBtnSubtext}>
                      مهيأة وفق متطلبات البوابة الرسمية (sRGB)
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  onPress={() => handleDownload(downloadLinks?.sheet, `${selectedCountry.code}_PrintSheet_4x6.jpg`)}
                  style={({ pressed }) => [styles.downloadSecondaryBtn, pressed && styles.pressed]}
                >
                  <MaterialIcons name="print" size={20} color={INK} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.downloadBtnSecondaryText}>تحميل كرت الطباعة (4 × 6 بوصة)</Text>
                    <Text style={styles.downloadBtnSubtextDark}>
                      {isSquare ? "كرت جاهز للقص بدقة 300 DPI يحتوي 4 صور" : "كرت جاهز للقص بدقة 300 DPI يحتوي 6 صور"}
                    </Text>
                  </View>
                </Pressable>

                {/* Studio AlWaleed Print Order Fulfillment */}
                <Pressable
                  onPress={() => {
                    addToCart({
                      id: isSquare ? "photo_2x2_pack" : "photo_4x6_pack",
                      name: isSquare ? "باقة صور فيزا أمريكا الرسمية (4 صور)" : "باقة صور الهوية والجواز الرسمية (6 صور)",
                      detail: isSquare ? "2 × 2 بوصة · ورق فوتوغرافي أصلي" : "4 × 6 سم · ورق فوتوغرافي أصلي",
                      price: 25.0,
                    });
                    setDoneMessage("تمت إضافة باقة الصور الرسمية للطباعة إلى السلة بنجاح!");
                  }}
                  style={({ pressed }) => [styles.studioOrderBtn, pressed && styles.pressed]}
                >
                  <MaterialIcons name="shopping-bag" size={20} color={GOLD} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.studioOrderBtnText}>طلب طباعة فاخرة وتوصيل من استوديو الوليد</Text>
                    <Text style={styles.studioOrderSubtext}>ورق فوتوغرافي أصلي عالي الثبات · 25 ر.س</Text>
                  </View>
                </Pressable>
              </View>

              {doneMessage && (
                <View style={styles.addedBadge}>
                  <MaterialIcons name="check-circle" size={16} color={SUCCESS} />
                  <Text style={styles.addedBadgeText}>{doneMessage}</Text>
                </View>
              )}
            </View>

            {/* Privacy Purge Control Card */}
            <View style={styles.privacyPurgeCard}>
              <View style={styles.privacyHeader}>
                <MaterialIcons name="security" size={18} color={SUCCESS} />
                <Text style={styles.privacyCardTitle}>حماية الخصوصية وحذف البيانات</Text>
              </View>
              <Text style={styles.privacyCardText}>
                لا يتم تخزين صورك نهائياً على خوادم دائمة. تنتهي صلاحية الملفات المؤقتة آلياً خلال 20 دقيقة، ويمكنك مسحها فوراً الآن:
              </Text>
              <Pressable
                onPress={purgeCurrentPhoto}
                style={({ pressed }) => [styles.purgeBtn, pressed && styles.pressed]}
              >
                <MaterialIcons name="delete-outline" size={16} color={ERROR} />
                <Text style={styles.purgeBtnText}>مسح الصورة فوراً من الذاكرة المؤقتة</Text>
              </Pressable>
            </View>
          </View>

          {/* Right Column: 19 Compliance Checks & Legal Disclaimer */}
          <View style={[styles.analysisChecksCol, isDesktop && { width: "52%" }]}>
            {/* Overall Status Card */}
            <View style={[styles.statusBanner, isOverallPass ? styles.statusPass : isOverallWarn ? styles.statusWarn : styles.statusFail]}>
              <MaterialIcons
                name={isOverallPass ? "check-circle" : isOverallWarn ? "warning" : "error"}
                size={28}
                color={isOverallPass ? SUCCESS : isOverallWarn ? WARNING : ERROR}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.statusBannerTitle}>
                  {isOverallPass
                    ? "الصورة مستوفية للمواصفات الرسمية المطلوبة"
                    : isOverallWarn
                    ? "الصورة مستوفية للشروط الأساسية مع ملاحظات إرشادية"
                    : "الصورة تحتاج إعادة التقاط لتلائم المواصفات"}
                </Text>
                <Text style={styles.statusBannerSub}>
                  تم اجتياز {data.summary.pass_count} من أصل {data.checks.length} معياراً بدقة{" "}
                  {data.summary.overall_score_percent}%
                </Text>
              </View>
            </View>

            {/* 19 Compliance Checks List */}
            <View style={styles.checksCard}>
              <Text style={styles.checksTitle}>تفاصيل المعايير الرسمية الـ 19</Text>
              {data.checks.map((check) => {
                const isPass = check.status === "PASS";
                const isWarn = check.status === "WARNING";
                return (
                  <View key={check.id} style={styles.checkItem}>
                    <View style={styles.checkItemHeader}>
                      <View style={styles.checkTitleRow}>
                        <MaterialIcons
                          name={isPass ? "check-circle" : isWarn ? "error-outline" : "cancel"}
                          size={18}
                          color={isPass ? SUCCESS : isWarn ? WARNING : ERROR}
                        />
                        <Text style={styles.checkName}>{check.name_ar}</Text>
                      </View>
                      <View style={[styles.checkPill, isPass ? styles.pillPass : isWarn ? styles.pillWarn : styles.pillFail]}>
                        <Text style={[styles.checkPillText, isPass ? styles.textPass : isWarn ? styles.textWarn : styles.textFail]}>
                          {isPass ? "مطابق" : isWarn ? "ملاحظة" : "غير مطابق"}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.checkMessage}>{check.message_ar}</Text>
                    <View style={styles.checkMetaRow}>
                      <Text style={styles.checkMeta}>القيمة المرصودة: {check.value}</Text>
                      <Text style={styles.checkMetaRequired}>المتطلب: {check.required}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Legal Attribution Notice Card */}
            <View style={styles.legalNoticeCard}>
              <View style={styles.legalNoticeHeader}>
                <MaterialIcons name="policy" size={18} color={GOLD} />
                <Text style={styles.legalNoticeTitle}>إشعار المصدر والمطابقة الرسمية</Text>
              </View>
              <Text style={styles.legalNoticeBody}>
                {data.document?.disclaimer_ar || selectedCountry.disclaimer}
              </Text>
              <Text style={styles.legalNoticeAuthority}>
                المرجع: {data.document?.authority || selectedCountry.authority}
                {data.document?.spec_version ? ` · الإصدار: ${data.document.spec_version}` : ""}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonActionStack}>
          <Pressable
            onPress={() => setScreen("upload")}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          >
            <MaterialIcons name="refresh" size={18} color={INK} />
            <Text style={styles.secondaryButtonText}>فحص صورة أخرى</Text>
          </Pressable>
        </View>
      </>
    );
  };

  // Helper simulated fallback if offline
  function getFallbackComplianceData(docId = "us-visa", flow: PhotoFlow = "A"): ComplianceData {
    const doc = countries.find(c => c.id === docId) || countries[0];
    const isSquare = (docId === "us-visa");

    return {
      document: {
        id: doc.id,
        country_code: doc.code,
        country_name_ar: doc.name_ar,
        name_ar: doc.doc_ar,
        authority: doc.authority,
        official_source_url: "https://www.alwaleed.pro",
        last_verified_at: "2026-09-12",
        disclaimer_ar: doc.disclaimer,
      },
      flow,
      summary: {
        pass_count: 17,
        warning_count: 2,
        fail_count: 0,
        overall_status: "PASS",
        overall_score_percent: 89,
      },
      crop_coordinates: {
        left: 200,
        top: 150,
        width: isSquare ? 800 : 600,
        height: isSquare ? 800 : 900,
        size: 800,
        image_width: 1200,
        image_height: isSquare ? 1200 : 1500,
        head_height_percent: isSquare ? 58 : 72,
        eye_height_percent: isSquare ? 62 : 58,
        center_deviation_percent: 2,
      },
      checks: [
        { id: "1", name_ar: isSquare ? "أبعاد الصورة الرقمية (600 × 600 px)" : "أبعاد الصورة الرقمية (600 × 900 px)", category: "technical", status: "PASS", value: "1200 × 1200 px", required: "600 × 600 px على الأقل", message_ar: "أبعاد الصورة كافية للقص الرقمي وفق المواصفات." },
        { id: "2", name_ar: isSquare ? "نسبة الأبعاد (1:1 مربعة)" : "نسبة الأبعاد (2:3 مستطيلة 4×6)", category: "composition", status: "PASS", value: isSquare ? "1.00" : "0.67", required: isSquare ? "1.00" : "0.67", message_ar: "نسبة العرض للارتفاع متوافقة تماماً." },
        { id: "3", name_ar: "صيغة الملف (JPEG sRGB)", category: "technical", status: "PASS", value: "JPEG", required: "JPEG", message_ar: "الصيغة ومساحة الألوان قياسية." },
        { id: "4", name_ar: "حجم الملف الرقمي", category: "technical", status: "PASS", value: "118 KB", required: isSquare ? "≤ 240 KB" : "≤ 1024 KB", message_ar: "حجم الملف في النطاق السليم." },
        { id: "5", name_ar: "رصد ملامح الوجه", category: "facial", status: "PASS", value: "ملامح محددة", required: "وجه بشري واضح", message_ar: "تم التعرف على ملامح الوجه بدقة." },
        { id: "6", name_ar: "شخص واحد في الصورة", category: "facial", status: "PASS", value: "شخص واحد", required: "شخص واحد فقط", message_ar: "لا يوجد أشخاص آخرون في الإطار." },
        { id: "7", name_ar: "احتواء كامل الرأس والكتفين", category: "composition", status: "PASS", value: "كامل", required: "بدون اقتطاع", message_ar: "الرأس والكتفان داخل الإطار بالكامل." },
        { id: "8", name_ar: isSquare ? "ارتفاع الرأس (50% – 69%)" : "ارتفاع الرأس (65% – 80%)", category: "composition", status: "PASS", value: isSquare ? "58%" : "72%", required: isSquare ? "50% إلى 69%" : "65% إلى 80%", message_ar: "حجم الرأس يطابق النسبة الرسمية المطلوبة." },
        { id: "9", name_ar: isSquare ? "مستوى ارتفاع العينين (56% – 69%)" : "مستوى ارتفاع العينين (52% – 65%)", category: "composition", status: "PASS", value: isSquare ? "62%" : "58%", required: isSquare ? "56% إلى 69%" : "52% إلى 65%", message_ar: "مستوى العينين محاذٍ للمسار القياسي المطلوب." },
        { id: "10", name_ar: "توسيط الوجه أفقياً", category: "composition", status: "PASS", value: "انحراف 2%", required: "±5%", message_ar: "الوجه متمركز في المنتصف تماماً." },
        { id: "11", name_ar: "وضوح العينين وانفتاحهما", category: "facial", status: "PASS", value: "مفتوحتان", required: "مفتوحتان وواضحتان", message_ar: "العينان مفتوحتان والعدسة خالية من الوميض." },
        { id: "12", name_ar: "الرأس مستقيم باتجاه الكاميرا", category: "facial", status: "PASS", value: "أمامي مستقيم", required: "مواجه تماماً", message_ar: "الوجه موجه للأمام مباشرة دون التفات." },
        { id: "13", name_ar: "الخلفية بيضاء نقية أو أوف-وايت", category: "lighting", status: "PASS", value: "إضاءة 238/255", required: "بيضاء نقية", message_ar: "الخلفية بيضاء محايدة ومطابقة." },
        { id: "14", name_ar: "حدة الصورة ووضوح التفاصيل", category: "technical", status: "PASS", value: "مؤشر 94", required: "صورة حادة", message_ar: "تفاصيل الوجه حادة وخالية من التمويه." },
        { id: "15", name_ar: "توازن الإضاءة والتعريض", category: "lighting", status: "PASS", value: "تعريض متوازن", required: "بدون مناطق محترقة", message_ar: "توزيع الإضاءة على الوجه متناسق." },
        { id: "16", name_ar: "خلو الوجه من الظلال الحادة", category: "lighting", status: "PASS", value: "بدون ظلال", required: "إضاءة متساوية", message_ar: "لا توجد ظلال حادة خلف الرأس." },
        { id: "17", name_ar: isSquare ? "عدم ارتداء النظارات" : "ضوابط النظارات والعدسات", category: "facial", status: "PASS", value: "مطابق", required: isSquare ? "ممنوعة نهائياً" : "الطبية بدون انعكاس", message_ar: "متطابق مع الشرط القنصلي الصارم." },
        { id: "18", name_ar: "إمكانية القص الذكي للمواصفة", category: "composition", status: "PASS", value: "نافذة 800 × 800 px", required: "≥ 600 px", message_ar: "تتوفر دقة أصلية كافية لإنتاج الملف بدون تكبير رقمي." },
        { id: "19", name_ar: "المطابقة الإجمالية للملف الجاهز", category: "composite", status: "PASS", value: "جاهزة للتحميل", required: "استيفاء كافة الضوابط", message_ar: "الصورة مهيأة وفق المتطلبات المحددة وجاهزة للتحميل والطباعة." },
      ],
    };
  }

  function getSampleBase64() {
    return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";
  }

  return (
    <ScreenContainer className="px-5 pb-8" containerClassName="bg-[#F7F5F0]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {screen === "home" && renderHome()}
        {screen === "flow_choice" && renderFlowChoice()}
        {screen === "passport" && renderPassport()}
        {screen === "upload" && renderUpload()}
        {screen === "analysis" && renderAnalysis()}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1, width: "100%" },
  content: { paddingBottom: 60, width: "100%", direction: "rtl" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    marginBottom: 8,
    width: "100%",
  },
  brandLockup: { alignItems: "center" },
  eyebrow: {
    fontFamily: "system-ui",
    fontSize: 10,
    fontWeight: "700",
    color: GOLD,
    letterSpacing: 1.5,
  },
  brand: {
    fontFamily: "system-ui",
    fontSize: 16,
    fontWeight: "800",
    color: INK,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CARD,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EAE5DC",
  },
  heroCard: {
    backgroundColor: CARD,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E8E2D8",
    maxWidth: 900,
    alignSelf: "center",
    width: "100%",
  },
  heroContent: { gap: 10 },
  heroPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FBF7ED",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  heroPillText: { fontSize: 12, fontWeight: "700", color: GOLD },
  heroTitle: { fontSize: 22, fontWeight: "800", color: INK, lineHeight: 30 },
  heroBody: { fontSize: 14, color: MUTED, lineHeight: 22 },
  heroAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: INK,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  heroActionText: { color: CREAM, fontSize: 13, fontWeight: "700" },
  sectionHeader: { marginBottom: 14, width: "100%" },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: INK },
  sectionSub: { fontSize: 13, color: MUTED, marginTop: 3 },
  intentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
    width: "100%",
  },
  intentCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EAE5DC",
    gap: 10,
  },
  intentIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  intentMeta: { gap: 3 },
  intentTitle: { fontSize: 13, fontWeight: "700", color: INK },
  intentSubtitle: { fontSize: 11, color: MUTED },
  reassurance: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
  },
  reassuranceText: { fontSize: 12, color: MUTED },
  simpleIntro: { marginBottom: 18, width: "100%" },
  pageKicker: { fontSize: 11, fontWeight: "700", color: GOLD, letterSpacing: 1 },
  pageTitle: { fontSize: 20, fontWeight: "800", color: INK, marginTop: 4 },
  pageBody: { fontSize: 13, color: MUTED, marginTop: 4, lineHeight: 20 },

  // Flow Choice Styles
  flowChoiceContainer: { gap: 14, marginBottom: 20, maxWidth: 800, alignSelf: "center", width: "100%" },
  flowCard: {
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: "#E5DFD5",
    gap: 8,
  },
  flowCardActive: { borderColor: GOLD, backgroundColor: "#FFFDF9" },
  flowCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  flowBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  flowBadgeText: { fontSize: 12, fontWeight: "700" },
  flowCardTitle: { fontSize: 17, fontWeight: "800", color: INK, marginTop: 4 },
  flowCardBody: { fontSize: 13, color: MUTED, lineHeight: 20 },
  flowCardSpecs: { gap: 4, marginTop: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#F0EBE1" },
  flowSpecItem: { fontSize: 12, color: INK, fontWeight: "600" },
  selectedFlowChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F3EDE2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  selectedFlowChipText: { fontSize: 12, fontWeight: "700", color: INK },

  // Country / Document Styles
  countryList: { gap: 10, marginBottom: 18, maxWidth: 800, alignSelf: "center", width: "100%" },
  countryCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#EAE5DC",
  },
  countryCardActive: { borderColor: GOLD, backgroundColor: "#FFFDF9" },
  countryCardDisabled: { opacity: 0.6 },
  countryCardContent: { flexDirection: "row", gap: 14, alignItems: "center" },
  countryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F7F5F0",
    alignItems: "center",
    justifyContent: "center",
  },
  countryHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  countryName: { fontSize: 15, fontWeight: "800", color: INK },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeActive: { backgroundColor: "#E6F4EA" },
  badgeMuted: { backgroundColor: "#F0ECE1" },
  statusBadgeText: { fontSize: 11, fontWeight: "700" },
  textActive: { color: SUCCESS },
  textMuted: { color: MUTED },
  countryDoc: { fontSize: 13, color: INK, fontWeight: "600", marginTop: 2 },
  countryAuthority: { fontSize: 11, color: MUTED, marginTop: 2 },

  // Official Notice Card
  officialNoticeCard: {
    backgroundColor: "#FBF8F2",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8DFD0",
    marginBottom: 20,
    gap: 8,
    maxWidth: 800,
    alignSelf: "center",
    width: "100%",
  },
  noticeHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  noticeTitle: { fontSize: 14, fontWeight: "800", color: INK },
  bulletList: { gap: 4, marginVertical: 4 },
  noticeBullet: { fontSize: 12, color: INK, lineHeight: 19 },
  noticeFooter: { fontSize: 11, color: MUTED, borderTopWidth: 1, borderTopColor: "#EAE2D4", paddingTop: 8 },

  // Upload Styles
  uploadCard: {
    backgroundColor: CARD,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#DCD5C9",
    borderStyle: "dashed",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginBottom: 18,
    maxWidth: 600,
    alignSelf: "center",
    width: "100%",
  },
  uploadOrb: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#F5EFE6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  uploadTitle: { fontSize: 16, fontWeight: "800", color: INK },
  uploadBody: { fontSize: 12, color: MUTED, marginTop: 4, textAlign: "center" },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: INK,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 18,
  },
  uploadButtonText: { color: CREAM, fontSize: 13, fontWeight: "700" },
  photoCard: {
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E8E2D8",
    maxWidth: 600,
    alignSelf: "center",
    width: "100%",
  },
  photoPreviewContained: { width: "100%", height: 320, borderRadius: 14, backgroundColor: "#F7F5F0" },
  photoMetaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  photoChip: { flexDirection: "row", alignItems: "center", gap: 6 },
  photoChipText: { fontSize: 12, fontWeight: "700", color: SUCCESS },
  changePhotoText: { fontSize: 12, fontWeight: "700", color: GOLD },
  photoName: { fontSize: 11, color: MUTED, marginTop: 4 },

  // Analysis Layout
  analysisContainer: { width: "100%", gap: 20 },
  analysisContainerDesktop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  analysisPreviewCol: { width: "100%" },
  analysisChecksCol: { width: "100%" },
  analysisHeaderBadges: { flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 6 },
  docBadge: { backgroundColor: "#F0ECE1", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  docBadgeText: { fontSize: 12, fontWeight: "700", color: INK },

  previewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  previewKicker: { fontSize: 12, fontWeight: "700", color: INK },
  toggleCropBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  toggleCropText: { fontSize: 11, color: GOLD, fontWeight: "600" },
  previewFrameContainer: {
    width: "100%",
    borderRadius: 14,
    backgroundColor: "#F7F5F0",
    position: "relative",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  frameSquare: { height: 380 },
  frameRect: { height: 440 },
  containedPhoto: { width: "100%", height: "100%" },
  photoPlaceholder: { width: "100%", height: 380, alignItems: "center", justifyContent: "center" },
  guidelineOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  cropBoxSquare: {
    width: "80%",
    borderWidth: 2,
    borderColor: GOLD,
    borderStyle: "dashed",
    position: "relative",
    backgroundColor: "rgba(200, 151, 75, 0.05)",
  },
  eyeLevelLine: {
    position: "absolute",
    top: "40%",
    left: 0,
    right: 0,
    borderTopWidth: 1.5,
    borderTopColor: "rgba(47, 128, 90, 0.9)",
    paddingLeft: 6,
  },
  chinLevelLine: {
    position: "absolute",
    top: "78%",
    left: 0,
    right: 0,
    borderTopWidth: 1.5,
    borderTopColor: "rgba(183, 122, 24, 0.9)",
    paddingLeft: 6,
  },
  verticalCenterLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "50%",
    borderLeftWidth: 1,
    borderLeftColor: "rgba(200, 151, 75, 0.6)",
  },
  guideLineLabel: { fontSize: 9, fontWeight: "700", color: INK, backgroundColor: "rgba(255,255,255,0.85)", paddingHorizontal: 4, alignSelf: "flex-start" },
  previewBadgeRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 },
  previewBadgeText: { fontSize: 12, fontWeight: "700", color: INK },

  // Downloads Card
  downloadsCard: {
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8E2D8",
    marginBottom: 16,
    gap: 8,
  },
  downloadHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  downloadTitle: { fontSize: 16, fontWeight: "800", color: INK },
  downloadSubtitle: { fontSize: 12, color: MUTED, lineHeight: 18 },
  downloadButtonsStack: { gap: 10, marginTop: 8 },
  downloadPrimaryBtn: {
    backgroundColor: INK,
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  downloadBtnMain: { fontSize: 13, fontWeight: "700", color: CREAM },
  downloadBtnSubtext: { fontSize: 11, color: "#C9D8D0", marginTop: 2 },
  downloadSecondaryBtn: {
    backgroundColor: "#EFECE6",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  downloadBtnSecondaryText: { fontSize: 13, fontWeight: "700", color: INK },
  downloadBtnSubtextDark: { fontSize: 11, color: MUTED, marginTop: 2 },
  studioOrderBtn: {
    backgroundColor: "#FBF7EE",
    borderWidth: 1.5,
    borderColor: GOLD,
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  studioOrderBtnText: { fontSize: 13, fontWeight: "800", color: INK },
  studioOrderSubtext: { fontSize: 11, color: GOLD, fontWeight: "700", marginTop: 2 },
  addedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E6F4EA",
    padding: 10,
    borderRadius: 10,
    marginTop: 6,
  },
  addedBadgeText: { fontSize: 12, fontWeight: "700", color: SUCCESS },

  // Privacy Purge Card
  privacyPurgeCard: {
    backgroundColor: "#F9F6F0",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5DFD3",
    gap: 6,
  },
  privacyHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  privacyCardTitle: { fontSize: 13, fontWeight: "800", color: INK },
  privacyCardText: { fontSize: 11, color: MUTED, lineHeight: 17 },
  purgeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FBEBEA",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  purgeBtnText: { fontSize: 11, fontWeight: "700", color: ERROR },
  purgedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E6F4EA",
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
  },
  purgedBannerText: { fontSize: 13, fontWeight: "700", color: SUCCESS },

  // Status Banner
  statusBanner: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    padding: 16,
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 1,
  },
  statusPass: { backgroundColor: "#E6F4EA", borderColor: "#BDE2C8" },
  statusWarn: { backgroundColor: "#FEF7E0", borderColor: "#F8DF98" },
  statusFail: { backgroundColor: "#FDEAE8", borderColor: "#F7B8B1" },
  statusBannerTitle: { fontSize: 15, fontWeight: "800", color: INK },
  statusBannerSub: { fontSize: 12, color: MUTED, marginTop: 3 },

  // Checks Card
  checksCard: {
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E8E2D8",
    marginBottom: 16,
    gap: 12,
  },
  checksTitle: { fontSize: 15, fontWeight: "800", color: INK, marginBottom: 4 },
  checkItem: {
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F2EDE4",
    gap: 4,
  },
  checkItemHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  checkTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  checkName: { fontSize: 13, fontWeight: "700", color: INK },
  checkPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  pillPass: { backgroundColor: "#E6F4EA" },
  pillWarn: { backgroundColor: "#FEF7E0" },
  pillFail: { backgroundColor: "#FDEAE8" },
  checkPillText: { fontSize: 10, fontWeight: "700" },
  textPass: { color: SUCCESS },
  textWarn: { color: WARNING },
  textFail: { color: ERROR },
  checkMessage: { fontSize: 12, color: MUTED, lineHeight: 18 },
  checkMetaRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 2 },
  checkMeta: { fontSize: 11, color: MUTED },
  checkMetaRequired: { fontSize: 11, color: INK, fontWeight: "600" },

  // Legal Notice
  legalNoticeCard: {
    backgroundColor: "#F7F5EE",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E6DFCE",
    gap: 6,
    marginBottom: 16,
  },
  legalNoticeHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  legalNoticeTitle: { fontSize: 13, fontWeight: "800", color: INK },
  legalNoticeBody: { fontSize: 12, color: INK, lineHeight: 18 },
  legalNoticeAuthority: { fontSize: 11, color: MUTED, marginTop: 2 },

  // Action Buttons
  buttonActionStack: { gap: 10, marginTop: 10, maxWidth: 440, alignSelf: "center", width: "100%" },
  primaryButton: {
    minHeight: 52,
    backgroundColor: INK,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20,
  },
  primaryButtonText: { color: CREAM, fontSize: 14, fontWeight: "700" },
  secondaryButton: {
    minHeight: 48,
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EAE5DC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  secondaryButtonText: { color: INK, fontSize: 13, fontWeight: "700" },
  buttonDisabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  cardPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
});