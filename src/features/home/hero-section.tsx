import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
  HERO_REPORT_PREVIEW,
  QUESTION_CHIPS,
  TRUST_POINTS,
} from '@/features/home/content';
import type { FocusTopic } from '@/lib/saju/report';
import { FOCUS_TOPIC_META } from '@/lib/saju/report';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  selectedTopic: FocusTopic;
  onSelectTopic: (topic: FocusTopic) => void;
}

export default function HeroSection({
  selectedTopic,
  onSelectTopic,
}: HeroSectionProps) {
  const focusMeta = FOCUS_TOPIC_META[selectedTopic];
  const preview = HERO_REPORT_PREVIEW[selectedTopic];

  return (
    <section
      id="hero"
      className="relative overflow-hidden border-b border-white/8"
    >
      {/* Top gold line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d2b072]/50 to-transparent" />

      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,_rgba(210,176,114,0.13),_transparent_30%),radial-gradient(ellipse_at_80%_20%,_rgba(99,102,241,0.1),_transparent_28%)]" />

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">

          {/* Left — headline and CTAs */}
          <div className="space-y-8">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-[#d2b072]/30 bg-[#d2b072]/10 px-3 py-1 text-[#f5dfaa]">
                  정통 명리학 기반
                </Badge>
                <Badge className="border-emerald-500/20 bg-emerald-500/8 px-3 py-1 text-emerald-300">
                  무료로 시작
                </Badge>
              </div>

              <h1 className="max-w-xl text-[2.6rem] font-semibold leading-[1.15] tracking-tight text-[#f8f1df] sm:text-5xl lg:text-[3.25rem]">
                사주팔자로 읽는
                <span className="block text-[#d9bc7f]">나만의 흐름</span>
              </h1>

              <p className="max-w-lg text-base leading-[1.85] text-white/62 sm:text-lg">
                생년월일만으로 오행 구조와 일간 성향을 분석합니다.
                연애·재물·직장·관계 중 궁금한 주제를 골라 지금 바로 시작하세요.
              </p>
            </div>

            {/* Topic chips */}
            <div className="space-y-2.5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/40">궁금한 주제 선택</p>
              <div className="flex flex-wrap gap-2">
                {QUESTION_CHIPS.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => onSelectTopic(chip.key)}
                    className={cn(
                      'rounded-full border px-4 py-2 text-sm font-medium transition-all duration-150',
                      selectedTopic === chip.key
                        ? 'border-[#d2b072]/50 bg-[#d2b072]/14 text-[#fff0c6] shadow-[0_0_12px_rgba(210,176,114,0.15)]'
                        : 'border-white/10 bg-white/5 text-white/65 hover:border-white/18 hover:bg-white/8 hover:text-white'
                    )}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live preview snippet */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#d2b072]/72">{focusMeta.badge} 미리보기</p>
                  <p className="mt-2 text-base font-medium text-[#f7ecd5]">{preview.signal}</p>
                  <p className="mt-2 text-sm leading-[1.75] text-white/58">{preview.summary}</p>
                </div>
                <div className="flex-shrink-0 rounded-xl border border-[#d2b072]/20 bg-[#d2b072]/8 px-4 py-3 text-center">
                  <p className="text-xs text-[#d2b072]/70">점수</p>
                  <p className="mt-1 text-3xl font-semibold text-[#f7ecd5]">{preview.score}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-[#d2b072]/60">{preview.action}</p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/saju/new"
                className={cn(
                  buttonVariants({ variant: 'default' }),
                  'h-12 rounded-full bg-[#d2b072] px-7 text-sm font-semibold text-[#111827] shadow-[0_4px_20px_rgba(210,176,114,0.3)] hover:bg-[#e0c28a] hover:shadow-[0_4px_24px_rgba(210,176,114,0.4)]'
                )}
              >
                사주 풀이 시작
              </Link>
              <Link
                href="/#compatibility-lab"
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'h-12 rounded-full border-white/14 bg-white/5 px-6 text-sm text-white/80 hover:bg-white/9 hover:text-white'
                )}
              >
                궁합 보기
              </Link>
            </div>

            {/* Trust points */}
            <div className="flex flex-wrap gap-2 pt-1">
              {TRUST_POINTS.map((point) => (
                <span
                  key={point}
                  className="rounded-full border border-white/8 bg-white/[0.035] px-3 py-1.5 text-xs text-white/55"
                >
                  {point}
                </span>
              ))}
            </div>
          </div>

          {/* Right — sample report card */}
          <div className="flex flex-col gap-4">
            <article className="rounded-[28px] border border-[#d2b072]/18 bg-[linear-gradient(160deg,rgba(9,20,42,0.95),rgba(5,12,28,0.97))] p-6 shadow-[0_20px_60px_rgba(2,6,23,0.5)]">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.26em] text-[#d2b072]/65">Sample Report</p>
                  <h2 className="mt-1.5 text-xl font-semibold text-[#f8f1df]">
                    {focusMeta.label} 사주 리포트
                  </h2>
                  <p className="mt-1 text-xs text-white/45">{focusMeta.subtitle}</p>
                </div>
                <Badge className="flex-shrink-0 border-emerald-500/20 bg-emerald-500/8 text-emerald-300">
                  미리보기
                </Badge>
              </div>

              {/* Score bars */}
              <div className="space-y-3">
                {[
                  { label: '총운', score: preview.score },
                  { label: focusMeta.label, score: Math.max(60, preview.score - 4) },
                  { label: '오행 균형', score: Math.min(88, preview.score + 3) },
                ].map(({ label, score }) => (
                  <div key={label}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-xs text-white/52">{label}</span>
                      <span className="text-xs font-medium text-[#f5dfaa]">{score}</span>
                    </div>
                    <div className="app-score-bar">
                      <div className="app-score-bar-fill" style={{ width: `${score}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-white/38">오늘의 행동 제안</p>
                <p className="mt-2 text-sm leading-[1.7] text-white/65">{preview.action}</p>
              </div>
            </article>

            {/* Bottom mini cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">오행 분포</p>
                <div className="mt-3 flex gap-1.5">
                  {[
                    { label: '木', color: '#5a9e5a' },
                    { label: '火', color: '#e05252' },
                    { label: '土', color: '#d4841a' },
                    { label: '金', color: '#a8a8b8' },
                    { label: '水', color: '#3a7ec8' },
                  ].map(({ label, color }) => (
                    <div
                      key={label}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold"
                      style={{ backgroundColor: `${color}22`, color, border: `1px solid ${color}44` }}
                    >
                      {label}
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-white/42">사주 구조 한눈에</p>
              </div>

              <div className="rounded-2xl border border-[#d2b072]/18 bg-[#d2b072]/7 p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#d2b072]/65">일간 성향</p>
                <p className="mt-2 text-sm font-semibold text-[#f7ecd5]">甲 일간</p>
                <p className="mt-1 text-xs leading-[1.6] text-white/52">
                  강직한 리더십, 독립적 추진력
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
