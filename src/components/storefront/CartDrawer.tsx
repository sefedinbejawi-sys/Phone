import React from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Trash2, ShoppingBag, Zap, ArrowRight, ArrowLeft } from 'lucide-react';

interface CartDrawerProps {
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenCheckout }) => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateCartQuantity,
    cartTotal,
    language,
    t,
  } = useStore();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white text-slate-900 h-full shadow-2xl flex flex-col justify-between overflow-hidden border-r sm:border-l border-slate-200">
        {/* Cart Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h3 className="font-black text-sm sm:text-base text-slate-900">
              {t.cart} ({cart.length} {t.items})
            </h3>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart items list */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-20 text-slate-400 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <p className="font-bold text-xs sm:text-sm text-slate-700">
                {language === 'ar' ? 'سلة المشتريات فارغة' : 'Votre panier est vide'}
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
              >
                {language === 'ar' ? 'تصفح الهواتف المتوفرة' : 'Voir les smartphones'}
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition"
              >
                <img
                  src={item.product.images[0] || '/hamtine-logo.svg'}
                  alt={item.product.name}
                  className="w-14 h-14 object-contain rounded-lg bg-white border border-slate-100 p-1.5 shrink-0 mix-blend-multiply"
                  referrerPolicy="no-referrer"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-xs truncate">
                    {item.product.name}
                  </h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {item.selectedStorage ? `${item.selectedStorage} • ` : ''}
                    <span className="text-slate-900 font-bold">{item.product.price.toLocaleString()} د.ج</span>
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-md bg-white border border-slate-200 text-slate-800 flex items-center justify-center text-xs font-bold hover:bg-slate-100 transition"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold w-4 text-center text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-md bg-white border border-slate-200 text-slate-800 flex items-center justify-center text-xs font-bold hover:bg-slate-100 transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-left flex flex-col items-end justify-between self-stretch">
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-slate-400 hover:text-rose-600 transition p-1 cursor-pointer"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <span className="font-black text-xs text-slate-900">
                    {(item.product.price * item.quantity).toLocaleString()} د.ج
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout */}
        {cart.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-700">
              <span>{t.subtotalText}</span>
              <span className="text-slate-900 text-base font-black">
                {cartTotal.toLocaleString()} <span className="text-xs font-bold text-slate-500">د.ج</span>
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              {language === 'ar' ? '• الدفع عند الاستلام مع إمكانية فحص الطرد قبل الدفع' : '• Paiement à la livraison avec vérification'}
            </p>

            <button
              onClick={() => {
                setIsCartOpen(false);
                onOpenCheckout();
              }}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-400 fill-current" />
              <span>{language === 'ar' ? 'متابعة وإتمام الطلب الآن' : 'Passer à la commande'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
