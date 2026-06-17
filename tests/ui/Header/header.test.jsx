import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from '../../../src/ui/Header/Header';
import HeaderLogo from '../../../src/ui/Header/HeaderLogo';
import HeaderNav from '../../../src/ui/Header/HeaderNav';
import HeaderStepIndicator from '../../../src/ui/Header/HeaderStepIndicator';
import { useClickOutside } from '../../../src/ui/Header/useClickOutside';
import { renderHook } from '@testing-library/react';

function withRouter(component) {
  return render(<MemoryRouter>{component}</MemoryRouter>);
}

describe('HeaderLogo', () => {
  it('renders default text', () => {
    withRouter(<HeaderLogo />);
    expect(screen.getByText('Caldero Envío')).toBeInTheDocument();
  });

  it('renders custom children', () => {
    withRouter(<HeaderLogo>Mi App</HeaderLogo>);
    expect(screen.getByText('Mi App')).toBeInTheDocument();
  });

  it('links to landing by default', () => {
    withRouter(<HeaderLogo />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/');
  });

  it('accepts custom to prop', () => {
    withRouter(<HeaderLogo to="/app" />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/app');
  });
});

describe('HeaderNav', () => {
  const links = [
    { label: 'Inicio', to: '/' },
    { label: 'App', to: '/app' },
  ];

  it('renders links from array', () => {
    withRouter(<HeaderNav links={links} />);
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('App')).toBeInTheDocument();
  });

  it('links have correct hrefs', () => {
    withRouter(<HeaderNav links={links} />);
    expect(screen.getByText('Inicio').closest('a')).toHaveAttribute('href', '/');
    expect(screen.getByText('App').closest('a')).toHaveAttribute('href', '/app');
  });

  it('renders children when no links prop', () => {
    withRouter(<HeaderNav><span>Children</span></HeaderNav>);
    expect(screen.getByText('Children')).toBeInTheDocument();
  });

  it('renders empty when no links and no children', () => {
    const { container } = withRouter(<HeaderNav />);
    expect(container.querySelector('nav')).toBeInTheDocument();
  });
});

describe('HeaderStepIndicator', () => {
  const steps = [
    { id: 1, label: 'Local' },
    { id: 2, label: 'Repartidores' },
    { id: 3, label: 'Tarifas' },
  ];

  it('renders step labels', () => {
    withRouter(<HeaderStepIndicator steps={steps} currentStep={2} />);
    expect(screen.getByText('Local')).toBeInTheDocument();
    expect(screen.getByText('Repartidores')).toBeInTheDocument();
    expect(screen.getByText('Tarifas')).toBeInTheDocument();
  });

  it('marks current step as active', () => {
    const { container } = withRouter(<HeaderStepIndicator steps={steps} currentStep={2} />);
    const activeCircle = container.querySelector('.border-2.border-gold');
    expect(activeCircle).toBeInTheDocument();
    expect(activeCircle?.textContent).toBe('2');
  });

  it('marks completed steps with check icon', () => {
    const { container } = withRouter(<HeaderStepIndicator steps={steps} currentStep={2} />);
    // Step 1 is completed (currentStep=2), should show a check icon
    const completedCircles = container.querySelectorAll('.bg-gold.border-gold');
    expect(completedCircles.length).toBeGreaterThanOrEqual(1);
  });

  it('shows pending steps with muted styling', () => {
    const { container } = withRouter(<HeaderStepIndicator steps={steps} currentStep={1} />);
    // Step 3 is pending (currentStep=1), should have muted border
    const pendingCircle = container.querySelector('.border-muted\\/40');
    expect(pendingCircle).toBeInTheDocument();
  });
});

describe('Header', () => {
  it('renders children', () => {
    withRouter(<Header><span>Content</span></Header>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('has static subcomponents attached', () => {
    expect(Header.Logo).toBeDefined();
    expect(Header.Nav).toBeDefined();
    expect(Header.Actions).toBeDefined();
    expect(Header.UserMenu).toBeDefined();
    expect(Header.StepIndicator).toBeDefined();
  });
});

describe('useClickOutside', () => {
  it('calls callback when clicking outside ref element', () => {
    const callback = vi.fn();
    const ref = { current: document.createElement('div') };

    renderHook(() => useClickOutside(ref, callback));

    fireEvent.mouseDown(document.body);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not call callback when clicking inside ref element', () => {
    const callback = vi.fn();
    const div = document.createElement('div');
    const ref = { current: div };

    renderHook(() => useClickOutside(ref, callback));

    fireEvent.mouseDown(div);

    expect(callback).not.toHaveBeenCalled();
  });

  it('removes event listener on unmount', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const callback = vi.fn();
    const ref = { current: document.createElement('div') };

    const { unmount } = renderHook(() => useClickOutside(ref, callback));
    unmount();

    expect(removeSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
