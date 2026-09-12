import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Order,
  OrderStatus,
  RepairTicket,
  RepairStatus,
  InstallmentPlan,
  Product,
} from '../../types';
import { ALGERIA_WILAYAS } from '../../data/wilayas';
import {
  LayoutDashboard,
  ShoppingBag,
  Wrench,
  CreditCard,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Printer,
  PhoneCall,
  MessageCircle,
  Truck,
  DollarSign,
  UserCheck,
  Plus,
  Search,
  Filter,
  FileSpreadsheet,
  Trash2,
  Sparkles,
  Inbox,
  RotateCcw,
  User,
  Phone,
  MapPin,
  Store,
} from 'lucide-react';

export const MerchantDashboard: React.FC = () => {
  const {
    role,
    language,
    t,
    orders,
    updateOrderStatus,
    repairs,
    updateRepairStatus,
    installments,
    markInstallmentPaid,
    products,
    addProduct,
    updateProduct,
    showToast,
    clearAllDashboardData,
    loadDemoData,
  } = useStore();

  // Role-based initial tab: if technician, default to repairs
  const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'repairs' | 'installments' | 'inventory'>(
    role === 'technician' ? 'repairs' : 'analytics'
  );

  // Filters
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [repairStatusFilter, setRepairStatusFilter] = useState<RepairStatus | 'all'>('all');
  const [installmentStatusFilter, setInstallmentStatusFilter] = useState<'all' | 'active' | 'has_overdue'>('all');

  // Technician modal for editing a repair ticket
  const [editingRepair, setEditingRepair] = useState<RepairTicket | null>(null);
  const [technicianNote, setTechnicianNote] = useState('');
  const [newRepairStatus, setNewRepairStatus] = useState<RepairStatus>('diagnosing');
  const [newFinalPrice, setNewFinalPrice] = useState<number>(0);
  const [newPartsCost, setNewPartsCost] = useState<number>(0);

  // Installment payment recording modal
  const [payingPlan, setPayingPlan] = useState<{ plan: InstallmentPlan; itemNumber: number; amount: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'baridimob' | 'ccp'>('baridimob');
  const [receiptNumber, setReceiptNumber] = useState('');

  // New product form
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdBrand, setNewProdBrand] = useState('Apple');
  const [newProdPrice, setNewProdPrice] = useState<number>(100000);
  const [newProdStock, setNewProdStock] = useState<number>(5);
  const [newProdCategory, setNewProdCategory] = useState<'new-phone' | 'used-phone' | 'accessory'>('new-phone');
  const [newProdWarranty, setNewProdWarranty] = useState<number>(12);

  // Financial calculations
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.status === 'delivered')
      .reduce((acc, o) => acc + o.total, 0);
  }, [orders]);

  const pendingCodAmount = useMemo(() => {
    return orders
      .filter((o) => o.status === 'confirmed' || o.status === 'shipped')
      .reduce((acc, o) => acc + o.total, 0);
  }, [orders]);

  const installmentsStats = useMemo(() => {
    let totalFinanced = 0;
    let totalCollected = 0;
    let totalPending = 0;
    let totalOverdue = 0;

    installments.forEach((p) => {
      totalFinanced += p.remainingAmount;
      p.schedule.forEach((s) => {
        if (s.status === 'paid') totalCollected += s.amount;
        if (s.status === 'pending') totalPending += s.amount;
        if (s.status === 'overdue') totalOverdue += s.amount;
      });
    });

    return { totalFinanced, totalCollected, totalPending, totalOverdue };
  }, [installments]);

  const repairStats = useMemo(() => {
    const activeCount = repairs.filter((r) => r.status !== 'delivered' && r.status !== 'cancelled').length;
    const readyCount = repairs.filter((r) => r.status === 'ready').length;
    const totalRepairRevenue = repairs
      .filter((r) => r.status === 'delivered')
      .reduce((acc, r) => acc + (r.finalPrice || r.estimatedPrice), 0);
    return { activeCount, readyCount, totalRepairRevenue };
  }, [repairs]);

  // Handle Technician Save
  const handleSaveRepair = () => {
    if (!editingRepair) return;
    updateRepairStatus(
      editingRepair.id,
      newRepairStatus,
      technicianNote || undefined,
      newFinalPrice || undefined,
      newPartsCost || undefined
    );
    setEditingRepair(null);
  };

  // Handle WhatsApp alert to customer
  const handleSendWhatsAppNotification = (repair: RepairTicket) => {
    const text = encodeURIComponent(
      `السلام عليكم زبوننا الكريم ${repair.customerName}، نعلمكم أن هاتفكم ${repair.phoneBrand} ${repair.phoneModel} تذكرة رقم #${repair.ticketNumber} قد أصبحت حالته الآن: [${t.repairStages[repair.status]}]. السعر النهائي: ${(repair.finalPrice || repair.estimatedPrice).toLocaleString()} دج. نرحب بكم في المحل.`
    );
    window.open(`https://wa.me/213${repair.phone.replace(/^0/, '')}?text=${text}`, '_blank');
  };

  // Handle Installment WhatsApp reminder
  const handleSendInstallmentReminder = (plan: InstallmentPlan, dueDate: string, amount: number) => {
    const text = encodeURIComponent(
      `تذكير من محل حمتين تيليكوم 4: السلام عليكم ${plan.customerName}، نذكركم بموعد استحقاق القسط الشهري لهاتف ${plan.productName} بمبلغ ${amount.toLocaleString()} دج في تاريخ ${dueDate}. يمكنكم السداد نقداً في المحل (الوادي - مفترق طرق الملاح) أو عبر بريدي موب RIP: 007999990023456789 22. شكراً لالتزامكم.`
    );
    window.open(`https://wa.me/213${plan.phone.replace(/^0/, '')}?text=${text}`, '_blank');
  };

  // Submit new product
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct({
      name: newProdName,
      nameFr: newProdName,
      brand: newProdBrand,
      model: newProdName,
      category: newProdCategory,
      price: newProdPrice,
      color: 'أسود',
      condition: newProdCategory === 'new-phone' ? 'brand-new' : 'like-new',
      warrantyMonths: newProdWarranty,
      stock: newProdStock,
      images: [
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'هاتف ذكي ممتاز بأداء عالي ومواصفات قوية.',
      descriptionFr: 'Smartphone puissant avec haute performance.',
      specs: { 'الضمان': `${newProdWarranty} شهر` },
      allowInstallment: newProdCategory !== 'accessory',
      rating: 5.0,
      reviewCount: 0,
    });
    setShowAddProductModal(false);
    setNewProdName('');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Dashboard Topbar */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
              <LayoutDashboard className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black">{t.dashboardTitle}</h1>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            {language === 'ar'
              ? 'إدارة متكاملة للطلبات مع شركات التوصيل، ورشة الصيانة للفنيين، ومحفظة البيع بالتقسيط'
              : 'Gestion des commandes COD, atelier techniciens et suivi de facilité'}
          </p>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap bg-stone-950 p-1.5 rounded-2xl border border-stone-800">
          {(role === 'admin' || role === 'salesperson') && (
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              {t.tabAnalytics}
            </button>
          )}

          {(role === 'admin' || role === 'salesperson') && (
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'orders'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <span>{t.tabOrders}</span>
              <span className="bg-emerald-900 text-emerald-200 px-1.5 py-0.2 rounded-full text-[10px]">
                {orders.length}
              </span>
            </button>
          )}

          {(role === 'admin' || role === 'technician') && (
            <button
              onClick={() => setActiveTab('repairs')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'repairs'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <span>{t.tabRepairs}</span>
              <span className="bg-amber-900 text-amber-200 px-1.5 py-0.2 rounded-full text-[10px]">
                {repairStats.activeCount}
              </span>
            </button>
          )}

          {(role === 'admin' || role === 'salesperson') && (
            <button
              onClick={() => setActiveTab('installments')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'installments'
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <span>{t.tabInstallments}</span>
              <span className="bg-sky-900 text-sky-200 px-1.5 py-0.2 rounded-full text-[10px]">
                {installments.length}
              </span>
            </button>
          )}

          {role === 'admin' && (
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-stone-700 text-white shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              {t.tabInventory}
            </button>
          )}
        </div>
      </div>

      {/* Testing Mode & Data Reset Toolbar */}
      <div className="bg-stone-900/90 border border-stone-800 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-md">
        <div className="flex items-center gap-2.5">
          <span className={`w-3 h-3 rounded-full shrink-0 ${orders.length === 0 && repairs.length === 0 && installments.length === 0 ? 'bg-emerald-400 animate-pulse' : 'bg-sky-400'}`}></span>
          <div>
            <div className="font-black text-white text-sm flex items-center gap-2">
              <span>{language === 'ar' ? 'وضع تجربة المتجر (Store Testing Mode)' : 'Mode Test de la boutique'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {orders.length === 0 && repairs.length === 0 && installments.length === 0
                  ? (language === 'ar' ? 'مفرغة 0 دج' : 'Vide 0 DZD')
                  : `${orders.length} طلبية`}
              </span>
            </div>
            <p className="text-stone-400 text-xs mt-0.5">
              {language === 'ar'
                ? 'لوحة التحكم والأرقام مفرغة ومجهزة لتجربة عمليات الشراء والطلبيات الجديدة من واجهة المتجر مباشرة.'
                : 'Les métriques sont à zéro et prêtes pour vos commandes de test depuis la boutique.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
          <button
            onClick={() => {
              if (window.confirm(language === 'ar' ? 'هل تود تفريغ كامل معطيات لوحة التحكم وتصفير جميع الطلبات والإحصائيات (0 دج)؟' : 'Voulez-vous réinitialiser toutes les données à zéro ?')) {
                clearAllDashboardData();
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition flex items-center gap-1.5 font-bold cursor-pointer text-xs"
            title="تفريغ جميع الطلبيات والمعطيات لتجربة المتجر من الصفر"
          >
            <Trash2 className="w-4 h-4" />
            <span>{language === 'ar' ? 'تفريغ وتصفير المعطيات (0 دج)' : 'Vider les données (0 DZD)'}</span>
          </button>

          <button
            onClick={() => loadDemoData()}
            className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition flex items-center gap-1.5 font-semibold cursor-pointer text-xs"
            title="تحميل عينات بيانات توضيحية للمعاينة"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'ar' ? 'تحميل بيانات تجريبية (Demo)' : 'Charger démo'}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Financial & Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-stone-500 text-xs">
                <span>{language === 'ar' ? 'المبيعات المسلمة (COD):' : 'Ventes livrées:'}</span>
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-emerald-700">
                {totalRevenue.toLocaleString()} {t.currency}
              </div>
              <p className="text-[11px] text-stone-500">
                {orders.filter((o) => o.status === 'delivered').length} {language === 'ar' ? 'طلبات تم تسليمها وقبض أموالها' : 'commandes encaissées'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-stone-500 text-xs">
                <span>{language === 'ar' ? 'مبالغ قيد التوصيل (Yalidine/ZR):' : 'En cours de livraison:'}</span>
                <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <Truck className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-stone-900">
                {pendingCodAmount.toLocaleString()} {t.currency}
              </div>
              <p className="text-[11px] text-stone-500">
                {orders.filter((o) => o.status === 'shipped').length} {language === 'ar' ? 'طلبية مشحونة مع شركة التوصيل' : 'colis en route'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-stone-500 text-xs">
                <span>{language === 'ar' ? 'محفظة التقسيط المحصلة:' : 'Facilités encaissées:'}</span>
                <span className="p-2 rounded-xl bg-sky-50 text-sky-700">
                  <CreditCard className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-sky-700">
                {installmentsStats.totalCollected.toLocaleString()} {t.currency}
              </div>
              <p className="text-[11px] text-stone-500">
                {language === 'ar' ? 'متبقي مستحق:' : 'Reste à échoir:'} {installmentsStats.totalPending.toLocaleString()} {t.currency}
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-stone-500 text-xs">
                <span>{language === 'ar' ? 'عائدات ورشة الصيانة:' : 'Recettes atelier:'}</span>
                <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <Wrench className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-amber-700">
                {repairStats.totalRepairRevenue.toLocaleString()} {t.currency}
              </div>
              <p className="text-[11px] text-stone-500">
                {repairStats.readyCount} {language === 'ar' ? 'هواتف جاهزة للاستلام' : 'appareils prêts'}
              </p>
            </div>
          </div>

          {/* Quick Operations Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Orders Needing Call Confirmation */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'ar' ? 'طلبيات تنتظر التأكيد الهاتفي (Confirmation):' : 'À confirmer par téléphone:'}</span>
                </h3>
                <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">
                  {orders.filter((o) => o.status === 'pending_call').length}
                </span>
              </div>

              {orders.filter((o) => o.status === 'pending_call').length === 0 ? (
                <div className="p-6 rounded-2xl bg-stone-50/70 border border-dashed border-stone-200 text-center">
                  <Inbox className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-stone-600">
                    {language === 'ar' ? 'لا توجد طلبيات بانتظار التأكيد حالياً' : 'Aucune commande en attente'}
                  </p>
                  <p className="text-[11px] text-stone-400 mt-1">
                    {language === 'ar' ? 'قم بإجراء طلب تجريبي من واجهة المتجر وسيظهر هنا فوراً' : 'Passez une commande test pour la voir ici'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders
                    .filter((o) => o.status === 'pending_call')
                    .slice(0, 4)
                    .map((ord) => (
                      <div
                        key={ord.id}
                        className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900">{ord.customerName}</span>
                            <span className="text-stone-400 font-mono">#{ord.orderNumber}</span>
                          </div>
                          <p className="text-stone-500 mt-0.5">
                            {ord.wilayaName} • <span className="font-mono text-stone-700">{ord.phone}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'confirmed')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition cursor-pointer"
                          >
                            {language === 'ar' ? 'تأكيد الطلب' : 'Confirmer'}
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Overdue or Pending Installments alerts */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>{language === 'ar' ? 'أقساط تقسيط مستحقة المتابعة:' : 'Échéances à relancer:'}</span>
                </h3>
                <span className="text-xs bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full font-bold">
                  {installmentsStats.totalOverdue > 0 ? 'تنبيه' : 'منتظمة'}
                </span>
              </div>

              {installments.length === 0 ? (
                <div className="p-6 rounded-2xl bg-stone-50/70 border border-dashed border-stone-200 text-center">
                  <Inbox className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-stone-600">
                    {language === 'ar' ? 'لا توجد أقساط أو ملفات مسجلة حالياً' : 'Aucune échéance en cours'}
                  </p>
                  <p className="text-[11px] text-stone-400 mt-1">
                    {language === 'ar' ? 'محفظة التقسيط فارغة بانتظار تجربة ملف جديد' : 'Aucun dossier de crédit'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {installments.slice(0, 3).map((plan) => {
                    const pending = plan.schedule?.find((s) => s.status !== 'paid');
                    if (!pending) return null;

                    return (
                      <div
                        key={plan.id}
                        className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900">{plan.customerName}</span>
                            <span className="text-sky-700 font-bold font-mono">
                              {pending.amount.toLocaleString()} دج
                            </span>
                          </div>
                          <p className="text-stone-500 mt-0.5">
                            القسط {pending.installmentNumber} • استحقاق {pending.dueDate}
                          </p>
                        </div>

                        <button
                          onClick={() => handleSendInstallmentReminder(plan, pending.dueDate, pending.amount)}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 transition cursor-pointer text-[11px]"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'تذكير واتساب' : 'WhatsApp'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Orders Manager (CodFlow workflow) */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-stone-900">
                {language === 'ar' ? 'إدارة طلبيات المتجر والتوصيل (58 ولاية)' : 'Gestion des Commandes & Expédition'}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                تأكيد الاتصال، توليد بوليصة الشحن مع ياليدين / ZR Express، ومتابعة الدفع عند الاستلام
              </p>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {(['all', 'pending_call', 'confirmed', 'shipped', 'delivered', 'returned'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    orderStatusFilter === st
                      ? 'bg-stone-900 text-white shadow'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {st === 'all'
                    ? 'الكل'
                    : st === 'pending_call'
                    ? 'بانتظار التأكيد'
                    : st === 'confirmed'
                    ? 'مؤكد'
                    : st === 'shipped'
                    ? 'قيد الشحن'
                    : st === 'delivered'
                    ? 'تم التسليم'
                    : 'مرتجع'}
                </button>
              ))}
            </div>
          </div>

          {/* Orders - Mobile Cards View (Optimized for Phones) */}
          <div className="block md:hidden space-y-3">
            {orders.filter((o) => orderStatusFilter === 'all' || o.status === orderStatusFilter).length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-stone-200">
                <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 mx-auto mb-2">
                  <Inbox className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-stone-700">
                  {language === 'ar' ? 'سجل الطلبيات فارغ تماماً (0 طلبية)' : 'Aucune commande enregistrée'}
                </h4>
                <p className="text-xs text-stone-400 mt-1">
                  {language === 'ar' ? 'عندما يطلب الزبون هاتفاً ستظهر معلوماته هنا فوراً' : 'Les commandes passées apparaîtront ici'}
                </p>
              </div>
            ) : (
              orders
                .filter((o) => orderStatusFilter === 'all' || o.status === orderStatusFilter)
                .map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3"
                  >
                    {/* Order header */}
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <div>
                        <span className="font-mono font-bold text-stone-900 text-sm">
                          #{order.orderNumber}
                        </span>
                        <span className="text-[11px] text-stone-400 block font-mono">
                          {order.date}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          order.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'confirmed'
                            ? 'bg-purple-100 text-purple-800'
                            : order.status === 'pending_call'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {order.status === 'pending_call'
                          ? 'بانتظار الاتصال'
                          : order.status === 'confirmed'
                          ? 'تم التأكيد'
                          : order.status === 'shipped'
                          ? 'تم الشحن'
                          : order.status === 'delivered'
                          ? 'تم التسليم'
                          : 'مرتجع'}
                      </span>
                    </div>

                    {/* Customer Info Box (Prominent on Phone View) */}
                    <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500 font-medium">{language === 'ar' ? 'الزبون:' : 'Client:'}</span>
                        <span className="font-black text-stone-900 text-sm">{order.customerName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500 font-medium">{language === 'ar' ? 'الهاتف:' : 'Tél:'}</span>
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${order.phone}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold font-mono text-xs shadow-sm transition"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span dir="ltr">{order.phone}</span>
                          </a>
                        </div>
                      </div>
                      {order.phoneSecondary && (
                        <div className="flex items-center justify-between">
                          <span className="text-stone-500 font-medium">{language === 'ar' ? 'هاتف ثانٍ:' : 'Tél 2:'}</span>
                          <a
                            href={`tel:${order.phoneSecondary}`}
                            className="text-stone-700 font-mono font-semibold"
                            dir="ltr"
                          >
                            {order.phoneSecondary}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500 font-medium">{language === 'ar' ? 'الوجهة:' : 'Destination:'}</span>
                        <span className="font-bold text-stone-800">
                          {order.deliveryType === 'store_pickup'
                            ? (language === 'ar' ? 'محل حمتين تيليكوم 4 (الوادي)' : 'Magasin Hamtine Telecom 4')
                            : `${order.wilayaName} (${order.commune})`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500 font-medium">{language === 'ar' ? 'التوصيل:' : 'Mode:'}</span>
                        <span className={`font-semibold ${order.deliveryType === 'store_pickup' ? 'text-amber-700 font-bold' : 'text-stone-700'}`}>
                          {order.deliveryType === 'store_pickup'
                            ? (language === 'ar' ? '🏪 استلام ودفع بالمحل' : 'Retrait & Paiement Magasin')
                            : order.deliveryType === 'home'
                            ? (language === 'ar' ? 'توصيل منزلي' : 'À domicile')
                            : (language === 'ar' ? 'مكتب Stop Desk' : 'Point relais')}
                        </span>
                      </div>
                    </div>

                    {/* Products and Total */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="text-stone-600 line-clamp-1 max-w-[60%]">
                        {order.items.map((it) => `${it.productName} (x${it.quantity})`).join(', ')}
                      </div>
                      <div className="font-black text-emerald-800 text-sm">
                        {order.total.toLocaleString()} {t.currency}
                      </div>
                    </div>

                    {/* Quick actions for Mobile */}
                    <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                      {order.status === 'pending_call' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'confirmed')}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{order.deliveryType === 'store_pickup' ? (language === 'ar' ? 'تأكيد حجز المحل' : 'Confirmer') : (language === 'ar' ? 'تأكيد الطلب' : 'Confirmer')}</span>
                        </button>
                      )}
                      {order.status === 'confirmed' && (
                        order.deliveryType === 'store_pickup' ? (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                            className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                          >
                            <Store className="w-3.5 h-3.5" />
                            <span>{language === 'ar' ? 'تم الاستلام والدفع بالمحل' : 'Payé & Retiré en magasin'}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              const tracking = `YAL-${Math.floor(100000 + Math.random() * 900000)}`;
                              updateOrderStatus(order.id, 'shipped', tracking);
                            }}
                            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>شحن Yalidine</span>
                          </button>
                        )
                      )}
                      {order.status === 'shipped' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>تم التسليم</span>
                        </button>
                      )}
                      <a
                        href={`https://wa.me/213${order.phone.replace(/^0/, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        title="واتساب"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* Orders Table (Desktop) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="bg-stone-100 text-stone-800 border-b border-stone-200">
                  <th className="p-3 font-bold">رقم الطلب والتاريخ</th>
                  <th className="p-3 font-bold">الزبون والهاتف</th>
                  <th className="p-3 font-bold">الولاية والبلدية</th>
                  <th className="p-3 font-bold">المنتجات</th>
                  <th className="p-3 font-bold">المبلغ الإجمالي</th>
                  <th className="p-3 font-bold">الحالة</th>
                  <th className="p-3 font-bold text-center">الإجراءات السريعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-stone-700">
                {orders.filter((o) => orderStatusFilter === 'all' || o.status === orderStatusFilter).length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center bg-white">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
                        <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400">
                          <Inbox className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-black text-stone-700">
                          {language === 'ar' ? 'سجل الطلبيات فارغ تماماً (0 طلبية)' : 'Aucune commande enregistrée'}
                        </h4>
                        <p className="text-xs text-stone-400 leading-relaxed">
                          {language === 'ar'
                            ? 'المتجر مفرغ وجاهز لتجربتك! قم باختيار هاتف وإتمام طلبية شراء من واجهة المتجر، وستظهر هنا فوراً مع خيارات الاتصال والتأكيد وتوليد كود التتبع.'
                            : 'Passez une commande sur la boutique pour la tester en temps réel ici.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders
                    .filter((o) => orderStatusFilter === 'all' || o.status === orderStatusFilter)
                    .map((order) => (
                    <tr key={order.id} className="hover:bg-stone-50">
                      <td className="p-3">
                        <span className="font-mono font-bold text-stone-900 block">
                          #{order.orderNumber}
                        </span>
                        <span className="text-[11px] text-stone-400 font-mono">
                          {order.date}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className="font-bold text-stone-900 block">
                          {order.customerName}
                        </span>
                        <span className="font-mono text-stone-600 block" dir="ltr">
                          {order.phone}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className="font-semibold text-stone-900 block">
                          {order.deliveryType === 'store_pickup'
                            ? (language === 'ar' ? 'محل حمتين تيليكوم 4 (الوادي)' : 'Magasin Hamtine Telecom 4')
                            : `${order.wilayaName} (${order.commune})`}
                        </span>
                        <span className={`text-[11px] ${order.deliveryType === 'store_pickup' ? 'text-amber-700 font-bold' : 'text-stone-500'}`}>
                          {order.deliveryType === 'store_pickup'
                            ? '🏪 استلام ودفع بالمحل'
                            : order.deliveryType === 'home'
                            ? 'توصيل منزلي'
                            : 'مكتب ياليدين / Stop Desk'}
                        </span>
                      </td>

                      <td className="p-3 max-w-xs">
                        <span className="line-clamp-1 font-medium">
                          {order.items.map((it) => `${it.productName} (x${it.quantity})`).join(', ')}
                        </span>
                      </td>

                      <td className="p-3 font-black text-emerald-800 text-sm">
                        {order.total.toLocaleString()} {t.currency}
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-block ${
                            order.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'shipped'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'confirmed'
                              ? 'bg-purple-100 text-purple-800'
                              : order.status === 'pending_call'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {order.status === 'pending_call'
                            ? 'بانتظار الاتصال'
                            : order.status === 'confirmed'
                            ? (order.deliveryType === 'store_pickup' ? 'محجوز بالمحل' : 'تم التأكيد')
                            : order.status === 'shipped'
                            ? 'تم الشحن'
                            : order.status === 'delivered'
                            ? (order.deliveryType === 'store_pickup' ? 'تم الاستلام والقبض' : 'تم التسليم والقبض')
                            : 'مرتجع'}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1.5">
                          {order.status === 'pending_call' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'confirmed')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                            >
                              {order.deliveryType === 'store_pickup' ? 'تأكيد الحجز' : 'تأكيد'}
                            </button>
                          )}

                          {order.status === 'confirmed' && (
                            order.deliveryType === 'store_pickup' ? (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'delivered')}
                                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold whitespace-nowrap"
                              >
                                تم الاستلام بالمحل
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  const tracking = `YAL-${Math.floor(100000 + Math.random() * 900000)}`;
                                  updateOrderStatus(order.id, 'shipped', tracking);
                                }}
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                              >
                                شحن Yalidine
                              </button>
                            )
                          )}

                          {order.status === 'shipped' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'delivered')}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold"
                            >
                              تم التسليم
                            </button>
                          )}

                          <button
                            onClick={() => window.print()}
                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700"
                            title="طباعة بوليصة الشحن"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Technician Repair Workshop Board */}
      {activeTab === 'repairs' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-700">
                  <Wrench className="w-5 h-5" />
                </span>
                <h2 className="text-lg sm:text-xl font-black text-stone-900">
                  {language === 'ar' ? 'ورشة الصيانة والتصليح (لوحة الفنيين)' : 'Atelier & Établi des Techniciens'}
                </h2>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                تحديث مراحل الفحص، تسجيل القطع المستبدلة، تعديل السعر النهائي، وإرسال تنبيهات SMS/واتساب للزبون
              </p>
            </div>

            {/* Repair filter */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {(['all', 'received', 'diagnosing', 'repairing', 'ready', 'delivered'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setRepairStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    repairStatusFilter === st
                      ? 'bg-amber-600 text-white shadow'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {st === 'all' ? 'الكل' : t.repairStages[st]}
                </button>
              ))}
            </div>
          </div>

          {/* Repair Tickets Grid/List */}
          {repairs.filter((r) => repairStatusFilter === 'all' || r.status === repairStatusFilter).length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-stone-50/70 border border-dashed border-stone-200">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 mx-auto mb-2">
                <Wrench className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-black text-stone-700">
                {language === 'ar' ? 'لا توجد تذاكر صيانة حالياً في الورشة' : 'Aucun ticket de réparation en cours'}
              </h4>
              <p className="text-xs text-stone-400 mt-1 max-w-md mx-auto leading-relaxed">
                {language === 'ar'
                  ? 'يمكنك تجربة تقديم طلب تصليح هاتف من صفحة "خدمات الصيانة والورشة" وسيتم إنشاء تذكرة برقم تتبع تظهر في لوحة الفنيين هنا مباشرة.'
                  : 'Vous pouvez créer une demande de réparation depuis la section Atelier.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {repairs
                .filter((r) => repairStatusFilter === 'all' || r.status === repairStatusFilter)
                .map((repair) => (
                <div
                  key={repair.id}
                  className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold bg-white text-stone-900 px-2.5 py-1 rounded-lg border border-stone-200 shadow-xs">
                        #{repair.ticketNumber}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          repair.status === 'ready'
                            ? 'bg-emerald-100 text-emerald-800'
                            : repair.status === 'repairing'
                            ? 'bg-amber-100 text-amber-800'
                            : repair.status === 'diagnosing'
                            ? 'bg-sky-100 text-sky-800'
                            : repair.status === 'delivered'
                            ? 'bg-stone-200 text-stone-800'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {t.repairStages[repair.status]}
                      </span>
                    </div>

                    <h3 className="font-bold text-stone-900 text-sm">
                      {repair.phoneBrand} {repair.phoneModel}
                    </h3>

                    <p className="text-xs text-stone-600 line-clamp-2 bg-white p-2.5 rounded-xl border border-stone-200">
                      <span className="font-bold">{language === 'ar' ? 'العطل:' : 'Panne:'}</span> {repair.faultDescription}
                    </p>

                    <div className="text-xs text-stone-500 space-y-1 pt-1">
                      <div className="flex justify-between">
                        <span>الزبون:</span>
                        <span className="font-semibold text-stone-800">{repair.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>الهاتف:</span>
                        <span className="font-mono text-stone-800">{repair.phone}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>السعر:</span>
                        <span className="text-amber-700">
                          {(repair.finalPrice || repair.estimatedPrice).toLocaleString()} {t.currency}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2 border-t border-stone-200">
                    <button
                      onClick={() => {
                        setEditingRepair(repair);
                        setNewRepairStatus(repair.status);
                        setTechnicianNote(repair.technicianNotes || '');
                        setNewFinalPrice(repair.finalPrice || repair.estimatedPrice);
                        setNewPartsCost(repair.partsCost || 0);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>تعديل التشخيص والسعر والحالة</span>
                    </button>

                    <button
                      onClick={() => handleSendWhatsAppNotification(repair)}
                      className="w-full py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>إرسال إشعار للزبون (WhatsApp)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Technician Edit Modal */}
          {editingRepair && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 space-y-5 border border-stone-200">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <div>
                    <h3 className="font-black text-stone-900 text-base">
                      تحديث بطاقة الصيانة #{editingRepair.ticketNumber}
                    </h3>
                    <p className="text-xs text-stone-500">
                      {editingRepair.phoneBrand} {editingRepair.phoneModel}
                    </p>
                  </div>
                  <button onClick={() => setEditingRepair(null)} className="text-stone-400 hover:text-stone-700">✕</button>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Status selector */}
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">حالة التصليح الحالية:</label>
                    <select
                      value={newRepairStatus}
                      onChange={(e) => setNewRepairStatus(e.target.value as RepairStatus)}
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-300 font-bold bg-white"
                    >
                      <option value="received">1. تم الاستلام</option>
                      <option value="diagnosing">2. قيد الفحص والتشخيص</option>
                      <option value="repairing">3. قيد الإصلاح وتغيير القطع</option>
                      <option value="ready">4. جاهز للاستلام (Ready)</option>
                      <option value="delivered">5. تم التسليم للزبون</option>
                      <option value="cancelled">تعذر الإصلاح / ملغى</option>
                    </select>
                  </div>

                  {/* Technician Notes */}
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">ملاحظات الفني والتشخيص الفني:</label>
                    <textarea
                      rows={3}
                      value={technicianNote}
                      onChange={(e) => setTechnicianNote(e.target.value)}
                      placeholder="تم فحص الدارة، استبدال الشاشة الأصلية، فحص الشحن..."
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Costs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">تكلفة قطع الغيار (دج):</label>
                      <input
                        type="number"
                        value={newPartsCost}
                        onChange={(e) => setNewPartsCost(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">السعر النهائي للزبون (دج):</label>
                      <input
                        type="number"
                        value={newFinalPrice}
                        onChange={(e) => setNewFinalPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-amber-300 font-bold text-amber-900 bg-amber-50"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={handleSaveRepair}
                      className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition"
                    >
                      حفظ التعديلات والتحديث
                    </button>
                    <button
                      onClick={() => setEditingRepair(null)}
                      className="px-4 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Installment Portfolio & Debt Collection */}
      {activeTab === 'installments' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-700">
                  <CreditCard className="w-5 h-5" />
                </span>
                <h2 className="text-lg sm:text-xl font-black text-stone-900">
                  {language === 'ar' ? 'محفظة البيع بالتقسيط وسجل التحصيل' : 'Portefeuille de Vente par Facilité'}
                </h2>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                جدول السداد لكل زبون، تسجيل الدفعات (كاش / بريدي موب / CCP)، ومتابعة المتأخرات
              </p>
            </div>

            {/* Quick summary stats pills */}
            <div className="flex items-center gap-3 text-xs">
              <span className="bg-sky-50 text-sky-900 font-bold px-3 py-1 rounded-xl border border-sky-200">
                إجمالي التمويل: {installmentsStats.totalFinanced.toLocaleString()} دج
              </span>
              <span className="bg-emerald-50 text-emerald-900 font-bold px-3 py-1 rounded-xl border border-emerald-200">
                تم تحصيله: {installmentsStats.totalCollected.toLocaleString()} دج
              </span>
            </div>
          </div>

          {/* Installment Plans List */}
          {installments.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-stone-50/70 border border-dashed border-stone-200">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 mx-auto mb-2">
                <CreditCard className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-black text-stone-700">
                {language === 'ar' ? 'محفظة التقسيط فارغة تماماً (0 دج)' : 'Aucun dossier de facilité enregistré (0)'}
              </h4>
              <p className="text-xs text-stone-400 mt-1 max-w-md mx-auto leading-relaxed">
                {language === 'ar'
                  ? 'لا توجد أي عقود أو أقساط مسجلة حالياً. يمكنك تجربة إرسال طلب حجز تقسيط من صفحة تفاصيل المنتج أو من قسم "حاسبة التقسيط" وسيظهر ملف الزبون وجدول السداد هنا مباشرة.'
                  : 'Vous pouvez tester une simulation de crédit depuis le storefront.'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {installments.map((plan) => {
                const paidCount = plan.schedule.filter((it) => it.status === 'paid').length;

                return (
                  <div
                    key={plan.id}
                    className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-4"
                  >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-md text-xs">
                          #{plan.planNumber}
                        </span>
                        <span className="font-bold text-stone-900 text-sm">{plan.customerName}</span>
                        <span className="text-stone-500 text-xs font-mono">{plan.phone}</span>
                      </div>
                      <p className="text-xs text-stone-600 mt-1">
                        {plan.productName} • بطاقة تعريف: <span className="font-mono">{plan.nationalIdNumber}</span> • {plan.wilaya}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-white border border-stone-200 text-stone-800">
                        {paidCount} من {plan.totalMonths} أقساط مسددة
                      </span>
                      <button
                        onClick={() => {
                          const nextPending = plan.schedule?.find((s) => s.status !== 'paid');
                          if (nextPending) {
                            handleSendInstallmentReminder(plan, nextPending.dueDate, nextPending.amount);
                          }
                        }}
                        className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>تنبيه واتساب</span>
                      </button>
                    </div>
                  </div>

                  {/* Schedule Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {plan.schedule.map((item) => (
                      <div
                        key={item.installmentNumber}
                        className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${
                          item.status === 'paid'
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                            : item.status === 'overdue'
                            ? 'border-rose-300 bg-rose-50 text-rose-950'
                            : 'border-stone-200 bg-white text-stone-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold">القسط {item.installmentNumber}</span>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.status === 'paid'
                                ? 'bg-emerald-600'
                                : item.status === 'overdue'
                                ? 'bg-rose-600'
                                : 'bg-amber-500'
                            }`}
                          ></span>
                        </div>

                        <span className="font-mono text-[11px] text-stone-500">{item.dueDate}</span>
                        <span className="font-extrabold text-stone-900 mt-1">
                          {item.amount.toLocaleString()} دج
                        </span>

                        {item.status === 'paid' ? (
                          <span className="text-[10px] text-emerald-700 font-bold mt-1">
                            ✓ مدفوع ({item.paymentMethod})
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setPayingPlan({
                                plan,
                                itemNumber: item.installmentNumber,
                                amount: item.amount,
                              });
                            }}
                            className="mt-2 py-1 px-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-[10px] text-center transition cursor-pointer"
                          >
                            تسجيل الدفع
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

          {/* Record Payment Modal */}
          {payingPlan && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4 border border-stone-200">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <h3 className="font-black text-stone-900 text-sm">
                    تسجيل سداد القسط #{payingPlan.itemNumber}
                  </h3>
                  <button onClick={() => setPayingPlan(null)} className="text-stone-400 hover:text-stone-700">✕</button>
                </div>

                <div className="bg-sky-50 p-3 rounded-xl border border-sky-200 text-xs">
                  <span className="block font-bold text-sky-900">{payingPlan.plan.customerName}</span>
                  <span className="text-stone-600">المبلغ المستحق: {payingPlan.amount.toLocaleString()} دج</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">طريقة الدفع:</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                    >
                      <option value="baridimob">تطبيق بريدي موب (BaridiMob)</option>
                      <option value="cash">نقداً في المحل (Cash)</option>
                      <option value="ccp">حوالة بريدية CCP</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">رقم الوصل أو العملية:</label>
                    <input
                      type="text"
                      value={receiptNumber}
                      onChange={(e) => setReceiptNumber(e.target.value)}
                      placeholder="BM-98214 أو رقم الوصل الورقي..."
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono"
                    />
                  </div>

                  <button
                    onClick={() => {
                      markInstallmentPaid(
                        payingPlan.plan.id,
                        payingPlan.itemNumber,
                        paymentMethod,
                        receiptNumber || undefined
                      );
                      setPayingPlan(null);
                      setReceiptNumber('');
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer mt-2"
                  >
                    تأكيد تسجيل الدفع وإصدار الوصل
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Inventory & Products */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-stone-900">
                {language === 'ar' ? 'إدارة المخزون والهواتف' : 'Gestion des Stocks & Produits'}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                إضافة أجهزة جديدة، ضبط الكميات المتوفرة، والأسعار
              </p>
            </div>

            <button
              onClick={() => setShowAddProductModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة هاتف أو ملحق جديد</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="bg-stone-100 text-stone-800 border-b border-stone-200">
                  <th className="p-3 font-bold">المنتج</th>
                  <th className="p-3 font-bold">الماركة والتصنيف</th>
                  <th className="p-3 font-bold">السعر</th>
                  <th className="p-3 font-bold">المخزون المتوفر</th>
                  <th className="p-3 font-bold">التقسيط</th>
                  <th className="p-3 font-bold">الضمان</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-stone-700">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50">
                    <td className="p-3 font-bold text-stone-900 flex items-center gap-2">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-8 h-8 rounded object-contain bg-white border border-stone-200"
                        referrerPolicy="no-referrer"
                      />
                      <span>{p.name}</span>
                    </td>
                    <td className="p-3 font-medium text-stone-600">
                      {p.brand} ({p.category})
                    </td>
                    <td className="p-3 font-black text-emerald-800">
                      {p.price.toLocaleString()} {t.currency}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={p.stock}
                          onChange={(e) => updateProduct(p.id, { stock: Number(e.target.value) })}
                          className="w-16 px-2 py-1 border border-stone-300 rounded text-center font-bold"
                        />
                        <span className="text-stone-400">قطعة</span>
                      </div>
                    </td>
                    <td className="p-3">
                      {p.allowInstallment ? (
                        <span className="text-emerald-700 font-bold">نعم (3/6/12)</span>
                      ) : (
                        <span className="text-stone-400">دفع كامل</span>
                      )}
                    </td>
                    <td className="p-3 font-medium">
                      {p.warrantyMonths} أشهر
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Product Modal */}
          {showAddProductModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4 border border-stone-200">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <h3 className="font-black text-stone-900 text-sm">إضافة هاتف للمخزن</h3>
                  <button onClick={() => setShowAddProductModal(false)} className="text-stone-400 hover:text-stone-700">✕</button>
                </div>

                <form onSubmit={handleAddProductSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">اسم الهاتف والموديل *</label>
                    <input
                      type="text"
                      required
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      placeholder="مثال: آبل آيفون 16 برو ماكس 256 جيجا"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">الماركة</label>
                      <select
                        value={newProdBrand}
                        onChange={(e) => setNewProdBrand(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                      >
                        <option value="Apple">Apple</option>
                        <option value="Samsung">Samsung</option>
                        <option value="Xiaomi">Xiaomi</option>
                        <option value="Realme">Realme</option>
                        <option value="Google">Google</option>
                        <option value="Anker">Anker</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">الحالة</label>
                      <select
                        value={newProdCategory}
                        onChange={(e) => setNewProdCategory(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                      >
                        <option value="new-phone">جديد (New)</option>
                        <option value="used-phone">مستعمل مضمون (Used)</option>
                        <option value="accessory">ملحق / إكسسوار</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">السعر بالدينار (دج) *</label>
                      <input
                        type="number"
                        required
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">الكمية الأولية *</label>
                      <input
                        type="number"
                        required
                        value={newProdStock}
                        onChange={(e) => setNewProdStock(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">مدة الضمان (بالأشهر)</label>
                    <input
                      type="number"
                      value={newProdWarranty}
                      onChange={(e) => setNewProdWarranty(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer mt-2"
                  >
                    حفظ وإدراج في المتجر
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
