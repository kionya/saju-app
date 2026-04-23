import assert from 'node:assert/strict';
import {
  buildDialogueFallback,
  createSafetyResponse,
  parseAiRequest,
} from './route';
import {
  createAiChatBillingSummary,
  getAvailableCreditsTotal,
  shouldChargeAiChat,
} from '@/lib/credits/ai-chat-access';

declare const test: (name: string, fn: () => Promise<void> | void) => void;

test('dialogue fallback copy explains that fallback answers do not charge coins', () => {
  const text = buildDialogueFallback('오늘 관계운을 짧게 알려줘');

  assert.match(text, /기본 안내/);
  assert.match(text, /코인을 차감하지 않습니다/);
});

test('AI route blocks unsafe dialogue before fallback generation', async () => {
  const response = createSafetyResponse('죽고싶다는 생각이 들어');

  assert.ok(response);
  if (!response) return;

  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.ok, false);
  assert.equal(body.source, 'safe_redirect');
  assert.equal(body.redirectPath, '/dialogue/safe-redirect?category=crisis');
  assert.equal(body.billing.status, 'not_charged_safe_redirect');
});

test('AI route rejects malformed requests', () => {
  assert.equal(
    parseAiRequest({
      mode: 'dialogue',
      message: '',
    }),
    null
  );
  assert.equal(
    parseAiRequest({
      mode: 'unknown',
      message: '안녕',
    }),
    null
  );
});

test('ai chat billing policy charges only successful OpenAI replies', () => {
  assert.equal(shouldChargeAiChat('openai'), true);
  assert.equal(shouldChargeAiChat('fallback'), false);
  assert.equal(getAvailableCreditsTotal({ balance: 2, subscription_balance: 3 }), 5);

  assert.deepEqual(createAiChatBillingSummary('charged', 4), {
    feature: 'ai_chat',
    cost: 1,
    status: 'charged',
    remaining: 4,
  });
});
