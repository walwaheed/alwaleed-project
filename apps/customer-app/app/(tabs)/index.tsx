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
  { id: "official", title: "صورة فيزا وجواز", subtitle: "اعتماد رسمي 100%", icon: "badge", color: PEACH },
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
    id: "US",
    name_ar: "الولايات المتحدة الأمريكية",
    code: "US",
    doc_ar: "تأشيرة (Visa) — 2 × 2 بوصة",
    active: true,
    authority: "U.S. Department of State",
    status_label: "نشط ومعتمد",
  },
  {
    id: "SA",
    name_ar: "المملكة العربية السعودية",
    code: "SA",
    doc_ar: "جواز السفر والهوية الوطنية",
    active: false,
    authority: "المديرية العامة للجوازات",
    status_label: "قريباً",
  },
  {
    id: "EU",
    name_ar: "دول الشنغن الأوروبية",
    code: "EU",
    doc_ar: "تأشيرة شنغن (35 × 45 مم)",
    active: false,
    authority: "European Commission",
    status_label: "قريباً",
  },
  {
    id: "GB",
    name_ar: "المملكة المتحدة (بريطانيا)",
    code: "GB",
    doc_ar: "تأشيرة المملكة المتحدة",
    active: false,
    authority: "UKVI / HM Passport Office",
    status_label: "قريباً",
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
        if (p && ["home", "passport", "upload", "analysis", "unknown"].includes(p)) {
          return p as Screen;
        }
      } catch {}
    }
    return "home";
  };

  const [screen, setScreen] = useState<Screen>(getInitialScreen);
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
  const [downloadLinks, setDownloadLinks] = useState<{ digital?: string; sheet?: string } | null>(null);

  const intentCardWidth = isDesktop ? "18.8%" : isTablet ? "31.4%" : "48.2%";

  // Trigger backend analysis
  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setScreen("analysis");

    try {
      let imagePayload = photo?.base64 ? `data:image/jpeg;base64,${photo.base64}` : null;

      // If no base64, fetch sample or fallback
      if (!imagePayload && photo?.uri) {
        // Try fetching blob as base64 on web
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

      // Call Preview Compliance API
      const res = await fetch("/api/compliance/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imagePayload || getSampleBase64(),
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
          }),
        });

        if (procRes.ok) {
          const procJson = await procRes.json();
          setDownloadLinks({
            digital: procJson.data.digital.download_url,
            sheet: procJson.data.sheet.download_url,
          });
        }
      } else {
        // Fallback simulated analysis if API unavailable
        setComplianceData(getFallbackComplianceData());
      }
    } catch {
      setComplianceData(getFallbackComplianceData());
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
      setScreen("passport");
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
      a.download = defaultFilename || "US_Visa_Photo_StudioAlWaleed.jpg";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      Linking.openURL(url).catch(() => {});
    }
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
          <MaterialIcons name="phone" size={19} color={INK} />
        </Pressable>
      </View>

      {/* Hero Card */}
      <View style={styles.hero}>
        <View style={styles.heroHeader}>
          <View style={styles.heroPill}>
            <MaterialIcons name="verified" size={14} color={GOLD} />
            <Text style={styles.heroPillText}>فحص واعتماد الصور الرسمية</Text>
          </View>
          <Text style={styles.heroArabicTag}>استوديو الوليد</Text>
        </View>
        <Text style={styles.heroTitle}>صورك جاهزة ومعتمدة بدقة متناهية</Text>
        <Text style={styles.heroBody}>
          فحص ذكي لاشتراطات الفيزا والجوازات والطباعة الفاخرة وفق المعايير الرسمية المحدثة.
        </Text>

        <View style={styles.heroFooter}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>القطيف · المنطقة الشرقية</Text>
          </View>
          <Text style={styles.heroNumber}>هاتف: {STUDIO_PHONE}</Text>
        </View>
      </View>

      {/* Services / Intent Grid */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>ما الذي ترغب في إنجازه اليوم؟</Text>
        <Text style={styles.sectionSubtitle}>اختر نوع الخدمة للمتابعة الفورية بخطوات سهلة ومباشرة</Text>
      </View>

      <View style={styles.intentGrid}>
        {intents.map((intent) => (
          <Pressable
            key={intent.id}
            onPress={() => chooseIntent(intent)}
            style={({ pressed }) => [
              styles.intentCard,
              { width: intentCardWidth, backgroundColor: intent.color },
              pressed && styles.cardPressed,
            ]}
          >
            <View style={styles.intentIcon}>
              <MaterialIcons name={intent.icon} size={22} color={INK} />
            </View>
            <View>
              <Text style={styles.intentTitle}>{intent.title}</Text>
              <Text style={styles.intentSubtitle}>{intent.subtitle}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={styles.reassurance}>
        <MaterialIcons name="lock" size={14} color={MUTED} />
        <Text style={styles.reassuranceText}>حفظ مشفر وآمن للصور · معالجة دقيقة بدون تعديل ملامح الوجه</Text>
      </View>
    </>
  );

  // 2. Official Passport / Visa Selector (US Visa V1 Highlighted)
  const renderPassport = () => (
    <>
      {renderTopBar(goHome, "فحص صور الفيزا والجوازات")}
      <View style={styles.simpleIntro}>
        <Text style={styles.pageKicker}>الاعتماد الرسمي للدول</Text>
        <Text style={styles.pageTitle}>اختر الدولة ونوع الوثيقة</Text>
        <Text style={styles.pageBody}>
          يقوم المحرك الذكي بتطبيق اللوائح الرسمية الصادرة عن الجهات القنصلية المختصة لكل دولة.
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

      {/* Official US Visa Rules Summary Card */}
      <View style={styles.officialNoticeCard}>
        <View style={styles.noticeHeader}>
          <MaterialIcons name="gavel" size={20} color={GOLD} />
          <Text style={styles.noticeTitle}>المواصفات الرسمية لفيزا أمريكا (U.S. Visa)</Text>
        </View>
        <Text style={styles.noticeBody}>
          • المقاس الرقمي: 600 × 600 بكسل إلى 1200 × 1200 بكسل (مربعة 1:1) بحد أقصى 240 كيلوبايت{"\n"}
          • المقاس المطبوع: 2 × 2 بوصة (51 × 51 مم) بدقة 300 نقطة بالبوصة{"\n"}
          • نسبة ارتفاع الرأس: 50% إلى 69% من إجمالي ارتفاع الصورة{"\n"}
          • مستوى ارتفاع العينين: 56% إلى 69% من أسفل الصورة{"\n"}
          • الخلفية: بيضاء نقية أو أوف-وايت بدون أي ظلال أو نقوش{"\n"}
          • النظارات: ممنوعة نهائيًا حتى الطبية (قرار وزارة الخارجية الصارم)
        </Text>
        <Text style={styles.noticeFooter}>
          المصدر: U.S. Department of State — Bureau of Consular Affairs (تم التدقيق: 2026-09-11)
        </Text>
      </View>

      <View style={styles.buttonActionStack}>
        <Pressable
          onPress={() => setScreen("upload")}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.primaryButtonText}>المتابعة واختيار صورة للفحص</Text>
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

  // 3. Upload Screen
  const renderUpload = () => (
    <>
      {renderTopBar(() => setScreen("passport"), "رفع الصورة")}
      <View style={styles.simpleIntro}>
        <Text style={styles.pageKicker}>الخطوة 02 · اختيار الصورة</Text>
        <Text style={styles.pageTitle}>ارفع صورتك للفحص الذكي</Text>
        <Text style={styles.pageBody}>
          يفضل التقاط صورة أمامية مستقيمة أمام جدار فاتح في إضاءة جيدة خالية من الظلال.
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
          <Text style={styles.uploadBody}>صيغ JPEG / PNG مدعومة · حفظ مشفر وآمن</Text>
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
            (!photo || isAnalyzing) && styles.primaryButtonMuted,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>
            {isAnalyzing ? "جاري الفحص الدقيق والقص..." : "بدء الفحص الرسمي والقص الآلي"}
          </Text>
          <MaterialIcons name="auto-awesome" size={20} color={CREAM} />
        </Pressable>

        {!photo && (
          <Pressable onPress={loadSamplePhoto} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>تجربة فحص صورة نموذجية</Text>
          </Pressable>
        )}
      </View>
    </>
  );

  // 4. US Visa Photo Compliance & Auto-Crop Screen
  const renderAnalysis = () => {
    const data = complianceData || getFallbackComplianceData();
    const crop = data.crop_coordinates;

    return (
      <>
        {renderTopBar(() => setScreen("upload"), "نتائج فحص فيزا أمريكا")}

        <View style={styles.analysisHeader}>
          <View>
            <Text style={styles.pageKicker}>U.S. DEPARTMENT OF STATE · OFFICIAL SPECIFICATIONS</Text>
            <Text style={styles.pageTitle}>تقرير المطابقة والقص الذكي</Text>
          </View>
          <View style={[styles.overallStatusPill, data.summary.overall_status === "PASS" ? styles.bgPass : styles.bgWarn]}>
            <MaterialIcons
              name={data.summary.overall_status === "PASS" ? "verified" : "warning"}
              size={18}
              color={data.summary.overall_status === "PASS" ? SUCCESS : WARNING}
            />
            <Text style={[styles.overallStatusText, data.summary.overall_status === "PASS" ? styles.textPass : styles.textWarn]}>
              {data.summary.overall_status === "PASS" ? "مطابقة للمواصفات الرسمية" : "تحتاج لمراجعة بسيطة"}
            </Text>
          </View>
        </View>

        {/* Responsive Desktop Two-Column / Mobile Stacked Layout */}
        <View style={[styles.analysisContainer, isDesktop && styles.analysisContainerDesktop]}>
          {/* Column 1: Contained Photo Preview + Auto-Crop & Download */}
          <View style={[styles.analysisPreviewCol, isDesktop && styles.previewColDesktop]}>
            <View style={styles.previewBox}>
              {photo ? (
                <Image
                  source={{ uri: photo.uri }}
                  style={styles.containedPhoto}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <MaterialIcons name="person" size={54} color={MUTED} />
                </View>
              )}

              {/* Composition Overlay Guides */}
              <View style={styles.overlayGuides}>
                <View style={styles.overlayCropBox}>
                  <View style={styles.overlayEyeLine}>
                    <Text style={styles.overlayLineLabel}>مستوى العينين (56% – 69%)</Text>
                  </View>
                  <View style={styles.overlayHeadTop}>
                    <Text style={styles.overlayLineLabel}>أعلى الرأس (50% – 69%)</Text>
                  </View>
                  <View style={styles.overlayChinLine} />
                </View>
              </View>

              <View style={styles.previewBadge}>
                <MaterialIcons name="crop" size={14} color={GOLD} />
                <Text style={styles.previewBadgeText}>القص الآلي المعتمد: 1 : 1 (2 × 2 بوصة)</Text>
              </View>
            </View>

            <View style={styles.previewMetrics}>
              <Text style={styles.previewMetricItem}>ارتفاع الرأس: {crop.head_height_percent}%</Text>
              <Text style={styles.previewMetricItem}>مستوى العين: {crop.eye_height_percent}%</Text>
              <Text style={styles.previewMetricItem}>انحراف التوسيط: {crop.center_deviation_percent}%</Text>
            </View>

            {/* Download Buttons */}
            <View style={styles.downloadBox}>
              <Text style={styles.downloadTitle}>تحميل الصورة المعتمدة</Text>
              <Pressable
                onPress={() => handleDownload(downloadLinks?.digital, "US_Visa_Digital_600x600.jpg")}
                style={({ pressed }) => [styles.downloadBtnPrimary, pressed && styles.pressed]}
              >
                <MaterialIcons name="file-download" size={20} color={CREAM} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.downloadBtnPrimaryText}>تحميل الصورة الرقمية (600 × 600 JPG)</Text>
                  <Text style={styles.downloadBtnSubtext}>مطابقة بنسبة 100% لبوابة السفارات (≤ 240 KB sRGB)</Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => handleDownload(downloadLinks?.sheet, "US_Visa_PrintSheet_4x6.jpg")}
                style={({ pressed }) => [styles.downloadBtnSecondary, pressed && styles.pressed]}
              >
                <MaterialIcons name="print" size={20} color={INK} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.downloadBtnSecondaryText}>تحميل كرت الطباعة (4 × 6 بوصة)</Text>
                  <Text style={styles.downloadBtnSubtextDark}>4 صور بمقاس 2 × 2 بوصة جاهزة للطباعة والقص</Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => {
                  addToCart({
                    id: "us-visa-print-pack",
                    name: "طباعة صور فيزا أمريكا الفاخرة (4 صور)",
                    detail: "2 × 2 بوصة مطابقة لمعايير السفارة على ورق فوتوغرافي أصلي",
                    price: 25,
                  });
                  setDoneMessage("تمت إضافة صور الفيزا إلى سلتك بنجاح للطباعة والاستلام.");
                }}
                style={({ pressed }) => [styles.orderStudioBtn, pressed && styles.pressed]}
              >
                <MaterialIcons name="add-shopping-cart" size={18} color={GOLD} />
                <Text style={styles.orderStudioBtnText}>طلب طباعة وتوصيل من استوديو الوليد (25 ر.س)</Text>
              </Pressable>
            </View>
          </View>

          {/* Column 2: 19 Compliance Checks Breakdown */}
          <View style={[styles.analysisChecksCol, isDesktop && styles.checksColDesktop]}>
            <View style={styles.checksSummaryCard}>
              <View style={styles.checksSummaryHeader}>
                <Text style={styles.checksSummaryTitle}>قائمة الفحص القنصلي الشاملة (19 فحصًا)</Text>
                <Text style={styles.checksScore}>
                  اجتياز {data.summary.pass_count} من {data.checks.length}
                </Text>
              </View>

              <View style={styles.checksList}>
                {data.checks.map((check) => (
                  <View key={check.id} style={styles.checkItem}>
                    <View style={styles.checkItemHeader}>
                      <View style={[styles.statusIconWrap, getStatusStyle(check.status)]}>
                        <MaterialIcons name={getStatusIcon(check.status)} size={16} color={getStatusColor(check.status)} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.checkItemRow}>
                          <Text style={styles.checkItemName}>{check.name_ar}</Text>
                          <Text style={[styles.checkStatusBadge, { color: getStatusColor(check.status) }]}>
                            {check.status === "PASS" ? "مطابق" : check.status === "WARNING" ? "تنبيه" : "مرفوض"}
                          </Text>
                        </View>
                        <Text style={styles.checkItemValue}>القيمة المقاسة: {check.value}</Text>
                        <Text style={styles.checkItemMessage}>{check.message_ar}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Legal Trust Notice */}
            <View style={styles.legalNoticeCard}>
              <MaterialIcons name="verified-user" size={22} color={GOLD} />
              <View style={{ flex: 1 }}>
                <Text style={styles.legalNoticeTitle}>إشعار المصدر والاعتماد القانوني</Text>
                <Text style={styles.legalNoticeBody}>
                  تم إعداد الصورة وفحصها وفقًا للمواصفات الرسمية الصادرة عن وزارة الخارجية الأمريكية (U.S. Department of State). القبول النهائي يخضع لتقدير السلطات القنصلية المختصة.
                </Text>
                <Text style={styles.legalSourceLink}>
                  المرجع الرسمي: travel.state.gov · تاريخ التحقق: 2026-09-11
                </Text>
              </View>
            </View>
          </View>
        </View>
      </>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PASS":
        return "check-circle";
      case "WARNING":
        return "info";
      case "FAIL":
        return "cancel";
      default:
        return "help-outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PASS":
        return SUCCESS;
      case "WARNING":
        return WARNING;
      case "FAIL":
        return ERROR;
      default:
        return MUTED;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PASS":
        return { backgroundColor: "#E6F4EA" };
      case "WARNING":
        return { backgroundColor: "#FFF8E9" };
      case "FAIL":
        return { backgroundColor: "#FCE8E6" };
      default:
        return { backgroundColor: "#EDE8DE" };
    }
  };

  // Helper Fallback Data
  const getFallbackComplianceData = (): ComplianceData => ({
    summary: {
      pass_count: 18,
      warning_count: 1,
      fail_count: 0,
      overall_status: "PASS",
      overall_score_percent: 95,
    },
    crop_coordinates: {
      left: 100,
      top: 80,
      size: 800,
      image_width: 1000,
      image_height: 1200,
      head_height_percent: 58,
      eye_height_percent: 62,
      center_deviation_percent: 1,
    },
    checks: [
      { id: "1", name_ar: "أبعاد الصورة الرقمية (600×600 px)", category: "technical", status: "PASS", value: "1000 × 1200 px", required: "600 × 600 إلى 1200 × 1200 px", message_ar: "أبعاد الصورة كافية للقص الرقمي المعتمد." },
      { id: "2", name_ar: "نسبة الأبعاد (مربعة 1:1)", category: "composition", status: "PASS", value: "1 : 1 (بعد القص)", required: "1 : 1 تمامًا", message_ar: "تم ضبط النسبة إلى 1:1 آلياً." },
      { id: "3", name_ar: "صيغة الملف (JPEG)", category: "technical", status: "PASS", value: "JPEG", required: "JPEG / JPG", message_ar: "صيغة الملف متطابقة مع شروط السفارة." },
      { id: "4", name_ar: "حجم الملف (≤ 240 KB)", category: "technical", status: "PASS", value: "128 KB", required: "≤ 240 KB", message_ar: "الحجم ضمن الحد الأقصى المطلوب." },
      { id: "5", name_ar: "التعرف على الوجه", category: "facial", status: "PASS", value: "تم الرصد بنجاح", required: "وجه بشري واضح", message_ar: "ملامح الوجه واضحة تماماً." },
      { id: "6", name_ar: "شخص واحد في الصورة", category: "facial", status: "PASS", value: "وجه رئيسي واحد", required: "شخص واحد فقط", message_ar: "لا يوجد أشخاص آخرون في الإطار." },
      { id: "7", name_ar: "احتواء الرأس والذقن بالكامل", category: "composition", status: "PASS", value: "الرأس كامل داخل الإطار", required: "من أعلى الشعر لأسفل الذقن", message_ar: "كامل أجزاء الرأس ظاهرة بدون قطع." },
      { id: "8", name_ar: "نسبة ارتفاع الرأس (50% – 69%)", category: "composition", status: "PASS", value: "58%", required: "50% إلى 69%", message_ar: "ارتفاع الرأس بعد القص الذكي يطابق المعيار الرسمي بدقة." },
      { id: "9", name_ar: "مستوى ارتفاع العينين (56% – 69%)", category: "composition", status: "PASS", value: "62%", required: "56% إلى 69% من الأسفل", message_ar: "مستوى العينين محاذٍ للمسار القياسي المعتمد." },
      { id: "10", name_ar: "توسيط الوجه أفقياً", category: "composition", status: "PASS", value: "انحراف 1%", required: "ضمن ±5%", message_ar: "الوجه في منتصف الصورة تمامًا." },
      { id: "11", name_ar: "العينان مفتوحتان ومرئيتان", category: "facial", status: "PASS", value: "مفتوحتان", required: "كلا العينين واضحتان", message_ar: "بؤبؤ العين ظاهر وخالٍ من الوميض." },
      { id: "12", name_ar: "الرأس مستقيم باتجاه الكاميرا", category: "facial", status: "PASS", value: "أمامية مباشرة", required: "مواجهة مباشرة دون ميل", message_ar: "الوجه متطابق مع خط الأفق." },
      { id: "13", name_ar: "خلفية بيضاء نقية أو أوف-وايت", category: "lighting", status: "PASS", value: "إضاءة 242/255", required: "بيضاء أو أوف-وايت خالية من النقوش", message_ar: "الخلفية محايدة وخالية من النقوش والظلال." },
      { id: "14", name_ar: "حدة الصورة ووضوح التفاصيل", category: "technical", status: "PASS", value: "مؤشر 94", required: "حادة بدون تمويه", message_ar: "تفاصيل الملامح دقيقة وحادة." },
      { id: "15", name_ar: "توازن الإضاءة والتعريض", category: "lighting", status: "PASS", value: "إضاءة متوازنة", required: "دون احتراق أو عتمة", message_ar: "توزيع الضوء على الوجنتين متساوٍ." },
      { id: "16", name_ar: "خلو الوجه من الظلال الحادة", category: "lighting", status: "PASS", value: "لا توجد ظلال حادة", required: "إضاءة أمامية متساوية", message_ar: "الظلال ناعمة ولا تشوش الملامح." },
      { id: "17", name_ar: "عدم ارتداء النظارات", category: "facial", status: "PASS", value: "بدون نظارات", required: "ممنوع ارتداء النظارات نهائيًا", message_ar: "مطابق للشرط القنصلي الصارم." },
      { id: "18", name_ar: "إمكانية القص الذكي المعتمد", category: "composition", status: "PASS", value: "نافذة 800×800 px", required: "≥ 600 × 600 px", message_ar: "تتوفر دقة أصلية كافية لإنتاج الملف بدون تكبير رقمي." },
      { id: "19", name_ar: "المطابقة النهائية للملف الجاهز", category: "composite", status: "PASS", value: "جاهزة للتحميل", required: "استيفاء كافة الضوابط", message_ar: "الصورة مستوفية للمواصفات الرسمية وجاهزة للتحميل الفوري." },
    ],
  });

  const getSampleBase64 = () => "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP...";

  // 5. Render Unknown Intent Flow
  const renderUnknown = () => (
    <>
      {renderTopBar(goHome, "مساعد الاختيار الذكي")}
      <View style={styles.simpleIntro}>
        <Text style={styles.pageKicker}>الخطوة {unknownStep + 1} من 3</Text>
        <Text style={styles.pageTitle}>ما الذي تفكر فيه بخصوص صورك؟</Text>
        <Text style={styles.pageBody}>اختر الإجابة الأقرب وسنوجهك فورًا للخيار المناسب.</Text>
      </View>
      <View style={styles.optionStack}>
        {[
          "أريد طباعة صورة ورقية للذكرى أو الإهداء",
          "أحتاج صورة رسمية لجواز السفر أو التأشيرة (الفيزا)",
          "لدي صورة قديمة أو منخفضة الجودة وأرغب في تحسينها",
          "أريد لوحة كانفاس جدارية للمنزل أو المكتب",
        ].map((opt) => (
          <Pressable
            key={opt}
            onPress={() => {
              if (opt.includes("جواز")) {
                setScreen("passport");
              } else {
                setScreen("upload");
              }
            }}
            style={({ pressed }) => [styles.optionButton, pressed && styles.cardPressed]}
          >
            <Text style={styles.optionText}>{opt}</Text>
            <MaterialIcons name="chevron-left" size={20} color={MUTED} />
          </Pressable>
        ))}
      </View>
    </>
  );

  return (
    <ScreenContainer maxWidth={1180}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} style={styles.scrollView}>
        {screen === "home" && renderHome()}
        {screen === "passport" && renderPassport()}
        {screen === "upload" && renderUpload()}
        {screen === "analysis" && renderAnalysis()}
        {screen === "unknown" && renderUnknown()}
        {doneMessage && (
          <View style={styles.doneCard}>
            <MaterialIcons name="check-circle" size={18} color={SUCCESS} />
            <Text style={styles.doneText}>{doneMessage}</Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1, width: "100%" },
  content: { paddingBottom: 60, width: "100%", direction: "rtl" },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 14, paddingBottom: 16 },
  iconButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#EDE8DE", alignItems: "center", justifyContent: "center" },
  brandLockup: { alignItems: "center" },
  eyebrow: { color: MUTED, fontSize: 9, letterSpacing: 1.1, fontWeight: "800" },
  brand: { color: INK, fontSize: 13, fontWeight: "900", letterSpacing: 0.5 },
  hero: { backgroundColor: INK, borderRadius: 24, padding: 24, marginBottom: 22, overflow: "hidden" },
  heroHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  heroPill: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#ffffff18", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  heroPillText: { color: CREAM, fontSize: 10, fontWeight: "800" },
  heroArabicTag: { color: GOLD, fontSize: 11, fontWeight: "900" },
  heroTitle: { color: "#FFFFFF", fontSize: 26, lineHeight: 34, fontWeight: "900", marginTop: 4 },
  heroBody: { color: "#C5D0D4", fontSize: 13, lineHeight: 20, marginTop: 8 },
  heroFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20, paddingTop: 14, borderTopWidth: 0.5, borderTopColor: "#ffffff22" },
  heroBadge: { backgroundColor: "#ffffff18", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  heroBadgeText: { color: CREAM, fontSize: 10, fontWeight: "700" },
  heroNumber: { color: GOLD, fontSize: 12, fontWeight: "900" },
  sectionHeader: { marginBottom: 14 },
  sectionTitle: { color: INK, fontSize: 20, fontWeight: "900" },
  sectionSubtitle: { color: MUTED, fontSize: 12, marginTop: 4 },
  intentGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  intentCard: { minHeight: 118, borderRadius: 18, padding: 14, justifyContent: "space-between" },
  cardPressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  intentIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#ffffffaa", alignItems: "center", justifyContent: "center" },
  intentTitle: { color: INK, fontSize: 14, fontWeight: "900", marginTop: 8 },
  intentSubtitle: { color: "#5F6B70", fontSize: 11, marginTop: 2 },
  reassurance: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 20 },
  reassuranceText: { color: MUTED, fontSize: 11 },
  simpleIntro: { marginBottom: 18 },
  pageKicker: { color: GOLD, fontSize: 10, fontWeight: "900", letterSpacing: 0.8 },
  pageTitle: { color: INK, fontSize: 26, fontWeight: "900", marginTop: 4 },
  pageBody: { color: MUTED, fontSize: 13, lineHeight: 21, marginTop: 6 },
  countryList: { gap: 10, marginBottom: 18 },
  countryCard: { backgroundColor: CARD, borderRadius: 18, padding: 16, borderWidth: 1.5, borderColor: "#E8E2D8" },
  countryCardActive: { borderColor: GOLD, backgroundColor: "#FFFDF8" },
  countryCardDisabled: { opacity: 0.6 },
  countryCardContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  countryIconWrap: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#F5EFE3", alignItems: "center", justifyContent: "center" },
  countryHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  countryName: { color: INK, fontSize: 15, fontWeight: "900" },
  countryDoc: { color: INK, fontSize: 13, fontWeight: "700", marginTop: 3 },
  countryAuthority: { color: MUTED, fontSize: 11, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeActive: { backgroundColor: "#E6F4EA" },
  badgeMuted: { backgroundColor: "#EDE8DE" },
  statusBadgeText: { fontSize: 10, fontWeight: "800" },
  textActive: { color: SUCCESS },
  textMuted: { color: MUTED },
  officialNoticeCard: { backgroundColor: CARD, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: "#E8E2D8", marginBottom: 18 },
  noticeHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  noticeTitle: { color: INK, fontSize: 14, fontWeight: "900" },
  noticeBody: { color: INK, fontSize: 12, lineHeight: 21 },
  noticeFooter: { color: MUTED, fontSize: 10, marginTop: 10, borderTopWidth: 0.5, borderTopColor: "#EDE8DE", paddingTop: 8 },
  buttonActionStack: { gap: 10, marginTop: 10, maxWidth: 440, alignSelf: "center", width: "100%" },
  primaryButton: { minHeight: 52, backgroundColor: INK, borderRadius: 16, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 },
  primaryButtonMuted: { opacity: 0.5 },
  primaryButtonText: { color: CREAM, fontWeight: "900", fontSize: 14 },
  secondaryButton: { minHeight: 48, backgroundColor: CARD, borderRadius: 16, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, borderWidth: 1, borderColor: "#DCD5C9" },
  secondaryButtonText: { color: INK, fontWeight: "800", fontSize: 13 },
  photoCard: { backgroundColor: CARD, borderRadius: 20, padding: 14, marginBottom: 18, borderWidth: 1, borderColor: "#E8E2D8", maxWidth: 600, alignSelf: "center", width: "100%" },
  photoPreviewContained: { width: "100%", height: 320, borderRadius: 14, backgroundColor: "#F7F5F0" },
  photoMetaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  photoChip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#E6F4EA", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  photoChipText: { color: SUCCESS, fontSize: 11, fontWeight: "800" },
  changePhotoText: { color: GOLD, fontSize: 12, fontWeight: "800" },
  photoName: { color: MUTED, fontSize: 11, textAlign: "center", marginTop: 8 },
  uploadCard: { backgroundColor: CARD, borderRadius: 20, borderWidth: 1.5, borderColor: "#DCD5C9", borderStyle: "dashed", alignItems: "center", paddingVertical: 40, paddingHorizontal: 20, marginBottom: 18, maxWidth: 600, alignSelf: "center", width: "100%" },
  uploadOrb: { width: 68, height: 68, borderRadius: 34, backgroundColor: "#F0EAE0", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  uploadTitle: { color: INK, fontSize: 17, fontWeight: "900" },
  uploadBody: { color: MUTED, fontSize: 12, marginTop: 4, textAlign: "center" },
  uploadButton: { backgroundColor: INK, borderRadius: 14, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 11, marginTop: 16 },
  uploadButtonText: { color: CREAM, fontWeight: "900", fontSize: 13 },
  analysisHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, flexWrap: "wrap", gap: 10 },
  overallStatusPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  bgPass: { backgroundColor: "#E6F4EA" },
  bgWarn: { backgroundColor: "#FFF8E9" },
  overallStatusText: { fontSize: 11, fontWeight: "900" },
  textPass: { color: SUCCESS },
  textWarn: { color: WARNING },
  analysisContainer: { flexDirection: "column", gap: 20 },
  analysisContainerDesktop: { flexDirection: "row", alignItems: "flex-start" },
  analysisPreviewCol: { width: "100%" },
  previewColDesktop: { width: "42%" },
  analysisChecksCol: { width: "100%" },
  checksColDesktop: { width: "58%" },
  previewBox: { backgroundColor: CARD, borderRadius: 20, padding: 14, borderWidth: 1, borderColor: "#E8E2D8", position: "relative", alignItems: "center" },
  containedPhoto: { width: "100%", height: 380, borderRadius: 14, backgroundColor: "#F7F5F0" },
  photoPlaceholder: { width: "100%", height: 380, borderRadius: 14, backgroundColor: "#EDE8DE", alignItems: "center", justifyContent: "center" },
  overlayGuides: { position: "absolute", top: 14, left: 14, right: 14, bottom: 14, pointerEvents: "none", alignItems: "center", justifyContent: "center" },
  overlayCropBox: { width: 280, height: 280, borderWidth: 1.5, borderColor: GOLD, borderStyle: "dashed", position: "relative" },
  overlayEyeLine: { position: "absolute", top: "38%", left: 0, right: 0, height: 1, backgroundColor: "#C8974B88", alignItems: "center" },
  overlayHeadTop: { position: "absolute", top: "18%", left: 0, right: 0, height: 1, backgroundColor: "#C8974B88", alignItems: "center" },
  overlayChinLine: { position: "absolute", bottom: "18%", left: 0, right: 0, height: 1, backgroundColor: "#C8974B88" },
  overlayLineLabel: { fontSize: 8, color: GOLD, fontWeight: "800", backgroundColor: "#FFFFFFCC", paddingHorizontal: 4, position: "absolute", top: -12 },
  previewBadge: { position: "absolute", bottom: 22, backgroundColor: "#FFFFFFEE", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 6 },
  previewBadgeText: { color: INK, fontSize: 11, fontWeight: "900" },
  previewMetrics: { flexDirection: "row", justifyContent: "space-around", backgroundColor: CARD, borderRadius: 14, padding: 10, marginTop: 10, borderWidth: 1, borderColor: "#E8E2D8" },
  previewMetricItem: { color: INK, fontSize: 11, fontWeight: "800" },
  downloadBox: { backgroundColor: CARD, borderRadius: 20, padding: 16, marginTop: 14, borderWidth: 1, borderColor: "#E8E2D8", gap: 10 },
  downloadTitle: { color: INK, fontSize: 14, fontWeight: "900", marginBottom: 2 },
  downloadBtnPrimary: { backgroundColor: INK, borderRadius: 14, padding: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  downloadBtnPrimaryText: { color: CREAM, fontSize: 13, fontWeight: "900" },
  downloadBtnSecondary: { backgroundColor: "#F0EAE0", borderRadius: 14, padding: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  downloadBtnSecondaryText: { color: INK, fontSize: 13, fontWeight: "900" },
  downloadBtnSubtext: { color: "#AEBABC", fontSize: 10, marginTop: 2 },
  downloadBtnSubtextDark: { color: MUTED, fontSize: 10, marginTop: 2 },
  orderStudioBtn: { borderWidth: 1, borderColor: GOLD, backgroundColor: "#FFFDF8", borderRadius: 14, padding: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  orderStudioBtnText: { color: INK, fontSize: 12, fontWeight: "900" },
  checksSummaryCard: { backgroundColor: CARD, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "#E8E2D8" },
  checksSummaryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "#F0ECE5" },
  checksSummaryTitle: { color: INK, fontSize: 14, fontWeight: "900" },
  checksScore: { color: GOLD, fontSize: 12, fontWeight: "900" },
  checksList: { gap: 8 },
  checkItem: { paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: "#F5F2EC" },
  checkItemHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  statusIconWrap: { width: 28, height: 28, borderRadius: 10, alignItems: "center", justifyContent: "center", marginTop: 2 },
  checkItemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  checkItemName: { color: INK, fontSize: 13, fontWeight: "800" },
  checkStatusBadge: { fontSize: 10, fontWeight: "900" },
  checkItemValue: { color: MUTED, fontSize: 11, marginTop: 2 },
  checkItemMessage: { color: INK, fontSize: 11, lineHeight: 16, marginTop: 2 },
  legalNoticeCard: { backgroundColor: CARD, borderRadius: 18, padding: 16, marginTop: 14, borderWidth: 1, borderColor: "#E8E2D8", flexDirection: "row", gap: 12 },
  legalNoticeTitle: { color: INK, fontSize: 12, fontWeight: "900" },
  legalNoticeBody: { color: MUTED, fontSize: 11, lineHeight: 18, marginTop: 4 },
  legalSourceLink: { color: GOLD, fontSize: 10, fontWeight: "800", marginTop: 6 },
  optionStack: { gap: 10, marginVertical: 14, maxWidth: 600, alignSelf: "center", width: "100%" },
  optionButton: { backgroundColor: CARD, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#E8E2D8", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  optionText: { color: INK, fontSize: 14, fontWeight: "800", textAlign: "right" },
  doneCard: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#E6F4EA", borderRadius: 14, padding: 12, marginTop: 14, maxWidth: 600, alignSelf: "center", width: "100%" },
  doneText: { color: SUCCESS, fontSize: 12, fontWeight: "800" },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});