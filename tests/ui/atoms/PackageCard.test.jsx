import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PackageCard from '../../../src/ui/atoms/PackageCard';

const miniPackage = {
  id: 'mini',
  name: 'Mini',
  calderos: 150,
  priceCLP: 4990,
};

describe('PackageCard', () => {
  it('renders package name, price and calderos', () => {
    render(<PackageCard package={miniPackage} />);
    expect(screen.getByText('Mini')).toBeInTheDocument();
    expect(screen.getByText('$4.990')).toBeInTheDocument();
    expect(screen.getByText('150 calderos')).toBeInTheDocument();
  });

  it('shows "Próximamente" when disabled or no onSelect', () => {
    render(<PackageCard package={miniPackage} disabled />);
    expect(screen.getByRole('button', { name: /próximamente/i })).toBeDisabled();
  });

  it('shows "Comprar" when active', () => {
    render(<PackageCard package={miniPackage} onSelect={vi.fn()} />);
    expect(screen.getByRole('button', { name: /comprar/i })).toBeEnabled();
  });

  it('shows "Procesando..." when loading', () => {
    render(<PackageCard package={miniPackage} onSelect={vi.fn()} loading />);
    expect(screen.getByRole('button', { name: /procesando/i })).toBeDisabled();
  });

  it('calls onSelect with package id when clicked', () => {
    const handleSelect = vi.fn();
    render(<PackageCard package={miniPackage} onSelect={handleSelect} />);
    fireEvent.click(screen.getByRole('button', { name: /comprar/i }));
    expect(handleSelect).toHaveBeenCalledWith('mini');
  });

  it('renders badge when provided', () => {
    render(<PackageCard package={miniPackage} badge="25% más barato" />);
    expect(screen.getByText('25% más barato')).toBeInTheDocument();
  });
});
