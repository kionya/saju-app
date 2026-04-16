import { Solar } from 'lunar-typescript';
import type { Stem, Branch, Element, YinYang, Pillar, SajuResult, BirthInput } from './types';

const STEMS: Stem[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES: Branch[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const ELEMENTS: Element[] = ['목', '화', '토', '금', '수'];
const UNKNOWN_HOUR = 12;
const UNKNOWN_MINUTE = 0;
const KNOWN_MINUTE = 30;

const STEM_ELEMENTS: Record<Stem, Element> = {
  '甲': '목', '乙': '목',
  '丙': '화', '丁': '화',
  '戊': '토', '己': '토',
  '庚': '금', '辛': '금',
  '壬': '수', '癸': '수',
};

const BRANCH_ELEMENTS: Record<Branch, Element> = {
  '子': '수', '丑': '토', '寅': '목', '卯': '목',
  '辰': '토', '巳': '화', '午': '화', '未': '토',
  '申': '금', '酉': '금', '戌': '토', '亥': '수',
};

const STEM_YINYANG: Record<Stem, YinYang> = {
  '甲': '양', '乙': '음', '丙': '양', '丁': '음', '戊': '양',
  '己': '음', '庚': '양', '辛': '음', '壬': '양', '癸': '음',
};

function isStem(value: string): value is Stem {
  return STEMS.includes(value as Stem);
}

function isBranch(value: string): value is Branch {
  return BRANCHES.includes(value as Branch);
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function isValidBirthInput(input: BirthInput): boolean {
  const { year, month, day, hour } = input;

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

  if (
    hour !== undefined &&
    (!Number.isInteger(hour) || hour < 0 || hour > 23)
  ) {
    return false;
  }

  return true;
}

function toPillar(stemValue: string, branchValue: string): Pillar {
  if (!isStem(stemValue) || !isBranch(branchValue)) {
    throw new Error('사주 계산 결과를 해석하지 못했습니다.');
  }

  return {
    stem: stemValue,
    branch: branchValue,
    stemElement: STEM_ELEMENTS[stemValue],
    branchElement: BRANCH_ELEMENTS[branchValue],
    yinYang: STEM_YINYANG[stemValue],
  };
}

function getCalculationTime(hour?: number): { hour: number; minute: number } {
  if (hour === undefined) {
    return { hour: UNKNOWN_HOUR, minute: UNKNOWN_MINUTE };
  }

  return { hour, minute: KNOWN_MINUTE };
}

function countElements(pillars: (Pillar | null)[]): Record<Element, number> {
  const counts = Object.fromEntries(ELEMENTS.map((element) => [element, 0])) as Record<Element, number>;

  for (const pillar of pillars) {
    if (!pillar) continue;
    counts[pillar.stemElement] += 1;
    counts[pillar.branchElement] += 1;
  }

  return counts;
}

export function calculateSaju(input: BirthInput): SajuResult {
  if (!isValidBirthInput(input)) {
    throw new Error('생년월일시 정보가 올바르지 않습니다.');
  }

  const { year, month, day, hour } = input;
  const calculationTime = getCalculationTime(hour);
  const solar = Solar.fromYmdHms(
    year,
    month,
    day,
    calculationTime.hour,
    calculationTime.minute,
    0
  );
  const eightChar = solar.getLunar().getEightChar();

  // 자시 기준이 갈리는 흐름을 줄이기 위해 라이브러리의 기본 만세력 섹트(2)를 명시한다.
  eightChar.setSect(2);

  const yearPillar = toPillar(eightChar.getYearGan(), eightChar.getYearZhi());
  const monthPillar = toPillar(eightChar.getMonthGan(), eightChar.getMonthZhi());
  const dayPillar = toPillar(eightChar.getDayGan(), eightChar.getDayZhi());
  const hourPillar =
    hour !== undefined
      ? toPillar(eightChar.getTimeGan(), eightChar.getTimeZhi())
      : null;

  const elements = countElements([yearPillar, monthPillar, dayPillar, hourPillar]);
  const entries = Object.entries(elements) as [Element, number][];
  const dominantElement = entries.reduce((current, next) => current[1] >= next[1] ? current : next)[0];
  const weakestElement = entries.reduce((current, next) => current[1] <= next[1] ? current : next)[0];

  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
    elements,
    dominantElement,
    weakestElement,
    dayMaster: dayPillar.stem,
  };
}

// 슬러그 생성/파싱 유틸
export function toSlug(input: BirthInput): string {
  const parts = [input.year, input.month, input.day];
  if (input.hour !== undefined) parts.push(input.hour);
  if (input.gender) return parts.join('-') + `-${input.gender}`;
  return parts.join('-');
}

export function fromSlug(slug: string): BirthInput | null {
  const parts = slug.split('-');
  if (parts.length < 3) return null;
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]);
  const day = parseInt(parts[2]);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

  const result: BirthInput = { year, month, day };
  if (parts[3] && !isNaN(parseInt(parts[3]))) {
    result.hour = parseInt(parts[3]);
    if (parts[4] === 'male' || parts[4] === 'female') result.gender = parts[4];
  } else if (parts[3] === 'male' || parts[3] === 'female') {
    result.gender = parts[3];
  }

  return isValidBirthInput(result) ? result : null;
}
