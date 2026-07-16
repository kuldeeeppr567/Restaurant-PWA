import type { OrderItem } from '../types/index.ts';
import { getSpecialInstructionsForCategory } from '../types/index.ts';
import {
  calculateSubtotal,
  calculateDiscount,
  calculateTax,
  calculateTotal,
} from '../utils/billing.ts';

function mockOrderItem(overrides: Partial<OrderItem>): OrderItem {
  return {
    sessionId: 1,
    tableId: 1,
    menuItemId: 1,
    itemName: 'Test Item',
    priceSnapshot: 100,
    quantity: 1,
    specialInstructions: [],
    customNotes: '',
    status: 'submitted',
    orderedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('Billing calculations', () => {
  it('calculates correct subtotal from multiple items with different quantities and prices', () => {
    const items = [
      mockOrderItem({ priceSnapshot: 150, quantity: 2 }),
      mockOrderItem({ priceSnapshot: 200, quantity: 1 }),
    ];
    expect(calculateSubtotal(items)).toBe(500);
  });

  it('calculates quantity and price correctly (qty 3 at ₹90 = ₹270)', () => {
    const items = [mockOrderItem({ priceSnapshot: 90, quantity: 3 })];
    expect(calculateSubtotal(items)).toBe(270);
  });

  it('calculates percentage discount (10% on ₹500 = ₹50)', () => {
    expect(calculateDiscount(500, 'percentage', 10)).toBe(50);
  });

  it('calculates fixed discount (₹100 on ₹500)', () => {
    expect(calculateDiscount(500, 'fixed', 100)).toBe(100);
  });

  it('caps fixed discount at subtotal (₹600 discount on ₹500 capped at ₹500)', () => {
    expect(calculateDiscount(500, 'fixed', 600)).toBe(500);
  });

  it('excludes cancelled items from subtotal', () => {
    const items = [
      mockOrderItem({ priceSnapshot: 200, quantity: 1, status: 'submitted' }),
      mockOrderItem({ priceSnapshot: 150, quantity: 2, status: 'cancelled' }),
    ];
    expect(calculateSubtotal(items)).toBe(200);
  });

  it('calculates tax correctly (5% on ₹450 = ₹23 rounded)', () => {
    expect(calculateTax(450, 5)).toBe(23);
  });

  it('calculates full bill (subtotal ₹500, 10% discount, 5% tax, total ₹473)', () => {
    const subtotal = 500;
    const discount = calculateDiscount(subtotal, 'percentage', 10); // 50
    const afterDiscount = subtotal - discount; // 450
    const tax = calculateTax(afterDiscount, 5); // 23
    const total = calculateTotal(subtotal, discount, tax);

    expect(discount).toBe(50);
    expect(tax).toBe(23);
    expect(total).toBe(473);
  });

  it('preserves price snapshot regardless of menu price changes', () => {
    let menuPrice = 200;
    const item = mockOrderItem({ priceSnapshot: menuPrice, quantity: 1 });

    menuPrice = 250;

    expect(calculateSubtotal([item])).toBe(200);
  });

  it('returns 0 subtotal for empty order', () => {
    expect(calculateSubtotal([])).toBe(0);
  });
});

describe('Category-driven instructions', () => {
  it('returns South Indian instructions for dosa-style items', () => {
    expect(getSpecialInstructionsForCategory('भारतीय > दक्षिण भारतीय')).toEqual(
      expect.arrayContaining(['Extra crispy', 'Less oil'])
    );
  });

  it('returns beverage-specific instructions for cold drinks', () => {
    expect(getSpecialInstructionsForCategory('पेय पदार्थ > ठंडा')).toEqual(
      expect.arrayContaining(['Less sugar', 'No ice'])
    );
  });

  it('falls back to a safe default for unknown categories', () => {
    expect(getSpecialInstructionsForCategory('Custom > Specials')).toEqual(['Less spicy', 'No onion']);
  });
});
