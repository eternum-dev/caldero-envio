import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ── Hoisted mocks (available inside vi.mock factories) ──

const {
  mockCouriers, mockSetAddress, mockSetCourier,
  mockSearchAddress, mockCalculate, mockReset,
} = vi.hoisted(() => ({
  mockCouriers: [
    { id: '1', name: 'Juan', phone: '+54 11 1234 5678' },
  ],
  mockSetAddress: vi.fn(),
  mockSetCourier: vi.fn(),
  mockSearchAddress: vi.fn(),
  mockCalculate: vi.fn(),
  mockReset: vi.fn(),
}));

// ── Module-level mutable state ──

let mockStoreState = {
  name: 'Mi Local',
  country: 'cl',
  city: { bbox: [-70, -33, -69, -32] },
  originCoordinates: { lat: -33.45, lng: -70.66 },
};

let mockDeliveryState = {
  address: '',
  coordinates: null,
  courierId: '',
  distance: null,
  time: null,
  price: null,
  routeUrl: null,
  routeGeometry: null,
};

let mockLoading = false;
let mockError = null;

// ── Mocks ──

vi.mock('../../src/contexts/StoreContext', () => ({
  StoreProvider: ({ children }) => children,
  useStore: () => ({ store: mockStoreState, couriers: mockCouriers }),
}));

vi.mock('../../src/contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({ user: { email: 'test@test.com' }, signOut: vi.fn() }),
}));

vi.mock('../../src/hooks/useDeliveryCalculator', () => ({
  useDeliveryCalculator: () => ({
    delivery: mockDeliveryState,
    loading: mockLoading,
    error: mockError,
    setAddress: mockSetAddress,
    setCourier: mockSetCourier,
    searchAddress: mockSearchAddress,
    calculate: mockCalculate,
    reset: mockReset,
  }),
}));

vi.mock('../../src/services/mapService', () => ({
  getAddressSuggestions: vi.fn(() => Promise.resolve([])),
}));

vi.mock('../../src/services/deliveryService', () => ({
  getPrintContent: vi.fn(() => '<div>print content</div>'),
}));

vi.mock('../../src/services/whatsappService', () => ({
  generateWhatsAppLink: vi.fn(() => 'https://wa.me/...'),
  prepareRouteMessage: vi.fn(() => 'Mensaje de ruta'),
}));

vi.mock('../../src/ui/molecules/MapPreview', () => ({
  default: () => <div data-testid="map-preview">Mapa previo</div>,
}));

import App from '../../src/pages/App';

function renderApp() {
  return render(<MemoryRouter><App /></MemoryRouter>);
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDeliveryState = {
      address: '',
      coordinates: null,
      courierId: '',
      distance: null,
      time: null,
      price: null,
      routeUrl: null,
      routeGeometry: null,
    };
    mockLoading = false;
    mockError = null;
    mockStoreState = {
      name: 'Mi Local',
      country: 'cl',
      city: { bbox: [-70, -33, -69, -32] },
      originCoordinates: { lat: -33.45, lng: -70.66 },
    };
  });

  it('renders the main title', () => {
    renderApp();
    expect(screen.getByRole('heading', { name: /calcular envío/i })).toBeInTheDocument();
  });

  it('renders search box', () => {
    renderApp();
    expect(screen.getByPlaceholderText('Ingresá la dirección...')).toBeInTheDocument();
  });

  it('renders map section', () => {
    renderApp();
    expect(screen.getByText('Mapa')).toBeInTheDocument();
  });

  it('renders courier select', () => {
    renderApp();
    expect(screen.getByText('Juan - +54 11 1234 5678')).toBeInTheDocument();
  });

  it('disables calculate button when no address and no courier', () => {
    renderApp();
    const btn = screen.getByRole('button', { name: /calcular envío/i });
    expect(btn).toBeDisabled();
  });

  it('shows loading spinner when store is null', () => {
    mockStoreState = null;
    renderApp();
    expect(screen.getByText('Cargando configuración...')).toBeInTheDocument();
  });

  it('shows error banner when there is an error', () => {
    mockError = 'Error al calcular';
    renderApp();
    expect(screen.getByText('Error al calcular')).toBeInTheDocument();
  });

  it('calls calculate when button is clicked with valid data', () => {
    mockCalculate.mockResolvedValue();
    mockDeliveryState = {
      ...mockDeliveryState,
      address: 'Test',
      coordinates: { lat: -33, lng: -70 },
      courierId: '1',
    };

    renderApp();
    fireEvent.click(screen.getByRole('button', { name: /calcular envío/i }));
    expect(mockCalculate).toHaveBeenCalled();
  });

  it('shows loading text on button when loading', () => {
    mockDeliveryState = {
      ...mockDeliveryState,
      address: 'Test',
      coordinates: { lat: -33, lng: -70 },
      courierId: '1',
    };
    mockLoading = true;

    renderApp();
    expect(screen.getByText('Calculando...')).toBeInTheDocument();
  });
});
