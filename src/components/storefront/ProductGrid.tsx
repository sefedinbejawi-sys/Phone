import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductCategory } from '../../types';
import { ProductCompareModal } from './ProductCompareModal';
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Sparkles,
  Zap,
  BatteryCharging,
  ShieldCheck,
  ShoppingBag,
  ArrowUpDown,
  Smartphone,
  Cpu,
  HardDrive,
  Camera,
  Battery,
  Wifi,
  Scale,
  Check,
  X,
  Star,
  ChevronDown,
} from 'lucide-react';

interface ProductGridProps {
  onSelectProduct?: (product: Product) => void;
  onOpenProductModal?: (product: Product) => void;
  onOpenFastCheckout?: (product: Product) => void;
  onFastCheckout?: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  onSelectProduct,
  onOpenProductModal,
  onOpenFastCheckout,
  onFastCheckout,
}) => {
  const { products, language, t, addToCart, showToast } = useStore();

  // Unified callback wrappers
  const handleProductSelect = (p: Product) => {
    if (onSelectProduct) onSelectProduct(p);
    else if (onOpenProductModal) onOpenProductModal(p);
  };

  const handleFastBuy = (p: Product) => {
    if (onOpenFastCheckout) onOpenFastCheckout(p);
    else if (onFastCheckout) onFastCheckout(p);
  };

  // View Mode: Grid vs List (Ubuy style)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedStorage, setSelectedStorage] = useState<string>('all');
  const [selectedRam, setSelectedRam] = useState<string>('all');
  const [onlyDiscounts, setOnlyDiscounts] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('popular');

  // Mobile filters collapsible drawer
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Compare products state (up to 3 products)
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  // Toggle compare
  const toggleCompare = (productId: string) => {
    if (compareIds.includes(productId)) {
      setCompareIds(compareIds.filter((id) => id !== productId));
    } else {
      if (compareIds.length >= 3) {
        showToast(
          language === 'ar'
            ? 'يمكنك مقارنة 3 هواتف كحد أقصى في وقت واحد'
            : 'Vous pouvez comparer 3 smartphones au maximum',
          'info'
        );
        return;
      }
      setCompareIds([...compareIds, productId]);
      showToast(
        language === 'ar' ? 'تمت إضافة الهاتف إلى جدول المقارنة' : 'Smartphone ajouté au comparateur',
        'success'
      );
    }
  };

  // Compare products list
  const comparedProducts = useMemo(() => {
    return products.filter((p) => compareIds.includes(p.id));
  }, [products, compareIds]);

  // Unique brands
  const brands = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.brand)));
    return ['all', ...list];
  }, [products]);

  // Storage choices
  const storages = ['all', '128GB', '256GB', '512GB', '1TB'];

  // Ram choices
  const ramOptions = ['all', '6GB', '8GB', '12GB', '16GB'];

  // Filtered and Sorted products
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      // Brand filter
      if (selectedBrand !== 'all' && p.brand !== selectedBrand) {
        return false;
      }

      // Storage filter
      if (selectedStorage !== 'all') {
        const hasStorage = p.storage === selectedStorage || p.storageOptions?.some(s => s.size === selectedStorage);
        if (!hasStorage) return false;
      }

      // RAM filter
      if (selectedRam !== 'all' && p.ram !== selectedRam) {
        return false;
      }

      // Discount filter
      if (onlyDiscounts && !p.originalPrice) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q) || (p.nameFr && p.nameFr.toLowerCase().includes(q));
        const matchesModel = p.model.toLowerCase().includes(q);
        const matchesBrand = p.brand.toLowerCase().includes(q);
        const matchesSpecs = Object.values(p.specs).some((v) =>
          String(v).toLowerCase().includes(q)
        );
        if (!matchesName && !matchesModel && !matchesBrand && !matchesSpecs) return false;
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
    } else if (sortBy === 'newest') {
      result.sort((a, b) => (b.category === 'new-phone' ? 1 : 0) - (a.category === 'new-phone' ? 1 : 0));
    }

    return result;
  }, [
    products,
    selectedCategory,
    selectedBrand,
    selectedStorage,
    selectedRam,
    onlyDiscounts,
    searchQuery,
    sortBy,
  ]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSelectedStorage('all');
    setSelectedRam('all');
    setOnlyDiscounts(false);
    setSearchQuery('');
    setSortBy('popular');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedBrand !== 'all' ||
    selectedStorage !== 'all' ||
    selectedRam !== 'all' ||
    onlyDiscounts ||
    searchQuery.trim().length > 0;

  return (
    <div id="products-catalog" className="space-y-6 storefront-catalog">
      {/* Category Pills Bar - Inspired by Showly */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
            selectedCategory === 'all'
              ? 'bg-emerald-400 text-[#08090d] shadow-[0_4px_20px_rgba(52,211,153,0.35)]'
              : 'border border-white/10 bg-white/[0.04] text-neutral-300 hover:text-white hover:bg-white/[0.08] hover:border-white/20'
          }`}
        >
          <span>{t.allProducts}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedCategory === 'all' ? 'bg-[#08090d]/20 text-[#08090d]' : 'bg-white/10 text-neutral-400'}`}>
            {products.length}
          </span>
        </button>

        <button
          onClick={() => setSelectedCategory('new-phone')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
            selectedCategory === 'new-phone'
              ? 'bg-emerald-400 text-[#08090d] shadow-[0_4px_20px_rgba(52,211,153,0.35)]'
              : 'border border-white/10 bg-white/[0.04] text-neutral-300 hover:text-white hover:bg-white/[0.08] hover:border-white/20'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.newPhones}</span>
        </button>

        <button
          onClick={() => setSelectedCategory('used-phone')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
            selectedCategory === 'used-phone'
              ? 'bg-amber-400 text-[#08090d] shadow-[0_4px_20px_rgba(251,191,36,0.35)]'
              : 'border border-white/10 bg-white/[0.04] text-neutral-300 hover:text-white hover:bg-white/[0.08] hover:border-white/20'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t.usedPhones}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedCategory === 'used-phone' ? 'bg-[#08090d]/20 text-[#08090d]' : 'bg-amber-400/10 text-amber-300'}`}>
            Grade A+
          </span>
        </button>

        <button
          onClick={() => setSelectedCategory('accessory')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
            selectedCategory === 'accessory'
              ? 'bg-emerald-400 text-[#08090d] shadow-[0_4px_20px_rgba(52,211,153,0.35)]'
              : 'border border-white/10 bg-white/[0.04] text-neutral-300 hover:text-white hover:bg-white/[0.08] hover:border-white/20'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{t.accessories}</span>
        </button>
      </div>

      {/* Main Container: Sidebar Filters + Products Listing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Filter Sidebar (Desktop lg:col-span-3) */}
        <div className="hidden lg:block lg:col-span-3 rounded-[2rem] border border-white/10 bg-white/[0.035] backdrop-blur-xl p-5 text-white shadow-xl space-y-6 sticky top-24 desktop-filter-panel">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              <h2 className="font-extrabold text-sm text-white">
                {language === 'ar' ? 'فلاتر ومواصفات البحث' : 'Filtres de recherche'}
              </h2>
            </div>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-[11px] font-bold text-rose-400 hover:underline cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء الكل' : 'Réinitialiser'}
              </button>
            )}
          </div>

          {/* Quick Search */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-300 block">
              {language === 'ar' ? 'البحث بالاسم أو المعالج:' : 'Recherche:'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'ar' ? 'مثال: iPhone 16, S24...' : 'Rechercher...'}
                className="w-full pl-8 pr-3.5 py-2.5 text-xs bg-white/[0.05] rounded-2xl border border-white/10 text-white focus:outline-none focus:border-emerald-400 focus:bg-white/[0.08] transition placeholder:text-neutral-500"
              />
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Brand Filter */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-neutral-300 block">
              {language === 'ar' ? 'العلامة التجارية (الماركة):' : 'Marque:'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {brands.map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBrand(b)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedBrand === b
                      ? 'bg-emerald-400 text-[#08090d] shadow-sm font-black'
                      : 'border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-neutral-300 hover:text-white'
                  }`}
                >
                  {b === 'all' ? (language === 'ar' ? 'جميع الماركات' : 'Toutes') : b}
                </button>
              ))}
            </div>
          </div>

          {/* Storage Filter */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-neutral-300 block">
              {language === 'ar' ? 'سعة التخزين:' : 'Stockage:'}
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {storages.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedStorage(s)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                    selectedStorage === s
                      ? 'bg-emerald-400 text-[#08090d] font-black'
                      : 'border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-neutral-300 hover:text-white'
                  }`}
                >
                  {s === 'all' ? (language === 'ar' ? 'الكل' : 'Tous') : s}
                </button>
              ))}
            </div>
          </div>

          {/* RAM Filter */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-neutral-300 block">
              {language === 'ar' ? 'سعة الرام (RAM):' : 'Mémoire RAM:'}
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {ramOptions.map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRam(r)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                    selectedRam === r
                      ? 'bg-emerald-400 text-[#08090d] font-black'
                      : 'border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-neutral-300 hover:text-white'
                  }`}
                >
                  {r === 'all' ? (language === 'ar' ? 'الكل' : 'Toutes') : r}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Toggles */}
          <div className="space-y-2.5 pt-2 border-t border-white/10">
            <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs font-bold text-neutral-200 bg-white/[0.04] p-3 rounded-2xl border border-white/10 hover:border-rose-400/40 transition">
              <input
                type="checkbox"
                checked={onlyDiscounts}
                onChange={(e) => setOnlyDiscounts(e.target.checked)}
                className="w-4 h-4 rounded text-rose-400 focus:ring-rose-500 cursor-pointer accent-rose-400"
              />
              <Zap className="w-4 h-4 text-rose-400" />
              <span>{language === 'ar' ? 'تخفيضات وعروض خاصة' : 'Offres spéciales / Promos'}</span>
            </label>
          </div>
        </div>

        {/* Right Content Area: Results Bar + Products List/Grid (Desktop lg:col-span-9) */}
        <div className="lg:col-span-9 space-y-4 catalog-results">
          {/* Top Sort & Toolbar */}
          <div className="rounded-2xl p-3.5 sm:p-4 border border-white/10 bg-white/[0.035] backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 text-white">
            {/* Results count & Mobile filter trigger */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                className="lg:hidden px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'ar' ? 'الفلاتر' : 'Filtres'}</span>
              </button>

              <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                <span className="text-emerald-400 text-sm font-black">{filteredProducts.length}</span>
                <span className="text-neutral-400 font-medium">
                  {language === 'ar' ? 'هاتف ذكي متوفر للتسليم' : 'smartphones disponibles'}
                </span>
              </div>
            </div>

            {/* Sort Dropdown + View Switcher */}
            <div className="flex items-center gap-3">
              {/* Sort selector */}
              <div className="flex items-center gap-1.5 text-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[#12141d] border border-white/15 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-emerald-400 cursor-pointer"
                >
                  <option value="popular">
                    {language === 'ar' ? 'الترتيب: الأكثر طلباً' : 'Les plus populaires'}
                  </option>
                  <option value="price-asc">
                    {language === 'ar' ? 'السعر: من الأقل للأعلى' : 'Prix: Croissant'}
                  </option>
                  <option value="price-desc">
                    {language === 'ar' ? 'السعر: من الأعلى للأقل' : 'Prix: Décroissant'}
                  </option>
                  <option value="rating">
                    {language === 'ar' ? 'الأعلى تقييماً' : 'Mieux notés'}
                  </option>
                  <option value="newest">
                    {language === 'ar' ? 'الأحدث إصداراً' : 'Nouveautés'}
                  </option>
                </select>
              </div>

              {/* Grid vs List View Switcher */}
              <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-emerald-400 text-[#08090d]'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title={language === 'ar' ? 'عرض شبكي' : 'Vue Grille'}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-emerald-400 text-[#08090d]'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title={language === 'ar' ? 'عرض قائمة بمواصفات مقارنة' : 'Vue Liste avec Fiches'}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Filter Drawer (when toggled on mobile) */}
          {isMobileFilterOpen && (
            <div className="lg:hidden rounded-3xl border border-white/10 bg-[#0e1017] p-5 shadow-2xl space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-black text-white">
                  {language === 'ar' ? 'تخصيص البحث والمواصفات' : 'Filtres'}
                </span>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Brands */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-neutral-300 block">الماركة:</span>
                <div className="flex flex-wrap gap-1.5">
                  {brands.map((b) => (
                    <button
                      key={b}
                      onClick={() => setSelectedBrand(b)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                        selectedBrand === b
                          ? 'bg-emerald-400 text-[#08090d] font-black'
                          : 'border border-white/10 bg-white/[0.04] text-neutral-300'
                      }`}
                    >
                      {b === 'all' ? 'الكل' : b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Toggles */}
              <div className="text-xs">
                <button
                  onClick={() => setOnlyDiscounts(!onlyDiscounts)}
                  className={`w-full p-2.5 rounded-xl font-bold border text-center transition flex items-center justify-center gap-2 ${
                    onlyDiscounts
                      ? 'bg-rose-400 text-[#08090d] border-rose-400 font-black'
                      : 'bg-white/[0.04] text-neutral-300 border-white/10'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-rose-400" />
                  <span>{language === 'ar' ? 'تخفيضات وعروض خاصة فقط' : 'Promos seulement'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Empty state */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 rounded-3xl border border-dashed border-white/15 bg-white/[0.02] p-8 space-y-3">
              <Smartphone className="w-12 h-12 text-neutral-500 mx-auto" />
              <p className="text-white text-sm font-bold">
                {language === 'ar'
                  ? 'لم يتم العثور على أي هاتف يطابق الفلاتر المحددة'
                  : 'Aucun produit ne correspond à ces critères'}
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 rounded-xl bg-emerald-400 text-[#08090d] text-xs font-black hover:bg-emerald-300 transition cursor-pointer shadow-[0_4px_20px_rgba(52,211,153,0.3)]"
              >
                {language === 'ar' ? 'إعادة ضبط كل الفلاتر' : 'Réinitialiser les filtres'}
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* VIEW 1: Showly Atelier Nova Luxury Product Cards Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredProducts.map((product) => {
                const isCompared = compareIds.includes(product.id);

                return (
                  <div
                    key={product.id}
                    className="product-card rounded-[2rem] border border-white/10 bg-white/[0.035] hover:border-emerald-400/40 hover:bg-white/[0.06] transition-all duration-300 flex flex-col justify-between overflow-hidden group backdrop-blur-md relative"
                  >
                    {/* Top ambient glow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-[2rem]" />

                    {/* Card Top / Image Presentation Area */}
                    <div className="product-image relative aspect-square bg-[#0c0e15] overflow-hidden flex items-center justify-center p-6 border-b border-white/5">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        onClick={() => handleProductSelect(product)}
                        className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] cursor-pointer"
                        referrerPolicy="no-referrer"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-3.5 right-3.5 flex flex-col gap-1.5 items-end pointer-events-none z-10">
                        {product.category === 'new-phone' && (
                          <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-400 text-[#08090d] shadow-[0_2px_10px_rgba(52,211,153,0.3)]">
                            {language === 'ar' ? 'جديد 100%' : 'Neuf 100%'}
                          </span>
                        )}
                        {product.category === 'used-phone' && (
                          <span className="px-3 py-1 rounded-full text-[10px] font-black bg-amber-400 text-[#08090d] shadow-[0_2px_10px_rgba(251,191,36,0.3)]">
                            {language === 'ar' ? 'مستعمل A+' : 'Occasion A+'}
                          </span>
                        )}
                        {product.batteryHealth && (
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/70 text-emerald-300 border border-emerald-400/30 backdrop-blur-xl shadow-xs">
                            <BatteryCharging className="w-3 h-3 text-emerald-400" />
                            {product.batteryHealth}%
                          </span>
                        )}
                      </div>

                      {/* Compare toggle button */}
                      <button
                        onClick={() => toggleCompare(product.id)}
                        className={`absolute top-3.5 left-3.5 p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-xl transition cursor-pointer z-10 ${
                          isCompared
                            ? 'bg-emerald-400 text-[#08090d] font-black shadow-[0_0_15px_rgba(52,211,153,0.4)]'
                            : 'border border-white/15 bg-black/50 text-white/80 hover:text-white hover:bg-black/80'
                        }`}
                        title={language === 'ar' ? 'مقارنة الهاتف' : 'Comparer'}
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span className="text-[10px]">
                          {isCompared
                            ? language === 'ar' ? 'تمت الإضافة' : 'Ajouté'
                            : language === 'ar' ? 'مقارنة' : 'Comparer'}
                        </span>
                      </button>
                    </div>

                    {/* Card Middle: Content, Specs pills, Pricing */}
                    <div className="product-card-content p-5 flex-1 flex flex-col justify-between space-y-4 relative z-10">
                      <div className="space-y-2.5">
                        {/* Brand & Rating */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold text-emerald-300 uppercase tracking-wider text-[11px] bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-0.5 rounded-full">
                            {product.brand}
                          </span>
                          <div className="flex items-center gap-1 text-amber-400 text-[11px] font-bold">
                            <Star className="w-3 h-3 fill-current" />
                            <span>{product.rating}</span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3
                          onClick={() => handleProductSelect(product)}
                          className="font-black text-white text-base line-clamp-2 hover:text-emerald-400 transition cursor-pointer leading-snug"
                        >
                          {language === 'ar' ? product.name : product.nameFr || product.name}
                        </h3>

                        {/* Quick Specs Chips Grid */}
                        <div className="product-specs grid grid-cols-2 gap-1.5 text-[11px] text-neutral-300 pt-1">
                          <div className="flex items-center gap-1.5 bg-white/[0.04] px-2.5 py-1.5 rounded-xl border border-white/5 truncate">
                            <HardDrive className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="truncate font-semibold">{product.storage || '256GB'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-white/[0.04] px-2.5 py-1.5 rounded-xl border border-white/5 truncate">
                            <Smartphone className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            <span className="truncate font-semibold">
                              {product.quickSpecs?.screen || product.specs['الشاشة']?.split(' ')[0] || 'OLED'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-white/[0.04] px-2.5 py-1.5 rounded-xl border border-white/5 truncate">
                            <Camera className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            <span className="truncate font-semibold">
                              {product.quickSpecs?.camera?.split('+')[0] || product.specs['الكاميرا الخلفية']?.split(' ')[0] || 'HD Cam'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-white/[0.04] px-2.5 py-1.5 rounded-xl border border-white/5 truncate">
                            <Battery className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="truncate font-semibold">
                              {product.quickSpecs?.battery?.split(' ')[0] || '5000mAh'}
                            </span>
                          </div>
                        </div>

                        {/* Price Display */}
                        <div className="pt-2">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-2xl font-black text-white tracking-tight">
                              {product.price.toLocaleString()}{' '}
                              <span className="text-emerald-400 text-sm font-bold">{t.currency}</span>
                            </span>
                            {product.originalPrice && (
                              <span className="text-xs text-neutral-500 line-through">
                                {product.originalPrice.toLocaleString()} {t.currency}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="product-actions space-y-2 pt-3 border-t border-white/10">
                        <button
                          onClick={() => handleFastBuy(product)}
                          className="w-full py-3 px-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-[#08090d] text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(52,211,153,.25)] hover:scale-[1.01] transition-all cursor-pointer"
                        >
                          <Zap className="w-4 h-4 fill-current" />
                          <span>{t.orderNowCod}</span>
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleProductSelect(product)}
                            className="py-2 px-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.09] text-neutral-200 text-xs font-bold text-center transition cursor-pointer"
                          >
                            {language === 'ar' ? 'المواصفات' : 'Fiche specs'}
                          </button>

                          <button
                            onClick={() => addToCart(product, 1, 'full')}
                            className="py-2 px-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.09] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{t.addToCart}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* VIEW 2: Showly Luxury List Mode with Specs Matrix */
            <div className="space-y-4">
              {filteredProducts.map((product) => {
                const isCompared = compareIds.includes(product.id);

                return (
                  <div
                    key={product.id}
                    className="rounded-3xl border border-white/10 bg-white/[0.035] hover:border-emerald-400/40 hover:bg-white/[0.06] p-5 transition-all flex flex-col md:flex-row gap-5 items-stretch group backdrop-blur-md"
                  >
                    {/* Left: Product Image */}
                    <div
                      onClick={() => handleProductSelect(product)}
                      className="w-full md:w-52 h-48 sm:h-52 bg-[#0c0e15] rounded-2xl border border-white/10 p-4 shrink-0 flex items-center justify-center cursor-pointer relative overflow-hidden"
                    >
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-108 transition duration-500 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                        referrerPolicy="no-referrer"
                      />
                      {product.category === 'new-phone' && (
                        <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-400 text-[#08090d]">
                          جديد 100%
                        </span>
                      )}
                    </div>

                    {/* Middle: Title & Specs Table */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[11px] font-extrabold uppercase text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-0.5 rounded-full">
                            {product.brand}
                          </span>
                          <span className="text-xs text-neutral-500">•</span>
                          <span className="text-xs text-neutral-400 font-medium">
                            ضمان {product.warrantyMonths} أشهر
                          </span>
                        </div>
                        <h3
                          onClick={() => handleProductSelect(product)}
                          className="font-black text-white text-base sm:text-lg hover:text-emerald-400 cursor-pointer transition"
                        >
                          {language === 'ar' ? product.name : product.nameFr || product.name}
                        </h3>
                      </div>

                      {/* Specs Matrix Row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="bg-white/[0.04] p-2.5 rounded-xl border border-white/10">
                          <span className="text-[10px] text-neutral-400 block font-medium">الشاشة:</span>
                          <span className="font-bold text-white truncate block">
                            {product.quickSpecs?.screen || product.specs['الشاشة'] || 'AMOLED'}
                          </span>
                        </div>
                        <div className="bg-white/[0.04] p-2.5 rounded-xl border border-white/10">
                          <span className="text-[10px] text-neutral-400 block font-medium">المعالج:</span>
                          <span className="font-bold text-white truncate block">
                            {product.quickSpecs?.processor || product.specs['المعالج'] || 'Snapdragon'}
                          </span>
                        </div>
                        <div className="bg-white/[0.04] p-2.5 rounded-xl border border-white/10">
                          <span className="text-[10px] text-neutral-400 block font-medium">التخزين والرام:</span>
                          <span className="font-bold text-white truncate block">
                            {product.storage} {product.ram ? `• ${product.ram}` : ''}
                          </span>
                        </div>
                        <div className="bg-white/[0.04] p-2.5 rounded-xl border border-white/10">
                          <span className="text-[10px] text-neutral-400 block font-medium">البطارية:</span>
                          <span className="font-bold text-white truncate block">
                            {product.quickSpecs?.battery || product.specs['البطارية'] || '5000 mAh'}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                        {language === 'ar' ? product.description : product.descriptionFr || product.description}
                      </p>
                    </div>

                    {/* Right: Price & Fast Actions */}
                    <div className="w-full md:w-60 shrink-0 flex flex-col justify-between border-t md:border-t-0 md:border-r border-white/10 pt-3 md:pt-0 md:pr-4 space-y-3">
                      <div>
                        <span className="text-[10px] text-neutral-400 block font-bold uppercase">
                          {language === 'ar' ? 'السعر النهائي:' : 'Prix TTC:'}
                        </span>
                        <div className="flex items-baseline gap-2 flex-wrap mt-0.5">
                          <span className="text-2xl font-black text-white">
                            {product.price.toLocaleString()}{' '}
                            <span className="text-emerald-400 text-sm font-bold">{t.currency}</span>
                          </span>
                        </div>
                        {product.originalPrice && (
                          <span className="text-xs text-neutral-500 line-through block">
                            {product.originalPrice.toLocaleString()} {t.currency}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={() => handleFastBuy(product)}
                          className="w-full py-2.5 px-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-[#08090d] text-xs font-black flex items-center justify-center gap-1.5 shadow-[0_4px_20px_rgba(52,211,153,0.3)] transition cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5 fill-current" />
                          <span>{t.orderNowCod}</span>
                        </button>

                        <button
                          onClick={() => handleProductSelect(product)}
                          className="w-full py-2 px-3 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-bold text-center transition cursor-pointer"
                        >
                          {language === 'ar' ? 'عرض المواصفات والأسعار' : 'Détails & Specs'}
                        </button>

                        <button
                          onClick={() => toggleCompare(product.id)}
                          className={`w-full py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer border ${
                            isCompared
                              ? 'bg-emerald-400 text-[#08090d] border-emerald-400 font-black'
                              : 'border-white/10 bg-white/[0.03] text-neutral-300 hover:bg-white/[0.08]'
                          }`}
                        >
                          <Scale className="w-3 h-3" />
                          <span>
                            {isCompared
                              ? language === 'ar' ? 'مدرج في المقارنة' : 'Dans le comparateur'
                              : language === 'ar' ? 'إضافة للمقارنة' : 'Comparer'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating Comparison Bar - Showly Obsidian Bar */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-5 left-4 right-4 sm:left-auto sm:right-8 z-40 bg-[#0e1017]/95 text-white p-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-emerald-400/30 backdrop-blur-2xl flex items-center gap-4 max-w-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-400 text-[#08090d]">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-xs sm:text-sm block text-white">
                {language === 'ar'
                  ? `مقارنة ${compareIds.length} هواتف`
                  : `Comparer ${compareIds.length} smartphones`}
              </span>
              <span className="text-[10px] text-neutral-400">
                {language === 'ar'
                  ? 'مقارنة الشاشة، المعالج، الكاميرا والسعر'
                  : 'Écran, processeur, caméra, prix'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 mr-auto">
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-[#08090d] text-xs font-black shadow-[0_4px_20px_rgba(52,211,153,0.3)] transition cursor-pointer flex items-center gap-1.5"
            >
              <span>{language === 'ar' ? 'عرض جدول المقارنة' : 'Comparer'}</span>
            </button>
            <button
              onClick={() => setCompareIds([])}
              className="p-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-neutral-400 hover:text-white transition cursor-pointer"
              title="إلغاء"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Compare Modal Popup */}
      {isCompareModalOpen && (
        <ProductCompareModal
          products={comparedProducts}
          onRemoveProduct={(id) => {
            setCompareIds(compareIds.filter((cid) => cid !== id));
            if (compareIds.length <= 1) setIsCompareModalOpen(false);
          }}
          onClearAll={() => {
            setCompareIds([]);
            setIsCompareModalOpen(false);
          }}
          onClose={() => setIsCompareModalOpen(false)}
          onSelectProduct={(p) => {
            setIsCompareModalOpen(false);
            handleProductSelect(p);
          }}
          onFastBuy={(p) => {
            setIsCompareModalOpen(false);
            handleFastBuy(p);
          }}
        />
      )}
    </div>
  );
};
