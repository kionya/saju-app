import {
  HOME_TODAY_SUMMARY,
  type MoonlightTone,
} from '@/content/moonlight';

export type HomeProfileLoadStatus = 'loading' | 'ready' | 'error';

export interface HomeBirthProfile {
  displayName?: string | null;
  preferredCounselor?: 'male' | 'female' | null;
  birthYear: number | null;
  birthMonth: number | null;
  birthDay: number | null;
  birthHour: number | null;
  birthMinute: number | null;
  gender: 'male' | 'female' | null;
}

export interface HomeProfilePreview {
  authenticated: boolean;
  profile: HomeBirthProfile | null;
}

export interface HomeTodaySummaryItem {
  label: string;
  value: string;
  ratio: number;
  tone: MoonlightTone;
  detail: string;
}

export interface HomePersonalizationCopy {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  isPersonalized: boolean;
}

function clampRatio(value: number) {
  return Math.max(42, Math.min(92, Math.round(value)));
}

function scoreToValue(score: number) {
  if (score >= 82) return '상승';
  if (score >= 70) return '양호';
  if (score >= 58) return '보통';
  return '정리';
}

function scoreToTone(score: number): MoonlightTone {
  if (score >= 78) return 'jade';
  if (score >= 64) return 'gold';
  return 'sky';
}

function getProfileSeed(profile: HomeBirthProfile, today: Date) {
  return (
    (profile.birthYear ?? 0) +
    (profile.birthMonth ?? 1) * 31 +
    (profile.birthDay ?? 1) * 17 +
    (profile.birthHour ?? 6) * 7 +
    (profile.birthMinute ?? 0) +
    (profile.gender === 'female' ? 11 : profile.gender === 'male' ? 5 : 0) +
    (today.getMonth() + 1) * 13 +
    today.getDate() * 19
  );
}

export function hasCompleteBirthProfile(
  profile: HomeBirthProfile | null | undefined
): profile is HomeBirthProfile & {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
} {
  return Boolean(profile?.birthYear && profile.birthMonth && profile.birthDay);
}

export function buildPersonalizedTodaySummary(
  profilePreview: HomeProfilePreview | null,
  today = new Date()
): HomeTodaySummaryItem[] {
  if (!hasCompleteBirthProfile(profilePreview?.profile)) {
    return HOME_TODAY_SUMMARY.map((item) => ({
      ...item,
      detail: '저장된 생년월일이 없을 때 보여드리는 기본 흐름입니다.',
    }));
  }

  const profile = profilePreview.profile;
  const seed = getProfileSeed(profile, today);
  const scores = {
    wealth: clampRatio(54 + (seed % 35)),
    condition: clampRatio(52 + ((seed * 3 + (profile.birthHour ?? 8)) % 38)),
    relationship: clampRatio(50 + ((seed * 5 + profile.birthMonth) % 40)),
  };
  const hourDetail =
    profile.birthHour === null
      ? '태어난 시간 미입력 기준으로 부드럽게 보정했습니다.'
      : `${profile.birthHour}시${
          profile.birthMinute === null
            ? ''
            : ` ${String(profile.birthMinute).padStart(2, '0')}분`
        } 출생 정보까지 반영했습니다.`;

  return [
    {
      label: '재물',
      value: scoreToValue(scores.wealth),
      ratio: scores.wealth,
      tone: scoreToTone(scores.wealth),
      detail: `${profile.birthMonth}월 ${profile.birthDay}일 기준의 기회 포착 감각입니다.`,
    },
    {
      label: '컨디션',
      value: scoreToValue(scores.condition),
      ratio: scores.condition,
      tone: scoreToTone(scores.condition),
      detail: hourDetail,
    },
    {
      label: '관계',
      value: scoreToValue(scores.relationship),
      ratio: scores.relationship,
      tone: scoreToTone(scores.relationship),
      detail: '오늘의 말투와 거리감 조율 흐름을 개인 정보 기준으로 조정했습니다.',
    },
  ];
}

export function buildHomePersonalizationCopy(
  profilePreview: HomeProfilePreview | null,
  status: HomeProfileLoadStatus
): HomePersonalizationCopy {
  if (status === 'loading') {
    return {
      eyebrow: '내 오늘의 운',
      title: '선생님 기준 흐름을 불러오고 있습니다.',
      body: '로그인 상태와 저장된 생년월일을 확인해 오늘 가장 먼저 볼 축을 맞추고 있습니다.',
      ctaLabel: '개인 리포트 열기',
      ctaHref: '/saju/new',
      isPersonalized: false,
    };
  }

  if (status === 'error') {
    return {
      eyebrow: '기본 오늘의 운',
      title: '기본 흐름부터 먼저 확인해 보세요.',
      body: '프로필 정보를 불러오지 못해 공통 흐름을 먼저 보여드립니다. MY 정보는 다시 열어도 그대로 이어집니다.',
      ctaLabel: 'MY 정보 확인',
      ctaHref: '/my/profile',
      isPersonalized: false,
    };
  }

  if (!profilePreview?.authenticated) {
    return {
      eyebrow: '기본 오늘의 운',
      title: '로그인하면 오늘 가장 예민한 축이 바로 보입니다.',
      body: '지금은 모든 방문자에게 공통 흐름을 보여드립니다. 로그인 후 생년월일을 저장하면 재물, 컨디션, 관계 흐름을 내 정보 기준으로 조정합니다.',
      ctaLabel: '로그인하기',
      ctaHref: '/login?next=/',
      isPersonalized: false,
    };
  }

  if (!hasCompleteBirthProfile(profilePreview.profile)) {
    return {
      eyebrow: '내 오늘의 운',
      title: '생년월일을 저장하면 오늘 먼저 조심할 흐름이 보입니다.',
      body: '로그인은 확인되었습니다. MY 프로필에 생년월일을 저장하면 홈에서도 입력 없이 선생님 기준 흐름을 바로 보여드립니다.',
      ctaLabel: 'MY 프로필 저장',
      ctaHref: '/my/profile',
      isPersonalized: false,
    };
  }

  const displayName = profilePreview.profile.displayName?.trim() || '선생님';

  return {
    eyebrow: '내 정보 기반 오늘의 운',
    title: `${displayName}님, 오늘 먼저 볼 흐름을 골라드렸습니다.`,
    body: `${profilePreview.profile.birthYear}.${profilePreview.profile.birthMonth}.${profilePreview.profile.birthDay} 출생 정보를 기준으로 재물, 컨디션, 관계 축을 먼저 추려드렸습니다.`,
    ctaLabel: '개인 리포트 열기',
    ctaHref: '/saju/new',
    isPersonalized: true,
  };
}
