import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import HeaderToolsMenu from '../../../src/ui/Header/HeaderToolsMenu';
import { ROUTES } from '../../../src/utils/constants';

function renderWithProviders() {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <HeaderToolsMenu />
      </MemoryRouter>
    </HelmetProvider>
  );
}

describe('HeaderToolsMenu', () => {
  it('renders a closed dropdown by default with the trigger button', () => {
    renderWithProviders();

    const trigger = screen.getByRole('button', { name: /Herramientas/i });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Calculadora de costo de móvil')).not.toBeInTheDocument();
  });

  it('opens the dropdown when the trigger is clicked', () => {
    renderWithProviders();

    fireEvent.click(screen.getByRole('button', { name: /Herramientas/i }));

    expect(screen.getByText('Calculadora de costo de móvil')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Herramientas/i })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });

  it('lists the calculator tool with a link to its page', () => {
    renderWithProviders();
    fireEvent.click(screen.getByRole('button', { name: /Herramientas/i }));

    const link = screen.getByRole('menuitem', { name: /Calculadora de costo de móvil/i });
    expect(link).toHaveAttribute('href', ROUTES.TOOLS_MOBILE);
  });

  it('closes the dropdown when clicking outside', () => {
    renderWithProviders();
    fireEvent.click(screen.getByRole('button', { name: /Herramientas/i }));
    expect(screen.getByText('Calculadora de costo de móvil')).toBeInTheDocument();

    // Click on body (outside the menu)
    fireEvent.mouseDown(document.body);

    expect(screen.queryByText('Calculadora de costo de móvil')).not.toBeInTheDocument();
  });

  it('closes the dropdown when pressing Escape', () => {
    renderWithProviders();
    fireEvent.click(screen.getByRole('button', { name: /Herramientas/i }));
    expect(screen.getByText('Calculadora de costo de móvil')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByText('Calculadora de costo de móvil')).not.toBeInTheDocument();
  });
});
