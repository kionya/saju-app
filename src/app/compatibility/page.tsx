import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Lock } from 'lucide-react';
import { COMPATIBILITY_RELATIONSHIPS } from '@/content/moonlight';
import SiteHeader from '@/features/shared-navigation/site-header';
import { WisdomCategoryHero } from '@/features/shared-navigation/wisdom-category-hero';
import { AppShell } from '@/shared/layout/app-shell';

export const metadata: Metadata = {
  title: '궁합',
  description: '연인, 배우자, 부모자녀, 가족과의 궁합을 관계별 질문으로 살펴보는 궁합 페이지입니다.',
  alternates: { canonical: '/compatibility' },
};

const RELATIONSHIP_TONES: Record<string, { type: string; icon: string; badge: string; badgeCls: string }> = {
  lover:   { type: 'lover',   icon: '💕', badge: '연인·배우자',  badgeCls: 'border-[var(--app-coral)]/25 bg-[var(--app-coral)]/10 text-[var(--app-coral)]' },
  family:  { type: 'family',  icon: '🌿', badge: '부모·자녀',   badgeCls: 'border-[var(--app-jade)]/25 bg-[var(--app-jade)]/10 text-[var(--app-jade)]' },
  friend:  { type: 'friend',  icon: '🌊', badge: '형제·친구',   badgeCls: 'border-[var(--app-sky)]/25 bg-[var(--app-sky)]/10 text-[var(--app-sky)]' },
  partner: { type: 'partner', icon: '✦',  badge: '동업·파트너', badgeCls: 'border-[var(--app-gold)]/25 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]' },
};

export default function CompatibilityPage() {
  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-0">
      <div className="wisdom-category-page">
        <WisdomCategoryHero slug="compatibility" />
        <div className="wisdom-category-body">

          {/* ─── RELATIONSHIP CARDS ─── */}
          <section className="mt-8 grid gap-4 md:grid-cols-2">
            {COMPATIBILITY_RELATIONSHIPS.map((item) => {
              const tone = RELATIONSHIP_TONES[item.slug];
              return (
                <Link
                  key={item.slug}
                  href={`/compatibility/input?relationship=${item.slug}`}
                  className="moon-compat-card group"
                  data-type={tone?.type}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] text-2xl">
                      {tone?.icon ?? item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] tracking-[0.14em] ${tone?.badgeCls ?? 'border-[var(--app-line)] text-[var(--app-copy-muted)]'}`}>
                          {tone?.badge ?? item.title}
                        </span>
                      </div>
                      <p className="mt-3 text-base leading-8 text-[var(--app-ivory)]">"{item.hook}"</p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[var(--app-copy-soft)] opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </Link>
              );
            })}
          </section>

          {/* ─── PAYWALL HOOK ─── */}
          <section className="mt-6 rounded-[1.55rem] border border-[var(--app-jade)]/22 bg-[linear-gradient(135deg,rgba(107,166,139,0.08),rgba(10,12,22,0.97))] p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="app-caption mb-2">프리미엄 전용</div>
                <h2 className="font-[var(--font-heading)] text-xl font-semibold text-[var(--app-ivory)]">
                  두 분의 결이 어디서 닮고 어디서 어긋나는지
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--app-copy-muted)]">
                  처음이시라면 관계를 고르고 입력 화면까지 먼저 천천히 둘러보실 수 있습니다.
                  프리미엄 해석은 갈등이 반복되는 이유, 가까워지는 방식, 올해 대화 타이밍까지 구체적으로 읽어드립니다.
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                <Link
                  href="/membership"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--app-jade)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:opacity-90"
                >
                  <Lock className="h-3.5 w-3.5" /> 멤버십으로 열기
                </Link>
                <span className="text-center text-[11px] text-[var(--app-copy-soft)]">월 4,900원부터</span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </AppShell>
  );
}
