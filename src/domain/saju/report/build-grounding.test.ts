import assert from 'node:assert/strict';
import { normalizeToSajuDataV1 } from '@/domain/saju/engine/saju-data-v1';
import {
  buildSajuInterpretationGrounding,
  buildSajuReport,
  SAJU_EVIDENCE_JSON_V1,
  SAJU_FACT_JSON_V1,
} from '@/domain/saju/report';
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

test('buildSajuInterpretationGrounding creates fact_json and evidence_json from the same saju data', () => {
  const data = normalizeToSajuDataV1(birthInput, null);
  const report = buildSajuReport(birthInput, data, 'today');
  const grounding = buildSajuInterpretationGrounding(birthInput, data, report);

  assert.equal(grounding.factJson.schemaVersion, SAJU_FACT_JSON_V1);
  assert.equal(grounding.evidenceJson.schemaVersion, SAJU_EVIDENCE_JSON_V1);
  assert.equal(grounding.factJson.pillars.day.ganzi, data.pillars.day.ganzi);
  assert.equal(grounding.factJson.dayMaster.stem, data.dayMaster.stem);
  assert.equal(grounding.factJson.fiveElements.dominant, data.fiveElements.dominant);
  assert.equal(grounding.evidenceJson.strength.level, data.strength?.level ?? null);
  assert.equal(grounding.evidenceJson.pattern.name, data.pattern?.name ?? null);
  assert.equal(
    grounding.evidenceJson.yongsin.primary,
    data.yongsin?.primary ? `${data.yongsin.primary.label}(${data.yongsin.primary.value})` : null
  );
  assert.ok(grounding.evidenceJson.classics.cards.length > 0);
  assert.ok(grounding.evidenceJson.classics.cards.some((card) => card.key === 'yongsin'));
});
