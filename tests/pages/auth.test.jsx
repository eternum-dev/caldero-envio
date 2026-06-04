import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockSignIn = vi.fn();
const mockCreateUser = vi.fn();
const mockSignInWithGoogle = vi.fn();

vi.mock('../../src/contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    signIn: mockSignIn,
    createUser: mockCreateUser,
    signInWithGoogle: mockSignInWithGoogle,
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

import Login from '../../src/pages/Login';
import Register from '../../src/pages/Register';

function renderPage(Component) {
  return render(<MemoryRouter><Component /></MemoryRouter>);
}

// ── Login ──────────────────────────────────────

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form', () => {
    renderPage(Login);
    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('tu@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('has register link', () => {
    renderPage(Login);
    const link = screen.getByText('Regístrate');
    expect(link.closest('a')).toHaveAttribute('href', '/register');
  });

  it('has Google sign-in button', () => {
    renderPage(Login);
    expect(screen.getByText('Google')).toBeInTheDocument();
  });

  it('calls signIn on form submit', async () => {
    mockSignIn.mockResolvedValue({ hasCompletedOnboarding: true });

    renderPage(Login);
    fireEvent.change(screen.getByPlaceholderText('tu@email.com'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /iniciar sesión/i }));
    });

    expect(mockSignIn).toHaveBeenCalledWith('test@test.com', 'password123');
  });

  it('shows error on failed sign in', async () => {
    mockSignIn.mockRejectedValue({ code: 'auth/user-not-found' });

    renderPage(Login);
    fireEvent.change(screen.getByPlaceholderText('tu@email.com'), { target: { value: 'bad@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrong' } });

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /iniciar sesión/i }));
    });

    expect(screen.getByText('No existe usuario con este email')).toBeInTheDocument();
  });
});

// ── Register ───────────────────────────────────

describe('Register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders registration form', () => {
    renderPage(Register);
    expect(screen.getByRole('heading', { name: /crear cuenta/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tu nombre')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('tu@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Mínimo 6 caracteres')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Repite la contraseña')).toBeInTheDocument();
  });

  it('has login link', () => {
    renderPage(Register);
    const link = screen.getByText('Inicia Sesión');
    expect(link.closest('a')).toHaveAttribute('href', '/login');
  });

  it('shows error when passwords do not match', async () => {
    renderPage(Register);
    fireEvent.change(screen.getByPlaceholderText('Tu nombre'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByPlaceholderText('tu@email.com'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Mínimo 6 caracteres'), { target: { value: '123456' } });
    fireEvent.change(screen.getByPlaceholderText('Repite la contraseña'), { target: { value: '654321' } });

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /crear cuenta/i }));
    });

    expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it('shows error when password is too short', async () => {
    renderPage(Register);
    fireEvent.change(screen.getByPlaceholderText('Tu nombre'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByPlaceholderText('tu@email.com'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Mínimo 6 caracteres'), { target: { value: '123' } });
    fireEvent.change(screen.getByPlaceholderText('Repite la contraseña'), { target: { value: '123' } });

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /crear cuenta/i }));
    });

    expect(screen.getByText('La contraseña debe tener al menos 6 caracteres')).toBeInTheDocument();
  });

  it('calls createUser on valid submit', async () => {
    mockCreateUser.mockResolvedValue({});

    renderPage(Register);
    fireEvent.change(screen.getByPlaceholderText('Tu nombre'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('tu@email.com'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Mínimo 6 caracteres'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Repite la contraseña'), { target: { value: 'password123' } });

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /crear cuenta/i }));
    });

    expect(mockCreateUser).toHaveBeenCalledWith('test@test.com', 'password123', { name: 'Test User' });
  });
});
