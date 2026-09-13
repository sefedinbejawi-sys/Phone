import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/common/Header';
import { StoreHeroHeader } from './components/storefront/StoreHeroHeader';
import { ProductGrid } from './components/storefront/ProductGrid';
import { ProductModal } from './components/storefront/ProductModal';
import { SinglePageCheckout } from './components/storefront/SinglePageCheckout';
import { CartDrawer } from './components/storefront/CartDrawer';
import { OrderSuccessModal } from './components/storefront/OrderSuccessModal';
import { RepairSection } from './components/repair/RepairSection';
import { InstallmentSection } from './components/installment/InstallmentSection';
import { ExternalAdminPanel } from './components/admin/ExternalAdminPanel';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { Product, Order } from './types';
import {
  Truck,
  ShieldCheck,
  Phone,
  MessageCircle,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentView, setCurrentView, toasts, language, t } = useStore();

  // URL Hash listener for #admin or #dashboard
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#admin' || hash === '#dashboard' || hash === '#manage') {
        setCurrentView('dashboard');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [setCurrentView]);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);

  // Fast buy handler from product card
  const handleFastCheckout = (product: Product) => {
    setSelectedProduct(null);
    setCheckoutProduct(product);
    setIsCheckoutOpen(true);
  };

  // Open checkout from cart
  const handleCartCheckout = () => {
    setCheckoutProduct(null);
    setIsCheckoutOpen(true);
  };

  // Direct installment simulator action from Installment section
  const handleSelectProductForInstallment = (productId: string) => {
    setCurrentView('storefront');
  };

  // If in dedicated external admin view, render the full admin dashboard
  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-slate-900 selection:text-white">
        <ExternalAdminPanel />

        {/* Global Toast Notifications */}
        {toasts && toasts.length > 0 && (
          <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2 pointer-events-none">
            {toasts.map((toastItem) => (
              <div
                key={toastItem.id}
                className={`px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2.5 text-xs font-bold transition-all border ${
                  toastItem.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    : toastItem.type === 'error'
                    ? 'bg-rose-50 text-rose-900 border-rose-200'
                    : toastItem.type === 'warning'
                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                    : 'bg-slate-900 text-white border-slate-800'
                }`}
              >
                {toastItem.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                {toastItem.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                {toastItem.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />}
                {toastItem.type === 'info' && <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />}
                <span>{toastItem.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-slate-900 selection:text-white relative overflow-x-hidden pb-20 md:pb-0">
      <div className="relative z-10 flex-1">
        {/* Main Sticky Header */}
        <Header />

        {/* Main Content Area */}
        <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6">
          {currentView === 'storefront' && (
            <div className="space-y-6">
              {/* Clean Concise Hero Header */}
              <StoreHeroHeader
                onOpenInstallments={() => setCurrentView('installments')}
                onOpenRepairs={() => setCurrentView('repairs')}
              />

              {/* Product Catalog Grid */}
              <ProductGrid
                onOpenProductModal={(product) => setSelectedProduct(product)}
                onFastCheckout={(product) => handleFastCheckout(product)}
              />
            </div>
          )}

          {currentView === 'repairs' && <RepairSection />}

          {currentView === 'installments' && (
            <InstallmentSection
              onSelectProductForInstallment={handleSelectProductForInstallment}
            />
          )}
        </main>
      </div>

      {/* Clean Modern Light Footer */}
      <footer className="relative z-10 bg-white text-slate-600 border-t border-slate-200 mt-16 pt-10 pb-8 text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 p-1 flex items-center justify-center">
                  <img src="/hamtine-logo.svg" alt="Hamtine Telecom 4" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm sm:text-base leading-tight">
                    {t.storeName}
                  </h3>
                  <span className="text-[11px] text-amber-700 font-bold">فرع 4 (الوادي)</span>
                </div>
              </div>
              <p className="text-slate-500 leading-relaxed text-xs">
                {language === 'ar'
                  ? 'المتجر الرسمي لمحل حمتين تيليكوم 4: هواتف جديدة ومستعملة مع الضمان، إكسسوارات أصلية، صيانة فورية، ودفع عند الاستلام لـ 58 ولاية.'
                  : 'Boutique officielle Hamtine Telecom 4 : Smartphones certifiés, accessoires, SAV et paiement à la livraison 58 wilayas.'}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                {language === 'ar' ? 'شركاء الشحن' : 'Partenaires de Livraison'}
              </h4>
              <ul className="space-y-1.5 text-slate-500 text-xs">
                <li>• ياليدين إكسبريس (Yalidine Express)</li>
                <li>• زد آر إكسبريس (ZR Express)</li>
                <li>• توصيل لباب المنزل أو Stop Desk</li>
                <li>• فحص ومعاينة الهاتف قبل الدفع</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                {language === 'ar' ? 'وسائل الدفع والتقسيط' : 'Moyens de Paiement'}
              </h4>
              <ul className="space-y-1.5 text-slate-500 text-xs">
                <li>• الدفع نقداً عند الاستلام (COD)</li>
                <li>• تطبيق بريدي موب (BaridiMob RIP)</li>
                <li>• الدفع المباشر داخل المحل بالوادي</li>
                <li>• بيع بالتقسيط (3، 6، 12 شهراً)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                {language === 'ar' ? 'المقر وخدمة الزبائن' : 'Contact & Localisation'}
              </h4>
              <div className="space-y-1.5 text-slate-600 text-xs">
                <p className="font-mono font-bold text-slate-900">
                  📞 <a href="tel:0699269292" className="hover:text-emerald-700">0699 26 92 92</a>
                </p>
                <p>📍 ولاية الوادي - حي الاستقلال / مفترق طرق الملاح</p>
                <p>
                  <a
                    href="https://share.google/ychE3nVODcxqlIGDt"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-700 hover:underline font-bold"
                  >
                    <span>🗺️ خرائط Google Maps ↗</span>
                  </a>
                </p>
                <p className="text-slate-400">⏰ يومياً: 09:00 - 21:00 (ما عدا الجمعة صباحاً)</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
            <p>
              © 2026 {t.storeName} — متجر هواتف جزائري معتمد لـ 58 ولاية.
            </p>
            <div className="flex items-center gap-4 text-slate-600 font-medium flex-wrap">
              <span>ضمان رسمي 100%</span>
              <span>•</span>
              <span>توصيل 58 ولاية</span>
              <span>•</span>
              <span>معاينة قبل الدفع</span>
              <span>•</span>
              <button
                onClick={() => {
                  window.location.hash = 'admin';
                  setCurrentView('dashboard');
                }}
                className="text-slate-400 hover:text-slate-900 flex items-center gap-1 transition cursor-pointer text-[10px]"
                title="لوحة تحكم إدارة المحل"
              >
                <Lock className="w-3 h-3" />
                <span>لوحة تحكم الإدارة</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Direct WhatsApp Button */}
      <button
        onClick={() => {
          const msg = encodeURIComponent(
            language === 'ar'
              ? 'السلام عليكم حمتين تيليكوم 4، أود الاستفسار عن الهواتف المتوفرة أو خدمات الصيانة.'
              : 'Bonjour Hamtine Telecom 4, je souhaite me renseigner sur les smartphones.'
          );
          window.open(`https://wa.me/213699269292?text=${msg}`, '_blank');
        }}
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 p-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center gap-2 transition hover:scale-105 cursor-pointer font-bold"
        title="تواصل معنا عبر واتساب"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="hidden md:inline text-xs pr-1">
          {language === 'ar' ? 'مساعدة واتساب' : 'WhatsApp'}
        </span>
      </button>

      {/* Modals and Drawers */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onDirectBuy={() => handleFastCheckout(selectedProduct)}
          onOrderCompleted={(order) => {
            setSelectedProduct(null);
            setLastCompletedOrder(order);
          }}
        />
      )}

      {isCheckoutOpen && (
        <SinglePageCheckout
          directProduct={checkoutProduct}
          onClose={() => {
            setIsCheckoutOpen(false);
            setCheckoutProduct(null);
          }}
          onOrderCompleted={(order) => {
            setIsCheckoutOpen(false);
            setCheckoutProduct(null);
            setLastCompletedOrder(order);
          }}
        />
      )}

      <CartDrawer onOpenCheckout={handleCartCheckout} />

      {lastCompletedOrder && (
        <OrderSuccessModal
          order={lastCompletedOrder}
          onClose={() => setLastCompletedOrder(null)}
        />
      )}

      {/* Mobile Sticky Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Global Toast Notifications */}
      {toasts && toasts.length > 0 && (
        <div className="fixed bottom-20 md:bottom-6 left-4 md:left-6 z-50 flex flex-col gap-2 pointer-events-none">
          {toasts.map((toastItem) => (
            <div
              key={toastItem.id}
              className={`px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2.5 text-xs font-bold transition-all border ${
                toastItem.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : toastItem.type === 'error'
                  ? 'bg-rose-50 text-rose-900 border-rose-200'
                  : toastItem.type === 'warning'
                  ? 'bg-amber-50 text-amber-900 border-amber-200'
                  : 'bg-slate-900 text-white border-slate-800'
              }`}
            >
              {toastItem.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
              {toastItem.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              {toastItem.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />}
              {toastItem.type === 'info' && <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />}
              <span>{toastItem.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainAppContent />
    </StoreProvider>
  );
}

