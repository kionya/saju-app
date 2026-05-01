'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ActionCluster } from '@/components/layout/action-cluster';
import { BulletList } from '@/components/layout/bullet-list';
import { FeatureCard } from '@/components/layout/feature-card';
import { ProductGrid } from '@/components/layout/product-grid';
import { SectionHeader } from '@/components/layout/section-header';
import { SectionSurface } from '@/components/layout/section-surface';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  UnifiedBirthInfoFields,
  type BirthLocationSearchResultLike,
  type UnifiedBirthInfoSection,
} from '@/components/saju/shared/unified-birth-info-fields';
import SiteHeader from '@/features/shared-navigation/site-header';
import { ONBOARDING_CONSENTS } from '@/content/moonlight';
import { BIRTH_LOCATION_PRESETS } from '@/lib/saju/birth-location';
import { toSlug } from '@/lib/saju/pillars';
import { cn } from '@/lib/utils';
import {
  clearOnboardingDraft,
  createInitialOnboardingDraft,
  hasAcceptedRequiredConsents,
  loadOnboardingDraft,
  saveAcceptedRequiredConsents,
  saveOnboardingDraft,
  shouldAutoSavePersonalProfile,
  type SajuOnboardingDraft,
} from './onboarding-storage';
import { resolveUnifiedBirthInput, type UnifiedBirthEntryDraft } from '@/lib/saju/unified-birth-entry';
import { trackMoonlightEvent } from '@/lib/analytics';
import { AppPage, AppShell, PageHero } from '@/shared/layout/app-shell';

export type OnboardingStep = 'empathy' | 'birth' | 'nickname' | 'consent';
type SwipeStepId = 'date' | 'gender' | 'location' | 'consent';
type ProfileLoadStatus = 'idle' | 'loading' | 'ready' | 'anonymous' | 'empty' | 'error';
type LocationSearchStatus = 'idle' | 'loading' | 'ready' | 'empty' | 'error';

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

const BASE_STEPS: Array<{
  id: Exclude<SwipeStepId, 'consent'>;
  eyebrow: string;
  title: string;
  description: string;
  section: UnifiedBirthInfoSection;
}> = [
  {
    id: 'date',
    eyebrow: '생년월일',
    title: '먼저 태어난 날짜를 고릅니다',
    description: '양력과 음력을 먼저 정하고, 연·월·일을 셀렉트 박스로 차례대로 선택합니다.',
    section: 'date',
  },
  {
    id: 'gender',
    eyebrow: '성별',
    title: '다음으로 성별을 선택합니다',
    description: '사주 결과에 필요한 기본 구분만 받습니다. 말투 선택은 결과 화면에서 남선생·여선생으로 고릅니다.',
    section: 'gender',
  },
  {
    id: 'location',
    eyebrow: '출생지와 시간',
    title: '마지막으로 출생지와 시간을 맞춥니다',
    description: '출생지는 진태양시와 시간 보정에 쓰입니다. 시간을 모르면 시간 모름으로 진행할 수 있습니다.',
    section: 'location-time',
  },
];

const CONSENT_STEP = {
  id: 'consent' as const,
  eyebrow: '동의',
  title: '필수 동의만 확인하면 바로 결과로 이어집니다',
  description: '한 번 동의하면 같은 필수 항목이 유지되는 동안 다음 입력부터는 다시 표시하지 않습니다.',
};

const STEP_HINTS = [
  '화면을 좌우로 넘기듯 한 단계씩 입력합니다.',
  '결과 문체는 사주풀이 화면에서 남선생·여선생으로 고릅니다.',
  '동의는 한 번 저장되면 다음 입력부터 자동으로 건너뜁니다.',
] as const;

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
  const genderLabel =
    profile.gender === 'male' ? '남성' : profile.gender === 'female' ? '여성' : '성별 미선택';
  const locationLabel = profile.birthLocationLabel
    ? ` · ${profile.birthLocationLabel}${profile.solarTimeMode === 'longitude' ? ' 진태양시' : ''}`
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

export default function SajuIntakePage({ step: _step }: { step?: OnboardingStep }) {
  const router = useRouter();
  const [form, setForm] = useState<SajuOnboardingDraft>(createInitialOnboardingDraft());
  const [isHydrated, setIsHydrated] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [savedProfileOptions, setSavedProfileOptions] = useState<SavedBirthProfile[]>([]);
  const [profileLoadStatus, setProfileLoadStatus] = useState<ProfileLoadStatus>('idle');
  const [profileLoadMessage, setProfileLoadMessage] = useState('');
  const [locationSearchStatus, setLocationSearchStatus] = useState<LocationSearchStatus>('idle');
  const [locationSearchMessage, setLocationSearchMessage] = useState('');
  const [locationSearchResults, setLocationSearchResults] = useState<BirthLocationSearchResult[]>([]);
  const touchStartXRef = useRef<number | null>(null);
  const hasTrackedStartRef = useRef(false);
  const hasTrackedBirthStartRef = useRef(false);

  const steps = useMemo(
    () => (consentAccepted ? BASE_STEPS : [...BASE_STEPS, CONSENT_STEP]),
    [consentAccepted]
  );
  const activeStep = steps[activeIndex] ?? steps[0];
  const progressLabel = `${activeIndex + 1} / ${steps.length}`;

  useEffect(() => {
    const draft = loadOnboardingDraft();
    setForm(draft);
    setConsentAccepted(hasAcceptedRequiredConsents());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    saveOnboardingDraft(form);
  }, [form, isHydrated]);

  useEffect(() => {
    if (!isHydrated || hasTrackedStartRef.current) return;
    trackMoonlightEvent('saju_start_viewed', {
      from: 'saju-new',
      layout: 'swipe',
    });
    hasTrackedStartRef.current = true;
  }, [isHydrated]);

  useEffect(() => {
    if (activeIndex < steps.length) return;
    setActiveIndex(Math.max(0, steps.length - 1));
  }, [activeIndex, steps.length]);

  useEffect(() => {
    if (!isHydrated) return;

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
  }, [isHydrated]);

  function markBirthStarted(source: 'manual' | 'profile') {
    if (hasTrackedBirthStartRef.current) return;
    trackMoonlightEvent('birth_form_started', {
      from: 'saju-new',
      source,
      layout: 'swipe',
    });
    hasTrackedBirthStartRef.current = true;
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
    setActiveIndex(0);
  }

  function validateDateStep() {
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

  function validateGenderStep() {
    if (form.gender !== 'male' && form.gender !== 'female') {
      setErrorMessage('성별을 선택해 주세요.');
      return false;
    }

    setErrorMessage('');
    return true;
  }

  function validateLocationStep() {
    if (!form.birthLocationCode) {
      setErrorMessage('출생지를 선택하거나 지역명을 검색해 좌표를 적용해 주세요.');
      return false;
    }

    const parsed = resolveUnifiedBirthInput(buildUnifiedBirthDraft(form), {
      requireGender: true,
    });

    if (!parsed.ok) {
      setErrorMessage(parsed.error);
      return false;
    }

    setErrorMessage('');
    return true;
  }

  function validateConsentStep() {
    const requiredConsentMissing = ONBOARDING_CONSENTS.some(
      (item) => item.required && !form.consents[item.title]
    );

    if (requiredConsentMissing) {
      setErrorMessage('필수 동의 항목을 확인해 주세요.');
      return false;
    }

    setErrorMessage('');
    return true;
  }

  async function submit() {
    if (!consentAccepted && !validateConsentStep()) return;

    const parsed = resolveUnifiedBirthInput(buildUnifiedBirthDraft(form), {
      requireGender: true,
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

      if (!consentAccepted) {
        saveAcceptedRequiredConsents();
        setConsentAccepted(true);
      }

      trackMoonlightEvent('birth_form_completed', {
        from: 'saju-new',
        sourceSessionId: data.id,
        calendarType: form.calendarType,
        timeRule: form.timeRule,
        unknownBirthTime: parsed.input.unknownTime,
        layout: 'swipe',
      });

      clearOnboardingDraft();
      if (shouldAutoSavePersonalProfile(form.loadedProfileSource)) {
        void fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            displayName: form.nickname.trim() || '나',
            calendarType: form.calendarType,
            timeRule: form.timeRule,
            unknownBirthTime: parsed.input.unknownTime,
            birthYear: parsed.input.year,
            birthMonth: parsed.input.month,
            birthDay: parsed.input.day,
            birthHour: parsed.input.hour ?? null,
            birthMinute: parsed.input.minute ?? null,
            birthLocationCode:
              parsed.input.birthLocation?.code ?? form.birthLocationCode ?? null,
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
      if (!consentAccepted) {
        saveAcceptedRequiredConsents();
        setConsentAccepted(true);
      }
      trackMoonlightEvent('birth_form_completed', {
        from: 'saju-new',
        sourceSessionId: fallbackId,
        calendarType: form.calendarType,
        timeRule: form.timeRule,
        unknownBirthTime: parsed.input.unknownTime,
        layout: 'swipe',
      });
      router.push(`/saju/${fallbackId}?from=saju-new`);
    } finally {
      setIsSubmitting(false);
    }
  }

  function goNext() {
    if (activeStep.id === 'date' && !validateDateStep()) return;
    if (activeStep.id === 'gender' && !validateGenderStep()) return;
    if (activeStep.id === 'location' && !validateLocationStep()) return;

    if (activeStep.id === 'location' && consentAccepted) {
      void submit();
      return;
    }

    if (activeStep.id === 'consent') {
      void submit();
      return;
    }

    setActiveIndex((current) => Math.min(current + 1, steps.length - 1));
  }

  function goPrev() {
    setErrorMessage('');
    setActiveIndex((current) => Math.max(0, current - 1));
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    const start = touchStartXRef.current;
    touchStartXRef.current = null;
    if (start === null) return;

    const delta = event.changedTouches[0]?.clientX - start;
    if (Math.abs(delta) < 54) return;
    if (delta < 0) goNext();
    if (delta > 0) goPrev();
  }

  const nextLabel =
    activeStep.id === 'location' && consentAccepted
      ? isSubmitting
        ? '결과 준비 중...'
        : '사주풀이 열기'
      : activeStep.id === 'consent'
        ? isSubmitting
          ? '결과 준비 중...'
          : '동의하고 사주풀이 열기'
        : '다음 화면';

  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-0">
      <AppPage className="space-y-6">
        <PageHero
          badges={[
            <Badge
              key="count"
              className="border-[var(--app-gold)]/24 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]"
            >
              {progressLabel}
            </Badge>,
            <Badge
              key="layout"
              className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]"
            >
              옆으로 넘기는 입력
            </Badge>,
          ]}
          title="한 화면씩 넘기며 사주 정보를 입력합니다"
          description="생년월일, 성별, 출생지와 시간을 차례대로 받습니다. 남선생·여선생 말투 선택은 사주풀이 결과 화면에서만 고르도록 분리했습니다."
        />

        <section className="grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
          <SectionSurface surface="panel" size="lg" className="overflow-hidden">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                {steps.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (index <= activeIndex) {
                        setActiveIndex(index);
                        setErrorMessage('');
                      }
                    }}
                    className={cn(
                      'h-2.5 rounded-full transition-all',
                      index === activeIndex
                        ? 'w-10 bg-[var(--app-gold)]'
                        : index < activeIndex
                          ? 'w-5 bg-[var(--app-gold)]/48'
                          : 'w-5 bg-[var(--app-line)]'
                    )}
                    aria-label={`${index + 1}단계 ${item.eyebrow}`}
                  />
                ))}
              </div>
              {consentAccepted ? (
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--app-jade)]/25 bg-[var(--app-jade)]/10 px-3 py-1 text-xs text-[var(--app-jade)]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  동의 저장됨
                </span>
              ) : null}
            </div>

            <div
              className="overflow-hidden"
              onTouchStart={(event) => {
                touchStartXRef.current = event.touches[0]?.clientX ?? null;
              }}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="flex transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
              >
                {steps.map((item) => (
                  <div key={item.id} className="w-full shrink-0">
                    <SectionHeader
                      eyebrow={item.eyebrow}
                      title={item.title}
                      titleClassName="text-3xl"
                      description={item.description}
                      descriptionClassName="max-w-3xl text-[var(--app-copy)]"
                    />

                    {item.id === 'consent' ? (
                      <div className="mt-6 space-y-3">
                        {ONBOARDING_CONSENTS.map((consent) => (
                          <label
                            key={consent.title}
                            className="flex items-start gap-3 rounded-[1.25rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-4"
                          >
                            <input
                              type="checkbox"
                              checked={form.consents[consent.title]}
                              onChange={(event) =>
                                setForm((current) => ({
                                  ...current,
                                  consents: {
                                    ...current.consents,
                                    [consent.title]: event.target.checked,
                                  },
                                }))
                              }
                              className="mt-1 h-4 w-4 rounded border-[var(--app-line)] bg-transparent accent-[var(--app-gold)]"
                            />
                            <span className="min-w-0">
                              <span className="flex items-center gap-2 text-sm font-medium text-[var(--app-ivory)]">
                                {consent.title}
                                <span
                                  className={cn(
                                    'rounded-full border px-2 py-0.5 text-[10px]',
                                    consent.required
                                      ? 'border-[var(--app-coral)]/28 bg-[var(--app-coral)]/10 text-[var(--app-coral)]'
                                      : 'border-[var(--app-gold)]/28 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]'
                                  )}
                                >
                                  {consent.required ? '필수' : '선택'}
                                </span>
                              </span>
                              <span className="mt-2 block text-xs leading-6 text-[var(--app-copy-muted)]">
                                {consent.detail}
                              </span>
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-6">
                        <UnifiedBirthInfoFields
                          draft={buildUnifiedBirthDraft(form)}
                          onChange={(patch) => setForm((current) => applyUnifiedBirthPatch(current, patch))}
                          onStarted={() => markBirthStarted('manual')}
                          dateInputVariant="select"
                          visibleSections={[item.section]}
                          locationLoading={locationSearchStatus === 'loading'}
                          locationMessage={locationSearchMessage}
                          locationResults={locationSearchResults}
                          onLocationSearch={searchBirthLocationCoordinates}
                          onPresetSelect={updateBirthLocation}
                          onLocationResultSelect={applyBirthLocationSearchResult}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {errorMessage ? (
              <div className="mt-6 rounded-[1.2rem] border border-[var(--app-coral)]/28 bg-[var(--app-coral)]/10 px-4 py-3 text-sm leading-7 text-[var(--app-ivory)]">
                {errorMessage}
              </div>
            ) : null}

            <ActionCluster className="mt-8">
              <Button
                type="button"
                onClick={goPrev}
                disabled={activeIndex === 0 || isSubmitting}
                variant="outline"
                className="h-12 rounded-full border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 text-sm text-[var(--app-copy)] hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)] disabled:opacity-45"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                이전
              </Button>
              <Button
                type="button"
                onClick={goNext}
                disabled={isSubmitting}
                className="h-12 rounded-full bg-[var(--app-gold)] px-6 text-sm font-semibold text-[#111827] hover:bg-[#e3c68d]"
              >
                {nextLabel}
                {!isSubmitting ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
              </Button>
            </ActionCluster>
          </SectionSurface>

          <SectionSurface surface="lunar" size="lg">
            <div className="app-starfield" />
            <SectionHeader
              eyebrow="입력 가이드"
              title="사주풀이 화면으로 가기 전 필요한 정보만 받습니다"
              titleClassName="text-3xl text-[var(--app-gold-text)]"
              description="설명 말투는 결과 화면에서 고르게 하고, 입력 단계에서는 계산에 필요한 정보와 필수 동의만 남겼습니다."
            />
            <BulletList items={STEP_HINTS} className="mt-6" />

            <div className="mt-6 rounded-[1.2rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="app-caption">저장된 정보</div>
                  <p className="mt-2 text-sm leading-6 text-[var(--app-copy-muted)]">
                    내 정보나 가족 프로필이 있으면 한 번에 불러올 수 있습니다.
                  </p>
                </div>
                <Link href="/my/profile" className="app-top-action-link shrink-0">
                  프로필 관리
                </Link>
              </div>

              <div className="mt-4">
                {profileLoadStatus === 'loading' ? (
                  <p className="text-sm text-[var(--app-copy-muted)]">저장된 정보를 확인하고 있습니다.</p>
                ) : null}

                {profileLoadStatus === 'anonymous' ? (
                  <div className="flex flex-col gap-3 text-sm leading-6 text-[var(--app-copy-muted)] sm:flex-row sm:items-center sm:justify-between">
                    <span>로그인하면 저장해 둔 정보를 바로 불러올 수 있습니다.</span>
                    <Link
                      href="/login?next=/saju/new"
                      className="inline-flex h-9 shrink-0 items-center justify-center rounded-full border border-[var(--app-gold)]/30 bg-[var(--app-gold)]/10 px-4 text-sm text-[var(--app-gold-text)]"
                    >
                      로그인
                    </Link>
                  </div>
                ) : null}

                {profileLoadStatus === 'empty' ? (
                  <p className="text-sm leading-6 text-[var(--app-copy-muted)]">
                    아직 저장된 프로필이 없습니다. 이번 입력을 마치면 내 정보에 저장됩니다.
                  </p>
                ) : null}

                {profileLoadStatus === 'error' ? (
                  <p className="text-sm leading-6 text-rose-100">{profileLoadMessage}</p>
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

            <FeatureCard
              className="mt-6"
              surface="soft"
              eyebrow="말투 선택"
              title="결과 화면에서 남선생·여선생으로 선택합니다"
              description="입력 중에는 말투 선택을 묻지 않습니다. 같은 명식 근거를 결과 화면에서 두 선생의 말결로 비교할 수 있습니다."
            />
          </SectionSurface>
        </section>
      </AppPage>
    </AppShell>
  );
}
