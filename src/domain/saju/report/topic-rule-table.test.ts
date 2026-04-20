import assert from 'node:assert/strict';
import { normalizeToSajuDataV1 } from '@/domain/saju/engine/saju-data-v1';
import {
  REPORT_TOPIC_RULE_TABLE,
  buildSajuReport,
  getReportTopicRulesForTopic,
} from '@/domain/saju/report';
import type { FocusTopic, ReportEvidenceKey } from './types';
import type { BirthInput } from '@/lib/saju/types';

declare const test: (name: string, fn: () => void) => void;

const evidenceKeys: ReportEvidenceKey[] = [
  'strength',
  'pattern',
  'yongsin',
  'relations',
  'gongmang',
  'specialSals',
];

const focusTopics: FocusTopic[] = ['today', 'love', 'wealth', 'career', 'relationship'];

const birthInput: BirthInput = {
  year: 1982,
  month: 1,
  day: 29,
  hour: 8,
  gender: 'male',
};

test('topic rule table covers every visible evidence card key', () => {
  assert.deepEqual(Object.keys(REPORT_TOPIC_RULE_TABLE).sort(), [...evidenceKeys].sort());

  for (const key of evidenceKeys) {
    const rule = REPORT_TOPIC_RULE_TABLE[key];
    assert.equal(rule.evidenceKey, key);
    assert.ok(rule.source.length > 0);
    assert.ok(rule.topicMapping.length > 0);
    assert.ok(rule.rationale.length > 20);
  }
});

test('each focus topic has enough evidence rules for grounded interpretation', () => {
  for (const topic of focusTopics) {
    const rules = getReportTopicRulesForTopic(topic);
    assert.ok(rules.length >= 3, `${topic} should have at least 3 evidence rules`);
    assert.ok(rules.every((rule) => rule.topicInfluence[topic]));
  }
});

test('report evidence cards inherit source and topic mapping from rule table', () => {
  const data = normalizeToSajuDataV1(birthInput, null);
  const report = buildSajuReport(birthInput, data, 'relationship');

  for (const card of report.evidenceCards) {
    const rule = REPORT_TOPIC_RULE_TABLE[card.key];
    assert.deepEqual(card.source, rule.source);
    assert.deepEqual(card.topicMapping, rule.topicMapping);
  }
});
