import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  sendWhatsAppMessage,
  generateWhatsAppLink,
  prepareRouteMessage,
} from '../../src/services/whatsappService';

describe('whatsappService', () => {
  describe('generateWhatsAppLink', () => {
    it('returns a valid wa.me URL with cleaned phone number', () => {
      const url = generateWhatsAppLink('+54 11 1234-5678', 'Hola');
      expect(url).toContain('https://wa.me/541112345678');
    });

    it('encodes the message in the URL', () => {
      const url = generateWhatsAppLink('541112345678', 'Hola mundo');
      expect(url).toContain('?text=Hola%20mundo');
    });

    it('strips all non-digit characters from phone', () => {
      const url = generateWhatsAppLink('+54 (11) 5555-1234', 'test');
      expect(url).toContain('/wa.me/541155551234');
    });
  });

  describe('sendWhatsAppMessage', () => {
    const originalOpen = window.open;

    beforeEach(() => {
      window.open = vi.fn();
    });

    afterEach(() => {
      window.open = originalOpen;
    });

    it('opens wa.me URL in a new tab', async () => {
      await sendWhatsAppMessage('541112345678', 'Hola');
      expect(window.open).toHaveBeenCalledWith(
        'https://wa.me/541112345678?text=Hola',
        '_blank'
      );
    });
  });

  describe('prepareRouteMessage', () => {
    const baseData = {
      storeName: 'Mi Local',
      address: 'Av. Siempre Viva 123',
      price: 1500,
      distance: 4.5,
      time: 15,
      courierName: 'Juan',
    };

    it('includes store name', () => {
      const msg = prepareRouteMessage(baseData);
      expect(msg).toContain('Mi Local');
    });

    it('includes delivery address', () => {
      const msg = prepareRouteMessage(baseData);
      expect(msg).toContain('Av. Siempre Viva 123');
    });

    it('includes formatted price', () => {
      const msg = prepareRouteMessage(baseData);
      expect(msg).toContain('$1500');
    });

    it('includes distance with one decimal', () => {
      const msg = prepareRouteMessage(baseData);
      expect(msg).toContain('4.5');
    });

    it('rounds time to integer', () => {
      const msg = prepareRouteMessage({ ...baseData, time: 15.7 });
      expect(msg).toContain('16');
    });

    it('uses "Por asignar" when courierName is not provided', () => {
      const msg = prepareRouteMessage({ ...baseData, courierName: undefined });
      expect(msg).toContain('Por asignar');
    });

    it('includes map URL when provided', () => {
      const msg = prepareRouteMessage({ ...baseData, mapUrl: 'https://goo.gl/maps/abc' });
      expect(msg).toContain('https://goo.gl/maps/abc');
    });

    it('does not include map section when mapUrl is omitted', () => {
      const msg = prepareRouteMessage(baseData);
      expect(msg).not.toContain('🗺️');
    });

    it('ends with thank you message', () => {
      const msg = prepareRouteMessage(baseData);
      expect(msg).toContain('¡Gracias por confiar en nosotros!');
    });
  });
});
