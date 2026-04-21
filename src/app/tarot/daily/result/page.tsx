import Link from 'next/link';
import type { Metadata } from 'next';
import { TarotCardArtwork } from '@/components/tarot/tarot-card-artwork';
import { Badge } from '@/components/ui/badge';
import { TAROT_CARD_KEYWORDS, TAROT_TO_SAJU_BRIDGE } from '@/content/moonlight';
import SiteHeader from '@/features/shared-navigation/site-header';
import {
  getTarotReadingForQuestion,
  getTarotSpreadForQuestion,
  normalizeQuestion,
} from '@/lib/tarot-api';
import { AppShell } from '@/shared/layout/app-shell';

interface Props {
  searchParams: Promise<{
    question?: string;
    cardId?: string;
    orientation?: string;
  }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '타로 결과',
    description: '카드 의미와 사주 연결 해석을 함께 보여주는 달빛선생의 타로 결과 화면입니다.',
    alternates: {
      canonical: '/tarot/daily/result',
    },
  };
}

export default async function TarotResultPage({ searchParams }: Props) {
  const { question, cardId, orientation } = await searchParams;
  const currentQuestion = normalizeQuestion(question);
  const reading = await getTarotReadingForQuestion({
    question: currentQuestion,
    cardId,
    orientation,
  });
  const premiumSpread = await getTarotSpreadForQuestion(currentQuestion);
  const sourceLabel = reading.source === 'api' ? '78장 덱 기준' : '로컬 덱 기준';

  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-12">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="app-hero-card p-7 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href={{
                pathname: '/tarot/daily/pick',
                query: { question: currentQuestion },
              }}
              className="text-sm text-[var(--app-plum)] transition-colors hover:text-[var(--app-ivory)]"
            >
              ← 다시 뽑기
            </Link>
            <Badge className="border-[var(--app-plum)]/25 bg-[var(--app-plum)]/10 text-[var(--app-plum)]">
              T03 · READING
            </Badge>
          </div>
          <div className="mt-6 max-w-3xl">
            <div className="app-caption">오늘의 질문</div>
            <h1 className="mt-3 font-[var(--font-heading)] text-4xl text-[var(--app-ivory)] sm:text-5xl">
              {currentQuestion}
            </h1>
            <p className="mt-4 text-base leading-8 text-[var(--app-copy)]">
              카드가 전하는 순간의 메시지와 사주 흐름을 한 문장으로 겹쳐 읽어드립니다.
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <article className="app-panel p-6 text-center">
            <TarotCardArtwork
              cardId={reading.card.name_short}
              shortName={reading.shortName}
              displayName={reading.displayName}
              cardMarker={reading.cardMarker}
              orientation={reading.orientation}
              orientationLabel={reading.orientationLabel}
              arcanaLabel={reading.arcanaLabel}
            />
            <div className="mt-5 font-[var(--font-heading)] text-2xl text-[var(--app-ivory)]">
              {reading.displayName}
            </div>
            <p className="mt-2 text-sm text-[var(--app-copy-muted)]">
              {reading.arcanaLabel} · {reading.subtitle}
            </p>
            <div className="mt-4 rounded-[1.1rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-4 text-sm leading-7 text-[var(--app-copy)]">
              {reading.keyword}
            </div>
            <div className="mt-4 text-xs tracking-[0.18em] text-[var(--app-copy-soft)]">
              {sourceLabel}
            </div>
          </article>

          <article className="space-y-4">
            <div className="app-panel p-6">
              <div className="app-caption">카드가 건네는 말</div>
              <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">{reading.guidance}</p>
            </div>

            <div className="rounded-[1.45rem] border border-[var(--app-gold)]/28 bg-[linear-gradient(135deg,rgba(210,176,114,0.12),rgba(10,18,36,0.94))] px-5 py-5">
              <div className="app-caption">선생님의 사주와 만나면</div>
              <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
                {reading.sajuBlend}
              </p>
            </div>

            <div className="rounded-[1.35rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 py-5">
              <div className="app-caption">이번 주 마음에 두실 한 가지</div>
              <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">{reading.action}</p>
            </div>

            <div className="rounded-[1.35rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 py-5">
              <div className="app-caption">원문 카드 의미</div>
              <p className="mt-4 text-sm leading-8 text-[var(--app-copy-muted)]">
                {reading.meaningExcerpt}
              </p>
            </div>

            <div className="rounded-[1.45rem] border border-[var(--app-plum)]/24 bg-[linear-gradient(135deg,rgba(166,124,181,0.12),rgba(10,18,36,0.92))] px-5 py-5">
              <div className="app-caption">타로 뒤에 사주를 붙이면</div>
              <div className="mt-4 space-y-3">
                {TAROT_TO_SAJU_BRIDGE.map((item) => (
                  <p key={item} className="text-sm leading-7 text-[var(--app-copy)]">
                    {item}
                  </p>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/saju/new"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-gold)] px-6 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-bright)]"
              >
                내 사주와 겹쳐 읽기
              </Link>
              <Link
                href="/membership"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-plum)]/35 bg-[var(--app-plum)]/12 px-6 text-sm text-[var(--app-plum)] transition-colors hover:bg-[var(--app-plum)]/18"
              >
                심층 해석 플랜 보기
              </Link>
              <Link
                href="/dialogue"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-6 text-sm text-[var(--app-ivory)] transition-colors hover:bg-[var(--app-surface-strong)]"
              >
                달빛선생께 더 여쭙기
              </Link>
            </div>
          </article>
        </section>

        <section className="mt-8 app-panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-[var(--font-heading)] text-3xl text-[var(--app-ivory)]">
              프리미엄 3장 확장 흐름
            </h2>
            <Badge className="border-[var(--app-plum)]/25 bg-[var(--app-plum)]/10 text-[var(--app-plum)]">
              사주 + 타로 통합
            </Badge>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {premiumSpread.map(({ position, reading: spreadReading }) => (
              <article
                key={position}
                className="rounded-[1.2rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-4"
              >
                <div className="text-xs tracking-[0.22em] text-[var(--app-copy-soft)]">
                  {position}
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-12 w-9 shrink-0 items-center justify-center rounded-[0.65rem] border border-[var(--app-gold)]/45 bg-[rgba(166,124,181,0.22)] font-[var(--font-heading)] text-[var(--app-gold)]">
                    {spreadReading.cardMarker}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-[var(--font-heading)] text-lg text-[var(--app-ivory)]">
                      {spreadReading.displayName}
                    </div>
                    <p className="mt-1 text-xs text-[var(--app-copy-soft)]">
                      {spreadReading.orientationLabel}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--app-copy-muted)]">
                  {spreadReading.action}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 app-panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-[var(--font-heading)] text-3xl text-[var(--app-ivory)]">
              타로 카드 주요 키워드
            </h2>
            <Badge className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]">
              긍정적 재해석 유지
            </Badge>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {TAROT_CARD_KEYWORDS.map(([name, copy]) => (
              <article
                key={name}
                className="rounded-[1.2rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-4"
              >
                <div className="font-[var(--font-heading)] text-lg text-[var(--app-ivory)]">
                  {name}
                </div>
                <p className="mt-2 text-sm leading-7 text-[var(--app-copy-muted)]">{copy}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
