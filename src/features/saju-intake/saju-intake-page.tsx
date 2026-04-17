'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { FocusTopic } from '@/lib/saju/report';
import { Badge } from '@/components/ui/badge';
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
  eyebrow: string;
  summary: string;
  recommendation?: string;
}> = [
  {
    key: 'free',
    label: '무입력',
    eyebrow: 'Free Entry',
    summary: '오늘의 운세, 무료 타로, 띠별, 꿈해몽처럼 바로 둘러보는 입구입니다.',
  },
  {
    key: 'light',
    label: '저입력',
    eyebrow: 'Recommended',
    summary: '생년월일만 넣고 먼저 요약 리포트를 보는 가장 빠른 본 서비스 시작선입니다.',
    recommendation: '추천',
  },
  {
    key: 'precise',
    label: '정밀입력',
    eyebrow: 'More Context',
    summary: '태어난 시간과 성별까지 반영해 조금 더 촘촘한 결과를 여는 단계입니다.',
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

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <section className="rounded-[32px] border border-[#d2b072]/18 bg-[radial-gradient(circle_at_top_left,_rgba(210,176,114,0.16),_transparent_30%),linear-gradient(180deg,rgba(7,19,39,0.94),rgba(10,18,36,0.96))] p-7">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-[#d2b072]/30 bg-[#d2b072]/10 text-[#f5dfaa]">
              Day 4 Intake Flow
            </Badge>
            <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
              추천 시작선: 저입력
            </Badge>
          </div>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[#f8f1df] sm:text-5xl">
            무입력에서 정밀입력까지,
            <span className="block text-[#d9bc7f]">사용자 부담을 단계적으로 여는 사주 시작 화면</span>
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-8 text-white/66">
            무료 콘텐츠로 먼저 감을 잡고, 생년월일만으로 요약 리포트를 본 다음, 필요하면 시간과 성별까지 더해 정밀하게 보는
            구조입니다. 지금 단계에서는 질문형 포커스를 먼저 고르고, 그에 맞는 결과로 바로 이어집니다.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {QUESTION_CHIPS.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => setSelectedTopic(chip.key)}
                className={cn(
                  'rounded-full border px-4 py-2 text-sm transition-colors',
                  selectedTopic === chip.key
                    ? 'border-[#d2b072]/55 bg-[#d2b072]/15 text-[#fff0c6]'
                    : 'border-white/10 bg-white/5 text-white/68 hover:border-white/20 hover:bg-white/10 hover:text-white'
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <aside className="space-y-4">
            {INTAKE_STEPS.map((step, index) => {
              const active = intakeMode === step.key;

              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => setIntakeMode(step.key)}
                  className={cn(
                    'w-full rounded-[28px] border p-5 text-left transition-colors',
                    active
                      ? 'border-[#d2b072]/35 bg-[#d2b072]/10'
                      : 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.06]'
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-[0.22em] text-[#d2b072]/78">
                        Step {index + 1} · {step.eyebrow}
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-[#f8f1df]">{step.label}</div>
                    </div>
                    {step.recommendation ? (
                      <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
                        {step.recommendation}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-4 text-sm leading-7 text-white/58">{step.summary}</p>
                </button>
              );
            })}

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
              <div className="text-xs uppercase tracking-[0.22em] text-white/45">Validation Rules</div>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-white/60">
                <li>생년월일은 반드시 실제 날짜여야 합니다.</li>
                <li>저입력은 생년월일만 있으면 시작할 수 있습니다.</li>
                <li>정밀입력은 성별 선택이 필요하고, 시간은 모름으로 남길 수 있습니다.</li>
              </ul>
            </div>
          </aside>

          <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,36,0.96),rgba(7,19,39,0.92))] p-6 sm:p-7">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-white/42">
                  {focusMeta.badge}
                </div>
                <h2 className="mt-2 text-2xl font-semibold text-[#f8f1df]">
                  {focusMeta.label} 중심으로 시작하는 3단계 입력
                </h2>
              </div>
              <Badge className="w-fit border-white/10 bg-white/5 text-white/62">
                결과 저장 + 다시보기 연결
              </Badge>
            </div>

            {intakeMode === 'free' ? (
              <div>
                <div className="grid gap-4 md:grid-cols-2">
                  {FREE_EXPERIENCES.map((item) => (
                    <article key={item.title} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-xl font-semibold text-[#f8f1df]">{item.title}</h3>
                        <Badge className="border-white/10 bg-white/5 text-white/55">{item.status}</Badge>
                      </div>
                      <p className="mt-4 text-sm leading-7 text-white/58">{item.body}</p>
                      <Link
                        href={item.href}
                        className="mt-5 inline-flex text-sm text-[#d2b072] underline underline-offset-4 hover:text-[#e3c68d]"
                      >
                        무료 메뉴 열기
                      </Link>
                    </article>
                  ))}
                </div>

                <div className="mt-6 rounded-[24px] border border-[#d2b072]/18 bg-[#d2b072]/8 p-5">
                  <div className="text-sm font-medium text-[#f8f1df]">다음 단계로 넘어갈 준비가 되면</div>
                  <p className="mt-2 text-sm leading-7 text-white/60">
                    무료 메뉴는 가볍게 둘러보는 입구입니다. 개인화 결과가 궁금해지면 저입력부터 시작하는 것이 가장 빠릅니다.
                  </p>
                  <Button
                    type="button"
                    onClick={() => setIntakeMode('light')}
                    className="mt-4 rounded-full bg-[#d2b072] px-5 text-[#111827] hover:bg-[#e3c68d]"
                  >
                    저입력으로 이어가기
                  </Button>
                </div>
              </div>
            ) : null}

            {intakeMode === 'light' ? (
              <div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="light-birth-year" className="mb-1.5 block text-sm text-white/68">
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
                      className="border-white/15 bg-white/6 text-white placeholder:text-white/28"
                    />
                  </div>
                  <div>
                    <Label htmlFor="light-birth-month" className="mb-1.5 block text-sm text-white/68">
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
                      className="border-white/15 bg-white/6 text-white placeholder:text-white/28"
                    />
                  </div>
                  <div>
                    <Label htmlFor="light-birth-day" className="mb-1.5 block text-sm text-white/68">
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
                      className="border-white/15 bg-white/6 text-white placeholder:text-white/28"
                    />
                  </div>
                </div>

                <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                  <div className="text-sm font-medium text-[#f8f1df]">저입력에서 바로 열리는 것</div>
                  <p className="mt-2 text-sm leading-7 text-white/60">
                    총운, 연애, 재물, 직장 점수와 행동 제안, 날짜 포인트를 먼저 받아보고 필요하면 심화 리포트로 넘어갑니다.
                  </p>
                </div>

                <Button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => submit('light')}
                  className="mt-6 h-12 w-full rounded-full bg-[#d2b072] text-sm font-semibold text-[#111827] hover:bg-[#e3c68d]"
                >
                  {isSubmitting ? '리포트를 생성하고 있어요...' : `${focusMeta.label} 요약 리포트 보기`}
                </Button>
              </div>
            ) : null}

            {intakeMode === 'precise' ? (
              <div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="precise-birth-year" className="mb-1.5 block text-sm text-white/68">
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
                      className="border-white/15 bg-white/6 text-white placeholder:text-white/28"
                    />
                  </div>
                  <div>
                    <Label htmlFor="precise-birth-month" className="mb-1.5 block text-sm text-white/68">
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
                      className="border-white/15 bg-white/6 text-white placeholder:text-white/28"
                    />
                  </div>
                  <div>
                    <Label htmlFor="precise-birth-day" className="mb-1.5 block text-sm text-white/68">
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
                      className="border-white/15 bg-white/6 text-white placeholder:text-white/28"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="precise-birth-hour" className="mb-1.5 block text-sm text-white/68">
                    태어난 시간
                  </Label>
                  <select
                    id="precise-birth-hour"
                    name="preciseBirthHour"
                    value={form.hour}
                    onChange={(event) => updateField('hour', event.target.value)}
                    className="w-full rounded-md border border-white/15 bg-white/6 px-3 py-2 text-sm text-white"
                  >
                    {HOUR_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value} className="bg-slate-950">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <fieldset className="mt-4 space-y-2">
                  <legend className="text-sm text-white/68">성별</legend>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'male', label: '남성' },
                      { value: 'female', label: '여성' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        htmlFor={`precise-gender-${option.value}`}
                        className={cn(
                          'flex cursor-pointer items-center justify-center rounded-2xl border px-3 py-3 text-sm font-medium transition-colors',
                          form.gender === option.value
                            ? 'border-[#d2b072]/55 bg-[#d2b072]/14 text-[#fff1cb]'
                            : 'border-white/12 bg-white/5 text-white/68 hover:bg-white/10 hover:text-white'
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

                <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                  <div className="text-sm font-medium text-[#f8f1df]">정밀입력에서 보강되는 것</div>
                  <p className="mt-2 text-sm leading-7 text-white/60">
                    태어난 시간이 있으면 시주까지 반영하고, 성별 정보까지 묶어 결과 저장과 이후 확장 흐름을 더 또렷하게 연결합니다.
                  </p>
                </div>

                <Button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => submit('precise')}
                  className="mt-6 h-12 w-full rounded-full bg-[#d2b072] text-sm font-semibold text-[#111827] hover:bg-[#e3c68d]"
                >
                  {isSubmitting ? '리포트를 생성하고 있어요...' : `${focusMeta.label} 정밀 리포트 시작하기`}
                </Button>
              </div>
            ) : null}

            {errorMessage ? (
              <p role="alert" className="mt-4 text-center text-sm text-red-300">
                {errorMessage}
              </p>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
