import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingToolsSection from '../../../src/ui/organisms/LandingToolsSection';
import { ROUTES } from '../../../src/utils/constants';

vi.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}));

function renderWithProviders() {
  return render(
    <MemoryRouter>
      <LandingToolsSection />
    </MemoryRouter>
  );
}

describe('LandingToolsSection', () => {
  it('renders the section title and subtitle', () => {
    renderWithProviders();

    expect(screen.getByText('Herramientas gratuitas')).toBeInTheDocument();
    expect(screen.getByText(/Sin registro, sin costo/)).toBeInTheDocument();
  });

  it('renders the calculator tool card with a link to the tool page', () => {
    renderWithProviders();

    const heading = screen.getByRole('heading', { name: /Calculadora de costo de móvil/i });
    expect(heading).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /Calculadora de costo de móvil/i });
    expect(link).toHaveAttribute('href', ROUTES.TOOLS_MOBILE);
  });

  it('renders a CTA on the tool card', () => {
    renderWithProviders();

    expect(screen.getByText('Probar la calculadora')).toBeInTheDocument();
  });

  it('renders a "Próximamente" card to fill the grid', () => {
    renderWithProviders();

    expect(screen.getByText('Próximamente')).toBeInTheDocument();
    expect(screen.getByText(/Estamos construyendo más calculadoras/i)).toBeInTheDocument();
  });
});
