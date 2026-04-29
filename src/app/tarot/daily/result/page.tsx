import Link from 'next/link';
import type { Metadata } from 'next';
import { TarotCardArtwork } from '@/components/tarot/tarot-card-artwork';
import { ActionCluster } from '@/components/layout/action-cluster';
import { FeatureCard } from '@/components/layout/feature-card';
import { ProductGrid } from '@/components/layout/product-grid';
import { SectionHeader } from '@/components/layout/section-header';
import { SectionSurface } from '@/components/layout/section-surface';
import { SupportRail } from '@/components/layout/support-rail';
import { Badge } from '@/components/ui/badge';
import { TAROT_CARD_KEYWORDS, TAROT_TO_SAJU_BRIDGE } from '@/content/moonlight';
import SiteHeader from '@/features/shared-navigation/site-header';
import { getOptionalSignedInProfile } from '@/lib/profile';
import { buildProfileReadingSlug } from '@/lib/profile-personalization';
import {
  getTarotReadingForQuestion,
  getTarotSpreadForQuestion,
  normalizeQuestion,
} from '@/lib/tarot-api';
import { AppPage, AppShell, PageHero } from '@/shared/layout/app-shell';

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
  const profile = await getOptionalSignedInProfile();
  const readingSlug = buildProfileReadingSlug(profile);
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
      <AppPage className="space-y-6">
        <PageHero
          badges={[
            <Badge
              key="result"
              className="border-[var(--app-plum)]/25 bg-[var(--app-plum)]/10 text-[var(--app-plum)]"
            >
              타로 결과
            </Badge>,
            <Badge
              key="source"
              className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]"
            >
              {sourceLabel}
            </Badge>,
          ]}
          title={currentQuestion}
          description="카드가 전하는 순간의 메시지를 먼저 짚고, 필요하면 그 질문이 사주 흐름과 어디에서 만나는지까지 이어서 읽습니다."
        />

        <section className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <SectionSurface surface="panel" size="lg" className="text-center">
            <SectionHeader
              eyebrow="오늘 뽑으신 카드"
              title={reading.displayName}
              titleClassName="text-3xl"
              description={`${reading.arcanaLabel} · ${reading.subtitle}`}
              descriptionClassName="mx-auto max-w-xl text-[var(--app-copy-muted)]"
            />
            <div className="mt-6">
              <TarotCardArtwork
                cardId={reading.card.name_short}
                shortName={reading.shortName}
                displayName={reading.displayName}
                cardMarker={reading.cardMarker}
                arcanaLabel={reading.arcanaLabel}
                className="mx-auto"
                priority
              />
            </div>
            <FeatureCard
              className="mt-6 text-left"
              surface="soft"
              eyebrow="원문 카드 의미"
              description={reading.meaningExcerpt}
            />
          </SectionSurface>

          <SupportRail
            surface="lunar"
            eyebrow="먼저 짚어드리는 핵심"
            title={reading.answer}
            description="긴 설명보다 먼저, 지금 질문에 가장 가까운 한 줄과 오늘 바로 붙잡을 포인트를 먼저 드립니다."
          >
            <FeatureCard
              surface="soft"
              eyebrow="이번 주 마음에 두실 한 가지"
              description={reading.action}
            />
            <FeatureCard
              className="mt-4"
              surface="soft"
              eyebrow="카드가 건네는 말"
              description={reading.guidance}
            />
            <FeatureCard
              className="mt-4"
              surface="panel"
              eyebrow="선생님의 사주와 만나면"
              description={reading.sajuBlend}
            />
          </SupportRail>
        </section>

        <SectionSurface surface="panel" size="lg">
          <SectionHeader
            eyebrow="질문을 읽는 두 층"
            title="마음의 표면과 속뜻을 함께 봅니다"
            titleClassName="text-3xl"
            description="타로는 단답으로 끝내기보다, 질문의 속뜻과 지금 움직이는 감정선을 함께 읽을 때 더 또렷해집니다."
            descriptionClassName="max-w-3xl text-[var(--app-copy)]"
          />

          <ProductGrid columns={2} className="mt-6">
            <FeatureCard
              surface="soft"
              eyebrow="질문의 속뜻"
              description={reading.questionInsight}
            />
            <FeatureCard
              surface="soft"
              eyebrow={reading.psychologyLabel}
              description={reading.psychology}
            />
          </ProductGrid>
        </SectionSurface>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <SectionSurface surface="panel" size="lg">
            <SectionHeader
              eyebrow="타로 뒤에 사주를 붙이면"
              title="질문이 왜 반복되는지 더 길게 읽을 수 있습니다"
              titleClassName="text-3xl"
              description="무료 타로는 오늘 마음을 빠르게 비추고, 사주 흐름은 그 질문이 오래 반복되는 이유를 더 길게 설명해 줍니다."
              descriptionClassName="max-w-3xl text-[var(--app-copy)]"
            />
            <ProductGrid columns={3} className="mt-6">
              {TAROT_TO_SAJU_BRIDGE.map((item, index) => (
                <FeatureCard
                  key={item}
                  surface="soft"
                  eyebrow={String(index + 1).padStart(2, '0')}
                  description={item}
                />
              ))}
            </ProductGrid>
            <ActionCluster className="mt-6">
              <Link
                href={readingSlug ? `/saju/${readingSlug}` : '/saju/new'}
                className="moon-cta-primary"
              >
                {readingSlug ? '내 사주 흐름과 함께 보기' : '내 사주와 겹쳐 읽기'}
              </Link>
              <Link
                href={{
                  pathname: '/dialogue',
                  query: {
                    from: 'tarot',
                    question: '방금 본 타로 결과를 제 사주 흐름까지 함께 놓고 보면 어떻게 읽어야 하나요?',
                  },
                }}
                className="moon-cta-secondary"
              >
                달빛선생께 더 여쭙기
              </Link>
            </ActionCluster>
          </SectionSurface>

          <SectionSurface surface="panel" size="lg">
            <SectionHeader
              eyebrow="프리미엄 3장 확장 흐름"
              title="한 장 뒤에 숨은 층을 더 열어보면"
              titleClassName="text-3xl"
              description="현재 흐름, 숨은 원인, 오늘의 조언을 3장 구조로 더 펼쳐보는 확장 리딩입니다."
              descriptionClassName="max-w-3xl text-[var(--app-copy)]"
            />

            <ProductGrid columns={3} className="mt-6">
              {premiumSpread.map(({ position, reading: spreadReading }) => (
                <FeatureCard
                  key={position}
                  surface="soft"
                  eyebrow={position}
                  title={spreadReading.displayName}
                  description={spreadReading.answer}
                />
              ))}
            </ProductGrid>

            <ActionCluster className="mt-6">
              <Link href="/membership" className="moon-cta-secondary">
                심층 해석 플랜 보기
              </Link>
            </ActionCluster>
          </SectionSurface>
        </section>

        <SectionSurface surface="panel" size="lg">
          <SectionHeader
            eyebrow="카드 키워드"
            title="강한 단어는 생활 언어로 다시 풀어 읽습니다"
            titleClassName="text-3xl"
            description="무료 탐색에서도 공포를 부추기지 않고, 오래 남는 문장으로 다시 풀어 읽는 원칙을 유지합니다."
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
