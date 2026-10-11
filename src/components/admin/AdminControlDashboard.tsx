import React, { useState } from 'react';
import {
  BellRing,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  Lock,
  MessageSquare,
  Phone,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  Wand2,
  X,
  XCircle,
} from 'lucide-react';
import { useRimPhone } from '../../context/RimPhoneContext';
import {
  COUNTRIES_CATALOG,
  formatOfficialCompanySms,
} from '../../data/catalog';
import { OrderStatus, VirtualOrder } from '../../types/rimphone';
import { PlatformBrandIcon } from '../store/PlatformBrandIcon';

export const AdminControlDashboard: React.FC = () => {
  const {
    lang,
    isRtl,
    users,
    orders,
    isAdmin,
    updateOrderAdmin,
    deleteOrderAdmin,
    myNotifications,
    unreadNotificationsCount,
    notificationsEnabled,
    enableNotifications,
    markAllNotificationsRead,
  } = useRimPhone();

  const [activeTab, setActiveTab] = useState<'orders' | 'clients'>('orders');
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceiptOrder, setSelectedReceiptOrder] =
    useState<VirtualOrder | null>(null);

  // Two clear, dedicated per-order fields for the Admin:
  // 1) خانة الرقم (Phone Number Field)
  // 2) خانة رسالة SMS (SMS Message / Code Field)
  const [draftNumbers, setDraftNumbers] = useState<Record<string, string>>({});
  const [draftSmsMessages, setDraftSmsMessages] = useState<
    Record<string, string>
  >({});
  const [savedBannerOrderId, setSavedBannerOrderId] = useState<string | null>(
    null
  );
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  // Strict privacy guard
  if (!isAdmin) {
    return (
      <section
        dir={isRtl ? 'rtl' : 'ltr'}
        className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <div className="bg-[#141210] border border-stone-800 rounded-2xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center mx-auto text-orange-400">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">
            {lang === 'ar' ? 'منطقة خاصة ومحمية' : 'Restricted Area'}
          </h2>
          <p className="text-xs text-stone-400 max-w-sm mx-auto leading-relaxed">
            {lang === 'ar'
              ? 'هذه الصفحة مخصصة للعمليات الداخلية فقط ولا يمكن الوصول إليها من حسابات المستخدمين.'
              : 'This section is reserved for authorized internal operations only.'}
          </p>
        </div>
      </section>
    );
  }

  // Analytics metrics
  const clientUsers = users.filter((u) => u.role !== 'admin');
  const totalUsers = clientUsers.length;
  const totalOrders = orders.length;
  const totalRevenueMru = orders
    .filter((o) => o.status === 'Approved')
    .reduce((acc, item) => acc + item.priceMru, 0);
  const pendingApprovals = orders.filter((o) => o.status === 'Pending').length;

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === 'ALL' || order.status === statusFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      order.id.toLowerCase().includes(q) ||
      order.userEmail.toLowerCase().includes(q) ||
      order.transactionId.toLowerCase().includes(q) ||
      order.platformName.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  const handleCopyValue = (text: string, tag: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 1800);
  };

  // Smooth 1-click helper to suggest a fresh Canadian or US number for the order
  const handleSuggestNumber = (order: VirtualOrder) => {
    const pool = COUNTRIES_CATALOG[order.countryCode].sampleNumbers;
    const randomSlot = pool[Math.floor(Math.random() * pool.length)];
    setDraftNumbers((prev) => ({
      ...prev,
      [order.id]: randomSlot.phoneNumber,
    }));
  };

  // Smooth 1-click helper to generate a random 6-digit OTP code
  const handleGenerateSmsTemplate = (order: VirtualOrder) => {
    const randomOtp = `${Math.floor(100 + Math.random() * 899)}-${Math.floor(
      100 + Math.random() * 899
    )}`;
    setDraftSmsMessages((prev) => ({
      ...prev,
      [order.id]: randomOtp,
    }));
  };

  const handleFulfillAndStatusChange = (
    order: VirtualOrder,
    newStatus: OrderStatus
  ) => {
    const numberToPush =
      draftNumbers[order.id] !== undefined
        ? draftNumbers[order.id]
        : order.assignedVirtualNumber || '';

    const rawCodeInput =
      draftSmsMessages[order.id] !== undefined
        ? draftSmsMessages[order.id]
        : order.activationCode || '';

    updateOrderAdmin(order.id, {
      status: newStatus,
      assignedVirtualNumber: numberToPush,
      activationCode: rawCodeInput.trim(),
      smsMessage: rawCodeInput.trim(),
    });

    setSavedBannerOrderId(order.id);
    setTimeout(() => {
      setSavedBannerOrderId((prev) => (prev === order.id ? null : prev));
    }, 2800);
  };

  return (
    <section
      dir={isRtl ? 'rtl' : 'ltr'}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
    >
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-6">
        <div>
          <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-orange-400" />
            {lang === 'ar'
              ? 'تم التحقق الفوري من بريد المدير · دخول مباشر بدون كلمة سر'
              : 'Instant Email Verified · Passwordless Admin Session'}
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">
            {lang === 'ar'
              ? 'مركز التحكم الشامل — إدارة الطلبات والأرقام ورسائل الـ SMS'
              : 'Complete Admin Control Center — Orders, Numbers & SMS'}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={enableNotifications}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center gap-2 ${
              notificationsEnabled
                ? 'bg-orange-950/40 border-orange-500/50 text-amber-300'
                : 'bg-stone-900 border-stone-700 text-stone-300 hover:border-orange-500'
            }`}
          >
            <BellRing className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {lang === 'ar'
                ? `إشعارات الطلبات (${unreadNotificationsCount})`
                : `Order Alerts (${unreadNotificationsCount})`}
            </span>
          </button>
          <div className="text-xs text-stone-400 font-mono-tabular">
            {lang === 'ar' ? 'حساب الاستلام:' : 'Receiver:'}{' '}
            <strong className="text-amber-400">31520844</strong>
          </div>
        </div>
      </div>

      {/* Real-time Admin Notifications Feed for Incoming Orders */}
      {myNotifications.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#141210] border border-orange-500/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <BellRing className="w-4 h-4 text-orange-400" />
              <span>
                {lang === 'ar'
                  ? `تنبيهات الطلبات الواردة للمدير (${unreadNotificationsCount} جديد)`
                  : `Incoming Order Notifications (${unreadNotificationsCount} unread)`}
              </span>
            </div>
            {unreadNotificationsCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="text-xs text-stone-400 hover:text-white transition-colors"
              >
                {lang === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all as read'}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-40 overflow-y-auto">
            {myNotifications.slice(0, 4).map((notif) => (
              <div
                key={notif.id}
                className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                  !notif.read
                    ? 'bg-orange-950/30 border-orange-500/40 text-stone-100'
                    : 'bg-stone-900/50 border-stone-800 text-stone-400'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-amber-400">
                    {lang === 'ar' ? notif.arabicTitle : notif.title}
                  </div>
                  <p className="leading-relaxed">
                    {lang === 'ar' ? notif.arabicMessage : notif.message}
                  </p>
                </div>
                <span
                  dir="ltr"
                  className="text-[11px] font-mono-tabular text-stone-400 shrink-0"
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

      {/* 4 Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#141210] border border-stone-800 rounded-xl p-5">
          <span className="text-xs text-stone-400 block">
            {lang === 'ar'
              ? 'إجمالي الزبائن المسجلين'
              : 'Total Registered Clients'}
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono-tabular text-white">
              {totalUsers}
            </span>
            <span className="text-xs text-amber-400 font-mono-tabular">
              {lang === 'ar' ? 'حساب مفعل' : 'Verified'}
            </span>
          </div>
        </div>

        <div className="bg-[#141210] border border-stone-800 rounded-xl p-5">
          <span className="text-xs text-stone-400 block">
            {lang === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono-tabular text-white">
              {totalOrders}
            </span>
            <span className="text-xs text-orange-400 font-mono-tabular">
              {lang === 'ar' ? 'كندا وأمريكا' : 'CA & US'}
            </span>
          </div>
        </div>

        <div className="bg-[#141210] border border-stone-800 rounded-xl p-5">
          <span className="text-xs text-stone-400 block">
            {lang === 'ar' ? 'الإيرادات المؤكدة (MRU)' : 'Confirmed Revenue'}
          </span>
          <div className="mt-2 flex items-baseline justify-between" dir="ltr">
            <span className="text-2xl font-bold font-mono-tabular text-amber-400">
              {totalRevenueMru.toLocaleString()} MRU
            </span>
            <span className="text-xs text-stone-400">أوقية</span>
          </div>
        </div>

        <div className="bg-[#141210] border border-stone-800 rounded-xl p-5">
          <span className="text-xs text-stone-400 block">
            {lang === 'ar' ? 'طلبات بانتظار التفعيل' : 'Pending Orders'}
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono-tabular text-orange-400">
              {pendingApprovals}
            </span>
            <span className="text-xs text-stone-400 font-mono-tabular">
              {lang === 'ar' ? 'قيد الانتظار' : 'Pending'}
            </span>
          </div>
        </div>
      </div>

      {/* Mode Switcher: Orders Fulfillment vs Registered Clients */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 p-1 bg-[#141210] border border-stone-800 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-stone-950'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            {lang === 'ar'
              ? `إدارة الطلبات وإرسال الأرقام (${orders.length})`
              : `Orders & Fulfillment (${orders.length})`}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('clients')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'clients'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-stone-950'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            {lang === 'ar'
              ? `سجل الزبائن (${clientUsers.length})`
              : `Registered Clients (${clientUsers.length})`}
          </button>
        </div>
      </div>

      {activeTab === 'clients' ? (
        <div className="bg-[#141210] border border-stone-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">
            {lang === 'ar'
              ? 'قائمة الزبائن المسجلين في المنصة'
              : 'Registered Platform Clients'}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-800 text-stone-400">
                  <th className="py-3 px-3 text-start">
                    {lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                  </th>
                  <th className="py-3 px-3 text-start">
                    {lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </th>
                  <th className="py-3 px-3 text-start">
                    {lang === 'ar' ? 'رقم الهاتف الموريتاني' : 'Phone (+222)'}
                  </th>
                  <th className="py-3 px-3 text-start">
                    {lang === 'ar' ? 'عدد الطلبات' : 'Orders Count'}
                  </th>
                  <th className="py-3 px-3 text-end">
                    {lang === 'ar' ? 'تاريخ التسجيل' : 'Joined'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/80">
                {clientUsers.map((u) => {
                  const userOrderTotal = orders.filter(
                    (o) =>
                      o.userId === u.id ||
                      o.userEmail.toLowerCase() === u.email.toLowerCase()
                  ).length;
                  return (
                    <tr key={u.id} className="hover:bg-stone-900/50">
                      <td className="py-3.5 px-3 font-semibold text-white">
                        {u.fullName}
                      </td>
                      <td className="py-3.5 px-3 font-mono-tabular text-amber-400">
                        {u.email}
                      </td>
                      <td
                        dir="ltr"
                        className="py-3.5 px-3 font-mono-tabular text-stone-300"
                      >
                        {u.phoneMauritania ? `+222 ${u.phoneMauritania}` : '—'}
                      </td>
                      <td className="py-3.5 px-3 font-mono-tabular text-orange-400 font-bold">
                        {userOrderTotal}
                      </td>
                      <td className="py-3.5 px-3 text-end text-stone-400 font-mono-tabular">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Simplified & Complete Order Fulfillment Workspace */
        <div className="bg-[#141210] border border-stone-800 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-stone-800">
            <div>
              <h2 className="text-lg font-bold text-white">
                {lang === 'ar'
                  ? 'قائمة الطلبات الواردة (تخصيص الرقم + رسالة SMS بضغطة واحدة)'
                  : 'Incoming Orders (1-Click Phone Number + SMS Fulfillment)'}
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                {lang === 'ar'
                  ? 'كل طلب يحتوي على أدوات اقتراح سريع للرقم وتوليد نص الـ SMS ومطابقة وصل التحويل لضمان إتمام العملية في ثوانٍ.'
                  : 'Each order includes quick number suggestions, SMS template generator, and receipt verification.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search
                  className={`w-4 h-4 text-stone-400 absolute ${
                    isRtl ? 'right-3' : 'left-3'
                  } top-1/2 -translate-y-1/2`}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    lang === 'ar'
                      ? 'بحث بالبريد أو رقم العملية...'
                      : 'Search email, TX ID...'
                  }
                  className={`${
                    isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
                  } py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-xs text-white placeholder-stone-500 focus:outline-none focus:border-orange-500`}
                />
              </div>

              <div className="flex items-center gap-1 p-1 bg-stone-900 border border-stone-800 rounded-lg">
                {(['ALL', 'Pending', 'Approved', 'Rejected'] as const).map(
                  (st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                        statusFilter === st
                          ? 'bg-orange-500 text-stone-950 font-bold'
                          : 'text-stone-400 hover:text-white'
                      }`}
                    >
                      {lang === 'ar'
                        ? st === 'ALL'
                          ? 'الكل'
                          : st === 'Pending'
                          ? 'قيد الانتظار'
                          : st === 'Approved'
                          ? 'مقبول'
                          : 'مرفوض'
                        : st}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {filteredOrders.map((order) => {
              const currentNum =
                draftNumbers[order.id] !== undefined
                  ? draftNumbers[order.id]
                  : order.assignedVirtualNumber || '';
              const currentCode =
                draftSmsMessages[order.id] !== undefined
                  ? draftSmsMessages[order.id]
                  : order.activationCode || '';
              const previewOfficialSms = formatOfficialCompanySms(
                order.platformId,
                currentCode || '123-456'
              );

              return (
                <div
                  key={order.id}
                  className="p-5 rounded-xl bg-stone-900/75 border border-stone-800 hover:border-stone-700 transition-colors"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                    {/* Column 1: Order, Client & Payment Info (4 cols) */}
                    <div className="lg:col-span-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            dir="ltr"
                            className="font-mono-tabular font-bold text-sm text-amber-400"
                          >
                            {order.id}
                          </span>
                          <span className="text-[11px] text-stone-400 font-mono-tabular">
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                          {order.status === 'Approved' && (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {lang === 'ar' ? 'مقبول ومفعل' : 'Approved'}
                            </span>
                          )}
                          {order.status === 'Pending' && (
                            <span className="text-amber-400 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {lang === 'ar' ? 'قيد الانتظار' : 'Pending'}
                            </span>
                          )}
                          {order.status === 'Rejected' && (
                            <span className="text-rose-400 flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" />
                              {lang === 'ar' ? 'مرفوض' : 'Rejected'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-sm font-bold text-white">
                        {COUNTRIES_CATALOG[order.countryCode]?.flag || '🌐'}{' '}
                        {lang === 'ar'
                          ? `${order.countryArabicName || order.countryName} — ${
                              order.platformArabicName || order.platformName
                            }`
                          : `${order.countryName} — ${order.platformName}`}
                      </div>

                      <div className="text-xs text-stone-300 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate">
                            {lang === 'ar' ? 'الزبون:' : 'Client:'}{' '}
                            <span className="font-mono-tabular text-white">
                              {order.userEmail}
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyValue(
                                order.userEmail,
                                `${order.id}-email`
                              )
                            }
                            className="text-stone-400 hover:text-white p-1"
                            title="Copy client email"
                          >
                            {copiedTag === `${order.id}-email` ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {order.senderPhone && (
                          <div className="text-stone-400">
                            {lang === 'ar'
                              ? 'هاتف المرسل:'
                              : 'Sender Phone:'}{' '}
                            <span
                              dir="ltr"
                              className="font-mono-tabular text-stone-200"
                            >
                              +222 {order.senderPhone}
                            </span>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2 text-stone-400">
                          <span>
                            {lang === 'ar'
                              ? order.planArabicLabel || order.planLabel
                              : order.planLabel}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span
                            dir="ltr"
                            className="font-mono-tabular font-bold text-amber-400"
                          >
                            {order.priceMru} MRU
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="text-stone-200">
                            {lang === 'ar'
                              ? order.paymentMethodArabicName ||
                                order.paymentMethodName
                              : order.paymentMethodName}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyValue(
                                order.transactionId,
                                `${order.id}-tx`
                              )
                            }
                            className="font-mono-tabular text-orange-400 hover:text-orange-300 flex items-center gap-1"
                            dir="ltr"
                            title="Click to copy Transaction ID"
                          >
                            <span>TX: {order.transactionId}</span>
                            {copiedTag === `${order.id}-tx` ? (
                              <CheckCircle2 className="w-3 h-3 text-amber-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedReceiptOrder(order)}
                            className="px-2.5 py-1 rounded-md bg-stone-800 hover:bg-stone-700 text-amber-400 font-medium flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            {lang === 'ar' ? 'معاينة الوصل' : 'View Receipt'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Simplified 2 Boxes -> خانة الرقم + خانة رسالة SMS with 1-Click Helpers (5 cols) */}
                    <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Box 1: خانة الرقم */}
                      <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                        <div className="flex items-center justify-between gap-1">
                          <label className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" />
                            {lang === 'ar' ? 'خانة الرقم' : 'Phone Number'}
                          </label>
                          <button
                            type="button"
                            onClick={() => handleSuggestNumber(order)}
                            className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
                            title="توليد رقم مقترح من مخزون الدولة"
                          >
                            <Sparkles className="w-3 h-3" />
                            {lang === 'ar' ? 'اقتراح رقم' : 'Suggest'}
                          </button>
                        </div>
                        <input
                          dir="ltr"
                          type="text"
                          value={currentNum}
                          onChange={(e) =>
                            setDraftNumbers((prev) => ({
                              ...prev,
                              [order.id]: e.target.value,
                            }))
                          }
                          placeholder="+1 (438) 809-4412"
                          className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs font-mono-tabular text-white placeholder-stone-500 focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      {/* Box 2: خانة رمز التفعيل فقط (الرسالة جاهزة تلقائياً باسم الشركة) */}
                      <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                        <div className="flex items-center justify-between gap-1">
                          <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5" />
                            {lang === 'ar'
                              ? `أدخل الرمز فقط (رسالة ${order.platformName} جاهزة)`
                              : `Enter Code Only (${order.platformName} SMS Ready)`}
                          </label>
                          <button
                            type="button"
                            onClick={() => handleGenerateSmsTemplate(order)}
                            className="text-[11px] text-orange-400 hover:text-orange-300 flex items-center gap-1 font-medium"
                            title="توليد رمز 6 أرقام عشوائي"
                          >
                            <Wand2 className="w-3 h-3" />
                            {lang === 'ar' ? 'توليد رمز' : 'Random Code'}
                          </button>
                        </div>
                        <input
                          dir="ltr"
                          type="text"
                          value={currentCode}
                          onChange={(e) =>
                            setDraftSmsMessages((prev) => ({
                              ...prev,
                              [order.id]: e.target.value,
                            }))
                          }
                          placeholder="749-201"
                          className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs font-mono-tabular font-bold tracking-widest text-amber-300 placeholder-stone-500 focus:outline-none focus:border-amber-400"
                        />
                        <div className="p-2 rounded-lg bg-stone-900/90 border border-stone-800/90 text-[11px] text-stone-300 space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-stone-400">
                            <span className="flex items-center gap-1 font-bold text-white">
                              <PlatformBrandIcon
                                platformId={order.platformId}
                                size="sm"
                              />
                              <span>Sender: {previewOfficialSms.sender}</span>
                            </span>
                            <span className="text-amber-400">
                              {lang === 'ar'
                                ? 'معاينة رسالة الشركة للزبون'
                                : 'Company SMS Preview'}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-200 whitespace-pre-line leading-relaxed">
                            {lang === 'ar'
                              ? previewOfficialSms.arabicBody
                              : previewOfficialSms.body}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Column 3: Direct 1-Click Actions (3 cols) */}
                    <div className="lg:col-span-3 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleFulfillAndStatusChange(order, 'Approved')
                        }
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-stone-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/15"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {lang === 'ar'
                          ? 'اعتماد وإرسال الرقم والـ SMS للمنصة'
                          : 'Approve & Push Number + SMS In-App'}
                      </button>

                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            handleFulfillAndStatusChange(order, 'Pending')
                          }
                          className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors ${
                            order.status === 'Pending'
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                              : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
                          }`}
                        >
                          {lang === 'ar' ? 'انتظار' : 'Pending'}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleFulfillAndStatusChange(order, 'Rejected')
                          }
                          className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors ${
                            order.status === 'Rejected'
                              ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                              : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-rose-300'
                          }`}
                        >
                          {lang === 'ar' ? 'رفض' : 'Reject'}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteOrderAdmin(order.id)}
                          className="py-1.5 px-2 rounded-lg text-xs font-medium border bg-stone-900 border-stone-800 text-stone-400 hover:text-rose-400 hover:border-rose-800 transition-colors flex items-center justify-center"
                          title={lang === 'ar' ? 'حذف الطلب' : 'Delete order'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {savedBannerOrderId === order.id && (
                        <div className="text-emerald-400 text-[11px] font-semibold flex items-center justify-center gap-1 pt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {lang === 'ar'
                            ? 'تم إرسال الرقم ورسالة SMS وإشعار الزبون!'
                            : 'Number, SMS & notification sent!'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Receipt Inspection Modal */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141210] border border-stone-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  {lang === 'ar'
                    ? `فحص وصل التحويل البنكي — ${selectedReceiptOrder.id}`
                    : `Payment Receipt Verification — ${selectedReceiptOrder.id}`}
                </h3>
                <p
                  dir="ltr"
                  className="text-xs text-stone-400 font-mono-tabular"
                >
                  {selectedReceiptOrder.paymentMethodName} · TX:{' '}
                  {selectedReceiptOrder.transactionId} ·{' '}
                  {selectedReceiptOrder.priceMru} MRU
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceiptOrder(null)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-stone-950 rounded-xl p-3 border border-stone-800 flex items-center justify-center">
              <img
                src={selectedReceiptOrder.receiptDataUrl}
                alt="Payment receipt"
                referrerPolicy="no-referrer"
                className="max-h-80 w-auto object-contain rounded"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-stone-400">
                {selectedReceiptOrder.userEmail}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleFulfillAndStatusChange(
                      selectedReceiptOrder,
                      'Rejected'
                    );
                    setSelectedReceiptOrder(null);
                  }}
                  className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-200 text-xs font-medium rounded-lg"
                >
                  {lang === 'ar' ? 'رفض الوصل' : 'Reject Receipt'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleFulfillAndStatusChange(
                      selectedReceiptOrder,
                      'Approved'
                    );
                    setSelectedReceiptOrder(null);
                  }}
                  className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-stone-950 text-xs font-bold rounded-lg"
                >
                  {lang === 'ar'
                    ? 'اعتماد الوصل وتفعيل الرقم'
                    : 'Approve Receipt'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
