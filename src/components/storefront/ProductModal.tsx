import React, { useState, useMemo } from 'react';
import { Product, Order } from '../../types';
import { useStore } from '../../context/StoreContext';
import { ALGERIA_WILAYAS } from '../../data/wilayas';
import {
  X,
  ShieldCheck,
  BatteryCharging,
  Truck,
  CheckCircle2,
  Star,
  ShoppingBag,
  Zap,
  Percent,
  Smartphone,
  Cpu,
  HardDrive,
  Camera,
  Battery,
  Wifi,
  Package,
  Clock,
  Sparkles,
  Share2,
  Check,
  User,
  Phone,
  MapPin,
  Banknote,
  Store,
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
    reviews,
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
  const [selectedWilayaCode, setSelectedWilayaCode] = useState<number>(16); // Alger default
  const [activeTab, setActiveTab] = useState<'specs' | 'features' | 'reviews'>('specs');

  // Customer information form state directly on phone view
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneSecondary, setPhoneSecondary] = useState('');
  const [commune, setCommune] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryType, setDeliveryType] = useState<'store_pickup' | 'home' | 'desk'>('store_pickup');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [showOrderSection, setShowOrderSection] = useState(true);

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

  const productReviews = reviews.filter((r) => r.productId === product.id);

  // Selected wilaya for shipping estimation
  const currentWilaya = ALGERIA_WILAYAS.find((w) => w.code === selectedWilayaCode) || ALGERIA_WILAYAS[0];

  const savingsAmount = activeOriginalPrice ? activeOriginalPrice - activePrice : 0;
  const discountPercent = activeOriginalPrice
    ? Math.round((savingsAmount / activeOriginalPrice) * 100)
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
        language === 'ar' ? 'يرجى إدخال الاسم ورقم الهاتف لتأكيد الحجز' : 'Veuillez saisir votre nom et téléphone',
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
      phoneSecondary: phoneSecondary.trim() || undefined,
      wilayaCode: isStorePickup ? 39 : currentWilaya.code,
      wilayaName: isStorePickup
        ? (language === 'ar' ? 'الوادي (محل حمتين تيليكوم 4)' : 'El Oued (Hamtine Telecom 4)')
        : (language === 'ar' ? currentWilaya.nameAr : currentWilaya.nameFr),
      commune: isStorePickup
        ? (language === 'ar' ? 'مفترق طرق الملاح' : "Carrefour M'lah")
        : (commune.trim() || currentWilaya.nameAr),
      deliveryType,
      address: isStorePickup
        ? (language === 'ar' ? 'استلام ودفع مباشر داخل المحل (حمتين تيليكوم 4 - مفترق طرق الملاح)' : 'Retrait et paiement direct en magasin (Hamtine Telecom 4)')
        : (address.trim() || (language === 'ar' ? 'العنوان غير محدد' : 'Adresse non spécifiée')),
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
      notes: isStorePickup
        ? `طلب حجز واستلام ودفع مباشر في المحل (${selectedStorage} - ${selectedColor})`
        : `طلب فوري مع التوصيل (${selectedStorage} - ${selectedColor})`,
    });

    setIsSubmittingOrder(false);
    showToast(
      isStorePickup
        ? (language === 'ar' ? 'تم حجز الهاتف بنجاح! تفضل بزيارتنا في المحل للاستلام والدفع' : 'Réservation confirmée pour retrait et paiement au magasin!')
        : (language === 'ar' ? 'تم تسجيل طلبك بنجاح! سنتصل بك فوراً للتأكيد' : 'Commande confirmée avec succès!'),
      'success'
    );

    handleClose();
    if (onOrderCompleted) {
      onOrderCompleted(newOrder);
    }
  };

  const handleBuyFull = () => {
    if (onDirectBuy) {
      onDirectBuy(product);
    } else if (onOpenCheckout) {
      handleClose();
      onOpenCheckout('full');
    }
  };

  const handleAddToCart = () => {
    addToCart(product, 1, 'full', undefined, selectedColor, selectedStorage);
    showToast(
      language === 'ar' ? 'تمت إضافة المنتج إلى سلة التسوق بنجاح!' : 'Produit ajouté au panier avec succès!',
      'success'
    );
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast(
        language === 'ar' ? 'تم نسخ رابط الهاتف للمشاركة بنجاح!' : 'Lien copié dans le presse-papiers!',
        'info'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-xl flex justify-center items-start p-0 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl rounded-none sm:rounded-[2.5rem] bg-[#0c0e15] border-0 sm:border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.85)] overflow-hidden my-0 sm:my-6 min-h-screen sm:min-h-0 flex flex-col text-neutral-200">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#08090d]/90 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-extrabold text-emerald-300 uppercase bg-emerald-400/10 border border-emerald-400/20 px-3 py-0.5 rounded-full text-[11px]">
              {product.brand}
            </span>
            <span className="text-neutral-600">•</span>
            <span className="text-neutral-400 font-medium">
              {product.category === 'new-phone'
                ? language === 'ar' ? 'هاتف ذكي جديد رسمي' : 'Smartphone Neuf'
                : product.category === 'used-phone'
                ? language === 'ar' ? 'مستعمل معتمد ومفحوص Grade A+' : 'Occasion Certifiée'
                : language === 'ar' ? 'ملحق أصلي' : 'Accessoire Original'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.09] text-neutral-300 hover:text-white transition cursor-pointer"
              title={language === 'ar' ? 'مشاركة رابط الهاتف' : 'Partager'}
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleClose}
              className="w-9 h-9 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.09] text-neutral-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto p-5 sm:p-7 md:p-8 space-y-8">
          {/* Main Hero: Gallery + Purchasing Decision Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Gallery Column (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Big Main Image Stage */}
              <div className="relative aspect-square rounded-3xl bg-[#08090d] overflow-hidden border border-white/10 flex items-center justify-center p-8 group">
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
                <img
                  src={product.images[activeImageIdx] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500 drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
                  referrerPolicy="no-referrer"
                />

                {/* Floating Badges */}
                <div className="absolute top-3.5 right-3.5 flex flex-col gap-1.5 items-end z-10">
                  {product.category === 'new-phone' && (
                    <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-400 text-[#08090d] shadow-[0_2px_10px_rgba(52,211,153,0.3)] flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{language === 'ar' ? 'جديد 100%' : 'Neuf 100%'}</span>
                    </span>
                  )}
                  {product.category === 'used-phone' && (
                    <span className="px-3 py-1 rounded-full text-[11px] font-black bg-amber-400 text-[#08090d] shadow-[0_2px_10px_rgba(251,191,36,0.3)]">
                      {language === 'ar' ? 'مستعمل Grade A+' : 'Occasion Grade A+'}
                    </span>
                  )}
                  {product.batteryHealth && (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-black/70 text-emerald-300 border border-emerald-400/30 backdrop-blur-xl shadow-xs">
                      <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{product.batteryHealth}%</span>
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="px-3 py-1 rounded-full text-[11px] font-black bg-rose-500 text-white shadow-xs">
                      -{discountPercent}%
                    </span>
                  )}
                </div>

                {/* Stock notice badge */}
                <div className="absolute bottom-3.5 left-3.5 bg-black/70 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-xl text-[11px] font-bold text-neutral-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>
                    {language === 'ar'
                      ? `متوفر (${product.stock} قطع)`
                      : `En stock (${product.stock} dispo)`}
                  </span>
                </div>
              </div>

              {/* Thumbnails row */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition cursor-pointer shrink-0 bg-[#08090d] p-1.5 ${
                        activeImageIdx === idx
                          ? 'border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                          : 'border-white/10 opacity-50 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt="thumbnail"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Algerian Trust Guarantees */}
              <div className="rounded-2xl p-4 border border-white/10 bg-white/[0.03] space-y-2.5 text-xs text-neutral-300 backdrop-blur-md">
                <div className="flex items-center gap-2.5 text-emerald-300 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {language === 'ar'
                      ? `ضمان محل حقيقي وموثق لمدة ${product.warrantyMonths} ${t.months}`
                      : `Garantie magasin officielle de ${product.warrantyMonths} ${t.months}`}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-neutral-300">
                  <Truck className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>
                    {language === 'ar'
                      ? 'توصيل سريع لـ 58 ولاية مع فحص وتشغيل الهاتف قبل الدفع'
                      : 'Livraison 58 wilayas avec test de l\'appareil avant paiement'}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-neutral-300">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    {language === 'ar'
                      ? 'خدمة ما بعد البيع ودعم فني جزائري متخصص 6 أيام في الأسبوع'
                      : 'Support technique et SAV local 6j/7'}
                  </span>
                </div>
              </div>
            </div>

            {/* Product Info & Pricing Decision Column (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                {/* Title & Ratings */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{product.rating}</span>
                      <span className="text-neutral-400 font-normal">
                        ({product.reviewCount} {language === 'ar' ? 'تقييم زبون جزائري' : 'avis clients'})
                      </span>
                    </div>

                    {product.tags && product.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {product.tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-0.5 rounded-full border border-white/10 bg-white/[0.04] text-neutral-300 text-[10px] font-semibold"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight">
                    {language === 'ar' ? product.name : product.nameFr || product.name}
                  </h1>
                </div>

                {/* Price Display Card (Showly Luxury Glass Card) */}
                <div className="rounded-3xl p-5 border border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 via-white/[0.02] to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                      {language === 'ar' ? 'السعر النهائي للتسليم:' : 'Prix final TTC:'}
                    </span>
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                        {activePrice.toLocaleString()}{' '}
                        <span className="text-emerald-400 text-base sm:text-lg font-bold">{t.currency}</span>
                      </span>
                      {activeOriginalPrice && (
                        <span className="text-sm sm:text-base text-neutral-500 line-through">
                          {activeOriginalPrice.toLocaleString()} {t.currency}
                        </span>
                      )}
                    </div>

                    {savingsAmount > 0 && (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-bold">
                          {language === 'ar'
                            ? `وفر ${savingsAmount.toLocaleString()} ${t.currency} (${discountPercent}% تخفيض)`
                            : `Économisez ${savingsAmount.toLocaleString()} ${t.currency}`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* COD Tag */}
                  <div className="rounded-2xl p-3.5 border border-emerald-400/30 bg-black/40 shadow-xs flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-400 text-[#08090d]">
                      <Zap className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-white block">
                        {language === 'ar' ? 'الدفع عند الاستلام' : 'Paiement à la livraison'}
                      </span>
                      <span className="text-[11px] text-neutral-400 block">
                        {language === 'ar' ? 'افحص وشغّل هاتفك قبل الدفع' : 'Payez après avoir testé'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Storage Capacity Selector */}
                {product.storageOptions && product.storageOptions.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-neutral-300">
                        {language === 'ar' ? 'اختر سعة التخزين:' : 'Capacité de stockage:'}
                      </span>
                      <span className="text-emerald-400 font-bold">{selectedStorage}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {product.storageOptions.map((opt) => (
                        <button
                          key={opt.size}
                          onClick={() => setSelectedStorage(opt.size)}
                          className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                            selectedStorage === opt.size
                              ? 'border-emerald-400 bg-emerald-400/15 text-emerald-300 font-black ring-1 ring-emerald-400/40 shadow-[0_0_15px_rgba(52,211,153,0.15)]'
                              : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-neutral-300'
                          }`}
                        >
                          <span className="text-xs font-extrabold">{opt.size}</span>
                          <span className="text-[11px] text-emerald-400 font-bold mt-0.5">
                            {opt.price.toLocaleString()} {t.currency}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colors Selector */}
                {product.colorOptions && product.colorOptions.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-neutral-300">
                        {language === 'ar' ? 'اختر اللون:' : 'Couleur disponible:'}
                      </span>
                      <span className="text-emerald-400 font-bold">
                        {selectedColor || product.colorOptions[0].name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {product.colorOptions.map((c) => {
                        const isSelected = (selectedColor || product.colorOptions![0].name) === c.name;
                        return (
                          <button
                            key={c.name}
                            onClick={() => setSelectedColor(c.name)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition cursor-pointer text-xs ${
                              isSelected
                                ? 'border-emerald-400 bg-emerald-400/15 text-emerald-300 font-black ring-1 ring-emerald-400/40'
                                : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-neutral-300'
                            }`}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs shrink-0"
                              style={{ backgroundColor: c.hex }}
                            />
                            <span>{language === 'ar' ? c.name : c.nameFr || c.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Shipping Estimator to 58 Wilayas */}
                <div className="rounded-2xl p-4 border border-white/10 bg-white/[0.03] text-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-white">
                      <Truck className="w-4 h-4 text-emerald-400" />
                      <span>{language === 'ar' ? 'تكلفة ومدة التوصيل لولايتك:' : 'Livraison dans votre wilaya:'}</span>
                    </div>
                    <select
                      value={selectedWilayaCode}
                      onChange={(e) => setSelectedWilayaCode(Number(e.target.value))}
                      className="text-xs bg-[#0c0e15] border border-white/15 rounded-xl px-2.5 py-1.5 font-bold text-white focus:outline-none focus:border-emerald-400 cursor-pointer"
                    >
                      {ALGERIA_WILAYAS.map((w) => (
                        <option key={w.code} value={w.code} className="bg-[#0c0e15] text-white">
                          {String(w.code).padStart(2, '0')} - {language === 'ar' ? w.nameAr : w.nameFr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-white/10">
                    <div className="bg-white/[0.04] p-2.5 rounded-xl border border-white/5">
                      <span className="text-neutral-400 block">{language === 'ar' ? 'توصيل للمنزل:' : 'À domicile:'}</span>
                      <span className="font-bold text-white">
                        {currentWilaya.homeDeliveryCost.toLocaleString()} {t.currency} ({currentWilaya.estimatedDays})
                      </span>
                    </div>
                    <div className="bg-white/[0.04] p-2.5 rounded-xl border border-white/5">
                      <div className="flex items-center gap-1">
                        <span className="text-neutral-400">{language === 'ar' ? 'استلام من المكتب:' : 'Stop Desk:'}</span>
                        <span dir="ltr" className="text-[9px] px-1 py-0.5 rounded bg-white/10 text-neutral-300 font-mono">Stop Desk</span>
                      </div>
                      <span className="font-bold text-emerald-400 block mt-0.5">
                        {currentWilaya.deskDeliveryCost.toLocaleString()} {t.currency} ({currentWilaya.estimatedDays})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="space-y-2.5 pt-4 border-t border-white/10">
                {/* Dedicated In-Store Direct Payment Button */}
                <button
                  type="button"
                  onClick={() => {
                    setDeliveryType('store_pickup');
                    const formEl = document.getElementById('fast-order-form');
                    formEl?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full py-3.5 px-5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-[0_8px_25px_rgba(251,191,36,0.3)] transition cursor-pointer hover:scale-[1.01]"
                >
                  <Store className="w-5 h-5" />
                  <span>
                    {language === 'ar'
                      ? `🏪 حجز واستلام ودفع مباشر داخل المحل (0 دج مصاريف)`
                      : `Retrait & Paiement direct en Magasin (0 DA)`}
                  </span>
                </button>

                {/* Delivery Option Button */}
                <button
                  type="button"
                  onClick={() => {
                    setDeliveryType('home');
                    const formEl = document.getElementById('fast-order-form');
                    formEl?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full py-3 px-5 rounded-xl border border-emerald-400/40 bg-emerald-400/15 hover:bg-emerald-400/25 text-emerald-300 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  <span>
                    {language === 'ar'
                      ? `🚚 طلب مع التوصيل السريع لـ 58 ولاية (COD)`
                      : `Commander avec livraison 58 wilayas (COD)`}
                  </span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleAddToCart}
                    className="py-3 px-4 rounded-xl border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4 text-emerald-400" />
                    <span>{t.addToCart}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="py-3 px-4 rounded-xl border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-neutral-400" />
                    <span>{language === 'ar' ? 'مشاركة الهاتف' : 'Partager'}</span>
                  </button>
                </div>
              </div>

              {/* Direct Fast Order Form for Customer on Phone View */}
              <div className="mt-5 pt-4 border-t border-white/10" id="fast-order-form">
                <form
                  onSubmit={handleDirectOrderSubmit}
                  className="p-4 sm:p-5 rounded-2xl bg-[#121622] border-2 border-emerald-500/40 shadow-lg space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-emerald-400/20 text-emerald-400">
                        {deliveryType === 'store_pickup' ? <Store className="w-4 h-4 text-amber-400" /> : <User className="w-4 h-4" />}
                      </span>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-white">
                          {deliveryType === 'store_pickup'
                            ? (language === 'ar' ? 'حجز الهاتف للاستلام والدفع داخل المحل' : 'Réservation pour retrait & paiement direct au magasin')
                            : (language === 'ar' ? 'معلومات الزبون لطلب التوصيل' : 'Informations client pour livraison')}
                        </h4>
                        <p className="text-[11px] text-emerald-400">
                          {deliveryType === 'store_pickup'
                            ? (language === 'ar' ? 'أدخل اسمك ورقم هاتفك وسنقوم بحجز الهاتف لك فوراً' : 'Renseignez votre nom et téléphone pour bloquer l\'appareil')
                            : (language === 'ar' ? 'أدخل معلوماتك وسنتصل بك لتأكيد الشحن' : 'Renseignez vos coordonnées pour expédition')}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      deliveryType === 'store_pickup'
                        ? 'text-amber-300 bg-amber-400/15 border-amber-400/30'
                        : 'text-emerald-400 bg-emerald-400/15 border-emerald-400/30'
                    }`}>
                      {deliveryType === 'store_pickup'
                        ? (language === 'ar' ? 'دفع بالمحل (0 دج)' : 'Paiement au magasin')
                        : (language === 'ar' ? 'دفع عند الاستلام' : 'Paiement COD')}
                    </span>
                  </div>

                  {/* Mode Selector Tabs */}
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-900 rounded-xl border border-stone-800 text-[11px] sm:text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('store_pickup')}
                      className={`py-2 px-2 rounded-lg flex flex-col sm:flex-row items-center justify-center gap-1 transition ${
                        deliveryType === 'store_pickup'
                          ? 'bg-amber-400 text-slate-950 font-black shadow'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span className="truncate">{language === 'ar' ? 'بالمحل (0 دج)' : 'En Magasin'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryType('home')}
                      className={`py-2 px-2 rounded-lg flex flex-col sm:flex-row items-center justify-center gap-1 transition ${
                        deliveryType === 'home'
                          ? 'bg-emerald-400 text-slate-950 font-black shadow'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span className="truncate">{language === 'ar' ? 'لباب المنزل' : 'À Domicile'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryType('desk')}
                      className={`py-2 px-2 rounded-lg flex flex-col sm:flex-row items-center justify-center gap-1 transition ${
                        deliveryType === 'desk'
                          ? 'bg-emerald-400 text-slate-950 font-black shadow'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate">{language === 'ar' ? 'مكتب Stop Desk' : 'Stop Desk'}</span>
                    </button>
                  </div>

                  {/* In-Store Pickup Callout Banner */}
                  {deliveryType === 'store_pickup' && (
                    <div className="p-3.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-xs space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 text-amber-300 font-bold">
                          <Store className="w-4 h-4 shrink-0" />
                          <span>{language === 'ar' ? 'محل حمتين تيليكوم 4 (الوادي)' : 'Boutique Hamtine Telecom 4 (El Oued)'}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black">
                          0 دج توصيل
                        </span>
                      </div>
                      <p className="text-neutral-300 text-[11px] leading-relaxed">
                        📍 <strong>الموقع:</strong> ولاية الوادي - حي الاستقلال / مفترق طرق الملاح.
                        <br />
                        🔍 <strong>المعاينة:</strong> فحص وتشغيل الهاتف بحضور التقني، ونقل بياناتك مجاناً.
                        <br />
                        💵 <strong>طرق الدفع في المحل:</strong> نقداً أو عبر تطبيق بريدي موب (BaridiMob).
                      </p>
                      <a
                        href="https://share.google/ychE3nVODcxqlIGDt"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-300 hover:text-amber-200 underline pt-0.5"
                      >
                        <MapPin className="w-3 h-3" />
                        <span>{language === 'ar' ? 'عرض موقع المحل على خرائط Google Maps ↗' : 'Voir sur Google Maps ↗'}</span>
                      </a>
                    </div>
                  )}

                  <div className="space-y-3">
                    {/* Full Name */}
                    <div>
                      <label className="flex items-center justify-between text-xs font-bold text-white mb-1.5">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{t.fullName}</span>
                          <span className="text-rose-400 font-bold">*</span>
                        </span>
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder={language === 'ar' ? 'اكتب اسمك ولقبك هنا' : 'Nom & Prénom'}
                        className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-600 focus:border-emerald-400 bg-neutral-900 text-white placeholder:text-neutral-400 text-sm sm:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="flex items-center justify-between text-xs font-bold text-white mb-1.5">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{t.phoneNumber}</span>
                          <span className="text-rose-400 font-bold">*</span>
                        </span>
                        <span className="text-[10px] text-emerald-400">
                          {language === 'ar' ? 'موبيليس / جيزي / أوريدو' : 'Pour vous contacter'}
                        </span>
                      </label>
                      <div className="flex items-center rounded-xl border-2 border-stone-600 focus-within:border-emerald-400 bg-neutral-900 overflow-hidden">
                        <div className="px-2.5 py-2.5 bg-white/[0.08] text-emerald-400 text-xs font-bold font-mono">
                          +213
                        </div>
                        <input
                          type="tel"
                          required
                          dir="ltr"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="0550 12 34 56"
                          className="w-full px-3 py-2.5 bg-transparent text-white placeholder:text-neutral-400 text-sm sm:text-base font-bold font-mono focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Secondary Phone (Optional) */}
                    <div>
                      <label className="text-xs font-bold text-neutral-300 mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{language === 'ar' ? 'رقم هاتف ثانٍ (احتياطي)' : 'Numéro de téléphone secondaire'}</span>
                        </span>
                        <span className="text-[10px] text-neutral-400">{language === 'ar' ? 'اختياري' : 'Optionnel'}</span>
                      </label>
                      <input
                        type="tel"
                        dir="ltr"
                        value={phoneSecondary}
                        onChange={(e) => setPhoneSecondary(e.target.value)}
                        placeholder="0661 00 00 00"
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-700 bg-neutral-900 text-white placeholder:text-neutral-400 text-xs sm:text-sm font-mono focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    {/* Delivery Fields: Wilaya, Delivery, Address (Only for Home / Desk) */}
                    {deliveryType !== 'store_pickup' && (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="flex items-center gap-1 text-xs font-bold text-white mb-1">
                              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{t.selectWilaya}</span>
                            </label>
                            <select
                              value={selectedWilayaCode}
                              onChange={(e) => setSelectedWilayaCode(Number(e.target.value))}
                              className="w-full px-3 py-2.5 rounded-xl border-2 border-stone-600 focus:border-emerald-400 bg-neutral-900 text-white text-xs sm:text-sm font-semibold focus:outline-none"
                            >
                              {ALGERIA_WILAYAS.map((w) => (
                                <option key={w.code} value={w.code} className="bg-[#0c0e15] text-white">
                                  {String(w.code).padStart(2, '0')} - {language === 'ar' ? w.nameAr : w.nameFr}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="flex items-center gap-1 text-xs font-bold text-white mb-1">
                              <Truck className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{t.deliveryOptions}</span>
                            </label>
                            <select
                              value={deliveryType}
                              onChange={(e) => setDeliveryType(e.target.value as 'home' | 'desk')}
                              className="w-full px-3 py-2.5 rounded-xl border-2 border-stone-600 focus:border-emerald-400 bg-neutral-900 text-white text-xs sm:text-sm font-semibold focus:outline-none"
                            >
                              <option value="home" className="bg-[#0c0e15] text-white">
                                {language === 'ar' ? `توصيل منزلي (${currentWilaya.homeDeliveryCost} ${t.currency})` : `À domicile (${currentWilaya.homeDeliveryCost} ${t.currency})`}
                              </option>
                              <option value="desk" className="bg-[#0c0e15] text-white">
                                {language === 'ar' ? `مكتب ياليدين / ZR (${currentWilaya.deskDeliveryCost} ${t.currency})` : `Stop Desk (${currentWilaya.deskDeliveryCost} ${t.currency})`}
                              </option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="flex items-center gap-1 text-xs font-bold text-white mb-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{language === 'ar' ? 'البلدية والعنوان' : 'Commune & Adresse'}</span>
                            <span className="text-rose-400 font-bold">*</span>
                          </label>
                          <input
                            type="text"
                            required={deliveryType !== 'store_pickup'}
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder={language === 'ar' ? 'البلدية أو الحي أو اسم المكتب' : 'Commune ou quartier'}
                            className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-600 focus:border-emerald-400 bg-neutral-900 text-white placeholder:text-neutral-400 text-sm sm:text-base font-semibold focus:outline-none"
                          />
                        </div>
                      </>
                    )}

                    {/* Optional Note for In-Store Pickup */}
                    {deliveryType === 'store_pickup' && (
                      <div>
                        <label className="text-xs font-bold text-neutral-300 mb-1 flex items-center justify-between">
                          <span>{language === 'ar' ? 'ملاحظة أو موعد الحضور للمحل (اختياري)' : 'Heure de passage en magasin (optionnel)'}</span>
                          <span className="text-[10px] text-neutral-400">{language === 'ar' ? 'اختياري' : 'Optionnel'}</span>
                        </label>
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder={language === 'ar' ? 'مثلاً: سأحضر اليوم بعد العصر للمعاينة والاستلام' : 'Ex: Je passe aujourd\'hui après 16h'}
                          className="w-full px-3.5 py-2 rounded-xl border border-stone-700 bg-neutral-900 text-white placeholder:text-neutral-400 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    )}
                  </div>

                  {/* Submit Order Button */}
                  <button
                    type="submit"
                    disabled={isSubmittingOrder}
                    className={`w-full py-4 px-4 rounded-xl font-black text-sm sm:text-base flex items-center justify-center gap-2 transition cursor-pointer hover:scale-[1.01] ${
                      deliveryType === 'store_pickup'
                        ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-[0_4px_20px_rgba(251,191,36,0.35)]'
                        : 'bg-emerald-400 hover:bg-emerald-300 text-[#08090d] shadow-[0_4px_20px_rgba(52,211,153,0.35)]'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>
                      {deliveryType === 'store_pickup'
                        ? (language === 'ar'
                            ? `تأكيد حجز واستلام الهاتف من المحل (${activePrice.toLocaleString()} ${t.currency})`
                            : `Confirmer le retrait & paiement au magasin (${activePrice.toLocaleString()} ${t.currency})`)
                        : (language === 'ar'
                            ? `تأكيد طلب هذا الهاتف مع التوصيل (${(activePrice + (deliveryType === 'home' ? currentWilaya.homeDeliveryCost : currentWilaya.deskDeliveryCost)).toLocaleString()} ${t.currency})`
                            : `Confirmer ma commande (${(activePrice + (deliveryType === 'home' ? currentWilaya.homeDeliveryCost : currentWilaya.deskDeliveryCost)).toLocaleString()} ${t.currency})`)}
                    </span>
                  </button>

                  <p className="text-[11px] text-center text-neutral-300 font-medium">
                    {deliveryType === 'store_pickup'
                      ? (language === 'ar' ? '🏪 الدفع في المحل مباشرة نقداً أو ببريدي موب بعد فحص وتشغيل الهاتف' : 'Paiement direct en magasin après vérification')
                      : (language === 'ar' ? '🔒 الدفع نقداً عند الاستلام بعد فحص وتشغيل الهاتف أمام الموزع' : 'Paiement à la livraison après vérification du colis')}
                  </p>
                </form>
              </div>
            </div>
          </div>

          {/* Detailed Tabs: Specifications, Description & Reviews */}
          <div className="pt-6 border-t border-white/10">
            {/* Tabs Header */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
              <button
                onClick={() => setActiveTab('specs')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer flex items-center gap-2 ${
                  activeTab === 'specs'
                    ? 'bg-emerald-400 text-[#08090d]'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>{language === 'ar' ? 'المواصفات الفنية الكاملة' : 'Fiche Technique'}</span>
              </button>
              <button
                onClick={() => setActiveTab('features')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer flex items-center gap-2 ${
                  activeTab === 'features'
                    ? 'bg-emerald-400 text-[#08090d]'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{language === 'ar' ? 'الوصف ومحتويات العلبة' : 'Description & Coffret'}</span>
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer flex items-center gap-2 ${
                  activeTab === 'reviews'
                    ? 'bg-emerald-400 text-[#08090d]'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Star className="w-4 h-4" />
                <span>
                  {language === 'ar'
                    ? `آراء الزبائن (${productReviews.length})`
                    : `Avis clients (${productReviews.length})`}
                </span>
              </button>
            </div>

            {/* Tab 1: Detailed Specifications Table */}
            {activeTab === 'specs' && (
              <div className="py-6 space-y-6">
                {/* Highlights Bento */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/10 text-center">
                    <Smartphone className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                    <span className="text-[10px] text-neutral-400 block uppercase font-bold">
                      {language === 'ar' ? 'الشاشة' : 'Écran'}
                    </span>
                    <span className="font-extrabold text-xs text-white">
                      {product.quickSpecs?.screen || product.specs['الشاشة'] || 'OLED'}
                    </span>
                  </div>
                  <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/10 text-center">
                    <Cpu className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                    <span className="text-[10px] text-neutral-400 block uppercase font-bold">
                      {language === 'ar' ? 'المعالج' : 'Processeur'}
                    </span>
                    <span className="font-extrabold text-xs text-white line-clamp-1">
                      {product.quickSpecs?.processor || product.specs['المعالج'] || 'Snapdragon/Apple'}
                    </span>
                  </div>
                  <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/10 text-center">
                    <HardDrive className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                    <span className="text-[10px] text-neutral-400 block uppercase font-bold">
                      {language === 'ar' ? 'الذاكرة' : 'RAM / Stockage'}
                    </span>
                    <span className="font-extrabold text-xs text-white">
                      {selectedStorage} {product.ram ? `• ${product.ram}` : ''}
                    </span>
                  </div>
                  <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/10 text-center">
                    <Camera className="w-5 h-5 text-rose-400 mx-auto mb-1" />
                    <span className="text-[10px] text-neutral-400 block uppercase font-bold">
                      {language === 'ar' ? 'الكاميرا' : 'Capteur'}
                    </span>
                    <span className="font-extrabold text-xs text-white line-clamp-1">
                      {product.quickSpecs?.camera || product.specs['الكاميرا الخلفية'] || 'Pro Camera'}
                    </span>
                  </div>
                  <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/10 text-center">
                    <Battery className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                    <span className="text-[10px] text-neutral-400 block uppercase font-bold">
                      {language === 'ar' ? 'البطارية' : 'Batterie'}
                    </span>
                    <span className="font-extrabold text-xs text-white line-clamp-1">
                      {product.quickSpecs?.battery || product.specs['البطارية'] || 'Long Life'}
                    </span>
                  </div>
                  <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/10 text-center">
                    <Wifi className="w-5 h-5 text-sky-400 mx-auto mb-1" />
                    <span className="text-[10px] text-neutral-400 block uppercase font-bold">
                      {language === 'ar' ? 'الشبكة' : 'Réseau'}
                    </span>
                    <span className="font-extrabold text-xs text-white">
                      {product.quickSpecs?.network || '5G LTE'}
                    </span>
                  </div>
                </div>

                {/* Structured Tech Specs Table */}
                <div className="border border-white/10 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-xs sm:text-sm">
                    <tbody className="divide-y divide-white/10">
                      {Object.entries(product.specs).map(([key, val], idx) => (
                        <tr
                          key={key}
                          className={idx % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'}
                        >
                          <td className="py-3 px-4 font-bold text-neutral-300 w-1/3 sm:w-1/4 bg-white/[0.03]">
                            {key}
                          </td>
                          <td className="py-3 px-4 text-white font-medium leading-relaxed">
                            {val}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 2: Description & Box Contents */}
            {activeTab === 'features' && (
              <div className="py-6 space-y-6 text-xs sm:text-sm">
                <div className="space-y-3">
                  <h3 className="font-black text-white text-base">
                    {language === 'ar' ? 'حول هذا الهاتف الذكي:' : 'À propos de cet appareil:'}
                  </h3>
                  <p className="text-neutral-300 leading-relaxed text-sm">
                    {language === 'ar' ? product.description : product.descriptionFr || product.description}
                  </p>
                </div>

                {/* Box contents */}
                <div className="rounded-2xl p-5 border border-white/10 bg-white/[0.03] space-y-3">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <Package className="w-5 h-5 text-emerald-400" />
                    <span>{language === 'ar' ? 'محتويات العلبة الأصلية:' : 'Contenu de la boîte:'}</span>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-300 text-xs">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{product.name} (أصلي 100%)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{language === 'ar' ? 'كابل شحن سريع أصلي معتمد' : 'Câble de charge rapide officiel'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{language === 'ar' ? 'بطاقة الضمان المعتمدة والفاتورة' : 'Carte de garantie et facture'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{language === 'ar' ? 'إبرة إخراج بطاقة SIM ودليل المستخدم' : 'Outil d\'éjection SIM et notice'}</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Tab 3: Reviews */}
            {activeTab === 'reviews' && (
              <div className="py-6 space-y-4">
                {productReviews.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 text-xs">
                    {language === 'ar' ? 'لا توجد تقييمات سابقة بعد لهذا الموديل' : 'Aucun avis pour le moment'}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {productReviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="rounded-2xl p-4 border border-white/10 bg-white/[0.03] space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{rev.customerName}</span>
                          <span className="text-[10px] bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                            {rev.wilaya}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-400">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                          <span className="text-[10px] text-neutral-500 font-mono mr-2">
                            (طلب #{rev.orderNumber})
                          </span>
                        </div>
                        <p className="text-neutral-300 italic">"{rev.comment}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
