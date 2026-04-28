import Link from 'next/link';
import type { Metadata } from 'next';
import SiteHeader from '@/features/shared-navigation/site-header';
import { EngineMethodLinks } from '@/components/content/engine-method-links';
import { AppShell } from '@/shared/layout/app-shell';
import {
  INTERPRETATION_JOURNEY,
  MEMBERSHIP_REASSURANCE,
  PLAN_BLUEPRINT,
  REPORT_SAMPLE_HREF,
} from '@/content/moonlight';

export const metadata: Metadata = {
  title: '멤버십',
  description: '대화 멤버십과 소장형 명리 기준서를 나누어, 달빛선생의 플랜과 보관형 리포트를 함께 살펴보세요.',
  alternates: {
    canonical: '/membership',
  },
};

export default function MembershipPage() {
  const subscriptionPlans = PLAN_BLUEPRINT.filter((plan) => plan.slug !== 'lifetime');
  const lifetimePlan = PLAN_BLUEPRINT.find((plan) => plan.slug === 'lifetime') ?? PLAN_BLUEPRINT[2];

  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-12">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="moon-lunar-panel p-7 sm:p-8">
          <div className="app-starfield" />
          <div className="grid gap-6 lg:grid-cols-[1fr_16rem] lg:items-center">
            <div>
              <div className="app-caption">대화 멤버십 · 소장형 기준서</div>
              <h1 className="mt-4 font-display text-4xl leading-[1.3] tracking-tight text-[var(--app-ivory)] sm:text-5xl">
                구독은 대화용으로, 리포트는 소장용으로 나누었습니다
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--app-copy)]">
                격국, 용신, 대운처럼 결과를 크게 바꾸는 항목은 AI의 말맛에 맡기지 않고 엔진 기준으로 먼저 계산합니다.
                월간 플랜은 질문을 계속 이어가는 대화용으로, 명리 기준서는 PDF와 MY 보관함에 오래 남기는 소장형으로 분리했습니다.
              </p>
            </div>
            <div className="hidden justify-self-end lg:block">
              <div className="app-moon-orb h-28 w-28" />
              <div className="mt-4 rounded-full border border-[var(--app-gold)]/24 bg-[var(--app-gold)]/10 px-4 py-2 text-center text-xs text-[var(--app-gold-text)]">
                대화 멤버십 · 명리 기준서
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="app-caption">1. 대화 멤버십</div>
            <div className="rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-3 py-1 text-xs text-[var(--app-copy-muted)]">
              질문을 계속 이어가는 월간 플랜
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
          {subscriptionPlans.map((plan, index) => (
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

              <div className="mt-5 rounded-[1.15rem] border border-[var(--app-gold)]/18 bg-[var(--app-surface-muted)] px-4 py-4">
                <div className="app-caption">지금 열리는 것</div>
                <div className="mt-3 space-y-2">
                  {plan.opens.map((item) => (
                    <div key={item} className="text-sm leading-7 text-[var(--app-copy-muted)]">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href={
                    plan.slug === 'basic'
                      ? '/membership/checkout?plan=basic&from=membership'
                      : plan.slug === 'premium'
                        ? '/membership/checkout?plan=premium&from=membership'
                        : '/saju/new'
                  }
                  className={
                    index === 1
                      ? 'inline-flex h-11 w-full items-center justify-center rounded-full bg-[var(--app-gold)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-bright)]'
                      : 'inline-flex h-11 w-full items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 text-sm text-[var(--app-copy)] transition-colors hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]'
                  }
                >
                  {index === 0 ? '라이트 멤버십 시작하기' : 'Premium 멤버십 시작하기'}
                </Link>
              </div>
            </article>
          ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <article className="moon-plan-card p-6" data-featured="true">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="app-caption">2. 소장형 기준서</div>
                <h2 className="mt-4 font-display text-3xl text-[var(--app-gold-text)]">
                  {lifetimePlan.title}
                </h2>
              </div>
              <div className="rounded-full border border-[var(--app-gold)]/25 bg-[var(--app-gold)]/10 px-3 py-1 text-xs text-[var(--app-gold-text)]">
                {lifetimePlan.price}
              </div>
            </div>
            <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
              {lifetimePlan.summary}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                '격국·용신·대운을 한 권의 기준서로',
                '판정 근거와 KASI 대조를 함께 보기',
                'PDF와 MY 보관함에 오래 남기기',
                '업데이트 반영본을 다시 펼쳐보기',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-4 text-sm leading-7 text-[var(--app-copy)]"
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-[1.15rem] border border-[var(--app-gold)]/18 bg-[var(--app-surface-muted)] px-4 py-4">
              <div className="app-caption">결제 전 미리보기</div>
              <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">
                평생 소장형은 결제 전에도 미리보기를 통해 목차, 판정 근거, 연간 부록 구조를 먼저 확인할 수 있습니다.
                샘플 기준서를 한 번 보고 나면 “긴 글”보다 “왜 그렇게 판정했는가”가 어떻게 남는지 체감하실 수 있습니다.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={REPORT_SAMPLE_HREF}
                className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-gold)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-bright)]"
              >
                샘플 기준서 보기
              </Link>
              <Link
                href="/saju/new"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-gold)]/35 bg-[var(--app-gold)]/12 px-5 text-sm text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/18"
              >
                내 기준서 만들기
              </Link>
            </div>
          </article>

          <article className="app-panel p-6">
            <div className="app-caption">왜 멤버십과 기준서를 나누었나</div>
            <h2 className="mt-4 text-3xl font-semibold text-[var(--app-ivory)]">
              많이 보는 것과 오래 남기는 것은 다른 가치이기 때문입니다
            </h2>
            <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
              일반 AI 해석이 가장 흔들리기 쉬운 부분은 명식 계산과 격국·용신 판정입니다. 달빛선생은
              대화 멤버십에서는 이 기준 위에서 질문을 계속 이어가게 하고, 명리 기준서에서는 같은 계산 결과를
              PDF와 보관함에 남겨 오래 재열람할 수 있게 분리합니다.
            </p>
            <div className="mt-5 grid gap-3">
              {[
                ['대화 멤버십', '질문을 계속 이어 묻고, 이미 계산된 명식 위에서 상황별 상담을 반복하는 용도입니다.'],
                ['명리 기준서', '원국, 격국, 용신, 대운을 한 편의 소장형 리포트로 남기는 용도입니다.'],
                ['PDF와 보관함', '한 번 결제한 기준서는 PDF와 MY 보관함에 남아 이후 월운과 대화의 기준점이 됩니다.'],
                ['판정 근거', '강약, 격국 후보, 용신 후보, KASI 대조를 함께 보여 “왜 이렇게 보았는지”를 남깁니다.'],
              ].map(([label, body]) => (
                <div
                  key={label}
                  className="rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-4"
                >
                  <div className="text-sm font-semibold text-[var(--app-ivory)]">{label}</div>
                  <p className="mt-2 text-sm leading-7 text-[var(--app-copy)]">{body}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="moon-lunar-panel p-6">
            <div className="app-starfield" />
            <div className="app-caption">샘플 리포트와 근거</div>
            <h2 className="mt-4 text-3xl font-semibold text-[var(--app-gold-text)]">
              결제 전에도 판정 근거와 샘플 기준서를 먼저 보셔도 괜찮습니다
            </h2>
            <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
              /about-engine 페이지에서는 달빛선생이 왜 AI에게 명식 계산을 맡기지 않는지, 시간 보정과
              격국·용신 판정을 어떤 순서로 읽는지, 기준서에서 어떤 근거를 보여주는지를 한 번에 정리해
              두었습니다. 샘플 기준서에서는 같은 구조가 실제 상품 화면에서 어떻게 보이는지 바로 체감할 수 있습니다.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={REPORT_SAMPLE_HREF}
                className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-gold)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-bright)]"
              >
                샘플 기준서 보기
              </Link>
              <Link
                href="/about-engine"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 text-sm text-[var(--app-copy)] transition-colors hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]"
              >
                엔진 기준서 보기
              </Link>
              <Link
                href="/about-engine#decision-trace"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-gold)]/35 bg-[var(--app-gold)]/12 px-5 text-sm text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/18"
              >
                판정 근거 예시 보기
              </Link>
            </div>
          </article>
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
            <div className="app-caption">가장 많이 고르는 시작법</div>
            <div className="mt-4 font-display text-3xl text-[var(--app-gold-text)]">
              먼저 대화 멤버십으로 질문을 이어보고,
              <br />
              오래 남길 해석은 명리 기준서로
            </div>
            <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
              횟수를 늘리는 것보다 계산 기준이 어떻게 고정되는지 먼저 체감하는 편이 더 중요합니다. Premium 대화 멤버십은 올해와 현재 운을 반복 상담으로 쓰고, 명리 기준서는 원국 중심 해설을 오래 보관하는 구조입니다.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/membership/checkout?plan=premium&from=membership"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-gold)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-bright)]"
              >
                Premium 멤버십 시작하기
              </Link>
              <Link
                href={REPORT_SAMPLE_HREF}
                className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-gold)]/35 bg-[var(--app-gold)]/14 px-5 text-sm text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/20"
              >
                샘플 기준서 보기
              </Link>
            </div>
          </article>
        </section>
      </div>
    </AppShell>
  );
}
