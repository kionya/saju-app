import assert from 'node:assert/strict';
import { calculateSajuDataV1, normalizeToSajuDataV1 } from './saju-data-v1';
import { getBirthLocationPreset } from '@/lib/saju/birth-location';

declare const test: (name: string, fn: () => void) => void;

test('normalizeToSajuDataV1 enriches older complete data missing stem ten gods', () => {
  const input = {
    year: 1990,
    month: 1,
    day: 1,
    hour: 12,
    gender: 'male' as const,
  };
  const oldData = JSON.parse(JSON.stringify(calculateSajuDataV1(input)));

  delete oldData.pillars.year.stemTenGod;
  delete oldData.pillars.month.stemTenGod;
  delete oldData.pillars.day.stemTenGod;
  delete oldData.pillars.hour.stemTenGod;

  const normalized = normalizeToSajuDataV1(input, oldData);

  assert.equal(normalized.pillars.day.stemTenGod, null);
  assert.ok(normalized.pillars.year.stemTenGod);
  assert.ok(normalized.pillars.month.stemTenGod);
  assert.ok(normalized.pillars.hour?.stemTenGod);
});

test('calculateSajuDataV1 records longitude-adjusted birth time metadata', () => {
  const seoul = getBirthLocationPreset('seoul');
  assert.ok(seoul);

  const data = calculateSajuDataV1({
    year: 1982,
    month: 1,
    day: 29,
    hour: 0,
    minute: 10,
    gender: 'male',
    birthLocation: seoul,
    solarTimeMode: 'longitude',
  });

  assert.equal(data.input.location, '서울');
  assert.equal(data.input.birthTimeCorrection?.offsetMinutes, -32);
  assert.equal(data.input.birthTimeCorrection?.adjustedBirth.day, 28);
  assert.equal(data.extensions?.orrery?.input.longitude, 126.978);
});

test('calculateSajuDataV1 exposes yongsin candidates and explanation layers', () => {
  const data = calculateSajuDataV1({
    year: 1982,
    month: 1,
    day: 29,
    hour: 8,
    gender: 'male',
  });

  assert.ok(data.yongsin?.primary);
  assert.ok((data.yongsin?.candidates?.length ?? 0) >= 2);
  assert.ok(data.yongsin?.confidence);
  assert.match(data.yongsin?.plainSummary ?? '', /쉽게 말하면/);
  assert.match(data.yongsin?.technicalSummary ?? '', /전문적으로는/);
  assert.ok((data.yongsin?.practicalActions?.length ?? 0) >= 2);
  assert.ok(data.yongsin?.terms?.some((term) => term.term === '용신' && term.hanja === '用神'));
});
