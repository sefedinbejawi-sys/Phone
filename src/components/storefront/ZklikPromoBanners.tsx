import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  Truck,
  ShieldCheck,
  CreditCard,
  Wrench,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  PhoneCall,
} from 'lucide-react';

interface ZklikPromoBannersProps {
  onOpenRepairs?: () => void;
  onOpenInstallments?: () => void;
  onExploreDeals?: () => void;
  language?: 'ar' | 'fr';
}

export const ZklikPromoBanners: React.FC<ZklikPromoBannersProps> = ({
  onOpenRepairs,
  onOpenInstallments,
  onExploreDeals,
  language = 'ar',
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    {
      id: 'banner-flagship',
      tag: language === 'ar' ? '⚡ عروض زكليك الحصرية' : '⚡ Offres Exclusives ZKLIK',
      tagBg: 'bg-orange-600',
      title:
        language === 'ar'
          ? 'أقوى هواتف 2026: iPhone 16 Pro Max و S24 Ultra'
          : 'Fleurons 2026 : iPhone 16 Pro Max & Galaxy S24 Ultra',
      subtitle:
        language === 'ar'
          ? 'ضمان حقيقي لمدة عام + توصيل سريع لـ 58 ولاية مع إمكانية المعاينة قبل الدفع'
          : 'Garantie officielle 1 an • Livraison 58 Wilayas • Vérification avant paiement',
      badge: language === 'ar' ? 'توصيل مجاني متوفر' : 'Livraison Gratuite',
      ctaText: language === 'ar' ? 'تصفح عروض الهواتف' : 'Voir les offres',
      ctaAction: () => {
        if (onExploreDeals) onExploreDeals();
      },
      gradient: 'from-[#c2410c] via-[#7c2d12] to-[#0f111a]',
      image: 'https://images.unsplash.com/photo-1726056652586-1d129994c965?w=900&auto=format&fit=crop&q=85',
    },
    {
      id: 'banner-repair',
      tag: language === 'ar' ? '🔧 ورشة الصيانة المعتمدة' : '🔧 Atelier Réparation Agréé',
      tagBg: 'bg-amber-600',
      title:
        language === 'ar'
          ? 'تغيير شاشات وبطاريات أصلية مع تتبع مباشر لحالة التذكرة'
          : 'Écrans et batteries certifiés d\'origine avec suivi en temps réel',
      subtitle:
        language === 'ar'
          ? 'فحص وتشخيص فوري مجاني + قطع غيار أصلية بضمان المحل'
          : 'Diagnostic express gratuit • Pièces d\'origine avec garantie atelier',
      badge: language === 'ar' ? 'ضمان 6 أشهر' : 'Garantie 6 Mois',
      ctaText: language === 'ar' ? 'احجز موعد صيانة' : 'Réserver une réparation',
      ctaAction: () => {
        if (onOpenRepairs) onOpenRepairs();
      },
      gradient: 'from-[#b45309] via-[#78350f] to-[#0f111a]',
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=900&auto=format&fit=crop&q=85',
    },
    {
      id: 'banner-installments',
      tag: language === 'ar' ? '💳 التقسيط الميسر بالمحل' : '💳 Facilité de Paiement',
      tagBg: 'bg-emerald-600',
      title:
        language === 'ar'
          ? 'احصل على هاتفك الجديد وادفع على 3، 6، أو 12 شهراً'
          : 'Payez votre smartphone en 3, 6 ou 12 mois sans intérêts cachés',
      subtitle:
        language === 'ar'
          ? 'ملف بسيط جداً (بطاقة تعريف وكشف راتب) بدون فوائد ربوية'
          : 'Dossier simplifié en magasin • Traitement rapide sous 24h',
      badge: language === 'ar' ? '0% فوائد' : '0% Intérêts',
      ctaText: language === 'ar' ? 'احسب قسطك الآن' : 'Calculer les mensualités',
      ctaAction: () => {
        if (onOpenInstallments) onOpenInstallments();
      },
      gradient: 'from-[#047857] via-[#064e3b] to-[#0f111a]',
      image: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=900&auto=format&fit=crop&q=85',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [banners.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const activeBanner = banners[currentSlide];

  return (
    <div className="relative mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-[#0c0e15] shadow-2xl">
      <div className="relative min-h-[220px] sm:min-h-[260px] md:min-h-[300px] flex items-center overflow-hidden">
        {/* Background Image with Ambient Gradient Fade */}
        <div className="absolute inset-0 z-0">
          <img
            src={activeBanner.image}
            alt={activeBanner.title}
            className="w-full h-full object-cover object-center filter brightness-[0.35] contrast-[1.15] transition-all duration-1000 scale-105"
          />
          <div
            className={`absolute inset-0 bg-gradient-to-r ${activeBanner.gradient} opacity-90 mix-blend-multiply`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 sm:p-8 md:p-10 max-w-2xl flex flex-col items-start gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black text-white ${activeBanner.tagBg} shadow-md`}
            >
              {activeBanner.tag}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30">
              {activeBanner.badge}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight">
            {activeBanner.title}
          </h2>

          <p className="text-xs sm:text-sm text-neutral-200 line-clamp-2 max-w-xl font-medium">
            {activeBanner.subtitle}
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={activeBanner.ctaAction}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ea580c] to-[#c2410c] hover:from-[#f97316] hover:to-[#ea580c] text-white font-bold text-xs sm:text-sm shadow-xl flex items-center gap-2 cursor-pointer transition active:scale-95"
            >
              <span>{activeBanner.ctaText}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>

            {/* Direct Phone / WhatsApp button */}
            <a
              href="tel:0699269292"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/10 transition"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'ar' ? 'اتصل بالمحل' : 'Appeler'}</span>
            </a>
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="w-8 h-8 rounded-full bg-black/50 hover:bg-[#c2410c] text-white border border-white/15 flex items-center justify-center transition cursor-pointer backdrop-blur-md"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="w-8 h-8 rounded-full bg-black/50 hover:bg-[#c2410c] text-white border border-white/15 flex items-center justify-center transition cursor-pointer backdrop-blur-md"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="absolute bottom-4 right-6 z-20 flex items-center gap-1.5">
          {banners.map((b, idx) => (
            <button
              key={b.id}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentSlide
                  ? 'w-6 bg-[#ea580c]'
                  : 'w-2 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
