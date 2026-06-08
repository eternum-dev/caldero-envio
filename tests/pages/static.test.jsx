import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Landing from '../../src/pages/Landing';
import NotFound from '../../src/pages/NotFound';

function renderWithRouter(component) {
  return render(<HelmetProvider><MemoryRouter>{component}</MemoryRouter></HelmetProvider>);
}

describe('Landing', () => {
  it('renders the hero title', () => {
    renderWithRouter(<Landing />);
    // Hero title is now split: <h1>Cálculo de envíos <span>en menos de 30 segundos</span></h1>
    expect(screen.getByText('Cálculo de envíos')).toBeInTheDocument();
    expect(screen.getByText('en menos de 30 segundos')).toBeInTheDocument();
  });

  it('renders feature cards', () => {
    renderWithRouter(<Landing />);
    expect(screen.getByText('Rápido')).toBeInTheDocument();
    expect(screen.getByText('Consistente')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp')).toBeInTheDocument();
  });

  it('has login button linking to login page', () => {
    renderWithRouter(<Landing />);
    const loginBtn = screen.getByText('Iniciar Sesión');
    expect(loginBtn.closest('a')).toHaveAttribute('href', '/login');
  });

  it('has register button linking to register page', () => {
    renderWithRouter(<Landing />);
    const registerBtn = screen.getByText('Registrarse');
    expect(registerBtn.closest('a')).toHaveAttribute('href', '/register');
  });

  it('has CTA button linking to register', () => {
    renderWithRouter(<Landing />);
    const cta = screen.getByText('Comenzar gratis');
    expect(cta.closest('a')).toHaveAttribute('href', '/register');
  });

  it('shows footer with current year', () => {
    renderWithRouter(<Landing />);
    expect(screen.getByText(/© 2026/)).toBeInTheDocument();
  });
});

describe('NotFound', () => {
  it('renders 404 heading', () => {
    renderWithRouter(<NotFound />);
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('shows descriptive message', () => {
    renderWithRouter(<NotFound />);
    expect(screen.getByText('Página no encontrada')).toBeInTheDocument();
    expect(screen.getByText(/el caldero se pinchó/)).toBeInTheDocument();
  });

  it('has a link back to landing', () => {
    renderWithRouter(<NotFound />);
    const btn = screen.getByText('Volver al inicio');
    expect(btn.closest('a')).toHaveAttribute('href', '/');
  });
});
