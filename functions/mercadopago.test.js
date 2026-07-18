const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const {
  getMercadoPagoClient,
  resetMercadoPagoClient,
  MOCK_SIGNATURE,
  MOCK_REQUEST_ID,
} = require('./mercadopago');

describe('mercadopago client factory', () => {
  beforeEach(() => {
    delete process.env.MP_USE_MOCK;
    delete process.env.MP_ACCESS_TOKEN;
    resetMercadoPagoClient();
  });

  it('returns mock client when MP_ACCESS_TOKEN is missing', async () => {
    const client = await getMercadoPagoClient();
    assert.ok(client.preference);
    assert.ok(client.payment);
    assert.ok(client.verifyWebhookSignature);
    assert.ok(client._mock);
  });

  it('returns mock client when MP_USE_MOCK=true', async () => {
    process.env.MP_USE_MOCK = 'true';
    process.env.MP_ACCESS_TOKEN = 'real-token';
    resetMercadoPagoClient();

    const client = await getMercadoPagoClient();
    assert.ok(client._mock);
  });

  it('returns a real client when MP_ACCESS_TOKEN is set and MP_USE_MOCK is not true', async () => {
    process.env.MP_ACCESS_TOKEN = 'test-access-token';
    resetMercadoPagoClient();

    const client = await getMercadoPagoClient();
    assert.ok(client.preference);
    assert.ok(client.payment);
    assert.ok(client.verifyWebhookSignature);
    assert.strictEqual(client._mock, undefined);
  });

  it('mock preference.create returns init_point and external_reference', async () => {
    const client = await getMercadoPagoClient();
    const result = await client.preference.create({
      body: {
        items: [{ id: 'mini', title: 'Mini', quantity: 1, unit_price: 4990 }],
        external_reference: 'uid_mini_abc123',
      },
    });

    assert.ok(result.id.startsWith('MOCK_PREF_'));
    assert.ok(result.init_point.includes('mock.mercadopago.com'));
    assert.strictEqual(result.external_reference, 'uid_mini_abc123');
  });

  it('mock payment.get returns pending for unknown payments', async () => {
    const client = await getMercadoPagoClient();
    const payment = await client.payment.get({ id: '12345' });

    assert.strictEqual(payment.status, 'pending');
    assert.strictEqual(payment.currency_id, 'CLP');
  });

  it('mock payment.get returns registered status after setPaymentStatus', async () => {
    const client = await getMercadoPagoClient();
    client._mock.setPaymentStatus('ext-ref-1', 'approved', 4990);

    const payment = await client.payment.get({ id: 'ext-ref-1' });
    assert.strictEqual(payment.status, 'approved');
    assert.strictEqual(payment.transaction_amount, 4990);
    assert.strictEqual(payment.external_reference, 'ext-ref-1');
  });

  it('mock verifyWebhookSignature accepts the known mock signature', async () => {
    const client = await getMercadoPagoClient();
    assert.doesNotThrow(() =>
      client.verifyWebhookSignature({ xSignature: MOCK_SIGNATURE }),
    );
  });

  it('mock verifyWebhookSignature rejects other signatures', async () => {
    const client = await getMercadoPagoClient();
    assert.throws(() =>
      client.verifyWebhookSignature({ xSignature: 'bad-signature' }),
    );
  });
});
