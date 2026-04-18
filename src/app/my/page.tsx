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
    <div className="space-y-6">
      <section className="app-panel overflow-hidden p-0">
        <div className="bg-[radial-gradient(circle_at_top,_rgba(210,176,114,0.18),_transparent_54%),linear-gradient(180deg,rgba(22,26,46,0.95),rgba(10,18,36,0.95))] px-6 py-8 text-center sm:px-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[var(--app-gold)]/35 bg-[var(--app-gold)]/16 font-[var(--font-heading)] text-2xl font-semibold text-[var(--app-gold-text)]">
            {sigil}
          </div>
          <h1 className="mt-4 font-[var(--font-heading)] text-3xl font-semibold text-[var(--app-gold-text)]">
            {displayName} 선생님
          </h1>
          <p className="mt-2 text-sm text-[var(--app-copy-muted)]">
            {mostRecentReading
              ? formatBirthLabel(mostRecentReading)
              : '첫 사주를 저장하시면 이곳에 선생님의 원국이 함께 표시됩니다.'}
          </p>
          {mostRecentReading?.dayPillarLabel ? (
            <p className="mt-2 text-xs tracking-[0.24em] text-[var(--app-gold)]/72">
              {mostRecentReading.dayPillarLabel}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Badge className="border-[var(--app-gold)]/28 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]">
              {dashboard.subscription ? '프리미엄 회원' : '무료 이용 중'}
            </Badge>
            <Badge className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]">
              코인 {dashboard.credits.total}
            </Badge>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="app-panel p-5">
          <div className="app-caption">저장한 해석</div>
          <div className="mt-3 text-3xl font-semibold text-[var(--app-ivory)]">
            {dashboard.recentReadings.length}
          </div>
          <p className="mt-2 text-sm leading-7 text-[var(--app-copy-muted)]">최근 보신 결과와 마음에 남은 해석을 다시 보실 수 있습니다.</p>
        </article>
        <article className="app-panel p-5">
          <div className="app-caption">사용 가능한 코인</div>
          <div className="mt-3 text-3xl font-semibold text-[var(--app-ivory)]">
            {dashboard.credits.total}
          </div>
          <p className="mt-2 text-sm leading-7 text-[var(--app-copy-muted)]">일반 {dashboard.credits.balance} · 멤버십 {dashboard.credits.subscriptionBalance}</p>
        </article>
        <article className="app-panel p-5">
          <div className="app-caption">플랜 상태</div>
          <div className="mt-3 text-xl font-semibold text-[var(--app-ivory)]">
            {dashboard.subscription ? dashboard.subscription.status : '미가입'}
          </div>
          <p className="mt-2 text-sm leading-7 text-[var(--app-copy-muted)]">플랜과 코인, 다시보기 흐름을 한곳에서 관리합니다.</p>
        </article>
      </section>

      <section className="space-y-3">
        {MY_MENU_BLUEPRINT.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="flex items-center gap-4 rounded-[1.4rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 py-4 transition-colors hover:border-[var(--app-line-strong)] hover:bg-[var(--app-surface-strong)]"
          >
            <div className="min-w-0 flex-1">
              <div className="text-base font-medium text-[var(--app-ivory)]">{item.title}</div>
              <div className="mt-1 text-sm text-[var(--app-copy-muted)]">{item.description}</div>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-[var(--app-copy-soft)]" />
          </Link>
        ))}
      </section>
    </div>
  );
}
