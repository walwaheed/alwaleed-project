import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, Clock, ShieldCheck, MapPin, Phone, MessageCircle, 
  Calendar, User, ArrowRight, Star, AlertCircle, ChevronDown, Sparkles,
  Camera, FileCheck, ArrowLeft, Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { analytics } from "@/utils/analytics";
import { getStoredUTMs } from "@/utils/utmCapture";

export default function PassportExpressLanding() {
  const [language, setLanguage] = useState("ar");
  const [selectedPackage, setSelectedPackage] = useState("standard");
  const [selectedCountry, setSelectedCountry] = useState("saudi");
  const [bookingStep, setBookingStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState(null);

  // Guest booking state
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    bookingDate: new Date().toISOString().split("T")[0],
    timeSlot: "17:00",
    paymentPreference: "studio", // 'studio' or 'online'
    notes: ""
  });

  const isAr = language === "ar";

  useEffect(() => {
    try {
      analytics.pageViewed("express-passport", {
        category: "passport_visa_photo",
        language: language
      });
    } catch (e) {
      // Fire-and-forget
    }
  }, [language]);

  const packages = [
    {
      id: "standard",
      nameAr: "الباقة القياسية (أبشر والجواز السعودي)",
      nameEn: "Standard (Absher & Saudi Passport)",
      price: 35,
      time: isAr ? "10 دقائق" : "10 Minutes",
      popular: false,
      featuresAr: [
        "4 صور مطبوعة عالية الدقة بمقاس 4×6 سم",
        "تجهيز دقيق وفق اشتراطات منصة أبشر والجوازات المعلنة",
        "نسخة رقمية مرسلة للواتساب أو الإيميل",
        "خلفية بيضاء نقية وإضاءة استوديو متوازنة",
        "إعادة التقاط الصورة في الاستوديو في حال طلب العميل أثناء الجلسة"
      ],
      featuresEn: [
        "4 High-resolution prints (4x6 cm)",
        "Prepared according to official published Absher & Passport specs",
        "Digital copy delivered via WhatsApp / Email",
        "Clean white background & balanced studio lighting",
        "Re-take available during session upon client request"
      ]
    },
    {
      id: "express",
      nameAr: "الباقة المستعجلة VIP (تأشيرات دولية وسفارات)",
      nameEn: "VIP Express (International Visas & Embassies)",
      price: 50,
      time: isAr ? "10 دقائق (أولوية فورية)" : "10 Minutes (Priority)",
      popular: true,
      featuresAr: [
        "6 صور مطبوعة بمقاسات السفارات المعلنة (أمريكا 5×5، شنغن 3.5×4.5، بريطانيا، كندا)",
        "تجهيز فني ومطابقة لأبعاد السفارة المستهدفة المحددة",
        "نسخة رقمية مهيأة للمواقع الرسمية (DS-160، فيزا شنغن)",
        "أولوية دخول وتجهيز سريع داخل الاستوديو",
        "القبول النهائي يخضع لتقدير الجهة المستلمة والسفارة"
      ],
      featuresEn: [
        "6 prints prepared to published embassy dimensions (US 5x5, Schengen 3.5x4.5, UK, Canada)",
        "Technical preparation aligned with specified embassy criteria",
        "Web-ready digital file for online applications (DS-160, Schengen)",
        "Expedited studio priority queue",
        "Final acceptance remains subject to the receiving authority"
      ]
    },
    {
      id: "family",
      nameAr: "باقة العائلة (4 أفراد)",
      nameEn: "Family Bundle (4 Persons)",
      price: 120,
      originalPrice: 140,
      time: isAr ? "25 دقيقة" : "25 Minutes",
      popular: false,
      featuresAr: [
        "16 صورة مطبوعة موزعة لـ 4 أفراد من العائلة",
        "تجهيز صور الأطفال والمواليد بكل صبر واحترافية",
        "نسخ رقمية كاملة لجميع الأفراد عبر واتساب",
        "توفير 20 ريال مقارنة بالسعر الفردي",
        "جلسة مريحة ومخصصة للعائلات في استوديو القطيف"
      ],
      featuresEn: [
        "16 prints total (for 4 family members)",
        "Specialized patient handling for infants and children",
        "Complete digital archive sent via WhatsApp",
        "Save 20 SAR compared to individual rates",
        "Comfortable private family studio session in Qatif"
      ]
    }
  ];

  const embassySpecs = [
    {
      countryAr: "السعودية (أبشر / الجواز)",
      countryEn: "Saudi Arabia (Absher / Passport)",
      specsAr: "مقاس 4×6 سم | خلفية بيضاء | بدون نظارات | ملابس رسمية / شماغ معتدل",
      specsEn: "4x6 cm | White background | No glasses | Official national dress"
    },
    {
      countryAr: "أمريكا (US Visa DS-160)",
      countryEn: "United States (Visa / DS-160)",
      specsAr: "مقاس 5×5 سم (2×2 إنش) | 600×600 بكسل رقمية | بدون نظارات | خلفية بيضاء نقية",
      specsEn: "5x5 cm (2x2 inch) | 600x600 px digital | No glasses | Off-white/white"
    },
    {
      countryAr: "تأشيرة شنغن (أوروبا)",
      countryEn: "Schengen Visa (Europe)",
      specsAr: "مقاس 3.5×4.5 سم | الوجه يشغل 70-80% من الكادر | تعبير محايد | خلفية رمادية فاتحة/بيضاء",
      specsEn: "3.5x4.5 cm | 70-80% face ratio | Neutral expression | Light grey/white"
    },
    {
      countryAr: "بريطانيا وكندا",
      countryEn: "UK & Canada Visa",
      specsAr: "مقاسات بيومترية دقيقة مع كود التحقق الرقمي الرسمي للسفارة البريطانية",
      specsEn: "Exact biometric dimensions with UK digital photo code readiness"
    }
  ];

  const handlePackageSelect = (pkgId) => {
    setSelectedPackage(pkgId);
    try {
      analytics.ctaClicked(`select_package_${pkgId}`, {
        package_id: pkgId,
        service: "passport_visa_photo"
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
    const orderRef = `ALW-PASSPORT-${Date.now().toString().slice(-6)}`;
    const payload = {
      orderReference: orderRef,
      service: "passport_visa_photo",
      packageId: selectedPackage,
      packageName: isAr ? selectedPkg.nameAr : selectedPkg.nameEn,
      priceSar: selectedPkg.price,
      customerName: formData.fullName,
      customerPhone: formData.phone,
      bookingDate: formData.bookingDate,
      timeSlot: formData.timeSlot,
      paymentPreference: formData.paymentPreference,
      notes: formData.notes,
      source: "express_passport_funnel",
      utm_source: utms.utm_source || "direct",
      utm_medium: utms.utm_medium || "none",
      utm_campaign: utms.utm_campaign || "none",
      utm_content: utms.utm_content || "",
      utm_term: utms.utm_term || "",
      referrer: utms.referrer || (typeof document !== "undefined" ? document.referrer : ""),
      landing_page: utms.landing_path || "/express-passport",
      device: typeof navigator !== "undefined" && /mobile/i.test(navigator.userAgent) ? "mobile" : "desktop",
      language: language,
      studioLocation: "2954 Uhud - Alwaha, Unit 1, Qatif",
      createdAt: new Date().toISOString()
    };

    try {
      // Send to booking webhook
      await fetch("https://n8n.renovaai.cloud/webhook/Alwaleed-booking-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).catch(e => console.warn("Webhook notification dispatched:", e));

      analytics.bookingCompleted(selectedPackage, {
        order_reference: orderRef,
        revenue_sar: selectedPkg.price,
        customer_phone_masked: formData.phone.slice(0, 4) + "****" + formData.phone.slice(-2)
      });
    } catch (err) {
      console.warn("Booking analytics dispatch:", err);
    } finally {
      setIsSubmitting(false);
      setSubmittedBooking({ ...payload, orderRef });
      setBookingSuccess(true);
    }
  };

  const generateWhatsAppUrl = () => {
    const selectedPkg = packages.find(p => p.id === selectedPackage);
    const text = isAr
      ? `السلام عليكم، أود تأكيد حجز موعد تصوير فوري:\n\n` +
        `👤 الاسم: ${formData.fullName || "عميل استوديو الوليد"}\n` +
        `📦 الباقة: ${selectedPkg?.nameAr} (${selectedPkg?.price} ريال)\n` +
        `📅 التاريخ: ${formData.bookingDate}\n` +
        `⏰ الوقت المفضل: ${formData.timeSlot}\n` +
        `💳 طريقة الدفع: ${formData.paymentPreference === "studio" ? "في الاستوديو (مدى / كاش)" : "دفع إلكتروني"}\n\n` +
        `أرجو تأكيد الموعد والعنوان في استوديو القطيف.`
      : `Hello Studio AlWaleed, I'd like to confirm an express passport/visa photo appointment:\n\n` +
        `👤 Name: ${formData.fullName || "Guest"}\n` +
        `📦 Package: ${selectedPkg?.nameEn} (${selectedPkg?.price} SAR)\n` +
        `📅 Date: ${formData.bookingDate}\n` +
        `⏰ Time: ${formData.timeSlot}\n\n` +
        `Please confirm slot availability at Qatif studio.`;

    return `https://wa.me/966133444101?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className={`min-h-screen bg-[#FAFAFA] text-[#111827] font-['Tajawal',sans-serif] ${isAr ? 'rtl' : 'ltr'}`} dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Top Utility Bar: Phone, WhatsApp, and Language Switcher */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-[#111827]">
                STUDIO <span className="text-[#E63946]">ALWALEED</span>
              </span>
            </Link>
            <Badge variant="outline" className="hidden sm:inline-flex border-red-200 text-[#E63946] bg-red-50 text-xs font-semibold px-2 py-0.5">
              {isAr ? "خدمة الجوازات والتأشيرات الفورية" : "Express Passport & Visa Studio"}
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

      {/* Hero Section with Immediate Compliance & Speed Hook */}
      <section className="bg-white border-b border-gray-100 pt-10 pb-12 sm:pt-14 sm:pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-neutral-100 text-neutral-800 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4 text-[#E63946]" />
            <span>{isAr ? "تسليم فوري خلال 10 دقائق في استوديو القطيف" : "Instant 10-Minute Delivery at Qatif Studio"}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#111827] tracking-tight leading-tight mb-4">
            {isAr ? (
              <>
                تصوير استوديو احترافي <br />
                <span className="text-[#E63946]">للجوازات، أبشر، والتأشيرات الدولية</span>
              </>
            ) : (
              <>
                Professional Studio Photography <br />
                <span className="text-[#E63946]">For Passports, Absher & Visas</span>
              </>
            )}
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto mb-4 leading-relaxed">
            {isAr
              ? "مطبوعة بجودة تصوير فوتوغرافي ومجهزة وفق الاشتراطات الرسمية المعلنة للجوازات والسفارات. استلم صورك المطبوعة والرقمية في الاستوديو بسهولة وسرعة."
              : "High-definition photo prints prepared according to published official requirements for passports and visas. Receive print and digital copies promptly at our studio."}
          </p>

          {/* Safe Legal Notice */}
          <div className="text-xs text-neutral-500 bg-neutral-100 border border-neutral-200 rounded-lg p-2.5 max-w-xl mx-auto mb-8">
            {isAr
              ? "ملاحظة نظامية: تُجهّز الصور وفق المتطلبات والمعايير الرسمية المعلنة. ويبقى القبول النهائي خاضعاً دائماً لتقدير الجهة الرسمية المختصة."
              : "Notice: Photos are prepared according to published official specifications. Final acceptance remains subject to the receiving authority."}
          </div>

          {/* 3 Quick Value Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left text-neutral-800 text-sm">
            <div className="flex items-center gap-2.5 bg-[#FAFAFA] border border-gray-200 rounded-xl p-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span className="font-semibold text-xs sm:text-sm">
                {isAr ? "تجهيز وفق المعايير الرسمية" : "Prepared to Official Standards"}
              </span>
            </div>
            <div className="flex items-center gap-2.5 bg-[#FAFAFA] border border-gray-200 rounded-xl p-3">
              <Clock className="w-5 h-5 text-[#E63946] flex-shrink-0" />
              <span className="font-semibold text-xs sm:text-sm">
                {isAr ? "استلام فوري خلال 10 دقائق" : "Ready in 10 Minutes"}
              </span>
            </div>
            <div className="flex items-center gap-2.5 bg-[#FAFAFA] border border-gray-200 rounded-xl p-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span className="font-semibold text-xs sm:text-sm">
                {isAr ? "نسخة مطبوعة + رقمية مرسلة" : "Print + Digital Delivery"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Action Area: Packages & Instant Booking */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        
        {/* Booking Success View */}
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
              {isAr ? "تم تأكيد طلب موعدك بنجاح!" : "Appointment Request Confirmed!"}
            </h2>
            <p className="text-neutral-600 mb-6 text-sm sm:text-base">
              {isAr
                ? `رقم المرجع: #${submittedBooking.orderRef} — نتشرف بزيارتك في استوديو الوليد بالقطيف.`
                : `Reference #${submittedBooking.orderRef} — We look forward to welcoming you at Studio AlWaleed Qatif.`}
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
                <span className="text-neutral-500">{isAr ? "تاريخ الموعد:" : "Date:"}</span>
                <span className="font-bold">{submittedBooking.bookingDate} ({submittedBooking.timeSlot})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">{isAr ? "طريقة الدفع:" : "Payment:"}</span>
                <span className="font-bold">
                  {submittedBooking.paymentPreference === "studio" ? (isAr ? "في الاستوديو عند الاستلام" : "Pay at Studio") : (isAr ? "إلكتروني" : "Online")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">{isAr ? "موقع الاستوديو:" : "Studio Location:"}</span>
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
                <span>{isAr ? "فتح المحادثة عبر واتساب لتأكيد الحضور" : "Open WhatsApp to Confirm"}</span>
              </a>

              <a
                href="https://www.google.com/maps/search/Studio%20Alwaleed/@26.57210132,50.03149015,17z"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-black text-white font-bold px-6 py-3.5 rounded-xl transition-colors text-sm"
              >
                <MapPin className="w-5 h-5" />
                <span>{isAr ? "الاتجاهات إلى الاستوديو على الخريطة" : "Google Maps Directions"}</span>
              </a>
            </div>

            <button
              onClick={() => {
                setBookingSuccess(false);
                setBookingStep(1);
              }}
              className="mt-6 text-xs text-neutral-500 hover:text-black underline"
            >
              {isAr ? "حجز موعد إضافي لشخص آخر" : "Book another appointment"}
            </button>
          </motion.div>
        ) : (
          <div>
            {/* Step 1: Transparent Pricing Selection */}
            <div className="mb-10">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-black text-[#111827]">
                  {isAr ? "اختر الباقة المناسبة لاحتياجك" : "Select Your Package"}
                </h2>
                <p className="text-sm text-neutral-600">
                  {isAr ? "أسعار واضحة وشاملة بدون رسوم خفية" : "Clear, transparent pricing with zero hidden fees"}
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
                          {isAr ? "الأكثر طلباً للتأشيرات" : "Most Popular"}
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
                          {pkg.originalPrice && (
                            <div className="text-xs text-neutral-400 line-through">
                              {pkg.originalPrice} {isAr ? "ر.س" : "SAR"}
                            </div>
                          )}
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

            {/* Step 2: Instant Booking Card (Guest Checkout) */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 sm:p-8 max-w-2xl mx-auto">
              <div className="border-b border-gray-100 pb-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-[#111827]">
                      {isAr ? "تأكيد الموعد الفوري (بدون تسجيل حساب)" : "Fast Appointment Confirmation (No Account Needed)"}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {isAr ? "ادخل بياناتك وسيتجهز الاستوديو لاستقبالك فوراً" : "Enter your info and the studio will prepare for your visit"}
                    </p>
                  </div>
                  <Badge className="bg-red-50 text-[#E63946] border-red-200 font-bold text-xs">
                    {isAr ? "حجز فوري مباشر" : "Direct Booking"}
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
                    placeholder={isAr ? "مثال: علي محمد آل سعيد" : "e.g. Ali Al-Saeed"}
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    className="rounded-xl border-gray-300 py-5 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs sm:text-sm font-semibold text-neutral-700 flex items-center gap-1.5 mb-1.5">
                    <Phone className="w-4 h-4 text-neutral-500" />
                    <span>{isAr ? "رقم الجوال (لاستلام الصور عبر واتساب) *" : "Mobile Number (WhatsApp Delivery) *"}</span>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs sm:text-sm font-semibold text-neutral-700 flex items-center gap-1.5 mb-1.5">
                      <Calendar className="w-4 h-4 text-neutral-500" />
                      <span>{isAr ? "تاريخ الزيارة *" : "Visit Date *"}</span>
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
                      <optgroup label={isAr ? "الفترة الصباحية (9:00 ص - 12:00 م)" : "Morning (9:00 AM - 12:00 PM)"}>
                        <option value="09:30">09:30 AM</option>
                        <option value="10:30">10:30 AM</option>
                        <option value="11:30">11:30 AM</option>
                      </optgroup>
                      <optgroup label={isAr ? "الفترة المسائية (4:00 م - 10:00 م)" : "Evening (4:00 PM - 10:00 PM)"}>
                        <option value="16:30">04:30 PM</option>
                        <option value="17:30">05:30 PM</option>
                        <option value="18:30">06:30 PM</option>
                        <option value="19:30">07:30 PM</option>
                        <option value="20:30">08:30 PM</option>
                        <option value="21:30">09:30 PM</option>
                      </optgroup>
                    </select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs sm:text-sm font-semibold text-neutral-700 mb-1.5 block">
                    {isAr ? "طريقة الدفع المفضلة" : "Preferred Payment Method"}
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => handleInputChange("paymentPreference", "studio")}
                      className={`p-3 rounded-xl border-2 cursor-pointer text-xs sm:text-sm font-semibold text-center transition-all ${
                        formData.paymentPreference === "studio"
                          ? "border-[#E63946] bg-red-50/50 text-[#E63946]"
                          : "border-gray-200 hover:border-gray-300 text-neutral-700"
                      }`}
                    >
                      {isAr ? "الدفع في الاستوديو (مدى / كاش)" : "Pay at Studio (Mada/Cash)"}
                    </div>

                    <div
                      onClick={() => handleInputChange("paymentPreference", "online")}
                      className={`p-3 rounded-xl border-2 cursor-pointer text-xs sm:text-sm font-semibold text-center transition-all ${
                        formData.paymentPreference === "online"
                          ? "border-[#E63946] bg-red-50/50 text-[#E63946]"
                          : "border-gray-200 hover:border-gray-300 text-neutral-700"
                      }`}
                    >
                      {isAr ? "دفع إلكتروني (مدى / Apple Pay)" : "Pay Online (Apple Pay)"}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={!isFormValid() || isSubmitting}
                    className="w-full bg-[#E63946] hover:bg-[#C1121F] text-white rounded-xl py-6 text-base font-bold shadow-md transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      isAr ? "جاري تأكيد الموعد..." : "Confirming..."
                    ) : (
                      isAr
                        ? `تأكيد حجز الموعد الفوري (${packages.find(p => p.id === selectedPackage)?.price} ر.س)`
                        : `Confirm Express Appointment (${packages.find(p => p.id === selectedPackage)?.price} SAR)`
                    )}
                  </Button>
                </div>

                <div className="text-center pt-2">
                  <p className="text-xs text-neutral-500 mb-2">
                    {isAr ? "أو يمكنك الحجز مباشرة عبر واتساب بدون تعبئة النموذج:" : "Or book directly via WhatsApp without forms:"}
                  </p>
                  <a
                    href={generateWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 text-emerald-700 hover:text-emerald-800 font-bold text-xs sm:text-sm bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-xl transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>{isAr ? "حجز فوري ومحادثة واتساب مباشرة" : "Direct WhatsApp Booking Chat"}</span>
                  </a>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Embassy & Official Compliance Standards Guide */}
        <section className="mt-16 sm:mt-20">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-[#111827]">
              {isAr ? "المعايير والمقاييس المعتمدة في التجهيز" : "Official Photo Specifications Followed"}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500">
              {isAr ? "نحرص على تطبيق متطلبات الأبعاد والإضاءة المحددة لكل جهة" : "We carefully apply dimensions and lighting criteria per authority"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {embassySpecs.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-start gap-3">
                <FileCheck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-[#111827] mb-1">
                    {isAr ? item.countryAr : item.countryEn}
                  </h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {isAr ? item.specsAr : item.specsEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Studio Location & Walk-In Information */}
        <section className="mt-16 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E63946] bg-red-50 px-3 py-1 rounded-full mb-3">
                <MapPin className="w-3.5 h-3.5" />
                <span>{isAr ? "موقع الاستوديو الرئيسي" : "Main Studio Location"}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#111827] mb-3">
                {isAr ? "استوديو الوليد — القطيف" : "Studio AlWaleed — Qatif"}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 mb-4 leading-relaxed">
                {isAr ? (
                  <>
                    2954 أحد – الواحة، الوحدة رقم 1<br />
                    القطيف 32626 – 6172، المملكة العربية السعودية.<br />
                    مواقف متوفرة وسهولة وصول من سيهات، تاروت، الدمام، والخبر.
                  </>
                ) : (
                  <>
                    2954 Uhud - Alwaha, Unit No 1<br />
                    AlQatif 32626 - 6172, Eastern Province, KSA.<br />
                    Ample parking with quick access from Saihat, Tarout, Dammam, and Khobar.
                  </>
                )}
              </p>

              <div className="text-xs text-neutral-700 space-y-1.5 mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-neutral-400" />
                  <span>{isAr ? "السبت - الخميس: 9:00 ص - 12:00 م | 4:00 م - 10:00 م" : "Sat - Thu: 9:00 AM - 12:00 PM | 4:00 PM - 10:00 PM"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-neutral-400" />
                  <span>{isAr ? "الجمعة: 4:00 م - 10:00 م" : "Friday: 4:00 PM - 10:00 PM"}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href="https://www.google.com/maps/search/Studio%20Alwaleed/@26.57210132,50.03149015,17z"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#111827] hover:bg-black text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  <span>{isAr ? "فتح الموقع في خرائط Google" : "Open in Google Maps"}</span>
                </a>

                <a
                  href="tel:+966133444101"
                  className="inline-flex items-center gap-2 border border-gray-300 hover:border-black text-[#111827] font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>{isAr ? "اتصال بالاستوديو" : "Call Studio"}</span>
                </a>
              </div>
            </div>

            <div className="h-64 sm:h-72 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
              <iframe
                title="Studio AlWaleed Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3575.7947385!2d50.03149015!3d26.57210132!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDM0JzE5LjYiTiA1MMKwMDEnNTMuNCJF!5e0!3m2!1sen!2s!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 text-center text-xs text-neutral-500">
        <p>© {new Date().getFullYear()} Studio AlWaleed. {isAr ? "جميع الحقوق محفوظة. استوديو تصوير فوتوغرافي معتمد - المملكة العربية السعودية." : "All rights reserved. Certified Photography Studio - Saudi Arabia."}</p>
        <p className="mt-1 text-neutral-400">
          {isAr ? "القطيف • تاروت • سيهات • الدمام • الخبر" : "Qatif • Tarout • Saihat • Dammam • Khobar"}
        </p>
      </footer>

    </div>
  );
}
