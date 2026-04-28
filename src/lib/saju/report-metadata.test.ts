import assert from 'node:assert/strict';
import { normalizeToSajuDataV1 } from '@/domain/saju/engine/saju-data-v1';
import { buildSajuInterpretationGrounding, buildSajuReport } from '@/domain/saju/report';
import type { BirthInput } from '@/lib/saju/types';
import {
  buildPersistedSajuReadingMetadata,
  buildSajuReportRuntimeMetadata,
} from './report-metadata';

declare const test: (name: string, fn: () => void) => void;

const birthInput: BirthInput = {
  year: 1982,
  month: 1,
  day: 29,
  hour: 8,
  gender: 'male',
};

test('report metadata keeps normalized engine and rule-set versions around reading persistence', () => {
  const sajuData = normalizeToSajuDataV1(birthInput, null);
  const report = buildSajuReport(birthInput, sajuData, 'today');
  const grounding = buildSajuInterpretationGrounding(birthInput, sajuData, report);
  const metadata = buildPersistedSajuReadingMetadata(birthInput, sajuData, grounding, null);

  assert.equal(metadata.engineVersion, sajuData.metadata.engineVersion);
  assert.equal(metadata.ruleSetVersion, sajuData.metadata.ruleSetVersion);
  assert.equal(metadata.factSchemaVersion, grounding.factJson.schemaVersion);
  assert.equal(metadata.evidenceSchemaVersion, grounding.evidenceJson.schemaVersion);
  assert.equal(metadata.generatedAt, sajuData.metadata.calculatedAt);
  assert.equal(metadata.verification.kasiCompared, false);
});

test('report metadata can be extended with prompt and model information for UI responses', () => {
  const sajuData = normalizeToSajuDataV1(birthInput, null);
  const report = buildSajuReport(birthInput, sajuData, 'today');
  const grounding = buildSajuInterpretationGrounding(birthInput, sajuData, report);
  const metadata = buildPersistedSajuReadingMetadata(birthInput, sajuData, grounding, null);
  const runtime = buildSajuReportRuntimeMetadata(metadata, {
    promptVersion: 'prompt/v1',
    llmModel: 'gpt-5.2-chat-latest',
    generationSource: 'openai',
  });

  assert.equal(runtime.promptVersion, 'prompt/v1');
  assert.equal(runtime.llmModel, 'gpt-5.2-chat-latest');
  assert.equal(runtime.generationSource, 'openai');
  assert.equal(runtime.decisionTrace, undefined);
});
