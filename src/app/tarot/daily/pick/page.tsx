import Link from 'next/link';
import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import SiteHeader from '@/features/shared-navigation/site-header';
import {
  getTarotReadingForQuestion,
  getTarotSpreadForQuestion,
  normalizeQuestion,
} from '@/lib/tarot-api';
import { AppShell } from '@/shared/layout/app-shell';

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
  const reading = await getTarotReadingForQuestion({ question: currentQuestion });
  const premiumSpread = await getTarotSpreadForQuestion(currentQuestion);

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
              오늘의 덱은 {reading.toneLabel}으로 차분히 섞어두었습니다
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
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
              같은 질문은 오늘 하루 같은 카드로 이어집니다. 새로고침을 해도 결과가 흔들리지
              않도록 날짜와 질문을 함께 읽어 한 장을 정합니다.
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

          <article className="app-panel p-6">
            <div className="relative mx-auto flex h-[20rem] max-w-md items-end justify-center">
              {[-96, -64, -32].map((offset, index) => (
                <div
                  key={`left-${offset}`}
                  className="absolute bottom-4 h-32 w-[4.5rem] rounded-[0.8rem] border border-[var(--app-plum)]/45 bg-[linear-gradient(180deg,rgba(166,124,181,0.96),rgba(20,24,44,0.92))]"
                  style={{
                    transform: `translateX(${offset}px) rotate(${(-26 + index * 8).toString()}deg)`,
                    opacity: 0.72 + index * 0.08,
                  }}
                />
              ))}
              <div className="absolute bottom-7 z-10 flex h-40 w-28 items-center justify-center rounded-[1rem] border-2 border-[var(--app-gold)]/70 bg-[linear-gradient(180deg,rgba(210,176,114,0.94),rgba(166,124,181,0.88))] shadow-[0_0_36px_rgba(210,176,114,0.18)]">
                <div className="font-[var(--font-heading)] text-5xl text-[var(--app-bg)]">月</div>
              </div>
              {[32, 64, 96].map((offset, index) => (
                <div
                  key={`right-${offset}`}
                  className="absolute bottom-4 h-32 w-[4.5rem] rounded-[0.8rem] border border-[var(--app-plum)]/45 bg-[linear-gradient(180deg,rgba(166,124,181,0.96),rgba(20,24,44,0.92))]"
                  style={{
                    transform: `translateX(${offset}px) rotate(${(10 + index * 8).toString()}deg)`,
                    opacity: 0.9 - index * 0.08,
                  }}
                />
              ))}
            </div>

            <p className="mt-3 text-center text-xs tracking-[0.22em] text-[var(--app-gold)]/72">
              마음에 닿는 한 장을 천천히 선택해주세요
            </p>

            <div className="mt-8 flex justify-center">
              <Link
                href={{
                  pathname: '/tarot/daily/result',
                  query: {
                    question: currentQuestion,
                    cardId: reading.card.name_short,
                    orientation: reading.orientation,
                  },
                }}
                className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--app-plum)] px-8 text-base font-semibold text-white transition-colors hover:bg-[color:rgba(166,124,181,0.88)]"
              >
                이 카드를 뽑겠습니다
              </Link>
            </div>
          </article>
        </section>
      </div>
    </AppShell>
  );
}
