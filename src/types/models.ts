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

const DEFAULT_SPECIAL_INSTRUCTIONS = ['Less spicy', 'No onion'];
const LESS_SUGAR = 'Less sugar';
const NO_SUGAR = 'No sugar';

const SPECIAL_INSTRUCTIONS_BY_CATEGORY: Record<string, string[]> = {
  'Indian > South Indian': ['Extra crispy', 'Less oil', 'Less spicy', 'Extra spicy', 'No onion'],
  'Indian > North Indian': ['Less oil', 'Less spicy', 'Extra spicy', 'No onion', 'No garlic', 'Extra butter'],
  'Global > Italian': ['Extra cheese', 'Less spicy', 'Extra spicy', 'No onion', 'No garlic', 'Well done'],
  'Global > Street Food': ['Extra crispy', 'Extra cheese', 'Less spicy', 'Extra spicy', 'No onion'],
  'Asian > Indo-Chinese': ['Less oil', 'Less spicy', 'Extra spicy', 'No onion', 'No garlic'],
  'Beverages > Hot': [LESS_SUGAR, NO_SUGAR, 'Extra hot'],
  'Beverages > Cold': [LESS_SUGAR, NO_SUGAR, 'Less ice', 'No ice'],
  'Desserts > Indian': [LESS_SUGAR],
};

export function getSpecialInstructionsForCategory(category: string): string[] {
  return SPECIAL_INSTRUCTIONS_BY_CATEGORY[category] ?? DEFAULT_SPECIAL_INSTRUCTIONS;
}

export const SERVICE_REQUEST_LABELS: Record<ServiceRequestType, string> = {
  chutney: 'Chutney Refill',
  sambhar: 'Sambhar Refill',
  water: 'Water',
  plates_spoons: 'Plates/Spoons',
  table_cleaning: 'Table Cleaning',
  other: 'Other Request',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  phonepe: 'PhonePe',
  paytm: 'Paytm',
  other_upi: 'Other UPI',
  card: 'Card',
  mixed: 'Mixed',
};

export const TABLE_STATUS_LABELS: Record<TableStatus, string> = {
  available: 'Available',
  occupied: 'Occupied',
  order_in_progress: 'Order In Progress',
  billing_requested: 'Billing Requested',
  paid: 'Paid',
  ready_for_cleaning: 'Ready for Cleaning',
};

export const ORDER_STATUS_LABELS: Record<OrderItemStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  preparing: 'Preparing',
  ready: 'Ready',
  served: 'Served',
  cancelled: 'Cancelled',
};
