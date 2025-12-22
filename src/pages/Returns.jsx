import React from "react";
import { Card } from "@/components/ui/card";
import { RefreshCw, Mail, Package, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../components/LanguageContext";

export default function Returns() {
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';

  const policies = [
    {
      icon: Clock,
      title: isArabic ? "فترة الإرجاع" : "Return Period",
      content: isArabic
        ? "لديك 14 يومًا من تاريخ استلام طلبك لطلب الإرجاع أو الاسترداد. يجب أن تكون المطبوعات في حالتها الأصلية وغير مستخدمة وفي عبواتها الأصلية."
        : "You have 14 days from the date of receiving your order to request a return or refund. Prints must be in their original condition, unused, and in original packaging.",
      color: "from-blue-600 to-cyan-600"
    },
    {
      icon: CheckCircle2,
      title: isArabic ? "الحالات المؤهلة للاسترداد" : "Eligible for Refund",
      content: isArabic
        ? "عيوب التصنيع أو مشاكل في جودة الطباعة، تلف أثناء الشحن (مع إثبات فوتوغرافي)، خطأ في الطلب من جانبنا (حجم أو نمط خاطئ)، أو عدم استلام الطلب بعد 30 يومًا من تاريخ الشحن."
        : "Manufacturing defects or print quality issues; damage during shipping (with photographic proof); wrong order from our side (incorrect size or style); or non-receipt of order after 30 days from shipping date.",
      color: "from-green-600 to-emerald-600"
    },
    {
      icon: XCircle,
      title: isArabic ? "غير مؤهل للاسترداد" : "Not Eligible for Refund",
      content: isArabic
        ? "الصور المخصصة التي تم طباعتها حسب طلبك (ما لم تكن معيبة)، المطبوعات المستخدمة أو التالفة من قبل العميل، تغيير الرأي بعد الطباعة، أو أخطاء في ملف الصورة المقدم من العميل."
        : "Custom photos printed per your request (unless defective); prints used or damaged by customer; change of mind after printing; or errors in the image file provided by the customer.",
      color: "from-red-600 to-pink-600"
    },
    {
      icon: RefreshCw,
      title: isArabic ? "عملية الإرجاع" : "Return Process",
      content: isArabic
        ? "اتصل بنا على waleedgz7777@gmail.com مع رقم الطلب والصور ووصف المشكلة. سنراجع طلبك في غضون 48 ساعة. إذا تمت الموافقة، سنرسل تعليمات الإرجاع. بمجرد استلام المنتج وفحصه، سنعالج استردادك في غضون 5-7 أيام عمل."
        : "Contact us at waleedgz7777@gmail.com with your order number, photos, and issue description. We'll review your request within 48 hours. If approved, we'll send return instructions. Once we receive and inspect the item, we'll process your refund within 5-7 business days.",
      color: "from-purple-600 to-violet-600"
    },
    {
      icon: Package,
      title: isArabic ? "تكاليف الشحن" : "Shipping Costs",
      content: isArabic
        ? "إذا كان الخطأ من جانبنا (معيب، تالف، أو طلب خاطئ)، سنتحمل تكاليف الشحن للإرجاع. في حالة تغيير الرأي أو حالات غير مؤهلة أخرى، يكون العميل مسؤولاً عن تكاليف الشحن."
        : "If the error is on our side (defective, damaged, or wrong order), we cover return shipping costs. For change of mind or other non-eligible cases, the customer is responsible for shipping costs.",
      color: "from-orange-600 to-amber-600"
    },
    {
      icon: AlertTriangle,
      title: isArabic ? "شروط مهمة" : "Important Conditions",
      content: isArabic
        ? "يجب الإبلاغ عن التلف الذي يحدث أثناء الشحن في غضون 48 ساعة من التسليم. الطلبات المخصصة ذات المواصفات الخاصة غير قابلة للإرجاع ما لم تكن معيبة. نحتفظ بالحق في رفض الإرجاع إذا لم يتم استيفاء الشروط. يتم استرداد الأموال بنفس طريقة الدفع الأصلية."
        : "Damage during shipping must be reported within 48 hours of delivery. Custom orders with special specifications are non-returnable unless defective. We reserve the right to refuse returns if conditions are not met. Refunds are issued to the original payment method.",
      color: "from-yellow-600 to-orange-600"
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
            <RefreshCw className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-black mb-4">
            {isArabic ? "سياسة الإرجاع والاسترداد" : "Return & Refund Policy"}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {isArabic
              ? "نلتزم برضاك التام عن جودة منتجاتنا وخدماتنا"
              : "We are committed to your complete satisfaction with our products and services"
            }
          </p>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8 bg-gradient-to-r from-[#E63946] to-[#FF6B6B] text-white rounded-2xl mb-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-2">
                  {isArabic ? "بحاجة للمساعدة في الإرجاع؟" : "Need Help with a Return?"}
                </h2>
                <p className="text-white/90 mb-3">
                  {isArabic
                    ? "تواصل معنا وسنساعدك في معالجة طلب الإرجاع أو الاسترداد"
                    : "Contact us and we'll help you process your return or refund request"
                  }
                </p>
                <a
                  href="mailto:waleedgz7777@gmail.com"
                  className="inline-block bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all"
                >
                  waleedgz7777@gmail.com
                </a>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Policy Sections */}
        <div className="space-y-6">
          {policies.map((policy, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 2) }}
            >
              <Card className="p-6 sm:p-8 bg-white border-none shadow-lg rounded-2xl hover:shadow-xl transition-all overflow-hidden">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${policy.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <policy.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-black mb-3">
                      {policy.title}
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      {policy.content}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="p-8 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl mt-8">
            <h2 className="text-2xl font-bold text-black mb-4">
              {isArabic ? "معلومات إضافية" : "Additional Information"}
            </h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>
                  {isArabic
                    ? "جميع المبالغ المستردة تُعالج بالريال السعودي (SAR)"
                    : "All refunds are processed in Saudi Riyals (SAR)"
                  }
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>
                  {isArabic
                    ? "قد يستغرق ظهور المبلغ المسترد في حسابك من 7-14 يوم عمل حسب البنك"
                    : "Refunds may take 7-14 business days to appear in your account depending on your bank"
                  }
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>
                  {isArabic
                    ? "يتم التعامل مع كل حالة على حدة لضمان العدالة لجميع الأطراف"
                    : "Each case is handled individually to ensure fairness to all parties"
                  }
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>
                  {isArabic
                    ? "نحتفظ بالحق في تحديث هذه السياسة في أي وقت مع إشعار العملاء"
                    : "We reserve the right to update this policy at any time with customer notification"
                  }
                </span>
              </li>
            </ul>
          </Card>
        </motion.div>

        {/* Contact Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Card className="p-8 bg-black text-white rounded-2xl mt-8 text-center">
            <h2 className="text-2xl font-bold mb-3">
              {isArabic ? "نحن هنا لمساعدتك" : "We're Here to Help"}
            </h2>
            <p className="text-gray-300 mb-6 max-w-lg mx-auto">
              {isArabic
                ? "رضاك هو أولويتنا. إذا كانت لديك أي أسئلة أو مخاوف بشأن طلبك، فلا تتردد في التواصل معنا."
                : "Your satisfaction is our priority. If you have any questions or concerns about your order, don't hesitate to reach out."
              }
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="mailto:waleedgz7777@gmail.com"
                className="inline-block bg-white text-black px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all"
              >
                <Mail className="w-5 h-5 inline-block mr-2" />
                {isArabic ? "راسلنا" : "Email Us"}
              </a>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}