import assert from 'node:assert/strict';
import { normalizeToSajuDataV1 } from '@/domain/saju/engine/saju-data-v1';
import { buildSajuReport } from '@/domain/saju/report';
import type { BirthInput } from '@/lib/saju/types';

declare const test: (name: string, fn: () => void) => void;

const birthInput: BirthInput = {
  year: 1982,
  month: 1,
  day: 29,
  hour: 8,
  gender: 'male',
};

test('saju report exposes classical citation cards as non-verbatim source guidance', () => {
  const data = normalizeToSajuDataV1(birthInput, null);
  const report = buildSajuReport(birthInput, data, 'today');

  assert.ok(report.classicalCitations.length >= 3);
  assert.ok(report.classicalCitations.some((citation) => citation.sourceTitle === '궁통보감'));
  assert.ok(report.classicalCitations.some((citation) => citation.sourceTitle === '적천수'));
  assert.ok(report.classicalCitations.every((citation) => citation.statusLabel === 'RAG 연결 전 기준 요약'));
  assert.ok(
    report.classicalCitations.every((citation) =>
      citation.sourceNote.includes('원문 직접 인용 전 단계')
    )
  );
});

test('classical citation cards stay linked to visible evidence cards', () => {
  const data = normalizeToSajuDataV1(birthInput, null);
  const report = buildSajuReport(birthInput, data, 'relationship');
  const evidenceKeys = new Set(report.evidenceCards.map((card) => card.key));

  assert.ok(
    report.classicalCitations.every((citation) =>
      citation.matchedEvidenceKeys.every((key) => evidenceKeys.has(key))
    )
  );
});
