'use client';

import { useState, useEffect } from 'react';
import { loadTossPayments, ANONYMOUS } from '@tosspayments/tosspayments-sdk';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
  { id: 'credit_1',       label: '체험',   price: 500,  credits: 1,  desc: '딱 한 번 써보기' },
  { id: 'credit_3',       label: '소액',   price: 990,  credits: 3,  desc: '가장 인기', highlight: true },
  { id: 'credit_7',       label: '기본',   price: 2000, credits: 7,  desc: '가성비 최고' },
  { id: 'subscription_30',label: '월 구독',price: 9900, credits: 30, desc: '매달 자동 충전', isSubscription: true },
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
        orderName: `${pkg.label} ${pkg.credits}크레딧`,
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
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-white">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <a href="/" className="text-xl font-bold tracking-tight">✦ 사주명리</a>
      </header>

      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">크레딧 충전</h1>
          <p className="text-white/50 text-sm">크레딧으로 상세 해석, AI 상담, 궁합 분석을 이용하세요</p>
        </div>

        <div className="space-y-3">
          {PACKAGES.map(pkg => (
            <div
              key={pkg.id}
              className={`flex items-center justify-between rounded-xl p-5 border transition-colors ${
                pkg.highlight
                  ? 'bg-indigo-600/20 border-indigo-500/50'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold">{pkg.label}</span>
                    {pkg.highlight && (
                      <Badge className="bg-indigo-500/30 text-indigo-300 border-indigo-500/40 text-xs">인기</Badge>
                    )}
                    {pkg.isSubscription && (
                      <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">구독</Badge>
                    )}
                  </div>
                  <div className="text-sm text-white/50">{pkg.desc}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-bold text-lg">
                    {pkg.credits}<span className="text-sm font-normal text-white/50"> 크레딧</span>
                  </div>
                  <div className="text-indigo-300 text-sm font-medium">
                    {pkg.price.toLocaleString()}원{pkg.isSubscription ? '/월' : ''}
                  </div>
                </div>
                <Button
                  onClick={() => handlePurchase(pkg)}
                  disabled={loading === pkg.id}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white min-w-[72px]"
                  size="sm"
                >
                  {loading === pkg.id ? '처리중...' : '구매'}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-white/30 mt-8">
          토스페이먼츠 보안 결제 · 카드/계좌이체/간편결제 지원
        </p>
      </div>
    </main>
  );
}