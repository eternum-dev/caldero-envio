const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { FREE_TIER_CALDEROS, CURRENCY, PACKAGES } = require('./packages');

describe('functions/calderos/packages', () => {
  it('exports FREE_TIER_CALDEROS and CURRENCY', () => {
    assert.strictEqual(FREE_TIER_CALDEROS, 10);
    assert.strictEqual(CURRENCY, 'CLP');
  });

  it('has mini package with expected shape and values', () => {
    assert.deepStrictEqual(PACKAGES.mini, {
      id: 'mini',
      name: 'Mini',
      calderos: 150,
      priceCLP: 4990,
      savingsVsMini: null,
      unitPriceCLP: 33.27,
    });
  });

  it('has standard package with expected shape and values', () => {
    assert.deepStrictEqual(PACKAGES.standard, {
      id: 'standard',
      name: 'Standard',
      calderos: 400,
      priceCLP: 9990,
      savingsVsMini: '25% más barato',
      unitPriceCLP: 24.98,
    });
  });

  it('has pro package with expected shape and values', () => {
    assert.deepStrictEqual(PACKAGES.pro, {
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
      assert.strictEqual(pkg.unitPriceCLP, derived);
    });
  });
});
