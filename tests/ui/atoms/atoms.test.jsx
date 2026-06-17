import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '../../../src/ui/atoms/Badge';
import Spinner from '../../../src/ui/atoms/Spinner';
import Price from '../../../src/ui/atoms/Price';
import Input from '../../../src/ui/atoms/Input';
import Label from '../../../src/ui/atoms/Label';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Activo</Badge>);
    expect(screen.getByText('Activo')).toBeInTheDocument();
  });

  it('applies default variant class', () => {
    const { container } = render(<Badge>Default</Badge>);
    expect(container.firstChild.className).toContain('bg-gold-bg');
  });

  it('applies primary variant class', () => {
    const { container } = render(<Badge variant="primary">Primary</Badge>);
    expect(container.firstChild.className).toContain('bg-gold-bg');
  });

  it('applies custom className', () => {
    const { container } = render(<Badge className="ml-2">Custom</Badge>);
    expect(container.firstChild.className).toContain('ml-2');
  });
});

describe('Spinner', () => {
  it('renders with default md size', () => {
    const { container } = render(<Spinner />);
    expect(container.firstChild.className).toContain('h-6 w-6');
  });

  it('applies size classes', () => {
    const { container } = render(<Spinner size="lg" />);
    expect(container.firstChild.className).toContain('h-8 w-8');
  });

  it('applies custom className', () => {
    const { container } = render(<Spinner className="mx-auto" />);
    expect(container.firstChild.className).toContain('mx-auto');
  });

  it('uses CSS spin animation instead of SVG', () => {
    const { container } = render(<Spinner />);
    expect(container.firstChild.className).toContain('animate-spin');
    expect(container.firstChild.className).toContain('border-t-gold');
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });
});

describe('Price', () => {
it('formats value as currency', () => {
    render(<Price value={1500} />);
    // Intl.NumberFormat('es-AR', { currency: 'ARS' }) formats 1500 as "ARS 1.500"
    expect(screen.getByText(/1\.500/)).toBeInTheDocument();
  });

  it('renders symbol and value with gold styling', () => {
    const { container } = render(<Price value={500} />);
    expect(container.querySelector('.text-gold-dim')).toBeInTheDocument();
    expect(container.querySelector('.text-price')).toBeInTheDocument();
  });

  it('renders 0 correctly', () => {
    render(<Price value={0} />);
    expect(screen.getByText(/0/)).toBeInTheDocument();
  });
});

describe('Input', () => {
  it('renders input element', () => {
    render(<Input placeholder="Escribe..." />);
    expect(screen.getByPlaceholderText('Escribe...')).toBeInTheDocument();
  });

  it('passes props to input element', () => {
    render(<Input data-testid="test-input" type="email" />);
    expect(screen.getByTestId('test-input')).toHaveAttribute('type', 'email');
  });

  it('does not render label (labels are handled by FormField)', () => {
    render(<Input label="Nombre" />);
    expect(screen.queryByText('Nombre')).not.toBeInTheDocument();
  });

  it('does not render error (errors are handled by FormField)', () => {
    render(<Input error="Campo requerido" />);
    expect(screen.queryByText('Campo requerido')).not.toBeInTheDocument();
  });
});

describe('Label', () => {
  it('renders children text', () => {
    render(<Label>Nombre del local</Label>);
    expect(screen.getByText('Nombre del local')).toBeInTheDocument();
  });

  it('shows required asterisk when required is true', () => {
    const { container } = render(<Label required>Nombre</Label>);
    expect(container.querySelector('.text-gold-dim')).toBeInTheDocument(); // asterisk in gold-dim
  });

  it('does not show asterisk when required is false', () => {
    render(<Label>Nombre</Label>);
    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Label className="mb-2">Label</Label>);
    expect(container.firstChild.className).toContain('mb-2');
  });
});
