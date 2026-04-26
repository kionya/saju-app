import assert from 'node:assert/strict';
import { normalizeToSajuDataV1 } from '@/domain/saju/engine/saju-data-v1';
import { buildYearlyReport, YEARLY_CATEGORY_ORDER } from '@/domain/saju/report';
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

test('buildYearlyReport creates a yearly report with monthly evidence ready for long-form interpretation', () => {
  const data = normalizeToSajuDataV1(birthInput, null);
  const report = buildYearlyReport(birthInput, data, 2026);

  assert.equal(report.year, 2026);
  assert.match(report.yearLabel, /2026년/);
  assert.equal(report.computation.detailLevel, 'monthly-evidence');
  assert.equal(report.computation.monthlyPrecision, 'monthly-ganji');
  assert.equal(report.monthlyFlows.length, 12);
  assert.deepEqual(report.categoryOrder, YEARLY_CATEGORY_ORDER);
  assert.deepEqual(Object.keys(report.categories), YEARLY_CATEGORY_ORDER);
  assert.ok(report.overview.summary.length > 0);
  assert.ok(report.coreKeywords.length >= 3);
  assert.ok(report.firstHalf.relatedMonths.every((month) => month >= 1 && month <= 6));
  assert.ok(report.secondHalf.relatedMonths.every((month) => month >= 7 && month <= 12));
  assert.ok(report.goodPeriods.length > 0);
  assert.ok(report.cautionPeriods.length > 0);
  assert.ok(report.oneLineSummary.length > 0);
  assert.ok(report.evidenceCards.length >= 6);
  assert.ok(report.referenceReports.today.summary.length > 0);
  assert.ok(report.referenceReports.career.score !== null);
});

test('buildYearlyReport fills all 12 months with actual monthly ganji evidence', () => {
  const data = normalizeToSajuDataV1(birthInput, null);
  const report = buildYearlyReport(birthInput, data, 2026);

  assert.deepEqual(
    report.monthlyFlows.map((flow) => flow.month),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  );
  assert.ok(
    report.monthlyFlows.every((flow) => {
      return (
        typeof flow.monthlyGanji === 'string' &&
        flow.monthlyGanji.length > 0 &&
        flow.summary.length > 0 &&
        flow.relatedAreas.length >= 2 &&
        flow.basis.some((line) => line.includes('월운:')) &&
        flow.basis.some((line) => line.includes('세운:'))
      );
    })
  );
});

test('buildYearlyReport actually respects the requested target year', () => {
  const data = normalizeToSajuDataV1(birthInput, null);
  const report2026 = buildYearlyReport(birthInput, data, 2026);
  const report2027 = buildYearlyReport(birthInput, data, 2027);

  assert.notEqual(report2026.year, report2027.year);
  assert.notEqual(report2026.yearLabel, report2027.yearLabel);
  assert.notEqual(
    report2026.referenceReports.today.summary,
    '',
    '2026 report summary should not be empty'
  );
  assert.notEqual(
    report2027.referenceReports.today.summary,
    '',
    '2027 report summary should not be empty'
  );
  assert.notDeepEqual(
    report2026.monthlyFlows.map((flow) => flow.monthlyGanji),
    report2027.monthlyFlows.map((flow) => flow.monthlyGanji),
    'monthly ganji evidence should reflect the requested target year'
  );
});
