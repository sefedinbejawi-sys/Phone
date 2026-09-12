import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Smartphone, Wrench, CreditCard, ShoppingBag, LayoutDashboard } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { currentView, setCurrentView, cartCount, setIsCartOpen, activeTrackingTicket, language } = useStore();

  return (
    <nav aria-label="Mobile Navigation" className="hub-bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-[60] px-2 py-1.5">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <button type="button" onClick={() => setCurrentView('storefront')} className={`hub-bottom-nav-item flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer min-w-[56px] ${currentView === 'storefront' ? 'is-active' : ''}`}>
          <div className="hub-bottom-icon"><Smartphone className="w-5 h-5" /></div>
          <span>{language === 'ar' ? 'الرئيسية' : 'Accueil'}</span>
        </button>

        <button type="button" onClick={() => setCurrentView('repairs')} className={`hub-bottom-nav-item flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer min-w-[56px] relative ${currentView === 'repairs' ? 'is-active' : ''}`}>
          <div className="hub-bottom-icon relative"><Wrench className="w-5 h-5" />{activeTrackingTicket && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#c86b3c]" />}</div>
          <span>{language === 'ar' ? 'التصليح' : 'Réparation'}</span>
        </button>

        <button type="button" onClick={() => setCurrentView('installments')} className={`hub-bottom-nav-item flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer min-w-[56px] ${currentView === 'installments' ? 'is-active' : ''}`}>
          <div className="hub-bottom-icon"><CreditCard className="w-5 h-5" /></div>
          <span>{language === 'ar' ? 'التقسيط' : 'Facilité'}</span>
        </button>

        <button type="button" onClick={() => setIsCartOpen(true)} className="hub-bottom-nav-item flex flex-col items-center justify-center py-1 px-2 rounded-xl text-neutral-400 transition cursor-pointer min-w-[56px] relative">
          <div className="hub-bottom-icon relative"><ShoppingBag className="w-5 h-5" />{cartCount > 0 && <span className="absolute -top-2 -right-2 bg-[#c86b3c] text-white text-[10px] font-black h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center">{cartCount}</span>}</div>
          <span>{language === 'ar' ? 'السلة' : 'Panier'}</span>
        </button>

        <button type="button" onClick={() => setCurrentView('dashboard')} className={`hub-bottom-nav-item flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer min-w-[56px] ${currentView === 'dashboard' ? 'is-active' : ''}`}>
          <div className="hub-bottom-icon"><LayoutDashboard className="w-5 h-5" /></div>
          <span>{language === 'ar' ? 'التاجر' : 'Gestion'}</span>
        </button>
      </div>
    </nav>
  );
};
