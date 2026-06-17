import { describe, it, expect } from 'vitest';
import { COUNTRIES, getCountryByCode } from '../../src/config/countries';

describe('COUNTRIES', () => {
  it('contains 10 countries', () => {
    expect(COUNTRIES).toHaveLength(10);
  });

  it('includes Chile with code CL', () => {
    expect(COUNTRIES).toContainEqual({ code: 'CL', name: 'Chile' });
  });

  it('includes Brazil with code BR', () => {
    expect(COUNTRIES).toContainEqual({ code: 'BR', name: 'Brasil' });
  });
});

describe('getCountryByCode', () => {
  it('returns country for valid code', () => {
    expect(getCountryByCode('AR')).toEqual({ code: 'AR', name: 'Argentina' });
  });

  it('is case-insensitive', () => {
    expect(getCountryByCode('cl')).toEqual({ code: 'CL', name: 'Chile' });
    expect(getCountryByCode('Mx')).toEqual({ code: 'MX', name: 'México' });
  });

  it('returns null for invalid code', () => {
    expect(getCountryByCode('ZZ')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(getCountryByCode('')).toBeNull();
  });

  it('returns null for null/undefined', () => {
    expect(getCountryByCode(null)).toBeNull();
    expect(getCountryByCode(undefined)).toBeNull();
  });
});
