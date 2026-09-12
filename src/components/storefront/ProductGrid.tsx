import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductCategory } from '../../types';
import { ALGERIA_WILAYAS } from '../../data/wilayas';
import { ZklikCategorySlider } from './ZklikCategorySlider';
import { ZklikPromoBanners } from './ZklikPromoBanners';
import { ZklikVerifiedStores } from './ZklikVerifiedStores';
import { ProductCompareModal } from './ProductCompareModal';
import {
  Search,
  SlidersHorizontal,
  X,
  Sparkles,
  ShieldCheck,
  Zap,
  ShoppingBag,
  Star,
  Check,
  Scale,
  Plus,
  BatteryCharging,
  Battery,
  HardDrive,
  Camera,
  Smartphone,
  ChevronDown,
  ArrowUpDown,
  LayoutGrid,
  List,
  MapPin,
  Truck,
  CheckCircle2,
  PhoneCall,
  Eye,
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
    setCurrentView,
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
  const [selectedWilaya, setSelectedWilaya] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [onlyDiscounts, setOnlyDiscounts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // UI state
  const [isWilayaDropdownOpen, setIsWilayaDropdownOpen] = useState(false);
  const [wilayaSearch, setWilayaSearch] = useState('');
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isMobileFiltersExpanded, setIsMobileFiltersExpanded] = useState(false);

  // Available brands
  const brands = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.brand))).filter(Boolean);
    return ['all', ...list];
  }, [products]);

  // Filtered Wilayas for dropdown search
  const filteredWilayasList = useMemo(() => {
    if (!wilayaSearch.trim()) return ALGERIA_WILAYAS;
    const q = wilayaSearch.toLowerCase();
    return ALGERIA_WILAYAS.filter(
      (w) =>
        Boolean(w.nameAr && w.nameAr.toLowerCase().includes(q)) ||
        Boolean(w.nameFr && w.nameFr.toLowerCase().includes(q)) ||
        Boolean(w.code && String(w.code).includes(q))
    );
  }, [wilayaSearch]);

  // Main Filter Logic
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

      // Discount filter
      if (onlyDiscounts && !p.originalPrice) {
        return false;
      }

      // Price Range filter
      if (selectedPriceRange === 'budget' && p.price > 40000) return false;
      if (selectedPriceRange === 'mid' && (p.price < 40000 || p.price > 90000)) return false;
      if (selectedPriceRange === 'flagship' && p.price < 90000) return false;

      // Wilaya filter (if product has wilayaName set, or matches 58 wilayas available)
      if (selectedWilaya !== 'all') {
        if (p.wilayaName && p.wilayaName !== selectedWilaya) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName =
          Boolean(p.name && p.name.toLowerCase().includes(q)) ||
          Boolean(p.nameFr && p.nameFr.toLowerCase().includes(q));
        const matchesModel = Boolean(p.model && p.model.toLowerCase().includes(q));
        const matchesBrand = Boolean(p.brand && p.brand.toLowerCase().includes(q));
        const matchesSpecs = Boolean(
          p.specs &&
            Object.values(p.specs).some((v) =>
              String(v || '').toLowerCase().includes(q)
            )
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
      result.sort(
        (a, b) =>
          (b.category === 'new-phone' ? 1 : 0) - (a.category === 'new-phone' ? 1 : 0)
      );
    }

    return result;
  }, [
    products,
    selectedCategory,
    selectedBrand,
    selectedWilaya,
    selectedPriceRange,
    onlyDiscounts,
    searchQuery,
    sortBy,
  ]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSelectedWilaya('all');
    setSelectedPriceRange('all');
    setOnlyDiscounts(false);
    setSearchQuery('');
    setSortBy('popular');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedBrand !== 'all' ||
    selectedWilaya !== 'all' ||
    selectedPriceRange !== 'all' ||
    onlyDiscounts ||
    searchQuery.trim().length > 0;

  const comparedProducts = useMemo(() => {
    return products.filter((p) => (compareIds || []).includes(p.id));
  }, [products, compareIds]);

  const selectedWilayaObj = useMemo(() => {
    if (selectedWilaya === 'all') return null;
    return ALGERIA_WILAYAS.find((w) => w.nameAr === selectedWilaya || String(w.code) === selectedWilaya);
  }, [selectedWilaya]);

  return (
    <div className="space-y-8">
      {/* 1. ZKLIK Promotional Hero Slider */}
      <ZklikPromoBanners
        onOpenRepairs={() => setCurrentView('repairs')}
        onOpenInstallments={() => setCurrentView('installments')}
        onExploreDeals={() => {
          setOnlyDiscounts(true);
          setSelectedCategory('all');
          setSelectedBrand('all');
        }}
        language={language}
      />

      {/* 2. ZKLIK Iconic Circular Categories Row */}
      <ZklikCategorySlider
        selectedCategory={selectedCategory}
        selectedBrand={selectedBrand}
        onlyDiscounts={onlyDiscounts}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          if (cat !== 'all') setSelectedBrand('all');
        }}
        onSelectBrand={(brand) => {
          setSelectedBrand(brand);
        }}
        onToggleDiscounts={(val) => setOnlyDiscounts(val)}
        onOpenRepairs={() => setCurrentView('repairs')}
        onOpenInstallments={() => setCurrentView('installments')}
        language={language}
      />

      {/* 3. ZKLIK Filter Track & Dynamic Pills Bar */}
      <div className="rounded-2xl border border-white/10 bg-[#0c0e15] p-3 sm:p-4 shadow-xl space-y-3">
        {/* Row 1: Wilaya Selector & Search & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Wilaya Filter Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsWilayaDropdownOpen(!isWilayaDropdownOpen)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                selectedWilaya !== 'all'
                  ? 'bg-[#c2410c] text-white border-[#c2410c] shadow-[0_0_15px_rgba(194,65,12,0.4)]'
                  : 'bg-white/[0.05] hover:bg-white/[0.09] text-neutral-200 border-white/10'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-[#f97316]" />
              <span>
                {selectedWilaya === 'all'
                  ? language === 'ar'
                    ? '📍 كل الولايات (58 ولاية)'
                    : '📍 Toutes les Wilayas (58)'
                  : selectedWilayaObj
                  ? `${selectedWilayaObj.code}. ${language === 'ar' ? selectedWilayaObj.nameAr : selectedWilayaObj.nameFr}`
                  : selectedWilaya}
              </span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {/* Dropdown Menu */}
            {isWilayaDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-[#12141e] border border-white/15 rounded-2xl p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="relative mb-2">
                  <input
                    type="text"
                    value={wilayaSearch}
                    onChange={(e) => setWilayaSearch(e.target.value)}
                    placeholder={language === 'ar' ? 'ابحث باسم أو رقم الولاية...' : 'Recherche par nom ou code...'}
                    className="w-full bg-white/[0.06] text-white text-xs rounded-xl pl-8 pr-3 py-2 border border-white/10 focus:outline-none focus:border-[#ea580c]"
                    autoFocus
                  />
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>

                <div className="max-h-60 overflow-y-auto no-scrollbar space-y-1">
                  <button
                    onClick={() => {
                      setSelectedWilaya('all');
                      setIsWilayaDropdownOpen(false);
                      setWilayaSearch('');
                    }}
                    className={`w-full text-right px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                      selectedWilaya === 'all'
                        ? 'bg-[#c2410c] text-white'
                        : 'text-neutral-300 hover:bg-white/[0.08] hover:text-white'
                    }`}
                  >
                    <span>{language === 'ar' ? 'جميع ولايات الوطن (58 ولاية)' : 'Toutes les Wilayas (58)'}</span>
                    {selectedWilaya === 'all' && <Check className="w-3.5 h-3.5" />}
                  </button>

                  {filteredWilayasList.map((w) => {
                    const isSel = selectedWilaya === w.nameAr || selectedWilaya === String(w.code);
                    return (
                      <button
                        key={w.code}
                        onClick={() => {
                          setSelectedWilaya(w.nameAr);
                          setIsWilayaDropdownOpen(false);
                          setWilayaSearch('');
                        }}
                        className={`w-full text-right px-3 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between cursor-pointer ${
                          isSel
                            ? 'bg-[#c2410c] text-white font-bold'
                            : 'text-neutral-300 hover:bg-white/[0.08] hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-neutral-300">
                            {w.code < 10 ? `0${w.code}` : w.code}
                          </span>
                          <span>{language === 'ar' ? w.nameAr : w.nameFr}</span>
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {w.homeDeliveryCost} دج
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'ابحث باسم الهاتف، السعة أو الموديل...'
                  : 'Rechercher un modèle, marque, capacité...'
              }
              className="w-full bg-white/[0.05] text-white text-xs rounded-xl pl-8 pr-9 py-2 border border-white/10 focus:outline-none focus:border-[#ea580c] transition placeholder:text-neutral-500"
            />
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector & Mode */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white/[0.05] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-neutral-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#f97316]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="popular" className="bg-[#12141e]">
                  {language === 'ar' ? 'الأكثر طلباً' : 'Populaires'}
                </option>
                <option value="price-asc" className="bg-[#12141e]">
                  {language === 'ar' ? 'السعر: الأقل للأعلى' : 'Prix croissant'}
                </option>
                <option value="price-desc" className="bg-[#12141e]">
                  {language === 'ar' ? 'السعر: الأعلى للأقل' : 'Prix décroissant'}
                </option>
                <option value="rating" className="bg-[#12141e]">
                  {language === 'ar' ? 'الأعلى تقييماً' : 'Mieux notés'}
                </option>
                <option value="newest" className="bg-[#12141e]">
                  {language === 'ar' ? 'الأحدث إصداراً' : 'Nouveautés'}
                </option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-black/40 p-0.5 rounded-xl border border-white/10">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#c2410c] text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title={language === 'ar' ? 'عرض شبكي' : 'Grille'}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-[#c2410c] text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title={language === 'ar' ? 'عرض قائمة' : 'Liste'}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: ZKLIK Horizontal Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-white/10">
          {/* Reset button if filters active */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-3 py-1.5 rounded-xl bg-rose-600/20 text-rose-300 border border-rose-500/30 text-xs font-bold hover:bg-rose-600/30 flex items-center gap-1 whitespace-nowrap cursor-pointer transition"
            >
              <X className="w-3 h-3" />
              <span>{language === 'ar' ? 'إعادة ضبط' : 'Réinitialiser'}</span>
            </button>
          )}

          {/* Brands Pills */}
          {brands.map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBrand(b)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedBrand === b
                  ? 'bg-[#ea580c] text-white shadow-md'
                  : 'bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08] hover:text-white border border-white/10'
              }`}
            >
              {b === 'all' ? (language === 'ar' ? 'جميع الماركات' : 'Toutes marques') : b}
            </button>
          ))}

          {/* Budget Pills */}
          <button
            onClick={() =>
              setSelectedPriceRange(selectedPriceRange === 'budget' ? 'all' : 'budget')
            }
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              selectedPriceRange === 'budget'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08] hover:text-white border border-white/10'
            }`}
          >
            {language === 'ar' ? 'اقتصادي (< 40 ألف دج)' : 'Éco (< 40k DZD)'}
          </button>

          <button
            onClick={() =>
              setSelectedPriceRange(selectedPriceRange === 'mid' ? 'all' : 'mid')
            }
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              selectedPriceRange === 'mid'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08] hover:text-white border border-white/10'
            }`}
          >
            {language === 'ar' ? 'متوسط (40k - 90k دج)' : 'Milieu (40k - 90k)'}
          </button>

          <button
            onClick={() =>
              setSelectedPriceRange(selectedPriceRange === 'flagship' ? 'all' : 'flagship')
            }
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              selectedPriceRange === 'flagship'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08] hover:text-white border border-white/10'
            }`}
          >
            {language === 'ar' ? 'فئة رائدة (+90 ألف دج)' : 'Haut de gamme (+90k)'}
          </button>

          {/* Only Discounts Toggle Pill */}
          <button
            onClick={() => setOnlyDiscounts(!onlyDiscounts)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
              onlyDiscounts
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-rose-600/10 text-rose-300 hover:bg-rose-600/20 border border-rose-500/30'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{language === 'ar' ? 'تخفيضات وعروض حصرية' : 'Promos exclusives'}</span>
          </button>
        </div>
      </div>

      {/* Results Count Banner */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-white">
            {language === 'ar' ? 'المنتجات المعروضة:' : 'Produits affichés :'}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#c2410c]/20 text-[#f97316] font-black text-xs border border-[#c2410c]/30">
            {filteredProducts.length} {language === 'ar' ? 'هاتف وجهاز' : 'articles'}
          </span>
          {selectedWilaya !== 'all' && (
            <span className="text-xs text-neutral-400">
              • {language === 'ar' ? 'متاح للتوصيل السريع إلى' : 'Livraison rapide vers'}{' '}
              <strong className="text-white">{selectedWilaya}</strong>
            </span>
          )}
        </div>
      </div>

      {/* 4. Products Grid / List Presentation (ZKLIK Cards) */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 rounded-3xl border border-dashed border-white/15 bg-white/[0.02] p-8 space-y-4">
          <Smartphone className="w-12 h-12 text-neutral-500 mx-auto" />
          <p className="text-white text-base font-bold">
            {language === 'ar'
              ? 'لم يتم العثور على أي منتج يطابق خيارات الفلترة المحددة'
              : 'Aucun produit ne correspond à ces critères'}
          </p>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            {language === 'ar'
              ? 'جرب اختيار كل الولايات أو إلغاء فلتر الماركة للعثور على هواتف أخرى متوفرة بالمحل.'
              : 'Essayez de sélectionner Toutes les wilayas ou de réinitialiser vos filtres.'}
          </p>
          <button
            onClick={resetFilters}
            className="px-5 py-2.5 rounded-xl bg-[#c2410c] hover:bg-[#ea580c] text-white text-xs font-black transition cursor-pointer shadow-lg"
          >
            {language === 'ar' ? 'إعادة ضبط كل الفلاتر' : 'Réinitialiser les filtres'}
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* ZKLIK Card Grid (fp-card) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((product) => {
            const isCompared = (compareIds || []).includes(product.id);
            const discountPct = product.originalPrice
              ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
              : null;

            return (
              <div
                key={product.id}
                className="group relative rounded-2xl border border-white/10 bg-[#0c0e15] hover:border-[#c2410c]/50 hover:bg-[#11131c] transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl"
              >
                {/* Image Section with ZKLIK Badges */}
                <div className="relative aspect-square bg-[#07080c] overflow-hidden flex items-center justify-center p-4 border-b border-white/5">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    onClick={() => onOpenProductModal(product)}
                    className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500 drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)] cursor-pointer"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />

                  {/* Top Badges (ZKLIK DNA) */}
                  <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-end pointer-events-none z-10">
                    {/* Verified Vendor badge */}
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-black backdrop-blur-md shadow-sm">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                      <span>{language === 'ar' ? 'بائع موثوق' : 'Vérifié'}</span>
                    </span>

                    {/* Boost / Discount badge */}
                    {discountPct && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black shadow-md">
                        -{discountPct}%
                      </span>
                    )}

                    {product.category === 'used-phone' && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold backdrop-blur-md">
                        {language === 'ar' ? 'مستعمل A+' : 'Occasion A+'}
                      </span>
                    )}
                  </div>

                  {/* Top-Left: Compare & Specs buttons */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1 z-10">
                    <button
                      onClick={() => toggleCompare(product.id)}
                      className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer backdrop-blur-md ${
                        isCompared
                          ? 'bg-[#c2410c] text-white shadow-md'
                          : 'bg-black/50 text-neutral-300 hover:text-white hover:bg-black/80 border border-white/10'
                      }`}
                      title={language === 'ar' ? 'مقارنة الهاتف' : 'Comparer'}
                    >
                      <Scale className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenProductModal(product)}
                      className="p-1.5 rounded-lg bg-black/50 hover:bg-black/80 text-neutral-300 hover:text-white border border-white/10 transition cursor-pointer"
                      title={language === 'ar' ? 'معاينة المواصفات' : 'Détails'}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    {/* Brand & Rating */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-[#f97316] uppercase tracking-wider text-[11px] bg-[#c2410c]/10 border border-[#c2410c]/20 px-2 py-0.5 rounded-md">
                        {product.brand}
                      </span>
                      <div className="flex items-center gap-1 text-amber-400 text-[11px] font-black">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{product.rating}</span>
                        <span className="text-neutral-500 text-[10px]">({product.reviewCount})</span>
                      </div>
                    </div>

                    {/* Product Name */}
                    <h3
                      onClick={() => onOpenProductModal(product)}
                      className="font-bold text-white text-sm line-clamp-2 hover:text-[#f97316] transition cursor-pointer leading-snug"
                    >
                      {language === 'ar' ? product.name : product.nameFr || product.name}
                    </h3>

                    {/* Specs Pills */}
                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-300 flex-wrap">
                      <span className="bg-white/[0.04] border border-white/5 px-2 py-0.5 rounded-md font-mono">
                        {product.storage || '256GB'}
                      </span>
                      {product.ram && (
                        <span className="bg-white/[0.04] border border-white/5 px-2 py-0.5 rounded-md font-mono">
                          {product.ram}
                        </span>
                      )}
                      {product.batteryHealth && (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                          <BatteryCharging className="w-2.5 h-2.5" />
                          {product.batteryHealth}%
                        </span>
                      )}
                    </div>

                    {/* ZKLIK Dynamic Info Bar */}
                    <div className="pt-2 border-t border-white/10 space-y-1 text-[11px] text-neutral-400">
                      <div className="flex items-center gap-1.5 text-neutral-300">
                        <MapPin className="w-3 h-3 text-[#c2410c] shrink-0" />
                        <span className="truncate">
                          {product.wilayaName || (language === 'ar' ? 'الجزائر العاصمة' : 'Alger')} • فرع حمتين 4
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-medium">
                        <Truck className="w-3 h-3 shrink-0" />
                        <span>{language === 'ar' ? 'توصيل متوفر لـ 58 ولاية (دفع عند الاستلام)' : 'Livraison 58 wilayas COD'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & ZKLIK Smart Actions */}
                  <div className="pt-2 border-t border-white/10 space-y-2.5">
                    {/* Price in DZD */}
                    <div className="flex items-baseline justify-between gap-1 flex-wrap">
                      <div>
                        <span className="text-xl font-black text-white tracking-tight">
                          {product.price.toLocaleString()}{' '}
                          <span className="text-[#f97316] text-xs font-bold">{t.currency}</span>
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-neutral-500 line-through block -mt-1">
                            {product.originalPrice.toLocaleString()} {t.currency}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Row: Fast Buy + ZKLIK Smart Cart Button (+) */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onFastCheckout(product)}
                        className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#ea580c] to-[#c2410c] hover:from-[#f97316] hover:to-[#ea580c] text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>{language === 'ar' ? 'طلب سريع' : 'Acheter'}</span>
                      </button>

                      {/* ZKLIK Signature Smart Cart Button (+) */}
                      <button
                        onClick={() => addToCart(product, 1, 'full')}
                        className="p-2 rounded-xl bg-white/[0.08] hover:bg-[#c2410c] text-white border border-white/10 hover:border-[#c2410c] transition-colors cursor-pointer group/btn"
                        title={language === 'ar' ? 'إضافة إلى سلة الشراء' : 'Ajouter au panier'}
                      >
                        <Plus className="w-4 h-4 group-hover/btn:scale-125 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ZKLIK List Mode */
        <div className="space-y-4">
          {filteredProducts.map((product) => {
            const isCompared = (compareIds || []).includes(product.id);

            return (
              <div
                key={product.id}
                className="rounded-2xl border border-white/10 bg-[#0c0e15] hover:border-[#c2410c]/50 p-4 sm:p-5 transition-all flex flex-col md:flex-row gap-5 items-stretch group shadow-xl"
              >
                {/* Thumbnail */}
                <div
                  onClick={() => onOpenProductModal(product)}
                  className="w-full md:w-48 h-44 bg-[#07080c] rounded-xl border border-white/10 p-3 shrink-0 flex items-center justify-center cursor-pointer relative overflow-hidden"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-108 transition duration-500 drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)]"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                    بائع موثوق ✔️
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase text-[#f97316] bg-[#c2410c]/10 border border-[#c2410c]/20 px-2 py-0.5 rounded-md">
                      {product.brand}
                    </span>
                    <span className="text-xs text-neutral-400">
                      ضمان {product.warrantyMonths} أشهر
                    </span>
                  </div>

                  <h3
                    onClick={() => onOpenProductModal(product)}
                    className="font-bold text-white text-base hover:text-[#f97316] cursor-pointer transition"
                  >
                    {language === 'ar' ? product.name : product.nameFr || product.name}
                  </h3>

                  {/* Specs row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-white/[0.04] p-2 rounded-lg border border-white/10">
                      <span className="text-[10px] text-neutral-400 block">الشاشة:</span>
                      <span className="font-bold text-white truncate block">
                        {product.quickSpecs?.screen || product.specs['الشاشة'] || 'AMOLED'}
                      </span>
                    </div>
                    <div className="bg-white/[0.04] p-2 rounded-lg border border-white/10">
                      <span className="text-[10px] text-neutral-400 block">المعالج:</span>
                      <span className="font-bold text-white truncate block">
                        {product.quickSpecs?.processor || product.specs['المعالج'] || 'Snapdragon'}
                      </span>
                    </div>
                    <div className="bg-white/[0.04] p-2 rounded-lg border border-white/10">
                      <span className="text-[10px] text-neutral-400 block">السعة:</span>
                      <span className="font-bold text-white truncate block">
                        {product.storage} {product.ram ? `• ${product.ram}` : ''}
                      </span>
                    </div>
                    <div className="bg-white/[0.04] p-2 rounded-lg border border-white/10">
                      <span className="text-[10px] text-neutral-400 block">البطارية:</span>
                      <span className="font-bold text-white truncate block">
                        {product.quickSpecs?.battery || product.specs['البطارية'] || '5000 mAh'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-400 line-clamp-1">
                    {language === 'ar' ? product.description : product.descriptionFr || product.description}
                  </p>
                </div>

                {/* Pricing & Actions */}
                <div className="w-full md:w-56 shrink-0 flex flex-col justify-between border-t md:border-t-0 md:border-r border-white/10 pt-3 md:pt-0 md:pr-4 space-y-3">
                  <div>
                    <span className="text-2xl font-black text-white">
                      {product.price.toLocaleString()}{' '}
                      <span className="text-[#f97316] text-xs font-bold">{t.currency}</span>
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs text-neutral-500 line-through block">
                        {product.originalPrice.toLocaleString()} {t.currency}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => onFastCheckout(product)}
                      className="w-full py-2 px-3 rounded-xl bg-[#c2410c] hover:bg-[#ea580c] text-white text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>{language === 'ar' ? 'طلب فوري يد بيد' : 'Commander'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => addToCart(product, 1, 'full')}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-bold flex items-center justify-center gap-1 border border-white/10 transition cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-[#f97316]" />
                        <span>{language === 'ar' ? 'السلة' : 'Panier'}</span>
                      </button>

                      <button
                        onClick={() => toggleCompare(product.id)}
                        className={`p-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                          isCompared
                            ? 'bg-[#c2410c] text-white border-[#c2410c]'
                            : 'border-white/10 bg-white/[0.04] text-neutral-300'
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

      {/* 5. ZKLIK Verified Stores & Showrooms Directory */}
      <ZklikVerifiedStores language={language} />

      {/* Floating Comparison Bar */}
      {compareIds && compareIds.length > 0 && (
        <div className="fixed bottom-5 left-4 right-4 sm:left-auto sm:right-8 z-40 bg-[#0e1017]/95 text-white p-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-[#c2410c]/40 backdrop-blur-2xl flex items-center gap-4 max-w-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#c2410c] text-white">
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
              className="px-4 py-2 rounded-xl bg-[#c2410c] hover:bg-[#ea580c] text-white text-xs font-black shadow-md transition cursor-pointer flex items-center gap-1.5"
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
