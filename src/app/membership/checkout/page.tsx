import Link from 'next/link';
import type { Metadata } from 'next';
import TossMembershipCheckout from '@/components/membership/toss-membership-checkout';
import { Badge } from '@/components/ui/badge';
import {
  CHECKOUT_PLAN_GUIDE,
  CHECKOUT_METHODS,
  MEMBERSHIP_REASSURANCE,
  type PlanSlug,
} from '@/content/moonlight';
import SiteHeader from '@/features/shared-navigation/site-header';
import { getMembershipPackage } from '@/lib/payments/catalog';
import { AppShell } from '@/shared/layout/app-shell';

interface Props {
  searchParams: Promise<{ plan?: string; slug?: string; error?: string }>;
}

function normalizePlanSlug(value?: string): PlanSlug {
  if (value === 'plus') return 'basic';
  if (value === 'basic' || value === 'premium' || value === 'lifetime') return value;
  return 'premium';
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '결제',
    description: '선택한 플랜의 결제 정보를 마지막으로 확인하는 화면입니다.',
  };
}

export default async function MembershipCheckoutPage({ searchParams }: Props) {
  const { plan, slug, error } = await searchParams;
  const selectedPlan = normalizePlanSlug(plan);
  const selected = CHECKOUT_PLAN_GUIDE[selectedPlan] ?? CHECKOUT_PLAN_GUIDE.premium;
  const paymentPackage = getMembershipPackage(selectedPlan);

  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-12">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="moon-lunar-panel p-7 sm:p-8">
          <div className="app-starfield" />
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
            선택하신 결제를 마지막으로 한 번 더 살펴보세요
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--app-copy)]">
            가격, 결제 방식, 자동 갱신과 환불 안내를 한 화면에 모아두었습니다. 천천히 읽어보신 뒤 편한 마음으로 결정하시면 됩니다.
          </p>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <article className="moon-plan-card p-6" data-featured="true">
            <div className="text-center">
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
            </div>

            <div className="mt-6 space-y-3">
              {selected.opens.map((item, index) => (
                <div
                  key={item}
                  className="moon-payment-row px-4 py-3 text-sm leading-7 text-[var(--app-copy)]"
                  data-selected={index === 0 ? 'true' : 'false'}
                >
                  <span className="mr-2 text-[var(--app-gold-text)]">{index + 1}.</span>
                  {item}
                </div>
              ))}
            </div>
          </article>

          <article className="app-panel p-6">
            <div className="app-caption">결제 방법</div>
            <div className="mt-5 grid gap-3">
              {CHECKOUT_METHODS.map((method, index) => (
                <div
                  key={method}
                  className="moon-payment-row flex items-center gap-3 px-4 py-4"
                  data-selected={index === 0 ? 'true' : 'false'}
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

            {error === 'payment' ? (
              <div className="mt-6 rounded-[1.2rem] border border-rose-400/25 bg-rose-400/10 px-5 py-4 text-sm leading-7 text-rose-100">
                결제가 완료되지 않았습니다. 결제창을 닫으셨거나 승인에 실패했습니다.
              </div>
            ) : null}

            <div className="mt-6 rounded-[1.2rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 py-5 text-sm leading-7 text-[var(--app-copy-muted)]">
              {MEMBERSHIP_REASSURANCE.map((item) => (
                <div key={item}>{item}</div>
              ))}
            </div>

            <div className="mt-6 rounded-[1.2rem] border border-[var(--app-gold)]/18 bg-[rgba(255,255,255,0.02)] px-5 py-5">
              <div className="app-caption">한 번 더 살펴보실 것</div>
              <div className="mt-3 space-y-2">
                {selected.notices.map((item) => (
                  <div key={item} className="text-sm leading-7 text-[var(--app-copy)]">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              {paymentPackage ? (
                <TossMembershipCheckout
                  packageId={paymentPackage.id}
                  plan={selectedPlan}
                  amount={paymentPackage.price}
                  orderName={paymentPackage.name}
                  slug={slug}
                />
              ) : (
                <div className="rounded-[1.2rem] border border-rose-400/25 bg-rose-400/10 px-5 py-4 text-sm leading-7 text-rose-100">
                  선택한 플랜의 결제 정보를 찾지 못했습니다.
                </div>
              )}
            </div>
          </article>
        </section>
      </div>
    </AppShell>
  );
}
