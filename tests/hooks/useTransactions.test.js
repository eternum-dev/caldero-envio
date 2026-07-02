import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

const mockOnSnapshot = vi.fn();
const mockCollection = vi.fn((_db, name) => ({ name }));
const mockQuery = vi.fn();
const mockWhere = vi.fn();
const mockOrderBy = vi.fn();
const mockLimit = vi.fn();

vi.mock('firebase/firestore', () => ({
  collection: (...args) => mockCollection(...args),
  query: (...args) => mockQuery(...args),
  where: (...args) => mockWhere(...args),
  orderBy: (...args) => mockOrderBy(...args),
  limit: (...args) => mockLimit(...args),
  onSnapshot: (...args) => mockOnSnapshot(...args),
}));

vi.mock('../../src/config/firebase', () => ({
  db: {},
}));

import { useTransactions } from '../../src/hooks/useTransactions';

describe('useTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery.mockImplementation((...args) => args);
  });

  it('returns empty list and no loading when uid is null', () => {
    const { result } = renderHook(() => useTransactions(null));

    expect(result.current.transactions).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockOnSnapshot).not.toHaveBeenCalled();
  });

  it('subscribes and returns normalized transactions', async () => {
    const unsubscribe = vi.fn();
    const createdAt = { toMillis: () => 1234567890 };

    mockOnSnapshot.mockImplementation((_q, onNext) => {
      onNext({
        docs: [
          {
            id: 'tx-1',
            data: () => ({ uid: 'user-123', type: 'free', amount: 10, createdAt }),
          },
          {
            id: 'tx-2',
            data: () => ({ uid: 'user-123', type: 'topup', amount: 150, packageId: 'mini', createdAt }),
          },
        ],
      });
      return unsubscribe;
    });

    const { result, unmount } = renderHook(() => useTransactions('user-123'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.transactions).toHaveLength(2);
    expect(result.current.transactions[0]).toMatchObject({
      id: 'tx-1',
      uid: 'user-123',
      type: 'free',
      amount: 10,
      createdAt: 1234567890,
    });

    expect(mockWhere).toHaveBeenCalledWith('uid', '==', 'user-123');
    expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc');
    expect(mockLimit).toHaveBeenCalledWith(10);

    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it('uses custom limit', async () => {
    mockOnSnapshot.mockImplementation((_q, onNext) => {
      onNext({ docs: [] });
      return vi.fn();
    });

    renderHook(() => useTransactions('user-123', 5));

    await waitFor(() => expect(mockLimit).toHaveBeenCalledWith(5));
  });

  it('returns error when subscription fails', async () => {
    const error = new Error('permission denied');
    mockOnSnapshot.mockImplementation((_q, _onNext, onError) => {
      onError(error);
      return vi.fn();
    });

    const { result } = renderHook(() => useTransactions('user-123'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.transactions).toEqual([]);
    expect(result.current.error).toBe(error);
  });
});
