import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import SiteHeader from '@/features/shared-navigation/site-header';
import { AppShell } from '@/shared/layout/app-shell';
import {
  INTERPRETATION_ENTRY_GUIDE,
  INTERPRETATION_JOURNEY,
  INTERPRETATION_LAYERS,
  WISDOM_CARDS,
  toneClasses,
} from '@/content/moonlight';

export const metadata: Metadata = {
  title: '해석',
  description: '사주, 명리, 타로, 궁합, 별자리, 띠운세 여섯 가지 지혜를 한곳에서 차분히 살펴보세요.',
  alternates: { canonical: '/interpretation' },
};

export default function InterpretationPage() {
  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-0">
      <div className="interpretation-page mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

        {/* ─── HERO ─── */}
        <section className="interpretation-title-band moon-lunar-panel p-8 sm:p-10">
          <div className="app-starfield" />
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="app-caption mb-4">여섯 가지 지혜</div>
              <h1 className="font-[var(--font-heading)] text-4xl leading-[1.28] tracking-tight text-[var(--app-ivory)] sm:text-5xl">
                오늘 마음에 닿는 물음마다<br className="hidden sm:block" /> 읽는 방식이 다릅니다
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--app-copy-muted)]">
                사주는 삶의 바탕을, 명리는 반복되는 결을, 타로와 궁합은 오늘의 선택과 관계를 읽습니다.
                별자리와 띠운세는 가볍게 마음을 먼저 열어드립니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end lg:gap-1.5">
              {WISDOM_CARDS.map((card) => {
                const tone = toneClasses(card.tone);
                return (
                  <span key={card.slug} className={`text-[10px] tracking-[0.32em] ${tone.text}`}>
                    {card.hanja}
                  </span>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── WISDOM CARD GRID ─── */}
        <section className="interpretation-wisdom-grid mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {WISDOM_CARDS.map((card) => {
            const tone = toneClasses(card.tone);
            return (
              <Link
                key={card.slug}
                href={card.href}
                className="moon-wisdom-link-card group"
                data-tone={card.tone}
              >
                <div className={`moon-wisdom-hanja ${tone.text}`}>{card.hanja}</div>
                <div className={`mt-3 font-[var(--font-heading)] text-2xl font-semibold ${tone.text}`}>
                  {card.title}
                </div>
                <p className="mt-3 text-base leading-7 text-[var(--app-ivory)]">"{card.hook}"</p>
                <p className="mt-4 text-sm leading-7 text-[var(--app-copy-muted)]">{card.description}</p>
                <div className={`mt-5 flex items-center gap-1.5 text-xs font-medium opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${tone.text}`}>
                  펼쳐보기 <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            );
          })}
        </section>

        {/* ─── LAYER GRID ─── */}
        <section className="interpretation-layer-grid mt-6 grid gap-4 lg:grid-cols-3">
          {INTERPRETATION_LAYERS.map((layer, i) => (
            <article key={layer.title} className="app-panel p-6">
              <div className="mb-1 font-[var(--font-heading)] text-3xl text-[var(--app-gold)]/20 select-none">
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="app-caption">{layer.title}</div>
              <p className="mt-4 text-sm leading-7 text-[var(--app-copy)]">{layer.body}</p>
              <ul className="mt-4 space-y-2 text-sm text-[var(--app-copy)]">
                {layer.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-[0.38rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--app-gold)]/70" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        {/* ─── BOTTOM GRID ─── */}
        <section className="interpretation-bottom-grid mt-6 grid gap-5 lg:grid-cols-[0.96fr_1.04fr]">

          <article className="app-panel p-6">
            <div className="app-caption mb-5">어떤 이야기부터 펼쳐볼까요?</div>
            <div className="space-y-3">
              {INTERPRETATION_ENTRY_GUIDE.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.2rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 py-5 transition-colors hover:border-[var(--app-line-strong)] hover:bg-[var(--app-surface-strong)]"
                >
                  <div className="font-[var(--font-heading)] text-xl text-[var(--app-ivory)]">
                    {item.title}
                  </div>
                  <p className="mt-2 text-sm leading-7 text-[var(--app-copy)]">{item.body}</p>
                  <div className="mt-4">
                    <Link
                      href={item.href}
                      className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[var(--app-gold)]/28 bg-[var(--app-gold)]/10 px-4 text-sm font-medium text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/18"
                    >
                      {item.cta} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="moon-lunar-panel p-6">
            <div className="app-starfield" />
            <div className="relative z-10">
              <div className="app-caption">가벼운 첫 해석에서 깊은 리포트까지</div>
              <div className="mt-4 font-[var(--font-heading)] text-2xl leading-[1.4] text-[var(--app-gold-text)]">
                좋은 해석은 그날의 마음에서 끝나지 않습니다
              </div>
              <div className="mt-5 space-y-3">
                {INTERPRETATION_JOURNEY.map((step, i) => (
                  <div
                    key={step.title}
                    className="rounded-[1.15rem] border border-[var(--app-gold)]/16 bg-[var(--app-surface-muted)] px-4 py-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 font-[var(--font-heading)] text-sm text-[var(--app-gold)]/60">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <div className="text-sm font-medium text-[var(--app-ivory)]">{step.title}</div>
                        <p className="mt-2 text-sm leading-7 text-[var(--app-copy-muted)]">{step.body}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/membership"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-gold)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-bright)]"
                >
                  플랜 비교 보기
                </Link>
                <Link
                  href="/saju/new"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-gold)]/32 bg-[var(--app-gold)]/12 px-5 text-sm text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/20"
                >
                  사주 시작하기
                </Link>
              </div>
            </div>
          </article>
        </section>

      </div>
    </AppShell>
  );
}
