import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const {
  mockStore, mockCouriers, mockSaveStore,
  mockAddCourier, mockRemoveCourier, mockUpdateCourier, mockSavePricingRules,
} = vi.hoisted(() => ({
  mockStore: {
    name: 'Mi Local',
    phone: '+54 11 1234-5678',
    address: 'Av. Siempre Viva 123',
    country: 'CL',
    city: null,
    originCoordinates: { lat: -33.45, lng: -70.66 },
    pricingRules: [{ minKm: 0, maxKm: 5, price: 1000 }],
  },
  mockCouriers: [{ id: '1', name: 'Juan', phone: '+54 11 1234 5678' }],
  mockSaveStore: vi.fn(),
  mockAddCourier: vi.fn(),
  mockRemoveCourier: vi.fn(),
  mockUpdateCourier: vi.fn(),
  mockSavePricingRules: vi.fn(),
}));

vi.mock('../../src/contexts/StoreContext', () => ({
  StoreProvider: ({ children }) => children,
  useStore: () => ({
    store: mockStore,
    couriers: mockCouriers,
    saveStore: mockSaveStore,
    addCourier: mockAddCourier,
    removeCourier: mockRemoveCourier,
    updateCourier: mockUpdateCourier,
    savePricingRules: mockSavePricingRules,
  }),
}));

vi.mock('../../src/contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({ user: { email: 'test@test.com' }, signOut: vi.fn() }),
}));

vi.mock('../../src/services/mapService', () => ({
  getAddressSuggestions: vi.fn(() => Promise.resolve([])),
  getOffsetByPopulation: vi.fn(() => 0.1),
  createBBox: vi.fn(() => [-70, -33, -69, -32]),
  getCitiesByCountry: vi.fn(() => Promise.resolve([])),
}));

vi.mock('../../src/ui/molecules/MapPreview', () => ({
  default: () => <div data-testid="map-preview" />,
}));

import Settings from '../../src/pages/Settings';

function renderSettings() {
  return render(<MemoryRouter><Settings /></MemoryRouter>);
}

describe('Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders store tab by default', () => {
    renderSettings();
    expect(screen.getByText('Datos del Local')).toBeInTheDocument();
  });

  it('renders all tab buttons', () => {
    renderSettings();
    expect(screen.getByText('Local')).toBeInTheDocument();
    expect(screen.getByText('Repartidores')).toBeInTheDocument();
    expect(screen.getByText('Tarifas')).toBeInTheDocument();
  });

  it('shows couriers tab when clicking Repartidores', () => {
    renderSettings();
    fireEvent.click(screen.getByText('Repartidores'));
    expect(screen.getByText('Juan')).toBeInTheDocument();
  });

  it('shows pricing tab when clicking Tarifas', () => {
    renderSettings();
    fireEvent.click(screen.getByText('Tarifas'));
    expect(screen.getByText('Tarifas por Distancia')).toBeInTheDocument();
  });

  it('renders map preview in store tab', () => {
    renderSettings();
    expect(screen.getByTestId('map-preview')).toBeInTheDocument();
  });

  it('renders store name in store data form', () => {
    renderSettings();
    expect(screen.getByDisplayValue('Mi Local')).toBeInTheDocument();
  });
});
