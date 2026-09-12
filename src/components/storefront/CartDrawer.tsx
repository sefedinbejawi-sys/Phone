import React from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Trash2, ShoppingBag, ArrowLeft, ArrowRight, Zap, Check } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#0c0e15] border-l border-white/10 text-neutral-200 h-full shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col justify-between overflow-hidden">
        {/* Cart Header */}
        <div className="p-5 bg-[#08090d] text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-base text-white">
              {t.cart} ({cart.length} {t.items})
            </h3>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="w-8 h-8 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.09] text-neutral-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cart items list */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-24 text-neutral-500 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-neutral-500">
                <ShoppingBag className="w-8 h-8 stroke-1" />
              </div>
              <p className="font-semibold text-sm text-neutral-400">
                {language === 'ar' ? 'سلة المشتريات فارغة حالياً' : 'Votre panier est vide'}
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-2 px-5 py-2.5 rounded-xl bg-emerald-400 text-[#08090d] text-xs font-black hover:bg-emerald-300 transition cursor-pointer"
              >
                {language === 'ar' ? 'تصفح تشكيلة الهواتف' : 'Voir les smartphones'}
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/[0.035] border border-white/10 hover:border-white/20 transition"
              >
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-14 h-14 object-contain rounded-xl bg-[#08090d] border border-white/10 p-1.5 shrink-0"
                  referrerPolicy="no-referrer"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="font-extrabold text-white text-xs truncate">
                    {language === 'ar' ? item.product.name : item.product.nameFr || item.product.name}
                  </h4>
                  <p className="text-neutral-400 text-[11px] font-mono mt-0.5">
                    {item.selectedStorage ? `${item.selectedStorage} • ` : ''}
                    <span className="text-emerald-400 font-bold">{item.product.price.toLocaleString()} {t.currency}</span>
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-lg bg-white/[0.06] border border-white/10 text-white flex items-center justify-center text-xs font-bold hover:bg-white/[0.12] transition"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold w-4 text-center text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-lg bg-white/[0.06] border border-white/10 text-white flex items-center justify-center text-xs font-bold hover:bg-white/[0.12] transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-left flex flex-col items-end justify-between self-stretch">
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-neutral-500 hover:text-rose-400 transition p-1 cursor-pointer"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <span className="font-black text-xs text-white">
                    {(item.product.price * item.quantity).toLocaleString()} {t.currency}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout */}
        {cart.length > 0 && (
          <div className="p-5 bg-[#08090d] border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between text-sm font-bold text-neutral-300">
              <span>{t.subtotalText}</span>
              <span className="text-white text-lg font-black">
                {cartTotal.toLocaleString()} <span className="text-emerald-400 text-sm">{t.currency}</span>
              </span>
            </div>

            <p className="text-[11px] text-neutral-400">
              * {language === 'ar' ? 'يتم احتساب سعر التوصيل الدقيق حسب ولايتك في الخطوة التالية' : 'Frais de livraison calculés selon votre wilaya à la commande'}
            </p>

            <button
              onClick={() => {
                setIsCartOpen(false);
                onOpenCheckout();
              }}
              className="w-full py-4 px-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-[#08090d] font-black text-sm flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(52,211,153,0.3)] transition cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{language === 'ar' ? 'متابعة الدفع السريع (COD)' : 'Passer la commande (COD)'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
