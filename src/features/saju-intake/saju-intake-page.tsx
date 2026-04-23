'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SiteHeader from '@/features/shared-navigation/site-header';
import { WisdomCategoryHero } from '@/features/shared-navigation/wisdom-category-hero';
import { HOUR_OPTIONS } from '@/features/home/content';
import {
  ONBOARDING_CONSENTS,
  ONBOARDING_THOUGHTS,
  ONBOARDING_TONE_OPTIONS,
} from '@/content/moonlight';
import { parseBirthInputDraft } from '@/domain/saju/validators/birth-input';
import { BIRTH_LOCATION_PRESETS } from '@/lib/saju/birth-location';
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

interface ProfileApiBirthFields {
  birthYear: number | null;
  birthMonth: number | null;
  birthDay: number | null;
  birthHour: number | null;
  birthMinute: number | null;
  gender: 'male' | 'female' | null;
}

interface ProfileApiResponse {
  authenticated: boolean;
  profile: (ProfileApiBirthFields & {
    displayName: string;
    note: string;
  }) | null;
  familyProfiles: Array<
    ProfileApiBirthFields & {
      id: string;
      label: string;
      relationship: string;
      note: string;
      createdAt: string;
    }
  >;
  error?: string;
}

interface SavedBirthProfile {
  id: string;
  source: 'self' | 'family';
  label: string;
  nickname: string;
  detail: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number | null;
  birthMinute: number | null;
  gender: 'male' | 'female' | null;
}

type ProfileLoadStatus = 'idle' | 'loading' | 'ready' | 'anonymous' | 'empty' | 'error';

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
    minute: form.minute,
    unknownTime: form.hour === '',
    jasiMethod: form.jasiMethod,
    gender: form.gender,
    birthLocationCode: form.birthLocationCode,
    birthLocationLabel: form.birthLocationLabel,
    birthLatitude: form.birthLatitude,
    birthLongitude: form.birthLongitude,
    solarTimeMode: form.birthLocationCode ? form.solarTimeMode : 'standard',
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

function hasBirthFields<T extends ProfileApiBirthFields | null | undefined>(
  profile: T
): profile is NonNullable<T> & { birthYear: number; birthMonth: number; birthDay: number } {
  return Boolean(profile?.birthYear && profile.birthMonth && profile.birthDay);
}

function formatSavedProfileDetail(profile: ProfileApiBirthFields) {
  const dateLabel = `${profile.birthYear}.${profile.birthMonth}.${profile.birthDay}`;
  const hourLabel =
    profile.birthHour === null
      ? '시간 미입력'
      : `${profile.birthHour}시${
          profile.birthMinute === null
            ? ''
            : ` ${String(profile.birthMinute).padStart(2, '0')}분`
        }`;
  const genderLabel = profile.gender === 'male' ? '남성' : profile.gender === 'female' ? '여성' : '성별 미선택';
  return `${dateLabel} · ${hourLabel} · ${genderLabel}`;
}

function buildSavedProfileOptions(data: ProfileApiResponse): SavedBirthProfile[] {
  const options: SavedBirthProfile[] = [];

  if (hasBirthFields(data.profile)) {
    options.push({
      id: 'self',
      source: 'self',
      label: data.profile.displayName ? `내 정보 · ${data.profile.displayName}` : '내 정보 불러오기',
      nickname: data.profile.displayName,
      detail: formatSavedProfileDetail(data.profile),
      birthYear: data.profile.birthYear,
      birthMonth: data.profile.birthMonth,
      birthDay: data.profile.birthDay,
      birthHour: data.profile.birthHour,
      birthMinute: data.profile.birthMinute,
      gender: data.profile.gender,
    });
  }

  data.familyProfiles.forEach((profile) => {
    if (!hasBirthFields(profile)) return;

    options.push({
      id: `family-${profile.id}`,
      source: 'family',
      label: `${profile.label} · ${profile.relationship}`,
      nickname: profile.label,
      detail: formatSavedProfileDetail(profile),
      birthYear: profile.birthYear,
      birthMonth: profile.birthMonth,
      birthDay: profile.birthDay,
      birthHour: profile.birthHour,
      birthMinute: profile.birthMinute,
      gender: profile.gender,
    });
  });

  return options;
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
  const [savedProfileOptions, setSavedProfileOptions] = useState<SavedBirthProfile[]>([]);
  const [profileLoadStatus, setProfileLoadStatus] = useState<ProfileLoadStatus>('idle');
  const [profileLoadMessage, setProfileLoadMessage] = useState('');
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
    if (!isHydrated || step !== 'birth') return;

    let cancelled = false;

    async function loadSavedProfiles() {
      setProfileLoadStatus('loading');
      setProfileLoadMessage('');

      try {
        const response = await fetch('/api/profile', { cache: 'no-store' });
        const data = (await response.json().catch(() => null)) as ProfileApiResponse | null;

        if (cancelled) return;

        if (!response.ok || !data) {
          setProfileLoadStatus('error');
          setProfileLoadMessage(data?.error ?? '저장된 프로필을 불러오지 못했습니다.');
          return;
        }

        if (!data.authenticated) {
          setProfileLoadStatus('anonymous');
          return;
        }

        const options = buildSavedProfileOptions(data);
        setSavedProfileOptions(options);
        setProfileLoadStatus(options.length > 0 ? 'ready' : 'empty');
      } catch {
        if (cancelled) return;
        setProfileLoadStatus('error');
        setProfileLoadMessage('저장된 프로필을 불러오는 중 네트워크 오류가 발생했습니다.');
      }
    }

    void loadSavedProfiles();

    return () => {
      cancelled = true;
    };
  }, [isHydrated, step]);

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

  function updateBirthLocation(code: string) {
    setForm((current) => ({
      ...current,
      birthLocationCode: code,
      solarTimeMode: code ? 'longitude' : 'standard',
      birthLocationLabel: code === 'custom' ? current.birthLocationLabel : '',
      birthLatitude: code === 'custom' ? current.birthLatitude : '',
      birthLongitude: code === 'custom' ? current.birthLongitude : '',
    }));
  }

  function applySavedProfile(profile: SavedBirthProfile) {
    setForm((current) => ({
      ...current,
      year: String(profile.birthYear),
      month: String(profile.birthMonth),
      day: String(profile.birthDay),
      hour: profile.birthHour === null ? '' : String(profile.birthHour),
      minute:
        profile.birthHour === null || profile.birthMinute === null
          ? ''
          : String(profile.birthMinute),
      gender: profile.gender ?? '',
      nickname: profile.nickname || current.nickname,
    }));
    setErrorMessage('');
    setProfileLoadMessage(`${profile.label} 정보를 입력칸에 불러왔습니다.`);
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
          birthMinute: parsed.input.minute ?? null,
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
    <main className="saju-intake-shell min-h-screen bg-[var(--app-ink)] text-white">
      <SiteHeader />

      <div
        className={cn(
          step === 'splash'
            ? 'wisdom-category-page'
            : 'mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10'
        )}
      >
        {step === 'splash' ? (
          <>
            <WisdomCategoryHero slug="saju" />
            <section className="wisdom-category-body mt-8">
              <div className="mx-auto max-w-3xl app-panel px-8 py-14 text-center sm:px-10 sm:py-16">
                <h1 className="font-[var(--font-heading)] text-3xl tracking-tight text-[var(--app-ivory)] sm:text-4xl">
                  사주를 시작할 준비가 되었습니다
                </h1>
                <p className="mx-auto mt-5 max-w-xl text-sm leading-8 text-[var(--app-copy-muted)] sm:text-base">
                  생년월일과 태어난 시간을 차근차근 여쭙고, 선생님만의 첫 해석으로 이어드리겠습니다.
                  저장된 정보가 있다면 입력 단계에서 바로 불러오실 수 있습니다.
                </p>
                <div className="mt-8">
                  <Button
                    onClick={() => router.replace(STEP_PATHS.empathy)}
                    className="h-12 rounded-[0.9rem] bg-[var(--app-gold)] px-8 text-sm font-semibold text-[#111827] hover:bg-[#e3c68d]"
                  >
                    사주 시작하기
                  </Button>
                </div>
                <p className="mt-5 text-xs tracking-[0.22em] text-[var(--app-copy-soft)]">
                  月光先生
                </p>
              </div>
            </section>
          </>
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

                <div className="mt-6 rounded-[1.35rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="app-caption">저장된 정보</div>
                      <h2 className="mt-2 text-lg font-semibold text-[var(--app-ivory)]">
                        내 정보나 가족 프로필을 불러올 수 있습니다
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-[var(--app-copy-muted)]">
                        다른 분의 사주를 보실 때는 저장된 가족/지인 프로필을 선택해 주세요.
                      </p>
                    </div>
                    <Link
                      href="/my/profile"
                      className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-strong)] px-4 text-sm text-[var(--app-copy)] transition-colors hover:text-[var(--app-ivory)]"
                    >
                      프로필 관리
                    </Link>
                  </div>

                  <div className="mt-4">
                    {profileLoadStatus === 'loading' ? (
                      <div className="rounded-2xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm text-[var(--app-copy-muted)]">
                        저장된 정보를 확인하고 있습니다.
                      </div>
                    ) : null}

                    {profileLoadStatus === 'anonymous' ? (
                      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm leading-6 text-[var(--app-copy-muted)] sm:flex-row sm:items-center sm:justify-between">
                        <span>로그인하면 저장해 둔 내 정보와 가족 정보를 바로 불러올 수 있습니다.</span>
                        <Link
                          href="/login?next=/saju/new/birth"
                          className="inline-flex h-9 shrink-0 items-center justify-center rounded-full border border-[var(--app-gold)]/30 bg-[var(--app-gold)]/10 px-4 text-sm text-[var(--app-gold-text)]"
                        >
                          로그인
                        </Link>
                      </div>
                    ) : null}

                    {profileLoadStatus === 'empty' ? (
                      <div className="rounded-2xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm leading-6 text-[var(--app-copy-muted)]">
                        아직 생년월일이 저장된 프로필이 없습니다. 이번 입력을 마치면 내 프로필에 자동 저장됩니다.
                      </div>
                    ) : null}

                    {profileLoadStatus === 'error' ? (
                      <div className="rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm leading-6 text-rose-100">
                        {profileLoadMessage}
                      </div>
                    ) : null}

                    {profileLoadStatus === 'ready' ? (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {savedProfileOptions.map((profile) => (
                          <button
                            key={profile.id}
                            type="button"
                            onClick={() => applySavedProfile(profile)}
                            className="rounded-2xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-left transition-colors hover:border-[var(--app-gold)]/38 hover:bg-[var(--app-gold)]/8"
                          >
                            <span className="block text-sm font-medium text-[var(--app-ivory)]">{profile.label}</span>
                            <span className="mt-1 block text-xs leading-5 text-[var(--app-copy-muted)]">{profile.detail}</span>
                          </button>
                        ))}
                      </div>
                    ) : null}

                    {profileLoadMessage && profileLoadStatus !== 'error' ? (
                      <p className="mt-3 text-xs leading-6 text-[var(--app-gold-text)]">{profileLoadMessage}</p>
                    ) : null}
                  </div>
                </div>

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

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
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
                    {form.hour === '23' ? (
                      <div className="mt-3">
                        <Label htmlFor="birth-jasi-method" className="mb-2 block text-xs text-[var(--app-copy-muted)]">
                          자시 기준
                        </Label>
                        <select
                          id="birth-jasi-method"
                          value={form.jasiMethod}
                          onChange={(event) => updateField('jasiMethod', event.target.value as SajuOnboardingDraft['jasiMethod'])}
                          className="h-11 w-full rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 text-sm text-[var(--app-ivory)]"
                        >
                          <option value="unified">통자시 기준으로 보기</option>
                          <option value="split">야자시 기준으로 보기</option>
                        </select>
                        <p className="mt-2 text-xs leading-6 text-[var(--app-copy-soft)]">
                          밤 11시 전후 출생은 일주가 갈릴 수 있어요. 우선 통자시를 기본값으로 두었습니다.
                        </p>
                      </div>
                    ) : null}
                  </div>
                  <div>
                    <Label htmlFor="birth-minute" className="mb-2 block text-sm text-[var(--app-copy)]">
                      태어난 분
                    </Label>
                    <Input
                      id="birth-minute"
                      inputMode="numeric"
                      value={form.minute}
                      onChange={(event) => updateField('minute', event.target.value)}
                      placeholder="예: 30"
                      disabled={form.hour === ''}
                      className="h-12 rounded-2xl border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-ivory)] disabled:cursor-not-allowed disabled:opacity-55"
                    />
                    <p className="mt-3 text-xs leading-6 text-[var(--app-copy-soft)]">
                      분까지 아시면 더 정확해집니다. 모르시면 비워두셔도 괜찮습니다.
                    </p>
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

                <div className="mt-4 rounded-[1.35rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-4">
                  <div className="grid gap-4 sm:grid-cols-[1.15fr_0.85fr]">
                    <div>
                      <Label htmlFor="birth-location" className="mb-2 block text-sm text-[var(--app-copy)]">
                        출생 지역
                      </Label>
                      <select
                        id="birth-location"
                        value={form.birthLocationCode}
                        onChange={(event) => updateBirthLocation(event.target.value)}
                        className="h-12 w-full rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 text-sm text-[var(--app-ivory)]"
                      >
                        <option value="">지역 미입력</option>
                        {BIRTH_LOCATION_PRESETS.map((location) => (
                          <option key={location.code} value={location.code}>
                            {location.label}
                          </option>
                        ))}
                        <option value="custom">직접 입력</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="solar-time-mode" className="mb-2 block text-sm text-[var(--app-copy)]">
                        시간 보정
                      </Label>
                      <select
                        id="solar-time-mode"
                        value={form.birthLocationCode ? form.solarTimeMode : 'standard'}
                        onChange={(event) =>
                          updateField(
                            'solarTimeMode',
                            event.target.value as SajuOnboardingDraft['solarTimeMode']
                          )
                        }
                        disabled={!form.birthLocationCode || form.hour === ''}
                        className="h-12 w-full rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 text-sm text-[var(--app-ivory)] disabled:cursor-not-allowed disabled:opacity-55"
                      >
                        <option value="standard">표준시 그대로</option>
                        <option value="longitude">경도 보정</option>
                      </select>
                    </div>
                  </div>

                  {form.birthLocationCode === 'custom' ? (
                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                      <div>
                        <Label htmlFor="birth-location-label" className="mb-2 block text-xs text-[var(--app-copy-muted)]">
                          지역명
                        </Label>
                        <Input
                          id="birth-location-label"
                          value={form.birthLocationLabel}
                          onChange={(event) => updateField('birthLocationLabel', event.target.value)}
                          placeholder="예: 목포"
                          className="h-11 rounded-2xl border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-ivory)]"
                        />
                      </div>
                      <div>
                        <Label htmlFor="birth-latitude" className="mb-2 block text-xs text-[var(--app-copy-muted)]">
                          위도
                        </Label>
                        <Input
                          id="birth-latitude"
                          inputMode="decimal"
                          value={form.birthLatitude}
                          onChange={(event) => updateField('birthLatitude', event.target.value)}
                          placeholder="예: 34.8118"
                          className="h-11 rounded-2xl border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-ivory)]"
                        />
                      </div>
                      <div>
                        <Label htmlFor="birth-longitude" className="mb-2 block text-xs text-[var(--app-copy-muted)]">
                          경도
                        </Label>
                        <Input
                          id="birth-longitude"
                          inputMode="decimal"
                          value={form.birthLongitude}
                          onChange={(event) => updateField('birthLongitude', event.target.value)}
                          placeholder="예: 126.3922"
                          className="h-11 rounded-2xl border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-ivory)]"
                        />
                      </div>
                    </div>
                  ) : null}

                  <p className="mt-3 text-xs leading-6 text-[var(--app-copy-soft)]">
                    출생 지역을 넣으면 동경 135도 한국 표준시 기준과의 차이를 계산해 시주 경계 판단에 반영합니다.
                  </p>
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
