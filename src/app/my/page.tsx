import Link from 'next/link';
import { ChevronRight, BookOpen, Coins, Star } from 'lucide-react';
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
    reading.gender === 'male' ? '남성' : reading.gender === 'female' ? '여성' : '성별 미선택';
  return `${reading.birthYear}.${reading.birthMonth}.${reading.birthDay} · ${hourLabel} · ${genderLabel}`;
}

const MENU_ICONS: Record<string, string> = {
  '내 사주 원국': '四',
  '저장한 해석': '卷',
  '가족 사주': '家',
  '프리미엄 플랜': '✦',
  '알림 센터': '鐘',
  '설정': '⚙',
  '문의 · 도움말': '?',
};

export default async function MyPage() {
  const dashboard = await getAccountDashboardData('/my', {
    readingLimit: 4,
    transactionLimit: 4,
  });

  const mostRecentReading = dashboard.recentReadings[0];
  const displayName = dashboard.user.email?.split('@')[0] ?? '선생님';
  const sigil = mostRecentReading?.dayMasterStem ?? '月';
  const isPremium = Boolean(dashboard.subscription);

  const STATS = [
    {
      label: '저장한 해석',
      value: dashboard.recentReadings.length,
      sub: '결과보관함에서 다시 보기',
      href: '/my/results',
      icon: BookOpen,
      toneCls: 'text-[var(--app-gold-text)]',
      borderCls: 'border-[var(--app-gold)]/22',
      bgCls: 'bg-[var(--app-gold)]/8',
    },
    {
      label: '사용 가능한 코인',
      value: dashboard.credits.total,
      sub: `일반 ${dashboard.credits.balance} · 멤버십 ${dashboard.credits.subscriptionBalance}`,
      href: '/credits',
      icon: Coins,
      toneCls: 'text-[var(--app-jade)]',
      borderCls: 'border-[var(--app-jade)]/22',
      bgCls: 'bg-[var(--app-jade)]/8',
    },
    {
      label: '플랜 상태',
      value: isPremium ? dashboard.subscription?.status ?? '활성' : '미가입',
      sub: isPremium ? '마이 결제에서 관리하기' : '플랜 가입으로 더 깊이 보기',
      href: isPremium ? '/my/billing' : '/membership',
      icon: Star,
      toneCls: isPremium ? 'text-[var(--app-plum)]' : 'text-[var(--app-copy-muted)]',
      borderCls: isPremium ? 'border-[var(--app-plum)]/22' : 'border-[var(--app-line)]',
      bgCls: isPremium ? 'bg-[var(--app-plum)]/8' : 'bg-[var(--app-surface-muted)]',
    },
  ] as const;

  return (
    <div className="my-dashboard-grid grid gap-6 lg:grid-cols-[22rem_1fr] lg:items-start">

      {/* ─── ASIDE ─── */}
      <aside className="my-dashboard-aside space-y-4">

        {/* 프로필 카드 */}
        <section className="my-profile-card moon-lunar-panel p-6 text-center">
          <div className="app-starfield" />
          <div className="relative z-10">
            {/* 일간 오브 */}
            <div className="relative mx-auto h-24 w-24">
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_34%_34%,var(--app-gold-text),var(--app-gold),var(--app-gold-soft))] opacity-20 blur-xl" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-[var(--app-gold)]/40 bg-[radial-gradient(circle_at_34%_34%,rgba(212,176,106,0.28),rgba(31,37,64,0.96))] font-[var(--font-heading)] text-4xl font-semibold text-[var(--app-gold-text)]">
                {sigil}
              </div>
            </div>

            <h1 className="mt-5 font-[var(--font-heading)] text-2xl font-semibold text-[var(--app-ivory)]">
              {displayName} 선생님
            </h1>

            {mostRecentReading ? (
              <p className="mt-2 text-xs leading-6 text-[var(--app-copy-soft)]">
                {formatBirthLabel(mostRecentReading)}
              </p>
            ) : (
              <p className="mt-2 text-xs leading-6 text-[var(--app-copy-soft)]">
                첫 사주를 저장하시면 원국이 표시됩니다
              </p>
            )}

            {mostRecentReading?.dayPillarLabel && (
              <p className="mt-1.5 font-[var(--font-heading)] text-xs tracking-[0.28em] text-[var(--app-gold)]/72">
                {mostRecentReading.dayPillarLabel}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <span className={`rounded-full border px-3 py-1 text-xs ${isPremium ? 'border-[var(--app-gold)]/28 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]' : 'border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]'}`}>
                {isPremium ? '프리미엄 회원' : '무료 이용 중'}
              </span>
              <span className="rounded-full border border-[var(--app-jade)]/25 bg-[var(--app-jade)]/8 px-3 py-1 text-xs text-[var(--app-jade)]">
                코인 {dashboard.credits.total}
              </span>
            </div>
          </div>
        </section>

        {/* 가족 사주 카드 */}
        <section className="my-family-card app-panel p-5">
          <div className="app-caption">가족 사주</div>
          <h2 className="mt-3 font-[var(--font-heading)] text-xl text-[var(--app-ivory)]">
            가까운 분들의 흐름도 함께
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--app-copy-muted)]">
            가족 프로필을 저장해두면 매번 다시 입력하지 않고 궁합과 가족 리포트로 이어갈 수 있습니다.
          </p>
          <Link
            href="/my/profile"
            className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-full border border-[var(--app-gold)]/28 bg-[var(--app-gold)]/10 text-sm font-medium text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/16"
          >
            가족 정보 관리
          </Link>
        </section>
      </aside>

      {/* ─── MAIN ─── */}
      <main className="my-dashboard-main space-y-5">

        {/* 통계 카드 3개 */}
        <section className="my-stats-grid grid gap-4 md:grid-cols-3">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.label}
                href={stat.href}
                className={`group moon-orbit-card block p-5 transition-colors hover:border-[var(--app-line-strong)]`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="app-caption">{stat.label}</div>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${stat.borderCls} ${stat.bgCls}`}>
                    <Icon className={`h-4 w-4 ${stat.toneCls}`} />
                  </div>
                </div>
                <div className={`mt-3 font-[var(--font-heading)] text-4xl font-semibold ${stat.toneCls}`}>
                  {stat.value}
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--app-copy-muted)]">{stat.sub}</p>
                <div className={`mt-4 flex items-center gap-1 text-xs opacity-0 transition-opacity group-hover:opacity-100 ${stat.toneCls}`}>
                  바로가기 <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            );
          })}
        </section>

        {/* 메뉴 */}
        <section className="my-menu-panel app-panel p-5 sm:p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="app-caption">내 기록 메뉴</div>
              <h2 className="mt-2 font-[var(--font-heading)] text-2xl text-[var(--app-ivory)]">
                내 사주, 내 기록
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-[var(--app-copy-muted)]">
              저장, 가족, 결제, 알림을 한 화면에서 바로 이동할 수 있습니다.
            </p>
          </div>

          <div className="space-y-2.5">
            {MY_MENU_BLUEPRINT.map((item) => (
              <Link key={item.title} href={item.href} className="moon-account-row group">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--app-gold)]/22 bg-[var(--app-gold)]/8 font-[var(--font-heading)] text-base text-[var(--app-gold-text)]">
                  {MENU_ICONS[item.title] ?? item.title.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-[var(--app-ivory)]">{item.title}</div>
                  <div className="mt-0.5 text-xs text-[var(--app-copy-muted)]">{item.description}</div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-[var(--app-copy-soft)] transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
