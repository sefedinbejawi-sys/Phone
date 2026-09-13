import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Home,
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
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-1 py-1"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* 1. Home / Storefront */}
        <button
          type="button"
          onClick={() => setCurrentView('storefront')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer min-w-[56px] ${
            currentView === 'storefront'
              ? 'text-slate-900 font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <div
            className={`p-1 rounded-lg transition ${
              currentView === 'storefront' ? 'bg-slate-100 text-slate-900' : ''
            }`}
          >
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5">
            {language === 'ar' ? 'الرئيسية' : 'Accueil'}
          </span>
        </button>

        {/* 2. Repairs SAV */}
        <button
          type="button"
          onClick={() => setCurrentView('repairs')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer min-w-[56px] relative ${
            currentView === 'repairs'
              ? 'text-slate-900 font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <div
            className={`p-1 rounded-lg transition relative ${
              currentView === 'repairs' ? 'bg-slate-100 text-slate-900' : ''
            }`}
          >
            <Wrench className="w-5 h-5" />
            {activeTrackingTicket && (
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </div>
          <span className="text-[10px] mt-0.5">
            {language === 'ar' ? 'الصيانة' : 'Réparation'}
          </span>
        </button>

        {/* 3. In-store Installments */}
        <button
          type="button"
          onClick={() => setCurrentView('installments')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer min-w-[56px] ${
            currentView === 'installments'
              ? 'text-slate-900 font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <div
            className={`p-1 rounded-lg transition ${
              currentView === 'installments' ? 'bg-slate-100 text-slate-900' : ''
            }`}
          >
            <CreditCard className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5">
            {language === 'ar' ? 'التقسيط' : 'Facilité'}
          </span>
        </button>

        {/* 4. Cart */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-500 hover:text-slate-800 font-medium transition cursor-pointer min-w-[64px] relative"
        >
          <div className="p-1 rounded-lg relative">
            <ShoppingBag className="w-5 h-5 text-slate-700" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 font-bold">
            {language === 'ar' ? 'السلة' : 'Panier'}
          </span>
        </button>
      </div>
    </nav>
  );
};
