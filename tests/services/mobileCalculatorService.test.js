import { describe, it, expect, vi } from 'vitest';
import {
  calculateMobileCost,
  prepareMobileCostMessage,
  openWhatsAppShare,
} from '../../src/services/mobileCalculatorService';

describe('calculateMobileCost', () => {
  it('returns full breakdown with ida y vuelta ON (default) for design example (4.5 / 12 / 1200 / 80, 25%)', () => {
    expect(
      calculateMobileCost({
        distance: 4.5,
        kmPerLiter: 12,
        pricePerLiter: 1200,
        wearCostPerKm: 80,
        marginPercent: 25,
      })
    ).toEqual({
      fuelCost: 900,
      wearCost: 720,
      costSubtotal: 1620,
      marginAmount: 405,
      price: 2025,
      marginPercent: 25,
      effectiveDistance: 9,
      includeReturn: true,
    });
  });

  it('returns full breakdown with ida y vuelta OFF for design example (4.5 / 12 / 1200 / 80, 25%)', () => {
    expect(
      calculateMobileCost({
        distance: 4.5,
        kmPerLiter: 12,
        pricePerLiter: 1200,
        wearCostPerKm: 80,
        marginPercent: 25,
        includeReturn: false,
      })
    ).toEqual({
      fuelCost: 450,
      wearCost: 360,
      costSubtotal: 810,
      marginAmount: 202.5,
      price: 1012.5,
      marginPercent: 25,
      effectiveDistance: 4.5,
      includeReturn: false,
    });
  });

  it('returns full breakdown for integer example with ida y vuelta (10 / 10 / 1000 / 50, 30%)', () => {
    expect(
      calculateMobileCost({
        distance: 10,
        kmPerLiter: 10,
        pricePerLiter: 1000,
        wearCostPerKm: 50,
        marginPercent: 30,
      })
    ).toEqual({
      fuelCost: 2000,
      wearCost: 1000,
      costSubtotal: 3000,
      marginAmount: 900,
      price: 3900,
      marginPercent: 30,
      effectiveDistance: 20,
      includeReturn: true,
    });
  });

  it('returns price equal to cost when margin is 0 (breakeven) with ida y vuelta', () => {
    expect(
      calculateMobileCost({
        distance: 10,
        kmPerLiter: 10,
        pricePerLiter: 1000,
        wearCostPerKm: 50,
        marginPercent: 0,
      })
    ).toEqual({
      fuelCost: 2000,
      wearCost: 1000,
      costSubtotal: 3000,
      marginAmount: 0,
      price: 3000,
      marginPercent: 0,
      effectiveDistance: 20,
      includeReturn: true,
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
  it('returns approved copy with ida y vuelta (25% margin)', () => {
    const message = prepareMobileCostMessage({
      costSubtotal: 1620,
      marginAmount: 405,
      price: 2025,
      marginPercent: 25,
      effectiveDistance: 9,
      includeReturn: true,
    });
    expect(message).toBe(
      'Precio sugerido del envío: $2.025 (costo $1.620 + margen 25%, 9 km (ida y vuelta)). Calculado en caldero-envio.com'
    );
  });

  it('returns approved copy with solo ida (25% margin)', () => {
    const message = prepareMobileCostMessage({
      costSubtotal: 810,
      marginAmount: 202.5,
      price: 1012.5,
      marginPercent: 25,
      effectiveDistance: 4.5,
      includeReturn: false,
    });
    expect(message).toBe(
      'Precio sugerido del envío: $1.012,5 (costo $810 + margen 25%, 4,5 km (solo ida)). Calculado en caldero-envio.com'
    );
  });

  it('uses thousands separator for large numbers', () => {
    const message = prepareMobileCostMessage({
      costSubtotal: 3000,
      marginAmount: 900,
      price: 3900,
      marginPercent: 30,
      effectiveDistance: 20,
      includeReturn: true,
    });
    expect(message).toBe(
      'Precio sugerido del envío: $3.900 (costo $3.000 + margen 30%, 20 km (ida y vuelta)). Calculado en caldero-envio.com'
    );
  });

  it('handles 0% margin (price equals cost) with ida y vuelta', () => {
    const message = prepareMobileCostMessage({
      costSubtotal: 3000,
      marginAmount: 0,
      price: 3000,
      marginPercent: 0,
      effectiveDistance: 20,
      includeReturn: true,
    });
    expect(message).toBe(
      'Precio sugerido del envío: $3.000 (costo $3.000 + margen 0%, 20 km (ida y vuelta)). Calculado en caldero-envio.com'
    );
  });

  it('returns empty string when any value is invalid', () => {
    expect(
      prepareMobileCostMessage({
        costSubtotal: NaN,
        marginAmount: 200,
        price: 1000,
        marginPercent: 25,
        effectiveDistance: 5,
        includeReturn: true,
      })
    ).toBe('');
    expect(
      prepareMobileCostMessage({
        costSubtotal: 1000,
        marginAmount: NaN,
        price: 1000,
        marginPercent: 25,
        effectiveDistance: 5,
        includeReturn: true,
      })
    ).toBe('');
    expect(
      prepareMobileCostMessage({
        costSubtotal: 1000,
        marginAmount: 200,
        price: NaN,
        marginPercent: 25,
        effectiveDistance: 5,
        includeReturn: true,
      })
    ).toBe('');
    expect(
      prepareMobileCostMessage({
        costSubtotal: 1000,
        marginAmount: 200,
        price: 1000,
        marginPercent: NaN,
        effectiveDistance: 5,
        includeReturn: true,
      })
    ).toBe('');
    expect(
      prepareMobileCostMessage({
        costSubtotal: 1000,
        marginAmount: 200,
        price: 1000,
        marginPercent: 25,
        effectiveDistance: NaN,
        includeReturn: true,
      })
    ).toBe('');
    expect(
      prepareMobileCostMessage({
        costSubtotal: 1000,
        marginAmount: 200,
        price: 1000,
        marginPercent: 25,
        effectiveDistance: 5,
        includeReturn: 'yes',
      })
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
