export type Language = 'ar' | 'fr';

export type UserRole = 'admin' | 'technician' | 'salesperson';

export type ProductCategory = 'new-phone' | 'used-phone' | 'accessory';

export interface ProductStorageOption {
  size: string;
  price: number;
  originalPrice?: number;
}

export interface ProductColorOption {
  name: string;
  nameFr?: string;
  hex: string;
}

export interface ProductQuickSpecs {
  screen?: string;
  processor?: string;
  ram?: string;
  storage?: string;
  camera?: string;
  battery?: string;
  charging?: string;
  network?: string;
  os?: string;
}

export interface Product {
  id: string;
  name: string;
  nameFr: string;
  brand: string;
  model: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  storage?: string; // 128GB, 256GB, 512GB, 1TB
  storageOptions?: ProductStorageOption[];
  ram?: string;
  color: string;
  colorHex?: string;
  colorOptions?: ProductColorOption[];
  condition: 'brand-new' | 'like-new' | 'used-good' | 'open-box';
  batteryHealth?: number; // for used phones, e.g. 96%
  warrantyMonths: number;
  stock: number;
  images: string[];
  description: string;
  descriptionFr: string;
  specs: { [key: string]: string };
  quickSpecs?: ProductQuickSpecs;
  allowInstallment: boolean;
  minInstallmentMonths?: number; // 3, 6, 12
  quantityDiscounts?: {
    qty: number;
    discountPercent: number;
    freeShipping?: boolean;
  }[];
  rating: number;
  reviewCount: number;
  featured?: boolean;
  tags?: string[];
  wilayaName?: string;
  verifiedVendor?: boolean;
  boostBadge?: 'featured' | 'hot' | 'sale' | 'bestseller';
  deliveryMethodBadge?: string;
  storeName?: string;
}

export interface Review {
  id: string;
  productId: string;
  orderNumber: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  wilaya: string;
  verifiedPurchase: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedStorage?: string;
  purchaseType: 'full' | 'installment';
  installmentMonths?: number;
}

export interface Wilaya {
  code: number;
  nameAr: string;
  nameFr: string;
  homeDeliveryCost: number; // e.g. 700 DZD
  deskDeliveryCost: number; // e.g. 450 DZD (Stop Desk Yalidine/ZR)
  estimatedDays: string;
}

export type OrderStatus =
  | 'pending_call'      // بانتظار التأكيد الهاتفي (Standard Algerian COD step)
  | 'confirmed'         // تم التأكيد
  | 'ready_for_pickup'  // جاهز للاستلام في المحل
  | 'preparing'         // قيد التجهيز
  | 'shipped'           // تم الشحن مع شركة التوصيل
  | 'delivered'         // تم التسليم وقبض المبلغ
  | 'returned'          // مرتجع (Retour)
  | 'cancelled';        // ملغى

export interface Order {
  id: string;
  orderNumber: string; // e.g. DZ-2026-4892
  date: string;
  customerName: string;
  phone: string;
  phoneSecondary?: string;
  wilayaCode: number;
  wilayaName: string;
  commune: string;
  deliveryType: 'home' | 'desk' | 'store_pickup';
  deliveryDeskCarrier?: 'Yalidine' | 'ZR Express' | 'NOEST' | 'EcoTrack';
  address?: string;
  notes?: string;
  items: {
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    unitPrice: number;
    selectedColor?: string;
    selectedStorage?: string;
  }[];
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  paymentMethod: 'cod' | 'installment' | 'baridimob' | 'store_payment';
  status: OrderStatus;
  trackingCode?: string; // e.g. YAL-892301
  installmentPlanId?: string;
}

export type RepairStatus =
  | 'received'      // تم الاستلام في المحل
  | 'diagnosing'    // قيد الفحص والتشخيص
  | 'repairing'     // قيد الإصلاح وتغيير القطع
  | 'ready'         // جاهز للاستلام
  | 'delivered'     // تم التسليم للزبون
  | 'cancelled';    // تعذر الإصلاح / ملغى

export type FaultType =
  | 'screen'          // شاشة مكسورة / عرض
  | 'battery'         // بطارية وضعف شحن
  | 'charging_port'   // منفذ شحن كونكتور
  | 'camera'          // كاميرا أمامية / خلفية
  | 'water_damage'    // أكسدة وسقوط بالماء
  | 'motherboard'     // لوحة أم وآيسيات
  | 'software'        // سوفتوير وفك قفل وفلاش
  | 'audio_speaker'   // سماعات وميكروفون
  | 'housing'         // هيكل وزجاج خلفي
  | 'other';

export interface RepairTicket {
  id: string;
  ticketNumber: string; // e.g. REP-DZ-1048
  date: string;
  customerName: string;
  phone: string;
  wilaya: string;
  phoneBrand: string;
  phoneModel: string;
  phoneImeiOrSn?: string;
  phonePasswordOrPattern?: string;
  faultType: FaultType;
  faultDescription: string;
  estimatedPrice: number;
  finalPrice?: number;
  partsCost?: number;
  technicianNotes?: string;
  status: RepairStatus;
  statusHistory: {
    status: RepairStatus;
    timestamp: string;
    note?: string;
  }[];
  assignedTechnician?: string;
  images?: string[];
  readyDate?: string;
  warrantyPeriodDays: number;
}

export type InstallmentPaymentStatus = 'paid' | 'overdue' | 'pending';

export interface InstallmentScheduleItem {
  installmentNumber: number;
  dueDate: string;
  amount: number;
  status: InstallmentPaymentStatus;
  paidDate?: string;
  paymentMethod?: 'cash' | 'baridimob' | 'ccp';
  receiptNumber?: string;
}

export interface InstallmentPlan {
  id: string;
  planNumber: string; // e.g. INST-DZ-5021
  orderId?: string;
  productId: string;
  productName: string;
  productPrice: number;
  customerName: string;
  phone: string;
  nationalIdNumber: string; // رقم بطاقة التعريف الوطنية
  wilaya: string;
  commune: string;
  jobType: string;
  monthlySalaryRange: string;
  idCardImageFront?: string;
  idCardImageBack?: string;
  totalMonths: number; // 3, 6, 12
  downPayment: number; // الدفعة الأولى (Avance)
  remainingAmount: number;
  monthlyAmount: number;
  startDate: string;
  schedule: InstallmentScheduleItem[];
  status: 'active' | 'completed' | 'defaulted' | 'pending_approval';
  verifiedBy?: string;
}

export interface StoreSettings {
  storeName: string;
  storeNameFr: string;
  phone: string;
  phoneSecondary?: string;
  address: string;
  googleMapsUrl: string;
  workingHours: string;
  isOpen: boolean;
  announcementText?: string;
  deliveryNotice?: string;
  installmentInterestRate?: number;
  customNotes?: string;
}

export interface BackupPayload {
  store?: string;
  timestamp: string;
  version?: string;
  settings?: Partial<StoreSettings>;
  products: Product[];
  orders: Order[];
  repairs: RepairTicket[];
  installments: InstallmentPlan[];
}
