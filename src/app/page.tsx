'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ActionCluster } from '@/components/layout/action-cluster';
import { EvidenceStrip } from '@/components/layout/evidence-strip';
import { FeatureCard } from '@/components/layout/feature-card';
import { ProductGrid } from '@/components/layout/product-grid';
import { SectionHeader } from '@/components/layout/section-header';
import { SectionSurface } from '@/components/layout/section-surface';
import SiteHeader from '@/features/shared-navigation/site-header';
import { MoonlightHeroVideo } from '@/components/home/moonlight-hero-video';
import { trackMoonlightEvent } from '@/lib/analytics';
import { AppShell } from '@/shared/layout/app-shell';
import { REPORT_SAMPLE_HREF } from '@/content/moonlight';

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
  { label: '판정 흐름', value: '명식 · 격국 · 용신 · 운' },
  { label: '소장 방식', value: 'PDF · MY 보관함 · 대화' },
] as const;

const PREMIUM_PROOF_POINTS = [
  '첫 화면에서 한 줄 총평과 올해 핵심 주제를 먼저 확인합니다.',
  '상세 본문은 재물, 관계, 일, 생활 리듬처럼 궁금한 영역부터 읽습니다.',
  '필요하면 PDF와 보관함, 대화 상담으로 같은 기준을 이어갑니다.',
] as const;

const SAJU_FLOW_STEPS = [
  {
    eyebrow: 'STEP 1',
    title: '출생 정보를 입력합니다',
    body: '연월일, 시간, 출생지를 기준으로 명식과 운의 구조를 먼저 계산합니다.',
  },
  {
    eyebrow: 'STEP 2',
    title: '1분 요약을 먼저 봅니다',
    body: '긴 풀이 전에 핵심 한 줄, 올해 주제, 조심할 패턴부터 확인합니다.',
  },
  {
    eyebrow: 'STEP 3',
    title: '상세 풀이로 내려갑니다',
    body: '궁금한 영역부터 읽고, 필요할 때 판정 흐름과 PDF 보관으로 이어갑니다.',
  },
] as const;

export default function HomePage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);
  const todayLabel = useMemo(() => formatTodayLabel(), []);

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
            <h1 className="moon-hero-h1">당신의 사주를 한 권의 기준서로 남깁니다.</h1>
            <p className="moon-hero-sub">
              홈에서는 사주풀이 시작에만 집중합니다.
              <br className="hidden sm:block" />
              다른 운세와 사용법은 안내 메뉴에서 따로 보실 수 있습니다.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
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
              내 명리 기준서 만들기
            </Link>
            <Link
              href={REPORT_SAMPLE_HREF}
              className="moon-cta-secondary w-full sm:w-auto"
              onClick={() =>
                trackMoonlightEvent('premium_home_sample_click', {
                  from: 'home_hero',
                })
              }
            >
              샘플 리포트 보기
            </Link>
          </ActionCluster>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-[var(--app-copy-muted)]">
            <Link
              href="/guide"
              className="inline-flex items-center gap-2 text-[var(--app-gold-text)] underline underline-offset-4 hover:text-[var(--app-ivory)]"
            >
              이용 안내 보기
            </Link>
            <span className="hidden h-1 w-1 rounded-full bg-[var(--app-copy-soft)] md:block" />
            <Link
              href="/interpretation"
              className="inline-flex items-center gap-2 hover:text-[var(--app-ivory)]"
            >
              다른 해석 메뉴 보기
            </Link>
          </div>

          <SectionSurface
            surface="hero"
            size="lg"
            className="w-full max-w-5xl border-[var(--app-gold)]/22 bg-[linear-gradient(135deg,rgba(210,176,114,0.1),rgba(8,15,30,0.9))] text-left backdrop-blur"
          >
            <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
              <div className="space-y-5">
                <SectionHeader
                  eyebrow="샘플 기준서 미리보기"
                  title="받게 될 사주풀이를 짧게 미리 봅니다"
                  titleClassName="text-2xl"
                  description="실제 결과가 어떤 순서로 보이는지, 요약과 본문, 보관 흐름만 빠르게 확인하는 입구입니다."
                  descriptionClassName="max-w-2xl text-[var(--app-copy)]"
                />
                <ActionCluster>
                  <Link
                    href={REPORT_SAMPLE_HREF}
                    className="moon-action-primary"
                  >
                    샘플 리포트 펼쳐보기
                  </Link>
                  <Link
                    href="/saju/new"
                    className="inline-flex items-center gap-2 px-1 py-2 text-sm text-[var(--app-gold-text)] underline underline-offset-4 hover:text-[var(--app-ivory)]"
                  >
                    바로 입력하기
                  </Link>
                </ActionCluster>
                <div className="rounded-[1.05rem] border border-[var(--app-line)] bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm leading-7 text-[var(--app-copy)]">
                  결과 화면은 핵심 요약, 상세 풀이, 판정 흐름, 보관으로 이어집니다.
                </div>
              </div>

              <div className="space-y-4">
                <ProductGrid columns={2} className="gap-3">
                  {PREMIUM_PROOF_POINTS.map((item, index) => (
                    <FeatureCard
                      key={item}
                      surface="soft"
                      className={index === PREMIUM_PROOF_POINTS.length - 1 ? 'md:col-span-2' : undefined}
                      eyebrow={`미리보기 ${index + 1}`}
                      description={item}
                    />
                  ))}
                </ProductGrid>
                <EvidenceStrip
                  items={[
                    {
                      title: '홈 구성',
                      body: '오늘운세, 타로, 궁합, 사용법 안내는 가이드와 해석 메뉴로 분리했습니다.',
                    },
                  ]}
                />
              </div>
            </div>
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
          <SectionSurface surface="panel">
            <SectionHeader
              align="center"
              eyebrow="사주풀이 흐름"
              title="홈에서는 이 세 단계만 보시면 됩니다"
              description="서비스 설명을 길게 읽지 않아도, 출생 정보를 입력하면 핵심 요약과 상세 풀이로 바로 이어집니다."
              className="mb-8 max-w-3xl"
            />

            <ProductGrid columns={3}>
              {SAJU_FLOW_STEPS.map((step) => (
                <FeatureCard
                  key={step.title}
                  surface="soft"
                  eyebrow={step.eyebrow}
                  title={step.title}
                  titleClassName="text-2xl"
                  description={step.body}
                />
              ))}
            </ProductGrid>

            <ActionCluster align="center" className="mt-8">
              <Link href="/saju/new" className="moon-cta-primary">
                사주풀이 시작하기
              </Link>
              <Link
                href={REPORT_SAMPLE_HREF}
                className="moon-action-secondary"
              >
                샘플 먼저 보기
              </Link>
            </ActionCluster>
          </SectionSurface>
        </section>

        <section className="reveal-on-scroll">
          <SectionSurface surface="lunar">
            <div className="app-starfield" />
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <SectionHeader
                eyebrow="안내 메뉴로 이동"
                title="다른 운세와 사용법은 가이드에 모았습니다"
                titleClassName="text-3xl text-[var(--app-gold-text)]"
                description="오늘운세, 타로, 궁합, 선생 말투, PDF 보관 방식, 계산 기준은 홈에서 길게 설명하지 않고 안내 페이지에서 차분히 보실 수 있습니다."
              />
              <ActionCluster className="lg:justify-end">
                <Link href="/guide" className="moon-cta-primary">
                  가이드 보기
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
