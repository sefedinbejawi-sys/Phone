import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { HamtineLogo } from './HamtineLogo';
import {
  Smartphone,
  Wrench,
  CreditCard,
  ShoppingBag,
  Search,
  Phone,
  Truck,
  Languages,
  MapPin,
  Clock,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    language,
    setLanguage,
    t,
    currentView,
    setCurrentView,
    cartCount,
    setIsCartOpen,
    findRepairByTicket,
    setActiveTrackingTicket,
    showToast,
  } = useStore();

  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    // Check if user entered a repair ticket code like REP-DZ-xxxx
    if (searchInput.toUpperCase().includes('REP-') || /^\d{4,}$/.test(searchInput.trim())) {
      const ticket = findRepairByTicket(searchInput.trim());
      if (ticket) {
        setActiveTrackingTicket(ticket);
        setCurrentView('repairs');
        setSearchInput('');
        showToast(
          language === 'ar'
            ? `تم العثور على التذكرة #${ticket.ticketNumber}`
            : `Ticket trouvé #${ticket.ticketNumber}`
        );
        return;
      }
    }

    // Otherwise switch to storefront to filter
    setCurrentView('storefront');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top utility bar */}
      <div className="bg-slate-900 text-slate-300 px-4 py-1.5 text-xs border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-200">
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {language === 'ar'
                  ? 'توصيل 58 ولاية • الدفع عند الاستلام مع حق الفحص'
                  : 'Livraison 58 wilayas • Paiement à la livraison'}
              </span>
            </span>
            <span className="hidden md:inline-block text-slate-600">|</span>
            <a
              href="https://share.google/ychE3nVODcxqlIGDt"
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center gap-1 text-slate-300 hover:text-amber-400 transition"
              title="موقع المحل على Google Maps"
            >
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>{language === 'ar' ? 'الوادي - مفترق طرق الملاح' : 'El Oued - Carrefour M\'lah'}</span>
            </a>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs">
            <div className="flex items-center gap-1 text-emerald-400 font-semibold">
              <Phone className="w-3 h-3" />
              <a href="tel:0699269292" dir="ltr" className="hover:underline font-mono">
                0699 26 92 92
              </a>
            </div>

            <button
              onClick={() => setLanguage(language === 'ar' ? 'fr' : 'ar')}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-bold text-[11px] cursor-pointer"
              title="Changer la langue"
            >
              <Languages className="w-3 h-3 text-slate-400" />
              <span>{language === 'ar' ? 'FR' : 'عربي'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Logo & Identity */}
          <div
            onClick={() => setCurrentView('storefront')}
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
          >
            <HamtineLogo size="sm" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 group-hover:text-emerald-700 transition">
                  {t.storeName}
                </span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  فرع 4 (الوادي)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                {language === 'ar' ? 'الهواتف الأصلية • الصيانة • التقسيط الميسر' : 'Smartphones, SAV & Vente à tempérament'}
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center relative flex-1 max-w-md mx-2"
          >
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'ابحث عن هاتف، إكسسوار، أو تذكرة تصليح...'
                  : 'Rechercher un smartphone, accessoire, ticket...'
              }
              className="w-full bg-slate-100 text-slate-900 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-slate-200 focus:outline-none focus:border-slate-400 focus:bg-white transition placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              title="بحث"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Navigation Links and Actions */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => setCurrentView('storefront')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  currentView === 'storefront'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{t.navStore}</span>
              </button>

              <button
                onClick={() => setCurrentView('repairs')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  currentView === 'repairs'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>{t.navRepair}</span>
              </button>

              <button
                onClick={() => setCurrentView('installments')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  currentView === 'installments'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>{t.navInstallment}</span>
              </button>
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center p-2 sm:px-3.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition cursor-pointer shadow-xs"
              title={t.cart}
            >
              <ShoppingBag className="w-4 h-4 fill-current" />
              <span className="hidden sm:inline-block mr-1.5 font-bold text-xs">
                {t.cart}
              </span>
              {cartCount > 0 && (
                <span className="inline-flex items-center justify-center h-4.5 min-w-[18px] px-1 rounded-full bg-emerald-500 text-white text-[10px] font-black mr-1">
                  {cartCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Mobile search bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="mt-2.5 flex md:hidden items-center relative w-full"
        >
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={
              language === 'ar'
                ? 'ابحث عن هاتف أو كود تذكرة...'
                : 'Rechercher un smartphone ou ticket...'
            }
            className="w-full bg-slate-100 text-slate-900 text-xs rounded-xl pl-9 pr-3.5 py-2 border border-slate-200 focus:outline-none focus:border-slate-400 placeholder:text-slate-400"
          />
          <button
            type="submit"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>
    </header>
  );
};
