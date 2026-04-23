import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createInitialOnboardingDraft,
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
