import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Loader2, ShoppingCart, Check, Image as ImageIcon, X, FileText } from "lucide-react";
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

export default function PrintProducts() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const customizeRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [coverFileUrl, setCoverFileUrl] = useState(null);
  const [bookFileUrl, setBookFileUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedFinish, setSelectedFinish] = useState("");
  const [selectedPaperType, setSelectedPaperType] = useState("");
  const [pageCount, setPageCount] = useState(24); // For photobooks
  const [currentPrice, setCurrentPrice] = useState(null);
  const [shippingLevel, setShippingLevel] = useState("cp_postal");
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

  const PRINT_PRODUCTS = {
    aluminum: {
      id: "aluminum",
      name: language === 'ar' ? 'ألومنيوم' : 'Aluminum',
      description: language === 'ar' ? 'طباعة عالية الجودة على لوحة ألومنيوم متينة' : 'High-quality print on durable aluminum panel',
      mockupImage: "https://base44.app/api/apps/6923c4343443603a5bde316a/files/public/6923c4343443603a5bde316a/db00481cd_Aluminum.webp?w=800&h=800&fit=crop",
      features: [
        language === 'ar' ? 'مقاوم للماء والخدوش' : 'Water and scratch resistant',
        language === 'ar' ? 'ألوان نابضة بالحياة' : 'Vibrant colors',
        language === 'ar' ? 'مثالي للأماكن الداخلية والخارجية' : 'Perfect for indoor & outdoor',
      ],
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
      ],
      pricing: [
        { "size": "300x300 mm", "country": "Saudi Arabia", "cost_eur": 26.19, "cost_sar": 114.44 },
        { "size": "400x400 mm", "country": "Saudi Arabia", "cost_eur": 28.97, "cost_sar": 126.61 },
        { "size": "450x450 mm", "country": "Saudi Arabia", "cost_eur": 30.61, "cost_sar": 133.77 },
        { "size": "500x500 mm", "country": "Saudi Arabia", "cost_eur": 37.24, "cost_sar": 162.73 },
        { "size": "700x700 mm", "country": "Saudi Arabia", "cost_eur": 54.70, "cost_sar": 239.04 },
        { "size": "300x450 mm", "country": "Saudi Arabia", "cost_eur": 27.72, "cost_sar": 121.12 },
        { "size": "500x600 mm", "country": "Saudi Arabia", "cost_eur": 32.09, "cost_sar": 140.22 },
        { "size": "600x800 mm", "country": "Saudi Arabia", "cost_eur": 50.26, "cost_sar": 219.62 },
        { "size": "600x900 mm", "country": "Saudi Arabia", "cost_eur": 56.67, "cost_sar": 247.63 },
        { "size": "300x300 mm", "country": "Kuwait", "cost_eur": 22.33, "cost_sar": 97.59 },
        { "size": "400x400 mm", "country": "Kuwait", "cost_eur": 24.76, "cost_sar": 108.18 },
        { "size": "450x450 mm", "country": "Kuwait", "cost_eur": 26.18, "cost_sar": 114.41 },
        { "size": "500x500 mm", "country": "Kuwait", "cost_eur": 30.06, "cost_sar": 131.34 },
        { "size": "700x700 mm", "country": "Kuwait", "cost_eur": 42.67, "cost_sar": 186.46 },
        { "size": "300x450 mm", "country": "Kuwait", "cost_eur": 23.66, "cost_sar": 103.41 },
        { "size": "500x600 mm", "country": "Kuwait", "cost_eur": 27.46, "cost_sar": 120.01 },
        { "size": "600x800 mm", "country": "Kuwait", "cost_eur": 40.09, "cost_sar": 175.17 },
        { "size": "600x900 mm", "country": "Kuwait", "cost_eur": 44.38, "cost_sar": 193.93 },
        { "size": "300x300 mm", "country": "Oman", "cost_eur": 28.15, "cost_sar": 123.03 },
        { "size": "400x400 mm", "country": "Oman", "cost_eur": 30.58, "cost_sar": 133.61 },
        { "size": "450x450 mm", "country": "Oman", "cost_eur": 32.00, "cost_sar": 139.84 },
        { "size": "500x500 mm", "country": "Oman", "cost_eur": 36.31, "cost_sar": 158.65 },
        { "size": "700x700 mm", "country": "Oman", "cost_eur": 49.83, "cost_sar": 217.75 },
        { "size": "300x450 mm", "country": "Oman", "cost_eur": 29.48, "cost_sar": 128.84 },
        { "size": "500x600 mm", "country": "Oman", "cost_eur": 33.28, "cost_sar": 145.44 },
        { "size": "600x800 mm", "country": "Oman", "cost_eur": 46.80, "cost_sar": 204.49 },
        { "size": "600x900 mm", "country": "Oman", "cost_eur": 51.54, "cost_sar": 225.22 },
        { "size": "300x300 mm", "country": "Bahrain", "cost_eur": 26.30, "cost_sar": 114.94 },
        { "size": "400x400 mm", "country": "Bahrain", "cost_eur": 28.73, "cost_sar": 125.53 },
        { "size": "450x450 mm", "country": "Bahrain", "cost_eur": 30.15, "cost_sar": 131.76 },
        { "size": "500x500 mm", "country": "Bahrain", "cost_eur": 34.70, "cost_sar": 151.62 },
        { "size": "700x700 mm", "country": "Bahrain", "cost_eur": 48.66, "cost_sar": 212.63 },
        { "size": "300x450 mm", "country": "Bahrain", "cost_eur": 27.63, "cost_sar": 120.75 },
        { "size": "500x600 mm", "country": "Bahrain", "cost_eur": 31.43, "cost_sar": 137.36 },
        { "size": "600x800 mm", "country": "Bahrain", "cost_eur": 45.41, "cost_sar": 198.42 },
        { "size": "600x900 mm", "country": "Bahrain", "cost_eur": 50.37, "cost_sar": 220.11 },
        { "size": "300x300 mm", "country": "Qatar", "cost_eur": 19.86, "cost_sar": 86.80 },
        { "size": "400x400 mm", "country": "Qatar", "cost_eur": 22.29, "cost_sar": 97.39 },
        { "size": "450x450 mm", "country": "Qatar", "cost_eur": 23.71, "cost_sar": 103.61 },
        { "size": "500x500 mm", "country": "Qatar", "cost_eur": 28.39, "cost_sar": 124.04 },
        { "size": "700x700 mm", "country": "Qatar", "cost_eur": 42.65, "cost_sar": 186.37 },
        { "size": "300x450 mm", "country": "Qatar", "cost_eur": 21.19, "cost_sar": 92.61 },
        { "size": "500x600 mm", "country": "Qatar", "cost_eur": 24.99, "cost_sar": 109.22 },
        { "size": "600x900 mm", "country": "Qatar", "cost_eur": 44.36, "cost_sar": 193.84 }
      ]
    },
    wood: {
      id: "wood",
      name: language === 'ar' ? 'خشب' : 'Wood',
      description: language === 'ar' ? 'طباعة فاخرة على لوحة خشبية طبيعية' : 'Premium print on natural wood panel',
      mockupImage: "https://base44.app/api/apps/6923c4343443603a5bde316a/files/public/6923c4343443603a5bde316a/3a57061b3_Wood.webp?w=800&h=800&fit=crop",
      features: [
        language === 'ar' ? 'خشب طبيعي 100%' : '100% natural wood',
        language === 'ar' ? 'لمسة نهائية فاخرة' : 'Premium finish',
        language === 'ar' ? 'صديق للبيئة' : 'Eco-friendly',
      ],
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
      ],
      pricing: [
        { "size": "300x300 mm", "country": "Saudi Arabia", "cost_eur": 27.90, "cost_sar": 121.93 },
        { "size": "400x400 mm", "country": "Saudi Arabia", "cost_eur": 34.67, "cost_sar": 151.51 },
        { "size": "450x450 mm", "country": "Saudi Arabia", "cost_eur": 49.73, "cost_sar": 217.31 },
        { "size": "500x500 mm", "country": "Saudi Arabia", "cost_eur": 62.40, "cost_sar": 272.68 },
        { "size": "700x700 mm", "country": "Saudi Arabia", "cost_eur": 82.41, "cost_sar": 360.13 },
        { "size": "300x450 mm", "country": "Saudi Arabia", "cost_eur": 34.12, "cost_sar": 149.12 },
        { "size": "400x600 mm", "country": "Saudi Arabia", "cost_eur": 46.23, "cost_sar": 202.04 },
        { "size": "600x800 mm", "country": "Saudi Arabia", "cost_eur": 73.22, "cost_sar": 319.95 },
        { "size": "600x900 mm", "country": "Saudi Arabia", "cost_eur": 75.07, "cost_sar": 328.07 },
        { "size": "300x300 mm", "country": "Kuwait", "cost_eur": 23.82, "cost_sar": 104.11 },
        { "size": "400x400 mm", "country": "Kuwait", "cost_eur": 27.82, "cost_sar": 121.58 },
        { "size": "450x450 mm", "country": "Kuwait", "cost_eur": 38.35, "cost_sar": 167.57 },
        { "size": "500x500 mm", "country": "Kuwait", "cost_eur": 45.57, "cost_sar": 199.15 },
        { "size": "700x700 mm", "country": "Kuwait", "cost_eur": 51.98, "cost_sar": 227.13 },
        { "size": "300x450 mm", "country": "Kuwait", "cost_eur": 27.35, "cost_sar": 119.51 },
        { "size": "400x600 mm", "country": "Kuwait", "cost_eur": 35.31, "cost_sar": 154.28 },
        { "size": "600x800 mm", "country": "Kuwait", "cost_eur": 46.01, "cost_sar": 201.06 },
        { "size": "600x900 mm", "country": "Kuwait", "cost_eur": 47.63, "cost_sar": 208.12 },
        { "size": "300x300 mm", "country": "Oman", "cost_eur": 29.64, "cost_sar": 129.54 },
        { "size": "400x400 mm", "country": "Oman", "cost_eur": 34.07, "cost_sar": 148.90 },
        { "size": "450x450 mm", "country": "Oman", "cost_eur": 45.51, "cost_sar": 198.86 },
        { "size": "500x500 mm", "country": "Oman", "cost_eur": 54.05, "cost_sar": 236.20 },
        { "size": "700x700 mm", "country": "Oman", "cost_eur": 69.82, "cost_sar": 305.09 },
        { "size": "300x450 mm", "country": "Oman", "cost_eur": 33.60, "cost_sar": 146.82 },
        { "size": "400x600 mm", "country": "Oman", "cost_eur": 42.47, "cost_sar": 185.57 },
        { "size": "600x800 mm", "country": "Oman", "cost_eur": 62.65, "cost_sar": 273.78 },
        { "size": "600x900 mm", "country": "Oman", "cost_eur": 64.27, "cost_sar": 280.84 },
        { "size": "300x300 mm", "country": "Bahrain", "cost_eur": 27.79, "cost_sar": 121.46 },
        { "size": "400x400 mm", "country": "Bahrain", "cost_eur": 32.46, "cost_sar": 141.86 },
        { "size": "450x450 mm", "country": "Bahrain", "cost_eur": 44.34, "cost_sar": 193.74 },
        { "size": "500x500 mm", "country": "Bahrain", "cost_eur": 53.55, "cost_sar": 234.02 },
        { "size": "700x700 mm", "country": "Bahrain", "cost_eur": 69.78, "cost_sar": 304.92 },
        { "size": "300x450 mm", "country": "Bahrain", "cost_eur": 31.99, "cost_sar": 139.79 },
        { "size": "400x600 mm", "country": "Bahrain", "cost_eur": 41.30, "cost_sar": 180.46 },
        { "size": "600x800 mm", "country": "Bahrain", "cost_eur": 62.38, "cost_sar": 272.60 },
        { "size": "600x900 mm", "country": "Bahrain", "cost_eur": 64.00, "cost_sar": 279.66 },
        { "size": "300x300 mm", "country": "Qatar", "cost_eur": 21.35, "cost_sar": 93.32 },
        { "size": "400x400 mm", "country": "Qatar", "cost_eur": 26.15, "cost_sar": 114.29 },
        { "size": "450x450 mm", "country": "Qatar", "cost_eur": 38.33, "cost_sar": 167.48 },
        { "size": "500x500 mm", "country": "Qatar", "cost_eur": 47.98, "cost_sar": 209.68 },
        { "size": "700x700 mm", "country": "Qatar", "cost_eur": 64.50, "cost_sar": 281.84 },
        { "size": "300x450 mm", "country": "Qatar", "cost_eur": 25.68, "cost_sar": 112.21 },
        { "size": "400x600 mm", "country": "Qatar", "cost_eur": 35.29, "cost_sar": 154.20 },
        { "size": "600x800 mm", "country": "Qatar", "cost_eur": 56.96, "cost_sar": 248.92 },
        { "size": "600x900 mm", "country": "Qatar", "cost_eur": 58.58, "cost_sar": 255.97 }
      ]
    },
    canva: {
      id: "canva",
      name: language === 'ar' ? 'كانفا' : 'Canvas',
      description: language === 'ar' ? 'طباعة فنية على قماش كانفا عالي الجودة' : 'Artistic print on high-quality canvas',
      mockupImage: "https://base44.app/api/apps/6923c4343443603a5bde316a/files/public/6923c4343443603a5bde316a/67a3ddf0a_Canvas.webp?w=800&h=800&fit=crop",
      features: [
        language === 'ar' ? 'قماش قطني متميز' : 'Premium cotton canvas',
        language === 'ar' ? 'إطار خشبي متين' : 'Sturdy wooden frame',
        language === 'ar' ? 'جاهز للتعليق' : 'Ready to hang',
      ],
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
      ],
      pricing: [
        { "size": "1000x500 mm", "country": "Saudi Arabia", "cost_eur": 69.29, "cost_sar": 302.78 },
        { "size": "200x200 mm", "country": "Saudi Arabia", "cost_eur": 21.30, "cost_sar": 93.09 },
        { "size": "200x300 mm", "country": "Saudi Arabia", "cost_eur": 22.15, "cost_sar": 96.79 },
        { "size": "300x300 mm", "country": "Saudi Arabia", "cost_eur": 22.28, "cost_sar": 97.38 },
        { "size": "300x400 mm", "country": "Saudi Arabia", "cost_eur": 23.27, "cost_sar": 101.67 },
        { "size": "300x450 mm", "country": "Saudi Arabia", "cost_eur": 24.05, "cost_sar": 105.10 },
        { "size": "400x400 mm", "country": "Saudi Arabia", "cost_eur": 29.29, "cost_sar": 128.00 },
        { "size": "400x600 mm", "country": "Saudi Arabia", "cost_eur": 33.22, "cost_sar": 145.16 },
        { "size": "500x700 mm", "country": "Saudi Arabia", "cost_eur": 35.18, "cost_sar": 153.75 },
        { "size": "500x750 mm", "country": "Saudi Arabia", "cost_eur": 36.16, "cost_sar": 158.04 },
        { "size": "600x600 mm", "country": "Saudi Arabia", "cost_eur": 35.18, "cost_sar": 153.75 },
        { "size": "600x800 mm", "country": "Saudi Arabia", "cost_eur": 48.29, "cost_sar": 211.03 },
        { "size": "800x800 mm", "country": "Saudi Arabia", "cost_eur": 60.03, "cost_sar": 262.35 },
        { "size": "1000x500 mm", "country": "Kuwait", "cost_eur": 54.11, "cost_sar": 236.48 },
        { "size": "200x200 mm", "country": "Kuwait", "cost_eur": 11.08, "cost_sar": 48.41 },
        { "size": "200x300 mm", "country": "Kuwait", "cost_eur": 11.81, "cost_sar": 51.62 },
        { "size": "300x300 mm", "country": "Kuwait", "cost_eur": 11.93, "cost_sar": 52.14 },
        { "size": "300x400 mm", "country": "Kuwait", "cost_eur": 12.79, "cost_sar": 55.87 },
        { "size": "300x450 mm", "country": "Kuwait", "cost_eur": 13.47, "cost_sar": 58.86 },
        { "size": "400x400 mm", "country": "Kuwait", "cost_eur": 25.03, "cost_sar": 109.39 },
        { "size": "400x600 mm", "country": "Kuwait", "cost_eur": 28.45, "cost_sar": 124.31 },
        { "size": "500x700 mm", "country": "Kuwait", "cost_eur": 30.16, "cost_sar": 131.78 },
        { "size": "500x750 mm", "country": "Kuwait", "cost_eur": 31.01, "cost_sar": 135.51 },
        { "size": "600x600 mm", "country": "Kuwait", "cost_eur": 30.16, "cost_sar": 131.78 },
        { "size": "600x800 mm", "country": "Kuwait", "cost_eur": 38.38, "cost_sar": 167.70 },
        { "size": "800x800 mm", "country": "Kuwait", "cost_eur": 46.07, "cost_sar": 201.31 },
        { "size": "1000x500 mm", "country": "Oman", "cost_eur": 61.70, "cost_sar": 269.65 },
        { "size": "200x200 mm", "country": "Oman", "cost_eur": 24.74, "cost_sar": 108.10 },
        { "size": "200x300 mm", "country": "Oman", "cost_eur": 25.47, "cost_sar": 111.31 },
        { "size": "300x300 mm", "country": "Oman", "cost_eur": 25.59, "cost_sar": 111.83 },
        { "size": "300x400 mm", "country": "Oman", "cost_eur": 26.44, "cost_sar": 115.56 },
        { "size": "300x450 mm", "country": "Oman", "cost_eur": 27.13, "cost_sar": 118.54 },
        { "size": "400x400 mm", "country": "Oman", "cost_eur": 30.85, "cost_sar": 134.82 },
        { "size": "400x600 mm", "country": "Oman", "cost_eur": 34.27, "cost_sar": 149.75 },
        { "size": "500x700 mm", "country": "Oman", "cost_eur": 35.98, "cost_sar": 157.21 },
        { "size": "500x750 mm", "country": "Oman", "cost_eur": 36.83, "cost_sar": 160.94 },
        { "size": "600x600 mm", "country": "Oman", "cost_eur": 35.98, "cost_sar": 157.21 },
        { "size": "600x800 mm", "country": "Oman", "cost_eur": 45.09, "cost_sar": 197.02 },
        { "size": "800x800 mm", "country": "Oman", "cost_eur": 53.66, "cost_sar": 234.48 },
        { "size": "1000x500 mm", "country": "Bahrain", "cost_eur": 60.76, "cost_sar": 265.54 },
        { "size": "200x200 mm", "country": "Bahrain", "cost_eur": 22.67, "cost_sar": 99.05 },
        { "size": "200x300 mm", "country": "Bahrain", "cost_eur": 23.40, "cost_sar": 102.26 },
        { "size": "300x300 mm", "country": "Bahrain", "cost_eur": 23.52, "cost_sar": 102.78 },
        { "size": "300x400 mm", "country": "Bahrain", "cost_eur": 24.37, "cost_sar": 106.51 },
        { "size": "300x450 mm", "country": "Bahrain", "cost_eur": 25.06, "cost_sar": 109.50 },
        { "size": "400x400 mm", "country": "Bahrain", "cost_eur": 29.00, "cost_sar": 126.74 },
        { "size": "400x600 mm", "country": "Bahrain", "cost_eur": 32.42, "cost_sar": 141.66 },
        { "size": "500x700 mm", "country": "Bahrain", "cost_eur": 34.13, "cost_sar": 149.13 },
        { "size": "500x750 mm", "country": "Bahrain", "cost_eur": 34.98, "cost_sar": 152.86 },
        { "size": "600x600 mm", "country": "Bahrain", "cost_eur": 34.13, "cost_sar": 149.13 },
        { "size": "600x800 mm", "country": "Bahrain", "cost_eur": 43.70, "cost_sar": 190.95 },
        { "size": "800x800 mm", "country": "Bahrain", "cost_eur": 52.72, "cost_sar": 230.38 },
        { "size": "1000x500 mm", "country": "Qatar", "cost_eur": 54.90, "cost_sar": 239.93 },
        { "size": "200x200 mm", "country": "Qatar", "cost_eur": 16.08, "cost_sar": 70.25 },
        { "size": "200x300 mm", "country": "Qatar", "cost_eur": 16.81, "cost_sar": 73.47 },
        { "size": "300x300 mm", "country": "Qatar", "cost_eur": 16.93, "cost_sar": 73.98 },
        { "size": "300x400 mm", "country": "Qatar", "cost_eur": 17.78, "cost_sar": 77.71 },
        { "size": "300x450 mm", "country": "Qatar", "cost_eur": 18.47, "cost_sar": 80.70 },
        { "size": "400x400 mm", "country": "Qatar", "cost_eur": 22.56, "cost_sar": 98.59 },
        { "size": "400x600 mm", "country": "Qatar", "cost_eur": 25.98, "cost_sar": 113.52 },
        { "size": "500x700 mm", "country": "Qatar", "cost_eur": 27.69, "cost_sar": 120.98 },
        { "size": "500x750 mm", "country": "Qatar", "cost_eur": 28.54, "cost_sar": 124.71 },
        { "size": "600x600 mm", "country": "Qatar", "cost_eur": 27.69, "cost_sar": 120.98 },
        { "size": "600x800 mm", "country": "Qatar", "cost_eur": 37.54, "cost_sar": 164.03 },
        { "size": "800x800 mm", "country": "Qatar", "cost_eur": 46.86, "cost_sar": 204.77 }
      ]
    },
    photobook: {
      id: "photobook",
      name: language === 'ar' ? 'البوم صور' : 'PhotoBook',
      description: language === 'ar' ? 'البوم صور احترافي مع خيارات تخصيص متنوعة' : 'Professional photo album with versatile customization',
      mockupImage: "https://base44.app/api/apps/6923c4343443603a5bde316a/files/public/6923c4343443603a5bde316a/588c470da_PhotoBook.webp?w=800&h=800&fit=crop",
      features: [
        language === 'ar' ? 'صفحات عالية الجودة' : 'High-quality pages',
        language === 'ar' ? 'غلاف صلب' : 'Hard cover',
        language === 'ar' ? 'تخصيص كامل' : 'Full customization',
      ],
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
        'Qatar',
        'United Arab Emirates'
      ],
      pricing: [
        { "size": "A4 Landscape", "country": "Saudi Arabia", "cost_eur": 22.4397, "cost_sar": 98.06 },
        { "size": "A4 Portrait", "country": "Saudi Arabia", "cost_eur": 22.4397, "cost_sar": 98.06 },
        { "size": "A5 Landscape", "country": "Saudi Arabia", "cost_eur": 21.8717, "cost_sar": 95.58 },
        { "size": "A5 Portrait", "country": "Saudi Arabia", "cost_eur": 21.8717, "cost_sar": 95.58 },
        { "size": "A6 Landscape", "country": "Saudi Arabia", "cost_eur": 21.7462, "cost_sar": 95.03 },
        { "size": "A6 Portrait", "country": "Saudi Arabia", "cost_eur": 21.8717, "cost_sar": 95.58 },
        { "size": "A4 Landscape", "country": "Kuwait", "cost_eur": 12.0659, "cost_sar": 52.73 },
        { "size": "A4 Portrait", "country": "Kuwait", "cost_eur": 12.0659, "cost_sar": 52.73 },
        { "size": "A5 Landscape", "country": "Kuwait", "cost_eur": 11.5733, "cost_sar": 50.58 },
        { "size": "A5 Portrait", "country": "Kuwait", "cost_eur": 11.5733, "cost_sar": 50.58 },
        { "size": "A6 Landscape", "country": "Kuwait", "cost_eur": 11.4641, "cost_sar": 50.10 },
        { "size": "A6 Portrait", "country": "Kuwait", "cost_eur": 11.5733, "cost_sar": 50.58 },
        { "size": "A4 Landscape - 130gsm", "country": "Oman", "cost_eur": 17.506, "cost_sar": 76.50 },
        { "size": "A4 Landscape - 150gsm", "country": "Oman", "cost_eur": 17.530, "cost_sar": 76.61 },
        { "size": "A4 Portrait - 130gsm", "country": "Oman", "cost_eur": 17.410, "cost_sar": 76.08 },
        { "size": "A4 Portrait - 150gsm", "country": "Oman", "cost_eur": 17.434, "cost_sar": 76.19 },
        { "size": "A5 Landscape - 130gsm", "country": "Oman", "cost_eur": 18.120, "cost_sar": 79.18 },
        { "size": "A5 Landscape - 150gsm", "country": "Oman", "cost_eur": 18.168, "cost_sar": 79.39 },
        { "size": "A5 Portrait - 130gsm", "country": "Oman", "cost_eur": 18.048, "cost_sar": 78.87 },
        { "size": "A5 Portrait - 150gsm", "country": "Oman", "cost_eur": 18.096, "cost_sar": 79.08 },
        { "size": "A6 Landscape - 130gsm", "country": "Oman", "cost_eur": 17.318, "cost_sar": 75.68 },
        { "size": "A6 Landscape - 150gsm", "country": "Oman", "cost_eur": 17.366, "cost_sar": 75.89 },
        { "size": "A6 Portrait - 130gsm", "country": "Oman", "cost_eur": 17.270, "cost_sar": 75.47 },
        { "size": "A6 Portrait - 150gsm", "country": "Oman", "cost_eur": 17.318, "cost_sar": 75.68 },
        { "size": "A4 Landscape", "country": "Qatar", "cost_eur": 17.0644, "cost_sar": 74.57 },
        { "size": "A4 Portrait", "country": "Qatar", "cost_eur": 17.0644, "cost_sar": 74.57 },
        { "size": "A5 Landscape", "country": "Qatar", "cost_eur": 16.5718, "cost_sar": 72.42 },
        { "size": "A5 Portrait", "country": "Qatar", "cost_eur": 16.5718, "cost_sar": 72.42 },
        { "size": "A6 Landscape", "country": "Qatar", "cost_eur": 16.4626, "cost_sar": 71.94 },
        { "size": "A6 Portrait", "country": "Qatar", "cost_eur": 16.5718, "cost_sar": 72.42 },
        { "size": "A4 Landscape", "country": "United Arab Emirates", "cost_eur": 12.5329, "cost_sar": 54.77 },
        { "size": "A4 Portrait", "country": "United Arab Emirates", "cost_eur": 12.5329, "cost_sar": 54.77 },
        { "size": "A5 Landscape", "country": "United Arab Emirates", "cost_eur": 12.0152, "cost_sar": 52.51 },
        { "size": "A5 Portrait", "country": "United Arab Emirates", "cost_eur": 12.0152, "cost_sar": 52.51 },
        { "size": "A6 Landscape", "country": "United Arab Emirates", "cost_eur": 11.9006, "cost_sar": 52.01 },
        { "size": "A6 Portrait", "country": "United Arab Emirates", "cost_eur": 12.0152, "cost_sar": 52.51 }
      ]
    }
  };

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

  useEffect(() => {
    if (selectedProduct && customizeRef.current) {
      customizeRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedProduct]);

  // Update price when size or country changes for products with pricing
  useEffect(() => {
    if ((selectedProduct === 'aluminum' || selectedProduct === 'wood' || selectedProduct === 'canva' || selectedProduct === 'photobook') && selectedSize && selectedCountry) {
      const productData = PRINT_PRODUCTS[selectedProduct];
      if (productData.pricing) {
        let priceEntry = null;

        // For photobook in Oman, match size + paper weight
        if (selectedProduct === 'photobook' && selectedCountry === 'Oman' && selectedPaperType) {
          const paperWeight = selectedPaperType.split(' ')[0]; // Extract "130gsm" or "150gsm"
          const sizeWithWeight = `${selectedSize} - ${paperWeight}`;
          priceEntry = productData.pricing.find(
            p => p.size === sizeWithWeight && p.country === selectedCountry
          );
        } else {
          // For other products or countries, match size only
          priceEntry = productData.pricing.find(
            p => p.size === selectedSize && p.country === selectedCountry
          );
        }

        setCurrentPrice(priceEntry || null);
      } else {
        setCurrentPrice(null);
      }
    } else {
      setCurrentPrice(null);
    }
  }, [selectedProduct, selectedSize, selectedCountry, selectedPaperType]);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setUploadedImageUrl(null);
    setUploadedImage(null);
    setUploadedFileName("");
    setCoverFileUrl(null);
    setBookFileUrl(null);

    const productData = PRINT_PRODUCTS[product];

    if (productData.sizes && productData.sizes.length > 0) {
      const firstSize = typeof productData.sizes[0] === 'string' ? productData.sizes[0] : productData.sizes[0].value;
      setSelectedSize(firstSize);
    }
    if (productData.countries && productData.countries.length > 0) {
      setSelectedCountry(productData.countries[0]);
    }
    if (productData.finishes && productData.finishes.length > 0) {
      setSelectedFinish(productData.finishes[0]);
    }
    if (productData.paperTypes && productData.paperTypes.length > 0) {
      setSelectedPaperType(productData.paperTypes[0]);
    }
  };

  const handleFileSelect = async (e, fileType = 'main') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      alert(language === 'ar' ? 'حجم الملف يجب أن لا يتجاوز 5 ميجابايت' : 'File size must not exceed 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Import supabase
      const { supabase } = await import('../lib/supabase');

      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}_${randomStr}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pdf-prints')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pdf-prints')
        .getPublicUrl(fileName);

      if (fileType === 'cover') {
        setCoverFileUrl(publicUrl);
      } else if (fileType === 'book') {
        setBookFileUrl(publicUrl);
      } else {
        setUploadedImageUrl(publicUrl);
        setUploadedImage(file);
        setUploadedFileName(file.name);
      }

      setIsUploading(false);
    } catch (error) {
      console.error("Upload error:", error);
      alert(language === 'ar' ? 'فشل رفع الملف: ' + error.message : 'Failed to upload file: ' + error.message);
      setIsUploading(false);
    }
  };

  // savePhotoMutation removed - not used in PrintProducts flow

  const handleSubmitOrder = async () => {
    if (!currentUser || !selectedProduct) return;

    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    // Validate file uploads
    if (selectedProduct === 'photobook') {
      if (!coverFileUrl || !bookFileUrl) {
        alert(language === 'ar' ? 'يرجى رفع ملف الغلاف والصفحات الداخلية' : 'Please upload both cover and book files');
        return;
      }
    } else {
      if (!uploadedImageUrl) {
        alert(language === 'ar' ? 'يرجى رفع ملف PDF' : 'Please upload a PDF file');
        return;
      }
    }

    // Validate shipping address
    if (!shippingAddress.firstname || !shippingAddress.lastname || !shippingAddress.street1 ||
      !shippingAddress.zip || !shippingAddress.city || !shippingAddress.email || !shippingAddress.phone) {
      alert(language === 'ar' ? 'يرجى ملء جميع معلومات الشحن' : 'Please fill in all shipping information');
      return;
    }

    setIsSubmittingOrder(true);

    try {
      const orderPayload = {
        productType: selectedProduct,
        size: selectedSize,
        imageUrl: selectedProduct === 'photobook' ? null : uploadedImageUrl,
        shippingAddress: {
          ...shippingAddress,
          country: selectedCountry === "Saudi Arabia" ? "SA" :
            selectedCountry === "Kuwait" ? "KW" :
              selectedCountry === "Oman" ? "OM" :
                selectedCountry === "Bahrain" ? "BH" :
                  selectedCountry === "Qatar" ? "QA" :
                    selectedCountry === "United Arab Emirates" ? "AE" : "SA"
        },
        shippingLevel: shippingLevel,
        finish: selectedFinish || undefined,
        paperType: selectedPaperType || undefined,
        pageCount: selectedProduct === 'photobook' ? pageCount : undefined,
        coverUrl: selectedProduct === 'photobook' ? coverFileUrl : undefined,
        bookUrl: selectedProduct === 'photobook' ? bookFileUrl : undefined
      };

      console.log("=== SENDING ORDER PAYLOAD ===");
      console.log(JSON.stringify(orderPayload, null, 2));

      // Call backend CloudPrinter API
      const response = await fetch('/api/cloudprinter/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload)
      });

      const data = await response.json();

      if (data.success) {
        setOrderSuccess(true);
        setOrderReference(data.orderReference);
        setShowSuccessDialog(true);

        // Reset form
        setUploadedImageUrl(null);
        setUploadedImage(null);
        setUploadedFileName("");
        setCoverFileUrl(null);
        setBookFileUrl(null);
        setSelectedProduct(null);
        setShippingAddress({
          firstname: "",
          lastname: "",
          street1: "",
          zip: "",
          city: "",
          country: "SA",
          email: "",
          phone: ""
        });
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
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-black mb-4">
            {language === 'ar' ? 'منتجات الطباعة' : 'Print Products'}
          </h1>
          <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">
            {language === 'ar'
              ? 'حول ذكرياتك إلى منتجات طباعة فاخرة عالية الجودة'
              : 'Transform your memories into premium quality print products'
            }
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {Object.values(PRINT_PRODUCTS).map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card
                className={`overflow-hidden bg-white border-2 shadow-lg rounded-2xl hover:shadow-2xl smooth-transition group cursor-pointer h-full ${selectedProduct === product.id ? 'border-[#E63946] ring-2 ring-[#E63946]' : 'border-transparent'
                  }`}
                onClick={() => handleProductSelect(product.id)}
              >
                <div className="h-full flex flex-col">
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={product.mockupImage}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 smooth-transition"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 smooth-transition" />

                    {selectedProduct === product.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-4 right-4 w-10 h-10 bg-[#E63946] rounded-full flex items-center justify-center"
                      >
                        <Check className="w-6 h-6 text-white" />
                      </motion.div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-black mb-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 flex-1">
                      {product.description}
                    </p>
                    <div className="space-y-1 mb-4">
                      {product.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                          <Check className="w-3 h-3 text-green-600" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className={`text-sm font-semibold text-center py-2 rounded-lg ${selectedProduct === product.id
                      ? 'bg-[#E63946] text-white'
                      : 'bg-gray-100 text-gray-700 group-hover:bg-gray-200'
                      } smooth-transition`}>
                      {selectedProduct === product.id
                        ? (language === 'ar' ? 'محدد' : 'Selected')
                        : (language === 'ar' ? 'اختر' : 'Select')
                      }
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Customization Section */}
        <AnimatePresence>
          {selectedProduct && (
            <motion.div
              ref={customizeRef}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.4 }}
              className="mb-12"
            >
              <Card className="p-6 sm:p-8 bg-white border-none shadow-2xl rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-black">
                    {language === 'ar' ? 'تخصيص طلبك' : 'Customize Your Order'}
                  </h2>
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
                  {/* Left: Upload & Preview */}
                  <div className="space-y-6">
                    {selectedProduct === 'photobook' ? (
                      <>
                        {/* Cover File Upload */}
                        <div>
                          <label className="block text-lg font-bold text-black mb-3">
                            {language === 'ar' ? 'ملف الغلاف (PDF)' : 'Cover File (PDF)'}
                          </label>
                          <input
                            type="file"
                            accept="application/pdf,.pdf"
                            onChange={(e) => handleFileSelect(e, 'cover')}
                            className="hidden"
                            id="cover-upload"
                          />

                          {!coverFileUrl ? (
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Button
                                onClick={() => document.getElementById('cover-upload')?.click()}
                                disabled={isUploading}
                                className="w-full bg-gradient-to-r from-gray-800 to-black text-white hover:from-gray-900 hover:to-black rounded-2xl py-8 text-base font-medium border-2 border-dashed border-gray-300 hover:border-gray-400"
                              >
                                {isUploading ? (
                                  <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    {language === 'ar' ? 'جارٍ الرفع...' : 'Uploading...'}
                                  </>
                                ) : (
                                  <div className="flex flex-col items-center gap-2">
                                    <Upload className="w-8 h-8" />
                                    <span>{language === 'ar' ? 'ارفع ملف الغلاف' : 'Upload Cover'}</span>
                                    <span className="text-xs opacity-70">PDF</span>
                                  </div>
                                )}
                              </Button>
                            </motion.div>
                          ) : (
                            <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Check className="w-6 h-6 text-green-600" />
                                <span className="font-medium text-green-900">
                                  {language === 'ar' ? 'تم رفع ملف الغلاف' : 'Cover uploaded'}
                                </span>
                              </div>
                              <Button
                                onClick={() => document.getElementById('cover-upload')?.click()}
                                size="sm"
                                variant="outline"
                                className="rounded-lg"
                              >
                                {language === 'ar' ? 'تغيير' : 'Change'}
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Book File Upload */}
                        <div>
                          <label className="block text-lg font-bold text-black mb-3">
                            {language === 'ar' ? 'ملف الصفحات الداخلية (PDF)' : 'Book Pages File (PDF)'}
                          </label>
                          <input
                            type="file"
                            accept="application/pdf,.pdf"
                            onChange={(e) => handleFileSelect(e, 'book')}
                            className="hidden"
                            id="book-upload"
                          />

                          {!bookFileUrl ? (
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Button
                                onClick={() => document.getElementById('book-upload')?.click()}
                                disabled={isUploading}
                                className="w-full bg-gradient-to-r from-gray-800 to-black text-white hover:from-gray-900 hover:to-black rounded-2xl py-8 text-base font-medium border-2 border-dashed border-gray-300 hover:border-gray-400"
                              >
                                {isUploading ? (
                                  <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    {language === 'ar' ? 'جارٍ الرفع...' : 'Uploading...'}
                                  </>
                                ) : (
                                  <div className="flex flex-col items-center gap-2">
                                    <Upload className="w-8 h-8" />
                                    <span>{language === 'ar' ? 'ارفع ملف الصفحات' : 'Upload Book Pages'}</span>
                                    <span className="text-xs opacity-70">PDF</span>
                                  </div>
                                )}
                              </Button>
                            </motion.div>
                          ) : (
                            <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Check className="w-6 h-6 text-green-600" />
                                <span className="font-medium text-green-900">
                                  {language === 'ar' ? 'تم رفع ملف الصفحات' : 'Book pages uploaded'}
                                </span>
                              </div>
                              <Button
                                onClick={() => document.getElementById('book-upload')?.click()}
                                size="sm"
                                variant="outline"
                                className="rounded-lg"
                              >
                                {language === 'ar' ? 'تغيير' : 'Change'}
                              </Button>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div>
                        <label className="block text-lg font-bold text-black mb-3">
                          {language === 'ar' ? 'ارفع ملف PDF' : 'Upload PDF File'}
                        </label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="application/pdf,.pdf"
                          onChange={handleFileSelect}
                          className="hidden"
                        />

                        {!uploadedImageUrl ? (
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploading}
                              className="w-full bg-gradient-to-r from-gray-800 to-black text-white hover:from-gray-900 hover:to-black rounded-2xl py-12 text-lg font-medium border-2 border-dashed border-gray-300 hover:border-gray-400"
                            >
                              {isUploading ? (
                                <>
                                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                                  {language === 'ar' ? 'جارٍ الرفع...' : 'Uploading...'}
                                </>
                              ) : (
                                <div className="flex flex-col items-center gap-3">
                                  <Upload className="w-10 h-10" />
                                  <span>{language === 'ar' ? 'اختر ملف PDF للرفع' : 'Choose PDF File to Upload'}</span>
                                  <span className="text-xs opacity-70">{language === 'ar' ? 'PDF فقط' : 'PDF only'}</span>
                                </div>
                              )}
                            </Button>
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative"
                          >
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200 shadow-lg">
                              <div className="flex flex-col items-center justify-center space-y-4">
                                <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center">
                                  <FileText className="w-10 h-10 text-green-600" />
                                </div>

                                <div className="text-center space-y-2">
                                  <div className="flex items-center justify-center gap-2">
                                    <Check className="w-5 h-5 text-green-600" />
                                    <p className="text-lg font-bold text-green-900">
                                      {language === 'ar' ? 'تم رفع الملف بنجاح' : 'File Uploaded Successfully'}
                                    </p>
                                  </div>
                                  <p className="text-sm text-gray-600 break-all px-4">
                                    {uploadedFileName}
                                  </p>
                                </div>

                                <div className="w-full bg-white rounded-xl p-4 shadow-sm border border-green-100">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-bold text-black">
                                        {PRINT_PRODUCTS[selectedProduct].name}
                                      </p>
                                      <p className="text-xs text-gray-600">
                                        {selectedSize}
                                      </p>
                                    </div>
                                    <Button
                                      onClick={() => fileInputRef.current?.click()}
                                      size="sm"
                                      variant="outline"
                                      className="rounded-lg border-green-300 text-green-700 hover:bg-green-50"
                                    >
                                      {language === 'ar' ? 'تغيير' : 'Change'}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Options */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-lg font-bold text-black mb-3">
                        {language === 'ar' ? 'خيارات التخصيص' : 'Customization Options'}
                      </label>

                      <div className="space-y-4">
                        {/* Size */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            {language === 'ar' ? 'الحجم' : 'Size'}
                          </label>
                          <Select value={selectedSize} onValueChange={setSelectedSize}>
                            <SelectTrigger className="rounded-xl border-2 h-12">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PRINT_PRODUCTS[selectedProduct].sizes.map((size) => {
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

                        {/* Country */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            {language === 'ar' ? 'الدولة' : 'Country'}
                          </label>
                          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                            <SelectTrigger className="rounded-xl border-2 h-12">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PRINT_PRODUCTS[selectedProduct].countries.map((country) => (
                                <SelectItem key={country} value={country}>
                                  {country}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* PhotoBook specific options */}
                        {selectedProduct === 'photobook' && (
                          <>
                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2">
                                {language === 'ar' ? 'نوع اللمسة النهائية' : 'Finish Type'}
                              </label>
                              <Select value={selectedFinish} onValueChange={setSelectedFinish}>
                                <SelectTrigger className="rounded-xl border-2 h-12">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {PRINT_PRODUCTS.photobook.finishes.map((finish) => (
                                    <SelectItem key={finish} value={finish}>
                                      {finish}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2">
                                {language === 'ar' ? 'نوع الورق' : 'Paper Type'}
                              </label>
                              <Select value={selectedPaperType} onValueChange={setSelectedPaperType}>
                                <SelectTrigger className="rounded-xl border-2 h-12">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {PRINT_PRODUCTS.photobook.paperTypes.map((paperType) => (
                                    <SelectItem key={paperType} value={paperType}>
                                      {paperType}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2">
                                {language === 'ar' ? 'عدد الصفحات' : 'Number of Pages'}
                              </label>
                              <Select value={String(pageCount)} onValueChange={(val) => setPageCount(Number(val))}>
                                <SelectTrigger className="rounded-xl border-2 h-12">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="24">24 pages</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}

                        {/* Price Display */}
                        {(selectedProduct === 'aluminum' || selectedProduct === 'wood' || selectedProduct === 'canva' || selectedProduct === 'photobook') && currentPrice && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-200"
                          >
                            <div className="text-center">
                              <p className="text-sm font-medium text-gray-600 mb-2">
                                {language === 'ar' ? 'السعر' : 'Price'}
                              </p>
                              <div className="flex items-center justify-center gap-4">
                                <div className="text-center">
                                  <p className="text-3xl font-black text-black">
                                    {currentPrice.cost_sar.toFixed(2)}
                                  </p>
                                  <p className="text-xs font-medium text-gray-500">SAR</p>
                                </div>
                                <div className="w-px h-12 bg-gray-300" />
                                <div className="text-center">
                                  <p className="text-3xl font-black text-gray-700">
                                    €{currentPrice.cost_eur.toFixed(2)}
                                  </p>
                                  <p className="text-xs font-medium text-gray-500">EUR</p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* Shipping Level */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            {language === 'ar' ? 'مستوى الشحن' : 'Shipping Level'}
                          </label>
                          <Select value={shippingLevel} onValueChange={setShippingLevel}>
                            <SelectTrigger className="rounded-xl border-2 h-12">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cp_postal">{language === 'ar' ? 'بريدي' : 'Postal'}</SelectItem>
                              <SelectItem value="cp_ground">{language === 'ar' ? 'أرضي' : 'Ground'}</SelectItem>
                              <SelectItem value="cp_saver">{language === 'ar' ? 'موفر' : 'Saver'}</SelectItem>
                              <SelectItem value="cp_fast">{language === 'ar' ? 'سريع' : 'Fast'}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Shipping Address Section */}
                        <div className="border-t-2 border-gray-200 pt-4 mt-4">
                          <h3 className="text-lg font-bold text-black mb-3">
                            {language === 'ar' ? 'عنوان الشحن' : 'Shipping Address'}
                          </h3>

                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  {language === 'ar' ? 'الاسم الأول' : 'First Name'} *
                                </label>
                                <input
                                  type="text"
                                  value={shippingAddress.firstname}
                                  onChange={(e) => setShippingAddress({ ...shippingAddress, firstname: e.target.value })}
                                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                                  placeholder={language === 'ar' ? 'أحمد' : 'John'}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  {language === 'ar' ? 'الاسم الأخير' : 'Last Name'} *
                                </label>
                                <input
                                  type="text"
                                  value={shippingAddress.lastname}
                                  onChange={(e) => setShippingAddress({ ...shippingAddress, lastname: e.target.value })}
                                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                                  placeholder={language === 'ar' ? 'محمد' : 'Doe'}
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                {language === 'ar' ? 'العنوان' : 'Street Address'} *
                              </label>
                              <input
                                type="text"
                                value={shippingAddress.street1}
                                onChange={(e) => setShippingAddress({ ...shippingAddress, street1: e.target.value })}
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                                placeholder={language === 'ar' ? 'شارع الملك فهد' : 'King Fahd Street'}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  {language === 'ar' ? 'المدينة' : 'City'} *
                                </label>
                                <input
                                  type="text"
                                  value={shippingAddress.city}
                                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                                  placeholder={language === 'ar' ? 'الرياض' : 'Riyadh'}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  {language === 'ar' ? 'الرمز البريدي' : 'Postal Code'} *
                                </label>
                                <input
                                  type="text"
                                  value={shippingAddress.zip}
                                  onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                                  placeholder="12345"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                {language === 'ar' ? 'البريد الإلكتروني' : 'Email'} *
                              </label>
                              <input
                                type="email"
                                value={shippingAddress.email}
                                onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                                placeholder="email@example.com"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'} *
                              </label>
                              <input
                                type="tel"
                                value={shippingAddress.phone}
                                onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none"
                                placeholder="+966 50 123 4567"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Submit Order Button */}
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            onClick={handleSubmitOrder}
                            disabled={(selectedProduct === 'photobook' ? (!coverFileUrl || !bookFileUrl) : !uploadedImageUrl) || isSubmittingOrder}
                            className="w-full bg-gradient-to-r from-[#E63946] to-[#FF6B6B] text-white hover:from-[#C1121F] hover:to-[#E63946] rounded-xl py-4 text-lg font-bold shadow-lg mt-4"
                          >
                            {isSubmittingOrder ? (
                              <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                {language === 'ar' ? 'جارٍ تقديم الطلب...' : 'Submitting Order...'}
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-5 h-5 mr-2" />
                                {language === 'ar' ? 'تقديم الطلب' : 'Submit Order'}
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-[#E63946] to-[#FF6B6B] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-black mb-2">
              {language === 'ar' ? 'جودة احترافية' : 'Professional Quality'}
            </h3>
            <p className="text-gray-600">
              {language === 'ar'
                ? 'طباعة عالية الدقة باستخدام أحدث التقنيات'
                : 'High-resolution printing with latest technology'
              }
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-[#E63946] to-[#FF6B6B] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-black mb-2">
              {language === 'ar' ? 'شحن سريع' : 'Fast Shipping'}
            </h3>
            <p className="text-gray-600">
              {language === 'ar'
                ? 'توصيل سريع إلى جميع دول الخليج'
                : 'Quick delivery to all GCC countries'
              }
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-[#E63946] to-[#FF6B6B] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ImageIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-black mb-2">
              {language === 'ar' ? 'تخصيص كامل' : 'Full Customization'}
            </h3>
            <p className="text-gray-600">
              {language === 'ar'
                ? 'اختر الحجم والمادة والتشطيب المناسب'
                : 'Choose your size, material, and finish'
              }
            </p>
          </motion.div>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold text-center">
              {language === 'ar' ? 'تم تقديم الطلب بنجاح!' : 'Order Submitted Successfully!'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-600 mb-2">
                {language === 'ar' ? 'رقم الطلب' : 'Order Reference'}
              </p>
              <p className="text-lg font-bold text-black break-all">
                {orderReference}
              </p>
            </div>

            <p className="text-center text-gray-600">
              {language === 'ar'
                ? 'سيتم معالجة طلبك قريباً. سنرسل لك تحديثات عبر البريد الإلكتروني.'
                : 'Your order will be processed soon. We will send you updates via email.'
              }
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setShowSuccessDialog(false)}
              className="flex-1 bg-gradient-to-r from-[#E63946] to-[#FF6B6B] text-white hover:from-[#C1121F] hover:to-[#E63946] rounded-xl py-3"
            >
              {language === 'ar' ? 'حسناً' : 'OK'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold text-center">
              {language === 'ar' ? 'فشل تقديم الطلب' : 'Order Submission Failed'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-center text-gray-600">
              {errorMessage}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setShowErrorDialog(false)}
              variant="outline"
              className="flex-1 rounded-xl py-3"
            >
              {language === 'ar' ? 'حسناً' : 'OK'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}