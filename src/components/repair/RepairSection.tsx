import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ALGERIA_WILAYAS } from '../../data/wilayas';
import { FaultType, RepairStatus, RepairTicket } from '../../types';
import {
  Wrench,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  Smartphone,
  ShieldCheck,
  PhoneCall,
  MessageCircle,
  HelpCircle,
  Cpu,
  Layers,
  Zap,
  RotateCcw,
  Check,
  ChevronRight,
  Send,
  Calendar,
} from 'lucide-react';

export const RepairSection: React.FC = () => {
  const {
    language,
    t,
    repairs,
    createRepairTicket,
    findRepairByTicket,
    activeTrackingTicket,
    setActiveTrackingTicket,
    showToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'request' | 'track' | 'pricing'>('request');

  // Request Form States
  const [phoneBrand, setPhoneBrand] = useState('Apple');
  const [phoneModel, setPhoneModel] = useState('');
  const [faultType, setFaultType] = useState<FaultType>('screen');
  const [faultDescription, setFaultDescription] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [wilaya, setWilaya] = useState('الجزائر العاصمة');
  const [phoneImeiOrSn, setPhoneImeiOrSn] = useState('');
  const [phonePasswordOrPattern, setPhonePasswordOrPattern] = useState('');

  // Ticket Search State
  const [searchTicketNum, setSearchTicketNum] = useState('');

  // Automatic estimation logic based on brand and fault
  const estimatedPrice = React.useMemo(() => {
    let base = 5000;
    const isPremiumApple = phoneBrand === 'Apple';
    const isSamsung = phoneBrand === 'Samsung';

    switch (faultType) {
      case 'screen':
        base = isPremiumApple ? 24000 : isSamsung ? 21000 : 9500;
        break;
      case 'battery':
        base = isPremiumApple ? 6800 : isSamsung ? 5500 : 3800;
        break;
      case 'charging_port':
        base = 3500;
        break;
      case 'motherboard':
        base = isPremiumApple ? 18000 : 12000;
        break;
      case 'water_damage':
        base = 9000;
        break;
      case 'camera':
        base = isPremiumApple ? 15000 : 9000;
        break;
      case 'software':
        base = 2500;
        break;
      case 'audio_speaker':
        base = 3000;
        break;
      case 'housing':
        base = 8000;
        break;
      default:
        base = 4500;
    }
    return base;
  }, [phoneBrand, faultType]);

  const handleSubmitRepair = (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneModel.trim()) {
      showToast(language === 'ar' ? 'يرجى تحديد موديل الهاتف بدقة' : 'Indiquez le modèle de téléphone', 'warning');
      return;
    }
    if (!customerName.trim() || !phone.trim()) {
      showToast(language === 'ar' ? 'يرجى إدخال اسمك ورقم هاتفك' : 'Nom et numéro requis', 'warning');
      return;
    }

    const ticket = createRepairTicket({
      customerName,
      phone,
      wilaya,
      phoneBrand,
      phoneModel,
      phoneImeiOrSn: phoneImeiOrSn.trim() || undefined,
      phonePasswordOrPattern: phonePasswordOrPattern.trim() || undefined,
      faultType,
      faultDescription: faultDescription.trim() || (language === 'ar' ? 'طلب فحص وتصليح الجهاز' : 'Demande de diagnostic'),
      estimatedPrice,
    });

    setActiveTrackingTicket(ticket);
    setActiveTab('track');
    // Reset form
    setPhoneModel('');
    setFaultDescription('');
  };

  const handleSearchTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTicketNum.trim()) return;
    const found = findRepairByTicket(searchTicketNum);
    if (found) {
      setActiveTrackingTicket(found);
      showToast(language === 'ar' ? `تم العثور على التذكرة #${found.ticketNumber}` : `Ticket trouvé #${found.ticketNumber}`);
    } else {
      showToast(
        language === 'ar'
          ? 'رقم التذكرة غير موجود! جرب مثلاً: REP-DZ-8041 أو REP-DZ-8042'
          : 'Ticket introuvable (ex: REP-DZ-8041)',
        'error'
      );
    }
  };

  // 5 standard repair stages
  const stages: { key: RepairStatus; labelAr: string; labelFr: string; descAr: string; descFr: string }[] = [
    {
      key: 'received',
      labelAr: '1. تم الاستلام',
      labelFr: '1. Reçu',
      descAr: 'تم تسجيل الجهاز وتسليمه للورشة',
      descFr: 'Appareil enregistré à l\'atelier',
    },
    {
      key: 'diagnosing',
      labelAr: '2. قيد الفحص والتشخيص',
      labelFr: '2. Diagnostic',
      descAr: 'فحص مجهري للدارة والقطع التالفة',
      descFr: 'Inspection technique & tests',
    },
    {
      key: 'repairing',
      labelAr: '3. قيد الإصلاح',
      labelFr: '3. En réparation',
      descAr: 'تركيب قطع الغيار الأصلية واللحام',
      descFr: 'Remplacement pièces d\'origine',
    },
    {
      key: 'ready',
      labelAr: '4. جاهز للاستلام',
      labelFr: '4. Prêt au retrait',
      descAr: 'تمت الاختبارات والجهاز جاهز مع الضمان',
      descFr: 'Tests réussis, prêt avec garantie',
    },
    {
      key: 'delivered',
      labelAr: '5. تم التسليم',
      labelFr: '5. Livré',
      descAr: 'تم تسليم الجهاز للزبون بنجاح',
      descFr: 'Appareil remis au client',
    },
  ];

  const getStageIndex = (status: RepairStatus) => {
    switch (status) {
      case 'received': return 0;
      case 'diagnosing': return 1;
      case 'repairing': return 2;
      case 'ready': return 3;
      case 'delivered': return 4;
      default: return 0;
    }
  };

  // Fault categories helper
  const faultCategories: { key: FaultType; labelAr: string; labelFr: string; icon: string }[] = [
    { key: 'screen', labelAr: 'شاشة مكسورة / عرض', labelFr: 'Écran Cassé / Affichage', icon: '📱' },
    { key: 'battery', labelAr: 'بطارية ونفاد شحن', labelFr: 'Batterie & Autonomie', icon: '🔋' },
    { key: 'charging_port', labelAr: 'منفذ شحن (كونكتور)', labelFr: 'Connecteur de charge', icon: '⚡' },
    { key: 'motherboard', labelAr: 'لوحة أم وآيسيات (IC)', labelFr: 'Carte Mère & Micro-soudure', icon: '💻' },
    { key: 'camera', labelAr: 'كاميرا أمامية / خلفية', labelFr: 'Caméra & Lentille', icon: '📸' },
    { key: 'water_damage', labelAr: 'سقوط في الماء / أكسدة', labelFr: 'Désoxydation / Eau', icon: '💧' },
    { key: 'software', labelAr: 'سوفتوير وفك قفل وفلاش', labelFr: 'Flash & Déblocage Logiciel', icon: '⚙️' },
    { key: 'audio_speaker', labelAr: 'صوت وميكروفون', labelFr: 'Micro & Haut-parleur', icon: '🔊' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Repair Section Hero */}
      <div className="rounded-3xl bg-gradient-to-br from-amber-950 via-stone-900 to-stone-900 text-white p-6 sm:p-10 border border-amber-900/40 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'ar' ? 'وحدة ورشة الصيانة المعتمدة' : 'Atelier de Maintenance Agréé'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            {t.repairHeroTitle}
          </h1>

          <p className="text-stone-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            {t.repairHeroSubtitle}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="relative z-10 mt-6 flex items-center gap-2 overflow-x-auto border-t border-stone-800 pt-4">
          <button
            onClick={() => setActiveTab('request')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'request'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40'
                : 'bg-stone-800/80 text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>{t.submitRepairTitle}</span>
          </button>

          <button
            onClick={() => setActiveTab('track')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'track'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40'
                : 'bg-stone-800/80 text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{t.trackRepairTitle}</span>
            {activeTrackingTicket && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'pricing'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40'
                : 'bg-stone-800/80 text-stone-300 hover:bg-stone-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{language === 'ar' ? 'جدول الأسعار التقديرية والضمان' : 'Grille Tarifaire & Garantie'}</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Submit Repair Request Form */}
      {activeTab === 'request' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
            <div className="border-b border-stone-200 pb-4">
              <h2 className="text-lg sm:text-xl font-black text-stone-900">
                {language === 'ar' ? 'استمارة طلب تصليح هاتف' : 'Formulaire de demande de réparation'}
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                {language === 'ar'
                  ? 'املأ بيانات الهاتف والعطل لتحديد السعر التقديري فحص فوري وتوليد تذكرة تتبع خاصة بك'
                  : 'Renseignez les détails de la panne pour estimer le prix et générer votre ticket de suivi'}
              </p>
            </div>

            <form onSubmit={handleSubmitRepair} className="space-y-6">
              {/* Brand & Model */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                  {language === 'ar' ? '1. ماركة وموديل الهاتف:' : '1. Marque et modèle:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Apple', 'Samsung', 'Xiaomi', 'Oppo / Realme', 'Google Pixel', 'Huawei', 'Infinix / Tecno', 'أخرى'].map((b) => (
                    <button
                      type="button"
                      key={b}
                      onClick={() => setPhoneBrand(b)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        phoneBrand === b
                          ? 'border-amber-600 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20'
                          : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {t.phoneModelLabel} *
                    </label>
                    <input
                      type="text"
                      required
                      value={phoneModel}
                      onChange={(e) => setPhoneModel(e.target.value)}
                      placeholder={t.phoneModelPlaceholder}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {language === 'ar' ? 'رقم IMEI أو الرقم التسلسلي (اختياري)' : 'N° IMEI ou Série (optionnel)'}
                    </label>
                    <input
                      type="text"
                      value={phoneImeiOrSn}
                      onChange={(e) => setPhoneImeiOrSn(e.target.value)}
                      placeholder="358920..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Fault Category Selection */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                  {language === 'ar' ? '2. حدد نوع العطل الرئيسي:' : '2. Type de panne principale:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {faultCategories.map((fc) => (
                    <button
                      type="button"
                      key={fc.key}
                      onClick={() => setFaultType(fc.key)}
                      className={`p-3 rounded-2xl border text-right transition flex flex-col justify-between cursor-pointer ${
                        faultType === fc.key
                          ? 'border-amber-600 bg-amber-50/80 text-amber-950 ring-2 ring-amber-500/20'
                          : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
                      }`}
                    >
                      <span className="text-xl mb-1">{fc.icon}</span>
                      <span className="font-bold text-xs">
                        {language === 'ar' ? fc.labelAr : fc.labelFr}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fault Description */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.faultDescriptionLabel}
                </label>
                <textarea
                  rows={3}
                  value={faultDescription}
                  onChange={(e) => setFaultDescription(e.target.value)}
                  placeholder={
                    language === 'ar'
                      ? 'اشرح المشكلة بالتفصيل: هل سقط الجهاز؟ هل انطفأ فجأة؟ هل يوجد صوت دون صورة؟'
                      : 'Décrivez précisément les symptômes...'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Password / Pattern for diagnostics */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {language === 'ar' ? 'كود قفل الشاشة أو النمط (لإجراء الفحوصات الفنية)' : 'Code de déverrouillage écran'}
                </label>
                <input
                  type="text"
                  value={phonePasswordOrPattern}
                  onChange={(e) => setPhonePasswordOrPattern(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: 1234 أو بدون قفل' : 'Ex: 1234 ou aucun'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Customer Contact */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                  {language === 'ar' ? '3. بيانات التواصل لإرسال التنبيهات:' : '3. Coordonnées pour notifications:'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      {t.fullName} *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="الاسم واللقب"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      {t.phoneNumber} *
                    </label>
                    <input
                      type="tel"
                      required
                      dir="ltr"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0550..."
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      {language === 'ar' ? 'الولاية' : 'Wilaya'}
                    </label>
                    <select
                      value={wilaya}
                      onChange={(e) => setWilaya(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                    >
                      {ALGERIA_WILAYAS.map((w) => (
                        <option key={w.code} value={w.nameAr}>
                          {w.code} - {language === 'ar' ? w.nameAr : w.nameFr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full py-4 px-6 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-900/20 transition cursor-pointer"
              >
                <Wrench className="w-5 h-5" />
                <span>{t.submitRepairBtn}</span>
              </button>
            </form>
          </div>

          {/* Right sidebar: Live Price Estimate & Guarantees */}
          <div className="space-y-6">
            {/* Estimate Box */}
            <div className="bg-amber-50 rounded-3xl p-6 border border-amber-200 space-y-4">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <span>{t.estimatedPriceNotice}</span>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-xs space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-stone-500">
                    {language === 'ar' ? 'السعر التقديري المبدئي:' : 'Prix estimé:'}
                  </span>
                  <span className="text-2xl font-black text-amber-700">
                    {estimatedPrice.toLocaleString()} {t.currency}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  * {language === 'ar'
                    ? 'هذا السعر تقديري يشمل القطع الأصلية وأجرة الفني. يتم تأكيد السعر النهائي بعد التشخيص المجهري وموافقتك.'
                    : 'Prix indicatif pièces + main d\'œuvre. Le montant définitif vous est soumis après diagnostic pour validation.'}
                </p>
              </div>

              {/* Process highlights */}
              <div className="space-y-2.5 text-xs text-amber-950 font-medium pt-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{language === 'ar' ? 'قطع غيار أصلية ومضمونة 100%' : 'Pièces d\'origine garanties'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{language === 'ar' ? 'ضمان يصل إلى 60 يوماً على التصليح' : 'Garantie jusqu\'à 60 jours'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{language === 'ar' ? 'تنبيهات SMS وواتساب عند اكتمال الجهاز' : 'Notifications SMS & WhatsApp'}</span>
                </div>
              </div>
            </div>

            {/* Quick tracker helper */}
            <div className="bg-stone-900 text-white rounded-3xl p-6 space-y-4">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{language === 'ar' ? 'لديك تذكرة تصليح سابقة؟' : 'Déjà un ticket en cours?'}</span>
              </h3>
              <p className="text-xs text-stone-400">
                {language === 'ar'
                  ? 'أدخل رقم التذكرة المستلم من الورشة لمعرفة مرحلة جهازك الآن'
                  : 'Saisissez votre numéro de ticket pour suivre l\'avancement en temps réel'}
              </p>
              <form onSubmit={handleSearchTicket} className="flex gap-2">
                <input
                  type="text"
                  value={searchTicketNum}
                  onChange={(e) => setSearchTicketNum(e.target.value)}
                  placeholder="REP-DZ-..."
                  className="flex-1 px-3 py-2 rounded-xl bg-stone-800 text-xs border border-stone-700 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition"
                >
                  {t.trackBtn}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Track Active Repair Ticket */}
      {activeTab === 'track' && (
        <div className="space-y-6">
          {/* Tracker search bar */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
              <Search className="w-4 h-4 text-amber-600" />
              <span>{t.trackRepairTitle}</span>
            </div>
            <form onSubmit={handleSearchTicket} className="flex gap-2 w-full sm:max-w-md">
              <input
                type="text"
                value={searchTicketNum}
                onChange={(e) => setSearchTicketNum(e.target.value)}
                placeholder="REP-DZ-8041"
                className="flex-1 px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition cursor-pointer"
              >
                {t.trackBtn}
              </button>
            </form>
          </div>

          {activeTrackingTicket ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-8">
              {/* Ticket header badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full border border-amber-300">
                      #{activeTrackingTicket.ticketNumber}
                    </span>
                    <span className="text-xs text-stone-400">
                      {activeTrackingTicket.date}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-2">
                    {activeTrackingTicket.phoneBrand} {activeTrackingTicket.phoneModel}
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {language === 'ar' ? 'الزبون:' : 'Client:'} {activeTrackingTicket.customerName} • {activeTrackingTicket.phone}
                  </p>
                </div>

                {/* Status chip */}
                <div className="text-right sm:text-left">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black shadow-sm ${
                    activeTrackingTicket.status === 'ready'
                      ? 'bg-emerald-600 text-white'
                      : activeTrackingTicket.status === 'repairing'
                      ? 'bg-amber-600 text-white'
                      : activeTrackingTicket.status === 'diagnosing'
                      ? 'bg-sky-600 text-white'
                      : 'bg-stone-800 text-white'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                    <span>{t.repairStages[activeTrackingTicket.status]}</span>
                  </span>
                </div>
              </div>

              {/* 5-Step Visual Timeline */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  {language === 'ar' ? 'مسار تقدم عملية التصليح:' : 'Étapes d\'avancement de la réparation:'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {stages.map((stg, idx) => {
                    const currentIdx = getStageIndex(activeTrackingTicket.status);
                    const isPassed = currentIdx >= idx;
                    const isCurrent = currentIdx === idx;

                    return (
                      <div
                        key={stg.key}
                        className={`p-4 rounded-2xl border-2 transition relative flex flex-col justify-between ${
                          isCurrent
                            ? 'border-amber-600 bg-amber-50/80 shadow-md ring-2 ring-amber-500/20'
                            : isPassed
                            ? 'border-emerald-600 bg-emerald-50/30'
                            : 'border-stone-200 bg-stone-50 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCurrent
                              ? 'bg-amber-600 text-white'
                              : isPassed
                              ? 'bg-emerald-600 text-white'
                              : 'bg-stone-300 text-stone-700'
                          }`}>
                            {isPassed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-200 px-1.5 py-0.5 rounded">
                              {language === 'ar' ? 'الحالة الحالية' : 'En cours'}
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="font-bold text-xs text-stone-900">
                            {language === 'ar' ? stg.labelAr : stg.labelFr}
                          </h4>
                          <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                            {language === 'ar' ? stg.descAr : stg.descFr}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Diagnosis Details and Pricing Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-3 text-xs">
                  <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-amber-600" />
                    <span>{language === 'ar' ? 'ملاحظات الفني والتشخيص:' : 'Diagnostic & Remarques technicien:'}</span>
                  </h4>
                  <p className="text-stone-700 leading-relaxed bg-white p-3 rounded-xl border border-stone-200">
                    {activeTrackingTicket.technicianNotes ||
                      (language === 'ar'
                        ? 'الجهاز قيد الملاحظة والفحص الهندسي لتحديد الخلل بدقة وضمان سلامة باقي القطع.'
                        : 'Diagnostic en cours par nos techniciens qualifiés.')}
                  </p>

                  <div className="flex items-center justify-between pt-2 text-stone-600">
                    <span>{language === 'ar' ? 'الفني المكلف:' : 'Technicien:'}</span>
                    <span className="font-semibold text-stone-900">
                      {activeTrackingTicket.assignedTechnician || 'فريق ورشة الصيانة'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-stone-600">
                    <span>{language === 'ar' ? 'فترة الضمان على التصليح:' : 'Garantie après réparation:'}</span>
                    <span className="font-bold text-emerald-700">
                      {activeTrackingTicket.warrantyPeriodDays} {language === 'ar' ? 'يوماً مع وصل مختوم' : 'jours certifiés'}
                    </span>
                  </div>
                </div>

                {/* Pricing & Actions */}
                <div className="bg-stone-900 text-white rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-stone-400 block mb-1">
                      {language === 'ar' ? 'تكلفة التصليح وقطع الغيار:' : 'Coût de la réparation:'}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-amber-400">
                        {(activeTrackingTicket.finalPrice || activeTrackingTicket.estimatedPrice).toLocaleString()}{' '}
                        {t.currency}
                      </span>
                      {activeTrackingTicket.finalPrice && (
                        <span className="text-xs text-emerald-400 font-semibold">
                          ({language === 'ar' ? 'سعر نهائي معتمد' : 'Prix final validé'})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions: Contact Technician or WhatsApp */}
                  <div className="space-y-2 pt-2 border-t border-stone-800">
                    <button
                      onClick={() => {
                        const msg = encodeURIComponent(
                          `السلام عليكم، أنا الزبون صاحب تذكرة التصليح رقم #${activeTrackingTicket.ticketNumber} لهاتف ${activeTrackingTicket.phoneModel}. أود الاستفسار عن حالة جهازي.`
                        );
                        window.open(`https://wa.me/213550881234?text=${msg}`, '_blank');
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{language === 'ar' ? 'مراسلة الفني عبر واتساب (WhatsApp)' : 'Contacter le technicien WhatsApp'}</span>
                    </button>

                    <div className="flex items-center justify-between text-[11px] text-stone-400">
                      <span>{language === 'ar' ? 'هاتف الورشة المباشر:' : 'Atelier direct:'}</span>
                      <span className="font-mono text-stone-200" dir="ltr">0550 88 12 34</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status History Log */}
              {activeTrackingTicket.statusHistory.length > 0 && (
                <div className="border-t border-stone-200 pt-6">
                  <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-3">
                    {language === 'ar' ? 'سجل العمليات والتواريخ:' : 'Historique des opérations:'}
                  </h4>
                  <div className="space-y-2">
                    {activeTrackingTicket.statusHistory.map((h, i) => (
                      <div
                        key={i}
                        className="flex items-start justify-between p-2.5 rounded-xl bg-stone-50 text-xs border border-stone-200"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                          <span className="font-bold text-stone-800">
                            {t.repairStages[h.status]}
                          </span>
                          <span className="text-stone-500">— {h.note}</span>
                        </div>
                        <span className="text-stone-400 font-mono text-[11px] shrink-0">
                          {h.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
              <Clock className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="font-bold text-stone-700 text-base">
                {language === 'ar' ? 'لم تقم بتحديد تذكرة بعد' : 'Aucun ticket sélectionné'}
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {language === 'ar'
                  ? 'أدخل رقم تذكرتك في الأعلى (مثال: REP-DZ-8041) أو اضغط على أحد التذاكر التجريبية أدناه:'
                  : 'Saisissez votre ticket ou essayez l\'un des exemples ci-dessous:'}
              </p>
              <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
                {repairs.slice(0, 3).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setActiveTrackingTicket(r)}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-mono font-bold transition cursor-pointer"
                  >
                    #{r.ticketNumber} ({r.phoneModel})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Standard Pricing Table & Guarantees */}
      {activeTab === 'pricing' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-stone-900">
              {language === 'ar' ? 'جدول أسعار الصيانة الشائعة في الجزائر' : 'Tarifs indicatifs des pannes courantes'}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              {language === 'ar'
                ? 'أسعار شفافة تشمل قطع الغيار الأصلية + يد العمل وفحص شامل مع ضمان معتمد'
                : 'Tarifs transparents incluant pièces d\'origine, main d\'œuvre et garantie'}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="bg-stone-100 text-stone-800 border-b border-stone-200">
                  <th className="p-3 font-bold">{language === 'ar' ? 'نوع العطل' : 'Type de panne'}</th>
                  <th className="p-3 font-bold">{language === 'ar' ? 'سلسلة هواتف آبل (iPhone)' : 'iPhone (Apple)'}</th>
                  <th className="p-3 font-bold">{language === 'ar' ? 'سامسونج الفئة العليا (S/Note)' : 'Samsung Flagship'}</th>
                  <th className="p-3 font-bold">{language === 'ar' ? 'الفئات المتوسطة (Redmi/A Series)' : 'Milieu de gamme'}</th>
                  <th className="p-3 font-bold">{language === 'ar' ? 'مدة الضمان' : 'Garantie'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-stone-700">
                <tr>
                  <td className="p-3 font-bold">تغيير شاشة أصلية كاملة</td>
                  <td className="p-3">22,000 - 38,000 دج</td>
                  <td className="p-3">19,000 - 35,000 دج</td>
                  <td className="p-3">8,500 - 14,000 دج</td>
                  <td className="p-3 text-emerald-700 font-bold">60 يوماً</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">تغيير بطارية أصلية عالية الأداء</td>
                  <td className="p-3">6,500 - 9,500 دج</td>
                  <td className="p-3">5,000 - 7,500 دج</td>
                  <td className="p-3">3,500 - 5,000 دج</td>
                  <td className="p-3 text-emerald-700 font-bold">90 يوماً</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">تصليح منفذ الشحن (Type-C / Lightning)</td>
                  <td className="p-3">4,500 دج</td>
                  <td className="p-3">3,500 دج</td>
                  <td className="p-3">2,500 دج</td>
                  <td className="p-3 text-emerald-700 font-bold">30 يوماً</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">صيانة اللوحة الأم (IC Power / Baseband)</td>
                  <td className="p-3">16,000 - 25,000 دج</td>
                  <td className="p-3">12,000 - 18,000 دج</td>
                  <td className="p-3">7,000 - 11,000 دج</td>
                  <td className="p-3 text-emerald-700 font-bold">45 يوماً</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">سوفتوير وفلاش وتحديث النظام</td>
                  <td className="p-3">3,000 دج</td>
                  <td className="p-3">2,500 دج</td>
                  <td className="p-3">2,000 دج</td>
                  <td className="p-3 text-emerald-700 font-bold">ضمان التشغيل</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
