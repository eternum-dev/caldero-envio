import { describe, it, expect } from 'vitest';
import { validateCourierName, validatePhone, validatePricingRules } from '../../src/utils/validators';

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
      expect(validatePhone('+56912345678')).toBe(null);
      expect(validatePhone('+541112345678')).toBe(null);
    });

    it('returns error for phone with less than 8 digits', () => {
      expect(validatePhone('1234567')).toBe('Teléfono debe tener al menos 8 dígitos');
    });

    it('returns error for empty or null phone', () => {
      expect(validatePhone('')).toBe('Teléfono es requerido');
      expect(validatePhone(null)).toBe('Teléfono es requerido');
      expect(validatePhone(undefined)).toBe('Teléfono es requerido');
    });

    it('returns error for phone with more than 15 digits', () => {
      expect(validatePhone('1234567890123456')).toBe('Teléfono muy largo');
    });

    it('ignores non-digit characters when counting digits', () => {
      expect(validatePhone('123 456 7')).toBe('Teléfono debe tener al menos 8 dígitos');
      expect(validatePhone('+56 9 123')).toBe('Teléfono debe tener al menos 8 dígitos');
    });
  });

  describe('validatePricingRules', () => {
    it('returns all null for valid rules', () => {
      const rules = [
        { minKm: 0, maxKm: 3, price: 500 },
        { minKm: 3, maxKm: 5, price: 700 },
        { minKm: 5, maxKm: 10, price: 1000 },
      ];
      const errors = validatePricingRules(rules);
      expect(errors).toEqual([null, null, null]);
    });

    it('returns error on first rule with price <= 0', () => {
      const rules = [
        { minKm: 0, maxKm: 3, price: 0 },
      ];
      const errors = validatePricingRules(rules);
      expect(errors[0]).toBe('El precio debe ser mayor a 0');
    });

    it('returns error for non-ascending price', () => {
      const rules = [
        { minKm: 0, maxKm: 3, price: 700 },
        { minKm: 3, maxKm: 5, price: 500 },
      ];
      const errors = validatePricingRules(rules);
      expect(errors[0]).toBe(null);
      expect(errors[1]).toBe('El precio no puede ser menor al de la regla anterior');
    });

    it('returns error for km range gap', () => {
      const rules = [
        { minKm: 0, maxKm: 3, price: 500 },
        { minKm: 4, maxKm: 7, price: 700 },
      ];
      const errors = validatePricingRules(rules);
      expect(errors[0]).toBe(null);
      expect(errors[1]).toBe('La distancia inicial debe ser igual a la distancia final de la regla anterior');
    });

    it('preserves price error when both price and gap are invalid (|| short-circuits)', () => {
      const rules = [
        { minKm: 0, maxKm: 3, price: 700 },
        { minKm: 4, maxKm: 7, price: 500 },
      ];
      const errors = validatePricingRules(rules);
      expect(errors[0]).toBe(null);
      // Price error is set first; km gap check uses || so price error is preserved
      expect(errors[1]).toBe('El precio no puede ser menor al de la regla anterior');
    });

    it('returns empty array for empty rules', () => {
      const errors = validatePricingRules([]);
      expect(errors).toEqual([]);
    });
  });
});