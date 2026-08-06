import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MockCheckoutModal from '../../../src/ui/organisms/MockCheckoutModal';

const mockCheckPurchaseStatus = vi.fn();

vi.mock('../../../src/services/purchaseService', () => ({
  checkPurchaseStatus: (...args) => mockCheckPurchaseStatus(...args),
  isMockCheckoutUrl: () => true,
  getCheckoutRedirectUrl: () => null,
  createCheckoutSession: vi.fn(),
}));

describe('MockCheckoutModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders mock checkout UI with package info', () => {
    render(
      <MockCheckoutModal
        purchaseId="purchase-123"
        packageId="mini"
        onOutcome={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('Simulación de checkout MercadoPago')).toBeInTheDocument();
    expect(screen.getByText('Paquete Mini')).toBeInTheDocument();
    expect(screen.getByText('150 calderos')).toBeInTheDocument();
    expect(screen.getByText('$4.990')).toBeInTheDocument();
  });

  it('calls checkPurchaseStatus and onOutcome when approving', async () => {
    mockCheckPurchaseStatus.mockResolvedValue({ status: 'credited' });
    const onOutcome = vi.fn();

    render(
      <MockCheckoutModal
        purchaseId="purchase-123"
        packageId="mini"
        onOutcome={onOutcome}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /aprobar pago/i }));

    await waitFor(() => {
      expect(mockCheckPurchaseStatus).toHaveBeenCalledWith('purchase-123', 'approved');
    });
    expect(onOutcome).toHaveBeenCalledWith('approved');
  });

  it('calls checkPurchaseStatus and onOutcome when rejecting', async () => {
    mockCheckPurchaseStatus.mockResolvedValue({ status: 'rejected' });
    const onOutcome = vi.fn();

    render(
      <MockCheckoutModal
        purchaseId="purchase-123"
        packageId="mini"
        onOutcome={onOutcome}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /rechazar pago/i }));

    await waitFor(() => {
      expect(mockCheckPurchaseStatus).toHaveBeenCalledWith('purchase-123', 'rejected');
    });
    expect(onOutcome).toHaveBeenCalledWith('rejected');
  });
});
