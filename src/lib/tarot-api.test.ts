import assert from 'node:assert/strict';
import {
  getTarotDeck,
  getTarotReadingForQuestion,
  type TarotApiCard,
} from './tarot-api';

declare const test: (name: string, fn: () => void | Promise<void>) => void;

const originalFetch = globalThis.fetch;

function buildApiCard(index: number): TarotApiCard {
  return {
    type: 'major',
    name_short: `m${index}`,
    name: index === 0 ? 'The Fool' : `Card ${index}`,
    value: String(index),
    value_int: index,
    meaning_up: `upright meaning ${index}`,
    meaning_rev: `reversed meaning ${index}`,
    desc: `description ${index}`,
  };
}

function mockFetch(handler: typeof fetch) {
  globalThis.fetch = handler;
}

function restoreFetch() {
  globalThis.fetch = originalFetch;
}

test('tarot deck uses the external API when it returns 78 normalized cards', async () => {
  const cards = Array.from({ length: 78 }, (_, index) => buildApiCard(index));

  mockFetch(
    (async () =>
      ({
        ok: true,
        json: async () => ({ cards }),
      }) as Response) as typeof fetch
  );

  try {
    const deck = await getTarotDeck();

    assert.equal(deck.source, 'api');
    assert.equal(deck.cards.length, 78);
    assert.equal(deck.cards[0]?.name, 'The Fool');
  } finally {
    restoreFetch();
  }
});

test('tarot deck falls back to the local 78-card deck when the external API fails', async () => {
  mockFetch(
    (async () => {
      throw new Error('network unavailable');
    }) as typeof fetch
  );

  try {
    const deck = await getTarotDeck();

    assert.equal(deck.source, 'local');
    assert.equal(deck.cards.length, 78);
  } finally {
    restoreFetch();
  }
});

test('tarot deck falls back when the external API returns the wrong card count', async () => {
  mockFetch(
    (async () =>
      ({
        ok: true,
        json: async () => ({ cards: [buildApiCard(0)] }),
      }) as Response) as typeof fetch
  );

  try {
    const deck = await getTarotDeck();

    assert.equal(deck.source, 'local');
    assert.equal(deck.cards.length, 78);
  } finally {
    restoreFetch();
  }
});

test('tarot API fetch uses a timeout signal when the runtime supports it', async () => {
  let receivedSignal: AbortSignal | null = null;
  const cards = Array.from({ length: 78 }, (_, index) => buildApiCard(index));

  mockFetch(
    (async (_input, init) => {
      receivedSignal = init?.signal instanceof AbortSignal ? init.signal : null;

      return {
        ok: true,
        json: async () => ({ cards }),
      } as Response;
    }) as typeof fetch
  );

  try {
    await getTarotDeck();

    assert.ok(receivedSignal);
  } finally {
    restoreFetch();
  }
});

test('tarot reading stays stable for the same question on the same day', async () => {
  mockFetch(
    (async () => {
      throw new Error('network unavailable');
    }) as typeof fetch
  );

  try {
    const first = await getTarotReadingForQuestion({
      question: '지금 결정해야 할 선택에 대하여',
    });
    const second = await getTarotReadingForQuestion({
      question: '지금 결정해야 할 선택에 대하여',
    });

    assert.equal(first.card.name_short, second.card.name_short);
    assert.equal(first.orientation, second.orientation);
  } finally {
    restoreFetch();
  }
});
