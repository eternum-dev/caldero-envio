import { describe, it, expect } from 'vitest';
import { PACKAGES, FREE_TIER_CALDEROS, CURRENCY } from '../../src/utils/constants';

describe('monetization constants', () => {
  it('exports FREE_TIER_CALDEROS and CURRENCY', () => {
    expect(FREE_TIER_CALDEROS).toBe(10);
    expect(CURRENCY).toBe('CLP');
  });

  it('has mini package with expected shape and values', () => {
    expect(PACKAGES.mini).toEqual({
      id: 'mini',
      name: 'Mini',
      calderos: 150,
      priceCLP: 4990,
      savingsVsMini: null,
      unitPriceCLP: 33.27,
    });
  });

  it('has standard package with expected shape and values', () => {
    expect(PACKAGES.standard).toEqual({
      id: 'standard',
      name: 'Standard',
      calderos: 400,
      priceCLP: 9990,
      savingsVsMini: '25% más barato',
      unitPriceCLP: 24.98,
    });
  });

  it('has pro package with expected shape and values', () => {
    expect(PACKAGES.pro).toEqual({
      id: 'pro',
      name: 'Pro',
      calderos: 1000,
      priceCLP: 15990,
      savingsVsMini: '52% más barato',
      unitPriceCLP: 15.99,
    });
  });

  it('derives unitPriceCLP consistently from price and calderos', () => {
    Object.values(PACKAGES).forEach(pkg => {
      const derived = Math.round((pkg.priceCLP / pkg.calderos) * 100) / 100;
      expect(pkg.unitPriceCLP).toBe(derived);
    });
  });
});
