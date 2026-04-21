import Link from 'next/link';
import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import SiteHeader from '@/features/shared-navigation/site-header';
import {
  getTarotPickerDeck,
  getTarotSpreadForQuestion,
  normalizeQuestion,
} from '@/lib/tarot-api';
import { AppShell } from '@/shared/layout/app-shell';
import { TarotCardPicker } from './tarot-card-picker';

interface Props {
  searchParams: Promise<{ question?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '타로 카드 뽑기',
    description: '질문을 품고 카드를 선택하는 달빛선생의 타로 카드 뽑기 화면입니다.',
    alternates: {
      canonical: '/tarot/daily/pick',
    },
  };
}

export default async function TarotPickPage({ searchParams }: Props) {
  const { question } = await searchParams;
  const currentQuestion = normalizeQuestion(question);
  const pickerDeck = await getTarotPickerDeck(currentQuestion);
  const premiumSpread = await getTarotSpreadForQuestion(currentQuestion);
  const sourceLabel = pickerDeck.source === 'api' ? '외부 78장 덱' : '로컬 78장 덱';
  const pickerCards = pickerDeck.cards.map(({ card }) => ({ cardId: card.name_short }));

  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-12">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="app-hero-card p-7 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/tarot/daily"
              className="text-sm text-[var(--app-plum)] transition-colors hover:text-[var(--app-ivory)]"
            >
              ← 질문 다시 고르기
            </Link>
            <Badge className="border-[var(--app-plum)]/25 bg-[var(--app-plum)]/10 text-[var(--app-plum)]">
              T02 · CARD PICKING
            </Badge>
          </div>
          <div className="mt-8 text-center">
            <h1 className="font-[var(--font-heading)] text-4xl text-[var(--app-ivory)] sm:text-5xl">
              카드 뽑기
            </h1>
            <div className="text-sm text-[var(--app-plum)]">“{currentQuestion}”</div>
            <p className="mt-2 text-sm text-[var(--app-copy-muted)]">
              오늘의 덱은 {pickerDeck.toneLabel}으로 차분히 섞어두었습니다
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
          <article className="app-panel p-6">
            <div className="app-caption">카드를 뽑기 전에</div>
            <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
              한 번에 정답을 찾으려 하기보다, 지금 내 마음이 어디로 기울고 있는지를
              차분히 살피는 마음으로 카드를 고르시면 좋습니다.
            </p>

            <div className="mt-5 rounded-[1.2rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-4">
              <div className="text-xs tracking-[0.22em] text-[var(--app-copy-soft)]">QUESTION</div>
              <div className="mt-3 font-[var(--font-heading)] text-2xl text-[var(--app-ivory)]">
                {currentQuestion}
              </div>
            </div>

            <div className="mt-5 rounded-[1.2rem] border border-[var(--app-plum)]/25 bg-[linear-gradient(135deg,rgba(166,124,181,0.12),rgba(10,18,36,0.9))] px-4 py-4 text-sm leading-7 text-[var(--app-copy)]">
              화면이 열리면 덱이 새로 섞입니다. 직접 한 장을 고르거나 랜덤 버튼으로 한 장을
              뽑으면 그 카드의 이름과 방향으로 리딩이 이어집니다.
            </div>

            <div className="mt-5 rounded-[1.2rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-4">
              <div className="text-xs tracking-[0.22em] text-[var(--app-copy-soft)]">
                PREMIUM SPREAD
              </div>
              <div className="mt-3 grid gap-2">
                {premiumSpread.map(({ position }) => (
                  <div
                    key={position}
                    className="rounded-[0.9rem] border border-[var(--app-line)] px-3 py-2 text-sm text-[var(--app-copy)]"
                  >
                    {position}
                  </div>
                ))}
              </div>
            </div>
          </article>

          <TarotCardPicker
            cards={pickerCards}
            question={currentQuestion}
            sourceLabel={sourceLabel}
          />
        </section>
      </div>
    </AppShell>
  );
}
