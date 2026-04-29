import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ActionCluster } from '@/components/layout/action-cluster';
import { BulletList } from '@/components/layout/bullet-list';
import { FeatureCard } from '@/components/layout/feature-card';
import { ProductGrid } from '@/components/layout/product-grid';
import { SectionHeader } from '@/components/layout/section-header';
import { SectionSurface } from '@/components/layout/section-surface';
import { SupportRail } from '@/components/layout/support-rail';
import SiteHeader from '@/features/shared-navigation/site-header';
import { AppPage, AppShell, PageHero } from '@/shared/layout/app-shell';
import {
  INTERPRETATION_ENTRY_GUIDE,
  INTERPRETATION_JOURNEY,
  INTERPRETATION_LAYERS,
  REPORT_SAMPLE_HREF,
  WISDOM_CARDS,
  toneClasses,
} from '@/content/moonlight';

export const metadata: Metadata = {
  title: '해석',
  description: '사주, 명리, 타로, 궁합, 별자리, 띠운세를 한곳에서 비교하며 지금의 질문에 맞는 해석 입구를 고르실 수 있습니다.',
  alternates: { canonical: '/interpretation' },
};

const ENTRY_OVERVIEW = [
  {
    eyebrow: '원국 기준',
    title: '사주와 명리는 바탕을 읽습니다',
    description:
      '타고난 기질, 오행 균형, 격국과 용신처럼 오래 붙잡고 볼 질문은 사주와 명리 흐름에서 시작하는 편이 좋습니다.',
  },
  {
    eyebrow: '관계와 선택',
    title: '궁합과 타로는 지금의 장면에 가깝습니다',
    description:
      '사람 사이의 결이나 당장 마음에 걸리는 선택은 더 짧고 가까운 언어로 먼저 풀어보는 편이 덜 부담스럽습니다.',
  },
  {
    eyebrow: '가벼운 탐색',
    title: '별자리와 띠운세는 마음을 여는 첫 입구입니다',
    description:
      '오늘의 흐름을 빠르게 살피고 싶을 때는 가벼운 운세부터 보고, 필요할 때 더 깊은 해석으로 옮겨가실 수 있습니다.',
  },
] as const;

const INTERPRETATION_RAIL_GUIDE = [
  '질문의 무게가 길수록 사주·명리 쪽으로 가는 편이 좋습니다.',
  '관계와 감정의 장면은 궁합·타로처럼 생활 가까운 입구가 더 자연스럽습니다.',
  '가벼운 운세는 남겨두되, 프리미엄 기준서는 늘 한 단계 위에 둡니다.',
] as const;

export default function InterpretationPage() {
  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-0">
      <AppPage className="space-y-6">
        <PageHero
          badges={[
            <Badge
              key="hub"
              className="border-[var(--app-gold)]/24 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]"
            >
              해석 허브
            </Badge>,
            <Badge
              key="wisdom"
              className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]"
            >
              여섯 가지 지혜
            </Badge>,
          ]}
          title="질문의 결에 따라, 먼저 열어볼 해석의 문이 달라집니다"
          description="사주는 삶의 바탕을, 명리는 반복되는 결을, 궁합과 타로는 관계와 지금의 선택을 읽습니다. 별자리와 띠운세는 더 가볍게 흐름을 살피는 첫 입구로 두었습니다."
        />

        <section className="grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
          <SectionSurface surface="lunar" size="lg">
            <div className="app-starfield" />
            <SectionHeader
              eyebrow="해석 안내"
              title="무엇이 궁금한지 먼저 고르면, 읽는 깊이도 자연스럽게 따라옵니다"
              titleClassName="text-3xl text-[var(--app-gold-text)]"
              description="달빛선생의 해석은 전부 같은 무게로 시작하지 않습니다. 오늘 마음을 먼저 비춰보는 입구와, 오래 남는 기준서를 만드는 입구를 분명히 나누어 두었습니다."
              descriptionClassName="max-w-3xl text-[var(--app-copy)]"
              actions={
                <ActionCluster>
                  <Link
                    href="/saju/new"
                    className="moon-cta-primary"
                  >
                    내 명리 기준서 만들기
                  </Link>
                  <Link
                    href={REPORT_SAMPLE_HREF}
                    className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-gold)]/35 bg-[var(--app-gold)]/12 px-5 text-sm text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/18"
                  >
                    샘플 리포트 보기
                  </Link>
                </ActionCluster>
              }
            />

            <ProductGrid columns={3} className="mt-6">
              {ENTRY_OVERVIEW.map((item) => (
                <FeatureCard
                  key={item.title}
                  surface="soft"
                  eyebrow={item.eyebrow}
                  title={item.title}
                  titleClassName="text-2xl"
                  description={item.description}
                />
              ))}
            </ProductGrid>
          </SectionSurface>

          <SupportRail
            surface="panel"
            eyebrow="먼저 고르면 좋은 길"
            title="이 페이지는 여섯 가지 해석 입구를 차분히 정리한 허브입니다"
            description="카드가 많아 보여도, 실제로는 세 갈래만 기억하시면 됩니다. 바탕은 사주·명리, 관계와 오늘의 장면은 궁합·타로, 가벼운 탐색은 별자리·띠운세입니다."
          >
            <BulletList items={INTERPRETATION_RAIL_GUIDE} />
            <FeatureCard
              className="mt-5"
              surface="soft"
              eyebrow="리포트 중심 흐름"
              description="프리미엄 기준서는 사주 결과, 판정 근거, PDF와 보관함, 대화 연결까지 한 줄로 이어지는 흐름을 중심에 둡니다."
            />
          </SupportRail>
        </section>

        <SectionSurface surface="panel">
          <SectionHeader
            eyebrow="여섯 가지 지혜"
            title="같은 질문도 무엇을 읽고 싶은지에 따라 먼저 열어볼 문이 다릅니다"
            titleClassName="text-3xl"
            description="각 입구는 역할이 다릅니다. 마음이 먼저 움직이는 쪽에서 시작하셔도 되고, 기준서가 필요한 질문이면 바로 사주와 명리로 들어오셔도 좋습니다."
            descriptionClassName="max-w-3xl text-[var(--app-copy)]"
          />

          <ProductGrid columns={3} className="mt-6">
            {WISDOM_CARDS.map((card) => {
              const tone = toneClasses(card.tone);

              return (
                <FeatureCard
                  key={card.slug}
                  surface="soft"
                  eyebrow={<span className={`font-hanja tracking-[0.22em] ${tone.text}`}>{card.hanja}</span>}
                  title={card.title}
                  titleClassName={`text-2xl ${tone.text}`}
                  description={card.description}
                  footer={
                    <Link
                      href={card.href}
                      className={`inline-flex items-center gap-2 text-sm underline underline-offset-4 hover:text-[var(--app-ivory)] ${tone.text}`}
                    >
                      {card.title} 펼쳐보기
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  }
                >
                  <p className="text-sm leading-7 text-[var(--app-ivory)]">"{card.hook}"</p>
                </FeatureCard>
              );
            })}
          </ProductGrid>
        </SectionSurface>

        <SectionSurface surface="panel">
          <SectionHeader
            eyebrow="읽는 층"
            title="해석은 깊이와 속도에 따라 세 층으로 나누어 읽습니다"
            titleClassName="text-3xl"
            description="모든 서비스를 같은 어조와 같은 길이로 설명하지 않고, 질문의 무게에 맞게 읽는 층을 다르게 둡니다."
            descriptionClassName="max-w-3xl text-[var(--app-copy)]"
          />

          <ProductGrid columns={3} className="mt-6">
            {INTERPRETATION_LAYERS.map((layer, index) => (
              <FeatureCard
                key={layer.title}
                surface="soft"
                eyebrow={
                  <div className="flex items-center gap-2">
                    <span className="font-hanja text-xs text-[var(--app-gold)]/65">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span>{layer.title}</span>
                  </div>
                }
                description={layer.body}
                children={<BulletList items={layer.items} />}
              />
            ))}
          </ProductGrid>
        </SectionSurface>

        <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <SectionSurface surface="panel">
            <SectionHeader
              eyebrow="시작 가이드"
              title="막막하실 때는, 이 순서로 고르면 훨씬 덜 흔들립니다"
              titleClassName="text-3xl"
              description="가장 많이 찾는 시작점은 사주, 궁합, 타로입니다. 아래 세 갈래는 질문의 성격이 분명해서, 처음 들어오시는 분도 고르기 쉬운 입구들입니다."
              descriptionClassName="max-w-3xl text-[var(--app-copy)]"
            />

            <div className="mt-6 grid gap-4">
              {INTERPRETATION_ENTRY_GUIDE.map((item) => (
                <FeatureCard
                  key={item.title}
                  surface="soft"
                  title={item.title}
                  titleClassName="text-2xl"
                  description={item.body}
                  footer={
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-2 text-sm text-[var(--app-gold-text)] underline underline-offset-4 hover:text-[var(--app-ivory)]"
                    >
                      {item.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  }
                />
              ))}
            </div>
          </SectionSurface>

          <SectionSurface surface="lunar">
            <div className="app-starfield" />
            <SectionHeader
              eyebrow="읽고 이어가기"
              title="가벼운 첫 해석은, 결국 오래 남는 기준서와 대화로 이어집니다"
              titleClassName="text-3xl text-[var(--app-gold-text)]"
              description="좋은 해석은 그날의 기분만 달래고 끝나지 않습니다. 마음에 남는 장면은 저장하고, 필요할 때는 더 깊은 리포트와 대화로 이어져야 합니다."
              descriptionClassName="text-[var(--app-copy)]"
            />

            <div className="mt-6 grid gap-3">
              {INTERPRETATION_JOURNEY.map((step, index) => (
                <FeatureCard
                  key={step.title}
                  surface="soft"
                  eyebrow={
                    <span className="font-hanja text-xs text-[var(--app-gold)]/65">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  }
                  title={step.title}
                  titleClassName="text-xl text-[var(--app-ivory)]"
                  description={step.body}
                />
              ))}
            </div>

            <ActionCluster className="mt-6">
              <Link
                href="/membership"
                className="moon-cta-primary"
              >
                플랜 비교 보기
              </Link>
              <Link
                href={REPORT_SAMPLE_HREF}
                className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-gold)]/35 bg-[var(--app-gold)]/12 px-5 text-sm text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/18"
              >
                샘플 기준서 먼저 보기
              </Link>
            </ActionCluster>
          </SectionSurface>
        </section>
      </AppPage>
    </AppShell>
  );
}
