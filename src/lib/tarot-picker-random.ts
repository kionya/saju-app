import type { TarotOrientation } from './tarot-api';

export interface TarotPickerCardInput {
  cardId: string;
}

export interface TarotPickerCardDraw {
  slot: number;
  cardId: string;
  orientation: TarotOrientation;
  backTone: TarotCardBackTone;
  backGlow: number;
  tilt: number;
  lift: number;
}

type RandomInt = (maxExclusive: number) => number;
export type TarotCardBackTone = (typeof CARD_BACK_TONES)[number];

const REVERSED_CHANCE_PERCENT = 22;
const UINT32_RANGE = 0x1_0000_0000;
const CARD_BACK_TONES = ['plum', 'indigo', 'jade', 'gold', 'rose'] as const;

export function createRandomTarotDrawDeck(
  cards: TarotPickerCardInput[],
  randomInt: RandomInt = getRandomInt
): TarotPickerCardDraw[] {
  const deck = cards.map((card) => {
    const orientation: TarotOrientation =
      randomInt(100) < REVERSED_CHANCE_PERCENT ? 'reversed' : 'upright';

    return {
      cardId: card.cardId,
      orientation,
      backTone: CARD_BACK_TONES[randomInt(CARD_BACK_TONES.length)] ?? 'plum',
      backGlow: randomInt(5),
      tilt: randomInt(9) - 4,
      lift: randomInt(7) - 3,
    };
  });

  for (let index = deck.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    const current = deck[index];
    const replacement = deck[swapIndex];

    if (!current || !replacement) {
      continue;
    }

    deck[index] = replacement;
    deck[swapIndex] = current;
  }

  return deck.map((card, index) => ({
    ...card,
    slot: index + 1,
  }));
}

export function pickRandomTarotCard(
  cards: TarotPickerCardDraw[],
  randomInt: RandomInt = getRandomInt
) {
  if (cards.length === 0) {
    return null;
  }

  return cards[randomInt(cards.length)] ?? cards[0] ?? null;
}

function getRandomInt(maxExclusive: number) {
  if (maxExclusive <= 0) {
    return 0;
  }

  if (globalThis.crypto?.getRandomValues) {
    const bucket = new Uint32Array(1);
    const limit = Math.floor(UINT32_RANGE / maxExclusive) * maxExclusive;
    let value = UINT32_RANGE;

    while (value >= limit) {
      globalThis.crypto.getRandomValues(bucket);
      value = bucket[0] ?? 0;
    }

    return value % maxExclusive;
  }

  return Math.floor(Math.random() * maxExclusive);
}
