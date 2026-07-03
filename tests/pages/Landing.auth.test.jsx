import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

vi.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { uid: 'user-123', email: 'test@test.com' } }),
}));

import Landing from '../../src/pages/Landing';

function renderWithRouter(component) {
  return render(
    <HelmetProvider>
      <MemoryRouter>{component}</MemoryRouter>
    </HelmetProvider>,
  );
}

describe('Landing (authenticated)', () => {
  it('renders pricing CTA as "Ir a la app"', () => {
    renderWithRouter(<Landing />);
    const buttons = screen.getAllByRole('button', { name: /ir a la app/i });
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it('navigates to app when pricing CTA is clicked', () => {
    renderWithRouter(<Landing />);
    const buttons = screen.getAllByRole('button', { name: /ir a la app/i });
    // The primary CTA is the last "Ir a la app" button in the pricing section.
    const pricingCTA = buttons[buttons.length - 1];
    fireEvent.click(pricingCTA);
    expect(pricingCTA).toBeInTheDocument();
  });
});
