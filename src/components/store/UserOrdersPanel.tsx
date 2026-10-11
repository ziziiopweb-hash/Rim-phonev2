import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Bell,
  BellRing,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  History,
  Inbox,
  KeyRound,
  LogIn,
  MessageSquareText,
  Phone,
  Plus,
  RefreshCw,
  ShieldAlert,
  X,
} from 'lucide-react';
import { useRimPhone } from '../../context/RimPhoneContext';
import { COUNTRIES_CATALOG } from '../../data/catalog';
import { VirtualOrder } from '../../types/rimphone';
import { PlatformBrandIcon } from './PlatformBrandIcon';

interface UserOrdersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNewOrderClick: () => void;
  onRequireLogin: () => void;
}

export const UserOrdersPanel: React.FC<UserOrdersPanelProps> = ({
  isOpen,
  onClose,
  onNewOrderClick,
  onRequireLogin,
}) => {
  const {
    lang,
    isRtl,
    orders,
    currentUser,
    requestNewSmsOtp,
    myNotifications,
    unreadNotificationsCount,
    notificationsEnabled,
    enableNotifications,
    markAllNotificationsRead,
  } = useRimPhone();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [refreshingOrderId, setRefreshingOrderId] = useState<string | null>(
    null
  );
  const [previewReceiptOrder, setPreviewReceiptOrder] =
    useState<VirtualOrder | null>(null);
  const [smsHistoryOrderId, setSmsHistoryOrderId] = useState<string | null>(
    null
  );

  const userOrders = currentUser
    ? orders.filter(
        (o) =>
          o.userId === currentUser.id ||
          o.userEmail.toLowerCase() === currentUser.email.toLowerCase()
      )
    : [];

  // Derive the active order for the SMS History Modal so it stays reactive when new OTPs are requested
  const activeHistoryOrder = smsHistoryOrderId
    ? userOrders.find((o) => o.id === smsHistoryOrderId) || null
    : null;

  const handleCopyText = (text: string, tag: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(tag);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRequestFreshOtp = (orderId: string) => {
    setRefreshingOrderId(orderId);
    setTimeout(() => {
      requestNewSmsOtp(orderId);
      setRefreshingOrderId(null);
    }, 650);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          dir={isRtl ? 'rtl' : 'ltr'}
          className="fixed inset-0 z-50 flex overflow-hidden"
        >
          {/* Backdrop Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Side Drawer Panel (Positioned on the side, completely separate from the main screen) */}
          <motion.aside
            initial={{ x: isRtl ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRtl ? '-100%' : '100%' }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`relative z-10 w-full max-w-lg bg-[#141210] ${
              isRtl ? 'mr-auto border-l' : 'ml-auto border-r'
            } border-stone-800 h-full flex flex-col justify-between shadow-2xl`}
          >
            {/* Sticky Drawer Header */}
            <div className="p-5 sm:p-6 border-b border-stone-800 bg-[#141210]/95 backdrop-blur-md flex items-start justify-between gap-4 shrink-0">
              <div>
                <span className="text-xs font-semibold text-orange-400 block">
                  {lang === 'ar'
                    ? 'لوحة الطلبات الجانبية وصندوق الـ SMS'
                    : 'Dedicated Side Orders & SMS Drawer'}
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5">
                  {lang === 'ar'
                    ? `طلباتي وأرقامي المفعلة (${userOrders.length})`
                    : `My Orders & Virtual Numbers (${userOrders.length})`}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 text-stone-400 hover:text-white rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 transition-colors"
                aria-label="Close side orders drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {/* Notification Toggle Strip */}
              {currentUser && (
                <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 rounded-xl bg-stone-900/90 border border-stone-800">
                  <div className="text-xs text-stone-300 font-medium">
                    {lang === 'ar'
                      ? 'تنبيهات قبول الطلب ووصول الـ SMS:'
                      : 'Order Approval & SMS Alerts:'}
                  </div>
                  <button
                    type="button"
                    onClick={enableNotifications}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      notificationsEnabled
                        ? 'bg-orange-950/40 border-orange-500/50 text-amber-300'
                        : 'bg-stone-950 border-stone-700 text-stone-300 hover:border-orange-500'
                    }`}
                  >
                    {notificationsEnabled ? (
                      <>
                        <BellRing className="w-3.5 h-3.5 text-amber-400" />
                        <span>{lang === 'ar' ? 'مفعلة ✓' : 'Active ✓'}</span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-3.5 h-3.5 text-orange-400" />
                        <span>
                          {lang === 'ar' ? 'تفعيل الإشعارات' : 'Enable Alerts'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Live Notifications Feed inside Side Drawer */}
              {currentUser && myNotifications.length > 0 && (
                <div className="p-4 rounded-xl bg-stone-900/90 border border-orange-500/35 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                      <BellRing className="w-3.5 h-3.5 text-orange-400" />
                      <span>
                        {lang === 'ar'
                          ? `الإشعارات الواردة (${unreadNotificationsCount} جديد)`
                          : `Notifications (${unreadNotificationsCount} unread)`}
                      </span>
                    </div>
                    {unreadNotificationsCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        className="text-[11px] text-stone-400 hover:text-white transition-colors"
                      >
                        {lang === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all read'}
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {myNotifications.slice(0, 4).map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-2.5 rounded-lg border text-xs flex items-start justify-between gap-2.5 ${
                          !notif.read
                            ? 'bg-orange-950/30 border-orange-500/40 text-stone-100'
                            : 'bg-stone-950/60 border-stone-800 text-stone-400'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-amber-400">
                            {lang === 'ar' ? notif.arabicTitle : notif.title}
                          </div>
                          <p className="leading-relaxed text-[11px]">
                            {lang === 'ar'
                              ? notif.arabicMessage
                              : notif.message}
                          </p>
                        </div>
                        <span
                          dir="ltr"
                          className="text-[10px] font-mono-tabular text-stone-400 shrink-0"
                        >
                          {new Date(notif.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Content: Guest State vs Empty State vs Orders List */}
              {!currentUser ? (
                <div className="py-12 px-4 text-center space-y-4 bg-stone-900/40 border border-stone-800/80 rounded-xl">
                  <div className="w-12 h-12 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center mx-auto text-amber-400">
                    <Inbox className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5 max-w-sm mx-auto">
                    <h3 className="text-base font-bold text-white">
                      {lang === 'ar'
                        ? 'سجل الدخول لعرض طلباتك وأرقامك'
                        : 'Sign In to View Your Orders'}
                    </h3>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      {lang === 'ar'
                        ? 'في هذه القائمة الجانبية المنفصلة يمكنك متابعة حالة طلباتك واستلام الرقم الدولي ورسالة الـ SMS فور اعتمادها من المدير.'
                        : 'Use this dedicated side drawer to track your orders and receive your virtual number and SMS code upon admin approval.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onRequireLogin();
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-stone-950 font-bold text-xs rounded-xl transition-all inline-flex items-center gap-2 shadow-md shadow-orange-500/15"
                  >
                    <LogIn className="w-4 h-4" />
                    {lang === 'ar'
                      ? 'تسجيل الدخول الآن'
                      : 'Sign In to Account'}
                  </button>
                </div>
              ) : userOrders.length === 0 ? (
                <div className="py-12 px-4 text-center space-y-3 bg-stone-900/40 border border-stone-800/80 rounded-xl">
                  <p className="text-sm font-semibold text-stone-200">
                    {lang === 'ar'
                      ? 'لا توجد طلبات مسجلة حالياً'
                      : 'No Orders Yet'}
                  </p>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    {lang === 'ar'
                      ? 'اختر التطبيق والدولة من الشاشة الرئيسية وأكمل التحويل، وستظهر تفاصيل طلبك ورقمك الدولي وكود الـ SMS في هذه الخانة الجانبية.'
                      : 'Select your target app and country on the main screen. Your order, assigned number, and SMS inbox will appear right here.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNewOrderClick();
                    }}
                    className="mt-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-stone-950 font-bold text-xs rounded-lg transition-all inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {lang === 'ar'
                      ? 'اطلب رقمك الأول الآن'
                      : 'Order First Number'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userOrders.map((order) => {
                    const isApproved = order.status === 'Approved';
                    const isRejected = order.status === 'Rejected';
                    const displayPhone = order.assignedVirtualNumber;
                    const smsCount = order.smsInbox?.length || 0;

                    return (
                      <div
                        key={order.id}
                        className="p-4 rounded-xl bg-stone-900/85 border border-stone-800 flex flex-col justify-between gap-3.5"
                      >
                        <div>
                          {/* Top Metadata Line */}
                          <div className="flex items-center justify-between gap-2 text-xs text-stone-400 pb-2.5 border-b border-stone-800/80">
                            <div className="flex items-center gap-1.5 font-mono-tabular">
                              <span className="text-stone-200 font-semibold">
                                {order.id}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>
                                {lang === 'ar'
                                  ? order.paymentMethodArabicName ||
                                    order.paymentMethodName
                                  : order.paymentMethodName}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 font-semibold">
                              {isApproved && (
                                <span className="text-emerald-400 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  {lang === 'ar'
                                    ? 'مقبول ومفعل'
                                    : 'Approved'}
                                </span>
                              )}
                              {order.status === 'Pending' && (
                                <span className="text-amber-400 flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {lang === 'ar'
                                    ? 'قيد مراجعة الإدارة'
                                    : 'Pending'}
                                </span>
                              )}
                              {isRejected && (
                                <span className="text-rose-400 flex items-center gap-1">
                                  <ShieldAlert className="w-3.5 h-3.5" />
                                  {lang === 'ar' ? 'مرفوض' : 'Rejected'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Main Order Details */}
                          <div className="mt-3 flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <PlatformBrandIcon
                                  platformId={order.platformId}
                                  size="sm"
                                />
                                <span>
                                  {COUNTRIES_CATALOG[order.countryCode]?.flag ||
                                    '🌐'}{' '}
                                  {lang === 'ar'
                                    ? `${
                                        order.countryArabicName ||
                                        order.countryName
                                      } — ${
                                        order.platformArabicName ||
                                        order.platformName
                                      }`
                                    : `${order.countryName} — ${order.platformName}`}
                                </span>
                              </h3>
                              <p className="text-xs text-stone-400 mt-1">
                                {lang === 'ar'
                                  ? order.planArabicLabel || order.planLabel
                                  : order.planLabel}{' '}
                                · TX:{' '}
                                <span
                                  dir="ltr"
                                  className="font-mono-tabular text-stone-300"
                                >
                                  {order.transactionId}
                                </span>
                              </p>
                            </div>
                            <div
                              className="text-end font-mono-tabular shrink-0"
                              dir="ltr"
                            >
                              <span className="text-sm font-bold text-amber-400">
                                {order.priceMru} MRU
                              </span>
                            </div>
                          </div>

                          {/* Assigned Virtual Number & Live SMS Inbox Terminal */}
                          {isApproved && displayPhone ? (
                            <div className="mt-3.5 p-3.5 rounded-xl bg-stone-950 border border-orange-500/35 space-y-3">
                              {/* Line Number */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 text-xs text-stone-400">
                                  <Phone className="w-3.5 h-3.5 text-orange-400" />
                                  <span>
                                    {lang === 'ar' ? 'الرقم:' : 'Number:'}
                                  </span>
                                </div>
                                <div
                                  className="flex items-center gap-1.5"
                                  dir="ltr"
                                >
                                  <span className="font-mono-tabular text-sm font-bold text-white">
                                    {displayPhone}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCopyText(
                                        displayPhone,
                                        `${order.id}-num`
                                      )
                                    }
                                    className="p-1 text-stone-300 hover:text-white rounded bg-stone-800"
                                    title="Copy phone number"
                                  >
                                    {copiedId === `${order.id}-num` ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </div>

                              {/* Latest Activation OTP Code */}
                              <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-800/80">
                                <div className="flex items-center gap-1.5 text-xs text-stone-400">
                                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                                  <span>
                                    {lang === 'ar'
                                      ? 'كود التفعيل الأخير:'
                                      : 'Latest OTP Code:'}
                                  </span>
                                </div>
                                <div
                                  className="flex items-center gap-1.5"
                                  dir="ltr"
                                >
                                  <span className="font-mono-tabular text-sm font-bold tracking-widest text-amber-400 bg-orange-950/50 px-2 py-0.5 rounded border border-orange-700/40">
                                    {order.activationCode || 'Waiting...'}
                                  </span>
                                  {order.activationCode && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleCopyText(
                                          order.activationCode!,
                                          `${order.id}-otp`
                                        )
                                      }
                                      className="p-1 text-stone-300 hover:text-white rounded bg-stone-800"
                                      title="Copy activation code"
                                    >
                                      {copiedId === `${order.id}-otp` ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Live SMS Inbox Preview + Button to Open Full Historical SMS Log Modal */}
                              <div className="pt-2.5 border-t border-stone-800/90 space-y-2.5">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-medium text-stone-300 flex items-center gap-1.5">
                                    <Inbox className="w-3.5 h-3.5 text-orange-400" />
                                    {lang === 'ar'
                                      ? `رسائل الـ SMS الواردة (${smsCount})`
                                      : `Incoming SMS (${smsCount})`}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRequestFreshOtp(order.id)
                                      }
                                      disabled={refreshingOrderId === order.id}
                                      className="text-[11px] text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
                                    >
                                      <RefreshCw
                                        className={`w-3 h-3 ${
                                          refreshingOrderId === order.id
                                            ? 'animate-spin'
                                            : ''
                                        }`}
                                      />
                                      {lang === 'ar'
                                        ? 'طلب رمز جديد'
                                        : 'Request OTP'}
                                    </button>
                                  </div>
                                </div>

                                {order.smsInbox &&
                                order.smsInbox.length > 0 ? (
                                  <div className="space-y-2">
                                    {/* Latest SMS preview */}
                                    <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-xs space-y-2 shadow-sm">
                                      <div className="flex items-center justify-between border-b border-stone-800/80 pb-1.5">
                                        <div className="flex items-center gap-2">
                                          <PlatformBrandIcon
                                            platformId={order.platformId}
                                            size="sm"
                                          />
                                          <div>
                                            <span className="font-bold text-white flex items-center gap-1">
                                              {order.smsInbox[0].sender}
                                              <CheckCircle2 className="w-3 h-3 text-amber-400" />
                                            </span>
                                            <span className="text-[10px] text-stone-400 block">
                                              {lang === 'ar'
                                                ? 'رسالة شركة رسمية (SMS Verified)'
                                                : 'Official Carrier SMS'}
                                            </span>
                                          </div>
                                        </div>
                                        <span
                                          dir="ltr"
                                          className="font-mono-tabular text-[10px] text-stone-400"
                                        >
                                          {order.smsInbox[0].receivedAt}
                                        </span>
                                      </div>
                                      <p className="text-stone-100 leading-relaxed whitespace-pre-line font-sans">
                                        {lang === 'ar'
                                          ? order.smsInbox[0].arabicBody
                                          : order.smsInbox[0].body}
                                      </p>
                                    </div>

                                    {/* Dedicated Button to Open Full Historical SMS & OTP Log Modal */}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setSmsHistoryOrderId(order.id)
                                      }
                                      className="w-full py-2 px-3 rounded-lg bg-stone-900 hover:bg-stone-800 border border-orange-500/40 text-amber-300 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                                    >
                                      <History className="w-3.5 h-3.5 text-orange-400" />
                                      <span>
                                        {lang === 'ar'
                                          ? `عرض السجل الكامل لرسائل SMS وأكواد التفعيل (${smsCount})`
                                          : `View Historical SMS & Activation Code Log (${smsCount})`}
                                      </span>
                                    </button>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <p className="text-xs text-stone-400">
                                      {lang === 'ar'
                                        ? 'بانتظار وصول رسالة الـ SMS...'
                                        : 'Awaiting SMS message...'}
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setSmsHistoryOrderId(order.id)
                                      }
                                      className="w-full py-2 px-3 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 text-xs font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                      <History className="w-3.5 h-3.5 text-orange-400" />
                                      <span>
                                        {lang === 'ar'
                                          ? 'فتح سجل رسائل الـ SMS والأكواد'
                                          : 'Open SMS & OTP History Log'}
                                      </span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-3 p-3 rounded-lg bg-stone-950/70 border border-stone-800/80 text-xs text-stone-400 leading-relaxed">
                              {order.status === 'Pending'
                                ? lang === 'ar'
                                  ? 'طلبك قيد المراجعة حالياً. سيصلك إشعار فوري ويظهر الرقم ورسالة الـ SMS هنا فور موافقة المدير.'
                                  : 'Order pending review. You will receive an alert and see your number & SMS here once approved.'
                                : lang === 'ar'
                                ? 'تعذر التحقق من مرجع عملية التحويل.'
                                : 'Could not verify transfer reference.'}
                            </div>
                          )}
                        </div>

                        {/* Card Footer */}
                        <div className="pt-2.5 border-t border-stone-800/70 flex items-center justify-between text-xs text-stone-400">
                          <span>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                          <div className="flex items-center gap-3">
                            {isApproved && (
                              <button
                                type="button"
                                onClick={() => setSmsHistoryOrderId(order.id)}
                                className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
                              >
                                <MessageSquareText className="w-3.5 h-3.5" />
                                {lang === 'ar'
                                  ? `سجل الرسائل (${smsCount})`
                                  : `SMS Log (${smsCount})`}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setPreviewReceiptOrder(order)}
                              className="text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              {lang === 'ar' ? 'معاينة الوصل' : 'View Receipt'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sticky Drawer Footer */}
            <div className="p-4 sm:p-5 border-t border-stone-800 bg-[#141210] flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNewOrderClick();
                }}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-stone-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                {lang === 'ar' ? 'طلب رقم دولي جديد' : 'Order New Number'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 text-xs font-medium rounded-xl transition-colors"
              >
                {lang === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </motion.aside>

          {/* Historical SMS Messages & Activation Codes Log Modal */}
          {activeHistoryOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                transition={{ duration: 0.18 }}
                className="bg-[#141210] border border-stone-800 rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col justify-between shadow-2xl overflow-hidden"
              >
                {/* Modal Header */}
                <div className="p-5 sm:p-6 border-b border-stone-800 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <PlatformBrandIcon
                      platformId={activeHistoryOrder.platformId}
                      size="lg"
                    />
                    <div>
                      <span className="text-xs font-semibold text-orange-400 flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5" />
                        {lang === 'ar'
                          ? `سجل رسائل الـ SMS وأكواد التفعيل — ${activeHistoryOrder.id}`
                          : `Historical SMS & Activation Code Log — ${activeHistoryOrder.id}`}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                        {lang === 'ar'
                          ? `${activeHistoryOrder.platformArabicName} (${activeHistoryOrder.countryArabicName})`
                          : `${activeHistoryOrder.platformName} (${activeHistoryOrder.countryName})`}
                      </h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSmsHistoryOrderId(null)}
                    className="p-2 text-stone-400 hover:text-white rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 transition-colors"
                    aria-label="Close SMS history modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Assigned Number & Quick Request Bar */}
                <div className="px-5 sm:px-6 py-3.5 bg-stone-950 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-orange-400" />
                    <span className="text-xs text-stone-400">
                      {lang === 'ar' ? 'الرقم المخصص:' : 'Assigned Line:'}
                    </span>
                    <span
                      dir="ltr"
                      className="font-mono-tabular text-sm font-bold text-amber-400"
                    >
                      {activeHistoryOrder.assignedVirtualNumber || '—'}
                    </span>
                    {activeHistoryOrder.assignedVirtualNumber && (
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyText(
                            activeHistoryOrder.assignedVirtualNumber!,
                            `${activeHistoryOrder.id}-hist-num`
                          )
                        }
                        className="p-1 text-stone-300 hover:text-white rounded bg-stone-800"
                        title="Copy virtual number"
                      >
                        {copiedId === `${activeHistoryOrder.id}-hist-num` ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleRequestFreshOtp(activeHistoryOrder.id)
                    }
                    disabled={refreshingOrderId === activeHistoryOrder.id}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-stone-950 font-bold text-xs transition-all flex items-center gap-1.5"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${
                        refreshingOrderId === activeHistoryOrder.id
                          ? 'animate-spin'
                          : ''
                      }`}
                    />
                    <span>
                      {lang === 'ar'
                        ? 'محاكاة وصول رسالة كود جديدة'
                        : 'Simulate New Incoming OTP'}
                    </span>
                  </button>
                </div>

                {/* Historical Messages Feed */}
                <div className="p-5 sm:p-6 overflow-y-auto space-y-3.5 flex-1">
                  {activeHistoryOrder.smsInbox &&
                  activeHistoryOrder.smsInbox.length > 0 ? (
                    activeHistoryOrder.smsInbox.map((sms, index) => {
                      const isLatest = index === 0;
                      const copyKey = `${activeHistoryOrder.id}-sms-${sms.id}`;
                      return (
                        <div
                          key={sms.id}
                          className={`p-4 rounded-xl border transition-all space-y-3 ${
                            isLatest
                              ? 'bg-stone-900/95 border-orange-500/50 shadow-lg'
                              : 'bg-stone-900/50 border-stone-800'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 border-b border-stone-800 pb-2.5">
                            <div className="flex items-center gap-2.5">
                              <PlatformBrandIcon
                                platformId={activeHistoryOrder.platformId}
                                size="sm"
                              />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-white">
                                    {sms.sender}
                                  </span>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                                  {isLatest && (
                                    <span className="px-2 py-0.5 rounded bg-orange-500/20 border border-orange-500/40 text-[10px] font-bold text-amber-300">
                                      {lang === 'ar' ? 'الأحدث' : 'LATEST'}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-stone-400 block">
                                  {lang === 'ar'
                                    ? `رسالة تفعيل رسمية #${
                                        activeHistoryOrder.smsInbox!.length -
                                        index
                                      }`
                                    : `Official Verification SMS #${
                                        activeHistoryOrder.smsInbox!.length -
                                        index
                                      }`}
                                </span>
                              </div>
                            </div>

                            <span
                              dir="ltr"
                              className="font-mono-tabular text-xs text-stone-400"
                            >
                              {sms.receivedAt}
                            </span>
                          </div>

                          {/* Extracted Activation Code Pill + 1-Click Copy */}
                          <div className="flex items-center justify-between gap-2 bg-stone-950 px-3.5 py-2 rounded-lg border border-stone-800">
                            <div className="flex items-center gap-2">
                              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                              <span className="text-xs text-stone-400">
                                {lang === 'ar'
                                  ? 'رمز التفعيل (OTP):'
                                  : 'Activation Code:'}
                              </span>
                              <span
                                dir="ltr"
                                className="font-mono-tabular text-sm font-bold tracking-widest text-amber-400"
                              >
                                {sms.otpCode}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleCopyText(sms.otpCode, copyKey)
                              }
                              className="px-2.5 py-1 rounded-md bg-stone-800 hover:bg-stone-700 text-xs font-medium text-stone-200 flex items-center gap-1.5 transition-colors"
                            >
                              {copiedId === copyKey ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                                  <span>
                                    {lang === 'ar' ? 'تم النسخ' : 'Copied'}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-orange-400" />
                                  <span>
                                    {lang === 'ar' ? 'نسخ الرمز' : 'Copy Code'}
                                  </span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Full Official Company SMS Body */}
                          <p className="text-xs text-stone-200 leading-relaxed whitespace-pre-line font-sans bg-stone-950/60 p-3 rounded-lg border border-stone-800/70">
                            {lang === 'ar' ? sms.arabicBody : sms.body}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-12 text-center space-y-2 text-stone-400">
                      <Inbox className="w-8 h-8 text-orange-400 mx-auto" />
                      <p className="text-sm font-semibold text-white">
                        {lang === 'ar'
                          ? 'لا توجد رسائل SMS مسجلة حتى الآن لهذا الطلب'
                          : 'No historical SMS messages recorded yet'}
                      </p>
                      <p className="text-xs">
                        {lang === 'ar'
                          ? 'اضغط على زر "محاكاة وصول رسالة كود جديدة" أعلاه لتوليد رسالة تفعيل من الشركة.'
                          : 'Click "Simulate New Incoming OTP" above to receive a verification message.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 sm:p-5 border-t border-stone-800 bg-stone-950 flex items-center justify-between text-xs text-stone-400">
                  <span>
                    {lang === 'ar'
                      ? `إجمالي الرسائل المستلمة: ${
                          activeHistoryOrder.smsInbox?.length || 0
                        }`
                      : `Total SMS Received: ${
                          activeHistoryOrder.smsInbox?.length || 0
                        }`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSmsHistoryOrderId(null)}
                    className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    {lang === 'ar' ? 'إغلاق السجل' : 'Close Log'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Receipt Lightbox Modal */}
          {previewReceiptOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
              <div className="bg-[#141210] border border-stone-800 rounded-2xl max-w-lg w-full p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {lang === 'ar'
                        ? `وصل التحويل — طلب رقم ${previewReceiptOrder.id}`
                        : `Receipt Proof — ${previewReceiptOrder.id}`}
                    </h3>
                    <p
                      className="text-xs text-stone-400 font-mono-tabular"
                      dir="ltr"
                    >
                      {previewReceiptOrder.paymentMethodName} · Ref:{' '}
                      {previewReceiptOrder.transactionId}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewReceiptOrder(null)}
                    className="p-1.5 text-stone-400 hover:text-white rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-stone-950 rounded-xl overflow-hidden border border-stone-800 flex items-center justify-center max-h-96">
                  <img
                    src={previewReceiptOrder.receiptDataUrl}
                    alt={`Receipt for ${previewReceiptOrder.id}`}
                    referrerPolicy="no-referrer"
                    className="max-h-80 w-auto object-contain"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
};
