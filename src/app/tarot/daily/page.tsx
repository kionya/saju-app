import Link from 'next/link';
import type { Metadata } from 'next';
import { TarotCardArtwork } from '@/components/tarot/tarot-card-artwork';
import { ActionCluster } from '@/components/layout/action-cluster';
import { BulletList } from '@/components/layout/bullet-list';
import { FeatureCard } from '@/components/layout/feature-card';
import { ProductGrid } from '@/components/layout/product-grid';
import { SectionHeader } from '@/components/layout/section-header';
import { SectionSurface } from '@/components/layout/section-surface';
import { SupportRail } from '@/components/layout/support-rail';
import { Badge } from '@/components/ui/badge';
import {
  TAROT_CARD_KEYWORDS,
  TAROT_MIND_ENTRY_POINTS,
  TAROT_QUESTION_OPTIONS,
} from '@/content/moonlight';
import SiteHeader from '@/features/shared-navigation/site-header';
import { getOptionalSignedInProfile } from '@/lib/profile';
import { buildProfileReadingSlug } from '@/lib/profile-personalization';
import { getTarotSpreadForQuestion, getTodayTarotPreview } from '@/lib/tarot-api';
import { AppPage, AppShell, PageHero } from '@/shared/layout/app-shell';

const DAILY_TAROT_QUESTION = '오늘 하루 어떤 메시지가 있을까';

const TAROT_FLOW_POINTS = [
  '타로는 지금 눈앞의 감정과 장면을 빠르게 비춥니다.',
  '사주는 그 감정이 왜 반복되는지, 내 기질과 시기의 흐름에서 더 길게 설명합니다.',
  '카드 결과가 마음에 남으면 같은 질문을 사주 결과나 상담으로 이어갈 수 있습니다.',
] as const;

export const metadata: Metadata = {
  title: '타로',
  description:
    '질문을 고르고 카드 뽑기 화면으로 이어지는 달빛선생의 오늘의 타로 메인 화면입니다.',
  alternates: {
    canonical: '/tarot/daily',
  },
};

export default async function DailyTarotPage() {
  const profile = await getOptionalSignedInProfile();
  const readingSlug = buildProfileReadingSlug(profile);
  const featuredReading = await getTodayTarotPreview();
  const premiumSpread = await getTarotSpreadForQuestion(DAILY_TAROT_QUESTION);
  const sourceLabel = featuredReading.source === 'api' ? '78장 덱 기준' : '로컬 덱 기준';

  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-12">
      <AppPage className="space-y-6">
        <PageHero
          badges={[
            <Badge
              key="tarot"
              className="border-[var(--app-plum)]/25 bg-[var(--app-plum)]/10 text-[var(--app-plum)]"
            >
              오늘의 타로
            </Badge>,
            <Badge
              key="free"
              className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]"
            >
              빠른 무료 탐색
            </Badge>,
          ]}
          title="카드를 고르기 전에, 마음의 질문부터 정합니다"
          description="타로를 보러 오는 마음은 대부분 답답함, 기대, 망설임에서 시작됩니다. 먼저 질문을 고르고 한 장을 뽑으면, 결과에서는 그 마음이 사주 흐름과 어디에서 만나는지까지 이어서 보여드립니다."
        />

        <SectionSurface surface="panel">
          <SectionHeader
            eyebrow="타로를 보는 마음"
            title="이럴 때는 바로 카드를 고르기보다, 먼저 마음의 결을 정해보세요"
            titleClassName="text-2xl sm:text-3xl"
            description="질문이 흐리면 카드도 흐리게 읽힙니다. 지금 내 마음이 어느 쪽에 가까운지 먼저 확인하면, 뽑은 카드의 메시지가 훨씬 또렷해집니다."
            descriptionClassName="max-w-3xl text-[var(--app-copy)]"
          />
          <ProductGrid columns={3} className="mt-5">
            {TAROT_MIND_ENTRY_POINTS.map((item, index) => (
              <FeatureCard
                key={item.title}
                surface="soft"
                eyebrow={String(index + 1).padStart(2, '0')}
                title={item.title}
                titleClassName="text-xl"
                description={item.body}
              />
            ))}
          </ProductGrid>
        </SectionSurface>

        <section className="grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
          <SectionSurface surface="panel" size="lg">
            <SectionHeader
              eyebrow="질문 고르기"
              title="먼저 무엇이 궁금한지 골라 보세요"
              titleClassName="text-3xl"
              description="카드는 질문의 결에 따라 전혀 다르게 읽힙니다. 가장 가까운 질문을 먼저 고르면 뽑기와 결과 흐름이 더 자연스럽게 이어집니다."
              descriptionClassName="max-w-3xl text-[var(--app-copy)]"
            />

            <ProductGrid columns={2} className="mt-6">
              {TAROT_QUESTION_OPTIONS.map((question) => (
                <FeatureCard
                  key={question.label}
                  surface="soft"
                  eyebrow={
                    <span className="flex items-center gap-2">
                      <span className="font-hanja text-base text-[var(--app-gold-text)]">
                        {question.emoji}
                      </span>
                      <span>{question.intent}</span>
                    </span>
                  }
                  title={question.label}
                  description={question.description}
                  badge={
                    <span className="rounded-full border border-[var(--app-plum)]/25 bg-[var(--app-plum)]/10 px-2.5 py-1 text-[11px] text-[var(--app-plum)]">
                      {question.when}
                    </span>
                  }
                  footer={
                    <Link
                      href={{
                        pathname: '/tarot/daily/pick',
                        query: { question: question.label },
                      }}
                      className="inline-flex items-center gap-2 text-sm text-[var(--app-plum)] underline underline-offset-4 hover:text-[var(--app-ivory)]"
                    >
                      이 질문으로 카드 뽑기
                    </Link>
                  }
                  />
              ))}
            </ProductGrid>

            <SectionHeader
              className="mt-8"
              eyebrow="직접 질문 쓰기"
              title="지금 마음에 떠오르는 문장을 그대로 적어도 좋습니다"
              titleClassName="text-2xl"
            />

            <form
              action="/tarot/daily/pick"
              className="mt-5 rounded-[1.25rem] border border-dashed border-[var(--app-line)] bg-[var(--app-surface-muted)] p-4"
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
              <ActionCluster className="mt-4">
                <button
                  type="submit"
                  className="moon-action-primary"
                >
                  카드 뽑기로 이어가기
                </button>
              </ActionCluster>
            </form>
          </SectionSurface>

          <SupportRail
            surface="lunar"
            eyebrow="타로를 여는 방식"
            title="타로는 지금 마음, 사주는 반복되는 흐름을 봅니다"
            description="타로는 오늘의 장면을 빠르게 비추고, 사주는 그 장면이 내 삶에서 왜 반복되는지 길게 설명합니다. 그래서 타로는 입구, 사주는 기준서로 나눠 읽습니다."
          >
            <BulletList items={TAROT_FLOW_POINTS} />

            <FeatureCard
              className="mt-5"
              surface="soft"
              eyebrow="프리미엄 확장 리딩"
              title="사주 + 타로 3장 확장"
              description="한 장의 메시지 뒤에 현재 흐름, 숨은 원인, 오늘의 조언을 붙여 읽으면 질문의 결이 훨씬 또렷해집니다."
            />

            <ProductGrid columns={3} className="mt-4">
              {premiumSpread.map(({ position, reading }) => (
                <FeatureCard
                  key={position}
                  surface="soft"
                  eyebrow={position}
                  description={reading.displayName}
                />
              ))}
            </ProductGrid>

            <ActionCluster className="mt-5">
              <Link
                href={readingSlug ? `/saju/${readingSlug}` : '/saju/new'}
                className="moon-action-secondary"
              >
                {readingSlug ? '이 질문을 내 사주 흐름과 함께 보기' : '사주와 함께 보기'}
              </Link>
            </ActionCluster>
          </SupportRail>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <SectionSurface surface="panel" size="lg" className="text-center">
            <SectionHeader
              eyebrow="오늘의 카드 미리보기"
              title="한 장의 그림이 먼저 건네는 말"
              titleClassName="text-3xl"
              descriptionClassName="mx-auto max-w-xl text-[var(--app-copy)]"
              description="질문을 바로 고르기 전에, 오늘의 카드가 어떤 온도로 말을 거는지 먼저 살펴보실 수 있습니다."
            />

            <div className="mt-6">
              <TarotCardArtwork
                cardId={featuredReading.card.name_short}
                shortName={featuredReading.shortName}
                displayName={featuredReading.displayName}
                cardMarker={featuredReading.cardMarker}
                arcanaLabel={featuredReading.arcanaLabel}
                className="mx-auto w-[min(14rem,72vw)]"
                priority
              />
            </div>
            <div className="mt-4 font-display text-2xl font-semibold text-[var(--app-ivory)]">
              {featuredReading.displayName}
            </div>
            <div className="mt-2 text-sm text-[var(--app-copy-muted)]">{sourceLabel}</div>
          </SectionSurface>

          <SectionSurface surface="panel" size="lg">
            <SectionHeader
              eyebrow="오늘의 한마디"
              title={featuredReading.answer}
              titleClassName="text-3xl"
              description={featuredReading.guidance}
              descriptionClassName="max-w-3xl text-[var(--app-copy)]"
            />

            <FeatureCard
              className="mt-6"
              surface="soft"
              eyebrow="질문의 속뜻"
              description={featuredReading.questionInsight}
            />

            <ActionCluster className="mt-6">
              <Link
                href={{
                  pathname: '/tarot/daily/result',
                  query: {
                    question: DAILY_TAROT_QUESTION,
                    cardId: featuredReading.card.name_short,
                    orientation: featuredReading.orientation,
                  },
                }}
                className="moon-cta-primary"
              >
                이 카드로 오늘 리딩 보기
              </Link>
            </ActionCluster>
          </SectionSurface>
        </section>

        <SectionSurface surface="panel" size="lg">
          <SectionHeader
            eyebrow="시니어 친화 타로 카피"
            title="강한 단어보다 오래 남는 문장으로 바꿔 읽습니다"
            titleClassName="text-3xl"
            description="무료 탐색에서도 공포성 표현보다 생활에 붙는 언어를 먼저 드리기 위한 기준입니다."
            descriptionClassName="max-w-3xl text-[var(--app-copy)]"
          />

          <ProductGrid columns={3} className="mt-6">
            {TAROT_CARD_KEYWORDS.map(([name, copy]) => (
              <FeatureCard
                key={name}
                surface="soft"
                eyebrow={name}
                description={copy}
              />
            ))}
          </ProductGrid>
        </SectionSurface>
      </AppPage>
    </AppShell>
  );
}
