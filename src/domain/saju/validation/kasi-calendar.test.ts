import assert from 'node:assert/strict';
import {
  KASI_COMPARISON_SAMPLES,
  buildKasiLunCalInfoUrl,
  buildLocalCalendarComparable,
  compareKasiWithLocalSample,
  parseKasiLunCalInfoResponse,
} from './kasi-calendar';

declare const test: (name: string, fn: () => void) => void;

test('KASI comparison samples cover calendar edge cases before live API validation', () => {
  assert.ok(KASI_COMPARISON_SAMPLES.length >= 6);
  assert.ok(KASI_COMPARISON_SAMPLES.some((sample) => sample.id.includes('leap-month')));
  assert.ok(KASI_COMPARISON_SAMPLES.some((sample) => sample.id.includes('leap-day')));
  assert.ok(KASI_COMPARISON_SAMPLES.some((sample) => sample.id.includes('jasi')));
  assert.ok(KASI_COMPARISON_SAMPLES.every((sample) => sample.compare.lunarDate));
});

test('KASI URL builder uses official lunisolar endpoint parameters', () => {
  const url = buildKasiLunCalInfoUrl(
    { year: 2024, month: 2, day: 9 },
    'test-service-key',
    'https://apis.data.go.kr/B090041/openapi/service/LrsrCldInfoService/getLunCalInfo'
  );

  assert.equal(url.searchParams.get('ServiceKey'), 'test-service-key');
  assert.equal(url.searchParams.get('solYear'), '2024');
  assert.equal(url.searchParams.get('solMonth'), '02');
  assert.equal(url.searchParams.get('solDay'), '09');
  assert.equal(url.searchParams.get('_type'), 'json');
});

test('KASI parser normalizes JSON response item', () => {
  const item = parseKasiLunCalInfoResponse(JSON.stringify({
    response: {
      header: { resultCode: '00', resultMsg: 'NORMAL SERVICE' },
      body: {
        items: {
          item: {
            solYear: '2024',
            solMonth: '02',
            solDay: '10',
            lunYear: '2024',
            lunMonth: '01',
            lunDay: '01',
            lunLeapmonth: '평',
            lunIljin: '갑진(甲辰)',
            solJd: '2460351',
          },
        },
      },
    },
  }));

  assert.equal(item.solYear, 2024);
  assert.equal(item.lunMonth, 1);
  assert.equal(item.lunIljin, '갑진(甲辰)');
  assert.equal(item.solJd, 2460351);
});

test('KASI comparison flags engine mismatches but passes matching local values', () => {
  const sample = KASI_COMPARISON_SAMPLES.find((entry) => entry.id === 'lunar-leap-month-start');
  assert.ok(sample);

  const local = buildLocalCalendarComparable(sample.input);
  const matching = compareKasiWithLocalSample(sample, {
    solYear: sample.input.year,
    solMonth: sample.input.month,
    solDay: sample.input.day,
    lunYear: local.lunarYear,
    lunMonth: local.lunarMonth,
    lunDay: local.lunarDay,
    lunLeapmonth: local.lunarLeapMonth ? '윤' : '평',
    lunSecha: null,
    lunWolgeon: null,
    lunIljin: `샘플(${local.dayPillar})`,
    solWeek: null,
    solJd: null,
  });

  assert.equal(matching.length, 0);

  const mismatched = compareKasiWithLocalSample(sample, {
    solYear: sample.input.year,
    solMonth: sample.input.month,
    solDay: sample.input.day,
    lunYear: local.lunarYear,
    lunMonth: local.lunarMonth,
    lunDay: local.lunarDay + 1,
    lunLeapmonth: local.lunarLeapMonth ? '윤' : '평',
    lunSecha: null,
    lunWolgeon: null,
    lunIljin: '샘플(甲子)',
    solWeek: null,
    solJd: null,
  });

  assert.ok(mismatched.some((issue) => issue.field === 'lunarDay'));
});
