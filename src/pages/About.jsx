import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Camera, 
  Shield, 
  Briefcase, 
  Globe, 
  Zap, 
  CheckCircle2, 
  Award,
  Target,
  Users,
  TrendingUp,
  Cpu
} from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../components/LanguageContext";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";

export default function About() {
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';

  const services = [
    {
      icon: Shield,
      title: isArabic ? "الصور الحكومية الرسمية" : "Official Government Photos",
      description: isArabic 
        ? "التقاط الصور وفق متطلبات الجهات الحكومية (أبشر، منصة التأشيرات، السفارات) مع التحقق الآلي من المواصفات الفنية"
        : "Capture photos according to government requirements (Absher, visa platforms, embassies) with automatic technical specification verification",
      color: "from-blue-600 to-cyan-600",
      features: isArabic 
        ? ["صور أبشر", "تأشيرات سفر", "جوازات السفر", "الأحوال المدنية"]
        : ["Absher Photos", "Travel Visas", "Passports", "Civil Affairs"]
    },
    {
      icon: Briefcase,
      title: isArabic ? "صور احترافية للتوظيف" : "Professional Employment Photos",
      description: isArabic
        ? "صور احترافية مهيّأة لمنصات التوظيف (LinkedIn، Bayt، Naukrigulf) مع تحسين الهوية البصرية للمتقدمين"
        : "Professional photos optimized for employment platforms (LinkedIn, Bayt, Naukrigulf) with enhanced visual identity",
      color: "from-purple-600 to-pink-600",
      features: isArabic
        ? ["صور LinkedIn", "السير الذاتية", "ملفات التوظيف", "هوية مهنية"]
        : ["LinkedIn Photos", "CV Photos", "Employment Profiles", "Professional Identity"]
    },
    {
      icon: Globe,
      title: isArabic ? "حلول رقمية للقطاع السياحي" : "Digital Tourism Solutions",
      description: isArabic
        ? "صور تأشيرات السفر والسياحة وفق متطلبات السفارات مع خدمة الرفع المباشر للمواقع الرسمية"
        : "Travel and tourism visa photos according to embassy requirements with direct upload service to official websites",
      color: "from-green-600 to-emerald-600",
      features: isArabic
        ? ["تأشيرات سياحية", "رفع مباشر", "متطلبات السفارات", "مكاتب السفر"]
        : ["Tourist Visas", "Direct Upload", "Embassy Requirements", "Travel Agencies"]
    }
  ];

  const aiFeatures = [
    {
      icon: Cpu,
      title: isArabic ? "تحليل احترافي للصور" : "Professional Photo Analysis",
      description: isArabic
        ? "التحقق التلقائي من مطابقة الصور للشروط والمواصفات الفنية"
        : "Automatic verification of photo compliance with technical specifications"
      },
      {
      icon: Zap,
      title: isArabic ? "خبرة متخصصة" : "Expert Specialization",
      description: isArabic
        ? "تحديد نوع الصورة المطلوبة (جواز، فيزا، لينكدإن، هوية)"
        : "Identify photo type requirements (passport, visa, LinkedIn, ID)"
      },
      {
      icon: Target,
      title: isArabic ? "تحسين فوري" : "Instant Enhancement",
      description: isArabic
        ? "معالجة احترافية للصور وتحسين الجودة والخلفية تلقائياً"
        : "Professional photo processing with automatic quality and background enhancement"
      }
  ];

  const stats = [
    { number: "10,000+", label: isArabic ? "صورة معالجة" : "Photos Processed" },
    { number: "98%", label: isArabic ? "رضا العملاء" : "Customer Satisfaction" },
    { number: "< 60s", label: isArabic ? "وقت المعالجة" : "Processing Time" },
    { number: "24/7", label: isArabic ? "خدمة متاحة" : "Service Available" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge className="mb-6 bg-gradient-to-r from-[#E63946] to-[#FF6B6B] text-white border-none px-6 py-2 text-base">
              <Sparkles className="w-4 h-4 mr-2" />
              {isArabic ? "الاستيديو الرقمي الأول في المملكة" : "First Digital Studio in the Kingdom"}
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-black mb-6">
              {isArabic ? "استيديو الوليد الرقمي" : "Alwaleed Digital Studio"}
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              {isArabic 
                ? "المنصة الوطنية الأولى التي تقدم حل رقمي فوري للصور الرسمية والمهنية، تربط العميل بالأنظمة الحكومية ومنصات التوظيف بشكل مباشر وآمن"
                : "The first national platform offering instant digital solutions for official and professional photos, directly connecting clients with government systems and employment platforms securely"
              }
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to={createPageUrl("EditPhoto")}>
                <Button className="bg-black text-white hover:bg-gray-900 rounded-xl px-8 py-4 text-lg font-semibold shadow-xl">
                  <Camera className="w-5 h-5 mr-2" />
                  {isArabic ? "ابدأ الآن" : "Get Started"}
                </Button>
              </Link>
              <a href="#services">
                <Button variant="outline" className="border-2 border-black text-black hover:bg-black hover:text-white rounded-xl px-8 py-4 text-lg font-semibold">
                  {isArabic ? "اكتشف خدماتنا" : "Discover Our Services"}
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16"
          >
            {stats.map((stat, index) => (
              <Card key={index} className="p-6 bg-white border-none shadow-lg rounded-2xl text-center hover:shadow-xl transition-all">
                <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#E63946] to-[#FF6B6B] mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  {stat.label}
                </div>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#E63946] rounded-2xl mb-6">
              <Target className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              {isArabic ? "مهمتنا" : "Our Mission"}
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {isArabic
                ? "تحويل خدمات التصوير التقليدية إلى منظومة ذكية متكاملة، تربط بين متطلبات الجهات الحكومية واحتياجات السوق المهني، وتقديم كل ذلك عبر قناة رقمية واحدة موثوقة وسريعة"
                : "Transform traditional photography services into an integrated smart system, connecting government requirements and professional market needs, delivering everything through a single reliable and fast digital channel"
              }
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
              {isArabic ? "خدماتنا الرقمية" : "Our Digital Services"}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {isArabic
                ? "حلول شاملة تغطي جميع احتياجاتك من الصور الرسمية والمهنية"
                : "Comprehensive solutions covering all your official and professional photo needs"
              }
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-8 bg-white border-none shadow-lg rounded-2xl hover:shadow-xl transition-all h-full">
                  <div className={`w-16 h-16 bg-gradient-to-br from-[#E63946] to-[#FF6B6B] rounded-2xl flex items-center justify-center mb-6`}>
                    <service.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {service.description}
                  </p>
                  <div className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-[#E63946] flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#E63946] to-[#FF6B6B] rounded-2xl mb-6">
              <Cpu className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
              {isArabic ? "التقنية الاحترافية" : "Professional Technology"}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {isArabic
                ? "تقنية احترافية متطورة تضمن الجودة والمطابقة لجميع المعايير المطلوبة"
                : "Advanced professional technology ensuring quality and compliance with all required standards"
              }
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {aiFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-8 bg-white border-none shadow-lg rounded-2xl hover:shadow-xl transition-all text-center h-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#E63946]/10 to-[#FF6B6B]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="w-8 h-8 text-[#E63946]" />
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-black rounded-2xl mb-6">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
              {isArabic ? "لماذا نحن؟" : "Why Choose Us?"}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {isArabic
                ? "ميزتنا التنافسية التي تجعلنا الخيار الأول"
                : "Our competitive advantage that makes us the first choice"
              }
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 bg-gradient-to-br from-[#E63946] to-[#FF6B6B] text-white border-none shadow-xl rounded-2xl h-full">
                <TrendingUp className="w-12 h-12 mb-6" />
                <h3 className="text-2xl font-bold mb-4">
                  {isArabic ? "حل رقمي فوري" : "Instant Digital Solution"}
                </h3>
                <p className="text-white/90 leading-relaxed mb-6">
                  {isArabic
                    ? "نقدم حل رقمي فوري للصور الرسمية والمهنية، بدلاً من الانتظار والزيارات المتعددة للاستديوهات التقليدية"
                    : "We provide instant digital solutions for official and professional photos, eliminating waiting times and multiple visits to traditional studios"
                  }
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>{isArabic ? "معالجة خلال 60 ثانية" : "Processing in 60 seconds"}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>{isArabic ? "متاح 24/7" : "Available 24/7"}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>{isArabic ? "من أي مكان" : "From anywhere"}</span>
                  </li>
                </ul>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 bg-gradient-to-br from-[#E63946] to-[#FF6B6B] text-white border-none shadow-xl rounded-2xl h-full">
                <Users className="w-12 h-12 mb-6" />
                <h3 className="text-2xl font-bold mb-4">
                  {isArabic ? "ربط مباشر وآمن" : "Direct & Secure Connection"}
                </h3>
                <p className="text-white/90 leading-relaxed mb-6">
                  {isArabic
                    ? "نربط العميل مباشرة بالأنظمة الحكومية ومنصات التوظيف بشكل آمن وموثوق، مع الحفاظ على خصوصية بياناتك"
                    : "We directly connect clients with government systems and employment platforms securely and reliably, while maintaining your data privacy"
                  }
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>{isArabic ? "ربط حكومي معتمد" : "Certified government integration"}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>{isArabic ? "حماية البيانات" : "Data protection"}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>{isArabic ? "رفع مباشر" : "Direct upload"}</span>
                  </li>
                </ul>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#E63946] to-[#FF6B6B]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              {isArabic ? "جاهز لتجربة المستقبل؟" : "Ready to Experience the Future?"}
            </h2>
            <p className="text-xl text-white/90 mb-8">
              {isArabic
                ? "ابدأ الآن واحصل على صورك الرسمية والمهنية في أقل من دقيقة"
                : "Start now and get your official and professional photos in less than a minute"
              }
            </p>
            <Link to={createPageUrl("EditPhoto")}>
              <Button size="lg" className="bg-white text-black hover:bg-gray-100 rounded-xl px-10 py-6 text-xl font-bold shadow-2xl">
                <Camera className="w-6 h-6 mr-2" />
                {isArabic ? "ابدأ الآن مجاناً" : "Start Now Free"}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}