import type { BirthInput, BirthLocation, SolarTimeMode } from './types';

export const KST_STANDARD_MERIDIAN = 135;
export const DEFAULT_BIRTH_TIMEZONE = 'Asia/Seoul';

export const BIRTH_LOCATION_PRESETS = [
  { code: 'seoul', label: '서울', latitude: 37.5665, longitude: 126.9780 },
  { code: 'busan', label: '부산', latitude: 35.1796, longitude: 129.0756 },
  { code: 'daegu', label: '대구', latitude: 35.8714, longitude: 128.6014 },
  { code: 'incheon', label: '인천', latitude: 37.4563, longitude: 126.7052 },
  { code: 'gwangju', label: '광주', latitude: 35.1595, longitude: 126.8526 },
  { code: 'daejeon', label: '대전', latitude: 36.3504, longitude: 127.3845 },
  { code: 'ulsan', label: '울산', latitude: 35.5384, longitude: 129.3114 },
  { code: 'sejong', label: '세종', latitude: 36.4800, longitude: 127.2890 },
  { code: 'suwon', label: '수원', latitude: 37.2636, longitude: 127.0286 },
  { code: 'chuncheon', label: '춘천', latitude: 37.8813, longitude: 127.7298 },
  { code: 'cheongju', label: '청주', latitude: 36.6424, longitude: 127.4890 },
  { code: 'jeonju', label: '전주', latitude: 35.8242, longitude: 127.1480 },
  { code: 'changwon', label: '창원', latitude: 35.2279, longitude: 128.6811 },
  { code: 'jeju', label: '제주', latitude: 33.4996, longitude: 126.5312 },
] as const;

export type BirthLocationPresetCode = (typeof BIRTH_LOCATION_PRESETS)[number]['code'];

export interface BirthTimeCorrection {
  mode: SolarTimeMode;
  timezone: string;
  standardMeridian: number;
  longitude: number | null;
  latitude: number | null;
  offsetMinutes: number;
  originalBirth: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  };
  adjustedBirth: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  };
}

export function getBirthLocationPreset(code: string | null | undefined): BirthLocation | null {
  const preset = BIRTH_LOCATION_PRESETS.find((item) => item.code === code);
  if (!preset) return null;

  return {
    code: preset.code,
    label: preset.label,
    latitude: preset.latitude,
    longitude: preset.longitude,
    timezone: DEFAULT_BIRTH_TIMEZONE,
  };
}

export function getSolarTimeOffsetMinutes({
  longitude,
  standardMeridian = KST_STANDARD_MERIDIAN,
}: {
  longitude: number;
  standardMeridian?: number;
}) {
  return Math.round((longitude - standardMeridian) * 4);
}

function shiftLocalDateTime({
  year,
  month,
  day,
  hour,
  minute,
  offsetMinutes,
}: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  offsetMinutes: number;
}) {
  const shifted = new Date(Date.UTC(year, month - 1, day, hour, minute + offsetMinutes, 0));

  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
  };
}

export function buildBirthTimeCorrection(
  input: Pick<
    BirthInput,
    'year' | 'month' | 'day' | 'hour' | 'minute' | 'unknownTime' | 'birthLocation' | 'solarTimeMode'
  >
): BirthTimeCorrection | null {
  if (input.unknownTime || input.hour === undefined) return null;
  if (input.solarTimeMode !== 'longitude') return null;
  if (!input.birthLocation) return null;

  const minute = input.minute ?? 30;
  const timezone = input.birthLocation.timezone ?? DEFAULT_BIRTH_TIMEZONE;
  const offsetMinutes = getSolarTimeOffsetMinutes({
    longitude: input.birthLocation.longitude,
    standardMeridian: KST_STANDARD_MERIDIAN,
  });
  const adjustedBirth = shiftLocalDateTime({
    year: input.year,
    month: input.month,
    day: input.day,
    hour: input.hour,
    minute,
    offsetMinutes,
  });

  return {
    mode: 'longitude',
    timezone,
    standardMeridian: KST_STANDARD_MERIDIAN,
    longitude: input.birthLocation.longitude,
    latitude: input.birthLocation.latitude,
    offsetMinutes,
    originalBirth: {
      year: input.year,
      month: input.month,
      day: input.day,
      hour: input.hour,
      minute,
    },
    adjustedBirth,
  };
}

export function getBirthCalculationDateTime(
  input: Pick<
    BirthInput,
    'year' | 'month' | 'day' | 'hour' | 'minute' | 'unknownTime' | 'birthLocation' | 'solarTimeMode'
  >
) {
  const correction = buildBirthTimeCorrection(input);
  if (correction) return correction.adjustedBirth;

  return {
    year: input.year,
    month: input.month,
    day: input.day,
    hour: input.unknownTime || input.hour === undefined ? 12 : input.hour,
    minute: input.unknownTime || input.hour === undefined ? 0 : input.minute ?? 30,
  };
}
