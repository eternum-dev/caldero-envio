import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../src/contexts/StoreContext', () => ({
  StoreProvider: ({ children }) => children,
  useStore: () => ({
    store: {
      name: 'Mi Local', country: 'cl',
      originCoordinates: { lat: -33.45, lng: -70.66 },
      pricingRules: [{ minKm: 0, maxKm: 5, price: 1000 }],
    },
    couriers: [{ id: 'c1', name: 'Juan Pérez', phone: '+54 11 1234 5678' }],
    saveStore: vi.fn(), addCourier: vi.fn(), savePricingRules: vi.fn(),
  }),
}));

vi.mock('../../src/contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({ user: { email: 'test@test.com' }, signOut: vi.fn() }),
}));

vi.mock('../../src/services/mapService', () => ({
  getAddressSuggestions: vi.fn(() => Promise.resolve([
    { placeName: 'Av. Siempre Viva 123, Santiago', coordinates: { lat: -33.45, lng: -70.66 } },
  ])),
  geocodeAddress: vi.fn(() => Promise.resolve({ coordinates: { lat: -33.45, lng: -70.66 }, placeName: 'Av. Siempre Viva 123, Santiago' })),
  getDistance: vi.fn(() => Promise.resolve({ distance: 5200, time: 900, geometry: 'encoded' })),
  generateGoogleMapsLink: vi.fn(() => 'https://maps.google.com/...'),
  decodePolyline: vi.fn(() => [[-70.66, -33.45], [-58.38, -34.60]]),
}));

vi.mock('../../src/services/deliveryService', () => ({
  calculatePrice: vi.fn(() => 1000),
  getPrintContent: vi.fn(() => '<div>print</div>'),
}));

vi.mock('../../src/services/whatsappService', () => ({
  prepareRouteMessage: vi.fn(() => 'Mensaje'),
  generateWhatsAppLink: vi.fn(() => 'https://wa.me/...'),
}));

vi.mock('../../src/ui/molecules/MapPreview', () => ({
  default: () => <div data-testid="map-mock" />,
}));

import { DeliveryProvider } from '../../src/contexts/DeliveryContext';
import App from '../../src/pages/App';

function renderApp() {
  return render(
    <MemoryRouter>
      <DeliveryProvider><App /></DeliveryProvider>
    </MemoryRouter>
  );
}

describe('App — flujo de integración', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renderiza componentes principales', () => {
    renderApp();
    expect(screen.getByRole('heading', { name: /calcular envío/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ingresá la dirección...')).toBeInTheDocument();
    expect(screen.getByTestId('map-mock')).toBeInTheDocument();
  });

  it('carga repartidores desde el contexto', () => {
    renderApp();
    expect(screen.getByText(/Juan Pérez/)).toBeInTheDocument();
  });

  it('deshabilita botón sin datos', () => {
    renderApp();
    expect(screen.getByRole('button', { name: /calcular envío/i })).toBeDisabled();
  });

  it('completa flujo completo de cálculo de envío', async () => {
    renderApp();

    // 1. Escribir dirección
    fireEvent.change(
      screen.getByPlaceholderText('Ingresá la dirección...'),
      { target: { value: 'Av. Siempre Viva' } }
    );

    // 2. Esperar que aparezcan sugerencias (debounce 300ms + render)
    await waitFor(() => {
      expect(screen.getByText('Av. Siempre Viva 123, Santiago')).toBeInTheDocument();
    }, { timeout: 3000 });

    // 3. Seleccionar sugerencia
    fireEvent.click(screen.getByText('Av. Siempre Viva 123, Santiago'));

    // 4. Botón se habilita
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /calcular envío/i })).not.toBeDisabled();
    });

    // 5. Calcular
    fireEvent.click(screen.getByRole('button', { name: /calcular envío/i }));

    // 6. Esperar resultados
    await waitFor(() => {
      expect(screen.getByText('Enviar WhatsApp')).toBeInTheDocument();
      expect(screen.getByText('Nueva búsqueda')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('muestra error si falla el cálculo', async () => {
    const { getDistance } = await import('../../src/services/mapService');
    getDistance.mockRejectedValue(new Error('No se pudo calcular la ruta'));

    renderApp();

    fireEvent.change(
      screen.getByPlaceholderText('Ingresá la dirección...'),
      { target: { value: 'Av. Siempre' } }
    );

    await waitFor(() => {
      expect(screen.getByText('Av. Siempre Viva 123, Santiago')).toBeInTheDocument();
    }, { timeout: 3000 });

    fireEvent.click(screen.getByText('Av. Siempre Viva 123, Santiago'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /calcular envío/i })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: /calcular envío/i }));

    await waitFor(() => {
      expect(screen.getByText('No se pudo calcular la ruta')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
