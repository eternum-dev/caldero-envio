import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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

// ── Integration: AppLayout renders home icon link in header ──

describe('AppLayout — home icon in header', () => {
  it('renders a link pointing to / (landing) with a home icon', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/app']}>
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      </MemoryRouter>
    );
    const homeLink = container.querySelector('a[href="/"]');
    expect(homeLink).toBeInTheDocument();
    const svg = homeLink.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('places the home icon link inside the header', () => {
    render(
      <MemoryRouter initialEntries={['/app']}>
        <AppLayout>
          <div>Content</div>
        </AppLayout>
      </MemoryRouter>
    );
    const header = screen.getByTestId('header-mock');
    const homeLink = header.querySelector('a[href="/"]');
    expect(homeLink).toBeInTheDocument();
  });
});

// ── Integration: SettingsLayout renders home icon link in header ──

describe('SettingsLayout — home icon in header', () => {
  it('renders a link pointing to / (landing) with a home icon', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/settings']}>
        <SettingsLayout activeTab="store" onTabChange={() => {}}>
          <div>Settings content</div>
        </SettingsLayout>
      </MemoryRouter>
    );
    const homeLink = container.querySelector('a[href="/"]');
    expect(homeLink).toBeInTheDocument();
    const svg = homeLink.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('places the home icon link inside the header', () => {
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <SettingsLayout activeTab="store" onTabChange={() => {}}>
          <div>Settings content</div>
        </SettingsLayout>
      </MemoryRouter>
    );
    const header = screen.getByTestId('header-mock');
    const homeLink = header.querySelector('a[href="/"]');
    expect(homeLink).toBeInTheDocument();
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

// ── Negative: OnboardingLayout does NOT render a home icon link ──

describe('OnboardingLayout — home icon exclusion', () => {
  it('does NOT render a home icon link in the header', () => {
    const { container } = render(
      <MemoryRouter>
        <OnboardingLayout currentStep={1} totalSteps={3}>
          <div>Step content</div>
        </OnboardingLayout>
      </MemoryRouter>
    );
    const homeLink = container.querySelector('a[href="/"]');
    expect(homeLink).not.toBeInTheDocument();
  });
});