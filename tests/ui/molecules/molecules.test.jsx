import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import FormField from '../../../src/ui/molecules/FormField';
import CourierSelect from '../../../src/ui/molecules/CourierSelect';
import CountrySelect from '../../../src/ui/molecules/CountrySelect';
import DistanceInfo from '../../../src/ui/molecules/DistanceInfo';
import PriceTag from '../../../src/ui/molecules/PriceTag';
import ActionButtons from '../../../src/ui/molecules/ActionButtons';

// ── FormField ──────────────────────────────────

describe('FormField', () => {
  it('renders label and input', () => {
    render(<FormField label="Nombre" placeholder="Tu nombre" />);
    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tu nombre')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<FormField label="Email" error="Email inválido" />);
    expect(screen.getByText('Email inválido')).toBeInTheDocument();
  });

  it('passes required to Label', () => {
    const { container } = render(<FormField label="Teléfono" required />);
    expect(container.querySelector('.text-secondary')).toBeInTheDocument(); // asterisk
  });

  it('does not render label when not provided', () => {
    const { container } = render(<FormField placeholder="sin label" />);
    expect(container.querySelector('label')).not.toBeInTheDocument();
  });
});

// ── CourierSelect ──────────────────────────────

describe('CourierSelect', () => {
  const couriers = [
    { id: '1', name: 'Juan', phone: '+54 11 1234 5678' },
    { id: '2', name: 'María', phone: '+54 11 9876 5432' },
  ];

  it('renders options for each courier', () => {
    render(<CourierSelect couriers={couriers} value="" onChange={vi.fn()} />);
    expect(screen.getByText('Juan - +54 11 1234 5678')).toBeInTheDocument();
    expect(screen.getByText('María - +54 11 9876 5432')).toBeInTheDocument();
  });

  it('shows placeholder option', () => {
    render(<CourierSelect couriers={[]} value="" onChange={vi.fn()} />);
    expect(screen.getByText('Seleccionar repartidor')).toBeInTheDocument();
  });

  it('calls onChange when selecting a courier', () => {
    const onChange = vi.fn();
    render(<CourierSelect couriers={couriers} value="" onChange={onChange} />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '2' } });
    expect(onChange).toHaveBeenCalledWith('2');
  });

  it('displays error message', () => {
    render(<CourierSelect couriers={[]} value="" onChange={vi.fn()} error="Requerido" />);
    expect(screen.getByText('Requerido')).toBeInTheDocument();
  });
});

// ── CountrySelect ──────────────────────────────

describe('CountrySelect', () => {
  it('renders all countries', () => {
    render(<CountrySelect value="" onChange={vi.fn()} />);
    expect(screen.getByText('Argentina')).toBeInTheDocument();
    expect(screen.getByText('Chile')).toBeInTheDocument();
    expect(screen.getByText('México')).toBeInTheDocument();
    expect(screen.getByText('Brasil')).toBeInTheDocument();
  });

  it('calls onChange with country code', () => {
    const onChange = vi.fn();
    render(<CountrySelect value="" onChange={onChange} />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'MX' } });
    expect(onChange).toHaveBeenCalledWith('MX');
  });

  it('shows custom label', () => {
    render(<CountrySelect value="" onChange={vi.fn()} label="Seleccionar país" />);
    const labels = screen.getAllByText('Seleccionar país');
    // First match is the <label>, second is the <option> placeholder
    expect(labels.length).toBeGreaterThanOrEqual(1);
    expect(labels[0].tagName).toBe('LABEL');
  });

  it('displays error', () => {
    render(<CountrySelect value="" onChange={vi.fn()} error="Campo requerido" />);
    expect(screen.getByText('Campo requerido')).toBeInTheDocument();
  });
});

// ── DistanceInfo ───────────────────────────────

describe('DistanceInfo', () => {
  it('renders distance and time', () => {
    render(<DistanceInfo distance={5.2} time={15} />);
    expect(screen.getByText('5.2 km')).toBeInTheDocument();
    expect(screen.getByText('15 min')).toBeInTheDocument();
  });

  it('renders total time when provided', () => {
    render(<DistanceInfo distance={5.2} time={15} totalTime={40} />);
    expect(screen.getByText('40 min')).toBeInTheDocument();
  });

  it('does not render total time when null', () => {
    render(<DistanceInfo distance={5.2} time={15} totalTime={null} />);
    expect(screen.queryByText('Tiempo total')).not.toBeInTheDocument();
  });

  it('shows dash for missing values', () => {
    render(<DistanceInfo distance={null} time={null} />);
    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBe(2);
  });

  it('formats small distance as meters', () => {
    render(<DistanceInfo distance={0.5} time={10} />);
    expect(screen.getByText('500 m')).toBeInTheDocument();
  });

  it('formats time over 60 minutes as hours', () => {
    render(<DistanceInfo distance={10} time={90} />);
    expect(screen.getByText('1h 30m')).toBeInTheDocument();
  });
});

// ── PriceTag ───────────────────────────────────

describe('PriceTag', () => {
  it('renders formatted price', () => {
    render(<PriceTag value={1500} />);
    // Intl.NumberFormat('es-AR', { currency: 'ARS' })
    expect(screen.getByText(/1\.500/)).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<PriceTag value={500} label="Precio del envío" />);
    expect(screen.getByText('Precio del envío')).toBeInTheDocument();
  });

  it('does not render label when not provided', () => {
    const { container } = render(<PriceTag value={500} />);
    expect(container.querySelector('p')).not.toBeInTheDocument();
  });
});

// ── ActionButtons ──────────────────────────────

describe('ActionButtons', () => {
  it('renders WhatsApp and print buttons', () => {
    const { container } = render(<ActionButtons onWhatsApp={vi.fn()} onPrint={vi.fn()} />);
    expect(screen.getByText('Enviar WhatsApp')).toBeInTheDocument();
    expect(container.querySelectorAll('button').length).toBe(2);
  });

  it('calls onWhatsApp when clicked', () => {
    const onWhatsApp = vi.fn();
    render(<ActionButtons onWhatsApp={onWhatsApp} onPrint={vi.fn()} />);
    fireEvent.click(screen.getByText('Enviar WhatsApp'));
    expect(onWhatsApp).toHaveBeenCalled();
  });

  it('calls onPrint when printer button clicked', () => {
    const onPrint = vi.fn();
    const { container } = render(<ActionButtons onWhatsApp={vi.fn()} onPrint={onPrint} />);
    const buttons = container.querySelectorAll('button');
    // Second button is the print button
    fireEvent.click(buttons[1]);
    expect(onPrint).toHaveBeenCalled();
  });

  it('disables buttons when disabled prop is true', () => {
    render(<ActionButtons onWhatsApp={vi.fn()} onPrint={vi.fn()} disabled />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach(btn => expect(btn).toBeDisabled());
  });

  it('shows reset button when onReset is provided', () => {
    render(<ActionButtons onWhatsApp={vi.fn()} onPrint={vi.fn()} onReset={vi.fn()} />);
    expect(screen.getByText('Nueva búsqueda')).toBeInTheDocument();
  });

  it('hides reset button when onReset is not provided', () => {
    render(<ActionButtons onWhatsApp={vi.fn()} onPrint={vi.fn()} />);
    expect(screen.queryByText('Nueva búsqueda')).not.toBeInTheDocument();
  });
});
