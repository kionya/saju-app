'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
import {
  QUESTION_ENTRY_POINTS,
  REPORT_PREVIEW_VALUE_POINTS,
  REPORT_SAMPLE_HREF,
  TASTE_PRODUCTS,
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
    body: '궁금한 영역부터 보고, 필요할 때 풀이 흐름과 PDF 보관으로 이어갑니다.',
  },
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
            <h1 className="moon-hero-h1">지금 궁금한 문제를 명리 기준서로 정리합니다.</h1>
            <p className="moon-hero-sub">
              연애, 돈, 일, 가족, 올해 흐름처럼 마음에 걸리는 질문부터 고르세요.
              <br className="hidden sm:block" />
              달빛선생은 생년월일 입력 전에 먼저 무엇이 궁금한지 묻습니다.
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
              궁금한 주제 고르기
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
                    {entry.productName}
                  </div>
                </Link>
              ))}
            </ProductGrid>
          </SectionSurface>

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
                  title="결제 전에는 결과 예시 한 장만 먼저 봅니다"
                  titleClassName="text-2xl"
                  description="긴 설명보다 어떤 질문에 답하는지, 소장하면 무엇이 남는지, PDF와 대화가 어떻게 이어지는지를 먼저 확인합니다."
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
                  결과 화면은 핵심 요약, 상세 풀이, 풀이 흐름, 보관으로 이어집니다.
                </div>
              </div>

              <div className="space-y-4">
                <ProductGrid columns={2} className="gap-3">
                  {REPORT_PREVIEW_VALUE_POINTS.map((item, index) => (
                    <FeatureCard
                      key={item.title}
                      surface="soft"
                      className={index === REPORT_PREVIEW_VALUE_POINTS.length - 1 ? 'md:col-span-2' : undefined}
                      eyebrow={`미리보기 ${index + 1}`}
                      title={item.title}
                      titleClassName="text-xl"
                      description={item.body}
                    />
                  ))}
                </ProductGrid>
                <EvidenceStrip
                  items={[
                    {
                      title: '홈 구성',
                      body: '오늘운세, 타로, 궁합, 도움말은 해석 메뉴와 안내 페이지에서 가볍게 볼 수 있습니다.',
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
              eyebrow="사주풀이 시작"
              title="궁금한 문제에서 시작해, 내 풀이로 바로 이어집니다"
              description="연애, 돈, 일, 가족, 오늘의 마음처럼 지금 걸리는 질문을 먼저 고르고 필요한 출생 정보만 입력합니다."
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
                질문으로 시작하기
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

        <section className="reveal-on-scroll mb-12">
          <SectionSurface surface="panel">
            <SectionHeader
              eyebrow="부담 없는 첫 결제"
              title="49,000원 기준서 전에는 작은 맛보기부터 열 수 있게 합니다"
              titleClassName="text-3xl"
              description="오늘운 상세, 월간 달력, 연애 질문, 올해 핵심 3줄처럼 부담 없는 첫 결제 상품을 기준서 입구 앞에 배치합니다."
              descriptionClassName="max-w-3xl"
            />
            <ProductGrid columns={4} className="mt-6">
              {TASTE_PRODUCTS.map((product) => (
                <Link
                  key={product.slug}
                  href={product.href}
                  className="group app-feature-card-soft min-h-[14rem] transition-colors hover:border-[var(--app-gold)]/36 hover:bg-[var(--app-gold)]/8"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full border border-[var(--app-gold)]/24 bg-[var(--app-gold)]/10 px-3 py-1 text-xs font-semibold text-[var(--app-gold-text)]">
                      {product.price}
                    </span>
                    <ArrowRight className="h-4 w-4 text-[var(--app-copy-soft)] transition-transform group-hover:translate-x-1 group-hover:text-[var(--app-gold-text)]" />
                  </div>
                  <h2 className="mt-4 font-display text-xl leading-7 text-[var(--app-ivory)]">
                    {product.title}
                  </h2>
                  <p className="mt-3 text-sm font-medium leading-6 text-[var(--app-gold-text)]">
                    {product.question}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[var(--app-copy-muted)]">
                    {product.result}
                  </p>
                  <div className="mt-4 text-xs text-[var(--app-copy-soft)]">
                    {product.status}
                  </div>
                </Link>
              ))}
            </ProductGrid>
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
