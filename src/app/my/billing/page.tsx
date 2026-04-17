import Link from 'next/link';
import SubscriptionManager from '@/components/my/subscription-manager';
import { Badge } from '@/components/ui/badge';
import { getAccountDashboardData } from '@/lib/account';
import {
  getSubscriptionPlanLabel,
  getSubscriptionStatusLabel,
} from '@/lib/subscription';
import { PageHero } from '@/shared/layout/app-shell';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));
}

const TYPE_LABELS: Record<string, string> = {
  purchase: '코인 충전',
  subscription: 'Plus 시작',
  use: '코인 사용',
  signup_bonus: '가입 보너스',
};

function getStatusTone(status: 'active' | 'cancelled' | 'expired' | null) {
  if (status === 'active') {
    return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200';
  }

  if (status === 'cancelled') {
    return 'border-[var(--app-gold)]/25 bg-[var(--app-gold)]/10 text-[var(--app-gold-soft)]';
  }

  return 'border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]';
}

function getSubscriptionNotice(
  subscription: Awaited<ReturnType<typeof getAccountDashboardData>>['subscription']
) {
  if (!subscription) {
    return '아직 Plus를 시작하지 않았습니다. 코인 센터에서 Plus를 시작하면 30일 이용 기간과 Plus 코인이 바로 반영됩니다.';
  }

  if (subscription.status === 'active') {
    return '현재 Plus를 이용 중입니다. 해지 예약을 눌러도 이번 이용 기간이 끝날 때까지 혜택은 그대로 유지됩니다.';
  }

  if (subscription.status === 'cancelled') {
    return '해지 예약이 설정된 상태입니다. 다음 결제일 전까지는 Plus 혜택을 그대로 쓰고, 원하면 다시 재개할 수 있습니다.';
  }

  return 'Plus 이용 기간이 만료됐습니다. 필요할 때 다시 시작해서 이어서 사용할 수 있습니다.';
}

export default async function MyBillingPage() {
  const dashboard = await getAccountDashboardData('/my/billing', {
    readingLimit: 3,
    transactionLimit: 20,
  });

  const subscriptionStatusLabel = dashboard.subscription
    ? getSubscriptionStatusLabel(dashboard.subscription.status)
    : '미가입';

  return (
    <>
      <PageHero
        badges={
          <>
            <Badge className="border-[var(--app-gold)]/25 bg-[var(--app-gold)]/10 text-[var(--app-gold-soft)]">
              Billing & Plus
            </Badge>
            <Badge className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]">
              코인, 정기 이용, 환불 안내
            </Badge>
          </>
        }
        title="결제와 Plus 상태를 같은 흐름으로 관리하세요"
        description="첫 결제 전환은 코인 사용 흐름이 매끄러워야 하고, Plus는 반복 효용과 정책 고지가 함께 보여야 합니다. 이 화면은 잔액, 상태, 해지 예약, 최근 이력을 하나의 앱 화면처럼 묶어둔 허브입니다."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <article className="app-panel p-5">
          <div className="app-caption">전체 코인</div>
          <div className="mt-3 text-3xl font-semibold text-[var(--app-ivory)]">
            {dashboard.credits.total}
          </div>
        </article>
        <article className="app-panel p-5">
          <div className="app-caption">일반 코인</div>
          <div className="mt-3 text-3xl font-semibold text-[var(--app-ivory)]">
            {dashboard.credits.balance}
          </div>
        </article>
        <article className="app-panel p-5">
          <div className="app-caption">Plus 코인</div>
          <div className="mt-3 text-3xl font-semibold text-[var(--app-ivory)]">
            {dashboard.credits.subscriptionBalance}
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <article className="app-panel p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-[var(--app-ivory)]">Plus 상태</h2>
            <Badge className={`border ${getStatusTone(dashboard.subscription?.status ?? null)}`}>
              {subscriptionStatusLabel}
            </Badge>
          </div>

          {dashboard.subscription ? (
            <div className="mt-5 space-y-4">
              <div className="app-panel-muted p-4">
                <div className="app-caption">플랜</div>
                <div className="mt-2 text-lg font-semibold text-[var(--app-ivory)]">
                  {getSubscriptionPlanLabel(dashboard.subscription.plan)}
                </div>
              </div>
              <div className="app-panel-muted p-4">
                <div className="app-caption">다음 결제일</div>
                <div className="mt-2 text-lg font-semibold text-[var(--app-ivory)]">
                  {dashboard.subscription.renewsAt
                    ? formatDate(dashboard.subscription.renewsAt)
                    : '미정'}
                </div>
              </div>
              <div className="rounded-2xl border border-[var(--app-gold)]/18 bg-[var(--app-gold)]/8 p-4 text-sm leading-7 text-[var(--app-copy)]">
                {getSubscriptionNotice(dashboard.subscription)}
              </div>
            </div>
          ) : (
            <div className="app-panel-muted mt-5 border-dashed p-6 text-sm leading-7 text-[var(--app-copy-muted)]">
              {getSubscriptionNotice(null)}
            </div>
          )}

          <SubscriptionManager subscription={dashboard.subscription} />
        </article>

        <article className="app-panel p-6">
          <h2 className="text-2xl font-semibold text-[var(--app-ivory)]">정책 안내</h2>
          <div className="mt-5 space-y-3">
            {[
              '정기 이용 상품은 가격, 갱신 주기, 제공 시작 시점을 결제 전과 MY 화면에서 계속 확인할 수 있어야 합니다.',
              '해지 예약이 있으면 다음 갱신 전까지는 혜택을 유지하고, 사용자는 같은 화면에서 바로 재개할 수 있어야 합니다.',
              '디지털 콘텐츠는 제공이 시작된 이후 환불 기준이 달라질 수 있으므로 미리보기와 제공 개시 시점을 함께 안내합니다.',
              '현재 MVP에서는 MY 화면에서 상태 조회와 해지 예약, 재개를 우선 제공하고 실제 자동결제 확장은 추후 billing key 연동과 함께 이어집니다.',
            ].map((item) => (
              <div
                key={item}
                className="app-panel-muted px-4 py-3 text-sm leading-7 text-[var(--app-copy)]"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="app-panel-muted mt-6 p-4 text-sm leading-7 text-[var(--app-copy)]">
            멤버십 구성과 Plus 혜택은{' '}
            <Link
              href="/membership"
              className="text-[var(--app-gold-soft)] underline underline-offset-4 hover:text-[var(--app-ivory)]"
            >
              멤버십 페이지
            </Link>
            에서, 코인 충전과 재시작은{' '}
            <Link
              href="/credits"
              className="text-[var(--app-gold-soft)] underline underline-offset-4 hover:text-[var(--app-ivory)]"
            >
              코인 센터
            </Link>
            에서 바로 이어집니다.
          </div>
        </article>
      </section>

      <section className="app-panel p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-[var(--app-ivory)]">최근 결제 및 코인 이력</h2>
          <Badge className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]">
            최근 {dashboard.recentTransactions.length}건
          </Badge>
        </div>
        <div className="mt-5 space-y-3">
          {dashboard.recentTransactions.length > 0 ? (
            dashboard.recentTransactions.map((transaction) => (
              <div key={transaction.id} className="app-panel-muted p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-[var(--app-ivory)]">
                      {TYPE_LABELS[transaction.type] ?? transaction.type}
                    </div>
                    <div className="app-micro-copy mt-1">
                      {formatDate(transaction.createdAt)}
                      {transaction.feature ? ` · ${transaction.feature}` : ''}
                    </div>
                  </div>
                  <div
                    className={`text-sm font-semibold ${
                      transaction.amount >= 0 ? 'text-emerald-200' : 'text-rose-200'
                    }`}
                  >
                    {transaction.amount >= 0 ? '+' : ''}
                    {transaction.amount} 코인
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="app-panel-muted border-dashed p-6 text-sm leading-7 text-[var(--app-copy-muted)]">
              아직 표시할 결제 또는 코인 사용 이력이 없습니다.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
