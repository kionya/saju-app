import type { UserProfile } from '@/lib/profile';
import { hasCoreBirthProfile, toBirthInputFromProfile } from '@/lib/profile';
import { toSlug } from '@/lib/saju/pillars';

export function deriveStarSignSlug(month: number, day: number) {
  const value = month * 100 + day;

  if (value >= 321 && value <= 419) return 'aries';
  if (value >= 420 && value <= 520) return 'taurus';
  if (value >= 521 && value <= 621) return 'gemini';
  if (value >= 622 && value <= 722) return 'cancer';
  if (value >= 723 && value <= 822) return 'leo';
  if (value >= 823 && value <= 923) return 'virgo';
  if (value >= 924 && value <= 1022) return 'libra';
  if (value >= 1023 && value <= 1122) return 'scorpio';
  if (value >= 1123 && value <= 1224) return 'sagittarius';
  if (value >= 1225 || value <= 119) return 'capricorn';
  if (value >= 120 && value <= 218) return 'aquarius';
  return 'pisces';
}

const ZODIAC_ORDER = [
  'rat',
  'ox',
  'tiger',
  'rabbit',
  'dragon',
  'snake',
  'horse',
  'goat',
  'monkey',
  'rooster',
  'dog',
  'pig',
] as const;

export function deriveZodiacSlug(year: number) {
  const index = ((year - 1984) % 12 + 12) % 12;
  return ZODIAC_ORDER[index];
}

export function buildProfileReadingSlug(profile: UserProfile | null | undefined) {
  if (!hasCoreBirthProfile(profile)) {
    return null;
  }

  return toSlug(toBirthInputFromProfile(profile));
}

export function buildStarSignSlugFromProfile(profile: UserProfile | null | undefined) {
  if (!hasCoreBirthProfile(profile)) {
    return null;
  }

  return deriveStarSignSlug(profile.birthMonth, profile.birthDay);
}

export function buildZodiacSlugFromProfile(profile: UserProfile | null | undefined) {
  if (!hasCoreBirthProfile(profile)) {
    return null;
  }

  return deriveZodiacSlug(profile.birthYear);
}
