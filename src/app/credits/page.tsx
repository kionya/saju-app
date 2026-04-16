'use client';

import { useState, useEffect } from 'react';
import { loadTossPayments, ANONYMOUS } from '@tosspayments/tosspayments-sdk';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SiteHeader from '@/components/site-header';
import LegalLinks from '@/components/legal-links';
import Link from 'next/link';

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
                코인 소비형 micro unlock
              </Badge>
              <Badge className="border-white/10 bg-white/5 text-white/60">첫 유료 전환 구간</Badge>
            </div>
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-[#f8f1df] sm:text-5xl">
              코인 센터
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-white/66">
              500원과 990원은 매번 결제하는 상품이 아니라, 결과 안에서 바로 열어보게 만드는 소비 단위입니다.
              외부 결제는 묶음 충전으로, 실제 콘텐츠 소비는 코인 언락으로 이어지게 설계합니다.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                { title: '무료 결과', body: '요약 카드와 기본 해석을 먼저 경험합니다.' },
                { title: '코인 언락', body: '연애·재물·직장 심화 리포트를 결과 안에서 즉시 엽니다.' },
                { title: '멤버십 전환', body: '반복 사용자는 Plus로 자연스럽게 올라갑니다.' },
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
            <h2 className="mt-3 text-2xl font-semibold text-[#f8f1df]">결제 전에 보이는 정보</h2>
            <div className="mt-5 space-y-3 text-sm leading-7 text-white/60">
              <p>무엇이 열리는지, 어떤 결과가 저장되는지, 구독이면 다음 결제와 해지 방식을 먼저 보여줘야 합니다.</p>
              <p>코인은 심화 리포트와 주제 확장용, Plus는 반복 효용용으로 역할이 다릅니다.</p>
              <p>지금 MVP에서는 코인 충전과 Plus 결제를 먼저 제공하고, MY 관리 화면은 단계적으로 연결합니다.</p>
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
                  '3코인: 연애·재물·직장 세 주제 연속 보기',
                  '7코인: 월간 테마나 상세 해석 여러 번 소비',
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/68">
                    {item}
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[28px] border border-[#d2b072]/18 bg-[#d2b072]/8 p-6">
              <div className="text-sm uppercase tracking-[0.22em] text-[#d2b072]/82">Membership Bridge</div>
              <h3 className="mt-3 text-2xl font-semibold text-[#f8f1df]">Plus는 리포트 1개가 아니라 반복 효용</h3>
              <p className="mt-4 text-sm leading-7 text-white/62">
                월 9,900원은 데일리 리포트, 광고 제거, 자동 코인 충전, 결과 보관과 캘린더처럼 재방문 가치를 묶어야 설득력이 생깁니다.
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
          토스페이먼츠 보안 결제 · 실제 구매는 묶음 충전으로, 콘텐츠 소비는 코인 언락 구조로 운영합니다.
        </p>
      </div>
    </main>
  );
}
