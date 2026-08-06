import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockHttpsCallable } = vi.hoisted(() => ({
  mockHttpsCallable: vi.fn(),
}));

vi.mock('firebase/functions', () => ({
  httpsCallable: () => mockHttpsCallable,
  getFunctions: () => ({}),
}));

vi.mock('../../src/config/firebase', () => ({
  functions: {},
}));

import {
  createCheckoutSession,
  checkPurchaseStatus,
  isMockCheckoutUrl,
  getCheckoutRedirectUrl,
} from '../../src/services/purchaseService';

describe('purchaseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createCheckoutSession calls the callable with packageId', async () => {
    mockHttpsCallable.mockResolvedValue({
      data: {
        init_point: 'https://mock.mercadopago.com/checkout?pid=123',
        purchase_id: 'purchase-123',
        external_reference: 'uid_mini_abc',
      },
    });

    const result = await createCheckoutSession('mini');

    expect(mockHttpsCallable).toHaveBeenCalledWith({ packageId: 'mini' });
    expect(result.purchase_id).toBe('purchase-123');
    expect(result.init_point).toContain('mock.mercadopago.com');
  });

  it('checkPurchaseStatus calls the callable with purchaseId', async () => {
    mockHttpsCallable.mockResolvedValue({
      data: { status: 'credited', balance: 160, packageId: 'mini' },
    });

    const result = await checkPurchaseStatus('purchase-123');

    expect(mockHttpsCallable).toHaveBeenCalledWith({
      purchaseId: 'purchase-123',
      mockAction: undefined,
    });
    expect(result.status).toBe('credited');
    expect(result.balance).toBe(160);
  });

  it('checkPurchaseStatus passes mockAction when provided', async () => {
    mockHttpsCallable.mockResolvedValue({
      data: { status: 'credited', balance: 160, packageId: 'mini' },
    });

    await checkPurchaseStatus('purchase-123', 'approved');

    expect(mockHttpsCallable).toHaveBeenCalledWith({
      purchaseId: 'purchase-123',
      mockAction: 'approved',
    });
  });

  it('isMockCheckoutUrl returns true for mock URLs', () => {
    expect(isMockCheckoutUrl('https://mock.mercadopago.com/checkout?pid=1')).toBe(true);
    expect(isMockCheckoutUrl('https://www.mercadopago.com/checkout')).toBe(false);
  });

  it('getCheckoutRedirectUrl returns null for mock URLs', () => {
    expect(getCheckoutRedirectUrl('https://mock.mercadopago.com/checkout?pid=1')).toBeNull();
  });

  it('getCheckoutRedirectUrl returns the URL for real checkout', () => {
    const realUrl = 'https://www.mercadopago.com/checkout/v1/redirect';
    expect(getCheckoutRedirectUrl(realUrl)).toBe(realUrl);
  });
});
