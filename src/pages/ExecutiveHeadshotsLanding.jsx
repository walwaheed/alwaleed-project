import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, Clock, ShieldCheck, MapPin, Phone, MessageCircle, 
  Calendar, User, ArrowRight, Star, AlertCircle, Sparkles,
  Camera, Briefcase, Award, Building2, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { analytics } from "@/utils/analytics";
import { getStoredUTMs } from "@/utils/utmCapture";

export default function ExecutiveHeadshotsLanding() {
  const [language, setLanguage] = useState("ar");
  const [selectedPackage, setSelectedPackage] = useState("executive");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    jobTitle: "",
    company: "",
    bookingDate: new Date().toISOString().split("T")[0],
    timeSlot: "18:00",
    paymentPreference: "studio",
    notes: ""
  });

  const isAr = language === "ar";

  useEffect(() => {
    try {
      analytics.pageViewed("executive-headshots", {
        category: "studio_portrait",
        service: "professional_headshot",
        language: language
      });
    } catch (e) {}
  }, [language]);

  const packages = [
    {
      id: "standard",
      nameAr: "الباقة المهنية (LinkedIn & CV)",
      nameEn: "Professional (LinkedIn & CV)",
      price: 150,
      time: isAr ? "20 دقيقة" : "20 Minutes",
      popular: false,
      featuresAr: [
        "جلسة تصوير داخل الاستوديو مع إضاءة بورتريه متقدمة",
        "توجيه احترافي للوضعيات والتعبيرات المناسبة لطبيعة عملك",
        "صورة رقمية واحدة مختارة ومعدلة بأعلى درجات الدقة (Retouched)",
        "تنسيق مخصص لملفات LinkedIn والسيرة الذاتية والمواقع الشخصية",
        "تسليم رقمي عالي الدقة خلال 24 ساعة عبر رابط خاص"
      ],
      featuresEn: [
        "20-minute studio portrait session with professional lighting",
        "Posing and expression guidance tailored to your career",
        "1 master retouched high-resolution digital image",
        "Optimized crops for LinkedIn, CV, and personal profiles",
        "Fast 24-hour private digital delivery"
      ]
    },
    {
      id: "executive",
      nameAr: "باقة القيادات والتنفيذيين (VIP Executive)",
      nameEn: "VIP Executive Branding",
      price: 350,
      time: isAr ? "45 دقيقة" : "45 Minutes",
      popular: true,
      featuresAr: [
        "جلسة متكاملة تتيح تغيير مظهرين أو زيّين (رسمي سعودي / بدلة عمل)",
        "3 صور رقمية رئيسية معدلة بالكامل (لقطة مقربة، نصفية، وزاوية قيادية)",
        "معالجة دقيقة للبشرة والتباين وتفاصيل الإضاءة السينمائية",
        "ترخيص تجاري وإعلامي مفتوح للمؤتمرات والصحافة والمواقع المؤسسية",
        "تسليم سريع خلال 24 ساعة + نسخة مصغرة محسنة للويب والجوال"
      ],
      featuresEn: [
        "45-minute comprehensive session with 2 outfit changes",
        "3 fully retouched images (close-up, half-body, environmental)",
        "Editorial high-end skin and contrast grading",
        "Full commercial & PR release for media and conferences",
        "Express 24-hour turnaround + web & print optimized files"
      ]
    },
    {
      id: "team",
      nameAr: "باقة فرق العمل والشركات (حتى 5 أفراد)",
      nameEn: "Corporate Team Package (Up to 5)",
      price: 950,
      time: isAr ? "90 دقيقة" : "90 Minutes",
      popular: false,
      featuresAr: [
        "تصوير موحد لخمسة أعضاء من الفريق مع خلفية وإضاءة مؤسسية متناسقة",
        "صورة معدلة واحدة لكل عضو من الفريق بمقاسات المواقع الرسمية",
        "صورة جماعية للفريق مشمولة في نفس الجلسة",
        "تنسيق مخصص لملفات التعريف بالموظفين في الشركات والعيادات والمكاتب",
        "فاتورة ضريبية نظامية متوفرة عند الطلب للشركات والمؤسسات"
      ],
      featuresEn: [
        "Consistent corporate lighting & backdrop for 5 team members",
        "1 retouched individual headshot per member",
        "1 cohesive group team photo included",
        "Ideal for corporate websites, clinics, and professional firms",
        "Official compliant VAT invoice available upon request"
      ]
    }
  ];

  const styleHighlights = [
    {
      titleAr: "إضاءة استوديو متقدمة",
      titleEn: "Master Studio Lighting",
      descAr: "نظام إضاءة متعدد الزوايا يُبرز الملامح بثقة واحترافية دون تشتيت.",
      descEn: "Multi-point lighting engineered to convey executive presence."
    },
    {
      titleAr: "توجيه وضعيات دقيق",
      titleEn: "Expert Posing Guidance",
      descAr: "نوجهك خطوة بخطوة للوقوف والتعبير الطبيعي الذي يعكس مكانتك المهنية.",
      descEn: "Step-by-step guidance ensuring natural, authoritative expressions."
    },
    {
      titleAr: "تعديل بشرة احترافي وغير مصطنع",
      titleEn: "Authentic Retouching",
      descAr: "معالجة راقية تُحافظ على ملامحك الحقيقية وتزيل اللمعان أو الشوائب البسيطة.",
      descEn: "Subtle, natural skin retouching that preserves authentic character."
    },
    {
      titleAr: "تسليم رقمي فوري وعالي الدقة",
      titleEn: "Instant High-Res Delivery",
      descAr: "استلم صورك بملفات أصلية للطباعة وأخرى مهيأة تماماً لـ LinkedIn والإنترنت.",
      descEn: "Receive full-resolution print files plus web-optimized LinkedIn crops."
    }
  ];

  const handlePackageSelect = (pkgId) => {
    setSelectedPackage(pkgId);
    try {
      analytics.ctaClicked(`select_headshot_${pkgId}`, {
        package_id: pkgId,
        service: "professional_headshot"
      });
    } catch (e) {}
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    const cleanPhone = formData.phone.replace(/[^0-9]/g, "");
    return formData.fullName.trim().length >= 3 && cleanPhone.length >= 9 && formData.bookingDate;
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setIsSubmitting(true);
    const selectedPkg = packages.find(p => p.id === selectedPackage);

    try {
      analytics.bookingStarted(selectedPackage, {
        package_name: isAr ? selectedPkg.nameAr : selectedPkg.nameEn,
        price: selectedPkg.price,
        date: formData.bookingDate
      });
    } catch (err) {}

    const utms = getStoredUTMs() || {};
    const orderRef = `ALW-HEADSHOT-${Date.now().toString().slice(-6)}`;
    const payload = {
      orderReference: orderRef,
      service: "studio_portrait",
      subService: "professional_headshot",
      packageId: selectedPackage,
      packageName: isAr ? selectedPkg.nameAr : selectedPkg.nameEn,
      priceSar: selectedPkg.price,
      customerName: formData.fullName,
      customerPhone: formData.phone,
      jobTitle: formData.jobTitle,
      company: formData.company,
      bookingDate: formData.bookingDate,
      timeSlot: formData.timeSlot,
      paymentPreference: formData.paymentPreference,
      notes: formData.notes,
      source: "executive_headshot_funnel",
      utm_source: utms.utm_source || "direct",
      utm_medium: utms.utm_medium || "none",
      utm_campaign: utms.utm_campaign || "none",
      utm_content: utms.utm_content || "",
      utm_term: utms.utm_term || "",
      referrer: utms.referrer || (typeof document !== "undefined" ? document.referrer : ""),
      landing_page: utms.landing_path || "/executive-headshots",
      device: typeof navigator !== "undefined" && /mobile/i.test(navigator.userAgent) ? "mobile" : "desktop",
      language: language,
      studioLocation: "2954 Uhud - Alwaha, Unit 1, Qatif",
      createdAt: new Date().toISOString()
    };

    try {
      await fetch("https://n8n.renovaai.cloud/webhook/Alwaleed-booking-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).catch(e => console.warn("Webhook dispatched:", e));

      analytics.bookingCompleted(selectedPackage, {
        order_reference: orderRef,
        revenue_sar: selectedPkg.price,
        customer_phone_masked: formData.phone.slice(0, 4) + "****" + formData.phone.slice(-2)
      });
    } catch (err) {
      console.warn("Analytics error:", err);
    } finally {
      setIsSubmitting(false);
      setSubmittedBooking({ ...payload, orderRef });
      setBookingSuccess(true);
    }
  };

  const generateWhatsAppUrl = () => {
    const selectedPkg = packages.find(p => p.id === selectedPackage);
    const text = isAr
      ? `السلام عليكم، أود حجز جلسة تصوير شخصي / تنفيذي (LinkedIn):\n\n` +
        `👤 الاسم: ${formData.fullName || "عميل استوديو الوليد"}\n` +
        `💼 المسمى/الشركة: ${formData.jobTitle || ""} ${formData.company ? `(${formData.company})` : ""}\n` +
        `📦 الباقة: ${selectedPkg?.nameAr} (${selectedPkg?.price} ريال)\n` +
        `📅 التاريخ: ${formData.bookingDate}\n` +
        `⏰ الوقت المفضل: ${formData.timeSlot}\n\n` +
        `أرجو تأكيد الموعد والتنسيق مع المصور.`
      : `Hello Studio AlWaleed, I'd like to book an executive headshot session:\n\n` +
        `👤 Name: ${formData.fullName || "Guest"}\n` +
        `💼 Title: ${formData.jobTitle || ""} ${formData.company ? `(${formData.company})` : ""}\n` +
        `📦 Package: ${selectedPkg?.nameEn} (${selectedPkg?.price} SAR)\n` +
        `📅 Date: ${formData.bookingDate}\n` +
        `⏰ Time: ${formData.timeSlot}\n\n` +
        `Please confirm studio slot availability.`;

    return `https://wa.me/966133444101?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className={`min-h-screen bg-[#FAFAFA] text-[#111827] font-['Tajawal',sans-serif] ${isAr ? 'rtl' : 'ltr'}`} dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Top Utility Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-[#111827]">
                STUDIO <span className="text-[#E63946]">ALWALEED</span>
              </span>
            </Link>
            <Badge variant="outline" className="hidden sm:inline-flex border-blue-200 text-[#1E3A8A] bg-blue-50 text-xs font-semibold px-2 py-0.5">
              {isAr ? "استوديو البورتريه التنفيذي والمهني" : "Executive & Professional Studio"}
            </Badge>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href="https://wa.me/966133444101"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-full transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>013 344 4101</span>
            </a>

            <button
              onClick={() => setLanguage(isAr ? "en" : "ar")}
              className="text-xs sm:text-sm font-bold border border-gray-300 hover:border-black px-2.5 py-1 rounded-md transition-colors"
            >
              {isAr ? "English" : "عربي"}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white border-b border-gray-100 pt-10 pb-12 sm:pt-16 sm:pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-neutral-100 text-neutral-800 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-6">
            <Briefcase className="w-4 h-4 text-[#1E3A8A]" />
            <span>{isAr ? "جلسات تصوير مخصصة للقيادات ورواد الأعمال والمحترفين" : "Tailored for Executives, Entrepreneurs & Leaders"}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#111827] tracking-tight leading-tight mb-4">
            {isAr ? (
              <>
                صورتك المهنية تعكس مكانتك <br />
                <span className="text-[#E63946]">بورتريه تنفيذي احترافي لـ LinkedIn والسيرة الذاتية</span>
              </>
            ) : (
              <>
                Your Image Defines Your Authority <br />
                <span className="text-[#E63946]">Executive Portraits for LinkedIn & Media</span>
              </>
            )}
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            {isAr
              ? "إضاءة استوديو سينمائية متقدمة، توجيه دقيق للوضعيات، ومعالجة فنية فائقة الجودة تمنح ملفك الشخصي حضوراً واثقاً وموثوقاً أمام الشركاء وأصحاب الأعمال."
              : "Advanced studio lighting, meticulous posing guidance, and high-end retouching designed to project authority and credibility to partners and recruiters."}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left text-neutral-800 text-sm">
            <div className="flex items-center gap-2.5 bg-[#FAFAFA] border border-gray-200 rounded-xl p-3">
              <Award className="w-5 h-5 text-blue-700 flex-shrink-0" />
              <span className="font-semibold text-xs sm:text-sm">
                {isAr ? "إضاءة بورتريه سينمائية" : "Cinematic Studio Lighting"}
              </span>
            </div>
            <div className="flex items-center gap-2.5 bg-[#FAFAFA] border border-gray-200 rounded-xl p-3">
              <Clock className="w-5 h-5 text-[#E63946] flex-shrink-0" />
              <span className="font-semibold text-xs sm:text-sm">
                {isAr ? "تسليم رقمي خلال 24 ساعة" : "24-Hour Digital Delivery"}
              </span>
            </div>
            <div className="flex items-center gap-2.5 bg-[#FAFAFA] border border-gray-200 rounded-xl p-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span className="font-semibold text-xs sm:text-sm">
                {isAr ? "ترخيص استخدام إعلامي كامل" : "Full Commercial Release"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content: Packages & Booking */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        
        {bookingSuccess && submittedBooking ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border-2 border-emerald-500 rounded-2xl p-6 sm:p-10 shadow-lg text-center max-w-2xl mx-auto"
          >
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5 text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-[#111827] mb-2">
              {isAr ? "تم تسجيل طلب حجز الجلسة بنجاح!" : "Session Request Confirmed!"}
            </h2>
            <p className="text-neutral-600 mb-6 text-sm sm:text-base">
              {isAr
                ? `رقم المرجع: #${submittedBooking.orderRef} — سيتواصل معك المصور لتأكيد تفاصيل الإضاءة والزي المفضل.`
                : `Reference #${submittedBooking.orderRef} — The studio will coordinate with you regarding lighting & attire.`}
            </p>

            <div className="bg-neutral-50 rounded-xl p-4 text-xs sm:text-sm text-neutral-700 space-y-2 mb-6 border border-neutral-200 text-right">
              <div className="flex justify-between">
                <span className="text-neutral-500">{isAr ? "الاسم:" : "Name:"}</span>
                <span className="font-bold">{submittedBooking.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">{isAr ? "الباقة المختارة:" : "Package:"}</span>
                <span className="font-bold">{submittedBooking.packageName} ({submittedBooking.priceSar} ر.س)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">{isAr ? "الموعد المقترح:" : "Date & Time:"}</span>
                <span className="font-bold">{submittedBooking.bookingDate} ({submittedBooking.timeSlot})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">{isAr ? "الاستوديو:" : "Studio:"}</span>
                <span className="font-bold">{submittedBooking.studioLocation}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={generateWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3.5 rounded-xl shadow transition-colors text-sm"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{isAr ? "تأكيد الموعد عبر واتساب الآن" : "Confirm via WhatsApp"}</span>
              </a>

              <a
                href="https://www.google.com/maps/search/Studio%20Alwaleed/@26.57210132,50.03149015,17z"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-black text-white font-bold px-6 py-3.5 rounded-xl transition-colors text-sm"
              >
                <MapPin className="w-5 h-5" />
                <span>{isAr ? "موقع الاستوديو على الخريطة" : "Google Maps Location"}</span>
              </a>
            </div>

            <button
              onClick={() => {
                setBookingSuccess(false);
              }}
              className="mt-6 text-xs text-neutral-500 hover:text-black underline"
            >
              {isAr ? "حجز جلسة أخرى" : "Book another session"}
            </button>
          </motion.div>
        ) : (
          <div>
            {/* Packages */}
            <div className="mb-12">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-black text-[#111827]">
                  {isAr ? "باقات البورتريه التنفيذي والمهني" : "Executive Portrait Packages"}
                </h2>
                <p className="text-sm text-neutral-600">
                  {isAr ? "استثمار في حضورك المهني وهوية علامتك الشخصية" : "An investment in your professional presence"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {packages.map((pkg) => {
                  const isSelected = selectedPackage === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => handlePackageSelect(pkg.id)}
                      className={`relative bg-white rounded-2xl p-6 cursor-pointer transition-all duration-200 border-2 ${
                        isSelected
                          ? "border-[#E63946] shadow-xl ring-2 ring-red-100"
                          : "border-gray-200 hover:border-gray-300 shadow-sm"
                      }`}
                    >
                      {pkg.popular && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#E63946] text-white text-xs font-black uppercase px-3 py-1 rounded-full tracking-wider shadow">
                          {isAr ? "الأكثر طلباً للتنفيذيين" : "Executive Choice"}
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg text-[#111827]">
                            {isAr ? pkg.nameAr : pkg.nameEn}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-1">
                            <Clock className="w-3.5 h-3.5 text-neutral-400" />
                            <span>{pkg.time}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-3xl font-black text-[#111827]">
                            {pkg.price} <span className="text-sm font-semibold">{isAr ? "ر.س" : "SAR"}</span>
                          </div>
                        </div>
                      </div>

                      <ul className="space-y-2.5 my-6 text-xs sm:text-sm text-neutral-700">
                        {(isAr ? pkg.featuresAr : pkg.featuresEn).map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        type="button"
                        className={`w-full rounded-xl py-5 font-bold text-sm transition-all ${
                          isSelected
                            ? "bg-[#E63946] hover:bg-[#C1121F] text-white shadow-md"
                            : "bg-neutral-100 hover:bg-neutral-200 text-neutral-900"
                        }`}
                      >
                        {isSelected
                          ? (isAr ? "الباقة المختارة ✓" : "Selected ✓")
                          : (isAr ? "اختيار هذه الباقة" : "Select Package")}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Booking Form */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 sm:p-8 max-w-2xl mx-auto">
              <div className="border-b border-gray-100 pb-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-[#111827]">
                      {isAr ? "حجز موعد الجلسة في الاستوديو" : "Book Studio Session Slot"}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {isAr ? "حجز مباشر بدون الحاجة لإنشاء حساب مسبق" : "Direct booking without mandatory account creation"}
                    </p>
                  </div>
                  <Badge className="bg-blue-50 text-[#1E3A8A] border-blue-200 font-bold text-xs">
                    {isAr ? "جلسة خاصة" : "Private Session"}
                  </Badge>
                </div>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <Label className="text-xs sm:text-sm font-semibold text-neutral-700 flex items-center gap-1.5 mb-1.5">
                    <User className="w-4 h-4 text-neutral-500" />
                    <span>{isAr ? "الاسم الكريم *" : "Full Name *"}</span>
                  </Label>
                  <Input
                    type="text"
                    required
                    placeholder={isAr ? "مثال: م. فهد الخالدي" : "e.g. Fahad Al-Khaldi"}
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    className="rounded-xl border-gray-300 py-5 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs sm:text-sm font-semibold text-neutral-700 flex items-center gap-1.5 mb-1.5">
                      <Briefcase className="w-4 h-4 text-neutral-500" />
                      <span>{isAr ? "المسمى المهني / الوظيفة" : "Job Title / Role"}</span>
                    </Label>
                    <Input
                      type="text"
                      placeholder={isAr ? "مثال: مدير تنفيذي / مهندس" : "e.g. Executive Director"}
                      value={formData.jobTitle}
                      onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                      className="rounded-xl border-gray-300 py-5 text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm font-semibold text-neutral-700 flex items-center gap-1.5 mb-1.5">
                      <Phone className="w-4 h-4 text-neutral-500" />
                      <span>{isAr ? "رقم الجوال للتواصل *" : "Mobile Number *"}</span>
                    </Label>
                    <Input
                      type="tel"
                      required
                      placeholder="05XXXXXXXX"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="rounded-xl border-gray-300 py-5 text-sm font-mono text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs sm:text-sm font-semibold text-neutral-700 flex items-center gap-1.5 mb-1.5">
                      <Calendar className="w-4 h-4 text-neutral-500" />
                      <span>{isAr ? "تاريخ الجلسة المفضل *" : "Preferred Date *"}</span>
                    </Label>
                    <Input
                      type="date"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={formData.bookingDate}
                      onChange={(e) => handleInputChange("bookingDate", e.target.value)}
                      className="rounded-xl border-gray-300 py-5 text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm font-semibold text-neutral-700 flex items-center gap-1.5 mb-1.5">
                      <Clock className="w-4 h-4 text-neutral-500" />
                      <span>{isAr ? "الوقت المفضل *" : "Preferred Time *"}</span>
                    </Label>
                    <select
                      value={formData.timeSlot}
                      onChange={(e) => handleInputChange("timeSlot", e.target.value)}
                      className="w-full rounded-xl border border-gray-300 py-2.5 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <optgroup label={isAr ? "الفترة المسائية (موصى بها للبورتريه)" : "Evening (Recommended for Portraits)"}>
                        <option value="16:30">04:30 PM</option>
                        <option value="17:30">05:30 PM</option>
                        <option value="18:30">06:30 PM</option>
                        <option value="19:30">07:30 PM</option>
                        <option value="20:30">08:30 PM</option>
                        <option value="21:30">09:30 PM</option>
                      </optgroup>
                      <optgroup label={isAr ? "الفترة الصباحية" : "Morning"}>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                      </optgroup>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={!isFormValid() || isSubmitting}
                    className="w-full bg-[#1E3A8A] hover:bg-[#1E40AF] text-white rounded-xl py-6 text-base font-bold shadow-md transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      isAr ? "جاري حجز الجلسة..." : "Booking Session..."
                    ) : (
                      isAr
                        ? `تأكيد حجز الجلسة المهنية (${packages.find(p => p.id === selectedPackage)?.price} ر.س)`
                        : `Confirm Executive Session (${packages.find(p => p.id === selectedPackage)?.price} SAR)`
                    )}
                  </Button>
                </div>

                <div className="text-center pt-2">
                  <a
                    href={generateWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 text-emerald-700 hover:text-emerald-800 font-bold text-xs sm:text-sm bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-xl transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>{isAr ? "تنسيق موعد مخصص عبر واتساب مباشرة" : "Coordinate Custom Slot via WhatsApp"}</span>
                  </a>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Quality Features Section */}
        <section className="mt-16 sm:mt-20">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-[#111827]">
              {isAr ? "لماذا يختار المحترفون استوديو الوليد؟" : "Why Leaders Choose Studio AlWaleed"}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500">
              {isAr ? "خبرة متراكمة في تصوير الشخصيات العامة والقيادات في المنطقة الشرقية" : "Decades of portrait craftsmanship in the Eastern Province"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {styleHighlights.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#E63946] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-[#111827] mb-1">
                    {isAr ? item.titleAr : item.titleEn}
                  </h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {isAr ? item.descAr : item.descEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 text-center text-xs text-neutral-500">
        <p>© {new Date().getFullYear()} Studio AlWaleed. {isAr ? "استوديو تصوير فوتوغرافي معتمد — القطيف، المنطقة الشرقية." : "Certified Portrait Studio — Qatif, Eastern Province."}</p>
        <p className="mt-1 text-neutral-400">
          {isAr ? "2954 أحد – الواحة، القطيف • هاتف: 013 344 4101" : "2954 Uhud - Alwaha, Qatif • Tel: +966 13 344 4101"}
        </p>
      </footer>

    </div>
  );
}
