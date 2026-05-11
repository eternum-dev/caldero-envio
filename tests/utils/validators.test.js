import { describe, it, expect } from 'vitest';
import { validateCourierName, validatePhone } from '../../src/utils/validators';

describe('validators', () => {
  describe('validateCourierName', () => {
    it('returns null for valid name', () => {
      expect(validateCourierName('Juan')).toBe(null);
      expect(validateCourierName('María López')).toBe(null);
    });

    it('returns error for name shorter than 2 chars', () => {
      expect(validateCourierName('')).toBe('Nombre debe tener al menos 2 caracteres');
      expect(validateCourierName('J')).toBe('Nombre debe tener al menos 2 caracteres');
    });

    it('returns error for name that is only numbers', () => {
      expect(validateCourierName('123')).toBe('Nombre no puede ser solo números');
    });

    it('returns null for null/undefined input', () => {
      expect(validateCourierName(null)).toBe('Nombre debe tener al menos 2 caracteres');
      expect(validateCourierName(undefined)).toBe('Nombre debe tener al menos 2 caracteres');
    });

    it('trims whitespace before validation', () => {
      expect(validateCourierName('  Jo  ')).toBe(null);
      expect(validateCourierName('   ')).toBe('Nombre debe tener al menos 2 caracteres');
    });
  });

  describe('validatePhone', () => {
    it('returns null for valid phone', () => {
      expect(validatePhone('12345678')).toBe(null);
      expect(validatePhone('+56 9 1234 5678')).toBe(null);
      expect(validatePhone('+54 11 12345678')).toBe(null);
    });

    it('returns error for phone with less than 8 digits', () => {
      expect(validatePhone('1234567')).toBe('Teléfono debe tener al menos 8 dígitos');
      expect(validatePhone('')).toBe('Teléfono debe tener al menos 8 dígitos');
    });

    it('returns error for phone with invalid characters', () => {
      expect(validatePhone('abc12345678')).toBe('Teléfono solo puede tener números y +');
      expect(validatePhone('1234-5678!')).toBe('Teléfono solo puede tener números y +');
    });

    it('returns null for null/undefined input', () => {
      expect(validatePhone(null)).toBe('Teléfono debe tener al menos 8 dígitos');
      expect(validatePhone(undefined)).toBe('Teléfono debe tener al menos 8 dígitos');
    });

    it('ignores non-digit characters when counting digits', () => {
      expect(validatePhone('123 456 7')).toBe('Teléfono debe tener al menos 8 dígitos');
      expect(validatePhone('+54 11 123')).toBe('Teléfono debe tener al menos 8 dígitos');
    });
  });
});