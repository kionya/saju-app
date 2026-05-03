import Link from 'next/link';
import type { Metadata } from 'next';
import { ActionCluster } from '@/components/layout/action-cluster';
import { FeatureCard } from '@/components/layout/feature-card';
import { ProductGrid } from '@/components/layout/product-grid';
import { SectionHeader } from '@/components/layout/section-header';
import { SectionSurface } from '@/components/layout/section-surface';
import SiteHeader from '@/features/shared-navigation/site-header';
import {
  PLAN_BLUEPRINT,
  REPORT_SAMPLE_HREF,
  TASTE_PRODUCTS,
} from '@/content/moonlight';
import { PRODUCT_REPORT_CATALOG } from '@/content/report-catalog';
import { PAYMENT_PACKAGES } from '@/lib/payments/catalog';
import { AppPage, AppShell, PageHero } from '@/shared/layout/app-shell';

export const metadata: Metadata = {
  title: '가격 한눈보기',
  description: '달빛선생의 소액 풀이, 소장형 리포트, 대화 멤버십, 코인팩을 한 화면에서 비교합니다.',
  alternates: {
    canonical: '/pricing',
  },
};

const REPORT_PRICE_BY_SLUG: Record<string, string> = {
  'life-standard': '49,000원~79,000원',
  'yearly-2026': '39,000원~69,000원',
  'career-money': '49,000원~79,000원',
  'relationship-standard': '59,000원~89,000원',
  'family-report': '99,000원~129,000원',
  decision: '39,000원~69,000원',
  monthly: '1,900원부터',
  dialogue: '월 4,900원부터',
};

const CREDIT_PACKAGES = PAYMENT_PACKAGES.filter((item) => item.kind === 'credits' || item.id === 'subscription_30');
const DIALOGUE_PLANS = PLAN_BLUEPRINT.filter((plan) => plan.slug !== 'lifetime');

function formatWon(value: number) {
  return `${value.toLocaleString('ko-KR')}원`;
}

export default function PricingPage() {
  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-12">
      <AppPage className="space-y-8">
        <PageHero
          title="달빛선생 가격 한눈보기"
          description="먼저 내 풀이를 확인하신 뒤, 더 깊게 남기고 싶을 때 이 화면에서 소액 풀이, 소장형 리포트, 대화 멤버십, 코인팩을 차분히 비교하시면 됩니다."
        />

        <SectionSurface surface="lunar" size="lg">
          <div className="app-starfield" />
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <SectionHeader
              eyebrow="먼저 해석, 그다음 선택"
              title="가격은 시작점이 아니라, 결과를 본 뒤 고르는 선택지입니다"
              titleClassName="text-3xl text-[var(--app-gold-text)]"
              description="처음부터 큰 리포트를 고르지 않아도 됩니다. 오늘의 한 줄, 월간 달력, 명리 기준서, 대화 멤버십이 어떤 차이인지 한곳에서 비교할 수 있게 분리했습니다."
              descriptionClassName="max-w-3xl text-[var(--app-copy)]"
            />
            <ActionCluster className="lg:justify-end">
              <Link href="/saju/new" className="moon-cta-primary">
                사주풀이 먼저 보기
              </Link>
              <Link href={REPORT_SAMPLE_HREF} className="moon-action-secondary">
                샘플 보기
              </Link>
            </ActionCluster>
          </div>
        </SectionSurface>

        <section>
          <SectionHeader
            eyebrow="작게 열어보기"
            title="오늘 궁금한 것만 짧게 확인하는 상품"
            titleClassName="text-3xl"
            description="소액 상품은 큰 기준서로 바로 가기 전, 지금 궁금한 질문 하나를 먼저 확인하는 입구입니다."
            descriptionClassName="max-w-3xl"
          />
          <ProductGrid columns={4} className="mt-6">
            {TASTE_PRODUCTS.map((product) => (
              <Link
                key={product.slug}
                href={product.href}
                className="group app-feature-card-soft min-h-[14rem] transition-colors hover:border-[var(--app-gold)]/36 hover:bg-[var(--app-gold)]/8"
              >
                <div className="app-caption">{product.price}</div>
                <h2 className="mt-3 font-display text-xl leading-7 text-[var(--app-ivory)]">
                  {product.title}
                </h2>
                <p className="mt-3 text-sm font-medium leading-6 text-[var(--app-gold-text)]">
                  {product.question}
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--app-copy-muted)]">
                  {product.result}
                </p>
                <div className="mt-4 text-xs text-[var(--app-copy-soft)]">{product.status}</div>
              </Link>
            ))}
          </ProductGrid>
        </section>

        <section>
          <SectionHeader
            eyebrow="소장형 리포트"
            title="오래 다시 볼 기준서형 상품"
            titleClassName="text-3xl"
            description="내 사주의 바탕, 올해 흐름, 관계 구조처럼 오래 남겨두고 다시 볼 내용은 소장형 리포트로 분리했습니다."
            descriptionClassName="max-w-3xl"
          />
          <ProductGrid columns={2} className="mt-6">
            {PRODUCT_REPORT_CATALOG.slice(0, 6).map((report) => (
              <FeatureCard
                key={report.slug}
                surface="soft"
                eyebrow={REPORT_PRICE_BY_SLUG[report.slug] ?? '가격 확인'}
                title={report.title}
                titleClassName="text-2xl"
                description={report.summary}
                footer={
                  <div className="space-y-3">
                    <p className="text-sm leading-7 text-[var(--app-copy-muted)]">{report.recommendation}</p>
                    <Link
                      href={report.href}
                      className="inline-flex text-sm font-medium text-[var(--app-gold-text)] underline underline-offset-4 hover:text-[var(--app-ivory)]"
                    >
                      {report.whatToCheck}
                    </Link>
                  </div>
                }
              />
            ))}
          </ProductGrid>
        </section>

        <section>
          <SectionHeader
            eyebrow="대화형 멤버십"
            title="기준서를 본 뒤 질문을 계속 이어가고 싶을 때"
            titleClassName="text-3xl"
            description="멤버십은 결과물을 대신하는 상품이 아니라, 이미 본 풀이를 생활 질문으로 이어가는 대화용 선택지입니다."
            descriptionClassName="max-w-3xl"
          />
          <ProductGrid columns={2} className="mt-6">
            {DIALOGUE_PLANS.map((plan) => (
              <FeatureCard
                key={plan.slug}
                surface="soft"
                eyebrow={plan.price}
                title={plan.title}
                titleClassName="text-2xl"
                description={plan.summary}
                footer={
                  <ActionCluster>
                    <Link
                      href={`/membership/checkout?plan=${plan.slug}&from=pricing`}
                      className={plan.slug === 'premium' ? 'moon-action-primary' : 'moon-action-secondary'}
                    >
                      {plan.slug === 'premium' ? 'Premium 보기' : '라이트 보기'}
                    </Link>
                  </ActionCluster>
                }
              />
            ))}
          </ProductGrid>
        </section>

        <section>
          <SectionHeader
            eyebrow="코인팩"
            title="필요한 기능만 열어볼 때 쓰는 충전권"
            titleClassName="text-3xl"
            description="코인은 상세해석, 달력, 일부 기능을 작게 열어볼 때 사용합니다. 이미 해금한 항목은 재열람 기준을 먼저 확인하도록 설계되어 있습니다."
            descriptionClassName="max-w-3xl"
          />
          <ProductGrid columns={4} className="mt-6">
            {CREDIT_PACKAGES.map((pack) => (
              <FeatureCard
                key={pack.id}
                surface="soft"
                eyebrow={formatWon(pack.price)}
                title={pack.name}
                titleClassName="text-xl"
                description={`${pack.credits}코인`}
                footer={
                  <Link
                    href="/credits"
                    className="text-sm font-medium text-[var(--app-gold-text)] underline underline-offset-4 hover:text-[var(--app-ivory)]"
                  >
                    코인 충전 화면으로 이동
                  </Link>
                }
              />
            ))}
          </ProductGrid>
        </section>
      </AppPage>
    </AppShell>
  );
}
