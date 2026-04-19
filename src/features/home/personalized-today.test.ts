import assert from 'node:assert/strict';
import {
  buildHomePersonalizationCopy,
  buildPersonalizedTodaySummary,
  type HomeProfilePreview,
} from './personalized-today';

declare const test: (name: string, fn: () => void) => void;

const fixedDate = new Date('2026-04-19T09:00:00+09:00');

test('home today summary falls back to default flow without saved birth profile', () => {
  const summary = buildPersonalizedTodaySummary(null, fixedDate);

  assert.equal(summary.length, 3);
  assert.equal(summary[0]?.label, '재물');
  assert.ok(summary.every((item) => item.detail.includes('기본 흐름')));

  const copy = buildHomePersonalizationCopy({ authenticated: false, profile: null }, 'ready');
  assert.equal(copy.isPersonalized, false);
  assert.equal(copy.ctaHref, '/login?next=/');
});

test('home today summary becomes personalized when saved birth profile is complete', () => {
  const profilePreview: HomeProfilePreview = {
    authenticated: true,
    profile: {
      displayName: '길동',
      birthYear: 1982,
      birthMonth: 1,
      birthDay: 29,
      birthHour: 8,
      gender: 'male',
    },
  };

  const summary = buildPersonalizedTodaySummary(profilePreview, fixedDate);
  const copy = buildHomePersonalizationCopy(profilePreview, 'ready');

  assert.equal(copy.isPersonalized, true);
  assert.match(copy.title, /길동/);
  assert.deepEqual(summary.map((item) => item.label), ['재물', '컨디션', '관계']);
  assert.ok(summary.every((item) => item.ratio >= 42 && item.ratio <= 92));
  assert.ok(summary.some((item) => item.detail.includes('8시')));
});
