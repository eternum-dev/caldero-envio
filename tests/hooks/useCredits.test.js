import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

const mockOnSnapshot = vi.fn();
const mockDoc = vi.fn((_db, collection, id) => ({ collection, id }));

vi.hoisted(() => {
  // hoisted block used only to satisfy vi.hoisted pattern; mocks defined below
});

vi.mock('firebase/firestore', () => ({
  doc: (...args) => mockDoc(...args),
  onSnapshot: (...args) => mockOnSnapshot(...args),
}));

vi.mock('../../src/config/firebase', () => ({
  db: {},
}));

import { useCredits } from '../../src/hooks/useCredits';

describe('useCredits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns balance 0 and no loading when uid is null', () => {
    const { result } = renderHook(() => useCredits(null));

    expect(result.current.balance).toBe(0);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockOnSnapshot).not.toHaveBeenCalled();
  });

  it('subscribes and returns balance from account document', async () => {
    const unsubscribe = vi.fn();
    mockOnSnapshot.mockImplementation((_ref, onNext) => {
      onNext({
        exists: true,
        data: () => ({ creditsBalance: 42 }),
      });
      return unsubscribe;
    });

    const { result, unmount } = renderHook(() => useCredits('user-123'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.balance).toBe(42);
    expect(result.current.error).toBeNull();
    expect(mockDoc).toHaveBeenCalledWith({}, 'accounts', 'user-123');

    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it('returns balance 0 when account document does not exist', async () => {
    mockOnSnapshot.mockImplementation((_ref, onNext) => {
      onNext({ exists: false, data: () => null });
      return vi.fn();
    });

    const { result } = renderHook(() => useCredits('user-123'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.balance).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it('returns error when subscription fails', async () => {
    const error = new Error('permission denied');
    mockOnSnapshot.mockImplementation((_ref, _onNext, onError) => {
      onError(error);
      return vi.fn();
    });

    const { result } = renderHook(() => useCredits('user-123'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.balance).toBe(0);
    expect(result.current.error).toBe(error);
  });
});
