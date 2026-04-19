import assert from 'node:assert/strict';
import { POST } from './route';

declare const test: (name: string, fn: () => Promise<void>) => void;

function jsonRequest(payload: unknown) {
  return new Request('http://localhost/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

test('AI route returns fallback dialogue response when OpenAI is not configured', async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;

  try {
    const response = await POST(jsonRequest({
      mode: 'dialogue',
      message: '오늘 관계운을 짧게 알려줘',
    }) as never);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(body.source, 'fallback');
    assert.equal(body.fallbackReason, 'ai_not_configured');
    assert.match(body.text, /기본 안내/);
  } finally {
    if (previousKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = previousKey;
    }
  }
});

test('AI route blocks unsafe dialogue before fallback generation', async () => {
  const response = await POST(jsonRequest({
    mode: 'dialogue',
    message: '죽고싶다는 생각이 들어',
  }) as never);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.ok, false);
  assert.equal(body.source, 'safe_redirect');
  assert.equal(body.redirectPath, '/dialogue/safe-redirect?category=crisis');
});

test('AI route rejects malformed requests', async () => {
  const response = await POST(jsonRequest({
    mode: 'dialogue',
    message: '',
  }) as never);
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.ok, false);
  assert.match(body.error, /요청 형식/);
});
