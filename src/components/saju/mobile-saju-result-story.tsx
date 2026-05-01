'use client';

import Link from 'next/link';
import { useRef, useState, type TouchEvent } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

interface MobileSajuResultStoryProps {
  slug: string;
  birthSummary: string;
  focusBadge: string;
  headline: string;
  dayMasterSummary: string;
  keyThemes: string[];
  cautionPatterns: string[];
  favorableChoices: string[];
  scores: MobileScore[];
  primaryAction: { title: string; description: string };
  cautionAction: { title: string; description: string };
  timeline: MobileTimelineItem[];
  pillars: MobilePillar[];
  dayMasterLabel: string;
  dominantElementLabel: string;
  weakestElementLabel: string;
  supportElements: string[];
  evidenceCards: MobileEvidence[];
  luckyDates: string[];
  cautionDates: string[];
}

function compactText(value: string, maxLength = 72) {
  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 1)}…` : normalized;
}

function StoryList({ items, tone = 'gold' }: { items: string[]; tone?: 'gold' | 'jade' | 'coral' }) {
  const colorClass =
    tone === 'jade'
      ? 'border-[var(--app-jade)]/25 bg-[var(--app-jade)]/10 text-[var(--app-jade)]'
      : tone === 'coral'
        ? 'border-[var(--app-coral)]/25 bg-[var(--app-coral)]/10 text-[var(--app-coral)]'
        : 'border-[var(--app-gold)]/22 bg-[var(--app-gold)]/8 text-[var(--app-gold-text)]';

  return (
    <div className="grid gap-2">
      {items.slice(0, 3).map((item) => (
        <div
          key={item}
          className={cn('rounded-[1rem] border px-3 py-2 text-xs leading-5', colorClass)}
        >
          {compactText(item, 58)}
        </div>
      ))}
    </div>
  );
}

export function MobileSajuResultStory({
  slug,
  birthSummary,
  focusBadge,
  headline,
  dayMasterSummary,
  keyThemes,
  cautionPatterns,
  favorableChoices,
  scores,
  primaryAction,
  cautionAction,
  timeline,
  pillars,
  dayMasterLabel,
  dominantElementLabel,
  weakestElementLabel,
  supportElements,
  evidenceCards,
  luckyDates,
  cautionDates,
}: MobileSajuResultStoryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartXRef = useRef<number | null>(null);

  const slides = [
    {
      id: 'summary',
      label: '요약',
      title: '핵심만 먼저',
      eyebrow: focusBadge,
      render: () => (
        <div className="grid min-h-0 flex-1 content-between gap-3">
          <div>
            <p className="line-clamp-1 text-[11px] leading-5 text-[var(--app-copy-soft)]">{birthSummary}</p>
            <h1 className="mt-3 line-clamp-3 text-[1.65rem] font-semibold leading-tight tracking-tight text-[var(--app-ivory)]">
              {headline}
            </h1>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--app-copy)]">{dayMasterSummary}</p>
          </div>
          <StoryList items={keyThemes} />
        </div>
      ),
    },
    {
      id: 'topic',
      label: '분야',
      title: '분야별 점수',
      eyebrow: '오늘의 흐름',
      render: () => (
        <div className="grid min-h-0 flex-1 content-between gap-3">
          <div className="grid gap-2">
            {scores.slice(0, 5).map((score) => (
              <Link
                key={score.key}
                href={`/saju/${slug}?topic=${score.key === 'overall' ? 'today' : score.key}`}
                className="grid grid-cols-[3.75rem_1fr] items-center gap-3 rounded-[1rem] border border-[var(--app-line)] bg-[rgba(255,255,255,0.035)] px-3 py-2"
              >
                <div className="text-center">
                  <div className="text-xl font-semibold text-[var(--app-gold-text)]">{score.score}</div>
                  <div className="text-[10px] text-[var(--app-copy-soft)]">/100</div>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[var(--app-ivory)]">{score.label}</div>
                  <p className="line-clamp-1 text-xs leading-5 text-[var(--app-copy-muted)]">{score.summary}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-[1rem] border border-[var(--app-jade)]/22 bg-[var(--app-jade)]/8 px-3 py-3">
              <div className="text-[10px] font-semibold text-[var(--app-jade)]">실행</div>
              <div className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--app-ivory)]">{primaryAction.title}</div>
            </div>
            <div className="rounded-[1rem] border border-[var(--app-coral)]/22 bg-[var(--app-coral)]/8 px-3 py-3">
              <div className="text-[10px] font-semibold text-[var(--app-coral)]">주의</div>
              <div className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--app-ivory)]">{cautionAction.title}</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'flow',
      label: '운',
      title: '시간 흐름',
      eyebrow: '대운·세운·월운',
      render: () => (
        <div className="grid min-h-0 flex-1 content-between gap-3">
          <div className="grid gap-2">
            {timeline.slice(0, 3).map((item) => (
              <div key={item.label} className="rounded-[1rem] border border-[var(--app-line)] bg-[rgba(255,255,255,0.035)] px-3 py-3">
                <div className="text-[10px] font-semibold tracking-[0.14em] text-[var(--app-gold-text)]">{item.label}</div>
                <div className="mt-1 line-clamp-1 text-sm font-semibold text-[var(--app-ivory)]">{item.headline}</div>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--app-copy-muted)]">{item.body}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <StoryList items={luckyDates} tone="jade" />
            <StoryList items={cautionDates} tone="coral" />
          </div>
        </div>
      ),
    },
    {
      id: 'structure',
      label: '원국',
      title: '원국과 오행',
      eyebrow: dayMasterLabel,
      render: () => (
        <div className="grid min-h-0 flex-1 content-between gap-3">
          <div className="grid grid-cols-4 gap-2">
            {pillars.map((pillar) => (
              <div key={pillar.label} className="rounded-[1rem] border border-[var(--app-line)] bg-[rgba(255,255,255,0.035)] px-2 py-3 text-center">
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
          <div className="grid gap-2">
            <div className="rounded-[1rem] border border-[var(--app-gold)]/22 bg-[var(--app-gold)]/8 px-3 py-3">
              <div className="text-[10px] font-semibold text-[var(--app-gold-text)]">오행 균형</div>
              <div className="mt-1 text-sm font-semibold text-[var(--app-ivory)]">
                {dominantElementLabel} 중심 · {weakestElementLabel} 보완
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {supportElements.slice(0, 3).map((item) => (
                <span key={item} className="rounded-full border border-[var(--app-line)] bg-[rgba(255,255,255,0.035)] px-3 py-1 text-xs text-[var(--app-copy)]">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'evidence',
      label: '근거',
      title: '왜 이렇게 봤는지',
      eyebrow: '판정 근거',
      render: () => (
        <div className="grid min-h-0 flex-1 content-between gap-3">
          <div className="grid gap-2">
            {evidenceCards.slice(0, 3).map((card) => (
              <div key={card.label} className="rounded-[1rem] border border-[var(--app-line)] bg-[rgba(255,255,255,0.035)] px-3 py-3">
                <div className="text-[10px] font-semibold tracking-[0.14em] text-[var(--app-gold-text)]">{card.label}</div>
                <div className="mt-1 line-clamp-1 text-sm font-semibold text-[var(--app-ivory)]">{card.title}</div>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--app-copy-muted)]">{card.body}</p>
              </div>
            ))}
          </div>
          <Link
            href={`/saju/${slug}/premium`}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-gold)]/30 bg-[var(--app-gold)]/12 px-4 text-sm font-semibold text-[var(--app-gold-text)]"
          >
            명리 기준서로 자세히 보기
          </Link>
        </div>
      ),
    },
    {
      id: 'next',
      label: '다음',
      title: '이어서 보기',
      eyebrow: '다음 행동',
      render: () => (
        <div className="grid min-h-0 flex-1 content-between gap-3">
          <div className="grid gap-2">
            {favorableChoices.slice(0, 2).map((item) => (
              <div key={item} className="rounded-[1rem] border border-[var(--app-jade)]/22 bg-[var(--app-jade)]/8 px-3 py-3 text-xs leading-5 text-[var(--app-copy)]">
                {compactText(item, 66)}
              </div>
            ))}
            {cautionPatterns.slice(0, 2).map((item) => (
              <div key={item} className="rounded-[1rem] border border-[var(--app-coral)]/22 bg-[var(--app-coral)]/8 px-3 py-3 text-xs leading-5 text-[var(--app-copy)]">
                {compactText(item, 66)}
              </div>
            ))}
          </div>
          <div className="grid gap-2">
            <Link href={`/saju/${slug}/premium`} className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-gold)] px-4 text-sm font-semibold text-[#111827]">
              심층 리포트
            </Link>
            <Link href="/dialogue" className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--app-line)] bg-[rgba(255,255,255,0.035)] px-4 text-sm text-[var(--app-copy)]">
              이어서 묻기
            </Link>
          </div>
        </div>
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
    <section className="saju-mobile-story lg:hidden">
      <div className="saju-mobile-story-shell">
        <div className="flex items-center gap-1.5">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goTo(index)}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors',
                index <= activeIndex ? 'bg-[var(--app-gold)]' : 'bg-[var(--app-line)]'
              )}
              aria-label={`${slide.label} 슬라이드로 이동`}
            />
          ))}
        </div>

        <div
          className="saju-mobile-story-card"
          onTouchStart={(event) => {
            touchStartXRef.current = event.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="app-caption text-[var(--app-gold-text)]">{activeSlide.eyebrow}</div>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--app-ivory)]">
                {activeSlide.title}
              </h2>
            </div>
            <span className="shrink-0 rounded-full border border-[var(--app-line)] bg-[rgba(255,255,255,0.04)] px-2.5 py-1 text-xs text-[var(--app-copy-muted)]">
              {activeIndex + 1}/{slides.length}
            </span>
          </div>

          {activeSlide.render()}

          <div className="flex items-center justify-between gap-3">
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
