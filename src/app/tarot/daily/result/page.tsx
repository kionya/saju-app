import Link from 'next/link';
import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import {
  TAROT_CARD_KEYWORDS,
  TAROT_CARD_READING_COPY,
  TAROT_TO_SAJU_BRIDGE,
} from '@/content/moonlight';
import SiteHeader from '@/features/shared-navigation/site-header';
import { getTarotCardForQuestion } from '@/lib/home-content';
import { AppShell } from '@/shared/layout/app-shell';

interface Props {
  searchParams: Promise<{ question?: string }>;
}

const DEFAULT_QUESTION = '지금 고민 중인 관계에 대하여';

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
  const { question } = await searchParams;
  const currentQuestion = question?.trim() || DEFAULT_QUESTION;
  const card = getTarotCardForQuestion(currentQuestion);
  const cardReading = TAROT_CARD_READING_COPY[card.name as keyof typeof TAROT_CARD_READING_COPY];
  const keywordCopy =
    TAROT_CARD_KEYWORDS.find(([name]) => name === card.name)?.[1] ??
    '지금의 흐름을 차분히 살피세요.';

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
            <div className="mx-auto flex h-[15rem] w-[10rem] flex-col justify-between rounded-[1rem] border-2 border-[var(--app-gold)]/60 bg-[linear-gradient(160deg,rgba(166,124,181,0.95),rgba(82,55,101,0.98))] px-4 py-5">
              <div className="font-[var(--font-heading)] text-xs tracking-[0.22em] text-[var(--app-gold)]">
                {cardReading.arcana}
              </div>
              <div className="font-[var(--font-heading)] text-5xl text-[var(--app-gold)]">月</div>
              <div className="font-[var(--font-heading)] text-[11px] tracking-[0.28em] text-[var(--app-gold)]">
                {card.name.toUpperCase()}
              </div>
            </div>
            <div className="mt-5 font-[var(--font-heading)] text-2xl text-[var(--app-ivory)]">
              {cardReading.title}
            </div>
            <p className="mt-2 text-sm text-[var(--app-copy-muted)]">
              {cardReading.arcana} · {cardReading.subtitle}
            </p>
            <div className="mt-4 rounded-[1.1rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-4 text-sm leading-7 text-[var(--app-copy)]">
              {keywordCopy}
            </div>
          </article>

          <article className="space-y-4">
            <div className="app-panel p-6">
              <div className="app-caption">카드가 건네는 말</div>
              <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
                {cardReading.guidance}
              </p>
            </div>

            <div className="rounded-[1.45rem] border border-[var(--app-gold)]/28 bg-[linear-gradient(135deg,rgba(210,176,114,0.12),rgba(10,18,36,0.94))] px-5 py-5">
              <div className="app-caption">선생님의 사주와 만나면</div>
              <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
                {cardReading.sajuBlend}
              </p>
            </div>

            <div className="rounded-[1.35rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 py-5">
              <div className="app-caption">이번 주 마음에 두실 한 가지</div>
              <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
                {cardReading.action}
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
