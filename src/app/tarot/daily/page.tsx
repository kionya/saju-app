import Link from 'next/link';
import type { Metadata } from 'next';
import { TarotCardArtwork } from '@/components/tarot/tarot-card-artwork';
import { Badge } from '@/components/ui/badge';
import { TAROT_CARD_KEYWORDS, TAROT_QUESTION_OPTIONS } from '@/content/moonlight';
import SiteHeader from '@/features/shared-navigation/site-header';
import { WisdomCategoryHero } from '@/features/shared-navigation/wisdom-category-hero';
import { getTarotSpreadForQuestion, getTodayTarotPreview } from '@/lib/tarot-api';
import { AppShell } from '@/shared/layout/app-shell';

const DAILY_TAROT_QUESTION = '오늘 하루 어떤 메시지가 있을까';

export const metadata: Metadata = {
  title: '타로',
  description:
    '질문을 고르고 카드 뽑기 화면으로 이어지는 달빛선생의 오늘의 타로 메인 화면입니다.',
  alternates: {
    canonical: '/tarot/daily',
  },
};

export default async function DailyTarotPage() {
  const featuredReading = await getTodayTarotPreview();
  const premiumSpread = await getTarotSpreadForQuestion(DAILY_TAROT_QUESTION);
  const sourceLabel = featuredReading.source === 'api' ? '78장 덱 기준' : '로컬 덱 기준';

  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-12">
      <div className="wisdom-category-page">
        <WisdomCategoryHero slug="tarot" />
        <div className="wisdom-category-body">
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
                    className="rounded-[1.2rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-4 text-left text-sm text-[var(--app-ivory)] transition-colors hover:border-[var(--app-plum)]/38 hover:bg-[var(--app-surface-strong)]"
                  >
                    <span className="mr-2">{question.emoji}</span>
                    {question.label}
                  </Link>
                ))}
              </div>

              <form
                action="/tarot/daily/pick"
                className="mt-4 rounded-[1.25rem] border border-dashed border-[var(--app-line)] bg-[var(--app-surface-muted)] p-4"
              >
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
                  className="mt-3 w-full resize-none rounded-[1rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-3 text-sm text-[var(--app-ivory)] outline-none placeholder:text-[var(--app-copy-soft)] focus:border-[var(--app-plum)]/45"
                />
                <button
                  type="submit"
                  className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-plum)] px-6 text-sm font-semibold text-white transition-colors hover:opacity-90"
                >
                  카드 뽑기로 이어가기
                </button>
              </form>

              <div className="moon-lunar-panel mt-6 rounded-[1.35rem] border-[var(--app-plum)]/28 p-5">
                <div className="text-xs tracking-[0.26em] text-[var(--app-plum)]">PREMIUM</div>
                <div className="mt-3 font-[var(--font-heading)] text-2xl text-[var(--app-ivory)]">
                  사주 + 타로 3장 확장 리딩
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">
                  한 장의 메시지 뒤에 현재 흐름, 숨은 원인, 오늘의 조언을 겹쳐 읽으면
                  질문의 결이 더 선명해집니다.
                </p>
                <div className="mt-4 grid gap-2">
                  {premiumSpread.map(({ position, reading }) => (
                    <div
                      key={position}
                      className="flex items-center justify-between gap-3 rounded-[1rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-3 py-3"
                    >
                      <span className="text-xs text-[var(--app-copy-soft)]">{position}</span>
                      <span className="truncate text-sm text-[var(--app-ivory)]">
                        {reading.displayName}
                      </span>
                    </div>
                  ))}
                </div>
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
                  {sourceLabel}
                </Badge>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-[0.78fr_1.22fr] sm:items-center">
                <div className="text-center">
                  <TarotCardArtwork
                    cardId={featuredReading.card.name_short}
                    shortName={featuredReading.shortName}
                    displayName={featuredReading.displayName}
                    cardMarker={featuredReading.cardMarker}
                    orientation={featuredReading.orientation}
                    orientationLabel={featuredReading.orientationLabel}
                    arcanaLabel={featuredReading.arcanaLabel}
                    className="w-[min(14rem,72vw)]"
                  />
                  <div className="mt-4 font-[var(--font-heading)] text-2xl text-[var(--app-ivory)]">
                    {featuredReading.displayName}
                  </div>
                </div>

                <div>
                  <p className="font-[var(--font-heading)] text-2xl leading-9 text-[var(--app-ivory)]">
                    {featuredReading.answer}
                  </p>
                  <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
                    {featuredReading.guidance}
                  </p>
                  <div className="mt-4 rounded-[1.2rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-4 text-sm leading-7 text-[var(--app-copy-muted)]">
                    {featuredReading.questionInsight}
                  </div>
                  <div className="mt-5">
                    <Link
                      href={{
                        pathname: '/tarot/daily/result',
                        query: {
                          question: DAILY_TAROT_QUESTION,
                          cardId: featuredReading.card.name_short,
                          orientation: featuredReading.orientation,
                        },
                      }}
                      className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-plum)]/35 bg-[var(--app-plum)]/12 px-5 text-sm font-semibold text-[var(--app-plum)] transition-colors hover:bg-[var(--app-plum)]/18"
                    >
                      이 카드로 오늘 리딩 보기
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
      </div>
    </AppShell>
  );
}
