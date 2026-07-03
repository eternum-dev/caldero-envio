import { describe, it, expect } from 'vitest';
import { computeSavingsVsMini } from '../../src/utils/pricing';
import { PACKAGES } from '../../src/utils/constants';

describe('computeSavingsVsMini', () => {
  const mini = PACKAGES.mini;

  it('returns null for the Mini baseline', () => {
    expect(computeSavingsVsMini(mini, mini)).toBeNull();
  });

  it('returns "25% más barato" for Standard vs Mini', () => {
    expect(computeSavingsVsMini(PACKAGES.standard, mini)).toBe('25% más barato');
  });

  it('returns "52% más barato" for Pro vs Mini', () => {
    expect(computeSavingsVsMini(PACKAGES.pro, mini)).toBe('52% más barato');
  });

  it('returns null when package is more expensive than Mini', () => {
    const expensive = { unitPriceCLP: 50 };
    expect(computeSavingsVsMini(expensive, mini)).toBeNull();
  });

  it('returns null for missing inputs', () => {
    expect(computeSavingsVsMini(null, mini)).toBeNull();
    expect(computeSavingsVsMini(PACKAGES.standard, null)).toBeNull();
  });

  it('returns null for invalid baseline price', () => {
    expect(computeSavingsVsMini(PACKAGES.standard, { unitPriceCLP: 0 })).toBeNull();
    expect(computeSavingsVsMini(PACKAGES.standard, { unitPriceCLP: -5 })).toBeNull();
  });
});
