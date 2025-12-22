import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Star, MapPin, Building2, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../components/LanguageContext";

export default function Home() {
  const { t, language } = useLanguage();

  const beforeAfterExamples = [
    {
      id: "visa-photo",
      before: "https://base44.app/api/apps/690011e6637df3b25a370af7/files/public/690011e6637df3b25a370af7/182b2239c_Screenshot2025-11-21064253.png",
      after: "https://base44.app/api/apps/690011e6637df3b25a370af7/files/public/690011e6637df3b25a370af7/2702f0040_edited-1763700285692.png",
      title: t('visaPhotoReady')
    },
    {
      id: "absher-photo",
      before: "https://base44.app/api/apps/690011e6637df3b25a370af7/files/public/690011e6637df3b25a370af7/c1bcc23bc_pexels-italo-melo-881954-2379004.jpg",
      after: "https://base44.app/api/apps/690011e6637df3b25a370af7/files/public/690011e6637df3b25a370af7/c372d3d27_edited-1764547451093.png",
      title: t('absherPhoto')
    },
    {
      id: "saudi-look",
      before: "https://base44.app/api/apps/690011e6637df3b25a370af7/files/public/690011e6637df3b25a370af7/e3a0814d4_7074919201_635b0bcdab_z.jpg",
      after: "https://base44.app/api/apps/690011e6637df3b25a370af7/files/public/690011e6637df3b25a370af7/cd59bd50b_edited-1763697717196.png",
      title: t('saudiLook')
    },
    {
      id: "baby-photo",
      before: "https://base44.app/api/apps/690011e6637df3b25a370af7/files/public/690011e6637df3b25a370af7/a1372b428_DSC02553.JPG",
      after: "https://base44.app/api/apps/690011e6637df3b25a370af7/files/public/690011e6637df3b25a370af7/d5b1dc14b_edited-1763699257215.png",
      title: t('babyPhoto')
    }
  ];

  const process = [
    { step: "01", title: t('step1Title'), desc: t('step1Desc') },
    { step: "02", title: t('step2Title'), desc: t('step2Desc') },
    { step: "03", title: t('step3Title'), desc: t('step3Desc') }
  ];

  return (
    <div className="bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 bg-gradient-to-br from-[#FFE5E5] via-white to-[#F5F5F7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className={`text-center ${language === 'ar' ? 'lg:text-right' : 'lg:text-left'}`}
            >
              <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{t('trustedByUsers')}</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.1] mb-6">
                <span className="text-[#1A1A2E]">
                  {t('heroMainTitle')}
                </span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E63946] to-[#FF6B6B]">
                  {t('heroPrintReady')}
                </span>
              </h1>
              
              <p className="text-xl text-[#4A4A5A] mb-8 leading-relaxed max-w-xl">
                {t('heroSubtitle')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center lg:justify-start">
                <Link to={createPageUrl("EditPhoto")}>
                  <Button size="lg" className="bg-[#E63946] hover:bg-[#C1121F] text-white rounded-full px-8 py-6 text-lg font-semibold transition-all group hover:-translate-y-0.5" style={{ boxShadow: '0 4px 14px rgba(230, 57, 70, 0.3)' }}>
                    {t('startEditing')}
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 sm:gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-600">{t('professionalQuality')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-600">{t('sixtySecondEditing')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-600">{t('globalShipping')}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl rotate-6 opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 rounded-3xl -rotate-6 opacity-20"></div>

                <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden p-4">
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&q=75"
                    alt="AI Enhanced Portrait"
                    className="w-full h-full object-cover rounded-2xl"
                  />

                  {/* 3D Camera Icon */}
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className={`absolute top-8 ${language === 'ar' ? 'left-8' : 'right-8'} w-20 h-20 cursor-pointer hover:scale-110 transition-transform`}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div className="relative w-full h-full" style={{ transform: 'rotateX(15deg) rotateY(-15deg)' }}>
                      {/* Camera Body */}
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl">
                        {/* Camera Lens */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-[#E63946] to-[#FF6B6B] rounded-full shadow-lg flex items-center justify-center">
                          <div className="w-6 h-6 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 bg-gradient-to-br from-[#E63946] to-[#FF6B6B] rounded-full animate-pulse"></div>
                          </div>
                        </div>
                        {/* Flash */}
                        <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-sm animate-pulse"></div>
                        {/* Shutter Button */}
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-2 bg-gray-600 rounded-full"></div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Before/After Examples */}
      <section className="py-24 bg-[#F5F5F7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-[#1A1A2E] mb-4">
              {t('seeTheDifference')}
            </h2>
            <p className="text-xl text-[#4A4A5A] max-w-2xl mx-auto">
              {t('realTransformations')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {beforeAfterExamples.map((example, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Link to={`${createPageUrl("EditPhoto")}?tool=${example.id}`}>
                  <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl smooth-transition feature-card hover:border-[#E63946]" style={{ transition: 'all 0.3s ease' }}>
                    <div className="grid grid-cols-2">
                      <div className="relative">
                        <img src={example.before} alt={t('before')} className="w-full h-64 object-cover" loading="lazy" />
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">{t('before')}</div>
                      </div>
                      <div className="relative">
                        <img src={example.after} alt={t('after')} className="w-full h-64 object-cover" loading="lazy" />
                        <div className="absolute bottom-2 right-2 bg-[#E63946] text-white text-xs px-2 py-1 rounded">{t('after')}</div>
                      </div>
                    </div>
                    <div className="p-5 bg-gradient-to-r from-[#E63946] to-[#FF6B6B] group-hover:from-[#C1121F] group-hover:to-[#E63946] smooth-transition min-h-[70px] flex items-center justify-center">
                      <h3 className="font-bold text-white text-center text-base sm:text-lg flex items-center justify-center gap-2">
                        {example.title}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 smooth-transition" />
                      </h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - 3D Immersive Section (Optimized) */}
      <section className="py-24 bg-white overflow-hidden relative">
        {/* Simplified Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-[#FFE5E5] to-[#FFB4B4] rounded-full blur-3xl"
            style={{ willChange: 'transform' }}
          />
          <motion.div
            animate={{
              scale: [1.1, 1, 1.1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br from-[#FFE5E5] to-[#D4A574] rounded-full blur-3xl"
            style={{ willChange: 'transform' }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl sm:text-5xl font-black text-[#1A1A2E] mb-4">
              {t('threeSteps')}
            </h2>
            <p className="text-xl text-[#4A4A5A] max-w-2xl mx-auto">
              {t('noComplicatedSoftware')}
            </p>
          </motion.div>

          {/* 3D Steps Container - Optimized */}
          <div className="relative">
            {/* Connecting Line - Desktop Only */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 pointer-events-none">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-[#FFE5E5] via-[#FFB4B4] to-[#E63946] origin-left"
                style={{ willChange: 'transform' }}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {process.map((item, index) => (
                <Link key={index} to={createPageUrl("EditPhoto")}>
                  <motion.div
                    initial={{ 
                      opacity: 0,
                      y: 50,
                    }}
                    whileInView={{ 
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ 
                      duration: 0.5,
                      delay: index * 0.15,
                      ease: "easeOut"
                    }}
                    whileHover={{
                      y: -10,
                      transition: { duration: 0.2, ease: "easeOut" }
                    }}
                    className="relative group cursor-pointer"
                  >
                    {/* 3D Card - Simplified */}
                    <div className="relative h-full">
                      {/* Simplified Shadow Layer */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#E63946]/10 to-[#FF6B6B]/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />

                      {/* Main Card */}
                      <div className="relative bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-gray-100 h-full transform-gpu transition-all duration-300 group-hover:shadow-2xl">
                        {/* Floating Number Badge - Simplified Animation */}
                        <div className="absolute -top-6 -right-6 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#E63946] to-[#FF6B6B] rounded-2xl flex items-center justify-center shadow-xl transform-gpu group-hover:scale-105 transition-transform duration-300">
                          <span className="text-2xl sm:text-3xl font-black text-white">
                            {item.step}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="relative z-10 pt-6">
                          {/* Icon Container */}
                          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mb-6 mx-auto transform-gpu group-hover:scale-110 transition-transform duration-300">
                            {index === 0 && (
                              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                            )}
                            {index === 1 && (
                              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                            )}
                            {index === 2 && (
                              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                              </svg>
                            )}
                          </div>

                          <h3 className="text-2xl sm:text-3xl font-bold text-[#1A1A2E] mb-4 text-center">
                            {item.title}
                          </h3>
                          <p className="text-[#4A4A5A] text-center text-lg leading-relaxed">
                            {item.desc}
                          </p>

                          {/* Decorative Line */}
                          <motion.div
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                            className="h-1 bg-gradient-to-r from-[#E63946] to-[#FF6B6B] rounded-full mt-6 origin-left"
                            style={{ willChange: 'transform' }}
                          />
                        </div>

                        {/* Subtle Hover Glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#E63946]/0 to-[#FF6B6B]/0 group-hover:from-[#E63946]/5 group-hover:to-[#FF6B6B]/5 rounded-3xl transition-opacity duration-300 pointer-events-none" />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>

          {/* CTA Button - Optimized */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.4, ease: "easeOut" }}
            className="text-center mt-20"
          >
            <Link to={createPageUrl("EditPhoto")}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Button 
                  size="lg" 
                  className="bg-[#E63946] hover:bg-[#C1121F] text-white rounded-full px-12 py-6 text-xl font-bold relative overflow-hidden group transition-all hover:-translate-y-0.5"
                  style={{ boxShadow: '0 4px 14px rgba(230, 57, 70, 0.3)' }}
                >
                  <span className="relative z-10 flex items-center gap-3">
                    {t('tryItNow')}
                    <motion.span
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <ArrowRight className="w-6 h-6" />
                    </motion.span>
                  </span>
                  {/* Simplified hover effect */}
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* About Us Preview Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-black text-[#1A1A2E] mb-4">
              {t('whoWeAre') || (language === 'ar' ? 'من نحن' : 'Who We Are')}
            </h2>
            <p className="text-xl text-[#4A4A5A] max-w-3xl mx-auto mb-8">
              {language === 'ar'
                ? 'استوديو الوليد هو الحل الرقمي الأول في المملكة العربية السعودية. نجمع بين التكنولوجيا والخبرة في الامتثال الحكومي لتقديم صور رسمية مضمونة القبول. موثوق من قبل الباحثين عن عمل والمسافرين والشركات في جميع أنحاء الشرق الأوسط.'
                : "Alwaleed Studio is Saudi Arabia's first digital-first photo solution. We combine technology with government compliance expertise to deliver official photos that get approved — guaranteed. Trusted by job seekers, travelers, and businesses across the Middle East."
              }
            </p>
            <Link to={createPageUrl("About")}>
              <Button className="bg-[#E63946] hover:bg-[#C1121F] text-white rounded-xl px-8 py-4 text-lg font-medium transition-all hover:-translate-y-0.5" style={{ boxShadow: '0 4px 14px rgba(230, 57, 70, 0.3)' }}>
                {language === 'ar' ? 'اعرف المزيد عنا' : 'Learn More About Us'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Visit Us Section */}
      <section className="py-24 bg-[#F5F5F7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-black text-[#1A1A2E] mb-4">
              {t('visitOurStudio')}
            </h2>
            <p className="text-xl text-[#4A4A5A] max-w-2xl mx-auto">
              {t('comeVisitUs')}
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden shadow-2xl h-[400px] lg:h-[500px]"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3575.7947385!2d50.03149015!3d26.57210132!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDM0JzE5LjYiTiA1MMKwMDEnNTMuNCJF!5e0!3m2!1sen!2s!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              ></iframe>
              <a
                href="https://www.google.com/maps/search/Studio%20Alwaleed/@26.57210132,50.03149015,17z"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-3 right-3 bg-white text-black px-4 py-2 rounded-lg shadow-lg hover:bg-gray-100 transition-all font-medium text-sm"
              >
                {t('viewLargerMap') || (language === 'ar' ? 'عرض خريطة أكبر' : 'View Larger Map')}
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col justify-center"
            >
              <div className="bg-gradient-to-br from-[#F5F5F7] to-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 bg-[#E63946] rounded-xl flex items-center justify-center">
                    <MapPin className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#1A1A2E]">Studio Alwaleed</h3>
                    <p className="text-[#4A4A5A]">{t('photographyStudio')}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#E63946] transition-colors">
                    <Building2 className="w-5 h-5 text-[#E63946] mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-[#1A1A2E] mb-2">{language === 'ar' ? 'العنوان' : 'Address'}</p>
                      <div className="text-sm text-[#4A4A5A] space-y-1">
                        {language === 'ar' ? (
                          <>
                            <p>2954 أحد – الواحة</p>
                            <p>الوحدة رقم 1</p>
                            <p>القطيف 32626 – 6172</p>
                            <p>المملكة العربية السعودية</p>
                          </>
                        ) : (
                          <>
                            <p>2954 uhud- alwaha</p>
                            <p>Unite N°1</p>
                            <p>AlQatif 32626 - 6172</p>
                            <p>Kingdom of Saudi Arabia</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <a
                    href="https://www.google.com/maps/search/Studio%20Alwaleed/@26.57210132,50.03149015,17z"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full bg-[#E63946] text-white hover:bg-[#C1121F] rounded-xl py-6 text-lg font-medium group transition-all hover:-translate-y-0.5" style={{ boxShadow: '0 4px 14px rgba(230, 57, 70, 0.3)' }}>
                      <MapPin className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      {t('getDirections')}
                    </Button>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-r from-[#E63946] to-[#FF6B6B]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
              {t('perfectPhotoSecondsAway')}
            </h2>
            <p className="text-xl text-white/90 mb-8">
              {t('joinUsers')}
            </p>
            <Link to={createPageUrl("EditPhoto")}>
              <Button size="lg" className="bg-white text-[#1A1A2E] hover:bg-gray-100 rounded-full px-10 py-7 text-xl font-bold shadow-2xl hover:-translate-y-1 transition-all">
                {t('startEditing')}
                <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}