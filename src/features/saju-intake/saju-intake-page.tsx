'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  UnifiedBirthInfoFields,
  type BirthLocationSearchResultLike,
} from '@/components/saju/shared/unified-birth-info-fields';
import SiteHeader from '@/features/shared-navigation/site-header';
import { WisdomCategoryHero } from '@/features/shared-navigation/wisdom-category-hero';
import {
  ONBOARDING_CONSENTS,
  ONBOARDING_THOUGHTS,
  ONBOARDING_TONE_OPTIONS,
} from '@/content/moonlight';
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
  shouldAutoSavePersonalProfile,
  type OnboardingSpeechTone,
  type SajuOnboardingDraft,
} from './onboarding-storage';
import { resolveUnifiedBirthInput, type UnifiedBirthEntryDraft } from '@/lib/saju/unified-birth-entry';
import { trackMoonlightEvent } from '@/lib/analytics';

export type OnboardingStep = 'splash' | 'empathy' | 'birth' | 'nickname' | 'consent';

const STEP_META: Record<
  Exclude<OnboardingStep, 'splash' | 'empathy'>,
  { count: string; active: 1 | 2 | 3; tone: 'single' | 'multi' }
> = {
  birth: { count: '1 / 1', active: 1, tone: 'single' },
  nickname: { count: '2 / 3', active: 2, tone: 'multi' },
  consent: { count: '3 / 3', active: 3, tone: 'multi' },
};

const STEP_PATHS: Record<OnboardingStep, string> = {
  splash: '/saju/new',
  empathy: '/saju/new/empathy',
  birth: '/saju/new',
  nickname: '/saju/new/nickname',
  consent: '/saju/new/consent',
};

interface ProfileApiBirthFields {
  birthYear: number | null;
  birthMonth: number | null;
  birthDay: number | null;
  birthHour: number | null;
  birthMinute: number | null;
  birthLocationCode: string | null;
  birthLocationLabel: string;
  birthLatitude: number | null;
  birthLongitude: number | null;
  solarTimeMode: 'standard' | 'longitude';
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
  birthLocationCode: string;
  birthLocationLabel: string;
  birthLatitude: number | null;
  birthLongitude: number | null;
  solarTimeMode: 'standard' | 'longitude';
  gender: 'male' | 'female' | null;
}

type ProfileLoadStatus = 'idle' | 'loading' | 'ready' | 'anonymous' | 'empty' | 'error';
type LocationSearchStatus = 'idle' | 'loading' | 'ready' | 'empty' | 'error';

type BirthLocationSearchResult = BirthLocationSearchResultLike & {
  source: string;
  sourceRef: string;
  license: string;
};

interface BirthLocationSearchResponse {
  ok: boolean;
  error?: string;
  provider?: string;
  attribution?: string;
  items?: BirthLocationSearchResult[];
}

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

function buildUnifiedBirthDraft(form: SajuOnboardingDraft): UnifiedBirthEntryDraft {
  return {
    calendarType: form.calendarType,
    timeRule: form.timeRule,
    year: form.year,
    month: form.month,
    day: form.day,
    hour: form.hour,
    minute: form.minute,
    unknownBirthTime: form.hour === '',
    gender: form.gender,
    birthLocationCode: form.birthLocationCode,
    birthLocationLabel: form.birthLocationLabel,
    birthLatitude: form.birthLatitude,
    birthLongitude: form.birthLongitude,
  };
}

function applyUnifiedBirthPatch(
  current: SajuOnboardingDraft,
  patch: Partial<UnifiedBirthEntryDraft>
): SajuOnboardingDraft {
  const next: SajuOnboardingDraft = {
    ...current,
    calendarType: patch.calendarType ?? current.calendarType,
    timeRule: patch.timeRule ?? current.timeRule,
    year: patch.year ?? current.year,
    month: patch.month ?? current.month,
    day: patch.day ?? current.day,
    hour: patch.hour ?? current.hour,
    minute: patch.minute ?? current.minute,
    gender: patch.gender ?? current.gender,
    birthLocationCode: patch.birthLocationCode ?? current.birthLocationCode,
    birthLocationLabel: patch.birthLocationLabel ?? current.birthLocationLabel,
    birthLatitude: patch.birthLatitude ?? current.birthLatitude,
    birthLongitude: patch.birthLongitude ?? current.birthLongitude,
  };

  if (patch.unknownBirthTime === true || next.hour === '') {
    next.hour = '';
    next.minute = '';
  }

  next.jasiMethod = next.timeRule === 'earlyZi' ? 'split' : 'unified';
  next.solarTimeMode =
    next.timeRule === 'trueSolarTime' && next.birthLocationCode ? 'longitude' : 'standard';

  return next;
}

function hasValidBirth(form: SajuOnboardingDraft) {
  return resolveUnifiedBirthInput(buildUnifiedBirthDraft(form), {
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
  const locationLabel = profile.birthLocationLabel
    ? ` · ${profile.birthLocationLabel}${profile.solarTimeMode === 'longitude' ? ' 경도 보정' : ''}`
    : '';
  return `${dateLabel} · ${hourLabel} · ${genderLabel}${locationLabel}`;
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
      birthLocationCode: data.profile.birthLocationCode ?? '',
      birthLocationLabel: data.profile.birthLocationLabel ?? '',
      birthLatitude: data.profile.birthLatitude,
      birthLongitude: data.profile.birthLongitude,
      solarTimeMode: data.profile.solarTimeMode ?? 'standard',
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
      birthLocationCode: profile.birthLocationCode ?? '',
      birthLocationLabel: profile.birthLocationLabel ?? '',
      birthLatitude: profile.birthLatitude,
      birthLongitude: profile.birthLongitude,
      solarTimeMode: profile.solarTimeMode ?? 'standard',
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
  const [form, setForm] = useState<SajuOnboardingDraft>(createInitialOnboardingDraft());
  const [isHydrated, setIsHydrated] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedProfileOptions, setSavedProfileOptions] = useState<SavedBirthProfile[]>([]);
  const [profileLoadStatus, setProfileLoadStatus] = useState<ProfileLoadStatus>('idle');
  const [profileLoadMessage, setProfileLoadMessage] = useState('');
  const [locationSearchStatus, setLocationSearchStatus] = useState<LocationSearchStatus>('idle');
  const [locationSearchMessage, setLocationSearchMessage] = useState('');
  const [locationSearchResults, setLocationSearchResults] = useState<BirthLocationSearchResult[]>([]);
  const [showOptionalDetails, setShowOptionalDetails] = useState(false);
  const hasTrackedStartRef = useRef(false);
  const hasTrackedBirthStartRef = useRef(false);
  const honorific = useMemo(() => getHonorificLabel(form.nickname), [form.nickname]);
  const selectedToneLabel = useMemo(
    () => ONBOARDING_TONE_OPTIONS.find((option) => option.value === form.tone)?.label ?? '정중하게',
    [form.tone]
  );
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

    if (step === 'birth' && !hasTrackedStartRef.current) {
      trackMoonlightEvent('saju_start_viewed', {
        from: 'saju-new',
      });
      hasTrackedStartRef.current = true;
    }

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

  function markBirthStarted(source: 'manual' | 'profile') {
    if (hasTrackedBirthStartRef.current) return;
    trackMoonlightEvent('birth_form_started', {
      from: 'saju-new',
      source,
    });
    hasTrackedBirthStartRef.current = true;
  }

  function updateField<K extends Exclude<keyof SajuOnboardingDraft, 'consents'>>(
    field: K,
    value: SajuOnboardingDraft[K]
  ) {
    if (step === 'birth') {
      markBirthStarted('manual');
    }
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateBirthLocation(code: string) {
    markBirthStarted('manual');
    const preset = BIRTH_LOCATION_PRESETS.find((item) => item.code === code);
    setForm((current) =>
      applyUnifiedBirthPatch(current, {
        birthLocationCode: code,
        birthLocationLabel:
          code === 'custom' ? current.birthLocationLabel : preset?.label ?? '',
        birthLatitude:
          code === 'custom' ? current.birthLatitude : preset ? String(preset.latitude) : '',
        birthLongitude:
          code === 'custom' ? current.birthLongitude : preset ? String(preset.longitude) : '',
      })
    );
    setLocationSearchStatus('idle');
    setLocationSearchMessage('');
    setLocationSearchResults([]);
  }

  async function searchBirthLocationCoordinates() {
    markBirthStarted('manual');
    const query = form.birthLocationLabel.trim();
    if (query.length < 2) {
      setLocationSearchStatus('error');
      setLocationSearchMessage('지역명을 두 글자 이상 입력해 주세요.');
      setLocationSearchResults([]);
      return;
    }

    setLocationSearchStatus('loading');
    setLocationSearchMessage('');
    setLocationSearchResults([]);

    try {
      const response = await fetch(`/api/geo/birth-location?q=${encodeURIComponent(query)}`, {
        cache: 'force-cache',
      });
      const data = (await response.json().catch(() => null)) as BirthLocationSearchResponse | null;

      if (!response.ok || !data?.ok) {
        setLocationSearchStatus('error');
        setLocationSearchMessage(data?.error ?? '지역 좌표를 찾지 못했습니다.');
        return;
      }

      const items = data.items ?? [];
      setLocationSearchResults(items);
      setLocationSearchStatus(items.length > 0 ? 'ready' : 'empty');
      setLocationSearchMessage(
        items.length > 0
          ? '가장 가까운 지역을 골라 위도와 경도를 적용해 주세요.'
          : '검색 결과가 없습니다. 시/군/구 이름이나 영문 지명을 함께 입력해 보세요.'
      );
    } catch {
      setLocationSearchStatus('error');
      setLocationSearchMessage('지역 좌표를 찾는 중 네트워크 오류가 발생했습니다.');
    }
  }

  function applyBirthLocationSearchResult(result: BirthLocationSearchResultLike) {
    markBirthStarted('manual');
    setForm((current) =>
      applyUnifiedBirthPatch(current, {
        birthLocationCode: 'custom',
        birthLocationLabel: result.label,
        birthLatitude: String(result.latitude),
        birthLongitude: String(result.longitude),
      })
    );
    setLocationSearchStatus('ready');
    setLocationSearchMessage(`${result.label} 좌표를 적용했습니다.`);
    setLocationSearchResults([]);
  }

  function applySavedProfile(profile: SavedBirthProfile) {
    markBirthStarted('profile');
    setForm((current) => ({
      ...current,
      calendarType: 'solar',
      timeRule: profile.solarTimeMode === 'longitude' ? 'trueSolarTime' : 'standard',
      year: String(profile.birthYear),
      month: String(profile.birthMonth),
      day: String(profile.birthDay),
      hour: profile.birthHour === null ? '' : String(profile.birthHour),
      minute:
        profile.birthHour === null || profile.birthMinute === null
          ? ''
          : String(profile.birthMinute),
      birthLocationCode: profile.birthLocationCode,
      birthLocationLabel: profile.birthLocationLabel,
      birthLatitude: profile.birthLatitude === null ? '' : String(profile.birthLatitude),
      birthLongitude: profile.birthLongitude === null ? '' : String(profile.birthLongitude),
      solarTimeMode: profile.birthLocationCode ? profile.solarTimeMode : 'standard',
      jasiMethod: 'unified',
      gender: profile.gender ?? '',
      nickname: profile.nickname || current.nickname,
      loadedProfileSource: profile.source,
    }));
    setErrorMessage('');
    setProfileLoadMessage(
      profile.source === 'family'
        ? `${profile.label} 가족 프로필을 불러왔습니다. 결과를 열어도 내 정보는 바뀌지 않습니다.`
        : `${profile.label} 정보를 입력칸에 불러왔습니다.`
    );
  }

  function validateBirthStep() {
    const parsed = resolveUnifiedBirthInput(buildUnifiedBirthDraft(form), {
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

    const parsed = resolveUnifiedBirthInput(buildUnifiedBirthDraft(form), {
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

      trackMoonlightEvent('birth_form_completed', {
        from: 'saju-new',
        sourceSessionId: data.id,
        calendarType: form.calendarType,
        timeRule: form.timeRule,
        unknownBirthTime: parsed.input.unknownTime,
      });

      clearOnboardingDraft();
      if (shouldAutoSavePersonalProfile(form.loadedProfileSource)) {
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
            birthLocationCode: parsed.input.birthLocation?.code ?? null,
            birthLocationLabel: parsed.input.birthLocation?.label ?? '',
            birthLatitude: parsed.input.birthLocation?.latitude ?? null,
            birthLongitude: parsed.input.birthLocation?.longitude ?? null,
            solarTimeMode: parsed.input.solarTimeMode ?? 'standard',
            gender: parsed.input.gender ?? null,
          }),
        }).catch(() => undefined);
      }

      router.push(`/saju/${data.id}?from=saju-new`);
    } catch {
      const fallbackId = toSlug(parsed.input);
      trackMoonlightEvent('birth_form_completed', {
        from: 'saju-new',
        sourceSessionId: fallbackId,
        calendarType: form.calendarType,
        timeRule: form.timeRule,
        unknownBirthTime: parsed.input.unknownTime,
      });
      router.push(`/saju/${fallbackId}?from=saju-new`);
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
              {stepMeta.tone === 'single' ? (
                <Badge className="border-[var(--app-gold)]/28 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]">
                  바로 시작
                </Badge>
              ) : (
                <StepIndicator active={stepMeta.active} />
              )}
              <Badge className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]">
                {stepMeta.count}
              </Badge>
            </div>

            {step === 'birth' ? (
              <>
                <h1 className="mt-6 font-[var(--font-heading)] text-3xl leading-[1.35] text-[var(--app-ivory)] sm:text-4xl">
                  내 사주를 보려면 출생 정보를 알려주세요
                </h1>
                <p className="mt-4 text-sm leading-7 text-[var(--app-copy)]">
                  오늘운세처럼 바로 시작합니다. 양력·음력, 태어난 시간, 출생지를 입력하시면 먼저 기본 해석으로 이어지고, 필요하실 때만 심층 리포트로 넓혀보실 수 있습니다.
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
                          href="/login?next=/saju/new"
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

                <div className="mt-8">
                  <UnifiedBirthInfoFields
                    draft={buildUnifiedBirthDraft(form)}
                    onChange={(patch) => setForm((current) => applyUnifiedBirthPatch(current, patch))}
                    onStarted={() => markBirthStarted('manual')}
                    locationLoading={locationSearchStatus === 'loading'}
                    locationMessage={locationSearchMessage}
                    locationResults={locationSearchResults}
                    onLocationSearch={searchBirthLocationCoordinates}
                    onPresetSelect={updateBirthLocation}
                    onLocationResultSelect={applyBirthLocationSearchResult}
                  />
                </div>

                <div className="mt-4 rounded-[1.15rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-4 text-sm leading-7 text-[var(--app-copy-muted)]">
                  시주가 필요한 세부 해석은 태어난 시간이 있을수록 정밀해지고, 출생지를 넣으면 진태양시 판단까지 더 정확해집니다. 시간이 없더라도 일간, 월령, 현재 운을 중심으로 기본 해석은 계속 이어집니다.
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-[1.25rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-5">
                    <div className="app-caption">선택 사항</div>
                    <div className="mt-2 flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-semibold text-[var(--app-ivory)]">
                          호칭과 말투는 지금 건너뛰셔도 됩니다
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-[var(--app-copy-muted)]">
                          기본 해석을 먼저 보고, 마음에 드시면 MY나 대화에서 더 자연스럽게 이어갈 수 있게 저장해둘 수 있습니다.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowOptionalDetails((current) => !current)}
                        className="inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface)] px-4 py-2 text-sm text-[var(--app-copy)] transition-colors hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]"
                      >
                        {showOptionalDetails ? '접기' : '선택 설정 열기'}
                      </button>
                    </div>

                    {showOptionalDetails ? (
                      <div className="mt-5">
                        <div>
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

                        <div className="mt-5">
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
                          <div className="mt-4 rounded-[1.25rem] border border-[var(--app-line)] bg-[var(--app-surface)] px-4 py-4 text-sm leading-7 text-[var(--app-copy)]">
                            “{tonePreview}”
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-5 rounded-[1.15rem] border border-[var(--app-line)] bg-[var(--app-surface)] px-4 py-4 text-sm leading-7 text-[var(--app-copy-muted)]">
                        {form.nickname.trim()
                          ? `${honorific} 기준으로 ${selectedToneLabel} 말투가 준비돼 있습니다. 지금은 기본 해석을 먼저 열고, 필요하실 때 다시 다듬으셔도 됩니다.`
                          : '지금은 기본 해석을 먼저 여는 데 집중하고, 나중에 필요하실 때 호칭과 말투를 편하게 정하셔도 됩니다.'}
                      </div>
                    )}
                  </div>

                  <div className="rounded-[1.25rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-5">
                    <div className="app-caption">필수 확인</div>
                    <h2 className="mt-2 text-lg font-semibold text-[var(--app-ivory)]">
                      결과를 만들기 전 필요한 안내만 짧게 확인합니다
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[var(--app-copy-muted)]">
                      기본 해석을 먼저 확인하고, 더 필요한 부분만 심층 리포트로 이어지는 구조입니다.
                    </p>
                    <div className="mt-5 space-y-3">
                      {ONBOARDING_CONSENTS.map((item) => (
                        <label
                          key={item.title}
                          className="flex items-start gap-3 rounded-[1.1rem] border border-[var(--app-line)] bg-[var(--app-surface)] px-4 py-4"
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

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <Link
                        href="/today-fortune"
                        className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface)] px-6 text-sm text-[var(--app-copy)] transition-colors hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]"
                      >
                        오늘운세 먼저 보기
                      </Link>
                      <Button
                        onClick={() => {
                          if (validateBirthStep()) {
                            void submit();
                          }
                        }}
                        disabled={isSubmitting}
                        className="h-12 rounded-full bg-[var(--app-gold)] px-6 text-sm font-semibold text-[#111827] hover:bg-[#e3c68d]"
                      >
                        {isSubmitting ? '기본 해석 준비 중...' : '내 사주 기본 해석 보기'}
                      </Button>
                    </div>
                    <p className="mt-4 text-xs leading-6 text-[var(--app-copy-soft)]">
                      입력하신 정보는 암호화 저장되며, 외부에 공유되지 않습니다.
                    </p>
                  </div>
                </div>
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
