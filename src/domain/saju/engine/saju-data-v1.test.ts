import assert from 'node:assert/strict';
import { calculateSajuDataV1, normalizeToSajuDataV1 } from './saju-data-v1';

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
