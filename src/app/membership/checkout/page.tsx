import Link from 'next/link';
import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import {
  CHECKOUT_PLAN_GUIDE,
  CHECKOUT_METHODS,
  MEMBERSHIP_REASSURANCE,
  type PlanSlug,
} from '@/content/moonlight';
import SiteHeader from '@/features/shared-navigation/site-header';
import { AppShell } from '@/shared/layout/app-shell';

interface Props {
  searchParams: Promise<{ plan?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '결제',
    description: '프리미엄 체크아웃 화면입니다.',
  };
}

export default async function MembershipCheckoutPage({ searchParams }: Props) {
  const { plan } = await searchParams;
  const selectedPlan = ((plan as PlanSlug | undefined) ?? 'premium') as PlanSlug;
  const selected = CHECKOUT_PLAN_GUIDE[selectedPlan] ?? CHECKOUT_PLAN_GUIDE.premium;

  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-12">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="app-hero-card p-7 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/membership"
              className="text-sm text-[var(--app-gold-soft)] transition-colors hover:text-[var(--app-ivory)]"
            >
              ← 뒤로
            </Link>
            <Badge className="border-[var(--app-gold)]/25 bg-[var(--app-gold)]/10 text-[var(--app-gold-soft)]">
              결제
            </Badge>
          </div>
          <h1 className="mt-5 font-[var(--font-heading)] text-4xl text-[var(--app-ivory)] sm:text-5xl">
            선택하신 플랜을 확인해주세요
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--app-copy)]">
            결제 전에는 가격, 결제 방식, 해지와 환불 기준을 한 화면에서 모두 보이게 두어야
            불안감 없이 결정하실 수 있습니다.
          </p>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <article className="rounded-[1.75rem] border border-[var(--app-gold)]/28 bg-[linear-gradient(180deg,rgba(210,176,114,0.12),rgba(10,18,36,0.96))] p-6 text-center">
            <div className="app-caption">선택하신 플랜</div>
            <div className="mt-4 font-[var(--font-heading)] text-3xl text-[var(--app-gold-text)]">
              {selected.title}
            </div>
            <div className="mt-3 font-[var(--font-heading)] text-4xl text-[var(--app-ivory)]">
              {selected.price}
            </div>
            <p className="mt-3 text-sm leading-7 text-[var(--app-copy-muted)]">
              {selected.nextRange}
            </p>
            <p className="mt-4 text-sm leading-7 text-[var(--app-copy)]">{selected.reassurance}</p>
          </article>

          <article className="app-panel p-6">
            <div className="app-caption">결제 방법</div>
            <div className="mt-5 grid gap-3">
              {CHECKOUT_METHODS.map((method, index) => (
                <div
                  key={method}
                  className={`flex items-center gap-3 rounded-[1rem] px-4 py-4 ${
                    index === 0
                      ? 'border-2 border-[var(--app-gold)]/45 bg-[var(--app-surface-strong)]'
                      : 'border border-[var(--app-line)] bg-[var(--app-surface-muted)]'
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                      index === 0
                        ? 'bg-[var(--app-gold)] text-[var(--app-bg)]'
                        : 'border border-[var(--app-line)] text-transparent'
                    }`}
                  >
                    ✓
                  </div>
                  <div className="text-sm text-[var(--app-ivory)]">{method}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[1.2rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 py-5">
              <div className="app-caption">결제 후 바로 열리는 것</div>
              <div className="mt-3 space-y-2">
                {selected.opens.map((item) => (
                  <div key={item} className="text-sm leading-7 text-[var(--app-copy)]">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-[1.2rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 py-5 text-sm leading-7 text-[var(--app-copy-muted)]">
              {MEMBERSHIP_REASSURANCE.map((item) => (
                <div key={item}>{item}</div>
              ))}
            </div>

            <div className="mt-6 rounded-[1.2rem] border border-[var(--app-gold)]/18 bg-[rgba(255,255,255,0.02)] px-5 py-5">
              <div className="app-caption">한 번 더 확인해주세요</div>
              <div className="mt-3 space-y-2">
                {selected.notices.map((item) => (
                  <div key={item} className="text-sm leading-7 text-[var(--app-copy)]">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <Link
                href={`/membership/complete?plan=${selectedPlan}`}
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[var(--app-gold)] px-6 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-bright)]"
              >
                {selected.price} 결제하기
              </Link>
            </div>
          </article>
        </section>
      </div>
    </AppShell>
  );
}
