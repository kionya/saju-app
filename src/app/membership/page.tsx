import Link from 'next/link';
import type { Metadata } from 'next';
import { SafetyNotice } from '@/components/common/safety-notice';
import { TrackedLink } from '@/components/common/tracked-link';
import { EngineMethodLinks } from '@/components/content/engine-method-links';
import SiteHeader from '@/features/shared-navigation/site-header';
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
    checks: '원국 구조, 격국 후보, 용신 판단, 대운 흐름',
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
    checks: '월별 흐름, 강한 달, 조심할 달, 바로 쓰는 행동 기준',
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
    checks: '기본 결, 갈등 지점, 보완 방식, 오래 가는 대화법',
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
    checks: '가족 관계 구조, 기대 역할, 부딪히는 패턴, 조율 포인트',
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
        <section className="moon-lunar-panel p-7 sm:p-8">
          <div className="app-starfield" />
          <div className="grid gap-6 lg:grid-cols-[1fr_16rem] lg:items-center">
            <div>
              <div className="app-caption">소장형 리포트 · 대화형 멤버십</div>
              <h1 className="mt-4 font-display text-4xl leading-[1.3] tracking-tight text-[var(--app-ivory)] sm:text-5xl">
                구독은 대화용, 리포트는 소장용입니다
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--app-copy)]">
                달빛선생은 한 번 보고 사라지는 운세보다, 명식·격국·용신·대운의 기준을 오래 남기는 리포트를 중심에 둡니다.
                월간 플랜은 질문을 계속 이어가는 대화용으로, 소장형 리포트는 PDF와 MY 보관함에 남기는 결과물로 나누어 보실 수 있습니다.
              </p>
            </div>
            <div className="hidden justify-self-end lg:block">
              <div className="app-moon-orb h-28 w-28" />
              <div className="mt-4 rounded-full border border-[var(--app-gold)]/24 bg-[var(--app-gold)]/10 px-4 py-2 text-center text-xs text-[var(--app-gold-text)]">
                소장형 리포트 · 대화 멤버십
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="app-caption">1. 소장형 리포트</div>
            <div className="rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-3 py-1 text-xs text-[var(--app-copy-muted)]">
              한 권의 기준서처럼 오래 남기는 결과물
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {COLLECTIBLE_REPORTS.map((report) => {
              const isFocused = focus === report.slug;
              const isReady = report.slug !== 'family-report';

              return (
                <article
                  key={report.slug}
                  className={`moon-plan-card p-6 ${isFocused ? 'moon-glow-border' : ''}`}
                  data-featured={isFocused ? 'true' : 'false'}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="app-caption">{report.badge}</div>
                      <div className="rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-3 py-1 text-xs text-[var(--app-copy-muted)]">
                        {report.status}
                      </div>
                    </div>
                    <div className="rounded-full border border-[var(--app-gold)]/25 bg-[var(--app-gold)]/10 px-3 py-1 text-xs text-[var(--app-gold-text)]">
                      {report.price}
                    </div>
                  </div>
                  <h2 className="mt-4 font-display text-3xl text-[var(--app-gold-text)]">{report.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">{report.summary}</p>
                  <div className="mt-5 rounded-[1.15rem] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-4">
                    <div className="app-caption">추천 대상</div>
                    <p className="mt-2 text-sm leading-7 text-[var(--app-copy)]">{report.recommendation}</p>
                  </div>
                  <div className="mt-5 rounded-[1.15rem] border border-[var(--app-gold)]/18 bg-[var(--app-surface-muted)] px-4 py-4">
                    <div className="app-caption">확인 내용</div>
                    <p className="mt-2 text-sm leading-7 text-[var(--app-copy)]">{report.checks}</p>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
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
                    <Link
                      href={REPORT_SAMPLE_HREF}
                      className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-gold)]/35 bg-[var(--app-gold)]/12 px-5 text-sm text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/18"
                    >
                      샘플 리포트 보기
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="app-caption">2. 대화형 멤버십</div>
            <div className="rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-3 py-1 text-xs text-[var(--app-copy-muted)]">
              질문을 계속 이어가는 월간 플랜
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
            {subscriptionPlans.map((plan, index) => {
              const guide = DIALOGUE_PLAN_GUIDES[plan.slug];

              return (
                <article
                  key={plan.title}
                  className={`moon-plan-card p-6 ${index === 1 ? 'lg:-translate-y-3 moon-glow-border' : ''}`}
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

                  <ul className="mt-5 space-y-2 text-sm text-[var(--app-copy)]">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <span className="mt-[0.38rem] h-1.5 w-1.5 rounded-full bg-[var(--app-gold)]/70" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 rounded-[1.15rem] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-4">
                    <div className="app-caption">리포트와 이어지는 방식</div>
                    <div className="mt-3 space-y-2">
                      {plan.opens.map((item) => (
                        <div key={item} className="text-sm leading-7 text-[var(--app-copy-muted)]">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
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
                    <Link
                      href={REPORT_SAMPLE_HREF}
                      className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-gold)]/35 bg-[var(--app-gold)]/12 px-5 text-sm text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/18"
                    >
                      샘플 리포트 보기
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="app-caption">3. 비교</div>
            <div className="rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-3 py-1 text-xs text-[var(--app-copy-muted)]">
              일반 AI 사주와 달빛선생 리포트의 차이
            </div>
          </div>
          <div className="overflow-hidden rounded-[1.6rem] border border-[var(--app-line)] bg-[var(--app-surface)]/85">
            <div className="hidden grid-cols-[10rem_1fr_1fr] border-b border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] text-sm text-[var(--app-copy-muted)] md:grid">
              <div className="px-5 py-4">항목</div>
              <div className="px-5 py-4">일반 AI 사주</div>
              <div className="px-5 py-4 text-[var(--app-gold-text)]">달빛선생 리포트</div>
            </div>
            {COMPARISON_ROWS.map((row) => (
              <div
                key={row.label}
                className="grid gap-3 border-t border-[var(--app-line)] px-5 py-5 first:border-t-0 md:grid-cols-[10rem_1fr_1fr] md:gap-5"
              >
                <div className="text-sm font-semibold text-[var(--app-ivory)]">{row.label}</div>
                <div className="text-sm leading-7 text-[var(--app-copy)]">{row.ai}</div>
                <div className="text-sm leading-7 text-[var(--app-gold-text)]">{row.moonlight}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <EngineMethodLinks
            title="결제 전에도, 왜 구독과 기준서를 나누었는지 먼저 보셔도 됩니다"
            description="멤버십은 계속 묻기 위한 플랜이고, 명리 기준서는 오래 남기기 위한 상품입니다. 아래 글들은 그 차이를 납득시키는 데 가장 직접적인 읽을거리입니다."
            slugs={[
              'why-pattern-judgments-diverge',
              'why-yongsin-is-hard',
              'why-ai-saju-differs-from-calendar-apps',
              'how-to-read-daewoon-and-sewoon-together',
            ]}
            ctaHref="/about-engine"
            ctaLabel="엔진 기준서와 함께 보기"
          />
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          {MEMBERSHIP_REASSURANCE.map((item) => (
            <article key={item} className="moon-orbit-card p-5 text-sm leading-7 text-[var(--app-copy)]">
              {item}
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.96fr_1.04fr] lg:items-start">
          <article className="app-panel p-6">
            <div className="app-caption">플랜을 고르는 기준</div>
            <div className="mt-5 space-y-4">
              {INTERPRETATION_JOURNEY.map((step) => (
                <div
                  key={step.title}
                  className="rounded-[1.15rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-4"
                >
                  <div className="text-sm font-medium text-[var(--app-ivory)]">{step.title}</div>
                  <p className="mt-2 text-sm leading-7 text-[var(--app-copy-muted)]">{step.body}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="moon-lunar-panel p-6 lg:mt-1">
            <div className="app-starfield" />
            <div className="app-caption">마지막 안내</div>
            <div className="mt-4 font-display text-3xl text-[var(--app-gold-text)]">
              기준은 오래 남기고,
              <br />
              질문은 그 위에서 이어갑니다
            </div>
            <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
              먼저 소장형 리포트로 원국과 대운의 축을 남겨두고, 생활에 붙는 질문은 대화 멤버십으로 이어가는 방식이 가장 자연스럽습니다.
              샘플 기준서를 먼저 보신 뒤, 지금 나에게 맞는 시작점을 골라보셔도 좋습니다.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/saju/new"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-gold)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-bright)]"
              >
                내 명리 기준서 만들기
              </Link>
              <Link
                href={REPORT_SAMPLE_HREF}
                className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-gold)]/35 bg-[var(--app-gold)]/14 px-5 text-sm text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/20"
              >
                샘플 리포트 보기
              </Link>
            </div>
          </article>
        </section>

        <section className="mt-8">
          <SafetyNotice variant="finance" />
        </section>
      </div>
    </AppShell>
  );
}
