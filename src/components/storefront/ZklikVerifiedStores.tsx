import React from 'react';
import {
  Store,
  CheckCircle2,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Star,
  ShieldCheck,
  Truck,
  ExternalLink,
} from 'lucide-react';

interface ZklikVerifiedStoresProps {
  language?: 'ar' | 'fr';
  onOpenStoreModal?: () => void;
}

export const ZklikVerifiedStores: React.FC<ZklikVerifiedStoresProps> = ({
  language = 'ar',
}) => {
  const stores = [
    {
      id: 'store-main',
      nameAr: 'حمتين تيليكوم 4 - المقر الرئيسي',
      nameFr: 'Hamtine Telecom 4 - Showroom Principal',
      category: language === 'ar' ? 'متجر إلكتروني ومحل رسمي موثوق' : 'Boutique Officielle Vérifiée',
      cityAr: 'الجزائر العاصمة',
      cityFr: 'Alger',
      addressAr: 'شارع فلسطين التجاري، المحل رقم 04، بجانب بريد الجزائر',
      addressFr: 'Rue Palestine Commerciale, Magasin N°04, Alger',
      phone: '0699269292',
      hours: language === 'ar' ? 'السبت - الخميس: 09:00 - 21:00' : 'Sam - Jeu : 09h00 - 21h00',
      verified: true,
      rating: 4.9,
      reviewsCount: 640,
      delivery58: true,
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'store-lab',
      nameAr: 'مخبر الصيانة السريعة - فرع التقنية',
      nameFr: 'Laboratoire SAV & Réparations',
      category: language === 'ar' ? 'مركز صيانة وفحص إلكتروني معتمد' : 'Centre SAV & Diagnostic',
      cityAr: 'الجزائر / سطيف',
      cityFr: 'Alger / Sétif',
      addressAr: 'مركز الخدمات الإلكترونية، الطابق الأول',
      addressFr: 'Centre de Service Électronique, 1er étage',
      phone: '0550123456',
      hours: language === 'ar' ? 'السبت - الخميس: 08:30 - 18:30' : 'Sam - Jeu : 08h30 - 18h30',
      verified: true,
      rating: 4.8,
      reviewsCount: 310,
      delivery58: true,
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="mb-10">
      {/* Header */}
      <div className="flex items-center justify-between px-1 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#c2410c]/20 text-[#f97316]">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              {language === 'ar' ? 'المتاجر والمراكز الموثوقة' : 'Boutiques et Points Vérifiés'}
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" />
                {language === 'ar' ? 'معتمد زكليك' : 'Vérifié'}
              </span>
            </h3>
            <p className="text-xs text-neutral-400">
              {language === 'ar'
                ? 'محلات حقيقية على أرض الواقع مع خدمة التوصيل والاستلام يد بيد'
                : 'Points de vente réels avec retrait sur place ou expédition'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Verified Stores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stores.map((store) => (
          <div
            key={store.id}
            className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-[#c2410c]/40 transition-all duration-300 shadow-xl flex flex-col sm:flex-row gap-4 relative group"
          >
            {/* Store Thumbnail */}
            <div className="w-full sm:w-36 h-36 rounded-xl overflow-hidden shrink-0 relative bg-black/40 border border-white/10">
              <img
                src={store.image}
                alt={store.nameAr}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1 backdrop-blur-md">
                <CheckCircle2 className="w-2.5 h-2.5" />
                {language === 'ar' ? 'بائع موثوق' : 'Certifié'}
              </span>
            </div>

            {/* Store Info */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-sm text-white leading-tight">
                    {language === 'ar' ? store.nameAr : store.nameFr}
                  </h4>
                  <div className="flex items-center gap-1 text-xs font-black text-amber-400 shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{store.rating}</span>
                    <span className="text-[10px] text-neutral-400 font-normal">({store.reviewsCount})</span>
                  </div>
                </div>

                <span className="text-[11px] text-[#f97316] font-medium block mt-0.5">
                  {store.category}
                </span>

                <div className="mt-2 space-y-1 text-xs text-neutral-300">
                  <div className="flex items-center gap-1.5 text-neutral-300">
                    <MapPin className="w-3.5 h-3.5 text-[#c2410c] shrink-0" />
                    <span className="line-clamp-1">{language === 'ar' ? store.addressAr : store.addressFr}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-400 text-[11px]">
                    <Clock className="w-3 h-3 text-neutral-400 shrink-0" />
                    <span>{store.hours}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                <a
                  href={`tel:${store.phone}`}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition border border-white/10"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{store.phone}</span>
                </a>

                <a
                  href={`https://wa.me/213${store.phone.substring(1)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-1.5 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1 transition border border-emerald-500/30"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>واتساب</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
