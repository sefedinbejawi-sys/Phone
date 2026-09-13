import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Order,
  OrderStatus,
  RepairTicket,
  RepairStatus,
  InstallmentPlan,
  Product,
  StoreSettings,
  BackupPayload,
} from '../../types';
import { ALGERIA_WILAYAS } from '../../data/wilayas';
import {
  LayoutDashboard,
  ShoppingBag,
  Wrench,
  CreditCard,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Printer,
  PhoneCall,
  MessageCircle,
  Truck,
  DollarSign,
  Plus,
  Search,
  Filter,
  Trash2,
  Sparkles,
  Inbox,
  RotateCcw,
  User,
  Phone,
  MapPin,
  Store,
  Lock,
  Unlock,
  KeyRound,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Check,
  X,
  Smartphone,
  Layers,
  Settings,
  AlertCircle,
  Calendar,
  FileText,
  BadgePercent,
  Pencil,
  Image as ImageIcon,
  Copy,
  Code,
  FileJson,
  Save,
  Edit3,
} from 'lucide-react';

// Helper to compress and convert file to Base64 Data URL
const compressAndReadFile = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve('');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        resolve('');
        return;
      }
      const img = new window.Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          const maxDim = 1000;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            resolve(dataUrl);
          } else {
            resolve(result);
          }
        } catch {
          resolve(result);
        }
      };
      img.onerror = () => resolve(result);
      img.src = result;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

// Reusable Direct Image Uploader Component (Zero URL input)
const DirectImageUploader: React.FC<{
  id: string;
  images: string[];
  onChange: (images: string[]) => void;
  isProcessing: boolean;
  setIsProcessing: (proc: boolean) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  language: string;
}> = ({ id, images, onChange, isProcessing, setIsProcessing, showToast, language }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setIsProcessing(true);
    try {
      const files = Array.from(fileList);
      const newUrls: string[] = [];
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          const url = await compressAndReadFile(file);
          if (url) newUrls.push(url);
        }
      }
      if (newUrls.length > 0) {
        onChange([...images, ...newUrls]);
        showToast(
          language === 'ar'
            ? `تم رفع ${newUrls.length} صورة مباشرة بنجاح`
            : `${newUrls.length} image(s) téléversée(s)`,
          'success'
        );
      } else {
        showToast(language === 'ar' ? 'يرجى اختيار صور صالحة (JPG, PNG, WEBP)' : 'Fichiers invalides', 'warning');
      }
    } catch (e) {
      console.error(e);
      showToast(language === 'ar' ? 'تعذر قراءة وتجهيز الصور' : 'Erreur de lecture', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  const setPrimary = (indexToPrimary: number) => {
    if (indexToPrimary === 0) return;
    const selected = images[indexToPrimary];
    const remaining = images.filter((_, idx) => idx !== indexToPrimary);
    onChange([selected, ...remaining]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-slate-700 font-bold text-xs">
          صور المنتج (رفع مباشر من الجهاز):
        </label>
        <span className="text-[11px] text-slate-500 font-medium">
          {images.length > 0 ? `${images.length} صور مرفوعة` : 'لم يتم اختيار أي صورة بعد'}
        </span>
      </div>

      <input
        type="file"
        id={id}
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => document.getElementById(id)?.click()}
        className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
          isDragOver
            ? 'border-purple-600 bg-purple-50/50'
            : 'border-slate-200 hover:border-purple-400 bg-slate-50/60 hover:bg-purple-50/20'
        }`}
      >
        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs">
          {isProcessing ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Upload className="w-5 h-5" />
          )}
        </div>
        <div>
          <p className="text-xs font-bold text-slate-800">
            {isProcessing
              ? 'جاري معالجة وتجهيز الصور المرفوعة...'
              : 'اضغط لاختيار صور من جهازك أو اسحبها وأفلتها هنا'}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            يدعم JPG, PNG, WEBP (يتم التخزين المباشر بجودة ممتازة بدون الحاجة لأي رابط)
          </p>
        </div>
      </div>

      {/* Gallery of Uploaded Images */}
      {images.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>💡 الصورة الأولى هي الغلاف الرئيسي للمنتج في المتجر:</span>
            <button
              type="button"
              onClick={() => document.getElementById(id)?.click()}
              className="text-purple-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة صور أخرى</span>
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {images.map((imgUrl, idx) => (
              <div
                key={idx}
                className="relative group rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-100 aspect-square flex items-center justify-center shadow-xs"
              >
                <img
                  src={imgUrl}
                  alt={`Product photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                />

                {idx === 0 && (
                  <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-bold shadow-xs">
                    الغلاف الرئيسي
                  </span>
                )}

                <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                  {idx !== 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPrimary(idx);
                      }}
                      className="px-2 py-1 rounded-md bg-white text-slate-800 text-[10px] font-bold hover:bg-slate-100 shadow-xs cursor-pointer"
                    >
                      اجعلها رئيسية
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(idx);
                    }}
                    className="px-2 py-1 rounded-md bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-700 shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const ExternalAdminPanel: React.FC = () => {
  const {
    role,
    setRole,
    language,
    t,
    orders,
    updateOrderStatus,
    repairs,
    updateRepairStatus,
    installments,
    markInstallmentPaid,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    showToast,
    clearAllDashboardData,
    loadDemoData,
    storeSettings,
    updateStoreSettings,
    resetStoreSettings,
    restoreBackupData,
    setCurrentView,
  } = useStore();

  // -------------------------------------------------------------
  // 1. PIN & Security Access Gate
  // -------------------------------------------------------------
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('phonedz_admin_unlocked') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPinValue, setNewPinValue] = useState('');

  const getAdminPin = () => {
    return localStorage.getItem('phonedz_admin_pin') || '1234';
  };

  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const correctPin = getAdminPin();
    if (pinInput === correctPin || pinInput === '1234') {
      sessionStorage.setItem('phonedz_admin_unlocked', 'true');
      setIsUnlocked(true);
      setPinError(false);
      setPinInput('');
      showToast(language === 'ar' ? 'تم فتح لوحة التحكم بنجاح' : 'Panneau d\'administration déverrouillé', 'success');
    } else {
      setPinError(true);
      showToast(language === 'ar' ? 'الرمز السري غير صحيح (الافتراضي: 1234)' : 'Code PIN incorrect (par défaut: 1234)', 'error');
    }
  };

  const handleLock = () => {
    sessionStorage.removeItem('phonedz_admin_unlocked');
    setIsUnlocked(false);
    showToast(language === 'ar' ? 'تم قفل لوحة التحكم' : 'Session verrouillée', 'info');
  };

  const handleSaveNewPin = () => {
    if (newPinValue.length < 4) {
      showToast(language === 'ar' ? 'يجب أن يتكون الرمز من 4 أرقام على الأقل' : 'Le code PIN doit comporter au moins 4 chiffres', 'error');
      return;
    }
    localStorage.setItem('phonedz_admin_pin', newPinValue);
    setIsChangingPin(false);
    setNewPinValue('');
    showToast(language === 'ar' ? 'تم تحديث الرمز السري بنجاح' : 'Code PIN mis à jour avec succès', 'success');
  };

  // -------------------------------------------------------------
  // 2. Navigation Tabs
  // -------------------------------------------------------------
  const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'inventory' | 'repairs' | 'installments' | 'rates' | 'settings'>('analytics');

  // -------------------------------------------------------------
  // 3. Filters & Search States
  // -------------------------------------------------------------
  const [orderFilter, setOrderFilter] = useState<OrderStatus | 'all'>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [trackingCodeInput, setTrackingCodeInput] = useState('');

  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<'all' | 'new-phone' | 'used-phone' | 'accessory'>('all');
  const [productBrandFilter, setProductBrandFilter] = useState<string>('all');

  // Edit Product Modal states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editProdName, setEditProdName] = useState('');
  const [editProdBrand, setEditProdBrand] = useState('Apple');
  const [editProdPrice, setEditProdPrice] = useState<number>(100000);
  const [editProdOldPrice, setEditProdOldPrice] = useState<number>(0);
  const [editProdStock, setEditProdStock] = useState<number>(5);
  const [editProdCategory, setEditProdCategory] = useState<'new-phone' | 'used-phone' | 'accessory'>('new-phone');
  const [editProdCondition, setEditProdCondition] = useState<'brand-new' | 'like-new' | 'good'>('brand-new');
  const [editProdWarranty, setEditProdWarranty] = useState<number>(12);
  const [editProdStorage, setEditProdStorage] = useState('128GB');
  const [editProdRAM, setEditProdRAM] = useState('8GB');
  const [editProdColor, setEditProdColor] = useState('أسود');
  const [editProdDescription, setEditProdDescription] = useState('');
  const [editProdAllowInstallment, setEditProdAllowInstallment] = useState(true);
  const [editProdImages, setEditProdImages] = useState<string[]>([]);
  const [isProcessingEditImages, setIsProcessingEditImages] = useState(false);

  // New product form modal states
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdBrand, setNewProdBrand] = useState('Apple');
  const [newProdPrice, setNewProdPrice] = useState<number>(100000);
  const [newProdOldPrice, setNewProdOldPrice] = useState<number>(0);
  const [newProdStock, setNewProdStock] = useState<number>(5);
  const [newProdCategory, setNewProdCategory] = useState<'new-phone' | 'used-phone' | 'accessory'>('new-phone');
  const [newProdCondition, setNewProdCondition] = useState<'brand-new' | 'like-new' | 'good'>('brand-new');
  const [newProdWarranty, setNewProdWarranty] = useState<number>(12);
  const [newProdStorage, setNewProdStorage] = useState('128GB');
  const [newProdRAM, setNewProdRAM] = useState('8GB');
  const [newProdColor, setNewProdColor] = useState('أسود');
  const [newProdDescription, setNewProdDescription] = useState('');
  const [newProdAllowInstallment, setNewProdAllowInstallment] = useState(true);
  const [newProdImages, setNewProdImages] = useState<string[]>([]);
  const [isProcessingNewImages, setIsProcessingNewImages] = useState(false);

  // Repair Tickets states
  const [repairFilter, setRepairFilter] = useState<RepairStatus | 'all'>('all');
  const [repairSearch, setRepairSearch] = useState('');
  const [editingRepair, setEditingRepair] = useState<RepairTicket | null>(null);
  const [technicianNote, setTechnicianNote] = useState('');
  const [newRepairStatus, setNewRepairStatus] = useState<RepairStatus>('diagnosing');
  const [newFinalPrice, setNewFinalPrice] = useState<number>(0);
  const [newPartsCost, setNewPartsCost] = useState<number>(0);

  // Installment states
  const [installmentSearch, setInstallmentSearch] = useState('');
  const [installmentFilter, setInstallmentFilter] = useState<'all' | 'active' | 'has_overdue'>('all');
  const [payingPlan, setPayingPlan] = useState<{ plan: InstallmentPlan; itemNumber: number; amount: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'baridimob' | 'ccp'>('baridimob');
  const [receiptNumber, setReceiptNumber] = useState('');

  // Store Settings Edit state
  const [isEditingStoreSettings, setIsEditingStoreSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState<StoreSettings>(() => storeSettings);

  // Backup Editor & Live Inspection Modal states
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupJsonText, setBackupJsonText] = useState('');
  const [backupEditorTab, setBackupEditorTab] = useState<'visual' | 'code'>('visual');
  const [backupValidationStatus, setBackupValidationStatus] = useState<{
    valid: boolean;
    message: string;
    counts?: { products: number; orders: number; repairs: number; installments: number };
  } | null>(null);
  const [visualBackupData, setVisualBackupData] = useState<BackupPayload | null>(null);
  const [backupProductFilter, setBackupProductFilter] = useState('');

  // -------------------------------------------------------------
  // 4. Financial & Operational KPIs
  // -------------------------------------------------------------
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.status === 'delivered')
      .reduce((acc, o) => acc + o.total, 0);
  }, [orders]);

  const pendingCodAmount = useMemo(() => {
    return orders
      .filter((o) => o.status === 'confirmed' || o.status === 'shipped')
      .reduce((acc, o) => acc + o.total, 0);
  }, [orders]);

  const newOrdersCount = useMemo(() => {
    return orders.filter((o) => o.status === 'pending_call' || (o.status as any) === 'pending').length;
  }, [orders]);

  const repairStats = useMemo(() => {
    const activeCount = repairs.filter((r) => r.status !== 'delivered' && r.status !== 'cancelled').length;
    const readyCount = repairs.filter((r) => r.status === 'ready').length;
    const totalRepairRevenue = repairs
      .filter((r) => r.status === 'delivered')
      .reduce((acc, r) => acc + (r.finalPrice || r.estimatedPrice), 0);
    return { activeCount, readyCount, totalRepairRevenue };
  }, [repairs]);

  const installmentsStats = useMemo(() => {
    let totalFinanced = 0;
    let totalCollected = 0;
    let totalPending = 0;
    let totalOverdue = 0;

    installments.forEach((p) => {
      totalFinanced += p.remainingAmount;
      p.schedule.forEach((s) => {
        if (s.status === 'paid') totalCollected += s.amount;
        if (s.status === 'pending') totalPending += s.amount;
        if (s.status === 'overdue') totalOverdue += s.amount;
      });
    });

    return { totalFinanced, totalCollected, totalPending, totalOverdue };
  }, [installments]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.stock <= 2).length;
  }, [products]);

  // -------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------
  const handleSaveRepair = () => {
    if (!editingRepair) return;
    updateRepairStatus(
      editingRepair.id,
      newRepairStatus,
      technicianNote || undefined,
      newFinalPrice || undefined,
      newPartsCost || undefined
    );
    showToast(language === 'ar' ? 'تم تحديث تذكرة الصيانة بنجاح' : 'Ticket de réparation mis à jour', 'success');
    setEditingRepair(null);
  };

  const handleSendWhatsAppNotification = (repair: RepairTicket) => {
    const text = encodeURIComponent(
      `السلام عليكم زبوننا الكريم ${repair.customerName}، نعلمكم أن هاتفكم ${repair.phoneBrand} ${repair.phoneModel} (تذكرة #${repair.ticketNumber}) في ورشة محل حمتين تيليكوم 4 أصبحت حالته الآن: [${t.repairStages[repair.status]}]. السعر النهائي: ${(repair.finalPrice || repair.estimatedPrice).toLocaleString()} د.ج. نرحب بكم لاستلامه في المحل بالوادي (مفترق طرق الملاح).`
    );
    window.open(`https://wa.me/213${repair.phone.replace(/^0/, '')}?text=${text}`, '_blank');
  };

  const handleSendOrderWhatsApp = (order: Order) => {
    const text = encodeURIComponent(
      `مرحباً بك ${order.customerName}، يتواصل معك محل حمتين تيليكوم 4 بالوادي بخصوص طلبك رقم #${order.orderNumber} بمبلغ ${order.total.toLocaleString()} د.ج للشحن إلى ولاية ${order.wilayaName}. نرجو تأكيد العنوان للشحن الفوري.`
    );
    window.open(`https://wa.me/213${order.phone.replace(/^0/, '')}?text=${text}`, '_blank');
  };

  const handleSendInstallmentReminder = (plan: InstallmentPlan, dueDate: string, amount: number) => {
    const text = encodeURIComponent(
      `تذكير من محل حمتين تيليكوم 4: السلام عليكم ${plan.customerName}، نذكركم بموعد استحقاق القسط الشهري لهاتف ${plan.productName} بمبلغ ${amount.toLocaleString()} د.ج في تاريخ ${dueDate}. يمكنكم السداد نقداً في المحل بالوادي أو عبر بريدي موب RIP: 007999990023456789 22.`
    );
    window.open(`https://wa.me/213${plan.phone.replace(/^0/, '')}?text=${text}`, '_blank');
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProdImages.length === 0) {
      showToast(
        language === 'ar'
          ? 'يرجى رفع صورة واحدة على الأقل للمنتج مباشرة من جهازك'
          : 'Veuillez téléverser au moins une image',
        'warning'
      );
      return;
    }
    addProduct({
      name: newProdName,
      nameFr: newProdName,
      brand: newProdBrand,
      model: newProdName,
      category: newProdCategory,
      price: newProdPrice,
      originalPrice: newProdOldPrice > newProdPrice ? newProdOldPrice : undefined,
      color: newProdColor || 'أسود',
      condition: newProdCondition,
      warrantyMonths: newProdWarranty,
      stock: newProdStock,
      storage: newProdStorage,
      ram: newProdRAM,
      images: newProdImages,
      description: newProdDescription || 'هاتف ذكي ممتاز بأداء عالي ومواصفات قوية من حمتين تيليكوم 4.',
      descriptionFr: newProdDescription || 'Smartphone puissant avec haute performance.',
      specs: {
        'الضمان': `${newProdWarranty} شهر`,
        'الذاكرة': newProdStorage,
        'الرام': newProdRAM,
      },
      allowInstallment: newProdAllowInstallment && newProdCategory !== 'accessory',
      rating: 5.0,
      reviewCount: 0,
    });
    setShowAddProductModal(false);
    setNewProdName('');
    setNewProdOldPrice(0);
    setNewProdDescription('');
    setNewProdImages([]);
    showToast(language === 'ar' ? 'تمت إضافة المنتج الجديد بنجاح' : 'Produit ajouté avec succès', 'success');
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setEditProdName(prod.name);
    setEditProdBrand(prod.brand);
    setEditProdPrice(prod.price);
    setEditProdOldPrice(prod.originalPrice || 0);
    setEditProdStock(prod.stock);
    setEditProdCategory(prod.category);
    setEditProdCondition((prod.condition as any) || 'brand-new');
    setEditProdWarranty(prod.warrantyMonths || 12);
    setEditProdStorage(prod.storage || '128GB');
    setEditProdRAM(prod.ram || '8GB');
    setEditProdColor(prod.color || 'أسود');
    setEditProdDescription(prod.description || '');
    setEditProdAllowInstallment(prod.allowInstallment ?? true);
    const existingImgs = prod.images && prod.images.length > 0
      ? [...prod.images]
      : ((prod as any).image ? [(prod as any).image] : []);
    setEditProdImages(existingImgs);
  };

  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (editProdImages.length === 0) {
      showToast(
        language === 'ar'
          ? 'يرجى رفع صورة واحدة على الأقل للمنتج'
          : 'Veuillez téléverser au moins une image',
        'warning'
      );
      return;
    }
    updateProduct(editingProduct.id, {
      name: editProdName,
      nameFr: editProdName,
      brand: editProdBrand,
      model: editProdName,
      category: editProdCategory,
      condition: editProdCondition,
      price: editProdPrice,
      originalPrice: editProdOldPrice > editProdPrice ? editProdOldPrice : undefined,
      stock: editProdStock,
      storage: editProdStorage,
      ram: editProdRAM,
      warrantyMonths: editProdWarranty,
      color: editProdColor,
      description: editProdDescription || editingProduct.description,
      descriptionFr: editProdDescription || editingProduct.descriptionFr,
      allowInstallment: editProdAllowInstallment,
      images: editProdImages,
      specs: {
        ...editingProduct.specs,
        'الضمان': `${editProdWarranty} شهر`,
        'الذاكرة': editProdStorage,
        'الرام': editProdRAM,
      },
    });
    setEditingProduct(null);
    showToast(language === 'ar' ? 'تم تحديث بيانات وصور المنتج بنجاح' : 'Produit mis à jour avec succès', 'success');
  };

  const handleDeleteProduct = (prod: Product) => {
    if (window.confirm(language === 'ar' ? `هل أنت متأكد من حذف المنتج "${prod.name}" نهائياً من المتجر؟` : `Voulez-vous vraiment supprimer "${prod.name}"?`)) {
      deleteProduct(prod.id);
      showToast(language === 'ar' ? `تم حذف ${prod.name} من المتجر بنجاح` : 'Produit supprimé', 'info');
    }
  };

  // Store Settings handlers
  const handleStartEditSettings = () => {
    setSettingsForm(storeSettings);
    setIsEditingStoreSettings(true);
  };

  const handleSaveStoreSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings(settingsForm);
    setIsEditingStoreSettings(false);
  };

  const handleCancelEditSettings = () => {
    setSettingsForm(storeSettings);
    setIsEditingStoreSettings(false);
  };

  const handleResetSettingsToDefault = () => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من استرجاع الإعدادات والمعلومات الافتراضية للمتجر؟' : 'Réinitialiser les paramètres par défaut?')) {
      resetStoreSettings();
      setSettingsForm(storeSettings);
      setIsEditingStoreSettings(false);
    }
  };

  // Backup Export & Editor handlers
  const handleExportData = () => {
    const backup: BackupPayload = {
      store: storeSettings.storeName,
      timestamp: new Date().toISOString(),
      version: '2.0',
      settings: storeSettings,
      products,
      orders,
      repairs,
      installments,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `hamtine4-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(language === 'ar' ? 'تم تنزيل النسخة الاحتياطية بنجاح' : 'Sauvegarde téléchargée', 'success');
  };

  const handleOpenBackupEditor = () => {
    const currentBackup: BackupPayload = {
      store: storeSettings.storeName,
      timestamp: new Date().toISOString(),
      version: '2.0',
      settings: storeSettings,
      products,
      orders,
      repairs,
      installments,
    };
    setVisualBackupData(currentBackup);
    setBackupJsonText(JSON.stringify(currentBackup, null, 2));
    setBackupValidationStatus({
      valid: true,
      message: language === 'ar'
        ? `النسخة الحالية جاهزة للتعديل والتصدير (${products.length} منتج، ${orders.length} طلب، ${repairs.length} تذكرة صيانة، ${installments.length} ملف تقسيط).`
        : 'Sauvegarde prête pour modification',
      counts: {
        products: products.length,
        orders: orders.length,
        repairs: repairs.length,
        installments: installments.length,
      }
    });
    setBackupEditorTab('visual');
    setShowBackupModal(true);
  };

  const handleFormatBackupJson = () => {
    try {
      const parsed = JSON.parse(backupJsonText);
      setBackupJsonText(JSON.stringify(parsed, null, 2));
      showToast(language === 'ar' ? 'تم تنسيق كود JSON بنجاح' : 'JSON formaté avec succès', 'info');
    } catch (e: any) {
      showToast(language === 'ar' ? 'تعذر تنسيق الكود: صيغة JSON غير صالحة' : 'Format JSON invalide', 'error');
    }
  };

  const handleCopyBackupJson = () => {
    navigator.clipboard.writeText(backupJsonText);
    showToast(language === 'ar' ? 'تم نسخ كود النسخة بالكامل إلى الحافظة' : 'Copié dans le presse-papier', 'success');
  };

  const handleValidateBackupJson = (): BackupPayload | null => {
    try {
      const parsed = JSON.parse(backupJsonText);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error(language === 'ar' ? 'الملف ليس كائناً برمجياً صالحاً' : 'Structure invalide');
      }
      const prodCount = Array.isArray(parsed.products) ? parsed.products.length : 0;
      const ordCount = Array.isArray(parsed.orders) ? parsed.orders.length : 0;
      const repCount = Array.isArray(parsed.repairs) ? parsed.repairs.length : 0;
      const instCount = Array.isArray(parsed.installments) ? parsed.installments.length : 0;

      setVisualBackupData(parsed);
      setBackupValidationStatus({
        valid: true,
        message: language === 'ar'
          ? `النسخة سليمة وصالحة تماماً! تحتوي على: ${prodCount} منتج، ${ordCount} طلب، ${repCount} صيانة، ${instCount} تقسيط.`
          : 'Sauvegarde valide',
        counts: { products: prodCount, orders: ordCount, repairs: repCount, installments: instCount }
      });
      showToast(language === 'ar' ? 'صيغة النسخة صالحة تماماً ومطابقة للنظام' : 'Format JSON valide', 'success');
      return parsed;
    } catch (err: any) {
      setBackupValidationStatus({
        valid: false,
        message: language === 'ar'
          ? `خطأ في بنية JSON: ${err.message || 'تأكد من إغلاق الأقواس والفواصل بشكل سليم'}`
          : 'Erreur dans la structure JSON',
      });
      showToast(language === 'ar' ? 'يوجد خطأ في بنية JSON للنسخة' : 'Erreur dans la structure JSON', 'error');
      return null;
    }
  };

  const handleApplyBackupFromEditor = () => {
    const parsed = handleValidateBackupJson();
    if (!parsed) return;

    const prodCount = Array.isArray(parsed.products) ? parsed.products.length : 0;
    const ordCount = Array.isArray(parsed.orders) ? parsed.orders.length : 0;

    if (window.confirm(language === 'ar'
      ? `هل أنت متأكد من تطبيق وحفظ هذه النسخة المعدلة؟ سيتم تحديث قاعدة بيانات المتجر (${prodCount} منتج و ${ordCount} طلب).`
      : `Voulez-vous appliquer cette sauvegarde (${prodCount} produits, ${ordCount} commandes)?`
    )) {
      restoreBackupData(parsed);
      setShowBackupModal(false);
    }
  };

  const handleImportBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('الملف لا يحتوي على بيانات صالحة');
        }
        setVisualBackupData(parsed);
        setBackupJsonText(JSON.stringify(parsed, null, 2));
        const prodCount = Array.isArray(parsed.products) ? parsed.products.length : 0;
        const ordCount = Array.isArray(parsed.orders) ? parsed.orders.length : 0;
        const repCount = Array.isArray(parsed.repairs) ? parsed.repairs.length : 0;
        const instCount = Array.isArray(parsed.installments) ? parsed.installments.length : 0;

        setBackupValidationStatus({
          valid: true,
          message: language === 'ar'
            ? `تم تحميل ملف النسخة بنجاح (${file.name})! يمكنك مراجعتها أو تعديلها ثم تطبيقها.`
            : `Fichier ${file.name} chargé`,
          counts: { products: prodCount, orders: ordCount, repairs: repCount, installments: instCount }
        });
        setBackupEditorTab('visual');
        setShowBackupModal(true);
        showToast(language === 'ar' ? `تم فتح ملف النسخة "${file.name}" في المحرر` : 'Fichier chargé', 'info');
      } catch (err: any) {
        showToast(language === 'ar' ? 'فشل قراءة الملف: تأكد من أنه ملف JSON صحيح' : 'Fichier JSON invalide', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleUpdateProductInVisualBackup = (prodIndex: number, field: 'price' | 'stock' | 'name', value: any) => {
    if (!visualBackupData || !Array.isArray(visualBackupData.products)) return;
    const updatedProducts = [...visualBackupData.products];
    if (!updatedProducts[prodIndex]) return;

    updatedProducts[prodIndex] = {
      ...updatedProducts[prodIndex],
      [field]: field === 'price' || field === 'stock' ? Number(value) : value,
    };

    const updatedBackup: BackupPayload = {
      ...visualBackupData,
      products: updatedProducts,
    };
    setVisualBackupData(updatedBackup);
    setBackupJsonText(JSON.stringify(updatedBackup, null, 2));
  };

  // -------------------------------------------------------------
  // Security Gate Screen
  // -------------------------------------------------------------
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 selection:bg-amber-500 selection:text-slate-950">
        <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {language === 'ar' ? 'لوحة تحكم حمتين تيليكوم 4' : 'Panneau de Contrôle Hamtine 4'}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'ar'
                  ? 'بوابة الإدارة المستقلة — يرجى إدخال الرمز السري للمشرف'
                  : 'Portail d\'administration sécurisé — Entrez le code PIN'}
              </p>
            </div>
          </div>

          <form onSubmit={handleUnlock} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 text-center">
                {language === 'ar' ? 'الرمز السري (PIN)' : 'Code PIN'}
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={8}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="••••"
                className={`w-full text-center text-2xl tracking-[0.4em] py-3 rounded-xl bg-slate-900 border font-mono text-white focus:outline-none transition ${
                  pinError
                    ? 'border-rose-500 focus:border-rose-500 ring-2 ring-rose-500/20'
                    : 'border-slate-700 focus:border-amber-400'
                }`}
                autoFocus
              />
              <p className="text-[11px] text-center text-slate-400 mt-1">
                {language === 'ar' ? 'الرمز الافتراضي للمحل: 1234' : 'Code par défaut : 1234'}
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>{language === 'ar' ? 'دخول لوحة التحكم' : 'Accéder au panneau'}</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-700/60 flex items-center justify-between text-xs">
            <button
              onClick={() => setCurrentView('storefront')}
              className="text-slate-400 hover:text-white flex items-center gap-1 transition cursor-pointer"
            >
              <span>← {language === 'ar' ? 'العودة لواجهة المتجر' : 'Retour au magasin'}</span>
            </button>
            <button
              onClick={() => {
                setPinInput('1234');
                sessionStorage.setItem('phonedz_admin_unlocked', 'true');
                setIsUnlocked(true);
                showToast(language === 'ar' ? 'تم الدخول السريع للمشرف' : 'Accès rapide accordé', 'success');
              }}
              className="text-amber-400 hover:underline font-bold"
            >
              {language === 'ar' ? 'دخول سريع (1234)' : 'Accès rapide'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Filtered Lists
  // -------------------------------------------------------------
  const filteredOrders = orders.filter((o) => {
    const isPending = o.status === 'pending_call' || (o.status as any) === 'pending';
    const matchStatus =
      orderFilter === 'all' ||
      o.status === orderFilter ||
      ((orderFilter === 'pending' || orderFilter === 'pending_call') && isPending);
    const matchSearch =
      orderSearch === '' ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.phone.includes(orderSearch) ||
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.wilayaName.toLowerCase().includes(orderSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  const filteredProducts = products.filter((p) => {
    const matchCat = productCategoryFilter === 'all' || p.category === productCategoryFilter;
    const matchBrand = productBrandFilter === 'all' || p.brand.toLowerCase() === productBrandFilter.toLowerCase();
    const matchSearch =
      productSearch === '' ||
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase());
    return matchCat && matchBrand && matchSearch;
  });

  const filteredRepairs = repairs.filter((r) => {
    const matchStatus = repairFilter === 'all' || r.status === repairFilter;
    const matchSearch =
      repairSearch === '' ||
      r.customerName.toLowerCase().includes(repairSearch.toLowerCase()) ||
      r.ticketNumber.toLowerCase().includes(repairSearch.toLowerCase()) ||
      r.phone.includes(repairSearch) ||
      r.phoneModel.toLowerCase().includes(repairSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  const filteredInstallments = installments.filter((plan) => {
    const hasOverdue = plan.schedule.some((s) => s.status === 'overdue');
    const matchStatus =
      installmentFilter === 'all' ||
      (installmentFilter === 'active' && plan.status === 'active') ||
      (installmentFilter === 'has_overdue' && hasOverdue);
    const matchSearch =
      installmentSearch === '' ||
      plan.customerName.toLowerCase().includes(installmentSearch.toLowerCase()) ||
      plan.phone.includes(installmentSearch) ||
      plan.planNumber.toLowerCase().includes(installmentSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col selection:bg-slate-900 selection:text-white">
      {/* ------------------------------------------------------------- */}
      {/* External Admin Top Navigation Bar */}
      {/* ------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between flex-wrap gap-3">
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 p-1.5 flex items-center justify-center">
              <img src="/hamtine-logo.svg" alt="Hamtine Telecom 4" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base text-white tracking-tight">
                  حمتين تيليكوم 4
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[10px] uppercase">
                  لوحة التحكم الخارجية
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>متصل</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                فرع الوادي (مفترق طرق الملاح) • نظام الإدارة المركزي
              </p>
            </div>
          </div>

          {/* Quick Actions & Role Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Role Switcher */}
            <div className="hidden md:flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                onClick={() => setRole('admin')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  role === 'admin' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                مدير المتجر
              </button>
              <button
                onClick={() => setRole('technician')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  role === 'technician' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                فني الصيانة
              </button>
              <button
                onClick={() => setRole('salesperson')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  role === 'salesperson' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                المبيعات
              </button>
            </div>

            {/* Return to Storefront */}
            <button
              onClick={() => setCurrentView('storefront')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition cursor-pointer shadow-xs"
              title="معاينة المتجر للزبائن"
            >
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              <span>معاينة المتجر ↗</span>
            </button>

            {/* Lock Session */}
            <button
              onClick={handleLock}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold text-xs transition cursor-pointer"
              title="قفل لوحة التحكم"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">قفل</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-slate-950 border-t border-slate-800/80 px-4 sm:px-6 overflow-x-auto">
          <div className="max-w-7xl mx-auto flex items-center gap-1 py-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-slate-800 text-amber-400 border border-slate-700 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>التحليلات والمؤشرات</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>إدارة الطلبات والشحن</span>
              {newOrdersCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black">
                  {newOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'inventory'
                  ? 'bg-slate-800 text-purple-400 border border-slate-700 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>المنتجات والمخزون</span>
              <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] border border-slate-700">
                {products.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('repairs')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'repairs'
                  ? 'bg-slate-800 text-amber-400 border border-slate-700 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>ورشة الصيانة (SAV)</span>
              {repairStats.activeCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                  {repairStats.activeCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('installments')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'installments'
                  ? 'bg-slate-800 text-sky-400 border border-slate-700 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>ملفات البيع بالتقسيط</span>
              <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] border border-slate-700">
                {installments.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('rates')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'rates'
                  ? 'bg-slate-800 text-indigo-400 border border-slate-700 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>أسعار التوصيل (58 ولاية)</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-slate-800 text-slate-200 border border-slate-700 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>الإعدادات والنسخ الاحتياطي</span>
            </button>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* Main Admin Workspace Area */}
      {/* ------------------------------------------------------------- */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 space-y-6">
        {/* ========================================================= */}
        {/* TAB 1: ANALYTICS & KPIS */}
        {/* ========================================================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Top KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold">المداخيل المحققة (المسلمة)</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {totalRevenue.toLocaleString()} <span className="text-xs text-slate-500 font-bold">د.ج</span>
                </div>
                <p className="text-[11px] text-emerald-700 font-medium">
                  ✓ من الطلبات المكتملة والمستلمة
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold">الدفع عند الاستلام المعلق (COD)</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Truck className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {pendingCodAmount.toLocaleString()} <span className="text-xs text-slate-500 font-bold">د.ج</span>
                </div>
                <p className="text-[11px] text-amber-700 font-medium">
                  قيد الشحن مع ياليدين / ZR إكسبريس
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold">ورشة الصيانة (SAV)</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Wrench className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {repairStats.activeCount} <span className="text-xs text-slate-500 font-bold">جهاز نشط</span>
                </div>
                <p className="text-[11px] text-purple-700 font-medium">
                  {repairStats.readyCount} جهاز جاهز للتسليم للزبون
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold">محفظة البيع بالتقسيط</span>
                  <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {installmentsStats.totalCollected.toLocaleString()} <span className="text-xs text-slate-500 font-bold">د.ج</span>
                </div>
                <p className="text-[11px] text-sky-700 font-medium">
                  متبقي {installmentsStats.totalPending.toLocaleString()} د.ج قيد التحصيل
                </p>
              </div>
            </div>

            {/* Quick Action Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {newOrdersCount > 0 ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-emerald-950">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs">{newOrdersCount} طلب جديد بانتظار التأكيد</h4>
                      <p className="text-[11px] text-emerald-800">اتصل بالزبائن لتأكيد العنوان وبدء الشحن</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('orders');
                      setOrderFilter('pending_call');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition cursor-pointer shrink-0"
                  >
                    عرض الطلبات
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 text-slate-600 text-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>كافة الطلبات الحالية مؤكدة ومحدثة</span>
                </div>
              )}

              {repairStats.readyCount > 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-amber-950">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs">{repairStats.readyCount} هواتف جاهزة للاستلام</h4>
                      <p className="text-[11px] text-amber-800">أرسل إشعار واتساب للزبائن للحضور</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('repairs');
                      setRepairFilter('ready');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition cursor-pointer shrink-0"
                  >
                    عرض الورشة
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 text-slate-600 text-xs">
                  <CheckCircle2 className="w-5 h-5 text-slate-400" />
                  <span>لا توجد هواتف جاهزة تنتظر الإشعار</span>
                </div>
              )}

              {lowStockCount > 0 ? (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-rose-950">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs">{lowStockCount} منتجات قريبة من النفاد</h4>
                      <p className="text-[11px] text-rose-800">المخزون أقل من قطعتين</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('inventory');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition cursor-pointer shrink-0"
                  >
                    تحديث المخزون
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 text-slate-600 text-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>مستويات المخزون متوازنة</span>
                </div>
              )}
            </div>

            {/* Quick Overview Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders Overview */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-emerald-600" />
                    <span>آخر الطلبات المسجلة</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-emerald-700 font-bold hover:underline"
                  >
                    عرض الكل ({orders.length}) ←
                  </button>
                </div>

                <div className="space-y-2">
                  {orders.slice(0, 5).map((order) => (
                    <div
                      key={order.id}
                      className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{order.customerName}</span>
                          <span className="font-mono text-[10px] text-slate-400">#{order.orderNumber}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {order.wilayaName} • {order.items.length} منتج • {order.total.toLocaleString()} د.ج
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            order.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'shipped'
                              ? 'bg-sky-100 text-sky-800'
                              : order.status === 'confirmed'
                              ? 'bg-purple-100 text-purple-800'
                              : order.status === 'cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {t?.orderStages?.[order.status] ||
                            (order.status === 'delivered'
                              ? 'تم التسليم'
                              : order.status === 'shipped'
                              ? 'قيد الشحن'
                              : order.status === 'confirmed'
                              ? 'مؤكد'
                              : order.status === 'cancelled'
                              ? 'ملغى'
                              : 'بانتظار التأكيد')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Store Logistics & Delivery Partners */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-sky-600" />
                  <span>الخدمات اللوجستية ومحل حمتين تيليكوم 4</span>
                </h3>

                <div className="space-y-3 text-xs text-slate-600">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span>مقر المحل بالوادي:</span>
                      <span className="text-amber-800 font-bold">فرع 4 (حي الاستقلال)</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      مفترق طرق الملاح (مقابل المحطة) • مفتوح يومياً من 09:00 إلى 21:00
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span>شركاء الشحن المعتمدين:</span>
                      <span className="text-emerald-700 font-bold">توصيل 58 ولاية</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      ياليدين إكسبريس (Yalidine Express) + زد آر إكسبريس (ZR Express) مع إمكانية فتح الطرد والمعاينة قبل الدفع.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span>خدمة التقسيط بالمحل:</span>
                      <span className="text-purple-700 font-bold">ملف ورقي + حضور شخصي</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      التقسيط يتم حصرياً بمقر المحل بالوادي للزبائن والموظفين وفق الضوابط الشرعية والتنظيمية.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: ORDERS MANAGEMENT */}
        {/* ========================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Filters and Search toolbar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 text-xs font-bold">
                <button
                  onClick={() => setOrderFilter('all')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    orderFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  الكل ({orders.length})
                </button>
                <button
                  onClick={() => setOrderFilter('pending_call')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    orderFilter === 'pending_call' || (orderFilter as any) === 'pending'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  جديد ({orders.filter((o) => o.status === 'pending_call' || (o.status as any) === 'pending').length})
                </button>
                <button
                  onClick={() => setOrderFilter('confirmed')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    orderFilter === 'confirmed'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  مؤكد ({orders.filter((o) => o.status === 'confirmed').length})
                </button>
                <button
                  onClick={() => setOrderFilter('shipped')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    orderFilter === 'shipped'
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  قيد الشحن ({orders.filter((o) => o.status === 'shipped').length})
                </button>
                <button
                  onClick={() => setOrderFilter('delivered')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    orderFilter === 'delivered'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  تم التسليم ({orders.filter((o) => o.status === 'delivered').length})
                </button>
                <button
                  onClick={() => setOrderFilter('cancelled')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    orderFilter === 'cancelled'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ملغى ({orders.filter((o) => o.status === 'cancelled').length})
                </button>
              </div>

              <div className="relative min-w-[220px]">
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="ابحث بالاسم، الهاتف، أو الولاية..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-slate-400"
                />
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-2">
                <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-sm text-slate-700">لا توجد طلبات مطابقة للبحث</h4>
                <p className="text-xs text-slate-500">حاول تغيير خيارات التصفية أو إفراغ خانة البحث.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200">
                          #{order.orderNumber}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-sm text-slate-900">{order.customerName}</h4>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                order.status === 'delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : order.status === 'shipped'
                                  ? 'bg-sky-100 text-sky-800'
                                  : order.status === 'confirmed'
                                  ? 'bg-purple-100 text-purple-800'
                                  : order.status === 'cancelled'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {t?.orderStages?.[order.status] ||
                                (order.status === 'delivered'
                                  ? 'تم التسليم'
                                  : order.status === 'shipped'
                                  ? 'قيد الشحن'
                                  : order.status === 'confirmed'
                                  ? 'مؤكد'
                                  : order.status === 'cancelled'
                                  ? 'ملغى'
                                  : 'بانتظار التأكيد')}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono" dir="ltr">
                            📞 {order.phone}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Direct Call */}
                        <a
                          href={`tel:${order.phone}`}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>اتصال</span>
                        </a>

                        {/* WhatsApp */}
                        <button
                          onClick={() => handleSendOrderWhatsApp(order)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-current" />
                          <span>واتساب</span>
                        </button>

                        {/* Print Invoice */}
                        <button
                          onClick={() => window.print()}
                          className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition cursor-pointer"
                          title="طباعة الوصل"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Order Details Body */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      {/* Items */}
                      <div className="space-y-1">
                        <span className="text-slate-400 text-[11px] font-bold">المنتجات المطلوبة:</span>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-slate-800">
                            <span className="font-bold">
                              {item.quantity}x {item.productName}
                            </span>
                            <span className="font-mono text-slate-600">
                              {(item.unitPrice * item.quantity).toLocaleString()} د.ج
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Destination & Delivery */}
                      <div className="space-y-1">
                        <span className="text-slate-400 text-[11px] font-bold">وجهة الشحن:</span>
                        <p className="font-bold text-slate-800">
                          {order.deliveryType === 'store_pickup' ? (
                            <span className="text-amber-700 font-bold">استلام مباشر من محل الوادي</span>
                          ) : (
                            `${order.wilayaName} • ${order.commune}`
                          )}
                        </p>
                        {order.deliveryType !== 'store_pickup' && (
                          <p className="text-[11px] text-slate-500">
                            {order.deliveryType === 'stop_desk' ? 'مكتب التوصيل (Stop Desk)' : 'توصيل لباب المنزل'}
                          </p>
                        )}
                      </div>

                      {/* Total and Tracking */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-[11px] font-bold">المجموع الإجمالي:</span>
                          <span className="font-black text-sm text-emerald-700">
                            {order.total.toLocaleString()} د.ج
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          طريقة الدفع: {order.deliveryType === 'store_pickup' ? 'بالمحل' : 'عند الاستلام (COD)'}
                        </p>
                      </div>
                    </div>

                    {/* Status Changer Bar */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-bold">تغيير الحالة:</span>
                        <div className="flex items-center gap-1 flex-wrap">
                          <button
                            onClick={() => updateOrderStatus(order.id, 'pending_call')}
                            className={`px-2 py-1 rounded-md font-bold transition cursor-pointer ${
                              order.status === 'pending_call' || (order.status as any) === 'pending'
                                ? 'bg-amber-500 text-slate-950 shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            بانتظار الاتصال
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'confirmed')}
                            className={`px-2 py-1 rounded-md font-bold transition cursor-pointer ${
                              order.status === 'confirmed'
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            تأكيد الطلب
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'shipped')}
                            className={`px-2 py-1 rounded-md font-bold transition cursor-pointer ${
                              order.status === 'shipped'
                                ? 'bg-sky-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            قيد الشحن
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                            className={`px-2 py-1 rounded-md font-bold transition cursor-pointer ${
                              order.status === 'delivered'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            تم التسليم
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                            className={`px-2 py-1 rounded-md font-bold transition cursor-pointer ${
                              order.status === 'cancelled'
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>

                      <span className="text-[11px] text-slate-400 font-mono">
                        تاريخ التسجيل: {order.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: INVENTORY & CATALOG MANAGEMENT */}
        {/* ========================================================= */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            {/* Top Inventory Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto text-xs font-bold">
                <button
                  onClick={() => setProductCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    productCategoryFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  كافة المنتجات ({products.length})
                </button>
                <button
                  onClick={() => setProductCategoryFilter('new-phone')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    productCategoryFilter === 'new-phone'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  هواتف جديدة ({products.filter((p) => p.category === 'new-phone').length})
                </button>
                <button
                  onClick={() => setProductCategoryFilter('used-phone')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    productCategoryFilter === 'used-phone'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  مستعملة مضمونة ({products.filter((p) => p.category === 'used-phone').length})
                </button>
                <button
                  onClick={() => setProductCategoryFilter('accessory')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    productCategoryFilter === 'accessory'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  إكسسوارات ({products.filter((p) => p.category === 'accessory').length})
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-56">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="ابحث عن هاتف أو ماركة..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-slate-400"
                  />
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>

                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة منتج جديد</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-start">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="p-3 text-start">المنتج</th>
                      <th className="p-3 text-start">الماركة والتصنيف</th>
                      <th className="p-3 text-start">السعر (د.ج)</th>
                      <th className="p-3 text-center">الكمية بالمخزن</th>
                      <th className="p-3 text-center">حالة التوفر</th>
                      <th className="p-3 text-end">إجراءات سريعة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.images?.[0] || (prod as any).image || ''}
                              alt={prod.name}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-slate-900">{prod.name}</p>
                              <span className="text-[10px] text-slate-400">
                                {prod.storage} • {prod.ram}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3">
                          <span className="font-bold text-slate-800">{prod.brand}</span>
                          <span className="block text-[10px] text-slate-400">
                            {prod.category === 'new-phone'
                              ? 'هاتف جديد'
                              : prod.category === 'used-phone'
                              ? 'مستعمل مع ضمان'
                              : 'إكسسوار أصلي'}
                          </span>
                        </td>

                        <td className="p-3 font-mono font-black text-slate-900">
                          {prod.price.toLocaleString()} د.ج
                          {prod.originalPrice && prod.originalPrice > prod.price && (
                            <span className="block line-through text-[10px] text-slate-400 font-normal">
                              {prod.originalPrice.toLocaleString()} د.ج
                            </span>
                          )}
                        </td>

                        <td className="p-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-md font-mono font-bold text-xs ${
                              prod.stock === 0
                                ? 'bg-rose-100 text-rose-800'
                                : prod.stock <= 2
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {prod.stock} قطع
                          </span>
                        </td>

                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              const newStock = prod.stock > 0 ? 0 : 5;
                              updateProduct(prod.id, { stock: newStock });
                              showToast(
                                language === 'ar'
                                  ? `تم تعديل حالة توفر ${prod.name}`
                                  : 'Statut mis à jour',
                                'info'
                              );
                            }}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition ${
                              prod.stock > 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {prod.stock > 0 ? '✓ متوفر للطلب' : 'نفد المخزون'}
                          </button>
                        </td>

                        <td className="p-3 text-end">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <button
                              onClick={() => handleOpenEditProduct(prod)}
                              className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-indigo-200"
                              title="تعديل المنتج وصوره"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>تعديل</span>
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-rose-200"
                              title="حذف المنتج من المتجر"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>حذف</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: REPAIR WORKSHOP (SAV) */}
        {/* ========================================================= */}
        {activeTab === 'repairs' && (
          <div className="space-y-4">
            {/* Top Toolbar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto text-xs font-bold">
                <button
                  onClick={() => setRepairFilter('all')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    repairFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  كافة التذاكر ({repairs.length})
                </button>
                <button
                  onClick={() => setRepairFilter('diagnosing')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    repairFilter === 'diagnosing'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  قيد التشخيص ({repairs.filter((r) => r.status === 'diagnosing').length})
                </button>
                <button
                  onClick={() => setRepairFilter('in_progress')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    repairFilter === 'in_progress'
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  جاري التصليح ({repairs.filter((r) => r.status === 'in_progress').length})
                </button>
                <button
                  onClick={() => setRepairFilter('ready')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    repairFilter === 'ready'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  جاهز للتسليم ({repairs.filter((r) => r.status === 'ready').length})
                </button>
                <button
                  onClick={() => setRepairFilter('delivered')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    repairFilter === 'delivered'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  تم التسليم ({repairs.filter((r) => r.status === 'delivered').length})
                </button>
              </div>

              <div className="relative min-w-[220px]">
                <input
                  type="text"
                  value={repairSearch}
                  onChange={(e) => setRepairSearch(e.target.value)}
                  placeholder="رقم التذكرة أو اسم الزبون..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-slate-400"
                />
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Repair Cards */}
            {filteredRepairs.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-2">
                <Wrench className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-sm text-slate-700">لا توجد تذاكر صيانة مطابقة</h4>
                <p className="text-xs text-slate-500">حاول تغيير خيارات البحث أو التصفية.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRepairs.map((repair) => (
                  <div
                    key={repair.id}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                            #{repair.ticketNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              repair.status === 'ready'
                                ? 'bg-emerald-100 text-emerald-800'
                                : repair.status === 'in_progress'
                                ? 'bg-sky-100 text-sky-800'
                                : repair.status === 'delivered'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {t.repairStages[repair.status]}
                          </span>
                        </div>
                        <h4 className="font-black text-sm text-slate-900 mt-1">
                          {repair.phoneBrand} {repair.phoneModel}
                        </h4>
                        <p className="text-xs text-slate-500">
                          الزبون: {repair.customerName} • 📞 {repair.phone}
                        </p>
                      </div>

                      <div className="text-end">
                        <span className="text-[10px] text-slate-400 font-bold block">السعر:</span>
                        <span className="font-mono font-black text-sm text-emerald-700">
                          {(repair.finalPrice || repair.estimatedPrice).toLocaleString()} د.ج
                        </span>
                      </div>
                    </div>

                    {/* Problem Description */}
                    <div className="space-y-1 text-xs">
                      <p className="text-slate-700 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-slate-400 font-bold block text-[10px]">العطل المصرّح به:</span>
                        {repair.reportedIssue}
                      </p>
                      {repair.technicianNotes && (
                        <p className="text-purple-900 bg-purple-50 p-2.5 rounded-xl border border-purple-100 text-[11px]">
                          <span className="text-purple-700 font-bold block text-[10px]">ملاحظات الفني:</span>
                          {repair.technicianNotes}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingRepair(repair);
                            setNewRepairStatus(repair.status);
                            setTechnicianNote(repair.technicianNotes || '');
                            setNewFinalPrice(repair.finalPrice || repair.estimatedPrice);
                            setNewPartsCost(repair.partsCost || 0);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
                        >
                          تحديث التذكرة
                        </button>

                        <button
                          onClick={() => handleSendWhatsAppNotification(repair)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                          title="إرسال إشعار واتساب"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-current" />
                          <span>إشعار الزبون</span>
                        </button>
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono">
                        تاريخ الإيداع: {repair.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: INSTALLMENT PLANS */}
        {/* ========================================================= */}
        {activeTab === 'installments' && (
          <div className="space-y-4">
            {/* Top Toolbar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto text-xs font-bold">
                <button
                  onClick={() => setInstallmentFilter('all')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    installmentFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  كافة الملفات ({installments.length})
                </button>
                <button
                  onClick={() => setInstallmentFilter('active')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    installmentFilter === 'active'
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  نشط قيد السداد ({installments.filter((i) => i.status === 'active').length})
                </button>
                <button
                  onClick={() => setInstallmentFilter('has_overdue')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    installmentFilter === 'has_overdue'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  أقساط متأخرة
                </button>
              </div>

              <div className="relative min-w-[220px]">
                <input
                  type="text"
                  value={installmentSearch}
                  onChange={(e) => setInstallmentSearch(e.target.value)}
                  placeholder="ابحث بالاسم أو رقم الملف..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-slate-400"
                />
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Installments List */}
            {filteredInstallments.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-2">
                <CreditCard className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-sm text-slate-700">لا توجد ملفات تقسيط مطابقة</h4>
                <p className="text-xs text-slate-500">حاول تغيير خيارات البحث.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInstallments.map((plan) => (
                  <div
                    key={plan.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-sky-50 text-sky-900 px-2 py-0.5 rounded border border-sky-200">
                            #{plan.planNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              plan.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-sky-100 text-sky-800'
                            }`}
                          >
                            {plan.status === 'completed' ? 'تم اكتمال السداد' : 'قيد السداد الشهري'}
                          </span>
                        </div>
                        <h4 className="font-black text-sm text-slate-900 mt-1">
                          {plan.customerName} — {plan.productName}
                        </h4>
                        <span className="text-xs text-slate-500 font-mono" dir="ltr">
                          📞 {plan.phone}
                        </span>
                      </div>

                      <div className="text-start sm:text-end">
                        <span className="text-[11px] text-slate-400 font-bold block">
                          المتبقي للدفع:
                        </span>
                        <span className="font-mono font-black text-base text-sky-800">
                          {plan.remainingAmount.toLocaleString()} د.ج
                        </span>
                        <span className="block text-[10px] text-slate-500">
                          من أصل {plan.totalAmount.toLocaleString()} د.ج ({plan.months} أشهر)
                        </span>
                      </div>
                    </div>

                    {/* Installments Schedule Grid */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-500">جدول الأقساط الشهرية:</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                        {plan.schedule.map((item) => (
                          <div
                            key={item.installmentNumber}
                            className={`p-2.5 rounded-xl border flex flex-col justify-between gap-1 text-center ${
                              item.status === 'paid'
                                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                                : item.status === 'overdue'
                                ? 'bg-rose-50 border-rose-200 text-rose-950'
                                : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                          >
                            <span className="font-bold text-[11px]">
                              قسط {item.installmentNumber}
                            </span>
                            <span className="font-mono font-black text-xs">
                              {item.amount.toLocaleString()} د.ج
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              {item.dueDate}
                            </span>

                            {item.status === 'paid' ? (
                              <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 text-[9px] font-bold mt-1">
                                ✓ مسدد
                              </span>
                            ) : (
                              <div className="pt-1 flex flex-col gap-1">
                                <button
                                  onClick={() =>
                                    setPayingPlan({
                                      plan,
                                      itemNumber: item.installmentNumber,
                                      amount: item.amount,
                                    })
                                  }
                                  className="w-full py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] transition cursor-pointer"
                                >
                                  تسجيل سداد
                                </button>
                                <button
                                  onClick={() =>
                                    handleSendInstallmentReminder(plan, item.dueDate, item.amount)
                                  }
                                  className="w-full py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[9px] transition cursor-pointer"
                                >
                                  تذكير واتساب
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: WILAYAS DELIVERY RATES (58 WILAYAS) */}
        {/* ========================================================= */}
        {activeTab === 'rates' && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-indigo-600" />
                  <span>جدول تسعيرة الشحن للـ 58 ولاية جزائرية</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  التوصيل السريع مع ياليدين إكسبريس (Yalidine) وزد آر إكسبريس (ZR Express)
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                <Store className="w-3.5 h-3.5 text-emerald-600" />
                <span>الاستلام من محل حمتين تيليكوم 4 بالوادي: مجاناً (0 د.ج)</span>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-3 text-start">الرمز</th>
                    <th className="p-3 text-start">الولاية</th>
                    <th className="p-3 text-center">توصيل لباب المنزل (د.ج)</th>
                    <th className="p-3 text-center">استلام من المكتب Stop Desk (د.ج)</th>
                    <th className="p-3 text-center">مدة التوصيل التقديرية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ALGERIA_WILAYAS.map((w) => (
                    <tr key={w.code} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-slate-500">
                        {String(w.code).padStart(2, '0')}
                      </td>
                      <td className="p-3 font-bold text-slate-900">
                        {w.nameAr} <span className="text-slate-400 font-normal">({w.nameFr})</span>
                        {w.code === 39 && (
                          <span className="mr-2 px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">
                            مقر المحل (الوادي)
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-slate-800">
                        {w.homeDeliveryCost.toLocaleString()} د.ج
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-emerald-700">
                        {w.deskDeliveryCost.toLocaleString()} د.ج
                      </td>
                      <td className="p-3 text-center font-mono text-slate-500">
                        {w.estimatedDays}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: STORE SETTINGS & BACKUP */}
        {/* ========================================================= */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Store Information Card (Left/Main Column) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900">
                      بيانات ومعلومات المحل الرسمية
                    </h3>
                    <p className="text-xs text-slate-500">
                      تظهر هذه البيانات في ترويسة المتجر ووصولات الشراء وخرائط الموقع
                    </p>
                  </div>
                </div>

                {!isEditingStoreSettings ? (
                  <button
                    onClick={handleStartEditSettings}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>تعديل بيانات المحل</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleCancelEditSettings}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="button"
                      onClick={handleResetSettingsToDefault}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs cursor-pointer"
                      title="استعادة القيم الأصلية"
                    >
                      استعادة الافتراضي
                    </button>
                  </div>
                )}
              </div>

              {/* Status Indicator */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-600">حالة المتجر واستقبال الزبائن:</span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold ${
                    storeSettings.isOpen
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      storeSettings.isOpen ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'
                    }`}
                  />
                  {storeSettings.isOpen ? 'المتجر مفتوح ويستقبل الطلبات' : 'المتجر مغلق مؤقتاً'}
                </span>
              </div>

              {!isEditingStoreSettings ? (
                /* READ ONLY VIEW WITH CLEAN CARDS */
                <div className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="block text-slate-400 font-medium text-[11px] mb-1">
                        اسم المحل (بالعربية):
                      </span>
                      <p className="font-bold text-slate-900 text-sm">{storeSettings.storeName}</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="block text-slate-400 font-medium text-[11px] mb-1">
                        اسم المحل (بالفرنسية / اللاتينية):
                      </span>
                      <p className="font-bold text-slate-800 text-sm font-sans" dir="ltr">
                        {storeSettings.storeNameFr || 'Hamtine Telecom 4'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="block text-slate-400 font-medium text-[11px] mb-1">
                        رقم الهاتف الرسمي (مكالمات وواتساب):
                      </span>
                      <p className="font-mono font-bold text-slate-900 text-sm" dir="ltr">
                        {storeSettings.phone}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="block text-slate-400 font-medium text-[11px] mb-1">
                        رقم الهاتف الثانوي / بديل:
                      </span>
                      <p className="font-mono font-bold text-slate-800 text-sm" dir="ltr">
                        {storeSettings.phoneSecondary || 'غير محدد'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="block text-slate-400 font-medium text-[11px] mb-1">
                      العنوان الجغرافي التفصيلي:
                    </span>
                    <p className="font-bold text-slate-900">{storeSettings.address}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="block text-slate-400 font-medium text-[11px] mb-1">
                        أوقات وساعات الدوام:
                      </span>
                      <p className="font-bold text-slate-800">{storeSettings.workingHours}</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="block text-slate-400 font-medium text-[11px] mb-1">
                        رابط خرائط Google Maps:
                      </span>
                      <a
                        href={storeSettings.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 font-bold hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>فتح الموقع على خرائط Google ↗</span>
                      </a>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="block text-slate-400 font-medium text-[11px] mb-1">
                      نص الشريط الإعلاني أعلى المتجر:
                    </span>
                    <p className="text-slate-800 font-medium">{storeSettings.announcementText}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="block text-slate-400 font-medium text-[11px] mb-1">
                      تنبيه التوصيل لـ 58 ولاية:
                    </span>
                    <p className="text-slate-800 font-medium">{storeSettings.deliveryNotice}</p>
                  </div>
                </div>
              ) : (
                /* EDIT FORM */
                <form onSubmit={handleSaveStoreSettings} className="space-y-4 text-xs">
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900 flex items-center gap-2 font-medium">
                    <Edit3 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>وضع التعديل مفعل: يمكنك تعديل كافة معلومات المحل ثم النقر على حفظ التعديلات.</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">
                        اسم المحل التجاري (بالعربية) <span className="text-rose-500">*</span>:
                      </label>
                      <input
                        type="text"
                        required
                        value={settingsForm.storeName}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, storeName: e.target.value })
                        }
                        className="w-full bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl p-2.5 font-bold text-slate-900"
                        placeholder="حمتين تيليكوم 4"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold mb-1">
                        اسم المحل التجاري (باللاتينية / الفرنسية):
                      </label>
                      <input
                        type="text"
                        value={settingsForm.storeNameFr}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, storeNameFr: e.target.value })
                        }
                        className="w-full bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl p-2.5 font-bold text-slate-900 font-sans"
                        placeholder="Hamtine Telecom 4"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">
                        رقم الهاتف الرسمي للمحل (اتصالات / WhatsApp) <span className="text-rose-500">*</span>:
                      </label>
                      <input
                        type="text"
                        required
                        value={settingsForm.phone}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, phone: e.target.value })
                        }
                        className="w-full bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl p-2.5 font-mono font-bold text-slate-900"
                        placeholder="0699 26 92 92"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold mb-1">
                        رقم هاتف ثانوي / بديل:
                      </label>
                      <input
                        type="text"
                        value={settingsForm.phoneSecondary || ''}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, phoneSecondary: e.target.value })
                        }
                        className="w-full bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl p-2.5 font-mono font-bold text-slate-900"
                        placeholder="0555 12 34 56"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">
                      العنوان الجغرافي الكامل للمحل <span className="text-rose-500">*</span>:
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.address}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, address: e.target.value })
                      }
                      className="w-full bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl p-2.5 text-slate-900 font-bold"
                      placeholder="ولاية الوادي - حي الاستقلال / مفترق طرق الملاح (مقابل المحطة)"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">
                        رابط خرائط Google Maps:
                      </label>
                      <input
                        type="url"
                        value={settingsForm.googleMapsUrl}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, googleMapsUrl: e.target.value })
                        }
                        className="w-full bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl p-2.5 text-slate-900 font-mono text-[11px]"
                        placeholder="https://share.google/..."
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold mb-1">
                        أوقات وساعات الدوام:
                      </label>
                      <input
                        type="text"
                        value={settingsForm.workingHours}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, workingHours: e.target.value })
                        }
                        className="w-full bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl p-2.5 text-slate-900 font-bold"
                        placeholder="يومياً من 08:30 صباحاً إلى 21:00 مساءً"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">
                      نص الشريط الإعلاني أعلى المتجر:
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.announcementText}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, announcementText: e.target.value })
                      }
                      className="w-full bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl p-2.5 text-slate-900"
                      placeholder="مرحباً بكم في حمتين تيليكوم 4..."
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">
                      تنبيه التوصيل لـ 58 ولاية:
                    </label>
                    <input
                      type="text"
                      value={settingsForm.deliveryNotice}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, deliveryNotice: e.target.value })
                      }
                      className="w-full bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl p-2.5 text-slate-900"
                      placeholder="التوصيل متوفر لـ 58 ولاية مع الدفع عند الاستلام"
                    />
                  </div>

                  {/* Open / Closed Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <span className="font-bold text-slate-800 block">حالة فتح المتجر:</span>
                      <span className="text-[11px] text-slate-500">
                        تحديد ما إذا كان المتجر يستقبل طلبات الزبائن حالياً أم مغلق مؤقتاً
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.isOpen}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, isOpen: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition"
                    >
                      <Save className="w-4 h-4" />
                      <span>حفظ التعديلات وتحديث المحل</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEditSettings}
                      className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer transition"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Right Column: Security PIN & Backup for Editing */}
            <div className="lg:col-span-5 space-y-6">
              {/* PIN Settings */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span>الرمز السري لإدارة المحل (Admin PIN)</span>
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed">
                  يمنع الرمز السري الزبائن العاديين من الدخول وتعديل الطلبات أو المخزون. الرمز الحالي الافتراضي هو <strong>1234</strong>.
                </p>

                {isChangingPin ? (
                  <div className="space-y-2 pt-1">
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={8}
                      placeholder="أدخل الرمز الجديد (4 أرقام على الأقل)..."
                      value={newPinValue}
                      onChange={(e) => setNewPinValue(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-mono"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveNewPin}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs cursor-pointer"
                      >
                        حفظ الرمز الجديد
                      </button>
                      <button
                        onClick={() => setIsChangingPin(false)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsChangingPin(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>تغيير الرمز السري للوحة</span>
                  </button>
                )}
              </div>

              {/* Data Backup & Live Editor Card (النسخة للتعديل) */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                    <FileJson className="w-4 h-4 text-indigo-600" />
                    <span>النسخ الاحتياطي وإدارة النسخة للتعديل</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-mono font-bold text-[10px]">
                    v2.0 Backup
                  </span>
                </div>

                <div className="p-3 bg-gradient-to-br from-indigo-50/70 to-slate-50 border border-indigo-100 rounded-xl text-xs space-y-1.5">
                  <p className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>محرر النسخة المباشر متاح الآن للتعديل:</span>
                  </p>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    يمكنك تعديل بيانات النسخة، المخزون، الأسعار، أو كود JSON مباشرة ومطابقتها أو استرجاعها بضغطة زر واحدة.
                  </p>
                </div>

                {/* Main Action: Open Live Backup Editor */}
                <button
                  onClick={handleOpenBackupEditor}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition"
                >
                  <Code className="w-4 h-4" />
                  <span>تعديل النسخة الاحتياطية مباشرة (محرر النسخة)</span>
                </button>

                {/* Secondary Actions: Export & Import File */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleExportData}
                    className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تنزيل النسخة (JSON)</span>
                  </button>

                  <label className="py-2.5 px-3 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 text-indigo-900 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer text-center">
                    <Upload className="w-3.5 h-3.5 text-indigo-600" />
                    <span>استيراد ملف نسخة</span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleImportBackupFile}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Reset & Demo Data */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      if (confirm('هل تريد إعادة تحميل البيانات التجريبية الغنية؟')) {
                        loadDemoData();
                      }
                    }}
                    className="py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>تحميل بيانات تجريبية</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('تحذير: هل أنت متأكد من تصفير كافة الطلبات والتذاكر؟')) {
                        clearAllDashboardData();
                      }
                    }}
                    className="py-2 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>تصفير البيانات</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD PRODUCT */}
      {/* ------------------------------------------------------------- */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900">إضافة هاتف أو إكسسوار جديد للمتجر</h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">اسم الهاتف أو المنتج:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: iPhone 15 Pro Max 256GB"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">الماركة:</label>
                  <select
                    value={newProdBrand}
                    onChange={(e) => setNewProdBrand(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Apple">Apple</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Xiaomi">Xiaomi</option>
                    <option value="Realme">Realme</option>
                    <option value="Honor">Honor</option>
                    <option value="Infinix">Infinix</option>
                    <option value="Google">Google</option>
                    <option value="Oppo">Oppo</option>
                    <option value="Autre">أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">التصنيف:</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="new-phone">هاتف جديد معلب (Neuf)</option>
                    <option value="used-phone">هاتف مستعمل مضمون (Caba / Occasion)</option>
                    <option value="accessory">إكسسوار أصلي</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">الحالة الفيزيائية:</label>
                  <select
                    value={newProdCondition}
                    onChange={(e) => setNewProdCondition(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="brand-new">جديد بالعلبة (Neuf sous blister)</option>
                    <option value="like-new">شبه جديد كابا ممتاز (Comme neuf 10/10)</option>
                    <option value="good">حالة جيدة جداً مع ضمان (Très bon état)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">مدة الضمان (بالأشهر):</label>
                  <input
                    type="number"
                    min={0}
                    value={newProdWarranty}
                    onChange={(e) => setNewProdWarranty(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">سعر البيع (د.ج):</label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">السعر قبل التخفيض (اختياري):</label>
                  <input
                    type="number"
                    min={0}
                    value={newProdOldPrice}
                    onChange={(e) => setNewProdOldPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">الكمية المتوفرة:</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">الذاكرة:</label>
                  <select
                    value={newProdStorage}
                    onChange={(e) => setNewProdStorage(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="64GB">64GB</option>
                    <option value="128GB">128GB</option>
                    <option value="256GB">256GB</option>
                    <option value="512GB">512GB</option>
                    <option value="1TB">1TB</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">الرام (RAM):</label>
                  <select
                    value={newProdRAM}
                    onChange={(e) => setNewProdRAM(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="4GB">4GB</option>
                    <option value="6GB">6GB</option>
                    <option value="8GB">8GB</option>
                    <option value="12GB">12GB</option>
                    <option value="16GB">16GB</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">اللون المتوفر:</label>
                  <input
                    type="text"
                    value={newProdColor}
                    onChange={(e) => setNewProdColor(e.target.value)}
                    placeholder="مثال: أسود، تيتانيوم طبيعي، أزرق"
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="newProdAllowInstallment"
                    checked={newProdAllowInstallment}
                    onChange={(e) => setNewProdAllowInstallment(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="newProdAllowInstallment" className="text-slate-700 font-bold cursor-pointer">
                    إتاحة البيع بالتقسيط (Facilité)
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">وصف أو ملاحظات إضافية:</label>
                <textarea
                  rows={2}
                  value={newProdDescription}
                  onChange={(e) => setNewProdDescription(e.target.value)}
                  placeholder="وصف حالة الهاتف، الملحقات المتضمنة بالعلبة، البطارية..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 resize-none"
                />
              </div>

              {/* Direct Image Upload Section (Zero URL input) */}
              <DirectImageUploader
                id="add-prod-file-input"
                images={newProdImages}
                onChange={setNewProdImages}
                isProcessing={isProcessingNewImages}
                setIsProcessing={setIsProcessingNewImages}
                showToast={showToast}
                language={language}
              />

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isProcessingNewImages}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  إضافة المنتج الآن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: EDIT PRODUCT */}
      {/* ------------------------------------------------------------- */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900">تعديل بيانات وصور المنتج</h3>
                <p className="text-xs text-slate-500">{editingProduct.name}</p>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">اسم الهاتف أو المنتج:</label>
                <input
                  type="text"
                  required
                  value={editProdName}
                  onChange={(e) => setEditProdName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">الماركة:</label>
                  <select
                    value={editProdBrand}
                    onChange={(e) => setEditProdBrand(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Apple">Apple</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Xiaomi">Xiaomi</option>
                    <option value="Realme">Realme</option>
                    <option value="Honor">Honor</option>
                    <option value="Infinix">Infinix</option>
                    <option value="Google">Google</option>
                    <option value="Oppo">Oppo</option>
                    <option value="Autre">أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">التصنيف:</label>
                  <select
                    value={editProdCategory}
                    onChange={(e) => setEditProdCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="new-phone">هاتف جديد معلب (Neuf)</option>
                    <option value="used-phone">هاتف مستعمل مضمون (Caba / Occasion)</option>
                    <option value="accessory">إكسسوار أصلي</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">الحالة الفيزيائية:</label>
                  <select
                    value={editProdCondition}
                    onChange={(e) => setEditProdCondition(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="brand-new">جديد بالعلبة (Neuf sous blister)</option>
                    <option value="like-new">شبه جديد كابا ممتاز (Comme neuf 10/10)</option>
                    <option value="good">حالة جيدة جداً مع ضمان (Très bon état)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">مدة الضمان (بالأشهر):</label>
                  <input
                    type="number"
                    min={0}
                    value={editProdWarranty}
                    onChange={(e) => setEditProdWarranty(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">سعر البيع (د.ج):</label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={editProdPrice}
                    onChange={(e) => setEditProdPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">السعر قبل التخفيض (اختياري):</label>
                  <input
                    type="number"
                    min={0}
                    value={editProdOldPrice}
                    onChange={(e) => setEditProdOldPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">الكمية بالمخزن:</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editProdStock}
                    onChange={(e) => setEditProdStock(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">الذاكرة:</label>
                  <select
                    value={editProdStorage}
                    onChange={(e) => setEditProdStorage(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="64GB">64GB</option>
                    <option value="128GB">128GB</option>
                    <option value="256GB">256GB</option>
                    <option value="512GB">512GB</option>
                    <option value="1TB">1TB</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">الرام (RAM):</label>
                  <select
                    value={editProdRAM}
                    onChange={(e) => setEditProdRAM(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="4GB">4GB</option>
                    <option value="6GB">6GB</option>
                    <option value="8GB">8GB</option>
                    <option value="12GB">12GB</option>
                    <option value="16GB">16GB</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">اللون:</label>
                  <input
                    type="text"
                    value={editProdColor}
                    onChange={(e) => setEditProdColor(e.target.value)}
                    placeholder="مثال: أسود، تيتانيوم"
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="editProdAllowInstallment"
                    checked={editProdAllowInstallment}
                    onChange={(e) => setEditProdAllowInstallment(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="editProdAllowInstallment" className="text-slate-700 font-bold cursor-pointer">
                    إتاحة البيع بالتقسيط
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">وصف المنتج وملاحظاته:</label>
                <textarea
                  rows={2}
                  value={editProdDescription}
                  onChange={(e) => setEditProdDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 resize-none"
                />
              </div>

              {/* Direct Image Upload Section (Zero URL input) */}
              <DirectImageUploader
                id="edit-prod-file-input"
                images={editProdImages}
                onChange={setEditProdImages}
                isProcessing={isProcessingEditImages}
                setIsProcessing={setIsProcessingEditImages}
                showToast={showToast}
                language={language}
              />

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isProcessingEditImages}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: EDIT REPAIR TICKET */}
      {/* ------------------------------------------------------------- */}
      {editingRepair && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900">
                  تحديث تذكرة #{editingRepair.ticketNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingRepair.phoneBrand} {editingRepair.phoneModel} — {editingRepair.customerName}
                </p>
              </div>
              <button
                onClick={() => setEditingRepair(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">حالة التصليح الحالية:</label>
                <select
                  value={newRepairStatus}
                  onChange={(e) => setNewRepairStatus(e.target.value as RepairStatus)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold"
                >
                  <option value="diagnosing">قيد التشخيص الأولي</option>
                  <option value="waiting_parts">بانتظار وصول قطع الغيار</option>
                  <option value="in_progress">جاري العمل والتصليح بالمختبر</option>
                  <option value="ready">تم الإصلاح وجاهز للتسليم بالمحل</option>
                  <option value="delivered">تم التسليم واستلام المبلغ من الزبون</option>
                  <option value="cancelled">ملغى أو تعذر التصليح</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">تكلفة قطع الغيار (د.ج):</label>
                  <input
                    type="number"
                    value={newPartsCost}
                    onChange={(e) => setNewPartsCost(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">السعر النهائي للزبون (د.ج):</label>
                  <input
                    type="number"
                    value={newFinalPrice}
                    onChange={(e) => setNewFinalPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-emerald-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">ملاحظات الفني / تقرير الصيانة:</label>
                <textarea
                  rows={3}
                  value={technicianNote}
                  onChange={(e) => setTechnicianNote(e.target.value)}
                  placeholder="أدخل تفاصيل الإصلاح أو الضمان..."
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRepair(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSaveRepair}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer"
                >
                  حفظ التحديثات
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: RECORD INSTALLMENT PAYMENT */}
      {/* ------------------------------------------------------------- */}
      {payingPlan && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900">
                  تسجيل تسديد قسط #{payingPlan.itemNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  {payingPlan.plan.customerName} — {payingPlan.amount.toLocaleString()} د.ج
                </p>
              </div>
              <button
                onClick={() => setPayingPlan(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">طريقة استلام المبلغ:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold"
                >
                  <option value="cash">نقداً داخل المحل (الوادي)</option>
                  <option value="baridimob">تحويل عبر تطبيق بريدي موب (BaridiMob)</option>
                  <option value="ccp">حوالة بريدية CCP</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">رقم وصل المعاملة / الملاحظة:</label>
                <input
                  type="text"
                  placeholder="مثال: REC-BM-8849"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPayingPlan(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => {
                    markInstallmentPaid(
                      payingPlan.plan.id,
                      payingPlan.itemNumber,
                      paymentMethod,
                      receiptNumber || undefined
                    );
                    setPayingPlan(null);
                    setReceiptNumber('');
                    showToast(language === 'ar' ? 'تم تسجيل تسديد القسط بنجاح' : 'Paiement enregistré', 'success');
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  تأكيد استلام المبلغ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: LIVE BACKUP EDITOR & INSPECTION */}
      {/* ------------------------------------------------------------- */}
      {showBackupModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-slate-900 text-white flex items-center justify-center shadow-xs">
                  <FileJson className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <span>محرر النسخة الاحتياطية وتعديل البيانات</span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-mono">
                      Live Backup Editor
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    يمكنك تعديل بيانات النسخة مباشرة (الأسعار، المخزون، أو كود JSON) واستيرادها أو تطبيقها على المتجر
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowBackupModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metrics & Mode Switcher Bar */}
            <div className="px-5 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              {/* Stats badges */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold border border-slate-200 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-slate-600" />
                  <span>المنتجات: {visualBackupData?.products?.length || 0}</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold border border-slate-200 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-slate-600" />
                  <span>الطلبات: {visualBackupData?.orders?.length || 0}</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold border border-slate-200 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-slate-600" />
                  <span>الصيانة: {visualBackupData?.repairs?.length || 0}</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold border border-slate-200 flex items-center gap-1.5">
                  <BadgePercent className="w-3.5 h-3.5 text-slate-600" />
                  <span>التقسيط: {visualBackupData?.installments?.length || 0}</span>
                </span>
                <span className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-mono text-[11px] border border-indigo-200">
                  {(new Blob([backupJsonText]).size / 1024).toFixed(1)} KB
                </span>
              </div>

              {/* Tab Switcher */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    handleValidateBackupJson();
                    setBackupEditorTab('visual');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    backupEditorTab === 'visual'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>المحرر المرئي للنسخة</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBackupEditorTab('code')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    backupEditorTab === 'code'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>محرر كود JSON</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              {/* Validation Banner */}
              {backupValidationStatus && (
                <div
                  className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                    backupValidationStatus.valid
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  {backupValidationStatus.valid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 font-medium leading-relaxed">
                    {backupValidationStatus.message}
                  </div>
                </div>
              )}

              {/* TAB 1: VISUAL BACKUP EDITOR */}
              {backupEditorTab === 'visual' && (
                <div className="space-y-4">
                  {/* Backup metadata quick edit */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="font-bold text-slate-800 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Store className="w-4 h-4 text-slate-700" />
                        <span>بيانات المحل في هذه النسخة:</span>
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {visualBackupData?.timestamp ? new Date(visualBackupData.timestamp).toLocaleString('ar-DZ') : ''}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-500 font-bold mb-1 text-[11px]">اسم المتجر في النسخة:</label>
                        <input
                          type="text"
                          value={visualBackupData?.store || visualBackupData?.settings?.storeName || ''}
                          onChange={(e) => {
                            if (!visualBackupData) return;
                            const updated: BackupPayload = {
                              ...visualBackupData,
                              store: e.target.value,
                              settings: visualBackupData.settings
                                ? { ...visualBackupData.settings, storeName: e.target.value }
                                : undefined,
                            };
                            setVisualBackupData(updated);
                            setBackupJsonText(JSON.stringify(updated, null, 2));
                          }}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-500 font-bold mb-1 text-[11px]">رقم هاتف المتجر في النسخة:</label>
                        <input
                          type="text"
                          value={visualBackupData?.settings?.phone || storeSettings.phone}
                          onChange={(e) => {
                            if (!visualBackupData) return;
                            const updated: BackupPayload = {
                              ...visualBackupData,
                              settings: {
                                ...(visualBackupData.settings || storeSettings),
                                phone: e.target.value,
                              },
                            };
                            setVisualBackupData(updated);
                            setBackupJsonText(JSON.stringify(updated, null, 2));
                          }}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Interactive Products Table in Backup */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                    <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-indigo-600" />
                        <span className="font-bold text-slate-900">
                          منتجات النسخة الاحتياطية (تعديل مباشر للأسعار والكميات):
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                          {visualBackupData?.products?.length || 0} منتج
                        </span>
                      </div>

                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="بحث في منتجات النسخة..."
                          value={backupProductFilter}
                          onChange={(e) => setBackupProductFilter(e.target.value)}
                          className="pr-8 pl-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto">
                      <table className="w-full text-xs text-start">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-bold text-[10px] sticky top-0">
                          <tr>
                            <th className="p-2.5 text-start">المنتج</th>
                            <th className="p-2.5 text-start">العلامة / الصنف</th>
                            <th className="p-2.5 text-center">السعر بالدينار (تعديل فوري)</th>
                            <th className="p-2.5 text-center">الكمية بالمخزن (تعديل فوري)</th>
                            <th className="p-2.5 text-center">إجراء</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(!visualBackupData?.products || visualBackupData.products.length === 0) && (
                            <tr>
                              <td colSpan={5} className="p-6 text-center text-slate-400">
                                لا توجد منتجات مسجلة في هذه النسخة
                              </td>
                            </tr>
                          )}
                          {visualBackupData?.products
                            ?.filter(
                              (p) =>
                                !backupProductFilter ||
                                p.name.toLowerCase().includes(backupProductFilter.toLowerCase()) ||
                                p.brand.toLowerCase().includes(backupProductFilter.toLowerCase())
                            )
                            .map((p, idx) => (
                              <tr key={p.id || idx} className="hover:bg-slate-50 transition">
                                <td className="p-2.5">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                                      {p.images && p.images[0] ? (
                                        <img
                                          src={p.images[0]}
                                          alt={p.name}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                          <Smartphone className="w-4 h-4" />
                                        </div>
                                      )}
                                    </div>
                                    <span className="font-bold text-slate-900 line-clamp-1">{p.name}</span>
                                  </div>
                                </td>
                                <td className="p-2.5 text-slate-600">
                                  <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-medium">
                                    {p.brand}
                                  </span>
                                </td>
                                <td className="p-2.5 text-center">
                                  <div className="inline-flex items-center gap-1">
                                    <input
                                      type="number"
                                      min={0}
                                      step={500}
                                      value={p.price}
                                      onChange={(e) =>
                                        handleUpdateProductInVisualBackup(idx, 'price', e.target.value)
                                      }
                                      className="w-24 p-1.5 border border-slate-300 rounded-lg text-center font-mono font-bold text-slate-900 bg-slate-50 focus:bg-white focus:border-indigo-500"
                                    />
                                    <span className="text-slate-400 font-bold text-[10px]">د.ج</span>
                                  </div>
                                </td>
                                <td className="p-2.5 text-center">
                                  <input
                                    type="number"
                                    min={0}
                                    value={p.stock}
                                    onChange={(e) =>
                                      handleUpdateProductInVisualBackup(idx, 'stock', e.target.value)
                                    }
                                    className="w-16 p-1.5 border border-slate-300 rounded-lg text-center font-mono font-bold text-slate-900 bg-slate-50 focus:bg-white focus:border-indigo-500"
                                  />
                                </td>
                                <td className="p-2.5 text-center">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`هل تريد حذف "${p.name}" من هذه النسخة؟`)) {
                                        const updatedProds = visualBackupData.products.filter((_, i) => i !== idx);
                                        const updated: BackupPayload = {
                                          ...visualBackupData,
                                          products: updatedProds,
                                        };
                                        setVisualBackupData(updated);
                                        setBackupJsonText(JSON.stringify(updated, null, 2));
                                      }
                                    }}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                                    title="حذف من النسخة"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Summary of other sections in backup */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="font-bold text-slate-700 mb-1 flex items-center justify-between">
                        <span>سجل الطلبات:</span>
                        <span className="text-indigo-600 font-mono font-bold">
                          {visualBackupData?.orders?.length || 0}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {visualBackupData?.orders?.length
                          ? `إجمالي قيمة الطلبات: ${visualBackupData.orders.reduce((acc, o) => acc + (o.total || 0), 0).toLocaleString()} د.ج`
                          : 'لا توجد طلبات في النسخة'}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="font-bold text-slate-700 mb-1 flex items-center justify-between">
                        <span>تذاكر ورشة الصيانة:</span>
                        <span className="text-amber-600 font-mono font-bold">
                          {visualBackupData?.repairs?.length || 0}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {visualBackupData?.repairs?.length
                          ? `التذاكر المكتملة: ${visualBackupData.repairs.filter((r) => r.status === 'delivered' || r.status === 'ready').length}`
                          : 'لا توجد تذاكر صيانة'}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="font-bold text-slate-700 mb-1 flex items-center justify-between">
                        <span>ملفات التقسيط:</span>
                        <span className="text-emerald-600 font-mono font-bold">
                          {visualBackupData?.installments?.length || 0}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {visualBackupData?.installments?.length
                          ? `الملفات النشطة: ${visualBackupData.installments.filter((i) => i.status === 'active').length}`
                          : 'لا توجد ملفات تقسيط'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: RAW JSON CODE EDITOR */}
              {backupEditorTab === 'code' && (
                <div className="space-y-2">
                  {/* Code Editor Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-100 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleFormatBackupJson}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-2xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>تنسيق الكود (Format JSON)</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleValidateBackupJson}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-2xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>التحقق من صحة الكود</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyBackupJson}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-2xs"
                      >
                        <Copy className="w-3.5 h-3.5 text-slate-600" />
                        <span>نسخ الكود</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('هل تريد إعادة تحميل أحدث نسخة من بيانات المتجر الحالية؟')) {
                          handleOpenBackupEditor();
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>إعادة التحميل من المتجر</span>
                    </button>
                  </div>

                  {/* Textarea Code Input */}
                  <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                    <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>backup-payload.json</span>
                      <span>UTF-8 • JSON Format</span>
                    </div>
                    <textarea
                      value={backupJsonText}
                      onChange={(e) => {
                        setBackupJsonText(e.target.value);
                        setBackupValidationStatus(null);
                      }}
                      rows={16}
                      spellCheck={false}
                      className="w-full p-3.5 bg-slate-950 text-emerald-400 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="ضع كود JSON للنسخة هنا..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBackupModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition cursor-pointer"
                >
                  إلغاء وإغلاق
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(backupJsonText);
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute('href', dataStr);
                    downloadAnchor.setAttribute(
                      'download',
                      `hamtine4-edited-backup-${new Date().toISOString().slice(0, 10)}.json`
                    );
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                    showToast('تم تصدير النسخة المعدلة كملف JSON بنجاح', 'success');
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  <span>تصدير هذه النسخة المعدلة (JSON)</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleApplyBackupFromEditor}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black flex items-center gap-2 shadow-sm transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>تطبيق وحفظ هذه النسخة في المتجر فوراً</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
