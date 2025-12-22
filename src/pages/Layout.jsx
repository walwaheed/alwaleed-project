
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Menu, X, ShoppingCart, User, Image, Home, Sparkles, Instagram, Twitter, Mail, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { LanguageProvider, useLanguage } from "@/components/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";

function LayoutContent({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const { t, isRTL, language } = useLanguage();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await base44.auth.getUser();
        setIsAuthenticated(!!user);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, [location.pathname]);

  const { data: cartItems = [] } = useQuery({
    queryKey: ['cartItems'],
    queryFn: () => base44.entities.cart.getAll(),
    initialData: [],
    staleTime: 30000,
    refetchOnWindowFocus: false,
    enabled: isAuthenticated, // Only fetch cart if authenticated
  });

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  // Show different nav items based on auth status
  const navigationItems = isAuthenticated ? [
    { name: t('home'), path: createPageUrl("Home"), icon: Home },
    { name: t('editPhoto'), path: createPageUrl("EditPhoto"), icon: Sparkles },
    { name: language === 'ar' ? 'منتجات الطباعة' : 'Print Products', path: createPageUrl("PrintProducts"), icon: Image },
    { name: language === 'ar' ? 'الباقات' : 'Pricing', path: createPageUrl("Pricing"), icon: Star },
    { name: t('profile'), path: createPageUrl("Profile"), icon: User, badge: cartCount },
  ] : [
    { name: t('home'), path: createPageUrl("Home"), icon: Home },
    { name: language === 'ar' ? 'الباقات' : 'Pricing', path: createPageUrl("Pricing"), icon: Star },
  ];

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  const logoUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690011e6637df3b25a370af7/c39b6225f_Waleed-logo.png";

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        :root {
          --color-primary: #4F46E5;
          --color-secondary: #7C3AED;
          --color-accent: #06B6D4;
          --color-background: #FFFFFF;
          --color-surface: #F9FAFB;
          --color-border: #E5E7EB;
        }
        
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif;
        }

        [dir="rtl"] {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
        }

        .smooth-transition {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hover-lift:hover {
          transform: translateY(-2px);
        }

        .glass-effect {
          backdrop-filter: blur(20px) saturate(180%);
          background-color: rgba(255, 255, 255, 0.72);
        }
      `}</style>

      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to={createPageUrl("Home")} className="flex items-center hover:opacity-80 smooth-transition">
              <img
                src={logoUrl}
                alt="Alwaleed Studio"
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative px-4 py-2 rounded-xl text-sm font-semibold smooth-transition ${location.pathname === item.path
                    ? "text-black bg-gray-100"
                    : "text-gray-600 hover:text-black hover:bg-gray-50"
                    }`}
                >
                  <span className="flex items-center gap-2">
                    <item.icon className="w-4 h-4" />
                    {item.name}
                    {item.badge > 0 && (
                      <span className={`absolute ${isRTL ? '-left-1' : '-right-1'} -top-1 bg-gradient-to-r from-[#E63946] to-[#FF6B6B] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold`}>
                        {item.badge}
                      </span>
                    )}
                  </span>
                </Link>
              ))}
              <LanguageToggle />
              {!isAuthenticated && (
                <Link to={createPageUrl("Login")}>
                  <Button className="bg-black text-white hover:bg-gray-900 rounded-xl px-4 py-2 ml-2">
                    {t('signIn') || 'Sign In'}
                  </Button>
                </Link>
              )}
            </nav>

            <div className="md:hidden flex items-center gap-2">
              <LanguageToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold smooth-transition ${location.pathname === item.path
                    ? "bg-gradient-to-r from-[#E63946] to-[#FF6B6B] text-white"
                    : "text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <span className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </span>
                  {item.badge > 0 && (
                    <span className="bg-white text-black text-xs px-2 py-1 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="pt-16">
        {children}
      </main>

      {/* Footer - Simplified */}
      <footer className="bg-[#1A1A2E] text-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12 text-center md:text-left">
            {/* Brand */}
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center justify-center md:justify-start mb-4">
                <img
                  src={logoUrl}
                  alt="Alwaleed Studio"
                  className="h-12 w-auto object-contain brightness-0 invert"
                />
              </div>
              <p className="text-gray-400 mb-4 max-w-sm">
                {t('footerDescription')}
              </p>
              <div className="flex items-center justify-center md:justify-start gap-3">
                <a
                  href="https://www.instagram.com/studio_alwaleed"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center smooth-transition"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="mailto:waleed@alwaleed.pro"
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center smooth-transition"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="font-bold text-white mb-4">{t('product')}</h3>
              <ul className="space-y-2">
                <li><Link to={createPageUrl("EditPhoto")} className="text-gray-400 hover:text-white smooth-transition">{t('editPhotos')}</Link></li>
                <li><Link to={createPageUrl("Gallery")} className="text-gray-400 hover:text-white smooth-transition">{t('gallery')}</Link></li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="font-bold text-white mb-4">{t('company') || 'Company'}</h3>
              <ul className="space-y-2">
                <li>
                  <Link to={createPageUrl("About")} className="text-gray-400 hover:text-white smooth-transition">
                    {t('aboutUs') || 'About Us'}
                  </Link>
                </li>
                <li><Link to={createPageUrl("Profile")} className="text-gray-400 hover:text-white smooth-transition">{t('profile')}</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-bold text-white mb-4">{t('legal')}</h3>
              <ul className="space-y-2">
                <li>
                  <Link to={createPageUrl("Privacy")} className="text-gray-400 hover:text-white smooth-transition">
                    {t('privacyPolicy')}
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl("Returns")} className="text-gray-400 hover:text-white smooth-transition">
                    {t('returnPolicy')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar - Centered */}
          <div className="pt-8 border-t border-white/10">
            <div className="text-sm text-gray-400 text-center">
              © 2025 Alwaleed Studio. {t('allRightsReserved')}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <LanguageProvider>
      <LayoutContent children={children} currentPageName={currentPageName} />
    </LanguageProvider>
  );
}
