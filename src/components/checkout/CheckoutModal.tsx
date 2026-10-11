import React, { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Building2,
  CheckCircle2,
  Copy,
  FileImage,
  Phone,
  ShieldCheck,
  Smartphone,
  Upload,
  X,
} from 'lucide-react';
import {
  BENEFICIARY_HOLDING_NAME,
  COUNTRIES_CATALOG,
  createSampleReceiptSvg,
  PAYMENT_METHODS,
  RECEIVER_PHONE_NUMBER,
  SOCIAL_PLATFORMS,
} from '../../data/catalog';
import {
  CountryCode,
  PaymentMethodId,
  PlanDuration,
  SocialPlatformId,
  VirtualOrder,
} from '../../types/rimphone';
import { useRimPhone } from '../../context/RimPhoneContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  platformId: SocialPlatformId;
  countryCode: CountryCode;
  planDuration: PlanDuration;
  onOrderCreated: (order: VirtualOrder) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  platformId,
  countryCode,
  planDuration,
  onOrderCreated,
}) => {
  const { lang, isRtl, currentUser, createOrder } = useRimPhone();
  const [selectedGateway, setSelectedGateway] =
    useState<PaymentMethodId>('bankily');
  const [senderPhone, setSenderPhone] = useState(
    currentUser?.phoneMauritania || ''
  );
  const [transactionId, setTransactionId] = useState('');
  const [receiptDataUrl, setReceiptDataUrl] = useState<string>('');
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const platform =
    SOCIAL_PLATFORMS.find((p) => p.id === platformId) || SOCIAL_PLATFORMS[0];
  const country = COUNTRIES_CATALOG[countryCode];
  const plan = country.plans[planDuration];
  const activeGateway =
    PAYMENT_METHODS.find((m) => m.id === selectedGateway) || PAYMENT_METHODS[0];

  const handleCopyReceiverNumber = () => {
    navigator.clipboard.writeText(RECEIVER_PHONE_NUMBER);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg(
        lang === 'ar'
          ? 'يرجى اختيار صورة صالحة لوصل التحويل (PNG أو JPG).'
          : 'Please select a valid receipt image file (PNG, JPG, WEBP).'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setReceiptDataUrl(reader.result);
        setReceiptFileName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateSampleReceipt = () => {
    setErrorMsg(null);
    const sampleTx =
      transactionId.trim() ||
      `${activeGateway.codePrefix}-${Math.floor(
        10000000 + Math.random() * 90000000
      )}`;
    if (!transactionId.trim()) {
      setTransactionId(sampleTx);
    }
    const sampleSender = senderPhone.trim() || '36 81 40 22';
    if (!senderPhone.trim()) {
      setSenderPhone(sampleSender);
    }
    const nowStr = new Date().toLocaleString([], {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const svgDataUrl = createSampleReceiptSvg(
      activeGateway.name,
      sampleTx,
      plan.priceMru,
      `${nowStr} GMT`,
      activeGateway.accentHex,
      sampleSender
    );
    setReceiptDataUrl(svgDataUrl);
    setReceiptFileName(`${activeGateway.id}_receipt_${sampleTx}.png`);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!transactionId.trim()) {
      setErrorMsg(
        lang === 'ar'
          ? `يرجى إدخال رقم مرجع عملية التحويل (Transaction ID) في تطبيق ${activeGateway.arabicName}.`
          : `Please enter your ${activeGateway.name} Transfer Transaction ID / Reference Code.`
      );
      return;
    }

    if (!receiptDataUrl) {
      setErrorMsg(
        lang === 'ar'
          ? 'يرجى إرفاق لقطة شاشة (Screenshot) لوصل التحويل لتأكيد الدفع.'
          : 'Please upload a screenshot of your transfer receipt to verify payment.'
      );
      return;
    }

    const created = createOrder({
      platformId,
      countryCode,
      planDuration,
      paymentMethod: selectedGateway,
      senderPhone: senderPhone || '36 00 00 00',
      preferredNumber: '',
      transactionId,
      receiptDataUrl,
      receiptFileName: receiptFileName || 'payment_receipt.png',
    });

    setTransactionId('');
    setReceiptDataUrl('');
    setReceiptFileName('');
    onOrderCreated(created);
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-2xl bg-[#141210] border border-stone-800 rounded-2xl p-6 sm:p-8 shadow-2xl my-8"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 pb-5 border-b border-stone-800">
            <div>
              <p className="text-xs font-semibold text-orange-400">
                {lang === 'ar'
                  ? 'بوابة الدفع الموريتانية المباشرة · تحويل محلي فوري'
                  : 'Mauritania Local Payment Gateway · Direct Transfer'}
              </p>
              <h2 className="text-xl font-bold text-white mt-1">
                {lang === 'ar'
                  ? 'إتمام الدفع وإرسال الطلب لتخصيص الرقم'
                  : 'Complete Your Virtual Number Order'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800/60 transition-colors"
              aria-label="Close checkout modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Order Summary Strip */}
          <div className="mt-5 p-4 rounded-xl bg-stone-900/90 border border-stone-800 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs text-stone-300 flex flex-wrap items-center gap-1.5">
                <span className="font-semibold text-white">
                  {lang === 'ar' ? platform.arabicName : platform.name}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {country.flag}{' '}
                  {lang === 'ar' ? country.arabicName : country.name} (
                  {country.dialCode})
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-orange-400 font-medium">
                  {lang === 'ar' ? plan.arabicLabel : plan.label}
                </span>
              </div>
              <p className="text-xs text-stone-400">
                {lang === 'ar'
                  ? 'سيقوم المدير بتخصيص الرقم الدولي وإرسال كود التفعيل إلى حسابك فور تأكيد التحويل.'
                  : 'The administrator will assign your virtual number and push your OTP code immediately after payment verification.'}
              </p>
            </div>
            <div className="text-end" dir="ltr">
              <span className="text-xs text-stone-400 block">
                {lang === 'ar' ? 'المبلغ المطلوب تحويله' : 'Total Due'}
              </span>
              <span className="text-xl font-bold font-mono-tabular text-amber-400">
                {plan.priceMru} MRU{' '}
                <span className="text-xs font-normal text-stone-300">
                  (أوقية)
                </span>
              </span>
            </div>
          </div>

          {/* Payment Method Selector (Bankily, Masrvi, Sedad) */}
          <div className="mt-6">
            <label className="block text-xs font-medium text-stone-300 mb-2.5">
              {lang === 'ar'
                ? '1. اختر تطبيق الدفع الموريتاني (بنكيلي · مصرفي · سداد)'
                : '1. Select Mauritanian Mobile Banking App'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PAYMENT_METHODS.map((method) => {
                const isSelected = method.id === selectedGateway;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedGateway(method.id)}
                    className={`p-3.5 rounded-xl border text-start transition-all ${
                      isSelected
                        ? 'bg-stone-900 border-orange-500 shadow-sm'
                        : 'bg-stone-900/40 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">
                        {lang === 'ar' ? method.arabicName : method.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 mt-1 truncate">
                      {lang === 'ar'
                        ? method.arabicBankIssuer
                        : method.bankIssuer}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Receiver Account Box & Step-by-step instructions */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
            <div className="md:col-span-5 p-4 rounded-xl bg-stone-900 border border-stone-800 flex flex-col justify-between">
              <div>
                <span className="text-xs text-stone-400 block">
                  {lang === 'ar'
                    ? 'رقم المستلم الرسمي للدفع'
                    : 'Official Receiver Account / Phone'}
                </span>
                <div className="mt-2 flex items-center gap-2" dir="ltr">
                  <Smartphone className="w-5 h-5 text-orange-400 shrink-0" />
                  <span className="text-2xl font-bold font-mono-tabular tracking-wider text-white">
                    {RECEIVER_PHONE_NUMBER}
                  </span>
                </div>
                <div className="mt-2.5 pt-2.5 border-t border-stone-800/80 text-xs text-stone-300 space-y-1">
                  <div className="flex items-center gap-1.5 text-stone-400">
                    <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{BENEFICIARY_HOLDING_NAME}</span>
                  </div>
                  <p className="text-stone-400">
                    {lang === 'ar' ? (
                      <>
                        حول مبلغ{' '}
                        <strong className="text-amber-400 font-mono-tabular">
                          {plan.priceMru} MRU
                        </strong>{' '}
                        إلى الرقم أعلاه عبر {activeGateway.arabicName}.
                      </>
                    ) : (
                      <>
                        Send{' '}
                        <strong className="text-amber-400 font-mono-tabular">
                          {plan.priceMru} MRU
                        </strong>{' '}
                        to the number above via {activeGateway.name}.
                      </>
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyReceiverNumber}
                className="mt-4 w-full py-2 px-3 bg-stone-800 hover:bg-stone-700 text-xs font-medium text-stone-100 rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
              >
                {copiedPhone ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    {lang === 'ar'
                      ? 'تم نسخ الرقم 31520844'
                      : 'Copied 31520844'}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-orange-400" />
                    {lang === 'ar'
                      ? 'نسخ رقم المستلم (31520844)'
                      : 'Copy Receiver Number (31520844)'}
                  </>
                )}
              </button>
            </div>

            <div className="md:col-span-7 p-4 rounded-xl bg-stone-900/60 border border-stone-800">
              <h3 className="text-xs font-semibold text-stone-200 mb-2.5">
                {lang === 'ar'
                  ? `خطوات التحويل عبر ${activeGateway.arabicName}`
                  : `Step-by-Step ${activeGateway.name} Transfer Instructions`}
              </h3>
              <ol className="space-y-2.5 text-xs text-stone-300">
                {(lang === 'ar'
                  ? activeGateway.arabicSteps
                  : activeGateway.steps
                ).map((step, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <span className="font-mono-tabular text-orange-400 font-semibold shrink-0">
                      0{index + 1}.
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Proof Submission Form */}
          <form onSubmit={handleSubmitOrder} className="mt-6 space-y-5">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-950/60 border border-red-800/60 text-xs text-red-200">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sender Mauritanian Phone Number */}
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-2">
                  {lang === 'ar'
                    ? '2. رقم هاتفك المرسل منه'
                    : '2. Your Sender Phone (+222)'}
                </label>
                <div className="relative" dir="ltr">
                  <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="36 XX XX XX"
                    className="w-full pl-8 pr-3 py-2.5 bg-stone-900 border border-stone-700 rounded-lg text-sm font-mono-tabular text-white placeholder-stone-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <p className="text-[11px] text-stone-400 mt-1.5">
                  {lang === 'ar'
                    ? 'رقم حسابك الذي قمت بالتحويل منه.'
                    : 'Phone number used for transfer.'}
                </p>
              </div>

              {/* Transaction Reference Code */}
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-2">
                  {lang === 'ar'
                    ? '3. رقم مرجع العملية (Transaction ID)'
                    : '3. Transfer Reference / TX ID'}
                </label>
                <input
                  dir="ltr"
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder={`${activeGateway.codePrefix}-94820194`}
                  className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-700 rounded-lg text-sm font-mono-tabular text-white placeholder-stone-500 focus:outline-none focus:border-orange-500"
                />
                <p className="text-[11px] text-stone-400 mt-1.5">
                  {lang === 'ar'
                    ? `رقم العملية الظاهر في وصل ${activeGateway.arabicName}.`
                    : `Reference code from ${activeGateway.name}.`}
                </p>
              </div>

              {/* Screenshot File Upload */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-stone-300">
                    {lang === 'ar'
                      ? '4. صورة وصل التحويل'
                      : '4. Receipt Screenshot'}
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateSampleReceipt}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-medium whitespace-nowrap shrink-0"
                  >
                    {lang === 'ar' ? 'توليد وصل تجريبي' : 'Auto-Fill Sample'}
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2.5 px-3 bg-stone-900 hover:bg-stone-800 border border-dashed border-stone-700 hover:border-orange-500 rounded-lg text-xs text-stone-200 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <Upload className="w-4 h-4 text-orange-400 shrink-0" />
                    <span className="truncate max-w-[125px]">
                      {receiptFileName ||
                        (lang === 'ar'
                          ? 'إرفاق لقطة الشاشة'
                          : 'Upload Screenshot')}
                    </span>
                  </button>

                  {receiptDataUrl && (
                    <div className="w-10 h-10 rounded-lg border border-amber-500/40 overflow-hidden bg-stone-950 shrink-0 flex items-center justify-center">
                      <img
                        src={receiptDataUrl}
                        alt="Receipt preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-stone-400 mt-1.5 flex items-center gap-1">
                  <FileImage className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  {lang === 'ar'
                    ? 'أرفق صورة الوصل من هاتفك لتأكيد التحويل.'
                    : 'Attach your mobile transfer screenshot.'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-stone-400">
                {lang === 'ar'
                  ? 'فور إرسال الطلب، سيقوم المدير بمراجعة الوصل وتخصيص الرقم وإرسال كود الـ SMS مباشرة لحسابك.'
                  : 'Once submitted, the administrator will assign your virtual number and push your OTP code.'}
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-medium text-stone-300 hover:text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-stone-950 font-bold text-xs sm:text-sm rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0 shadow-lg shadow-orange-500/15"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {lang === 'ar'
                    ? 'إرسال الطلب للمعالجة والتفعيل'
                    : 'Submit Order for Processing'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
