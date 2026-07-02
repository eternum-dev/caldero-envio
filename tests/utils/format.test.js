import { describe, it, expect } from 'vitest';
import { formatCLP, formatRelativeDate } from '../../src/utils/format';

describe('formatCLP', () => {
  it('formats 4990 as "$4.990"', () => {
    expect(formatCLP(4990)).toBe('$4.990');
  });

  it('formats 9990 as "$9.990"', () => {
    expect(formatCLP(9990)).toBe('$9.990');
  });

  it('formats 15990 as "$15.990"', () => {
    expect(formatCLP(15990)).toBe('$15.990');
  });

  it('formats 0 as "$0"', () => {
    expect(formatCLP(0)).toBe('$0');
  });

  it('returns "$0" for non-numeric input', () => {
    expect(formatCLP(null)).toBe('$0');
    expect(formatCLP(undefined)).toBe('$0');
    expect(formatCLP('not a number')).toBe('$0');
    expect(formatCLP(NaN)).toBe('$0');
  });
});

describe('formatRelativeDate', () => {
  it('returns "hace un momento" for < 60 seconds', () => {
    const ts = new Date(Date.now() - 30 * 1000);
    expect(formatRelativeDate(ts)).toBe('hace un momento');
  });

  it('returns "hace N min" for < 60 minutes', () => {
    const ts = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatRelativeDate(ts)).toBe('hace 5 min');
  });

  it('returns "hace N h" for < 24 hours', () => {
    const ts = new Date(Date.now() - 3 * 60 * 60 * 1000);
    expect(formatRelativeDate(ts)).toBe('hace 3 h');
  });

  it('returns "ayer" for exactly 1 day ago', () => {
    const ts = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(formatRelativeDate(ts)).toBe('ayer');
  });

  it('returns "hace N días" for 2-6 days ago', () => {
    const ts = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    expect(formatRelativeDate(ts)).toBe('hace 5 días');
  });

  it('returns "DD MMM" for dates >= 7 days ago', () => {
    const ts = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const result = formatRelativeDate(ts);
    // es-CL returns e.g. "22-jun" or "22 jun." depending on platform
    expect(result).toMatch(/^\d{2}[\s-][a-z]{3}\.?$/i);
  });

  it('accepts millisecond timestamps', () => {
    const ts = Date.now() - 2 * 60 * 1000;
    expect(formatRelativeDate(ts)).toBe('hace 2 min');
  });

  it('accepts Firebase Timestamp-like objects', () => {
    const seconds = Math.floor((Date.now() - 45 * 1000) / 1000);
    expect(formatRelativeDate({ seconds, nanoseconds: 0 })).toBe('hace un momento');
  });

  it('returns empty string for invalid input', () => {
    expect(formatRelativeDate(null)).toBe('');
    expect(formatRelativeDate(undefined)).toBe('');
    expect(formatRelativeDate('invalid')).toBe('');
  });

  it('returns empty string for invalid Date', () => {
    expect(formatRelativeDate(new Date('invalid'))).toBe('');
  });
});
