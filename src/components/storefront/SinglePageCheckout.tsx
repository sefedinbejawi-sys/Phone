import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { ALGERIA_WILAYAS, getWilayaByCode } from '../../data/wilayas';
import { Product, Order } from '../../types';
import {
  X,
  Truck,
  ShieldCheck,
  Banknote,
  CheckCircle,
  AlertCircle,
  Phone,
  MapPin,
  FileText,
  User,
  Zap,
  Store,
} from 'lucide-react';

interface SinglePageCheckoutProps {
  directProduct?: Product | null;
  onClose: () => void;
  onOrderCompleted: (order: Order) => void;
}

export const SinglePageCheckout: React.FC<SinglePageCheckoutProps> = ({
  directProduct,
  onClose,
  onOrderCompleted,
}) => {
  const { cart, language, t, createOrder, showToast } = useStore();

  // Selected items: either single direct product or existing cart
  const [quantity, setQuantity] = useState<number>(1);

  // Customer form fields
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneSecondary, setPhoneSecondary] = useState('');
  const [selectedWilayaCode, setSelectedWilayaCode] = useState<number>(39); // Default 39 El Oued
  const [commune, setCommune] = useState('');
  const [deliveryType, setDeliveryType] = useState<'store_pickup' | 'home' | 'desk'>('store_pickup');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Wilaya details & shipping fee
  const selectedWilaya = useMemo(
    () => getWilayaByCode(selectedWilayaCode) || ALGERIA_WILAYAS[0],
    [selectedWilayaCode]
  );

  // Subtotal and items calculation
  const { items, subtotal, discountAmount, shippingFee, total } = useMemo(() => {
    let orderItems: Order['items'] = [];
    let sub = 0;
    let disc = 0;

    if (directProduct) {
      let unitPrice = directProduct.price;
      // Check quantity discount
      if (directProduct.quantityDiscounts) {
        const tier = directProduct.quantityDiscounts
          .filter((d) => quantity >= d.qty)
          .sort((a, b) => b.qty - a.qty)[0];
        if (tier) {
          disc = Math.round((directProduct.price * quantity * tier.discountPercent) / 100);
        }
      }
      sub = unitPrice * quantity;
      orderItems = [
        {
          productId: directProduct.id,
          productName: directProduct.name,
          productImage: directProduct.images[0],
          quantity,
          unitPrice,
          selectedColor: directProduct.color,
          selectedStorage: directProduct.storage,
        },
      ];
    } else {
      sub = cart.reduce((acc, item) => {
        let price = item.product.price;
        if (item.product.quantityDiscounts) {
          const tier = item.product.quantityDiscounts
            .filter((d) => item.quantity >= d.qty)
            .sort((a, b) => b.qty - a.qty)[0];
          if (tier) {
            price = price * (1 - tier.discountPercent / 100);
          }
        }
        return acc + price * item.quantity;
      }, 0);

      orderItems = cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.images[0],
        quantity: item.quantity,
        unitPrice: item.product.price,
        selectedColor: item.selectedColor,
        selectedStorage: item.selectedStorage,
      }));
    }

    const ship = deliveryType === 'store_pickup'
      ? 0
      : deliveryType === 'home'
      ? selectedWilaya.homeDeliveryCost
      : selectedWilaya.deskDeliveryCost;

    const tot = Math.max(0, sub - disc + ship);

    return {
      items: orderItems,
      subtotal: sub,
      discountAmount: disc,
      shippingFee: ship,
      total: tot,
    };
  }, [directProduct, quantity, cart, deliveryType, selectedWilaya]);

  // Validation & Submit
  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    const isStorePickup = deliveryType === 'store_pickup';

    // 1. Name validation (required)
    if (!customerName.trim()) {
      showToast(
        language === 'ar' ? 'يرجى إدخال الاسم واللقب' : 'Veuillez renseigner votre nom et prénom',
        'warning'
      );
      return;
    }

    // 2. Phone validation (required)
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      showToast(
        language === 'ar'
          ? 'يرجى إدخال رقم هاتف صحيح يبدأ بـ 05 أو 06 أو 07'
          : 'Numéro de téléphone valide requis (05/06/07)',
        'warning'
      );
      return;
    }

    // 3. Shipping address validation only if delivery is selected
    if (!isStorePickup) {
      if (!selectedWilaya || !selectedWilayaCode) {
        showToast(
          language === 'ar' ? 'يرجى اختيار الولاية' : 'Veuillez sélectionner votre wilaya',
          'warning'
        );
        return;
      }

      if (!commune.trim()) {
        showToast(
          language === 'ar' ? 'يرجى تحديد البلدية أو المدينة' : 'Veuillez indiquer votre commune',
          'warning'
        );
        return;
      }

      if (!address.trim()) {
        showToast(
          language === 'ar'
            ? 'يرجى إدخال العنوان بالتفصيل (الحي، الشارع، أو الإقامة)'
            : 'Veuillez saisir votre adresse détaillée (rue, quartier...)',
          'warning'
        );
        return;
      }
    }

    // Create order in Central State
    const createdOrder = createOrder({
      customerName,
      phone: cleanPhone,
      phoneSecondary: phoneSecondary.trim() || undefined,
      wilayaCode: isStorePickup ? 39 : selectedWilaya.code,
      wilayaName: isStorePickup
        ? (language === 'ar' ? 'الوادي (محل حمتين تيليكوم 4)' : 'El Oued (Hamtine Telecom 4)')
        : (language === 'ar' ? selectedWilaya.nameAr : selectedWilaya.nameFr),
      commune: isStorePickup
        ? (language === 'ar' ? 'مفترق طرق الملاح' : "Carrefour M'lah")
        : commune.trim(),
      deliveryType,
      deliveryDeskCarrier: deliveryType === 'desk' ? 'Yalidine' : undefined,
      address: isStorePickup
        ? (address.trim() || (language === 'ar' ? 'استلام ودفع مباشر داخل المحل (حمتين تيليكوم 4 - مفترق طرق الملاح)' : 'Retrait et paiement direct en magasin'))
        : address.trim(),
      notes: notes.trim() || undefined,
      items,
      subtotal,
      discountAmount,
      shippingFee,
      total,
      paymentMethod: isStorePickup ? 'store_payment' : 'cod',
    });

    onOrderCompleted(createdOrder);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-xl flex justify-center items-start p-0 sm:p-4 md:p-6">
      <div className="relative w-full max-w-3xl bg-[#0c0e15] text-neutral-200 rounded-none sm:rounded-[2.5rem] shadow-[0_25px_80px_rgba(0,0,0,0.85)] overflow-hidden my-0 sm:my-8 border-0 sm:border border-white/10 min-h-screen sm:min-h-0 flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-[#08090d]/95 backdrop-blur-md text-white p-4 sm:p-6 flex items-center justify-between border-b border-white/10 shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-400/15 border border-emerald-400/30 text-emerald-400 shrink-0">
              <Zap className="w-5 h-5 fill-current" />
            </span>
            <div>
              <h2 className="text-base sm:text-xl font-black text-white">
                {t.fastCheckoutTitle}
              </h2>
              <p className="text-neutral-400 text-[11px] sm:text-xs">
                {language === 'ar' ? 'أدخل معلوماتك وسنتصل بك فوراً لتأكيد إرسال الطلب' : t.fastCheckoutSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl border border-white/10 bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmitOrder} className="p-4 sm:p-7 space-y-6 flex-1">
          {/* Top: Customer Details Card - Most Important Section */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#121622] border-2 border-emerald-500/40 shadow-[0_8px_30px_rgba(0,0,0,0.5)] space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-400/20 text-emerald-400">
                  <User className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">
                    {language === 'ar' ? 'معلومات الزبون للتأكيد والتوصيل' : 'Coordonnées du client'}
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    {language === 'ar' ? 'يرجى كتابة الاسم ورقم الهاتف بدقة' : 'Veuillez saisir votre nom et téléphone avec précision'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-emerald-400 bg-emerald-400/15 px-3 py-1 rounded-full border border-emerald-400/30">
                {language === 'ar' ? 'مطلوب إجباري *' : 'Obligatoire *'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="flex items-center justify-between text-xs sm:text-sm font-bold text-white mb-2">
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-emerald-400" />
                    <span>{t.fullName}</span>
                    <span className="text-rose-400 font-bold">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={language === 'ar' ? 'الاسم واللقب (مثال: محمد بلحاج)' : 'Nom & Prénom'}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-stone-600 focus:border-emerald-400 bg-neutral-900 text-white placeholder:text-neutral-400 text-base font-semibold focus:ring-4 focus:ring-emerald-400/20 focus:outline-none transition shadow-inner"
                />
              </div>

              {/* Primary Phone */}
              <div>
                <label className="flex items-center justify-between text-xs sm:text-sm font-bold text-white mb-2">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span>{t.phoneNumber}</span>
                    <span className="text-rose-400 font-bold">*</span>
                  </span>
                  <span className="text-[11px] text-emerald-400 font-medium">
                    {language === 'ar' ? 'موبيليس / جيزي / أوريدو' : 'Pour vous joindre'}
                  </span>
                </label>
                <div className="flex items-center rounded-xl border-2 border-stone-600 focus-within:border-emerald-400 bg-neutral-900 overflow-hidden transition focus-within:ring-4 focus-within:ring-emerald-400/20 shadow-inner">
                  <div className="px-3 py-3.5 bg-white/[0.08] border-e border-white/10 text-emerald-400 flex items-center gap-1.5 shrink-0 text-xs sm:text-sm font-bold select-none">
                    <span>🇩🇿</span>
                    <span dir="ltr" className="font-mono text-white">+213</span>
                  </div>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0550 12 34 56"
                    className="w-full px-3.5 py-3.5 bg-transparent text-white placeholder:text-neutral-400 text-base font-bold font-mono tracking-wider focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Secondary Phone (Optional) */}
            <div>
              <label className="flex items-center justify-between text-xs font-semibold text-neutral-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{t.secondaryPhone}</span>
                </span>
                <span className="text-[11px] text-neutral-400">
                  {language === 'ar' ? '(اختياري في حال كان الخط الأول غير متاح)' : '(Optionnel)'}
                </span>
              </label>
              <div className="flex items-center rounded-xl border border-stone-600 focus-within:border-emerald-400 bg-neutral-900/80 overflow-hidden transition">
                <div className="px-3 py-2.5 bg-white/[0.04] border-e border-white/10 text-neutral-400 flex items-center gap-1 shrink-0 text-xs font-mono select-none">
                  <span>🇩🇿</span>
                  <span dir="ltr">+213</span>
                </div>
                <input
                  type="tel"
                  dir="ltr"
                  value={phoneSecondary}
                  onChange={(e) => setPhoneSecondary(e.target.value)}
                  placeholder="0770 00 00 00"
                  className="w-full px-3.5 py-2.5 bg-transparent text-white placeholder:text-neutral-400 text-base font-mono tracking-wide focus:outline-none"
                />
              </div>
            </div>

            {/* Delivery Method Choice (Store Pickup vs Home vs Stop Desk) */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs sm:text-sm font-bold text-white">
                {t.deliveryOptions}:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 1. In-Store Pickup */}
                <label
                  className={`flex flex-col justify-between p-3.5 rounded-2xl border-2 transition cursor-pointer gap-2 ${
                    deliveryType === 'store_pickup'
                      ? 'border-amber-400 bg-amber-400/[0.12] ring-2 ring-amber-400/20'
                      : 'border-white/10 hover:border-white/20 bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <input
                      type="radio"
                      name="deliveryType"
                      checked={deliveryType === 'store_pickup'}
                      onChange={() => setDeliveryType('store_pickup')}
                      className="text-amber-400 focus:ring-amber-400 w-4 h-4 mt-0.5 shrink-0 accent-amber-400"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-black text-xs sm:text-sm text-white">
                          {language === 'ar' ? 'استلام من المحل' : 'Retrait Magasin'}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-black text-[10px]">
                          {language === 'ar' ? 'مباشر' : 'Direct'}
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-300 block mt-1">
                        {language === 'ar' ? 'الوادي - مفترق طرق الملاح' : "El Oued - Carrefour M'lah"}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[10px] text-neutral-400 font-medium">
                      {language === 'ar' ? 'دفع بالمحل' : 'Paiement magasin'}
                    </span>
                    <span className="font-black text-xs text-amber-400">
                      {language === 'ar' ? 'مجاناً 0 دج' : '0 DZD (Gratuit)'}
                    </span>
                  </div>
                </label>

                {/* 2. Home Delivery */}
                <label
                  className={`flex flex-col justify-between p-3.5 rounded-2xl border-2 transition cursor-pointer gap-2 ${
                    deliveryType === 'home'
                      ? 'border-emerald-400 bg-emerald-400/[0.12] ring-2 ring-emerald-400/20'
                      : 'border-white/10 hover:border-white/20 bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <input
                      type="radio"
                      name="deliveryType"
                      checked={deliveryType === 'home'}
                      onChange={() => setDeliveryType('home')}
                      className="text-emerald-400 focus:ring-emerald-400 w-4 h-4 mt-0.5 shrink-0 accent-emerald-400"
                    />
                    <div>
                      <span className="block font-bold text-xs sm:text-sm text-white">
                        {t.homeDelivery}
                      </span>
                      <span className="text-[11px] text-neutral-400 block mt-1">
                        {selectedWilaya.estimatedDays}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[10px] text-neutral-400 font-medium">
                      {language === 'ar' ? 'لباب الدار' : 'À domicile'}
                    </span>
                    <span className="font-black text-xs text-emerald-400 whitespace-nowrap">
                      {selectedWilaya.homeDeliveryCost} {t.currency}
                    </span>
                  </div>
                </label>

                {/* 3. Desk Delivery */}
                <label
                  className={`flex flex-col justify-between p-3.5 rounded-2xl border-2 transition cursor-pointer gap-2 ${
                    deliveryType === 'desk'
                      ? 'border-emerald-400 bg-emerald-400/[0.12] ring-2 ring-emerald-400/20'
                      : 'border-white/10 hover:border-white/20 bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <input
                      type="radio"
                      name="deliveryType"
                      checked={deliveryType === 'desk'}
                      onChange={() => setDeliveryType('desk')}
                      className="text-emerald-400 focus:ring-emerald-400 w-4 h-4 mt-0.5 shrink-0 accent-emerald-400"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-white">
                          {language === 'ar' ? 'مكتب التوصيل' : 'Point relais'}
                        </span>
                        <span
                          dir="ltr"
                          className="px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[9px]"
                        >
                          Stop Desk
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-400 block mt-1">
                        {language === 'ar' ? 'ياليدين / ZR Express' : 'Yalidine / ZR Express'}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[10px] text-neutral-400 font-medium">
                      {language === 'ar' ? 'المكتب' : 'Au bureau'}
                    </span>
                    <span className="font-black text-xs text-emerald-400 whitespace-nowrap">
                      {selectedWilaya.deskDeliveryCost} {t.currency}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* In-Store Pickup Details Card */}
            {deliveryType === 'store_pickup' ? (
              <div className="p-4 rounded-2xl bg-amber-400/[0.08] border-2 border-amber-400/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs sm:text-sm">
                    <Store className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>محل حمتين تيليكوم 4 - Hamtine Telecom 4</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-black text-[10px]">
                    0 دج توصيل
                  </span>
                </div>
                <div className="text-xs text-neutral-300 space-y-1 leading-relaxed">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span><strong>العنوان:</strong> ولاية الوادي - حي الاستقلال / مفترق طرق الملاح (مقابل المحطة)</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span dir="ltr" className="font-mono font-bold text-white">0699 26 92 92</span>
                  </p>
                  <p className="text-[11px] text-amber-200/90 pt-1">
                    ✨ بعد تأكيد الطلب، سيتم تجهيز وحجز الهاتف باسمك لتأتي لمعاينته وتجريبه بنفسك والدفع نقداً أو ببريدي موب (BaridiMob).
                  </p>
                </div>
                <div className="pt-1 flex items-center gap-3">
                  <a
                    href="https://share.google/ychE3nVODcxqlIGDt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 underline"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>عرض موقع المحل على خرائط Google Maps ↗</span>
                  </a>
                </div>
              </div>
            ) : null}

            {/* Wilaya & Commune (Only required if delivery) */}
            {deliveryType !== 'store_pickup' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Wilaya selector */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white mb-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>{t.selectWilaya}</span>
                    <span className="text-rose-400 font-bold">*</span>
                  </label>
                  <select
                    value={selectedWilayaCode}
                    onChange={(e) => setSelectedWilayaCode(Number(e.target.value))}
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-stone-600 focus:border-emerald-400 bg-neutral-900 text-white text-base font-semibold focus:ring-4 focus:ring-emerald-400/20 focus:outline-none transition shadow-inner"
                  >
                    {ALGERIA_WILAYAS.map((w) => (
                      <option key={w.code} value={w.code} className="bg-[#0c0e15] text-white">
                        {String(w.code).padStart(2, '0')} - {language === 'ar' ? w.nameAr : w.nameFr}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Commune */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white mb-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>{t.commune}</span>
                    <span className="text-rose-400 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required={deliveryType !== 'store_pickup'}
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    placeholder={language === 'ar' ? 'اسم البلدية أو الدائرة' : 'Commune'}
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-stone-600 focus:border-emerald-400 bg-neutral-900 text-white placeholder:text-neutral-400 text-base font-semibold focus:ring-4 focus:ring-emerald-400/20 focus:outline-none transition shadow-inner"
                  />
                </div>
              </div>
            )}

            {/* Address (or appointment note if store pickup) */}
            <div>
              <label className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white mb-2">
                <MapPin className={`w-4 h-4 ${deliveryType === 'store_pickup' ? 'text-amber-400' : 'text-emerald-400'}`} />
                <span>
                  {deliveryType === 'store_pickup'
                    ? (language === 'ar' ? 'موعد أو وقت الحضور المتوقع للمحل (اختياري)' : 'Heure de passage en magasin (optionnel)')
                    : (language === 'ar' ? 'العنوان بالتفصيل أو أقرب معلم' : 'Adresse détaillée')}
                </span>
                {deliveryType !== 'store_pickup' && <span className="text-rose-400 font-bold">*</span>}
              </label>
              <input
                type="text"
                required={deliveryType !== 'store_pickup'}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={
                  deliveryType === 'store_pickup'
                    ? (language === 'ar' ? 'مثال: سأحضر اليوم بعد صلاة العصر لمعاينة الهاتف واستلامه' : 'Ex: Je passerai vers 17h')
                    : deliveryType === 'desk'
                    ? (language === 'ar' ? 'اسم مكتب ياليدين أو ZR Express المفضل في بلديتك' : 'Nom du bureau Yalidine ou ZR Express')
                    : (language === 'ar' ? 'الحي، الشارع، أو رقم العمارة / المنزل' : 'Quartier, rue, ou numéro de maison')
                }
                className={`w-full px-4 py-3.5 rounded-xl border-2 ${
                  deliveryType === 'store_pickup' ? 'border-amber-400/50 focus:border-amber-400' : 'border-stone-600 focus:border-emerald-400'
                } bg-neutral-900 text-white placeholder:text-neutral-400 text-base font-semibold focus:outline-none transition shadow-inner`}
              />
            </div>
          </div>

          {/* Ordered Products summary */}
          <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/10">
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>{language === 'ar' ? 'المنتجات المطلوبة:' : 'Articles sélectionnés:'}</span>
            </h3>

            <div className="space-y-3">
              {items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={it.productImage}
                      alt={it.productName}
                      className="w-12 h-12 rounded-xl object-contain bg-[#08090d] border border-white/10 p-1.5"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-bold text-white line-clamp-1">
                        {it.productName}
                      </h4>
                      <p className="text-neutral-400 text-[11px] font-mono">
                        {it.selectedStorage ? `${it.selectedStorage} • ` : ''}
                        {it.selectedColor || ''}
                      </p>
                    </div>
                  </div>

                  {directProduct && (
                    <div className="flex items-center gap-2 bg-white/[0.06] px-2.5 py-1 rounded-xl border border-white/10">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-5 h-5 rounded-lg bg-white/[0.1] text-white font-bold hover:bg-white/[0.2] transition"
                      >
                        -
                      </button>
                      <span className="font-bold text-white px-1">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-5 h-5 rounded-lg bg-white/[0.1] text-white font-bold hover:bg-white/[0.2] transition"
                      >
                        +
                      </button>
                    </div>
                  )}

                  <span className="font-black text-emerald-400 text-sm whitespace-nowrap">
                    {(it.unitPrice * (directProduct ? quantity : it.quantity)).toLocaleString()}{' '}
                    {t.currency}
                  </span>
                </div>
              ))}
            </div>

            {/* Quantity discount reminder */}
            {discountAmount > 0 && (
              <div className="mt-3 text-xs bg-emerald-400/10 text-emerald-300 p-2.5 rounded-xl border border-emerald-400/20 font-semibold flex items-center justify-between">
                <span>{language === 'ar' ? '🎉 تم تطبيق خصم الكمية التلقائي!' : '🎉 Remise sur quantité appliquée!'}</span>
                <span>-{discountAmount.toLocaleString()} {t.currency}</span>
              </div>
            )}
          </div>

          {/* 3. Payment Method */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
              <Banknote className={`w-4 h-4 ${deliveryType === 'store_pickup' ? 'text-amber-400' : 'text-emerald-400'}`} />
              <span>{t.choosePayment}:</span>
            </h3>

            {deliveryType === 'store_pickup' ? (
              <div className="p-4 rounded-2xl border-2 border-amber-400/50 bg-amber-500/[0.08] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-400 shrink-0">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-black text-sm text-white block">
                      {language === 'ar' ? 'الدفع المباشر داخل المحل (نقداً أو ببريدي موب)' : 'Paiement direct en magasin (Espèces ou BaridiMob)'}
                    </span>
                    <p className="text-[11px] text-neutral-300 mt-0.5">
                      {language === 'ar'
                        ? 'معاينة وتشغيل وفحص الهاتف بحضور التقني في المحل قبل تسديد المبلغ'
                        : 'Vérification et test complet en magasin avant de régler'}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20 shrink-0">
                  {language === 'ar' ? 'بالمحل' : 'Au Magasin'}
                </span>
              </div>
            ) : (
              <div className="p-4 rounded-2xl border-2 border-emerald-400/50 bg-emerald-500/[0.08] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-400/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-black text-sm text-white block">
                      {language === 'ar' ? 'الدفع نقداً عند الاستلام (COD)' : 'Paiement en espèces à la livraison'}
                    </span>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {t.codPaymentText}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20 shrink-0">
                  {language === 'ar' ? 'آمن ومضمون' : '100% Sécurisé'}
                </span>
              </div>
            )}
          </div>

          {/* 4. Financial Summary Card */}
          <div className="bg-[#08090d] border border-white/10 text-white rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>{t.subtotalText}</span>
              <span className="font-semibold text-white">{subtotal.toLocaleString()} {t.currency}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-xs text-emerald-400">
                <span>{t.discountText}</span>
                <span className="font-semibold">-{discountAmount.toLocaleString()} {t.currency}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>
                {deliveryType === 'store_pickup'
                  ? (language === 'ar' ? 'استلام من المحل (الوادي - مفترق طرق الملاح)' : 'Retrait magasin (El Oued)')
                  : `${t.shippingFeeText} (${selectedWilaya.nameAr} - ${deliveryType === 'home' ? 'منزلي' : 'مكتب'})`}
              </span>
              <span className={`font-semibold ${deliveryType === 'store_pickup' ? 'text-amber-400 font-bold' : 'text-white'}`}>
                {deliveryType === 'store_pickup'
                  ? (language === 'ar' ? 'مجاناً (0 دج)' : 'Gratuit (0 DZD)')
                  : `${shippingFee.toLocaleString()} ${t.currency}`}
              </span>
            </div>

            <div className="border-t border-white/10 pt-3 flex items-baseline justify-between">
              <div>
                <span className="font-black text-sm block text-white">
                  {t.totalText}
                </span>
                <span className="text-[11px] text-neutral-400 block mt-0.5">
                  {deliveryType === 'store_pickup'
                    ? (language === 'ar' ? 'المبلغ الإجمالي المستحق للدفع داخل المحل' : 'Montant à régler en magasin')
                    : (language === 'ar' ? 'شامل مصاريف التوصيل وضمان المحل' : 'Frais de livraison et garantie inclus')}
                </span>
              </div>
              <span className={`text-2xl font-black ${deliveryType === 'store_pickup' ? 'text-amber-400' : 'text-emerald-400'}`}>
                {total.toLocaleString()} {t.currency}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-4 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition cursor-pointer ${
              deliveryType === 'store_pickup'
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-[0_8px_30px_rgba(251,191,36,0.35)]'
                : 'bg-emerald-400 hover:bg-emerald-300 text-[#08090d] shadow-[0_8px_30px_rgba(52,211,153,0.3)]'
            }`}
          >
            <CheckCircle className="w-5 h-5 fill-current" />
            <span>
              {deliveryType === 'store_pickup'
                ? (language === 'ar'
                    ? `تأكيد حجز واستلام الهاتف من المحل (${total.toLocaleString()} ${t.currency})`
                    : `Confirmer le retrait & paiement au magasin (${total.toLocaleString()} ${t.currency})`)
                : t.confirmOrderBtn}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
