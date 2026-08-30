import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Upload, Loader2, ShoppingCart, Check, Image as ImageIcon, X, 
  FileText, Lock, ShieldCheck, AlertTriangle, AlertCircle, Sparkles, Sliders, Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useLanguage } from "../components/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PaymentOptions from "../components/PaymentOptions";

// 4 Commercially Approved Real Cloudprinter Products
const APPROVED_CLOUDPRINTER_PRODUCTS = {
  aw_photo_print_4x6_in: {
    id: "aw_photo_print_4x6_in",
    product_reference: "aw_photo_print_4x6_in",
    category: "PHOTO_PRINT",
    name_ar: "طباعة فوتوغرافية فاخرة (4 × 6 بوصة)",
    name_en: "Fine Art Photo Print (4 × 6 inch)",
    description_ar: "طباعة فوتوغرافية كلاسيكية عالية الوضوح 10 × 15 سم على ورق فاخر 260gsm مع تباين لوني فائق.",
    description_en: "Classic 10 × 15 cm photographic print on 260gsm archival stock with exceptional color gamut.",
    mockupImage: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&h=800&fit=crop",
    dimensions_mm: { width: 101.6, height: 152.4 },
    display_unit: "in",
    base_price_sar: 18.00,
    features_ar: [
      "ورق فوتوغرافي أرشيفي فاخر 260gsm",
      "تشطيبات متعددة: لامع، مطفي، وحريري",
      "شحن وتوصيل عالمي موثوق مع رقم تتبع"
    ],
    features_en: [
      "Premium 260gsm archival photo paper",
      "Finishes: Glossy, Matte, and Luster",
      "Reliable global tracked shipping"
    ],
    sizes: [
      { id: "4x6_in", label_ar: "4 × 6 بوصة (101.6 × 152.4 مم)", label_en: "4 × 6 inch (101.6 × 152.4 mm)", price_delta_sar: 0 }
    ],
    finishes: [
      { id: "GLOSSY", label_ar: "لامع (Glossy)", label_en: "Glossy" },
      { id: "MATTE", label_ar: "مطفي (Matte)", label_en: "Matte" },
      { id: "LUSTER", label_ar: "حريري (Luster)", label_en: "Luster" }
    ],
    paperTypes: [
      { id: "luster_260", label_ar: "ورق حريري فاخر 260 جم/م²", label_en: "Premium Luster 260gsm" },
      { id: "gloss_250", label_ar: "ورق لامع عالي البريق 250 جم/م²", label_en: "High Gloss 250gsm" },
      { id: "matte_230", label_ar: "ورق مطفي أرشيفي 230 جم/م²", label_en: "Archival Matte 230gsm" }
    ],
    countries: [
      "Saudi Arabia", "United Arab Emirates", "Kuwait", "Bahrain", "Qatar", "Oman", "United Kingdom", "United States"
    ]
  },
  aw_photo_print_5x7_in: {
    id: "aw_photo_print_5x7_in",
    product_reference: "aw_photo_print_5x7_in",
    category: "PHOTO_PRINT",
    name_ar: "طباعة بورتريه استوديو (5 × 7 بوصة)",
    name_en: "Studio Portrait Print (5 × 7 inch)",
    description_ar: "طباعة بورتريه احترافية 13 × 18 سم مثالية للإطارات وتوثيق اللحظات العائلية والمناسبات.",
    description_en: "Studio portrait print 13 × 18 cm ideal for framing and desk displays.",
    mockupImage: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&h=800&fit=crop",
    dimensions_mm: { width: 127.0, height: 177.8 },
    display_unit: "in",
    base_price_sar: 25.00,
    features_ar: [
      "مقاس بورتريه مثالي للإطارات المكتبية",
      "ألوان نقية وثبات لعقود دون بهتان",
      "تشطيب حريري ناعم ومقاوم للبصمات"
    ],
    features_en: [
      "Ideal portrait desk frame format",
      "Vibrant colors & archival longevity",
      "Smooth fingerprint-resistant finish"
    ],
    sizes: [
      { id: "5x7_in", label_ar: "5 × 7 بوصة (127.0 × 177.8 مم)", label_en: "5 × 7 inch (127.0 × 177.8 mm)", price_delta_sar: 0 }
    ],
    finishes: [
      { id: "GLOSSY", label_ar: "لامع (Glossy)", label_en: "Glossy" },
      { id: "MATTE", label_ar: "مطفي (Matte)", label_en: "Matte" },
      { id: "LUSTER", label_ar: "حريري (Luster)", label_en: "Luster" }
    ],
    paperTypes: [
      { id: "luster_260", label_ar: "ورق حريري فاخر 260 جم/م²", label_en: "Premium Luster 260gsm" },
      { id: "matte_230", label_ar: "ورق مطفي أرشيفي 230 جم/م²", label_en: "Archival Matte 230gsm" }
    ],
    countries: [
      "Saudi Arabia", "United Arab Emirates", "Kuwait", "Bahrain", "Qatar", "Oman", "United Kingdom", "United States"
    ]
  },
  aw_canvas_mounted_30x40_cm: {
    id: "aw_canvas_mounted_30x40_cm",
    product_reference: "aw_canvas_mounted_30x40_cm",
    category: "CANVAS",
    name_ar: "لوحة كانفاس جدارية فاخرة (30 × 40 سم)",
    name_en: "Gallery Wrapped Canvas (30 × 40 cm)",
    description_ar: "لوحة كانفاس مشدودة على إطار خشبي متين وجاهزة للتعليق الفوري في الصالات والمكاتب.",
    description_en: "Gallery wrapped canvas mounted on solid wood frame, ready to hang.",
    mockupImage: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&h=800&fit=crop",
    dimensions_mm: { width: 300.0, height: 400.0 },
    display_unit: "cm",
    base_price_sar: 195.00,
    features_ar: [
      "قماش كانفاس قطني 100% 380gsm",
      "إطار خشبي مشدود ومجهز للتعليق",
      "طبقة حماية من الأشعة فوق البنفسجية"
    ],
    features_en: [
      "100% cotton canvas 380gsm",
      "Solid gallery wooden frame ready to hang",
      "Protective UV archival coating"
    ],
    sizes: [
      { id: "30x40_cm", label_ar: "30 × 40 سم (300 × 400 مم)", label_en: "30 × 40 cm (300 × 400 mm)", price_delta_sar: 0 },
      { id: "40x60_cm", label_ar: "40 × 60 cm (400 × 600 مم)", label_en: "40 × 60 cm (400 × 600 mm)", price_delta_sar: 60 },
      { id: "50x75_cm", label_ar: "50 × 75 cm (500 × 750 مم)", label_en: "50 × 75 cm (500 × 750 مم)", price_delta_sar: 120 }
    ],
    finishes: [
      { id: "SATIN_VARNISH", label_ar: "ورنيش ساتان (Satin Varnish)", label_en: "Satin Varnish" },
      { id: "MATTE_PROTECTIVE", label_ar: "حماية مطفية (Matte Protective)", label_en: "Matte Protective" }
    ],
    paperTypes: [
      { id: "cotton_canvas_380", label_ar: "كانفاس قطني نقي 380 جم/م²", label_en: "Pure Cotton Canvas 380gsm" }
    ],
    countries: [
      "Saudi Arabia", "United Arab Emirates", "Kuwait", "Bahrain", "Qatar", "Oman", "United Kingdom", "United States"
    ]
  },
  aw_fineart_poster_a3: {
    id: "aw_fineart_poster_a3",
    product_reference: "aw_fineart_poster_a3",
    category: "POSTER",
    name_ar: "بوستر فني أرشيفي (مقاس A3)",
    name_en: "Archival Fine Art Poster (A3 Size)",
    description_ar: "بوستر فني عالي التباين على ورق قطني فاخر للمعارض والمجموعات الفنية.",
    description_en: "Fine art poster on archival acid-free cotton rag for galleries & exhibitions.",
    mockupImage: "https://images.unsplash.com/photo-1582561424760-0321d75e81fa?w=800&h=800&fit=crop",
    dimensions_mm: { width: 297.0, height: 420.0 },
    display_unit: "mm",
    base_price_sar: 75.00,
    features_ar: [
      "ورق قطني أرشيفي 310gsm خالٍ من الأحماض",
      "تباين لوني مذهل للمعارض والمجموعات الفنية",
      "شحن آمن في أسطوانات واقية"
    ],
    features_en: [
      "Acid-free cotton rag paper 310gsm",
      "Museum grade color gamut & contrast",
      "Secure protective tube shipping"
    ],
    sizes: [
      { id: "a3", label_ar: "A3 (297 × 420 مم)", label_en: "A3 (297 × 420 mm)", price_delta_sar: 0 },
      { id: "a2", label_ar: "A2 (420 × 594 مم)", label_en: "A2 (420 × 594 mm)", price_delta_sar: 45 }
    ],
    finishes: [
      { id: "MATTE", label_ar: "مطفي ناعم (Matte)", label_en: "Matte" },
      { id: "VELVET", label_ar: "مخملي فاخر (Velvet)", label_en: "Velvet" }
    ],
    paperTypes: [
      { id: "cotton_rag_310", label_ar: "ورق قطني نقي 310 جم/م²", label_en: "Cotton Rag 310gsm" }
    ],
    countries: [
      "Saudi Arabia", "United Arab Emirates", "Kuwait", "Bahrain", "Qatar", "Oman", "United Kingdom", "United States"
    ]
  }
};

export default function PrintProducts() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const customizeRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [imageMeta, setImageMeta] = useState(null); // { width, height, sizeBytes, format }
  const [isUploading, setIsUploading] = useState(false);

  // Quality & Smart Crop States
  const [qualityAnalysis, setQualityAnalysis] = useState(null);
  const [enableAiUpscale, setEnableAiUpscale] = useState(false);
  const [isAnalyzingQuality, setIsAnalyzingQuality] = useState(false);
  const [customCropOffset, setCustomCropOffset] = useState({ xOffset: 0, yOffset: 0 });

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("Saudi Arabia");
  const [selectedFinish, setSelectedFinish] = useState("");
  const [selectedPaperType, setSelectedPaperType] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [shippingLevel, setShippingLevel] = useState("STANDARD_SHIPPING");

  const [currentPrice, setCurrentPrice] = useState(null);

  const [shippingAddress, setShippingAddress] = useState({
    firstname: "",
    lastname: "",
    street1: "",
    zip: "",
    city: "",
    country: "SA",
    email: "",
    phone: ""
  });

  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [orderReference, setOrderReference] = useState("");
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState(null);

  const productsList = Object.values(APPROVED_CLOUDPRINTER_PRODUCTS);

  useEffect(() => {
    let mounted = true;
    const fetchUser = async () => {
      try {
        const user = await base44.auth.me();
        if (mounted) setCurrentUser(user);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (selectedProduct && customizeRef.current) {
      customizeRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedProduct]);

  // Trigger Quality Guard Analysis
  useEffect(() => {
    if (!selectedProduct || !imageMeta || !imageMeta.width || !imageMeta.height) {
      setQualityAnalysis(null);
      return;
    }

    const runQualityAnalysis = async () => {
      setIsAnalyzingQuality(true);
      try {
        const backendUrl = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${backendUrl}/api/global-products/analyze-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: imageMeta,
            productReference: selectedProduct,
            enableAiUpscale: enableAiUpscale
          })
        });

        if (res.ok) {
          const data = await res.json();
          setQualityAnalysis(data);
        } else {
          // Client-side fallback calculation
          const prod = APPROVED_CLOUDPRINTER_PRODUCTS[selectedProduct];
          const widthInches = prod.dimensions_mm.width / 25.4;
          const heightInches = prod.dimensions_mm.height / 25.4;
          const dpi = Math.round(Math.min(imageMeta.width / widthInches, imageMeta.height / heightInches));
          const status = dpi >= 240 ? 'PRINT_READY' : (dpi >= 150 ? 'PRINT_WARNING' : 'PRINT_BLOCKED');
          
          setQualityAnalysis({
            success: true,
            status: enableAiUpscale && status === 'PRINT_WARNING' ? 'PRINT_READY' : status,
            raw_status: status,
            effective_dpi: dpi,
            is_orderable: status !== 'PRINT_BLOCKED' || enableAiUpscale,
            quality_rating: dpi >= 240 ? 'EXCELLENT' : (dpi >= 150 ? 'ACCEPTABLE_WITH_RECOMMENDATION' : 'INSUFFICIENT_RESOLUTION'),
            message_ar: dpi >= 240 
              ? `جودة ممتازة (${dpi} DPI). الصورة جاهزة للطباعة الفاخرة.`
              : (dpi >= 150 ? `جودة مقبولة (${dpi} DPI). يُنصح بتفعيل التحسين الذكي AI Upscale.` : `دقة غير كافية (${dpi} DPI). ستظهر الصورة مشوشة عند هذا المقاس.`),
            message_en: dpi >= 240 
              ? `Excellent quality (${dpi} DPI). Ready for fine art printing.`
              : (dpi >= 150 ? `Acceptable quality (${dpi} DPI). AI Upscale recommended.` : `Insufficient resolution (${dpi} DPI). Image will be blurry.`),
            crop_and_framing: {
              crop_loss_percent: 4.2,
              has_significant_crop_loss: false
            },
            ai_upscale: {
              eligible: status === 'PRINT_WARNING',
              is_active: enableAiUpscale,
              projected_dpi: dpi * 2
            }
          });
        }
      } catch (err) {
        console.error("Quality analysis error:", err);
      } finally {
        setIsAnalyzingQuality(false);
      }
    };

    runQualityAnalysis();
  }, [selectedProduct, imageMeta, enableAiUpscale, selectedSize]);

  // Live Quote calculation effect
  useEffect(() => {
    if (!selectedProduct) {
      setCurrentPrice(null);
      return;
    }

    const prod = APPROVED_CLOUDPRINTER_PRODUCTS[selectedProduct];
    if (!prod) return;

    let basePrice = prod.base_price_sar || 18.00;
    const sizeObj = prod.sizes.find(s => s.id === selectedSize || s.label_ar === selectedSize || s.label_en === selectedSize);
    if (sizeObj) basePrice += sizeObj.price_delta_sar;

    const prodTotal = Number((basePrice * quantity).toFixed(2));

    let shipCost = 25.00;
    if (["United Arab Emirates", "Kuwait", "Bahrain", "Qatar", "Oman", "AE", "KW", "BH", "QA", "OM"].includes(selectedCountry)) {
      shipCost = 35.00;
    } else if (["United Kingdom", "United States", "GB", "US"].includes(selectedCountry)) {
      shipCost = 50.00;
    }
    if (shippingLevel === "cp_fast" || shippingLevel === "EXPRESS_COURIER") shipCost += 20.00;

    const subtotal = Number((prodTotal + shipCost).toFixed(2));
    const isKsa = selectedCountry === "Saudi Arabia" || selectedCountry === "SA" || !selectedCountry;
    const vat = isKsa ? Number(((subtotal * 15) / 100).toFixed(2)) : 0.00;
    const total = Number((subtotal + vat).toFixed(2));

    setCurrentPrice({
      product_price_sar: prodTotal,
      shipping_cost_sar: shipCost,
      tax_amount_sar: vat,
      total_customer_price_sar: total,
      cost_sar: total,
      currency: "SAR",
      valid_for_minutes: 30
    });
  }, [selectedProduct, selectedSize, selectedCountry, selectedFinish, selectedPaperType, quantity, shippingLevel]);

  const handleProductSelect = (productKey) => {
    setSelectedProduct(productKey);
    const prod = APPROVED_CLOUDPRINTER_PRODUCTS[productKey];
    if (prod) {
      setSelectedSize(prod.sizes[0]?.id || "");
      setSelectedFinish(prod.finishes[0]?.id || "");
      setSelectedPaperType(prod.paperTypes[0]?.id || "");
      setSelectedCountry("Saudi Arabia");
      setQuantity(1);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      alert(language === 'ar' ? 'حجم الملف يجب ألا يتجاوز 25 ميجابايت' : 'File size must not exceed 25MB');
      return;
    }

    setIsUploading(true);

    // Read image dimensions in browser
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImageMeta({
        width: img.naturalWidth,
        height: img.naturalHeight,
        sizeBytes: file.size,
        format: file.type.split('/')[1]?.toUpperCase() || 'JPEG'
      });
      setUploadedImageUrl(objectUrl);
      setUploadedImage(file);
      setUploadedFileName(file.name);
      setIsUploading(false);
    };
    img.onerror = () => {
      setImageMeta({ width: 1920, height: 1080, sizeBytes: file.size, format: 'JPEG' });
      setUploadedImageUrl(objectUrl);
      setUploadedImage(file);
      setUploadedFileName(file.name);
      setIsUploading(false);
    };
    img.src = objectUrl;
  };

  const handleSubmitOrder = async () => {
    if (!currentUser || !selectedProduct) return;

    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    if (!uploadedImageUrl && !uploadedImage) {
      alert(language === 'ar' ? 'يرجى رفع ملف الصورة للطباعة أولاً' : 'Please upload your photo file first');
      return;
    }

    // AI Quality Guard safety check
    if (qualityAnalysis && qualityAnalysis.status === 'PRINT_BLOCKED') {
      alert(language === 'ar' 
        ? 'عذراً، دقة الصورة غير كافية للطباعة الفاخرة بهذا المقاس. يرجى اختيار مقاس أصغر أو رفع صورة بدقة أعلى.'
        : 'Cannot proceed: Image resolution is too low for this print size. Please choose a smaller size or higher-resolution image.');
      return;
    }

    if (!shippingAddress.firstname || !shippingAddress.lastname || !shippingAddress.street1 ||
      !shippingAddress.city || !shippingAddress.email || !shippingAddress.phone) {
      alert(language === 'ar' ? 'يرجى ملء جميع بيانات الشحن الإلزامية' : 'Please fill in all required shipping address fields');
      return;
    }

    setIsSubmittingOrder(true);

    try {
      const prod = APPROVED_CLOUDPRINTER_PRODUCTS[selectedProduct];
      const orderPayload = {
        productType: selectedProduct,
        productReference: prod.product_reference,
        size: selectedSize,
        finish: selectedFinish,
        paperType: selectedPaperType,
        quantity: quantity,
        imageUrl: uploadedImageUrl,
        qualityGuard: {
          status: qualityAnalysis?.status || 'PRINT_READY',
          effective_dpi: qualityAnalysis?.effective_dpi || 300,
          ai_upscale_applied: enableAiUpscale
        },
        shippingAddress: {
          ...shippingAddress,
          country: selectedCountry === "Saudi Arabia" ? "SA" :
            selectedCountry === "Kuwait" ? "KW" :
              selectedCountry === "Oman" ? "OM" :
                selectedCountry === "Bahrain" ? "BH" :
                  selectedCountry === "Qatar" ? "QA" :
                    selectedCountry === "United Arab Emirates" ? "AE" :
                      selectedCountry === "United Kingdom" ? "GB" :
                        selectedCountry === "United States" ? "US" : "SA"
        },
        shippingLevel: shippingLevel,
        pricing: currentPrice
      };

      const backendUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${backendUrl}/api/print-orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: currentUser.email,
          productType: selectedProduct,
          orderData: orderPayload,
          totalAmount: currentPrice?.total_customer_price_sar || currentPrice?.cost_sar || 0
        })
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to create print order');

      setPendingOrderData({
        ...orderPayload,
        printOrderId: data.printOrderId
      });

      setShowPaymentDialog(true);
    } catch (error) {
      console.error('Order preparation error:', error);
      setErrorMessage(error.message);
      setShowErrorDialog(true);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const actualSubmitOrder = async () => {
    if (!pendingOrderData) return;
    setIsSubmittingOrder(true);

    try {
      const backendUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${backendUrl}/api/cloudprinter/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pendingOrderData)
      });

      const data = await response.json();
      if (data.success) {
        setOrderSuccess(true);
        setOrderReference(data.orderReference || `AW-GLO-${Date.now()}`);
        setShowSuccessDialog(true);
        setShowPaymentDialog(false);
        setSelectedProduct(null);
        setUploadedImageUrl(null);
        setUploadedImage(null);
        setImageMeta(null);
        setQualityAnalysis(null);
        setPendingOrderData(null);
      } else {
        throw new Error(data.error || 'Order submission failed');
      }
    } catch (error) {
      console.error("Order submission error:", error);
      setErrorMessage(error.message);
      setShowErrorDialog(true);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#E63946]/10 text-[#E63946] px-4 py-1.5 rounded-full text-xs font-bold mb-3">
            <ShieldCheck className="w-4 h-4" />
            {language === 'ar' ? 'شبكة الطباعة العالمية المعتمدة Cloudprinter' : 'Cloudprinter Certified Global Network'}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-black mb-3">
            {language === 'ar' ? 'منتجات الطباعة الفاخرة' : 'Fine Art Print Products'}
          </h1>
          <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
            {language === 'ar'
              ? 'اطبع صورك ولوحاتك الفنية بأعلى مواصفات الجودة مع فحص الدقة الذكي AI Quality Guard وشحن مباشر لباب منزلك.'
              : 'Transform your memories into premium museum-grade print products with AI Quality Guard and direct global delivery.'
            }
          </p>
        </div>

        {/* Local vs Global Isolation Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-10 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3 text-sm text-blue-900">
            <span className="text-2xl">🏛️</span>
            <div>
              <strong>{language === 'ar' ? 'هل تبحث عن صور الجوازات والهوية الوطنية والمعاملات الرسمية؟' : 'Looking for Official Passport & Visa Photos?'}</strong>
              <p className="text-xs text-blue-700 mt-0.5">
                {language === 'ar' 
                  ? 'تتم طباعتها محلياً فقط داخل استوديو الوليد على طابعة EPSON L8050 لضمان الاشتراطات البيومترية لمنصة أبشر.'
                  : 'Official government photos are printed locally on EPSON L8050 to meet strict biometric compliance.'}
              </p>
            </div>
          </div>
          <a
            href="/passport-photo"
            className="whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition"
          >
            {language === 'ar' ? 'قسم المعاملات الحكومية المحلية ←' : 'Local Passport Section →'}
          </a>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {productsList.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card
                className={`overflow-hidden bg-white border-2 shadow-lg rounded-2xl hover:shadow-2xl smooth-transition group cursor-pointer h-full ${
                  selectedProduct === product.id ? 'border-[#E63946] ring-2 ring-[#E63946]' : 'border-transparent'
                }`}
                onClick={() => handleProductSelect(product.id)}
              >
                <div className="h-full flex flex-col">
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={product.mockupImage}
                      alt={language === 'ar' ? product.name_ar : product.name_en}
                      className="w-full h-full object-cover group-hover:scale-105 smooth-transition"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 smooth-transition" />
                    
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                      {product.dimensions_mm.width} × {product.dimensions_mm.height} mm ({product.display_unit})
                    </div>

                    {selectedProduct === product.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 right-3 w-8 h-8 bg-[#E63946] rounded-full flex items-center justify-center shadow-md"
                      >
                        <Check className="w-5 h-5 text-white" />
                      </motion.div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-[#E63946] uppercase mb-1">
                        {product.category}
                      </div>
                      <h3 className="text-lg font-bold text-black mb-2">
                        {language === 'ar' ? product.name_ar : product.name_en}
                      </h3>
                      <p className="text-gray-600 text-xs mb-4 line-clamp-2">
                        {language === 'ar' ? product.description_ar : product.description_en}
                      </p>
                      
                      <div className="space-y-1.5 mb-4">
                        {(language === 'ar' ? product.features_ar : product.features_en).map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-[11px] text-gray-600">
                            <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-baseline justify-between pt-3 border-t border-gray-100 mb-3">
                        <span className="text-xs text-gray-500">{language === 'ar' ? 'السعر الأساسي' : 'Base Price'}</span>
                        <span className="text-base font-black text-black">{product.base_price_sar.toFixed(2)} SAR</span>
                      </div>

                      <div className={`text-xs font-bold text-center py-2.5 rounded-xl smooth-transition ${
                        selectedProduct === product.id
                          ? 'bg-[#E63946] text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 group-hover:bg-gray-200'
                      }`}>
                        {selectedProduct === product.id
                          ? (language === 'ar' ? '✓ تم الاختيار' : '✓ Selected')
                          : (language === 'ar' ? 'اختيار وتخصيص' : 'Select & Configure')
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Customization & AI Quality Guard Section */}
        <AnimatePresence>
          {selectedProduct && APPROVED_CLOUDPRINTER_PRODUCTS[selectedProduct] && (
            <motion.div
              ref={customizeRef}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.4 }}
              className="mb-12"
            >
              <Card className="p-6 sm:p-8 bg-white border-none shadow-2xl rounded-3xl">
                <div className="flex items-center justify-between mb-6 pb-4 border-b">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-black flex items-center gap-2">
                      <span>{language === 'ar' ? 'تخصيص ومعاينة الطباعة الذكية' : 'Smart Print Preview & Customization'}</span>
                      <Sparkles className="w-5 h-5 text-[#E63946]" />
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      {language === 'ar' 
                        ? APPROVED_CLOUDPRINTER_PRODUCTS[selectedProduct].name_ar 
                        : APPROVED_CLOUDPRINTER_PRODUCTS[selectedProduct].name_en}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedProduct(null)}
                    className="rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Left: Upload & Smart Preview Box */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        {language === 'ar' ? '1. رفع الصورة للفحص الفني والطباعة' : '1. Upload High-Res Photo for Quality Check'}
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,application/pdf,.pdf,.jpg,.jpeg,.png,.tif,.tiff"
                        onChange={handleFileSelect}
                        className="hidden"
                      />

                      {!uploadedImageUrl ? (
                        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                          <Button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="w-full bg-gradient-to-r from-gray-900 to-black text-white hover:from-black hover:to-gray-900 rounded-2xl py-12 text-base font-medium border-2 border-dashed border-gray-300 hover:border-gray-500"
                          >
                            {isUploading ? (
                              <>
                                <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                                {language === 'ar' ? 'جارٍ تحليل وفحص الصورة...' : 'Analyzing photo quality...'}
                              </>
                            ) : (
                              <div className="flex flex-col items-center gap-3">
                                <Upload className="w-10 h-10 text-gray-400" />
                                <span>{language === 'ar' ? 'انقر لرفع ملف الصورة عالي الدقة' : 'Click to Upload High-Res File'}</span>
                                <span className="text-xs text-gray-400">JPG, PNG, PDF, TIFF (Max 25MB)</span>
                              </div>
                            )}
                          </Button>
                        </motion.div>
                      ) : (
                        <div className="space-y-4">
                          {/* Live Smart Framing Preview Box */}
                          <div className="relative rounded-2xl overflow-hidden bg-gray-900 border-2 border-gray-300 aspect-video flex items-center justify-center">
                            <img
                              src={uploadedImageUrl}
                              alt="Uploaded Preview"
                              className="max-h-full max-w-full object-contain"
                            />
                            
                            {/* Framing Overlay */}
                            <div className="absolute inset-4 border-2 border-dashed border-white/80 pointer-events-none rounded-lg flex items-start justify-between p-2">
                              <span className="bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                                {APPROVED_CLOUDPRINTER_PRODUCTS[selectedProduct].dimensions_mm.width} × {APPROVED_CLOUDPRINTER_PRODUCTS[selectedProduct].dimensions_mm.height} mm
                              </span>
                              <span className="bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                                {qualityAnalysis?.effective_dpi || 300} DPI
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 p-3 rounded-xl">
                            <span className="font-bold truncate max-w-[200px]">{uploadedFileName}</span>
                            <span className="font-mono text-gray-500">{imageMeta?.width} × {imageMeta?.height} px</span>
                            <Button
                              onClick={() => fileInputRef.current?.click()}
                              size="sm"
                              variant="outline"
                              className="text-xs h-8"
                            >
                              {language === 'ar' ? 'تغيير الصورة' : 'Change Image'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* AI Print Quality Guard Status Card */}
                    {qualityAnalysis && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-4 rounded-2xl border-2 ${
                          qualityAnalysis.status === 'PRINT_READY' 
                            ? 'bg-green-50/80 border-green-500 text-green-950' 
                            : (qualityAnalysis.status === 'PRINT_WARNING'
                              ? 'bg-amber-50/80 border-amber-500 text-amber-950'
                              : 'bg-red-50/80 border-red-500 text-red-950')
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {qualityAnalysis.status === 'PRINT_READY' && <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />}
                          {qualityAnalysis.status === 'PRINT_WARNING' && <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />}
                          {qualityAnalysis.status === 'PRINT_BLOCKED' && <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}

                          <div className="flex-1 text-xs">
                            <div className="flex items-center justify-between font-bold mb-1">
                              <span>
                                {qualityAnalysis.status === 'PRINT_READY' 
                                  ? (language === 'ar' ? '✅ جاهز للطباعة (جودة ممتازة)' : '✅ Print Ready (Excellent Quality)')
                                  : (qualityAnalysis.status === 'PRINT_WARNING'
                                    ? (language === 'ar' ? '⚠️ تنبيه دقة الطباعة' : '⚠️ Quality Warning')
                                    : (language === 'ar' ? '❌ دقة غير كافية للطباعة' : '❌ Insufficient Resolution'))}
                              </span>
                              <span className="font-mono bg-white/80 px-2 py-0.5 rounded text-[11px] shadow-sm">
                                {qualityAnalysis.effective_dpi} DPI (الهدف: {qualityAnalysis.optimal_dpi || 300} DPI)
                              </span>
                            </div>

                            <p className="opacity-90 leading-relaxed">
                              {language === 'ar' ? qualityAnalysis.message_ar : qualityAnalysis.message_en}
                            </p>

                            {/* AI Upscale Toggle for Warning */}
                            {qualityAnalysis.raw_status === 'PRINT_WARNING' && (
                              <div className="mt-3 pt-3 border-t border-amber-200 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-amber-700" />
                                  <span className="font-bold">
                                    {language === 'ar' ? 'تفعيل المعالجة والتحسين الذكي (AI Upscale)' : 'Enable AI Upscale Enhancement'}
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  variant={enableAiUpscale ? "default" : "outline"}
                                  onClick={() => setEnableAiUpscale(!enableAiUpscale)}
                                  className={`text-xs h-7 rounded-lg ${enableAiUpscale ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''}`}
                                >
                                  {enableAiUpscale 
                                    ? (language === 'ar' ? '✓ مفعل' : '✓ Enabled') 
                                    : (language === 'ar' ? 'تفعيل الآن' : 'Enable')}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                  </div>

                  {/* Right: Selectors & Live Quote */}
                  <div className="space-y-5">
                    
                    {/* Size Selector */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        {language === 'ar' ? 'المقاس المتاح' : 'Selected Dimensions'}
                      </label>
                      <Select value={selectedSize} onValueChange={setSelectedSize}>
                        <SelectTrigger className="rounded-xl border-2 h-11 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {APPROVED_CLOUDPRINTER_PRODUCTS[selectedProduct].sizes.map((s) => (
                            <SelectItem key={s.id} value={s.id} className="text-xs">
                              {language === 'ar' ? s.label_ar : s.label_en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Finish Selector */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        {language === 'ar' ? 'التشطيب السطحي' : 'Surface Finish'}
                      </label>
                      <Select value={selectedFinish} onValueChange={setSelectedFinish}>
                        <SelectTrigger className="rounded-xl border-2 h-11 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {APPROVED_CLOUDPRINTER_PRODUCTS[selectedProduct].finishes.map((f) => (
                            <SelectItem key={f.id} value={f.id} className="text-xs">
                              {language === 'ar' ? f.label_ar : f.label_en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Paper / Material */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        {language === 'ar' ? 'خامة الورق والطباعة' : 'Paper & Substrate'}
                      </label>
                      <Select value={selectedPaperType} onValueChange={setSelectedPaperType}>
                        <SelectTrigger className="rounded-xl border-2 h-11 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {APPROVED_CLOUDPRINTER_PRODUCTS[selectedProduct].paperTypes.map((p) => (
                            <SelectItem key={p.id} value={p.id} className="text-xs">
                              {language === 'ar' ? p.label_ar : p.label_en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Quantity & Country Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          {language === 'ar' ? 'الكمية' : 'Quantity'}
                        </label>
                        <Select value={String(quantity)} onValueChange={(v) => setQuantity(Number(v))}>
                          <SelectTrigger className="rounded-xl border-2 h-11 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 5, 10, 20].map((q) => (
                              <SelectItem key={q} value={String(q)} className="text-xs">{q}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          {language === 'ar' ? 'دولة وجهة الشحن' : 'Destination Country'}
                        </label>
                        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                          <SelectTrigger className="rounded-xl border-2 h-11 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {APPROVED_CLOUDPRINTER_PRODUCTS[selectedProduct].countries.map((c) => (
                              <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Live Quote Breakdown Card */}
                    {currentPrice && (
                      <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 space-y-2">
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>{language === 'ar' ? 'سعر المنتج:' : 'Product Price:'}</span>
                          <span>{currentPrice.product_price_sar.toFixed(2)} SAR</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>{language === 'ar' ? 'رسوم الشحن والتوصيل:' : 'Shipping Fee:'}</span>
                          <span>{currentPrice.shipping_cost_sar.toFixed(2)} SAR</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>{language === 'ar' ? 'ضريبة القيمة المضافة (15% ZATCA):' : 'VAT (15% ZATCA):'}</span>
                          <span>{currentPrice.tax_amount_sar.toFixed(2)} SAR</span>
                        </div>
                        <div className="flex justify-between text-base font-black text-black pt-2 border-t border-gray-200">
                          <span>{language === 'ar' ? 'المجموع النهائي:' : 'Grand Total:'}</span>
                          <span className="text-[#E63946]">{currentPrice.total_customer_price_sar.toFixed(2)} SAR</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-green-700 font-bold pt-1">
                          <Lock className="w-3 h-3" />
                          <span>{language === 'ar' ? '🔒 السعر مجمد ومضمون لمدة 30 دقيقة (PRICE_SNAPSHOT_LOCKED)' : '🔒 Price snapshot locked for 30 minutes'}</span>
                        </div>
                      </div>
                    )}

                    {/* Shipping Address Inputs */}
                    <div className="pt-3 border-t">
                      <h4 className="text-xs font-bold text-gray-800 mb-2">{language === 'ar' ? 'بيانات المستلم وعنوان التوصيل' : 'Recipient & Delivery Address'}</h4>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <input
                          type="text"
                          placeholder={language === 'ar' ? 'الاسم الأول *' : 'First Name *'}
                          value={shippingAddress.firstname}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, firstname: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-black"
                        />
                        <input
                          type="text"
                          placeholder={language === 'ar' ? 'اسم العائلة *' : 'Last Name *'}
                          value={shippingAddress.lastname}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, lastname: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-black"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder={language === 'ar' ? 'الشارع والحي *' : 'Street Address *'}
                        value={shippingAddress.street1}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, street1: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-black mb-2"
                      />
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <input
                          type="text"
                          placeholder={language === 'ar' ? 'المدينة *' : 'City *'}
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-black"
                        />
                        <input
                          type="tel"
                          placeholder={language === 'ar' ? 'رقم الجوال *' : 'Phone *'}
                          value={shippingAddress.phone}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-black"
                        />
                      </div>
                      <input
                        type="email"
                        placeholder={language === 'ar' ? 'البريد الإلكتروني *' : 'Email *'}
                        value={shippingAddress.email}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-black"
                      />
                    </div>

                    {/* Submit Button with Safety Quality Guard */}
                    <Button
                      onClick={handleSubmitOrder}
                      disabled={!uploadedImageUrl || isSubmittingOrder || (qualityAnalysis && qualityAnalysis.status === 'PRINT_BLOCKED')}
                      className={`w-full text-white rounded-xl py-4 text-base font-bold shadow-lg mt-4 ${
                        qualityAnalysis && qualityAnalysis.status === 'PRINT_BLOCKED'
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-[#E63946] to-[#FF6B6B] hover:from-[#C1121F] hover:to-[#E63946]'
                      }`}
                    >
                      {isSubmittingOrder ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          {language === 'ar' ? 'جارٍ تسجيل الطلب...' : 'Processing...'}
                        </>
                      ) : (
                        qualityAnalysis && qualityAnalysis.status === 'PRINT_BLOCKED' ? (
                          <>
                            <AlertCircle className="w-5 h-5 mr-2" />
                            {language === 'ar' ? 'الدقة غير كافية للطباعة (يرجى رفع صورة بدقة أعلى)' : 'Resolution Too Low to Print'}
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            {language === 'ar' ? 'تأكيد الطلب والانتقال للدفع' : 'Confirm Order & Proceed to Payment'}
                          </>
                        )
                      )}
                    </Button>
                  </div>

                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Payment Options Dialog */}
      {showPaymentDialog && pendingOrderData && (
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="sm:max-w-md bg-white rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-black text-center">
                {language === 'ar' ? 'إتمام الدفع الآمن' : 'Complete Secure Payment'}
              </DialogTitle>
            </DialogHeader>
            <PaymentOptions
              orderData={pendingOrderData}
              amount={currentPrice?.total_customer_price_sar || 0}
              currency="SAR"
              onSuccess={() => actualSubmitOrder()}
              onCancel={() => setShowPaymentDialog(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl text-center p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <DialogTitle className="text-2xl font-black text-black mb-2">
            {language === 'ar' ? 'تم استلام طلبك وتأكيده بنجاح!' : 'Order Placed Successfully!'}
          </DialogTitle>
          <p className="text-sm text-gray-600 mb-4">
            {language === 'ar' 
              ? `رقم مرجع الطلب العالمي: ${orderReference}. سيتم معالجة وطباعة طلبك وإرسال رقم التتبع إلى بريدك الإلكتروني.`
              : `Global Order Reference: ${orderReference}. Your order is queued for certified Cloudprinter production.`}
          </p>
          <Button
            onClick={() => setShowSuccessDialog(false)}
            className="w-full bg-black hover:bg-gray-800 text-white rounded-xl py-3 font-bold"
          >
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
