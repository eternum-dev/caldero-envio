import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

let mockAuth = { loading: false };

vi.mock('../../src/contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => mockAuth,
}));

vi.mock('../../src/contexts/StoreContext', () => ({
  StoreProvider: ({ children }) => children,
  useStore: () => ({ store: null, couriers: [], saveStore: vi.fn(), addCourier: vi.fn(), removeCourier: vi.fn(), updateCourier: vi.fn(), savePricingRules: vi.fn() }),
}));

vi.mock('../../src/contexts/DeliveryContext', () => ({
  DeliveryProvider: ({ children }) => children,
  useDelivery: () => ({ delivery: { address: '', coordinates: null, courierId: '', distance: null, time: null, price: null }, setAddress: vi.fn(), setCourier: vi.fn(), setResult: vi.fn(), reset: vi.fn() }),
}));

vi.mock('../../src/hooks/useDeliveryCalculator', () => ({
  useDeliveryCalculator: () => ({ delivery: { address: '', coordinates: null, courierId: '' }, loading: false, error: null, setAddress: vi.fn(), setCourier: vi.fn(), searchAddress: vi.fn(), calculate: vi.fn(), reset: vi.fn() }),
}));

vi.mock('../../src/services/mapService', () => ({
  getAddressSuggestions: vi.fn(() => Promise.resolve([])),
  geocodeAddress: vi.fn(() => Promise.resolve({ coordinates: { lat: 0, lng: 0 } })),
  getDistance: vi.fn(() => Promise.resolve({ distance: 0, time: 0, geometry: '' })),
  decodePolyline: vi.fn(() => []),
  generateGoogleMapsLink: vi.fn(() => ''),
  getOffsetByPopulation: vi.fn(() => 0.1),
  createBBox: vi.fn(() => []),
}));

vi.mock('../../src/services/deliveryService', () => ({
  calculatePrice: vi.fn(() => 0),
  getPrintContent: vi.fn(() => ''),
}));

vi.mock('../../src/services/whatsappService', () => ({
  prepareRouteMessage: vi.fn(() => ''),
  generateWhatsAppLink: vi.fn(() => ''),
}));

vi.mock('../../src/ui/molecules/MapPreview', () => ({
  default: () => <div />,
}));

import AppRouter from '../../src/router/AppRouter';

function renderAtRoute(route) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AppRouter />
    </MemoryRouter>
  );
}

describe('AppRouter', () => {
  it('shows loading spinner while auth loads', () => {
    mockAuth = { loading: true };
    renderAtRoute('/');
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders NotFound for unknown routes', () => {
    mockAuth = { loading: false };
    renderAtRoute('/nonexistent');
    expect(screen.getByText('404')).toBeInTheDocument();
  });
});
