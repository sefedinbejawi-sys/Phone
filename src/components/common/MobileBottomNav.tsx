import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Home,
  Smartphone,
  Wrench,
  CreditCard,
  ShoppingBag,
  LayoutDashboard,
  Store,
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
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0c12]/95 backdrop-blur-2xl border-t border-white/10 px-1 py-1.5 shadow-[0_-4px_30px_rgba(0,0,0,0.8)]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* 1. Home / Storefront */}
        <button
          type="button"
          onClick={() => setCurrentView('storefront')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition cursor-pointer min-w-[50px] ${
            currentView === 'storefront'
              ? 'text-[#f97316] font-black'
              : 'text-neutral-400 hover:text-white font-medium'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition ${
              currentView === 'storefront'
                ? 'bg-[#c2410c]/20 ring-1 ring-[#c2410c]/50'
                : 'bg-transparent'
            }`}
          >
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">
            {language === 'ar' ? 'الرئيسية' : 'Accueil'}
          </span>
        </button>

        {/* 2. Repairs SAV */}
        <button
          type="button"
          onClick={() => setCurrentView('repairs')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition cursor-pointer min-w-[50px] relative ${
            currentView === 'repairs'
              ? 'text-amber-400 font-black'
              : 'text-neutral-400 hover:text-white font-medium'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition relative ${
              currentView === 'repairs'
                ? 'bg-amber-400/20 ring-1 ring-amber-400/50'
                : 'bg-transparent'
            }`}
          >
            <Wrench className="w-5 h-5" />
            {activeTrackingTicket && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">
            {language === 'ar' ? 'الصيانة' : 'Réparation'}
          </span>
        </button>

        {/* 3. In-store Installments */}
        <button
          type="button"
          onClick={() => setCurrentView('installments')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition cursor-pointer min-w-[50px] ${
            currentView === 'installments'
              ? 'text-sky-400 font-black'
              : 'text-neutral-400 hover:text-white font-medium'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition ${
              currentView === 'installments'
                ? 'bg-sky-400/20 ring-1 ring-sky-400/50'
                : 'bg-transparent'
            }`}
          >
            <CreditCard className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">
            {language === 'ar' ? 'التقسيط' : 'Facilité'}
          </span>
        </button>

        {/* 4. Cart (with Badge) */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-1.5 rounded-xl text-neutral-400 hover:text-white font-medium transition cursor-pointer min-w-[50px] relative"
        >
          <div className="p-1.5 rounded-xl relative">
            <ShoppingBag className="w-5 h-5 text-[#f97316]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1.5 bg-[#ea580c] text-white text-[10px] font-black h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center shadow-md animate-pulse">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">
            {language === 'ar' ? 'السلة' : 'Panier'}
          </span>
        </button>

        {/* 5. Merchant Dashboard */}
        <button
          type="button"
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition cursor-pointer min-w-[50px] ${
            currentView === 'dashboard'
              ? 'text-purple-400 font-black'
              : 'text-neutral-400 hover:text-white font-medium'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition ${
              currentView === 'dashboard'
                ? 'bg-purple-400/20 ring-1 ring-purple-400/50'
                : 'bg-transparent'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">
            {language === 'ar' ? 'التاجر' : 'Gestion'}
          </span>
        </button>
      </div>
    </nav>
  );
};
