'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [coins, setCoins] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');
    const packageId = searchParams.get('packageId');

    if (!paymentKey || !orderId || !amount || !packageId) {
      setStatus('error');
      setErrorMsg('결제 정보가 올바르지 않습니다.');
      return;
    }

    fetch('/api/payments/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount: parseInt(amount),
        packageId,
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setCoins(data.credits);
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMsg(data.error ?? '결제 처리 중 오류가 발생했습니다.');
        }
      })
      .catch(() => {
        setStatus('error');
        setErrorMsg('서버 오류가 발생했습니다.');
      });
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="text-center space-y-4">
        <div className="text-4xl animate-pulse">⏳</div>
        <p className="text-white/60">결제를 처리하는 중입니다...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="text-center space-y-4">
        <div className="text-4xl">❌</div>
        <h2 className="text-xl font-bold">결제 실패</h2>
        <p className="text-white/50 text-sm">{errorMsg}</p>
        <Button onClick={() => router.push('/credits')} className="bg-indigo-600 hover:bg-indigo-500">
          다시 시도하기
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <div className="text-5xl">✅</div>
      <h2 className="text-2xl font-bold">결제가 완료됐어요</h2>
      <p className="text-white/70">
        <span className="text-indigo-400 font-bold text-xl">{coins}개</span> 코인이 충전되었습니다.
      </p>
      <div className="flex gap-3 justify-center pt-2">
        <Button onClick={() => router.push('/')} variant="outline" className="border-white/20 text-white hover:bg-white/10">
          홈으로
        </Button>
        <Button onClick={() => router.push('/credits')} className="bg-indigo-600 hover:bg-indigo-500">
          추가 충전
        </Button>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-8">
        <Suspense fallback={<div className="text-center text-white/50">로딩중...</div>}>
          <SuccessContent />
        </Suspense>
      </div>
    </main>
  );
}
