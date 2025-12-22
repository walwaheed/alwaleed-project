import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, User, Mail, MapPin, Phone } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import PaymentOptions from "./PaymentOptions";

export default function BookingDialog({ open, onOpenChange, packageInfo }) {
  const { language } = useLanguage();
  const [step, setStep] = useState(1); // 1: Booking Info, 2: Payment
  const [bookingData, setBookingData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    phone: "",
    bookingDate: ""
  });

  const handleInputChange = (field, value) => {
    setBookingData({ ...bookingData, [field]: value });
  };

  const isFormValid = () => {
    return bookingData.firstName && 
           bookingData.lastName && 
           bookingData.email && 
           bookingData.address && 
           bookingData.phone && 
           bookingData.bookingDate;
  };

  const handleContinueToPayment = async () => {
    if (isFormValid()) {
      // Send booking data to webhook
      try {
        const webhookData = {
          firstName: bookingData.firstName,
          lastName: bookingData.lastName,
          email: bookingData.email,
          phone: bookingData.phone,
          address: bookingData.address,
          bookingDate: bookingData.bookingDate,
          packageTitle: language === 'ar' ? packageInfo?.title : packageInfo?.titleEn,
          packagePrice: packageInfo?.price,
          timestamp: new Date().toISOString()
        };

        await fetch('https://n8n.renovaai.cloud/webhook/Alwaleed-booking-orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookData)
        });
      } catch (error) {
        console.error('Error sending booking data:', error);
      }

      setStep(2);
    }
  };

  const handleClose = () => {
    setStep(1);
    setBookingData({
      firstName: "",
      lastName: "",
      email: "",
      address: "",
      phone: "",
      bookingDate: ""
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {step === 1 
              ? (language === 'ar' ? 'معلومات الحجز' : 'Booking Information')
              : (language === 'ar' ? 'خيارات الدفع' : 'Payment Options')
            }
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4 py-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {packageInfo && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl mb-6">
                <h3 className="font-semibold text-lg mb-1">
                  {language === 'ar' ? packageInfo.title : packageInfo.titleEn}
                </h3>
                <p className="text-2xl font-bold text-[#1e3a8a]">
                  {packageInfo.price} {language === 'ar' ? 'ر.س' : 'SAR'}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4" />
                  {language === 'ar' ? 'الاسم الأول' : 'First Name'} *
                </Label>
                <Input
                  value={bookingData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="rounded-xl border-2"
                  placeholder={language === 'ar' ? 'أدخل الاسم الأول' : 'Enter first name'}
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4" />
                  {language === 'ar' ? 'اسم العائلة' : 'Last Name'} *
                </Label>
                <Input
                  value={bookingData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="rounded-xl border-2"
                  placeholder={language === 'ar' ? 'أدخل اسم العائلة' : 'Enter last name'}
                />
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4" />
                {language === 'ar' ? 'البريد الإلكتروني' : 'Email'} *
              </Label>
              <Input
                type="email"
                value={bookingData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="rounded-xl border-2"
                placeholder={language === 'ar' ? 'example@email.com' : 'example@email.com'}
              />
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4" />
                {language === 'ar' ? 'رقم الجوال' : 'Phone Number'} *
              </Label>
              <Input
                type="tel"
                value={bookingData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="rounded-xl border-2"
                placeholder={language === 'ar' ? '+966 5X XXX XXXX' : '+966 5X XXX XXXX'}
              />
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4" />
                {language === 'ar' ? 'العنوان (المملكة العربية السعودية)' : 'Address (Saudi Arabia)'} *
              </Label>
              <Input
                value={bookingData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="rounded-xl border-2"
                placeholder={language === 'ar' ? 'المدينة، الحي، الشارع' : 'City, District, Street'}
              />
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4" />
                {language === 'ar' ? 'تاريخ الحجز' : 'Booking Date'} *
              </Label>
              <Input
                type="date"
                value={bookingData.bookingDate}
                onChange={(e) => handleInputChange('bookingDate', e.target.value)}
                className="rounded-xl border-2"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <Button
              onClick={handleContinueToPayment}
              disabled={!isFormValid()}
              className="w-full text-white rounded-xl py-6 text-lg font-semibold mt-6"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.35)',
                fontWeight: 600
              }}
            >
              {language === 'ar' ? 'متابعة إلى الدفع' : 'Continue to Payment'}
            </Button>
          </div>
        ) : (
          <PaymentOptions 
            bookingData={bookingData}
            packageInfo={packageInfo}
            onBack={() => setStep(1)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}