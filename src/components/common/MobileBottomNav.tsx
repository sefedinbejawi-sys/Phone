import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Smartphone,
  Wrench,
  CreditCard,
  ShoppingBag,
  LayoutDashboard,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    cartCount,
    setIsCartOpen,
    activeTrackingTicket,
    language,
  } = useStore();

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#08090d]/95 backdrop-blur-2xl border-t border-white/10 px-2 py-1.5 shadow-[0_-4px_25px_rgba(0,0,0,0.7)]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Store */}
        <button
          type="button"
          onClick={() => setCurrentView('storefront')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer min-w-[56px] ${
            currentView === 'storefront'
              ? 'text-emerald-400 font-black'
              : 'text-neutral-400 hover:text-white font-medium'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition ${
              currentView === 'storefront'
                ? 'bg-emerald-400/20 ring-1 ring-emerald-400/40'
                : 'bg-transparent'
            }`}
          >
            <Smartphone className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">
            {language === 'ar' ? 'المتجر' : 'Boutique'}
          </span>
        </button>

        {/* Repairs */}
        <button
          type="button"
          onClick={() => setCurrentView('repairs')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer min-w-[56px] relative ${
            currentView === 'repairs'
              ? 'text-amber-400 font-black'
              : 'text-neutral-400 hover:text-white font-medium'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition relative ${
              currentView === 'repairs'
                ? 'bg-amber-400/20 ring-1 ring-amber-400/40'
                : 'bg-transparent'
            }`}
          >
            <Wrench className="w-5 h-5" />
            {activeTrackingTicket && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">
            {language === 'ar' ? 'تصليح' : 'Réparations'}
          </span>
        </button>

        {/* In-store Installments */}
        <button
          type="button"
          onClick={() => setCurrentView('installments')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer min-w-[56px] ${
            currentView === 'installments'
              ? 'text-sky-400 font-black'
              : 'text-neutral-400 hover:text-white font-medium'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition ${
              currentView === 'installments'
                ? 'bg-sky-400/20 ring-1 ring-sky-400/40'
                : 'bg-transparent'
            }`}
          >
            <CreditCard className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">
            {language === 'ar' ? 'تقسيط' : 'Facilité'}
          </span>
        </button>

        {/* Cart */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-neutral-400 hover:text-white font-medium transition cursor-pointer min-w-[56px] relative"
        >
          <div className="p-1.5 rounded-xl relative">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1.5 bg-emerald-400 text-[#08090d] text-[10px] font-black h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">
            {language === 'ar' ? 'السلة' : 'Panier'}
          </span>
        </button>

        {/* Dashboard */}
        <button
          type="button"
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer min-w-[56px] ${
            currentView === 'dashboard'
              ? 'text-purple-400 font-black'
              : 'text-neutral-400 hover:text-white font-medium'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition ${
              currentView === 'dashboard'
                ? 'bg-purple-400/20 ring-1 ring-purple-400/40'
                : 'bg-transparent'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">
            {language === 'ar' ? 'لوحة التحكم' : 'Gestion'}
          </span>
        </button>
      </div>
    </nav>
  );
};
