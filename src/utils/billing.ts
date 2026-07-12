import type { OrderItem } from '../types/index.ts';

export function calculateSubtotal(items: OrderItem[]): number {
  return items
    .filter(item => item.status !== 'cancelled')
    .reduce((sum, item) => sum + item.priceSnapshot * item.quantity, 0);
}

export function calculateDiscount(subtotal: number, discountType: 'fixed' | 'percentage', discountValue: number): number {
  if (discountType === 'percentage') {
    return Math.round(subtotal * discountValue / 100);
  }
  return Math.min(discountValue, subtotal);
}

export function calculateTax(amountAfterDiscount: number, taxRate: number): number {
  return Math.round(amountAfterDiscount * taxRate / 100);
}

export function calculateTotal(subtotal: number, discountAmount: number, taxAmount: number): number {
  return subtotal - discountAmount + taxAmount;
}
