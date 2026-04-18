'use client';

import { useState, useEffect } from 'react';
import { loadTossPayments, ANONYMOUS } from '@tosspayments/tosspayments-sdk';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SiteHeader from '@/features/shared-navigation/site-header';
import LegalLinks from '@/components/legal-links';
import Link from 'next/link';

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
  { id: 'credit_1',       label: '체험',   price: 500,  credits: 1,  desc: '짧은 심화 풀이를 한 번 열어보기 좋은 입문 패키지' },
  { id: 'credit_3',       label: '스타터', price: 990,  credits: 3,  desc: '연애·재물·직장 심화 리포트 첫 결제에 가장 잘 맞는 구간', highlight: true },
  { id: 'credit_7',       label: '기본',   price: 2000, credits: 7,  desc: '주제 여러 개를 이어서 보는 사용자에게 가장 안정적인 묶음' },
  { id: 'subscription_30',label: 'Plus',   price: 9900, credits: 30, desc: '매달 자동 충전되는 월간 멤버십형 코인 플랜', isSubscription: true },
];

export default function CreditsPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    if (!hasSupabaseBrowserEnv) {
      setIsLoggedIn(false);
      return;
    }

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });
  }, []);

  async function handlePurchase(pkg: Package) {
    if (!isLoggedIn) {
      location.href = `/login?next=/credits`;
      return;
    }
    setLoading(pkg.id);
    try {
      const toss = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!);
      const payment = toss.payment({ customerKey: ANONYMOUS });
      const orderId = `order_${pkg.id}_${Date.now()}`;

      await payment.requestPayment({
        method: 'TRANSFER',
        amount: { currency: 'KRW', value: pkg.price },
        orderId,
        orderName: `${pkg.label} ${pkg.credits}코인`,
        successUrl: `${location.origin}/credits/success?packageId=${pkg.id}`,
        failUrl: `${location.origin}/credits?error=fail`,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#020817] text-white">
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[32px] border border-[#d2b072]/18 bg-[radial-gradient(circle_at_top_left,_rgba(210,176,114,0.14),_transparent_28%),linear-gradient(180deg,rgba(7,19,39,0.94),rgba(10,18,36,0.96))] p-7">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-[#d2b072]/35 bg-[#d2b072]/10 text-[#f2d9a2]">
                코인 센터
              </Badge>
              <Badge className="border-white/10 bg-white/5 text-white/60">원하실 때만 조용히 여는 심화 해석</Badge>
            </div>
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-[#f8f1df] sm:text-5xl">
              코인 센터
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-white/66">
              코인은 필요하실 때만 심화 해석을 여는 작은 열쇠입니다. 자주 찾는 주제는 가볍게 충전해서 쓰시고, 더 넓게 이어보실 분은 Plus로 옮겨가실 수 있게 준비했습니다.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                { title: '먼저 가볍게', body: '요약 카드와 기본 해석으로 오늘의 결을 먼저 살펴봅니다.' },
                { title: '마음 가는 만큼', body: '연애·재물·직장처럼 더 궁금한 주제만 결과 안에서 바로 엽니다.' },
                { title: '자주 찾으신다면', body: '반복해서 읽게 되는 분은 Plus로 더 넉넉하게 이어가실 수 있습니다.' },
              ].map((item) => (
                <div key={item.title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="text-sm font-medium text-[#f8f1df]">{item.title}</div>
                  <p className="mt-3 text-sm leading-6 text-white/56">{item.body}</p>
                </div>
              ))}
            </div>
          </section>

          <aside className="rounded-[32px] border border-white/10 bg-white/[0.04] p-7">
            <div className="text-sm uppercase tracking-[0.22em] text-[#d2b072]/78">Before You Pay</div>
            <h2 className="mt-3 text-2xl font-semibold text-[#f8f1df]">결제 전에 먼저 보시는 것</h2>
            <div className="mt-5 space-y-3 text-sm leading-7 text-white/60">
              <p>무엇이 열리는지, 어떤 결과가 저장되는지, 자동 결제 여부는 결제 전에 먼저 보여드립니다.</p>
              <p>코인은 필요한 해석을 그때그때 여는 용도이고, Plus는 자주 다시 보는 분께 더 잘 맞는 방식입니다.</p>
              <p>결제 뒤에는 마이 화면에서 상태와 이용 흐름을 다시 확인하실 수 있습니다.</p>
            </div>
            <div className="mt-6 rounded-2xl border border-[#d2b072]/16 bg-[#d2b072]/8 p-4 text-sm leading-7 text-white/64">
              지원 결제: 토스페이먼츠 계좌이체 기반 결제
              <br />
              진행 시 <LegalLinks className="text-white/48" />에 동의한 것으로 봅니다.
            </div>
          </aside>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section>
            <div className="mb-5">
              <div className="text-sm uppercase tracking-[0.22em] text-[#d2b072]/78">Coin Packages</div>
              <h2 className="mt-3 text-2xl font-semibold text-[#f8f1df]">첫 결제부터 월간 Plus까지</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {PACKAGES.map((pkg) => (
                <article
                  key={pkg.id}
                  className={`rounded-[28px] border p-6 transition-colors ${
                    pkg.highlight
                      ? 'border-[#d2b072]/30 bg-[linear-gradient(180deg,rgba(210,176,114,0.12),rgba(10,18,36,0.94))]'
                      : pkg.isSubscription
                        ? 'border-emerald-400/20 bg-emerald-400/8'
                        : 'border-white/10 bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-2xl font-semibold text-[#f8f1df]">{pkg.label}</h3>
                        {pkg.highlight && (
                          <Badge className="border-[#d2b072]/28 bg-[#d2b072]/10 text-[#f2d9a2]">첫 결제 추천</Badge>
                        )}
                        {pkg.isSubscription && (
                          <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-200">월간 Plus</Badge>
                        )}
                      </div>
                      <p className="mt-4 text-sm leading-7 text-white/60">{pkg.desc}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-semibold text-[#f8f1df]">{pkg.credits}</div>
                      <div className="text-sm text-white/48">코인</div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm font-medium text-[#d2b072]">
                      {pkg.price.toLocaleString()}원{pkg.isSubscription ? '/월' : ''}
                    </div>
                    <Button
                      onClick={() => handlePurchase(pkg)}
                      disabled={loading === pkg.id}
                      className="min-w-[96px] rounded-full bg-[#d2b072] text-[#111827] hover:bg-[#e3c68d]"
                      size="sm"
                    >
                      {loading === pkg.id ? '처리중...' : '구매'}
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="space-y-4">
            <article className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
              <div className="text-sm uppercase tracking-[0.22em] text-white/45">Unlock Examples</div>
              <div className="mt-4 space-y-3">
                {[
                  '1코인: 오늘의 심화 풀이 한 번 열기',
                  '3코인: 연애·재물·직장 세 주제를 이어서 보기',
                  '7코인: 월간 테마나 상세 해석을 넉넉히 펼쳐보기',
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/68">
                    {item}
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[28px] border border-[#d2b072]/18 bg-[#d2b072]/8 p-6">
              <div className="text-sm uppercase tracking-[0.22em] text-[#d2b072]/82">Membership Bridge</div>
              <h3 className="mt-3 text-2xl font-semibold text-[#f8f1df]">Plus는 해석 한 번보다 오래 곁에 두는 흐름입니다</h3>
              <p className="mt-4 text-sm leading-7 text-white/62">
                월 9,900원은 데일리 리포트, 광고 제거, 자동 코인 충전, 결과 보관처럼 자주 다시 펼쳐보는 가치를 함께 묶어둔 플랜입니다.
              </p>
              <div className="mt-6 flex flex-col gap-2 text-sm">
                <Link href="/membership" className="text-[#f8f1df] underline underline-offset-4 hover:text-[#e3c68d]">
                  멤버십 자세히 보기
                </Link>
                <Link href="/my/billing" className="text-white/70 underline underline-offset-4 hover:text-white">
                  결제/구독 관리 열기
                </Link>
              </div>
            </article>
          </aside>
        </div>

        <p className="mt-8 text-center text-xs text-white/32">
          토스페이먼츠 보안 결제 · 코인은 묶음 충전으로, 해석은 원하실 때만 조용히 열어보실 수 있습니다.
        </p>
      </div>
    </main>
  );
}
