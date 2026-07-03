/**
 * Server-side mirror of the monetization constants.
 * KEEP IN SYNC with src/utils/constants.js
 * Source of truth for pricing is obs #358 / playbook #366.
 */

const FREE_TIER_CALDEROS = 10;
const CURRENCY = 'CLP';

const PACKAGES = {
  mini: {
    id: 'mini',
    name: 'Mini',
    calderos: 150,
    priceCLP: 4990,
    savingsVsMini: null,
    unitPriceCLP: 33.27,
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    calderos: 400,
    priceCLP: 9990,
    savingsVsMini: '25% más barato',
    unitPriceCLP: 24.98,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    calderos: 1000,
    priceCLP: 15990,
    savingsVsMini: '52% más barato',
    unitPriceCLP: 15.99,
  },
};

module.exports = {
  FREE_TIER_CALDEROS,
  CURRENCY,
  PACKAGES,
};
