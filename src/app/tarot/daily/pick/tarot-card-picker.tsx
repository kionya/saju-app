'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shuffle, Sparkles } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useCallback, useEffect, useState, useTransition } from 'react';
import {
  createRandomTarotDrawDeck,
  pickRandomTarotCard,
  type TarotCardBackTone,
  type TarotPickerCardDraw,
  type TarotPickerCardInput,
} from '@/lib/tarot-picker-random';
import { cn } from '@/lib/utils';

interface TarotCardPickerProps {
  cards: TarotPickerCardInput[];
  question: string;
  sourceLabel: string;
}

const CARD_BACK_TONES: Record<
  TarotCardBackTone,
  {
    accent: string;
    border: string;
    background: string;
    light: string;
  }
> = {
  plum: {
    accent: 'rgba(210,176,114,0.78)',
    border: 'rgba(166,124,181,0.46)',
    background:
      'linear-gradient(160deg,rgba(166,124,181,0.92),rgba(31,29,57,0.96) 56%,rgba(11,14,29,0.98))',
    light: 'rgba(166,124,181,0.18)',
  },
  indigo: {
    accent: 'rgba(210,176,114,0.74)',
    border: 'rgba(99,123,188,0.42)',
    background:
      'linear-gradient(160deg,rgba(73,86,151,0.9),rgba(24,31,72,0.96) 58%,rgba(9,14,32,0.98))',
    light: 'rgba(99,123,188,0.18)',
  },
  jade: {
    accent: 'rgba(210,176,114,0.76)',
    border: 'rgba(121,178,139,0.4)',
    background:
      'linear-gradient(160deg,rgba(65,115,94,0.88),rgba(23,57,57,0.96) 58%,rgba(9,22,30,0.98))',
    light: 'rgba(121,178,139,0.16)',
  },
  gold: {
    accent: 'rgba(245,216,149,0.82)',
    border: 'rgba(210,176,114,0.48)',
    background:
      'linear-gradient(160deg,rgba(150,111,59,0.86),rgba(60,46,50,0.96) 56%,rgba(18,17,27,0.98))',
    light: 'rgba(210,176,114,0.17)',
  },
  rose: {
    accent: 'rgba(241,191,172,0.78)',
    border: 'rgba(211,129,103,0.42)',
    background:
      'linear-gradient(160deg,rgba(141,75,83,0.88),rgba(61,30,55,0.96) 58%,rgba(20,13,30,0.98))',
    light: 'rgba(211,129,103,0.16)',
  },
};

export function TarotCardPicker({ cards, question, sourceLabel }: TarotCardPickerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [drawDeck, setDrawDeck] = useState<TarotPickerCardDraw[] | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const reshuffleDeck = useCallback(() => {
    setSelectedCardId(null);
    setDrawDeck(createRandomTarotDrawDeck(cards));
  }, [cards]);

  useEffect(() => {
    reshuffleDeck();
  }, [reshuffleDeck]);

  const moveToResult = useCallback(
    (card: TarotPickerCardDraw) => {
      setSelectedCardId(card.cardId);

      startTransition(() => {
        router.push(buildResultHref(question, card));
      });
    },
    [question, router]
  );

  const handleRandomDraw = () => {
    const deck = drawDeck ?? createRandomTarotDrawDeck(cards);
    const card = pickRandomTarotCard(deck);

    if (!drawDeck) {
      setDrawDeck(deck);
    }

    if (card) {
      moveToResult(card);
    }
  };

  return (
    <article className="app-panel p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="app-caption">펼쳐진 덱</div>
          <h2 className="mt-3 font-[var(--font-heading)] text-3xl text-[var(--app-ivory)]">
            마음이 머무는 한 장
          </h2>
        </div>
        <span className="inline-flex h-5 w-fit items-center justify-center rounded-full border border-[var(--app-plum)]/25 bg-[var(--app-plum)]/10 px-2 text-xs font-medium text-[var(--app-plum)]">
          {sourceLabel}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleRandomDraw}
          disabled={isPending || cards.length === 0}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--app-plum)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[color:rgba(166,124,181,0.88)] disabled:pointer-events-none disabled:opacity-60"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          랜덤으로 한 장 뽑기
        </button>
        <button
          type="button"
          onClick={reshuffleDeck}
          disabled={isPending || cards.length === 0}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 text-sm text-[var(--app-ivory)] transition-colors hover:bg-[var(--app-surface-strong)] disabled:pointer-events-none disabled:opacity-60"
        >
          <Shuffle className="h-4 w-4" aria-hidden="true" />
          다시 섞기
        </button>
      </div>

      {drawDeck ? (
        <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 xl:grid-cols-10">
          {drawDeck.map((card) => {
            const selected = selectedCardId === card.cardId;
            const tone = CARD_BACK_TONES[card.backTone];

            return (
              <Link
                key={`${card.slot}-${card.cardId}-${card.orientation}`}
                href={buildResultHref(question, card)}
                aria-label={`${card.slot}번째 카드 뽑기`}
                onClick={() => setSelectedCardId(card.cardId)}
                style={getCardBackStyle(card, selected)}
                className={cn(
                  'group relative flex aspect-[7/10] min-h-[5.75rem] flex-col justify-between overflow-hidden rounded-[0.85rem] border p-2 text-left transition-[filter,transform,border-color] duration-200 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-gold)]/75',
                  selected && 'brightness-110'
                )}
              >
                <span
                  className="absolute inset-0 opacity-35"
                  style={{
                    backgroundImage:
                      'linear-gradient(135deg,transparent 0 42%,rgba(255,255,255,0.08) 43% 44%,transparent 45% 100%)',
                  }}
                />
                <span
                  className="absolute left-1/2 top-[18%] h-14 w-14 -translate-x-1/2 rounded-full blur-2xl"
                  style={{ backgroundColor: tone.light, opacity: 0.35 + card.backGlow * 0.08 }}
                />
                <span
                  className="relative text-[10px] font-semibold tracking-[0.18em]"
                  style={{ color: tone.accent }}
                >
                  {card.slot.toString().padStart(2, '0')}
                </span>
                <span
                  className="absolute inset-x-2 top-1/2 h-px -translate-y-1/2"
                  style={{ backgroundColor: tone.light }}
                />
                <span
                  className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-[rgba(8,10,18,0.18)] font-[var(--font-heading)] text-xl transition-colors group-hover:bg-[rgba(255,255,255,0.08)]"
                  style={{ borderColor: tone.border, color: tone.accent }}
                >
                  月
                </span>
                <span
                  className="relative self-end font-[var(--font-heading)] text-[10px] tracking-[0.2em]"
                  style={{ color: tone.accent }}
                >
                  DRAW
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 xl:grid-cols-10">
          {Array.from({ length: 20 }, (_, index) => (
            <div
              key={index}
              className="aspect-[7/10] min-h-[5.75rem] animate-pulse rounded-[0.85rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)]"
            />
          ))}
        </div>
      )}

      <p className="mt-5 text-center text-xs tracking-[0.22em] text-[var(--app-gold)]/72">
        직접 고르거나 랜덤 버튼으로 한 장을 뽑으세요
      </p>
    </article>
  );
}

function getCardBackStyle(card: TarotPickerCardDraw, selected: boolean): CSSProperties {
  const tone = CARD_BACK_TONES[card.backTone];

  return {
    background: tone.background,
    borderColor: selected ? 'rgba(210,176,114,0.82)' : tone.border,
    boxShadow: `0 12px 34px rgba(0,0,0,0.18), 0 0 ${10 + card.backGlow * 5}px ${tone.light}`,
    transform: `translateY(${card.lift}px) rotate(${card.tilt}deg)`,
  };
}

function buildResultHref(question: string, card: TarotPickerCardDraw) {
  const params = new URLSearchParams({
    question,
    cardId: card.cardId,
    orientation: card.orientation,
  });

  return `/tarot/daily/result?${params.toString()}`;
}
