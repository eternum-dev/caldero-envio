import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockSetDoc, mockGetDoc } = vi.hoisted(() => ({
  mockSetDoc: vi.fn(),
  mockGetDoc: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db, _collection, id) => ({ _db, _collection, id })),
  setDoc: mockSetDoc,
  getDoc: mockGetDoc,
}));

vi.mock('../../src/config/firebase', () => ({
  db: {},
}));

import { saveStore, getStore, saveCouriers, getCouriers, savePricingRules } from '../../src/services/storeService';

const USER_ID = 'user-123';

describe('storeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveStore', () => {
    it('calls setDoc with store data and merge option', async () => {
      const data = { name: 'Mi Local', country: 'CL' };
      await saveStore(USER_ID, data);

      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: USER_ID }),
        expect.objectContaining({
          name: 'Mi Local',
          country: 'CL',
          updatedAt: expect.any(String),
        }),
        { merge: true }
      );
    });
  });

  describe('getStore', () => {
    it('returns store data when document exists', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ name: 'Mi Local', country: 'CL' }),
        id: USER_ID,
      });

      const result = await getStore(USER_ID);
      expect(result).toEqual({ id: USER_ID, name: 'Mi Local', country: 'CL' });
    });

    it('returns null when document does not exist', async () => {
      mockGetDoc.mockResolvedValue({ exists: () => false });

      const result = await getStore(USER_ID);
      expect(result).toBeNull();
    });
  });

  describe('saveCouriers', () => {
    it('saves couriers list with merge option', async () => {
      const couriers = [{ id: '1', name: 'Juan' }];
      await saveCouriers(USER_ID, couriers);

      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: USER_ID }),
        expect.objectContaining({
          list: couriers,
          updatedAt: expect.any(String),
        }),
        { merge: true }
      );
    });
  });

  describe('getCouriers', () => {
    it('returns couriers list from document', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ list: [{ id: '1', name: 'Juan' }] }),
      });

      const result = await getCouriers(USER_ID);
      expect(result).toEqual([{ id: '1', name: 'Juan' }]);
    });

    it('returns empty array when document does not exist', async () => {
      mockGetDoc.mockResolvedValue({ exists: () => false });

      const result = await getCouriers(USER_ID);
      expect(result).toEqual([]);
    });

    it('returns empty array when list is missing', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({}),
      });

      const result = await getCouriers(USER_ID);
      expect(result).toEqual([]);
    });
  });

  describe('savePricingRules', () => {
    it('saves pricing rules with merge option', async () => {
      const rules = [{ minKm: 0, maxKm: 5, price: 1000 }];
      await savePricingRules(USER_ID, rules);

      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: USER_ID }),
        expect.objectContaining({
          pricingRules: rules,
          updatedAt: expect.any(String),
        }),
        { merge: true }
      );
    });
  });
});
