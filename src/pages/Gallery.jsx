import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Image as ImageIcon, Loader2, Plus, Play, Filter, SortAsc, ChevronLeft, ChevronRight, X, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
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
  DialogFooter,
} from "@/components/ui/dialog";

export default function Gallery() {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  // Removed selectedPhoto, selectedSize, isAddingToCart states as per changes
  // const [selectedPhoto, setSelectedPhoto] = useState(null);
  // const [selectedSize, setSelectedSize] = useState("8x10");
  // const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // New state for filtering, sorting, and slideshow
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [slideshowOpen, setSlideshowOpen] = useState(false);
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [sharingPhoto, setSharingPhoto] = useState(null);
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);

  useEffect(() => {
    let mounted = true; // Flag to track if the component is mounted

    const fetchUser = async () => {
      try {
        const user = await base44.auth.getUser();
        if (mounted) { // Only update state if component is still mounted
          setCurrentUser(user);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();

    return () => {
      mounted = false; // Set mounted to false when the component unmounts
    };
  }, []);

  const { data: photos = [], isLoading } = useQuery({
    queryKey: ['photos', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return [];
      return base44.entities.photos.getAll();
    },
    enabled: !!currentUser?.email,
    initialData: [],
  });

  const addToCartMutation = useMutation({
    mutationFn: async (cartData) => base44.entities.cart.create(cartData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
      // Removed setSelectedPhoto(null) and setSelectedSize("8x10") as per changes
    },
  });

  // Filter and sort photos
  const filteredAndSortedPhotos = React.useMemo(() => {
    let result = [...photos];

    // Apply filter
    if (filterType !== "all") {
      result = result.filter(photo =>
        photo.ai_tool === filterType // Changed from photo.editing_settings?.ai_style
      );
    }

    // Apply sort
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.created_date) - new Date(b.created_date)); // Fixed sorting bug here
        break;
      case "alphabetical":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    return result;
  }, [photos, filterType, sortBy]);

  const filterOptions = [
    { value: "all", label: "All Photos", icon: ImageIcon },
    { value: "visa-photo", label: t('visaPhoto'), icon: ImageIcon },
    { value: "absher-photo", label: t('absherPhotoMale'), icon: ImageIcon },
    { value: "absher-photo-female", label: t('absherPhotoFemale'), icon: ImageIcon },
    { value: "saudi-look", label: t('saudiLook'), icon: ImageIcon },
    { value: "baby-photo", label: t('babyPhoto'), icon: ImageIcon },
  ];

  const handleAddToCart = async (photo) => {
    if (!photo || !currentUser) return;

    // Auth is handled by the API client
    // Just proceed with adding to cart

    // Use the price from the saved photo
    const price = photo.price || 45; // Default to A5 portrait price if not set

    const cartData = {
      photo_id: photo.id,
      photo_title: photo.title,
      photo_url: photo.edited_url,
      print_size: photo.print_size || "A5",
      quantity: 1,
      price_per_item: price,
      editing_settings: photo.editing_settings
    };

    await addToCartMutation.mutateAsync(cartData);
  };

  // Removed openSizeDialog as per changes
  // const openSizeDialog = (photo) => {
  //   setSelectedPhoto(photo);
  //   setSelectedSize(photo.print_size || "8x10");
  // };

  const openSlideshow = (index) => {
    setSlideshowIndex(index);
    setSlideshowOpen(true);
  };

  const nextSlide = () => {
    setSlideshowIndex((prev) => (prev + 1) % filteredAndSortedPhotos.length);
  };

  const prevSlide = () => {
    setSlideshowIndex((prev) => (prev - 1 + filteredAndSortedPhotos.length) % filteredAndSortedPhotos.length);
  };

  const handleShare = async (photo, platform) => {
    setIsGeneratingShare(true);
    try {
      const shareText = language === 'ar'
        ? 'هذه الصورة من إبداع ستديو الوليد، جرب صورتك الآن!'
        : 'This photo is created by Studio Alwaleed, Try your photo now!';

      const shareUrl = 'https://www.alwaleed.pro';
      const imageUrl = photo.edited_url;

      if (platform === 'facebook') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank');
      } else if (platform === 'linkedin') {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
      } else if (platform === 'instagram') {
        // Instagram doesn't support direct web sharing, so we'll download the image with watermark
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${photo.title}-alwaleed-studio.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        alert(language === 'ar'
          ? 'تم تنزيل الصورة! يمكنك الآن رفعها على إنستجرام مع النص: ' + shareText
          : 'Image downloaded! You can now upload it to Instagram with the text: ' + shareText
        );
      }

      setShareDialogOpen(false);
    } catch (error) {
      console.error('Error sharing:', error);
      alert(language === 'ar' ? 'حدث خطأ في المشاركة' : 'Error sharing photo');
    } finally {
      setIsGeneratingShare(false);
    }
  };

  const openShareDialog = (photo) => {
    setSharingPhoto(photo);
    setShareDialogOpen(true);
  };

  useEffect(() => {
    if (!slideshowOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        setSlideshowIndex((prev) => (prev + 1) % filteredAndSortedPhotos.length);
      }
      if (e.key === "ArrowLeft") {
        setSlideshowIndex((prev) => (prev - 1 + filteredAndSortedPhotos.length) % filteredAndSortedPhotos.length);
      }
      if (e.key === "Escape") setSlideshowOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slideshowOpen, filteredAndSortedPhotos.length]);

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-2">
                {t('yourGallery')}
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 font-light">
                {filteredAndSortedPhotos.length} {filteredAndSortedPhotos.length === 1 ? t('photo') : t('photos')} {t('photosReady')}
              </p>
            </div>
            <Link to={createPageUrl("EditPhoto")}>
              <Button className="bg-black text-white hover:bg-gray-900 rounded-xl px-6 py-3 font-medium shadow-lg whitespace-nowrap">
                <Plus className="w-5 h-5 mr-2" />
                {t('editNewPhoto')}
              </Button>
            </Link>
          </div>
        </div>

        {photos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ImageIcon className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-black mb-3">
              {t('noPhotosYet')}
            </h3>
            <p className="text-gray-600 mb-8">
              {t('noPhotosDesc')}
            </p>
            <Link to={createPageUrl("EditPhoto")}>
              <Button className="bg-black text-white hover:bg-gray-900 rounded-xl px-8 py-4 text-lg font-medium">
                {t('editFirstPhoto')}
              </Button>
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Filters and Sort Controls */}
            <div className="mb-6 sm:mb-8 bg-white rounded-2xl shadow-lg p-4 sm:p-6">
              <div className="flex flex-col gap-4 sm:gap-6">
                {/* Filter Buttons */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      {t('filterByType') || 'Filter by Type'}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.map((option) => (
                      <Button
                        key={option.value}
                        onClick={() => setFilterType(option.value)}
                        variant={filterType === option.value ? "default" : "outline"}
                        className={`rounded-xl text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2 ${filterType === option.value
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                          : "border-2 border-gray-300 text-gray-700 hover:border-black hover:bg-gray-50"
                          }`}
                      >
                        <option.icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="hidden xs:inline">{option.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Sort and Slideshow Row */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {/* Sort Dropdown */}
                  <div className="flex-1 sm:max-w-xs">
                    <div className="flex items-center gap-2 mb-2">
                      <SortAsc className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        {t('sortBy') || 'Sort By'}
                      </h3>
                    </div>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="rounded-xl border-2 border-gray-300 h-10 sm:h-11 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="alphabetical">A-Z (Title)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Slideshow Button */}
                  {filteredAndSortedPhotos.length > 0 && (
                    <div className="flex items-end">
                      <Button
                        onClick={() => openSlideshow(0)}
                        className="w-full sm:w-auto bg-black text-white hover:bg-gray-900 rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 h-10 sm:h-11 font-medium text-sm"
                      >
                        <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        Slideshow
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Photos Grid */}
            {filteredAndSortedPhotos.length === 0 ? (
              <Card className="p-12 bg-white border-none shadow-lg rounded-2xl text-center">
                <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-black mb-2">
                  No photos match your filters
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filter settings
                </p>
                <Button
                  onClick={() => setFilterType("all")}
                  variant="outline"
                  className="rounded-xl"
                >
                  Clear Filters
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <AnimatePresence>
                  {filteredAndSortedPhotos.map((photo, index) => (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      layout
                    >
                      <Card className="overflow-hidden bg-white border-none shadow-lg rounded-2xl hover:shadow-2xl smooth-transition group">
                        <div
                          className="relative aspect-square bg-[#1A1A1A] overflow-hidden cursor-pointer"
                          onClick={() => openSlideshow(index)}
                        >
                          <img
                            src={photo.edited_url}
                            alt={photo.title}
                            className="w-full h-full object-cover group-hover:scale-105 smooth-transition"
                          />
                          {photo.ai_tool && (
                            <Badge className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-gradient-to-r from-[#E63946] to-[#FF6B6B] text-white border-none text-xs">
                              {photo.ai_tool === "visa-photo" && t('visaPhoto')}
                              {photo.ai_tool === "absher-photo" && t('absherPhotoMale')}
                              {photo.ai_tool === "absher-photo-female" && t('absherPhotoFemale')}
                              {photo.ai_tool === "saudi-look" && t('saudiLook')}
                              {photo.ai_tool === "baby-photo" && t('babyPhoto')}
                            </Badge>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 smooth-transition flex items-center justify-center">
                            <Play className="w-12 h-12 sm:w-16 sm:h-16 text-white opacity-0 group-hover:opacity-100 smooth-transition" />
                          </div>
                        </div>
                        <div className="p-4 sm:p-6">
                          <h3 className="text-base sm:text-lg font-semibold text-black mb-2 truncate">
                            {photo.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                            {photo.print_size} • {photo.price} {t('currency') || 'SAR'}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleAddToCart(photo)}
                              disabled={addToCartMutation.isPending}
                              className="flex-1 bg-black text-white hover:bg-gray-900 rounded-lg py-2.5 sm:py-3 font-medium smooth-transition text-sm"
                            >
                              {addToCartMutation.isPending ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  {t('adding')}
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="w-4 h-4 mr-2" />
                                  {t('addToCart')}
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                openShareDialog(photo);
                              }}
                              variant="outline"
                              className="border-2 border-gray-300 hover:border-black rounded-lg px-3"
                            >
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>

      {/* Removed Size Selection Dialog as per changes */}
      {/*
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{t('selectPrintSize')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedPhoto && (
              <div className="aspect-square rounded-xl overflow-hidden bg-[#1A1A1A]">
                <img
                  src={selectedPhoto.edited_url}
                  alt={selectedPhoto.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-2 block">{t('printSize')}</label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className="rounded-lg border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8x10">8" × 10" - $29.99</SelectItem>
                  <SelectItem value="11x14">11" × 14" - $49.99</SelectItem>
                  <SelectItem value="16x20">16" × 20" - $79.99</SelectItem>
                  <SelectItem value="24x36">24" × 36" - $129.99</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedPhoto(null)}
              className="rounded-lg"
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="bg-black text-white hover:bg-gray-900 rounded-lg"
            >
              {isAddingToCart ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('adding')}
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {t('addToCart')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      */}

      {/* Slideshow Dialog */}
      <Dialog open={slideshowOpen} onOpenChange={setSlideshowOpen}>
        <DialogContent className="max-w-7xl h-[90vh] p-0 bg-black border-none overflow-hidden">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <Button
              onClick={() => setSlideshowOpen(false)}
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Image Counter */}
            <div className="absolute top-4 left-4 z-50 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
              {slideshowIndex + 1} / {filteredAndSortedPhotos.length}
            </div>

            {/* Main Image */}
            <AnimatePresence mode="wait">
              {filteredAndSortedPhotos[slideshowIndex] && (
                <motion.div
                  key={slideshowIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full flex flex-col items-center justify-center p-8"
                >
                  <img
                    src={filteredAndSortedPhotos[slideshowIndex].edited_url}
                    alt={filteredAndSortedPhotos[slideshowIndex].title}
                    className="max-w-full max-h-[calc(100vh-200px)] object-contain rounded-xl"
                  />
                  <div className="mt-6 text-center">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {filteredAndSortedPhotos[slideshowIndex].title}
                    </h3>
                    {filteredAndSortedPhotos[slideshowIndex].ai_tool && ( // Changed from .editing_settings?.ai_style
                      <Badge className="bg-gradient-to-r from-[#E63946] to-[#FF6B6B] text-white border-none">
                        {filteredAndSortedPhotos[slideshowIndex].ai_tool === "visa-photo" && t('visaPhoto')}
                        {filteredAndSortedPhotos[slideshowIndex].ai_tool === "absher-photo" && t('absherPhotoMale')}
                        {filteredAndSortedPhotos[slideshowIndex].ai_tool === "absher-photo-female" && t('absherPhotoFemale')}
                        {filteredAndSortedPhotos[slideshowIndex].ai_tool === "saudi-look" && t('saudiLook')}
                        {filteredAndSortedPhotos[slideshowIndex].ai_tool === "baby-photo" && t('babyPhoto')}
                        {filteredAndSortedPhotos[slideshowIndex].ai_tool === "family-photo" && (language === 'ar' ? 'صورة العائلة' : 'Family Photo')}
                      </Badge>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            {filteredAndSortedPhotos.length > 1 && (
              <>
                <Button
                  onClick={prevSlide}
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  onClick={nextSlide}
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            {/* Action Buttons */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
              <Button
                onClick={() => {
                  handleAddToCart(filteredAndSortedPhotos[slideshowIndex]);
                }}
                disabled={addToCartMutation.isPending}
                className="bg-white text-black hover:bg-gray-100 rounded-xl px-6 py-3 font-medium shadow-xl"
              >
                {addToCartMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('adding')}
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {t('addToCart')}
                  </>
                )}
              </Button>
              <Button
                onClick={() => openShareDialog(filteredAndSortedPhotos[slideshowIndex])}
                variant="outline"
                className="bg-white/90 hover:bg-white rounded-xl px-6 py-3 font-medium shadow-xl"
              >
                <Share2 className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'مشاركة' : 'Share'}
              </Button>
            </div>

            {/* Thumbnail Strip */}
            <div className="absolute bottom-20 left-0 right-0 overflow-x-auto px-8">
              <div className="flex gap-2 justify-center min-w-max">
                {filteredAndSortedPhotos.map((photo, index) => (
                  <button
                    key={photo.id}
                    onClick={() => setSlideshowIndex(index)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 smooth-transition ${index === slideshowIndex
                      ? "border-white scale-110"
                      : "border-white/30 opacity-60 hover:opacity-100"
                      }`}
                  >
                    <img
                      src={photo.edited_url}
                      alt={photo.title}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {language === 'ar' ? 'مشاركة الصورة' : 'Share Photo'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {sharingPhoto && (
              <div className="aspect-square rounded-xl overflow-hidden bg-[#1A1A1A] mb-4">
                <img
                  src={sharingPhoto.edited_url}
                  alt={sharingPhoto.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <p className="text-sm text-gray-600 text-center">
              {language === 'ar'
                ? 'اختر منصة التواصل الاجتماعي للمشاركة'
                : 'Choose a social media platform to share'
              }
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => handleShare(sharingPhoto, 'facebook')}
                disabled={isGeneratingShare}
                className="w-full bg-[#1877F2] hover:bg-[#1565D8] text-white rounded-xl py-4 font-medium"
              >
                {isGeneratingShare ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                )}
                Facebook
              </Button>

              <Button
                onClick={() => handleShare(sharingPhoto, 'instagram')}
                disabled={isGeneratingShare}
                className="w-full bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 text-white rounded-xl py-4 font-medium"
              >
                {isGeneratingShare ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                )}
                Instagram
              </Button>

              <Button
                onClick={() => handleShare(sharingPhoto, 'linkedin')}
                disabled={isGeneratingShare}
                className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white rounded-xl py-4 font-medium"
              >
                {isGeneratingShare ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                )}
                LinkedIn
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              {language === 'ar'
                ? 'النص الترويجي: "هذه الصورة من إبداع ستديو الوليد، جرب صورتك الآن! www.alwaleed.pro"'
                : 'Promotional text: "This photo is created by Studio Alwaleed, Try your photo now! www.alwaleed.pro"'
              }
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}