'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';
import SiteHeader from '@/features/shared-navigation/site-header';
import { AppShell } from '@/shared/layout/app-shell';
import {
  HOME_DAILY_LINES,
  HOME_HERO_TOKENS,
  INTERPRETATION_LAYERS,
  WISDOM_CARDS,
  toneClasses,
} from '@/content/moonlight';
import {
  buildHomePersonalizationCopy,
  buildPersonalizedTodaySummary,
  type HomeProfileLoadStatus,
  type HomeProfilePreview,
} from '@/features/home/personalized-today';
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
  const [profilePreview, setProfilePreview] = useState<HomeProfilePreview | null>(null);
  const [profileLoadStatus, setProfileLoadStatus] = useState<HomeProfileLoadStatus>('loading');

  const todayLine = useMemo(() => {
    const now = new Date();
    return HOME_DAILY_LINES[now.getDate() % HOME_DAILY_LINES.length];
  }, []);
  const personalizedTodaySummary = useMemo(
    () => buildPersonalizedTodaySummary(profilePreview),
    [profilePreview]
  );
  const personalizationCopy = useMemo(
    () => buildHomePersonalizationCopy(profilePreview, profileLoadStatus),
    [profileLoadStatus, profilePreview]
  );

  const selectedWisdom =
    WISDOM_CARDS.find((card) => card.slug === selectedSlug) ?? WISDOM_CARDS[0];
  const selectedTone = toneClasses(selectedWisdom.tone);
  const displayName = profilePreview?.profile?.displayName?.trim() || '방문자';
  const todayLabel = formatTodayLabel();

  useEffect(() => {
    let isActive = true;

    async function loadProfilePreview() {
      try {
        const response = await fetch('/api/profile', { cache: 'no-store' });
        if (!response.ok) throw new Error('profile load failed');
        const data = (await response.json()) as HomeProfilePreview;
        if (!isActive) return;

        setProfilePreview({
          authenticated: Boolean(data.authenticated),
          profile: data.profile ?? null,
        });
        setProfileLoadStatus('ready');
      } catch {
        if (!isActive) return;
        setProfileLoadStatus('error');
      }
    }

    void loadProfilePreview();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-12">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-sm tracking-[0.12em] text-[var(--app-copy-soft)]">{todayLabel}</div>
            <h1 className="mt-3 font-[var(--font-heading)] text-3xl font-medium tracking-tight text-[var(--app-ivory)] sm:text-4xl">
              안녕하세요, {displayName} 선생님
            </h1>
            <p className="mt-2 text-sm leading-7 text-[var(--app-copy-muted)]">
              오늘의 지혜와 저장된 개인 흐름을 한 화면에서 이어볼 수 있게 준비했습니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/notifications"
              className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 text-sm text-[var(--app-copy)] transition-colors hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]"
            >
              알림 확인
            </Link>
            <Link
              href="/today-fortune"
              className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--app-gold)] px-4 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-text)]"
            >
              오늘의 운세
            </Link>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_21rem] lg:items-stretch">
          <article className="moon-lunar-panel p-7 sm:p-8 lg:p-9">
            <div className="app-starfield" />
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-3 py-1 text-[11px] tracking-[0.28em] text-[var(--app-gold)]/78">
                  오늘의 한 줄
                </div>
                <p className="mt-5 max-w-2xl font-[var(--font-heading)] text-lg leading-8 text-[var(--app-copy)]">
                  문득 마음이 머무는 날, 오늘의 결을 가장 먼저 조용히 펼쳐드립니다.
                </p>
                <h2 className="mt-5 max-w-3xl font-[var(--font-heading)] text-4xl leading-[1.24] tracking-tight text-[var(--app-ivory)] sm:text-[3.35rem]">
                  {todayLine.title}
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--app-copy)] sm:text-lg">
                  {todayLine.subtitle}
                </p>
              </div>
              <div className="hidden shrink-0 flex-col items-center gap-4 lg:flex">
                <div className="app-moon-orb h-24 w-24" />
                <div className="text-center font-[var(--font-heading)] text-xs tracking-[0.45em] text-[var(--app-gold-soft)]">
                  月光
                </div>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-2">
              {HOME_HERO_TOKENS.map((token) => (
                <span key={token.label} className="moon-pill text-sm">
                  {token.label} · {token.value}
                </span>
              ))}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/saju/new"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--app-gold)] px-6 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-text)]"
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

          <aside className="app-panel p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="app-caption">{personalizationCopy.eyebrow}</div>
                <h2 className="mt-3 font-[var(--font-heading)] text-2xl text-[var(--app-ivory)]">
                  내 오늘의 운
                </h2>
              </div>
              <span
                className={cn(
                  'rounded-full border px-3 py-1 text-xs',
                  personalizationCopy.isPersonalized
                    ? 'border-[var(--app-jade)]/25 bg-[var(--app-jade)]/10 text-[var(--app-jade)]'
                    : 'border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]'
                )}
              >
                {personalizationCopy.isPersonalized ? '개인화' : '기본'}
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {personalizedTodaySummary.map((item) => {
                const tone = toneClasses(item.tone);

                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-[var(--app-copy-muted)]">{item.label}運</span>
                      <span className={cn('font-[var(--font-heading)] text-lg font-semibold', tone.text)}>
                        {item.value}
                      </span>
                    </div>
                    <div className="moon-meter mt-2">
                      <span className={cn(tone.bg)} style={{ width: `${item.ratio}%` }} />
                    </div>
                    <p className="mt-2 text-xs leading-6 text-[var(--app-copy-soft)]">{item.detail}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-[1rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-4">
              <p className="text-sm leading-7 text-[var(--app-copy)]">{personalizationCopy.body}</p>
              <Link
                href={personalizationCopy.ctaHref}
                className="mt-3 inline-flex text-sm font-medium text-[var(--app-gold-text)] underline underline-offset-4 hover:text-[var(--app-ivory)]"
              >
                {personalizationCopy.ctaLabel}
              </Link>
            </div>
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
            {WISDOM_CARDS.map((card, index) => {
              const tone = toneClasses(card.tone);
              const active = selectedSlug === card.slug;

              return (
                <button
                  key={card.slug}
                  type="button"
                  onClick={() => setSelectedSlug(card.slug)}
                  className={cn(
                    'moon-wisdom-card moon-design-reveal text-left',
                    active && 'border-[var(--app-gold)]/30 bg-[linear-gradient(180deg,rgba(32,38,62,0.95),rgba(12,18,34,0.94))]'
                  )}
                  style={{ animationDelay: `${index * 60}ms` }}
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
          <article className="moon-lunar-panel p-6 sm:p-7">
            <div className="app-starfield" />
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="app-caption">개인화 준비</div>
                <h2 className="mt-3 font-[var(--font-heading)] text-2xl font-semibold text-[var(--app-ivory)]">
                  내 정보가 저장되면 더 깊어집니다
                </h2>
              </div>
              <Link
                href={personalizationCopy.ctaHref}
                className="text-sm text-[var(--app-gold-text)] underline underline-offset-4 hover:text-[var(--app-ivory)]"
              >
                {personalizationCopy.ctaLabel}
              </Link>
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--app-copy-muted)]">
              {personalizationCopy.body} 저장된 생년월일과 출생 시각은 사주 입력, 오늘 흐름, 가족 리포트에서 반복 입력 없이 이어집니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span
                className={cn(
                  'rounded-full border px-3 py-1 text-xs',
                  personalizationCopy.isPersonalized
                    ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200'
                    : 'border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]'
                )}
              >
                {personalizationCopy.isPersonalized ? '개인화 적용' : '기본 흐름'}
              </span>
              {profileLoadStatus === 'loading' ? (
                <span className="rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-3 py-1 text-xs text-[var(--app-copy-muted)]">
                  불러오는 중
                </span>
              ) : null}
            </div>

            <div className="mt-6 space-y-3">
              {[
                ['내 정보 저장', '출생 연월일과 시·분을 MY에 한 번만 저장합니다.'],
                ['해석 자동 입력', '사주 보기에서 “내 정보 불러오기”로 바로 채웁니다.'],
                ['가족 확장', '가족 프로필을 저장해 궁합과 가족 리포트로 이어갑니다.'],
              ].map(([title, body], index) => (
                <div key={title} className="moon-payment-row px-4 py-4">
                  <div className="text-xs tracking-[0.24em] text-[var(--app-gold-text)]">
                    STEP {index + 1}
                  </div>
                  <div className="mt-2 font-medium text-[var(--app-ivory)]">{title}</div>
                  <p className="mt-1 text-sm leading-7 text-[var(--app-copy-muted)]">{body}</p>
                </div>
              ))}
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
