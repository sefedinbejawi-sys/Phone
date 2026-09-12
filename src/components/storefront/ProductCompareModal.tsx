import React from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Zap,
  Check,
  Minus,
  Sparkles,
  Smartphone,
  Cpu,
  HardDrive,
  Camera,
  Battery,
  ShieldCheck,
  Truck,
} from 'lucide-react';

interface ProductCompareModalProps {
  products: Product[];
  onRemoveProduct: (productId: string) => void;
  onClearAll: () => void;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onFastBuy: (product: Product) => void;
}

export const ProductCompareModal: React.FC<ProductCompareModalProps> = ({
  products,
  onRemoveProduct,
  onClearAll,
  onClose,
  onSelectProduct,
  onFastBuy,
}) => {
  const { language, t } = useStore();

  if (products.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#0c0e15] text-neutral-200 rounded-[2.5rem] shadow-[0_25px_80px_rgba(0,0,0,0.85)] overflow-hidden border border-white/10 my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#08090d]/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                {language === 'ar' ? 'مقارنة المواصفات والأسعار' : 'Comparateur de Smartphones'}
              </h2>
              <p className="text-xs text-neutral-400">
                {language === 'ar'
                  ? `مقارنة مباشرة بين ${products.length} هواتف لمساعدتك على الاختيار الأنسب`
                  : `Comparaison directe de ${products.length} smartphones`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClearAll}
              className="text-xs text-neutral-400 hover:text-rose-400 px-3 py-1.5 rounded-xl border border-white/10 hover:border-rose-500/30 bg-white/[0.04] transition cursor-pointer"
            >
              {language === 'ar' ? 'مسح الكل' : 'Vider'}
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.09] text-neutral-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Comparison Table Container */}
        <div className="p-6 overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-3 text-right text-neutral-400 font-bold uppercase tracking-wider w-40 min-w-[140px] bg-white/[0.03] rounded-r-2xl">
                  {language === 'ar' ? 'الهاتف' : 'Smartphone'}
                </th>
                {products.map((p) => (
                  <th key={p.id} className="p-3 text-center min-w-[220px] max-w-[280px]">
                    <div className="relative flex flex-col items-center space-y-2">
                      <button
                        onClick={() => onRemoveProduct(p.id)}
                        className="absolute -top-1 left-0 p-1.5 rounded-xl bg-white/[0.05] hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 border border-white/10 transition cursor-pointer"
                        title="إزالة من المقارنة"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div className="w-24 h-24 rounded-2xl bg-[#08090d] border border-white/10 p-2 flex items-center justify-center overflow-hidden">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <span className="text-[11px] font-extrabold text-emerald-300 uppercase bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-0.5 rounded-full">
                        {p.brand}
                      </span>
                      <h3 className="font-extrabold text-white text-xs sm:text-sm text-center line-clamp-2">
                        {language === 'ar' ? p.name : p.nameFr || p.name}
                      </h3>

                      <div className="flex flex-col items-center">
                        <span className="text-base sm:text-lg font-black text-emerald-400">
                          {p.price.toLocaleString()} {t.currency}
                        </span>
                        {p.originalPrice && (
                          <span className="text-xs text-neutral-500 line-through">
                            {p.originalPrice.toLocaleString()} {t.currency}
                          </span>
                        )}
                      </div>

                      <div className="w-full space-y-1.5 pt-1">
                        <button
                          onClick={() => onFastBuy(p)}
                          className="w-full py-2 px-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-[#08090d] text-xs font-black flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(52,211,153,0.3)] transition cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5 fill-current" />
                          <span>{t.orderNowCod}</span>
                        </button>
                        <button
                          onClick={() => onSelectProduct(p)}
                          className="w-full py-1.5 px-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.09] text-white text-xs font-semibold text-center transition cursor-pointer"
                        >
                          {language === 'ar' ? 'التفاصيل الكاملة' : 'Voir fiche'}
                        </button>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {/* Row: Status / Condition */}
              <tr>
                <td className="p-3 font-bold text-neutral-300 bg-white/[0.03] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{language === 'ar' ? 'الحالة والضمان' : 'État & Garantie'}</span>
                </td>
                {products.map((p) => (
                  <td key={p.id} className="p-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          p.category === 'new-phone'
                            ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                            : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                        }`}
                      >
                        {p.category === 'new-phone'
                          ? language === 'ar'
                            ? 'جديد أصلي 100%'
                            : 'Neuf 100%'
                          : language === 'ar'
                          ? `مستعمل ممتاز (${p.batteryHealth || 90}%)`
                          : `Occasion Certifiée (${p.batteryHealth || 90}%)`}
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        {language === 'ar'
                          ? `ضمان ${p.warrantyMonths} أشهر`
                          : `Garantie ${p.warrantyMonths} mois`}
                      </span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row: Display */}
              <tr>
                <td className="p-3 font-bold text-neutral-300 bg-white/[0.03] flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>{language === 'ar' ? 'الشاشة والعرض' : 'Écran'}</span>
                </td>
                {products.map((p) => (
                  <td key={p.id} className="p-3 text-center font-medium text-neutral-200">
                    {p.quickSpecs?.screen || p.specs['الشاشة'] || '—'}
                  </td>
                ))}
              </tr>

              {/* Row: Processor */}
              <tr>
                <td className="p-3 font-bold text-neutral-300 bg-white/[0.03] flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>{language === 'ar' ? 'المعالج' : 'Processeur'}</span>
                </td>
                {products.map((p) => (
                  <td key={p.id} className="p-3 text-center font-bold text-white">
                    {p.quickSpecs?.processor || p.specs['المعالج'] || '—'}
                  </td>
                ))}
              </tr>

              {/* Row: RAM & Storage */}
              <tr>
                <td className="p-3 font-bold text-neutral-300 bg-white/[0.03] flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{language === 'ar' ? 'الذاكرة والتخزين' : 'RAM & Stockage'}</span>
                </td>
                {products.map((p) => (
                  <td key={p.id} className="p-3 text-center font-medium text-neutral-200">
                    <span className="font-extrabold text-white">{p.storage || '—'}</span>
                    {p.ram && <span className="text-neutral-400"> / {p.ram} RAM</span>}
                  </td>
                ))}
              </tr>

              {/* Row: Camera */}
              <tr>
                <td className="p-3 font-bold text-neutral-300 bg-white/[0.03] flex items-center gap-2">
                  <Camera className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{language === 'ar' ? 'الكاميرا' : 'Appareil Photo'}</span>
                </td>
                {products.map((p) => (
                  <td key={p.id} className="p-3 text-center font-medium text-neutral-200">
                    {p.quickSpecs?.camera || p.specs['الكاميرا الخلفية'] || p.specs['الكاميرا'] || '—'}
                  </td>
                ))}
              </tr>

              {/* Row: Battery & Charging */}
              <tr>
                <td className="p-3 font-bold text-neutral-300 bg-white/[0.03] flex items-center gap-2">
                  <Battery className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{language === 'ar' ? 'البطارية والشحن' : 'Batterie & Charge'}</span>
                </td>
                {products.map((p) => (
                  <td key={p.id} className="p-3 text-center font-medium text-neutral-200">
                    <div>{p.quickSpecs?.battery || p.specs['البطارية'] || '—'}</div>
                    {p.quickSpecs?.charging && (
                      <div className="text-[11px] text-neutral-400 mt-0.5">{p.quickSpecs.charging}</div>
                    )}
                  </td>
                ))}
              </tr>

              {/* Row: Delivery COD */}
              <tr>
                <td className="p-3 font-bold text-neutral-300 bg-white/[0.03] flex items-center gap-2">
                  <Truck className="w-4 h-4 text-neutral-400 shrink-0" />
                  <span>{language === 'ar' ? 'التوصيل لـ 58 ولاية' : 'Livraison COD'}</span>
                </td>
                {products.map((p) => (
                  <td key={p.id} className="p-3 text-center">
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-xs">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>{language === 'ar' ? 'دفع عند الاستلام بعد الفحص' : 'COD après vérification'}</span>
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
