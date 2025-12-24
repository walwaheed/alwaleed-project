import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Star, Crown, Video, Camera, Radio, Plane } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../components/LanguageContext";
import { base44 } from "@/api/base44Client";
import BookingDialog from "../components/BookingDialog";

export default function Pricing() {
  const { language } = useLanguage();
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await base44.auth.getUser();
        setUser(currentUser);
      } catch (e) {
        console.log("Guest User");
      }
    };
    checkUser();
  }, []);

  // Helper function to extract colors from gradient classes
  const getIconColors = (gradientClass) => {
    const colorMap = {
      'from-blue-600 to-cyan-600': { from: '#2563eb', to: '#0891b2' },
      'from-purple-600 to-pink-600': { from: '#9333ea', to: '#db2777' },
      'from-[#E63946] to-[#FF6B6B]': { from: '#E63946', to: '#FF6B6B' },
      'from-yellow-600 to-orange-600': { from: '#ca8a04', to: '#ea580c' },
      'from-red-600 to-pink-600': { from: '#dc2626', to: '#db2777' },
      'from-green-600 to-teal-600': { from: '#16a34a', to: '#0d9488' },
      'from-purple-900 to-pink-900': { from: '#581c87', to: '#831843' },
      'from-indigo-600 to-blue-600': { from: '#4f46e5', to: '#2563eb' },
      'from-sky-600 to-blue-600': { from: '#0284c7', to: '#2563eb' },
    };
    return colorMap[gradientClass] || { from: '#667eea', to: '#764ba2' };
  };

  const pricingData = [
    {
      id: "photo_package",
      title: "باقة الفوتو",
      titleEn: "Photo Package",
      price: 800,
      description: "باقة تصوير فوتوغرافي لمدة ٤ ساعات",
      descriptionEn: "4-hour photography package",
      icon: Camera,
      color: "from-blue-600 to-cyan-600",
      features: [
        { ar: "1 مصور فوتوغرافي", en: "1 Photographer" },
        { ar: "اضاءات استديو احترافية", en: "Professional studio lighting" },
        { ar: "عدد صور مفتوح", en: "Unlimited photos" },
        { ar: "طباعة 80 صورة مقاس كبير (200﷼ رسوم إضافية عند الطلب)", en: "80 large prints (200 SAR additional fee)" },
        { ar: "ألبوم حجم كبير (75﷼ رسوم إضافية عند الطلب)", en: "Large album (75 SAR additional fee)" },
        { ar: "مدة التصوير ٤ ساعات", en: "4 hours shooting time" }
      ]
    },
    {
      id: "video_package",
      title: "باقة الفيديو",
      titleEn: "Video Package",
      price: 1350,
      description: "باقة تصوير فيديو سينمائي لمدة ٤ ساعات",
      descriptionEn: "4-hour cinematic video package",
      icon: Video,
      color: "from-purple-600 to-pink-600",
      features: [
        { ar: "1 مصور فيديو سينمائي", en: "1 Cinematic videographer" },
        { ar: "تصوير فيديو مفتوح", en: "Unlimited video recording" },
        { ar: "مونتاج للفيديو (مدة المونتاج حسب الطلب)", en: "Video editing (duration on request)" },
        { ar: "مدة التصوير ٤ ساعات", en: "4 hours shooting time" }
      ]
    },
    {
      id: "basic_package",
      title: "الباقة الأساسية",
      titleEn: "Basic Package",
      price: 1700,
      description: "باقة شاملة تصوير فيديو وفوتوغرافي لمدة ٤ ساعات",
      descriptionEn: "Complete video & photography package for 4 hours",
      tags: [{ ar: "الأكثر شهرة", en: "Most Popular" }],
      icon: Star,
      color: "from-[#E63946] to-[#FF6B6B]",
      features: [
        { ar: "1 مصور فوتوغراف مع اضاءات استوديو احترافية", en: "1 Photographer with professional studio lighting" },
        { ar: "1 مصور فيديو سينمائي", en: "1 Cinematic videographer" },
        { ar: "عدد صور مفتوح", en: "Unlimited photos" },
        { ar: "تصوير فيديو مفتوح", en: "Unlimited video recording" },
        { ar: "طباعة 80 صورة مقاس كبير (رسوم إضافية 200﷼)", en: "80 large prints (200 SAR additional)" },
        { ar: "ألبوم فاخر حجم كبير (رسوم إضافية 75﷼)", en: "Luxury large album (75 SAR additional)" },
        { ar: "مونتاج للفيديو (مدة المونتاج حسب طلب العميل)", en: "Video editing (duration on request)" },
        { ar: "مدة التصوير ٤ ساعات", en: "4 hours shooting time" }
      ]
    },
    {
      id: "premium_package",
      title: "الباقة الشاملة",
      titleEn: "Premium Package",
      price: 2600,
      description: "باقة تصوير متقدمة تشمل فيديو وفوتوغرافي",
      descriptionEn: "Advanced video & photography package",
      icon: Crown,
      color: "from-yellow-600 to-orange-600",
      features: [
        { ar: "1 مصور فيديو (Close Shots)", en: "1 Videographer (Close Shots)" },
        { ar: "1 مصور فيديو سينمائي", en: "1 Cinematic videographer" },
        { ar: "1 مصور فوتوغراف مع اضاءات استديو احترافية", en: "1 Photographer with professional studio lighting" },
        { ar: "عدد الصور مفتوح", en: "Unlimited photos" },
        { ar: "وقت الفيديو مفتوح", en: "Unlimited video time" },
        { ar: "طباعة ألبوم حراري فاخر A4 (رسوم إضافية 450﷼)", en: "Luxury thermal album A4 (450 SAR additional)" },
        { ar: "مونتاج للفيديو (مدة المونتاج حسب الطلب)", en: "Video editing (duration on request)" },
        { ar: "مدة التصوير ٤ ساعات", en: "4 hours shooting time" }
      ]
    },
    {
      id: "livestream_package",
      title: "باقة البث المباشر Live Stream",
      titleEn: "Live Stream Package",
      price: 3400,
      tags: [{ ar: "الأكثر شهرة", en: "Most Popular" }],
      description: "باقة تشمل بث مباشر وتصوير كامل",
      descriptionEn: "Package with live streaming & full coverage",
      icon: Radio,
      color: "from-red-600 to-pink-600",
      features: [
        { ar: "1 مصور فيديو سينمائي", en: "1 Cinematic videographer" },
        { ar: "1 مصور فيديو بث مباشر", en: "1 Live stream videographer" },
        { ar: "1 مصور فوتوغراف مع اضاءات استديو احترافية", en: "1 Photographer with professional studio lighting" },
        { ar: "عدد الصور مفتوح", en: "Unlimited photos" },
        { ar: "وقت الفيديو مفتوح", en: "Unlimited video time" },
        { ar: "بث مباشر مفتوح", en: "Unlimited live streaming" },
        { ar: "طباعة ألبوم حراري فاخر A4 (رسوم إضافية 450﷼)", en: "Luxury thermal album A4 (450 SAR additional)" },
        { ar: "مونتاج للفيديو (مدة المونتاج حسب الطلب)", en: "Video editing (duration on request)" },
        { ar: "علبة للحفظ تحمل صورة العريس", en: "Storage box with groom's photo" },
        { ar: "مدة التصوير ٤ ساعات", en: "4 hours shooting time" }
      ]
    },
    {
      id: "drone_package",
      title: "باقة الدرون",
      titleEn: "Drone Package",
      price: 3200,
      description: "باقة تصوير جوي + سينمائي + فوتوغرافي",
      descriptionEn: "Aerial + cinematic + photography package",
      icon: Plane,
      color: "from-green-600 to-teal-600",
      features: [
        { ar: "1 مصور فيديو سينمائي", en: "1 Cinematic videographer" },
        { ar: "1 مصور فيديو جوي", en: "1 Aerial videographer" },
        { ar: "1 مصور فوتوغراف مع اضاءات استديو احترافية", en: "1 Photographer with professional studio lighting" },
        { ar: "عدد الصور مفتوح", en: "Unlimited photos" },
        { ar: "وقت الفيديو مفتوح", en: "Unlimited video time" },
        { ar: "طباعة ألبوم حراري فاخر A4 (رسوم إضافية 450﷼)", en: "Luxury thermal album A4 (450 SAR additional)" },
        { ar: "مونتاج للفيديو (مدة المونتاج حسب الطلب)", en: "Video editing (duration on request)" },
        { ar: "علبة للحفظ تحمل صورة العريس", en: "Storage box with groom's photo" }
      ]
    },
    {
      id: "diamond_package",
      title: "الباقة الماسية",
      titleEn: "Diamond Package",
      price: 6450,
      description: "باقة مميزة للمناسبات الكبيرة",
      descriptionEn: "Premium package for large events",
      notes: { ar: "*ينصح بها للمناسبات الكبيرة فقط*", en: "*Recommended for large events only*" },
      icon: Crown,
      color: "from-purple-900 to-pink-900",
      features: [
        { ar: "1 مصور فيديو سينمائي مع رافعة ٩ متر (كرين)", en: "1 Cinematic videographer with 9m crane" },
        { ar: "1 مصور فيديو (Long Shots)", en: "1 Videographer (Long Shots)" },
        { ar: "1 مصور فيديو (Close Shots)", en: "1 Videographer (Close Shots)" },
        { ar: "1 مصور فوتوغراف مع اضاءات استديو", en: "1 Photographer with studio lighting" },
        { ar: "عدد الصور مفتوح", en: "Unlimited photos" },
        { ar: "مدة الفيديو مفتوح", en: "Unlimited video time" },
        { ar: "طباعة ألبوم حراري فاخر 30x30 (تصميم خاص)", en: "Luxury thermal album 30x30 (custom design)" },
        { ar: "طباعة ألبوم حراري صغير A5 (تصميم خاص)", en: "Small thermal album A5 (custom design)" },
        { ar: "تكبير صورة للعريس مع إطار فخم", en: "Enlarged groom photo with luxury frame" },
        { ar: "مونتاج (برومو للفيديو)", en: "Video editing (promo video)" },
        { ar: "علبة مميزة للحفظ تحمل صورة العريس", en: "Premium storage box with groom's photo" }
      ]
    },
    {
      id: "extra_livestream",
      title: "بث مباشر Live Stream (طلبات إضافية)",
      titleEn: "Live Stream (Add-on)",
      price: 1550,
      tags: [{ ar: "الأكثر شهرة", en: "Most Popular" }],
      description: "خدمة بث مباشر إضافية للمناسبات",
      descriptionEn: "Additional live streaming service",
      icon: Radio,
      color: "from-indigo-600 to-blue-600",
      features: [
        { ar: "مشاهدة الحفل مباشرة عبر اليوتيوب أو منصة يطلبها العميل", en: "Watch event live via YouTube or client's platform" },
        { ar: "تزويد العميل برابط البث قبل بدء التصوير", en: "Provide streaming link before event" },
        { ar: "لا نتحمل مسؤولية سوء تغطية الإنترنت في القاعة", en: "Not responsible for poor internet coverage" }
      ]
    },
    {
      id: "extra_aerial",
      title: "التصوير الجوي (طلبات إضافية)",
      titleEn: "Aerial Photography (Add-on)",
      price: 1300,
      description: "تصوير جوي داخل القاعة ومن الخارج",
      descriptionEn: "Aerial photography inside and outside venue",
      icon: Plane,
      color: "from-sky-600 to-blue-600",
      features: [
        { ar: "تصوير داخل القاعة", en: "Indoor venue shooting" },
        { ar: "تصوير من خارج القاعة", en: "Outdoor venue shooting" },
        { ar: "يتطلب تصريح رسمي للتصوير بعيداً عن القاعة", en: "Requires official permit for shooting away from venue" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] relative py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#f1f5f9] pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-black mb-6">
            {language === 'ar' ? 'باقات التصوير' : 'Photography Packages'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {language === 'ar'
              ? 'اختر الباقة المناسبة لك من مجموعة متنوعة من باقات التصوير الاحترافية'
              : 'Choose the right package from our diverse range of professional photography packages'
            }
          </p>
        </motion.div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pricingData.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="h-full"
            >
              <Card className={`relative p-8 bg-white rounded-2xl transition-all duration-300 h-full flex flex-col ${pkg.tags && pkg.tags.length > 0
                  ? 'border-2 border-[#3b82f6] hover:scale-[1.02]'
                  : 'border border-[rgba(226,232,240,0.8)] hover:-translate-y-1'
                }`}
                style={{
                  boxShadow: pkg.tags && pkg.tags.length > 0
                    ? '0 25px 50px -12px rgba(59, 130, 246, 0.25)'
                    : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                }}>
                {/* Tags */}
                {pkg.tags && pkg.tags.length > 0 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge
                      className="text-white border-none px-4 py-1.5"
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                      }}
                    >
                      <Star className="w-3 h-3 mr-1" />
                      {language === 'ar' ? pkg.tags[0].ar : pkg.tags[0].en}
                    </Badge>
                  </div>
                )}

                {/* Icon */}
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto relative"
                  style={{
                    background: `linear-gradient(135deg, ${getIconColors(pkg.color).from}15, ${getIconColors(pkg.color).to}15)`,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <pkg.icon
                    className="w-8 h-8"
                    style={{
                      color: getIconColors(pkg.color).from
                    }}
                  />
                </div>

                {/* Title & Description */}
                <h3 className="text-2xl font-semibold text-[#262626] mb-2 text-center">
                  {language === 'ar' ? pkg.title : pkg.titleEn}
                </h3>
                <p className="text-[#525252] text-center mb-6">
                  {language === 'ar' ? pkg.description : pkg.descriptionEn}
                </p>

                {/* Price */}
                <div className="text-center mb-6 flex justify-center">
                  <div
                    className="inline-block px-6 py-3 rounded-xl text-4xl font-bold text-[#1e3a8a]"
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                    style={{
                      background: 'rgba(59, 130, 246, 0.08)',
                      border: '1px solid rgba(59, 130, 246, 0.15)'
                    }}
                  >
                    {pkg.price} {language === 'ar' ? 'ر.س' : 'SAR'}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6 flex-grow">
                  {pkg.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3"
                      dir={language === 'ar' ? 'rtl' : 'ltr'}
                      style={{
                        flexDirection: language === 'ar' ? 'row' : 'row',
                        textAlign: language === 'ar' ? 'right' : 'left'
                      }}
                    >
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-[#525252] leading-[1.7] flex-1">
                        {language === 'ar' ? feature.ar : feature.en}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Notes */}
                {pkg.notes && (
                  <p className="text-xs text-gray-500 italic mb-4 text-center">
                    {language === 'ar' ? pkg.notes.ar : pkg.notes.en}
                  </p>
                )}

                {/* CTA Button */}
                <Button
                  onClick={() => {
                    setSelectedPackage(pkg);
                    setBookingDialogOpen(true);
                  }}
                  className="w-full text-white rounded-xl py-6 text-lg font-semibold transition-all duration-300 hover:scale-[1.02] mt-auto"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.35)',
                    fontWeight: 600,
                    padding: '14px 32px'
                  }}
                >
                  {language === 'ar' ? 'احجز الآن' : 'Book Now'}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-20 text-center rounded-2xl p-12 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 -10px 40px rgba(102, 126, 234, 0.2)'
          }}
        >
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 relative z-10">
            {language === 'ar' ? 'لديك استفسار؟' : 'Have a Question?'}
          </h2>
          <p className="text-xl text-white/90 mb-8 relative z-10">
            {language === 'ar'
              ? 'تواصل معنا للحصول على استشارة مجانية وباقة مخصصة'
              : 'Contact us for a free consultation and custom package'
            }
          </p>
          <a href="mailto:waleed@alwaleed.pro" className="relative z-10 inline-block">
            <Button size="lg" className="bg-white text-black hover:bg-gray-100 rounded-xl px-10 py-6 text-xl font-semibold shadow-xl transition-all duration-300 hover:scale-105" style={{ fontWeight: 600 }}>
              {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
            </Button>
          </a>
        </motion.div>
      </div>

      {/* Booking Dialog */}
      <BookingDialog
        open={bookingDialogOpen}
        onOpenChange={setBookingDialogOpen}
        packageInfo={selectedPackage}
        currentUser={user}
      />
    </div>
  );
}