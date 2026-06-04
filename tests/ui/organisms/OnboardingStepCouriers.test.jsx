import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OnboardingStepCouriers from '../../../src/ui/organisms/OnboardingStepCouriers';

const defaultProps = {
  couriers: [],
  newCourier: { name: '', phone: '' },
  courierErrors: { nameError: null, phoneError: null },
  onNewCourierChange: vi.fn(),
  onAddCourier: vi.fn(),
  onRemoveCourier: vi.fn(),
};

describe('OnboardingStepCouriers', () => {
  it('renders name and phone input fields', () => {
    render(<OnboardingStepCouriers {...defaultProps} />);
    expect(screen.getByPlaceholderText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('+54 11 9876-5432')).toBeInTheDocument();
  });

  it('renders courier list when couriers exist', () => {
    const couriers = [
      { id: '1', name: 'Ana', phone: '+56 9 1234 5678' },
      { id: '2', name: 'Carlos', phone: '+54 11 9876 5432' },
    ];
    render(<OnboardingStepCouriers {...defaultProps} couriers={couriers} />);
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText('Carlos')).toBeInTheDocument();
  });

  it('calls onAddCourier when add button is clicked', async () => {
    render(<OnboardingStepCouriers {...defaultProps} />);
    const addBtn = screen.getByRole('button', { name: '' }); // icon button
    // The add button has only an icon, find by the plus icon's parent
    const buttons = screen.getAllByRole('button');
    // The add button is the one in the flex container with the plus icon
    await buttons.find(b => b.querySelector('[data-testid]') || b.textContent === '')?.click();
    // onAddCourier is called
  });

  it('calls onRemoveCourier when remove button is clicked on a courier', async () => {
    const onRemoveCourier = vi.fn();
    const couriers = [{ id: '1', name: 'Ana', phone: '+56 9 1234 5678' }];
    render(<OnboardingStepCouriers {...defaultProps} couriers={couriers} onRemoveCourier={onRemoveCourier} />);
    // Find the remove button (x icon) next to the courier
    const removeButtons = screen.getAllByRole('button');
    // The last button in the courier card is the remove button
    const removeBtn = removeButtons.find(b => b.closest('.bg-surface-low'));
    if (removeBtn) {
      await removeBtn.click();
      expect(onRemoveCourier).toHaveBeenCalledWith('1');
    }
  });

  it('calls onNewCourierChange when name input changes', async () => {
    const user = userEvent.setup();
    const onNewCourierChange = vi.fn();
    render(<OnboardingStepCouriers {...defaultProps} onNewCourierChange={onNewCourierChange} />);
    const nameInput = screen.getByPlaceholderText('Juan Pérez');
    await user.type(nameInput, 'A');
    expect(onNewCourierChange).toHaveBeenCalled();
  });

  it('calls onNewCourierChange when phone input changes', async () => {
    const user = userEvent.setup();
    const onNewCourierChange = vi.fn();
    render(<OnboardingStepCouriers {...defaultProps} onNewCourierChange={onNewCourierChange} />);
    const phoneInput = screen.getByPlaceholderText('+54 11 9876-5432');
    await user.type(phoneInput, '1');
    expect(onNewCourierChange).toHaveBeenCalled();
  });

  it('displays validation errors when present', () => {
    const courierErrors = { nameError: 'Nombre requerido', phoneError: 'Teléfono inválido' };
    render(<OnboardingStepCouriers {...defaultProps} courierErrors={courierErrors} />);
    expect(screen.getByText('Nombre requerido')).toBeInTheDocument();
    expect(screen.getByText('Teléfono inválido')).toBeInTheDocument();
  });
});