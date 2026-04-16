'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  QUESTION_CHIPS,
  TRUST_POINTS,
  getCardOfTheDay,
} from '@/lib/home-content';
import type { FocusTopic } from '@/lib/saju/report';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  selectedTopic: FocusTopic;
  onSelectTopic: (topic: FocusTopic) => void;
}

export default function HeroSection({
  selectedTopic,
  onSelectTopic,
}: HeroSectionProps) {
  const cardOfTheDay = getCardOfTheDay();

  return (
    <section
      id="hero"
      className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(192,132,252,0.22),_transparent_28%),radial-gradient(circle_at_80%_20%,_rgba(212,176,114,0.18),_transparent_24%),linear-gradient(180deg,_#071327_0%,_#020817_72%)]"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d2b072]/60 to-transparent" />
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-7">
            <div className="space-y-4">
              <Badge className="border-[#d2b072]/35 bg-[#d2b072]/10 px-3 py-1 text-[#f2d9a2]">
                무료 운세 웹 + 앱처럼 이어지는 사주 리포트
              </Badge>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-[#f8f1df] sm:text-5xl lg:text-6xl">
                  오늘의 흐름부터 정통 사주 리포트까지,
                  <span className="block text-[#d9bc7f]">가볍게 들어와 계속 보게 되는 운세 플랫폼</span>
                </h1>
                <p className="max-w-2xl text-base leading-7 text-white/68 sm:text-lg">
                  첫 화면은 질문형으로 빠르게, 결과는 요약 카드와 리포트 구조로 짧고 선명하게.
                  태어난 시간을 몰라도 지금 바로 시작할 수 있고, 더 깊은 해석은 코인으로 이어집니다.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {QUESTION_CHIPS.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => onSelectTopic(chip.key)}
                  className={cn(
                    'rounded-full border px-4 py-2 text-sm transition-colors',
                    selectedTopic === chip.key
                      ? 'border-[#d2b072]/60 bg-[#d2b072]/15 text-[#fff0c6]'
                      : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10 hover:text-white'
                  )}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {QUESTION_CHIPS.map((chip) => (
                <div
                  key={chip.key}
                  className={cn(
                    'rounded-2xl border p-4 transition-colors',
                    selectedTopic === chip.key
                      ? 'border-[#d2b072]/40 bg-white/8'
                      : 'border-white/8 bg-white/[0.04]'
                  )}
                >
                  <div className="mb-2 text-sm font-medium text-[#f8f1df]">{chip.label}</div>
                  <p className="text-sm leading-6 text-white/55">{chip.hook}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/#personalized-reading">
                <Button className="h-12 rounded-full bg-[#d2b072] px-6 text-sm font-semibold text-[#111827] hover:bg-[#e0c28a]">
                  태어난 시간 몰라도 바로 시작
                </Button>
              </Link>
              <Link href="/tarot/daily">
                <Button
                  variant="outline"
                  className="h-12 rounded-full border-white/15 bg-white/5 px-6 text-sm text-white hover:bg-white/10 hover:text-white"
                >
                  오늘의 무료 타로 보기
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              {TRUST_POINTS.map((point) => (
                <span
                  key={point}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/65"
                >
                  {point}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <article className="rounded-[28px] border border-[#d2b072]/20 bg-[linear-gradient(180deg,rgba(8,16,31,0.92),rgba(20,31,52,0.82))] p-6 shadow-[0_24px_80px_rgba(2,6,23,0.5)]">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-[#d2b072]/75">Free Tarot</p>
                  <h2 className="mt-2 text-2xl font-semibold text-[#f8f1df]">오늘의 무료 타로</h2>
                </div>
                <Badge className="border-emerald-400/25 bg-emerald-400/10 text-emerald-200">
                  무입력
                </Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-[0.78fr_1fr]">
                <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,#111c34_0%,#0a1224_100%)] p-5">
                  <div className="text-xs uppercase tracking-[0.2em] text-white/45">{cardOfTheDay.theme}</div>
                  <div className="mt-3 text-3xl font-semibold text-[#f7ecd5]">{cardOfTheDay.name}</div>
                  <div className="mt-8 h-40 rounded-[18px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(210,176,114,0.24),transparent_45%),linear-gradient(180deg,#17274a_0%,#0a1224_100%)]" />
                </div>
                <div className="flex flex-col justify-between rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                  <div>
                    <div className="text-sm text-white/45">오늘의 한 줄</div>
                    <p className="mt-3 text-lg leading-8 text-white/82">{cardOfTheDay.message}</p>
                  </div>
                  <div className="mt-6 rounded-2xl border border-[#d2b072]/15 bg-[#d2b072]/8 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-[#d2b072]/80">Action Cue</div>
                    <p className="mt-2 text-sm leading-6 text-[#f7ecd5]">{cardOfTheDay.focus}</p>
                  </div>
                </div>
              </div>
            </article>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="text-sm text-white/45">지금 가장 빠른 시작</div>
                <div className="mt-2 text-xl font-semibold text-[#f7ecd5]">오늘 · 연애 · 재물 · 직장 · 관계</div>
                <p className="mt-3 text-sm leading-6 text-white/58">
                  검색엔진 유입용 메뉴는 넓게 열고, 첫 화면은 질문형 5개로 단순하게 잡습니다.
                </p>
              </div>
              <div className="rounded-3xl border border-[#d2b072]/18 bg-[#d2b072]/8 p-5">
                <div className="text-sm text-[#d2b072]/80">멤버십 방향</div>
                <div className="mt-2 text-xl font-semibold text-[#f7ecd5]">반복 효용 중심 Plus</div>
                <p className="mt-3 text-sm leading-6 text-white/60">
                  광고 제거, 일일 프리미엄 리포트, 월간 리포트 2회, 보관함과 캘린더를 하나로 묶습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
