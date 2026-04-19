'use client';

import { useEffect, useMemo, useState } from 'react';
import { ANONYMOUS, loadTossPayments } from '@tosspayments/tosspayments-sdk';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

const hasSupabaseBrowserEnv = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

interface Props {
  packageId: string;
  plan: string;
  amount: number;
  orderName: string;
  slug?: string;
}

export default function TossMembershipCheckout({
  packageId,
  plan,
  amount,
  orderName,
  slug,
}: Props) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const checkoutPath = useMemo(() => {
    const params = new URLSearchParams({ plan });
    if (slug) params.set('slug', slug);
    return `/membership/checkout?${params.toString()}`;
  }, [plan, slug]);

  useEffect(() => {
    if (!hasSupabaseBrowserEnv) {
      setIsLoggedIn(false);
      return;
    }

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(Boolean(data.user));
    });
  }, []);

  async function handlePayment() {
    if (!isLoggedIn) {
      location.href = `/login?next=${encodeURIComponent(checkoutPath)}`;
      return;
    }

    if (!process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY) {
      setErrorMessage('Toss 클라이언트 키가 설정되어 있지 않습니다.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const toss = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY);
      const payment = toss.payment({ customerKey: ANONYMOUS });
      const orderId = `membership_${packageId}_${Date.now()}`;
      const successParams = new URLSearchParams({
        packageId,
        plan,
      });
      const failParams = new URLSearchParams({
        plan,
        error: 'payment',
      });

      if (slug) {
        successParams.set('slug', slug);
        failParams.set('slug', slug);
      }

      await payment.requestPayment({
        method: 'TRANSFER',
        amount: { currency: 'KRW', value: amount },
        orderId,
        orderName,
        successUrl: `${location.origin}/membership/success?${successParams.toString()}`,
        failUrl: `${location.origin}/membership/checkout?${failParams.toString()}`,
      });
    } catch (error) {
      console.error(error);
      setErrorMessage('결제창을 여는 중 문제가 생겼습니다. 잠시 뒤 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        onClick={handlePayment}
        disabled={isLoading || isLoggedIn === null}
        className="h-12 w-full rounded-full bg-[var(--app-gold)] px-6 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-bright)]"
      >
        {isLoading ? '결제창 여는 중...' : `${amount.toLocaleString()}원 Toss 결제하기`}
      </Button>
      {errorMessage ? (
        <p className="text-center text-xs leading-6 text-rose-200">{errorMessage}</p>
      ) : (
        <p className="text-center text-xs leading-6 text-[var(--app-copy-soft)]">
          Toss 결제 완료 후 서버에서 이용권을 확인하고 바로 반영합니다.
        </p>
      )}
    </div>
  );
}
