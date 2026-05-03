'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ActionCluster } from '@/components/layout/action-cluster';
import { FeatureCard } from '@/components/layout/feature-card';
import { ProductGrid } from '@/components/layout/product-grid';
import { SectionHeader } from '@/components/layout/section-header';
import { SectionSurface } from '@/components/layout/section-surface';
import SiteHeader from '@/features/shared-navigation/site-header';
import { MoonlightHeroVideo } from '@/components/home/moonlight-hero-video';
import { trackMoonlightEvent } from '@/lib/analytics';
import { AppShell } from '@/shared/layout/app-shell';
import {
  QUESTION_ENTRY_POINTS,
  REPORT_SAMPLE_HREF,
  TRUST_SIGNALS,
} from '@/content/moonlight';

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

const PREMIUM_HERO_TOKENS = [
  { label: '기준서 핵심', value: '원국 · 격국 · 용신 · 대운' },
  { label: '풀이 흐름', value: '명식 · 격국 · 용신 · 운' },
  { label: '소장 방식', value: 'PDF · MY 보관함 · 대화' },
] as const;

export default function HomePage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);
  const [todayLabel, setTodayLabel] = useState('오늘의 흐름');

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setMousePos({
      x: (event.clientX - rect.left - rect.width / 2) / rect.width,
      y: (event.clientY - rect.top - rect.height / 2) / rect.height,
    });
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    hero.addEventListener('mousemove', handleMouseMove);
    return () => hero.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  useEffect(() => {
    trackMoonlightEvent('home_view', { from: 'home' });
  }, []);

  useEffect(() => {
    setTodayLabel(formatTodayLabel());
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

  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-0">
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
            <div className="app-caption mb-4">프리미엄 사주풀이</div>
            <h1 className="moon-hero-h1">지금 마음에 걸리는 질문부터 골라보세요.</h1>
            <p className="moon-hero-sub">
              연애, 돈, 일, 가족, 올해 흐름처럼 지금 제일 궁금한 것부터 시작합니다.
              <br className="hidden sm:block" />
              달빛선생은 생년월일을 묻기 전에 먼저 선생님의 질문을 듣습니다.
            </p>
          </div>

          <div className="w-full max-w-2xl rounded-[1.2rem] border border-[var(--app-gold)]/18 bg-[rgba(8,10,18,0.42)] px-4 py-4 text-left backdrop-blur md:hidden">
            <div className="text-center text-xs font-semibold tracking-[0.18em] text-[var(--app-gold-text)]">
              지금 무엇이 궁금하세요?
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {QUESTION_ENTRY_POINTS.map((entry) => (
                <Link
                  key={entry.slug}
                  href={entry.href}
                  className="rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-3 py-2 text-center text-sm font-semibold text-[var(--app-ivory)]"
                  onClick={() =>
                    trackMoonlightEvent('premium_home_hero_primary_click', {
                      from: 'home_mobile_question_chip',
                      focus: entry.slug,
                    })
                  }
                >
                  {entry.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden flex-wrap justify-center gap-2 sm:flex">
            {PREMIUM_HERO_TOKENS.map((token) => (
              <span key={token.label} className="moon-pill text-sm">
                {token.label} · {token.value}
              </span>
            ))}
          </div>

          <ActionCluster
            align="center"
            className="moon-hero-actions w-full max-w-sm sm:max-w-none"
          >
            <Link
              href="/saju/new"
              className="moon-cta-primary w-full sm:w-auto"
              onClick={() =>
                trackMoonlightEvent('premium_home_hero_primary_click', {
                  from: 'home_hero',
                })
              }
            >
              사주풀이 시작하기
            </Link>
            <Link
              href="/today-fortune?concern=general"
              className="moon-cta-secondary w-full sm:w-auto"
              onClick={() =>
                trackMoonlightEvent('premium_home_hero_primary_click', {
                  from: 'home_hero_today',
                })
              }
            >
              오늘 조언 먼저 보기
            </Link>
          </ActionCluster>

          <SectionSurface
            surface="panel"
            className="hidden w-full max-w-6xl border-[var(--app-gold)]/18 bg-[rgba(8,10,18,0.66)] text-left backdrop-blur md:block"
          >
            <SectionHeader
              align="center"
              eyebrow="질문형 시작"
              title="지금 무엇이 제일 궁금하세요?"
              titleClassName="text-3xl"
              description="처음부터 긴 설명을 읽지 않아도 됩니다. 지금 마음에 걸리는 질문을 고르면 그 주제에 맞는 사주풀이로 이어집니다."
              descriptionClassName="mx-auto max-w-3xl text-[var(--app-copy)]"
            />
            <ProductGrid columns={3} className="mt-6">
              {QUESTION_ENTRY_POINTS.map((entry) => (
                <Link
                  key={entry.slug}
                  href={entry.href}
                  className="group app-feature-card-soft min-h-[12rem] transition-colors hover:border-[var(--app-gold)]/36 hover:bg-[var(--app-gold)]/8"
                  onClick={() =>
                    trackMoonlightEvent('premium_home_hero_primary_click', {
                      from: 'home_question_entry',
                      focus: entry.slug,
                    })
                  }
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full border border-[var(--app-gold)]/24 bg-[var(--app-gold)]/10 px-3 py-1 text-xs font-semibold text-[var(--app-gold-text)]">
                      {entry.label}
                    </span>
                    <ArrowRight className="h-4 w-4 text-[var(--app-copy-soft)] transition-transform group-hover:translate-x-1 group-hover:text-[var(--app-gold-text)]" />
                  </div>
                  <h2 className="mt-4 font-display text-xl leading-7 text-[var(--app-ivory)]">
                    {entry.question}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">
                    {entry.reportAnswer}
                  </p>
                  <div className="mt-4 text-xs text-[var(--app-gold-text)]">
                    이 질문으로 시작하기
                  </div>
                </Link>
              ))}
            </ProductGrid>
          </SectionSurface>
        </div>

        <div className="moon-scroll-hint" aria-hidden>
          <div className="moon-scroll-mouse">
            <div className="moon-scroll-dot-inner" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <section className="reveal-on-scroll mb-12">
          <SectionSurface surface="hero" size="lg">
            <SectionHeader
              align="center"
              eyebrow="이렇게 정리해드립니다"
              title="긴 설명보다 먼저, 내 상황이 한눈에 들어오게"
              description="결과 예시는 첫 화면에서 길게 밀지 않고, 실제로 어떤 식으로 정리되는지만 한 장으로 보여드립니다."
              className="mb-8 max-w-3xl"
            />

            <div className="mx-auto max-w-4xl rounded-[1.4rem] border border-[var(--app-gold)]/22 bg-[linear-gradient(135deg,rgba(210,176,114,0.12),rgba(255,255,255,0.035))] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.24)] sm:p-6">
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div className="rounded-[1.15rem] border border-[var(--app-line)] bg-[rgba(2,8,23,0.36)] p-4">
                  <div className="app-caption text-[var(--app-gold-text)]">사주풀이 카드</div>
                  <h2 className="mt-3 font-display text-2xl leading-8 text-[var(--app-ivory)]">
                    올해는 넓히기보다 이미 잡은 것을 정리하는 흐름입니다.
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">
                    돈은 새는 지점을 줄이고, 일은 역할을 좁힐수록 편합니다. 관계는 급하게 결론내기보다 말의 온도를 낮추는 쪽이 좋습니다.
                  </p>
                </div>

                <div className="grid gap-3">
                  {[
                    ['오늘 핵심', '오늘은 결정보다 확인이 먼저입니다.'],
                    ['조심할 패턴', '마음이 급해질수록 같은 말을 반복하기 쉽습니다.'],
                    ['바로 할 행동', '중요한 연락은 한 번 적어보고 보내세요.'],
                  ].map(([label, body]) => (
                    <div
                      key={label}
                      className="rounded-[1rem] border border-[var(--app-line)] bg-[rgba(255,255,255,0.035)] px-4 py-3"
                    >
                      <div className="text-xs font-semibold text-[var(--app-gold-text)]">{label}</div>
                      <div className="mt-1.5 text-sm leading-6 text-[var(--app-copy)]">{body}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <ActionCluster align="center" className="mt-8">
              <Link href="/saju/new" className="moon-cta-primary">
                내 사주풀이 시작
              </Link>
              <Link
                href={REPORT_SAMPLE_HREF}
                className="moon-action-secondary"
                onClick={() =>
                  trackMoonlightEvent('premium_home_sample_click', {
                    from: 'home_one_card_preview',
                  })
                }
              >
                샘플 리포트 보기
              </Link>
            </ActionCluster>
          </SectionSurface>
        </section>

        <section className="reveal-on-scroll mb-12">
          <SectionSurface surface="panel">
            <SectionHeader
              eyebrow="신뢰 장치"
              title="무섭게 맞힌다는 말보다, 다시 확인할 수 있는 기준을 남깁니다"
              titleClassName="text-3xl"
              description="구매 수를 억지로 만들기보다 저장, 재열람, 판단 단서, 시간·출생지 기준, 안전한 표현을 전면에 둡니다."
              descriptionClassName="max-w-3xl"
            />
            <ProductGrid columns={3} className="mt-6">
              {TRUST_SIGNALS.map((signal) => (
                <FeatureCard
                  key={signal.title}
                  surface="soft"
                  title={signal.title}
                  titleClassName="text-xl"
                  description={signal.body}
                />
              ))}
            </ProductGrid>
          </SectionSurface>
        </section>

        <section className="reveal-on-scroll mb-12">
          <SectionSurface surface="lunar">
            <div className="app-starfield" />
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <SectionHeader
                eyebrow="더 깊게 보고 싶을 때"
                title="가격은 결과를 본 뒤, 한눈보기에서 천천히 비교하시면 됩니다"
                titleClassName="text-3xl text-[var(--app-gold-text)]"
                description="홈에서는 결제를 앞세우지 않습니다. 먼저 내 풀이를 확인하고, 더 자세히 남기고 싶을 때 소액 풀이, 소장형 리포트, 대화 멤버십을 한 화면에서 비교하실 수 있습니다."
                descriptionClassName="max-w-3xl"
              />
              <ActionCluster className="lg:justify-end">
                <Link href="/pricing" className="moon-action-secondary">
                  가격 한눈보기
                </Link>
                <Link href="/saju/new" className="moon-cta-primary">
                  사주풀이 시작
                </Link>
              </ActionCluster>
            </div>
          </SectionSurface>
        </section>

        <section className="reveal-on-scroll">
          <SectionSurface surface="lunar">
            <div className="app-starfield" />
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <SectionHeader
                eyebrow="안내 메뉴로 이동"
                title="가벼운 운세와 도움말은 따로 모았습니다"
                titleClassName="text-3xl text-[var(--app-gold-text)]"
                description="오늘운세, 타로, 궁합, 선생 말투, PDF 보관 방식은 홈에서 길게 설명하지 않고 필요한 곳에서 바로 볼 수 있게 나눴습니다."
              />
              <ActionCluster className="lg:justify-end">
                <Link href="/guide" className="moon-cta-primary">
                  도움말 보기
                </Link>
                <Link
                  href="/interpretation"
                  className="moon-action-secondary"
                >
                  해석 메뉴
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </ActionCluster>
            </div>
          </SectionSurface>
        </section>
      </div>
    </AppShell>
  );
}
