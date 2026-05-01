import assert from 'node:assert/strict';
import {
  DETAIL_REPORT_ACCESS_KIND,
  DETAIL_REPORT_DAILY_ACCESS_KIND,
  TODAY_FORTUNE_PREMIUM_ACCESS_KIND,
  getKoreaAccessDay,
  validateCreditUsePayload,
} from './detail-report-access';

declare const test: (name: string, fn: () => void) => void;

test('detail report credit payload requires a slug before charging', () => {
  const result = validateCreditUsePayload({
    feature: 'detail_report',
  });

  assert.deepEqual(result, {
    ok: false,
    error: '상세 해석을 열 결과가 필요합니다.',
  });
});

test('detail report credit payload trims slug used for daily reuse', () => {
  const result = validateCreditUsePayload({
    feature: 'detail_report',
    slug: '  1982-1-29-8-male  ',
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.payload.feature, 'detail_report');
  assert.equal(result.payload.slug, '1982-1-29-8-male');
});

test('credit payload rejects unsupported feature names', () => {
  const result = validateCreditUsePayload({
    feature: 'not_a_feature',
    slug: '1982-1-29-8-male',
  });

  assert.deepEqual(result, {
    ok: false,
    error: '지원하지 않는 기능입니다.',
  });
});

test('daily detail report access key uses Korea calendar day', () => {
  const utcAfternoon = new Date('2026-04-18T16:30:00.000Z');

  assert.equal(getKoreaAccessDay(utcAfternoon), '2026-04-19');
  assert.equal(DETAIL_REPORT_ACCESS_KIND, 'detail_report_access');
  assert.equal(DETAIL_REPORT_DAILY_ACCESS_KIND, 'detail_report_daily_access');
  assert.equal(TODAY_FORTUNE_PREMIUM_ACCESS_KIND, 'today_fortune_premium_access');
});
