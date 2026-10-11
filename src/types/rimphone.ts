export type AppLanguage = 'ar' | 'en';

export type SocialPlatformId =
  | 'whatsapp'
  | 'telegram'
  | 'twitter'
  | 'imo'
  | 'tiktok'
  | 'instagram'
  | 'facebook';

export interface SocialPlatform {
  id: SocialPlatformId;
  name: string;
  arabicName: string;
  category: string;
  arabicCategory: string;
  deliveryEstimate: string;
  arabicDeliveryEstimate: string;
  successRate: string;
  senderShortcode: string;
}

export type CountryCode = 'CA' | 'US';

export type PlanDuration = 'weekly' | 'monthly';

export interface CarrierNumberSlot {
  id: string;
  phoneNumber: string;
  city: string;
  arabicCity: string;
  carrier: string;
  signalQuality: string;
}

export interface CountryPricing {
  code: CountryCode;
  name: string;
  arabicName: string;
  dialCode: string;
  flag: string;
  regionLabel: string;
  arabicRegionLabel: string;
  availablePoolCount: number;
  sampleNumbers: CarrierNumberSlot[];
  plans: {
    weekly: {
      priceMru: number;
      label: string;
      arabicLabel: string;
      durationDays: number;
      features: string[];
      arabicFeatures: string[];
    };
    monthly: {
      priceMru: number;
      label: string;
      arabicLabel: string;
      durationDays: number;
      features: string[];
      arabicFeatures: string[];
    };
  };
}

export type PaymentMethodId = 'bankily' | 'masrvi' | 'sedad';

export interface PaymentMethodConfig {
  id: PaymentMethodId;
  name: string;
  arabicName: string;
  bankIssuer: string;
  arabicBankIssuer: string;
  codePrefix: string;
  accentHex: string;
  receiverAccount: string;
  beneficiaryName: string;
  steps: string[];
  arabicSteps: string[];
}

export type OrderStatus = 'Pending' | 'Approved' | 'Rejected';

export interface SmsMessageItem {
  id: string;
  sender: string;
  body: string;
  arabicBody: string;
  otpCode: string;
  receivedAt: string;
}

export interface VirtualOrder {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  platformId: SocialPlatformId;
  platformName: string;
  platformArabicName: string;
  countryCode: CountryCode;
  countryName: string;
  countryArabicName: string;
  dialCode: string;
  planDuration: PlanDuration;
  planLabel: string;
  planArabicLabel: string;
  priceMru: number;
  paymentMethod: PaymentMethodId;
  paymentMethodName: string;
  paymentMethodArabicName: string;
  receiverNumber: string;
  senderPhone?: string;
  preferredNumber?: string;
  transactionId: string;
  receiptDataUrl: string;
  receiptFileName: string;
  status: OrderStatus;
  assignedVirtualNumber?: string;
  activationCode?: string;
  carrierName?: string;
  cityRegion?: string;
  smsInbox?: SmsMessageItem[];
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface UserAccount {
  id: string;
  email: string;
  fullName: string;
  phoneMauritania?: string;
  passwordHash: string;
  verified: boolean;
  otpCode?: string;
  otpExpiresAt?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface AppNotification {
  id: string;
  recipientType: 'admin' | 'user';
  recipientEmail?: string;
  orderId: string;
  title: string;
  arabicTitle: string;
  message: string;
  arabicMessage: string;
  read: boolean;
  createdAt: string;
}

