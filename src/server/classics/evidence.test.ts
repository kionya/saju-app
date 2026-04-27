import assert from 'node:assert/strict';
import { getClassicConceptForEvidenceKey } from './evidence';

declare const test: (name: string, fn: () => void) => void;

test('getClassicConceptForEvidenceKey maps evidence cards to real classic search concepts', () => {
  assert.equal(getClassicConceptForEvidenceKey('yongsin'), '용신');
  assert.equal(getClassicConceptForEvidenceKey('strength'), '강약');
  assert.equal(getClassicConceptForEvidenceKey('pattern'), '격국');
  assert.equal(getClassicConceptForEvidenceKey('relations'), '합충');
  assert.equal(getClassicConceptForEvidenceKey('gongmang'), '공망');
  assert.equal(getClassicConceptForEvidenceKey('specialSals'), '신살');
});
