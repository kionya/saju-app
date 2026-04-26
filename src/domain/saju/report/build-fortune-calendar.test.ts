import assert from 'node:assert/strict';
import { normalizeToSajuDataV1 } from '@/domain/saju/engine/saju-data-v1';
import { buildFortuneCalendarMonth } from '@/domain/saju/report';
import type { BirthInput } from '@/lib/saju/types';

declare const test: (name: string, fn: () => void) => void;

const birthInput: BirthInput = {
  year: 1982,
  month: 1,
  day: 29,
  hour: 8,
  minute: 45,
  gender: 'male',
};

test('buildFortuneCalendarMonth returns a complete month grid with tone counts', () => {
  const data = normalizeToSajuDataV1(birthInput, null);
  const report = buildFortuneCalendarMonth(birthInput, data, 2026, 5);

  assert.equal(report.year, 2026);
  assert.equal(report.month, 5);
  assert.equal(report.monthLabel, '2026년 5월');
  assert.equal(report.totalDays, 31);
  assert.equal(report.days.length, 31);
  assert.ok(report.weeks.length >= 4);
  assert.equal(
    report.summary.toneCounts.decision +
      report.summary.toneCounts.good +
      report.summary.toneCounts.average +
      report.summary.toneCounts.caution,
    31
  );
  assert.ok(report.summary.bestDays.length > 0);
  assert.ok(report.summary.cautionDays.length > 0);
});

test('buildFortuneCalendarMonth annotates each day with score, tone, and action hint', () => {
  const data = normalizeToSajuDataV1(birthInput, null);
  const report = buildFortuneCalendarMonth(birthInput, data, 2026, 2);
  const firstDay = report.days[0];

  assert.ok(firstDay);
  assert.match(firstDay!.isoDate, /^2026-02-\d{2}$/);
  assert.ok(firstDay!.score >= 0);
  assert.ok(['decision', 'good', 'average', 'caution'].includes(firstDay!.tone));
  assert.ok(firstDay!.summary.length > 0);
  assert.ok(firstDay!.actionHint.length > 0);
});
