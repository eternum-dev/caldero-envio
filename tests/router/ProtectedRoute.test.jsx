import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

function createMockAuth(user, loading = false) {
  return { user, loading };
}

let mockAuth = createMockAuth(null, true);

vi.mock('../../src/contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => mockAuth,
}));

import ProtectedRoute from '../../src/router/ProtectedRoute';

describe('ProtectedRoute', () => {
  function renderAt(path, content) {
    render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/onboarding" element={<div>Onboarding Page</div>} />
          <Route path="*" element={content} />
        </Routes>
      </MemoryRouter>
    );
  }

  it('shows loading spinner while auth is loading', () => {
    mockAuth = createMockAuth(null, true);
    renderAt('/app', <ProtectedRoute><div>App Content</div></ProtectedRoute>);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.queryByText('App Content')).not.toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    mockAuth = createMockAuth(null, false);
    renderAt('/app', <ProtectedRoute><div>App Content</div></ProtectedRoute>);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects to onboarding when user has not completed onboarding', () => {
    mockAuth = createMockAuth({ hasCompletedOnboarding: false }, false);
    renderAt('/app', <ProtectedRoute><div>App Content</div></ProtectedRoute>);
    expect(screen.getByText('Onboarding Page')).toBeInTheDocument();
  });

  it('renders children when already on onboarding page', () => {
    mockAuth = createMockAuth({ hasCompletedOnboarding: false }, false);
    // For this test, use a custom route setup where /onboarding renders ProtectedRoute
    render(
      <MemoryRouter initialEntries={['/onboarding']}>
        <Routes>
          <Route path="/onboarding" element={<ProtectedRoute><div>Onboarding Content</div></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Onboarding Content')).toBeInTheDocument();
  });

  it('renders children when user is authenticated and onboarded', () => {
    mockAuth = createMockAuth({ hasCompletedOnboarding: true }, false);
    renderAt('/app', <ProtectedRoute><div>App Content</div></ProtectedRoute>);
    expect(screen.getByText('App Content')).toBeInTheDocument();
  });
});
