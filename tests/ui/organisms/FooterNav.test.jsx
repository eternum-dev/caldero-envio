import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import FooterNav from '../../../src/ui/organisms/FooterNav';
import AppLayout from '../../../src/ui/templates/AppLayout';
import SettingsLayout from '../../../src/ui/templates/SettingsLayout';
import OnboardingLayout from '../../../src/ui/templates/OnboardingLayout';
import Icon from '../../../src/ui/atoms/Icon';

// ── Shared mocks for layout integration tests ──

vi.mock('../../../src/ui/Header', () => ({
  Header: ({ children }) => <header data-testid="header-mock">{children}</header>,
  HeaderLogo: () => <span data-testid="header-logo">Logo</span>,
  HeaderUserMenu: () => <span data-testid="header-user-menu">Menu</span>,
}));

vi.mock('../../../src/ui/Header/HeaderStepIndicator', () => ({
  default: () => <span data-testid="step-indicator">Step</span>,
}));

// ── Unit: Icon home key ──

describe('Icon — home', () => {
  it('renders the home icon as a valid SVG', () => {
    const { container } = render(<Icon name="home" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
  });

  it('applies custom className to the home icon', () => {
    const { container } = render(<Icon name="home" className="w-5 h-5 text-gold" />);
    const svg = container.querySelector('svg');
    expect(svg.className.baseVal).toContain('w-5');
    expect(svg.className.baseVal).toContain('h-5');
    expect(svg.className.baseVal).toContain('text-gold');
  });
});

// ── Unit: FooterNav ──

describe('FooterNav', () => {
  it('renders "Inicio" text', () => {
    render(
      <MemoryRouter>
        <FooterNav />
      </MemoryRouter>
    );
    expect(screen.getByText('Inicio')).toBeInTheDocument();
  });

  it('renders a home icon inside the link', () => {
    const { container } = render(
      <MemoryRouter>
        <FooterNav />
      </MemoryRouter>
    );
    const link = screen.getByText('Inicio').closest('a');
    const svg = link.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('has a link pointing to / (landing)', () => {
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <FooterNav />
      </MemoryRouter>
    );
    const link = screen.getByRole('link', { name: /inicio/i });
    expect(link).toHaveAttribute('href', '/');
  });

  it('renders within a footer element', () => {
    const { container } = render(
      <MemoryRouter>
        <FooterNav />
      </MemoryRouter>
    );
    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });
});

// ── Integration: AppLayout renders FooterNav ──

describe('AppLayout — FooterNav integration', () => {
  it('renders FooterNav with Inicio link', () => {
    render(
      <MemoryRouter initialEntries={['/app']}>
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      </MemoryRouter>
    );
    expect(screen.getByText('Inicio')).toBeInTheDocument();
  });

});

// ── Integration: SettingsLayout renders FooterNav ──

describe('SettingsLayout — FooterNav integration', () => {
  it('renders FooterNav with Inicio link', () => {
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <SettingsLayout activeTab="store" onTabChange={() => {}}>
          <div>Settings content</div>
        </SettingsLayout>
      </MemoryRouter>
    );
    expect(screen.getByText('Inicio')).toBeInTheDocument();
  });

  it('preserves the Calcular back button', () => {
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <SettingsLayout activeTab="store" onTabChange={() => {}}>
          <div>Settings content</div>
        </SettingsLayout>
      </MemoryRouter>
    );
    expect(screen.getByText('Calcular')).toBeInTheDocument();
  });

});

// ── Negative: OnboardingLayout does NOT render FooterNav ──

describe('OnboardingLayout — FooterNav exclusion', () => {
  it('does NOT render FooterNav', () => {
    render(
      <MemoryRouter>
        <OnboardingLayout currentStep={1} totalSteps={3}>
          <div>Step content</div>
        </OnboardingLayout>
      </MemoryRouter>
    );
    expect(screen.queryByText('Inicio')).not.toBeInTheDocument();
  });
});