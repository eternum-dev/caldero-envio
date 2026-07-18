import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PurchaseProcessingModal from '../../../src/ui/organisms/PurchaseProcessingModal';

describe('PurchaseProcessingModal', () => {
  it('renders processing state', () => {
    render(<PurchaseProcessingModal status="processing" onClose={vi.fn()} />);
    expect(screen.getByText('Procesando tu compra')).toBeInTheDocument();
    expect(screen.getByText('Estamos confirmando el pago con MercadoPago...')).toBeInTheDocument();
  });

  it('renders credited state with balance', () => {
    render(<PurchaseProcessingModal status="credited" balance={260} onClose={vi.fn()} />);
    expect(screen.getByText('¡Compra acreditada!')).toBeInTheDocument();
    expect(screen.getByText('Ahora tienes 260 calderos disponibles.')).toBeInTheDocument();
  });

  it('renders pending state', () => {
    render(<PurchaseProcessingModal status="pending" onClose={vi.fn()} />);
    expect(screen.getByText('Pago en proceso')).toBeInTheDocument();
  });

  it('renders rejected state', () => {
    render(<PurchaseProcessingModal status="rejected" onClose={vi.fn()} />);
    expect(screen.getByText('Pago rechazado')).toBeInTheDocument();
  });

  it('renders not_found state', () => {
    render(<PurchaseProcessingModal status="not_found" onClose={vi.fn()} />);
    expect(screen.getByText('Compra no encontrada')).toBeInTheDocument();
  });

  it('calls onClose when primary button is clicked', () => {
    const onClose = vi.fn();
    render(<PurchaseProcessingModal status="credited" balance={100} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /listo/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when clicking outside', () => {
    const onClose = vi.fn();
    render(<PurchaseProcessingModal status="credited" balance={100} onClose={onClose} />);
    fireEvent.click(screen.getByRole('presentation'));
    expect(onClose).toHaveBeenCalled();
  });
});
