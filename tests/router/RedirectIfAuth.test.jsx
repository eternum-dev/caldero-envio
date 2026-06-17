import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

let mockAuth = { user: null, loading: false };

vi.mock('../../src/contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => mockAuth,
}));

import RedirectIfAuth from '../../src/router/RedirectIfAuth';

function renderWithRouter(element) {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={element} />
        <Route path="/app" element={<div>App Page</div>} />
        <Route path="/onboarding" element={<div>Onboarding Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('RedirectIfAuth', () => {
  it('shows loading spinner while auth is loading', () => {
    mockAuth = { user: null, loading: true };
    renderWithRouter(<RedirectIfAuth><div>Landing Content</div></RedirectIfAuth>);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.queryByText('Landing Content')).not.toBeInTheDocument();
  });

  it('renders children when user is not authenticated', () => {
    mockAuth = { user: null, loading: false };
    renderWithRouter(<RedirectIfAuth><div>Landing Content</div></RedirectIfAuth>);
    expect(screen.getByText('Landing Content')).toBeInTheDocument();
  });

  it('redirects to app when user has completed onboarding', () => {
    mockAuth = { user: { hasCompletedOnboarding: true }, loading: false };
    renderWithRouter(<RedirectIfAuth><div>Landing Content</div></RedirectIfAuth>);
    expect(screen.getByText('App Page')).toBeInTheDocument();
  });

  it('redirects to onboarding when user has not completed onboarding', () => {
    mockAuth = { user: { hasCompletedOnboarding: false }, loading: false };
    renderWithRouter(<RedirectIfAuth><div>Landing Content</div></RedirectIfAuth>);
    expect(screen.getByText('Onboarding Page')).toBeInTheDocument();
  });
});
