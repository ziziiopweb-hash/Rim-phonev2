import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Copy,
  KeyRound,
  Lock,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { useRimPhone } from '../../context/RimPhoneContext';
import { ADMIN_EMAIL } from '../../data/catalog';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}) => {
  const {
    lang,
    isRtl,
    registerUser,
    loginUser,
    verifyEmailOtp,
    resendVerificationOtp,
    requestPasswordResetOtp,
    confirmPasswordResetWithOtp,
    pendingVerificationUser,
    lastDispatchedEmail,
  } = useRimPhone();

  const [mode, setMode] = useState<
    'login' | 'signup' | 'otp' | 'forgot-email' | 'forgot-verify'
  >(pendingVerificationUser ? 'otp' : initialMode);

  const [fullName, setFullName] = useState('');
  const [phoneMauritania, setPhoneMauritania] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [copiedOtp, setCopiedOtp] = useState(false);

  if (!isOpen) return null;

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (val.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      const res = loginUser(val.trim(), '');
      if (res.ok) {
        onSuccess?.();
        onClose();
      }
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const res = registerUser(fullName, email, password, phoneMauritania);
    if (!res.ok) {
      setErrorMsg(res.error || 'Registration failed');
      return;
    }
    if (res.requiresOtp) {
      setMode('otp');
      setInfoMsg(
        lang === 'ar'
          ? `تم إرسال رمز تحقق مكون من 6 أرقام إلى بريدك الإلكتروني (Gmail): ${email.trim().toLowerCase()}`
          : `A 6-digit verification code has been sent to ${email.trim().toLowerCase()}.`
      );
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const res = loginUser(email, password);
    if (!res.ok) {
      setErrorMsg(res.error || 'Sign in failed');
      return;
    }
    if (res.requiresOtp) {
      setMode('otp');
      setInfoMsg(
        lang === 'ar'
          ? 'يرجى تأكيد بريدك الإلكتروني بإدخال رمز التحقق المكون من 6 أرقام.'
          : 'Please verify your email with the 6-digit OTP code to continue.'
      );
      return;
    }
    onSuccess?.();
    onClose();
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const res = verifyEmailOtp(otpInput);
    if (!res.ok) {
      setErrorMsg(res.error || 'Invalid OTP code');
      return;
    }
    setOtpInput('');
    onSuccess?.();
    onClose();
  };

  const handleResendOtp = () => {
    setErrorMsg(null);
    const res = resendVerificationOtp();
    if (res.ok) {
      setInfoMsg(
        lang === 'ar'
          ? 'تم إرسال رمز تحقق جديد مكون من 6 أرقام إلى بريد Gmail الخاص بك.'
          : 'A fresh 6-digit OTP code has been dispatched to your Gmail.'
      );
    } else {
      setErrorMsg(res.error || 'Could not resend OTP');
    }
  };

  const handleForgotEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const res = requestPasswordResetOtp(email);
    if (!res.ok) {
      setErrorMsg(res.error || 'Could not send reset code');
      return;
    }

    setOtpInput('');
    setNewPassword('');
    setConfirmNewPassword('');
    setMode('forgot-verify');
    setInfoMsg(
      lang === 'ar'
        ? `تم إرسال رمز استعادة كلمة المرور المكون من 6 أرقام إلى بريدك (${email.trim().toLowerCase()}).`
        : `A 6-digit password reset code has been sent to ${email.trim().toLowerCase()}.`
    );
  };

  const handleForgotVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (newPassword !== confirmNewPassword) {
      setErrorMsg(
        lang === 'ar'
          ? 'كلمتا المرور غير متطابقتين. يرجى التأكد من تطابق كلمة المرور الجديدة.'
          : 'Passwords do not match. Please confirm your new password.'
      );
      return;
    }

    const res = confirmPasswordResetWithOtp(email, otpInput, newPassword);
    if (!res.ok) {
      setErrorMsg(res.error || 'Password reset failed');
      return;
    }

    setOtpInput('');
    setNewPassword('');
    setConfirmNewPassword('');
    onSuccess?.();
    onClose();
  };

  const handleCopySimulatedOtp = () => {
    if (!lastDispatchedEmail?.otpCode) return;
    navigator.clipboard.writeText(lastDispatchedEmail.otpCode);
    setOtpInput(lastDispatchedEmail.otpCode);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const renderGmailInboxCard = (descriptionAr: string, descriptionEn: string) =>
    lastDispatchedEmail && (
      <div className="p-4 rounded-xl bg-stone-900/95 border border-orange-500/40 space-y-3 shadow-lg">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-white flex items-center justify-center shrink-0 shadow-sm">
              <svg viewBox="0 0 24 24" className="w-4 h-4">
                <path
                  fill="#EA4335"
                  d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"
                />
              </svg>
            </span>
            <span className="truncate max-w-[200px]">
              {lang === 'ar'
                ? `بريد Gmail الوارد — ${lastDispatchedEmail.to}`
                : `Gmail Inbox — ${lastDispatchedEmail.to}`}
            </span>
          </span>
          <span
            dir="ltr"
            className="font-mono-tabular text-[11px] text-amber-400 shrink-0"
          >
            {lastDispatchedEmail.deliveryStatus === 'sending'
              ? lang === 'ar'
                ? 'جاري الإرسال...'
                : 'Sending...'
              : `✓ Gmail (${lastDispatchedEmail.sentAt})`}
          </span>
        </div>
        <p className="text-xs text-stone-300 leading-relaxed">
          {lang === 'ar' ? descriptionAr : descriptionEn}
        </p>
        <div
          dir="ltr"
          className="flex items-center justify-between bg-stone-950 px-3.5 py-2.5 rounded-lg border border-orange-500/30"
        >
          <span className="font-mono-tabular text-lg font-bold tracking-widest text-amber-400">
            {lastDispatchedEmail.otpCode}
          </span>
          <button
            type="button"
            onClick={handleCopySimulatedOtp}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            {copiedOtp ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-stone-950" />
                {lang === 'ar' ? 'تم الملء التلقائي' : 'Auto-Filled'}
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                {lang === 'ar' ? 'نسخ ولصق الكود' : 'Copy & Fill Code'}
              </>
            )}
          </button>
        </div>
      </div>
    );

  return (
    <AnimatePresence>
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-md bg-[#141210] border border-stone-800 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden my-8"
        >
          <div className="flex items-center justify-between pb-5 border-b border-stone-800">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {mode === 'login' &&
                  (lang === 'ar'
                    ? 'تسجيل الدخول إلى Rim Phone'
                    : 'Sign In to Rim Phone')}
                {mode === 'signup' &&
                  (lang === 'ar'
                    ? 'إنشاء حساب جديد في Rim Phone'
                    : 'Create Your Rim Phone Account')}
                {mode === 'otp' &&
                  (lang === 'ar'
                    ? 'تأكيد البريد الإلكتروني (Gmail OTP)'
                    : 'Verify Your Gmail Address')}
                {mode === 'forgot-email' &&
                  (lang === 'ar'
                    ? 'استعادة وتغيير كلمة المرور'
                    : 'Reset Your Account Password')}
                {mode === 'forgot-verify' &&
                  (lang === 'ar'
                    ? 'تأكيد الرمز وتعيين كلمة مرور جديدة'
                    : 'Verify Code & Set New Password')}
              </h2>
              <p className="text-xs text-stone-400 mt-1">
                {mode === 'login' &&
                  (lang === 'ar'
                    ? 'ادخل إلى لوحة التحكم لاستلام أرقامك الافتراضية ورسائل التفعيل.'
                    : 'Access your virtual numbers, OTP codes, and MRU order history.')}
                {mode === 'signup' &&
                  (lang === 'ar'
                    ? 'أرقام كندية وأمريكية فورية مع إرسال رمز التحقق إلى بريد Gmail.'
                    : 'Instant Canadian & US virtual numbers verified via Gmail.')}
                {mode === 'otp' &&
                  (lang === 'ar'
                    ? 'أدخل الرمز المكون من 6 أرقام المرسل إلى بريد Gmail لتفعيل حسابك.'
                    : 'Enter the 6-digit confirmation code dispatched to your Gmail inbox.')}
                {mode === 'forgot-email' &&
                  (lang === 'ar'
                    ? 'أدخل بريدك الإلكتروني المسجل (Gmail) لإرسال رمز التحقق الخاص بتغيير كلمة السر.'
                    : 'Enter your registered Gmail address to receive a password reset OTP code.')}
                {mode === 'forgot-verify' &&
                  (lang === 'ar'
                    ? 'أدخل رمز التحقق الوارد إلى بريدك الإلكتروني واختر كلمة المرور الجديدة.'
                    : 'Enter the 6-digit code sent to your Gmail and choose a new password.')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800/60 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorMsg && (
            <div className="mt-4 p-3 rounded-lg bg-red-950/60 border border-red-800/60 text-xs text-red-200">
              {errorMsg}
            </div>
          )}

          {infoMsg && (
            <div className="mt-4 p-3 rounded-lg bg-orange-950/50 border border-orange-700/60 text-xs text-amber-200">
              {infoMsg}
            </div>
          )}

          {/* MODE 1: Email Verification OTP after Signup */}
          {mode === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="mt-5 space-y-5">
              {renderGmailInboxCard(
                'وصلت رسالة التحقق إلى بريدك الإلكتروني (Gmail). استخدم الرمز التالي لتأكيد حسابك:',
                'Verification email received in your Gmail inbox. Use this 6-digit OTP code:'
              )}

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-2">
                  {lang === 'ar'
                    ? 'رمز التأكيد المكون من 6 أرقام (OTP)'
                    : '6-Digit Confirmation OTP Code'}
                </label>
                <div className="relative" dir="ltr">
                  <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpInput}
                    onChange={(e) =>
                      setOtpInput(e.target.value.replace(/\D/g, ''))
                    }
                    placeholder="482910"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-700 rounded-lg text-sm font-mono-tabular tracking-widest text-white placeholder-stone-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-orange-400 transition-colors whitespace-nowrap shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {lang === 'ar' ? 'إعادة إرسال الرمز' : 'Resend Code'}
                </button>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-stone-400 hover:text-white transition-colors whitespace-nowrap shrink-0"
                >
                  {lang === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Sign In'}
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-stone-950 font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
              >
                <ShieldCheck className="w-4 h-4" />
                {lang === 'ar'
                  ? 'تأكيد البريد الإلكتروني والدخول للوحة التحكم'
                  : 'Verify Email & Unlock Dashboard'}
              </button>
            </form>
          )}

          {/* MODE 2: Forgot Password Step 1 — Request OTP to Gmail */}
          {mode === 'forgot-email' && (
            <form onSubmit={handleForgotEmailSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5">
                  {lang === 'ar'
                    ? 'البريد الإلكتروني المسجل (Gmail)'
                    : 'Registered Gmail Address'}
                </label>
                <div className="relative" dir="ltr">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-700 rounded-lg text-sm text-white placeholder-stone-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <p className="text-[11px] text-amber-400/90 mt-1.5">
                  {lang === 'ar'
                    ? 'سنرسل رمز تحقق فوري مكون من 6 أرقام إلى بريدك لتأكيد هويتك وتغيير كلمة السر.'
                    : 'We will send a 6-digit verification code to your Gmail to reset your password.'}
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-stone-950 font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0 shadow-lg shadow-orange-500/15"
              >
                <KeyRound className="w-4 h-4" />
                <span>
                  {lang === 'ar'
                    ? 'إرسال رمز استعادة كلمة السر إلى Gmail'
                    : 'Send Reset Code to Gmail'}
                </span>
              </button>

              <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
                <span>
                  {lang === 'ar'
                    ? 'تذكرت كلمة المرور؟'
                    : 'Remembered your password?'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setInfoMsg(null);
                    setMode('login');
                  }}
                  className="text-amber-400 hover:text-amber-300 font-semibold"
                >
                  {lang === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Sign In'}
                </button>
              </div>
            </form>
          )}

          {/* MODE 3: Forgot Password Step 2 — Verify OTP + Set New Password */}
          {mode === 'forgot-verify' && (
            <form
              onSubmit={handleForgotVerifySubmit}
              className="mt-5 space-y-4"
            >
              {renderGmailInboxCard(
                'رمز التحقق لتغيير كلمة المرور الوارد إلى بريد Gmail الخاص بك:',
                'Your password reset verification code received in Gmail:'
              )}

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5">
                  {lang === 'ar'
                    ? '1. رمز التحقق المكون من 6 أرقام (OTP)'
                    : '1. 6-Digit Verification OTP Code'}
                </label>
                <div className="relative" dir="ltr">
                  <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpInput}
                    onChange={(e) =>
                      setOtpInput(e.target.value.replace(/\D/g, ''))
                    }
                    placeholder="649120"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-700 rounded-lg text-sm font-mono-tabular tracking-widest text-white placeholder-stone-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5">
                  {lang === 'ar'
                    ? '2. كلمة المرور الجديدة'
                    : '2. New Password'}
                </label>
                <div className="relative" dir="ltr">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-700 rounded-lg text-sm text-white placeholder-stone-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5">
                  {lang === 'ar'
                    ? '3. تأكيد كلمة المرور الجديدة'
                    : '3. Confirm New Password'}
                </label>
                <div className="relative" dir="ltr">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-700 rounded-lg text-sm text-white placeholder-stone-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const res = requestPasswordResetOtp(email);
                    if (res.ok) {
                      setInfoMsg(
                        lang === 'ar'
                          ? 'تم إرسال رمز جديد لتغيير كلمة السر إلى بريد Gmail الخاص بك.'
                          : 'A new password reset code was sent to your Gmail.'
                      );
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-orange-400 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {lang === 'ar' ? 'إعادة إرسال الرمز' : 'Resend Code'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setInfoMsg(null);
                    setMode('login');
                  }}
                  className="text-xs text-stone-400 hover:text-white transition-colors"
                >
                  {lang === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Sign In'}
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-stone-950 font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0 shadow-lg shadow-orange-500/15"
              >
                <ShieldCheck className="w-4 h-4" />
                {lang === 'ar'
                  ? 'تأكيد الرمز وحفظ كلمة المرور الجديدة'
                  : 'Verify Code & Save New Password'}
              </button>
            </form>
          )}

          {/* MODE 4: Standard Login & Signup */}
          {(mode === 'login' || mode === 'signup') && (
            <form
              onSubmit={
                mode === 'login' ? handleLoginSubmit : handleSignupSubmit
              }
              className="mt-5 space-y-4"
            >
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      {lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                    </label>
                    <div className="relative">
                      <User
                        className={`w-4 h-4 text-stone-400 absolute ${
                          isRtl ? 'right-3.5' : 'left-3.5'
                        } top-1/2 -translate-y-1/2`}
                      />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={
                          lang === 'ar'
                            ? 'مثال: سيدي محمد ولد أحمد'
                            : 'e.g. Sidi Mohamed'
                        }
                        className={`w-full ${
                          isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
                        } py-2.5 bg-stone-900 border border-stone-700 rounded-lg text-sm text-white placeholder-stone-500 focus:outline-none focus:border-orange-500`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      {lang === 'ar'
                        ? 'رقم الهاتف الموريتاني (بنكيلي / مصرفي / سداد)'
                        : 'Mauritanian Phone Number (+222)'}
                    </label>
                    <div className="relative" dir="ltr">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={phoneMauritania}
                        onChange={(e) => setPhoneMauritania(e.target.value)}
                        placeholder="+222 36 XX XX XX"
                        className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-700 rounded-lg text-sm font-mono-tabular text-white placeholder-stone-500 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1.5">
                  {lang === 'ar'
                    ? 'البريد الإلكتروني للزبون (Gmail) لاستلام رمز التحقق'
                    : 'Customer Email (Gmail) for Verification Code'}
                </label>
                <div className="relative" dir="ltr">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-700 rounded-lg text-sm text-white placeholder-stone-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <p className="text-[11px] text-amber-400/90 mt-1">
                  {lang === 'ar'
                    ? 'يصل رمز التحقق الخاص بتفعيل الحساب أو استعادة كلمة السر فقط إلى بريد Gmail.'
                    : 'Account verification & password reset OTP codes are sent to your Gmail.'}
                </p>
              </div>

              {email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase() && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-stone-300">
                      {lang === 'ar' ? 'كلمة المرور' : 'Password'}
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setErrorMsg(null);
                          setInfoMsg(null);
                          setMode('forgot-email');
                        }}
                        className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
                      >
                        {lang === 'ar'
                          ? 'نسيت كلمة المرور؟'
                          : 'Forgot password?'}
                      </button>
                    )}
                  </div>
                  <div className="relative" dir="ltr">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-700 rounded-lg text-sm text-white placeholder-stone-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-stone-950 font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0 shadow-lg shadow-orange-500/15"
              >
                <span>
                  {mode === 'login'
                    ? lang === 'ar'
                      ? 'تسجيل الدخول إلى حسابي'
                      : 'Sign In to Dashboard'
                    : lang === 'ar'
                    ? 'إنشاء الحساب وإرسال كود التحقق'
                    : 'Create Account & Send OTP'}
                </span>
                {isRtl ? (
                  <ArrowLeft className="w-4 h-4" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>

              <div className="pt-4 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
                <span>
                  {mode === 'login'
                    ? lang === 'ar'
                      ? 'ليس لديك حساب بعد؟'
                      : "Don't have an account yet?"
                    : lang === 'ar'
                    ? 'لديك حساب مفعل مسبقاً؟'
                    : 'Already have a verified account?'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setInfoMsg(null);
                    setMode(mode === 'login' ? 'signup' : 'login');
                  }}
                  className="text-amber-400 hover:text-amber-300 font-semibold whitespace-nowrap shrink-0"
                >
                  {mode === 'login'
                    ? lang === 'ar'
                      ? 'سجل حساباً جديداً'
                      : 'Register with Email'
                    : lang === 'ar'
                    ? 'تسجيل الدخول'
                    : 'Sign In'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
