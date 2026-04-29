import Link from 'next/link';
import type { Metadata } from 'next';
import { ActionCluster } from '@/components/layout/action-cluster';
import { BulletList } from '@/components/layout/bullet-list';
import { FeatureCard } from '@/components/layout/feature-card';
import { ProductGrid } from '@/components/layout/product-grid';
import { SectionHeader } from '@/components/layout/section-header';
import { SectionSurface } from '@/components/layout/section-surface';
import { SupportRail } from '@/components/layout/support-rail';
import { Badge } from '@/components/ui/badge';
import SiteHeader from '@/features/shared-navigation/site-header';
import {
  getTarotPickerDeck,
  getTarotSpreadForQuestion,
  normalizeQuestion,
} from '@/lib/tarot-api';
import { AppPage, AppShell, PageHero } from '@/shared/layout/app-shell';
import { TarotCardPicker } from './tarot-card-picker';

interface Props {
  searchParams: Promise<{ question?: string }>;
}

const PICKER_POINTS = [
  '한 번에 정답을 찾기보다, 지금 내 마음이 어디로 기울어 있는지를 보는 장면입니다.',
  '직접 한 장을 고르셔도 되고, 랜덤 뽑기로 한 장을 맡겨 보셔도 좋습니다.',
  '카드를 고른 뒤에는 결과 화면에서 질문의 속뜻과 사주 브리지까지 이어집니다.',
] as const;

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
      <AppPage className="space-y-6">
        <PageHero
          badges={[
            <Badge
              key="pick"
              className="border-[var(--app-plum)]/25 bg-[var(--app-plum)]/10 text-[var(--app-plum)]"
            >
              카드 뽑기
            </Badge>,
            <Badge
              key="source"
              className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]"
            >
              {sourceLabel}
            </Badge>,
          ]}
          title="질문을 품고, 마음이 머무는 한 장을 고릅니다"
          description={
            <>
              지금 들고 오신 질문은 <span className="text-[var(--app-plum)]">“{currentQuestion}”</span>
              입니다. 덱은 이 질문에 맞는 결로 섞여 있고, 한 장을 고르면 결과 화면에서
              카드 의미와 사주 브리지가 함께 이어집니다.
            </>
          }
        />

        <section className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr]">
          <SupportRail
            surface="panel"
            eyebrow="카드를 고르기 전에"
            title="마음을 한 번 가다듬고 들어가면 좋습니다"
            description="카드는 지금 가장 선명한 감정선에 먼저 반응합니다. 질문을 크게 바꾸지 말고, 같은 마음으로 한 장을 골라 보시면 더 읽기 쉬워집니다."
          >
            <BulletList items={PICKER_POINTS} />

            <FeatureCard
              className="mt-5"
              surface="soft"
              eyebrow="질문"
              title={currentQuestion}
            />

            <SectionHeader
              className="mt-6"
              eyebrow="프리미엄 3장 확장"
              title="더 깊게 보면 이런 흐름으로 이어집니다"
              titleClassName="text-2xl"
            />
            <ProductGrid columns={3} className="mt-4">
              {premiumSpread.map(({ position }) => (
                <FeatureCard key={position} surface="soft" eyebrow={position} />
              ))}
            </ProductGrid>

            <ActionCluster className="mt-5">
              <Link href="/tarot/daily" className="moon-cta-secondary">
                질문 다시 고르기
              </Link>
            </ActionCluster>
          </SupportRail>

          <SectionSurface surface="panel" size="lg">
            <SectionHeader
              eyebrow="펼쳐진 덱"
              title="이제 한 장을 골라 주세요"
              titleClassName="text-3xl"
              description="직접 한 장을 고르거나 랜덤으로 맡기면 결과 화면으로 바로 이어집니다."
              descriptionClassName="max-w-3xl text-[var(--app-copy)]"
            />
            <div className="mt-6">
              <TarotCardPicker
                cards={pickerCards}
                question={currentQuestion}
                sourceLabel={sourceLabel}
              />
            </div>
          </SectionSurface>
        </section>
      </AppPage>
    </AppShell>
  );
}
