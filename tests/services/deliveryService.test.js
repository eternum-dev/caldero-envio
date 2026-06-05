import { describe, it, expect } from 'vitest';
import { calculatePrice, getPrintContent, formatDeliveryMessage } from '../../src/services/deliveryService';

describe('calculatePrice', () => {
  const rules = [
    { minKm: 0, maxKm: 3, price: 500 },
    { minKm: 3, maxKm: 5, price: 700 },
    { minKm: 5, maxKm: 10, price: 1000 },
  ];

  it('returns price for first range', () => {
    expect(calculatePrice(2, rules)).toBe(500);
  });

  it('returns price for middle range', () => {
    expect(calculatePrice(4, rules)).toBe(700);
  });

  it('returns price for last range', () => {
    expect(calculatePrice(7, rules)).toBe(1000);
  });

  it('returns 0 when no rules', () => {
    expect(calculatePrice(5, [])).toBe(0);
  });

  it('handles distance beyond last rule range with pricePerKm', () => {
    const rules = [{ minKm: 0, maxKm: 5, price: 500, pricePerKm: 100 }];
    // extraKm = distance - minKm = 10 - 0 = 10, extraPrice = 10 * 100 = 1000
    expect(calculatePrice(10, rules)).toBe(1500);
  });

  it('handles rule with null maxKm (open-ended)', () => {
    const rules = [{ minKm: 0, maxKm: null, price: 500 }];
    expect(calculatePrice(100, rules)).toBe(500);
  });
});

describe('formatDeliveryMessage', () => {
  it('includes all provided fields', () => {
    const msg = formatDeliveryMessage({
      storeName: 'Mi Local',
      address: 'Av. Siempre Viva',
      price: 1500,
      distance: 4.5,
    });
    expect(msg).toContain('Mi Local');
    expect(msg).toContain('Av. Siempre Viva');
    expect(msg).toContain('$1500');
    expect(msg).toContain('4.5');
  });
});

describe('getPrintContent', () => {
  const data = {
    storeName: 'Mi Local',
    address: 'Av. Siempre Viva 123',
    price: 1500,
    distance: 4.5,
    time: 15,
    courierName: 'Juan',
  };

  it('includes store name', () => {
    expect(getPrintContent(data)).toContain('Mi Local');
  });

  it('includes delivery address', () => {
    expect(getPrintContent(data)).toContain('Av. Siempre Viva 123');
  });

  it('includes formatted price', () => {
    expect(getPrintContent(data)).toContain('$1500');
  });

  it('includes distance', () => {
    expect(getPrintContent(data)).toContain('4.5');
  });

  it('includes courier name', () => {
    expect(getPrintContent(data)).toContain('Juan');
  });

  it('uses dark theme colors', () => {
    const content = getPrintContent(data);
    expect(content).toContain('#121110');
    expect(content).toContain('#FFBF00');
    expect(content).toContain('#e6e1df');
  });
});
