import assert from 'node:assert/strict';
import { normalizeToSajuDataV1 } from '@/domain/saju/engine/saju-data-v1';
import { buildSajuInterpretationGrounding, buildSajuReport } from '@/domain/saju/report';
import type { BirthInput } from '@/lib/saju/types';
import { buildPersistedSajuReadingMetadata } from '@/lib/saju/report-metadata';
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
  const metadata = buildPersistedSajuReadingMetadata(birthInput, sajuData, grounding, null);
  const stored = createStoredReadingResultJson(sajuData, grounding, null, metadata);
  const normalizedAgain = normalizeToSajuDataV1(birthInput, stored);
  const envelope = extractPersistedReadingEnvelope(stored);

  assert.equal(normalizedAgain.pillars.day.ganzi, sajuData.pillars.day.ganzi);
  assert.equal(envelope._grounding?.factJson.dayMaster.stem, grounding.factJson.dayMaster.stem);
  assert.equal(envelope._grounding?.evidenceJson.primaryConcept, grounding.evidenceJson.primaryConcept);
  assert.equal(envelope._metadata?.engineVersion, sajuData.metadata.engineVersion);
  assert.equal(envelope._metadata?.ruleSetVersion, sajuData.metadata.ruleSetVersion);
  assert.equal(envelope._metadata?.birthInputSnapshot.hour, birthInput.hour ?? null);
});
