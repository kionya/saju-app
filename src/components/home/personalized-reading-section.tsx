'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HOUR_OPTIONS, QUESTION_CHIPS } from '@/lib/home-content';
import { FOCUS_TOPIC_META, type FocusTopic } from '@/lib/saju/report';
import { cn } from '@/lib/utils';

interface BirthFormState {
  year: string;
  month: string;
  day: string;
  hour: string;
  gender: string;
}

interface PersonalizedReadingSectionProps {
  selectedTopic: FocusTopic;
  form: BirthFormState;
  formError: string;
  isSubmitting: boolean;
  maxYear: number;
  onSelectTopic: (topic: FocusTopic) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onChange: (field: keyof BirthFormState, value: string) => void;
}

const FORM_ERROR_ID = 'birth-form-error';

export default function PersonalizedReadingSection({
  selectedTopic,
  form,
  formError,
  isSubmitting,
  maxYear,
  onSelectTopic,
  onSubmit,
  onChange,
}: PersonalizedReadingSectionProps) {
  const focusMeta = FOCUS_TOPIC_META[selectedTopic];

  return (
    <section
      id="personalized-reading"
      className="border-y border-white/8 bg-[linear-gradient(180deg,rgba(7,19,39,0.82),rgba(2,8,23,0.96))]"
    >
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-20">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.24em] text-[#d2b072]/75">Personalized</p>
            <h2 className="text-3xl font-semibold tracking-tight text-[#f8f1df]">
              생년월일만으로 먼저 보고,
              <span className="block text-white/72">필요할 때만 더 깊게 들어가는 구조</span>
            </h2>
            <p className="text-sm leading-7 text-white/60 sm:text-base">
              입력은 짧게, 결과는 빠르게. 정통 사주 해석이 필요한 순간에만 상세 리포트를 여는 흐름으로
              첫 경험의 부담을 낮춥니다.
            </p>
          </div>

          <div className="rounded-[28px] border border-[#d2b072]/18 bg-[#d2b072]/7 p-6">
            <div className="mb-3 text-xs uppercase tracking-[0.24em] text-[#d2b072]/78">{focusMeta.badge}</div>
            <div className="text-2xl font-semibold text-[#f7ecd5]">{focusMeta.label} 질문으로 읽는 사주 리포트</div>
            <p className="mt-3 text-sm leading-7 text-white/60">{focusMeta.subtitle}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { title: '1단계', body: '오늘의 타로, 띠별, 별자리처럼 가볍게 시작' },
              { title: '2단계', body: '생년월일만으로 개인화 결과 도달' },
              { title: '3단계', body: '코인으로 연애·재물·직장 심화 해석 언락' },
            ].map((step) => (
              <div key={step.title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="text-sm font-medium text-[#f8f1df]">{step.title}</div>
                <p className="mt-3 text-sm leading-6 text-white/55">{step.body}</p>
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          aria-busy={isSubmitting}
          aria-describedby={formError ? FORM_ERROR_ID : undefined}
          className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,36,0.96),rgba(7,19,39,0.92))] p-6 shadow-[0_30px_80px_rgba(2,6,23,0.45)] sm:p-7"
        >
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-white/42">Step 1</div>
              <h3 className="mt-2 text-2xl font-semibold text-[#f8f1df]">맞춤 운세 시작</h3>
            </div>
            <Badge className="w-fit border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
              첫 결과까지 30초 목표
            </Badge>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {QUESTION_CHIPS.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => onSelectTopic(chip.key)}
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

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="birth-year" className="mb-1.5 block text-sm text-white/68">
                년도
              </Label>
              <Input
                id="birth-year"
                name="birthYear"
                type="number"
                placeholder="1994"
                min={1900}
                max={maxYear}
                inputMode="numeric"
                autoComplete="bday-year"
                value={form.year}
                onChange={(event) => onChange('year', event.target.value)}
                className="border-white/15 bg-white/6 text-white placeholder:text-white/28"
                required
              />
            </div>
            <div>
              <Label htmlFor="birth-month" className="mb-1.5 block text-sm text-white/68">
                월
              </Label>
              <Input
                id="birth-month"
                name="birthMonth"
                type="number"
                placeholder="5"
                min={1}
                max={12}
                inputMode="numeric"
                autoComplete="bday-month"
                value={form.month}
                onChange={(event) => onChange('month', event.target.value)}
                className="border-white/15 bg-white/6 text-white placeholder:text-white/28"
                required
              />
            </div>
            <div>
              <Label htmlFor="birth-day" className="mb-1.5 block text-sm text-white/68">
                일
              </Label>
              <Input
                id="birth-day"
                name="birthDay"
                type="number"
                placeholder="15"
                min={1}
                max={31}
                inputMode="numeric"
                autoComplete="bday-day"
                value={form.day}
                onChange={(event) => onChange('day', event.target.value)}
                className="border-white/15 bg-white/6 text-white placeholder:text-white/28"
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="birth-hour" className="mb-1.5 block text-sm text-white/68">
              태어난 시간
            </Label>
            <select
              id="birth-hour"
              name="birthHour"
              autoComplete="off"
              value={form.hour}
              onChange={(event) => onChange('hour', event.target.value)}
              className="w-full rounded-md border border-white/15 bg-white/6 px-3 py-2 text-sm text-white"
            >
              {HOUR_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-slate-950">
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-white/38">정확한 시간을 몰라도 먼저 결과를 보고, 나중에 다시 보정할 수 있습니다.</p>
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
                  htmlFor={`gender-${option.value}`}
                  className={cn(
                    'flex cursor-pointer items-center justify-center rounded-2xl border px-3 py-3 text-sm font-medium transition-colors',
                    form.gender === option.value
                      ? 'border-[#d2b072]/55 bg-[#d2b072]/14 text-[#fff1cb]'
                      : 'border-white/12 bg-white/5 text-white/68 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <input
                    id={`gender-${option.value}`}
                    name="gender"
                    type="radio"
                    value={option.value}
                    autoComplete="sex"
                    checked={form.gender === option.value}
                    onChange={(event) => onChange('gender', event.target.value)}
                    className="sr-only"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-6 grid gap-3 rounded-[24px] border border-white/10 bg-white/[0.04] p-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <div className="text-sm font-medium text-[#f8f1df]">{focusMeta.label} 중심 요약 카드부터 보여드립니다</div>
              <p className="mt-1 text-sm text-white/55">총운, 연애, 재물, 직장 점수와 행동 제안, 날짜 포인트를 먼저 확인합니다.</p>
            </div>
            <Badge className="w-fit border-white/10 bg-white/5 text-white/62">무료 결과 + 심화 언락</Badge>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 h-12 w-full rounded-full bg-[#d2b072] text-sm font-semibold text-[#111827] hover:bg-[#e3c68d]"
          >
            {isSubmitting ? '리포트를 생성하고 있어요...' : `${focusMeta.label} 리포트 시작하기`}
          </Button>
          {formError && (
            <p id={FORM_ERROR_ID} role="alert" className="mt-3 text-center text-sm text-red-300">
              {formError}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
