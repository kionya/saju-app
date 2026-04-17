import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getAccountDashboardData } from '@/lib/account';
import { PageHero } from '@/shared/layout/app-shell';

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));
}

function formatBirthLabel(reading: {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number | null;
  gender: 'male' | 'female' | null;
}) {
  const hourLabel = reading.birthHour === null ? '시간 미입력' : `${reading.birthHour}시`;
  const genderLabel =
    reading.gender === 'male'
      ? '남성'
      : reading.gender === 'female'
        ? '여성'
        : '성별 미선택';

  return `${reading.birthYear}.${reading.birthMonth}.${reading.birthDay} · ${hourLabel} · ${genderLabel}`;
}

const QUICK_ACTIONS = [
  {
    title: '프로필 관리',
    body: '내 기본 정보와 가족 프로필을 차근차근 채워두면 다음 결과와 궁합 흐름을 더 쉽게 이어갈 수 있습니다.',
    href: '/my/profile',
    cta: '프로필 열기',
  },
  {
    title: '결과보관함',
    body: '최근에 본 사주 리포트를 다시 열고, 질문 포커스별로 비교하면서 이어서 읽을 수 있습니다.',
    href: '/my/results',
    cta: '보관함 보기',
  },
  {
    title: '결제 관리',
    body: '코인 잔액, 최근 사용 내역, Plus 상태와 해지 예약 여부를 한 흐름으로 관리합니다.',
    href: '/my/billing',
    cta: '결제 관리',
  },
  {
    title: '새 리포트 만들기',
    body: '오늘, 연애, 재물, 직장, 관계 중 지금 가장 궁금한 질문으로 새 결과를 바로 시작할 수 있습니다.',
    href: '/saju/new',
    cta: '새 결과 시작',
  },
] as const;

export default async function MyPage() {
  const dashboard = await getAccountDashboardData('/my', {
    readingLimit: 4,
    transactionLimit: 4,
  });

  return (
    <>
      <PageHero
        badges={
          <>
            <Badge className="border-[var(--app-gold)]/25 bg-[var(--app-gold)]/10 text-[var(--app-gold-soft)]">
              MY
            </Badge>
            <Badge className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]">
              결과와 결제를 한 흐름으로 관리
            </Badge>
          </>
        }
        title="저장된 운세와 코인 상태를 한 번에 살펴보세요"
        description="사주 결과, 결제 상태, Plus 이용 현황을 앱처럼 이어서 볼 수 있게 정리했습니다. 다시보기와 다음 행동이 자연스럽게 이어지는 MY 홈입니다."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <article className="app-panel p-5">
          <div className="app-caption">로그인 계정</div>
          <div className="mt-3 text-lg font-semibold text-[var(--app-ivory)]">
            {dashboard.user.email ?? '이메일 정보 없음'}
          </div>
        </article>
        <article className="app-panel p-5">
          <div className="app-caption">사용 가능한 코인</div>
          <div className="mt-3 text-3xl font-semibold text-[var(--app-ivory)]">
            {dashboard.credits.total}
          </div>
          <div className="app-micro-copy mt-2">
            일반 {dashboard.credits.balance} · Plus {dashboard.credits.subscriptionBalance}
          </div>
        </article>
        <article className="app-panel p-5">
          <div className="app-caption">Plus 상태</div>
          <div className="mt-3 text-lg font-semibold text-[var(--app-ivory)]">
            {dashboard.subscription ? dashboard.subscription.status : '미가입'}
          </div>
          <div className="app-micro-copy mt-2">
            {dashboard.subscription?.renewsAt
              ? `다음 갱신 ${formatCreatedAt(dashboard.subscription.renewsAt)}`
              : '아직 정기 이용이 시작되지 않았습니다.'}
          </div>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {QUICK_ACTIONS.map((item) => (
          <article key={item.title} className="app-panel p-6">
            <h2 className="text-2xl font-semibold text-[var(--app-ivory)]">{item.title}</h2>
            <p className="app-body-copy mt-4 text-sm">{item.body}</p>
            <div className="mt-6">
              <Link
                href={item.href}
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'rounded-full border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy)] hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]'
                )}
              >
                {item.cta}
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="app-panel p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-[var(--app-ivory)]">최근 저장된 결과</h2>
            <Link
              href="/my/results"
              className="text-sm text-[var(--app-gold-soft)] underline underline-offset-4 hover:text-[var(--app-ivory)]"
            >
              전체 보기
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {dashboard.recentReadings.length > 0 ? (
              dashboard.recentReadings.map((reading) => (
                <Link
                  key={reading.id}
                  href={`/saju/${reading.id}`}
                  className="app-panel-muted block p-4 transition-colors hover:bg-[var(--app-surface-strong)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-[var(--app-ivory)]">
                        {formatBirthLabel(reading)}
                      </div>
                      <div className="app-micro-copy mt-1">
                        저장일 {formatCreatedAt(reading.createdAt)}
                      </div>
                    </div>
                    <span className="text-sm text-[var(--app-gold-soft)]">리포트 보기</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="app-panel-muted border-dashed p-6 text-sm leading-7 text-[var(--app-copy-muted)]">
                아직 로그인 상태로 저장된 결과가 없습니다. 사주 리포트를 만들면 이 공간에 자동으로 보관됩니다.
              </div>
            )}
          </div>
        </article>

        <article className="app-panel p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-[var(--app-ivory)]">최근 코인 흐름</h2>
            <Link
              href="/my/billing"
              className="text-sm text-[var(--app-gold-soft)] underline underline-offset-4 hover:text-[var(--app-ivory)]"
            >
              결제 관리
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {dashboard.recentTransactions.length > 0 ? (
              dashboard.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="app-panel-muted p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-[var(--app-ivory)]">
                        {transaction.type}
                      </div>
                      <div className="app-micro-copy mt-1">
                        {formatCreatedAt(transaction.createdAt)}
                      </div>
                    </div>
                    <div
                      className={cn(
                        'text-sm font-semibold',
                        transaction.amount >= 0 ? 'text-emerald-200' : 'text-rose-200'
                      )}
                    >
                      {transaction.amount >= 0 ? '+' : ''}
                      {transaction.amount}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="app-panel-muted border-dashed p-6 text-sm leading-7 text-[var(--app-copy-muted)]">
                아직 코인 사용 이력이 없습니다. 코인을 충전하거나 리포트를 열면 이 흐름이 차곡차곡 쌓입니다.
              </div>
            )}
          </div>
        </article>
      </section>
    </>
  );
}
