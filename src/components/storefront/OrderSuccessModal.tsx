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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col text-slate-900">
        {/* Success header */}
        <div
          className={`p-6 text-center relative border-b ${
            isStorePickup
              ? 'bg-amber-50/80 border-amber-100 text-amber-950'
              : 'bg-emerald-50/80 border-emerald-100 text-emerald-950'
          }`}
        >
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-black/5 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div
            className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3 ${
              isStorePickup
                ? 'bg-amber-100 text-amber-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {isStorePickup ? <Store className="w-7 h-7" /> : <CheckCircle2 className="w-7 h-7" />}
          </div>

          <h2 className="text-lg sm:text-xl font-black text-slate-900">
            {isStorePickup
              ? (language === 'ar' ? 'تم تسجيل حجزك بنجاح!' : 'Réservation Confirmée !')
              : (language === 'ar' ? 'تم تسجيل طلبك بنجاح!' : 'Commande Confirmée !')}
          </h2>
          <p className="text-slate-600 text-xs mt-1 max-w-sm mx-auto leading-relaxed">
            {isStorePickup
              ? (language === 'ar'
                  ? 'تم حجز الهاتف باسمك في محل حمتين تيليكوم 4 بالوادي. تفضل بزيارتنا للفحص والدفع نقداً أو بـ BaridiMob.'
                  : 'Votre smartphone est réservé au magasin Hamtine Telecom 4.')
              : (language === 'ar'
                  ? 'سيتصل بك فريقنا هاتفياً خلال دقائق لتأكيد العنوان وبدء الشحن الفوري لباب منزلك.'
                  : 'Notre service va vous contacter pour confirmer la livraison.')}
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-bold bg-white border border-slate-200 text-slate-800 shadow-xs">
            <span>#{order.orderNumber}</span>
          </div>
        </div>

        {/* Details Content */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* In-Store Pickup Banner */}
          {isStorePickup && (
            <div className="bg-amber-50 rounded-xl p-3.5 border border-amber-200 text-xs text-amber-900 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <Store className="w-4 h-4 text-amber-700" />
                <span>محل حمتين تيليكوم 4 (الوادي)</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">
                الوادي: حي الاستقلال / مفترق طرق الملاح (مقابل المحطة) • مفتوح يومياً 09:00 - 21:00
              </p>
              <div className="pt-1 flex items-center gap-2">
                <a
                  href="https://share.google/ychE3nVODcxqlIGDt"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-950 hover:underline"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>الموقع على Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Order Summary box */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2 text-xs">
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">{language === 'ar' ? 'اسم الزبون:' : 'Client :'}</span>
              <span className="font-bold text-slate-900">{order.customerName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">{language === 'ar' ? 'رقم الهاتف:' : 'Téléphone :'}</span>
              <span className="font-bold font-mono text-slate-900" dir="ltr">{order.phone}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">{language === 'ar' ? 'الوجهة:' : 'Destination :'}</span>
              <span className="font-semibold text-slate-800 text-end">
                {isStorePickup
                  ? (language === 'ar' ? 'استلام من المحل بالوادي' : 'Magasin El Oued')
                  : `${order.wilayaName} - ${order.commune}`}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">{language === 'ar' ? 'الدفع:' : 'Paiement :'}</span>
              <span className="font-bold text-emerald-700">
                {isStorePickup
                  ? (language === 'ar' ? 'عند الاستلام بالمحل' : 'Au magasin')
                  : (language === 'ar' ? 'عند الاستلام بعد المعاينة' : 'À la livraison (COD)')}
              </span>
            </div>
            <div className="flex justify-between pt-1 font-black text-sm text-slate-900">
              <span>{t.totalText}:</span>
              <span className="text-emerald-800 text-base">{order.total.toLocaleString()} د.ج</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleWhatsAppContact}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>{language === 'ar' ? 'تأكيد الحجز عبر واتساب' : 'Confirmer sur WhatsApp'}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handlePrint}
                className="py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'طباعة الوصل' : 'Imprimer'}</span>
              </button>

              <button
                onClick={onClose}
                className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs text-center transition cursor-pointer"
              >
                {language === 'ar' ? 'متابعة التصفح' : 'Continuer'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
