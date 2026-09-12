import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { HamtineLogo } from './HamtineLogo';
import { CreditCard, Languages, Menu, Phone, Search, ShoppingBag, Smartphone, Wrench, X } from 'lucide-react';

export const Header: React.FC = () => {
  const { language, setLanguage, t, currentView, setCurrentView, cartCount, setIsCartOpen, findRepairByTicket, setActiveTrackingTicket, showToast } = useStore();
  const [ticketSearch, setTicketSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleTicketSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = findRepairByTicket(ticketSearch);
    if (!ticketSearch.trim()) return;
    if (found) {
      setActiveTrackingTicket(found);
      setCurrentView('repairs');
      setTicketSearch('');
      showToast(language === 'ar' ? `تم العثور على التذكرة #${found.ticketNumber}` : `Ticket trouvé #${found.ticketNumber}`);
    } else {
      showToast(language === 'ar' ? 'رقم التذكرة غير موجود' : 'Ticket introuvable', 'warning');
    }
  };

  const navButton = (view: 'storefront' | 'repairs' | 'installments') => {
    setCurrentView(view);
    setMenuOpen(false);
  };

  return (
    <header className="simple-header sticky top-0 z-40">
      <div className="simple-header-top">
        <span>{language === 'ar' ? 'توصيل سريع متوفر لـ 58 ولاية (Yalidine / ZR Express / NOEST)' : 'Livraison rapide dans 58 wilayas'}</span>
        <div className="simple-header-top-actions">
          <a href="tel:0699269292" aria-label="اتصل بالمحل"><Phone className="h-4 w-4" /></a>
          <button type="button" onClick={() => setLanguage(language === 'ar' ? 'fr' : 'ar')} aria-label="تغيير اللغة">
            <Languages className="h-4 w-4" /> {language === 'ar' ? 'Français' : 'العربية'}
          </button>
        </div>
      </div>

      <div className="simple-header-main">
        <button type="button" className="simple-brand" onClick={() => navButton('storefront')} aria-label="الرئيسية">
          <HamtineLogo size="sm" />
          <span><strong>{t.storeName}</strong><small>{language === 'ar' ? 'بيع وتصليح الهواتف النقالة' : 'Vente et réparation de téléphones'}</small></span>
        </button>

        <div className="simple-header-actions">
          <button type="button" className="simple-icon-button" onClick={() => setMenuOpen((open) => !open)} aria-label="القائمة">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <button type="button" className="simple-icon-button" onClick={() => setIsCartOpen(true)} aria-label="السلة">
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && <b>{cartCount}</b>}
          </button>
        </div>
      </div>

      <form onSubmit={handleTicketSearch} className="simple-ticket-search">
        <Search className="h-4 w-4" />
        <input value={ticketSearch} onChange={(e) => setTicketSearch(e.target.value)} placeholder={language === 'ar' ? 'تتبع تذكرة التصليح بالرقم...' : 'Suivre un ticket de réparation...'} />
      </form>

      {menuOpen && (
        <nav className="simple-menu" aria-label="التنقل الرئيسي">
          <button type="button" className={currentView === 'storefront' ? 'active' : ''} onClick={() => navButton('storefront')}><Smartphone className="h-4 w-4" />{language === 'ar' ? 'المتجر والمنتجات' : 'Boutique'}</button>
          <button type="button" className={currentView === 'repairs' ? 'active' : ''} onClick={() => navButton('repairs')}><Wrench className="h-4 w-4" />{language === 'ar' ? 'التصليح والتتبع' : 'Réparation'}</button>
          <button type="button" className={currentView === 'installments' ? 'active' : ''} onClick={() => navButton('installments')}><CreditCard className="h-4 w-4" />{language === 'ar' ? 'التقسيط' : 'Facilité'}</button>
        </nav>
      )}
    </header>
  );
};
