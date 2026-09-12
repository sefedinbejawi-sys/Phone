import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { HamtineLogo } from './HamtineLogo';
import {
  Smartphone,
  Wrench,
  CreditCard,
  LayoutDashboard,
  ShoppingBag,
  Search,
  Phone,
  ShieldCheck,
  Truck,
  Languages,
  UserCog,
  LogIn,
  LogOut,
  Cloud,
  CheckCircle2,
  Crown,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    language,
    setLanguage,
    t,
    role,
    setRole,
    currentView,
    setCurrentView,
    cartCount,
    setIsCartOpen,
    findRepairByTicket,
    setActiveTrackingTicket,
    showToast,
    firebaseUser,
    isOwner,
    isFirebaseConnected,
    loginWithGoogle,
    logout,
    syncCatalogToFirebase,
  } = useStore();

  const [ticketSearch, setTicketSearch] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleTicketSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSearch.trim()) return;
    const ticket = findRepairByTicket(ticketSearch);
    if (ticket) {
      setActiveTrackingTicket(ticket);
      setCurrentView('repairs');
      setTicketSearch('');
      showToast(
        language === 'ar'
          ? `تم العثور على التذكرة #${ticket.ticketNumber}`
          : `Ticket trouvé #${ticket.ticketNumber}`
      );
    } else {
      showToast(
        language === 'ar'
          ? 'رقم التذكرة غير موجود. تأكد من الرقم (مثال: REP-DZ-8041)'
          : 'Numéro de ticket introuvable (Ex: REP-DZ-8041)',
        'warning'
      );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#08090d]/90 backdrop-blur-2xl text-white shadow-2xl border-b border-white/10 store-header">
      {/* Algerian E-commerce top announcement bar */}
      <div className="bg-[#0e1017] px-4 py-2 text-xs text-neutral-300 flex flex-wrap items-center justify-between gap-2 border-b border-white/10">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 font-medium text-neutral-200">
            <Truck className="w-3.5 h-3.5 text-emerald-400" />
            {language === 'ar'
              ? 'توصيل سريع متوفر لـ 58 ولاية (Yalidine / ZR Express / NOEST)'
              : 'Livraison rapide disponible 58 wilayas'}
          </span>
          <span className="hidden md:inline-block text-white/20">•</span>
          <span className="hidden md:flex items-center gap-1 text-neutral-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            {language === 'ar'
              ? 'ضمان حقيقي وتجربة قبل الدفع عند الاستلام'
              : 'Garantie authentique et vérification avant paiement'}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          {/* Firebase Connection Status Indicator */}
          <div
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
              isFirebaseConnected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
            title="Firebase Firestore Cloud Database"
          >
            <Cloud className="w-3 h-3 text-amber-400" />
            <span>Firebase</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isFirebaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
          </div>

          <a
            href="https://share.google/ychE3nVODcxqlIGDt"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 font-bold text-amber-400 hover:text-amber-300 transition"
            title="موقع محل حمتين تيليكوم 4 على Google Maps"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>{language === 'ar' ? '📍 موقع المحل (Google Maps)' : '📍 Localisation (Google Maps)'}</span>
          </a>
          <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
            <Phone className="w-3 h-3 text-emerald-400" />
            <a href="tel:0699269292" dir="ltr" className="hover:underline font-mono">0699 26 92 92</a>
          </div>
          <button
            onClick={() => setLanguage(language === 'ar' ? 'fr' : 'ar')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white transition font-bold text-xs cursor-pointer"
            title="Changer la langue"
          >
            <Languages className="w-3 h-3 text-emerald-400" />
            <span>{language === 'ar' ? 'Français' : 'العربية'}</span>
          </button>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 store-header-main">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Identity */}
          <div
            onClick={() => setCurrentView('storefront')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <HamtineLogo size="md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black tracking-tight text-white group-hover:text-red-400 transition">
                  {t.storeName}
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-sm border border-red-400/30">
                  فرع 4
                </span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-400/15 text-emerald-300 border border-emerald-400/30">
                  DZ 58
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-medium line-clamp-1">
                {t.storeSubtitle}
              </p>
            </div>
          </div>

          {/* Quick Repair Tracking Search Bar */}
          <form
            onSubmit={handleTicketSearch}
            className="hidden lg:flex items-center relative max-w-xs w-full"
          >
            <input
              type="text"
              value={ticketSearch}
              onChange={(e) => setTicketSearch(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'رقم تذكرة التصليح (مثال: REP-DZ-8041)...'
                  : 'N° Ticket de réparation...'
              }
              className="w-full bg-white/[0.04] text-white text-xs rounded-2xl pl-9 pr-4 py-2.5 border border-white/10 focus:outline-none focus:border-emerald-400 focus:bg-white/[0.08] transition placeholder:text-neutral-500"
            />
            <button
              type="submit"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-emerald-400 cursor-pointer"
              title="بحث عن التذكرة"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Navigation links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setCurrentView('storefront')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-extrabold transition cursor-pointer ${
                currentView === 'storefront'
                  ? 'bg-emerald-400 text-[#08090d] shadow-[0_4px_20px_rgba(52,211,153,0.35)]'
                  : 'text-neutral-300 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>{t.navStore}</span>
            </button>

            <button
              onClick={() => setCurrentView('repairs')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-extrabold transition cursor-pointer ${
                currentView === 'repairs'
                  ? 'bg-amber-400 text-[#08090d] shadow-[0_4px_20px_rgba(251,191,36,0.35)]'
                  : 'text-neutral-300 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>{t.navRepair}</span>
              <span className="hidden xl:inline-block text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded-full">
                {language === 'ar' ? 'ورشة حية' : 'Atelier'}
              </span>
            </button>

            <button
              onClick={() => setCurrentView('installments')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-extrabold transition cursor-pointer ${
                currentView === 'installments'
                  ? 'bg-sky-400 text-[#08090d] shadow-[0_4px_20px_rgba(56,189,248,0.35)]'
                  : 'text-neutral-300 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>{t.navInstallment}</span>
              <span className="hidden xl:inline-block text-[10px] bg-sky-400/20 text-sky-300 px-1.5 py-0.5 rounded-full">
                3/6/12 {language === 'ar' ? 'شهر' : 'mois'}
              </span>
            </button>

            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-extrabold transition cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-purple-400 text-[#08090d] shadow-[0_4px_20px_rgba(192,132,252,0.35)]'
                  : 'text-neutral-300 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">{t.navDashboard}</span>
            </button>

            {/* Cart toggle */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center p-2 sm:px-3.5 sm:py-2 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-[#08090d] font-black transition cursor-pointer shadow-[0_4px_20px_rgba(52,211,153,0.3)] ml-1"
              title={t.cart}
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              <span className="hidden sm:inline-block mr-1.5 font-black text-xs">
                {t.cart}
              </span>
              {cartCount > 0 && (
                <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-black text-emerald-300 text-[11px] font-black mr-1">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Google Firebase Auth Button */}
            {firebaseUser ? (
              <div className="flex items-center gap-2 bg-white/[0.06] border border-white/10 rounded-2xl px-2.5 py-1 text-xs">
                {firebaseUser.photoURL ? (
                  <img
                    src={firebaseUser.photoURL}
                    alt={firebaseUser.displayName || 'User'}
                    className="w-6 h-6 rounded-full object-cover border border-emerald-400/50"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px]">
                    {(firebaseUser.displayName || firebaseUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:flex flex-col text-left">
                  <span className="font-bold text-[11px] text-white leading-tight truncate max-w-[95px]">
                    {firebaseUser.displayName?.split(' ')[0] || firebaseUser.email?.split('@')[0]}
                  </span>
                  {isOwner ? (
                    <span className="flex items-center gap-0.5 text-[9px] text-amber-400 font-black">
                      <Crown className="w-2.5 h-2.5" />
                      {language === 'ar' ? 'المالك' : 'Propriétaire'}
                    </span>
                  ) : (
                    <span className="text-[9px] text-emerald-400 font-semibold">
                      {language === 'ar' ? 'متصل' : 'Connecté'}
                    </span>
                  )}
                </div>
                <button
                  onClick={logout}
                  className="text-neutral-400 hover:text-rose-400 p-1 transition cursor-pointer"
                  title={language === 'ar' ? 'تسجيل الخروج' : 'Déconnexion'}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-neutral-200 hover:text-white transition font-bold text-xs cursor-pointer"
                title={language === 'ar' ? 'تسجيل الدخول عبر Google' : 'Connexion Google'}
              >
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">
                  {language === 'ar' ? 'دخول Google' : 'Connexion'}
                </span>
              </button>
            )}
          </nav>
        </div>

        {/* Mobile quick tracker bar */}
        <form
          onSubmit={handleTicketSearch}
          className="mt-2.5 flex lg:hidden items-center relative w-full"
        >
          <input
            type="text"
            value={ticketSearch}
            onChange={(e) => setTicketSearch(e.target.value)}
            placeholder={
              language === 'ar'
                ? 'تتبع تذكرة تصليح: أدخل الرمز (مثال: REP-DZ-8041)...'
                : 'Suivre une réparation: code ticket (Ex: REP-DZ-8041)...'
            }
            className="w-full bg-stone-800 text-stone-100 text-xs rounded-xl pl-9 pr-4 py-2 border border-stone-700 focus:outline-none focus:border-emerald-500 placeholder:text-stone-500"
          />
          <button
            type="submit"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-emerald-400"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Role Switcher Bar when on Dashboard or for testing */}
      {currentView === 'dashboard' && (
        <div className="bg-stone-950 px-4 py-2 border-t border-stone-800 flex items-center justify-between text-xs text-stone-300 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <UserCog className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-stone-400">{t.roleLabel}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setRole('admin')}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                role === 'admin'
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              {t.roleAdmin}
            </button>
            <button
              onClick={() => setRole('technician')}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                role === 'technician'
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              {t.roleTech}
            </button>
            <button
              onClick={() => setRole('salesperson')}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                role === 'salesperson'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              {t.roleSales}
            </button>

            {role === 'admin' && (
              <button
                onClick={async () => {
                  setIsSyncing(true);
                  await syncCatalogToFirebase();
                  setIsSyncing(false);
                }}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 font-bold text-xs transition cursor-pointer ml-2"
                title="مزامنة كافة المنتجات مع Firestore"
              >
                <Cloud className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>
                  {isSyncing
                    ? (language === 'ar' ? 'جار المزامنة...' : 'Synchronisation...')
                    : (language === 'ar' ? 'مزامنة السحابة (Firebase)' : 'Sync Cloud')}
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
