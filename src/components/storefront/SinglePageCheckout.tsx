import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, Order } from '../../types';
import { ALGERIA_WILAYAS } from '../../data/wilayas';
import {
  X,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Phone,
  User,
  MapPin,
  Building2,
  HelpCircle,
  Clock,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

interface SinglePageCheckoutProps {
  onClose: () => void;
  onOrderCompleted: (order: Order) => void;
  purchaseType?: 'full' | 'installment';
  productDirectBuy?: Product | null;
  directProduct?: Product | null;
}

export const SinglePageCheckout: React.FC<SinglePageCheckoutProps> = ({
  onClose,
  onOrderCompleted,
  purchaseType = 'full',
  productDirectBuy,
  directProduct,
}) => {
  const activeDirectProduct = productDirectBuy || directProduct;
  const { cart, cartTotal, language, t, createOrder, showToast } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneSecondary, setPhoneSecondary] = useState('');
  const [selectedWilayaCode, setSelectedWilayaCode] = useState<number>(39); // 39 El Oued
  const [commune, setCommune] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryType, setDeliveryType] = useState<'store_pickup' | 'home' | 'desk'>('home');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentWilaya = useMemo(() => {
    return ALGERIA_WILAYAS.find((w) => w.code === selectedWilayaCode) || ALGERIA_WILAYAS[0];
  }, [selectedWilayaCode]);

  // Determine items and subtotal
  const isDirectBuy = Boolean(activeDirectProduct);
  const checkoutItems = useMemo(() => {
    if (isDirectBuy && activeDirectProduct) {
      return [
        {
          productId: activeDirectProduct.id,
          productName: activeDirectProduct.name,
          productImage: activeDirectProduct.images[0] || activeDirectProduct.image,
          quantity: 1,
          unitPrice: activeDirectProduct.price,
          selectedStorage: activeDirectProduct.storage,
          selectedColor: activeDirectProduct.color,
        },
      ];
    }
    return cart.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      productImage: item.product.images[0] || item.product.image,
      quantity: item.quantity,
      unitPrice: item.product.price,
      selectedStorage: item.selectedStorage,
      selectedColor: item.selectedColor,
    }));
  }, [isDirectBuy, activeDirectProduct, cart]);

  const subtotal = useMemo(() => {
    if (isDirectBuy && activeDirectProduct) return activeDirectProduct.price;
    return cartTotal;
  }, [isDirectBuy, activeDirectProduct, cartTotal]);

  const isStorePickup = deliveryType === 'store_pickup';
  const shippingFee = useMemo(() => {
    if (isStorePickup) return 0;
    return deliveryType === 'home'
      ? currentWilaya.homeDeliveryCost
      : currentWilaya.deskDeliveryCost;
  }, [isStorePickup, deliveryType, currentWilaya]);

  const total = subtotal + shippingFee;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !phone.trim()) {
      showToast(
        language === 'ar' ? 'يرجى ملء الاسم ورقم الهاتف بدقة' : 'Veuillez renseigner votre nom et numéro de téléphone',
        'error'
      );
      return;
    }

    if (phone.trim().length < 9) {
      showToast(
        language === 'ar' ? 'يرجى إدخال رقم هاتف صحيح (9 أو 10 أرقام)' : 'Veuillez saisir un numéro de téléphone valide',
        'error'
      );
      return;
    }

    setIsSubmitting(true);

    const createdOrder = createOrder({
      customerName: customerName.trim(),
      phone: phone.trim(),
      phoneSecondary: phoneSecondary.trim() || undefined,
      wilayaCode: isStorePickup ? 39 : currentWilaya.code,
      wilayaName: isStorePickup
        ? (language === 'ar' ? 'الوادي (محل حمتين تيليكوم 4)' : 'El Oued (Magasin)')
        : (language === 'ar' ? currentWilaya.nameAr : currentWilaya.nameFr),
      commune: isStorePickup
        ? (language === 'ar' ? 'مفترق طرق الملاح' : "Carrefour M'lah")
        : (commune.trim() || currentWilaya.nameAr),
      deliveryType,
      address: isStorePickup
        ? (language === 'ar' ? 'استلام ودفع مباشر داخل المحل (الوادي)' : 'Retrait en magasin')
        : (address.trim() || (language === 'ar' ? 'العنوان غير محدد' : 'Adresse standard')),
      paymentMethod: isStorePickup ? 'store_payment' : 'cod',
      items: checkoutItems,
      subtotal,
      discountAmount: 0,
      shippingFee,
      total,
      notes: customerNotes.trim() || undefined,
    });

    setIsSubmitting(false);
    showToast(
      isStorePickup
        ? (language === 'ar' ? 'تم تسجيل طلبك بنجاح! تفضل بزيارتنا في المحل للاستلام' : 'Commande confirmée pour retrait en magasin!')
        : (language === 'ar' ? 'تم تسجيل طلبك بنجاح! سنتصل بك فوراً للتأكيد والشحن' : 'Commande enregistrée avec succès!'),
      'success'
    );

    onOrderCompleted(createdOrder);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col text-slate-900">
        {/* Sticky Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Zap className="w-4 h-4 text-amber-400 fill-current" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                {t.fastCheckoutTitle}
              </h2>
              <p className="text-[11px] text-slate-500">
                {language === 'ar'
                  ? 'الدفع عند الاستلام مع إمكانية فحص الطرد قبل الدفع'
                  : 'Paiement à la livraison après vérification'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmitOrder} className="overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Customer Info Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-600" />
              <span>{language === 'ar' ? 'معلومات الزبون' : 'Informations de contact'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  {t.fullName} *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={language === 'ar' ? 'الاسم واللقب' : 'Nom complet'}
                  className="w-full bg-white border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  {t.phoneNumber} *
                </label>
                <input
                  type="tel"
                  required
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="06 / 07 / 05..."
                  className="w-full bg-white border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">
                {t.secondaryPhone} ({language === 'ar' ? 'اختياري' : 'optionnel'})
              </label>
              <input
                type="tel"
                dir="ltr"
                value={phoneSecondary}
                onChange={(e) => setPhoneSecondary(e.target.value)}
                placeholder="06 / 07 / 05..."
                className="w-full bg-white border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          {/* Delivery Options */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-slate-600" />
              <span>{t.deliveryOptions}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDeliveryType('home')}
                className={`p-3 rounded-xl border text-right transition cursor-pointer ${
                  deliveryType === 'home'
                    ? 'bg-white border-slate-900 shadow-xs ring-1 ring-slate-900'
                    : 'bg-white/60 border-slate-200 hover:bg-white text-slate-700'
                }`}
              >
                <div className="font-bold text-xs text-slate-900">
                  {language === 'ar' ? 'توصيل للمنزل' : 'À domicile'}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {currentWilaya.homeDeliveryCost.toLocaleString()} د.ج
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('desk')}
                className={`p-3 rounded-xl border text-right transition cursor-pointer ${
                  deliveryType === 'desk'
                    ? 'bg-white border-slate-900 shadow-xs ring-1 ring-slate-900'
                    : 'bg-white/60 border-slate-200 hover:bg-white text-slate-700'
                }`}
              >
                <div className="font-bold text-xs text-slate-900">
                  {language === 'ar' ? 'استلام من المكتب' : 'Stop Desk'}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {currentWilaya.deskDeliveryCost.toLocaleString()} د.ج
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('store_pickup')}
                className={`p-3 rounded-xl border text-right transition cursor-pointer ${
                  deliveryType === 'store_pickup'
                    ? 'bg-white border-slate-900 shadow-xs ring-1 ring-slate-900'
                    : 'bg-white/60 border-slate-200 hover:bg-white text-slate-700'
                }`}
              >
                <div className="font-bold text-xs text-slate-900">
                  {language === 'ar' ? 'استلام من المحل' : 'En magasin'}
                </div>
                <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                  {language === 'ar' ? 'مجاناً (الوادي)' : 'Gratuit (El Oued)'}
                </div>
              </button>
            </div>

            {/* Wilaya & Address Details */}
            {deliveryType !== 'store_pickup' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {t.wilaya} *
                  </label>
                  <select
                    value={selectedWilayaCode}
                    onChange={(e) => setSelectedWilayaCode(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-900 focus:outline-none"
                  >
                    {ALGERIA_WILAYAS.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.code} - {w.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {t.commune} *
                  </label>
                  <input
                    type="text"
                    required
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    placeholder={language === 'ar' ? 'اسم البلدية أو الحي' : 'Commune'}
                    className="w-full bg-white border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-medium text-slate-700 block mb-1">
                    {t.streetAddress}
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={language === 'ar' ? 'الحي، الشارع، أو علامة مميزة بالقرب منك' : 'Adresse détaillée'}
                    className="w-full bg-white border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Order Summary & Pricing */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
              <ShoppingBag className="w-3.5 h-3.5 text-slate-600" />
              <span>{language === 'ar' ? 'ملخص المنتجات' : 'Articles commandés'}</span>
            </h3>

            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {checkoutItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-200/50">
                  <span className="font-semibold text-slate-800 line-clamp-1">
                    {item.productName} × {item.quantity}
                  </span>
                  <span className="font-bold text-slate-900 font-mono">
                    {(item.unitPrice * item.quantity).toLocaleString()} د.ج
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>{language === 'ar' ? 'مجموع المنتجات:' : 'Sous-total :'}</span>
                <span className="font-bold text-slate-800">{subtotal.toLocaleString()} د.ج</span>
              </div>
              <div className="flex justify-between">
                <span>{language === 'ar' ? 'تكلفة التوصيل:' : 'Frais de livraison :'}</span>
                <span className="font-bold text-emerald-700">
                  {shippingFee === 0
                    ? (language === 'ar' ? 'مجاناً' : 'Gratuit')
                    : `${shippingFee.toLocaleString()} د.ج`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
                <span>{language === 'ar' ? 'المجموع النهائي المطلوب:' : 'Total à payer :'}</span>
                <span className="text-base text-emerald-800">{total.toLocaleString()} د.ج</span>
              </div>
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isSubmitting
                ? (language === 'ar' ? 'جارٍ تسجيل الطلب...' : 'Traitement...')
                : (language === 'ar' ? 'تأكيد الطلب الآن (الدفع عند الاستلام)' : 'Confirmer la commande')}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
