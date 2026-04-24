import Link from 'next/link';
import type { Metadata } from 'next';
import { Lock, Sparkles, TrendingUp, Users, ArrowRight, ChevronRight } from 'lucide-react';
import SiteHeader from '@/features/shared-navigation/site-header';
import { AppShell } from '@/shared/layout/app-shell';
import { buildTodayFortune } from '@/lib/free-content-pages';

export const metadata: Metadata = {
  title: '오늘의 운세',
  description: '오늘의 흐름, 연애운, 재물운, 직장운을 짧고 선명하게 보는 무료 운세 페이지입니다.',
  alternates: { canonical: '/today-fortune' },
};

const TONE_ICONS: Record<string, string> = {
  '연애운': '💕',
  '재물운': '💰',
  '직장운': '📋',
  '관계운': '🤝',
  '오늘의 한 줄': '✨',
};

const GENERIC_VS_PERSONAL = [
  {
    category: '재물운',
    generic: '오늘은 지출을 줄이고 소비를 점검하는 것이 좋습니다.',
    personal: '甲木 일간의 선생님께서는 오늘 庚金 대운이 겹쳐 재물보다 관계 정리에 에너지를 먼저 쓰실 때 이후 재물 흐름이 열립니다. 오후 2시 이후 결정이 더 유리합니다.',
  },
  {
    category: '관계운',
    generic: '주변 사람과의 소통에 주의가 필요합니다.',
    personal: '食神이 강한 선생님의 오늘 일진에서는 먼저 표현하시는 분이 관계의 주도권을 가져갑니다. 가까운 가족보다 새로 만난 인연에서 뜻밖의 도움이 옵니다.',
  },
];

const PREMIUM_TEASER_ITEMS = [
  { icon: '🔮', label: '내 일간(日干) 기반 오늘 흐름', locked: true },
  { icon: '📅', label: '대운·세운 교차 오늘 운세', locked: true },
  { icon: '⏰', label: '시간대별 유리한 행동 타이밍', locked: true },
  { icon: '🧭', label: '오행 균형 기반 오늘 조언', locked: true },
  { icon: '💬', label: '달빛선생과 직접 대화로 이어보기', locked: false },
];

export default function TodayFortunePage() {
  const todayFortune = buildTodayFortune();

  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-0">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">

        {/* ─── HERO HEADER ─── */}
        <section className="moon-lunar-panel p-6 sm:p-8">
          <div className="app-starfield" />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--app-gold)]/30 bg-[var(--app-gold)]/10 px-3 py-1 text-xs text-[var(--app-gold-text)]">
                <Sparkles className="h-3 w-3" /> 무료 운세
              </span>
              <span className="rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-3 py-1 text-xs text-[var(--app-copy-muted)]">
                가볍게 펼쳐보는 오늘의 흐름
              </span>
            </div>
            <h1 className="mt-5 font-[var(--font-heading)] text-4xl font-semibold tracking-tight text-[var(--app-ivory)] sm:text-5xl">
              오늘의 운세
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--app-copy-muted)]">
              {todayFortune.headline} {todayFortune.summary}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="moon-pill text-sm">오늘의 컬러 · {todayFortune.luckyColor}</span>
              <span className="moon-pill text-sm">좋은 시간 · {todayFortune.luckyTime}</span>
            </div>
          </div>
        </section>

        {/* ─── FORTUNE CARDS ─── */}
        <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {todayFortune.sections.map((section) => (
            <article
              key={section.title}
              className="app-panel-muted rounded-[1.35rem] p-5"
            >
              <div className="flex items-center gap-2 text-sm text-[var(--app-gold-text)]">
                <span>{TONE_ICONS[section.title] ?? '•'}</span>
                {section.title}
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--app-copy-muted)]">{section.body}</p>
            </article>
          ))}
        </section>

        {/* ─── PAYWALL HOOK: 개인 사주와의 차이 ─── */}
        <section className="mt-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--app-line)]" />
            <span className="text-xs tracking-[0.22em] text-[var(--app-copy-soft)]">달빛선생 멤버는 이렇게 다릅니다</span>
            <div className="h-px flex-1 bg-[var(--app-line)]" />
          </div>

          <div className="space-y-3">
            {GENERIC_VS_PERSONAL.map((item) => (
              <div
                key={item.category}
                className="overflow-hidden rounded-[1.35rem] border border-[var(--app-line)]"
              >
                {/* 일반 운세 */}
                <div className="border-b border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 py-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-[10px] tracking-[0.2em] text-[var(--app-copy-soft)]">일반 운세</span>
                    <span className="rounded-full bg-[var(--app-surface-muted)] px-2 py-0.5 text-[10px] text-[var(--app-copy-muted)]">{item.category}</span>
                  </div>
                  <p className="text-sm leading-7 text-[var(--app-copy-muted)]">{item.generic}</p>
                </div>

                {/* 개인화 운세 — 블러 처리 */}
                <div className="relative bg-[linear-gradient(135deg,rgba(22,26,46,0.95),rgba(12,18,34,0.97))] px-5 py-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-[10px] tracking-[0.2em] text-[var(--app-gold-text)]">내 사주 기반</span>
                    <span className="rounded-full border border-[var(--app-gold)]/20 bg-[var(--app-gold)]/10 px-2 py-0.5 text-[10px] text-[var(--app-gold-text)]">
                      개인화
                    </span>
                  </div>
                  <p className="text-sm leading-7 text-[var(--app-ivory)] blur-[3.5px] select-none">
                    {item.personal}
                  </p>
                  {/* Lock overlay */}
                  <div className="absolute inset-0 flex items-center justify-center rounded-b-[1.35rem]">
                    <div className="flex items-center gap-2 rounded-full border border-[var(--app-gold)]/30 bg-[var(--app-bg)]/80 px-4 py-2 backdrop-blur-sm">
                      <Lock className="h-3.5 w-3.5 text-[var(--app-gold)]" />
                      <span className="text-xs font-medium text-[var(--app-gold-text)]">멤버십으로 열람</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── PREMIUM TEASER LIST ─── */}
        <section className="mt-6 rounded-[1.55rem] border border-[var(--app-gold)]/20 bg-[linear-gradient(135deg,rgba(32,28,18,0.97),rgba(10,12,22,0.98))] p-6">
          <div className="mb-1 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[var(--app-gold)]" />
            <span className="text-xs tracking-[0.22em] text-[var(--app-gold)]">달빛선생 플러스</span>
          </div>
          <h2 className="mt-2 font-[var(--font-heading)] text-xl font-semibold text-[var(--app-ivory)]">
            내 생년월일로 보면 이 모든 게 열립니다
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--app-copy-muted)]">
            일간(日干)과 오늘의 일진이 어떻게 겹치는지, 어느 시간에 움직여야 하는지를 구체적으로 읽어드립니다.
          </p>

          <ul className="mt-5 space-y-2.5">
            {PREMIUM_TEASER_ITEMS.map((item) => (
              <li key={item.label} className="flex items-center gap-3">
                <span className="text-base">{item.icon}</span>
                <span className={item.locked ? 'text-sm text-[var(--app-copy)]' : 'text-sm text-[var(--app-copy-muted)] line-through'}>
                  {item.label}
                </span>
                {item.locked ? (
                  <Lock className="ml-auto h-3.5 w-3.5 shrink-0 text-[var(--app-gold)]/60" />
                ) : (
                  <span className="ml-auto rounded-full bg-[var(--app-jade)]/15 px-2 py-0.5 text-[10px] text-[var(--app-jade)]">무료</span>
                )}
              </li>
            ))}
          </ul>

          {/* 소셜 프루프 */}
          <div className="mt-5 flex items-center gap-2 rounded-[0.9rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-3">
            <Users className="h-4 w-4 shrink-0 text-[var(--app-copy-soft)]" />
            <p className="text-xs leading-6 text-[var(--app-copy-muted)]">
              오늘 <span className="font-semibold text-[var(--app-ivory)]">4,218명</span>이 개인화 운세를 확인했습니다. 일반 운세보다 평균 <span className="font-semibold text-[var(--app-gold-text)]">3.2배</span> 구체적인 내용을 받아보셨습니다.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/membership"
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[var(--app-gold)] px-6 text-sm font-bold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-text)]"
            >
              월 4,900원으로 시작하기
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/saju/new"
              className="inline-flex h-12 items-center justify-center gap-1.5 rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-6 text-sm text-[var(--app-copy)] transition-colors hover:border-[var(--app-gold)]/30 hover:text-[var(--app-ivory)]"
            >
              먼저 사주 보기 <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-3 text-center text-[11px] text-[var(--app-copy-soft)]">
            언제든 해지 가능 · 남은 기간은 그대로 이용
          </p>
        </section>

        {/* ─── SECONDARY CTA ─── */}
        <section className="mt-5 app-panel p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--app-ivory)]">오늘의 타로도 함께 보시겠어요?</p>
              <p className="mt-1 text-xs leading-6 text-[var(--app-copy-muted)]">
                카드 한 장으로 지금 마음의 결을 먼저 살펴볼 수 있습니다.
              </p>
            </div>
            <Link
              href="/tarot/daily"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 text-sm text-[var(--app-copy)] transition-colors hover:border-[var(--app-gold)]/30 hover:text-[var(--app-ivory)]"
            >
              타로 보기 <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

      </div>
    </AppShell>
  );
}
