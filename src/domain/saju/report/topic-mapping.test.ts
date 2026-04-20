import assert from 'node:assert/strict';
import { normalizeToSajuDataV1 } from '@/domain/saju/engine/saju-data-v1';
import {
  FOCUS_TOPIC_OPTIONS,
  buildSajuReport,
  normalizeFocusTopic,
} from '@/domain/saju/report';
import type { BirthInput } from '@/lib/saju/types';

declare const test: (name: string, fn: () => void) => void;

const birthInput: BirthInput = {
  year: 1982,
  month: 1,
  day: 29,
  hour: 8,
  gender: 'male',
};

test('report topic options include relationship as a first-class tab', () => {
  assert.deepEqual(
    FOCUS_TOPIC_OPTIONS.map((option) => option.key),
    ['today', 'love', 'wealth', 'career', 'relationship']
  );
});

test('normalizeFocusTopic falls back to today for unknown topics', () => {
  assert.equal(normalizeFocusTopic('relationship'), 'relationship');
  assert.equal(normalizeFocusTopic('unknown-topic'), 'today');
  assert.equal(normalizeFocusTopic(), 'today');
});

test('each report topic maps to its matching focused score key', () => {
  const data = normalizeToSajuDataV1(birthInput, null);
  const expected = {
    today: 'overall',
    love: 'love',
    wealth: 'wealth',
    career: 'career',
    relationship: 'relationship',
  } as const;

  for (const [topic, scoreKey] of Object.entries(expected)) {
    const report = buildSajuReport(birthInput, data, topic);

    assert.equal(report.focusTopic, topic);
    assert.equal(report.focusScoreKey, scoreKey);
    assert.ok(report.scores.some((score) => score.key === scoreKey));
  }
});

test('relationship topic uses relationship-specific copy instead of love copy', () => {
  const data = normalizeToSajuDataV1(birthInput, null);
  const report = buildSajuReport(birthInput, data, 'relationship');

  assert.equal(report.focusLabel, '관계');
  assert.match(report.primaryAction.title, /관계/);
  assert.match(report.cautionAction.title, /관계/);
  assert.ok(report.summaryHighlights.some((summary) => summary.includes('관계 흐름')));
});

test('evidence cards expose computed facts, source, confidence, and topic mapping', () => {
  const data = normalizeToSajuDataV1(birthInput, null);
  const report = buildSajuReport(birthInput, data, 'today');

  assert.ok(report.evidenceCards.length >= 6);
  assert.ok(
    report.evidenceCards.every((card) => {
      return (
        card.computed.dayMaster === data.dayMaster.stem &&
        card.source.length > 0 &&
        ['확정', '보통', '참고'].includes(card.confidence) &&
        card.topicMapping.length > 0
      );
    })
  );

  const relationCard = report.evidenceCards.find((card) => card.key === 'relations');
  assert.ok(relationCard?.topicMapping.includes('relationship'));
  assert.ok(relationCard?.source.includes('orrery-reference'));
});
