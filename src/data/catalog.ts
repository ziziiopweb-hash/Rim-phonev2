import {
  CountryPricing,
  PaymentMethodConfig,
  SocialPlatform,
  UserAccount,
  VirtualOrder,
} from '../types/rimphone';

export const ADMIN_EMAIL = 'jackwilliam2026a@gmail.com';
export const RECEIVER_PHONE_NUMBER = '31520844';
export const BENEFICIARY_HOLDING_NAME = 'Rim Phone Telecom SARL';

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    arabicName: 'واتساب للأعمال والعادي',
    category: 'Encrypted Messaging',
    arabicCategory: 'مراسلة فورية وتجارية',
    deliveryEstimate: '< 2 mins after approval',
    arabicDeliveryEstimate: 'أقل من دقيقتين بعد التأكيد',
    successRate: '99.8%',
    senderShortcode: 'WhatsApp',
  },
  {
    id: 'telegram',
    name: 'Telegram',
    arabicName: 'تيليجرام',
    category: 'Cloud Messenger',
    arabicCategory: 'تطبيق المراسلة السحابي',
    deliveryEstimate: '< 1 min after approval',
    arabicDeliveryEstimate: 'أقل من دقيقة بعد التأكيد',
    successRate: '99.9%',
    senderShortcode: 'Telegram',
  },
  {
    id: 'twitter',
    name: 'Twitter X',
    arabicName: 'تويتر إكس (Twitter X)',
    category: 'Social & Verification',
    arabicCategory: 'توثيق الحسابات والمنشورات',
    deliveryEstimate: '< 1 min after approval',
    arabicDeliveryEstimate: 'أقل من دقيقة بعد التأكيد',
    successRate: '99.8%',
    senderShortcode: 'X',
  },
  {
    id: 'imo',
    name: 'Imo',
    arabicName: 'إيمو (Imo HD)',
    category: 'HD Video & Voice',
    arabicCategory: 'مكالمات فيديو وصوت',
    deliveryEstimate: '< 2 mins after approval',
    arabicDeliveryEstimate: 'أقل من دقيقتين بعد التأكيد',
    successRate: '99.5%',
    senderShortcode: 'imo',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    arabicName: 'تيك توك',
    category: 'Creator & Live',
    arabicCategory: 'صناع المحتوى والبث المباشر',
    deliveryEstimate: '< 3 mins after approval',
    arabicDeliveryEstimate: 'أقل من 3 دقائق بعد التأكيد',
    successRate: '99.4%',
    senderShortcode: 'TikTok',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    arabicName: 'إنستغرام',
    category: 'Meta Social Suite',
    arabicCategory: 'منصة التواصل والصور',
    deliveryEstimate: '< 3 mins after approval',
    arabicDeliveryEstimate: 'أقل من 3 دقائق بعد التأكيد',
    successRate: '99.6%',
    senderShortcode: 'Instagram',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    arabicName: 'فيسبوك وميتا بزنس',
    category: 'Meta Identity & Ads',
    arabicCategory: 'حسابات الإعلانات والصفحات',
    deliveryEstimate: '< 3 mins after approval',
    arabicDeliveryEstimate: 'أقل من 3 دقائق بعد التأكيد',
    successRate: '99.7%',
    senderShortcode: 'Facebook',
  },
];

export function formatOfficialCompanySms(
  platformId: string,
  rawCodeInput: string
): {
  sender: string;
  cleanCode: string;
  body: string;
  arabicBody: string;
} {
  const cleanCode = rawCodeInput.trim() || '---';

  switch (platformId) {
    case 'whatsapp':
      return {
        sender: 'WhatsApp',
        cleanCode,
        body: `<#> Your WhatsApp code: ${cleanCode}\nYou can also tap on this link to verify your phone: v.whatsapp.com/${cleanCode.replace(/\D/g, '')}\nDon't share this code with others\n4sgLq1p5sV6`,
        arabicBody: `<#> كود واتساب الخاص بك هو: ${cleanCode}\nلا تشارك هذا الرمز مع أي شخص لحماية حسابك.\nv.whatsapp.com/${cleanCode.replace(/\D/g, '')}\n4sgLq1p5sV6`,
      };
    case 'telegram':
      return {
        sender: 'Telegram',
        cleanCode,
        body: `Telegram code: ${cleanCode}\nYou can also tap on this link to log in:\nhttps://t.me/login/${cleanCode.replace(/\D/g, '')}\nDo not give this code to anyone, even if they say they are from Telegram!\noLeq9AcOZkT`,
        arabicBody: `Telegram code: ${cleanCode}\nرمز الدخول إلى تيليجرام هو: ${cleanCode}\nلا تعطِ هذا الرمز لأي شخص نهائياً، حتى لو ادعى أنه من دعم تيليجرام!\noLeq9AcOZkT`,
      };
    case 'twitter':
      return {
        sender: 'X (Twitter)',
        cleanCode,
        body: `Your X confirmation code is ${cleanCode}. Do not share this code with anyone.\n@x.com #${cleanCode.replace(/\D/g, '')}`,
        arabicBody: `رمز تأكيد حساب X (تويتر) الخاص بك هو ${cleanCode}. لا تشارك هذا الرمز مع أي شخص.\n@x.com #${cleanCode.replace(/\D/g, '')}`,
      };
    case 'imo':
      return {
        sender: 'imo',
        cleanCode,
        body: `<#> imo verification code: ${cleanCode}.\nNever share this code with anyone.\nW5EUe21Qadh`,
        arabicBody: `<#> رمز تفعيل imo الخاص بك هو: ${cleanCode}.\nيرجى عدم مشاركة هذا الرمز مع أي شخص.\nW5EUe21Qadh`,
      };
    case 'tiktok':
      return {
        sender: 'TikTok',
        cleanCode,
        body: `[TikTok] ${cleanCode} is your verification code, valid for 5 minutes. To keep your account safe, never forward this code.`,
        arabicBody: `[TikTok] ${cleanCode} هو رمز التحقق الخاص بك، صالح لمدة 5 دقائق. للحفاظ على أمان حسابك، لا تقم بإعادة توجيه هذا الرمز أبداً.`,
      };
    case 'instagram':
      return {
        sender: 'Instagram',
        cleanCode,
        body: `${cleanCode} is your Instagram code. Don't share it.\nSIYRxKrru1t`,
        arabicBody: `${cleanCode} هو رمز Instagram الخاص بك. لا تشاركه مع أحد.\nSIYRxKrru1t`,
      };
    case 'facebook':
      return {
        sender: 'Facebook',
        cleanCode,
        body: `${cleanCode} is your Facebook confirmation code. Laz+nxCarLW`,
        arabicBody: `${cleanCode} هو رمز تأكيد فيسبوك (Facebook) الخاص بك. Laz+nxCarLW`,
      };
    default:
      return {
        sender: 'Verification',
        cleanCode,
        body: `<#> Your verification code is ${cleanCode}. Do not share this code with anyone.`,
        arabicBody: `<#> رمز التحقق الخاص بك هو ${cleanCode}. لا تشارك هذا الرمز مع أي شخص.`,
      };
  }
}

export const COUNTRIES_CATALOG: Record<'CA' | 'US', CountryPricing> = {
  CA: {
    code: 'CA',
    name: 'Canada',
    arabicName: 'كندا',
    dialCode: '+1',
    flag: '🇨🇦',
    regionLabel: 'North America · Bell & Rogers Real SIM Pool',
    arabicRegionLabel: 'أمريكا الشمالية · شرائح فعلية Bell / Rogers',
    availablePoolCount: 42,
    sampleNumbers: [
      {
        id: 'ca_1',
        phoneNumber: '+1 (438) 809-4412',
        city: 'Montreal, QC',
        arabicCity: 'مونتريال - كيبك',
        carrier: 'Bell Mobility CA',
        signalQuality: 'LTE+ Non-VoIP',
      },
      {
        id: 'ca_2',
        phoneNumber: '+1 (416) 931-7820',
        city: 'Toronto, ON',
        arabicCity: 'تورونتو - أونتاريو',
        carrier: 'Rogers Wireless',
        signalQuality: '5G Non-VoIP',
      },
      {
        id: 'ca_3',
        phoneNumber: '+1 (613) 504-2198',
        city: 'Ottawa, ON',
        arabicCity: 'أوتاوا - العاصمة',
        carrier: 'Telus Mobility',
        signalQuality: 'LTE+ Non-VoIP',
      },
      {
        id: 'ca_4',
        phoneNumber: '+1 (604) 729-6601',
        city: 'Vancouver, BC',
        arabicCity: 'فانكوفر',
        carrier: 'Bell Mobility CA',
        signalQuality: '5G Non-VoIP',
      },
    ],
    plans: {
      weekly: {
        priceMru: 150,
        label: 'Weekly Plan',
        arabicLabel: 'الباقة الأسبوعية (7 أيام)',
        durationDays: 7,
        features: [
          'Dedicated Canadian (+1) physical SIM number',
          'Full 7-day active SMS & OTP inbox access',
          'Instant replacement guarantee if code is delayed',
        ],
        arabicFeatures: [
          'رقم كندي (+1) خاص من شريحة فعلية غير مشترك',
          'استقبال رسائل التفعيل (OTP) طوال 7 أيام كاملة',
          'ضمان التفعيل الفوري أو استبدال الرقم مجاناً',
        ],
      },
      monthly: {
        priceMru: 300,
        label: 'Monthly Plan',
        arabicLabel: 'الباقة الشهرية (30 يوماً)',
        durationDays: 30,
        features: [
          'Exclusive Canadian (+1) private number for 30 days',
          'Unlimited OTP re-verifications throughout the month',
          'Priority renewal & account security protection',
        ],
        arabicFeatures: [
          'حجز الرقم الكندي (+1) باسمك حصرياً لمدة 30 يوماً',
          'استقبال غير محدود لرموز التحقق طوال فترة الاشتراك',
          'إمكانية تجديد نفس الرقم شهرياً لحماية حسابك',
        ],
      },
    },
  },
  US: {
    code: 'US',
    name: 'United States',
    arabicName: 'الولايات المتحدة الأمريكية',
    dialCode: '+1',
    flag: '🇺🇸',
    regionLabel: 'North America · AT&T & T-Mobile Tier-1 Pool',
    arabicRegionLabel: 'أمريكا الشمالية · خطوط AT&T و T-Mobile الأصلية',
    availablePoolCount: 58,
    sampleNumbers: [
      {
        id: 'us_1',
        phoneNumber: '+1 (212) 694-8310',
        city: 'New York, NY',
        arabicCity: 'نيويورك',
        carrier: 'T-Mobile USA',
        signalQuality: '5G Non-VoIP',
      },
      {
        id: 'us_2',
        phoneNumber: '+1 (305) 842-1904',
        city: 'Miami, FL',
        arabicCity: 'ميامي - فلوريدا',
        carrier: 'AT&T Mobility',
        signalQuality: '5G Non-VoIP',
      },
      {
        id: 'us_3',
        phoneNumber: '+1 (310) 598-4471',
        city: 'Los Angeles, CA',
        arabicCity: 'لوس أنجلوس - كاليفورنيا',
        carrier: 'Verizon Wireless',
        signalQuality: 'LTE+ Non-VoIP',
      },
      {
        id: 'us_4',
        phoneNumber: '+1 (312) 771-9053',
        city: 'Chicago, IL',
        arabicCity: 'شيكاغو',
        carrier: 'AT&T Mobility',
        signalQuality: '5G Non-VoIP',
      },
    ],
    plans: {
      weekly: {
        priceMru: 200,
        label: 'Weekly Plan',
        arabicLabel: 'الباقة الأسبوعية (7 أيام)',
        durationDays: 7,
        features: [
          'Dedicated US (+1) mobile carrier line',
          '7-day continuous SMS & OTP reception',
          'Compatible with US business & creator accounts',
        ],
        arabicFeatures: [
          'رقم أمريكي (+1) أصلي مخصص لك',
          'صندوق وارد مباشر لاستقبال الكود لمدة 7 أيام',
          'يدعم حسابات تيك توك الأمريكية وواتساب للأعمال',
        ],
      },
      monthly: {
        priceMru: 300,
        label: 'Monthly Plan',
        arabicLabel: 'الباقة الشهرية (30 يوماً)',
        durationDays: 30,
        features: [
          'Exclusive US (+1) number reserved for 30 days',
          'Multiple OTP codes & 2FA recovery support',
          'Priority fulfillment & monthly extension option',
        ],
        arabicFeatures: [
          'رقم أمريكي (+1) محجوز بالكامل لحسابك لمدة 30 يوماً',
          'استقبال متعدد للكود مع دعم استرداد الحساب (2FA)',
          'أولوية في التفعيل وإمكانية التمديد الشهري',
        ],
      },
    },
  },
};

export const PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: 'bankily',
    name: 'Bankily',
    arabicName: 'بنكيلي (Bankily)',
    bankIssuer: 'BPM — Banque Populaire de Mauritanie',
    arabicBankIssuer: 'البنك الشعبي الموريتاني (BPM)',
    codePrefix: 'BNK',
    accentHex: '#F97316',
    receiverAccount: RECEIVER_PHONE_NUMBER,
    beneficiaryName: BENEFICIARY_HOLDING_NAME,
    steps: [
      'Open your Bankily application and sign in with your PIN.',
      `Select "Transfert d'argent" and enter beneficiary phone number: ${RECEIVER_PHONE_NUMBER}.`,
      'Send the exact plan amount in MRU, then copy the Transaction ID (ID de transaction) and attach a screenshot.',
    ],
    arabicSteps: [
      'افتح تطبيق بنكيلي (Bankily) وسجل الدخول برمزك السري.',
      `اختر "تحويل الأموال" (Transfert d'argent) وأدخل رقم المستلم: ${RECEIVER_PHONE_NUMBER}.`,
      'أرسل المبلغ المطلوب بالضبط بالأوقية الجديدة (MRU)، ثم انسخ رقم العملية (ID Transaction) وأرفق لقطة شاشة للوصل.',
    ],
  },
  {
    id: 'masrvi',
    name: 'Masrvi',
    arabicName: 'مصرفي (Masrvi)',
    bankIssuer: 'BMCI — Banque Mauritanienne pour le Commerce International',
    arabicBankIssuer: 'البنك الموريتاني للتجارة الدولية (BMCI)',
    codePrefix: 'MSR',
    accentHex: '#EAB308',
    receiverAccount: RECEIVER_PHONE_NUMBER,
    beneficiaryName: BENEFICIARY_HOLDING_NAME,
    steps: [
      'Open your Masrvi digital wallet app.',
      `Tap "Envoyer de l'argent" and type receiver number: ${RECEIVER_PHONE_NUMBER}.`,
      'Confirm the MRU transfer, then enter the Masrvi Reference ID and upload the receipt screenshot below.',
    ],
    arabicSteps: [
      'افتح تطبيق محفظة مصرفي (Masrvi) على هاتفك.',
      `اضغط على "إرسال الأموال" وأدخل رقم الحساب المستلم: ${RECEIVER_PHONE_NUMBER}.`,
      'أكمل التحويل بالمبلغ المحدد بالـ MRU، ثم أدخل رقم مرجع العملية وأرفق صورة وصل التحويل.',
    ],
  },
  {
    id: 'sedad',
    name: 'Sedad',
    arabicName: 'سداد (Sedad)',
    bankIssuer: 'BMI — Banque Mauritanienne d’Investissement',
    arabicBankIssuer: 'البنك الموريتاني للاستثمار (BMI)',
    codePrefix: 'SDD',
    accentHex: '#F59E0B',
    receiverAccount: RECEIVER_PHONE_NUMBER,
    beneficiaryName: BENEFICIARY_HOLDING_NAME,
    steps: [
      'Launch the Sedad mobile banking app.',
      `Select "Transfert" and enter receiver phone number: ${RECEIVER_PHONE_NUMBER}.`,
      'Validate the payment in MRU, copy the Sedad reference code, and upload your receipt image.',
    ],
    arabicSteps: [
      'افتح تطبيق سداد (Sedad) البنكي على هاتفك.',
      `اختر خدمة "تحويل" وأدخل رقم المستفيد: ${RECEIVER_PHONE_NUMBER}.`,
      'أكد العملية بالأوقية الجديدة (MRU)، ثم انسخ رمز المرجع من الإشعار وأرفق لقطة الشاشة.',
    ],
  },
];

export function createSampleReceiptSvg(
  gateway: string,
  txId: string,
  amountMru: number,
  dateStr: string,
  accentColor: string,
  senderPhone = '36 81 40 22'
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="350" viewBox="0 0 500 350">
    <rect width="500" height="350" rx="18" fill="#0C0A09"/>
    <rect x="16" y="16" width="468" height="318" rx="14" fill="#181310" stroke="${accentColor}" stroke-width="1.5" stroke-opacity="0.45"/>
    <rect x="34" y="34" width="432" height="44" rx="8" fill="#271F1A"/>
    <text x="50" y="61" fill="${accentColor}" font-family="monospace" font-size="16" font-weight="bold">${gateway.toUpperCase()} MAURITANIE — REÇU OFFICIEL</text>
    <text x="50" y="108" fill="#A8A29E" font-family="sans-serif" font-size="13">Expéditeur (Client):</text>
    <text x="275" y="108" fill="#F5F5F4" font-family="monospace" font-size="14">+222 ${senderPhone}</text>
    <text x="50" y="142" fill="#A8A29E" font-family="sans-serif" font-size="13">Bénéficiaire (Rim Phone):</text>
    <text x="275" y="142" fill="#FAFAF9" font-family="monospace" font-size="16" font-weight="bold">31520844</text>
    <text x="50" y="176" fill="#A8A29E" font-family="sans-serif" font-size="13">Montant Transféré:</text>
    <text x="275" y="176" fill="#FBBF24" font-family="monospace" font-size="17" font-weight="bold">${amountMru}.00 MRU (أوقية)</text>
    <text x="50" y="210" fill="#A8A29E" font-family="sans-serif" font-size="13">Réf / ID Transaction:</text>
    <text x="275" y="210" fill="#FB923C" font-family="monospace" font-size="14" font-weight="bold">${txId}</text>
    <text x="50" y="244" fill="#A8A29E" font-family="sans-serif" font-size="13">Date &amp; Heure (GMT):</text>
    <text x="275" y="244" fill="#D6D3D1" font-family="monospace" font-size="13">${dateStr}</text>
    <line x1="50" y1="266" x2="450" y2="266" stroke="#44403C" stroke-dasharray="4 4" stroke-width="1"/>
    <rect x="50" y="280" width="210" height="32" rx="6" fill="#451A03"/>
    <text x="68" y="301" fill="#FBBF24" font-family="monospace" font-size="12" font-weight="bold">STATUT: TRANSFERT VALIDÉ</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr_admin_01',
    email: ADMIN_EMAIL,
    fullName: 'Jack William (Rim Phone Admin)',
    phoneMauritania: '31520844',
    passwordHash: 'admin2026',
    verified: true,
    role: 'admin',
    createdAt: '2026-09-01T08:00:00.000Z',
  },
  {
    id: 'usr_client_01',
    email: 'ahmed.ould.sidi@rimmail.mr',
    fullName: 'أحمد ولد سيدي (Ahmed Ould Sidi)',
    phoneMauritania: '36449102',
    passwordHash: 'demo1234',
    verified: true,
    role: 'user',
    createdAt: '2026-10-02T11:20:00.000Z',
  },
  {
    id: 'usr_client_02',
    email: 'mariem.mint.ali@rimmail.mr',
    fullName: 'مريم منت علي (Mariem Mint Ali)',
    phoneMauritania: '46128890',
    passwordHash: 'demo1234',
    verified: true,
    role: 'user',
    createdAt: '2026-10-05T15:45:00.000Z',
  },
];

export const INITIAL_ORDERS: VirtualOrder[] = [
  {
    id: 'ORD-9048',
    userId: 'usr_client_01',
    userEmail: 'ahmed.ould.sidi@rimmail.mr',
    userName: 'أحمد ولد سيدي (Ahmed Ould Sidi)',
    platformId: 'whatsapp',
    platformName: 'WhatsApp',
    platformArabicName: 'واتساب للأعمال والعادي',
    countryCode: 'CA',
    countryName: 'Canada',
    countryArabicName: 'كندا',
    dialCode: '+1',
    planDuration: 'monthly',
    planLabel: 'Monthly Plan',
    planArabicLabel: 'الباقة الشهرية (30 يوماً)',
    priceMru: 300,
    paymentMethod: 'bankily',
    paymentMethodName: 'Bankily',
    paymentMethodArabicName: 'بنكيلي (Bankily)',
    receiverNumber: RECEIVER_PHONE_NUMBER,
    senderPhone: '36 44 91 02',
    preferredNumber: '+1 (438) 809-4412',
    transactionId: 'BNK-884920144',
    receiptDataUrl: createSampleReceiptSvg(
      'Bankily',
      'BNK-884920144',
      300,
      '2026-10-08 19:14 GMT',
      '#06B6D4',
      '36 44 91 02'
    ),
    receiptFileName: 'bankily_receipt_884920144.png',
    status: 'Approved',
    assignedVirtualNumber: '+1 (438) 809-4412',
    activationCode: '749-201',
    carrierName: 'Bell Mobility CA',
    cityRegion: 'Montreal, QC',
    smsInbox: [
      {
        id: 'sms_901',
        sender: 'WhatsApp',
        body: '<#> Your WhatsApp Business code is 749-201. You can also tap on this link to verify your phone: b.whatsapp.com/749201. Don\'t share this code with others.\n4sgLq1p5sV6',
        arabicBody: '<#> كود تفعيل واتساب الخاص بك هو 749-201. لا تشارك هذا الرمز مع أي شخص لحماية حسابك.\nv.whatsapp.com/749201\n4sgLq1p5sV6',
        otpCode: '749-201',
        receivedAt: '19:18:04 GMT',
      },
      {
        id: 'sms_900',
        sender: 'WhatsApp',
        body: '<#> Your WhatsApp code: 318-904\nYou can also tap on this link to verify your phone: v.whatsapp.com/318904\nDon\'t share this code with others\n4sgLq1p5sV6',
        arabicBody: '<#> كود واتساب الخاص بك هو: 318-904\nلا تشارك هذا الرمز مع أي شخص لحماية حسابك.\nv.whatsapp.com/318904\n4sgLq1p5sV6',
        otpCode: '318-904',
        receivedAt: '19:15:42 GMT',
      },
    ],
    adminNotes: 'Canadian Montreal carrier line provisioned & WhatsApp OTP pushed.',
    createdAt: '2026-10-08T19:15:00.000Z',
    updatedAt: '2026-10-08T19:18:00.000Z',
    expiresAt: '2026-11-07T19:18:00.000Z',
  },
  {
    id: 'ORD-9051',
    userId: 'usr_client_02',
    userEmail: 'mariem.mint.ali@rimmail.mr',
    userName: 'مريم منت علي (Mariem Mint Ali)',
    platformId: 'telegram',
    platformName: 'Telegram',
    platformArabicName: 'تيليجرام',
    countryCode: 'US',
    countryName: 'United States',
    countryArabicName: 'الولايات المتحدة الأمريكية',
    dialCode: '+1',
    planDuration: 'weekly',
    planLabel: 'Weekly Plan',
    planArabicLabel: 'الباقة الأسبوعية (7 أيام)',
    priceMru: 200,
    paymentMethod: 'masrvi',
    paymentMethodName: 'Masrvi',
    paymentMethodArabicName: 'مصرفي (Masrvi)',
    receiverNumber: RECEIVER_PHONE_NUMBER,
    senderPhone: '46 12 88 90',
    preferredNumber: '+1 (212) 694-8310',
    transactionId: 'MSR-55219087',
    receiptDataUrl: createSampleReceiptSvg(
      'Masrvi',
      'MSR-55219087',
      200,
      '2026-10-09 09:42 GMT',
      '#10B981',
      '46 12 88 90'
    ),
    receiptFileName: 'masrvi_transfer_55219087.jpg',
    status: 'Pending',
    carrierName: 'T-Mobile USA',
    cityRegion: 'New York, NY',
    createdAt: '2026-10-09T09:45:00.000Z',
    updatedAt: '2026-10-09T09:45:00.000Z',
  },
  {
    id: 'ORD-9052',
    userId: 'usr_client_01',
    userEmail: 'ahmed.ould.sidi@rimmail.mr',
    userName: 'أحمد ولد سيدي (Ahmed Ould Sidi)',
    platformId: 'tiktok',
    platformName: 'TikTok',
    platformArabicName: 'تيك توك',
    countryCode: 'CA',
    countryName: 'Canada',
    countryArabicName: 'كندا',
    dialCode: '+1',
    planDuration: 'weekly',
    planLabel: 'Weekly Plan',
    planArabicLabel: 'الباقة الأسبوعية (7 أيام)',
    priceMru: 150,
    paymentMethod: 'sedad',
    paymentMethodName: 'Sedad',
    paymentMethodArabicName: 'سداد (Sedad)',
    receiverNumber: RECEIVER_PHONE_NUMBER,
    senderPhone: '36 44 91 02',
    preferredNumber: '+1 (416) 931-7820',
    transactionId: 'SDD-33019482',
    receiptDataUrl: createSampleReceiptSvg(
      'Sedad',
      'SDD-33019482',
      150,
      '2026-10-09 10:12 GMT',
      '#6366F1',
      '36 44 91 02'
    ),
    receiptFileName: 'sedad_proof_33019482.png',
    status: 'Pending',
    carrierName: 'Rogers Wireless',
    cityRegion: 'Toronto, ON',
    createdAt: '2026-10-09T10:15:00.000Z',
    updatedAt: '2026-10-09T10:15:00.000Z',
  },
];
