import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Order,
  RepairTicket,
  InstallmentPlan,
  CartItem,
  Language,
  UserRole,
  RepairStatus,
  OrderStatus,
  Review,
  Wilaya,
  StoreSettings,
  BackupPayload,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_REPAIR_TICKETS,
  INITIAL_INSTALLMENT_PLANS,
  DEMO_ORDERS,
  DEMO_REPAIR_TICKETS,
  DEMO_INSTALLMENT_PLANS,
  INITIAL_REVIEWS,
} from '../data/initialData';
import { translations } from '../utils/translations';
import { ALGERIA_WILAYAS } from '../data/wilayas';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'حمتين تيليكوم 4',
  storeNameFr: 'Hamtine Telecom 4',
  phone: '0699 26 92 92',
  phoneSecondary: '0555 12 34 56',
  address: 'ولاية الوادي - حي الاستقلال / مفترق طرق الملاح (مقابل المحطة)',
  googleMapsUrl: 'https://share.google/ychE3nVODcxqlIGDt',
  workingHours: 'يومياً من 08:30 صباحاً إلى 21:00 مساءً (الجمعة بعد صلاة الجمعة)',
  isOpen: true,
  announcementText: 'مرحباً بكم في حمتين تيليكوم 4 - هواتف جديدة وكابا أصلية مع الضمان وتسهيلات بالتقسيط والورشة المتخصصة',
  deliveryNotice: 'التوصيل متوفر لـ 58 ولاية مع الدفع عند الاستلام',
  installmentInterestRate: 0,
  customNotes: 'خدمة الزبائن متوفرة 7/7 أيام مع استقبال الزبائن بالمتجر',
};

interface StoreContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.ar;
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentView: 'storefront' | 'repairs' | 'installments' | 'dashboard';
  setCurrentView: (view: 'storefront' | 'repairs' | 'installments' | 'dashboard') => void;
  wilayas: Wilaya[];
  
  // Products
  products: Product[];
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Reviews
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'date'>) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, purchaseType?: 'full' | 'installment', installmentMonths?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  
  // Checkout & Orders
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'date' | 'status'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, trackingCode?: string) => void;
  
  // Repairs
  repairs: RepairTicket[];
  activeTrackingTicket: RepairTicket | null;
  setActiveTrackingTicket: (ticket: RepairTicket | null) => void;
  createRepairTicket: (data: Omit<RepairTicket, 'id' | 'ticketNumber' | 'date' | 'status' | 'statusHistory' | 'warrantyPeriodDays'>) => RepairTicket;
  updateRepairStatus: (ticketId: string, status: RepairStatus, note?: string, finalPrice?: number, partsCost?: number) => void;
  findRepairByTicket: (ticketNumber: string) => RepairTicket | undefined;
  
  // Installments
  installments: InstallmentPlan[];
  createInstallmentPlan: (data: Omit<InstallmentPlan, 'id' | 'planNumber' | 'startDate' | 'status' | 'schedule'>) => InstallmentPlan;
  markInstallmentPaid: (planId: string, installmentNumber: number, paymentMethod: 'cash' | 'baridimob' | 'ccp', receiptNumber?: string) => void;
  findInstallmentByQuery: (query: string) => InstallmentPlan[];

  // Reset and Demo Data Helpers
  clearAllDashboardData: () => void;
  loadDemoData: () => void;

  // Store Settings & Backup
  storeSettings: StoreSettings;
  updateStoreSettings: (updates: Partial<StoreSettings>) => void;
  resetStoreSettings: () => void;
  restoreBackupData: (backup: Partial<BackupPayload>) => {
    success: boolean;
    message: string;
    counts?: { products: number; orders: number; repairs: number; installments: number };
  };

  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;

}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('phonedz_lang') as Language) || 'ar';
  });

  const [role, setRole] = useState<UserRole>('admin');
  const [currentView, setCurrentView] = useState<'storefront' | 'repairs' | 'installments' | 'dashboard'>('storefront');

  // Persistence helpers - start completely empty for fresh testing
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('phonedz_products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved products:', e);
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const hasReset = localStorage.getItem('phonedz_v2_clean_orders');
    if (!hasReset) {
      localStorage.setItem('phonedz_v2_clean_orders', 'true');
      localStorage.setItem('phonedz_orders', JSON.stringify([]));
      return [];
    }
    const saved = localStorage.getItem('phonedz_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [repairs, setRepairs] = useState<RepairTicket[]>(() => {
    const hasReset = localStorage.getItem('phonedz_v2_clean_repairs');
    if (!hasReset) {
      localStorage.setItem('phonedz_v2_clean_repairs', 'true');
      localStorage.setItem('phonedz_repairs', JSON.stringify([]));
      return [];
    }
    const saved = localStorage.getItem('phonedz_repairs');
    return saved ? JSON.parse(saved) : [];
  });

  const [installments, setInstallments] = useState<InstallmentPlan[]>(() => {
    const hasReset = localStorage.getItem('phonedz_v2_clean_inst');
    if (!hasReset) {
      localStorage.setItem('phonedz_v2_clean_inst', 'true');
      localStorage.setItem('phonedz_installments', JSON.stringify([]));
      return [];
    }
    const saved = localStorage.getItem('phonedz_installments');
    return saved ? JSON.parse(saved) : [];
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('phonedz_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('phonedz_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTrackingTicket, setActiveTrackingTicket] = useState<RepairTicket | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Store Settings (Store info, phone, address, working hours, etc.)
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('phonedz_store_settings');
    if (saved) {
      try {
        return { ...DEFAULT_STORE_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse store settings:', e);
      }
    }
    return DEFAULT_STORE_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('phonedz_store_settings', JSON.stringify(storeSettings));
  }, [storeSettings]);

  // Local-only mode: customer data stays in this browser until a backend is connected.
  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('phonedz_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('phonedz_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('phonedz_repairs', JSON.stringify(repairs));
  }, [repairs]);

  useEffect(() => {
    localStorage.setItem('phonedz_installments', JSON.stringify(installments));
  }, [installments]);

  useEffect(() => {
    localStorage.setItem('phonedz_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('phonedz_cart', JSON.stringify(cart));
  }, [cart]);

  // Handle language change & HTML direction
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('phonedz_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const t = translations[language];

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  };

  // Cart operations
  const addToCart = (
    product: Product,
    quantity = 1,
    purchaseType: 'full' | 'installment' = 'full',
    installmentMonths = 6
  ) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          product,
          quantity,
          selectedColor: product.color,
          selectedStorage: product.storage,
          purchaseType,
          installmentMonths,
        },
      ];
    });
    showToast(
      language === 'ar'
        ? `تمت إضافة "${product.name}" إلى السلة`
        : `"${product.nameFr || product.name}" ajouté au panier`
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((acc, item) => {
    let price = item.product.price;
    // Check quantity discount
    if (item.product.quantityDiscounts) {
      const tier = item.product.quantityDiscounts
        .filter((d) => item.quantity >= d.qty)
        .sort((a, b) => b.qty - a.qty)[0];
      if (tier) {
        price = price * (1 - tier.discountPercent / 100);
      }
    }
    return acc + price * item.quantity;
  }, 0);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Products
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: 'prod-' + Date.now(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    showToast(language === 'ar' ? 'تمت إضافة المنتج بنجاح' : 'Produit ajouté avec succès');
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    showToast(language === 'ar' ? 'تم تحديث بيانات المنتج' : 'Produit mis à jour');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast(language === 'ar' ? 'تم حذف المنتج بنجاح' : 'Produit supprimé avec succès', 'info');
  };

  const addReview = (reviewData: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...reviewData,
      id: 'rev-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
    };
    setReviews((prev) => [newReview, ...prev]);
    showToast(
      language === 'ar'
        ? 'شكراً لك! تم تسجيل تقييمك بنجاح'
        : 'Merci! Votre avis a été enregistré avec succès'
    );
  };

  // Orders
  const createOrder = (
    orderData: Omit<Order, 'id' | 'orderNumber' | 'date' | 'status'>
  ): Order => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `DZ-${new Date().getFullYear()}-${randomSuffix}`;
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newOrder: Order = {
      ...orderData,
      id: 'ord-' + Date.now(),
      orderNumber,
      date: dateStr,
      status: 'pending_call',
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();


    // Deduct stock
    setProducts((prev) =>
      prev.map((prod) => {
        const orderedItem = newOrder.items.find((it) => it.productId === prod.id);
        if (orderedItem) {
          const newStock = Math.max(0, prod.stock - orderedItem.quantity);
          return { ...prod, stock: newStock };
        }
        return prod;
      })
    );

    showToast(
      language === 'ar'
        ? `تم تسجيل طلبك بنجاح في السحابة برقم #${orderNumber}`
        : `Commande enregistrée dans le cloud N° #${orderNumber}`
    );

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, trackingCode?: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status,
              trackingCode: trackingCode || o.trackingCode,
            }
          : o
      )
    );


    showToast(
      language === 'ar'
        ? `تم تحديث حالة الطلب إلى: ${status}`
        : `Statut de commande mis à jour: ${status}`
    );
  };

  // Repairs
  const createRepairTicket = (
    data: Omit<RepairTicket, 'id' | 'ticketNumber' | 'date' | 'status' | 'statusHistory' | 'warrantyPeriodDays'>
  ): RepairTicket => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `REP-DZ-${randomSuffix}`;
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const timeStr = `${dateStr} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newTicket: RepairTicket = {
      ...data,
      id: 'rep-' + Date.now(),
      ticketNumber,
      date: dateStr,
      status: 'received',
      warrantyPeriodDays: 60,
      statusHistory: [
        {
          status: 'received',
          timestamp: timeStr,
          note: language === 'ar' ? 'تم إنشاء تذكرة الصيانة واستلام الطلب في النظام' : 'Ticket créé et appareil enregistré',
        },
      ],
    };

    setRepairs((prev) => [newTicket, ...prev]);
    setActiveTrackingTicket(newTicket);


    showToast(
      language === 'ar'
        ? `تم إنشاء تذكرة الصيانة بنجاح #${ticketNumber}`
        : `Ticket de réparation généré avec succès #${ticketNumber}`
    );
    return newTicket;
  };

  const updateRepairStatus = (
    ticketId: string,
    status: RepairStatus,
    note?: string,
    finalPrice?: number,
    partsCost?: number
  ) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let updatedTicket: RepairTicket | undefined;

    setRepairs((prev) =>
      prev.map((rep) => {
        if (rep.id === ticketId) {
          const updatedHistory = [
            ...rep.statusHistory,
            {
              status,
              timestamp: timeStr,
              note: note || (language === 'ar' ? `تغيير الحالة إلى ${status}` : `Statut changé à ${status}`),
            },
          ];
          updatedTicket = {
            ...rep,
            status,
            technicianNotes: note || rep.technicianNotes,
            finalPrice: finalPrice !== undefined ? finalPrice : rep.finalPrice,
            partsCost: partsCost !== undefined ? partsCost : rep.partsCost,
            statusHistory: updatedHistory,
            readyDate: status === 'ready' ? timeStr.split(' ')[0] : rep.readyDate,
          };
          return updatedTicket;
        }
        return rep;
      })
    );


    showToast(
      language === 'ar' ? 'تم تحديث حالة تذكرة التصليح بنجاح' : 'Statut du ticket mis à jour'
    );
  };

  const findRepairByTicket = (ticketNumber: string) => {
    const clean = ticketNumber.trim().toUpperCase();
    return repairs.find((repair) => repair.ticketNumber.toUpperCase() === clean);
  };

  const createInstallmentPlan = (
    data: Omit<InstallmentPlan, 'id' | 'planNumber' | 'startDate' | 'status' | 'schedule'>
  ): InstallmentPlan => {
    const planNumber = `INST-DZ-${Math.floor(1000 + Math.random() * 9000)}`;
    const startDate = new Date().toISOString().split('T')[0];
    const schedule: InstallmentPlan['schedule'] = Array.from({ length: data.totalMonths }, (_, index) => {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + index + 1);
      return { installmentNumber: index + 1, dueDate: dueDate.toISOString().split('T')[0], amount: data.monthlyAmount, status: 'pending' as const };
    });
    const newPlan: InstallmentPlan = { ...data, id: `inst-${Date.now()}`, planNumber, startDate, status: 'active', schedule };
    setInstallments((prev) => [newPlan, ...prev]);
    showToast(language === 'ar' ? `تم إنشاء ملف التقسيط #${planNumber}` : `Dossier créé #${planNumber}`);
    return newPlan;
  };

  const markInstallmentPaid = (
    planId: string,
    installmentNumber: number,
    paymentMethod: 'cash' | 'baridimob' | 'ccp',
    receiptNumber?: string
  ) => {
    const now = new Date().toISOString().split('T')[0];
    let updatedPlan: InstallmentPlan | undefined;

    setInstallments((prev) =>
      prev.map((plan) => {
        if (plan.id === planId) {
          const updatedSchedule = plan.schedule.map((item) => {
            if (item.installmentNumber === installmentNumber) {
              return {
                ...item,
                status: 'paid' as const,
                paidDate: now,
                paymentMethod,
                receiptNumber: receiptNumber || `REC-${Date.now().toString().slice(-6)}`,
              };
            }
            return item;
          });

          // Check if all are paid
          const allPaid = updatedSchedule.every((it) => it.status === 'paid');

          updatedPlan = {
            ...plan,
            schedule: updatedSchedule,
            status: allPaid ? ('completed' as const) : plan.status,
          };
          return updatedPlan;
        }
        return plan;
      })
    );

    showToast(
      language === 'ar'
        ? `تم تسجيل دفع القسط رقم ${installmentNumber} بنجاح`
        : `Mensualité N° ${installmentNumber} enregistrée comme payée`
    );
  };

  const findInstallmentByQuery = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return installments.filter(
      (inst) =>
        Boolean(inst.phone && inst.phone.includes(q)) ||
        Boolean(inst.nationalIdNumber && inst.nationalIdNumber.includes(q)) ||
        Boolean(inst.planNumber && inst.planNumber.toLowerCase().includes(q)) ||
        Boolean(inst.customerName && inst.customerName.toLowerCase().includes(q))
    );
  };

  const clearAllDashboardData = () => {
    setOrders([]);
    setRepairs([]);
    setInstallments([]);
    localStorage.setItem('phonedz_orders', JSON.stringify([]));
    localStorage.setItem('phonedz_repairs', JSON.stringify([]));
    localStorage.setItem('phonedz_installments', JSON.stringify([]));
    showToast(
      language === 'ar'
        ? 'تم تفريغ كامل معطيات لوحة التحكم وتصفير جميع الإحصائيات (0 دج)! المتجر جاهز الآن لتسجيل وتجربة طلباتك الجديدة.'
        : 'Toutes les données du tableau de bord ont été vidées à 0 DZD !',
      'success'
    );
  };

  const loadDemoData = () => {
    setOrders(DEMO_ORDERS);
    setRepairs(DEMO_REPAIR_TICKETS);
    setInstallments(DEMO_INSTALLMENT_PLANS);
    localStorage.setItem('phonedz_orders', JSON.stringify(DEMO_ORDERS));
    localStorage.setItem('phonedz_repairs', JSON.stringify(DEMO_REPAIR_TICKETS));
    localStorage.setItem('phonedz_installments', JSON.stringify(DEMO_INSTALLMENT_PLANS));
    showToast(
      language === 'ar'
        ? 'تم استيراد بيانات تجريبية (طلبات، ورشة، تقسيط) بنجاح.'
        : 'Données de démonstration chargées avec succès.',
      'info'
    );
  };

  const updateStoreSettings = (updates: Partial<StoreSettings>) => {
    setStoreSettings((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('phonedz_store_settings', JSON.stringify(updated));
      return updated;
    });
    showToast(
      language === 'ar' ? 'تم تحديث وحفظ إعدادات ومعلومات المحل بنجاح' : 'Paramètres de la boutique mis à jour',
      'success'
    );
  };

  const resetStoreSettings = () => {
    setStoreSettings(DEFAULT_STORE_SETTINGS);
    localStorage.setItem('phonedz_store_settings', JSON.stringify(DEFAULT_STORE_SETTINGS));
    showToast(
      language === 'ar' ? 'تم استعادة الإعدادات الأصلية للمحل' : 'Paramètres par défaut restaurés',
      'info'
    );
  };

  const restoreBackupData = (backup: Partial<BackupPayload>) => {
    try {
      let prodCount = 0;
      let ordCount = 0;
      let repCount = 0;
      let instCount = 0;

      if (Array.isArray(backup.products)) {
        setProducts(backup.products);
        localStorage.setItem('phonedz_products', JSON.stringify(backup.products));
        prodCount = backup.products.length;
      }
      if (Array.isArray(backup.orders)) {
        setOrders(backup.orders);
        localStorage.setItem('phonedz_orders', JSON.stringify(backup.orders));
        ordCount = backup.orders.length;
      }
      if (Array.isArray(backup.repairs)) {
        setRepairs(backup.repairs);
        localStorage.setItem('phonedz_repairs', JSON.stringify(backup.repairs));
        repCount = backup.repairs.length;
      }
      if (Array.isArray(backup.installments)) {
        setInstallments(backup.installments);
        localStorage.setItem('phonedz_installments', JSON.stringify(backup.installments));
        instCount = backup.installments.length;
      }
      if (backup.settings) {
        setStoreSettings((prev) => {
          const merged = { ...prev, ...backup.settings };
          localStorage.setItem('phonedz_store_settings', JSON.stringify(merged));
          return merged;
        });
      }

      showToast(
        language === 'ar'
          ? `تم تطبيق وحفظ النسخة بنجاح (${prodCount} منتج، ${ordCount} طلب، ${repCount} صيانة، ${instCount} تقسيط)`
          : 'Sauvegarde appliquée avec succès',
        'success'
      );

      return {
        success: true,
        message: 'Success',
        counts: { products: prodCount, orders: ordCount, repairs: repCount, installments: instCount },
      };
    } catch (e) {
      console.error('Error restoring backup:', e);
      showToast(language === 'ar' ? 'حدث خطأ أثناء تطبيق النسخة' : 'Erreur de restauration', 'error');
      return { success: false, message: 'Failed to restore' };
    }
  };

  return (
    <StoreContext.Provider
      value={{
        language,
        setLanguage,
        t,
        role,
        setRole,
        currentView,
        setCurrentView,
        products,
        selectedProduct,
        setSelectedProduct,
        addProduct,
        updateProduct,
        deleteProduct,
        reviews,
        addReview,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartCount,
        isCartOpen,
        setIsCartOpen,
        orders,
        createOrder,
        updateOrderStatus,
        repairs,
        activeTrackingTicket,
        setActiveTrackingTicket,
        createRepairTicket,
        updateRepairStatus,
        findRepairByTicket,
        installments,
        createInstallmentPlan,
        markInstallmentPaid,
        findInstallmentByQuery,
        clearAllDashboardData,
        loadDemoData,
        storeSettings,
        updateStoreSettings,
        resetStoreSettings,
        restoreBackupData,
        toasts,
        showToast,
        wilayas: ALGERIA_WILAYAS,
      }}
    >
      {children}
      {/* Toast floating notifications */}
      <div className="fixed bottom-5 left-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-3 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-3 transition-all animate-bounce-short ${
              toast.type === 'success'
                ? 'bg-emerald-700 text-white shadow-emerald-900/20'
                : toast.type === 'error'
                ? 'bg-rose-700 text-white shadow-rose-900/20'
                : toast.type === 'warning'
                ? 'bg-amber-600 text-white shadow-amber-900/20'
                : 'bg-stone-800 text-white shadow-black/20'
            }`}
          >
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
