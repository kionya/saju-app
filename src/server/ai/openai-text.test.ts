import assert from 'node:assert/strict';
import {
  getOpenAIInterpretationModel,
  getOpenAIModel,
} from './openai-text';

declare const test: (name: string, fn: () => void) => void;

function withEnv(key: string, value: string | undefined, fn: () => void) {
  const previous = process.env[key];

  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }

  try {
    fn();
  } finally {
    if (previous === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = previous;
    }
  }
}

test('OpenAI model defaults keep dialogue on gpt-5.2 and interpretation on gpt-5.2-chat-latest', () => {
  withEnv('OPENAI_MODEL', undefined, () => {
    withEnv('OPENAI_INTERPRET_MODEL', undefined, () => {
      assert.equal(getOpenAIModel(), 'gpt-5.2');
      assert.equal(getOpenAIInterpretationModel(), 'gpt-5.2-chat-latest');
    });
  });
});

test('OpenAI env overrides still take precedence when explicitly provided', () => {
  withEnv('OPENAI_MODEL', 'gpt-5.2', () => {
    withEnv('OPENAI_INTERPRET_MODEL', 'gpt-5.2', () => {
      assert.equal(getOpenAIModel(), 'gpt-5.2');
      assert.equal(getOpenAIInterpretationModel(), 'gpt-5.2');
    });
  });
});
