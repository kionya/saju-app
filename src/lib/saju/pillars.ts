import { Solar } from 'lunar-typescript';
import type {
  Stem,
  Branch,
  Element,
  YinYang,
  Pillar,
  SajuResult,
  BirthInput,
  JasiMethod,
} from './types';
import { isValidBirthInput } from '@/domain/saju/validators/birth-input';

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

function getCalculationTime(input: BirthInput): { hour: number; minute: number } {
  if (input.unknownTime || input.hour === undefined) {
    return { hour: UNKNOWN_HOUR, minute: UNKNOWN_MINUTE };
  }

  return { hour: input.hour, minute: input.minute ?? KNOWN_MINUTE };
}

function getEightCharSect(jasiMethod?: JasiMethod) {
  return jasiMethod === 'split' ? 1 : 2;
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

  const { year, month, day } = input;
  const calculationTime = getCalculationTime(input);
  const solar = Solar.fromYmdHms(
    year,
    month,
    day,
    calculationTime.hour,
    calculationTime.minute,
    0
  );
  const eightChar = solar.getLunar().getEightChar();

  eightChar.setSect(getEightCharSect(input.jasiMethod));

  const yearPillar = toPillar(eightChar.getYearGan(), eightChar.getYearZhi());
  const monthPillar = toPillar(eightChar.getMonthGan(), eightChar.getMonthZhi());
  const dayPillar = toPillar(eightChar.getDayGan(), eightChar.getDayZhi());
  const hourPillar =
    !input.unknownTime && input.hour !== undefined
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
  const parts = [String(input.year), String(input.month), String(input.day)];

  if (!input.unknownTime && input.hour !== undefined) {
    parts.push(String(input.hour));

    if (input.minute !== undefined) {
      parts.push(`m${input.minute}`);
    }

    if (input.jasiMethod && input.jasiMethod !== 'unified') {
      parts.push(`j${input.jasiMethod}`);
    }
  }

  if (input.gender) {
    parts.push(input.gender);
  }

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

  for (const token of parts.slice(3)) {
    if (token === 'male' || token === 'female') {
      result.gender = token;
      continue;
    }

    if (token.startsWith('m')) {
      const parsedMinute = parseInt(token.slice(1), 10);
      if (!Number.isNaN(parsedMinute)) {
        result.minute = parsedMinute;
      }
      continue;
    }

    if (token === 'jsplit' || token === 'junified') {
      result.jasiMethod = token === 'jsplit' ? 'split' : 'unified';
      continue;
    }

    const parsedHour = parseInt(token, 10);
    if (!Number.isNaN(parsedHour)) {
      result.hour = parsedHour;
    }
  }

  return isValidBirthInput(result) ? result : null;
}
