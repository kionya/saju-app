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
  description: 'Plus, 프리미엄, 평생 심층 리포트 세 가지 선택지로 달빛선생의 멤버십을 살펴보세요.',
  alternates: {
    canonical: '/membership',
  },
};

export default function MembershipPage() {
  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-12">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="app-hero-card p-7 sm:p-8">
          <div className="app-caption">결제 · 플랜</div>
          <h1 className="mt-4 font-[var(--font-heading)] text-4xl leading-[1.3] tracking-tight text-[var(--app-ivory)] sm:text-5xl">
            부담은 덜고, 필요한 깊이만큼만 곁에 두실 수 있습니다
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--app-copy)]">
            결제는 늘 조심스러운 일이라, 먼저 가격과 열리는 혜택, 해지와 환불 안내를 한곳에 차분히 모아두었습니다.
          </p>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-[0.92fr_1.06fr_0.92fr] lg:items-start">
          {PLAN_BLUEPRINT.map((plan, index) => (
            <article
              key={plan.title}
              className={
                index === 1
                  ? 'relative rounded-[1.75rem] border border-[var(--app-gold)]/28 bg-[linear-gradient(180deg,rgba(210,176,114,0.12),rgba(10,18,36,0.96))] p-6 lg:-translate-y-3'
                  : 'app-panel p-6'
              }
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

              <div className="mt-5 rounded-[1.15rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-4">
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
                      ? '/membership/checkout?plan=basic'
                      : plan.slug === 'premium'
                        ? '/membership/checkout?plan=premium'
                        : '/membership/checkout?plan=lifetime'
                  }
                  className={
                    index === 1
                      ? 'inline-flex h-11 w-full items-center justify-center rounded-full border border-[var(--app-gold)]/35 bg-[var(--app-gold)]/16 px-5 text-sm font-semibold text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/22'
                      : 'inline-flex h-11 w-full items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 text-sm text-[var(--app-copy)] transition-colors hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]'
                  }
                >
                  {index === 0 ? 'Plus 시작하기' : index === 1 ? '프리미엄 시작하기' : '평생 리포트 열기'}
                </Link>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          {MEMBERSHIP_REASSURANCE.map((item) => (
            <article key={item} className="app-panel p-5 text-sm leading-7 text-[var(--app-copy)]">
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

          <article className="rounded-[1.75rem] border border-[var(--app-gold)]/28 bg-[linear-gradient(180deg,rgba(210,176,114,0.12),rgba(10,18,36,0.96))] p-6 lg:mt-1">
            <div className="app-caption">가장 많이 고르는 시작법</div>
            <div className="mt-4 font-[var(--font-heading)] text-3xl text-[var(--app-gold-text)]">
              먼저 프리미엄으로 넉넉히 써보고,
              <br />
              오래 남길 해석은 평생 리포트로
            </div>
            <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
              먼저 넓게 써보신 뒤 정말 자주 다시 보고 싶은 해석만 오래 남기는 방식이 가장 편안합니다.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/membership/checkout?plan=premium"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-gold)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-bright)]"
              >
                프리미엄 시작하기
              </Link>
              <Link
                href="/membership/checkout?plan=lifetime"
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
