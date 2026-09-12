import React, { useState } from 'react';
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
import { MerchantDashboard } from './components/dashboard/MerchantDashboard';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { HamtineLogo } from './components/common/HamtineLogo';
import { Product, Order } from './types';
import {
  Truck,
  ShieldCheck,
  Banknote,
  Wrench,
  Phone,
  MessageCircle,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentView, setCurrentView, toasts, language, t, firebaseUser, isOwner, isAuthLoading, loginWithGoogle } = useStore();

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

  return (
    <div className="min-h-screen store-app-shell flex flex-col justify-between selection:bg-[#c86b3c]/30 selection:text-[#193247] relative overflow-x-hidden pb-20 md:pb-0">

      <div className="relative z-10">
        {/* Main Sticky Header */}
        <Header />

        {/* Global Floating Trust Banner */}
        <div className="bg-[#0b0d14]/90 border-b border-white/10 py-2.5 px-4 text-xs backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-6 flex-wrap">
              <span className="flex items-center gap-1.5 font-medium text-neutral-300">
                <Truck className="w-4 h-4 text-emerald-400" />
                <span>{language === 'ar' ? 'توصيل منزلي ومكاتب لـ 58 ولاية' : 'Livraison 58 wilayas à domicile et stop-desk'}</span>
              </span>
              <span className="hidden sm:flex items-center gap-1.5 font-medium text-neutral-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{language === 'ar' ? 'افحص هاتفك قبل الدفع للموزع' : 'Ouvrez et testez avant de payer'}</span>
              </span>
              <span className="hidden md:flex items-center gap-1.5 font-medium text-neutral-300">
                <Banknote className="w-4 h-4 text-emerald-400" />
                <span>{language === 'ar' ? 'دفع عند الاستلام بعد المعاينة' : 'Paiement COD après vérification'}</span>
              </span>
              <span className="hidden lg:flex items-center gap-1.5 font-medium text-neutral-300">
                <Wrench className="w-4 h-4 text-amber-400" />
                <span>{language === 'ar' ? 'صيانة فورية بقطع أصلية وضمان' : 'Atelier réparation certifié'}</span>
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 font-bold">
              <span>{language === 'ar' ? 'متصل الآن بالشبكة الجزائرية' : 'Réseaux DZ connectés'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
          </div>
        </div>

        {/* Main Content Area based on currentView */}
        <main className="max-w-2xl mx-auto w-full px-4 py-5">
          {currentView === 'storefront' && (
            <div className="space-y-6">
              {/* Showly-inspired Luxury Hero Header */}
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

          {currentView === 'dashboard' && (
            isAuthLoading ? (
              <div className="panel mx-auto max-w-md p-8 text-center">
                <p className="font-bold">{language === 'ar' ? 'جار التحقق من حساب التاجر...' : 'Vérification du compte marchand...'}</p>
              </div>
            ) : firebaseUser && isOwner ? (
              <MerchantDashboard />
            ) : (
              <div className="panel mx-auto max-w-md space-y-4 p-6 text-center">
                <ShieldCheck className="mx-auto h-10 w-10 text-[#3d6475]" />
                <h2 className="text-xl font-black">{language === 'ar' ? 'لوحة التاجر محمية' : 'Espace marchand protégé'}</h2>
                <p className="text-sm text-[#6e7c86]">
                  {language === 'ar' ? 'سجّل الدخول بحساب التاجر المصرّح له للوصول إلى الطلبات والتصليحات والتقسيط.' : 'Connectez-vous avec le compte marchand autorisé pour accéder aux données privées.'}
                </p>
                <button type="button" onClick={() => void loginWithGoogle()} className="hub-btn hub-btn-primary w-full">
                  {language === 'ar' ? 'تسجيل الدخول عبر Google' : 'Se connecter avec Google'}
                </button>
                <button type="button" onClick={() => setCurrentView('storefront')} className="hub-btn hub-btn-secondary w-full">
                  {language === 'ar' ? 'العودة إلى المتجر' : 'Retour à la boutique'}
                </button>
              </div>
            )
          )}
        </main>
      </div>

      {/* Algerian Trust Footer - Showly Atelier Nova Style */}
      <footer className="relative z-10 bg-[#08090d] text-neutral-400 border-t border-white/10 mt-16 pt-12 pb-8 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <HamtineLogo size="sm" />
                <div>
                  <h3 className="font-black text-white text-base leading-tight">
                    {t.storeName}
                  </h3>
                  <span className="text-[10px] text-amber-400 font-bold">فرع 4 (الوادي)</span>
                </div>
              </div>
              <p className="text-neutral-400 leading-relaxed text-xs">
                {language === 'ar'
                  ? 'المتجر والورشة الرسمية لمحل حمتين تيليكوم 4: بيع الهواتف الذكية الجديدة والمستعملة المضمونة، الإكسسوارات الأصلية، قطع الغيار وخدمات الصيانة الفورية مع التوصيل لـ 58 ولاية والدفع عند الاستلام.'
                  : 'Boutique officielle Hamtine Telecom 4: Vente de smartphones, accessoires, pièces détachées et réparation avec livraison 58 wilayas.'}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">
                {language === 'ar' ? 'شركاء الشحن والتوصيل' : 'Partenaires de Livraison'}
              </h4>
              <ul className="space-y-1.5 text-neutral-400">
                <li>• ياليدين إكسبريس (Yalidine Express)</li>
                <li>• زد آر إكسبريس (ZR Express)</li>
                <li>• نويست للتوصيل (NOEST Delivery)</li>
                <li>• إيكوتراك الجزائر (EcoTrack)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">
                {language === 'ar' ? 'وسائل الدفع والتقسيط' : 'Moyens de Paiement'}
              </h4>
              <ul className="space-y-1.5 text-neutral-400">
                <li>• الدفع نقداً عند الاستلام (COD)</li>
                <li>• تطبيق بريدي موب (BaridiMob RIP)</li>
                <li>• التحويل البريدي CCP الجزائر</li>
                <li>• البيع بالتقسيط المعتمد (3 / 6 / 12 شهراً)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">
                {language === 'ar' ? 'خدمة الزبائن ومقر المحل' : 'Service Client & Localisation'}
              </h4>
              <div className="space-y-1.5 text-neutral-300">
                <p className="font-mono">📞 <a href="tel:0699269292" className="hover:underline">0699 26 92 92</a></p>
                <p>📍 ولاية الوادي - حي الاستقلال / مفترق طرق الملاح</p>
                <p>
                  <a
                    href="https://share.google/ychE3nVODcxqlIGDt"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold underline decoration-amber-400/50"
                  >
                    <span>🗺️ موقع المحل على Google Maps ↗</span>
                  </a>
                </p>
                <p className="text-neutral-400">⏰ السبت - الخميس: 09:00 - 21:00</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-500 text-[11px]">
            <p>
              © 2026 {t.storeName} — متجر إلكتروني متكامل لبيع الهواتف، قطع الغيار، وخدمات الصيانة والتقسيط لـ 58 ولاية.
            </p>
            <div className="flex items-center gap-4 text-neutral-400">
              <span>ضمان حقيقي 100%</span>
              <span>•</span>
              <span>دعم 58 ولاية</span>
              <span>•</span>
              <span>فحص الطرد قبل الدفع</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Direct WhatsApp Button */}
      <button
        onClick={() => {
          const msg = encodeURIComponent('مرحباً حمتين تيليكوم 4، أود الاستفسار عن الهواتف المتوفرة أو خدمات الصيانة.');
          window.open(`https://wa.me/213699269292?text=${msg}`, '_blank');
        }}
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 p-3.5 rounded-full bg-emerald-400 hover:bg-emerald-300 text-[#08090d] shadow-[0_8px_30px_rgba(52,211,153,0.4)] flex items-center gap-2 transition hover:scale-105 cursor-pointer font-black"
        title="تواصل معنا عبر واتساب"
      >
        <MessageCircle className="w-6 h-6 fill-current" />
        <span className="hidden md:inline font-black text-xs pr-1">
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
              className={`px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold transition-all border backdrop-blur-xl ${
                toastItem.type === 'success'
                  ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40 shadow-emerald-950/50'
                  : toastItem.type === 'error'
                  ? 'bg-rose-950/90 text-rose-200 border-rose-500/40 shadow-rose-950/50'
                  : toastItem.type === 'warning'
                  ? 'bg-amber-950/90 text-amber-200 border-amber-500/40 shadow-amber-950/50'
                  : 'bg-[#0e1017]/95 text-white border-white/10'
              }`}
            >
              {toastItem.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {toastItem.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              {toastItem.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
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
