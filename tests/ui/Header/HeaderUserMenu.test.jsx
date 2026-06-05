import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

let mockUser = { email: 'test@test.com' };
const mockSignOut = vi.fn();

vi.mock('../../../src/contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser, signOut: mockSignOut }),
}));

import HeaderUserMenu from '../../../src/ui/Header/HeaderUserMenu';

function renderMenu() {
  return render(<MemoryRouter><HeaderUserMenu /></MemoryRouter>);
}

describe('HeaderUserMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = { email: 'test@test.com' };
  });

  it('renders user icon when authenticated', () => {
    renderMenu();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('opens dropdown with profile and sign out options', () => {
    renderMenu();
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Mi Perfil')).toBeInTheDocument();
    expect(screen.getByText('Cerrar Sesión')).toBeInTheDocument();
  });

  it('calls signOut on cerrar sesión click', () => {
    renderMenu();
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Cerrar Sesión'));
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('renders nothing when user is null', () => {
    mockUser = null;
    const { container } = renderMenu();
    expect(container.innerHTML).toBe('');
  });
});
