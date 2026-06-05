import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';

const {
  mockOnAuthStateChanged, mockCreateUserWithEmailAndPassword,
  mockSignInWithEmailAndPassword, mockFirebaseSignOut,
  mockGoogleAuthProvider, mockSignInWithPopup,
  mockDoc, mockSetDoc, mockGetDoc,
} = vi.hoisted(() => ({
  mockOnAuthStateChanged: vi.fn((_auth, cb) => { cb(null); return vi.fn(); }),
  mockCreateUserWithEmailAndPassword: vi.fn(),
  mockSignInWithEmailAndPassword: vi.fn(),
  mockFirebaseSignOut: vi.fn(),
  mockGoogleAuthProvider: vi.fn(),
  mockSignInWithPopup: vi.fn(),
  mockDoc: vi.fn((_db, _collection, id) => ({ _db, _collection, id })),
  mockSetDoc: vi.fn(),
  mockGetDoc: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  signOut: mockFirebaseSignOut,
  onAuthStateChanged: mockOnAuthStateChanged,
  GoogleAuthProvider: mockGoogleAuthProvider,
  signInWithPopup: mockSignInWithPopup,
}));

vi.mock('firebase/firestore', () => ({
  doc: mockDoc,
  setDoc: mockSetDoc,
  getDoc: mockGetDoc,
}));

vi.mock('../../src/config/firebase', () => ({
  auth: {},
  db: {},
}));

import { AuthProvider, useAuth } from '../../src/contexts/AuthContext';

function TestConsumer() {
  const { user, loading, createUser, signIn, signOut, signInWithGoogle, updateUser } = useAuth();
  return (
    <div>
      <p data-testid="loading">{loading ? 'loading' : 'loaded'}</p>
      <p data-testid="user">{user ? user.email : 'null'}</p>
      <p data-testid="uid">{user ? user.uid : 'null'}</p>
      <p data-testid="onboarded">{user ? String(user.hasCompletedOnboarding) : 'null'}</p>
      <button data-testid="create-user" onClick={() => createUser('test@test.com', 'pass123', { name: 'Test' })} />
      <button data-testid="sign-in" onClick={() => signIn('test@test.com', 'pass123')} />
      <button data-testid="sign-out" onClick={() => signOut()} />
      <button data-testid="google-signin" onClick={() => signInWithGoogle()} />
      <button data-testid="update-user" onClick={() => updateUser({ name: 'Updated' })} />
    </div>
  );
}

function renderProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: auth listener fires with null user (not signed in)
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => { cb(null); return vi.fn(); });
  });

  it('sets loading false and user null on mount when not authenticated', async () => {
    renderProvider();
    expect(screen.getByTestId('loading').textContent).toBe('loaded');
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it('sets user from onAuthStateChanged when authenticated', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ hasCompletedOnboarding: true }),
    });
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb({ uid: 'uid-123', email: 'test@test.com' });
      return vi.fn();
    });

    renderProvider();

    // Flush async effect (getDoc promise)
    await act(async () => {});

    expect(screen.getByTestId('uid').textContent).toBe('uid-123');
    expect(screen.getByTestId('user').textContent).toBe('test@test.com');
    expect(screen.getByTestId('onboarded').textContent).toBe('true');
  });

  it('calls unsubscribe on unmount', () => {
    const unsubscribe = vi.fn();
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => { cb(null); return unsubscribe; });

    const { unmount } = renderProvider();
    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });

  describe('createUser', () => {
    it('creates Firebase user and Firestore doc', async () => {
      mockCreateUserWithEmailAndPassword.mockResolvedValue({
        user: { uid: 'new-uid' },
      });
      mockGetDoc.mockResolvedValue({ exists: () => false });

      renderProvider();

      await act(async () => {
        screen.getByTestId('create-user').click();
      });

      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith({}, 'test@test.com', 'pass123');
      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'new-uid' }),
        expect.objectContaining({
          email: 'test@test.com',
          hasCompletedOnboarding: false,
          name: 'Test',
        })
      );
    });
  });

  describe('signIn', () => {
    it('signs in and fetches user data', async () => {
      mockSignInWithEmailAndPassword.mockResolvedValue({
        user: { uid: 'uid-123' },
      });
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ hasCompletedOnboarding: true }),
      });

      renderProvider();

      await act(async () => {
        screen.getByTestId('sign-in').click();
      });

      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith({}, 'test@test.com', 'pass123');
    });
  });

  describe('signOut', () => {
    it('signs out and clears user', async () => {
      renderProvider();

      await act(async () => {
        screen.getByTestId('sign-out').click();
      });

      expect(mockFirebaseSignOut).toHaveBeenCalled();
      expect(screen.getByTestId('user').textContent).toBe('null');
    });
  });

  describe('signInWithGoogle', () => {
    it('creates new Firestore doc for first-time Google user', async () => {
      mockSignInWithPopup.mockResolvedValue({
        user: { uid: 'google-uid', email: 'google@test.com' },
      });
      mockGetDoc.mockResolvedValue({ exists: () => false });

      renderProvider();

      await act(async () => {
        screen.getByTestId('google-signin').click();
      });

      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'google-uid' }),
        expect.objectContaining({
          email: 'google@test.com',
          hasCompletedOnboarding: false,
        })
      );
    });

    it('loads existing user data for returning Google user', async () => {
      mockSignInWithPopup.mockResolvedValue({
        user: { uid: 'google-uid', email: 'google@test.com' },
      });
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ hasCompletedOnboarding: true, name: 'Google User' }),
      });

      renderProvider();

      await act(async () => {
        screen.getByTestId('google-signin').click();
      });

      expect(mockSetDoc).not.toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
  it('merges new data with existing user', async () => {
    // Start with authenticated user
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ hasCompletedOnboarding: false, name: 'Original' }),
    });
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb({ uid: 'uid-123', email: 'test@test.com' });
      return vi.fn();
    });

    renderProvider();

    // Flush async effect
    await act(async () => {});

    await act(async () => {
      screen.getByTestId('update-user').click();
    });

    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'uid-123' }),
      expect.objectContaining({ name: 'Updated', hasCompletedOnboarding: false }),
      { merge: true }
    );
  });
  });

  it('throws when useAuth is used outside AuthProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow();
    consoleSpy.mockRestore();
  });
});
