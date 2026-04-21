import assert from 'node:assert/strict';
import {
  buildFallbackInterpretation,
  parseInterpretationText,
  type SajuAiInterpretation,
} from './saju-interpretation';
import type { SajuReport } from '@/domain/saju/report/types';

declare const test: (name: string, fn: () => void) => void;

const fallback: SajuAiInterpretation = {
  headline: '기본 제목',
  summary: '기본 요약입니다.',
  insights: ['기본 통찰'],
};

test('parseInterpretationText accepts fenced JSON and normalizes fields', () => {
  const result = parseInterpretationText(
    '```json\n{"headline":"  새 제목  ","summary":"첫 문장.\\n둘째 문장.","insights":[" 하나 ","둘","셋","넷","다섯"]}\n```',
    fallback
  );

  assert.equal(result.ok, true);
  assert.equal(result.interpretation.headline, '새 제목');
  assert.equal(result.interpretation.summary, '첫 문장. 둘째 문장.');
  assert.deepEqual(result.interpretation.insights, ['하나', '둘', '셋', '넷']);
});

test('parseInterpretationText falls back when JSON is malformed', () => {
  const result = parseInterpretationText('not json', fallback);

  assert.equal(result.ok, false);
  assert.deepEqual(result.interpretation, fallback);
  assert.ok(result.errorMessage);
});

test('buildFallbackInterpretation derives compact insight copy from report', () => {
  const report = {
    headline: '오늘은 균형을 잡는 날',
    summary: '요약 문장입니다.',
    summaryHighlights: ['요약 1', '요약 2'],
    insights: [
      { title: '강점', eyebrow: '근거', body: '목 기운을 먼저 활용합니다.' },
      { title: '주의', eyebrow: '근거', body: '급한 결정은 줄입니다.' },
    ],
  } as SajuReport;

  const interpretation = buildFallbackInterpretation(report);

  assert.equal(interpretation.headline, report.headline);
  assert.equal(interpretation.summary, report.summary);
  assert.deepEqual(interpretation.insights, [
    '강점: 목 기운을 먼저 활용합니다.',
    '주의: 급한 결정은 줄입니다.',
  ]);
});
