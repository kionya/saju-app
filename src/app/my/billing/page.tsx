import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SubscriptionManager from '@/components/my/subscription-manager';
import { Badge } from '@/components/ui/badge';
import { getAccountDashboardData } from '@/lib/account';
import {
  getSubscriptionPlanLabel,
  getSubscriptionStatusLabel,
} from '@/lib/subscription';

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
    return 'border-[#d2b072]/25 bg-[#d2b072]/10 text-[#f5dfaa]';
  }

  return 'border-white/10 bg-white/5 text-white/62';
}

function getSubscriptionNotice(subscription: Awaited<ReturnType<typeof getAccountDashboardData>>['subscription']) {
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
    <main className="min-h-screen bg-[#020817] text-white">
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <section className="rounded-[32px] border border-[#d2b072]/18 bg-[radial-gradient(circle_at_top_left,_rgba(210,176,114,0.14),_transparent_30%),linear-gradient(180deg,rgba(7,19,39,0.94),rgba(10,18,36,0.96))] p-7">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-[#d2b072]/30 bg-[#d2b072]/10 text-[#f5dfaa]">
              Billing & Plus
            </Badge>
            <Badge className="border-white/10 bg-white/5 text-white/62">
              코인, 정기 이용, 환불 안내
            </Badge>
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[#f8f1df] sm:text-5xl">
            결제와 구독 관리
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-white/64">
            첫 결제 전환은 코인 사용 흐름이 매끄러워야 하고, Plus는 반복 효용과 명확한 정책 고지가 함께 가야 합니다.
            그래서 이 화면에서는 코인 잔액, Plus 상태, 최근 결제 이력, 해지 예약과 재개 상태를 한 번에 확인할 수 있게 구성했습니다.
          </p>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
            <div className="text-sm text-white/45">전체 코인</div>
            <div className="mt-3 text-3xl font-semibold text-[#f8f1df]">{dashboard.credits.total}</div>
          </article>
          <article className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
            <div className="text-sm text-white/45">일반 코인</div>
            <div className="mt-3 text-3xl font-semibold text-[#f8f1df]">{dashboard.credits.balance}</div>
          </article>
          <article className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
            <div className="text-sm text-white/45">Plus 코인</div>
            <div className="mt-3 text-3xl font-semibold text-[#f8f1df]">{dashboard.credits.subscriptionBalance}</div>
          </article>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <article className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold text-[#f8f1df]">Plus 상태</h2>
              <Badge className={`border ${getStatusTone(dashboard.subscription?.status ?? null)}`}>
                {subscriptionStatusLabel}
              </Badge>
            </div>

            {dashboard.subscription ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-sm text-white/45">플랜</div>
                  <div className="mt-2 text-lg font-semibold text-[#f8f1df]">
                    {getSubscriptionPlanLabel(dashboard.subscription.plan)}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-sm text-white/45">다음 결제일</div>
                  <div className="mt-2 text-lg font-semibold text-[#f8f1df]">
                    {dashboard.subscription.renewsAt ? formatDate(dashboard.subscription.renewsAt) : '미정'}
                  </div>
                </div>
                <div className="rounded-2xl border border-[#d2b072]/16 bg-[#d2b072]/8 p-4 text-sm leading-7 text-white/62">
                  {getSubscriptionNotice(dashboard.subscription)}
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-sm leading-7 text-white/58">
                {getSubscriptionNotice(null)}
              </div>
            )}

            <SubscriptionManager subscription={dashboard.subscription} />
          </article>

          <article className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-2xl font-semibold text-[#f8f1df]">정책 안내</h2>
            <div className="mt-5 space-y-3">
              {[
                '정기 이용 상품은 가격, 갱신 주기, 제공 시작 시점을 결제 전과 MY 화면에서 계속 확인할 수 있어야 합니다.',
                '해지 예약이 있으면 다음 갱신 전까지는 혜택을 유지하고, 사용자는 같은 화면에서 바로 재개할 수 있어야 합니다.',
                '디지털 콘텐츠는 제공이 시작된 이후 환불 기준이 달라질 수 있으므로 미리보기와 제공 개시 시점을 함께 안내합니다.',
                '현재 MVP에서는 MY 화면에서 상태 조회와 해지 예약/재개를 우선 제공하고, 실제 자동결제 확장은 추후 billing key 연동과 함께 이어집니다.',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-7 text-white/62">
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-white/60">
              멤버십 구성과 Plus 혜택은 <Link href="/membership" className="text-[#d2b072] underline underline-offset-4 hover:text-[#e3c68d]">멤버십 페이지</Link>에서,
              코인 충전과 재시작은 <Link href="/credits" className="text-[#d2b072] underline underline-offset-4 hover:text-[#e3c68d]">코인 센터</Link>에서 바로 이어집니다.
            </div>
          </article>
        </section>

        <section className="mt-8 rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-[#f8f1df]">최근 결제 및 코인 이력</h2>
            <Badge className="border-white/10 bg-white/5 text-white/62">
              최근 {dashboard.recentTransactions.length}건
            </Badge>
          </div>
          <div className="mt-5 space-y-3">
            {dashboard.recentTransactions.length > 0 ? (
              dashboard.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-[#f8f1df]">
                        {TYPE_LABELS[transaction.type] ?? transaction.type}
                      </div>
                      <div className="mt-1 text-sm text-white/50">
                        {formatDate(transaction.createdAt)}
                        {transaction.feature ? ` · ${transaction.feature}` : ''}
                      </div>
                    </div>
                    <div className={`text-sm font-semibold ${transaction.amount >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                      {transaction.amount >= 0 ? '+' : ''}{transaction.amount} 코인
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-sm leading-7 text-white/56">
                아직 표시할 결제 또는 코인 사용 이력이 없습니다.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
