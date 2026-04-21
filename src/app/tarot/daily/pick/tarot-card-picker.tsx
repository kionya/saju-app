'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shuffle, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useState, useTransition } from 'react';
import {
  createRandomTarotDrawDeck,
  pickRandomTarotCard,
  type TarotPickerCardDraw,
  type TarotPickerCardInput,
} from '@/lib/tarot-picker-random';
import { cn } from '@/lib/utils';

interface TarotCardPickerProps {
  cards: TarotPickerCardInput[];
  question: string;
  sourceLabel: string;
}

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
          {drawDeck.map((card) => (
            <Link
              key={`${card.slot}-${card.cardId}-${card.orientation}`}
              href={buildResultHref(question, card)}
              aria-label={`${card.slot}번째 카드 뽑기`}
              onClick={() => setSelectedCardId(card.cardId)}
              className={cn(
                'group relative flex aspect-[7/10] min-h-[5.75rem] flex-col justify-between overflow-hidden rounded-[0.85rem] border border-[var(--app-plum)]/40 bg-[linear-gradient(160deg,rgba(166,124,181,0.92),rgba(31,29,57,0.96)_56%,rgba(11,14,29,0.98))] p-2 text-left shadow-[0_12px_34px_rgba(0,0,0,0.18)] transition-transform duration-200 hover:-translate-y-1 hover:border-[var(--app-gold)]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-gold)]/75',
                selectedCardId === card.cardId && 'border-[var(--app-gold)]/80 brightness-110'
              )}
            >
              <span className="text-[10px] font-semibold tracking-[0.18em] text-[var(--app-gold)]/78">
                {card.slot.toString().padStart(2, '0')}
              </span>
              <span className="absolute inset-x-2 top-1/2 h-px -translate-y-1/2 bg-[var(--app-gold)]/18" />
              <span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--app-gold)]/38 bg-[rgba(210,176,114,0.1)] font-[var(--font-heading)] text-xl text-[var(--app-gold)] transition-colors group-hover:border-[var(--app-gold)]/75 group-hover:bg-[rgba(210,176,114,0.18)]">
                月
              </span>
              <span className="self-end font-[var(--font-heading)] text-[10px] tracking-[0.2em] text-[var(--app-gold)]/68">
                DRAW
              </span>
            </Link>
          ))}
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

function buildResultHref(question: string, card: TarotPickerCardDraw) {
  const params = new URLSearchParams({
    question,
    cardId: card.cardId,
    orientation: card.orientation,
  });

  return `/tarot/daily/result?${params.toString()}`;
}
