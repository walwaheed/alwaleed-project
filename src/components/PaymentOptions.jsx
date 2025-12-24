import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building2, QrCode, ArrowLeft, MessageCircle, Copy, Check, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "./LanguageContext";
import { getSession } from "@/lib/supabase";

export default function PaymentOptions({ bookingData, packageInfo, onBack }) {
  const { language } = useLanguage();
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaylinkPayment = async () => {
    setIsProcessing(true);
    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      // Get session token for authentication
      const session = await getSession();
      const headers = {
        'Content-Type': 'application/json'
      };

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`${backendUrl}/api/paylink/create-payment`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          amount: packageInfo?.price,
          clientName: `${bookingData.firstName} ${bookingData.lastName}`,
          clientMobile: bookingData.phone,
          clientEmail: bookingData.email,
          address: bookingData.address,
          bookingDate: bookingData.bookingDate,
          packageTitle: language === 'ar' ? packageInfo?.title : packageInfo?.titleEn
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment initialization failed');
      }

      if (data.success && data.paymentUrl) {
        // Redirect to Paylink
        window.location.href = data.paymentUrl;
      } else {
        toast.error("Failed to get payment URL");
      }

    } catch (error) {
      console.error('Payment Error:', error);
      toast.error(error.message || "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      `${language === 'ar' ? 'مرحباً، أود تأكيد حجزي' : 'Hello, I would like to confirm my booking'}\n\n` +
      `${language === 'ar' ? 'الاسم' : 'Name'}: ${bookingData.firstName} ${bookingData.lastName}\n` +
      `${language === 'ar' ? 'البريد الإلكتروني' : 'Email'}: ${bookingData.email}\n` +
      `${language === 'ar' ? 'تاريخ الحجز' : 'Booking Date'}: ${bookingData.bookingDate}\n` +
      `${language === 'ar' ? 'الباقة' : 'Package'}: ${language === 'ar' ? packageInfo?.title : packageInfo?.titleEn}\n` +
      `${language === 'ar' ? 'المبلغ' : 'Amount'}: ${packageInfo?.price} SAR`
    );
    window.open(`https://wa.me/966133444101?text=${message}`, '_blank');
  };

  const paymentMethods = [
    {
      id: 'paylink',
      title: language === 'ar' ? 'دفع إلكتروني (مدى / فيزا / أبل باي)' : 'Online Payment (Mada / Visa / Apple Pay)',
      icon: CreditCard,
      isOnline: true
    },
    {
      id: 'snb',
      title: language === 'ar' ? 'تحويل بنكي - البنك الأهلي السعودي' : 'Bank Transfer - SNB',
      icon: Building2,
      details: {
        accountName: language === 'ar' ? 'استديو وليد الوحيد للتصوير الفوتوغرافي' : 'Waleed Al Waheed Photography Studio',
        accountNumber: '96500003629103',
        iban: 'SA6210000096500003629103',
        bank: language === 'ar' ? 'البنك الأهلي السعودي (SNB)' : 'Saudi National Bank (SNB)'
      }
    },
    {
      id: 'stc',
      title: language === 'ar' ? 'الدفع السريع - STC Pay' : 'Quick Pay - STC Pay',
      icon: QrCode,
      qrCode: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690011e6637df3b25a370af7/036f27a6f_STCBankQR.jpg'
    },
    {
      id: 'inma',
      title: language === 'ar' ? 'تحويل بنكي - بنك الإنماء' : 'Bank Transfer - INMA Bank',
      icon: Building2,
      details: {
        accountNumber: '68204760079000',
        bank: language === 'ar' ? 'بنك الإنماء (INMA)' : 'INMA Bank'
      }
    }
  ];

  return (
    <div className="space-y-6 py-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {onBack && (
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === 'ar' ? 'رجوع' : 'Back'}
        </Button>
      )}

      {/* Package Summary */}
      {packageInfo && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-none">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg">
                {language === 'ar' ? packageInfo.title : packageInfo.titleEn}
              </h3>
              <p className="text-sm text-gray-600">
                {language === 'ar' ? 'تاريخ الحجز' : 'Booking Date'}: {bookingData.bookingDate}
              </p>
            </div>
            <div className="text-2xl font-bold text-[#1e3a8a]">
              {packageInfo.price} {language === 'ar' ? 'ر.س' : 'SAR'}
            </div>
          </div>
        </Card>
      )}

      {/* Payment Methods */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {language === 'ar' ? 'اختر طريقة الدفع' : 'Choose Payment Method'}
        </h3>

        {paymentMethods.map((method) => (
          <Card
            key={method.id}
            onClick={() => setSelectedMethod(selectedMethod === method.id ? null : method.id)}
            className={`p-4 cursor-pointer transition-all duration-300 ${selectedMethod === method.id
              ? 'border-2 border-[#3b82f6] shadow-lg'
              : 'border border-gray-200 hover:border-gray-300'
              }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedMethod === method.id ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                <method.icon className={`w-6 h-6 ${selectedMethod === method.id ? 'text-blue-600' : 'text-gray-600'
                  }`} />
              </div>
              <h4 className="font-semibold text-lg flex-1">{method.title}</h4>
            </div>

            {selectedMethod === method.id && (
              <div className="mt-4 space-y-3 animate-in slide-in-from-top-2">
                {method.isOnline ? (
                  <div className="p-2">
                    <p className="text-sm text-gray-600 mb-4">
                      {language === 'ar'
                        ? 'سيتم تحويلك إلى صفحة الدفع الآمنة لإتمام العملية.'
                        : 'You will be redirected to a secure payment page to complete the transaction.'}
                    </p>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePaylinkPayment();
                      }}
                      className="w-full bg-[#1e3a8a] hover:bg-[#1e40af] text-white"
                      disabled={isProcessing}
                    >
                      {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {language === 'ar'
                        ? `دفع ${packageInfo?.price} ر.س`
                        : `Pay ${packageInfo?.price} SAR`}
                    </Button>
                  </div>
                ) : method.qrCode ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={method.qrCode}
                      alt="STC Pay QR Code"
                      className="w-64 h-auto rounded-xl shadow-lg"
                    />
                    <p className="text-sm text-gray-600 mt-4 text-center">
                      {language === 'ar'
                        ? 'امسح رمز QR من تطبيق STC Pay'
                        : 'Scan QR code from STC Pay app'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 bg-gray-50 p-4 rounded-xl">
                    {method.details.accountName && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          {language === 'ar' ? 'اسم الحساب' : 'Account Name'}
                        </p>
                        <p className="font-medium">{method.details.accountName}</p>
                      </div>
                    )}

                    {method.details.accountNumber && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          {language === 'ar' ? 'رقم الحساب' : 'Account Number'}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="font-mono font-bold text-lg">{method.details.accountNumber}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(method.details.accountNumber, `${method.id}-account`);
                            }}
                            className="h-8"
                          >
                            {copiedField === `${method.id}-account` ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {method.details.iban && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          {language === 'ar' ? 'رقم الآيبان' : 'IBAN'}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="font-mono font-bold text-lg">{method.details.iban}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(method.details.iban, `${method.id}-iban`);
                            }}
                            className="h-8"
                          >
                            {copiedField === `${method.id}-iban` ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {method.details.bank && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          {language === 'ar' ? 'البنك' : 'Bank'}
                        </p>
                        <p className="font-medium">{method.details.bank}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Contact Instructions */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
        <div className="text-center space-y-4">
          <h4 className="font-bold text-lg">
            {language === 'ar' ? 'بعد إتمام الدفع' : 'After Payment'}
          </h4>
          <p className="text-gray-700">
            {language === 'ar'
              ? 'يرجى إرسال لقطة شاشة لإيصال الدفع إلى رقم الواتساب:'
              : 'Please send a screenshot of the payment receipt to WhatsApp:'
            }
          </p>
          <div className="flex items-center justify-center gap-2">
            <p className="text-2xl font-bold text-green-700 font-mono" dir="ltr">+966 13 344 4101</p>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard('+966133444101', 'phone')}
            >
              {copiedField === 'phone' ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <Button
            onClick={handleWhatsAppContact}
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-6 text-lg font-semibold shadow-lg"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            {language === 'ar' ? 'تواصل عبر واتساب' : 'Contact via WhatsApp'}
          </Button>
        </div>
      </Card>
    </div>
  );
}