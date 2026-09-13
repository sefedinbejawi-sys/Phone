import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductCategory } from '../../types';
import { ProductCompareModal } from './ProductCompareModal';
import {
  Search,
  Zap,
  ShoppingBag,
  Scale,
  Eye,
  Check,
  Sparkles,
  ShieldCheck,
  Truck,
  X,
  CreditCard,
  SlidersHorizontal,
} from 'lucide-react';

interface ProductGridProps {
  onOpenProductModal: (product: Product) => void;
  onFastCheckout: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  onOpenProductModal,
  onFastCheckout,
}) => {
  const {
    products,
    addToCart,
    language,
    t,
    showToast,
  } = useStore();

  // Product comparison state
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const toggleCompare = (id: string) => {
    setCompareIds((prev = []) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 4) {
        showToast(
          language === 'ar'
            ? 'يمكنك مقارنة حتى 4 هواتف كحد أقصى'
            : 'Vous pouvez comparer jusqu\'à 4 smartphones',
          'warning'
        );
        return prev;
      }
      showToast(
        language === 'ar' ? 'تمت إضافة الهاتف للمقارنة' : 'Ajouté à la comparaison',
        'info'
      );
      return [...prev, id];
    });
  };

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [onlyDiscounts, setOnlyDiscounts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'rating'>('popular');

  // Available brands
  const brands = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.brand))).filter(Boolean);
    return ['all', ...list];
  }, [products]);

  // Main Filter Logic
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      // Brand filter
      if (selectedBrand !== 'all' && p.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
        return false;
      }

      // Discount filter
      if (onlyDiscounts && !p.originalPrice) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName =
          Boolean(p.name && p.name.toLowerCase().includes(q)) ||
          Boolean(p.nameFr && p.nameFr.toLowerCase().includes(q));
        const matchesModel = Boolean(p.model && p.model.toLowerCase().includes(q));
        const matchesBrand = Boolean(p.brand && p.brand.toLowerCase().includes(q));
        if (!matchesName && !matchesModel && !matchesBrand) return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [
    products,
    selectedCategory,
    selectedBrand,
    onlyDiscounts,
    searchQuery,
    sortBy,
  ]);

  const comparedProducts = useMemo(() => {
    return products.filter((p) => (compareIds || []).includes(p.id));
  }, [products, compareIds]);

  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Category Navigation Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        {/* Main Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => {
              setSelectedCategory('all');
              setOnlyDiscounts(false);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === 'all' && !onlyDiscounts
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {language === 'ar' ? 'جميع المنتجات' : 'Tous les produits'}
          </button>

          <button
            onClick={() => {
              setSelectedCategory('new-phone');
              setOnlyDiscounts(false);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === 'new-phone' && !onlyDiscounts
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {language === 'ar' ? '📱 هواتف جديدة' : '📱 Neufs'}
          </button>

          <button
            onClick={() => {
              setSelectedCategory('used-phone');
              setOnlyDiscounts(false);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === 'used-phone' && !onlyDiscounts
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {language === 'ar' ? '✨ هواتف مستعملة ومضمونة' : '✨ Occasion Garantie'}
          </button>

          <button
            onClick={() => {
              setSelectedCategory('accessory');
              setOnlyDiscounts(false);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === 'accessory' && !onlyDiscounts
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {language === 'ar' ? '🎧 إكسسوارات وسماعات' : '🎧 Accessoires'}
          </button>

          <button
            onClick={() => setOnlyDiscounts(!onlyDiscounts)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
              onlyDiscounts
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}
          >
            {language === 'ar' ? '🏷️ التخفيضات والعروض' : '🏷️ Promotions'}
          </button>
        </div>

        {/* Secondary Brand Bar & Quick Search Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Brand Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-slate-400 shrink-0 ml-1">
              {language === 'ar' ? 'الماركة:' : 'Marque :'}
            </span>
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedBrand === brand
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {brand === 'all' ? (language === 'ar' ? 'الكل' : 'Tous') : brand}
              </button>
            ))}
          </div>

          {/* Search and Sort */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-48">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'ar' ? 'تصفية المنتجات...' : 'Filtrer...'}
                className="w-full bg-slate-50 text-slate-800 text-xs rounded-lg pl-7 pr-2.5 py-1.5 border border-slate-200 focus:outline-none focus:border-slate-400"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 text-slate-700 text-xs rounded-lg px-2 py-1.5 border border-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="popular">{language === 'ar' ? 'الأكثر طلباً' : 'Populaire'}</option>
              <option value="price-asc">{language === 'ar' ? 'السعر: الأقل أولاً' : 'Prix croissant'}</option>
              <option value="price-desc">{language === 'ar' ? 'السعر: الأعلى أولاً' : 'Prix décroissant'}</option>
              <option value="rating">{language === 'ar' ? 'التقييم' : 'Note'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Catalog Result Summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          {language === 'ar'
            ? `عرض ${filteredProducts.length} منتج متوفر`
            : `${filteredProducts.length} produits disponibles`}
        </span>
        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
          <Truck className="w-3.5 h-3.5" />
          <span>{language === 'ar' ? 'توصيل متاح لـ 58 ولاية' : 'Livraison 58 wilayas'}</span>
        </span>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">
            {language === 'ar' ? 'لم يتم العثور على نتائج' : 'Aucun produit trouvé'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {language === 'ar'
              ? 'جرّب تغيير كلمات البحث أو اختر تصنيفاً آخر لمشاهدة الهواتف المتوفرة.'
              : 'Essayez un autre mot-clé ou modifiez les filtres de recherche.'}
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedBrand('all');
              setOnlyDiscounts(false);
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold transition hover:bg-slate-800 cursor-pointer"
          >
            {language === 'ar' ? 'عرض جميع الهواتف' : 'Afficher tout'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredProducts.map((product) => {
            const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
            const discountPercent = hasDiscount
              ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
              : 0;
            const isCompared = (compareIds || []).includes(product.id);

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition-all duration-200 p-4 flex flex-col justify-between group relative"
              >
                {/* Product Image & Badges */}
                <div className="relative">
                  {/* Badges container */}
                  <div className="absolute top-2 right-2 left-2 flex items-start justify-between pointer-events-none z-10">
                    <div className="flex flex-col gap-1 pointer-events-auto">
                      {product.condition === 'brand-new' ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-extrabold border border-emerald-200">
                          {language === 'ar' ? 'جديد أصلي' : 'Neuf'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-extrabold border border-amber-200">
                          {language === 'ar'
                            ? `مستعمل ${product.batteryHealth ? `(${product.batteryHealth}% بطارية)` : ''}`
                            : `Occasion ${product.batteryHealth ? `(${product.batteryHealth}%)` : ''}`}
                        </span>
                      )}

                      {product.allowInstallment && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 text-[10px] font-extrabold border border-purple-200">
                          {language === 'ar' ? 'تقسيط متاح' : 'Facilité'}
                        </span>
                      )}
                    </div>

                    {hasDiscount && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[11px] font-black border border-rose-200">
                        -{discountPercent}%
                      </span>
                    )}
                  </div>

                  {/* Image wrapper */}
                  <div
                    onClick={() => onOpenProductModal(product)}
                    className="w-full aspect-[4/3] rounded-xl bg-slate-50 flex items-center justify-center p-3 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={product.images[0] || '/hamtine-logo.svg'}
                      alt={product.name}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* Product Information */}
                <div className="mt-3 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                      <span>{product.brand}</span>
                      <span className="text-slate-500 font-medium lowercase">
                        {product.storage || '128GB'} {product.ram ? `• ${product.ram}` : ''}
                      </span>
                    </div>

                    <h3
                      onClick={() => onOpenProductModal(product)}
                      className="font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-emerald-700 transition cursor-pointer line-clamp-1"
                      title={product.name}
                    >
                      {product.name}
                    </h3>

                    {/* Key Specs Pills */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-[11px] text-slate-500">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                        🛡️ {product.warrantyMonths} {language === 'ar' ? 'أشهر ضمان' : 'mois'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                        ⚡ {language === 'ar' ? 'فحص قبل الدفع' : 'Test inclus'}
                      </span>
                    </div>
                  </div>

                  {/* Pricing and Stock Status */}
                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                        {product.price.toLocaleString()}
                        <span className="text-xs font-bold text-slate-500 mr-1">د.ج</span>
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-slate-400 line-through">
                          {product.originalPrice?.toLocaleString()} د.ج
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{language === 'ar' ? 'متوفر فوراً بالوادي' : 'En stock'}</span>
                      </span>
                      <span>{language === 'ar' ? 'توصيل 58 ولاية' : 'Livraison 58w'}</span>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="pt-2 space-y-1.5">
                    {/* Primary Order Now Button */}
                    <button
                      onClick={() => onFastCheckout(product)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current text-amber-400" />
                      <span>{language === 'ar' ? 'اطلب الآن (سريع)' : 'Commander maintenant'}</span>
                    </button>

                    {/* Secondary Actions: Add to Cart, Details, Compare */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => addToCart(product, 1, 'full')}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                        title="إضافة إلى السلة"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'السلة' : 'Panier'}</span>
                      </button>

                      <button
                        onClick={() => onOpenProductModal(product)}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                        title={language === 'ar' ? 'عرض التفاصيل' : 'Détails'}
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => toggleCompare(product.id)}
                        className={`p-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                          isCompared
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                        }`}
                        title="مقارنة"
                      >
                        <Scale className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Comparison Bar */}
      {compareIds && compareIds.length > 0 && (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-40 bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl border border-slate-800 flex items-center justify-between gap-3 max-w-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800 text-emerald-400">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs block text-white">
                {language === 'ar'
                  ? `مقارنة ${compareIds.length} هواتف`
                  : `Comparer ${compareIds.length} smartphones`}
              </span>
              <span className="text-[10px] text-slate-400">
                {language === 'ar' ? 'المواصفات والأسعار جنباً لجنب' : 'Spécifications et prix'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer"
            >
              {language === 'ar' ? 'عرض الجدول' : 'Comparer'}
            </button>
            <button
              onClick={() => setCompareIds([])}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              title="إلغاء"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {isCompareModalOpen && (
        <ProductCompareModal
          products={comparedProducts}
          onRemoveProduct={(id) => {
            setCompareIds((prev = []) => prev.filter((cid) => cid !== id));
            if ((compareIds || []).length <= 1) setIsCompareModalOpen(false);
          }}
          onClearAll={() => {
            setCompareIds([]);
            setIsCompareModalOpen(false);
          }}
          onClose={() => setIsCompareModalOpen(false)}
          onSelectProduct={(p) => {
            setIsCompareModalOpen(false);
            onOpenProductModal(p);
          }}
          onFastBuy={(p) => {
            setIsCompareModalOpen(false);
            onFastCheckout(p);
          }}
        />
      )}
    </div>
  );
};
