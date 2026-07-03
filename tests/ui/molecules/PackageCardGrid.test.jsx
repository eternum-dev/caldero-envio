import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PackageCardGrid from '../../../src/ui/molecules/PackageCardGrid';
import { PACKAGES } from '../../../src/utils/constants';

const packages = Object.values(PACKAGES);

describe('PackageCardGrid', () => {
  it('renders 3 package cards', () => {
    render(<PackageCardGrid packages={packages} disabled />);
    expect(screen.getByText('Mini')).toBeInTheDocument();
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
  });

  it('derives savings badges from unit prices', () => {
    render(<PackageCardGrid packages={packages} disabled />);
    expect(screen.getByText('25% más barato')).toBeInTheDocument();
    expect(screen.getByText('52% más barato')).toBeInTheDocument();
  });

  it('passes disabled state to all cards', () => {
    render(<PackageCardGrid packages={packages} disabled />);
    const buttons = screen.getAllByRole('button', { name: /próximamente/i });
    expect(buttons).toHaveLength(3);
    buttons.forEach(btn => expect(btn).toBeDisabled());
  });

  it('calls onSelect when an active card is clicked', () => {
    const handleSelect = vi.fn();
    render(<PackageCardGrid packages={packages} onSelect={handleSelect} />);
    const buttons = screen.getAllByRole('button', { name: /comprar/i });
    // Order: Mini, Standard, Pro
    fireEvent.click(buttons[1]);
    expect(handleSelect).toHaveBeenCalledWith('standard');
  });

  it('marks the loading card as processing', () => {
    render(<PackageCardGrid packages={packages} onSelect={vi.fn()} loadingId="pro" />);
    expect(screen.getByRole('button', { name: /procesando/i })).toBeInTheDocument();
  });
});
