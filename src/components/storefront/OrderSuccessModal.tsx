import React from 'react';
import { Order } from '../../types';
import { useStore } from '../../context/StoreContext';
import {
  CheckCircle2,
  PhoneCall,
  MessageCircle,
  Truck,
  Printer,
  X,
  Package,
  CreditCard,
  Store,
  MapPin,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface OrderSuccessModalProps {
  order: Order;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
}) => {
  const { language, t } = useStore();
  const isStorePickup = order.deliveryType === 'store_pickup';

  const handleWhatsAppContact = () => {
    const text = isStorePickup
      ? encodeURIComponent(
          `مرحباً محل حمتين تيليكوم 4، قمت بحجز طلب رقم #${order.orderNumber} باسم ${order.customerName} للاستلام والدفع مباشرة بالمحل (الوادي). أود تأكيد موعد حضوري.`
        )
      : encodeURIComponent(
          `مرحباً، قمت بتأكيد طلب جديد رقم #${order.orderNumber} باسم ${order.customerName} لولاية ${order.wilayaName}. أود تأكيد الطلب للشحن.`
        );
    window.open(`https://wa.me/213699269292?text=${text}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-xl flex justify-center items-start p-0 sm:p-4 md:p-6">
      <div className="relative w-full max-w-xl bg-[#0c0e15] text-neutral-200 rounded-none sm:rounded-[2.5rem] shadow-[0_25px_80px_rgba(0,0,0,0.85)] overflow-hidden my-0 sm:my-8 border-0 sm:border border-white/10 min-h-screen sm:min-h-0 flex flex-col">
        {/* Success header */}
        <div
          className={`text-white p-6 sm:p-8 text-center relative border-b border-white/10 ${
            isStorePickup
              ? 'bg-gradient-to-b from-amber-950/70 via-amber-950/30 to-[#08090d]'
              : 'bg-gradient-to-b from-emerald-950/70 via-emerald-950/30 to-[#08090d]'
          }`}
        >
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-9 h-9 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.09] text-neutral-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div
            className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-3 ${
              isStorePickup
                ? 'bg-amber-400/15 border border-amber-400/40 text-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.3)]'
                : 'bg-emerald-400/15 border border-emerald-400/40 text-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.3)]'
            }`}
          >
            {isStorePickup ? <Store className="w-9 h-9" /> : <CheckCircle2 className="w-9 h-9" />}
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white">
            {isStorePickup
              ? (language === 'ar' ? 'تهانينا! تم حجز هاتفك للاستلام من المحل' : 'Félicitations! Retrait Magasin Confirmé')
              : (language === 'ar' ? 'تهانينا! تم تسجيل طلبك بنجاح' : 'Félicitations! Commande Confirmée')}
          </h2>
          <p className="text-neutral-300 text-xs sm:text-sm mt-1.5 max-w-md mx-auto leading-relaxed">
            {isStorePickup
              ? (language === 'ar'
                  ? 'تم حجز وتجهيز الهاتف باسمك في محل حمتين تيليكوم 4 (الوادي). تفضل بزيارتنا للمعاينة والتجربة والدفع مباشرة.'
                  : 'Votre smartphone est réservé chez Hamtine Telecom 4 (El Oued). Vous pouvez passer pour le tester et payer sur place.')
              : (language === 'ar'
                  ? 'سيتصل بك فريق خدمة الزبائن هاتفياً خلال دقائق لتأكيد العنوان وبدء الشحن الفوري'
                  : 'Notre service client va vous appeler dans les prochaines minutes pour confirmer l\'expédition')}
          </p>

          <div
            className={`mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-mono text-sm font-bold tracking-wide border ${
              isStorePickup
                ? 'bg-amber-400/15 border-amber-400/30 text-amber-300'
                : 'bg-emerald-400/15 border-emerald-400/30 text-emerald-300'
            }`}
          >
            <span>#{order.orderNumber}</span>
          </div>
        </div>

        {/* Details Content */}
        <div className="p-5 sm:p-8 space-y-5 flex-1">
          {/* In-Store Pickup Banner / Map Directions */}
          {isStorePickup && (
            <div className="bg-amber-400/[0.09] rounded-2xl p-4 sm:p-5 border-2 border-amber-400/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-300 font-black text-sm">
                  <Store className="w-5 h-5 text-amber-400" />
                  <span>محل حمتين تيليكوم 4 - Hamtine Telecom 4</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold text-[10px]">
                  دفع واستلام بالمحل
                </span>
              </div>

              <div className="text-xs text-neutral-200 space-y-2 leading-relaxed">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>العنوان:</strong> ولاية الوادي - حي الاستقلال / مفترق طرق الملاح (مقابل المحطة)</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-amber-400 shrink-0" />
                  <span><strong>هاتف المحل:</strong> <strong dir="ltr" className="font-mono text-white">0699 26 92 92</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>أوقات العمل:</strong> يومياً من 08:30 صباحاً إلى 22:00 ليلاً (ما عدا الجمعة مساءً)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-amber-400/20 flex flex-wrap items-center gap-3">
                <a
                  href="https://share.google/ychE3nVODcxqlIGDt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 text-slate-950 font-black text-xs hover:bg-amber-300 transition shadow-sm"
                >
                  <MapPin className="w-4 h-4" />
                  <span>فتح الموقع في خرائط Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href="tel:0699269292"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-amber-400/40 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 font-bold text-xs transition"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>اتصال هاتفي بالمحل</span>
                </a>
              </div>
            </div>
          )}

          {/* Order Summary box */}
          <div className="bg-white/[0.04] rounded-2xl p-4 sm:p-5 border border-white/10 space-y-3 text-xs sm:text-sm">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-neutral-400 font-medium">{language === 'ar' ? 'اسم الزبون:' : 'Client:'}</span>
              <span className="font-bold text-white text-sm">{order.customerName}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-neutral-400 font-medium">{language === 'ar' ? 'رقم الهاتف:' : 'Téléphone:'}</span>
              <span className="font-bold text-emerald-400 font-mono text-sm" dir="ltr">{order.phone}</span>
            </div>
            {order.phoneSecondary && (
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="text-neutral-400 font-medium">{language === 'ar' ? 'هاتف احتياطي:' : 'Tél secondaire:'}</span>
                <span className="font-semibold text-neutral-300 font-mono" dir="ltr">{order.phoneSecondary}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-neutral-400 font-medium">{isStorePickup ? (language === 'ar' ? 'مكان الاستلام:' : 'Lieu de retrait:') : (language === 'ar' ? 'وجهة التوصيل:' : 'Destination:')}</span>
              <span className="font-bold text-white text-end">
                {isStorePickup
                  ? (language === 'ar' ? 'محل حمتين تيليكوم 4 (الوادي - مفترق طرق الملاح)' : 'Hamtine Telecom 4 (El Oued)')
                  : `${order.wilayaName} - ${order.commune}`}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-neutral-400 font-medium">{language === 'ar' ? 'طريقة الاستلام:' : 'Mode:'}</span>
              <span className="font-semibold text-neutral-200">
                {isStorePickup
                  ? (language === 'ar' ? '🏪 استلام مباشر ومعاينة داخل المحل (0 دج مصاريف شحن)' : 'Retrait direct en magasin (Gratuit)')
                  : order.deliveryType === 'home'
                  ? (language === 'ar' ? 'توصيل لباب المنزل' : 'À domicile')
                  : (language === 'ar' ? 'استلام من مكتب التوصيل (Stop Desk)' : 'Point relais')}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-neutral-400 font-medium">{language === 'ar' ? 'طريقة الدفع:' : 'Paiement:'}</span>
              <span className={`font-bold ${isStorePickup ? 'text-amber-400' : 'text-emerald-400'}`}>
                {isStorePickup
                  ? (language === 'ar' ? '💵 الدفع المباشر داخل المحل بعد فحص الهاتف (نقداً أو BaridiMob)' : 'Paiement en magasin après vérification (Espèces / BaridiMob)')
                  : (language === 'ar' ? 'الدفع نقداً عند الاستلام بعد المعاينة (COD)' : 'Paiement à la livraison après vérification')}
              </span>
            </div>
            {order.address && (
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="text-neutral-400 font-medium">{isStorePickup ? (language === 'ar' ? 'ملاحظة الزبون:' : 'Note:') : (language === 'ar' ? 'العنوان:' : 'Adresse:')}</span>
                <span className="font-semibold text-neutral-300 text-end">{order.address}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-1">
              <span className="font-bold text-neutral-200 text-sm">{t.totalText}</span>
              <span className={`text-lg sm:text-xl font-black ${isStorePickup ? 'text-amber-400' : 'text-emerald-400'}`}>
                {order.total.toLocaleString()} {t.currency}
              </span>
            </div>
          </div>

          {/* Confirmation advice banner */}
          <div
            className={`rounded-2xl p-4 border flex items-start gap-3 text-xs ${
              isStorePickup
                ? 'bg-amber-400/[0.07] border-amber-400/20 text-amber-300'
                : 'bg-emerald-400/[0.07] border-emerald-400/20 text-emerald-300'
            }`}
          >
            {isStorePickup ? (
              <Store className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <PhoneCall className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="font-bold mb-0.5 text-white">
                {isStorePickup
                  ? (language === 'ar' ? 'فحص وتجربة الجهاز داخل المحل' : 'Test et vérification en magasin')
                  : (language === 'ar' ? 'يرجى إبقاء هاتفك مفتوحاً' : 'Gardez votre téléphone allumé')}
              </h4>
              <p className="text-neutral-300 leading-relaxed">
                {isStorePickup
                  ? (language === 'ar'
                      ? `عند قدومك للمحل، اذكر رقم الطلب #${order.orderNumber}. سيقوم التقني بفتح العلبة وتجربة الهاتف معك والتأكد من شهادة الضمان قبل الدفع نقداً أو ببريدي موب.`
                      : `En magasin, indiquez votre numéro #${order.orderNumber}. Notre technicien vous assistera pour tester l'appareil avant de régler.`)
                  : (language === 'ar'
                      ? 'سيتصل بك موزعنا لتحديد موعد التسليم الدقيق. يمكنك فتح الطرد وتجربة الهاتف والتأكد من الضمان قبل دفع أي دينار للموزع.'
                      : 'Vous recevrez un appel de confirmation. Vous avez le droit d\'ouvrir le colis et de tester le téléphone avant de payer.')}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleWhatsAppContact}
              className={`w-full py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
                isStorePickup
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-[0_8px_30px_rgba(251,191,36,0.3)]'
                  : 'bg-emerald-400 hover:bg-emerald-300 text-[#08090d] shadow-[0_8px_30px_rgba(52,211,153,0.25)]'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>
                {isStorePickup
                  ? (language === 'ar' ? 'تأكيد الحضور مع المحل عبر واتساب (WhatsApp)' : 'Confirmer via WhatsApp')
                  : (language === 'ar' ? 'تأكيد سريع عبر واتساب (WhatsApp)' : 'Confirmation rapide WhatsApp')}
              </span>
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handlePrint}
                className="py-2.5 px-3 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-4 h-4 text-neutral-400" />
                <span>{language === 'ar' ? 'طباعة وصل الحجز' : 'Imprimer le reçu'}</span>
              </button>

              <button
                onClick={onClose}
                className="py-2.5 px-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white font-bold text-xs text-center transition cursor-pointer"
              >
                {language === 'ar' ? 'متابعة التصفح' : 'Continuer vos achats'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
