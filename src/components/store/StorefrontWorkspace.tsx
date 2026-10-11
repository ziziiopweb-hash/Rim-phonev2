import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  PhoneCall,
  ShieldCheck,
} from 'lucide-react';
import {
  COUNTRIES_CATALOG,
  RECEIVER_PHONE_NUMBER,
  SOCIAL_PLATFORMS,
} from '../../data/catalog';
import {
  CountryCode,
  PlanDuration,
  SocialPlatformId,
} from '../../types/rimphone';
import { useRimPhone } from '../../context/RimPhoneContext';
import { PlatformBrandIcon } from './PlatformBrandIcon';

interface StorefrontWorkspaceProps {
  selectedPlatform: SocialPlatformId;
  onSelectPlatform: (id: SocialPlatformId) => void;
  selectedCountry: CountryCode;
  onSelectCountry: (code: CountryCode) => void;
  selectedPlan: PlanDuration;
  onSelectPlan: (country: CountryCode, plan: PlanDuration) => void;
  onProceedToCheckout: () => void;
}

const FEATURED_APPS: {
  id: SocialPlatformId;
  titleAr: string;
  titleEn: string;
  badgeAr: string;
  badgeEn: string;
  activeClass: string;
  idleClass: string;
  badgeClass: string;
}[] = [
  {
    id: 'whatsapp',
    titleAr: 'واتساب (WhatsApp)',
    titleEn: 'WhatsApp',
    badgeAr: 'الأكثر طلباً · مفعل',
    badgeEn: 'Most Popular · Active',
    activeClass:
      'border-[#25D366] bg-[#25D366]/15 shadow-lg shadow-[#25D366]/15 ring-1 ring-[#25D366]/50',
    idleClass:
      'border-[#25D366]/50 bg-[#25D366]/10 hover:border-[#25D366] hover:bg-[#25D366]/15',
    badgeClass: 'text-[#4ADE80]',
  },
  {
    id: 'telegram',
    titleAr: 'تيليجرام (Telegram)',
    titleEn: 'Telegram',
    badgeAr: 'كود فوري · مفعل',
    badgeEn: 'Instant OTP · Active',
    activeClass:
      'border-[#38BDF8] bg-[#229ED9]/15 shadow-lg shadow-[#229ED9]/15 ring-1 ring-[#38BDF8]/50',
    idleClass:
      'border-[#38BDF8]/50 bg-[#229ED9]/10 hover:border-[#38BDF8] hover:bg-[#229ED9]/15',
    badgeClass: 'text-[#38BDF8]',
  },
  {
    id: 'twitter',
    titleAr: 'تويتر إكس (Twitter X)',
    titleEn: 'Twitter X',
    badgeAr: 'تفعيل وتوثيق X · مفعل',
    badgeEn: 'X Verification · Active',
    activeClass:
      'border-amber-400 bg-amber-500/15 shadow-lg shadow-amber-500/15 ring-1 ring-amber-400/50',
    idleClass:
      'border-amber-400/50 bg-amber-500/10 hover:border-amber-400 hover:bg-amber-500/15',
    badgeClass: 'text-amber-300',
  },
];

export const StorefrontWorkspace: React.FC<StorefrontWorkspaceProps> = ({
  selectedPlatform,
  onSelectPlatform,
  selectedCountry,
  onSelectCountry,
  selectedPlan,
  onSelectPlan,
  onProceedToCheckout,
}) => {
  const { lang, isRtl } = useRimPhone();

  const activePlatform =
    SOCIAL_PLATFORMS.find((p) => p.id === selectedPlatform) ||
    SOCIAL_PLATFORMS[0];
  const activeCountry = COUNTRIES_CATALOG[selectedCountry];
  const activePlanDetails = activeCountry.plans[selectedPlan];

  return (
    <section
      id="storefront"
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
    >
      {/* STEP 1: Target Platform Selector with Tactile Highlighted Buttons & Selection Checkmarks */}
      <div className="bg-[#141210] border border-stone-800 rounded-2xl p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-stone-800">
          <div className="text-center sm:text-start">
            <span className="text-xs font-bold text-orange-400">
              {lang === 'ar'
                ? '01. اختر التطبيق المطلوب تفعيله'
                : '01. Select Target Application'}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
              {lang === 'ar'
                ? 'اضغط على التطبيق لتحديده (WhatsApp · Telegram · Twitter X)'
                : 'Tap an Application to Select It (WhatsApp · Telegram · Twitter X)'}
            </h2>
          </div>
          <div className="flex items-center justify-center sm:justify-end gap-2">
            <label
              htmlFor="platform-dropdown"
              className="text-xs text-stone-400 whitespace-nowrap"
            >
              {lang === 'ar' ? 'القائمة الكاملة:' : 'All Apps:'}
            </label>
            <select
              id="platform-dropdown"
              value={selectedPlatform}
              onChange={(e) =>
                onSelectPlatform(e.target.value as SocialPlatformId)
              }
              className="bg-stone-900 border border-stone-700 text-xs font-medium text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
            >
              {SOCIAL_PLATFORMS.map((p) => (
                <option key={p.id} value={p.id}>
                  {lang === 'ar'
                    ? `${p.arabicName} (${p.name})`
                    : `${p.name} (${p.arabicName})`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Featured Primary Apps (WhatsApp, Telegram, Twitter X) — All 3 clearly highlighted with solid borders & active checkmarks */}
        <div className="mt-5">
          <div className="text-xs font-semibold text-amber-400 mb-3 flex flex-wrap items-center justify-between gap-2">
            <span>
              {lang === 'ar'
                ? 'التطبيقات الرئيسية المتاحة للتفعيل الفوري:'
                : 'Primary Instant-Activation Apps:'}
            </span>
            <span className="text-stone-300 font-medium">
              {lang === 'ar' ? (
                <>
                  التطبيق المحدد حالياً:{' '}
                  <strong className="text-amber-400">
                    {activePlatform.arabicName}
                  </strong>
                </>
              ) : (
                <>
                  Currently Selected:{' '}
                  <strong className="text-amber-400">
                    {activePlatform.name}
                  </strong>
                </>
              )}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {FEATURED_APPS.map((item) => {
              const isSelected = selectedPlatform === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectPlatform(item.id)}
                  className={`p-4 rounded-2xl border-2 text-start transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected ? item.activeClass : item.idleClass
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <PlatformBrandIcon platformId={item.id} size="lg" />
                    <div className="min-w-0">
                      <span className="text-sm font-bold text-white block truncate">
                        {lang === 'ar' ? item.titleAr : item.titleEn}
                      </span>
                      <span
                        className={`text-[11px] font-semibold block mt-0.5 ${item.badgeClass}`}
                      >
                        {lang === 'ar' ? item.badgeAr : item.badgeEn}
                      </span>
                    </div>
                  </div>

                  {/* Clear Selection Checkmark Indicator */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? 'bg-amber-400 text-stone-950 shadow-md shadow-amber-400/30 scale-105'
                        : 'bg-stone-950/80 border border-stone-600 text-stone-500'
                    }`}
                    aria-label={isSelected ? 'Selected' : 'Select'}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* All Supported Applications Grid with Selection Checkmarks */}
        <div className="mt-6 pt-5 border-t border-stone-800/80">
          <div className="text-xs text-stone-400 mb-3">
            {lang === 'ar'
              ? 'جميع التطبيقات والمنصات المدعومة (اضغط للتحديد):'
              : 'All Supported Verification Platforms (Tap to select):'}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {SOCIAL_PLATFORMS.map((platform) => {
              const isSelected = platform.id === selectedPlatform;
              return (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => onSelectPlatform(platform.id)}
                  className={`p-3.5 rounded-xl border-2 text-start transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-orange-950/30 border-orange-500 shadow-md shadow-orange-500/15'
                      : 'bg-stone-900/70 border-stone-700/80 hover:border-orange-400/60 hover:bg-stone-900'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <PlatformBrandIcon platformId={platform.id} size="md" />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block truncate">
                          {platform.name}
                        </span>
                        <span className="text-[11px] text-stone-300 block truncate">
                          {platform.arabicName.split(' ')[0]}
                        </span>
                      </div>
                    </div>

                    {/* Selection Checkmark Indicator on Every Platform Card */}
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? 'bg-amber-400 text-stone-950'
                          : 'border border-stone-600 text-transparent'
                      }`}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-stone-400">
                    <span className="truncate">
                      {lang === 'ar'
                        ? platform.arabicCategory
                        : platform.category}
                    </span>
                    <span className="text-amber-400 font-mono-tabular shrink-0">
                      {platform.successRate}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* STEP 2: Centered & Responsive Country Cards (Canadian 🇨🇦 vs American 🇺🇸) with Weekly / Monthly Plans */}
      <div
        id="country-pricing"
        className="bg-[#141210] border border-stone-800 rounded-2xl p-5 sm:p-8 shadow-xl"
      >
        <div className="text-center max-w-2xl mx-auto pb-6 border-b border-stone-800">
          <span className="text-xs font-bold text-orange-400">
            {lang === 'ar'
              ? '02. اختر الدولة وخطة الأسعار (Weekly / Monthly)'
              : '02. Choose Country & Pricing Plan (Weekly / Monthly)'}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            {lang === 'ar'
              ? 'الأرقام الكندية والأمريكية المتاحة وخطط الاشتراك'
              : 'Canadian & US Virtual Numbers & Subscription Plans'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-1.5">
            {lang === 'ar'
              ? 'اختر الدولة (كندا أو أمريكا) وحدد الباقة الأسبوعية أو الشهرية المناسبة لك'
              : 'Select Canada or the United States and tap Weekly or Monthly plan'}
          </p>
        </div>

        {/* Centered 2-Column Grid Responsive for All Mobile & Desktop Screens */}
        <div className="mt-6 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {(['CA', 'US'] as CountryCode[]).map((code) => {
            const country = COUNTRIES_CATALOG[code];
            const isCountryActive = selectedCountry === code;

            return (
              <div
                key={code}
                onClick={() => onSelectCountry(code)}
                className={`rounded-2xl border-2 p-5 sm:p-6 flex flex-col justify-between transition-all cursor-pointer ${
                  isCountryActive
                    ? 'bg-stone-900/95 border-orange-500 shadow-xl shadow-orange-500/15 ring-1 ring-orange-500/40'
                    : 'bg-stone-900/60 border-stone-700/80 hover:border-orange-400/60 hover:bg-stone-900/80'
                }`}
              >
                <div>
                  {/* Centered / Balanced Country Header */}
                  <div className="flex items-center justify-between gap-3 pb-4 border-b border-stone-800">
                    <div className="flex items-center gap-3.5">
                      <span
                        className="text-4xl leading-none"
                        role="img"
                        aria-label={country.name}
                      >
                        {country.flag}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base sm:text-lg font-bold text-white">
                            {lang === 'ar'
                              ? code === 'CA'
                                ? 'أرقام كندية (Canada)'
                                : 'أرقام أمريكية (USA)'
                              : `${country.name} Numbers`}
                          </h3>
                          <span
                            dir="ltr"
                            className="px-2 py-0.5 rounded-md bg-orange-500/15 border border-orange-500/30 font-mono-tabular text-xs font-bold text-amber-400"
                          >
                            {country.dialCode}
                          </span>
                        </div>
                        <p className="text-xs text-stone-400 mt-0.5">
                          {lang === 'ar'
                            ? country.arabicRegionLabel
                            : country.regionLabel}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        isCountryActive
                          ? 'bg-amber-400 text-stone-950 shadow-sm'
                          : 'border border-stone-600 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  </div>

                  {/* Side-by-Side / Responsive Plan Cards (Weekly vs Monthly) */}
                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(['weekly', 'monthly'] as PlanDuration[]).map(
                      (duration) => {
                        const planObj = country.plans[duration];
                        const isPlanSelected =
                          isCountryActive && selectedPlan === duration;

                        return (
                          <button
                            key={duration}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectPlan(code, duration);
                            }}
                            className={`p-4 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-between gap-2 cursor-pointer ${
                              isPlanSelected
                                ? 'bg-orange-950/45 border-amber-400 shadow-md shadow-orange-500/10'
                                : 'bg-stone-950/80 border-stone-700/80 hover:border-orange-400/60'
                            }`}
                          >
                            <div className="w-full flex items-center justify-between text-xs">
                              <span className="font-bold text-white">
                                {duration === 'weekly'
                                  ? lang === 'ar'
                                    ? 'أسبوعي (Weekly)'
                                    : 'Weekly Plan'
                                  : lang === 'ar'
                                  ? 'شهري (Monthly)'
                                  : 'Monthly Plan'}
                              </span>
                              <span
                                className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                  isPlanSelected
                                    ? 'bg-amber-400 text-stone-950'
                                    : 'border border-stone-600 text-transparent'
                                }`}
                              >
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </span>
                            </div>

                            <div className="my-1" dir="ltr">
                              <span className="text-2xl font-bold font-mono-tabular text-amber-400">
                                {planObj.priceMru}
                              </span>
                              <span className="text-xs font-semibold text-stone-300 ml-1">
                                MRU
                              </span>
                              <span className="block text-[11px] text-stone-400">
                                {lang === 'ar'
                                  ? `أوقية / ${planObj.durationDays} يوماً`
                                  : `for ${planObj.durationDays} Days`}
                              </span>
                            </div>
                          </button>
                        );
                      }
                    )}
                  </div>

                  {/* Features of Active Plan */}
                  <ul className="mt-5 pt-4 border-t border-stone-800/80 space-y-2 text-xs text-stone-300">
                    {(lang === 'ar'
                      ? country.plans[
                          isCountryActive ? selectedPlan : 'monthly'
                        ].arabicFeatures
                      : country.plans[
                          isCountryActive ? selectedPlan : 'monthly'
                        ].features
                    ).map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs">
                  <span className="text-stone-300 flex items-center gap-1.5">
                    <PlatformBrandIcon
                      platformId={activePlatform.id}
                      size="sm"
                    />
                    {lang === 'ar'
                      ? `مفعل لتطبيق ${activePlatform.arabicName}`
                      : `For ${activePlatform.name}`}
                  </span>
                  <span
                    className={`font-bold ${
                      isCountryActive ? 'text-amber-400' : 'text-stone-400'
                    }`}
                  >
                    {isCountryActive
                      ? lang === 'ar'
                        ? 'الدولة المحددة ✓'
                        : 'Selected ✓'
                      : lang === 'ar'
                      ? 'اضغط للتحديد'
                      : 'Tap to Select'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 3: Centered Order Summary & Instant Checkout Bar */}
      <div className="max-w-4xl mx-auto bg-[#141210] border-2 border-orange-500/40 rounded-2xl p-5 sm:p-7 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <ShieldCheck className="w-4 h-4 text-orange-400" />
              <span>
                {lang === 'ar'
                  ? 'ملخص الطلب الجاهز للتفعيل الفوري'
                  : 'Order Summary Ready for Instant Activation'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-700 font-bold text-white inline-flex items-center gap-2">
                <PlatformBrandIcon platformId={activePlatform.id} size="sm" />
                {lang === 'ar'
                  ? activePlatform.arabicName
                  : activePlatform.name}
              </span>

              <span className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-700 font-bold text-white inline-flex items-center gap-1.5">
                <span>{activeCountry.flag}</span>
                <span>
                  {lang === 'ar'
                    ? activeCountry.arabicName
                    : activeCountry.name}{' '}
                  ({activeCountry.dialCode})
                </span>
              </span>

              <span className="px-3 py-1.5 rounded-xl bg-orange-950/50 border border-orange-500/40 font-bold text-amber-300 text-xs">
                {lang === 'ar'
                  ? activePlanDetails.arabicLabel
                  : activePlanDetails.label}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-orange-400" />
                {lang === 'ar'
                  ? activePlatform.arabicDeliveryEstimate
                  : activePlatform.deliveryEstimate}
              </span>
              <span>·</span>
              <span>
                {lang === 'ar'
                  ? 'الدفع عبر بنكيلي / مصرفي / سداد:'
                  : 'Payment Account:'}{' '}
                <strong
                  dir="ltr"
                  className="font-mono-tabular text-amber-400"
                >
                  {RECEIVER_PHONE_NUMBER}
                </strong>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end justify-between gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-stone-800 shrink-0">
            <div className="text-center sm:text-start md:text-end" dir="ltr">
              <span className="text-xs text-stone-400 block">
                {lang === 'ar' ? 'المبلغ الإجمالي' : 'Total Payable'}
              </span>
              <span className="text-3xl font-bold font-mono-tabular text-amber-400">
                {activePlanDetails.priceMru}
              </span>
              <span className="text-sm font-semibold text-stone-300 ml-1.5">
                MRU (أوقية)
              </span>
            </div>

            <button
              type="button"
              onClick={onProceedToCheckout}
              className="py-3.5 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-stone-950 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0 shadow-lg shadow-orange-500/20 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>
                {lang === 'ar'
                  ? 'متابعة الدفع عبر بنكيلي / مصرفي / سداد'
                  : 'Proceed to Local MRU Checkout'}
              </span>
              {isRtl ? (
                <ArrowLeft className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
