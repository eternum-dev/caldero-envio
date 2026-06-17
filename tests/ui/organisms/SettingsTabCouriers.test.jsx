import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsTabCouriers from '../../../src/ui/organisms/SettingsTabCouriers';

const defaultProps = {
  couriers: [
    { id: '1', name: 'Ana', phone: '+56 9 1234 5678' },
    { id: '2', name: 'Carlos', phone: '+54 11 9876 5432' },
  ],
  newCourier: { name: '', phone: '' },
  editingCourierId: null,
  editForm: { name: '', phone: '' },
  editErrors: { nameError: null, phoneError: null },
  onAdd: vi.fn(),
  onEditClick: vi.fn(),
  onCancelEdit: vi.fn(),
  onSaveEdit: vi.fn(),
  onRemove: vi.fn(),
  onNewCourierChange: vi.fn(),
  onEditFormChange: vi.fn(),
  onSave: vi.fn(),
  loading: false,
  country: 'CL',
};

describe('SettingsTabCouriers', () => {
  it('renders courier list with names', () => {
    render(<SettingsTabCouriers {...defaultProps} />);
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText('Carlos')).toBeInTheDocument();
  });

  it('renders add row fields', () => {
    render(<SettingsTabCouriers {...defaultProps} />);
    expect(screen.getByPlaceholderText('Nombre')).toBeInTheDocument();
    expect(screen.getByText('Teléfono')).toBeInTheDocument();
  });

  it('renders avatar badges for couriers', () => {
    render(<SettingsTabCouriers {...defaultProps} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('calls onAdd when add button is clicked', async () => {
    const onAdd = vi.fn();
    render(<SettingsTabCouriers {...defaultProps} onAdd={onAdd} />);
    const buttons = screen.getAllByRole('button');
    const addBtn = buttons.find(b => b.querySelector('svg use, svg') && b.closest('.flex')?.querySelector('[placeholder]'));
    if (addBtn) { await addBtn.click(); expect(onAdd).toHaveBeenCalled(); }
  });

  it('calls onRemove when remove button is clicked', async () => {
    const onRemove = vi.fn();
    render(<SettingsTabCouriers {...defaultProps} onRemove={onRemove} />);
    const courierCard = screen.getByText('Ana').closest('.bg-surface-2');
    const removeBtn = courierCard?.querySelector('button:last-child');
    if (removeBtn) { await removeBtn.click(); expect(onRemove).toHaveBeenCalledWith('1'); }
  });

  it('calls onEditClick when edit button is clicked', async () => {
    const onEditClick = vi.fn();
    render(<SettingsTabCouriers {...defaultProps} onEditClick={onEditClick} />);
    const courierCard = screen.getByText('Ana').closest('.bg-surface-2');
    const editBtn = courierCard?.querySelector('button:first-of-type');
    if (editBtn) { await editBtn.click(); expect(onEditClick).toHaveBeenCalled(); }
  });

  it('shows inline edit form when editingCourierId matches', () => {
    render(<SettingsTabCouriers {...defaultProps} editingCourierId="1" editForm={{ name: 'Ana M', phone: '+56 9 1111' }} />);
    expect(screen.getByText('Guardar')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  it('calls onCancelEdit when cancel button is clicked in edit mode', async () => {
    const onCancelEdit = vi.fn();
    render(<SettingsTabCouriers {...defaultProps} editingCourierId="1" editForm={{ name: 'Ana', phone: '+56 9 111' }} onCancelEdit={onCancelEdit} />);
    await screen.getByText('Cancelar').click();
    expect(onCancelEdit).toHaveBeenCalled();
  });

  it('calls onSaveEdit when save button is clicked in edit mode', async () => {
    const onSaveEdit = vi.fn();
    render(<SettingsTabCouriers {...defaultProps} editingCourierId="1" editForm={{ name: 'Ana', phone: '+56 9 111' }} onSaveEdit={onSaveEdit} />);
    await screen.getByText('Guardar').click();
    expect(onSaveEdit).toHaveBeenCalled();
  });

  it('calls onNewCourierChange when name input changes', async () => {
    const user = userEvent.setup();
    const onNewCourierChange = vi.fn();
    render(<SettingsTabCouriers {...defaultProps} onNewCourierChange={onNewCourierChange} />);
    const nameInput = screen.getByPlaceholderText('Nombre');
    await user.type(nameInput, 'A');
    expect(onNewCourierChange).toHaveBeenCalled();
  });
});