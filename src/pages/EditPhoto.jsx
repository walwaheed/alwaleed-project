import React, { useState, useRef, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload, Camera, Loader2, CheckCircle2, Sparkles, ShoppingCart, ArrowLeftRight, Download, RotateCw, ZoomIn, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useLanguage } from "../components/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import BeforeAfterSlider from "../components/BeforeAfterSlider";
import PaymentOptions from "../components/PaymentOptions";

export default function EditPhoto() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const resultsRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [hasProcessedUrlParam, setHasProcessedUrlParam] = useState(false);
  const [photoSaved, setPhotoSaved] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Memoize EDITING_OPTIONS to prevent recreating on every render
  const EDITING_OPTIONS = useMemo(() => [
    {
      id: "visa-photo",
      title: t('visaPhoto'),
      description: t('visaPhotoDesc'),
      beforeImage: "https://sfraqqkmzzdtcynyyebj.supabase.co/storage/v1/object/public/website-Images/Edit-Visa-Before.png",
      afterImage: "https://sfraqqkmzzdtcynyyebj.supabase.co/storage/v1/object/public/website-Images/Edit-Visa-After.png",
      webhook: "https://n8n.alwaleed.pro/webhook/visa-photo",
      category: "id"
    },
    {
      id: "absher-photo",
      title: t('absherPhotoMale'),
      description: t('absherPhotoMaleDesc'),
      beforeImage: "https://sfraqqkmzzdtcynyyebj.supabase.co/storage/v1/object/public/website-Images/Home-Absher-Before.jpg",
      afterImage: "https://sfraqqkmzzdtcynyyebj.supabase.co/storage/v1/object/public/website-Images/Home-Absher-After.png",
      webhook: "https://n8n.alwaleed.pro/webhook/absher",
      category: "id"
    },
    {
      id: "absher-photo-female",
      title: t('absherPhotoFemale'),
      description: t('absherPhotoFemaleDesc'),
      beforeImage: "https://sfraqqkmzzdtcynyyebj.supabase.co/storage/v1/object/public/website-Images/Edit-Absher-Female-Before.jpg",
      afterImage: "https://sfraqqkmzzdtcynyyebj.supabase.co/storage/v1/object/public/website-Images/Edit-Absher-Female-After.png",
      webhook: "https://n8n.alwaleed.pro/webhook/absher-female", // Assuming the same webhook can handle male/female variations or will be updated.
      category: "id"
    },
    {
      id: "saudi-look",
      title: t('saudiLook'),
      description: t('saudiLookDesc'),
      beforeImage: "https://sfraqqkmzzdtcynyyebj.supabase.co/storage/v1/object/public/website-Images/Home-Saudi-Before.jpg",
      afterImage: "https://sfraqqkmzzdtcynyyebj.supabase.co/storage/v1/object/public/website-Images/Home-Saudi-After.png",
      webhook: "https://n8n.alwaleed.pro/webhook/saudi-look",
      category: "portrait"
    },
    {
      id: "baby-photo",
      title: t('babyPhoto'),
      description: t('babyPhotoDesc'),
      beforeImage: "https://sfraqqkmzzdtcynyyebj.supabase.co/storage/v1/object/public/website-Images/Home-Baby-Before.jpg",
      afterImage: "https://sfraqqkmzzdtcynyyebj.supabase.co/storage/v1/object/public/website-Images/Home-Baby-After.png",
      webhook: "https://n8n.alwaleed.pro/webhook/baby-photo",
      category: "id"
    }
  ], [t, language]);

  // Portrait Photography Sizes - Memoized
  const PORTRAIT_SIZES = useMemo(() => [
    { size: "A5", price: 45, label: 'A5 (15×20 سم)', labelEn: 'A5 (15×20 cm)', description: language === 'ar' ? 'مقاس قياسي للبورتريه' : 'Standard portrait size' },
    { size: "A4", price: 65, label: 'A4 (30×20 سم)', labelEn: 'A4 (30×20 cm)', description: language === 'ar' ? 'مقاس أكبر للبورتريه' : 'Larger portrait size' },
  ], [language]);

  // ID/Visa Photography Package - Memoized
  const ID_PACKAGE = useMemo(() => ({
    base: {
      size: "A5+8ID",
      price: 35,
      label: language === 'ar' ? 'A5 + 8 صور هوية' : 'A5 + 8 ID pictures',
      description: language === 'ar' ? 'صورة A5 + 8 صور هوية' : 'One A5 photo + 8 ID pictures'
    },
    extraPrints: {
      price: 15,
      quantity: 8,
      label: language === 'ar' ? '8 نسخ إضافية' : '8 extra prints',
      description: language === 'ar' ? 'نفس الصورة، 8 نسخ كحد أدنى' : 'Same picture, 8 pieces minimum'
    }
  }), [language]);

  // Family Photo Purchase Variants with full options
  const FAMILY_VARIANTS = useMemo(() => ({
    aluminum: {
      id: "aluminum",
      name: language === 'ar' ? 'ألومنيوم' : 'Aluminum',
      sizes: [
        '300x300 mm',
        '400x400 mm',
        '450x450 mm',
        '500x500 mm',
        '700x700 mm',
        '300x450 mm',
        '500x600 mm',
        '600x800 mm',
        '600x900 mm'
      ],
      countries: [
        'Saudi Arabia',
        'Kuwait',
        'Oman',
        'Bahrain',
        'Qatar'
      ]
    },
    wood: {
      id: "wood",
      name: language === 'ar' ? 'خشب' : 'Wood',
      sizes: [
        '300x300 mm',
        '400x400 mm',
        '450x450 mm',
        '500x500 mm',
        '700x700 mm',
        '300x450 mm',
        '400x600 mm',
        '600x800 mm',
        '600x900 mm'
      ],
      countries: [
        'Saudi Arabia',
        'Kuwait',
        'Oman',
        'Bahrain',
        'Qatar'
      ]
    },
    canva: {
      id: "canva",
      name: language === 'ar' ? 'كانفا' : 'Canva',
      sizes: [
        { value: '1000x500 mm', label: '1000x500 mm – Landscape' },
        { value: '200x200 mm', label: '200x200 mm – Square' },
        { value: '200x300 mm', label: '200x300 mm – Portrait' },
        { value: '300x300 mm', label: '300x300 mm – Square' },
        { value: '300x400 mm', label: '300x400 mm – Portrait' },
        { value: '300x450 mm', label: '300x450 mm – Portrait' },
        { value: '400x400 mm', label: '400x400 mm – Square' },
        { value: '400x600 mm', label: '400x600 mm – Portrait' },
        { value: '500x700 mm', label: '500x700 mm – Portrait' },
        { value: '500x750 mm', label: '500x750 mm – Portrait' },
        { value: '600x600 mm', label: '600x600 mm – Square' },
        { value: '600x800 mm', label: '600x800 mm – Portrait' },
        { value: '800x800 mm', label: '800x800 mm – Square' }
      ],
      countries: [
        'Saudi Arabia',
        'Kuwait',
        'Oman',
        'Bahrain',
        'Qatar'
      ]
    },
    photobook: {
      id: "photobook",
      name: language === 'ar' ? 'البوم صور' : 'PhotoBook',
      sizes: [
        'A6 Portrait',
        'A6 Landscape',
        'A5 Portrait',
        'A5 Landscape',
        'A4 Portrait',
        'A4 Landscape'
      ],
      finishes: [
        'Gloss finish',
        'Matte finish'
      ],
      paperTypes: [
        '130gsm Machine Coated Gloss',
        '130gsm Machine Coated Silk',
        '150gsm Machine Coated Silk',
        '150gsm Machine Coated Gloss'
      ],
      countries: [
        'Saudi Arabia',
        'Kuwait',
        'Oman',
        'Bahrain',
        'Qatar',
        'United Arab Emirates'
      ]
    }
  }), [language]);

  const [selectedOption, setSelectedOption] = useState(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [photoTitle, setPhotoTitle] = useState("");
  const [originalImageUrl, setOriginalImageUrl] = useState(null);
  const [processedImageUrl, setProcessedImageUrl] = useState(null);
  const [editedImageBase44Url, setEditedImageBase44Url] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [selectedSize, setSelectedSize] = useState("A5");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [addFrame, setAddFrame] = useState(false);
  const [extraPrintSets, setExtraPrintSets] = useState(0);
  const [selectedFamilyVariant, setSelectedFamilyVariant] = useState("aluminum");
  const [familySize, setFamilySize] = useState("");
  const [familyCountry, setFamilyCountry] = useState("");
  const [familyFinish, setFamilyFinish] = useState("");
  const [familyPaperType, setFamilyPaperType] = useState("");
  const [isMobile] = useState(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [viewMode, setViewMode] = useState("slider");
  const [selectedVisaCountry, setSelectedVisaCountry] = useState("Schengen (Fr/Es/De)"); // New state for visa country
  const [selectedSaudiStyle, setSelectedSaudiStyle] = useState("Royal"); // New state for Saudi Look style
  const [selectedAbsherStyle, setSelectedAbsherStyle] = useState("Royal"); // New state for Absher Photo style
  const [selectedKhutraColor, setSelectedKhutraColor] = useState("Red"); // New state for Khutra Color
  const [showPaymentDialog, setShowPaymentDialog] = useState(false); // Payment paywall dialog

  // Family Photo Editing Controls
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [grayscale, setGrayscale] = useState(false);
  const [hueRotate, setHueRotate] = useState(0);
  const [sepia, setSepia] = useState(0);
  const [vignette, setVignette] = useState(0);
  const [borderWidth, setBorderWidth] = useState(0);
  const [borderColor, setBorderColor] = useState('#ffffff');
  const [filterPreset, setFilterPreset] = useState('none');

  // Scroll to top only once on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Fetch user once on mount
  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      try {
        const user = await base44.auth.me();
        if (mounted) {
          setCurrentUser(user);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();

    return () => {
      mounted = false;
    };
  }, []);

  // Auto-open tool from URL parameter - ONLY ONCE
  useEffect(() => {
    if (hasProcessedUrlParam) return;

    const urlParams = new URLSearchParams(location.search);
    const toolId = urlParams.get('tool');

    if (toolId && EDITING_OPTIONS.length > 0) {
      const tool = EDITING_OPTIONS.find(opt => opt.id === toolId);
      if (tool) {
        console.log("Auto-selecting tool from URL:", toolId);
        setSelectedOption(tool);
        setHasProcessedUrlParam(true);

        const timer = setTimeout(() => {
          setShowUploadDialog(true);
        }, 150);

        return () => clearTimeout(timer);
      }
    }
  }, [location.search, EDITING_OPTIONS, hasProcessedUrlParam]);

  // Scroll to results section when showResult becomes true
  useEffect(() => {
    if (showResult && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showResult]);

  // Initialize family variant options when variant changes
  useEffect(() => {
    if (selectedOption?.category === "family" && selectedFamilyVariant) {
      const variant = FAMILY_VARIANTS[selectedFamilyVariant];
      if (variant) {
        if (variant.sizes && variant.sizes.length > 0) {
          const firstSize = typeof variant.sizes[0] === 'string' ? variant.sizes[0] : variant.sizes[0].value;
          setFamilySize(firstSize);
        }
        if (variant.countries && variant.countries.length > 0) {
          setFamilyCountry(variant.countries[0]);
        }
        if (variant.finishes && variant.finishes.length > 0) {
          setFamilyFinish(variant.finishes[0]);
        }
        if (variant.paperTypes && variant.paperTypes.length > 0) {
          setFamilyPaperType(variant.paperTypes[0]);
        }
      }
    }
  }, [selectedFamilyVariant, selectedOption, FAMILY_VARIANTS]);

  const calculatePrice = () => {
    if (!selectedOption) return 0;

    if (selectedOption.category === "portrait") {
      const sizeOption = PORTRAIT_SIZES.find(s => s.size === selectedSize);
      let total = sizeOption ? sizeOption.price * selectedQuantity : 0;

      if (addFrame) {
        total += 20 * selectedQuantity;
      }

      return total;
    } else if (selectedOption.category === "id") {
      let total = ID_PACKAGE.base.price;
      total += extraPrintSets * ID_PACKAGE.extraPrints.price;
      return total;
    } else if (selectedOption.category === "family") {
      // Family photo pricing will be calculated based on variant options
      return 0;
    }
    return 0;
  };

  const getImageStyle = () => {
    if (selectedOption?.category !== "family") return {};

    return {
      filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) ${grayscale ? 'grayscale(100%)' : ''} hue-rotate(${hueRotate}deg) sepia(${sepia}%)`,
      transform: `rotate(${rotation}deg) scale(${zoom / 100})`,
      border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none',
      boxShadow: vignette > 0 ? `inset 0 0 ${vignette * 2}px ${vignette}px rgba(0,0,0,${vignette / 100})` : 'none'
    };
  };

  const resetEdits = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
    setRotation(0);
    setZoom(100);
    setGrayscale(false);
    setHueRotate(0);
    setSepia(0);
    setVignette(0);
    setBorderWidth(0);
    setBorderColor('#ffffff');
    setFilterPreset('none');
  };

  const applyFilterPreset = (preset) => {
    setFilterPreset(preset);
    switch (preset) {
      case 'vintage':
        setBrightness(110);
        setContrast(90);
        setSaturation(80);
        setSepia(30);
        setHueRotate(20);
        break;
      case 'cool':
        setBrightness(105);
        setContrast(110);
        setSaturation(120);
        setHueRotate(200);
        setSepia(0);
        break;
      case 'warm':
        setBrightness(110);
        setContrast(105);
        setSaturation(130);
        setHueRotate(10);
        setSepia(20);
        break;
      case 'bw':
        setGrayscale(true);
        setContrast(120);
        setBrightness(105);
        setSepia(0);
        break;
      case 'dramatic':
        setBrightness(95);
        setContrast(140);
        setSaturation(110);
        setVignette(40);
        setSepia(0);
        break;
      case 'none':
        resetEdits();
        break;
      default:
        break;
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: isMobile ? 'environment' : 'user' },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraReady(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraReady(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !isCameraReady) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob(async (blob) => {
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setShowCameraDialog(false);
      stopCamera();
      await processPhoto(file);
    }, 'image/jpeg', 0.95);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowUploadDialog(false);
    await processPhoto(file);
  };

  const processPhoto = async (file) => {
    if (!selectedOption) return;

    // Check authentication before processing
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    setIsUploading(true);
    setPhotoTitle(file.name.replace(/\.[^/.]+$/, ""));

    try {
      console.log("=== STARTING PHOTO PROCESSING ===");
      console.log("Selected option:", selectedOption.id);

      console.log("Step 1: Uploading to Base44...");
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      console.log("✓ Upload complete, file URL:", file_url);

      setOriginalImageUrl(file_url);
      setIsUploading(false);

      // Family photo: No AI processing, just manual editing
      if (selectedOption.category === "family") {
        setProcessedImageUrl(file_url);
        setEditedImageBase44Url(file_url);
        setShowResult(true);
        resetEdits();
        console.log("=== FAMILY PHOTO READY FOR MANUAL EDITING ===");
        return;
      }

      setIsProcessing(true);

      const webhookUrl = selectedOption.webhook;

      if (!webhookUrl) {
        throw new Error("Webhook URL not configured for this editing option");
      }

      const requestData = {
        image_url: file_url,
        editing_type: selectedOption.id,
        original_url: file_url,
        // Include selectedVisaCountry only if the option is "visa-photo"
        ...(selectedOption.id === "visa-photo" && { country: selectedVisaCountry }),
        // Include selectedSaudiStyle only if the option is "saudi-look"
        ...(selectedOption.id === "saudi-look" && { style: selectedSaudiStyle }),
        // Include selectedAbsherStyle only if the option is "absher-photo" (male only)
        ...(selectedOption.id === "absher-photo" && {
          style: selectedAbsherStyle,
          khutra_color: selectedKhutraColor
        })
      };

      console.log("Step 2: Sending to webhook...");
      console.log("Webhook URL:", webhookUrl);
      console.log("Request payload:", JSON.stringify(requestData, null, 2));

      const fetchWithTimeout = (url, options, timeout = 90000) => {
        return Promise.race([
          fetch(url, options),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout after 90 seconds')), timeout)
          )
        ]);
      };

      const response = await fetchWithTimeout(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      }, 90000);

      console.log("✓ Webhook response received");
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Webhook error response:", errorText);
        throw new Error(`Webhook failed with status ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log("✓ Webhook JSON response:", JSON.stringify(result, null, 2));

      let editedImageUrl = null;

      if (Array.isArray(result) && result.length > 0) {
        const firstItem = result[0];
        editedImageUrl = firstItem.photo_url || firstItem.url || firstItem.image_url || firstItem.processed_url || firstItem.edited_url;
        console.log("✓ Extracted URL from array format:", editedImageUrl);
      }
      else if (typeof result === 'object' && result !== null) {
        editedImageUrl = result.photo_url || result.url || result.processed_url || result.image_url || result.edited_url;
        console.log("✓ Extracted URL from object format:", editedImageUrl);
      }

      console.log("Final edited image URL:", editedImageUrl);

      if (!editedImageUrl) {
        console.error("No URL found in response:", result);
        throw new Error("No edited image URL found in webhook response");
      }

      if (editedImageUrl === file_url) {
        console.warn("⚠ Warning: Edited URL is same as original");
      }

      setProcessedImageUrl(editedImageUrl);

      console.log("Step 3: Downloading edited image...");
      const imageResponse = await fetch(editedImageUrl);

      if (!imageResponse.ok) {
        throw new Error(`Failed to download edited image: ${imageResponse.status}`);
      }

      const imageBlob = await imageResponse.blob();
      console.log("✓ Downloaded image, size:", imageBlob.size, "bytes");

      const editedFile = new File([imageBlob], `edited-${Date.now()}.png`, { type: 'image/png' });

      console.log("Step 4: Uploading edited image to Base44...");
      const { file_url: editedBase44Url } = await base44.integrations.Core.UploadFile({ file: editedFile });
      console.log("✓ Edited image uploaded to Base44:", editedBase44Url);

      setEditedImageBase44Url(editedBase44Url);
      setShowResult(true);
      setIsProcessing(false);

      console.log("=== PROCESSING COMPLETE ===");

    } catch (error) {
      console.error("=== PROCESSING ERROR ===");
      console.error("Error type:", error.name);
      console.error("Error message:", error.message);
      console.error("Full error:", error);

      let errorMessage = error.message;

      if (error.message.includes('Failed to fetch')) {
        errorMessage = `Cannot connect to webhook. Please ensure the ${selectedOption.id} webhook is configured at: ${selectedOption.webhook}`;
      }

      alert(`Error processing photo: ${errorMessage}`);
      setProcessedImageUrl(originalImageUrl);
      setEditedImageBase44Url(originalImageUrl);
      setShowResult(true);
      setIsProcessing(false);
    }
  };

  const savePhotoMutation = useMutation({
    mutationFn: async (photoData) => {
      console.log("=== SAVING PHOTO TO DATABASE ===");
      console.log("Photo data:", photoData);

      const savedPhoto = await base44.entities.Photo.create(photoData);
      console.log("✓ Photo saved to database:", savedPhoto);

      // Note: Photo is saved to gallery but NOT added to cart
      // Users will download it directly from gallery after payment confirmation

      const webhookUrl = 'https://n8n.renovaai.cloud/webhook/app-database';

      const webhookPayload = {
        action: 'photo_created',
        event: 'photo_saved',
        timestamp: new Date().toISOString(),
        data: {
          id: savedPhoto.id,
          user: savedPhoto.user,
          title: savedPhoto.title,
          ai_tool: savedPhoto.ai_tool,
          original_url: savedPhoto.original_url,
          edited_url: savedPhoto.edited_url,
          thumbnail_url: savedPhoto.thumbnail_url,
          editing_settings: savedPhoto.editing_settings,
          price: savedPhoto.price,
          print_size: savedPhoto.print_size,
          status: savedPhoto.status,
          created_date: savedPhoto.created_date
        }
      };

      console.log("=== SENDING TO WEBHOOK ===");
      console.log("Webhook payload:", JSON.stringify(webhookPayload, null, 2));

      try {
        console.log(`Sending to webhook: ${webhookUrl}`);

        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(webhookPayload)
        });

        console.log(`Webhook response status:`, response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Webhook failed with status ${response.status}:`, errorText);
          throw new Error(`Webhook failed: ${response.status} - ${errorText}`);
        }

        const responseData = await response.json().catch(() => null);
        console.log(`✓ Webhook success:`, responseData);

      } catch (error) {
        console.error(`✗ Webhook error:`, error.message);
      }

      return savedPhoto;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
      setPhotoSaved(true);
      // No success dialog - we navigate to cart instead
    },
    onError: (error) => {
      console.error("=== SAVE PHOTO ERROR ===");
      console.error("Error:", error);
      alert(`Failed to save photo: ${error.message}`);
    }
  });

  // Handle Order to Download and Ship - saves photo as pending and adds to cart
  const handleOrderToCart = async () => {
    if (!editedImageBase44Url || !currentUser || !selectedOption) return;

    // Check authentication
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    if (!photoTitle.trim()) {
      alert(language === 'ar' ? 'يرجى إدخال عنوان الصورة' : 'Please enter a photo title');
      return;
    }

    setIsDownloading(true);

    try {
      // Save photo to gallery with "pending" payment status
      const photoData = {
        title: photoTitle || "Untitled Photo",
        ai_tool: selectedOption.id,
        original_url: originalImageUrl,
        edited_url: selectedOption.category === "family" ? originalImageUrl : editedImageBase44Url,
        thumbnail_url: selectedOption.category === "family" ? originalImageUrl : editedImageBase44Url,
        editing_settings: {
          ai_style: selectedOption.id,
          category: selectedOption.category,
          size: selectedSize,
          quantity: selectedOption.category === "portrait" ? selectedQuantity : 1,
          addFrame: selectedOption.category === "portrait" ? addFrame : false,
          extraPrintSets: selectedOption.category === "id" ? extraPrintSets : 0,
          visaCountry: selectedOption.id === "visa-photo" ? selectedVisaCountry : null,
          familyVariant: selectedOption.category === "family" ? selectedFamilyVariant : null,
          familySize: selectedOption.category === "family" ? familySize : null,
          familyCountry: selectedOption.category === "family" ? familyCountry : null,
          familyFinish: selectedOption.category === "family" ? familyFinish : null,
          familyPaperType: selectedOption.category === "family" ? familyPaperType : null,
          brightness: selectedOption.category === "family" ? brightness : null,
          contrast: selectedOption.category === "family" ? contrast : null,
          saturation: selectedOption.category === "family" ? saturation : null,
          blur: selectedOption.category === "family" ? blur : null,
          rotation: selectedOption.category === "family" ? rotation : null,
          zoom: selectedOption.category === "family" ? zoom : null,
          grayscale: selectedOption.category === "family" ? grayscale : null,
          hueRotate: selectedOption.category === "family" ? hueRotate : null,
          sepia: selectedOption.category === "family" ? sepia : null,
          vignette: selectedOption.category === "family" ? vignette : null,
          borderWidth: selectedOption.category === "family" ? borderWidth : null,
          borderColor: selectedOption.category === "family" ? borderColor : null,
          filterPreset: selectedOption.category === "family" ? filterPreset : null,
          paid: false // Mark as unpaid initially
        },
        status: "pending", // Will be updated to "paid" after payment
        price: calculatePrice(),
        print_size: selectedOption.category === "portrait" ? selectedSize : selectedOption.category === "id" ? ID_PACKAGE.base.size : familySize
      };

      const savedPhoto = await savePhotoMutation.mutateAsync(photoData);
      console.log('Photo saved to gallery as pending:', savedPhoto);

      // Now add to cart
      const cartData = {
        photo_id: savedPhoto.id,
        photo_title: photoData.title,
        photo_url: photoData.edited_url,
        print_size: photoData.print_size,
        quantity: 1,
        price_per_item: photoData.price,
        editing_settings: photoData.editing_settings
      };

      await base44.entities.CartItem.create(cartData);
      console.log('Photo added to cart');

      // Navigate to cart page
      navigate(createPageUrl("Cart"));

    } catch (error) {
      console.error("Error saving photo:", error);
      alert(`Failed to save photo: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  // Save photo to gallery after successful payment
  const savePhotoToGallery = async () => {
    if (!editedImageBase44Url || !currentUser || !selectedOption) return;

    setIsDownloading(true);

    try {
      const photoData = {
        title: photoTitle || "Untitled Photo",
        ai_tool: selectedOption.id,
        original_url: originalImageUrl,
        edited_url: selectedOption.category === "family" ? originalImageUrl : editedImageBase44Url,
        thumbnail_url: selectedOption.category === "family" ? originalImageUrl : editedImageBase44Url,
        editing_settings: {
          ai_style: selectedOption.id,
          category: selectedOption.category,
          size: selectedSize,
          quantity: selectedOption.category === "portrait" ? selectedQuantity : 1,
          addFrame: selectedOption.category === "portrait" ? addFrame : false,
          extraPrintSets: selectedOption.category === "id" ? extraPrintSets : 0,
          visaCountry: selectedOption.id === "visa-photo" ? selectedVisaCountry : null,
          familyVariant: selectedOption.category === "family" ? selectedFamilyVariant : null,
          familySize: selectedOption.category === "family" ? familySize : null,
          familyCountry: selectedOption.category === "family" ? familyCountry : null,
          familyFinish: selectedOption.category === "family" ? familyFinish : null,
          familyPaperType: selectedOption.category === "family" ? familyPaperType : null,
          brightness: selectedOption.category === "family" ? brightness : null,
          contrast: selectedOption.category === "family" ? contrast : null,
          saturation: selectedOption.category === "family" ? saturation : null,
          blur: selectedOption.category === "family" ? blur : null,
          rotation: selectedOption.category === "family" ? rotation : null,
          zoom: selectedOption.category === "family" ? zoom : null,
          grayscale: selectedOption.category === "family" ? grayscale : null,
          hueRotate: selectedOption.category === "family" ? hueRotate : null,
          sepia: selectedOption.category === "family" ? sepia : null,
          vignette: selectedOption.category === "family" ? vignette : null,
          borderWidth: selectedOption.category === "family" ? borderWidth : null,
          borderColor: selectedOption.category === "family" ? borderColor : null,
          filterPreset: selectedOption.category === "family" ? filterPreset : null,
          paid: true // Mark as paid
        },
        status: "paid", // Mark status as paid
        price: calculatePrice(),
        print_size: selectedOption.category === "portrait" ? selectedSize : selectedOption.category === "id" ? ID_PACKAGE.base.size : familySize
      };

      await savePhotoMutation.mutateAsync(photoData);

      // Close payment dialog and navigate to gallery
      setShowPaymentDialog(false);
      navigate(createPageUrl("Profile") + "?tab=gallery");

    } catch (error) {
      console.error("Error saving photo:", error);
      alert(`Failed to save photo: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBuyPrints = () => {
    navigate(createPageUrl("Cart"));
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setShowUploadDialog(true);
    if (option.category === "portrait") {
      setSelectedSize("A5");
      setSelectedQuantity(1);
      setAddFrame(false);
      setExtraPrintSets(0);
    } else if (option.category === "id") {
      setSelectedSize("A5+8ID");
      setExtraPrintSets(0);
      setSelectedQuantity(1);
      setAddFrame(false);
      setSelectedVisaCountry("Schengen (Fr/Es/De)"); // Reset visa country for ID options
    } else if (option.category === "family") {
      setSelectedFamilyVariant("aluminum");
      setSelectedQuantity(1);
      setAddFrame(false);
      setExtraPrintSets(0);
      resetEdits(); // Reset family editing controls when selecting a new family photo
    }
  };

  const handleStartOver = () => {
    setShowResult(false);
    setOriginalImageUrl(null);
    setProcessedImageUrl(null);
    setEditedImageBase44Url(null);
    setPhotoTitle("");
    setSelectedOption(null);
    setSelectedSize("A5");
    setSelectedQuantity(1);
    setAddFrame(false);
    setExtraPrintSets(0);
    setSelectedFamilyVariant("aluminum");
    setFamilySize("");
    setFamilyCountry("");
    setFamilyFinish("");
    setFamilyPaperType("");
    setSelectedVisaCountry("Schengen (Fr/Es/De)"); // Reset visa country when starting over
    setSelectedSaudiStyle("Royal"); // Reset Saudi style when starting over
    setSelectedAbsherStyle("Royal"); // Reset Absher style
    setSelectedKhutraColor("Red"); // Reset Khutra color
    setHasProcessedUrlParam(false);
    setViewMode("slider");
    setPhotoSaved(false);
    resetEdits(); // Reset family editing controls
  };

  useEffect(() => {
    let mounted = true;

    if (showCameraDialog && mounted) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      mounted = false;
      stopCamera();
    };
  }, [showCameraDialog]);

  return (
    <div className="min-h-screen bg-[#F5F5F7] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-black mb-4">
            {t('aiPhotoStudio')}
          </h1>
          <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">
            {t('chooseStyle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {EDITING_OPTIONS.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
            >
              <Card
                onClick={() => handleOptionClick(option)}
                className="relative overflow-hidden bg-white border-none shadow-lg rounded-2xl cursor-pointer hover:shadow-2xl smooth-transition group"
              >
                <div className="relative aspect-square">
                  <div className="grid grid-cols-2 h-full">
                    <div className="relative overflow-hidden">
                      <img
                        src={option.beforeImage}
                        alt="Before"
                        className="w-full h-full object-cover"
                        style={option.id === 'visa-photo' ? { objectPosition: 'center center' } : {}}
                      />
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        Before
                      </div>
                    </div>
                    <div className="relative overflow-hidden">
                      <img
                        src={option.afterImage}
                        alt="After"
                        className="w-full h-full object-cover"
                        style={option.id === 'saudi-look' ? { objectPosition: '60% center' } : {}}
                      />
                      <div className="absolute top-2 right-2 bg-[#E63946] text-white text-xs px-2 py-1 rounded">
                        After
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 smooth-transition pointer-events-none" />
                </div>
                <div className="p-5 bg-gradient-to-r from-[#E63946] to-[#FF6B6B] group-hover:from-[#C1121F] group-hover:to-[#E63946] smooth-transition">
                  <h3 className="text-white text-lg font-bold mb-2 text-center">
                    {option.title}
                  </h3>
                  <p className="text-white/90 text-sm text-center leading-relaxed min-h-[40px]">
                    {option.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {(isUploading || isProcessing) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <Card className="p-8 bg-white border-none shadow-2xl rounded-2xl text-center max-w-md mx-4">
                <Loader2 className="w-16 h-16 animate-spin text-black mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-black mb-2">
                  {isUploading ? t('uploadingPhoto') : t('processingImageNow')}
                </h3>
                <p className="text-gray-600 mb-2">
                  {isUploading ? t('preparingImage') : t('alwaleedProcessing')}
                </p>
                {isProcessing && (
                  <>
                    <p className="text-sm text-gray-500 mb-2">
                      {t('mayTake30Seconds')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t('pleaseWait')}
                    </p>
                  </>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showResult && processedImageUrl && (
            <motion.div
              ref={resultsRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-6xl mx-auto"
            >
              <Card className="p-6 bg-white border-none shadow-2xl rounded-2xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-7 h-7 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-black">
                        {selectedOption?.category === "family" ? (language === 'ar' ? 'جاهز للتحرير اليدوي' : 'Ready for Manual Editing') : t('processingComplete')}
                      </h3>
                      <p className="text-gray-600">
                        {selectedOption?.title} {selectedOption?.category === "family" ? (language === 'ar' ? 'جاهز' : 'ready') : t('appliedSuccessfully')}
                      </p>
                    </div>
                  </div>

                  {selectedOption?.category !== "family" && (
                    <Button
                      onClick={() => setViewMode(viewMode === "slider" ? "sidebyside" : "slider")}
                      variant="outline"
                      className="border-2 border-gray-300 text-gray-700 hover:border-black hover:bg-gray-50 rounded-xl px-4 py-2.5 font-medium whitespace-nowrap"
                    >
                      <ArrowLeftRight className="w-5 h-5 mr-2" />
                      {viewMode === "sidebyside"
                        ? (language === 'ar' ? 'عرض المنزلق' : 'Slider View')
                        : (language === 'ar' ? 'عرض جنباً إلى جنب' : 'Side by Side')
                      }
                    </Button>
                  )}
                </div>

                <div className="mb-6">
                  {selectedOption?.category === "family" ? (
                    <div>
                      <div className="aspect-video max-h-[600px] bg-black rounded-2xl overflow-hidden mb-6">
                        <div className="w-full h-full flex items-center justify-center">
                          <img
                            src={processedImageUrl}
                            alt="Family Photo"
                            className="max-w-full max-h-full object-contain"
                            style={getImageStyle()}
                          />
                        </div>
                      </div>

                      {/* Photo Editing Controls */}
                      <Card className="p-6 bg-gray-50 border-none rounded-2xl mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-bold text-black">
                            {language === 'ar' ? 'أدوات التحرير' : 'Editing Tools'}
                          </h4>
                          <Button
                            onClick={resetEdits}
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                          >
                            {language === 'ar' ? 'إعادة تعيين' : 'Reset'}
                          </Button>
                        </div>

                        {/* Filter Presets */}
                        <div className="mb-6">
                          <label className="text-sm font-bold text-black mb-3 block">
                            {language === 'ar' ? 'فلاتر سريعة' : 'Quick Filters'}
                          </label>
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                            {[
                              { id: 'none', label: language === 'ar' ? 'بدون' : 'None' },
                              { id: 'vintage', label: language === 'ar' ? 'كلاسيكي' : 'Vintage' },
                              { id: 'cool', label: language === 'ar' ? 'بارد' : 'Cool' },
                              { id: 'warm', label: language === 'ar' ? 'دافئ' : 'Warm' },
                              { id: 'bw', label: language === 'ar' ? 'أبيض وأسود' : 'B&W' },
                              { id: 'dramatic', label: language === 'ar' ? 'درامي' : 'Dramatic' }
                            ].map((preset) => (
                              <button
                                key={preset.id}
                                onClick={() => applyFilterPreset(preset.id)}
                                className={`p-3 rounded-xl border-2 text-xs font-semibold transition-all ${filterPreset === preset.id
                                  ? 'border-black bg-black text-white'
                                  : 'border-gray-300 bg-white text-black hover:border-black'
                                  }`}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Brightness */}
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              {language === 'ar' ? 'السطوع' : 'Brightness'}: {brightness}%
                            </label>
                            <Slider
                              value={[brightness]}
                              onValueChange={(val) => setBrightness(val[0])}
                              min={0}
                              max={200}
                              step={1}
                              className="w-full"
                            />
                          </div>

                          {/* Contrast */}
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              {language === 'ar' ? 'التباين' : 'Contrast'}: {contrast}%
                            </label>
                            <Slider
                              value={[contrast]}
                              onValueChange={(val) => setContrast(val[0])}
                              min={0}
                              max={200}
                              step={1}
                              className="w-full"
                            />
                          </div>

                          {/* Saturation */}
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              {language === 'ar' ? 'التشبع' : 'Saturation'}: {saturation}%
                            </label>
                            <Slider
                              value={[saturation]}
                              onValueChange={(val) => setSaturation(val[0])}
                              min={0}
                              max={200}
                              step={1}
                              className="w-full"
                            />
                          </div>

                          {/* Blur */}
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              {language === 'ar' ? 'ضبابية' : 'Blur'}: {blur}px
                            </label>
                            <Slider
                              value={[blur]}
                              onValueChange={(val) => setBlur(val[0])}
                              min={0}
                              max={10}
                              step={0.1}
                              className="w-full"
                            />
                          </div>

                          {/* Rotation */}
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                              <RotateCw className="w-4 h-4" />
                              {language === 'ar' ? 'الدوران' : 'Rotation'}: {rotation}°
                            </label>
                            <Slider
                              value={[rotation]}
                              onValueChange={(val) => setRotation(val[0])}
                              min={-180}
                              max={180}
                              step={1}
                              className="w-full"
                            />
                          </div>

                          {/* Zoom */}
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                              <ZoomIn className="w-4 h-4" />
                              {language === 'ar' ? 'التكبير' : 'Zoom'}: {zoom}%
                            </label>
                            <Slider
                              value={[zoom]}
                              onValueChange={(val) => setZoom(val[0])}
                              min={50}
                              max={200}
                              step={1}
                              className="w-full"
                            />
                          </div>

                          {/* Hue Rotation */}
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              {language === 'ar' ? 'درجة اللون' : 'Hue'}: {hueRotate}°
                            </label>
                            <Slider
                              value={[hueRotate]}
                              onValueChange={(val) => setHueRotate(val[0])}
                              min={-180}
                              max={180}
                              step={1}
                              className="w-full"
                            />
                          </div>

                          {/* Sepia */}
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              {language === 'ar' ? 'سيبيا' : 'Sepia'}: {sepia}%
                            </label>
                            <Slider
                              value={[sepia]}
                              onValueChange={(val) => setSepia(val[0])}
                              min={0}
                              max={100}
                              step={1}
                              className="w-full"
                            />
                          </div>

                          {/* Vignette */}
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              {language === 'ar' ? 'ظل الحواف' : 'Vignette'}: {vignette}%
                            </label>
                            <Slider
                              value={[vignette]}
                              onValueChange={(val) => setVignette(val[0])}
                              min={0}
                              max={100}
                              step={1}
                              className="w-full"
                            />
                          </div>

                          {/* Border Width */}
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              {language === 'ar' ? 'حجم الإطار' : 'Border Size'}: {borderWidth}px
                            </label>
                            <Slider
                              value={[borderWidth]}
                              onValueChange={(val) => setBorderWidth(val[0])}
                              min={0}
                              max={50}
                              step={1}
                              className="w-full"
                            />
                          </div>

                          {/* Border Color */}
                          {borderWidth > 0 && (
                            <div className="col-span-1 md:col-span-2">
                              <label className="text-sm font-medium text-gray-700 mb-2 block">
                                {language === 'ar' ? 'لون الإطار' : 'Border Color'}
                              </label>
                              <div className="flex gap-2">
                                {['#ffffff', '#000000', '#8B4513', '#FFD700', '#C0C0C0'].map((color) => (
                                  <button
                                    key={color}
                                    onClick={() => setBorderColor(color)}
                                    className={`w-12 h-12 rounded-lg border-2 transition-all ${borderColor === color ? 'border-black scale-110' : 'border-gray-300'
                                      }`}
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                                <input
                                  type="color"
                                  value={borderColor}
                                  onChange={(e) => setBorderColor(e.target.value)}
                                  className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                                />
                              </div>
                            </div>
                          )}

                          {/* Grayscale Toggle */}
                          <div className="col-span-1 md:col-span-2">
                            <button
                              onClick={() => setGrayscale(!grayscale)}
                              className={`w-full p-4 rounded-xl border-2 transition-all ${grayscale
                                ? 'border-black bg-black text-white'
                                : 'border-gray-300 bg-white text-black hover:border-black'
                                }`}
                            >
                              <div className="font-medium">
                                {language === 'ar' ? 'تدرج رمادي' : 'Grayscale'}
                              </div>
                            </button>
                          </div>
                        </div>
                      </Card>
                    </div>
                  ) : viewMode === "sidebyside" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="relative">
                        <div className="aspect-video max-h-[600px] bg-black rounded-2xl overflow-hidden">
                          <img
                            src={originalImageUrl}
                            alt="Before"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="absolute top-3 left-3 bg-black/70 text-white text-sm font-bold px-4 py-2 rounded-full">
                          {language === 'ar' ? 'قبل' : 'Before'}
                        </div>
                      </div>
                      <div className="relative">
                        <div className="aspect-video max-h-[600px] bg-black rounded-2xl overflow-hidden">
                          <img
                            src={processedImageUrl}
                            alt="After"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="absolute top-3 right-3 bg-[#E63946] text-white text-sm font-bold px-4 py-2 rounded-full">
                          {language === 'ar' ? 'بعد' : 'After'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <BeforeAfterSlider
                      beforeImage={originalImageUrl}
                      afterImage={processedImageUrl}
                      className="aspect-video max-h-[600px] rounded-2xl"
                      altText={`${selectedOption?.title} before and after comparison`}
                    />
                  )}
                </div>

                <Input
                  value={photoTitle}
                  onChange={(e) => setPhotoTitle(e.target.value)}
                  placeholder={t('enterPhotoTitle')}
                  className="text-lg font-medium border-2 border-gray-200 rounded-xl py-6 mb-6"
                />

                <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                  {selectedOption?.category === "portrait" ? (
                    <>
                      <h4 className="text-lg font-bold text-black mb-4">
                        {language === 'ar' ? 'خيارات تصوير البورتريه' : 'Portrait Photography Options'}
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {PORTRAIT_SIZES.map((printSize) => (
                          <button
                            key={printSize.size}
                            onClick={() => setSelectedSize(printSize.size)}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${selectedSize === printSize.size
                              ? 'border-black bg-black text-white'
                              : 'border-gray-300 bg-white text-black hover:border-black'
                              }`}
                          >
                            <div className="font-bold text-xl mb-1">
                              {language === 'ar' ? printSize.label : printSize.labelEn}
                            </div>
                            <div className="text-sm opacity-80 mb-2">{printSize.description}</div>
                            <div className="text-lg font-semibold">{printSize.price} {language === 'ar' ? 'ر.س' : 'SAR'}</div>
                          </button>
                        ))}
                      </div>

                      <div className="mb-6">
                        <label className="block text-sm font-bold text-black mb-3">
                          {language === 'ar' ? 'الكمية' : 'Quantity'}
                        </label>
                        <div className="flex items-center gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                            className="w-12 h-12 rounded-xl border-2"
                          >
                            -
                          </Button>
                          <span className="text-2xl font-bold min-w-[60px] text-center">{selectedQuantity}</span>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setSelectedQuantity(selectedQuantity + 1)}
                            className="w-12 h-12 rounded-xl border-2"
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-6">
                        <button
                          onClick={() => setAddFrame(!addFrame)}
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${addFrame
                            ? 'border-black bg-black text-white'
                            : 'border-gray-300 bg-white text-black hover:border-black'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-bold text-lg mb-1">
                                {language === 'ar' ? 'إضافة إطار' : 'Add Frame'}
                              </div>
                              <div className="text-sm opacity-80">
                                {language === 'ar' ? 'إطار أنيق لصورتك' : 'Elegant frame for your photo'}
                              </div>
                            </div>
                            <div className="text-xl font-bold">
                              +20 {language === 'ar' ? 'ر.س' : 'SAR'}
                            </div>
                          </div>
                        </button>
                      </div>
                    </>
                  ) : selectedOption?.category === "id" ? (
                    <>
                      <h4 className="text-lg font-bold text-black mb-4">
                        {language === 'ar' ? 'خيارات تصوير الهوية/التأشيرة' : 'ID/Visa Photography Options'}
                      </h4>

                      <div className="p-4 rounded-xl border-2 border-black bg-black text-white mb-6">
                        <div className="font-bold text-xl mb-1">{ID_PACKAGE.base.label}</div>
                        <div className="text-sm opacity-80 mb-2">{ID_PACKAGE.base.description}</div>
                        <div className="text-2xl font-bold">{ID_PACKAGE.base.price} {language === 'ar' ? 'ر.س' : 'SAR'}</div>
                      </div>

                      <div className="border-t border-gray-200 pt-6">
                        <label className="block text-sm font-bold text-black mb-3">
                          {language === 'ar' ? 'نسخ إضافية (8 نسخ لكل مجموعة)' : 'Extra Prints (8 pieces per set)'}
                        </label>
                        <div className="flex items-center gap-4 mb-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setExtraPrintSets(Math.max(0, extraPrintSets - 1))}
                            className="w-12 h-12 rounded-xl border-2"
                            disabled={extraPrintSets === 0}
                          >
                            -
                          </Button>
                          <span className="text-2xl font-bold min-w-[60px] text-center">{extraPrintSets}</span>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setExtraPrintSets(extraPrintSets + 1)}
                            className="w-12 h-12 rounded-xl border-2"
                          >
                            +
                          </Button>
                          <div className="text-sm text-gray-600">
                            {language === 'ar'
                              ? `× 15 ر.س = ${extraPrintSets * 15} ر.س`
                              : `× 15 SAR = ${extraPrintSets * 15} SAR`
                            }
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          {language === 'ar'
                            ? 'كل مجموعة تحتوي على 8 صور هوية إضافية بنفس الصورة'
                            : 'Each set contains 8 additional ID pictures of the same photo'
                          }
                        </p>
                      </div>
                    </>
                  ) : selectedOption?.category === "family" && (
                    <>
                      <h4 className="text-lg font-bold text-black mb-4">
                        {language === 'ar' ? 'خيارات الطباعة' : 'Print Options'}
                      </h4>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {Object.values(FAMILY_VARIANTS).map((variant) => (
                          <button
                            key={variant.id}
                            onClick={() => setSelectedFamilyVariant(variant.id)}
                            className={`p-4 rounded-xl border-2 transition-all ${selectedFamilyVariant === variant.id
                              ? 'border-black bg-black text-white'
                              : 'border-gray-300 bg-white text-black hover:border-black'
                              }`}
                          >
                            <div className="font-bold text-lg text-center">
                              {variant.name}
                            </div>
                          </button>
                        ))}
                      </div>

                      {selectedFamilyVariant && FAMILY_VARIANTS[selectedFamilyVariant] && (
                        <div className="space-y-4">
                          {/* Size Selector */}
                          <div>
                            <label className="block text-sm font-bold text-black mb-2">
                              {language === 'ar' ? 'الحجم' : 'Size'}
                            </label>
                            <Select value={familySize} onValueChange={setFamilySize}>
                              <SelectTrigger className="rounded-xl border-2">
                                <SelectValue placeholder={language === 'ar' ? 'اختر الحجم' : 'Select size'} />
                              </SelectTrigger>
                              <SelectContent>
                                {FAMILY_VARIANTS[selectedFamilyVariant].sizes.map((size) => {
                                  const sizeValue = typeof size === 'string' ? size : size.value;
                                  const sizeLabel = typeof size === 'string' ? size : size.label;
                                  return (
                                    <SelectItem key={sizeValue} value={sizeValue}>
                                      {sizeLabel}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Country Selector */}
                          <div>
                            <label className="block text-sm font-bold text-black mb-2">
                              {language === 'ar' ? 'الدولة' : 'Country'}
                            </label>
                            <Select value={familyCountry} onValueChange={setFamilyCountry}>
                              <SelectTrigger className="rounded-xl border-2">
                                <SelectValue placeholder={language === 'ar' ? 'اختر الدولة' : 'Select country'} />
                              </SelectTrigger>
                              <SelectContent>
                                {FAMILY_VARIANTS[selectedFamilyVariant].countries.map((country) => (
                                  <SelectItem key={country} value={country}>
                                    {country}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* PhotoBook specific options */}
                          {selectedFamilyVariant === 'photobook' && (
                            <>
                              {/* Finish Selector */}
                              <div>
                                <label className="block text-sm font-bold text-black mb-2">
                                  {language === 'ar' ? 'نوع اللمسة النهائية' : 'Finish Type'}
                                </label>
                                <Select value={familyFinish} onValueChange={setFamilyFinish}>
                                  <SelectTrigger className="rounded-xl border-2">
                                    <SelectValue placeholder={language === 'ar' ? 'اختر اللمسة النهائية' : 'Select finish'} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {FAMILY_VARIANTS.photobook.finishes.map((finish) => (
                                      <SelectItem key={finish} value={finish}>
                                        {finish}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Paper Type Selector */}
                              <div>
                                <label className="block text-sm font-bold text-black mb-2">
                                  {language === 'ar' ? 'نوع الورق' : 'Paper Type'}
                                </label>
                                <Select value={familyPaperType} onValueChange={setFamilyPaperType}>
                                  <SelectTrigger className="rounded-xl border-2">
                                    <SelectValue placeholder={language === 'ar' ? 'اختر نوع الورق' : 'Select paper type'} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {FAMILY_VARIANTS.photobook.paperTypes.map((paperType) => (
                                      <SelectItem key={paperType} value={paperType}>
                                        {paperType}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {selectedOption?.category !== "family" && (
                    <div className="bg-white rounded-xl p-4 border-2 border-gray-200 mt-6">
                      {selectedOption?.category === "portrait" ? (
                        <>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">
                              {language === 'ar' ? 'السعر الأساسي' : 'Base Price'}:
                            </span>
                            <span className="text-gray-900 font-medium">
                              {(PORTRAIT_SIZES.find(s => s.size === selectedSize)?.price || 0)} × {selectedQuantity} = {(PORTRAIT_SIZES.find(s => s.size === selectedSize)?.price || 0) * selectedQuantity} {language === 'ar' ? 'ر.س' : 'SAR'}
                            </span>
                          </div>
                          {addFrame && (
                            <div className="flex justify-between items-center mb-2 text-blue-600">
                              <span>{language === 'ar' ? 'الإطار' : 'Frame'}:</span>
                              <span className="font-medium">+{20 * selectedQuantity} {language === 'ar' ? 'ر.س' : 'SAR'}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">
                              {language === 'ar' ? 'الباقة الأساسية' : 'Base Package'}:
                            </span>
                            <span className="text-gray-900 font-medium">
                              {ID_PACKAGE.base.price} {language === 'ar' ? 'ر.س' : 'SAR'}
                            </span>
                          </div>
                          {extraPrintSets > 0 && (
                            <div className="flex justify-between items-center mb-2 text-blue-600">
                              <span>
                                {language === 'ar' ? 'نسخ إضافية' : 'Extra Prints'} ({extraPrintSets} {language === 'ar' ? 'مجموعات' : 'sets'}):
                              </span>
                              <span className="font-medium">+{extraPrintSets * ID_PACKAGE.extraPrints.price} {language === 'ar' ? 'ر.س' : 'SAR'}</span>
                            </div>
                          )}
                        </>
                      )}
                      <div className="border-t border-gray-200 pt-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-black">
                            {language === 'ar' ? 'الإجمالي' : 'Total'}:
                          </span>
                          <span className="text-2xl font-black text-black">
                            {calculatePrice()} {language === 'ar' ? 'ر.س' : 'SAR'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleStartOver}
                    variant="outline"
                    className="flex-1 border-2 border-black text-black hover:bg-black hover:text-white rounded-xl py-4 text-lg font-medium"
                  >
                    {t('editAnotherPhoto')}
                  </Button>

                  {!photoSaved ? (
                    <Button
                      onClick={handleOrderToCart}
                      disabled={isDownloading || !photoTitle || !editedImageBase44Url || !currentUser}
                      className="flex-1 bg-gradient-to-r from-[#E63946] to-[#FF6B6B] text-white hover:from-[#C1121F] hover:to-[#E63946] rounded-xl py-4 text-lg font-medium shadow-lg"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          {language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          {language === 'ar' ? 'اطلب للتنزيل والشحن' : 'Order to Download & Ship'}
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => navigate(createPageUrl("Profile") + "?tab=gallery")}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 rounded-xl py-4 text-lg font-medium shadow-lg"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      {language === 'ar' ? 'عرض في المعرض' : 'View in Gallery'}
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              {selectedOption && (
                <>
                  <div className="w-12 h-12 bg-gradient-to-br from-[#E63946] to-[#FF6B6B] rounded-xl flex items-center justify-center">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  {selectedOption.title}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Country Selection - Only for Visa Photo */}
            {selectedOption?.id === "visa-photo" && (
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  {language === 'ar' ? 'اختر الدولة' : 'Select Country'}
                </label>
                <Select value={selectedVisaCountry} onValueChange={setSelectedVisaCountry}>
                  <SelectTrigger className="rounded-xl border-2">
                    <SelectValue placeholder={language === 'ar' ? 'اختر الدولة' : 'Select country'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Schengen (Fr/Es/De)">Schengen (Fr/Es/De)</SelectItem>
                    <SelectItem value="USA">USA</SelectItem>
                    <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                    <SelectItem value="UAE">UAE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Style Selection - Only for Saudi Look */}
            {selectedOption?.id === "saudi-look" && (
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  {language === 'ar' ? 'النمط:' : 'Style:'}
                </label>
                <Select value={selectedSaudiStyle} onValueChange={setSelectedSaudiStyle}>
                  <SelectTrigger className="rounded-xl border-2">
                    <SelectValue placeholder={language === 'ar' ? 'اختر النمط' : 'Select style'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Royal">{language === 'ar' ? 'الملكية' : 'Royal'}</SelectItem>
                    <SelectItem value="sheyoukh">{language === 'ar' ? 'الشيوخ' : 'Sheyoukh'}</SelectItem>
                    <SelectItem value="Eagle">{language === 'ar' ? 'الصقر' : 'Eagle'}</SelectItem>
                    <SelectItem value="practical">{language === 'ar' ? 'العملية' : 'Practical'}</SelectItem>
                    <SelectItem value="youth">{language === 'ar' ? 'الشبابية' : 'Youth'}</SelectItem>
                    <SelectItem value="knight">{language === 'ar' ? 'الفارس' : 'Knight'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Style Selection - Only for Absher Photo (Male) */}
            {selectedOption?.id === "absher-photo" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    {language === 'ar' ? 'النمط:' : 'Style:'}
                  </label>
                  <Select value={selectedAbsherStyle} onValueChange={setSelectedAbsherStyle}>
                    <SelectTrigger className="rounded-xl border-2">
                      <SelectValue placeholder={language === 'ar' ? 'اختر النمط' : 'Select style'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Royal">{language === 'ar' ? 'الملكية' : 'Royal'}</SelectItem>
                      <SelectItem value="Practical">{language === 'ar' ? 'العملية' : 'Practical'}</SelectItem>
                      <SelectItem value="Eagle">{language === 'ar' ? 'الصقر' : 'Eagle'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    {language === 'ar' ? 'لون الغطرة:' : 'Khutra Color:'}
                  </label>
                  <Select value={selectedKhutraColor} onValueChange={setSelectedKhutraColor}>
                    <SelectTrigger className="rounded-xl border-2">
                      <SelectValue placeholder={language === 'ar' ? 'اختر لون الغطرة' : 'Select Khutra Color'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Red">{language === 'ar' ? 'سعودي' : 'Saudi'}</SelectItem>
                      <SelectItem value="White">{language === 'ar' ? 'اماراتى' : 'Emirati'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-black text-white hover:bg-gray-900 rounded-xl py-6 text-lg font-medium"
            >
              <Upload className="w-5 h-5 mr-2" />
              {t('uploadFromDevice')}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">{t('or')}</span>
              </div>
            </div>

            <Button
              onClick={() => {
                setShowUploadDialog(false);
                setShowCameraDialog(true);
              }}
              variant="outline"
              className="w-full border-2 border-black text-black hover:bg-black hover:text-white rounded-xl py-6 text-lg font-medium"
            >
              <Camera className="w-5 h-5 mr-2" />
              {t('takePhoto')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCameraDialog} onOpenChange={setShowCameraDialog}>
        <DialogContent className="sm:max-w-xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Camera className="w-6 h-6" />
              {t('takePhoto')}
            </DialogTitle>
          </DialogHeader>
          <div className="relative aspect-[4/3] bg-black rounded-xl overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            {!isCameraReady && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  {t('startingCamera')}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowCameraDialog(false)}
              className="rounded-xl"
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={capturePhoto}
              disabled={!isCameraReady}
              className="bg-black text-white hover:bg-gray-900 rounded-xl"
            >
              <Camera className="w-4 h-4 mr-2" />
              {t('capturePhoto')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                {language === 'ar' ? 'تم الدفع بنجاح!' : 'Payment Successful!'}
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 text-center">
            <p className="text-gray-600">
              {language === 'ar'
                ? 'تم حفظ صورتك في المعرض. يمكنك تنزيلها الآن من صفحة المعرض.'
                : 'Your photo has been saved to gallery. You can download it from the gallery page.'
              }
            </p>
            <div className="flex flex-col gap-3 pt-2">
              <Button
                onClick={() => {
                  setShowSuccessDialog(false);
                  navigate(createPageUrl("Profile") + "?tab=gallery");
                }}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 rounded-xl py-4 text-lg font-medium"
              >
                <Download className="w-5 h-5 mr-2" />
                {language === 'ar' ? 'فتح المعرض للتنزيل' : 'Open Gallery to Download'}
              </Button>
              <Button
                onClick={() => {
                  setShowSuccessDialog(false);
                  handleStartOver();
                }}
                variant="outline"
                className="w-full border-2 border-black text-black hover:bg-black hover:text-white rounded-xl py-4 text-lg font-medium"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {language === 'ar' ? 'تحرير صورة أخرى' : 'Edit Another Photo'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-2xl w-full rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#E63946] to-[#FF6B6B] rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              {language === 'ar' ? 'إتمام الدفع' : 'Complete Payment'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedOption && currentUser && (
              <PaymentOptions
                bookingData={{
                  firstName: currentUser.full_name?.split(' ')[0] || currentUser.email?.split('@')[0] || '',
                  lastName: currentUser.full_name?.split(' ')[1] || '',
                  email: currentUser.email,
                  phone: currentUser.phone || '',
                  address: '',
                  bookingDate: new Date().toISOString().split('T')[0]
                }}
                packageInfo={{
                  title: `${selectedOption.title} - ${photoTitle}`,
                  titleEn: `${selectedOption.title} - ${photoTitle}`,
                  price: calculatePrice().toFixed(2)
                }}
                onBack={() => setShowPaymentDialog(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div >
  );
}