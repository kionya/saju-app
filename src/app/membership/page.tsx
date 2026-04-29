import Link from 'next/link';
import type { Metadata } from 'next';
import { SafetyNotice } from '@/components/common/safety-notice';
import { TrackedLink } from '@/components/common/tracked-link';
import SiteHeader from '@/features/shared-navigation/site-header';
import { ActionCluster } from '@/components/layout/action-cluster';
import { BulletList } from '@/components/layout/bullet-list';
import { FeatureCard } from '@/components/layout/feature-card';
import { ProductGrid } from '@/components/layout/product-grid';
import { SectionHeader } from '@/components/layout/section-header';
import { SectionSurface } from '@/components/layout/section-surface';
import { ReportKeepsakeSection } from '@/components/report/report-keepsake-section';
import { AppShell } from '@/shared/layout/app-shell';
import {
  INTERPRETATION_JOURNEY,
  MEMBERSHIP_REASSURANCE,
  PLAN_BLUEPRINT,
  REPORT_SAMPLE_HREF,
} from '@/content/moonlight';

const COLLECTIBLE_REPORTS = [
  {
    slug: 'life-standard',
    title: '나의 명리 기준서',
    price: '49,000원~79,000원',
    summary: '원국·격국·용신·대운 종합',
    recommendation: '내 사주의 바탕과 평생 흐름을 한 번의 결과물로 남기고 싶은 분',
    href: '/saju/new?product=life-standard',
    badge: '핵심',
    status: '지금 시작 가능',
  },
  {
    slug: 'yearly-2026',
    title: '2026 연간 운세 전략서',
    price: '39,000원~69,000원',
    summary: '월별 흐름·주의 달·기회 달',
    recommendation: '올해의 달별 전략과 timing을 미리 보고 싶은 분',
    href: '/saju/new?product=yearly-2026',
    badge: '시즌',
    status: '기준서 흐름으로 연결',
  },
  {
    slug: 'relationship-standard',
    title: '궁합 기준서',
    price: '59,000원~89,000원',
    summary: '관계 구조·갈등·보완점',
    recommendation: '두 사람의 맞물림과 부딪히는 지점을 관계 구조로 정리하고 싶은 분',
    href: '/compatibility?product=relationship-standard',
    badge: '관계',
    status: '궁합 흐름으로 연결',
  },
  {
    slug: 'family-report',
    title: '가족 명리 리포트',
    price: '99,000원~129,000원',
    summary: '부모·자녀·배우자 구조',
    recommendation: '가족 안에서 반복되는 역할과 충돌 지점을 함께 정리하고 싶은 분',
    href: '/membership?focus=family-report',
    badge: '가족',
    status: '준비 중',
  },
] as const;

const DIALOGUE_PLAN_GUIDES = {
  basic: {
    lead: '가볍게 묻고 월 2회 리포트 맛보기',
    body: '오늘의 흐름이나 지금 걸리는 질문을 부담 없이 여쭙고, 기준서 미리보기를 조금씩 경험해보는 가장 가벼운 시작입니다.',
    cta: '라이트 멤버십 시작하기',
    href: '/membership/checkout?plan=basic&from=membership',
  },
  premium: {
    lead: '리포트 기준 위에서 대화와 가족 해석을 넉넉하게 이어보기',
    body: '이미 읽은 기준서를 생활 질문과 가족 이야기, 궁합 해석까지 길게 붙여 쓰고 싶은 분께 맞는 중심 플랜입니다.',
    cta: 'Premium 멤버십 시작하기',
    href: '/membership/checkout?plan=premium&from=membership',
  },
} as const;

const COMPARISON_ROWS = [
  {
    label: '명식 계산',
    ai: '입력 문맥을 바탕으로 추론하거나 단순화될 수 있습니다.',
    moonlight: '엔진이 먼저 명식과 운의 구조를 계산한 뒤 결과를 설명합니다.',
  },
  {
    label: '격국·용신',
    ai: '프롬프트에 따라 해석 결이 흔들릴 수 있습니다.',
    moonlight: '격국 후보, 강약, 용신 판단 근거를 함께 남깁니다.',
  },
  {
    label: '시간 처리',
    ai: '출생시각과 출생지의 경계 조건을 단순 처리하기 쉽습니다.',
    moonlight: '출생시각·출생지·절기·시간 기준을 따로 반영합니다.',
  },
  {
    label: '설명 방식',
    ai: '말은 자연스럽지만 근거가 화면에 남지 않을 수 있습니다.',
    moonlight: '판정 근거와 설명 레이어를 나눠서 보여드립니다.',
  },
  {
    label: '보관 방식',
    ai: '대화가 끝나면 결과가 흩어지기 쉽습니다.',
    moonlight: 'PDF와 MY 보관함으로 오래 남깁니다.',
  },
  {
    label: '대화 연결',
    ai: '새 질문마다 설명 맥락이 새로 흔들릴 수 있습니다.',
    moonlight: '리포트 기준 위에서 질문을 계속 이어갑니다.',
  },
] as const;

const CATALOG_PROOF_GROUPS = [
  {
    eyebrow: '계산 기준',
    title: 'AI가 명식을 추측하지 않는 구조',
    points: [
      COMPARISON_ROWS[0].moonlight,
      COMPARISON_ROWS[1].moonlight,
      COMPARISON_ROWS[2].moonlight,
    ],
  },
  {
    eyebrow: '보관과 근거',
    title: '읽고 끝나는 결과가 아니라 남는 기준서',
    points: [
      COMPARISON_ROWS[3].moonlight,
      COMPARISON_ROWS[4].moonlight,
    ],
  },
  {
    eyebrow: '대화 연결',
    title: '질문은 리포트 기준 위에서 이어집니다',
    points: [
      COMPARISON_ROWS[5].moonlight,
      '샘플 리포트와 판정 근거 예시를 먼저 보고 결정하셔도 됩니다.',
    ],
  },
] as const;

const PRE_PURCHASE_LINKS = [
  {
    title: '샘플 기준서 보기',
    body: '결제 전에 결과물의 구조와 깊이를 먼저 확인합니다.',
    href: REPORT_SAMPLE_HREF,
  },
  {
    title: '엔진 기준서 보기',
    body: '달빛선생이 어떤 계산 기준과 판정 순서를 쓰는지 정리해둔 문서입니다.',
    href: '/about-engine',
  },
  {
    title: '판정 근거 예시 보기',
    body: '격국 후보, 용신 판단, 시간 기준이 화면에서 어떻게 보이는지 먼저 확인합니다.',
    href: '/about-engine#decision-trace',
  },
] as const;

export const metadata: Metadata = {
  title: '멤버십',
  description: '대화 멤버십과 소장형 명리 기준서를 나누어, 달빛선생의 플랜과 보관형 리포트를 함께 살펴보세요.',
  alternates: {
    canonical: '/membership',
  },
};

export default async function MembershipPage({
  searchParams,
}: {
  searchParams?: Promise<{ focus?: string }>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const focus = resolvedSearchParams.focus;
  const subscriptionPlans = PLAN_BLUEPRINT.filter((plan) => plan.slug !== 'lifetime');

  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-12">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <SectionSurface surface="lunar" size="lg" className="app-mobile-safe-section">
          <div className="app-starfield" />
          <div className="grid gap-6 lg:grid-cols-[1fr_16rem] lg:items-center">
            <div>
              <SectionHeader
                eyebrow="소장형 리포트 · 대화형 멤버십"
                title="구독은 대화용, 리포트는 소장용입니다"
                titleClassName="text-4xl leading-[1.3] sm:text-5xl"
                description="달빛선생은 한 번 보고 사라지는 운세보다, 명식·격국·용신·대운의 기준을 오래 남기는 리포트를 중심에 둡니다. 월간 플랜은 질문을 이어가는 대화용으로, 소장형 리포트는 오래 다시 보는 결과물로 나누어 보시면 됩니다."
                descriptionClassName="max-w-3xl text-[var(--app-copy)]"
                actions={
                  <ActionCluster>
                    <Link
                      href="/saju/new"
                      className="moon-cta-primary"
                    >
                      내 명리 기준서 만들기
                    </Link>
                    <Link href={REPORT_SAMPLE_HREF} className="app-top-action-link">
                      샘플 리포트 보기
                    </Link>
                  </ActionCluster>
                }
              />
            </div>
            <div className="hidden justify-self-end lg:block">
              <div className="app-moon-orb h-28 w-28" />
              <div className="mt-4 rounded-full border border-[var(--app-gold)]/24 bg-[var(--app-gold)]/10 px-4 py-2 text-center text-xs text-[var(--app-gold-text)]">
                소장형 리포트 · 대화 멤버십
              </div>
            </div>
          </div>
        </SectionSurface>

        <section className="mt-8">
          <SectionHeader
            eyebrow="1. 소장형 리포트"
            title="먼저, 어떤 기준서를 남기고 싶은지 고르실 수 있습니다"
            titleClassName="text-3xl"
            description="원국 기준서는 바탕을, 연간 전략서는 올해의 흐름을, 궁합과 가족 리포트는 관계 구조를 중심으로 정리합니다."
            descriptionClassName="max-w-3xl"
          />
          <ProductGrid columns={2}>
            {COLLECTIBLE_REPORTS.map((report) => {
              const isFocused = focus === report.slug;
              const isReady = report.slug !== 'family-report';

              return (
                <SectionSurface
                  as="article"
                  key={report.slug}
                  surface="panel"
                  className={`moon-plan-card ${isFocused ? 'moon-glow-border' : ''}`}
                  data-featured={isFocused ? 'true' : 'false'}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="app-caption">{report.badge}</div>
                      <div className="rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-3 py-1 text-xs text-[var(--app-copy-muted)]">
                        {isReady ? '지금 흐름 보기' : '준비 중'}
                      </div>
                    </div>
                    <div className="rounded-full border border-[var(--app-gold)]/25 bg-[var(--app-gold)]/10 px-3 py-1 text-xs text-[var(--app-gold-text)]">
                      {report.price}
                    </div>
                  </div>
                  <h2 className="mt-4 font-display text-3xl text-[var(--app-gold-text)]">{report.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">{report.summary}</p>
                  <FeatureCard
                    className="mt-5"
                    surface="soft"
                    eyebrow="추천 대상"
                    description={report.recommendation}
                  />
                  <FeatureCard
                    className="mt-5"
                    surface="soft"
                    eyebrow="확인 내용"
                    description={report.status}
                  />
                  <ActionCluster className="mt-6">
                    <TrackedLink
                      href={report.href}
                      eventName="membership_report_card_click"
                      eventParams={{
                        reportSlug: report.slug,
                        href: report.href,
                        status: report.status,
                      }}
                      className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-gold)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-bright)]"
                    >
                      {isReady ? '이 리포트 흐름 보기' : '준비 중인 흐름 보기'}
                    </TrackedLink>
                  </ActionCluster>
                </SectionSurface>
              );
            })}
          </ProductGrid>
        </section>

        <section className="mt-8">
          <SectionHeader
            eyebrow="2. 대화형 멤버십"
            title="기준서를 오래 붙잡고 싶을 때는, 월간 대화 플랜을 고르시면 됩니다"
            titleClassName="text-3xl"
            description="멤버십은 결과물을 대신하는 상품이 아니라, 이미 읽은 기준서와 오늘의 질문을 계속 이어가는 보조 레이어입니다."
            descriptionClassName="max-w-3xl"
          />
          <ProductGrid columns={2} className="lg:items-start">
            {subscriptionPlans.map((plan, index) => {
              const guide = DIALOGUE_PLAN_GUIDES[plan.slug];

              return (
                <SectionSurface
                  as="article"
                  key={plan.title}
                  surface="panel"
                  className={`moon-plan-card ${index === 1 ? 'lg:-translate-y-3 moon-glow-border' : ''}`}
                  data-featured={index === 1 ? 'true' : 'false'}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="app-caption">{plan.badge}</div>
                    <div className="rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-3 py-1 text-xs text-[var(--app-copy-muted)]">
                      {plan.price}
                    </div>
                  </div>
                  <h2 className="mt-4 font-display text-3xl font-semibold text-[var(--app-ivory)]">
                    {plan.title}
                  </h2>
                  <div className="mt-4 rounded-[1.15rem] border border-[var(--app-gold)]/18 bg-[var(--app-surface-muted)] px-4 py-4">
                    <div className="app-caption">이 플랜이 맞는 순간</div>
                    <div className="mt-2 text-sm font-semibold text-[var(--app-gold-text)]">{guide.lead}</div>
                    <p className="mt-2 text-sm leading-7 text-[var(--app-copy)]">{guide.body}</p>
                  </div>
                  <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--app-copy)]">{plan.summary}</p>
                  <p className="mt-3 text-sm text-[var(--app-copy-muted)]">{plan.fit}</p>

                  <BulletList className="mt-5 text-sm text-[var(--app-copy)]" items={[...plan.features]} />

                  <FeatureCard
                    className="mt-5"
                    surface="soft"
                    eyebrow="리포트와 이어지는 방식"
                    children={
                      <BulletList
                        className="text-sm text-[var(--app-copy-muted)]"
                        markerClassName="text-[var(--app-gold)]/62"
                        items={[...plan.opens]}
                      />
                    }
                  />

                  <ActionCluster className="mt-6">
                    <Link
                      href={guide.href}
                      className={
                        index === 1
                          ? 'inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-gold)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-bright)]'
                          : 'inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 text-sm text-[var(--app-copy)] transition-colors hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]'
                      }
                    >
                      {guide.cta}
                    </Link>
                  </ActionCluster>
                </SectionSurface>
              );
            })}
          </ProductGrid>
        </section>

        <section className="mt-8">
          <SectionSurface surface="panel" size="lg">
            <div className="grid gap-6 lg:grid-cols-[1.04fr_0.96fr] lg:items-start">
              <div>
                <SectionHeader
                  eyebrow="3. 결정 전에 확인할 것"
                  title="비교와 읽을거리도 상품 결정에 필요한 만큼만 남겼습니다"
                  titleClassName="text-3xl"
                  description="일반 AI 사주와 다른 지점, 결제 전에 먼저 봐도 좋은 샘플/엔진 기준서, 그리고 어떤 순서로 고르면 덜 흔들리는지를 한곳에 모았습니다."
                  descriptionClassName="max-w-3xl"
                />

                <ProductGrid columns={3} className="mt-6">
                  {CATALOG_PROOF_GROUPS.map((group) => (
                    <FeatureCard
                      key={group.title}
                      surface="soft"
                      eyebrow={group.eyebrow}
                      title={group.title}
                      titleClassName="text-2xl"
                      children={<BulletList className="text-sm text-[var(--app-copy)]" items={group.points} />}
                    />
                  ))}
                </ProductGrid>

                <FeatureCard
                  className="mt-6"
                  surface="soft"
                  eyebrow="플랜을 고르는 순서"
                  children={
                    <div className="grid gap-3">
                      {INTERPRETATION_JOURNEY.map((step) => (
                        <div
                          key={step.title}
                          className="rounded-[1rem] border border-[var(--app-line)] bg-[rgba(255,255,255,0.02)] px-4 py-4"
                        >
                          <div className="text-sm font-medium text-[var(--app-ivory)]">{step.title}</div>
                          <p className="mt-2 text-sm leading-7 text-[var(--app-copy-muted)]">{step.body}</p>
                        </div>
                      ))}
                    </div>
                  }
                />
              </div>

              <div className="space-y-4">
                <SectionSurface surface="lunar">
                  <div className="app-starfield" />
                  <SectionHeader
                    eyebrow="결제 전 확인"
                    title="샘플과 기준서를 먼저 보셔도 괜찮습니다"
                    titleClassName="text-3xl text-[var(--app-gold-text)]"
                    description="리포트를 먼저 만들면 무엇이 내 바탕인지가 남고, 이후의 대화는 그 기준 위에서 훨씬 덜 흔들립니다. 아직 망설이신다면 아래 세 가지부터 보셔도 좋습니다."
                    descriptionClassName="text-[var(--app-copy)]"
                  />
                  <div className="mt-6 grid gap-3">
                    {PRE_PURCHASE_LINKS.map((item) => (
                      <FeatureCard
                        key={item.title}
                        surface="soft"
                        title={item.title}
                        titleClassName="text-xl"
                        description={item.body}
                        footer={
                          <Link
                            href={item.href}
                            className="text-sm text-[var(--app-gold-text)] underline underline-offset-4 hover:text-[var(--app-ivory)]"
                          >
                            바로 보기
                          </Link>
                        }
                      />
                    ))}
                  </div>
                  <ActionCluster className="mt-6">
                    <Link
                      href="/saju/new"
                      className="moon-cta-primary"
                    >
                      내 명리 기준서 만들기
                    </Link>
                    <Link
                      href={REPORT_SAMPLE_HREF}
                      className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-gold)]/35 bg-[var(--app-gold)]/14 px-5 text-sm text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/20"
                    >
                      샘플 리포트 보기
                    </Link>
                  </ActionCluster>
                </SectionSurface>

                <ProductGrid columns={2}>
                  {MEMBERSHIP_REASSURANCE.map((item) => (
                    <FeatureCard
                      key={item}
                      surface="soft"
                      description={item}
                    />
                  ))}
                </ProductGrid>
              </div>
            </div>
          </SectionSurface>

          <ReportKeepsakeSection className="mt-8" />
        </section>

        <section className="mt-8">
          <SafetyNotice variant="finance" />
        </section>
      </div>
    </AppShell>
  );
}
