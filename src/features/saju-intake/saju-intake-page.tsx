'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { FocusTopic } from '@/lib/saju/report';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SiteHeader from '@/features/shared-navigation/site-header';
import {
  FREE_EXPERIENCES,
  HOUR_OPTIONS,
  QUESTION_CHIPS,
} from '@/features/home/content';
import { parseBirthInputDraft } from '@/domain/saju/validators/birth-input';
import { FOCUS_TOPIC_META } from '@/lib/saju/report';
import { cn } from '@/lib/utils';

type IntakeMode = 'free' | 'light' | 'precise';

interface IntakeFormState {
  year: string;
  month: string;
  day: string;
  hour: string;
  gender: string;
}

const INTAKE_STEPS: Array<{
  key: IntakeMode;
  label: string;
  description: string;
  detail: string;
  recommendation?: string;
}> = [
  {
    key: 'free',
    label: '무료 체험',
    description: '입력 없이 바로 보기',
    detail: '오늘의 운세, 타로, 띠별 운세처럼 로그인 없이 바로 볼 수 있는 콘텐츠입니다.',
  },
  {
    key: 'light',
    label: '기본 분석',
    description: '생년월일로 빠르게',
    detail: '연도·월·일 세 가지만 입력하면 오행 구조와 총운을 포함한 요약 리포트를 즉시 받아볼 수 있습니다.',
    recommendation: '추천',
  },
  {
    key: 'precise',
    label: '정밀 분석',
    description: '시간·성별 포함',
    detail: '태어난 시간(시주)과 성별까지 반영해 더 촘촘한 명식 분석과 상세 운세 흐름을 확인합니다.',
  },
] as const;

const INITIAL_FORM: IntakeFormState = {
  year: '',
  month: '',
  day: '',
  hour: '',
  gender: '',
};

export default function SajuIntakePage() {
  const router = useRouter();
  const maxYear = new Date().getFullYear();
  const [selectedTopic, setSelectedTopic] = useState<FocusTopic>('today');
  const [intakeMode, setIntakeMode] = useState<IntakeMode>('light');
  const [form, setForm] = useState<IntakeFormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  function updateField(field: keyof IntakeFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    if (errorMessage) setErrorMessage('');
  }

  async function submit(mode: 'light' | 'precise') {
    const parsed = parseBirthInputDraft(form, {
      requireGender: mode === 'precise',
    });

    if (!parsed.ok) {
      setErrorMessage(parsed.error);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/readings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.input),
      });

      const data = await response.json();
      if (!response.ok || !data.id) {
        setErrorMessage(data.error ?? '사주 결과를 생성하지 못했습니다.');
        return;
      }

      router.push(`/saju/${data.id}?topic=${selectedTopic}`);
    } catch {
      setErrorMessage('네트워크 오류가 발생했습니다. 잠시 뒤 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const focusMeta = FOCUS_TOPIC_META[selectedTopic];

  return (
    <main className="min-h-screen bg-[#020817] text-white">
      <SiteHeader />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">

        {/* Page header */}
        <section className="mb-8 rounded-[2rem] border border-[#d2b072]/16 bg-[radial-gradient(ellipse_at_top_left,rgba(210,176,114,0.12),transparent_35%),linear-gradient(160deg,rgba(9,20,42,0.96),rgba(5,12,28,0.98))] p-7 sm:p-8">
          <h1 className="text-3xl font-semibold tracking-tight text-[#f8f1df] sm:text-4xl">
            사주팔자 분석 시작
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-[1.85] text-white/58">
            생년월일만 있으면 충분합니다. 태어난 시간이 없어도 오행 구조와 일간 성향, 주요 운세 흐름을 바로 확인할 수 있습니다.
          </p>

          {/* Topic chips */}
          <div className="mt-5 space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-white/38">궁금한 주제</p>
            <div className="flex flex-wrap gap-2">
              {QUESTION_CHIPS.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => setSelectedTopic(chip.key)}
                  className={cn(
                    'rounded-full border px-4 py-2 text-sm font-medium transition-all duration-150',
                    selectedTopic === chip.key
                      ? 'border-[#d2b072]/50 bg-[#d2b072]/14 text-[#fff0c6]'
                      : 'border-white/10 bg-white/5 text-white/65 hover:border-white/18 hover:bg-white/8 hover:text-white'
                  )}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">

          {/* Left — step selector */}
          <div className="space-y-3">
            {INTAKE_STEPS.map((step, index) => {
              const active = intakeMode === step.key;

              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => setIntakeMode(step.key)}
                  className={cn(
                    'w-full rounded-[1.5rem] border p-5 text-left transition-all duration-150',
                    active
                      ? 'border-[#d2b072]/35 bg-[#d2b072]/9 shadow-[0_0_20px_rgba(210,176,114,0.08)]'
                      : 'border-white/8 bg-white/[0.03] hover:border-white/14 hover:bg-white/[0.05]'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="app-step-dot"
                      data-active={active ? 'true' : undefined}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'text-base font-semibold',
                          active ? 'text-[#f8f1df]' : 'text-white/75'
                        )}>
                          {step.label}
                        </span>
                        {step.recommendation && (
                          <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                            {step.recommendation}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-white/42">{step.description}</p>
                    </div>
                  </div>
                  {active && (
                    <p className="mt-3 ml-10 text-sm leading-[1.75] text-white/55">{step.detail}</p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right — form panel */}
          <section className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(160deg,rgba(10,18,36,0.96),rgba(7,19,39,0.92))] p-6 sm:p-7">
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#d2b072]/65">
                {focusMeta.badge}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[#f8f1df]">
                {focusMeta.label} 중심으로 분석합니다
              </h2>
              <p className="mt-1.5 text-sm text-white/48">{focusMeta.subtitle}</p>
            </div>

            <div className="app-divider mb-6" />

            {/* Free mode */}
            {intakeMode === 'free' && (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {FREE_EXPERIENCES.map((item) => (
                    <article key={item.title} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-[#f8f1df]">{item.title}</h3>
                        <span className="flex-shrink-0 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2 py-0.5 text-[10px] text-emerald-300">{item.status}</span>
                      </div>
                      <p className="mt-2 text-xs leading-[1.7] text-white/52">{item.body}</p>
                      <Link
                        href={item.href}
                        className="mt-3 inline-flex text-xs text-[#d2b072] underline underline-offset-4 hover:text-[#e3c68d]"
                      >
                        바로 가기
                      </Link>
                    </article>
                  ))}
                </div>

                <div className="rounded-2xl border border-[#d2b072]/16 bg-[#d2b072]/6 p-5">
                  <p className="text-sm font-medium text-[#f8f1df]">생년월일로 더 정확하게</p>
                  <p className="mt-1.5 text-xs leading-[1.7] text-white/52">
                    무료 콘텐츠는 생년월일 없이도 볼 수 있습니다. 개인 맞춤 분석이 필요하다면 기본 분석을 먼저 시작해 보세요.
                  </p>
                  <Button
                    type="button"
                    onClick={() => setIntakeMode('light')}
                    className="mt-4 rounded-full bg-[#d2b072] px-5 text-[#111827] hover:bg-[#e3c68d]"
                  >
                    기본 분석으로 시작
                  </Button>
                </div>
              </div>
            )}

            {/* Light mode */}
            {intakeMode === 'light' && (
              <div className="space-y-5">
                <div>
                  <p className="mb-3 text-xs text-white/45">생년월일을 입력해 주세요</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="light-birth-year" className="mb-1.5 block text-xs text-white/55">
                        연도
                      </Label>
                      <Input
                        id="light-birth-year"
                        name="lightBirthYear"
                        type="number"
                        placeholder="1994"
                        min={1900}
                        max={maxYear}
                        inputMode="numeric"
                        autoComplete="bday-year"
                        value={form.year}
                        onChange={(event) => updateField('year', event.target.value)}
                        className="border-white/12 bg-white/5 text-white placeholder:text-white/25 focus:border-[#d2b072]/40"
                      />
                    </div>
                    <div>
                      <Label htmlFor="light-birth-month" className="mb-1.5 block text-xs text-white/55">
                        월
                      </Label>
                      <Input
                        id="light-birth-month"
                        name="lightBirthMonth"
                        type="number"
                        placeholder="5"
                        min={1}
                        max={12}
                        inputMode="numeric"
                        autoComplete="bday-month"
                        value={form.month}
                        onChange={(event) => updateField('month', event.target.value)}
                        className="border-white/12 bg-white/5 text-white placeholder:text-white/25 focus:border-[#d2b072]/40"
                      />
                    </div>
                    <div>
                      <Label htmlFor="light-birth-day" className="mb-1.5 block text-xs text-white/55">
                        일
                      </Label>
                      <Input
                        id="light-birth-day"
                        name="lightBirthDay"
                        type="number"
                        placeholder="15"
                        min={1}
                        max={31}
                        inputMode="numeric"
                        autoComplete="bday-day"
                        value={form.day}
                        onChange={(event) => updateField('day', event.target.value)}
                        className="border-white/12 bg-white/5 text-white placeholder:text-white/25 focus:border-[#d2b072]/40"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-xs font-medium text-white/65">기본 분석에서 확인할 수 있는 것</p>
                  <ul className="mt-2.5 space-y-1.5">
                    {['총운·연애·재물·직장 점수', '일간 성향과 오행 구조', '이번 주·이번 달 흐름', '행동 제안과 주의 포인트'].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-xs text-white/50">
                        <span className="h-1 w-1 flex-shrink-0 rounded-full bg-[#d2b072]/60" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => submit('light')}
                  className="h-12 w-full rounded-full bg-[#d2b072] text-sm font-semibold text-[#111827] shadow-[0_4px_20px_rgba(210,176,114,0.25)] hover:bg-[#e3c68d] disabled:opacity-60"
                >
                  {isSubmitting ? '리포트 생성 중...' : `${focusMeta.label} 리포트 보기`}
                </Button>
              </div>
            )}

            {/* Precise mode */}
            {intakeMode === 'precise' && (
              <div className="space-y-5">
                <div>
                  <p className="mb-3 text-xs text-white/45">생년월일을 입력해 주세요</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="precise-birth-year" className="mb-1.5 block text-xs text-white/55">
                        연도
                      </Label>
                      <Input
                        id="precise-birth-year"
                        name="preciseBirthYear"
                        type="number"
                        placeholder="1994"
                        min={1900}
                        max={maxYear}
                        inputMode="numeric"
                        autoComplete="bday-year"
                        value={form.year}
                        onChange={(event) => updateField('year', event.target.value)}
                        className="border-white/12 bg-white/5 text-white placeholder:text-white/25 focus:border-[#d2b072]/40"
                      />
                    </div>
                    <div>
                      <Label htmlFor="precise-birth-month" className="mb-1.5 block text-xs text-white/55">
                        월
                      </Label>
                      <Input
                        id="precise-birth-month"
                        name="preciseBirthMonth"
                        type="number"
                        placeholder="5"
                        min={1}
                        max={12}
                        inputMode="numeric"
                        autoComplete="bday-month"
                        value={form.month}
                        onChange={(event) => updateField('month', event.target.value)}
                        className="border-white/12 bg-white/5 text-white placeholder:text-white/25 focus:border-[#d2b072]/40"
                      />
                    </div>
                    <div>
                      <Label htmlFor="precise-birth-day" className="mb-1.5 block text-xs text-white/55">
                        일
                      </Label>
                      <Input
                        id="precise-birth-day"
                        name="preciseBirthDay"
                        type="number"
                        placeholder="15"
                        min={1}
                        max={31}
                        inputMode="numeric"
                        autoComplete="bday-day"
                        value={form.day}
                        onChange={(event) => updateField('day', event.target.value)}
                        className="border-white/12 bg-white/5 text-white placeholder:text-white/25 focus:border-[#d2b072]/40"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="precise-birth-hour" className="mb-1.5 block text-xs text-white/55">
                    태어난 시간 (모르면 건너뛰어도 됩니다)
                  </Label>
                  <select
                    id="precise-birth-hour"
                    name="preciseBirthHour"
                    value={form.hour}
                    onChange={(event) => updateField('hour', event.target.value)}
                    className="w-full rounded-md border border-white/12 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#d2b072]/40 focus:outline-none"
                  >
                    {HOUR_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value} className="bg-slate-950">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <fieldset className="space-y-2">
                  <legend className="text-xs text-white/55">성별</legend>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'male', label: '남성' },
                      { value: 'female', label: '여성' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        htmlFor={`precise-gender-${option.value}`}
                        className={cn(
                          'flex cursor-pointer items-center justify-center rounded-xl border px-3 py-3 text-sm font-medium transition-all duration-150',
                          form.gender === option.value
                            ? 'border-[#d2b072]/50 bg-[#d2b072]/12 text-[#fff1cb]'
                            : 'border-white/10 bg-white/4 text-white/62 hover:bg-white/7 hover:text-white'
                        )}
                      >
                        <input
                          id={`precise-gender-${option.value}`}
                          name="preciseGender"
                          type="radio"
                          value={option.value}
                          checked={form.gender === option.value}
                          onChange={(event) => updateField('gender', event.target.value)}
                          className="sr-only"
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-xs font-medium text-white/65">정밀 분석에서 추가되는 것</p>
                  <ul className="mt-2.5 space-y-1.5">
                    {['시주(時柱) 반영으로 완성된 사주팔자', '성별 기반 음양 해석 보완', '더 촘촘한 운세 흐름'].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-xs text-white/50">
                        <span className="h-1 w-1 flex-shrink-0 rounded-full bg-[#d2b072]/60" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => submit('precise')}
                  className="h-12 w-full rounded-full bg-[#d2b072] text-sm font-semibold text-[#111827] shadow-[0_4px_20px_rgba(210,176,114,0.25)] hover:bg-[#e3c68d] disabled:opacity-60"
                >
                  {isSubmitting ? '리포트 생성 중...' : `${focusMeta.label} 정밀 분석 시작`}
                </Button>
              </div>
            )}

            {errorMessage && (
              <p role="alert" className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/8 px-4 py-3 text-center text-sm text-rose-300">
                {errorMessage}
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
