'use client';

import { ONBOARDING_CONSENTS } from '@/content/moonlight';

export type OnboardingSpeechTone = 'friendly' | 'polite' | 'standard';
export type OnboardingProfileSource = 'manual' | 'self' | 'family';

export interface SajuOnboardingDraft {
  calendarType: 'solar' | 'lunar';
  timeRule: 'standard' | 'trueSolarTime' | 'nightZi' | 'earlyZi';
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  jasiMethod: 'split' | 'unified';
  birthLocationCode: string;
  birthLocationLabel: string;
  birthLatitude: string;
  birthLongitude: string;
  solarTimeMode: 'standard' | 'longitude';
  gender: string;
  nickname: string;
  loadedProfileSource: OnboardingProfileSource;
  tone: OnboardingSpeechTone;
  consents: Record<string, boolean>;
}

export const ONBOARDING_STORAGE_KEY = 'moonlight:saju-onboarding-draft';

function createConsentState() {
  return Object.fromEntries(
    ONBOARDING_CONSENTS.map((item) => [item.title, item.required])
  ) as Record<string, boolean>;
}

export function createInitialOnboardingDraft(): SajuOnboardingDraft {
  return {
    calendarType: 'solar',
    timeRule: 'standard',
    year: '',
    month: '',
    day: '',
    hour: '',
    minute: '',
    jasiMethod: 'unified',
    birthLocationCode: '',
    birthLocationLabel: '',
    birthLatitude: '',
    birthLongitude: '',
    solarTimeMode: 'standard',
    gender: '',
    nickname: '',
    loadedProfileSource: 'manual',
    tone: 'polite',
    consents: createConsentState(),
  };
}

function mergeConsentState(value: unknown) {
  const fallback = createConsentState();
  if (!value || typeof value !== 'object') return fallback;

  const incoming = value as Record<string, unknown>;
  return Object.fromEntries(
    ONBOARDING_CONSENTS.map((item) => [item.title, typeof incoming[item.title] === 'boolean' ? incoming[item.title] : item.required])
  ) as Record<string, boolean>;
}

export function loadOnboardingDraft(): SajuOnboardingDraft {
  if (typeof window === 'undefined') {
    return createInitialOnboardingDraft();
  }

  try {
    const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) return createInitialOnboardingDraft();

    const parsed = JSON.parse(raw) as Partial<SajuOnboardingDraft>;
    return {
      calendarType: parsed.calendarType === 'lunar' ? 'lunar' : 'solar',
      timeRule:
        parsed.timeRule === 'trueSolarTime' ||
        parsed.timeRule === 'nightZi' ||
        parsed.timeRule === 'earlyZi'
          ? parsed.timeRule
          : 'standard',
      year: typeof parsed.year === 'string' ? parsed.year : '',
      month: typeof parsed.month === 'string' ? parsed.month : '',
      day: typeof parsed.day === 'string' ? parsed.day : '',
      hour: typeof parsed.hour === 'string' ? parsed.hour : '',
      minute: typeof parsed.minute === 'string' ? parsed.minute : '',
      jasiMethod: parsed.jasiMethod === 'split' ? 'split' : 'unified',
      birthLocationCode: typeof parsed.birthLocationCode === 'string' ? parsed.birthLocationCode : '',
      birthLocationLabel: typeof parsed.birthLocationLabel === 'string' ? parsed.birthLocationLabel : '',
      birthLatitude: typeof parsed.birthLatitude === 'string' ? parsed.birthLatitude : '',
      birthLongitude: typeof parsed.birthLongitude === 'string' ? parsed.birthLongitude : '',
      solarTimeMode: parsed.solarTimeMode === 'longitude' ? 'longitude' : 'standard',
      gender: typeof parsed.gender === 'string' ? parsed.gender : '',
      nickname: typeof parsed.nickname === 'string' ? parsed.nickname : '',
      loadedProfileSource:
        parsed.loadedProfileSource === 'self' || parsed.loadedProfileSource === 'family'
          ? parsed.loadedProfileSource
          : 'manual',
      tone:
        parsed.tone === 'friendly' || parsed.tone === 'polite' || parsed.tone === 'standard'
          ? parsed.tone
          : 'polite',
      consents: mergeConsentState(parsed.consents),
    };
  } catch {
    return createInitialOnboardingDraft();
  }
}

export function saveOnboardingDraft(draft: SajuOnboardingDraft) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(draft));
}

export function clearOnboardingDraft() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
}

export function getHonorificLabel(nickname: string) {
  const trimmed = nickname.trim();
  if (!trimmed) return '선생님';
  if (trimmed.endsWith('님') || trimmed.endsWith('선생님')) return trimmed;
  return `${trimmed} 선생님`;
}

export function shouldAutoSavePersonalProfile(source: OnboardingProfileSource) {
  return source !== 'family';
}

export function buildTonePreview(tone: OnboardingSpeechTone, nickname: string) {
  const honorific = getHonorificLabel(nickname);

  switch (tone) {
    case 'friendly':
      return `${honorific}, 오늘은 마음을 가볍게 놓으셔도 괜찮습니다.`;
    case 'standard':
      return `${honorific}, 오늘의 흐름을 차분히 정리해 드리겠습니다.`;
    case 'polite':
    default:
      return `${honorific}, 오늘의 흐름을 정중히 살펴드리겠습니다.`;
  }
}
