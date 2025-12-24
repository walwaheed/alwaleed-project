import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // Navigation
    home: "Home",
    editPhoto: "Edit Photo",
    gallery: "Gallery",
    cart: "Cart",
    profile: "Profile",
    aboutUs: "About Us",
    company: "Company",

    // Home Page
    heroMainTitle: "Studio Professional Quality",
    heroPrintReady: "Photos in Seconds",
    heroSubtitle: "Middle East's trusted platform for visa, Absher, and official ID photos. Upload once, receive professional results instantly.",
    startEditing: "Get Your Photo Now",
    professionalQuality: "Professional Quality",
    sixtySecondEditing: "30-Second Editing",
    globalShipping: "Global Shipping",
    trustedByUsers: "Trusted by 5,000+ Professionals",
    studioProcessing: "Studio Processing",

    // Before/After Section
    seeTheDifference: "See The Difference",
    realTransformations: "Real transformations powered by professional studio technology",
    visaPhotoReady: "Visa Photo Ready",
    saudiLook: "Saudi Look",
    babyPhoto: "Baby Photo",
    before: "Before",
    after: "After",

    // How It Works
    threeSteps: "Three Simple Steps",
    noComplicatedSoftware: "No complicated software. No learning curve. Just results.",
    step1Title: "Upload Your Photo",
    step1Desc: "Any device, any format",
    step2Title: "Choose Style",
    step2Desc: "Visa, portrait, or enhance",
    step3Title: "Download and Print",
    step3Desc: "Delivered to your door",
    tryItNow: "Try It Now",

    // Final CTA
    perfectPhotoSecondsAway: "Your Perfect Photo is Seconds Away",
    joinUsers: "Join thousands of users who trust Alwaleed Studio for hassle-free professional photos",

    // Editing & Results
    aiPhotoStudio: "Professional Photo Editing Studio",
    chooseStyle: "Choose an editing style and let our professional studio transform your photos instantly",
    visaPhoto: "Visa Photo",
    visaPhotoDesc: "Transform any photo into a professional visa-ready image",
    saudiLookDesc: "Automatically add the Shmagh and Thobe for an elegant, official appearance in seconds",
    babyPhotoDesc: "Professional baby photo enhancement with soft, natural touch",
    absherPhoto: "Absher Photo",
    absherPhotoDesc: "Create official Absher-ready photos with perfect specifications",
    absherPhotoMale: "Absher Photo (Male)",
    absherPhotoMaleDesc: "Create official Absher-ready photos for men with perfect specifications",
    absherPhotoFemale: "Absher Photo (Female)",
    absherPhotoFemaleDesc: "Create official Absher-ready photos for women with perfect specifications",
    uploadFromDevice: "Upload from Device",
    or: "or",
    takePhoto: "Take a Photo",
    uploadingPhoto: "Uploading Photo...",
    preparingImage: "Preparing your image",
    processingImageNow: "Processing Image Now",
    alwaleedProcessing: "Alwaleed Studio is processing your photo",
    mayTake30Seconds: "May take 30 seconds",
    pleaseWait: "Please wait...",
    processingComplete: "Processing Complete!",
    appliedSuccessfully: "applied successfully",
    enterPhotoTitle: "Enter photo title",
    editAnotherPhoto: "Edit Another Photo",
    downloadPhoto: "Download Photo",
    downloading: "Downloading...",
    buyPrints: "Buy Prints",
    photoSavedSuccess: "Photo Saved Successfully!",

    // Camera
    startingCamera: "Starting camera...",
    cancel: "Cancel",
    capturePhoto: "Capture Photo",

    // Gallery Page
    yourGallery: "Your Gallery",
    photosReady: "photos ready for purchase",
    photo: "photo",
    photos: "photos",
    editNewPhoto: "Edit New Photo",
    noPhotosYet: "No Photos Yet",
    noPhotosDesc: "No Photos Yet",
    editFirstPhoto: "Edit Your First Photo",
    printSize: "Print Size",
    addToCart: "Add to Cart",
    adding: "Adding...",
    selectPrintSize: "Select Print Size",
    viewGallery: "View Gallery",
    filterByType: "Filter by Type",
    sortBy: "Sort By",

    // Cart Page
    shoppingCart: "Shopping Cart",
    itemsInCart: "items in your cart",
    item: "item",
    items: "items",
    cartEmpty: "Your Cart is Empty",
    cartEmptyDesc: "Browse your gallery and add photos to cart",
    orderSummary: "Order Summary",
    subtotal: "Subtotal",
    shipping: "Shipping",
    vat: "VAT",
    total: "Total",
    buyShipNow: "Buy & Ship Now",
    secureCheckout: "Secure checkout with encrypted payment",

    // Checkout
    shippingInformation: "Shipping Information",
    orderConfirmed: "Order Confirmed!",
    thankYou: "Thank You for Your Order!",
    orderProcessing: "Your photos are being prepared for shipment. You'll receive a tracking number via email.",
    viewOrders: "View Orders",
    continueShopping: "Continue Shopping",
    fullName: "Full Name",
    addressLine1: "Address Line 1",
    addressLine2: "Address Line 2",
    city: "City",
    state: "State / Province",
    postalCode: "Postal Code",
    country: "Country",
    completePurchase: "Complete Purchase",
    processingOrder: "Processing Order...",

    // Profile Page
    orderHistory: "Order History",
    noOrders: "No Orders Yet",
    noOrdersDesc: "Your order history will appear here",
    order: "Order",
    orderDate: "Order Date",
    totalAmount: "Total Amount",
    tracking: "Tracking",
    shippingAddress: "Shipping Address",
    itemsLabel: "Items:",
    qty: "Qty",
    signOut: "Sign Out",
    administrator: "Administrator",
    member: "Member",

    // Order Status
    processing: "Processing",
    paid: "Paid",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",

    // Footer
    footerDescription: "Professional photo editing and printing studio. Transform your photos in seconds, delivered to your door.",
    product: "Product",
    editPhotos: "Edit Photos",
    support: "Support",
    helpCenter: "Help Center",
    contactUs: "Contact Us",
    allRightsReserved: "All rights reserved",

    // Footer Links
    privacyPolicy: "Privacy Policy",
    returnPolicy: "Return & Refund",
    termsOfService: "Terms of Service",
    legal: "Legal",

    // Location Section
    visitOurStudio: "We'd Love to See You",
    comeVisitUs: "Come visit us at our location in Tarout, Saudi Arabia",
    photographyStudio: "Photography Studio",
    nationalAddress: "National Address",
    shortAddress: "Short Address",
    buildingNumber: "Building Number",
    street: "Street",
    streetName: "Al Imam Ahmad Bin Hanbal St",
    subNumber: "Sub Number",
    location: "Location",
    district: "District",
    districtName: "Al Qalah",
    cityName: "Tarout",
    getDirections: "Get Directions",

    // New keys for Home Page / General
    whoWeAre: "Who We Are",
    viewLargerMap: "View Larger Map",

    // Currency
    currency: "SAR",
  },
  ar: {
    // Navigation
    home: "الرئيسية",
    editPhoto: "تحرير الصور",
    gallery: "المعرض",
    cart: "السلة",
    profile: "الملف الشخصي",
    aboutUs: "من نحن",
    company: "الشركة",

    // Home Page
    heroMainTitle: "صور احترافية بجودة الاستوديو",
    heroPrintReady: "في ثوانٍ",
    heroSubtitle: "المنصة الموثوقة في الشرق الأوسط للحصول على صور التأشيرات وأبشر والهويات الرسمية. ارفع صورتك مرة واحدة، واحصل على نتائج احترافية فوراً.",
    startEditing: "احصل على صورتك الآن",
    professionalQuality: "جودة احترافية",
    sixtySecondEditing: "تحرير في 30 ثانية",
    globalShipping: "شحن عالمي",
    trustedByUsers: "موثوق من قبل أكثر من 5,000 محترف",
    studioProcessing: "معالجة الاستوديو",

    // Before/After Section
    seeTheDifference: "شاهد الفرق",
    realTransformations: "تحولات حقيقية بتقنيات الاستوديو الاحترافية",
    visaPhotoReady: "صورة تأشيرة جاهزة",
    saudiLook: "إطلالة سعودية",
    babyPhoto: "صورة الأطفال",
    before: "قبل",
    after: "بعد",

    // How It Works
    threeSteps: "ثلاث خطوات بسيطة",
    noComplicatedSoftware: "لا برامج معقدة. لا منحنى تعلم. فقط نتائج.",
    step1Title: "ارفع صورتك",
    step1Desc: "أي جهاز، أي صيغة",
    step2Title: "اختر النمط",
    step2Desc: "تأشيرة، بورتريه، أو تحسين",
    step3Title: "حمّل واطبع",
    step3Desc: "توصيل إلى باب منزلك",
    tryItNow: "جربه الآن",

    // Final CTA
    perfectPhotoSecondsAway: "صورتك المثالية على بعد ثوانٍ",
    joinUsers: "انضم إلى آلاف المستخدمين الذين يثقون في استوديو الوليد للحصول على صور احترافية بدون عناء",

    // Editing & Results
    aiPhotoStudio: "استوديو التصوير الاحترافي",
    chooseStyle: "اختر نمط التحرير ودع استوديونا الاحترافي يحول صورك على الفور",
    visaPhoto: "صورة تأشيرة",
    visaPhotoDesc: "حول أي صورة إلى صورة احترافية جاهزة للتأشيرة",
    saudiLookDesc: "أضف الشماغ والثوب تلقائيًا واحصل على مظهر رسمي أنيق خلال ثوانٍ",
    babyPhotoDesc: "تحسين احترافي لصور الأطفال بلمسة طبيعية وناعمة",
    absherPhoto: "صورة أبشر",
    absherPhotoDesc: "إنشاء صور رسمية جاهزة لأبشر بمواصفات مثالية",
    absherPhotoMale: "صورة أبشر (رجال)",
    absherPhotoMaleDesc: "إنشاء صور رسمية جاهزة لأبشر للرجال بمواصفات مثالية",
    absherPhotoFemale: "صورة أبشر (نساء)",
    absherPhotoFemaleDesc: "إنشاء صور رسمية جاهزة لأبشر للنساء بمواصفات مثالية",
    uploadFromDevice: "تحميل من الجهاز",
    or: "أو",
    takePhoto: "التقط صورة",
    uploadingPhoto: "جارٍ تحميل الصورة...",
    preparingImage: "جارٍ تحضير صورتك",
    processingImageNow: "نقوم بمعالجة الصورة الآن",
    alwaleedProcessing: "يقوم استوديو الوليد بمعالجة الصورة",
    mayTake30Seconds: "قد يستغرق 30 ثانية",
    pleaseWait: "يرجى الانتظار...",
    processingComplete: "اكتملت المعالجة!",
    appliedSuccessfully: "تم التطبيق بنجاح",
    enterPhotoTitle: "أدخل عنوان الصورة",
    editAnotherPhoto: "تحرير صورة أخرى",
    downloadPhoto: "تنزيل الصورة",
    downloading: "جارٍ التنزيل...",
    buyPrints: "اطلب نسخ مطبوعة",
    photoSavedSuccess: "تم حفظ الصورة بنجاح!",

    // Camera
    startingCamera: "جارٍ تشغيل الكاميرا...",
    cancel: "إلغاء",
    capturePhoto: "التقط صورة",

    // Gallery Page
    yourGallery: "معرضك",
    photosReady: "صور جاهزة للشراء",
    photo: "صورة",
    photos: "صور",
    editNewPhoto: "تحرير صورة جديدة",
    noPhotosYet: "لا توجد صور بعد",
    noPhotosDesc: "ابدأ بتحرير صورتك الأولى باستخدام أدوات الذكاء الاصطناعي",
    editFirstPhoto: "حرر صورتك الأولى",
    printSize: "حجم الطباعة",
    addToCart: "أضف إلى السلة",
    adding: "جارٍ الإضافة...",
    selectPrintSize: "اختر حجم الطباعة",
    viewGallery: "عرض المعرض",
    filterByType: "تصفية حسب النوع",
    sortBy: "ترتيب حسب",

    // Cart Page
    shoppingCart: "سلة التسوق",
    itemsInCart: "عناصر في سلتك",
    item: "عنصر",
    items: "عناصر",
    cartEmpty: "سلة التسوق فارغة",
    cartEmptyDesc: "تصفح معرضك وأضف الصور إلى السلة",
    orderSummary: "ملخص الطلب",
    subtotal: "المجموع الفرعي",
    shipping: "الشحن",
    vat: "ضريبة القيمة المضافة",
    total: "المجموع",
    buyShipNow: "اشترِ واشحن الآن",
    secureCheckout: "دفع آمن مع تشفير",

    // Checkout
    shippingInformation: "معلومات الشحن",
    orderConfirmed: "تم تأكيد الطلب!",
    thankYou: "شكراً لطلبك!",
    orderProcessing: "يتم تحضير صورك للشحن. ستتلقى رقم التتبع عبر البريد الإلكتروني.",
    viewOrders: "عرض الطلبات",
    continueShopping: "متابعة التسوق",
    fullName: "الاسم الكامل",
    addressLine1: "العنوان السطر 1",
    addressLine2: "العنوان السطر 2",
    city: "المدينة",
    state: "الولاية / المحافظة",
    postalCode: "الرمز البريدي",
    country: "الدولة",
    completePurchase: "إتمام الشراء",
    processingOrder: "جارٍ معالجة الطلب...",

    // Profile Page
    orderHistory: "سجل الطلبات",
    noOrders: "لا توجد طلبات بعد",
    noOrdersDesc: "سيظهر سجل طلباتك هنا",
    order: "طلب",
    orderDate: "تاريخ الطلب",
    totalAmount: "المبلغ الإجمالي",
    tracking: "التتبع",
    shippingAddress: "عنوان الشحن",
    itemsLabel: "العناصر:",
    qty: "الكمية",
    signOut: "تسجيل الخروج",
    administrator: "مدير",
    member: "عضو",

    // Order Status
    processing: "قيد المعالجة",
    paid: "مدفوع",
    shipped: "تم الشحن",
    delivered: "تم التوصيل",
    cancelled: "ملغى",

    // Footer
    footerDescription: "استوديو تحرير وطباعة الصور الاحترافي. حول صورك في ثوانٍ، مع التوصيل إلى بابك.",
    product: "المنتج",
    editPhotos: "تحرير الصور",
    support: "الدعم",
    helpCenter: "مركز المساعدة",
    contactUs: "اتصل بنا",
    allRightsReserved: "جميع الحقوق محفوظة",

    // Footer Links
    privacyPolicy: "سياسة الخصوصية",
    returnPolicy: "الإرجاع والاسترداد",
    termsOfService: "شروط الخدمة",
    legal: "قانوني",

    // Location Section
    visitOurStudio: "نسعد بزيارتكم لنا",
    comeVisitUs: "تعال لزيارتنا في موقعنا في تاروت، المملكة العربية السعودية",
    photographyStudio: "استوديو تصوير",
    nationalAddress: "العنوان الوطني",
    shortAddress: "العنوان المختصر",
    buildingNumber: "رقم المبنى",
    street: "الشارع",
    streetName: "شارع الإمام أحمد بن حنبل",
    subNumber: "الرقم الفرعي",
    location: "الموقع",
    district: "الحي",
    districtName: "القلعة",
    cityName: "تاروت",
    getDirections: "احصل على الاتجاهات",

    // New keys for Home Page / General
    whoWeAre: "من نحن",
    viewLargerMap: "عرض خريطة أكبر",

    // Currency
    currency: "ر.س",
  }
};

const LanguageContext = createContext(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('language') || 'en';
    }
    return 'en';
  });

  const isRTL = language === 'ar';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', language);
      document.documentElement.lang = language;
    }
  }, [language, isRTL]);

  const t = (key) => {
    return translations[language]?.[key] || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};