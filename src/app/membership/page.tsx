import Link from 'next/link';
import type { Metadata } from 'next';
import SiteHeader from '@/features/shared-navigation/site-header';
import { AppShell } from '@/shared/layout/app-shell';
import {
  INTERPRETATION_JOURNEY,
  MEMBERSHIP_REASSURANCE,
  PLAN_BLUEPRINT,
} from '@/content/moonlight';

export const metadata: Metadata = {
  title: '멤버십',
  description: '라이트, Premium, Lifetime 세 가지 선택지로 달빛선생의 멤버십을 살펴보세요.',
  alternates: {
    canonical: '/membership',
  },
};

export default function MembershipPage() {
  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-12">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="moon-lunar-panel p-7 sm:p-8">
          <div className="app-starfield" />
          <div className="grid gap-6 lg:grid-cols-[1fr_16rem] lg:items-center">
            <div>
              <div className="app-caption">결제 · 플랜</div>
              <h1 className="mt-4 font-[var(--font-heading)] text-4xl leading-[1.3] tracking-tight text-[var(--app-ivory)] sm:text-5xl">
                프리미엄 리포트는 긴 글이 아니라, 판정 기준이 고정된 해석입니다
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--app-copy)]">
                격국, 용신, 대운처럼 결과를 크게 바꾸는 항목은 AI의 말맛에 맡기지 않고 엔진 기준으로 먼저 계산합니다. 각 플랜은 그 계산 결과를 얼마나 깊고 오래 보관하느냐의 차이로 나뉩니다.
              </p>
            </div>
            <div className="hidden justify-self-end lg:block">
              <div className="app-moon-orb h-28 w-28" />
              <div className="mt-4 rounded-full border border-[var(--app-gold)]/24 bg-[var(--app-gold)]/10 px-4 py-2 text-center text-xs text-[var(--app-gold-text)]">
                라이트 · Premium · Lifetime
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-[0.92fr_1.06fr_0.92fr] lg:items-start">
          {PLAN_BLUEPRINT.map((plan, index) => (
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
              <h2 className="mt-4 font-[var(--font-heading)] text-3xl font-semibold text-[var(--app-ivory)]">
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
                  {index === 0 ? '라이트 시작하기' : index === 1 ? 'Premium 시작하기' : '평생 리포트 열기'}
                </Link>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <article className="app-panel p-6">
            <div className="app-caption">왜 Premium이 더 깊은가</div>
            <h2 className="mt-4 text-3xl font-semibold text-[var(--app-ivory)]">
              혜택보다 먼저, 계산 기준이 어떻게 고정되는지 보실 수 있습니다
            </h2>
            <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
              일반 AI 해석이 가장 흔들리기 쉬운 부분은 명식 계산과 격국·용신 판정입니다. 달빛선생
              Premium은 같은 생년월일이라도 어떤 기준으로 계산하고 어떤 판정 근거를 펼쳐주는지 먼저
              확인할 수 있게 구성합니다.
            </p>
            <div className="mt-5 grid gap-3">
              {[
                ['명식 계산', '출생 정보로 먼저 명식과 운의 구조를 계산합니다.'],
                ['격국·용신', '월령, 투출, 강약, 계절성을 함께 보고 판정합니다.'],
                ['시간 처리', '출생지·진태양시·야자시·조자시 규칙을 분리해 적용합니다.'],
                ['설명 방식', 'AI는 계산 결과를 선생의 말투로 풀어주는 역할만 맡습니다.'],
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
            <div className="app-caption">엔진 기준서</div>
            <h2 className="mt-4 text-3xl font-semibold text-[var(--app-gold-text)]">
              판정 근거를 먼저 보고, 그다음에 플랜을 고르셔도 괜찮습니다
            </h2>
            <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
              /about-engine 페이지에서는 달빛선생이 왜 AI에게 명식 계산을 맡기지 않는지, 시간 보정과
              격국·용신 판정을 어떤 순서로 읽는지, 리포트에서 어떤 근거를 보여주는지를 한 번에
              정리해 두었습니다.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/about-engine"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-gold)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-bright)]"
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
            <div className="mt-4 font-[var(--font-heading)] text-3xl text-[var(--app-gold-text)]">
              먼저 Premium으로 기준을 읽어보고,
              <br />
              오래 남길 해석은 Lifetime으로
            </div>
            <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
              횟수를 늘리는 것보다 계산 기준이 어떻게 고정되는지 먼저 체감하는 편이 더 중요합니다. Premium은 올해와 현재 운의 흐름을, Lifetime은 원국 중심 기준서를 오래 보관하는 구조입니다.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/membership/checkout?plan=premium&from=membership"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-gold)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-bright)]"
              >
                Premium 시작하기
              </Link>
              <Link
                href="/saju/new"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-gold)]/35 bg-[var(--app-gold)]/14 px-5 text-sm text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/20"
              >
                평생 리포트 바로 보기
              </Link>
            </div>
          </article>
        </section>
      </div>
    </AppShell>
  );
}
