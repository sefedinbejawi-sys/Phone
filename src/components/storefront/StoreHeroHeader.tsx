import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { HamtineLogo } from '../common/HamtineLogo';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  Phone,
  MessageCircle,
  QrCode,
  Share2,
  Copy,
  Check,
  Star,
  MapPin,
  Clock,
  Zap,
  ExternalLink,
  ChevronRight,
  Eye,
  Heart,
  TrendingUp,
} from 'lucide-react';

interface StoreHeroHeaderProps {
  onOpenInstallments?: () => void;
  onOpenRepairs?: () => void;
}

export const StoreHeroHeader: React.FC<StoreHeroHeaderProps> = ({
  onOpenInstallments,
  onOpenRepairs,
}) => {
  const { language, t, showToast } = useStore();
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const storeUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopiedLink(true);
    showToast(
      language === 'ar' ? 'تم نسخ رابط المتجر بنجاح' : 'Lien de la boutique copié',
      'success'
    );
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      language === 'ar'
        ? 'السلام عليكم، أود الاستفسار عن الهواتف المتوفرة والتصليح وقطع الغيار بمحل حمتين تيليكوم 4.'
        : 'Bonjour, je souhaite me renseigner sur les téléphones et pièces chez Hamtine Telecom 4.'
    );
    window.open(`https://wa.me/213699269292?text=${message}`, '_blank');
  };

  const handleDirectCall = () => {
    window.location.href = 'tel:0699269292';
  };

  return (
    <div className="relative mb-8 store-hero">
      {/* Store Card Container - Inspired by Showly Atelier Nova */}
      <div className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/[0.035] backdrop-blur-2xl shadow-2xl relative">
        {/* Cover Photo with Atmospheric Gradient Fade */}
        <div className="relative h-52 sm:h-64 md:h-80 w-full overflow-hidden store-hero-cover">
          <img
            src="/hero-phones.jpg"
            alt="Hamtine Telecom 4 Showroom"
            className="w-full h-full object-cover object-center filter brightness-[0.6] contrast-[1.15] scale-105 transition-transform duration-1000 hover:scale-100"
            referrerPolicy="no-referrer"
          />
          {/* Subtle Ambient Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#07080c] via-[#07080c]/65 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07080c]/85 via-transparent to-[#07080c]/50" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(225,29,72,0.15),transparent_70%)] pointer-events-none" />

          {/* Top Floating Pill Tags */}
          <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 flex items-center justify-between pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-2">
              <span className="flex items-center gap-2 rounded-full border border-white/15 bg-black/60 px-3.5 py-1.5 text-xs font-bold text-white/95 backdrop-blur-xl shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {language === 'ar' ? 'المحل مفتوح وجاهز للاستقبال والطلب' : 'Magasin Ouvert • Prêt à expédier'}
              </span>
              <span className="hidden sm:flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-600/15 px-3 py-1.5 text-xs font-black text-red-300 backdrop-blur-xl shadow-lg">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                {language === 'ar' ? 'المقر الرسمي - فرع 4' : 'Branche Officielle 4'}
              </span>
            </div>

            {/* Top Share Actions */}
            <div className="pointer-events-auto flex items-center gap-2">
              <button
                onClick={() => setIsQrModalOpen(true)}
                className="grid h-10 w-10 place-items-center rounded-2xl border border-white/15 bg-black/50 text-white/85 backdrop-blur-xl transition hover:bg-red-600/30 hover:border-red-500/50 hover:text-white cursor-pointer shadow-lg"
                title={language === 'ar' ? 'رمز QR المتجر' : 'QR Code de la boutique'}
              >
                <QrCode className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopyLink}
                className="grid h-10 w-10 place-items-center rounded-2xl border border-white/15 bg-black/50 text-white/85 backdrop-blur-xl transition hover:bg-red-600/30 hover:border-red-500/50 hover:text-white cursor-pointer shadow-lg"
                title={language === 'ar' ? 'نسخ رابط المتجر' : 'Copier le lien'}
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Profile Content Body */}
        <div className="relative px-5 sm:px-8 pb-8 -mt-16 sm:-mt-20 store-hero-body">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            {/* Left: Avatar Monogram Logo + Store Identity */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              {/* Official Storefront Logo */}
              <div className="relative">
                <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-3xl border-2 border-red-500/40 bg-[#0c0e17] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl flex items-center justify-center group">
                  <img
                    src="/hamtine-logo.svg"
                    alt="شعار حمتين تيليكوم 4"
                    className="w-full h-full object-contain rounded-2xl drop-shadow-[0_4px_12px_rgba(225,29,72,0.4)] transition-transform duration-300 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400 text-[#08090d] ring-4 ring-[#08090d] shadow-lg" title="Vérifié">
                  <Check className="w-4 h-4 stroke-[3]" />
                </span>
              </div>

              {/* Title & Tagline */}
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {t.storeName}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full border border-red-500/40 bg-gradient-to-r from-red-600/30 to-amber-500/30 px-3 py-0.5 text-xs font-black text-amber-300 shadow-sm">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>فرع 4 (الوادي)</span>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-xs font-extrabold text-emerald-300">
                    <Sparkles className="w-3 h-3" />
                    <span>58 {language === 'ar' ? 'ولاية' : 'Wilayas'}</span>
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-neutral-300 max-w-xl font-normal leading-relaxed">
                  {language === 'ar'
                    ? 'متجر وورشة حمتين تيليكوم 4: بيع وتصليح الهواتف الذكية وقطع الغيار بالجملة والتجزئة والإكسسوارات الأصلية مع خدمة التوصيل السريع لـ 58 ولاية وفحص الطرد قبل الدفع عند الاستلام.'
                    : 'Hamtine Telecom 4: Vente de smartphones neufs et d\'occasion garantis, accessoires et pièces détachées, réparation immédiate et livraison 58 wilayas.'}
                </p>

                {/* Location & Key Badges */}
                <div className="flex items-center gap-3 sm:gap-4 text-xs text-neutral-400 flex-wrap pt-1">
                  <a
                    href="https://share.google/ychE3nVODcxqlIGDt"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-300 font-bold transition"
                    title="فتح موقع المحل على خرائط جوجل"
                  >
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{language === 'ar' ? 'الوادي: مفترق طرق الملاح (Google Maps 📍)' : 'El Oued: Carrefour M\'lah (Google Maps 📍)'}</span>
                  </a>
                  <span className="text-white/20">•</span>
                  <span className="flex items-center gap-1 text-neutral-300">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-white">4.95</span>
                    <span className="text-neutral-400">(+2,480 {language === 'ar' ? 'تقييم موثق' : 'avis'})</span>
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <Truck className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'توصيل خلال 24-48 ساعة' : 'Expédition 24-48h'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Direct Action Buttons (WhatsApp & Call) in Showly style */}
            <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
              <button
                onClick={handleWhatsAppContact}
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 hover:bg-emerald-300 px-5 py-3.5 font-extrabold text-[#08090d] text-xs sm:text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(52,211,153,.3)] cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>{language === 'ar' ? 'طلب فوري عبر واتساب' : 'Commander via WhatsApp'}</span>
              </button>

              <button
                onClick={handleDirectCall}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] hover:border-white/30 px-4 py-3.5 text-xs sm:text-sm font-bold text-white transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline font-mono">0699 26 92 92</span>
                <span className="sm:hidden">{language === 'ar' ? 'اتصال' : 'Appeler'}</span>
              </button>

              <button
                onClick={() => setIsQrModalOpen(true)}
                className="grid h-12 w-12 place-items-center rounded-2xl border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] text-white/90 transition cursor-pointer"
                title={language === 'ar' ? 'مشاركة QR Code' : 'Partager QR'}
              >
                <QrCode className="w-5 h-5 text-emerald-400" />
              </button>
            </div>
          </div>

          {/* Bottom Metric Badges Row (Atelier Nova Stats Bar) */}
          <div className="mt-7 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-neutral-400 font-medium">{language === 'ar' ? 'الدفع عند الاستلام' : 'Paiement COD'}</div>
                <div className="text-xs sm:text-sm font-extrabold text-white">{language === 'ar' ? 'مع حق المعاينة' : 'Avec test avant achat'}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-400/10 text-sky-400 border border-sky-400/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-neutral-400 font-medium">{language === 'ar' ? 'ضمان حقيقي' : 'Garantie légale'}</div>
                <div className="text-xs sm:text-sm font-extrabold text-white">{language === 'ar' ? '6 إلى 12 شهراً' : '6 à 12 mois'}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 flex items-center gap-3 cursor-pointer hover:border-amber-400/40 transition" onClick={onOpenInstallments}>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-neutral-400 font-medium">{language === 'ar' ? 'التقسيط الميسر' : 'Facilité paiement'}</div>
                <div className="text-xs sm:text-sm font-extrabold text-white">{language === 'ar' ? '3، 6 أو 12 شهراً' : '3, 6 ou 12 mois'}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-400/10 text-purple-400 border border-purple-400/20">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-neutral-400 font-medium">{language === 'ar' ? 'نشاط المتجر اليوم' : 'Visites en direct'}</div>
                <div className="text-xs sm:text-sm font-extrabold text-white">1,840+ {language === 'ar' ? 'زيارة' : 'visites'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Showly-Style QR Code Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-[#0f1118] p-6 text-white shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-400 flex items-center justify-center text-[#08090d] font-black text-xs">
                  H4
                </div>
                <h3 className="font-extrabold text-sm sm:text-base">
                  {language === 'ar' ? 'رمز QR ومشاركة المتجر' : 'QR Code de la boutique'}
                </h3>
              </div>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* QR Card Showcase */}
            <div className="p-6 rounded-2xl bg-white flex flex-col items-center justify-center space-y-3 shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(storeUrl)}&color=08090d`}
                alt="Store QR Code"
                className="w-48 h-48 object-contain"
              />
              <div className="text-center">
                <span className="text-xs font-black text-[#08090d] tracking-wider uppercase block">
                  DZ PHONE STORE
                </span>
                <span className="text-[11px] font-bold text-neutral-500">
                  {language === 'ar' ? 'امسح الرمز لزيارة المتجر ومشاركة العروض' : 'Scannez pour ouvrir le catalogue'}
                </span>
              </div>
            </div>

            {/* Quick Link Copy & WhatsApp Share */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleCopyLink}
                className="w-full py-3 px-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-[#08090d] font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? (language === 'ar' ? 'تم النسخ!' : 'Copié !') : (language === 'ar' ? 'نسخ رابط المتجر' : 'Copier le lien direct')}</span>
              </button>

              <button
                onClick={() => {
                  const shareMsg = encodeURIComponent(`شاهد أفضل عروض الهواتف الأصلية والمستعملة بالتقسيط والدفع عند الاستلام في متجر ديزاد فون:\n${storeUrl}`);
                  window.open(`https://api.whatsapp.com/send?text=${shareMsg}`, '_blank');
                }}
                className="w-full py-2.5 px-4 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>{language === 'ar' ? 'مشاركة عبر واتساب' : 'Partager sur WhatsApp'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
