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
    expect(container.firstChild.className).toContain('bg-surface-medium');
  });

  it('applies primary variant class', () => {
    const { container } = render(<Badge variant="primary">Primary</Badge>);
    expect(container.firstChild.className).toContain('bg-primary/20');
  });

  it('applies custom className', () => {
    const { container } = render(<Badge className="ml-2">Custom</Badge>);
    expect(container.firstChild.className).toContain('ml-2');
  });
});

describe('Spinner', () => {
  it('renders with default md size', () => {
    const { container } = render(<Spinner />);
    expect(container.firstChild.className).toContain('h-8 w-8');
  });

  it('applies size classes', () => {
    const { container } = render(<Spinner size="lg" />);
    expect(container.firstChild.className).toContain('h-12 w-12');
  });

  it('applies custom className', () => {
    const { container } = render(<Spinner className="mx-auto" />);
    expect(container.firstChild.className).toContain('mx-auto');
  });

  it('contains an SVG element', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});

describe('Price', () => {
  it('formats value as currency', () => {
    render(<Price value={1500} />);
    // Intl.NumberFormat('es-AR', { currency: 'ARS' }) formats 1500 as "ARS 1.500"
    expect(screen.getByText(/1\.500/)).toBeInTheDocument();
  });

  it('applies size class', () => {
    const { container } = render(<Price value={500} size="lg" />);
    expect(container.firstChild.className).toContain('text-5xl');
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

  it('renders label when provided', () => {
    render(<Input label="Nombre" />);
    expect(screen.getByText('Nombre')).toBeInTheDocument();
  });

  it('does not render label when not provided', () => {
    const { container } = render(<Input placeholder="test" />);
    expect(container.querySelector('label')).not.toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<Input error="Campo requerido" />);
    expect(screen.getByText('Campo requerido')).toBeInTheDocument();
  });

  it('passes props to input element', () => {
    render(<Input data-testid="test-input" type="email" />);
    expect(screen.getByTestId('test-input')).toHaveAttribute('type', 'email');
  });
});

describe('Label', () => {
  it('renders children text', () => {
    render(<Label>Nombre del local</Label>);
    expect(screen.getByText('Nombre del local')).toBeInTheDocument();
  });

  it('shows required asterisk when required is true', () => {
    render(<Label required>Nombre</Label>);
    expect(screen.getByText('*')).toBeInTheDocument();
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
