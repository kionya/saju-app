import type { BirthInput } from '@/lib/saju/types';

export interface BirthInputDraft {
  year?: unknown;
  month?: unknown;
  day?: unknown;
  hour?: unknown;
  minute?: unknown;
  unknownTime?: unknown;
  jasiMethod?: unknown;
  gender?: unknown;
}

interface ParseBirthInputOptions {
  requireGender?: boolean;
}

export type ParsedBirthInput =
  | { ok: true; input: BirthInput }
  | { ok: false; error: string };

function toInt(value: unknown): number | null {
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function isValidBirthInput(input: BirthInput): boolean {
  const { year, month, day, hour, minute, jasiMethod, unknownTime } = input;

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    year < 1900 ||
    year > 2100 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > getDaysInMonth(year, month)
  ) {
    return false;
  }

  if (hour !== undefined && (!Number.isInteger(hour) || hour < 0 || hour > 23)) {
    return false;
  }

  if (
    !unknownTime &&
    minute !== undefined &&
    (!Number.isInteger(minute) || minute < 0 || minute > 59)
  ) {
    return false;
  }

  if (
    jasiMethod !== undefined &&
    jasiMethod !== 'split' &&
    jasiMethod !== 'unified'
  ) {
    return false;
  }

  return true;
}

export function parseBirthInputDraft(
  draft: BirthInputDraft | null | undefined,
  options: ParseBirthInputOptions = {}
): ParsedBirthInput {
  if (!draft) {
    return { ok: false, error: '입력 정보가 비어 있습니다.' };
  }

  const year = toInt(draft.year);
  const month = toInt(draft.month);
  const day = toInt(draft.day);

  if (year === null || month === null || day === null) {
    return { ok: false, error: '생년월일을 모두 입력해 주세요.' };
  }

  let hour: number | undefined;
  let minute: number | undefined;
  const unknownTime = draft.unknownTime === true;

  if (draft.hour !== undefined && draft.hour !== null && draft.hour !== '') {
    const parsedHour = toInt(draft.hour);
    if (parsedHour === null) {
      return { ok: false, error: '태어난 시간은 0시부터 23시 사이로 입력해 주세요.' };
    }
    hour = parsedHour;
  }

  if (!unknownTime && draft.minute !== undefined && draft.minute !== null && draft.minute !== '') {
    if (hour === undefined) {
      return { ok: false, error: '분을 입력하시려면 태어난 시간도 함께 선택해 주세요.' };
    }

    const parsedMinute = toInt(draft.minute);
    if (parsedMinute === null) {
      return { ok: false, error: '태어난 분은 0분부터 59분 사이로 입력해 주세요.' };
    }

    minute = parsedMinute;
  }

  let jasiMethod: BirthInput['jasiMethod'];
  if (draft.jasiMethod === 'split' || draft.jasiMethod === 'unified') {
    jasiMethod = draft.jasiMethod;
  }

  let gender: BirthInput['gender'];
  if (draft.gender === 'male' || draft.gender === 'female') {
    gender = draft.gender;
  } else if (options.requireGender) {
    return { ok: false, error: '정밀 입력에서는 성별 선택이 필요합니다.' };
  }

  const input: BirthInput = {
    year,
    month,
    day,
    hour: unknownTime ? undefined : hour,
    minute: unknownTime ? undefined : minute,
    unknownTime,
    jasiMethod,
    gender,
  };

  if (!isValidBirthInput(input)) {
    return { ok: false, error: '생년월일을 다시 확인해 주세요.' };
  }

  return { ok: true, input };
}
