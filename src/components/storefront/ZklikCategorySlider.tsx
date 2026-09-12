import React, { useRef } from 'react';
import {
  Smartphone,
  Sparkles,
  Zap,
  Headphones,
  ShieldCheck,
  Wrench,
  CreditCard,
  Flame,
  ChevronLeft,
  ChevronRight,
  Layers,
  Cpu,
} from 'lucide-react';
import { ProductCategory } from '../../types';

export interface CategoryItem {
  id: string;
  nameAr: string;
  nameFr: string;
  icon: React.ReactNode;
  categoryValue: ProductCategory | 'all' | 'special';
  brandFilter?: string;
  badge?: string;
  bgGradient: string;
  borderColor: string;
  image?: string;
  specialAction?: 'repairs' | 'installments' | 'deals';
}

interface ZklikCategorySliderProps {
  selectedCategory: ProductCategory | 'all';
  selectedBrand: string;
  onlyDiscounts: boolean;
  onSelectCategory: (cat: ProductCategory | 'all') => void;
  onSelectBrand: (brand: string) => void;
  onToggleDiscounts: (active: boolean) => void;
  onOpenRepairs?: () => void;
  onOpenInstallments?: () => void;
  language?: 'ar' | 'fr';
}

export const ZklikCategorySlider: React.FC<ZklikCategorySliderProps> = ({
  selectedCategory,
  selectedBrand,
  onlyDiscounts,
  onSelectCategory,
  onSelectBrand,
  onToggleDiscounts,
  onOpenRepairs,
  onOpenInstallments,
  language = 'ar',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const categories: CategoryItem[] = [
    {
      id: 'all',
      nameAr: 'كل المنتجات',
      nameFr: 'Tous les produits',
      icon: <Layers className="w-6 h-6 text-white" />,
      categoryValue: 'all',
      bgGradient: 'from-orange-600 to-amber-600',
      borderColor: 'border-orange-500/50',
    },
    {
      id: 'smartphones',
      nameAr: 'هواتف جديدة',
      nameFr: 'Smartphones neufs',
      icon: <Smartphone className="w-6 h-6 text-amber-300" />,
      categoryValue: 'new-phone',
      badge: 'جديد 2026',
      bgGradient: 'from-amber-600 to-orange-700',
      borderColor: 'border-amber-500/40',
      image: 'https://images.unsplash.com/photo-1726056652586-1d129994c965?w=200&auto=format&fit=crop&q=80',
    },
    {
      id: 'apple',
      nameAr: 'آبل آيفون',
      nameFr: 'Apple iPhone',
      icon: <span className="text-xl font-black"></span>,
      categoryValue: 'all',
      brandFilter: 'Apple',
      badge: 'iPhone 16',
      bgGradient: 'from-neutral-700 to-neutral-900',
      borderColor: 'border-neutral-500/40',
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200&auto=format&fit=crop&q=80',
    },
    {
      id: 'samsung',
      nameAr: 'سامسونج',
      nameFr: 'Samsung Galaxy',
      icon: <Sparkles className="w-6 h-6 text-sky-300" />,
      categoryValue: 'all',
      brandFilter: 'Samsung',
      badge: 'Galaxy AI',
      bgGradient: 'from-blue-700 to-indigo-900',
      borderColor: 'border-blue-500/40',
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&auto=format&fit=crop&q=80',
    },
    {
      id: 'xiaomi',
      nameAr: 'شاومي وبوكو',
      nameFr: 'Xiaomi & Poco',
      icon: <Zap className="w-6 h-6 text-orange-400" />,
      categoryValue: 'all',
      brandFilter: 'Xiaomi',
      badge: 'Leica Optics',
      bgGradient: 'from-orange-700 to-neutral-900',
      borderColor: 'border-orange-500/40',
    },
    {
      id: 'used',
      nameAr: 'مستعمل معتمد',
      nameFr: 'Occasion certifiée',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-300" />,
      categoryValue: 'used-phone',
      badge: 'فحص 45 نقطة',
      bgGradient: 'from-emerald-700 to-teal-900',
      borderColor: 'border-emerald-500/40',
    },
    {
      id: 'accessories',
      nameAr: 'إكسسوارات أصلية',
      nameFr: 'Accessoires',
      icon: <Headphones className="w-6 h-6 text-purple-300" />,
      categoryValue: 'accessory',
      bgGradient: 'from-purple-700 to-pink-900',
      borderColor: 'border-purple-500/40',
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200&auto=format&fit=crop&q=80',
    },
    {
      id: 'repairs',
      nameAr: 'صيانة وشاشات',
      nameFr: 'Réparation SAV',
      icon: <Wrench className="w-6 h-6 text-amber-400" />,
      categoryValue: 'special',
      specialAction: 'repairs',
      badge: 'تتبع مباشر',
      bgGradient: 'from-amber-600 to-yellow-800',
      borderColor: 'border-amber-500/40',
    },
    {
      id: 'installments',
      nameAr: 'التقسيط الميسر',
      nameFr: 'Facilité de paiement',
      icon: <CreditCard className="w-6 h-6 text-sky-400" />,
      categoryValue: 'special',
      specialAction: 'installments',
      badge: 'بدون فوائد',
      bgGradient: 'from-sky-700 to-blue-900',
      borderColor: 'border-sky-500/40',
    },
    {
      id: 'deals',
      nameAr: 'تخفيضات زكليك',
      nameFr: 'Offres promos',
      icon: <Flame className="w-6 h-6 text-rose-400" />,
      categoryValue: 'special',
      specialAction: 'deals',
      badge: 'عروض حصرية',
      bgGradient: 'from-rose-700 to-red-900',
      borderColor: 'border-rose-500/40',
    },
  ];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 260;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleCategoryClick = (item: CategoryItem) => {
    if (item.specialAction === 'repairs') {
      if (onOpenRepairs) onOpenRepairs();
      return;
    }
    if (item.specialAction === 'installments') {
      if (onOpenInstallments) onOpenInstallments();
      return;
    }
    if (item.specialAction === 'deals') {
      onToggleDiscounts(!onlyDiscounts);
      return;
    }

    if (item.brandFilter) {
      onSelectCategory('all');
      onSelectBrand(item.brandFilter);
    } else {
      onSelectBrand('all');
      onSelectCategory(item.categoryValue as ProductCategory | 'all');
    }
  };

  const isItemActive = (item: CategoryItem) => {
    if (item.id === 'all') {
      return selectedCategory === 'all' && selectedBrand === 'all' && !onlyDiscounts;
    }
    if (item.brandFilter) {
      return selectedBrand === item.brandFilter;
    }
    if (item.specialAction === 'deals') {
      return onlyDiscounts;
    }
    if (item.categoryValue !== 'special' && item.categoryValue !== 'all') {
      return selectedCategory === item.categoryValue;
    }
    return false;
  };

  return (
    <div className="relative mb-6">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#c2410c] animate-pulse" />
          <h3 className="text-sm font-black tracking-wide text-neutral-100 flex items-center gap-1.5">
            {language === 'ar' ? 'تصنيفات زكليك الرائجة' : 'Catégories Populaires'}
            <span className="text-xs font-normal text-neutral-400">
              ({language === 'ar' ? 'اختر للفلترة السريعة' : 'Filtrez en 1 clic'})
            </span>
          </h3>
        </div>

        {/* Scroll Controls (desktop) */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => scroll('right')}
            className="w-7 h-7 rounded-full bg-white/5 border border-white/10 hover:bg-[#c2410c]/20 hover:border-[#c2410c]/50 text-neutral-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Previous categories"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('left')}
            className="w-7 h-7 rounded-full bg-white/5 border border-white/10 hover:bg-[#c2410c]/20 hover:border-[#c2410c]/50 text-neutral-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Next categories"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Smooth Track inspired by zklik.com */}
      <div
        ref={scrollRef}
        className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 px-1 scroll-smooth"
      >
        {categories.map((item) => {
          const active = isItemActive(item);

          return (
            <button
              key={item.id}
              onClick={() => handleCategoryClick(item)}
              className="flex flex-col items-center gap-2 shrink-0 group focus:outline-none cursor-pointer transition-transform duration-200 active:scale-95"
            >
              {/* Category Circle (ZKLIK category-circle DNA) */}
              <div
                className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-full p-[2px] transition-all duration-300 ${
                  active
                    ? 'ring-3 ring-[#c2410c] shadow-[0_0_20px_rgba(194,65,12,0.4)] scale-105'
                    : 'hover:ring-2 hover:ring-white/30'
                }`}
              >
                <div
                  className={`w-full h-full rounded-full flex flex-col items-center justify-center overflow-hidden border bg-gradient-to-br ${item.bgGradient} ${item.borderColor} shadow-lg relative`}
                >
                  {item.image ? (
                    <>
                      <img
                        src={item.image}
                        alt={language === 'ar' ? item.nameAr : item.nameFr}
                        className="w-full h-full object-cover object-center filter brightness-[0.8] contrast-[1.1] transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        {item.icon}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {item.icon}
                    </div>
                  )}

                  {/* Top Badge (if any) */}
                  {item.badge && (
                    <span className="absolute -top-1 bg-[#c2410c] text-[9px] font-black text-white px-1.5 py-0.2 rounded-full shadow-md border border-white/20 whitespace-nowrap">
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Category Name */}
              <span
                className={`text-xs font-bold text-center transition-colors max-w-[80px] leading-tight line-clamp-1 ${
                  active ? 'text-[#f97316] font-black' : 'text-neutral-300 group-hover:text-white'
                }`}
              >
                {language === 'ar' ? item.nameAr : item.nameFr}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
