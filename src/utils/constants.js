export const ROUTES = {
  LANDING: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  ONBOARDING: '/onboarding',
  APP: '/app',
  SETTINGS: '/settings',
  NOT_FOUND: '/404',
};

/**
 * Free calderos granted to every new account on signup.
 * Locked decision — see playbook sdd/revisar-monetizacion/playbook.
 */
export const FREE_TIER_CALDEROS = 10;

/**
 * Currency used for all monetization operations.
 */
export const CURRENCY = 'CLP';

/**
 * Prepaid caldero packages.
 * KEEP IN SYNC with functions/calderos/packages.js
 * Source of truth for pricing is obs #358 / playbook #366.
 */
export const PACKAGES = {
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

/**
 * Default map center coordinates for each supported country.
 * Used when no specific city/store coordinates are available.
 */
export const COUNTRY_CENTERS = {
  AR: { lat: -34.6037, lng: -58.3816 }, // Buenos Aires
  CL: { lat: -33.4489, lng: -70.6693 }, // Santiago
  CO: { lat: 4.7110, lng: -74.0721 }, // Bogotá
  MX: { lat: 19.4326, lng: -99.1332 }, // Ciudad de México
  PE: { lat: -12.0464, lng: -77.0428 }, // Lima
  UY: { lat: -34.9011, lng: -56.1645 }, // Montevideo
  PY: { lat: -25.2637, lng: -57.5759 }, // Asunción
  BO: { lat: -16.5000, lng: -68.1500 }, // La Paz
  EC: { lat: -0.1807, lng: -78.4678 }, // Quito
  BR: { lat: -15.7975, lng: -47.8919 }, // Brasilia
};
