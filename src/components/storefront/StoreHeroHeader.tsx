import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { HamtineLogo } from '../common/HamtineLogo';
import {
  ShieldCheck,
  Truck,
  Phone,
  MessageCircle,
  QrCode,
  Share2,
  Check,
  Star,
  MapPin,
  Sparkles,
  CreditCard,
  Wrench,
  X,
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
        ? 'السلام عليكم حمتين تيليكوم 4، أود الاستفسار عن الهواتف المتوفرة أو خدمات الصيانة والتقسيط.'
        : 'Bonjour Hamtine Telecom 4, je souhaite me renseigner sur les téléphones et services disponibles.'
    );
    window.open(`https://wa.me/213699269292?text=${message}`, '_blank');
  };

  const handleDirectCall = () => {
    window.location.href = 'tel:0699269292';
  };

  return (
    <div className="relative mb-6">
      {/* Modern Compact Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          {/* Store Info */}
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border border-slate-200 bg-slate-50 p-2 flex items-center justify-center shadow-xs">
                <img
                  src="/hamtine-logo.svg"
                  alt="شعار حمتين تيليكوم 4"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span
                className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white"
                title="محل معتمد"
              >
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {t.storeName}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span>فرع 4 (الوادي)</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                  <Sparkles className="w-3 h-3" />
                  <span>{language === 'ar' ? 'توصيل لـ 58 ولاية' : '58 Wilayas'}</span>
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                {language === 'ar'
                  ? 'المتجر الرسمي لمحل حمتين تيليكوم 4: هواتف ذكية جديدة ومضمونة، إكسسوارات أصلية، صيانة فورية، ودفع عند الاستلام مع فحص الطرد قبل الدفع.'
                  : 'Boutique officielle Hamtine Telecom 4 : Smartphones certifiés, accessoires, SAV et paiement à la livraison 58 wilayas.'}
              </p>

              {/* Location and Timing */}
              <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap pt-1">
                <a
                  href="https://share.google/ychE3nVODcxqlIGDt"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-slate-700 hover:text-emerald-700 font-semibold transition"
                  title="موقع المحل على Google Maps"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'ar' ? 'الوادي: حي الاستقلال / مفترق طرق الملاح' : 'El Oued : Carrefour M\'lah'}</span>
                </a>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 font-medium">
                  {language === 'ar' ? 'السبت - الخميس: 09:00 - 21:00' : 'Sam - Jeu: 09h - 21h'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
            <button
              onClick={handleWhatsAppContact}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 font-bold text-xs sm:text-sm transition cursor-pointer shadow-xs"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>{language === 'ar' ? 'تواصل واتساب' : 'WhatsApp'}</span>
            </button>

            <button
              onClick={handleDirectCall}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 transition cursor-pointer"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span className="font-mono">0699 26 92 92</span>
            </button>

            <button
              onClick={() => setIsQrModalOpen(true)}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
              title={language === 'ar' ? 'رمز QR المتجر' : 'QR Code'}
            >
              <QrCode className="w-4 h-4" />
            </button>

            <button
              onClick={handleCopyLink}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
              title={language === 'ar' ? 'نسخ الرابط' : 'Copier lien'}
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Feature Highlights Row */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="flex items-center gap-2 text-slate-700 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
            <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold text-slate-900">{language === 'ar' ? 'دفع عند الاستلام' : 'Paiement à livraison'}</div>
              <div className="text-[11px] text-slate-500">{language === 'ar' ? 'مع حق فحص الطرد' : 'Vérification avant achat'}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-700 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <div className="font-bold text-slate-900">{language === 'ar' ? 'ضمان حقيقي' : 'Garantie légale'}</div>
              <div className="text-[11px] text-slate-500">{language === 'ar' ? 'هواتف مفحوصة ومؤكدة' : 'Produits certifiés'}</div>
            </div>
          </div>

          <div
            onClick={onOpenRepairs}
            className="flex items-center gap-2 text-slate-700 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 cursor-pointer hover:border-slate-300 transition"
          >
            <Wrench className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <div className="font-bold text-slate-900">{language === 'ar' ? 'ورشة تصليح فورية' : 'SAV Réparation'}</div>
              <div className="text-[11px] text-slate-500">{language === 'ar' ? 'تتبع تذكرتك مباشرة' : 'Suivi en ligne'}</div>
            </div>
          </div>

          <div
            onClick={onOpenInstallments}
            className="flex items-center gap-2 text-slate-700 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 cursor-pointer hover:border-slate-300 transition"
          >
            <CreditCard className="w-4 h-4 text-purple-600 shrink-0" />
            <div>
              <div className="font-bold text-slate-900">{language === 'ar' ? 'بيع بالتقسيط' : 'Facilité paiement'}</div>
              <div className="text-[11px] text-slate-500">{language === 'ar' ? '3، 6، أو 12 شهراً' : '3, 6 ou 12 mois'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-sm w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                {language === 'ar' ? 'رمز QR المتجر' : 'QR Code du magasin'}
              </h3>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-center border border-slate-100">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(storeUrl)}`}
                alt="QR Code"
                className="w-44 h-44 rounded-lg"
              />
            </div>

            <p className="text-center text-xs text-slate-500">
              {language === 'ar'
                ? 'امسح الرمز بكاميرا الهاتف لفتح المتجر مباشرة ومشاركته.'
                : 'Scannez avec votre appareil photo pour ouvrir la boutique.'}
            </p>

            <button
              onClick={handleCopyLink}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
            >
              {copiedLink
                ? (language === 'ar' ? 'تم النسخ!' : 'Copié!')
                : (language === 'ar' ? 'نسخ رابط المتجر' : 'Copier le lien')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
