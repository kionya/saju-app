'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';
import SiteHeader from '@/features/shared-navigation/site-header';
import { AppShell } from '@/shared/layout/app-shell';
import {
  HOME_DAILY_LINES,
  HOME_HERO_TOKENS,
  HOME_TODAY_SUMMARY,
  INTERPRETATION_LAYERS,
  WISDOM_CARDS,
  toneClasses,
} from '@/content/moonlight';
import { cn } from '@/lib/utils';

function formatTodayLabel() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).formatToParts(now);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}년 ${values.month} ${values.day} · ${values.weekday}`;
}

export default function HomePage() {
  const [selectedSlug, setSelectedSlug] = useState(WISDOM_CARDS[0].slug);

  const todayLine = useMemo(() => {
    const now = new Date();
    return HOME_DAILY_LINES[now.getDate() % HOME_DAILY_LINES.length];
  }, []);

  const selectedWisdom =
    WISDOM_CARDS.find((card) => card.slug === selectedSlug) ?? WISDOM_CARDS[0];
  const selectedTone = toneClasses(selectedWisdom.tone);

  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-12">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="grid gap-5 lg:grid-cols-[1.28fr_0.72fr] lg:items-start">
          <article className="app-hero-card p-7 sm:p-8 lg:p-9">
            <div className="inline-flex items-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-3 py-1 text-[11px] tracking-[0.28em] text-[var(--app-gold)]/78">
              오늘의 한 줄
            </div>
            <div className="mt-5 text-sm text-[var(--app-gold)]/72">{formatTodayLabel()}</div>
            <p className="mt-4 max-w-2xl font-[var(--font-heading)] text-lg leading-8 text-[var(--app-copy)]">
              문득 마음이 머무는 날, 오늘의 결을 가장 먼저 조용히 펼쳐보실 수 있도록 준비했습니다.
            </p>
            <h1 className="mt-5 max-w-3xl font-[var(--font-heading)] text-4xl leading-[1.24] tracking-tight text-[var(--app-ivory)] sm:text-[3.35rem]">
              {todayLine.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--app-copy)] sm:text-lg">
              {todayLine.subtitle}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {HOME_HERO_TOKENS.map((token) => (
                <span key={token.label} className="moon-pill text-sm">
                  {token.label} · {token.value}
                </span>
              ))}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/saju/new"
                className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--app-gold)]/35 bg-[var(--app-gold)]/16 px-6 text-sm font-semibold text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/22"
              >
                사주 시작하기
              </Link>
              <Link
                href="/interpretation"
                className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-6 text-sm text-[var(--app-copy)] transition-colors hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]"
              >
                여섯 가지 지혜 보기
              </Link>
            </div>
          </article>

          <aside className="grid gap-3 lg:pt-3">
            {[
              {
                title: '새벽에 먼저 전하는 한마디',
                body: '아침 햇살이 들기 전, 오늘의 결을 짧고 또렷한 한 줄로 먼저 전해드립니다.',
              },
              {
                title: '지금 마음 가는 곳부터',
                body: '사주, 명리, 타로, 궁합, 별자리, 띠운세 가운데 오늘 가장 마음이 머무는 질문부터 편히 열어보세요.',
              },
              {
                title: '마음이 머문 해석 보관함',
                body: '좋았던 해석은 마이에 고이 모아두고, 나중에 다시 꺼내어 더 깊은 이야기로 이어보실 수 있습니다.',
              },
            ].map((item, index) => (
              <article
                key={item.title}
                className={cn(
                  'app-panel p-5',
                  index === 0 &&
                    'border-[var(--app-gold)]/22 bg-[linear-gradient(180deg,rgba(212,176,106,0.08),rgba(15,18,32,0.92))]'
                )}
              >
                <div className="app-caption">{item.title}</div>
                <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">{item.body}</p>
              </article>
            ))}
          </aside>
        </section>

        <section className="mt-8 app-section-stack">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="app-caption">여섯 가지 지혜</div>
              <h2 className="moon-section-title mt-3">문득 떠오르는 질문마다 다른 지혜가 기다리고 있습니다</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[var(--app-copy-muted)]">
              궁금증마다 읽는 결이 다릅니다. 마음이 먼저 움직이는 곳을 누르시면, 달빛선생이 그 자리에서부터 차분히 이야기를 풀어드립니다.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {WISDOM_CARDS.map((card) => {
              const tone = toneClasses(card.tone);
              const active = selectedSlug === card.slug;

              return (
                <button
                  key={card.slug}
                  type="button"
                  onClick={() => setSelectedSlug(card.slug)}
                  className={cn(
                    'moon-wisdom-card text-left',
                    active && 'border-[var(--app-gold)]/30 bg-[linear-gradient(180deg,rgba(32,38,62,0.95),rgba(12,18,34,0.94))]'
                  )}
                >
                  <div className={cn('moon-wisdom-hanja', tone.text)}>{card.hanja}</div>
                  <div className={cn('mt-3 font-[var(--font-heading)] text-2xl font-semibold', tone.text)}>
                    {card.title}
                  </div>
                  <p className="mt-3 text-base leading-7 text-[var(--app-ivory)]">“{card.hook}”</p>
                  <p className="mt-4 text-sm leading-7 text-[var(--app-copy-muted)]">{card.description}</p>
                </button>
              );
            })}
          </div>

          <article className="app-panel p-6 sm:p-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className={cn('app-caption', selectedTone.text)}>오늘 마음이 머무는 지혜</div>
                <h3 className="mt-3 font-[var(--font-heading)] text-3xl font-semibold text-[var(--app-ivory)]">
                  {selectedWisdom.title}
                </h3>
                <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--app-copy)]">
                  {selectedWisdom.description}
                </p>
              </div>
              <Link
                href={selectedWisdom.href}
                className={cn(
                  'inline-flex h-11 items-center justify-center gap-2 rounded-full border px-5 text-sm font-medium transition-colors',
                  selectedTone.border,
                  selectedTone.bg,
                  selectedTone.text
                )}
              >
                이 지혜 펼쳐보기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {INTERPRETATION_LAYERS.map((layer) => (
                <div key={layer.title} className="app-panel-muted p-5">
                  <div className="font-semibold text-[var(--app-ivory)]">{layer.title}</div>
                  <p className="mt-3 text-sm leading-7 text-[var(--app-copy-muted)]">{layer.body}</p>
                  <ul className="mt-4 space-y-2 text-sm text-[var(--app-copy)]">
                    {layer.items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-[0.38rem] h-1.5 w-1.5 rounded-full bg-[var(--app-gold)]/70" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="app-panel p-6 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="app-caption">내 오늘의 운</div>
                <h2 className="mt-3 text-2xl font-semibold text-[var(--app-ivory)]">오늘 마음에 남을 세 가지 흐름</h2>
              </div>
              <Link
                href="/saju/new"
                className="text-sm text-[var(--app-gold-text)] underline underline-offset-4 hover:text-[var(--app-ivory)]"
              >
                개인 리포트 열기
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {HOME_TODAY_SUMMARY.map((item) => {
                const tone = toneClasses(item.tone);

                return (
                  <div key={item.label} className="app-panel-muted p-4">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-[var(--app-copy)]">{item.label}</span>
                      <span className={cn('font-medium', tone.text)}>{item.value}</span>
                    </div>
                    <div className="moon-meter mt-3">
                      <span className={cn(tone.bg)} style={{ width: `${item.ratio}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="app-panel p-6 sm:p-7">
            <div className="app-caption">오늘 가장 많이 찾는 길</div>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--app-ivory)]">오늘은 이 길로 이어가 보셔도 좋습니다</h2>

            <div className="mt-6 space-y-4">
              {WISDOM_CARDS.slice(0, 4).map((card) => {
                const tone = toneClasses(card.tone);

                return (
                  <Link
                    key={card.slug}
                    href={card.href}
                    className="flex items-start justify-between gap-3 rounded-[1.35rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-4 transition-colors hover:border-[var(--app-line-strong)] hover:bg-[var(--app-surface-strong)]"
                  >
                    <div>
                      <div className={cn('text-[11px] tracking-[0.28em]', tone.text)}>{card.hanja}</div>
                      <div className="mt-2 font-semibold text-[var(--app-ivory)]">{card.title}</div>
                      <p className="mt-2 text-sm leading-7 text-[var(--app-copy-muted)]">“{card.hook}”</p>
                    </div>
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-[var(--app-copy-soft)]" />
                  </Link>
                );
              })}
            </div>
          </article>
        </section>
      </div>
    </AppShell>
  );
}
