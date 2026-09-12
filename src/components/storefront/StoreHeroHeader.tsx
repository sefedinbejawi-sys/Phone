import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { HamtineLogo } from '../common/HamtineLogo';
import {
  Check,
  Copy,
  CreditCard,
  MessageCircle,
  Phone,
  QrCode,
  Search,
  Share2,
  ShieldCheck,
  Star,
  Truck,
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
    showToast(language === 'ar' ? 'تم نسخ رابط المتجر بنجاح' : 'Lien copié', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      language === 'ar'
        ? 'السلام عليكم، أود الاستفسار عن الهواتف المتوفرة والتصليح والإكسسوارات.'
        : 'Bonjour, je souhaite me renseigner sur les téléphones et accessoires.'
    );
    window.open(`https://wa.me/213699269292?text=${message}`, '_blank');
  };

  return (
    <section className="hub-hero store-hero">
      <div className="hub-hero-image store-hero-cover">
        <img src="/hero-phones.jpg" alt="هواتف حمتين تيليكوم داخل الورشة" />
        <div className="hub-hero-image-shade" />
        <div className="hub-hero-actions">
          <button type="button" onClick={() => setIsQrModalOpen(true)} aria-label="مشاركة المتجر" title="مشاركة المتجر">
            <Share2 className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setIsQrModalOpen(true)} aria-label="رمز QR" title="رمز QR">
            <QrCode className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="hub-hero-content store-hero-body">
        <div className="hub-hero-brand">
          <div className="hub-logo-frame"><HamtineLogo size="md" /></div>
          <div>
            <p className="hub-eyebrow">{language === 'ar' ? 'دار الهاتف — الوادي' : 'Dar الهاتف — El Oued'}</p>
            <h1>{language === 'ar' ? 'هاتفك الجديد يوصلك للباب، وهاتفك القديم نصلحه في الورشة.' : 'Votre nouveau téléphone livré, votre ancien réparé en atelier.'}</h1>
            <p className="hub-hero-description">
              {language === 'ar'
                ? `${t.storeName} — توصيل إلى 58 ولاية، الدفع عند الاستلام، وإمكانية التقسيط.`
                : `${t.storeName} — livraison dans 58 wilayas, paiement à la livraison et facilité.`}
            </p>
          </div>
        </div>

        <div className="hub-hero-buttons">
          <button type="button" className="hub-btn hub-btn-primary" onClick={() => document.getElementById('products-catalog')?.scrollIntoView({ behavior: 'smooth' })}>
            <Search className="h-5 w-5" />
            {language === 'ar' ? 'تصفح الهواتف' : 'Voir les téléphones'}
          </button>
          <button type="button" className="hub-btn hub-btn-secondary" onClick={onOpenRepairs}>
            <Wrench className="h-5 w-5" />
            {language === 'ar' ? 'طلب تصليح' : 'Demander une réparation'}
          </button>
        </div>

        <div className="hub-hero-contact-row">
          <button type="button" onClick={handleWhatsAppContact} className="hub-inline-action hub-whatsapp-action">
            <MessageCircle className="h-4 w-4" />
            {language === 'ar' ? 'واتساب' : 'WhatsApp'}
          </button>
          <a href="tel:0699269292" className="hub-inline-action">
            <Phone className="h-4 w-4" />
            <span dir="ltr">0699 26 92 92</span>
          </a>
          <a href="https://share.google/ychE3nVODcxqlIGDt" target="_blank" rel="noreferrer" className="hub-location-link">
            {language === 'ar' ? 'موقع المحل في الوادي' : 'Localisation El Oued'}
          </a>
        </div>

        <div className="hub-benefits-grid">
          <button type="button" onClick={onOpenInstallments} className="hub-benefit">
            <CreditCard className="h-5 w-5" />
            <span><strong>{language === 'ar' ? 'التقسيط الميسر' : 'Facilité'}</strong><small>3، 6 أو 12 شهراً</small></span>
          </button>
          <div className="hub-benefit">
            <Truck className="h-5 w-5" />
            <span><strong>{language === 'ar' ? 'توصيل 58 ولاية' : '58 wilayas'}</strong><small>{language === 'ar' ? 'للمنزل أو نقطة استلام' : 'Domicile ou point relais'}</small></span>
          </div>
          <div className="hub-benefit">
            <ShieldCheck className="h-5 w-5" />
            <span><strong>{language === 'ar' ? 'ضمان المحل' : 'Garantie'}</strong><small>{language === 'ar' ? 'على الهواتف والتصليح' : 'Téléphones et réparations'}</small></span>
          </div>
          <div className="hub-benefit">
            <Wrench className="h-5 w-5" />
            <span><strong>{language === 'ar' ? 'ورشة تصليح' : 'Atelier'}</strong><small>{language === 'ar' ? 'تتبع الحالة برقم التذكرة' : 'Suivi par ticket'}</small></span>
          </div>
        </div>
      </div>

      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm space-y-4 rounded-2xl bg-[#24313d] p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">{language === 'ar' ? 'مشاركة المتجر' : 'Partager la boutique'}</h2>
              <button type="button" onClick={() => setIsQrModalOpen(false)} aria-label="إغلاق"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-4">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(storeUrl)}&color=24313d`} alt="QR Code" className="h-48 w-48" />
              <span className="text-xs font-bold text-[#24313d]">امسح الرمز لزيارة المتجر</span>
            </div>
            <button type="button" onClick={handleCopyLink} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c86b3c] font-bold">
              {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedLink ? 'تم النسخ' : 'نسخ رابط المتجر'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default StoreHeroHeader;
