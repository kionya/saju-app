import assert from 'node:assert/strict';
import {
  DEFAULT_TOSS_PAYMENT_METHOD,
  TOSS_PAYMENT_METHOD_OPTIONS,
  getTossPaymentMethodOption,
} from './methods';

declare const test: (name: string, fn: () => void) => void;

test('toss payment methods expose card and transfer with card as default', () => {
  assert.equal(DEFAULT_TOSS_PAYMENT_METHOD, 'CARD');
  assert.deepEqual(
    TOSS_PAYMENT_METHOD_OPTIONS.map((option) => option.code),
    ['CARD', 'TRANSFER']
  );
  assert.equal(getTossPaymentMethodOption('TRANSFER').label, '계좌이체');
});
