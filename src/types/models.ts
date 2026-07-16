export type AppRole = 'waiter' | 'kitchen' | 'cashier' | 'admin';

export type TableStatus = 'available' | 'occupied' | 'order_in_progress' | 'billing_requested' | 'paid' | 'ready_for_cleaning';

export type OrderItemStatus = 'draft' | 'submitted' | 'preparing' | 'ready' | 'served' | 'cancelled';

export type ServiceRequestType = 'chutney' | 'sambhar' | 'water' | 'plates_spoons' | 'table_cleaning' | 'other';

export type PaymentMethod = 'cash' | 'phonepe' | 'paytm' | 'other_upi' | 'card' | 'mixed';

export interface MenuItem {
  id?: number;
  name: string;
  category: string;
  price: number;
  available: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantTable {
  id?: number;
  name: string;
  status: TableStatus;
  currentSessionId?: number;
  capacity: number;
}

export interface DiningSession {
  id?: number;
  tableId: number;
  tableName: string;
  openedAt: string;
  closedAt?: string;
  status: TableStatus;
}

export interface OrderItem {
  id?: number;
  sessionId: number;
  tableId: number;
  menuItemId: number;
  itemName: string;
  priceSnapshot: number;
  quantity: number;
  specialInstructions: string[];
  customNotes: string;
  status: OrderItemStatus;
  orderedAt: string;
  preparingAt?: string;
  readyAt?: string;
  servedAt?: string;
}

export interface ServiceRequest {
  id?: number;
  sessionId: number;
  tableId: number;
  tableName: string;
  type: ServiceRequestType;
  notes: string;
  requestedAt: string;
  completedAt?: string;
  completed: boolean;
}

export interface Payment {
  id?: number;
  sessionId: number;
  tableId: number;
  subtotal: number;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  method: PaymentMethod;
  referenceNumber: string;
  paidAt: string;
}

const DEFAULT_SPECIAL_INSTRUCTIONS = ['कम मसालेदार', 'प्याज़ नहीं'];
const LESS_SUGAR = 'कम चीनी';
const NO_SUGAR = 'चीनी नहीं';
const SOUTH_INDIAN_CATEGORY = 'भारतीय > दक्षिण भारतीय';
const NORTH_INDIAN_CATEGORY = 'भारतीय > उत्तर भारतीय';
const ITALIAN_CATEGORY = 'अंतर्राष्ट्रीय > इटालियन';
const STREET_FOOD_CATEGORY = 'अंतर्राष्ट्रीय > स्ट्रीट फूड';
const INDO_CHINESE_CATEGORY = 'एशियाई > इंडो-चाइनीज़';
const HOT_BEVERAGES_CATEGORY = 'पेय पदार्थ > गरम';
const COLD_BEVERAGES_CATEGORY = 'पेय पदार्थ > ठंडा';
const INDIAN_DESSERTS_CATEGORY = 'मिठाई > भारतीय';

const SPECIAL_INSTRUCTIONS_BY_CATEGORY: Record<string, string[]> = {
  [SOUTH_INDIAN_CATEGORY]: ['अतिरिक्त कुरकुरा', 'कम तेल', 'कम मसालेदार', 'अतिरिक्त मसालेदार', 'प्याज़ नहीं'],
  [NORTH_INDIAN_CATEGORY]: ['कम तेल', 'कम मसालेदार', 'अतिरिक्त मसालेदार', 'प्याज़ नहीं', 'लहसुन नहीं', 'अतिरिक्त मक्खन'],
  [ITALIAN_CATEGORY]: ['अतिरिक्त चीज़', 'कम मसालेदार', 'अतिरिक्त मसालेदार', 'प्याज़ नहीं', 'लहसुन नहीं', 'अच्छी तरह पकाएं'],
  [STREET_FOOD_CATEGORY]: ['अतिरिक्त कुरकुरा', 'अतिरिक्त चीज़', 'कम मसालेदार', 'अतिरिक्त मसालेदार', 'प्याज़ नहीं'],
  [INDO_CHINESE_CATEGORY]: ['कम तेल', 'कम मसालेदार', 'अतिरिक्त मसालेदार', 'प्याज़ नहीं', 'लहसुन नहीं'],
  [HOT_BEVERAGES_CATEGORY]: [LESS_SUGAR, NO_SUGAR, 'अतिरिक्त गरम'],
  [COLD_BEVERAGES_CATEGORY]: [LESS_SUGAR, NO_SUGAR, 'कम बर्फ़', 'बर्फ़ नहीं'],
  [INDIAN_DESSERTS_CATEGORY]: [LESS_SUGAR],
};

export function getSpecialInstructionsForCategory(category: string): string[] {
  return SPECIAL_INSTRUCTIONS_BY_CATEGORY[category] ?? DEFAULT_SPECIAL_INSTRUCTIONS;
}

export const SERVICE_REQUEST_LABELS: Record<ServiceRequestType, string> = {
  chutney: 'चटनी भरें',
  sambhar: 'सांभर भरें',
  water: 'पानी',
  plates_spoons: 'प्लेट/चम्मच',
  table_cleaning: 'टेबल सफाई',
  other: 'अन्य अनुरोध',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'नकद',
  phonepe: 'PhonePe',
  paytm: 'Paytm',
  other_upi: 'अन्य UPI',
  card: 'कार्ड',
  mixed: 'मिश्रित',
};

export const TABLE_STATUS_LABELS: Record<TableStatus, string> = {
  available: 'उपलब्ध',
  occupied: 'उपयोग में',
  order_in_progress: 'ऑर्डर जारी',
  billing_requested: 'बिल माँगा',
  paid: 'भुगतान हो गया',
  ready_for_cleaning: 'सफाई के लिए तैयार',
};

export const ORDER_STATUS_LABELS: Record<OrderItemStatus, string> = {
  draft: 'ड्राफ्ट',
  submitted: 'भेजा गया',
  preparing: 'बन रहा है',
  ready: 'तैयार',
  served: 'परोसा गया',
  cancelled: 'रद्द',
};
