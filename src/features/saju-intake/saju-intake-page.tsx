'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ActionCluster } from '@/components/layout/action-cluster';
import { BulletList } from '@/components/layout/bullet-list';
import { FeatureCard } from '@/components/layout/feature-card';
import { ProductGrid } from '@/components/layout/product-grid';
import { SectionHeader } from '@/components/layout/section-header';
import { SectionSurface } from '@/components/layout/section-surface';
import { SupportRail } from '@/components/layout/support-rail';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  UnifiedBirthInfoFields,
  type BirthLocationSearchResultLike,
} from '@/components/saju/shared/unified-birth-info-fields';
import SiteHeader from '@/features/shared-navigation/site-header';
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
import { AppPage, AppShell, PageHero } from '@/shared/layout/app-shell';

export type OnboardingStep = 'empathy' | 'birth' | 'nickname' | 'consent';

const STEP_META: Record<
  Exclude<OnboardingStep, 'empathy'>,
  { count: string }
> = {
  birth: { count: '1 / 3' },
  nickname: { count: '2 / 3' },
  consent: { count: '3 / 3' },
};

const STEP_PATHS: Record<OnboardingStep, string> = {
  empathy: '/saju/new/empathy',
  birth: '/saju/new',
  nickname: '/saju/new/nickname',
  consent: '/saju/new/consent',
};

const EMPATHY_RAIL_POINTS = [
  '질문이 아직 흐릿해도 괜찮습니다. 마음에 걸리는 장면부터 시작하시면 됩니다.',
  '오늘의 흐름은 가볍게, 기준서는 오래 남는 질문을 위해 따로 열어 둡니다.',
  '출생 정보부터 받고, 호칭과 동의는 뒤 단계에서 짧게 정리합니다.',
] as const;

const BIRTH_RAIL_POINTS = [
  '태어난 시간을 모르셔도 기본 해석은 이어집니다.',
  '출생지를 넣으면 진태양시와 절기 경계를 더 안정적으로 읽을 수 있습니다.',
  '호칭과 말투, 필수 동의는 다음 단계에서 차분히 이어집니다.',
] as const;

const NICKNAME_RAIL_POINTS = [
  '본명이 아니어도 괜찮습니다. 결과와 보관함에서 편하게 불릴 이름이면 충분합니다.',
  '말투는 설명의 온도만 바꾸고, 명식과 판정 기준은 그대로 유지됩니다.',
  '다음 단계에서는 필요한 동의만 확인하고 바로 결과를 엽니다.',
] as const;

const CONSENT_RAIL_POINTS = [
  '결과 화면에서는 1분 요약, 판정 근거, 다음 행동 순서로 먼저 보게 됩니다.',
  '저장된 결과는 MY 보관함과 대화 흐름에 연결되어 다시 읽고 질문할 수 있습니다.',
  '시간이 불명확한 경우 시주 중심 해석은 보수적으로 낮춰 읽습니다.',
] as const;

const CONSENT_SUMMARY_POINTS = [
  '입력하신 출생 정보는 결과 생성과 저장을 위해 사용됩니다.',
  '의료·법률·투자·위기상황 판단은 전문 기준과 도움을 우선합니다.',
  '결과는 MY 보관함과 이후 대화 흐름에 연결될 수 있습니다.',
] as const;

interface ProfileApiBirthFields {
  calendarType: 'solar' | 'lunar';
  timeRule: 'standard' | 'trueSolarTime' | 'nightZi' | 'earlyZi';
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
  calendarType: 'solar' | 'lunar';
  timeRule: 'standard' | 'trueSolarTime' | 'nightZi' | 'earlyZi';
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
  const calendarLabel = profile.calendarType === 'lunar' ? '음력' : '양력';
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
  return `${calendarLabel} ${dateLabel} · ${hourLabel} · ${genderLabel}${locationLabel}`;
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
      calendarType: data.profile.calendarType ?? 'solar',
      timeRule: data.profile.timeRule ?? 'standard',
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
      calendarType: profile.calendarType ?? 'solar',
      timeRule: profile.timeRule ?? 'standard',
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
  const hasTrackedStartRef = useRef(false);
  const hasTrackedBirthStartRef = useRef(false);
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

    if (step === 'birth' && !hasTrackedStartRef.current) {
      trackMoonlightEvent('saju_start_viewed', {
        from: 'saju-new',
      });
      hasTrackedStartRef.current = true;
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
      calendarType: profile.calendarType,
      timeRule: profile.timeRule,
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
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-0">
      <AppPage className="space-y-6">
        {step === 'empathy' ? (
          <>
            <PageHero
              badges={[
                <Badge
                  key="entry"
                  className="border-[var(--app-gold)]/24 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]"
                >
                  사주 시작
                </Badge>,
                <Badge
                  key="guide"
                  className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]"
                >
                  입력 전 안내
                </Badge>,
              ]}
              title="기준서를 열기 전, 지금 마음에 닿는 질문부터 가볍게 정리합니다"
              description="문득 떠오른 걱정과 기대를 억지로 정리하지 않으셔도 됩니다. 달빛선생은 먼저 마음에 걸리는 장면을 확인하고, 그 다음에 기준서를 만드는 흐름으로 안내합니다."
            />

            <section className="grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
              <SectionSurface surface="lunar" size="lg">
                <div className="app-starfield" />
                <SectionHeader
                  eyebrow="이런 질문에서 시작합니다"
                  title="문득 이런 생각이 드실 때, 사주는 더 또렷한 기준이 됩니다"
                  titleClassName="text-3xl text-[var(--app-gold-text)]"
                  description="옛 어른들은 이럴 때 하늘의 흐름을 읽었습니다. 달빛선생은 그 마음을 곧바로 큰 판단으로 몰아가지 않고, 출생 정보와 현재의 질문을 함께 받아 차분한 해석으로 이어갑니다."
                  descriptionClassName="max-w-3xl text-[var(--app-copy)]"
                  actions={
                    <ActionCluster>
                      <Link href={STEP_PATHS.birth} className="moon-cta-primary">
                        출생 정보 입력하기
                      </Link>
                      <Link
                        href="/today-fortune"
                        className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-gold)]/30 bg-[var(--app-gold)]/12 px-5 text-sm text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/18"
                      >
                        오늘의 흐름 먼저 보기
                      </Link>
                    </ActionCluster>
                  }
                />

                <ProductGrid columns={3} className="mt-6">
                  {ONBOARDING_THOUGHTS.map((thought, index) => (
                    <FeatureCard
                      key={thought}
                      surface="soft"
                      eyebrow={`질문 ${String(index + 1).padStart(2, '0')}`}
                      description={`“${thought}”`}
                    />
                  ))}
                </ProductGrid>
              </SectionSurface>

              <SupportRail
                surface="panel"
                eyebrow="읽는 순서"
                title="지금은 질문을 눌러 담고, 다음 단계에서 기준의 바탕을 받습니다"
                description="입력은 출생 정보부터 시작하지만, 그 앞에서 무엇을 보려는지 잠깐 정리해 두면 결과 화면을 훨씬 덜 흔들리며 읽을 수 있습니다."
              >
                <BulletList items={EMPATHY_RAIL_POINTS} />
                <FeatureCard
                  className="mt-5"
                  surface="soft"
                  eyebrow="다음 단계"
                  title="출생 정보 입력"
                  description="양력·음력, 태어난 시간, 출생지를 받으면 결과 화면과 판정 근거, 이후 명리 기준서 흐름까지 자연스럽게 이어집니다."
                />
              </SupportRail>
            </section>
          </>
        ) : null}

        {stepMeta ? (
          <>
            <PageHero
              badges={[
                <Badge
                  key="count"
                  className="border-[var(--app-gold)]/24 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]"
                >
                  {stepMeta.count}
                </Badge>,
                <Badge
                  key="label"
                  className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]"
                >
                  {step === 'birth' ? '출생 정보' : step === 'nickname' ? '호칭과 말투' : '마지막 확인'}
                </Badge>,
              ]}
              title={
                step === 'birth'
                  ? '기준서의 바탕이 되는 출생 정보를 먼저 받습니다'
                  : step === 'nickname'
                    ? '결과와 보관함에서 선생님을 어떻게 불러드릴지 정합니다'
                    : '필수 안내만 짧게 확인하고 바로 결과를 엽니다'
              }
              description={
                step === 'birth'
                  ? '시간과 출생지를 함께 받을수록 명식의 바탕이 또렷해집니다. 시간이 불명확하면 시주 판단은 줄이고, 일간·월령·대운 중심으로 보수적으로 읽습니다.'
                  : step === 'nickname'
                    ? '본명이 아니어도 괜찮습니다. 익숙한 호칭과 편한 말투를 정해 두면 이후 결과와 대화 흐름이 더 자연스럽게 이어집니다.'
                    : '법으로 정해진 안내와 해석 생성에 필요한 동의만 간단히 정리했습니다. 길게 읽지 않으셔도 핵심은 한눈에 보이게 두었습니다.'
              }
            />

            {step === 'birth' ? (
              <section className="grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
                <SectionSurface surface="panel" size="lg" className="app-mobile-safe-section">
                  <SectionHeader
                    eyebrow="출생 정보"
                    title="저장된 프로필을 불러오거나, 지금 직접 입력하실 수 있습니다"
                    titleClassName="text-3xl"
                    description="처음이시면 바로 입력하셔도 되고, 저장된 프로필이 있으면 한 번에 불러와 더 빨리 시작하실 수 있습니다."
                    descriptionClassName="max-w-3xl text-[var(--app-copy)]"
                  />

                  <div className="mt-6">
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

                  <div className="mt-6 rounded-[1.2rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-4 sm:px-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="app-caption">저장된 정보로 빠르게 채우기</div>
                        <p className="mt-2 text-sm leading-6 text-[var(--app-copy-muted)]">
                          이미 저장된 내 정보나 가족 프로필이 있으면 아래에서 바로 불러오실 수 있습니다.
                        </p>
                      </div>
                      <Link href="/my/profile" className="app-top-action-link shrink-0">
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
                          아직 저장된 프로필이 없습니다. 이번 입력을 마치면 내 프로필에 자동 저장됩니다.
                        </div>
                      ) : null}

                      {profileLoadStatus === 'error' ? (
                        <div className="rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm leading-6 text-rose-100">
                          {profileLoadMessage}
                        </div>
                      ) : null}

                      {profileLoadStatus === 'ready' ? (
                        <ProductGrid columns={2} className="mt-1">
                          {savedProfileOptions.map((profile) => (
                            <button
                              key={profile.id}
                              type="button"
                              onClick={() => applySavedProfile(profile)}
                              className="app-feature-card-soft text-left transition-colors hover:border-[var(--app-gold)]/38 hover:bg-[var(--app-gold)]/8"
                            >
                              <div className="text-sm font-medium text-[var(--app-ivory)]">{profile.label}</div>
                              <div className="mt-2 text-xs leading-6 text-[var(--app-copy-muted)]">{profile.detail}</div>
                            </button>
                          ))}
                        </ProductGrid>
                      ) : null}

                      {profileLoadMessage && profileLoadStatus !== 'error' ? (
                        <p className="mt-3 text-xs leading-6 text-[var(--app-gold-text)]">{profileLoadMessage}</p>
                      ) : null}
                    </div>
                  </div>

                  <ActionCluster className="mt-6 sm:mt-8">
                    <Link
                      href={prevPath ?? STEP_PATHS.empathy}
                      className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-6 text-sm text-[var(--app-copy)] transition-colors hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]"
                    >
                      이전 안내 보기
                    </Link>
                    <Button
                      onClick={() => {
                        if (validateBirthStep() && nextPath) router.push(nextPath);
                      }}
                      className="h-12 rounded-full bg-[var(--app-gold)] px-6 text-sm font-semibold text-[#111827] hover:bg-[#e3c68d]"
                    >
                      다음 단계로
                    </Button>
                  </ActionCluster>
                </SectionSurface>

                <SupportRail
                  surface="lunar"
                  eyebrow="입력 가이드"
                  title="지금 단계에서는 기준의 바탕이 되는 정보만 정확히 받습니다"
                  description="호칭과 필수 동의는 뒤 단계로 넘기고, 지금은 명식과 시간 기준을 안정적으로 잡는 데 집중합니다."
                >
                  <BulletList items={BIRTH_RAIL_POINTS} />
                  <FeatureCard
                    className="mt-5"
                    surface="soft"
                    eyebrow="다음 단계"
                    title="호칭과 말투 정리"
                    description="결과 화면과 보관함, 이후 대화 흐름에서 선생님을 어떻게 부를지와 읽기 편한 말투를 가볍게 맞춥니다."
                  />
                </SupportRail>
              </section>
            ) : null}

            {step === 'nickname' ? (
              <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
                <SectionSurface surface="panel" size="lg">
                  <SectionHeader
                    eyebrow="호칭과 말투"
                    title="편한 이름과 설명의 온도만 정하면 됩니다"
                    titleClassName="text-3xl"
                    description="결과 화면, 보관함, 이후 대화에서 선생님을 어떻게 부를지 정하고, 읽기 좋은 말투를 골라 둡니다."
                    descriptionClassName="max-w-3xl text-[var(--app-copy)]"
                  />

                  <div className="mt-6">
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
                    <ProductGrid columns={3}>
                      {ONBOARDING_TONE_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => updateField('tone', option.value as OnboardingSpeechTone)}
                          className={cn(
                            'app-feature-card-soft text-left transition-colors',
                            form.tone === option.value
                              ? 'border-[var(--app-gold)]/40 bg-[var(--app-gold)]/12 text-[var(--app-gold-text)]'
                              : 'hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]'
                          )}
                        >
                          <div className="text-sm font-medium">{option.label}</div>
                          <div className="mt-2 text-xs leading-6">{option.description}</div>
                        </button>
                      ))}
                    </ProductGrid>

                    <FeatureCard
                      className="mt-5"
                      surface="muted"
                      eyebrow="미리 듣는 말투"
                      description={`“${tonePreview}”`}
                    />
                  </div>

                  <ActionCluster className="mt-8">
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
                      동의 확인으로
                    </Button>
                  </ActionCluster>
                </SectionSurface>

                <SupportRail
                  surface="panel"
                  eyebrow="설명 흐름"
                  title="말투는 바뀌어도 기준은 그대로 유지됩니다"
                  description="달빛선생은 명식과 판정 기준을 먼저 계산하고, 그 뒤에 선생님이 읽기 편한 말의 온도를 얹습니다."
                >
                  <BulletList items={NICKNAME_RAIL_POINTS} />
                  <FeatureCard
                    className="mt-5"
                    surface="soft"
                    eyebrow="현재 선택"
                    title={`${honorific} 기준`}
                    description={`${ONBOARDING_TONE_OPTIONS.find((option) => option.value === form.tone)?.label ?? '정중한'} 말투가 준비돼 있습니다.`}
                  />
                </SupportRail>
              </section>
            ) : null}

            {step === 'consent' ? (
              <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
                <SectionSurface surface="panel" size="lg">
                  <SectionHeader
                    eyebrow="필수 안내"
                    title="길게 읽지 않으셔도 핵심만 분명히 보이게 두었습니다"
                    titleClassName="text-3xl"
                    description="법으로 정해진 안내와 해석 생성에 필요한 동의만 간단히 정리했습니다. 필수 항목만 확인하면 바로 결과 화면으로 이어집니다."
                    descriptionClassName="max-w-3xl text-[var(--app-copy)]"
                  />

                  <div className="mt-6 space-y-3">
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

                  <ActionCluster className="mt-8">
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
                      {isSubmitting ? '결과 준비 중...' : '기본 해석 열기'}
                    </Button>
                  </ActionCluster>
                </SectionSurface>

                <SupportRail
                  surface="lunar"
                  eyebrow="결과 미리보기"
                  title="이 단계가 끝나면 바로 보게 되는 흐름입니다"
                  description="달빛선생 결과 화면은 긴 본문보다 먼저 핵심 요약과 판정 근거, 다음 행동을 보여주도록 정리되어 있습니다."
                >
                  <BulletList items={CONSENT_RAIL_POINTS} />
                  <FeatureCard
                    className="mt-5"
                    surface="soft"
                    eyebrow="짧은 확인"
                    title="입력 정보와 결과 활용"
                  >
                    <BulletList
                      items={CONSENT_SUMMARY_POINTS}
                      className="mt-0"
                      itemClassName="text-sm leading-7 text-[var(--app-copy)]"
                    />
                  </FeatureCard>
                </SupportRail>
              </section>
            ) : null}

            {errorMessage ? (
              <SectionSurface surface="muted" className="border border-[var(--app-coral)]/28 bg-[var(--app-coral)]/10">
                <p className="text-sm leading-7 text-[var(--app-ivory)]">{errorMessage}</p>
              </SectionSurface>
            ) : null}
          </>
        ) : null}
      </AppPage>
    </AppShell>
  );
}
