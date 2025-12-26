import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingBag, Trash2, Minus, Plus, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useLanguage } from "../components/LanguageContext";
import PaymentOptions from "../components/PaymentOptions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Cart() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [shippingInfo, setShippingInfo] = useState(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  const VAT_RATE = 0.15; // 15% VAT

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      try {
        const user = await base44.auth.getUser();
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

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ['cartItems', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return [];
      return base44.entities.cart.getAll();
    },
    enabled: !!currentUser?.email,
    initialData: [],
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ id, quantity }) => base44.entities.cart.update(id, {
      quantity
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (id) => base44.entities.cart.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
    },
  });

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantityMutation.mutate({ id: itemId, quantity: newQuantity });
  };

  const handleRemoveItem = (itemId) => {
    removeItemMutation.mutate(itemId);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
  };

  const calculateShipping = () => {
    return cartItems.length > 0 ? 25 : 0; // 25 SAR shipping
  };

  const calculateVAT = () => {
    const subtotal = calculateSubtotal();
    const shipping = calculateShipping();
    return (subtotal + shipping) * VAT_RATE;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() + calculateVAT();
  };

  const mockBookingData = {
    firstName: currentUser?.full_name?.split(' ')[0] || '',
    lastName: currentUser?.full_name?.split(' ').slice(1).join(' ') || '',
    email: currentUser?.email || '',
    phone: '',
    address: '',
    bookingDate: new Date().toISOString().split('T')[0]
  };

  const mockPackageInfo = {
    title: t('shoppingCart'),
    titleEn: 'Shopping Cart',
    price: calculateTotal().toFixed(2)
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-2">
            {t('shoppingCart')}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 font-light">
            {cartItems.length} {cartItems.length === 1 ? t('item') : t('items')} {t('itemsInCart')}
          </p>
        </div>

        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-black mb-3">
              {t('cartEmpty')}
            </h3>
            <p className="text-gray-600 mb-8">
              {t('cartEmptyDesc')}
            </p>
            <Link to={createPageUrl("Gallery")}>
              <Button className="bg-black text-white hover:bg-gray-900 rounded-xl px-8 py-4 text-lg font-medium">
                {t('viewGallery')}
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Card className="p-4 bg-white border-none shadow-lg rounded-2xl">
                      <div className="flex gap-3 sm:gap-4">
                        {/* Image */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-[#1A1A1A] rounded-xl overflow-hidden">
                          <img
                            src={item.photo_url}
                            alt={item.photo_title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          {/* Title and Delete Button */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="text-base sm:text-lg font-semibold text-black truncate pr-2">
                              {item.photo_title}
                            </h3>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-gray-400 hover:text-red-600 flex-shrink-0 h-8 w-8"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Print Size */}
                          <p className="text-xs sm:text-sm text-gray-500 mb-3">
                            {t('printSize')}: {item.print_size}
                          </p>

                          {/* Quantity and Price Row */}
                          <div className="flex items-center justify-between gap-2">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="h-8 w-8 rounded-lg"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 sm:w-10 text-center font-medium text-sm">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="h-8 w-8 rounded-lg"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>

                            {/* Price */}
                            <span className="text-base sm:text-xl font-bold text-black whitespace-nowrap">
                              {item.total_price?.toFixed(2)} {t('currency') || 'SAR'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="p-6 bg-white border-none shadow-lg rounded-2xl sticky top-24">
                <h3 className="text-xl font-semibold text-black mb-6">
                  {t('orderSummary')}
                </h3>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>{t('subtotal')}</span>
                    <span className="font-medium">{calculateSubtotal().toFixed(2)} {t('currency') || 'SAR'}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{t('shipping')}</span>
                    <span className="font-medium">{calculateShipping().toFixed(2)} {t('currency') || 'SAR'}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{t('vat')} (15%)</span>
                    <span className="font-medium">{calculateVAT().toFixed(2)} {t('currency') || 'SAR'}</span>
                  </div>
                  <div className="h-px bg-gray-200" />
                  <div className="flex justify-between text-xl font-bold text-black">
                    <span>{t('total')}</span>
                    <span>{calculateTotal().toFixed(2)} {t('currency') || 'SAR'}</span>
                  </div>
                </div>
                <Button
                  onClick={() => setShowCheckout(true)}
                  className="w-full bg-black text-white hover:bg-gray-900 rounded-xl py-4 text-lg font-medium shadow-lg"
                >
                  {t('buyShipNow')}
                </Button>
                <p className="text-xs text-gray-500 text-center mt-4">
                  {t('secureCheckout')}
                </p>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={(open) => {
        setShowCheckout(open);
        if (!open) {
          setShowPaymentOptions(false);
          setShippingInfo(null);
        }
      }}>
        <DialogContent className="sm:max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {!showPaymentOptions ? t('shippingInformation') : t('buyShipNow')}
            </DialogTitle>
          </DialogHeader>

          {!showPaymentOptions ? (
            /* Shipping Information Form */
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const info = {
                fullName: formData.get('fullName'),
                phone: formData.get('phone'),
                addressLine1: formData.get('addressLine1'),
                addressLine2: formData.get('addressLine2') || '',
                city: formData.get('city'),
                state: formData.get('state') || '',
                postalCode: formData.get('postalCode'),
                country: formData.get('country')
              };
              setShippingInfo(info);
              setShowPaymentOptions(true);
            }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">{t('fullName')}</label>
                  <input
                    name="fullName"
                    type="text"
                    required
                    defaultValue={currentUser?.full_name || ''}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">{t('phone') || 'Phone Number'}</label>
                  <input
                    name="phone"
                    type="tel"
                    required
                    placeholder="+966XXXXXXXXX"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">{t('addressLine1')}</label>
                  <input
                    name="addressLine1"
                    type="text"
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">{t('addressLine2')} ({t('optional') || 'Optional'})</label>
                  <input
                    name="addressLine2"
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('city')}</label>
                  <input
                    name="city"
                    type="text"
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('state')}</label>
                  <input
                    name="state"
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('postalCode')}</label>
                  <input
                    name="postalCode"
                    type="text"
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('country')}</label>
                  <input
                    name="country"
                    type="text"
                    required
                    defaultValue="Saudi Arabia"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-black text-white hover:bg-gray-900 rounded-xl py-3"
              >
                {t('continueToPayment') || 'Continue to Payment'}
              </Button>
            </form>
          ) : (
            /* Payment Options */
            <PaymentOptions
              bookingData={{
                firstName: shippingInfo?.fullName?.split(' ')[0] || '',
                lastName: shippingInfo?.fullName?.split(' ').slice(1).join(' ') || '',
                email: currentUser?.email || '',
                phone: shippingInfo?.phone || '',
                address: `${shippingInfo?.addressLine1}, ${shippingInfo?.addressLine2 ? shippingInfo.addressLine2 + ', ' : ''}${shippingInfo?.city}, ${shippingInfo?.postalCode}, ${shippingInfo?.country}`,
                bookingDate: new Date().toISOString().split('T')[0]
              }}
              packageInfo={{
                title: t('shoppingCart'),
                titleEn: 'Shopping Cart',
                price: calculateTotal().toFixed(2)
              }}
              items={cartItems}
              onBack={() => setShowPaymentOptions(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}