'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SiteHeader from '@/features/shared-navigation/site-header';
import {
  clearPendingLifetimeReportSlug,
  readPendingLifetimeReportSlug,
} from '@/lib/payments/lifetime-report';
import { trackMoonlightEvent } from '@/lib/analytics';
import { AppShell } from '@/shared/layout/app-shell';

type ConfirmStatus = 'loading' | 'success' | 'error';

function buildCompleteHref(plan: string, slug: string | null) {
  const params = new URLSearchParams({ plan, payment: 'confirmed' });
  if (slug) params.set('slug', slug);
  return `/membership/complete?${params.toString()}`;
}

function buildPremiumResultHref(plan: string, slug: string | null) {
  if (!slug || (plan !== 'premium' && plan !== 'lifetime')) return null;

  const params = new URLSearchParams({ payment: 'confirmed', plan });
  return `/saju/${encodeURIComponent(slug)}/premium?${params.toString()}`;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const didConfirm = useRef(false);
  const [status, setStatus] = useState<ConfirmStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedPlan, setConfirmedPlan] = useState(searchParams.get('plan') ?? 'premium');
  const querySlug = searchParams.get('slug');
  const [resolvedSlug, setResolvedSlug] = useState(querySlug);

  const completeHref = buildCompleteHref(confirmedPlan, resolvedSlug);

  useEffect(() => {
    if (didConfirm.current) return;
    didConfirm.current = true;

    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');
    const packageId = searchParams.get('packageId');
    const plan = searchParams.get('plan') ?? 'premium';
    const entrySource = searchParams.get('from') ?? 'membership';
    const storedLifetimeSlug =
      packageId === 'lifetime_report' ? readPendingLifetimeReportSlug() : null;
    const slug = (querySlug ?? storedLifetimeSlug)?.trim() || null;

    setResolvedSlug(slug);

    if (!paymentKey || !orderId || !amount || !packageId) {
      setStatus('error');
      setErrorMessage('결제 정보가 올바르지 않습니다.');
      return;
    }

    fetch('/api/payments/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount: Number(amount),
        packageId,
        slug,
      }),
    })
      .then((response) => response.json().then((data) => ({ response, data })))
      .then(({ response, data }) => {
        if (!response.ok || !data.success) {
          setStatus('error');
          setErrorMessage(data.error ?? '결제 승인 중 문제가 생겼습니다.');
          return;
        }

        const nextPlan = data.plan ?? plan;
        const premiumResultHref = buildPremiumResultHref(nextPlan, slug);

        if (typeof data.totalCredits === 'number') {
          window.dispatchEvent(
            new CustomEvent('moonlight:credits-updated', {
              detail: { credits: data.totalCredits },
            })
          );
        }
        setConfirmedPlan(nextPlan);
        trackMoonlightEvent('payment_completed', {
          from: entrySource,
          packageId,
          amount: Number(amount),
          plan: nextPlan,
        });

        if (premiumResultHref) {
          if (packageId === 'lifetime_report') {
            clearPendingLifetimeReportSlug();
          }
          location.replace(premiumResultHref);
          return;
        }

        if (packageId === 'lifetime_report') {
          clearPendingLifetimeReportSlug();
        }
        setStatus('success');
      })
      .catch(() => {
        setStatus('error');
        setErrorMessage('서버와 통신하는 중 문제가 생겼습니다.');
      });
  }, [searchParams, querySlug]);

  if (status === 'loading') {
    return (
      <section className="app-panel p-8 text-center sm:p-10">
        <Badge className="border-[var(--app-gold)]/25 bg-[var(--app-gold)]/10 text-[var(--app-gold-soft)]">
          결제 확인 중
        </Badge>
        <h1 className="mt-5 font-[var(--font-heading)] text-3xl text-[var(--app-ivory)]">
          Toss 결제를 확인하고 있습니다
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--app-copy)]">
          결제 승인과 이용권 반영을 함께 처리하고 있습니다. 잠시만 기다려 주세요.
        </p>
      </section>
    );
  }

  if (status === 'error') {
    return (
      <section className="app-panel border-rose-400/20 p-8 text-center sm:p-10">
        <Badge className="border-rose-400/25 bg-rose-400/10 text-rose-100">
          결제 확인 실패
        </Badge>
        <h1 className="mt-5 font-[var(--font-heading)] text-3xl text-[var(--app-ivory)]">
          이용권 반영을 완료하지 못했습니다
        </h1>
        <p className="mt-4 text-sm leading-7 text-rose-100">{errorMessage}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/membership">
            <Button className="rounded-full bg-[var(--app-gold)] px-6 text-[var(--app-bg)] hover:bg-[var(--app-gold-bright)]">
              멤버십으로 돌아가기
            </Button>
          </Link>
          <Link href="/my/billing">
            <Button
              variant="outline"
              className="rounded-full border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-ivory)] hover:bg-[var(--app-surface-strong)]"
            >
              결제 상태 확인
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="app-panel p-8 text-center sm:p-10">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[radial-gradient(circle,var(--app-gold-bright),var(--app-gold))] text-3xl text-[var(--app-bg)]">
        ✓
      </div>
      <Badge className="mt-6 border-[var(--app-gold)]/25 bg-[var(--app-gold)]/10 text-[var(--app-gold-soft)]">
        결제 완료
      </Badge>
      <h1 className="mt-5 font-[var(--font-heading)] text-3xl text-[var(--app-ivory)]">
        {buildPremiumResultHref(confirmedPlan, resolvedSlug) ? '기준서로 이동하고 있습니다' : '이용권이 반영되었습니다'}
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--app-copy)]">
        {buildPremiumResultHref(confirmedPlan, resolvedSlug)
          ? '결제 확인이 끝났습니다. 선택하신 명리 기준서 화면으로 바로 이동합니다.'
          : '멤버십과 기준서 권한을 확인했습니다. 이어서 안내 화면에서 다음에 열어볼 항목을 바로 선택하실 수 있습니다.'}
      </p>
      <div className="mt-7">
        <Link href={completeHref}>
          <Button className="h-12 rounded-full bg-[var(--app-gold)] px-7 text-sm font-semibold text-[var(--app-bg)] hover:bg-[var(--app-gold-bright)]">
            다음으로 이동
          </Button>
        </Link>
      </div>
    </section>
  );
}

export default function MembershipSuccessPage() {
  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-12">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <Suspense fallback={<div className="app-panel p-8 text-center text-[var(--app-copy)]">결제 확인 중...</div>}>
          <SuccessContent />
        </Suspense>
      </div>
    </AppShell>
  );
}
