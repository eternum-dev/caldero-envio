import { describe, it, expect, vi } from 'vitest';
import {
  calculateMobileCost,
  prepareMobileCostMessage,
  openWhatsAppShare,
} from '../../src/services/mobileCalculatorService';

describe('calculateMobileCost', () => {
  it('returns full breakdown for design example (4.5 / 12 / 1200 / 80, 25% margin)', () => {
    expect(
      calculateMobileCost({
        distance: 4.5,
        kmPerLiter: 12,
        pricePerLiter: 1200,
        wearCostPerKm: 80,
        marginPercent: 25,
      })
    ).toEqual({
      fuelCost: 450,
      wearCost: 360,
      costSubtotal: 810,
      marginAmount: 202.5,
      price: 1012.5,
      marginPercent: 25,
    });
  });

  it('returns full breakdown for integer example (10 / 10 / 1000 / 50, 30% margin)', () => {
    expect(
      calculateMobileCost({
        distance: 10,
        kmPerLiter: 10,
        pricePerLiter: 1000,
        wearCostPerKm: 50,
        marginPercent: 30,
      })
    ).toEqual({
      fuelCost: 1000,
      wearCost: 500,
      costSubtotal: 1500,
      marginAmount: 450,
      price: 1950,
      marginPercent: 30,
    });
  });

  it('returns price equal to cost when margin is 0 (breakeven)', () => {
    expect(
      calculateMobileCost({
        distance: 10,
        kmPerLiter: 10,
        pricePerLiter: 1000,
        wearCostPerKm: 50,
        marginPercent: 0,
      })
    ).toEqual({
      fuelCost: 1000,
      wearCost: 500,
      costSubtotal: 1500,
      marginAmount: 0,
      price: 1500,
      marginPercent: 0,
    });
  });

  it('throws when distance is zero', () => {
    expect(() =>
      calculateMobileCost({
        distance: 0,
        kmPerLiter: 10,
        pricePerLiter: 1000,
        wearCostPerKm: 50,
        marginPercent: 25,
      })
    ).toThrow('Invalid input: distance must be a positive number');
  });

  it('throws when kmPerLiter is zero', () => {
    expect(() =>
      calculateMobileCost({
        distance: 10,
        kmPerLiter: 0,
        pricePerLiter: 1000,
        wearCostPerKm: 50,
        marginPercent: 25,
      })
    ).toThrow('Invalid input: kmPerLiter must be a positive number');
  });

  it('throws when pricePerLiter is zero', () => {
    expect(() =>
      calculateMobileCost({
        distance: 10,
        kmPerLiter: 10,
        pricePerLiter: 0,
        wearCostPerKm: 50,
        marginPercent: 25,
      })
    ).toThrow('Invalid input: pricePerLiter must be a positive number');
  });

  it('throws when wearCostPerKm is zero', () => {
    expect(() =>
      calculateMobileCost({
        distance: 10,
        kmPerLiter: 10,
        pricePerLiter: 1000,
        wearCostPerKm: 0,
        marginPercent: 25,
      })
    ).toThrow('Invalid input: wearCostPerKm must be a positive number');
  });

  it('throws when marginPercent is not a finite number', () => {
    expect(() =>
      calculateMobileCost({
        distance: 10,
        kmPerLiter: 10,
        pricePerLiter: 1000,
        wearCostPerKm: 50,
        marginPercent: NaN,
      })
    ).toThrow('Invalid input: marginPercent must be a finite number');
  });

  it('throws when any cost field is negative', () => {
    expect(() =>
      calculateMobileCost({
        distance: -1,
        kmPerLiter: 10,
        pricePerLiter: 1000,
        wearCostPerKm: 50,
        marginPercent: 25,
      })
    ).toThrow('Invalid input: distance must be a positive number');
  });

  it('throws when any cost field is null', () => {
    expect(() =>
      calculateMobileCost({
        distance: null,
        kmPerLiter: 10,
        pricePerLiter: 1000,
        wearCostPerKm: 50,
        marginPercent: 25,
      })
    ).toThrow('Invalid input: distance must be a positive number');
  });

  it('throws when any cost field is undefined', () => {
    expect(() =>
      calculateMobileCost({
        distance: undefined,
        kmPerLiter: 10,
        pricePerLiter: 1000,
        wearCostPerKm: 50,
        marginPercent: 25,
      })
    ).toThrow('Invalid input: distance must be a positive number');
  });
});

describe('prepareMobileCostMessage', () => {
  it('returns approved copy with es-AR formatting (25% margin)', () => {
    const message = prepareMobileCostMessage({
      costSubtotal: 810,
      marginAmount: 202.5,
      price: 1012.5,
      marginPercent: 25,
    });
    expect(message).toBe(
      'Precio sugerido del envío: $1.012,5 (costo $810 + margen 25%). Calculado en caldero-envio.com'
    );
  });

  it('uses thousands separator for large numbers', () => {
    const message = prepareMobileCostMessage({
      costSubtotal: 1500,
      marginAmount: 450,
      price: 1950,
      marginPercent: 30,
    });
    expect(message).toBe(
      'Precio sugerido del envío: $1.950 (costo $1.500 + margen 30%). Calculado en caldero-envio.com'
    );
  });

  it('handles 0% margin (price equals cost)', () => {
    const message = prepareMobileCostMessage({
      costSubtotal: 1500,
      marginAmount: 0,
      price: 1500,
      marginPercent: 0,
    });
    expect(message).toBe(
      'Precio sugerido del envío: $1.500 (costo $1.500 + margen 0%). Calculado en caldero-envio.com'
    );
  });

  it('returns empty string when any value is not finite', () => {
    expect(
      prepareMobileCostMessage({ costSubtotal: NaN, marginAmount: 200, price: 1000, marginPercent: 25 })
    ).toBe('');
    expect(
      prepareMobileCostMessage({ costSubtotal: 1000, marginAmount: NaN, price: 1000, marginPercent: 25 })
    ).toBe('');
    expect(
      prepareMobileCostMessage({ costSubtotal: 1000, marginAmount: 200, price: NaN, marginPercent: 25 })
    ).toBe('');
    expect(
      prepareMobileCostMessage({ costSubtotal: 1000, marginAmount: 200, price: 1000, marginPercent: NaN })
    ).toBe('');
  });

  it('returns empty string when cost is not positive', () => {
    expect(
      prepareMobileCostMessage({ costSubtotal: 0, marginAmount: 0, price: 0, marginPercent: 0 })
    ).toBe('');
  });
});

describe('openWhatsAppShare', () => {
  it('opens wa.me with encoded message', () => {
    // eslint-disable-next-line no-undef
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
    // eslint-disable-next-line no-undef
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => {});

    openWhatsAppShare('');

    expect(openSpy).not.toHaveBeenCalled();

    openSpy.mockRestore();
  });
});
