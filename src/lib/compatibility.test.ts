import assert from 'node:assert/strict';
import {
  buildCompatibilityInterpretation,
  inferCompatibilityRelationshipSlug,
  resolveProfileDisplayName,
} from './compatibility';

declare const test: (name: string, fn: () => Promise<void> | void) => void;

test('compatibility infers broader relationship types from saved labels', () => {
  assert.equal(inferCompatibilityRelationshipSlug('배우자'), 'lover');
  assert.equal(inferCompatibilityRelationshipSlug('큰아들'), 'family');
  assert.equal(inferCompatibilityRelationshipSlug('친구'), 'friend');
  assert.equal(inferCompatibilityRelationshipSlug('회사 동료'), 'partner');
});

test('compatibility display name falls back to email local part', () => {
  assert.equal(resolveProfileDisplayName('  ', 'dalbit@example.com'), 'dalbit');
  assert.equal(resolveProfileDisplayName('', null), '선생님');
});

test('compatibility interpretation compares two saved people and emits evidence and data notes', () => {
  const result = buildCompatibilityInterpretation(
    'family',
    {
      name: '나',
      birthInput: {
        year: 1982,
        month: 1,
        day: 29,
        gender: 'male',
      },
    },
    {
      name: '큰아들',
      birthInput: {
        year: 2008,
        month: 7,
        day: 14,
        gender: 'male',
      },
    }
  );

  assert.match(result.headline, /나님과 큰아들님/);
  assert.ok(result.score >= 52 && result.score <= 92);
  assert.match(result.scoreLabel, /흐름/);
  assert.doesNotMatch(
    result.summary,
    /일간|일지|육합|천간합|반합|[甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥]/
  );
  assert.ok(result.evidence.length >= 4);
  assert.equal(result.practicalCards.length, 4);
  assert.deepEqual(
    result.practicalCards.map((card) => card.key),
    ['conflict', 'communication', 'money', 'distance']
  );
  assert.match(result.relationshipLensBody, /말의 무게|가족/);
  assert.match(result.practicalCards[1]?.eyebrow ?? '', /대화 방식/);
  assert.match(result.dataNote ?? '', /태어난 시간이|출생지/);
});
