import assert from 'node:assert/strict';
import { detectSafeRedirect } from './safe-redirect';

declare const test: (name: string, fn: () => void) => void;

test('SAFE_REDIRECT blocks Korean crisis intent with spacing variations', () => {
  const result = detectSafeRedirect('요즘 너무 힘들어서 죽고 싶다는 생각이 들어요');

  assert.equal(result.category, 'crisis');
  assert.equal(result.shouldRedirect, true);
  assert.equal(result.shouldBlockResponse, true);
  assert.equal(result.redirectPath, '/dialogue/safe-redirect?category=crisis');
});

test('SAFE_REDIRECT blocks urgent medical requests', () => {
  const result = detectSafeRedirect('가슴 통증이 있는데 응급실 가야 하나요?');

  assert.equal(result.category, 'medical');
  assert.equal(result.resourceCategory, 'medical');
  assert.equal(result.shouldBlockResponse, true);
});

test('SAFE_REDIRECT blocks fortune-based investment decisions', () => {
  const result = detectSafeRedirect('오늘 코인 사야 하는지 운세로 알려줘');

  assert.equal(result.category, 'financial');
  assert.equal(result.resourceCategory, 'financial');
  assert.equal(result.shouldBlockResponse, true);
});

test('SAFE_REDIRECT allows normal fortune questions', () => {
  const result = detectSafeRedirect('오늘 연애운과 관계운이 궁금해요');

  assert.equal(result.category, null);
  assert.equal(result.shouldRedirect, false);
  assert.equal(result.shouldBlockResponse, false);
});
