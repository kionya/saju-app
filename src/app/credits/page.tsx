'use client';

import { useState, useEffect } from 'react';
import { loadTossPayments, ANONYMOUS } from '@tosspayments/tosspayments-sdk';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  DEFAULT_TOSS_PAYMENT_METHOD,
  getTossPaymentMethodOption,
  type TossPaymentMethodCode,
} from '@/lib/payments/methods';
import TossPaymentMethodPicker from '@/components/payments/toss-payment-method-picker';
import SiteHeader from '@/features/shared-navigation/site-header';
import LegalLinks from '@/components/legal-links';
import { AppShell } from '@/shared/layout/app-shell';

const hasSupabaseBrowserEnv = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

interface Package {
  id: string;
  label: string;
  price: number;
  credits: number;
  desc: string;
  highlight?: boolean;
  isSubscription?: boolean;
}

const PACKAGES: Package[] = [
  { id: 'credit_1',        label: '체험',   price: 500,  credits: 1,  desc: '짧은 심화 풀이를 한 번 열어보기 좋은 입문 패키지' },
  { id: 'credit_3',        label: '스타터', price: 990,  credits: 3,  desc: '연애·재물·직장 심화 리포트 첫 결제에 가장 잘 맞는 구간', highlight: true },
  { id: 'credit_7',        label: '기본',   price: 2000, credits: 7,  desc: '주제 여러 개를 이어서 보는 사용자에게 가장 안정적인 묶음' },
  { id: 'subscription_30', label: 'Plus',   price: 9900, credits: 30, desc: '매달 자동 충전되는 월간 멤버십형 코인 플랜', isSubscription: true },
];

const UNLOCK_EXAMPLES = [
  '1코인 · 오늘의 심화 풀이 한 번 열기',
  '3코인 · 연애·재물·직장 세 주제를 이어서 보기',
  '7코인 · 월간 테마나 상세 해석을 넓게 펼쳐보기',
];

export default function CreditsPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<TossPaymentMethodCode>(DEFAULT_TOSS_PAYMENT_METHOD);

  useEffect(() => {
    if (!hasSupabaseBrowserEnv) { setIsLoggedIn(false); return; }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user));
  }, []);

  async function handlePurchase(pkg: Package) {
    if (!isLoggedIn) { location.href = `/login?next=/credits`; return; }
    setLoading(pkg.id);
    try {
      const toss = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!);
      const payment = toss.payment({ customerKey: ANONYMOUS });
      const orderId = `order_${pkg.id}_${paymentMethod.toLowerCase()}_${Date.now()}`;
      const paymentRequest = {
        amount: { currency: 'KRW', value: pkg.price },
        orderId,
        orderName: `${pkg.label} ${pkg.credits}코인`,
        successUrl: `${location.origin}/credits/success?packageId=${pkg.id}`,
        failUrl: `${location.origin}/credits?error=fail`,
      } as const;

      if (paymentMethod === 'CARD') {
        await payment.requestPayment({ ...paymentRequest, method: 'CARD', card: { flowMode: 'DEFAULT' } });
        return;
      }
      await payment.requestPayment({ ...paymentRequest, method: 'TRANSFER', transfer: { cashReceipt: { type: '소득공제' }, useEscrow: false } });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  }

  const selectedMethod = getTossPaymentMethodOption(paymentMethod);

  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-0">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">

        {/* ─── HERO + INTRO ─── */}
        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">

          <section className="moon-lunar-panel p-7">
            <div className="app-starfield" />
            <div className="relative z-10">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-[var(--app-gold)]/30 bg-[var(--app-gold)]/10 px-3 py-1 text-xs text-[var(--app-gold-text)]">코인 센터</span>
                <span className="rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-3 py-1 text-xs text-[var(--app-copy-muted)]">원하실 때만 조용히 여는 심화 해석</span>
              </div>
              <h1 className="mt-5 font-[var(--font-heading)] text-4xl font-semibold leading-tight tracking-tight text-[var(--app-ivory)] sm:text-5xl">
                코인 센터
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--app-copy-muted)]">
                코인은 필요하실 때만 심화 해석을 여는 작은 열쇠입니다. 자주 찾는 주제는 가볍게 충전해서 쓰시고, 더 넓게 이어보실 분은 Plus로 옮겨가실 수 있게 준비했습니다.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  { title: '먼저 가볍게', body: '요약 카드와 기본 해석으로 오늘의 결을 먼저 살펴봅니다.' },
                  { title: '마음 가는 만큼', body: '연애·재물·직장처럼 더 궁금한 주제만 결과 안에서 바로 엽니다.' },
                  { title: '자주 찾으신다면', body: '반복해서 읽게 되는 분은 Plus로 더 넉넉하게 이어가실 수 있습니다.' },
                ].map((item) => (
                  <div key={item.title} className="rounded-[1.2rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-4">
                    <div className="text-sm font-medium text-[var(--app-ivory)]">{item.title}</div>
                    <p className="mt-2 text-sm leading-6 text-[var(--app-copy-muted)]">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="app-panel p-7">
            <div className="app-caption">결제 전 안내</div>
            <h2 className="mt-3 font-[var(--font-heading)] text-2xl text-[var(--app-ivory)]">결제 전에 먼저 보시는 것</h2>
            <div className="mt-5 space-y-3 text-sm leading-7 text-[var(--app-copy-muted)]">
              <p>무엇이 열리는지, 어떤 결과가 저장되는지, 자동 결제 여부는 결제 전에 먼저 보여드립니다.</p>
              <p>코인은 필요한 해석을 그때그때 여는 용도이고, Plus는 자주 다시 보는 분께 더 잘 맞는 방식입니다.</p>
              <p>결제 뒤에는 마이 화면에서 상태와 이용 흐름을 다시 확인하실 수 있습니다.</p>
            </div>
            <div className="mt-6 rounded-[1.15rem] border border-[var(--app-gold)]/18 bg-[var(--app-gold)]/6 p-4 text-sm leading-7 text-[var(--app-copy-muted)]">
              지원 결제: 토스페이먼츠 카드 결제 · 계좌이체
              <br />
              진행 시 <LegalLinks className="text-[var(--app-copy-soft)]" />에 동의한 것으로 봅니다.
            </div>
          </aside>
        </div>

        {/* ─── PACKAGES ─── */}
        <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">

          <section>
            <div className="mb-5">
              <div className="app-caption">코인 패키지</div>
              <h2 className="mt-2 font-[var(--font-heading)] text-2xl text-[var(--app-ivory)]">첫 결제부터 월간 Plus까지</h2>
            </div>
            <TossPaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} className="mb-5" />
            <div className="grid gap-4 md:grid-cols-2">
              {PACKAGES.map((pkg) => (
                <article
                  key={pkg.id}
                  className={`moon-plan-card p-6 ${pkg.highlight ? '' : ''}`}
                  data-featured={pkg.highlight ? 'true' : 'false'}
                  style={pkg.isSubscription ? {
                    borderColor: 'rgba(107,166,139,0.28)',
                    background: 'linear-gradient(180deg,rgba(107,166,139,0.1),rgba(15,18,32,0.95))',
                  } : pkg.highlight ? {} : {
                    borderColor: 'rgba(42,48,82,0.92)',
                    background: 'rgba(31,37,64,0.35)',
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-[var(--font-heading)] text-2xl font-semibold text-[var(--app-ivory)]">{pkg.label}</h3>
                        {pkg.highlight && (
                          <span className="rounded-full border border-[var(--app-gold)]/28 bg-[var(--app-gold)]/10 px-2.5 py-0.5 text-[10px] text-[var(--app-gold-text)]">첫 결제 추천</span>
                        )}
                        {pkg.isSubscription && (
                          <span className="rounded-full border border-[var(--app-jade)]/28 bg-[var(--app-jade)]/10 px-2.5 py-0.5 text-[10px] text-[var(--app-jade)]">월간 Plus</span>
                        )}
                      </div>
                      <p className="mt-3 text-sm leading-7 text-[var(--app-copy-muted)]">{pkg.desc}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-[var(--font-heading)] text-3xl font-semibold text-[var(--app-ivory)]">{pkg.credits}</div>
                      <div className="text-xs text-[var(--app-copy-soft)]">코인</div>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm font-medium text-[var(--app-gold-text)]">
                      {pkg.price.toLocaleString()}원{pkg.isSubscription ? '/월' : ''}
                    </div>
                    <button
                      onClick={() => handlePurchase(pkg)}
                      disabled={loading === pkg.id}
                      className="inline-flex h-9 min-w-[96px] items-center justify-center rounded-full bg-[var(--app-gold)] px-4 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-text)] disabled:opacity-60"
                    >
                      {loading === pkg.id ? '처리중...' : `${selectedMethod.shortLabel} 구매`}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="space-y-4">
            <article className="app-panel p-6">
              <div className="app-caption mb-4">이런 것이 열립니다</div>
              <div className="space-y-2">
                {UNLOCK_EXAMPLES.map((item) => (
                  <div key={item} className="rounded-[1rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-3 text-sm text-[var(--app-copy)]">
                    {item}
                  </div>
                ))}
              </div>
            </article>

            <article className="moon-lunar-panel p-6">
              <div className="app-starfield" />
              <div className="relative z-10">
                <div className="app-caption">Plus 멤버십</div>
                <h3 className="mt-3 font-[var(--font-heading)] text-xl font-semibold text-[var(--app-ivory)]">
                  해석 한 번보다 오래 곁에 두는 흐름입니다
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--app-copy-muted)]">
                  월 9,900원은 데일리 리포트, 광고 제거, 자동 코인 충전, 결과 보관처럼 자주 다시 펼쳐보는 가치를 함께 묶어둔 플랜입니다.
                </p>
                <div className="mt-5 flex flex-col gap-2 text-sm">
                  <Link href="/membership" className="text-[var(--app-gold-text)] underline underline-offset-4 hover:text-[var(--app-ivory)]">
                    멤버십 자세히 보기
                  </Link>
                  <Link href="/my/billing" className="text-[var(--app-copy-muted)] underline underline-offset-4 hover:text-[var(--app-ivory)]">
                    결제/구독 관리 열기
                  </Link>
                </div>
              </div>
            </article>
          </aside>
        </div>

        <p className="mt-8 text-center text-xs text-[var(--app-copy-soft)]">
          토스페이먼츠 보안 결제 · 코인은 묶음 충전으로, 해석은 원하실 때만 조용히 열어보실 수 있습니다.
        </p>
      </div>
    </AppShell>
  );
}
