import assert from 'node:assert/strict';
import { validatePaymentConfirmationPayload } from './confirmation';

declare const test: (name: string, fn: () => void) => void;

test('payment confirmation accepts a valid subscription package', () => {
  const result = validatePaymentConfirmationPayload({
    paymentKey: 'pay_123',
    orderId: 'order_123',
    amount: 9900,
    packageId: 'membership_premium',
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.input.pkg.kind, 'subscription');
  assert.equal(result.input.pkg.subscriptionPlan, 'premium_monthly');
  assert.equal(result.input.slug, null);
});

test('payment confirmation rejects tampered package amount', () => {
  const result = validatePaymentConfirmationPayload({
    paymentKey: 'pay_123',
    orderId: 'order_123',
    amount: 100,
    packageId: 'membership_premium',
  });

  assert.deepEqual(result, {
    ok: false,
    error: '잘못된 결제 정보입니다.',
  });
});

test('lifetime report confirmation requires a reading slug before Toss approval', () => {
  const result = validatePaymentConfirmationPayload({
    paymentKey: 'pay_123',
    orderId: 'order_123',
    amount: 49000,
    packageId: 'lifetime_report',
  });

  assert.deepEqual(result, {
    ok: false,
    error: '평생 리포트 결제에는 결과 식별자가 필요합니다.',
  });
});

test('lifetime report confirmation trims the reading slug used for entitlement', () => {
  const result = validatePaymentConfirmationPayload({
    paymentKey: 'pay_123',
    orderId: 'order_123',
    amount: 49000,
    packageId: 'lifetime_report',
    slug: '  1982-1-29-8-male  ',
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.input.pkg.kind, 'lifetime_report');
  assert.equal(result.input.slug, '1982-1-29-8-male');
});
