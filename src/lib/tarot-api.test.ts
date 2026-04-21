import assert from 'node:assert/strict';
import {
  getTarotDeck,
  getTarotPickerDeck,
  getTarotReadingForQuestion,
  type TarotApiCard,
} from './tarot-api';
import { createRandomTarotDrawDeck, pickRandomTarotCard } from './tarot-picker-random';

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

test('tarot picker exposes a stable full deck for direct card selection', async () => {
  mockFetch(
    (async () => {
      throw new Error('network unavailable');
    }) as typeof fetch
  );

  try {
    const first = await getTarotPickerDeck('지금 결정해야 할 선택에 대하여');
    const second = await getTarotPickerDeck('지금 결정해야 할 선택에 대하여');

    assert.equal(first.cards.length, 78);
    assert.equal(new Set(first.cards.map(({ card }) => card.name_short)).size, 78);
    assert.deepEqual(
      first.cards.map(({ card, orientation }) => `${card.name_short}:${orientation}`),
      second.cards.map(({ card, orientation }) => `${card.name_short}:${orientation}`)
    );
    assert.ok(
      first.cards.every(
        ({ orientation }) => orientation === 'upright' || orientation === 'reversed'
      )
    );
  } finally {
    restoreFetch();
  }
});

test('tarot client picker can randomize card order and orientations', () => {
  const cards = ['ar00', 'ma01', 'cu02', 'sw03'].map((cardId) => ({ cardId }));
  const randomized = createRandomTarotDrawDeck(cards, () => 0);

  assert.deepEqual(
    randomized.map(({ slot }) => slot),
    [1, 2, 3, 4]
  );
  assert.equal(new Set(randomized.map(({ cardId }) => cardId)).size, 4);
  assert.ok(randomized.every(({ orientation }) => orientation === 'reversed'));
  assert.notDeepEqual(
    randomized.map(({ cardId }) => cardId),
    cards.map(({ cardId }) => cardId)
  );
});

test('tarot random draw picks one card from the visible deck', () => {
  const deck = createRandomTarotDrawDeck(
    ['ar00', 'ma01', 'cu02'].map((cardId) => ({ cardId })),
    () => 0
  );
  const picked = pickRandomTarotCard(deck, () => 1);

  assert.equal(picked?.cardId, deck[1]?.cardId);
});
