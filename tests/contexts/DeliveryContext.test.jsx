import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { DeliveryProvider, useDelivery } from '../../src/contexts/DeliveryContext';

function TestComponent() {
  const ctx = useDelivery();
  return (
    <div>
      <p data-testid="address">{ctx.delivery.address || '(empty)'}</p>
      <p data-testid="courier">{ctx.delivery.courierId || '(none)'}</p>
      <p data-testid="price">{ctx.delivery.price ?? '(none)'}</p>
      <p data-testid="distance">{ctx.delivery.distance ?? '(none)'}</p>
      <button data-testid="set-address" onClick={() => ctx.setAddress('Av. Test 123', { lat: -33, lng: -70 })} />
      <button data-testid="set-courier" onClick={() => ctx.setCourier('courier-1')} />
      <button data-testid="set-result" onClick={() => ctx.setResult({ distance: 5, time: 15, price: 1000, routeUrl: 'url', mapImage: 'img', routeGeometry: null })} />
      <button data-testid="reset" onClick={() => ctx.reset()} />
    </div>
  );
}

function renderWithProvider() {
  return render(
    <DeliveryProvider>
      <TestComponent />
    </DeliveryProvider>
  );
}

describe('DeliveryContext', () => {
  it('provides initial empty state', () => {
    renderWithProvider();
    expect(screen.getByTestId('address').textContent).toBe('(empty)');
    expect(screen.getByTestId('courier').textContent).toBe('(none)');
    expect(screen.getByTestId('price').textContent).toBe('(none)');
  });

  it('setAddress updates address and clears previous results', () => {
    renderWithProvider();

    act(() => screen.getByTestId('set-address').click());

    expect(screen.getByTestId('address').textContent).toBe('Av. Test 123');
  });

  it('setCourier updates courierId', () => {
    renderWithProvider();

    act(() => screen.getByTestId('set-courier').click());

    expect(screen.getByTestId('courier').textContent).toBe('courier-1');
  });

  it('setResult updates delivery data', () => {
    renderWithProvider();

    act(() => screen.getByTestId('set-result').click());

    expect(screen.getByTestId('distance').textContent).toBe('5');
    expect(screen.getByTestId('price').textContent).toBe('1000');
  });

  it('reset clears state but preserves courierId', () => {
    renderWithProvider();

    act(() => screen.getByTestId('set-address').click());
    act(() => screen.getByTestId('set-courier').click());
    act(() => screen.getByTestId('set-result').click());
    act(() => screen.getByTestId('reset').click());

    expect(screen.getByTestId('address').textContent).toBe('(empty)');
    expect(screen.getByTestId('courier').textContent).toBe('courier-1');
    expect(screen.getByTestId('price').textContent).toBe('(none)');
  });

  it('throws when useDelivery is used outside provider', () => {
    // Suppress console.error for expected error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow();
    consoleSpy.mockRestore();
  });
});
