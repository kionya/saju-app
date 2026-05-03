import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createInitialOnboardingDraft,
  hasCompleteRecentGuestInput,
  shouldAutoSavePersonalProfile,
} from './onboarding-storage';

test('initial onboarding draft starts in manual profile mode', () => {
  const draft = createInitialOnboardingDraft();

  assert.equal(draft.loadedProfileSource, 'manual');
});

test('family profile source never auto-saves into my personal profile', () => {
  assert.equal(shouldAutoSavePersonalProfile('family'), false);
  assert.equal(shouldAutoSavePersonalProfile('manual'), true);
  assert.equal(shouldAutoSavePersonalProfile('self'), true);
});

test('recent guest input is complete only after core birth fields are present', () => {
  const draft = createInitialOnboardingDraft();

  assert.equal(hasCompleteRecentGuestInput(draft), false);

  draft.year = '1982';
  draft.month = '1';
  draft.day = '29';
  draft.gender = 'male';
  draft.birthLocationCode = 'seoul';

  assert.equal(hasCompleteRecentGuestInput(draft), true);
});
