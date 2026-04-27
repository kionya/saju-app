import assert from 'node:assert/strict';
import { normalizeToSajuDataV1 } from '@/domain/saju/engine/saju-data-v1';
import { buildSajuInterpretationGrounding, buildSajuReport } from '@/domain/saju/report';
import type { BirthInput } from '@/lib/saju/types';
import {
  createStoredReadingResultJson,
  extractPersistedReadingEnvelope,
} from './readings';

declare const test: (name: string, fn: () => void) => void;

const birthInput: BirthInput = {
  year: 1982,
  month: 1,
  day: 29,
  hour: 8,
  gender: 'male',
};

test('stored reading result json can carry grounding without breaking saju normalization', () => {
  const sajuData = normalizeToSajuDataV1(birthInput, null);
  const report = buildSajuReport(birthInput, sajuData, 'today');
  const grounding = buildSajuInterpretationGrounding(birthInput, sajuData, report);
  const stored = createStoredReadingResultJson(sajuData, grounding, null);
  const normalizedAgain = normalizeToSajuDataV1(birthInput, stored);
  const envelope = extractPersistedReadingEnvelope(stored);

  assert.equal(normalizedAgain.pillars.day.ganzi, sajuData.pillars.day.ganzi);
  assert.equal(envelope._grounding?.factJson.dayMaster.stem, grounding.factJson.dayMaster.stem);
  assert.equal(envelope._grounding?.evidenceJson.primaryConcept, grounding.evidenceJson.primaryConcept);
});
