import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAccountDashboardData } from '@/lib/account';

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

export default async function MyPage() {
  const dashboard = await getAccountDashboardData('/my', {
    readingLimit: 4,
    transactionLimit: 4,
  });

  return (
    <main className="min-h-screen bg-[#020817] text-white">
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <section className="rounded-[32px] border border-[#d2b072]/18 bg-[radial-gradient(circle_at_top_left,_rgba(210,176,114,0.14),_transparent_30%),linear-gradient(180deg,rgba(7,19,39,0.94),rgba(10,18,36,0.96))] p-7">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-[#d2b072]/30 bg-[#d2b072]/10 text-[#f5dfaa]">
              MY
            </Badge>
            <Badge className="border-white/10 bg-white/5 text-white/62">
              저장과 다시보기를 위한 개인 공간
            </Badge>
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[#f8f1df] sm:text-5xl">
            내 결과와 결제 상태를 한 번에 관리하는 공간
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-white/64">
            무료 결과를 보고 저장이 필요해질 때 로그인하게 만드는 흐름이 핵심입니다. MY는 그 다음 단계에서 다시보기, 코인 잔액, 구독 상태를 앱처럼 이어서 보여주는 허브 역할을 합니다.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <article className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
              <div className="text-sm text-white/45">로그인 계정</div>
              <div className="mt-3 text-lg font-semibold text-[#f8f1df]">
                {dashboard.user.email ?? '이메일 없음'}
              </div>
            </article>
            <article className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
              <div className="text-sm text-white/45">사용 가능한 코인</div>
              <div className="mt-3 text-3xl font-semibold text-[#f8f1df]">{dashboard.credits.total}</div>
              <div className="mt-2 text-sm text-white/56">
                일반 {dashboard.credits.balance} · Plus {dashboard.credits.subscriptionBalance}
              </div>
            </article>
            <article className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
              <div className="text-sm text-white/45">Plus 상태</div>
              <div className="mt-3 text-lg font-semibold text-[#f8f1df]">
                {dashboard.subscription ? dashboard.subscription.status : '미가입'}
              </div>
              <div className="mt-2 text-sm text-white/56">
                {dashboard.subscription?.renewsAt
                  ? `다음 갱신 ${formatCreatedAt(dashboard.subscription.renewsAt)}`
                  : '아직 정기결제가 설정되지 않았습니다.'}
              </div>
            </article>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: '프로필 관리',
              body: '내 생년월일과 가족 프로필을 저장해두고 나중에 비교형 콘텐츠로 이어갈 수 있습니다.',
              href: '/my/profile',
              cta: '프로필 관리',
            },
            {
              title: '결과보관함',
              body: '최근 본 사주 리포트를 다시 열고, 질문 포커스별로 이어서 확인할 수 있습니다.',
              href: '/my/results',
              cta: '결과보관함 열기',
            },
            {
              title: '결제/구독 관리',
              body: '코인 잔액, 최근 결제, Plus 상태와 정책 안내를 한 화면에서 확인합니다.',
              href: '/my/billing',
              cta: '결제 관리 보기',
            },
            {
              title: '새 리포트 만들기',
              body: '오늘, 연애, 재물, 직장, 관계 중 지금 궁금한 질문으로 다시 시작할 수 있습니다.',
              href: '/#personalized-reading',
              cta: '새 결과 만들기',
            },
          ].map((item) => (
            <article key={item.title} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-2xl font-semibold text-[#f8f1df]">{item.title}</h2>
              <p className="mt-4 text-sm leading-7 text-white/60">{item.body}</p>
              <div className="mt-6">
                <Link href={item.href}>
                  <Button
                    variant="outline"
                    className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                  >
                    {item.cta}
                  </Button>
                </Link>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-[#f8f1df]">최근 저장된 결과</h2>
              <Link href="/my/results" className="text-sm text-[#d2b072] underline underline-offset-4 hover:text-[#e3c68d]">
                전체 보기
              </Link>
            </div>
            <div className="mt-5 space-y-3">
              {dashboard.recentReadings.length > 0 ? (
                dashboard.recentReadings.map((reading) => (
                  <Link
                    key={reading.id}
                    href={`/saju/${reading.id}`}
                    className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.06]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-[#f8f1df]">
                          {formatBirthLabel(reading)}
                        </div>
                        <div className="mt-1 text-sm text-white/50">
                          저장일 {formatCreatedAt(reading.createdAt)}
                        </div>
                      </div>
                      <span className="text-sm text-[#d2b072]">리포트 열기</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-sm leading-7 text-white/56">
                  아직 로그인 상태로 저장된 결과가 없습니다. 홈에서 새 사주 리포트를 만들면 이 공간에 자동으로 쌓입니다.
                </div>
              )}
            </div>
          </article>

          <article className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-[#f8f1df]">최근 코인 활동</h2>
              <Link href="/my/billing" className="text-sm text-[#d2b072] underline underline-offset-4 hover:text-[#e3c68d]">
                결제 관리
              </Link>
            </div>
            <div className="mt-5 space-y-3">
              {dashboard.recentTransactions.length > 0 ? (
                dashboard.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-[#f8f1df]">{transaction.type}</div>
                        <div className="mt-1 text-sm text-white/50">
                          {formatCreatedAt(transaction.createdAt)}
                        </div>
                      </div>
                      <div className={`text-sm font-semibold ${transaction.amount >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {transaction.amount >= 0 ? '+' : ''}{transaction.amount}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-sm leading-7 text-white/56">
                  아직 코인 활동 이력이 없습니다. 코인 충전이나 리포트 언락 후 이곳에서 흐름을 확인할 수 있습니다.
                </div>
              )}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
