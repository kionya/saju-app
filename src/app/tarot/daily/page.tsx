import Link from 'next/link';
import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import {
  TAROT_CARD_KEYWORDS,
  TAROT_QUESTION_OPTIONS,
} from '@/content/moonlight';
import SiteHeader from '@/features/shared-navigation/site-header';
import { getCardOfTheDay } from '@/lib/home-content';
import { AppShell } from '@/shared/layout/app-shell';

export const metadata: Metadata = {
  title: '타로',
  description:
    '질문을 고르고 카드 뽑기 화면으로 이어지는 달빛선생의 오늘의 타로 메인 화면입니다.',
  alternates: {
    canonical: '/tarot/daily',
  },
};

export default function DailyTarotPage() {
  const featuredCard = getCardOfTheDay();
  const featuredCopy =
    TAROT_CARD_KEYWORDS.find(([name]) => name === featuredCard.name)?.[1] ??
    '지금 이 순간의 흐름을 차분히 살펴보세요.';

  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-12">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="app-hero-card p-7 sm:p-8">
          <div className="text-center">
            <div className="text-[11px] tracking-[0.5em] text-[var(--app-plum)]">塔 羅</div>
            <h1 className="mt-4 font-[var(--font-heading)] text-4xl font-semibold text-[var(--app-plum)] sm:text-5xl">
              타로
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[var(--app-copy)]">
              마음속에 질문을 품고 한 장을 뽑아보세요. 지금 이 순간의 에너지를 한 장의
              그림과 달빛선생의 차분한 말로 이어드립니다.
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <article className="app-panel p-6">
            <div className="app-caption">어떤 것이 궁금하신가요?</div>
            <div className="mt-5 grid gap-3">
              {TAROT_QUESTION_OPTIONS.map((question) => (
                <Link
                  key={question.label}
                  href={{
                    pathname: '/tarot/daily/pick',
                    query: { question: question.label },
                  }}
                  className="rounded-[1.2rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-4 text-left text-sm text-[var(--app-ivory)] transition-colors hover:border-[var(--app-plum)]/35 hover:bg-[var(--app-surface-strong)]"
                >
                  <span className="mr-2">{question.emoji}</span>
                  {question.label}
                </Link>
              ))}
            </div>

            <form action="/tarot/daily/pick" className="mt-4 rounded-[1.25rem] border border-dashed border-[var(--app-line)] bg-[var(--app-surface-muted)] p-4">
              <label
                htmlFor="tarot-question"
                className="block text-xs tracking-[0.2em] text-[var(--app-copy-soft)]"
              >
                직접 질문 쓰기
              </label>
              <textarea
                id="tarot-question"
                name="question"
                rows={3}
                placeholder="예: 지금 마음을 전해도 괜찮을까요"
                className="mt-3 w-full resize-none rounded-[1rem] border border-[var(--app-line)] bg-[rgba(255,255,255,0.02)] px-4 py-3 text-sm text-[var(--app-ivory)] outline-none placeholder:text-[var(--app-copy-soft)] focus:border-[var(--app-plum)]/45"
              />
              <button
                type="submit"
                className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-plum)] px-6 text-sm font-semibold text-white transition-colors hover:bg-[color:rgba(166,124,181,0.88)]"
              >
                카드 뽑기로 이어가기
              </button>
            </form>

            <div className="mt-6 rounded-[1.35rem] border border-[var(--app-plum)]/35 bg-[linear-gradient(135deg,rgba(166,124,181,0.12),rgba(10,18,36,0.9))] p-5">
              <div className="text-xs tracking-[0.26em] text-[var(--app-plum)]">PREMIUM</div>
              <div className="mt-3 font-[var(--font-heading)] text-2xl text-[var(--app-ivory)]">
                사주 + 타로 통합 리딩
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">
                카드가 전하는 순간의 메시지에 선생님의 사주 흐름을 겹쳐 읽어, 막연한 운세보다
                훨씬 깊고 실감나는 문장으로 이어드립니다.
              </p>
            </div>
          </article>

          <article className="app-panel p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="app-caption">오늘의 카드 미리보기</div>
                <h2 className="mt-3 font-[var(--font-heading)] text-3xl text-[var(--app-ivory)]">
                  한 장의 그림이 건네는 지혜
                </h2>
              </div>
              <Badge className="border-[var(--app-plum)]/25 bg-[var(--app-plum)]/10 text-[var(--app-plum)]">
                FREE
              </Badge>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-[0.78fr_1.22fr] sm:items-center">
              <div className="text-center">
                <div className="mx-auto flex h-[14rem] w-[9.25rem] flex-col justify-between rounded-[1rem] border-2 border-[var(--app-gold)]/60 bg-[linear-gradient(160deg,rgba(166,124,181,0.95),rgba(82,55,101,0.98))] px-4 py-5">
                  <div className="font-[var(--font-heading)] text-xs tracking-[0.22em] text-[var(--app-gold)]">
                    {featuredCard.theme.toUpperCase()}
                  </div>
                  <div className="font-[var(--font-heading)] text-5xl text-[var(--app-gold)]">月</div>
                  <div className="font-[var(--font-heading)] text-[11px] tracking-[0.28em] text-[var(--app-gold)]">
                    {featuredCard.name.toUpperCase()}
                  </div>
                </div>
                <div className="mt-4 font-[var(--font-heading)] text-2xl text-[var(--app-ivory)]">
                  {featuredCard.name}
                </div>
              </div>

              <div>
                <p className="text-sm leading-8 text-[var(--app-copy)]">
                  {featuredCard.message}
                </p>
                <div className="mt-4 rounded-[1.2rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-4 text-sm leading-7 text-[var(--app-copy-muted)]">
                  {featuredCopy}
                </div>
                <div className="mt-5">
                  <Link
                    href={{
                      pathname: '/tarot/daily/pick',
                      query: { question: '지금 고민 중인 관계에 대하여' },
                    }}
                    className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-plum)]/35 bg-[var(--app-plum)]/12 px-5 text-sm font-semibold text-[var(--app-plum)] transition-colors hover:bg-[var(--app-plum)]/18"
                  >
                    카드 뽑기 시작
                  </Link>
                </div>
              </div>
            </div>
          </article>
        </section>

        <section className="mt-8 app-panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-[var(--font-heading)] text-3xl text-[var(--app-ivory)]">
              시니어 친화 타로 카피
            </h2>
            <Badge className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]">
              강한 단어는 부드럽게 재해석
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
