import React from "react";
import { Card } from "@/components/ui/card";
import { Shield, Mail, MapPin, Calendar, Lock, Eye, Share2, FileText, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../components/LanguageContext";

export default function Privacy() {
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';

  const sections = [
    {
      icon: Eye,
      title: isArabic ? "المعلومات التي نجمعها" : "Information We Collect",
      content: isArabic 
        ? "نقوم بجمع المعلومات التي تقدمها لنا مباشرة عند استخدام خدماتنا، بما في ذلك: الاسم والبريد الإلكتروني وعنوان الشحن والصور التي تقوم بتحميلها للتحرير. نجمع أيضًا معلومات حول كيفية استخدامك لخدماتنا، مثل نوع المتصفح والجهاز وعنوان IP."
        : "We collect information you provide directly to us when using our services, including: name, email address, shipping address, and photos you upload for editing. We also collect information about how you use our services, such as browser type, device, and IP address."
    },
    {
      icon: Lock,
      title: isArabic ? "كيف نستخدم معلوماتك" : "How We Use Your Information",
      content: isArabic
        ? "نستخدم المعلومات التي نجمعها لتوفير وتحسين وتخصيص خدماتنا، معالجة الطلبات وإدارة حسابك، الاتصال بك بشأن خدماتنا، وتطوير ميزات جديدة. نستخدم الصور التي تحملها حصريًا لمعالجتها بالذكاء الاصطناعي وطباعتها حسب طلبك."
        : "We use the information we collect to: provide, improve, and personalize our services; process orders and manage your account; communicate with you about our services; and develop new features. We use the photos you upload exclusively for AI processing and printing as requested by you."
    },
    {
      icon: Share2,
      title: isArabic ? "مشاركة المعلومات" : "Information Sharing",
      content: isArabic
        ? "نحن لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك مع مقدمي الخدمات الذين يساعدوننا في تشغيل أعمالنا (مثل معالجة الدفع وخدمات الشحن)، عند الحاجة للامتثال للقانون، أو لحماية حقوقنا وسلامة مستخدمينا."
        : "We do not sell or rent your personal information to third parties. We may share your information with: service providers who help us operate our business (e.g., payment processing, shipping); when required to comply with the law; or to protect our rights and the safety of our users."
    },
    {
      icon: FileText,
      title: isArabic ? "الاحتفاظ بالبيانات" : "Data Retention",
      content: isArabic
        ? "نحتفظ بمعلوماتك الشخصية طالما كان حسابك نشطًا أو حسب الحاجة لتقديم خدماتنا. يتم حذف الصور المحملة بشكل دائم من خوادمنا بعد 30 يومًا من المعالجة، ما لم تختر حفظها في معرضك. يمكنك طلب حذف حسابك وجميع البيانات المرتبطة به في أي وقت."
        : "We retain your personal information for as long as your account is active or as needed to provide our services. Uploaded photos are permanently deleted from our servers after 30 days of processing, unless you choose to save them in your gallery. You may request deletion of your account and all associated data at any time."
    },
    {
      icon: Shield,
      title: isArabic ? "أمن البيانات" : "Data Security",
      content: isArabic
        ? "نستخدم تدابير أمنية على مستوى الصناعة لحماية معلوماتك، بما في ذلك التشفير أثناء النقل والتخزين، والوصول الآمن إلى الخوادم، ومراجعات الأمان المنتظمة. ومع ذلك، لا يمكن ضمان أي طريقة نقل عبر الإنترنت أو التخزين الإلكتروني بنسبة 100٪."
        : "We use industry-standard security measures to protect your information, including encryption in transit and at rest, secure server access, and regular security audits. However, no method of transmission over the internet or electronic storage is 100% secure."
    },
    {
      icon: AlertCircle,
      title: isArabic ? "حقوقك" : "Your Rights",
      content: isArabic
        ? "لديك الحق في الوصول إلى معلوماتك الشخصية وتصحيحها أو حذفها، الاعتراض على معالجة معلوماتك أو طلب تقييدها، طلب نقل بياناتك إلى منظمة أخرى، وسحب موافقتك في أي وقت. للمطالبة بهذه الحقوق، يرجى الاتصال بنا على البريد الإلكتروني أدناه."
        : "You have the right to: access, correct, or delete your personal information; object to or restrict the processing of your information; request data portability to another organization; and withdraw your consent at any time. To exercise these rights, please contact us at the email below."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-black rounded-2xl mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-black mb-4">
            {isArabic ? "سياسة الخصوصية" : "Privacy Policy"}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {isArabic 
              ? "نحن في استوديو الوليد نلتزم بحماية خصوصيتك وبياناتك الشخصية"
              : "At Studio Alwaleed, we are committed to protecting your privacy and personal data"
            }
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{isArabic ? "آخر تحديث: يناير 2025" : "Last Updated: January 2025"}</span>
          </div>
        </motion.div>

        {/* Company Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8 bg-white border-none shadow-lg rounded-2xl mb-8">
            <h2 className="text-2xl font-bold text-black mb-6">
              {isArabic ? "معلومات الشركة" : "Company Information"}
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-black mb-1">
                    {isArabic ? "الموقع" : "Location"}
                  </h3>
                  <p className="text-gray-600">
                    {isArabic 
                      ? "استوديو الوليد، تاروت، المملكة العربية السعودية"
                      : "Studio Alwaleed, Tarout, Saudi Arabia"
                    }
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {isArabic ? "العنوان الوطني: EGDA2954" : "National Address: EGDA2954"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-black mb-1">
                    {isArabic ? "تواصل معنا" : "Contact Us"}
                  </h3>
                  <a 
                    href="mailto:waleedgz7777@gmail.com" 
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    waleedgz7777@gmail.com
                  </a>
                  <p className="text-sm text-gray-500 mt-1">
                    {isArabic 
                      ? "للاستفسارات عن الخصوصية وحقوق البيانات"
                      : "For privacy inquiries and data rights requests"
                    }
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Privacy Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 2) }}
            >
              <Card className="p-6 sm:p-8 bg-white border-none shadow-lg rounded-2xl hover:shadow-xl transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#E63946] to-[#FF6B6B] rounded-xl flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-black mb-3">
                      {section.title}
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Cookies & Tracking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="p-8 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl mt-8">
            <h2 className="text-2xl font-bold text-black mb-4">
              {isArabic ? "ملفات تعريف الارتباط والتتبع" : "Cookies & Tracking"}
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              {isArabic
                ? "نستخدم ملفات تعريف الارتباط وتقنيات التتبع المماثلة لتحسين تجربة المستخدم، وتحليل أنماط استخدام الموقع، وتخصيص المحتوى. يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات المتصفح الخاص بك. لاحظ أن تعطيل ملفات تعريف الارتباط قد يؤثر على وظائف معينة في الموقع."
                : "We use cookies and similar tracking technologies to enhance user experience, analyze site usage patterns, and personalize content. You can control cookies through your browser settings. Note that disabling cookies may affect certain site functionalities."
              }
            </p>
          </Card>
        </motion.div>

        {/* Changes to Policy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="p-8 bg-black text-white rounded-2xl mt-8">
            <h2 className="text-2xl font-bold mb-4">
              {isArabic ? "التغييرات على هذه السياسة" : "Changes to This Policy"}
            </h2>
            <p className="text-gray-300 leading-relaxed">
              {isArabic
                ? "قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنخطرك بأي تغييرات عن طريق نشر السياسة الجديدة على هذه الصفحة وتحديث تاريخ 'آخر تحديث' أعلاه. يُنصح بمراجعة هذه الصفحة بشكل دوري للاطلاع على أي تغييرات."
                : "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the 'Last Updated' date above. You are advised to review this page periodically for any changes."
              }
            </p>
          </Card>
        </motion.div>

        {/* Contact Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Card className="p-8 bg-gradient-to-r from-[#E63946] to-[#FF6B6B] text-white rounded-2xl mt-8 text-center">
            <Mail className="w-16 h-16 mx-auto mb-4 opacity-90" />
            <h2 className="text-2xl font-bold mb-3">
              {isArabic ? "هل لديك أسئلة حول الخصوصية؟" : "Questions About Privacy?"}
            </h2>
            <p className="text-white/90 mb-6 max-w-lg mx-auto">
              {isArabic
                ? "إذا كان لديك أي أسئلة أو مخاوف بشأن سياسة الخصوصية هذه أو ممارساتنا للبيانات، فلا تتردد في الاتصال بنا."
                : "If you have any questions or concerns about this Privacy Policy or our data practices, please don't hesitate to contact us."
              }
            </p>
            <a 
              href="mailto:waleedgz7777@gmail.com"
              className="inline-block bg-white text-black px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all"
            >
              {isArabic ? "راسلنا عبر البريد الإلكتروني" : "Email Us"}
            </a>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}