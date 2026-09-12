import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { InstallmentPlan } from '../../types';
import { ALGERIA_WILAYAS } from '../../data/wilayas';
import {
  CreditCard,
  Calculator,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileCheck,
  ShieldAlert,
  Search,
  Zap,
  ArrowRight,
  PhoneCall,
  User,
  Building,
  DollarSign,
  Send,
  Store,
} from 'lucide-react';

interface InstallmentSectionProps {
  onSelectProductForInstallment: (productId: string) => void;
}

export const InstallmentSection: React.FC<InstallmentSectionProps> = ({
  onSelectProductForInstallment,
}) => {
  const {
    products,
    language,
    t,
    installments,
    createInstallmentPlan,
    findInstallmentByQuery,
    showToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'simulator' | 'my-plan' | 'requirements'>('simulator');

  // Simulator parameters
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products?.find((p) => p.allowInstallment)?.id || products?.[0]?.id || ''
  );
  const [customPrice, setCustomPrice] = useState<number>(150000);
  const [useCustomPrice, setUseCustomPrice] = useState<boolean>(false);
  const [durationMonths, setDurationMonths] = useState<number>(6);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(30); // 30%

  // Lookup parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedPlans, setSearchedPlans] = useState<InstallmentPlan[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Application form states
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [wilaya, setWilaya] = useState('الجزائر العاصمة');
  const [commune, setCommune] = useState('');
  const [jobType, setJobType] = useState('موظف قطاع عام (تعليم / صحة / إدارة)');
  const [monthlySalary, setMonthlySalary] = useState('60,000 - 90,000 دج');

  // Active product object
  const activeProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId),
    [products, selectedProductId]
  );

  const priceToFinance = useCustomPrice ? customPrice : (activeProduct?.price || 150000);

  // Calculations
  const downPayment = Math.round((priceToFinance * (downPaymentPercent / 100)) / 1000) * 1000;
  const remainingTotal = Math.max(0, priceToFinance - downPayment);
  const monthlyPayment = Math.round(remainingTotal / durationMonths);

  // Generate simulated schedule
  const simulatedSchedule = useMemo(() => {
    const list = [];
    const now = new Date();
    for (let i = 1; i <= durationMonths; i++) {
      const d = new Date(now);
      d.setMonth(d.getMonth() + i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      list.push({
        number: i,
        dueDate: dateStr,
        amount: monthlyPayment,
      });
    }
    return list;
  }, [durationMonths, monthlyPayment]);

  const handleSearchPlans = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const results = findInstallmentByQuery(searchQuery);
    setSearchedPlans(results);
    setHasSearched(true);
    if (results.length > 0) {
      showToast(
        language === 'ar'
          ? `تم العثور على ${results.length} ملف تقسيط مسجل`
          : `${results.length} dossier(s) trouvé(s)`
      );
    } else {
      showToast(
        language === 'ar'
          ? 'لم يتم العثور على أي ملف بهذا الرقم أو رقم بطاقة التعريف'
          : 'Aucun dossier trouvé pour ces identifiants',
        'warning'
      );
    }
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!applicantName.trim() || !applicantPhone.trim() || !nationalId.trim()) {
      showToast(language === 'ar' ? 'يرجى ملء جميع الحقول الإلزامية' : 'Champs obligatoires manquants', 'warning');
      return;
    }

    const newPlan = createInstallmentPlan({
      productId: activeProduct?.id || 'custom',
      productName: activeProduct?.name || 'طلب شراء هاتف بالتقسيط',
      productPrice: priceToFinance,
      customerName: applicantName,
      phone: applicantPhone,
      nationalIdNumber: nationalId,
      wilaya,
      commune,
      jobType,
      monthlySalaryRange: monthlySalary,
      totalMonths: durationMonths,
      downPayment,
      remainingAmount: remainingTotal,
      monthlyAmount: monthlyPayment,
    });

    setShowApplyModal(false);
    setSearchedPlans([newPlan]);
    setActiveTab('my-plan');
    setHasSearched(true);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Installment Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-sky-950 via-stone-900 to-stone-900 text-white p-6 sm:p-10 border border-sky-900/40 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold">
            <CreditCard className="w-3.5 h-3.5 text-sky-400" />
            <span>{language === 'ar' ? 'خدمة البيع بالتقسيط الميسر في الجزائر' : 'Vente par Facilité Sans Frais Cachés'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            {t.installmentHeroTitle}
          </h1>

          <p className="text-stone-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            {t.installmentHeroSubtitle}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="relative z-10 mt-6 flex items-center gap-2 overflow-x-auto border-t border-stone-800 pt-4">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/40'
                : 'bg-stone-800/80 text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>{t.installmentSimulatorTitle}</span>
          </button>

          <button
            onClick={() => setActiveTab('my-plan')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'my-plan'
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/40'
                : 'bg-stone-800/80 text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{t.myInstallmentsTitle}</span>
          </button>

          <button
            onClick={() => setActiveTab('requirements')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'requirements'
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/40'
                : 'bg-stone-800/80 text-stone-300 hover:bg-stone-800'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>{t.requirementsTitle}</span>
          </button>
        </div>
      </div>

      {/* Strict In-Store Only Notice Banner */}
      <div className="rounded-2xl bg-sky-950/40 border-2 border-sky-400/40 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sky-100 shadow-md">
        <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 shrink-0">
          <Store className="w-6 h-6" />
        </div>
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-black text-sm sm:text-base text-white">
              {language === 'ar'
                ? 'البيع بالتقسيط يتم حصرياً على مستوى المحل فقط (ولاية الوادي - حمتين تيليكوم 4)'
                : 'La vente par facilité s\'effectue exclusivement en magasin (El Oued - Hamtine Telecom 4)'}
            </h3>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-sky-400 text-slate-950">
              {language === 'ar' ? 'حضور شخصي إلزامي' : 'Présence physique requise'}
            </span>
          </div>
          <p className="text-xs text-sky-200/90 leading-relaxed">
            {language === 'ar'
              ? 'وفقاً للإجراءات التنظيمية والمالية، يتم إيداع الملف الورقي الأصلي، دراسة الأهلية، توقيع العقد واستلام هاتفك الذكي فوراً داخل مقر محلنا الرسمي بحمتين تيليكوم 4 (ولاية الوادي - مفترق طرق الملاح). الطلبات والمحاكاة عبر الموقع تُمكّنك من حجز موعد مبدئي وحجز الجهاز فقط، ولا يتوفر شحن منزلي لطلبات التقسيط.'
              : 'En conformité avec les réglementations, l\'étude du dossier physique, la signature du contrat et le retrait du smartphone s\'effectuent directement dans notre boutique Hamtine Telecom 4 à El Oued. Aucune livraison à domicile pour la facilité.'}
          </p>
        </div>
      </div>

      {/* Tab 1: Interactive Installment Simulator */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
            <div className="border-b border-stone-200 pb-4">
              <h2 className="text-lg sm:text-xl font-black text-stone-900">
                {language === 'ar' ? 'محاكي الأقساط الشهرية الفوري' : 'Calculateur de mensualités'}
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                {language === 'ar'
                  ? 'اختر الهاتف المراد شراؤه أو حدد ميزانيتك، واختر مدة التقسيط والدفعة الأولى للاطلاع على جدول السداد فوراً'
                  : 'Sélectionnez le téléphone et la durée pour voir les échéances exactes'}
              </p>
            </div>

            {/* 1. Phone Selection or Custom Price */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  {language === 'ar' ? '1. الجهاز أو القيمة الإجمالية:' : '1. Appareil ou montant total:'}
                </label>
                <button
                  type="button"
                  onClick={() => setUseCustomPrice(!useCustomPrice)}
                  className="text-xs text-sky-700 font-bold hover:underline cursor-pointer"
                >
                  {useCustomPrice
                    ? (language === 'ar' ? 'اختيار من قائمة الهواتف' : 'Choisir parmi nos smartphones')
                    : (language === 'ar' ? 'كتابة سعر مخصص' : 'Saisir un montant libre')}
                </button>
              </div>

              {!useCustomPrice ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {products.filter((p) => p.allowInstallment).map((prod) => (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => setSelectedProductId(prod.id)}
                      className={`p-3 rounded-2xl border text-right flex items-center justify-between gap-3 transition cursor-pointer ${
                        selectedProductId === prod.id
                          ? 'border-sky-600 bg-sky-50/80 ring-2 ring-sky-500/20'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-10 h-10 object-contain rounded-lg p-0.5 bg-white border border-stone-200"
                          referrerPolicy="no-referrer"
                        />
                        <div className="text-xs">
                          <h4 className="font-bold text-stone-900 line-clamp-1">
                            {prod.name}
                          </h4>
                          <span className="text-stone-500 text-[11px]">{prod.brand}</span>
                        </div>
                      </div>
                      <span className="font-extrabold text-xs text-sky-800 whitespace-nowrap">
                        {prod.price.toLocaleString()} {t.currency}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {language === 'ar' ? 'أدخل السعر الإجمالي للهاتف (دج)' : 'Prix total du smartphone (DZD)'}
                  </label>
                  <input
                    type="number"
                    step={1000}
                    min={20000}
                    max={500000}
                    value={customPrice}
                    onChange={(e) => setCustomPrice(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-bold text-stone-900 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              )}
            </div>

            {/* 2. Down payment % Selection */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  {language === 'ar' ? '2. نسبة الدفعة الأولى (Avance):' : '2. Apport initial (Avance):'}
                </label>
                <span className="text-xs font-bold text-sky-700">
                  {downPayment.toLocaleString()} {t.currency} ({downPaymentPercent}%)
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[20, 30, 40, 50].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setDownPaymentPercent(pct)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      downPaymentPercent === pct
                        ? 'border-sky-600 bg-sky-700 text-white shadow'
                        : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Duration Selection */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                {language === 'ar' ? '3. مدة التقسيط (عدد الأشهر):' : '3. Durée de la facilité (mois):'}
              </label>

              <div className="grid grid-cols-3 gap-3">
                {[3, 6, 12].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDurationMonths(m)}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition cursor-pointer ${
                      durationMonths === m
                        ? 'border-sky-600 bg-sky-50 text-sky-950 ring-2 ring-sky-500/20'
                        : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                    }`}
                  >
                    <span className="text-base font-black">
                      {m} {language === 'ar' ? 'أشهر' : 'mois'}
                    </span>
                    <span className="text-[11px] text-stone-500 mt-0.5">
                      {Math.round(remainingTotal / m).toLocaleString()} {t.currency} / {language === 'ar' ? 'شهر' : 'm'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Repayment Schedule Table */}
            <div className="space-y-3 pt-2 border-t border-stone-200">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-sky-600" />
                <span>{language === 'ar' ? 'جدول استحقاق الأقساط الشهرية المقدرة:' : 'Échéancier estimatif:'}</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="bg-stone-100 text-stone-700 border-b border-stone-200">
                      <th className="p-2.5 font-bold">#</th>
                      <th className="p-2.5 font-bold">{language === 'ar' ? 'تاريخ الاستحقاق' : 'Date d\'échéance'}</th>
                      <th className="p-2.5 font-bold">{language === 'ar' ? 'قيمة القسط' : 'Montant'}</th>
                      <th className="p-2.5 font-bold">{language === 'ar' ? 'طريقة الدفع' : 'Mode de paiement'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-stone-700">
                    {simulatedSchedule.map((row) => (
                      <tr key={row.number} className="hover:bg-stone-50">
                        <td className="p-2.5 font-mono font-bold text-sky-700">{row.number}</td>
                        <td className="p-2.5 font-mono">{row.dueDate}</td>
                        <td className="p-2.5 font-bold text-stone-900">{row.amount.toLocaleString()} {t.currency}</td>
                        <td className="p-2.5 text-stone-500">BaridiMob / كاش في المحل / CCP</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Summary Card & Direct Application */}
          <div className="space-y-6">
            <div className="bg-sky-50 rounded-3xl p-6 border border-sky-200 space-y-5">
              <div className="flex items-center gap-2 text-sky-950 font-bold text-sm">
                <Zap className="w-5 h-5 text-sky-600 fill-current" />
                <span>{language === 'ar' ? 'ملخص خطة التقسيط:' : 'Résumé de l\'offre:'}</span>
              </div>

              <div className="space-y-3 text-xs bg-white rounded-2xl p-4 border border-sky-100 shadow-xs">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <span className="text-stone-500">{language === 'ar' ? 'السعر الإجمالي:' : 'Prix total:'}</span>
                  <span className="font-bold text-stone-900">{priceToFinance.toLocaleString()} {t.currency}</span>
                </div>
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <span className="text-stone-500">{language === 'ar' ? 'الدفعة الأولى (Avance):' : 'Acompte:'}</span>
                  <span className="font-black text-stone-900">{downPayment.toLocaleString()} {t.currency}</span>
                </div>
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <span className="text-stone-500">{language === 'ar' ? 'المبلغ المتبقي بالتقسيط:' : 'Reste à financer:'}</span>
                  <span className="font-bold text-stone-900">{remainingTotal.toLocaleString()} {t.currency}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-stone-900">{language === 'ar' ? 'القسط الشهري:' : 'Mensualité:'}</span>
                  <span className="text-xl font-black text-sky-700">
                    {monthlyPayment.toLocaleString()} {t.currency}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowApplyModal(true)}
                className="w-full py-4 px-4 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-900/30 transition cursor-pointer"
              >
                <CreditCard className="w-5 h-5" />
                <span>{t.applyForInstallment}</span>
              </button>

              <div className="space-y-2 text-[11px] text-sky-900 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{language === 'ar' ? 'دراسة فورية للملف خلال ساعتين' : 'Étude immédiate sous 2 heures'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{language === 'ar' ? 'بدون فوائد ربوية مخفية' : 'Sans frais cachés'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{language === 'ar' ? 'إمكانية الدفع عبر تطبيق BaridiMob' : 'Paiement via BaridiMob'}</span>
                </div>
              </div>
            </div>

            {/* Quick search existing plan box */}
            <div className="bg-stone-900 text-white rounded-3xl p-6 space-y-3">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-400" />
                <span>{language === 'ar' ? 'متابعة أقساطك الحالية' : 'Suivre vos mensualités'}</span>
              </h3>
              <p className="text-xs text-stone-400">
                {language === 'ar'
                  ? 'أدخل رقم بطاقة التعريف أو رقم هاتفك لمعرفة الأقساط المدفوعة والمتبقية'
                  : 'Entrez votre CNI ou téléphone'}
              </p>
              <button
                onClick={() => setActiveTab('my-plan')}
                className="w-full py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Search className="w-4 h-4 text-sky-400" />
                <span>{language === 'ar' ? 'البحث عن ملفي' : 'Rechercher mon dossier'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: My Installment Plan & Repayment Schedule */}
      {activeTab === 'my-plan' && (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
              <Search className="w-4 h-4 text-sky-600" />
              <span>{t.enterIdOrPhone}</span>
            </div>
            <form onSubmit={handleSearchPlans} className="flex gap-2 w-full sm:max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'ar' ? '0550... أو رقم بطاقة التعريف' : '0550... ou N° CNI'}
                className="flex-1 px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs focus:ring-2 focus:ring-sky-500 font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition cursor-pointer"
              >
                {t.trackBtn}
              </button>
            </form>
          </div>

          {searchedPlans.length > 0 ? (
            searchedPlans.map((plan) => {
              const paidCount = plan.schedule.filter((it) => it.status === 'paid').length;
              const overdueCount = plan.schedule.filter((it) => it.status === 'overdue').length;

              return (
                <div
                  key={plan.id}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold bg-sky-100 text-sky-800 px-3 py-1 rounded-full border border-sky-300">
                          #{plan.planNumber}
                        </span>
                        <span className="text-xs text-stone-400">
                          {language === 'ar' ? 'تاريخ البدء:' : 'Début:'} {plan.startDate}
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-black text-stone-900 mt-2">
                        {plan.productName}
                      </h2>
                      <p className="text-xs text-stone-500">
                        {plan.customerName} • {plan.phone} • {plan.wilaya}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                        {paidCount} / {plan.totalMonths} {language === 'ar' ? 'أقساط مدفوعة' : 'payés'}
                      </span>
                      {overdueCount > 0 && (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-100 text-rose-800">
                          {overdueCount} {language === 'ar' ? 'متأخر' : 'en retard'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Installment Schedule Table */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                      {language === 'ar' ? 'جدول الدفعات وتواريخ الاستحقاق:' : 'Calendrier des échéances:'}
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-right border-collapse">
                        <thead>
                          <tr className="bg-stone-100 text-stone-700 border-b border-stone-200">
                            <th className="p-3 font-bold">القسط</th>
                            <th className="p-3 font-bold">تاريخ الاستحقاق</th>
                            <th className="p-3 font-bold">المبلغ</th>
                            <th className="p-3 font-bold">الحالة</th>
                            <th className="p-3 font-bold">تاريخ الدفع والوصل</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200 text-stone-700">
                          {plan.schedule.map((item) => (
                            <tr
                              key={item.installmentNumber}
                              className={
                                item.status === 'paid'
                                  ? 'bg-emerald-50/40'
                                  : item.status === 'overdue'
                                  ? 'bg-rose-50/40'
                                  : 'hover:bg-stone-50'
                              }
                            >
                              <td className="p-3 font-bold font-mono">
                                القسط {item.installmentNumber} من {plan.totalMonths}
                              </td>
                              <td className="p-3 font-mono">{item.dueDate}</td>
                              <td className="p-3 font-extrabold text-stone-900">
                                {item.amount.toLocaleString()} {t.currency}
                              </td>
                              <td className="p-3">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                    item.status === 'paid'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : item.status === 'overdue'
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {item.status === 'paid' && <CheckCircle2 className="w-3 h-3" />}
                                  {item.status === 'overdue' && <AlertCircle className="w-3 h-3" />}
                                  {item.status === 'pending' && <Clock className="w-3 h-3" />}
                                  <span>{t.installmentStatus[item.status]}</span>
                                </span>
                              </td>
                              <td className="p-3 text-stone-500 font-mono text-[11px]">
                                {item.paidDate ? (
                                  <>
                                    <span>{item.paidDate}</span>
                                    {item.receiptNumber && (
                                      <span className="block text-emerald-700 font-semibold">
                                        وصل: {item.receiptNumber} ({item.paymentMethod})
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <span>—</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Payment Methods Info Box */}
                  <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-xs space-y-2">
                    <h4 className="font-bold text-stone-800">
                      {language === 'ar' ? 'طرق سداد القسط الشهري المتاحة:' : 'Moyens de règlement:'}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="bg-white p-3 rounded-xl border border-stone-200">
                        <span className="font-bold text-emerald-800 block">1. تطبيق بريدي موب (BaridiMob)</span>
                        <span className="text-stone-500 block text-[11px] font-mono mt-0.5">RIP: 007999990023456789 22</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-stone-200">
                        <span className="font-bold text-sky-800 block">2. نقداً في المحل (Cash)</span>
                        <span className="text-stone-500 block text-[11px] mt-0.5">استلام وصل رسمي مختوم فوراً</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-stone-200">
                        <span className="font-bold text-amber-800 block">3. حوالة بريدية CCP</span>
                        <span className="text-stone-500 block text-[11px] font-mono mt-0.5">CCP: 12345678 Clé 99</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
              <Calendar className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="font-bold text-stone-700 text-base">
                {language === 'ar' ? 'استعلم عن أقساطك برقم الهاتف أو بطاقة التعريف' : 'Recherchez votre dossier'}
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                {language === 'ar'
                  ? 'أو اضغط على أحد النماذج المسجلة مسبقاً للتجربة:'
                  : 'Ou consultez l\'un des dossiers enregistrés:'}
              </p>
              <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
                {installments.map((inst) => (
                  <button
                    key={inst.id}
                    onClick={() => {
                      setSearchedPlans([inst]);
                      setHasSearched(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold border border-sky-200 transition cursor-pointer font-mono"
                  >
                    #{inst.planNumber} ({inst.customerName})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Requirements & Terms */}
      {activeTab === 'requirements' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="border-b border-stone-200 pb-4">
            <h2 className="text-lg sm:text-xl font-black text-stone-900">
              {language === 'ar' ? 'شروط وإجراءات الاستفادة من التقسيط في الجزائر' : 'Conditions d\'octroi de facilité'}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              {language === 'ar'
                ? 'إجراءات مبسطة بدون بيروقراطية ولا فائدة ربوية، مصممة خصيصاً للمواطن الجزائري'
                : 'Processus simplifié et rapide accessible à tous'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-bold text-sm text-stone-900">
                {language === 'ar' ? 'بطاقة تعريف بيومترية' : 'CNI Biométrique'}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {language === 'ar'
                  ? 'بطاقة التعريف الوطنية البيومترية أو رخصة السياقة البيومترية سارية المفعول لتأكيد الهوية.'
                  : 'Carte d\'identité nationale ou permis biométrique en cours de validité.'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-bold text-sm text-stone-900">
                {language === 'ar' ? 'رقم هاتف موثق' : 'Numéro de téléphone'}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {language === 'ar'
                  ? 'رقم هاتف مسجل باسم المستفيد لاستقبال رسائل SMS والتنبيهات المسبقة قبل موعد كل قسط.'
                  : 'Numéro actif pour recevoir les notifications et rappels SMS.'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-bold text-sm text-stone-900">
                {language === 'ar' ? 'إثبات دخل بسيط' : 'Justificatif de revenu'}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {language === 'ar'
                  ? 'كشف حساب بريدي CCP لآخر 3 أشهر، أو شهادة عمل / بطاقة حرفي أو تاجر حر.'
                  : 'Relevé CCP/bancaire des 3 derniers mois ou attestation de travail.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 border border-stone-200 my-8">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-black text-lg text-stone-900">
                {language === 'ar' ? 'استمارة فتح ملف التقسيط' : 'Dépôt de dossier de facilité'}
              </h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <div className="bg-sky-50 p-3.5 rounded-2xl border border-sky-200 text-xs text-sky-950 flex items-center justify-between">
              <span>{activeProduct?.name || 'هاتف ذكي'}</span>
              <span className="font-black text-sky-800">
                الدفعة الأولى: {downPayment.toLocaleString()} دج • {durationMonths} أشهر x {monthlyPayment.toLocaleString()} دج
              </span>
            </div>

            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 text-[11px] text-amber-950 leading-relaxed">
              <span className="font-black block mb-0.5">
                {language === 'ar' ? '⚠️ تنبيه: التقسيط واستلام الهاتف حصرياً على مستوى المحل' : '⚠️ Retrait et signature exclusivement au magasin'}
              </span>
              {language === 'ar'
                ? 'هذا الطلب هو حجز مسبق للجهاز ولدراسة الأهلية فقط. يتوجب عليك الحضور شخصياً لمقر محلنا بحمتين تيليكوم 4 (ولاية الوادي - مفترق طرق الملاح) مع ملفك الأصلي لتوقيع العقد واستلام هاتفك فوراً.'
                : 'Ce formulaire constitue une pré-réservation. La signature du contrat et la remise du smartphone se font obligatoirement dans notre boutique Hamtine Telecom 4 à El Oued.'}
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">الاسم واللقب الكامل *</label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">رقم الهاتف *</label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    placeholder="0550..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">رقم بطاقة التعريف (CNI) *</label>
                  <input
                    type="text"
                    required
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    placeholder="1098..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">الولاية *</label>
                  <select
                    value={wilaya}
                    onChange={(e) => setWilaya(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                  >
                    {ALGERIA_WILAYAS.map((w) => (
                      <option key={w.code} value={w.nameAr}>{w.code} - {w.nameAr}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">البلدية *</label>
                  <input
                    type="text"
                    required
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">طبيعة العمل</label>
                  <input
                    type="text"
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">متوسط الدخل الشهري</label>
                  <input
                    type="text"
                    value={monthlySalary}
                    onChange={(e) => setMonthlySalary(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow transition cursor-pointer mt-2"
              >
                <Building className="w-4 h-4" />
                <span>
                  {language === 'ar' ? 'تأكيد حجز موعد التقسيط وزيارة المحل' : 'Confirmer le rendez-vous au magasin'}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
