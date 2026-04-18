'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SiteHeader from '@/features/shared-navigation/site-header';
import { HOUR_OPTIONS } from '@/features/home/content';
import {
  ONBOARDING_CONSENTS,
  ONBOARDING_THOUGHTS,
  ONBOARDING_TONE_OPTIONS,
} from '@/content/moonlight';
import { parseBirthInputDraft } from '@/domain/saju/validators/birth-input';
import { toSlug } from '@/lib/saju/pillars';
import { cn } from '@/lib/utils';
import {
  buildTonePreview,
  clearOnboardingDraft,
  createInitialOnboardingDraft,
  getHonorificLabel,
  loadOnboardingDraft,
  saveOnboardingDraft,
  type OnboardingSpeechTone,
  type SajuOnboardingDraft,
} from './onboarding-storage';

export type OnboardingStep = 'splash' | 'empathy' | 'birth' | 'nickname' | 'consent';

const STEP_META: Record<
  Exclude<OnboardingStep, 'splash' | 'empathy'>,
  { count: string; active: 1 | 2 | 3 }
> = {
  birth: { count: '1 / 3', active: 1 },
  nickname: { count: '2 / 3', active: 2 },
  consent: { count: '3 / 3', active: 3 },
};

const STEP_PATHS: Record<OnboardingStep, string> = {
  splash: '/saju/new',
  empathy: '/saju/new/empathy',
  birth: '/saju/new/birth',
  nickname: '/saju/new/nickname',
  consent: '/saju/new/consent',
};

function getPrevPath(step: OnboardingStep) {
  switch (step) {
    case 'birth':
      return STEP_PATHS.empathy;
    case 'nickname':
      return STEP_PATHS.birth;
    case 'consent':
      return STEP_PATHS.nickname;
    default:
      return null;
  }
}

function getNextPath(step: OnboardingStep) {
  switch (step) {
    case 'splash':
      return STEP_PATHS.empathy;
    case 'empathy':
      return STEP_PATHS.birth;
    case 'birth':
      return STEP_PATHS.nickname;
    case 'nickname':
      return STEP_PATHS.consent;
    default:
      return null;
  }
}

function buildBirthPayload(form: SajuOnboardingDraft) {
  return {
    year: form.year,
    month: form.month,
    day: form.day,
    hour: form.hour,
    gender: form.gender,
  };
}

function hasValidBirth(form: SajuOnboardingDraft) {
  return parseBirthInputDraft(buildBirthPayload(form), {
    requireGender: false,
  }).ok;
}

function hasValidNickname(form: SajuOnboardingDraft) {
  return form.nickname.trim().length > 0;
}

function StepIndicator({ active }: { active: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-2 text-xs tracking-[0.24em] text-[var(--app-gold)]/72">
      <span className={cn('h-2.5 w-2.5 rounded-full', active >= 1 ? 'bg-[var(--app-gold)]' : 'bg-[var(--app-line)]')} />
      <span className={cn('h-px w-8', active >= 2 ? 'bg-[var(--app-gold)]/60' : 'bg-[var(--app-line)]')} />
      <span className={cn('h-2.5 w-2.5 rounded-full', active >= 2 ? 'bg-[var(--app-gold)]' : 'bg-[var(--app-line)]')} />
      <span className={cn('h-px w-8', active >= 3 ? 'bg-[var(--app-gold)]/60' : 'bg-[var(--app-line)]')} />
      <span className={cn('h-2.5 w-2.5 rounded-full', active >= 3 ? 'bg-[var(--app-gold)]' : 'bg-[var(--app-line)]')} />
    </div>
  );
}

export default function SajuIntakePage({ step }: { step: OnboardingStep }) {
  const router = useRouter();
  const maxYear = new Date().getFullYear();
  const [form, setForm] = useState<SajuOnboardingDraft>(createInitialOnboardingDraft());
  const [isHydrated, setIsHydrated] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const honorific = useMemo(() => getHonorificLabel(form.nickname), [form.nickname]);
  const tonePreview = useMemo(
    () => buildTonePreview(form.tone, form.nickname),
    [form.nickname, form.tone]
  );

  useEffect(() => {
    const draft = loadOnboardingDraft();
    setForm(draft);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    saveOnboardingDraft(form);
  }, [form, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;

    if (step === 'splash') {
      const timer = window.setTimeout(() => {
        router.replace(STEP_PATHS.empathy);
      }, 2000);

      return () => window.clearTimeout(timer);
    }

    if (step === 'nickname' && !hasValidBirth(form)) {
      router.replace(STEP_PATHS.birth);
      return;
    }

    if (step === 'consent' && (!hasValidBirth(form) || !hasValidNickname(form))) {
      router.replace(hasValidBirth(form) ? STEP_PATHS.nickname : STEP_PATHS.birth);
    }
  }, [form, isHydrated, router, step]);

  function updateField<K extends Exclude<keyof SajuOnboardingDraft, 'consents'>>(
    field: K,
    value: SajuOnboardingDraft[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function validateBirthStep() {
    const parsed = parseBirthInputDraft(buildBirthPayload(form), {
      requireGender: false,
    });

    if (!parsed.ok) {
      setErrorMessage(parsed.error);
      return false;
    }

    setErrorMessage('');
    return true;
  }

  function validateNicknameStep() {
    if (!form.nickname.trim()) {
      setErrorMessage('어떻게 불러드리면 좋을지 한 번만 적어주세요.');
      return false;
    }

    setErrorMessage('');
    return true;
  }

  async function submit() {
    const requiredConsentMissing = ONBOARDING_CONSENTS.some(
      (item) => item.required && !form.consents[item.title]
    );

    if (requiredConsentMissing) {
      setErrorMessage('필수 동의 항목을 확인해 주세요.');
      return;
    }

    const parsed = parseBirthInputDraft(buildBirthPayload(form), {
      requireGender: false,
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

      clearOnboardingDraft();
      void fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: form.nickname.trim(),
          birthYear: parsed.input.year,
          birthMonth: parsed.input.month,
          birthDay: parsed.input.day,
          birthHour: parsed.input.hour ?? null,
          gender: parsed.input.gender ?? null,
        }),
      }).catch(() => undefined);

      router.push(`/saju/${data.id}`);
    } catch {
      router.push(`/saju/${toSlug(parsed.input)}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  const stepMeta = step === 'birth' || step === 'nickname' || step === 'consent' ? STEP_META[step] : null;
  const prevPath = getPrevPath(step);
  const nextPath = getNextPath(step);

  return (
    <main className="min-h-screen bg-[var(--app-ink)] text-white">
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {step === 'splash' ? (
          <section className="mx-auto flex min-h-[72vh] max-w-2xl items-center justify-center">
            <div className="w-full app-hero-card px-8 py-14 text-center sm:px-10 sm:py-18">
              <div className="mx-auto h-20 w-20 rounded-full bg-[radial-gradient(circle,rgba(245,223,170,0.88)_0%,rgba(210,176,114,0.75)_42%,transparent_78%)]" />
              <div className="mt-8 font-[var(--font-heading)] text-[11px] tracking-[0.48em] text-[var(--app-gold)]/72">
                月 光 先 生
              </div>
              <h1 className="mt-4 font-[var(--font-heading)] text-4xl tracking-tight text-[var(--app-gold-text)] sm:text-5xl">
                달빛선생
              </h1>
              <p className="mt-4 text-sm leading-7 text-[var(--app-copy-muted)] sm:text-base">
                천 년의 지혜,<br className="sm:hidden" /> 오늘의 당신을 위하여
              </p>
              <p className="mt-10 text-[11px] uppercase tracking-[0.35em] text-[var(--app-copy-soft)]">
                powered by AI
              </p>
              <div className="mt-8">
                <Button
                  onClick={() => router.replace(STEP_PATHS.empathy)}
                  className="h-11 rounded-full bg-[var(--app-gold)] px-6 text-sm font-semibold text-[#111827] hover:bg-[#e3c68d]"
                >
                  바로 시작
                </Button>
              </div>
            </div>
          </section>
        ) : null}

        {step === 'empathy' ? (
          <section className="mx-auto max-w-3xl app-hero-card p-7 text-center sm:p-10">
            <div className="font-[var(--font-heading)] text-[11px] tracking-[0.45em] text-[var(--app-gold)]/72">
              月 光 先 生
            </div>
            <h1 className="mt-5 font-[var(--font-heading)] text-4xl leading-[1.35] text-[var(--app-ivory)] sm:text-5xl">
              문득 이런 생각이 드실 때가 있으시죠
            </h1>
            <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
              {ONBOARDING_THOUGHTS.map((thought) => (
                <div key={thought} className="app-panel-muted p-5 text-sm leading-7 text-[var(--app-copy)]">
                  “{thought}”
                </div>
              ))}
            </div>
            <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-[var(--app-copy-muted)]">
              옛 어른들은 이럴 때 하늘의 뜻을 읽었습니다. 생년월일시를 차근차근 여쭙고, 선생님만을 위한 첫 해석으로 이어드리겠습니다.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3">
              <Button
                onClick={() => router.push(STEP_PATHS.birth)}
                className="h-12 rounded-full bg-[var(--app-gold)] px-8 text-sm font-semibold text-[#111827] hover:bg-[#e3c68d]"
              >
                시작하기
              </Button>
              <p className="text-xs text-[var(--app-copy-soft)]">
                이미 계정이 있으시면 로그인 후 이어서 보실 수 있습니다.
              </p>
            </div>
          </section>
        ) : null}

        {stepMeta ? (
          <section className="mx-auto max-w-3xl app-hero-card p-7 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <StepIndicator active={stepMeta.active} />
              <Badge className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]">
                {stepMeta.count}
              </Badge>
            </div>

            {step === 'birth' ? (
              <>
                <h1 className="mt-6 font-[var(--font-heading)] text-3xl leading-[1.35] text-[var(--app-ivory)] sm:text-4xl">
                  선생님의 생시(生時)를 여쭙겠습니다
                </h1>
                <p className="mt-4 text-sm leading-7 text-[var(--app-copy)]">
                  하늘의 기운이 땅에 내려오는 순간, 그 찰나가 사주입니다. 생년월일만 먼저 입력하셔도 시작하실 수 있고, 시간은 모름으로 남겨두셔도 괜찮습니다.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label htmlFor="birth-year" className="mb-2 block text-sm text-[var(--app-copy)]">
                      태어난 해
                    </Label>
                    <Input
                      id="birth-year"
                      inputMode="numeric"
                      value={form.year}
                      onChange={(event) => updateField('year', event.target.value)}
                      placeholder={`예: ${maxYear - 35}`}
                      className="h-12 rounded-2xl border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-ivory)]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="birth-month" className="mb-2 block text-sm text-[var(--app-copy)]">
                      월
                    </Label>
                    <Input
                      id="birth-month"
                      inputMode="numeric"
                      value={form.month}
                      onChange={(event) => updateField('month', event.target.value)}
                      placeholder="예: 3"
                      className="h-12 rounded-2xl border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-ivory)]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="birth-day" className="mb-2 block text-sm text-[var(--app-copy)]">
                      일
                    </Label>
                    <Input
                      id="birth-day"
                      inputMode="numeric"
                      value={form.day}
                      onChange={(event) => updateField('day', event.target.value)}
                      placeholder="예: 20"
                      className="h-12 rounded-2xl border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-ivory)]"
                    />
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="birth-hour" className="mb-2 block text-sm text-[var(--app-copy)]">
                      태어난 시간
                    </Label>
                    <select
                      id="birth-hour"
                      value={form.hour}
                      onChange={(event) => updateField('hour', event.target.value)}
                      className="h-12 w-full rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 text-sm text-[var(--app-ivory)]"
                    >
                      {HOUR_OPTIONS.map((option) => (
                        <option key={option.label} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <label className="mt-3 flex items-start gap-3 rounded-[1.15rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-3 text-sm text-[var(--app-copy-muted)]">
                      <input
                        type="checkbox"
                        checked={form.hour === ''}
                        onChange={(event) => {
                          if (event.target.checked) {
                            updateField('hour', '');
                          }
                        }}
                        className="mt-1 h-4 w-4 rounded border-[var(--app-line)] bg-transparent accent-[var(--app-gold)]"
                      />
                      <span>
                        출생 시각을 모릅니다
                        <span className="mt-1 block text-xs leading-6 text-[var(--app-copy-soft)]">
                          괜찮습니다. 그래도 많은 흐름을 읽어드릴 수 있습니다.
                        </span>
                      </span>
                    </label>
                  </div>
                  <div>
                    <Label htmlFor="birth-gender" className="mb-2 block text-sm text-[var(--app-copy)]">
                      성별
                    </Label>
                    <select
                      id="birth-gender"
                      value={form.gender}
                      onChange={(event) => updateField('gender', event.target.value)}
                      className="h-12 w-full rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 text-sm text-[var(--app-ivory)]"
                    >
                      <option value="">선택 안 함</option>
                      <option value="male">남성</option>
                      <option value="female">여성</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  {prevPath ? (
                    <Link
                      href={prevPath}
                      className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-6 text-sm text-[var(--app-copy)] transition-colors hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]"
                    >
                      이전
                    </Link>
                  ) : null}
                  <Button
                    onClick={() => {
                      if (validateBirthStep() && nextPath) router.push(nextPath);
                    }}
                    className="h-12 rounded-full bg-[var(--app-gold)] px-6 text-sm font-semibold text-[#111827] hover:bg-[#e3c68d]"
                  >
                    다음
                  </Button>
                </div>
                <p className="mt-4 text-center text-xs leading-6 text-[var(--app-copy-soft)]">
                  입력하신 정보는 암호화 저장되며, 외부에 공유되지 않습니다.
                </p>
              </>
            ) : null}

            {step === 'nickname' ? (
              <>
                <h1 className="mt-6 font-[var(--font-heading)] text-3xl leading-[1.35] text-[var(--app-ivory)] sm:text-4xl">
                  어떻게 불러드릴까요?
                </h1>
                <p className="mt-4 text-sm leading-7 text-[var(--app-copy)]">
                  본명이 아니어도 괜찮습니다. 결과 화면과 보관함에서 선생님을 부를 호칭이며, 익숙하고 편한 이름이면 충분합니다.
                </p>

                <div className="mt-8">
                  <Label htmlFor="nickname" className="mb-2 block text-sm text-[var(--app-copy)]">
                    호칭
                  </Label>
                  <Input
                    id="nickname"
                    value={form.nickname}
                    onChange={(event) => updateField('nickname', event.target.value)}
                    placeholder="예: 김영희 선생님"
                    className="h-12 rounded-2xl border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-ivory)]"
                  />
                  <p className="mt-3 text-xs leading-6 text-[var(--app-copy-soft)]">
                    이렇게 불러드릴게요: <span className="text-[var(--app-gold-text)]">{honorific}</span>
                  </p>
                </div>

                <div className="mt-8">
                  <Label className="mb-2 block text-sm text-[var(--app-copy)]">말투 선택</Label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {ONBOARDING_TONE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateField('tone', option.value as OnboardingSpeechTone)}
                        className={cn(
                          'rounded-[1.15rem] border px-4 py-4 text-left transition-colors',
                          form.tone === option.value
                            ? 'border-[var(--app-gold)]/40 bg-[var(--app-gold)]/12 text-[var(--app-gold-text)]'
                            : 'border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)] hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]'
                        )}
                      >
                        <div className="text-sm font-medium">{option.label}</div>
                        <div className="mt-2 text-xs leading-6">{option.description}</div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 rounded-[1.25rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-4 text-sm leading-7 text-[var(--app-copy)]">
                    “{tonePreview}”
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <Link
                    href={prevPath ?? STEP_PATHS.birth}
                    className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-6 text-sm text-[var(--app-copy)] transition-colors hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]"
                  >
                    이전
                  </Link>
                  <Button
                    onClick={() => {
                      if (validateNicknameStep() && nextPath) router.push(nextPath);
                    }}
                    className="h-12 rounded-full bg-[var(--app-gold)] px-6 text-sm font-semibold text-[#111827] hover:bg-[#e3c68d]"
                  >
                    다음
                  </Button>
                </div>
              </>
            ) : null}

            {step === 'consent' ? (
              <>
                <h1 className="mt-6 font-[var(--font-heading)] text-3xl leading-[1.35] text-[var(--app-ivory)] sm:text-4xl">
                  마지막 한 가지만 여쭙겠습니다
                </h1>
                <p className="mt-4 text-sm leading-7 text-[var(--app-copy)]">
                  법으로 정해진 안내와 해석 생성에 필요한 동의만 간단히 정리했습니다. 길게 읽지 않으셔도 핵심은 한눈에 보이게 두었습니다.
                </p>

                <div className="mt-8 space-y-3">
                  {ONBOARDING_CONSENTS.map((item) => (
                    <label
                      key={item.title}
                      className="flex items-start gap-3 rounded-[1.25rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-4"
                    >
                      <input
                        type="checkbox"
                        checked={form.consents[item.title]}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            consents: {
                              ...current.consents,
                              [item.title]: event.target.checked,
                            },
                          }))
                        }
                        className="mt-1 h-4 w-4 rounded border-[var(--app-line)] bg-transparent accent-[var(--app-gold)]"
                      />
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 text-sm font-medium text-[var(--app-ivory)]">
                          {item.title}
                          <span
                            className={cn(
                              'rounded-full border px-2 py-0.5 text-[10px]',
                              item.required
                                ? 'border-[var(--app-coral)]/28 bg-[var(--app-coral)]/10 text-[var(--app-coral)]'
                                : 'border-[var(--app-gold)]/28 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]'
                            )}
                          >
                            {item.required ? '필수' : '선택'}
                          </span>
                        </span>
                        <span className="mt-2 block text-xs leading-6 text-[var(--app-copy-muted)]">
                          {item.detail}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>

                <div className="mt-8 flex gap-3">
                  <Link
                    href={prevPath ?? STEP_PATHS.nickname}
                    className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-6 text-sm text-[var(--app-copy)] transition-colors hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]"
                  >
                    이전
                  </Link>
                  <Button
                    onClick={submit}
                    disabled={isSubmitting}
                    className="h-12 rounded-full bg-[var(--app-gold)] px-6 text-sm font-semibold text-[#111827] hover:bg-[#e3c68d]"
                  >
                    {isSubmitting ? '결과 준비 중...' : '시작하기'}
                  </Button>
                </div>
              </>
            ) : null}

            {errorMessage ? (
              <div className="mt-6 rounded-2xl border border-[var(--app-coral)]/28 bg-[var(--app-coral)]/10 px-4 py-3 text-sm text-[var(--app-ivory)]">
                {errorMessage}
              </div>
            ) : null}
          </section>
        ) : null}
      </div>
    </main>
  );
}
