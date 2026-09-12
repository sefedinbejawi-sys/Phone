import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  db,
  auth,
  loginWithGoogle as fbLoginWithGoogle,
  logoutUser as fbLogoutUser,
  isOwnerAdmin,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
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

  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;

  // Firebase & Auth
  firebaseUser: User | null;
  isOwner: boolean;
  isFirebaseConnected: boolean;
  isAuthLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  syncCatalogToFirebase: () => Promise<void>;
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

  // Firebase integration states
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Monitor Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setFirebaseUser(usr);
      setIsAuthLoading(false);
      if (usr && (isOwnerAdmin(usr.email) || usr.email?.toLowerCase() === 'jimielbejawi@gmail.com')) {
        setRole('admin');
      }
    });
    return () => unsubscribe();
  }, []);

  // Live Firestore synchronization for Orders
  useEffect(() => {
    let unsub: (() => void) | undefined;
    try {
      unsub = onSnapshot(
        collection(db, 'orders'),
        (snapshot) => {
          setIsFirebaseConnected(true);
          if (!snapshot.empty) {
            const list: Order[] = [];
            snapshot.forEach((snap) => {
              list.push(snap.data() as Order);
            });
            list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setOrders(list);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'orders');
        }
      );
    } catch (err) {
      console.warn('Orders listener error:', err);
    }
    return () => {
      if (unsub) unsub();
    };
  }, []);

  // Live Firestore synchronization for Repairs
  useEffect(() => {
    let unsub: (() => void) | undefined;
    try {
      unsub = onSnapshot(
        collection(db, 'repairs'),
        (snapshot) => {
          setIsFirebaseConnected(true);
          if (!snapshot.empty) {
            const list: RepairTicket[] = [];
            snapshot.forEach((snap) => {
              list.push(snap.data() as RepairTicket);
            });
            list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setRepairs(list);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'repairs');
        }
      );
    } catch (err) {
      console.warn('Repairs listener error:', err);
    }
    return () => {
      if (unsub) unsub();
    };
  }, []);

  // Live Firestore synchronization for Installment Plans
  useEffect(() => {
    let unsub: (() => void) | undefined;
    try {
      unsub = onSnapshot(
        collection(db, 'installments'),
        (snapshot) => {
          setIsFirebaseConnected(true);
          if (!snapshot.empty) {
            const list: InstallmentPlan[] = [];
            snapshot.forEach((snap) => {
              list.push(snap.data() as InstallmentPlan);
            });
            setInstallments(list);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'installments');
        }
      );
    } catch (err) {
      console.warn('Installments listener error:', err);
    }
    return () => {
      if (unsub) unsub();
    };
  }, []);

  // Live Firestore synchronization for Products
  useEffect(() => {
    let unsub: (() => void) | undefined;
    try {
      unsub = onSnapshot(
        collection(db, 'products'),
        (snapshot) => {
          setIsFirebaseConnected(true);
          if (!snapshot.empty) {
            const list: Product[] = [];
            snapshot.forEach((snap) => {
              list.push(snap.data() as Product);
            });
            setProducts(list);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'products');
        }
      );
    } catch (err) {
      console.warn('Products listener error:', err);
    }
    return () => {
      if (unsub) unsub();
    };
  }, []);

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
    setDoc(doc(db, 'products', newProduct.id), newProduct).catch((err) => {
      handleFirestoreError(err, OperationType.CREATE, `products/${newProduct.id}`);
    });
    showToast(language === 'ar' ? 'تمت إضافة المنتج بنجاح' : 'Produit ajouté avec succès');
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    updateDoc(doc(db, 'products', id), updates).catch((err) => {
      handleFirestoreError(err, OperationType.UPDATE, `products/${id}`);
    });
    showToast(language === 'ar' ? 'تم تحديث بيانات المنتج' : 'Produit mis à jour');
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

    // Persist to Cloud Firestore
    setDoc(doc(db, 'orders', newOrder.id), newOrder).catch((err) => {
      handleFirestoreError(err, OperationType.CREATE, `orders/${newOrder.id}`);
    });

    // Deduct stock
    setProducts((prev) =>
      prev.map((prod) => {
        const orderedItem = newOrder.items.find((it) => it.productId === prod.id);
        if (orderedItem) {
          const newStock = Math.max(0, prod.stock - orderedItem.quantity);
          updateDoc(doc(db, 'products', prod.id), { stock: newStock }).catch(() => {});
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

    // Update in Cloud Firestore
    updateDoc(doc(db, 'orders', orderId), {
      status,
      ...(trackingCode ? { trackingCode } : {}),
    }).catch((err) => {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    });

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

    // Persist to Cloud Firestore
    setDoc(doc(db, 'repairs', newTicket.id), newTicket).catch((err) => {
      handleFirestoreError(err, OperationType.CREATE, `repairs/${newTicket.id}`);
    });

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

    // Update in Cloud Firestore
    if (updatedTicket) {
      setDoc(doc(db, 'repairs', ticketId), updatedTicket).catch((err) => {
        handleFirestoreError(err, OperationType.UPDATE, `repairs/${ticketId}`);
      });
    }

    showToast(
      language === 'ar'
        ? `تم تحديث حالة تذكرة التصليح بنجاح`
        : `Statut du ticket de réparation mis à jour`
    );
  };

  const findRepairByTicket = (ticketNumber: string) => {
    const clean = ticketNumber.trim().toUpperCase();
    return repairs.find((r) => r.ticketNumber.toUpperCase() === clean);
  };

  // Installments
  const createInstallmentPlan = (
    data: Omit<InstallmentPlan, 'id' | 'planNumber' | 'startDate' | 'status' | 'schedule'>
  ): InstallmentPlan => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const planNumber = `INST-DZ-${randomSuffix}`;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    // Build schedule
    const schedule: InstallmentPlan['schedule'] = [];
    for (let i = 1; i <= data.totalMonths; i++) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i);
      schedule.push({
        installmentNumber: i,
        dueDate: dueDate.toISOString().split('T')[0],
        amount: data.monthlyAmount,
        status: 'pending',
      });
    }

    const newPlan: InstallmentPlan = {
      ...data,
      id: 'inst-' + Date.now(),
      planNumber,
      startDate: dateStr,
      status: 'active',
      schedule,
    };

    setInstallments((prev) => [newPlan, ...prev]);

    // Persist to Cloud Firestore
    setDoc(doc(db, 'installments', newPlan.id), newPlan).catch((err) => {
      handleFirestoreError(err, OperationType.CREATE, `installments/${newPlan.id}`);
    });

    showToast(
      language === 'ar'
        ? `تم إنشاء ملف التقسيط بنجاح #${planNumber}`
        : `Dossier de facilité créé avec succès #${planNumber}`
    );
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

    // Update in Cloud Firestore
    if (updatedPlan) {
      setDoc(doc(db, 'installments', planId), updatedPlan).catch((err) => {
        handleFirestoreError(err, OperationType.UPDATE, `installments/${planId}`);
      });
    }

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
        inst.phone.includes(q) ||
        inst.nationalIdNumber.includes(q) ||
        inst.planNumber.toLowerCase().includes(q) ||
        inst.customerName.toLowerCase().includes(q)
    );
  };

  // Auth & Sync helpers
  const loginWithGoogle = async () => {
    try {
      const usr = await fbLoginWithGoogle();
      if (usr) {
        showToast(
          language === 'ar'
            ? `مرحباً بك، ${usr.displayName || usr.email}`
            : `Bienvenue, ${usr.displayName || usr.email}`
        );
      }
    } catch (err) {
      console.error(err);
      showToast(
        language === 'ar' ? 'تعذر تسجيل الدخول عبر Google' : 'Échec de connexion Google',
        'error'
      );
    }
  };

  const logout = async () => {
    await fbLogoutUser();
    showToast(
      language === 'ar' ? 'تم تسجيل الخروج بنجاح' : 'Déconnexion réussie',
      'info'
    );
  };

  const syncCatalogToFirebase = async () => {
    try {
      for (const prod of products) {
        await setDoc(doc(db, 'products', prod.id), prod);
      }
      showToast(
        language === 'ar'
          ? 'تم رفع وتحديث كافة منتجات المتجر في سحابة Firebase Firestore بنجاح ☁️'
          : 'Catalogue synchronisé avec Firebase Firestore ☁️',
        'success'
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'products');
    }
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
        toasts,
        showToast,
        wilayas: ALGERIA_WILAYAS,
        firebaseUser,
        isOwner: isOwnerAdmin(firebaseUser?.email),
        isFirebaseConnected,
        isAuthLoading,
        loginWithGoogle,
        logout,
        syncCatalogToFirebase,
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
