import { describe, it, expect, vi } from 'vitest';
import {
  calculateMobileCost,
  prepareMobileCostMessage,
  openWhatsAppShare,
} from '../../src/services/mobileCalculatorService';

describe('calculateMobileCost', () => {
  it('returns breakdown for design example (4.5 / 12 / 1200 / 80)', () => {
    expect(
      calculateMobileCost({
        distance: 4.5,
        kmPerLiter: 12,
        pricePerLiter: 1200,
        wearCostPerKm: 80,
      })
    ).toEqual({ fuelCost: 450, wearCost: 360, total: 810 });
  });

  it('returns breakdown for integer example (10 / 10 / 1000 / 50)', () => {
    expect(
      calculateMobileCost({
        distance: 10,
        kmPerLiter: 10,
        pricePerLiter: 1000,
        wearCostPerKm: 50,
      })
    ).toEqual({ fuelCost: 1000, wearCost: 500, total: 1500 });
  });

  it('throws when distance is zero', () => {
    expect(() =>
      calculateMobileCost({ distance: 0, kmPerLiter: 10, pricePerLiter: 1000, wearCostPerKm: 50 })
    ).toThrow('Invalid input: distance must be a positive number');
  });

  it('throws when kmPerLiter is zero', () => {
    expect(() =>
      calculateMobileCost({ distance: 10, kmPerLiter: 0, pricePerLiter: 1000, wearCostPerKm: 50 })
    ).toThrow('Invalid input: kmPerLiter must be a positive number');
  });

  it('throws when pricePerLiter is zero', () => {
    expect(() =>
      calculateMobileCost({ distance: 10, kmPerLiter: 10, pricePerLiter: 0, wearCostPerKm: 50 })
    ).toThrow('Invalid input: pricePerLiter must be a positive number');
  });

  it('throws when wearCostPerKm is zero', () => {
    expect(() =>
      calculateMobileCost({ distance: 10, kmPerLiter: 10, pricePerLiter: 1000, wearCostPerKm: 0 })
    ).toThrow('Invalid input: wearCostPerKm must be a positive number');
  });

  it('throws when any field is negative', () => {
    expect(() =>
      calculateMobileCost({ distance: -1, kmPerLiter: 10, pricePerLiter: 1000, wearCostPerKm: 50 })
    ).toThrow('Invalid input: distance must be a positive number');
  });

  it('throws when any field is null', () => {
    expect(() =>
      calculateMobileCost({ distance: null, kmPerLiter: 10, pricePerLiter: 1000, wearCostPerKm: 50 })
    ).toThrow('Invalid input: distance must be a positive number');
  });

  it('throws when any field is undefined', () => {
    expect(() =>
      calculateMobileCost({
        distance: undefined,
        kmPerLiter: 10,
        pricePerLiter: 1000,
        wearCostPerKm: 50,
      })
    ).toThrow('Invalid input: distance must be a positive number');
  });

  it('throws when any field is NaN', () => {
    expect(() =>
      calculateMobileCost({ distance: NaN, kmPerLiter: 10, pricePerLiter: 1000, wearCostPerKm: 50 })
    ).toThrow('Invalid input: distance must be a positive number');
  });
});

describe('prepareMobileCostMessage', () => {
  it('returns approved copy with es-AR formatting', () => {
    const message = prepareMobileCostMessage({ fuelCost: 450, wearCost: 360, total: 810 });
    expect(message).toBe(
      'Costo estimado del envío: $810 (combustible $450 + desgaste $360). Calculado en caldero-envio.com'
    );
  });

  it('uses thousands separator for large numbers', () => {
    const message = prepareMobileCostMessage({ fuelCost: 1000, wearCost: 500, total: 1500 });
    expect(message).toBe(
      'Costo estimado del envío: $1.500 (combustible $1.000 + desgaste $500). Calculado en caldero-envio.com'
    );
  });

  it('returns empty string when any value is not finite', () => {
    expect(prepareMobileCostMessage({ fuelCost: NaN, wearCost: 360, total: 810 })).toBe('');
    expect(prepareMobileCostMessage({ fuelCost: 450, wearCost: NaN, total: 810 })).toBe('');
    expect(prepareMobileCostMessage({ fuelCost: 450, wearCost: 360, total: NaN })).toBe('');
  });
});

describe('openWhatsAppShare', () => {
  it('opens wa.me with encoded message', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => {});

    openWhatsAppShare('Hello world');

    expect(openSpy).toHaveBeenCalledWith(
      'https://wa.me/?text=Hello%20world',
      '_blank',
      'noopener,noreferrer'
    );

    openSpy.mockRestore();
  });

  it('does nothing when message is empty', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => {});

    openWhatsAppShare('');

    expect(openSpy).not.toHaveBeenCalled();

    openSpy.mockRestore();
  });
});
