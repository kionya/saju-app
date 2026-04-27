import assert from 'node:assert/strict';
import {
  getInterpretationScoreBand,
  getTopicInterpretationRule,
  selectEvidenceCard,
  toEvidenceSnippet,
} from '@/domain/saju/report/interpretation-rule-table';
import type { ReportEvidenceCard, ReportScore } from '@/domain/saju/report/types';

declare const test: (name: string, fn: () => void) => void;

const baseScores: Record<ReportScore['key'], number> = {
  overall: 72,
  love: 65,
  wealth: 81,
  career: 69,
  relationship: 74,
};

const cards: ReportEvidenceCard[] = [
  {
    key: 'strength',
    label: '강약',
    title: '중화 · 66점',
    body: '밀고 당기는 힘이 크게 한쪽으로 치우치지 않습니다.',
    plainSummary: '쉽게 말하면 중화는 균형 감각이 살아 있다는 뜻입니다.',
    details: [],
    computed: {},
    source: ['계산값'],
    confidence: '확정',
    topicMapping: ['today'],
  },
  {
    key: 'yongsin',
    label: '용신',
    title: '1순위 火',
    body: '희기신 보정 기준으로 火를 먼저 봅니다.',
    plainSummary: '쉽게 말하면 火 기운을 보완하면 표현과 체온이 살아납니다.',
    details: [],
    computed: {},
    source: ['계산값'],
    confidence: '확정',
    topicMapping: ['today'],
  },
  {
    key: 'relations',
    label: '합충',
    title: '충 · 반합',
    body: '관계와 이동의 압력이 함께 들어옵니다.',
    plainSummary: '쉽게 말하면 합충은 관계가 묶이거나 부딪히는 지점입니다.',
    details: [],
    computed: {},
    source: ['계산값'],
    confidence: '보통',
    topicMapping: ['today'],
  },
];

test('topic interpretation rules expose evidence priorities and score-aware titles', () => {
  const rule = getTopicInterpretationRule('relationship');

  assert.deepEqual(rule.evidencePriority.slice(0, 2), ['relations', 'yongsin']);
  assert.ok(rule.actionTitles.high.length > 0);
  assert.ok(rule.cautionTitles.low.length > 0);
});

test('interpretation score band follows topic-focused score key', () => {
  assert.equal(getInterpretationScoreBand('wealth', baseScores), 'high');
  assert.equal(getInterpretationScoreBand('relationship', baseScores), 'mid');
  assert.equal(getInterpretationScoreBand('love', baseScores), 'low');
});

test('evidence helpers pick priority cards and normalize readable snippets', () => {
  const selected = selectEvidenceCard(cards, ['relations', 'yongsin']);
  const snippet = toEvidenceSnippet(selected);

  assert.equal(selected?.key, 'relations');
  assert.match(snippet ?? '', /합충에서는 충 · 반합로 읽힙니다/);
  assert.doesNotMatch(snippet ?? '', /쉽게 말하면/);
});
