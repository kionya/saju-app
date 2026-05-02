import Link from 'next/link';
import { ActionCluster } from '@/components/layout/action-cluster';
import { FeatureCard } from '@/components/layout/feature-card';
import { ProductGrid } from '@/components/layout/product-grid';
import { SectionHeader } from '@/components/layout/section-header';
import { SectionSurface } from '@/components/layout/section-surface';
import { SupportRail } from '@/components/layout/support-rail';
import { Badge } from '@/components/ui/badge';
import {
  COMPATIBILITY_PREMIUM_EXPANSION,
  type CompatibilityRelationship,
} from '@/content/moonlight';
import type { CompatibilityInterpretation } from '@/lib/compatibility';
import { PageHero } from '@/shared/layout/app-shell';

const PRACTICAL_CARD_STYLES = {
  coral: {
    border: 'border-[var(--app-coral)]/26',
    glow: 'bg-[linear-gradient(180deg,rgba(223,136,115,0.12),rgba(10,18,36,0.96))]',
    label: 'text-[var(--app-coral)]',
  },
  sky: {
    border: 'border-[var(--app-sky)]/26',
    glow: 'bg-[linear-gradient(180deg,rgba(108,162,224,0.12),rgba(10,18,36,0.96))]',
    label: 'text-[var(--app-sky)]',
  },
  gold: {
    border: 'border-[var(--app-gold)]/24',
    glow: 'bg-[linear-gradient(180deg,rgba(210,176,114,0.12),rgba(10,18,36,0.96))]',
    label: 'text-[var(--app-gold-soft)]',
  },
  jade: {
    border: 'border-[var(--app-jade)]/26',
    glow: 'bg-[linear-gradient(180deg,rgba(107,166,139,0.12),rgba(10,18,36,0.96))]',
    label: 'text-[var(--app-jade)]',
  },
} as const;

interface CompatibilityResultViewProps {
  selected: CompatibilityRelationship;
  compatibility: CompatibilityInterpretation;
  selfName: string;
  partnerName: string;
  selfBirthSummary: string;
  partnerBirthSummary: string;
  retakeHref?: string;
  hasLoveQuestionPurchase?: boolean;
}

export function CompatibilityResultView({
  selected,
  compatibility,
  selfName,
  partnerName,
  selfBirthSummary,
  partnerBirthSummary,
  retakeHref = `/compatibility/input?relationship=${selected.slug}`,
  hasLoveQuestionPurchase = false,
}: CompatibilityResultViewProps) {
  const premiumExpansion = COMPATIBILITY_PREMIUM_EXPANSION[selected.slug];

  return (
    <>
      <PageHero
        badges={[
          <Badge
            key="result"
            className="border-[var(--app-jade)]/25 bg-[var(--app-jade)]/10 text-[var(--app-jade)]"
          >
            궁합 결과
          </Badge>,
          <Badge
            key="relationship"
            className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]"
          >
            {selected.title}
          </Badge>,
          hasLoveQuestionPurchase ? (
            <Badge
              key="purchased"
              className="border-emerald-400/25 bg-emerald-400/10 text-emerald-100"
            >
              연애 질문 구매함
            </Badge>
          ) : null,
        ]}
        title={compatibility.headline}
        description={`${selected.title} 관계에서 먼저 체감되는 말투, 속도, 거리감, 돈의 기준을 중심으로 정리했습니다.`}
      />

      <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <SectionSurface surface="lunar" size="lg">
          <div className="app-starfield" />
          <SectionHeader
            eyebrow={`${selfName} 선생님 · ${partnerName}`}
            title={compatibility.label}
            titleClassName="text-3xl text-[var(--app-gold-text)]"
            description={compatibility.dataNote ?? compatibility.summary}
            descriptionClassName="max-w-3xl text-[var(--app-copy)]"
          />

          <div className="mt-5 flex flex-wrap gap-2">
            <Badge className="border-[var(--app-gold)]/24 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]">
              {compatibility.scoreLabel}
            </Badge>
            <Badge className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]">
              관계 점수 {compatibility.score}점
            </Badge>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <FeatureCard
              surface="soft"
              className="text-center"
              eyebrow="내 기준"
              title={compatibility.selfData.dayMaster.metaphor ?? '내 기본 기질'}
              titleClassName="text-2xl text-[var(--app-coral)]"
              description={
                <>
                  <span className="block text-[var(--app-copy)]">{selfName} 선생님</span>
                  <span className="mt-2 block text-xs leading-6 text-[var(--app-copy-muted)]">
                    {compatibility.selfData.dayMaster.description ?? '기본 기질 설명을 준비하고 있습니다.'}
                  </span>
                </>
              }
            />
            <div className="text-center text-3xl text-[var(--app-gold-soft)]">↔</div>
            <FeatureCard
              surface="soft"
              className="text-center"
              eyebrow="상대 결"
              title={compatibility.partnerData.dayMaster.metaphor ?? '상대 기본 기질'}
              titleClassName="text-2xl text-[var(--app-jade)]"
              description={
                <>
                  <span className="block text-[var(--app-copy)]">{partnerName}</span>
                  <span className="mt-2 block text-xs leading-6 text-[var(--app-copy-muted)]">
                    {compatibility.partnerData.dayMaster.description ?? '기본 기질 설명을 준비하고 있습니다.'}
                  </span>
                </>
              }
            />
          </div>

          <FeatureCard
            className="mt-6"
            surface="soft"
            eyebrow="관계 한 줄 풀이"
            description={compatibility.summary}
          />

          <ProductGrid columns={2} className="mt-5">
            <FeatureCard surface="soft" eyebrow="내 정보" description={selfBirthSummary} />
            <FeatureCard surface="soft" eyebrow="상대 정보" description={partnerBirthSummary} />
          </ProductGrid>
        </SectionSurface>

        <SupportRail
          surface="panel"
          eyebrow="1분 요약"
          title="먼저 같이 맞는 지점과 조심할 지점을 짚어드립니다"
          description="긴 설명보다 먼저 관계의 결이 어디에서 맞고, 어디에서 어긋나기 쉬운지를 빠르게 읽을 수 있게 정리했습니다."
        >
          <FeatureCard surface="soft" eyebrow="잘 맞는 지점" description={compatibility.supportiveSummary} />
          <FeatureCard
            className="mt-4"
            surface="soft"
            eyebrow="조심하실 지점"
            description={compatibility.cautionSummary}
          />
          <FeatureCard
            className="mt-4"
            surface="panel"
            eyebrow="지금 관계를 살리는 방식"
            description={compatibility.currentFlowSummary}
          />
        </SupportRail>
      </section>

      <SectionSurface surface="panel" size="lg">
        <SectionHeader
          eyebrow="실전 궁합 포인트"
          title="같이 지낼수록 바로 체감되는 네 가지"
          titleClassName="text-3xl"
          description="단순히 잘 맞는지보다, 어디서 부딪히고 어떻게 풀어야 오래 편한지를 중심으로 정리했습니다."
          descriptionClassName="max-w-3xl text-[var(--app-copy)]"
        />

        <ProductGrid columns={2} className="mt-6">
          {compatibility.practicalCards.map((card) => {
            const styles = PRACTICAL_CARD_STYLES[card.tone];

            return (
              <article
                key={card.key}
                className={`h-full rounded-[1.5rem] border p-6 ${styles.border} ${styles.glow}`}
              >
                <div className={`text-xs tracking-[0.18em] ${styles.label}`}>{card.eyebrow}</div>
                <h3 className="mt-3 font-[var(--font-heading)] text-2xl text-[var(--app-ivory)]">
                  {card.title}
                </h3>
                <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">{card.summary}</p>
                <div className="mt-5 rounded-[1rem] border border-white/8 bg-[rgba(255,255,255,0.03)] px-4 py-4">
                  <div className="text-xs tracking-[0.18em] text-[var(--app-copy-soft)]">
                    관계를 살리는 방식
                  </div>
                  <p className="mt-2 text-sm leading-7 text-[var(--app-copy)]">{card.practice}</p>
                </div>
              </article>
            );
          })}
        </ProductGrid>
      </SectionSurface>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <SectionSurface surface="panel" size="lg">
          <SectionHeader
            eyebrow="이 관계를 보는 렌즈"
            title={compatibility.relationshipLensTitle}
            titleClassName="text-3xl"
            description={compatibility.relationshipLensBody}
            descriptionClassName="max-w-3xl text-[var(--app-copy)]"
          />
          <FeatureCard
            className="mt-6"
            surface="soft"
            eyebrow="관계를 다루는 방식"
            description={compatibility.practiceSummary}
          />
        </SectionSurface>

        <SectionSurface surface="panel" size="lg">
          <SectionHeader
            eyebrow="판정 기준"
            title="근거는 아래에서 따로 확인합니다"
            titleClassName="text-3xl"
            description="앞쪽에서는 관계 풀이를 먼저 읽고, 이 영역에서는 두 사람의 명식에서 어떤 기준을 참고했는지 작게 분리해 보여드립니다."
            descriptionClassName="max-w-3xl text-[var(--app-copy)]"
          />
          <ProductGrid columns={2} className="mt-6">
            {compatibility.evidence.map((item) => (
              <FeatureCard
                key={item.title}
                surface="soft"
                title={item.title}
                titleClassName="text-xl"
                description={item.body}
              />
            ))}
          </ProductGrid>
        </SectionSurface>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
        <SectionSurface surface="panel" size="lg">
          <SectionHeader
            eyebrow="프리미엄에서 더 읽는 내용"
            title="이 관계를 더 길게 읽고 싶다면"
            titleClassName="text-3xl"
            description="기본 궁합 결과 위에, 갈등 구조와 보완점, 관계 전략을 더 길고 차분하게 이어서 볼 수 있도록 준비했습니다."
            descriptionClassName="max-w-3xl text-[var(--app-copy)]"
          />
          <ProductGrid columns={2} className="mt-6">
            {premiumExpansion.preview.map((item) => (
              <FeatureCard
                key={item.title}
                surface="soft"
                title={item.title}
                titleClassName="text-xl"
                description={item.body}
              />
            ))}
          </ProductGrid>
        </SectionSurface>

        <SectionSurface
          surface="lunar"
          size="lg"
          className="border-[var(--app-jade)]/28 bg-[linear-gradient(180deg,rgba(107,166,139,0.12),rgba(10,18,36,0.96))]"
        >
          <SectionHeader
            eyebrow="이 관계를 더 깊게 보고 싶다면"
            title={premiumExpansion.ctaTitle}
            titleClassName="text-3xl text-[var(--app-ivory)]"
            description={premiumExpansion.ctaBody}
            descriptionClassName="max-w-3xl text-[var(--app-copy)]"
            actions={
              <ActionCluster>
                <Link
                  href="/membership/checkout?plan=premium"
                  className="moon-action-primary"
                >
                  프리미엄으로 이 관계 이어보기
                </Link>
                <Link
                  href={retakeHref}
                  className="moon-action-muted"
                >
                  다른 사람 입력하기
                </Link>
              </ActionCluster>
            }
          />
        </SectionSurface>
      </section>
    </>
  );
}
