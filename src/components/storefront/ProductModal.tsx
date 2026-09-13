import React, { useState, useMemo } from 'react';
import { Product, Order } from '../../types';
import { useStore } from '../../context/StoreContext';
import { ALGERIA_WILAYAS } from '../../data/wilayas';
import {
  X,
  ShieldCheck,
  Truck,
  CheckCircle2,
  ShoppingBag,
  Zap,
  MessageCircle,
  Phone,
  MapPin,
  Sparkles,
  Share2,
  Check,
} from 'lucide-react';

interface ProductModalProps {
  product?: Product | null;
  onClose?: () => void;
  onDirectBuy?: (product: Product) => void;
  onOpenCheckout?: (purchaseType: 'full') => void;
  onOrderCompleted?: (order: Order) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product: propProduct,
  onClose,
  onDirectBuy,
  onOpenCheckout,
  onOrderCompleted,
}) => {
  const {
    selectedProduct: storeProduct,
    setSelectedProduct,
    language,
    t,
    addToCart,
    showToast,
    createOrder,
  } = useStore();

  const product = propProduct || storeProduct;

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedStorage, setSelectedStorage] = useState<string>(
    product?.storage || '256GB'
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    product?.color || ''
  );
  const [selectedWilayaCode, setSelectedWilayaCode] = useState<number>(39); // 39 El Oued by default
  const [deliveryType, setDeliveryType] = useState<'store_pickup' | 'home' | 'desk'>('store_pickup');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [showQuickOrderForm, setShowQuickOrderForm] = useState(false);

  // If storage options exist, compute active price based on selected storage
  const activePrice = useMemo(() => {
    if (!product) return 0;
    if (product.storageOptions && product.storageOptions.length > 0) {
      const match = product.storageOptions.find((opt) => opt.size === selectedStorage);
      if (match) return match.price;
    }
    return product.price;
  }, [product, selectedStorage]);

  const activeOriginalPrice = useMemo(() => {
    if (!product) return undefined;
    if (product.storageOptions && product.storageOptions.length > 0) {
      const match = product.storageOptions.find((opt) => opt.size === selectedStorage);
      if (match?.originalPrice) return match.originalPrice;
    }
    return product.originalPrice;
  }, [product, selectedStorage]);

  if (!product) return null;

  const currentWilaya = ALGERIA_WILAYAS.find((w) => w.code === selectedWilayaCode) || ALGERIA_WILAYAS[0];
  const hasDiscount = Boolean(activeOriginalPrice && activeOriginalPrice > activePrice);
  const discountPercent = hasDiscount
    ? Math.round(((activeOriginalPrice! - activePrice) / activeOriginalPrice!) * 100)
    : 0;

  const handleClose = () => {
    if (onClose) onClose();
    else setSelectedProduct(null);
  };

  const handleDirectOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    if (!customerName.trim() || !phone.trim()) {
      showToast(
        language === 'ar' ? 'يرجى إدخال الاسم ورقم الهاتف لإتمام الطلب' : 'Veuillez saisir votre nom et téléphone',
        'error'
      );
      return;
    }

    setIsSubmittingOrder(true);
    const isStorePickup = deliveryType === 'store_pickup';
    const shippingFee = isStorePickup
      ? 0
      : deliveryType === 'home'
      ? currentWilaya.homeDeliveryCost
      : currentWilaya.deskDeliveryCost;
    const finalTotal = activePrice + shippingFee;

    const newOrder = createOrder({
      customerName: customerName.trim(),
      phone: phone.trim(),
      wilayaCode: isStorePickup ? 39 : currentWilaya.code,
      wilayaName: isStorePickup
        ? (language === 'ar' ? 'الوادي (محل حمتين تيليكوم 4)' : 'El Oued (Hamtine Telecom 4)')
        : (language === 'ar' ? currentWilaya.nameAr : currentWilaya.nameFr),
      commune: isStorePickup
        ? (language === 'ar' ? 'مفترق طرق الملاح' : "Carrefour M'lah")
        : currentWilaya.nameAr,
      deliveryType,
      address: isStorePickup
        ? (language === 'ar' ? 'استلام ودفع مباشر داخل المحل (الوادي)' : 'Retrait direct au magasin')
        : (language === 'ar' ? 'توصيل للعنوان' : 'Livraison à domicile'),
      paymentMethod: isStorePickup ? 'store_payment' : 'cod',
      items: [
        {
          productId: product.id,
          productName: product.name,
          productImage: product.images[0] || product.image,
          quantity: 1,
          unitPrice: activePrice,
          selectedStorage,
          selectedColor,
        },
      ],
      subtotal: activePrice,
      discountAmount: 0,
      shippingFee,
      total: finalTotal,
      notes: `طلب سريع (${selectedStorage || ''} ${selectedColor || ''})`,
    });

    setIsSubmittingOrder(false);
    showToast(
      isStorePickup
        ? (language === 'ar' ? 'تم تسجيل طلبك بنجاح! تفضل بالزيارة للاستلام' : 'Réservation confirmée au magasin!')
        : (language === 'ar' ? 'تم تسجيل طلبك بنجاح! سنتصل بك فوراً لتأكيد الإرسال' : 'Commande confirmée avec succès!'),
      'success'
    );

    handleClose();
    if (onOrderCompleted) {
      onOrderCompleted(newOrder);
    }
  };

  const handleBuyNowClick = () => {
    if (onDirectBuy) {
      handleClose();
      onDirectBuy(product);
    } else {
      setShowQuickOrderForm(true);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, 1, 'full', undefined, selectedColor, selectedStorage);
    showToast(
      language === 'ar' ? 'تمت إضافة الهاتف إلى السلة بنجاح' : 'Produit ajouté au panier',
      'success'
    );
  };

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      language === 'ar'
        ? `السلام عليكم حمتين تيليكوم 4، أود الاستفسار عن توفر وطلب هاتف ${product.name} بسعر ${activePrice.toLocaleString()} د.ج.`
        : `Bonjour Hamtine Telecom 4, je souhaite commander ${product.name} à ${activePrice.toLocaleString()} DZD.`
    );
    window.open(`https://wa.me/213699269292?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-extrabold text-slate-800 uppercase px-2 py-0.5 rounded bg-slate-200 text-[11px]">
              {product.brand}
            </span>
            <span className="text-slate-500 font-medium">
              {product.condition === 'brand-new'
                ? (language === 'ar' ? 'هاتف أصلي جديد' : 'Neuf')
                : (language === 'ar' ? `مستعمل مضمون ${product.batteryHealth ? `(${product.batteryHealth}% بطارية)` : ''}` : 'Occasion')}
            </span>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center transition cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Main Info Row: Image + Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
            {/* Gallery Image */}
            <div className="space-y-3">
              <div className="aspect-square rounded-2xl bg-slate-50 border border-slate-100 p-4 flex items-center justify-center overflow-hidden">
                <img
                  src={product.images[activeImageIdx] || product.images[0] || '/hamtine-logo.svg'}
                  alt={product.name}
                  className="w-full h-full object-contain mix-blend-multiply"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Thumbnails if multiple images exist */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-12 h-12 rounded-lg border p-1 bg-slate-50 shrink-0 transition cursor-pointer ${
                        activeImageIdx === idx ? 'border-slate-900 ring-1 ring-slate-900' : 'border-slate-200'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Essentials */}
            <div className="space-y-3.5">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                  {product.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {product.model} • {language === 'ar' ? 'ضمان رسمي' : 'Garantie'} {product.warrantyMonths} {language === 'ar' ? 'أشهر' : 'mois'}
                </p>
              </div>

              {/* Price & Savings */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">
                    {activePrice.toLocaleString()}
                    <span className="text-xs font-bold text-slate-500 mr-1">د.ج</span>
                  </span>
                  {hasDiscount && (
                    <span className="text-xs text-slate-400 line-through">
                      {activeOriginalPrice?.toLocaleString()} د.ج
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-xs font-black border border-rose-200">
                      -{discountPercent}%
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'ar' ? 'متوفر فوراً بالوادي • دفع عند الاستلام' : 'En stock • Paiement à la livraison'}</span>
                </div>
              </div>

              {/* Storage selection if available */}
              {product.storageOptions && product.storageOptions.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    {language === 'ar' ? 'سعة التخزين:' : 'Stockage :'}
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {product.storageOptions.map((opt) => (
                      <button
                        key={opt.size}
                        onClick={() => setSelectedStorage(opt.size)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                          selectedStorage === opt.size
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {opt.size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color options if available */}
              {product.colorOptions && product.colorOptions.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    {language === 'ar' ? 'اللون:' : 'Couleur :'}
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {product.colorOptions.map((col) => (
                      <button
                        key={col.name}
                        onClick={() => setSelectedColor(col.name)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition cursor-pointer ${
                          selectedColor === col.name
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: col.hex }} />
                        <span>{col.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Specs Overview */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'ar' ? 'أهم المواصفات:' : 'Spécifications clés :'}
                </h4>
                <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-600">
                  <div className="bg-slate-50 px-2 py-1.5 rounded-md border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">{language === 'ar' ? 'الشاشة' : 'Écran'}</span>
                    <span className="font-semibold text-slate-800 text-[11px]">{product.quickSpecs?.screen || product.specs?.['الشاشة'] || 'OLED'}</span>
                  </div>
                  <div className="bg-slate-50 px-2 py-1.5 rounded-md border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">{language === 'ar' ? 'المعالج' : 'Processeur'}</span>
                    <span className="font-semibold text-slate-800 text-[11px]">{product.quickSpecs?.processor || product.specs?.['المعالج'] || 'Octa-Core'}</span>
                  </div>
                  <div className="bg-slate-50 px-2 py-1.5 rounded-md border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">{language === 'ar' ? 'الكاميرا' : 'Caméra'}</span>
                    <span className="font-semibold text-slate-800 text-[11px]">{product.quickSpecs?.camera || product.specs?.['الكاميرا الرئيسية'] || 'Pro Camera'}</span>
                  </div>
                  <div className="bg-slate-50 px-2 py-1.5 rounded-md border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">{language === 'ar' ? 'البطارية' : 'Batterie'}</span>
                    <span className="font-semibold text-slate-800 text-[11px]">{product.quickSpecs?.battery || product.specs?.['البطارية'] || 'Fast Charging'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Order Inline Accordion or Buttons */}
          {showQuickOrderForm ? (
            <form onSubmit={handleDirectOrderSubmit} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                  <Zap className="w-4 h-4 text-emerald-600 fill-current" />
                  <span>{language === 'ar' ? 'إتمام الطلب السريع (الدفع عند الاستلام)' : 'Commande Rapide (Paiement à la livraison)'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQuickOrderForm(false)}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  {language === 'ar' ? 'رجوع' : 'Retour'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'الاسم الكامل *' : 'Nom complet *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: محمد العمري' : 'Ex: Mohamed'}
                    className="w-full bg-white border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'رقم الهاتف *' : 'N° Téléphone *'}
                  </label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="06 / 07 / 05..."
                    className="w-full bg-white border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'طريقة الاستلام' : 'Mode de livraison'}
                  </label>
                  <select
                    value={deliveryType}
                    onChange={(e) => setDeliveryType(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-900 focus:outline-none"
                  >
                    <option value="store_pickup">
                      {language === 'ar' ? 'استلام من المحل بالوادي (مجاناً)' : 'Retrait au magasin (Gratuit)'}
                    </option>
                    <option value="home">
                      {language === 'ar' ? 'توصيل للمنزل لـ 58 ولاية' : 'Livraison à domicile'}
                    </option>
                    <option value="desk">
                      {language === 'ar' ? 'استلام من مكتب التوصيل (Yalidine/ZR)' : 'Stop desk (Yalidine/ZR)'}
                    </option>
                  </select>
                </div>

                {deliveryType !== 'store_pickup' && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      {language === 'ar' ? 'الولاية' : 'Wilaya'}
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
                )}
              </div>

              <div className="pt-2 flex items-center justify-between text-xs font-bold text-slate-800 border-t border-slate-200">
                <span>{language === 'ar' ? 'المجموع النهائي مع التوصيل:' : 'Total à payer :'}</span>
                <span className="text-base text-slate-900 font-black">
                  {(activePrice + (deliveryType === 'store_pickup' ? 0 : (deliveryType === 'home' ? currentWilaya.homeDeliveryCost : currentWilaya.deskDeliveryCost))).toLocaleString()} د.ج
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmittingOrder}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>
                  {isSubmittingOrder
                    ? (language === 'ar' ? 'جار التأكيد...' : 'Confirmation...')
                    : (language === 'ar' ? 'تأكيد الطلب الآن (الدفع عند الاستلام)' : 'Confirmer la commande')}
                </span>
              </button>
            </form>
          ) : (
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={handleBuyNowClick}
                  className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                >
                  <Zap className="w-4 h-4 text-amber-400 fill-current" />
                  <span>{language === 'ar' ? 'اطلب الآن (الدفع عند الاستلام)' : 'Commander maintenant'}</span>
                </button>

                <button
                  onClick={handleAddToCart}
                  className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-slate-700" />
                  <span>{language === 'ar' ? 'إضافة إلى السلة' : 'Ajouter au panier'}</span>
                </button>
              </div>

              <button
                onClick={handleWhatsAppContact}
                className="w-full py-2 px-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-current text-emerald-600" />
                <span>{language === 'ar' ? 'استفسار أو طلب عبر واتساب مباشرة' : 'Commander via WhatsApp'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
