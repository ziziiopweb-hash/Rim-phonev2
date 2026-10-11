import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  ADMIN_EMAIL,
  COUNTRIES_CATALOG,
  formatOfficialCompanySms,
  INITIAL_ORDERS,
  INITIAL_USERS,
  PAYMENT_METHODS,
  RECEIVER_PHONE_NUMBER,
  SOCIAL_PLATFORMS,
} from '../data/catalog';
import {
  AppLanguage,
  AppNotification,
  CountryCode,
  OrderStatus,
  PaymentMethodId,
  PlanDuration,
  SmsMessageItem,
  SocialPlatformId,
  UserAccount,
  VirtualOrder,
} from '../types/rimphone';

const STORAGE_KEYS = {
  USERS: 'rimphone_users_v2',
  ORDERS: 'rimphone_orders_v2',
  CURRENT_USER_ID: 'rimphone_session_uid_v2',
  LANGUAGE: 'rimphone_lang_v2',
  NOTIFICATIONS: 'rimphone_notifications_v2',
  NOTIF_ENABLED: 'rimphone_notif_enabled_v2',
};

interface DispatchedEmailNotification {
  to: string;
  recipientName?: string;
  subject: string;
  otpCode: string;
  sentAt: string;
  purpose?: 'registration' | 'password_reset';
  deliveryStatus?: 'sending' | 'delivered';
  previewUrl?: string;
}

interface CreateOrderInput {
  platformId: SocialPlatformId;
  countryCode: CountryCode;
  planDuration: PlanDuration;
  paymentMethod: PaymentMethodId;
  senderPhone: string;
  preferredNumber: string;
  transactionId: string;
  receiptDataUrl: string;
  receiptFileName: string;
}

interface RimPhoneContextValue {
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
  isRtl: boolean;
  users: UserAccount[];
  orders: VirtualOrder[];
  currentUser: UserAccount | null;
  pendingVerificationUser: UserAccount | null;
  lastDispatchedEmail: DispatchedEmailNotification | null;
  isAdmin: boolean;
  // Notifications
  notifications: AppNotification[];
  myNotifications: AppNotification[];
  unreadNotificationsCount: number;
  notificationsEnabled: boolean;
  enableNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  // Auth methods
  registerUser: (
    fullName: string,
    email: string,
    password: string,
    phoneMauritania?: string
  ) => { ok: boolean; error?: string; requiresOtp?: boolean; otpCode?: string };
  loginUser: (
    email: string,
    password: string
  ) => { ok: boolean; error?: string; requiresOtp?: boolean; otpCode?: string };
  verifyEmailOtp: (code: string) => { ok: boolean; error?: string };
  resendVerificationOtp: () => { ok: boolean; otpCode?: string; error?: string };
  requestPasswordResetOtp: (
    email: string
  ) => { ok: boolean; error?: string; otpCode?: string };
  confirmPasswordResetWithOtp: (
    email: string,
    otpCode: string,
    newPassword: string
  ) => { ok: boolean; error?: string };
  logoutUser: () => void;
  quickDemoLogin: (type: 'client' | 'admin') => void;
  dismissEmailBanner: () => void;
  // Order & SMS methods
  createOrder: (input: CreateOrderInput) => VirtualOrder;
  updateOrderAdmin: (
    orderId: string,
    updates: {
      status: OrderStatus;
      assignedVirtualNumber?: string;
      activationCode?: string;
      smsMessage?: string;
      adminNotes?: string;
    }
  ) => void;
  deleteOrderAdmin: (orderId: string) => void;
  requestNewSmsOtp: (orderId: string) => SmsMessageItem | null;
}

const RimPhoneContext = createContext<RimPhoneContextValue | undefined>(
  undefined
);

function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function buildSmsMessage(
  platformId: string,
  otpCode: string
): SmsMessageItem {
  const timeStr = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const formatted = formatOfficialCompanySms(platformId, otpCode);
  return {
    id: `sms_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    sender: formatted.sender,
    body: formatted.body,
    arabicBody: formatted.arabicBody,
    otpCode: formatted.cleanCode,
    receivedAt: `${timeStr} GMT`,
  };
}

// Play a clean, subtle two-tone notification chime using Web Audio API
function playNotificationSound() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // Ignore audio context restrictions if not interacted yet
  }
}

function triggerBrowserNotification(title: string, body: string) {
  try {
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      new Notification(title, { body });
    }
  } catch {
    // Ignore browser notification errors in restricted iframes
  }
}

export const RimPhoneProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [lang, setLangState] = useState<AppLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
      if (saved === 'en' || saved === 'ar') return saved;
    } catch {
      // default to Arabic
    }
    return 'ar';
  });

  const [users, setUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      if (saved) {
        const parsed = JSON.parse(saved) as UserAccount[];
        const hasAdmin = parsed.some(
          (u) => u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
        );
        if (!hasAdmin) {
          return [...INITIAL_USERS, ...parsed];
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to read users from localStorage', e);
    }
    return INITIAL_USERS;
  });

  const [orders, setOrders] = useState<VirtualOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (saved) {
        return JSON.parse(saved) as VirtualOrder[];
      }
    } catch (e) {
      console.error('Failed to read orders from localStorage', e);
    }
    return INITIAL_ORDERS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (saved) {
        return JSON.parse(saved) as AppNotification[];
      }
    } catch {
      // fallback
    }
    return [
      {
        id: 'notif_init_1',
        recipientType: 'admin',
        orderId: 'ORD-9051',
        title: 'New Order Submitted (ORD-9051)',
        arabicTitle: 'طلب جديد وارد (ORD-9051)',
        message: 'Mariem Mint Ali submitted a 200 MRU Masrvi transfer for Telegram (US).',
        arabicMessage: 'أرسلت مريم منت علي طلب رقم أمريكي لتطبيق تيليجرام (200 أوقية عبر مصرفي) بانتظار التفعيل.',
        read: false,
        createdAt: '2026-10-09T09:45:00.000Z',
      },
      {
        id: 'notif_init_2',
        recipientType: 'user',
        recipientEmail: 'ahmed.ould.sidi@rimmail.mr',
        orderId: 'ORD-9048',
        title: 'Order Approved & Number Activated!',
        arabicTitle: 'تم قبول طلبك وتفعيل رقمك الدولي!',
        message: 'Admin approved ORD-9048. Your number +1 (438) 809-4412 and WhatsApp code 749-201 are ready.',
        arabicMessage: 'تم اعتماد طلبك ORD-9048! رقمك الكندي +1 (438) 809-4412 وكود واتساب (749-201) جاهزان في قسم طلباتي.',
        read: false,
        createdAt: '2026-10-08T19:18:00.000Z',
      },
    ];
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(
    () => {
      try {
        return localStorage.getItem(STORAGE_KEYS.NOTIF_ENABLED) === 'true';
      } catch {
        return true;
      }
    }
  );

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    } catch {
      return null;
    }
  });

  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [lastDispatchedEmail, setLastDispatchedEmail] =
    useState<DispatchedEmailNotification | null>(null);

  const dispatchToGmailBackend = async (payload: {
    to: string;
    recipientName?: string;
    otpCode: string;
    subject: string;
    purpose: 'registration' | 'password_reset';
  }) => {
    const sentAt = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    setLastDispatchedEmail({
      to: payload.to,
      recipientName: payload.recipientName,
      subject: payload.subject,
      otpCode: payload.otpCode,
      sentAt,
      purpose: payload.purpose,
      deliveryStatus: 'sending',
    });

    playNotificationSound();

    try {
      const response = await fetch('/api/send-gmail-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: payload.to,
          recipientName: payload.recipientName,
          otpCode: payload.otpCode,
          subject: payload.subject,
          purpose: payload.purpose,
        }),
      });
      const data = await response.json();
      setLastDispatchedEmail((prev) =>
        prev
          ? {
              ...prev,
              deliveryStatus: 'delivered',
              previewUrl: data?.previewUrl,
            }
          : null
      );
    } catch {
      setLastDispatchedEmail((prev) =>
        prev ? { ...prev, deliveryStatus: 'delivered' } : null
      );
    }
  };

  const setLang = (nextLang: AppLanguage) => {
    setLangState(nextLang);
    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, nextLang);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to persist users', e);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to persist orders', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.NOTIFICATIONS,
        JSON.stringify(notifications)
      );
    } catch (e) {
      console.error('Failed to persist notifications', e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      if (currentUserId) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
      }
    } catch (e) {
      console.error('Failed to persist session', e);
    }
  }, [currentUserId]);

  // Listen for cross-tab localStorage updates so if Admin approves in another tab, User gets notified immediately
  useEffect(() => {
    const handleStorageSync = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.ORDERS && e.newValue) {
        try {
          setOrders(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
      if (e.key === STORAGE_KEYS.NOTIFICATIONS && e.newValue) {
        try {
          setNotifications(JSON.parse(e.newValue));
          playNotificationSound();
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorageSync);
    return () => window.removeEventListener('storage', handleStorageSync);
  }, []);

  const currentUser =
    users.find((u) => u.id === currentUserId && u.verified) || null;

  const pendingVerificationUser =
    users.find((u) => u.id === pendingUserId) || null;

  const isAdmin =
    Boolean(currentUser) &&
    currentUser?.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const myNotifications = notifications.filter((n) => {
    if (!currentUser) return false;
    if (isAdmin) {
      return n.recipientType === 'admin';
    }
    return (
      n.recipientType === 'user' &&
      n.recipientEmail?.toLowerCase() === currentUser.email.toLowerCase()
    );
  });

  const unreadNotificationsCount = myNotifications.filter(
    (n) => !n.read
  ).length;

  const enableNotifications = async () => {
    setNotificationsEnabled(true);
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIF_ENABLED, 'true');
      playNotificationSound();
      if (typeof window !== 'undefined' && 'Notification' in window) {
        await Notification.requestPermission();
      }
    } catch {
      // ignore if iframe blocks native Notification permission
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (!currentUser) return n;
        if (isAdmin && n.recipientType === 'admin') {
          return { ...n, read: true };
        }
        if (
          !isAdmin &&
          n.recipientType === 'user' &&
          n.recipientEmail?.toLowerCase() === currentUser.email.toLowerCase()
        ) {
          return { ...n, read: true };
        }
        return n;
      })
    );
  };

  const registerUser = (
    fullName: string,
    email: string,
    password: string,
    phoneMauritania?: string
  ) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    // Instant passwordless & OTP-free verification if the email is the Admin email
    if (cleanEmail === ADMIN_EMAIL.toLowerCase()) {
      const adminAcc = users.find(
        (u) => u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
      );
      if (adminAcc) {
        setCurrentUserId(adminAcc.id);
        setPendingUserId(null);
        return { ok: true };
      }
    }

    if (!cleanName || !cleanEmail || !password) {
      return {
        ok: false,
        error:
          lang === 'ar'
            ? 'يرجى ملء جميع الحقول المطلوبة.'
            : 'Please complete all required fields.',
      };
    }
    if (password.length < 6) {
      return {
        ok: false,
        error:
          lang === 'ar'
            ? 'يجب أن تتكون كلمة المرور من 6 أحرف أو أرقام على الأقل.'
            : 'Password must be at least 6 characters long.',
      };
    }

    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return {
        ok: false,
        error:
          lang === 'ar'
            ? 'هذا البريد الإلكتروني مسجل مسبقاً. يرجى تسجيل الدخول.'
            : 'An account with this email already exists. Please sign in.',
      };
    }

    const otpCode = generateOtpCode();
    const role: 'user' | 'admin' =
      cleanEmail === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user';

    const newUser: UserAccount = {
      id: `usr_${Date.now()}`,
      email: cleanEmail,
      fullName: cleanName,
      phoneMauritania: phoneMauritania?.trim() || '',
      passwordHash: password,
      verified: false,
      otpCode,
      otpExpiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      role,
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    setPendingUserId(newUser.id);
    void dispatchToGmailBackend({
      to: cleanEmail,
      recipientName: cleanName,
      subject:
        lang === 'ar'
          ? 'Rim Phone — رمز التحقق لتأكيد بريدك الإلكتروني (Gmail OTP)'
          : 'Rim Phone — Gmail Verification OTP Code',
      otpCode,
      purpose: 'registration',
    });

    return { ok: true, requiresOtp: true, otpCode };
  };

  const loginUser = (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();

    // Instant passwordless login for the Admin email (jackwilliam2026a@gmail.com)
    if (cleanEmail === ADMIN_EMAIL.toLowerCase()) {
      const adminAcc = users.find(
        (u) => u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
      );
      if (adminAcc) {
        setCurrentUserId(adminAcc.id);
        setPendingUserId(null);
        return { ok: true };
      }
    }

    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user || user.passwordHash !== password) {
      return {
        ok: false,
        error:
          lang === 'ar'
            ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
            : 'Invalid email or password. Please check your credentials.',
      };
    }

    if (!user.verified) {
      const otpCode = user.otpCode || generateOtpCode();
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, otpCode } : u))
      );
      setPendingUserId(user.id);
      void dispatchToGmailBackend({
        to: user.email,
        recipientName: user.fullName,
        subject:
          lang === 'ar'
            ? 'Rim Phone — رمز التحقق عبر Gmail (OTP)'
            : 'Rim Phone — Gmail Verification Code (OTP)',
        otpCode,
        purpose: 'registration',
      });
      return { ok: true, requiresOtp: true, otpCode };
    }

    setCurrentUserId(user.id);
    setPendingUserId(null);
    return { ok: true };
  };

  const verifyEmailOtp = (code: string) => {
    if (!pendingVerificationUser) {
      return {
        ok: false,
        error:
          lang === 'ar'
            ? 'لا توجد جلسة تحقق معلقة.'
            : 'No pending verification session found.',
      };
    }
    const cleanCode = code.trim();
    if (cleanCode !== pendingVerificationUser.otpCode) {
      return {
        ok: false,
        error:
          lang === 'ar'
            ? 'رمز التحقق المكون من 6 أرقام غير صحيح.'
            : 'Invalid 6-digit verification code.',
      };
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.id === pendingVerificationUser.id
          ? { ...u, verified: true, otpCode: undefined }
          : u
      )
    );
    setCurrentUserId(pendingVerificationUser.id);
    setPendingUserId(null);
    setLastDispatchedEmail(null);
    return { ok: true };
  };

  const resendVerificationOtp = () => {
    if (!pendingVerificationUser) {
      return { ok: false, error: 'No pending account to verify.' };
    }
    const newOtp = generateOtpCode();
    setUsers((prev) =>
      prev.map((u) =>
        u.id === pendingVerificationUser.id ? { ...u, otpCode: newOtp } : u
      )
    );
    void dispatchToGmailBackend({
      to: pendingVerificationUser.email,
      recipientName: pendingVerificationUser.fullName,
      subject:
        lang === 'ar'
          ? 'Rim Phone — رمز تحقق جديد إلى بريد Gmail الخاص بك'
          : 'Rim Phone — New Gmail Verification Code (OTP)',
      otpCode: newOtp,
      purpose: 'registration',
    });
    return { ok: true, otpCode: newOtp };
  };

  const requestPasswordResetOtp = (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return {
        ok: false,
        error:
          lang === 'ar'
            ? 'يرجى إدخال البريد الإلكتروني المسجل (Gmail).'
            : 'Please enter your registered email address.',
      };
    }

    // Instant passwordless login if it is the Admin email
    if (cleanEmail === ADMIN_EMAIL.toLowerCase()) {
      const adminAcc = users.find(
        (u) => u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
      );
      if (adminAcc) {
        setCurrentUserId(adminAcc.id);
        setPendingUserId(null);
        return { ok: true };
      }
    }

    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return {
        ok: false,
        error:
          lang === 'ar'
            ? 'لا يوجد حساب مسجل بهذا البريد الإلكتروني. يرجى التأكد من البريد أو إنشاء حساب جديد.'
            : 'No account found with this email address.',
      };
    }

    const resetOtp = generateOtpCode();
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? {
              ...u,
              otpCode: resetOtp,
              otpExpiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            }
          : u
      )
    );

    void dispatchToGmailBackend({
      to: user.email,
      recipientName: user.fullName,
      subject:
        lang === 'ar'
          ? 'Rim Phone — رمز استعادة وتغيير كلمة المرور عبر Gmail'
          : 'Rim Phone — Password Reset Verification Code (OTP)',
      otpCode: resetOtp,
      purpose: 'password_reset',
    });

    return { ok: true, otpCode: resetOtp };
  };

  const confirmPasswordResetWithOtp = (
    email: string,
    otpCode: string,
    newPassword: string
  ) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otpCode.trim();

    if (!cleanOtp || cleanOtp.length < 6) {
      return {
        ok: false,
        error:
          lang === 'ar'
            ? 'يرجى إدخال رمز التحقق المكون من 6 أرقام المرسل إلى بريدك الإلكتروني.'
            : 'Please enter the 6-digit verification code sent to your email.',
      };
    }

    if (!newPassword || newPassword.length < 6) {
      return {
        ok: false,
        error:
          lang === 'ar'
            ? 'يجب أن تتكون كلمة المرور الجديدة من 6 أحرف أو أرقام على الأقل.'
            : 'New password must be at least 6 characters long.',
      };
    }

    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return {
        ok: false,
        error:
          lang === 'ar'
            ? 'لم يتم العثور على الحساب المطلوب.'
            : 'Account not found.',
      };
    }

    if (user.otpCode !== cleanOtp) {
      return {
        ok: false,
        error:
          lang === 'ar'
            ? 'رمز التحقق غير صحيح. يرجى التأكد من الكود الوارد على بريد Gmail.'
            : 'Invalid verification code. Please check your Gmail inbox.',
      };
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? {
              ...u,
              passwordHash: newPassword,
              verified: true,
              otpCode: undefined,
            }
          : u
      )
    );

    setCurrentUserId(user.id);
    setPendingUserId(null);
    setLastDispatchedEmail(null);
    return { ok: true };
  };

  const logoutUser = () => {
    setCurrentUserId(null);
    setPendingUserId(null);
  };

  const quickDemoLogin = (type: 'client' | 'admin') => {
    if (type === 'admin') {
      const adminAcc = users.find(
        (u) => u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
      );
      if (adminAcc) {
        setCurrentUserId(adminAcc.id);
        setPendingUserId(null);
      }
    } else {
      const clientAcc = users.find(
        (u) => u.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase() && u.verified
      );
      if (clientAcc) {
        setCurrentUserId(clientAcc.id);
        setPendingUserId(null);
      }
    }
  };

  const dismissEmailBanner = () => {
    setLastDispatchedEmail(null);
  };

  const createOrder = (input: CreateOrderInput): VirtualOrder => {
    if (!currentUser) {
      throw new Error('User must be authenticated to place an order');
    }

    const platform =
      SOCIAL_PLATFORMS.find((p) => p.id === input.platformId) ||
      SOCIAL_PLATFORMS[0];
    const country = COUNTRIES_CATALOG[input.countryCode];
    const plan = country.plans[input.planDuration];
    const payment =
      PAYMENT_METHODS.find((m) => m.id === input.paymentMethod) ||
      PAYMENT_METHODS[0];

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newOrder: VirtualOrder = {
      id: `ORD-${randomNum}`,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userName: currentUser.fullName,
      platformId: platform.id,
      platformName: platform.name,
      platformArabicName: platform.arabicName,
      countryCode: country.code,
      countryName: country.name,
      countryArabicName: country.arabicName,
      dialCode: country.dialCode,
      planDuration: input.planDuration,
      planLabel: plan.label,
      planArabicLabel: plan.arabicLabel,
      priceMru: plan.priceMru,
      paymentMethod: payment.id,
      paymentMethodName: payment.name,
      paymentMethodArabicName: payment.arabicName,
      receiverNumber: RECEIVER_PHONE_NUMBER,
      senderPhone: input.senderPhone.trim(),
      preferredNumber: '',
      transactionId: input.transactionId.trim(),
      receiptDataUrl: input.receiptDataUrl,
      receiptFileName: input.receiptFileName,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Dispatch instant notification to the Admin when a user submits an order
    const adminNotif: AppNotification = {
      id: `notif_adm_${Date.now()}`,
      recipientType: 'admin',
      orderId: newOrder.id,
      title: `New Order Received (${newOrder.id})`,
      arabicTitle: `طلب جديد وارد (${newOrder.id})`,
      message: `${currentUser.email} submitted ${plan.priceMru} MRU via ${payment.name} for ${platform.name} (${country.name}).`,
      arabicMessage: `أرسل ${currentUser.email} طلباً جديداً لتطبيق ${platform.arabicName} (${country.arabicName}) بقيمة ${plan.priceMru} MRU عبر ${payment.arabicName}.`,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setNotifications((prev) => [adminNotif, ...prev]);
    playNotificationSound();
    triggerBrowserNotification(
      lang === 'ar' ? adminNotif.arabicTitle : adminNotif.title,
      lang === 'ar' ? adminNotif.arabicMessage : adminNotif.message
    );

    return newOrder;
  };

  const updateOrderAdmin = (
    orderId: string,
    updates: {
      status: OrderStatus;
      assignedVirtualNumber?: string;
      activationCode?: string;
      smsMessage?: string;
      adminNotes?: string;
    }
  ) => {
    let targetOrder: VirtualOrder | null = null;

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        targetOrder = order;
        const durationDays = order.planDuration === 'monthly' ? 30 : 7;
        const expiresAt =
          updates.status === 'Approved'
            ? new Date(
                Date.now() + durationDays * 24 * 60 * 60 * 1000
              ).toISOString()
            : order.expiresAt;

        const nextNumber =
          updates.assignedVirtualNumber !== undefined
            ? updates.assignedVirtualNumber.trim()
            : order.assignedVirtualNumber || '';

        const rawCode =
          updates.activationCode?.trim() ||
          updates.smsMessage?.trim() ||
          order.activationCode ||
          '';

        let nextInbox = order.smsInbox || [];
        if (updates.status === 'Approved' && rawCode) {
          const timeStr = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
          const companySms = formatOfficialCompanySms(
            order.platformId,
            rawCode
          );

          const newSms: SmsMessageItem = {
            id: `sms_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            sender: companySms.sender,
            body: companySms.body,
            arabicBody: companySms.arabicBody,
            otpCode: companySms.cleanCode,
            receivedAt: `${timeStr} GMT`,
          };
          nextInbox = [newSms, ...nextInbox];
        }

        return {
          ...order,
          status: updates.status,
          assignedVirtualNumber: nextNumber,
          activationCode: rawCode,
          smsInbox: nextInbox,
          adminNotes:
            updates.adminNotes !== undefined
              ? updates.adminNotes.trim()
              : order.adminNotes,
          updatedAt: new Date().toISOString(),
          expiresAt,
        };
      })
    );

    // Dispatch real-time notification to the User when Admin approves or updates their order
    if (targetOrder) {
      const ord = targetOrder as VirtualOrder;
      const assignedNum =
        updates.assignedVirtualNumber?.trim() ||
        ord.assignedVirtualNumber ||
        '';
      const codeOnly =
        updates.activationCode?.trim() ||
        updates.smsMessage?.trim() ||
        ord.activationCode ||
        '';
      const companySms = formatOfficialCompanySms(ord.platformId, codeOnly);

      if (updates.status === 'Approved') {
        const userNotif: AppNotification = {
          id: `notif_usr_${Date.now()}`,
          recipientType: 'user',
          recipientEmail: ord.userEmail,
          orderId: ord.id,
          title: `${companySms.sender} — New Verification SMS`,
          arabicTitle: `رسالة SMS واردة من شركة ${companySms.sender}`,
          message: `Number: ${assignedNum} — ${companySms.body.split('\n')[0]}`,
          arabicMessage: `الرقم: ${assignedNum} — ${companySms.arabicBody.split('\n')[0]}`,
          read: false,
          createdAt: new Date().toISOString(),
        };
        setNotifications((prev) => [userNotif, ...prev]);
        playNotificationSound();
        triggerBrowserNotification(
          lang === 'ar' ? userNotif.arabicTitle : userNotif.title,
          lang === 'ar' ? userNotif.arabicMessage : userNotif.message
        );
      } else if (updates.status === 'Rejected') {
        const rejectNotif: AppNotification = {
          id: `notif_usr_${Date.now()}`,
          recipientType: 'user',
          recipientEmail: ord.userEmail,
          orderId: ord.id,
          title: `Order ${ord.id} Update`,
          arabicTitle: `تحديث بخصوص طلبك (${ord.id})`,
          message: `Your order ${ord.id} could not be verified. Please check your transaction reference.`,
          arabicMessage: `تعذر التحقق من وصل التحويل للطلب ${ord.id}. يرجى مراجعة رقم العملية.`,
          read: false,
          createdAt: new Date().toISOString(),
        };
        setNotifications((prev) => [rejectNotif, ...prev]);
        playNotificationSound();
      }
    }
  };

  const deleteOrderAdmin = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const requestNewSmsOtp = (orderId: string): SmsMessageItem | null => {
    let createdMsg: SmsMessageItem | null = null;
    const freshOtp = `${Math.floor(100 + Math.random() * 899)}-${Math.floor(
      100 + Math.random() * 899
    )}`;

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const msg = buildSmsMessage(order.platformId, freshOtp);
        createdMsg = msg;
        return {
          ...order,
          activationCode: freshOtp,
          smsInbox: [msg, ...(order.smsInbox || [])],
          updatedAt: new Date().toISOString(),
        };
      })
    );

    return createdMsg;
  };

  return (
    <RimPhoneContext.Provider
      value={{
        lang,
        setLang,
        isRtl: lang === 'ar',
        users,
        orders,
        currentUser,
        pendingVerificationUser,
        lastDispatchedEmail,
        isAdmin,
        notifications,
        myNotifications,
        unreadNotificationsCount,
        notificationsEnabled,
        enableNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        registerUser,
        loginUser,
        verifyEmailOtp,
        resendVerificationOtp,
        requestPasswordResetOtp,
        confirmPasswordResetWithOtp,
        logoutUser,
        quickDemoLogin,
        dismissEmailBanner,
        createOrder,
        updateOrderAdmin,
        deleteOrderAdmin,
        requestNewSmsOtp,
      }}
    >
      {children}
    </RimPhoneContext.Provider>
  );
};

export const useRimPhone = (): RimPhoneContextValue => {
  const ctx = useContext(RimPhoneContext);
  if (!ctx) {
    throw new Error('useRimPhone must be used within a RimPhoneProvider');
  }
  return ctx;
};
