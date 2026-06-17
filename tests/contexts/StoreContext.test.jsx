import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';

const {
  mockOnSnapshot, mockDoc, mockSetDoc,
} = vi.hoisted(() => ({
  mockOnSnapshot: vi.fn(),
  mockDoc: vi.fn((_db, _collection, id) => ({ _db, _collection, id })),
  mockSetDoc: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  doc: mockDoc,
  onSnapshot: mockOnSnapshot,
  setDoc: mockSetDoc,
}));

vi.mock('../../src/config/firebase', () => ({
  db: {},
}));

let mockAuthUser = null;

vi.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockAuthUser }),
}));

import { StoreProvider, useStore } from '../../src/contexts/StoreContext';

function TestConsumer() {
  const ctx = useStore();
  return (
    <div>
      <p data-testid="loading">{ctx.loading ? 'loading' : 'loaded'}</p>
      <p data-testid="store-name">{ctx.store?.name || 'no-store'}</p>
      <p data-testid="courier-count">{ctx.couriers.length}</p>
      <button data-testid="save-store" onClick={() => ctx.saveStore({ name: 'Test Store' })} />
      <button data-testid="add-courier" onClick={() => ctx.addCourier({ name: 'New', phone: '123' })} />
      <button data-testid="remove-courier" onClick={() => ctx.removeCourier('1')} />
      <button data-testid="update-courier" onClick={() => ctx.updateCourier('1', { name: 'Updated' })} />
      <button data-testid="save-pricing" onClick={() => ctx.savePricingRules([{ minKm: 0, price: 500 }])} />
    </div>
  );
}

function fireSnapshot(path, data) {
  const callback = mockOnSnapshot.mock.calls.find(c => c[0].id === path)?.[1];
  if (callback) {
    callback(data ? { exists: () => true, id: path, data: () => data } : { exists: () => false });
  }
}

function renderProvider() {
  return render(
    <StoreProvider>
      <TestConsumer />
    </StoreProvider>
  );
}

describe('StoreContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthUser = null;
    mockOnSnapshot.mockReturnValue(vi.fn());
  });

  it('sets loading false when no user', () => {
    renderProvider();
    expect(screen.getByTestId('loading').textContent).toBe('loaded');
    expect(screen.getByTestId('store-name').textContent).toBe('no-store');
  });

  it('subscribes to Firestore when user is present', () => {
    mockAuthUser = { uid: 'user-123' };
    renderProvider();

    expect(mockOnSnapshot).toHaveBeenCalledTimes(2);
    expect(mockOnSnapshot.mock.calls[0][0].id).toBe('user-123');
  });

  it('updates store from Firestore snapshot', () => {
    mockAuthUser = { uid: 'user-123' };
    renderProvider();

    act(() => {
      fireSnapshot('user-123', { name: 'Mi Local', country: 'CL' });
    });

    expect(screen.getByTestId('store-name').textContent).toBe('Mi Local');
    expect(screen.getByTestId('loading').textContent).toBe('loaded');
  });

  it('sets store to null when snapshot has no data', () => {
    mockAuthUser = { uid: 'user-123' };
    renderProvider();

    act(() => {
      fireSnapshot('user-123', null);
    });

    expect(screen.getByTestId('store-name').textContent).toBe('no-store');
  });

  it('cleans up subscriptions on unmount', () => {
    const unsub1 = vi.fn();
    const unsub2 = vi.fn();
    mockOnSnapshot.mockReturnValue(unsub1);
    mockOnSnapshot.mockReturnValueOnce(unsub1).mockReturnValueOnce(unsub2);

    mockAuthUser = { uid: 'user-123' };
    const { unmount } = renderProvider();
    unmount();

    expect(unsub1).toHaveBeenCalled();
    expect(unsub2).toHaveBeenCalled();
  });

  it('saveStore calls setDoc with merge', async () => {
    mockAuthUser = { uid: 'user-123' };
    renderProvider();

    await act(async () => {
      screen.getByTestId('save-store').click();
    });

    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'user-123' }),
      { name: 'Test Store', schemaVersion: 1 },
      { merge: true }
    );
  });

  it('addCourier adds to couriers list', async () => {
    mockAuthUser = { uid: 'user-123' };
    renderProvider();

    await act(async () => {
      screen.getByTestId('add-courier').click();
    });

    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'user-123' }),
      expect.objectContaining({
        list: expect.arrayContaining([
          expect.objectContaining({ name: 'New', phone: '123' }),
        ]),
      }),
      { merge: true }
    );
  });

  it('removeCourier filters out courier by id', async () => {
    mockAuthUser = { uid: 'user-123' };
    // Set initial couriers
    const callback = mockOnSnapshot.mock.calls.find(c => c[0].id === 'user-123')?.[1];
    renderProvider();

    // First fire courier snapshot
    const courierCallback = mockOnSnapshot.mock.calls.find(c => c[0]._collection === 'couriers')?.[1];

    await act(async () => {
      screen.getByTestId('remove-courier').click();
    });

    expect(mockSetDoc).toHaveBeenCalled();
  });

  it('savePricingRules calls setDoc with pricingRules', async () => {
    mockAuthUser = { uid: 'user-123' };
    renderProvider();

    await act(async () => {
      screen.getByTestId('save-pricing').click();
    });

    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'user-123' }),
      { pricingRules: [{ minKm: 0, price: 500 }], schemaVersion: 1 },
      { merge: true }
    );
  });

  it('throws when useStore is used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow();
    consoleSpy.mockRestore();
  });
});
