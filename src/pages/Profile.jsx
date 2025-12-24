import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Package, Loader2, LogOut, CheckCircle2, Truck, Box, Image, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useLanguage } from "../components/LanguageContext";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Profile() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.getUser();
        if (mounted) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        if (mounted) {
          setIsLoadingUser(false);
        }
      }
    };
    fetchUser();

    return () => {
      mounted = false;
    };
  }, []);

  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['orders', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.orders.getAll();
    },
    enabled: !!user?.email
  });

  const { data: photos = [] } = useQuery({
    queryKey: ['photos', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.photos.getAll();
    },
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: cartItems = [] } = useQuery({
    queryKey: ['cartItems', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.cart.getAll();
    },
    enabled: !!user?.email,
    initialData: [],
  });

  const handleLogout = async () => {
    try {
      await base44.auth.signOut();
      navigate('/Login');
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if error, try to redirect
      navigate('/Login');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "processing":
        return <Package className="w-5 h-5" />;
      case "paid":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "shipped":
        return <Truck className="w-5 h-5" />;
      case "delivered":
        return <CheckCircle2 className="w-5 h-5" />;
      default:
        return <Box className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-8 bg-white border-none shadow-lg rounded-2xl mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-24 h-24 bg-black rounded-2xl flex items-center justify-center flex-shrink-0">
                <User className="w-12 h-12 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-black mb-2">
                  {user?.full_name || "User"}
                </h1>
                <p className="text-gray-600 mb-1">{user?.email}</p>
                <Badge variant="outline" className="mt-2">
                  {user?.role === "admin" ? t('administrator') : t('member')}
                </Badge>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-2 border-black text-black hover:bg-black hover:text-white rounded-xl px-6 py-3 font-medium"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t('signOut')}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Quick Access Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link to={createPageUrl("Gallery")}>
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-none shadow-lg rounded-2xl hover:shadow-xl transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Image className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-black">{t('gallery')}</h3>
                  </div>
                  <p className="text-gray-600 text-sm">{photos.length} {t('photos')}</p>
                </div>
                <div className="text-3xl font-black text-purple-600">→</div>
              </div>
            </Card>
          </Link>

          <Link to={createPageUrl("Cart")}>
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-none shadow-lg rounded-2xl hover:shadow-xl transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ShoppingCart className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-black">{t('cart')}</h3>
                  </div>
                  <p className="text-gray-600 text-sm">{cartItems.length} {t('items')}</p>
                </div>
                <div className="text-3xl font-black text-green-600">→</div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Orders Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-black mb-6">{t('orderHistory')}</h2>

          {isLoadingOrders ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-black" />
            </div>
          ) : orders.length === 0 ? (
            <Card className="p-12 bg-white border-none shadow-lg rounded-2xl text-center">
              <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">
                {t('noOrders')}
              </h3>
              <p className="text-gray-600">
                {t('noOrdersDesc')}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-6 bg-white border-none shadow-lg rounded-2xl hover:shadow-xl smooth-transition">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <h3 className="text-xl font-semibold text-black">
                            {t('order')} #{order.order_number}
                          </h3>
                          <Badge className={`border ${getStatusColor(order.status)}`}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(order.status)}
                              {t(order.status || 'processing')}
                            </span>
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <p>
                            <span className="font-medium text-black">{t('orderDate')}:</span>{" "}
                            {order.order_date ? format(new Date(order.order_date), "MMMM d, yyyy") : "N/A"}
                          </p>
                          <p>
                            <span className="font-medium text-black">{t('totalAmount')}:</span>{" "}
                            {order.total_amount?.toFixed(2)} {t('currency') || 'SAR'}
                          </p>
                          {order.tracking_number && (
                            <p>
                              <span className="font-medium text-black">{t('tracking')}:</span>{" "}
                              {order.tracking_number}
                            </p>
                          )}
                          <p>
                            <span className="font-medium text-black">{t('shippingAddress')}:</span>{" "}
                            {order.shipping_address?.address_line1}, {order.shipping_address?.city},{" "}
                            {order.shipping_address?.postal_code}, {order.shipping_address?.country}
                          </p>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-2">
                          <p className="font-medium text-black text-sm">{t('itemsLabel')}</p>
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-[#F5F5F7] rounded-lg">
                              <div className="w-16 h-16 bg-black rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={item.photo_url}
                                  alt={item.photo_title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-black text-sm">{item.photo_title}</p>
                                <p className="text-xs text-gray-500">
                                  {item.print_size} • {t('qty')}: {item.quantity} • {item.price?.toFixed(2)} {t('currency') || 'SAR'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}