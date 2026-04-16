import type { Stem, Branch, Element, YinYang, Pillar, SajuResult, BirthInput } from './types';

// 천간 (10개)
const STEMS: Stem[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 지지 (12개)
const BRANCHES: Branch[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 천간 오행
const STEM_ELEMENTS: Record<Stem, Element> = {
  '甲': '목', '乙': '목',
  '丙': '화', '丁': '화',
  '戊': '토', '己': '토',
  '庚': '금', '辛': '금',
  '壬': '수', '癸': '수',
};

// 지지 오행
const BRANCH_ELEMENTS: Record<Branch, Element> = {
  '子': '수', '丑': '토', '寅': '목', '卯': '목',
  '辰': '토', '巳': '화', '午': '화', '未': '토',
  '申': '금', '酉': '금', '戌': '토', '亥': '수',
};

// 천간 음양 (甲丙戊庚壬 = 양, 乙丁己辛癸 = 음)
const STEM_YINYANG: Record<Stem, YinYang> = {
  '甲': '양', '乙': '음', '丙': '양', '丁': '음', '戊': '양',
  '己': '음', '庚': '양', '辛': '음', '壬': '양', '癸': '음',
};

// 시지 조견표 (자시=23~1시, 축시=1~3시 ...)
function getHourBranch(hour: number): Branch {
  const branches: Branch[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  // 자시: 23~1시 (0,1,23), 축시: 1~3시 (2,3), ...
  if (hour === 23 || hour === 0) return '子';
  return branches[Math.floor((hour + 1) / 2)];
}

// 연주 계산: 1984년 갑자년 기준
function getYearPillar(year: number): Pillar {
  const baseYear = 1984; // 甲子년
  const offset = ((year - baseYear) % 60 + 60) % 60;
  const stem = STEMS[offset % 10];
  const branch = BRANCHES[offset % 12];
  return {
    stem,
    branch,
    stemElement: STEM_ELEMENTS[stem],
    branchElement: BRANCH_ELEMENTS[branch],
    yinYang: STEM_YINYANG[stem],
  };
}

// 월주 계산: 절기 기준 (간략화 - 월별 고정값)
// 실제 절기는 매년 다르지만 MVP에서는 절입일 기준 간략화
function getMonthPillar(year: number, month: number): Pillar {
  // 연간(年干) 기준 월간(月干) 시작점
  const yearStemIndex = ((year - 1984) % 10 + 10) % 10;
  // 인월(1월) 천간 = 연간에 따라 결정
  // 甲己년: 丙寅, 乙庚년: 戊寅, 丙辛년: 庚寅, 丁壬년: 壬寅, 戊癸년: 甲寅
  const monthStemStarts = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0]; // 각 연간의 인월 천간 인덱스
  const startStemIndex = monthStemStarts[yearStemIndex];

  // 인월 = 양력 2월 (인덱스 0), 묘월 = 3월 ...
  // 지지: 인(2월)=2번 index부터 시작
  const monthBranchIndex = (month + 1) % 12; // 1월→2(丑), 2월→3(寅), ...
  const adjustedBranchIndex = (monthBranchIndex + 10) % 12; // 인월 맞추기

  const stemIndex = (startStemIndex + (month - 1)) % 10;
  const branchIndex = (2 + (month - 1)) % 12; // 인(寅)월 = 2월부터

  const stem = STEMS[stemIndex];
  const branch = BRANCHES[branchIndex];
  return {
    stem,
    branch,
    stemElement: STEM_ELEMENTS[stem],
    branchElement: BRANCH_ELEMENTS[branch],
    yinYang: STEM_YINYANG[stem],
  };
}

// 일주 계산: 율리우스 적일 기반
function getJulianDay(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y +
    Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function getDayPillar(year: number, month: number, day: number): Pillar {
  const jd = getJulianDay(year, month, day);
  // 갑자일(JD=2299160 근처) 기준으로 계산
  const BASE_JD = 2440588; // 1970-01-01 JD
  const BASE_STEM = 6;     // 1970-01-01은 庚(6)
  const BASE_BRANCH = 6;   // 1970-01-01은 午(6)

  const diff = jd - BASE_JD;
  const stemIndex = ((BASE_STEM + diff) % 10 + 10) % 10;
  const branchIndex = ((BASE_BRANCH + diff) % 12 + 12) % 12;

  const stem = STEMS[stemIndex];
  const branch = BRANCHES[branchIndex];
  return {
    stem,
    branch,
    stemElement: STEM_ELEMENTS[stem],
    branchElement: BRANCH_ELEMENTS[branch],
    yinYang: STEM_YINYANG[stem],
  };
}

// 시주 계산
function getHourPillar(dayStem: Stem, hour: number): Pillar {
  const dayStemIndex = STEMS.indexOf(dayStem);
  const hourBranch = getHourBranch(hour);
  const hourBranchIndex = BRANCHES.indexOf(hourBranch);

  // 일간 기준 자시 천간 시작점
  const hourStemStarts = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8]; // 甲己일: 甲자시
  const startStemIndex = hourStemStarts[dayStemIndex];
  const stemIndex = (startStemIndex + hourBranchIndex) % 10;

  const stem = STEMS[stemIndex];
  return {
    stem,
    branch: hourBranch,
    stemElement: STEM_ELEMENTS[stem],
    branchElement: BRANCH_ELEMENTS[hourBranch],
    yinYang: STEM_YINYANG[stem],
  };
}

// 오행 집계
function countElements(pillars: (Pillar | null)[]): Record<Element, number> {
  const counts: Record<Element, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  for (const p of pillars) {
    if (!p) continue;
    counts[p.stemElement]++;
    counts[p.branchElement]++;
  }
  return counts;
}

// 메인 계산 함수
export function calculateSaju(input: BirthInput): SajuResult {
  const { year, month, day, hour } = input;

  const yearPillar = getYearPillar(year);
  const monthPillar = getMonthPillar(year, month);
  const dayPillar = getDayPillar(year, month, day);
  const hourPillar = hour !== undefined ? getHourPillar(dayPillar.stem, hour) : null;

  const elements = countElements([yearPillar, monthPillar, dayPillar, hourPillar]);

  const entries = Object.entries(elements) as [Element, number][];
  const dominantElement = entries.reduce((a, b) => a[1] >= b[1] ? a : b)[0];
  const weakestElement = entries.reduce((a, b) => a[1] <= b[1] ? a : b)[0];

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
  return result;
}