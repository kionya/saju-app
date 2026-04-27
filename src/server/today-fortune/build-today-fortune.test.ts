import assert from 'node:assert/strict';
import { calculateSajuDataV1 } from '@/domain/saju/engine/saju-data-v1';
import { buildSajuReport } from '@/domain/saju/report';
import {
  getTopicInterpretationRule,
  selectEvidenceCard,
} from '@/domain/saju/report/interpretation-rule-table';
import { parseBirthInputDraft } from '@/domain/saju/validators/birth-input';
import {
  buildTodayFortuneFreeResult,
  buildTodayFortunePremiumResult,
} from './build-today-fortune';

declare const test: (name: string, fn: () => void) => void;

function createSampleInput() {
  const parsed = parseBirthInputDraft(
    {
      year: '1982',
      month: '1',
      day: '29',
      hour: '8',
      minute: '45',
      gender: 'male',
      birthLocationCode: 'seoul',
      birthLocationLabel: '서울특별시',
      birthLatitude: '37.5665',
      birthLongitude: '126.9780',
      unknownTime: false,
      jasiMethod: 'unified',
      solarTimeMode: 'standard',
    },
    { requireGender: false }
  );

  if (!parsed.ok) {
    throw new Error('sample birth input should be valid');
  }

  return parsed.input;
}

test('today fortune premium actions reuse evidence practical actions instead of only fixed copy', () => {
  const input = createSampleInput();
  const sajuData = calculateSajuDataV1(input);
  const result = buildTodayFortunePremiumResult(input, sajuData, 'money_spend');
  const report = buildSajuReport(input, sajuData, 'wealth');
  const rule = getTopicInterpretationRule('wealth');
  const leadCard = selectEvidenceCard(report.evidenceCards, rule.evidencePriority);
  const cautionCard = selectEvidenceCard(report.evidenceCards, rule.cautionPriority);

  assert.equal(result.recommendedActions.length, 3);
  assert.equal(result.avoidActions.length, 3);
  assert.ok(
    leadCard?.practicalActions?.some((action) =>
      result.recommendedActions.some((line) => line.includes(action))
    )
  );
  assert.ok(
    cautionCard?.practicalActions?.some((action) =>
      result.avoidActions.some((line) => line.includes(action))
    )
  );
});

test('today fortune premium windows and scenarios carry grounded current-luck cues', () => {
  const input = createSampleInput();
  const sajuData = calculateSajuDataV1(input);
  const result = buildTodayFortunePremiumResult(input, sajuData, 'work_meeting');
  const currentLuckFact = [
    sajuData.currentLuck?.currentMajorLuck?.ganzi
      ? `${sajuData.currentLuck.currentMajorLuck.ganzi} 대운`
      : null,
    sajuData.currentLuck?.saewoon?.ganzi
      ? `${sajuData.currentLuck.saewoon.ganzi} 세운`
      : null,
    sajuData.currentLuck?.wolwoon?.ganzi
      ? `${sajuData.currentLuck.wolwoon.ganzi} 월운`
      : null,
  ]
    .filter(Boolean)
    .join(' / ');

  assert.ok(
    result.favorableWindows.some((item) => item.title.includes('기준과 역할')) &&
      result.cautionWindows.some((item) => item.title.includes('확답이 부담'))
  );
  assert.deepEqual(
    result.scenarios.map((item) => item.title),
    ['오늘 미팅을 바로 진행할 때', '한 번 더 조율하고 진행할 때']
  );

  if (currentLuckFact) {
    assert.ok(
      result.favorableWindows.some((item) => item.body.includes(currentLuckFact)) ||
        result.cautionWindows.some((item) => item.body.includes(currentLuckFact)) ||
        result.scenarios.some((item) => item.watch.includes(currentLuckFact))
    );
  }
});

test('today fortune free result surfaces grounding facts and evidence lines near the teaser', () => {
  const input = createSampleInput();
  const sajuData = calculateSajuDataV1(input);
  const result = buildTodayFortuneFreeResult(input, sajuData, {
    concernId: 'relationship_conflict',
    sourceSessionId: 'sample-reading',
    calendarType: 'solar',
    timeRule: 'standard',
  });

  assert.ok(result.groundingSummary.primaryConcept.length > 0);
  assert.ok(result.groundingSummary.factLines.length >= 3);
  assert.ok(result.groundingSummary.evidenceLines.length >= 2);
  assert.match(result.reasonSnippet.body, /^강약은 /);
  assert.doesNotMatch(result.reasonSnippet.body, /중화은/);
  assert.doesNotMatch(result.reasonSnippet.body, /66점로/);
  assert.doesNotMatch(result.groundingSummary.factLines.join(' '), /\([가-힣]+\)\([가-힣]+\)/);
  assert.doesNotMatch(result.groundingSummary.evidenceLines.join(' '), /을\(를\)/);
});

test('today fortune one-line body does not repeat the same grounding sentence twice', () => {
  const input = createSampleInput();
  const sajuData = calculateSajuDataV1(input);
  const result = buildTodayFortuneFreeResult(input, sajuData, {
    concernId: 'money_spend',
    sourceSessionId: 'sample-reading',
    calendarType: 'solar',
    timeRule: 'standard',
  });

  const needle =
    '용신에서는 1순위 火 (화) · 보조 木 (목) · 水 (수)로 읽힙니다. 이 명식은 가장 먼저 火 (화) 기운을 보완 후보로 봅니다.';
  const count = result.oneLine.body.split(needle).length - 1;

  assert.equal(count, 1);
});

test('today fortune relationship one-line body does not repeat the same 합충 snippet twice', () => {
  const input = createSampleInput();
  const sajuData = calculateSajuDataV1(input);
  const result = buildTodayFortuneFreeResult(input, sajuData, {
    concernId: 'relationship_conflict',
    sourceSessionId: 'sample-reading',
    calendarType: 'solar',
    timeRule: 'standard',
  });

  const needle =
    '합충에서는 파 · 반합 · 육합으로 읽힙니다. 파 · 반합 · 육합 흐름은 관계나 선택이 가만히 머물기보다 묶이거나 움직이는 지점을 보여줍니다.';
  const count = result.oneLine.body.split(needle).length - 1;

  assert.equal(count, 1);
});

test('today fortune time windows vary their body copy across different ranges', () => {
  const input = createSampleInput();
  const sajuData = calculateSajuDataV1(input, { calculatedAt: '2026-04-27T12:00:00+09:00' });
  const result = buildTodayFortunePremiumResult(input, sajuData, 'relationship_conflict');

  assert.equal(result.favorableWindows.length, 2);
  assert.equal(result.cautionWindows.length, 2);
  assert.ok(result.favorableWindows.every((item) => item.title.includes('시 ·')));
  assert.ok(result.cautionWindows.every((item) => item.title.includes('시 ·')));
  assert.notEqual(result.favorableWindows[0]?.range, result.favorableWindows[1]?.range);
  assert.notEqual(result.cautionWindows[0]?.range, result.cautionWindows[1]?.range);
  assert.notEqual(result.favorableWindows[0]?.body, result.favorableWindows[1]?.body);
  assert.notEqual(result.cautionWindows[0]?.body, result.cautionWindows[1]?.body);
});

test('today fortune opportunity and risk copy stays concise and grounded', () => {
  const input = createSampleInput();
  const sajuData = calculateSajuDataV1(input);
  const result = buildTodayFortuneFreeResult(input, sajuData, {
    concernId: 'money_spend',
    sourceSessionId: 'sample-reading',
    calendarType: 'solar',
    timeRule: 'standard',
  });

  assert.doesNotMatch(result.opportunity.body, /^[^.!?]+점 기준입니다\./);
  assert.doesNotMatch(result.risk.body, /^[^.!?]+점 기준입니다\./);
  assert.match(result.opportunity.body, /오늘은 ".+"부터 먼저 잡는 편이 좋습니다\./);
  assert.match(result.risk.body, /오늘은 ".+"를 놓치면 흐름이 급히 거칠어질 수 있습니다\./);
});
