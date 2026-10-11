/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardList,
  Copy,
  Globe,
  LogOut,
  Mail,
  Phone,
  Shield,
  User,
  X,
} from 'lucide-react';
import { RimPhoneProvider, useRimPhone } from './context/RimPhoneContext';
import { RECEIVER_PHONE_NUMBER } from './data/catalog';
import {
  CountryCode,
  PlanDuration,
  SocialPlatformId,
  VirtualOrder,
} from './types/rimphone';
import { StorefrontWorkspace } from './components/store/StorefrontWorkspace';
import { PlatformBrandIcon } from './components/store/PlatformBrandIcon';
import { UserOrdersPanel } from './components/store/UserOrdersPanel';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { AuthModal } from './components/auth/AuthModal';
import { AdminControlDashboard } from './components/admin/AdminControlDashboard';
import { PWAInstallButton } from './components/PWAInstallButton';

const RimPhoneShell: React.FC = () => {
  const {
    lang,
    setLang,
    isRtl,
    currentUser,
    isAdmin,
    logoutUser,
    lastDispatchedEmail,
    dismissEmailBanner,
    orders,
    unreadNotificationsCount,
  } = useRimPhone();

  const [activeView, setActiveView] = useState<'store' | 'admin'>('store');
  const [selectedPlatform, setSelectedPlatform] =
    useState<SocialPlatformId>('whatsapp');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('CA');
  const [selectedPlan, setSelectedPlan] = useState<PlanDuration>('weekly');

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>(
    'login'
  );
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrdersDrawerOpen, setIsOrdersDrawerOpen] = useState(false);
  const [pendingCheckoutAfterAuth, setPendingCheckoutAfterAuth] =
    useState(false);
  const [recentOrderToast, setRecentOrderToast] =
    useState<VirtualOrder | null>(null);
  const [copiedBannerOtp, setCopiedBannerOtp] = useState(false);

  // Automatically switch out of admin view if user logs out or is not an admin
  useEffect(() => {
    if (activeView === 'admin' && !isAdmin) {
      setActiveView('store');
    }
  }, [isAdmin, activeView]);

  // Automatically direct verified Admin to the Admin Console upon signing in
  useEffect(() => {
    if (isAdmin) {
      setActiveView('admin');
    }
  }, [isAdmin]);

  const handleSelectPlan = (country: CountryCode, plan: PlanDuration) => {
    setSelectedCountry(country);
    setSelectedPlan(plan);
  };

  const handleProceedToCheckout = () => {
    if (!currentUser) {
      setPendingCheckoutAfterAuth(true);
      setAuthInitialMode('signup');
      setIsAuthModalOpen(true);
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleAuthSuccess = () => {
    if (pendingCheckoutAfterAuth) {
      setPendingCheckoutAfterAuth(false);
      setIsCheckoutOpen(true);
    }
  };

  const handleOrderCreated = (order: VirtualOrder) => {
    setRecentOrderToast(order);
    setIsOrdersDrawerOpen(true);
    setTimeout(() => {
      setRecentOrderToast((prev) => (prev?.id === order.id ? null : prev));
    }, 6500);
  };

  const userOrderCount = currentUser
    ? orders.filter(
        (o) =>
          o.userId === currentUser.id ||
          o.userEmail.toLowerCase() === currentUser.email.toLowerCase()
      ).length
    : 0;

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#0C0A09] text-[#FAFAF9] flex flex-col justify-between selection:bg-orange-500 selection:text-stone-950"
    >
      <div>
        {/* Top Bar Header — Relies exclusively on the Header "طلباتي" tab (no floating side button) */}
        <header className="sticky top-0 z-40 bg-[#0C0A09]/95 backdrop-blur-md border-b border-stone-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
            {/* Brand Zone: Rim phone 🇲🇷 */}
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                setActiveView('store');
              }}
              className="text-lg sm:text-xl font-extrabold tracking-tight text-white font-display whitespace-nowrap shrink-0 flex items-center gap-2"
            >
              <span>Rim phone 🇲🇷</span>
            </a>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-300">
              <a
                href="#storefront"
                onClick={() => setActiveView('store')}
                className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
              >
                {lang === 'ar' ? 'تصفح الأرقام' : 'Browse Numbers'}
              </a>
              <a
                href="#country-pricing"
                onClick={() => setActiveView('store')}
                className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
              >
                {lang === 'ar' ? 'الباقات والأسعار' : 'Pricing Plans'}
              </a>
              <button
                type="button"
                onClick={() => setIsOrdersDrawerOpen(true)}
                className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <ClipboardList className="w-4 h-4 text-orange-400" />
                <span>
                  {lang === 'ar'
                    ? `طلباتي (${userOrderCount})`
                    : `My Orders (${userOrderCount})`}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-orange-400" />
                <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
              </button>
            </nav>

            {/* Primary Actions (Language, Store, My Orders Tab, Account / Admin) */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              <PWAInstallButton />
              {/* Language Switcher on Mobile */}
              <button
                type="button"
                onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                className="md:hidden px-2.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs font-semibold text-stone-200 transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
              >
                <Globe className="w-3.5 h-3.5 text-orange-400" />
                <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
              </button>

              {/* Header Tab: طلباتي (My Orders) — Primary & sole trigger in the header bar */}
              <button
                type="button"
                onClick={() => setIsOrdersDrawerOpen(true)}
                className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-orange-500/50 text-xs font-bold text-amber-300 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-sm cursor-pointer"
              >
                <ClipboardList className="w-3.5 h-3.5 text-orange-400" />
                <span>{lang === 'ar' ? 'طلباتي' : 'My Orders'}</span>
                <span className="px-1.5 py-0.5 rounded-md bg-orange-500/20 border border-orange-500/40 font-mono-tabular text-[11px] text-amber-300">
                  {unreadNotificationsCount > 0
                    ? unreadNotificationsCount
                    : userOrderCount}
                </span>
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveView(activeView === 'admin' ? 'store' : 'admin')
                  }
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                    activeView === 'admin'
                      ? 'bg-amber-400 text-stone-950'
                      : 'bg-stone-900 border border-amber-500/40 text-amber-400 hover:bg-stone-800'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>
                    {activeView === 'admin'
                      ? lang === 'ar'
                        ? 'العودة للمتجر'
                        : 'Storefront'
                      : lang === 'ar'
                      ? 'لوحة الإدارة'
                      : 'Admin Panel'}
                  </span>
                </button>
              )}

              {currentUser ? (
                <div className="flex items-center gap-1.5">
                  <span className="hidden lg:inline-block text-xs text-stone-300 font-medium max-w-[130px] truncate">
                    {currentUser.fullName}
                  </span>
                  <button
                    type="button"
                    onClick={logoutUser}
                    className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-white transition-colors"
                    title={lang === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAuthInitialMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-stone-950 font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-md shadow-orange-500/15 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Dispatched Gmail OTP Notification Bar */}
        {lastDispatchedEmail && (
          <div className="bg-[#181310] border-b border-orange-500/50 px-4 py-3 shadow-lg">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2.5 text-stone-200">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white text-stone-900 font-bold text-[11px] shadow-sm">
                  <Mail className="w-3.5 h-3.5 text-red-600" />
                  <span>Gmail</span>
                </span>
                <span>
                  {lang === 'ar' ? (
                    <>
                      تم إرسال رمز التحقق (OTP) إلى بريد المستخدم{' '}
                      <strong className="text-amber-400">
                        {lastDispatchedEmail.to}
                      </strong>{' '}
                      — الكود المرسل:{' '}
                    </>
                  ) : (
                    <>
                      Gmail Verification Code Dispatched to{' '}
                      <strong className="text-amber-400">
                        {lastDispatchedEmail.to}
                      </strong>{' '}
                      — OTP Code:{' '}
                    </>
                  )}
                </span>
                <span
                  dir="ltr"
                  className="font-mono-tabular font-bold text-sm tracking-widest text-amber-300 px-2.5 py-0.5 rounded bg-stone-950 border border-amber-500/40"
                >
                  {lastDispatchedEmail.otpCode}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(lastDispatchedEmail.otpCode);
                    setCopiedBannerOtp(true);
                    setTimeout(() => setCopiedBannerOtp(false), 1800);
                  }}
                  className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center gap-1 text-[11px]"
                >
                  {copiedBannerOtp ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-amber-400" />
                      <span>{lang === 'ar' ? 'تم النسخ' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-orange-400" />
                      <span>{lang === 'ar' ? 'نسخ الرمز' : 'Copy'}</span>
                    </>
                  )}
                </button>
              </div>
              <button
                type="button"
                onClick={dismissEmailBanner}
                className="text-stone-400 hover:text-white flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                {lang === 'ar' ? 'إغلاق' : 'Dismiss'}
              </button>
            </div>
          </div>
        )}

        {/* Order Submitted Confirmation Banner */}
        {recentOrderToast && (
          <div className="bg-orange-950/70 border-b border-orange-500/40 px-4 py-3">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-amber-200">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {lang === 'ar' ? (
                    <>
                      تم إرسال طلبك رقم <strong>{recentOrderToast.id}</strong> (
                      {recentOrderToast.platformArabicName} ·{' '}
                      {recentOrderToast.countryArabicName}) بنجاح عبر{' '}
                      {recentOrderToast.paymentMethodArabicName}! حالة الطلب:{' '}
                      <strong>قيد مراجعة الإدارة</strong>.
                    </>
                  ) : (
                    <>
                      Order <strong>{recentOrderToast.id}</strong> submitted!
                      Status: <strong>Pending Verification</strong>.
                    </>
                  )}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setRecentOrderToast(null)}
                className="text-amber-300 hover:text-white"
              >
                {lang === 'ar' ? 'إغلاق' : 'Dismiss'}
              </button>
            </div>
          </div>
        )}

        {/* Main View vs Admin Console */}
        {activeView === 'admin' && isAdmin ? (
          <AdminControlDashboard />
        ) : (
          <main id="top">
            {/* Hero Section with Highlighted Tactile App Buttons (WhatsApp, Telegram, Twitter X) */}
            <section className="relative overflow-hidden border-b border-stone-800/80 bg-gradient-to-b from-[#16120E] to-[#0C0A09] py-10 sm:py-14">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400">
                  <span>🇲🇷</span>
                  <span>
                    {lang === 'ar'
                      ? 'المنصة الموريتانية الأولى للأرقام الكندية والأمريكية'
                      : 'Mauritania’s #1 Canadian & US Virtual Numbers Platform'}
                  </span>
                  <span>·</span>
                  <span dir="ltr" className="font-mono-tabular text-orange-400">
                    {RECEIVER_PHONE_NUMBER}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight max-w-3xl mx-auto leading-tight">
                  {lang === 'ar'
                    ? 'أرقام كندية 🇨🇦 وأمريكية 🇺🇸 لتفعيل واتساب وتيليجرام وتويتر X في دقائق'
                    : 'Instant Canadian 🇨🇦 & US 🇺🇸 Virtual Numbers for WhatsApp, Telegram & Twitter X'}
                </h1>

                <p className="text-sm sm:text-base text-stone-300 max-w-2xl mx-auto leading-relaxed">
                  {lang === 'ar'
                    ? 'اختر التطبيق المطلوب وحدد باقتك الأسبوعية أو الشهرية، وادفع محلياً بالأوقية الجديدة (MRU) عبر بنكيلي أو مصرفي أو سداد لتستلم رقمك وكود الـ SMS داخل المنصة فوراً.'
                    : 'Choose your target app and Weekly or Monthly plan, pay locally in MRU via Bankily, Masrvi, or Sedad, and receive your number and SMS code directly inside the platform.'}
                </p>

                {/* Quick-Select App Buttons with Clear Active Borders, Colors & Selection Checkmarks */}
                <div className="pt-2 max-w-2xl mx-auto space-y-2.5">
                  <span className="text-xs font-bold text-stone-300 block">
                    {lang === 'ar'
                      ? 'اضغط على التطبيق لاختياره فوراً:'
                      : 'Tap an application to select it:'}
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* WhatsApp Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlatform('whatsapp');
                        document
                          .getElementById('country-pricing')
                          ?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                        selectedPlatform === 'whatsapp'
                          ? 'border-[#25D366] bg-[#25D366]/15 shadow-lg shadow-[#25D366]/15 ring-1 ring-[#25D366]/50'
                          : 'border-[#25D366]/55 bg-[#25D366]/10 hover:border-[#25D366] hover:bg-[#25D366]/15'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <PlatformBrandIcon platformId="whatsapp" size="md" />
                        <div className="text-start">
                          <span className="text-xs sm:text-sm font-bold text-white block">
                            WhatsApp
                          </span>
                          <span className="text-[11px] text-[#4ADE80] font-medium block">
                            {lang === 'ar' ? 'واتساب · مفعل' : 'Active'}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                          selectedPlatform === 'whatsapp'
                            ? 'bg-amber-400 text-stone-950'
                            : 'border border-stone-600 text-stone-500'
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    </button>

                    {/* Telegram Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlatform('telegram');
                        document
                          .getElementById('country-pricing')
                          ?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                        selectedPlatform === 'telegram'
                          ? 'border-[#38BDF8] bg-[#229ED9]/15 shadow-lg shadow-[#229ED9]/15 ring-1 ring-[#38BDF8]/50'
                          : 'border-[#38BDF8]/55 bg-[#229ED9]/10 hover:border-[#38BDF8] hover:bg-[#229ED9]/15'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <PlatformBrandIcon platformId="telegram" size="md" />
                        <div className="text-start">
                          <span className="text-xs sm:text-sm font-bold text-white block">
                            Telegram
                          </span>
                          <span className="text-[11px] text-[#38BDF8] font-medium block">
                            {lang === 'ar' ? 'تيليجرام · مفعل' : 'Active'}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                          selectedPlatform === 'telegram'
                            ? 'bg-amber-400 text-stone-950'
                            : 'border border-stone-600 text-stone-500'
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    </button>

                    {/* Twitter X Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlatform('twitter');
                        document
                          .getElementById('country-pricing')
                          ?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                        selectedPlatform === 'twitter'
                          ? 'border-amber-400 bg-amber-500/15 shadow-lg shadow-amber-500/15 ring-1 ring-amber-400/50'
                          : 'border-amber-400/55 bg-amber-500/10 hover:border-amber-400 hover:bg-amber-500/15'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <PlatformBrandIcon platformId="twitter" size="md" />
                        <div className="text-start">
                          <span className="text-xs sm:text-sm font-bold text-white block">
                            Twitter X
                          </span>
                          <span className="text-[11px] text-amber-300 font-medium block">
                            {lang === 'ar' ? 'تويتر X · مفعل' : 'Active'}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                          selectedPlatform === 'twitter'
                            ? 'bg-amber-400 text-stone-950'
                            : 'border border-stone-600 text-stone-500'
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    </button>
                  </div>
                </div>

                {/* Primary Hero CTAs */}
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <a
                    href="#country-pricing"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-stone-950 font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20"
                  >
                    <Phone className="w-4 h-4" />
                    <span>
                      {lang === 'ar'
                        ? 'عرض بطاقات الدول والأسعار'
                        : 'View Countries & Pricing'}
                    </span>
                    {isRtl ? (
                      <ArrowLeft className="w-4 h-4" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </a>
                  <button
                    type="button"
                    onClick={() => setIsOrdersDrawerOpen(true)}
                    className="px-5 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <ClipboardList className="w-4 h-4 text-orange-400" />
                    <span>
                      {lang === 'ar'
                        ? `طلباتي وصندوق الـ SMS (${userOrderCount})`
                        : `My Orders & SMS Inbox (${userOrderCount})`}
                    </span>
                  </button>
                </div>
              </div>
            </section>

            {/* Interactive Storefront Configurator */}
            <StorefrontWorkspace
              selectedPlatform={selectedPlatform}
              onSelectPlatform={setSelectedPlatform}
              selectedCountry={selectedCountry}
              onSelectCountry={setSelectedCountry}
              selectedPlan={selectedPlan}
              onSelectPlan={handleSelectPlan}
              onProceedToCheckout={handleProceedToCheckout}
            />
          </main>
        )}
      </div>

      {/* Slide-Over Drawer for User Orders & Historical SMS Log (Opened from Header Bar "طلباتي") */}
      <UserOrdersPanel
        isOpen={isOrdersDrawerOpen}
        onClose={() => setIsOrdersDrawerOpen(false)}
        onNewOrderClick={() => {
          setActiveView('store');
          document
            .getElementById('storefront')
            ?.scrollIntoView({ behavior: 'smooth' });
        }}
        onRequireLogin={() => {
          setAuthInitialMode('login');
          setIsAuthModalOpen(true);
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingCheckoutAfterAuth(false);
        }}
        initialMode={authInitialMode}
        onSuccess={handleAuthSuccess}
      />

      {/* Local Payment Gateway Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        platformId={selectedPlatform}
        countryCode={selectedCountry}
        planDuration={selectedPlan}
        onOrderCreated={handleOrderCreated}
      />

      {/* Footer */}
      <footer className="border-t border-stone-800/80 bg-[#0C0A09] py-6 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Rim phone 🇲🇷</span>
            <span>·</span>
            <span>
              {lang === 'ar'
                ? 'منصة الأرقام الافتراضية الكندية والأمريكية في موريتانيا'
                : 'Canadian & US Virtual Numbers Platform in Mauritania'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>
              {lang === 'ar' ? 'حساب الدفع الرسمي:' : 'Official Receiver:'}{' '}
              <strong dir="ltr" className="font-mono-tabular text-amber-400">
                {RECEIVER_PHONE_NUMBER}
              </strong>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <RimPhoneProvider>
      <RimPhoneShell />
    </RimPhoneProvider>
  );
}
