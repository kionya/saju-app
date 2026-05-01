'use client';

import Link from 'next/link';
import { useRef, useState, type ReactNode, type TouchEvent } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FiveElementOrbitChart from '@/components/saju/five-element-orbit-chart';
import { ELEMENT_INFO } from '@/lib/saju/elements';
import type { Element } from '@/lib/saju/types';
import { cn } from '@/lib/utils';

interface MobileScore {
  key: string;
  label: string;
  score: number;
  summary: string;
}

interface MobileTimelineItem {
  label: string;
  headline: string;
  body: string;
  points?: string[];
}

interface MobilePillar {
  label: string;
  stem: string;
  branch: string;
  stemColor: string;
  branchColor: string;
}

interface MobileEvidence {
  label: string;
  title: string;
  body: string;
}

interface MobileElementValue {
  count: number;
  score: number;
  percentage: number;
  state: string;
}

interface MobileSajuResultStoryProps {
  slug: string;
  birthSummary: string;
  focusBadge: string;
  headline: string;
  dayMasterSummary: string;
  dayMasterLabel: string;
  dayMasterElement: Element;
  dayMasterMetaphor: string;
  dayMasterDescription: string;
  dayMasterTraits: string[];
  keyThemes: string[];
  cautionPatterns: string[];
  favorableChoices: string[];
  scores: MobileScore[];
  primaryAction: { title: string; description: string };
  cautionAction: { title: string; description: string };
  timeline: MobileTimelineItem[];
  pillars: MobilePillar[];
  fiveElementsByElement: Record<Element, MobileElementValue>;
  dominantElement: Element;
  weakestElement: Element;
  supportElements: string[];
  evidenceCards: MobileEvidence[];
  luckyDates: string[];
  cautionDates: string[];
}

interface StorySlide {
  id: string;
  label: string;
  title: string;
  eyebrow: string;
  detailHref: string;
  detailLabel: string;
  render: () => ReactNode;
}

function StoryBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('saju-mobile-story-body grid gap-3', className)}>{children}</div>;
}

function StoryList({
  items,
  tone = 'gold',
  max = 3,
}: {
  items: string[];
  tone?: 'gold' | 'jade' | 'coral';
  max?: number;
}) {
  const colorClass =
    tone === 'jade'
      ? 'border-[var(--app-jade)]/25 bg-[var(--app-jade)]/10 text-[var(--app-jade)]'
      : tone === 'coral'
        ? 'border-[var(--app-coral)]/25 bg-[var(--app-coral)]/10 text-[var(--app-coral)]'
        : 'border-[var(--app-gold)]/22 bg-[var(--app-gold)]/8 text-[var(--app-gold-text)]';

  const visibleItems = items.filter(Boolean).slice(0, max);

  if (visibleItems.length === 0) {
    return (
      <div className="rounded-[1rem] border border-[var(--app-line)] bg-[rgba(255,255,255,0.035)] px-3 py-2 text-xs leading-5 text-[var(--app-copy-muted)]">
        이 항목은 상세 화면에서 더 넓게 확인할 수 있습니다.
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {visibleItems.map((item) => (
        <div
          key={item}
          className={cn('rounded-[1rem] border px-3 py-2 text-xs leading-5', colorClass)}
        >
          {item}
        </div>
      ))}
    </div>
  );
}

function MiniPillarGrid({ pillars }: { pillars: MobilePillar[] }) {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {pillars.map((pillar) => (
        <div
          key={pillar.label}
          className="rounded-[0.95rem] border border-[var(--app-line)] bg-[rgba(255,255,255,0.035)] px-1.5 py-2.5 text-center"
        >
          <div className="text-[10px] text-[var(--app-copy-soft)]">{pillar.label.replace('주', '')}</div>
          <div className="mt-2 text-2xl font-semibold leading-none" style={{ color: pillar.stemColor }}>
            {pillar.stem}
          </div>
          <div className="mt-1 text-xl font-semibold leading-none" style={{ color: pillar.branchColor }}>
            {pillar.branch}
          </div>
        </div>
      ))}
    </div>
  );
}

function CompactScoreList({
  scores,
  slug,
}: {
  scores: MobileScore[];
  slug: string;
}) {
  return (
    <div className="grid gap-2">
      {scores.slice(0, 3).map((score) => (
        <Link
          key={score.key}
          href={`/saju/${slug}?topic=${score.key === 'overall' ? 'today' : score.key}`}
          className="grid grid-cols-[3.25rem_1fr] items-center gap-3 rounded-[1rem] border border-[var(--app-line)] bg-[rgba(255,255,255,0.035)] px-3 py-2.5"
        >
          <div className="text-center">
            <div className="text-xl font-semibold text-[var(--app-gold-text)]">{score.score}</div>
            <div className="text-[10px] text-[var(--app-copy-soft)]">/100</div>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[var(--app-ivory)]">{score.label}</div>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--app-copy-muted)]">{score.summary}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function StoryActionCard({
  tone,
  eyebrow,
  title,
  body,
}: {
  tone: 'jade' | 'coral' | 'gold';
  eyebrow: string;
  title: string;
  body: string;
}) {
  const toneClass =
    tone === 'jade'
      ? 'border-[var(--app-jade)]/22 bg-[var(--app-jade)]/8'
      : tone === 'coral'
        ? 'border-[var(--app-coral)]/22 bg-[var(--app-coral)]/8'
        : 'border-[var(--app-gold)]/22 bg-[var(--app-gold)]/8';
  const eyebrowClass =
    tone === 'jade'
      ? 'text-[var(--app-jade)]'
      : tone === 'coral'
        ? 'text-[var(--app-coral)]'
        : 'text-[var(--app-gold-text)]';

  return (
    <div className={cn('rounded-[1rem] border px-3 py-3', toneClass)}>
      <div className={cn('text-[10px] font-semibold', eyebrowClass)}>{eyebrow}</div>
      <div className="mt-1 text-sm font-semibold leading-5 text-[var(--app-ivory)]">{title}</div>
      <p className="mt-2 line-clamp-3 text-xs leading-5 text-[var(--app-copy)]">{body}</p>
    </div>
  );
}

export function MobileSajuResultStory({
  slug,
  birthSummary,
  focusBadge,
  headline,
  dayMasterSummary,
  dayMasterLabel,
  dayMasterElement,
  dayMasterMetaphor,
  dayMasterDescription,
  dayMasterTraits,
  keyThemes,
  cautionPatterns,
  favorableChoices,
  scores,
  primaryAction,
  cautionAction,
  timeline,
  pillars,
  fiveElementsByElement,
  dominantElement,
  weakestElement,
  supportElements,
  evidenceCards,
  luckyDates,
  cautionDates,
}: MobileSajuResultStoryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartXRef = useRef<number | null>(null);
  const strongestTimeline = timeline[0] ?? null;
  const natureEvidence = evidenceCards.slice(0, 2);

  const slides: StorySlide[] = [
    {
      id: 'summary',
      label: '통합',
      title: '통합 결과',
      eyebrow: focusBadge,
      detailHref: `/saju/${slug}/overview`,
      detailLabel: '사주 전체 보기',
      render: () => (
        <StoryBody className="content-start">
          <div>
            <p className="line-clamp-1 text-[11px] leading-5 text-[var(--app-copy-soft)]">{birthSummary}</p>
            <h1 className="mt-3 text-[1.42rem] font-semibold leading-tight tracking-tight text-[var(--app-ivory)]">
              {headline}
            </h1>
            <p className="mt-3 line-clamp-4 text-sm leading-6 text-[var(--app-copy)]">{dayMasterSummary}</p>
          </div>
          <StoryList items={keyThemes} />
          <MiniPillarGrid pillars={pillars} />
        </StoryBody>
      ),
    },
    {
      id: 'today',
      label: '오늘',
      title: '오늘의 흐름',
      eyebrow: '점수와 실행 기준',
      detailHref: `/saju/${slug}?topic=today`,
      detailLabel: '오늘 흐름 전체 보기',
      render: () => (
        <StoryBody className="content-start">
          <CompactScoreList scores={scores} slug={slug} />
          <div className="grid gap-2">
            <StoryActionCard
              tone="jade"
              eyebrow="오늘 해볼 것"
              title={primaryAction.title}
              body={primaryAction.description}
            />
            <StoryActionCard
              tone="coral"
              eyebrow="오늘 조심할 것"
              title={cautionAction.title}
              body={cautionAction.description}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="mb-1 text-[10px] font-semibold text-[var(--app-jade)]">좋은 날짜</div>
              <StoryList items={luckyDates} tone="jade" max={2} />
            </div>
            <div>
              <div className="mb-1 text-[10px] font-semibold text-[var(--app-coral)]">주의 날짜</div>
              <StoryList items={cautionDates} tone="coral" max={2} />
            </div>
          </div>
        </StoryBody>
      ),
    },
    {
      id: 'elements',
      label: '오행',
      title: '오행 균형',
      eyebrow: `${ELEMENT_INFO[dominantElement].name} 중심`,
      detailHref: `/saju/${slug}/elements`,
      detailLabel: '오행 상세 보기',
      render: () => (
        <StoryBody className="content-start">
          <div className="saju-mobile-story-orbit">
            <FiveElementOrbitChart
              byElement={fiveElementsByElement}
              dominant={dominantElement}
              weakest={weakestElement}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <StoryActionCard
              tone="gold"
              eyebrow="주도"
              title={ELEMENT_INFO[dominantElement].name}
              body={`${ELEMENT_INFO[dominantElement].traits.slice(0, 2).join(' · ')} 쪽이 먼저 드러납니다.`}
            />
            <StoryActionCard
              tone="jade"
              eyebrow="보완"
              title={ELEMENT_INFO[weakestElement].name}
              body={`${ELEMENT_INFO[weakestElement].traits.slice(0, 2).join(' · ')} 쪽을 생활에서 채우면 균형이 편해집니다.`}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {supportElements.slice(0, 3).map((item) => (
              <span
                key={item}
                className="rounded-full border border-[var(--app-line)] bg-[rgba(255,255,255,0.035)] px-3 py-1 text-xs text-[var(--app-copy)]"
              >
                {item}
              </span>
            ))}
          </div>
        </StoryBody>
      ),
    },
    {
      id: 'nature',
      label: '성정',
      title: '타고난 성정',
      eyebrow: `${dayMasterLabel} · ${dayMasterMetaphor}`,
      detailHref: `/saju/${slug}/nature`,
      detailLabel: '성정 상세 보기',
      render: () => (
        <StoryBody className="content-start">
          <div className="rounded-[1.15rem] border border-[var(--app-gold)]/22 bg-[var(--app-gold)]/8 px-4 py-4">
            <div className="text-[10px] font-semibold tracking-[0.16em] text-[var(--app-gold-text)]">
              {ELEMENT_INFO[dayMasterElement].name}의 결
            </div>
            <div className="mt-2 text-lg font-semibold leading-6 text-[var(--app-ivory)]">
              {dayMasterMetaphor}처럼 드러나는 기질
            </div>
            <p className="mt-3 line-clamp-4 text-sm leading-6 text-[var(--app-copy)]">
              {dayMasterDescription}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {dayMasterTraits.slice(0, 3).map((trait) => (
              <span
                key={trait}
                className="rounded-full border border-[var(--app-line)] bg-[rgba(255,255,255,0.035)] px-3 py-1 text-xs text-[var(--app-copy)]"
              >
                {trait}
              </span>
            ))}
          </div>
          <div className="grid gap-2">
            {natureEvidence.map((card) => (
              <div
                key={card.label}
                className="rounded-[1rem] border border-[var(--app-line)] bg-[rgba(255,255,255,0.035)] px-3 py-3"
              >
                <div className="text-[10px] font-semibold tracking-[0.14em] text-[var(--app-gold-text)]">{card.label}</div>
                <div className="mt-1 text-sm font-semibold leading-5 text-[var(--app-ivory)]">{card.title}</div>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--app-copy-muted)]">{card.body}</p>
              </div>
            ))}
          </div>
        </StoryBody>
      ),
    },
    {
      id: 'next',
      label: '다음',
      title: '다음 행동',
      eyebrow: '소장과 대화',
      detailHref: `/saju/${slug}/premium`,
      detailLabel: '명리 기준서 보기',
      render: () => (
        <StoryBody className="content-start">
          {strongestTimeline ? (
            <div className="rounded-[1.15rem] border border-[var(--app-line)] bg-[rgba(255,255,255,0.035)] px-4 py-4">
              <div className="text-[10px] font-semibold tracking-[0.16em] text-[var(--app-gold-text)]">
                {strongestTimeline.label}
              </div>
              <div className="mt-2 text-base font-semibold leading-6 text-[var(--app-ivory)]">
                {strongestTimeline.headline}
              </div>
              <p className="mt-2 line-clamp-3 text-xs leading-5 text-[var(--app-copy-muted)]">
                {strongestTimeline.body}
              </p>
            </div>
          ) : null}
          <StoryList items={favorableChoices} tone="jade" max={2} />
          <StoryList items={cautionPatterns} tone="coral" max={2} />
          <div className="grid gap-2">
            <Link
              href={`/saju/${slug}/premium`}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-gold)] px-4 text-sm font-semibold text-[#111827]"
            >
              명리 기준서로 이어보기
            </Link>
            <Link
              href="/dialogue"
              className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--app-line)] bg-[rgba(255,255,255,0.035)] px-4 text-sm text-[var(--app-copy)]"
            >
              달빛선생에게 이어서 묻기
            </Link>
          </div>
        </StoryBody>
      ),
    },
  ];

  const activeSlide = slides[activeIndex] ?? slides[0];
  const isFirst = activeIndex === 0;
  const isLast = activeIndex === slides.length - 1;

  function goTo(index: number) {
    setActiveIndex(Math.min(Math.max(index, 0), slides.length - 1));
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = touchStartXRef.current;
    touchStartXRef.current = null;
    if (start === null) return;

    const delta = event.changedTouches[0]?.clientX - start;
    if (Math.abs(delta) < 48) return;
    if (delta < 0) goTo(activeIndex + 1);
    if (delta > 0) goTo(activeIndex - 1);
  }

  return (
    <section className="saju-mobile-story lg:hidden" aria-label="모바일 사주 결과 요약">
      <div className="saju-mobile-story-shell">
        <div className="saju-mobile-story-progress">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goTo(index)}
              className={cn(
                'saju-mobile-story-progress-dot',
                index <= activeIndex && 'saju-mobile-story-progress-dot-active'
              )}
              aria-label={`${slide.label} 슬라이드로 이동`}
            >
              <span>{slide.label}</span>
            </button>
          ))}
        </div>

        <div
          className="saju-mobile-story-card"
          onTouchStart={(event) => {
            touchStartXRef.current = event.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={handleTouchEnd}
        >
          <div className="saju-mobile-story-card-head">
            <div className="min-w-0">
              <div className="app-caption text-[var(--app-gold-text)]">{activeSlide.eyebrow}</div>
              <h2 className="mt-1 text-[1.55rem] font-semibold tracking-tight text-[var(--app-ivory)]">
                {activeSlide.title}
              </h2>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <span className="rounded-full border border-[var(--app-line)] bg-[rgba(255,255,255,0.04)] px-2.5 py-1 text-xs text-[var(--app-copy-muted)]">
                {activeIndex + 1}/{slides.length}
              </span>
              <Link href={activeSlide.detailHref} className="saju-mobile-story-detail-link">
                {activeSlide.detailLabel}
              </Link>
            </div>
          </div>

          {activeSlide.render()}

          <div className="saju-mobile-story-card-foot">
            <Button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              disabled={isFirst}
              variant="outline"
              className="h-10 rounded-full border-[var(--app-line)] bg-[rgba(255,255,255,0.035)] px-4 text-sm text-[var(--app-copy)] disabled:opacity-35"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              이전
            </Button>
            {isLast ? (
              <Link
                href="/saju/new"
                className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--app-gold)]/30 bg-[var(--app-gold)]/12 px-4 text-sm font-semibold text-[var(--app-gold-text)]"
              >
                새 리포트
              </Link>
            ) : (
              <Button
                type="button"
                onClick={() => goTo(activeIndex + 1)}
                className="h-10 rounded-full bg-[var(--app-gold)] px-4 text-sm font-semibold text-[#111827]"
              >
                다음
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
