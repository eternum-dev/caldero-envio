/* global window */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CalderosTabContent from '../../../src/ui/organisms/CalderosTabContent';

const { mockBalance, mockTransactions, mockBalanceLoading, mockTransactionsLoading } = vi.hoisted(() => ({
  mockBalance: 260,
  mockTransactions: [{ id: 'tx1', type: 'free', amount: 10, balanceAfter: 10, createdAt: Date.now() }],
  mockBalanceLoading: false,
  mockTransactionsLoading: false,
}));

const mockCreateCheckoutSession = vi.fn();
const mockCheckPurchaseStatus = vi.fn();

vi.mock('../../../src/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { uid: 'user-123' } }),
}));

vi.mock('../../../src/hooks/useCredits', () => ({
  useCredits: () => ({ balance: mockBalance, loading: mockBalanceLoading, error: null }),
}));

vi.mock('../../../src/hooks/useTransactions', () => ({
  useTransactions: () => ({ transactions: mockTransactions, loading: mockTransactionsLoading, error: null }),
}));

vi.mock('../../../src/services/purchaseService', () => ({
  createCheckoutSession: (...args) => mockCreateCheckoutSession(...args),
  checkPurchaseStatus: (...args) => mockCheckPurchaseStatus(...args),
  isMockCheckoutUrl: (url) => typeof url === 'string' && url.includes('mock.mercadopago.com'),
  getCheckoutRedirectUrl: vi.fn(),
}));

function renderWithRouter(element) {
  return render(<MemoryRouter>{element}</MemoryRouter>);
}

describe('CalderosTabContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState = vi.fn();
  });

  it('renders balance, grid, history and legal text', () => {
    renderWithRouter(<CalderosTabContent />);
    expect(screen.getByText('260')).toBeInTheDocument();
    expect(screen.getByText('calderos disponibles')).toBeInTheDocument();
    expect(screen.getByText('Mini')).toBeInTheDocument();
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('+10 calderos · hace un momento')).toBeInTheDocument();
    expect(screen.getByText(/por el momento no emitimos boleta/i)).toBeInTheDocument();
  });

  it('shows active "Comprar" buttons instead of disabled Próximamente', () => {
    renderWithRouter(<CalderosTabContent />);
    const buttons = screen.getAllByRole('button', { name: /comprar/i });
    expect(buttons).toHaveLength(3);
    buttons.forEach(btn => expect(btn).toBeEnabled());
  });

  it('initiates checkout and shows mock checkout modal on mock URL', async () => {
    mockCreateCheckoutSession.mockResolvedValue({
      init_point: 'https://mock.mercadopago.com/checkout?pid=123',
      purchase_id: 'purchase-123',
      external_reference: 'user-123_mini_abc',
    });

    renderWithRouter(<CalderosTabContent />);
    fireEvent.click(screen.getAllByRole('button', { name: /comprar/i })[0]);

    await waitFor(() => {
      expect(mockCreateCheckoutSession).toHaveBeenCalledWith('mini');
    });

    expect(screen.getByText('Simulación de checkout MercadoPago')).toBeInTheDocument();
  });

  it('shows processing modal and resolves credited status when purchaseId is provided', async () => {
    mockCheckPurchaseStatus.mockResolvedValue({
      status: 'credited',
      balance: 410,
      packageId: 'mini',
    });

    renderWithRouter(<CalderosTabContent purchaseId="purchase-123" />);

    expect(screen.getByText('Procesando tu compra')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('¡Compra acreditada!')).toBeInTheDocument();
    });

    expect(screen.getByText('Ahora tienes 410 calderos disponibles.')).toBeInTheDocument();
    expect(mockCheckPurchaseStatus).toHaveBeenCalledWith('purchase-123');
  });

  it('shows error message when checkout fails', async () => {
    mockCreateCheckoutSession.mockRejectedValue(new Error('fail'));

    renderWithRouter(<CalderosTabContent />);
    fireEvent.click(screen.getAllByRole('button', { name: /comprar/i })[0]);

    await waitFor(() => {
      expect(screen.getByText('No pudimos iniciar la compra, intenta de nuevo')).toBeInTheDocument();
    });
  });
});
