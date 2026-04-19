import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getAccountDashboardData } from '@/lib/account';
import { MY_MENU_BLUEPRINT } from '@/content/moonlight';

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

  const mostRecentReading = dashboard.recentReadings[0];
  const displayName = dashboard.user.email?.split('@')[0] ?? '선생님';
  const sigil = mostRecentReading?.dayMasterStem ?? '月';

  return (
    <div className="grid gap-6 lg:grid-cols-[22rem_1fr] lg:items-start">
      <aside className="space-y-4">
        <section className="moon-lunar-panel p-6 text-center">
          <div className="app-starfield" />
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[var(--app-gold)]/35 bg-[var(--app-gold)]/16 font-[var(--font-heading)] text-3xl font-semibold text-[var(--app-gold-text)]">
            {sigil}
          </div>
          <h1 className="mt-4 font-[var(--font-heading)] text-3xl font-semibold text-[var(--app-gold-text)]">
            {displayName} 선생님
          </h1>
          <p className="mt-3 text-sm leading-7 text-[var(--app-copy-muted)]">
            {mostRecentReading
              ? formatBirthLabel(mostRecentReading)
              : '첫 사주를 저장하시면 이곳에 선생님의 원국이 함께 표시됩니다.'}
          </p>
          {mostRecentReading?.dayPillarLabel ? (
            <p className="mt-2 text-xs tracking-[0.24em] text-[var(--app-gold)]/72">
              {mostRecentReading.dayPillarLabel}
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <Badge className="border-[var(--app-gold)]/28 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]">
              {dashboard.subscription ? '프리미엄 회원' : '무료 이용 중'}
            </Badge>
            <Badge className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]">
              코인 {dashboard.credits.total}
            </Badge>
          </div>
        </section>

        <section className="app-panel p-5">
          <div className="app-caption">가족 사주</div>
          <h2 className="mt-3 font-[var(--font-heading)] text-2xl text-[var(--app-ivory)]">
            가까운 분들의 흐름도 함께
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--app-copy-muted)]">
            가족 프로필을 저장해두면 매번 다시 입력하지 않고 궁합과 가족 리포트로 이어갈 수 있습니다.
          </p>
          <Link
            href="/my/profile"
            className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-full border border-[var(--app-gold)]/28 bg-[var(--app-gold)]/10 text-sm font-medium text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/16"
          >
            가족 정보 관리
          </Link>
        </section>
      </aside>

      <main className="space-y-5">
        <section className="grid gap-4 md:grid-cols-3">
          <article className="moon-orbit-card p-5">
            <div className="app-caption">저장한 해석</div>
            <div className="mt-3 text-3xl font-semibold text-[var(--app-ivory)]">
              {dashboard.recentReadings.length}
            </div>
            <p className="mt-2 text-sm leading-7 text-[var(--app-copy-muted)]">
              최근 보신 결과와 마음에 남은 해석을 다시 보실 수 있습니다.
            </p>
          </article>
          <article className="moon-orbit-card p-5">
            <div className="app-caption">사용 가능한 코인</div>
            <div className="mt-3 text-3xl font-semibold text-[var(--app-ivory)]">
              {dashboard.credits.total}
            </div>
            <p className="mt-2 text-sm leading-7 text-[var(--app-copy-muted)]">
              일반 {dashboard.credits.balance} · 멤버십 {dashboard.credits.subscriptionBalance}
            </p>
          </article>
          <article className="moon-orbit-card p-5">
            <div className="app-caption">플랜 상태</div>
            <div className="mt-3 text-xl font-semibold text-[var(--app-ivory)]">
              {dashboard.subscription ? dashboard.subscription.status : '미가입'}
            </div>
            <p className="mt-2 text-sm leading-7 text-[var(--app-copy-muted)]">
              플랜과 코인, 다시보기 흐름을 한곳에서 관리합니다.
            </p>
          </article>
        </section>

        <section className="app-panel p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="app-caption">내 기록 메뉴</div>
              <h2 className="mt-2 font-[var(--font-heading)] text-3xl text-[var(--app-ivory)]">
                내 사주, 내 기록
              </h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-[var(--app-copy-muted)]">
              저장, 가족, 결제, 알림을 시안처럼 하나의 관리면에서 바로 이동할 수 있게 정리했습니다.
            </p>
          </div>

          <div className="mt-5 space-y-3">
            {MY_MENU_BLUEPRINT.map((item) => (
              <Link key={item.title} href={item.href} className="moon-account-row">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--app-gold)]/24 bg-[var(--app-gold)]/10 font-[var(--font-heading)] text-lg text-[var(--app-gold-text)]">
                  {item.title.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-base font-medium text-[var(--app-ivory)]">{item.title}</div>
                  <div className="mt-1 text-sm text-[var(--app-copy-muted)]">{item.description}</div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-[var(--app-copy-soft)]" />
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
