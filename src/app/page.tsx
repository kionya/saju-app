'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { CounselorSelector } from '@/components/counselor/counselor-selector';
import { TodayConcernSelector } from '@/components/today-fortune/today-concern-selector';
import SiteHeader from '@/features/shared-navigation/site-header';
import { MoonlightHeroVideo } from '@/components/home/moonlight-hero-video';
import { usePreferredCounselor } from '@/features/counselor/use-preferred-counselor';
import { trackMoonlightEvent } from '@/lib/analytics';
import type { ConcernId } from '@/lib/today-fortune/types';
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
  const values = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${values.year}년 ${values.month} ${values.day} · ${values.weekday}`;
}

function buildHomeImpactSignal(
  items: ReturnType<typeof buildPersonalizedTodaySummary>,
  isPersonalized: boolean
) {
  const weakest = [...items].sort((a, b) => a.ratio - b.ratio)[0];
  const strongest = [...items].sort((a, b) => b.ratio - a.ratio)[0];

  const signalByLabel: Record<string, { headline: string; body: string }> = {
    재물: {
      headline: isPersonalized ? '지출보다 정산을 먼저 볼수록 좋습니다.' : '돈의 흐름은 속도보다 점검이 먼저입니다.',
      body: '큰 기회보다 새는 구멍을 먼저 막을수록 체감 운이 더 단단해집니다.',
    },
    컨디션: {
      headline: isPersonalized ? '무리하면 바로 티가 나는 날입니다.' : '컨디션은 회복 리듬을 먼저 살피는 편이 좋습니다.',
      body: '몰아서 버티기보다 쉬는 구간을 먼저 정해두면 하루가 훨씬 안정적으로 갑니다.',
    },
    관계: {
      headline: isPersonalized ? '말의 온도를 낮출수록 흐름이 풀립니다.' : '관계운은 표현의 세기보다 타이밍을 보세요.',
      body: '결론을 서두르기보다 짧은 확인과 부드러운 말투가 오해를 줄여줍니다.',
    },
  };

  const signal = signalByLabel[weakest.label] ?? {
    headline: '오늘은 흐름을 먼저 읽고 움직이는 편이 좋습니다.',
    body: '무리하게 앞서가기보다 약한 축을 먼저 보완하면 운의 체감이 더 좋아집니다.',
  };

  return {
    weakest,
    strongest,
    headline: signal.headline,
    body: signal.body,
  };
}

export default function HomePage() {
  const [selectedSlug, setSelectedSlug] = useState(WISDOM_CARDS[0].slug);
  const [selectedConcern, setSelectedConcern] = useState<ConcernId>('general');
  const [concernExpanded, setConcernExpanded] = useState(false);
  const [profilePreview, setProfilePreview] = useState<HomeProfilePreview | null>(null);
  const [profileLoadStatus, setProfileLoadStatus] = useState<HomeProfileLoadStatus>('loading');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [metersVisible, setMetersVisible] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const metersRef = useRef<HTMLDivElement>(null);

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

  const selectedWisdom = WISDOM_CARDS.find((c) => c.slug === selectedSlug) ?? WISDOM_CARDS[0];
  const selectedTone = toneClasses(selectedWisdom.tone);
  const displayName = profilePreview?.profile?.displayName?.trim() || '방문자';
  const todayLabel = formatTodayLabel();
  const impactSignal = useMemo(
    () => buildHomeImpactSignal(personalizedTodaySummary, personalizationCopy.isPersonalized),
    [personalizationCopy.isPersonalized, personalizedTodaySummary]
  );
  const {
    counselor,
    counselorId,
    hydrated: counselorReady,
    persistState,
    selectCounselor,
  } = usePreferredCounselor(profilePreview?.profile?.preferredCounselor ?? null);

  useEffect(() => {
    let isActive = true;
    async function load() {
      try {
        const res = await fetch('/api/profile', { cache: 'no-store' });
        if (!res.ok) throw new Error('failed');
        const data = (await res.json()) as HomeProfilePreview;
        if (!isActive) return;
        setProfilePreview({ authenticated: Boolean(data.authenticated), profile: data.profile ?? null });
        setProfileLoadStatus('ready');
      } catch {
        if (!isActive) return;
        setProfileLoadStatus('error');
      }
    }
    void load();
    return () => { isActive = false; };
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left - rect.width / 2) / rect.width,
      y: (e.clientY - rect.top - rect.height / 2) / rect.height,
    });
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    hero.addEventListener('mousemove', handleMouseMove);
    return () => hero.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  useEffect(() => {
    const el = metersRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setMetersVisible(true); },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    trackMoonlightEvent('home_view', { from: 'home' });
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.06 }
    );
    document.querySelectorAll('.reveal-on-scroll').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const STEPS = [
    ['내 정보 저장', '출생 연월일과 시·분을 MY에 한 번만 저장합니다.'],
    ['해석 자동 입력', '사주 보기에서 "내 정보 불러오기"로 바로 채웁니다.'],
    ['가족 확장', '가족 프로필을 저장해 궁합과 가족 리포트로 이어갑니다.'],
  ] as const;

  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-0">

      {/* ─── HERO ─── */}
      <section ref={heroRef} className="moon-hero">
        <MoonlightHeroVideo />
        <div className="moon-particles" aria-hidden />

        <div
          className="moon-bg-orb moon-bg-orb-gold"
          style={{ transform: `translate(${mousePos.x * -28}px, ${mousePos.y * -20}px)` }}
          aria-hidden
        />
        <div
          className="moon-bg-orb moon-bg-orb-jade"
          style={{ transform: `translate(${mousePos.x * 18}px, ${mousePos.y * 14}px)` }}
          aria-hidden
        />
        <div
          className="moon-bg-orb moon-bg-orb-plum"
          style={{ transform: `translate(${mousePos.x * -12}px, ${mousePos.y * 8}px)` }}
          aria-hidden
        />

        <div className="relative z-10 flex flex-col items-center gap-7 text-center">
          <div
            className="moon-brand-mark"
            style={{ transform: `translate(${mousePos.x * -10}px, ${mousePos.y * -8}px)` }}
          >
            <div className="moon-hero-orb app-moon-orb" />
            <div className="moon-hero-brand-text">달빛선생</div>
            <div className="moon-hero-brand-sub">月 光 先 生</div>
          </div>

          <div className="moon-date-badge">{todayLabel}</div>

          <div className="moon-hero-headline-wrap">
            <div className="app-caption mb-4">Today Concern</div>
            <h1 className="moon-hero-h1">오늘, 무엇을 먼저 확인하시겠습니까?</h1>
            <p className="moon-hero-sub">{todayLine.title} {todayLine.subtitle}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {HOME_HERO_TOKENS.map((token) => (
              <span key={token.label} className="moon-pill text-sm">
                {token.label} · {token.value}
              </span>
            ))}
          </div>

          <div className="moon-hero-actions flex flex-wrap justify-center gap-3">
            <Link href={`/today-fortune?concern=${selectedConcern}`} className="moon-cta-primary">
              오늘 고민 먼저 보기
            </Link>
            <Link href="/saju/new" className="moon-cta-secondary">사주 시작하기</Link>
          </div>

          <div className="max-w-3xl text-center">
            <p className="text-sm font-medium text-[var(--app-gold-text)]">
              좋은 해석은 말맛보다 기준에서 먼저 갈립니다.
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--app-copy)]">
              달빛선생은 AI가 사주를 즉흥적으로 추측하지 않습니다. 출생 정보로 명식과 운의 구조를 먼저 계산하고,
              선생의 말투는 그 결과를 이해하기 쉽게 풀어주는 역할만 맡습니다.
            </p>
          </div>

          <div className="moon-hero-concern-card w-full max-w-5xl rounded-[1.8rem] border border-[var(--app-line)] bg-[rgba(7,13,28,0.62)] px-5 py-5 backdrop-blur">
            <div className="text-xs tracking-[0.22em] text-[var(--app-gold)]/72">오늘 고민 빠른 선택</div>
            <div className="mt-3">
              <TodayConcernSelector
                value={selectedConcern}
                onChange={(next) => {
                  setSelectedConcern(next);
                  trackMoonlightEvent('today_concern_selected', {
                    from: 'home',
                    concern: next,
                  });
                }}
                expanded={concernExpanded}
                onToggleExpanded={() => setConcernExpanded((current) => !current)}
                compact
              />
            </div>
          </div>

          <div className="moon-counselor-selector-wrap w-full max-w-5xl">
            <CounselorSelector
              value={counselorId}
              onChange={(nextCounselor) => void selectCounselor(nextCounselor)}
              variant="hero"
              title="사주를 읽는 선생을 골라보세요"
              description="명식과 운의 구조는 같은 계산 기준으로 먼저 잡고, 선생의 말투는 그 결과를 이해하기 쉽게 풀어드립니다."
            />
            <p className="mt-3 text-center text-xs leading-6 text-[var(--app-copy-soft)]">
              지금은{' '}
              <span className={cn('font-semibold', counselor.accentClassName)}>
                {counselor.label}
              </span>
              {' '}기준으로 읽도록 맞춰집니다.
              {persistState === 'saved'
                ? ' 로그인 계정에도 저장했습니다.'
                : persistState === 'local_only'
                  ? ' 이 기기에는 바로 반영했고, 로그인 저장은 환경에 따라 나중에 이어질 수 있습니다.'
                  : counselorReady
                    ? ` ${counselor.signature}`
                    : ''}
            </p>
          </div>

          <p className="text-sm text-[var(--app-copy-soft)]">
            안녕하세요,{' '}
            <span className="text-[var(--app-gold-text)]">{displayName}</span> 선생님
          </p>
        </div>

        <div className="moon-scroll-hint" aria-hidden>
          <div className="moon-scroll-mouse">
            <div className="moon-scroll-dot-inner" />
          </div>
        </div>
      </section>

      {/* ─── CONTENT ─── */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">

        {/* TODAY + SETUP */}
        <section className="reveal-on-scroll mb-12 grid gap-5 lg:grid-cols-[1fr_22rem]">

          <aside ref={metersRef} className="app-panel p-6 sm:p-8">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="app-caption">{personalizationCopy.eyebrow}</div>
                <h2 className="mt-3 font-[var(--font-heading)] text-2xl text-[var(--app-ivory)]">
                  {personalizationCopy.title}
                </h2>
              </div>
              <span className={cn(
                'rounded-full border px-3 py-1 text-xs',
                personalizationCopy.isPersonalized
                  ? 'border-[var(--app-jade)]/25 bg-[var(--app-jade)]/10 text-[var(--app-jade)]'
                  : 'border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]'
              )}>
                {personalizationCopy.isPersonalized ? '개인화' : '기본'}
              </span>
            </div>

            <div className="mt-6 rounded-[1.3rem] border border-[var(--app-gold)]/18 bg-[linear-gradient(135deg,rgba(210,176,114,0.10),rgba(8,15,30,0.88))] p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[var(--app-gold)]/24 bg-[var(--app-gold)]/10 px-3 py-1 text-xs text-[var(--app-gold-text)]">
                  오늘 가장 먼저 볼 흐름
                </span>
                <span className="rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-3 py-1 text-xs text-[var(--app-copy-muted)]">
                  {impactSignal.weakest.label}運 {impactSignal.weakest.value}
                </span>
              </div>
              <div className="mt-4 font-[var(--font-heading)] text-2xl leading-9 text-[var(--app-ivory)]">
                {impactSignal.headline}
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">
                {impactSignal.body}
              </p>
              <div className="mt-4 rounded-[1rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-3 text-sm text-[var(--app-copy-muted)]">
                가장 강한 축은 <span className="text-[var(--app-ivory)]">{impactSignal.strongest.label}運</span>입니다.
                {' '}오늘은 강한 쪽을 밀기보다 약한 쪽을 먼저 정리하면 전체 체감이 더 좋아집니다.
              </div>
            </div>

            <div className="mt-6">
              <div className="app-caption">세 축 요약</div>
            </div>

            <div className="mt-4 space-y-5">
              {personalizedTodaySummary.map((item, i) => {
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
                      <span
                        className={cn(tone.bg)}
                        style={{
                          width: metersVisible ? `${item.ratio}%` : '0%',
                          transitionDelay: `${i * 180}ms`,
                        }}
                      />
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

          <article className="moon-lunar-panel p-6 sm:p-7">
            <div className="app-starfield" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="app-caption">개인화 준비</div>
                <h2 className="mt-3 font-[var(--font-heading)] text-xl font-semibold text-[var(--app-ivory)]">
                  내 정보가 저장되면 더 깊어집니다
                </h2>
              </div>
              <Link
                href={personalizationCopy.ctaHref}
                className="shrink-0 text-xs text-[var(--app-gold-text)] underline underline-offset-4 hover:text-[var(--app-ivory)]"
              >
                {personalizationCopy.ctaLabel}
              </Link>
            </div>
            <div className="mt-5 space-y-3">
              {STEPS.map(([title, body], idx) => (
                <div key={title} className="moon-payment-row px-4 py-3.5">
                  <div className="text-[10px] tracking-[0.24em] text-[var(--app-gold-text)]">STEP {idx + 1}</div>
                  <div className="mt-1.5 font-medium text-[var(--app-ivory)]">{title}</div>
                  <p className="mt-1 text-sm leading-6 text-[var(--app-copy-muted)]">{body}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        {/* WISDOM GRID */}
        <section className="reveal-on-scroll mb-12">
          <div className="mb-8 text-center">
            <div className="app-caption mb-3">여섯 가지 지혜</div>
            <h2 className="moon-section-title mx-auto max-w-2xl">
              문득 떠오르는 질문마다 다른 지혜가 기다리고 있습니다
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--app-copy-muted)]">
              마음이 먼저 움직이는 곳을 누르시면, 달빛선생이 그 자리에서부터 차분히 이야기를 풀어드립니다.
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
                  className={cn('moon-wisdom-card moon-wisdom-card-interactive text-left', active && 'moon-wisdom-card-active')}
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <div className={cn('moon-wisdom-hanja', tone.text)}>{card.hanja}</div>
                  <div className={cn('mt-3 font-[var(--font-heading)] text-2xl font-semibold', tone.text)}>
                    {card.title}
                  </div>
                  <p className="mt-3 text-base leading-7 text-[var(--app-ivory)]">"{card.hook}"</p>
                  <p className="mt-4 text-sm leading-7 text-[var(--app-copy-muted)]">{card.description}</p>
                  {active && (
                    <div className={cn('mt-4 flex items-center gap-1.5 text-xs font-medium', tone.text)}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                      선택됨
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <article className="mt-5 app-panel p-6 sm:p-8">
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
                  'inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border px-5 text-sm font-medium transition-colors',
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
                        <span className="mt-[0.38rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--app-gold)]/70" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </article>
        </section>

        {/* POPULAR PATHS */}
        <section className="reveal-on-scroll">
          <div className="mb-6">
            <div className="app-caption">오늘 가장 많이 찾는 길</div>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--app-ivory)]">
              오늘은 이 길로 이어가 보셔도 좋습니다
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {WISDOM_CARDS.slice(0, 4).map((card) => {
              const tone = toneClasses(card.tone);
              return (
                <Link key={card.slug} href={card.href} className="moon-path-card group">
                  <div className={cn('text-[11px] tracking-[0.28em]', tone.text)}>{card.hanja}</div>
                  <div className="mt-2 font-semibold text-[var(--app-ivory)]">{card.title}</div>
                  <p className="mt-2 text-sm leading-7 text-[var(--app-copy-muted)]">"{card.hook}"</p>
                  <div className={cn(
                    'mt-4 flex items-center gap-1 text-xs opacity-0 transition-opacity duration-200 group-hover:opacity-100',
                    tone.text
                  )}>
                    자세히 보기 <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
