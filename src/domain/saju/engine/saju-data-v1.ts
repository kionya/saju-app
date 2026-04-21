import type {
  BirthInput,
  Branch,
  Element,
  JasiMethod,
  Pillar as LegacyPillar,
  SajuResult as LegacySajuResult,
  Stem,
  YinYang,
} from '@/lib/saju/types';
import { Solar } from 'lunar-typescript';
import { calculateSaju } from '@/lib/saju/pillars';
import {
  buildOrreryReferenceExtension,
  type SajuOrreryExtension,
} from './orrery-adapter';

export const SAJU_DATA_V1 = 'saju-data/v1' as const;

export type SajuDataVersion = typeof SAJU_DATA_V1;
export type SajuComputationSource =
  | 'legacy-typescript'
  | 'rule-based-typescript'
  | 'python-engine'
  | 'orrery-reference';
export type SajuCompleteness = 'seed' | 'partial' | 'complete';

export type SajuPendingSection =
  | 'tenGods'
  | 'strength'
  | 'pattern'
  | 'yongsin'
  | 'majorLuck'
  | 'currentLuck';

export type TenGodCode =
  | '비견'
  | '겁재'
  | '식신'
  | '상관'
  | '편재'
  | '정재'
  | '편관'
  | '정관'
  | '편인'
  | '정인';

export type FiveElementState = 'strong' | 'balanced' | 'weak' | 'missing';
export type StrengthLevel = '신강' | '중화' | '신약';
export type PatternCategory = '정격' | '변격' | '특수격';
export type YongsinMethod =
  | '조후용신'
  | '억부용신'
  | '희기신보정'
  | 'legacy-placeholder';
export type SajuSymbolType = 'stem' | 'branch' | 'element';
type SeasonKey = 'spring' | 'summer' | 'autumn' | 'winter' | 'earth';
type LocalDatePart = 'year' | 'month' | 'day' | 'hour' | 'minute';

interface LocalDateTimeSnapshot {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

const STEM_ELEMENTS: Record<Stem, Element> = {
  '甲': '목',
  '乙': '목',
  '丙': '화',
  '丁': '화',
  '戊': '토',
  '己': '토',
  '庚': '금',
  '辛': '금',
  '壬': '수',
  '癸': '수',
};

const ELEMENT_HANJA: Record<Element, string> = {
  목: '木',
  화: '火',
  토: '土',
  금: '金',
  수: '水',
};

const DAY_MASTER_METAPHORS: Record<Stem, string> = {
  '甲': '큰 나무',
  '乙': '덩굴과 화초',
  '丙': '한낮의 태양',
  '丁': '촛불과 등불',
  '戊': '넓은 대지',
  '己': '기름진 밭흙',
  '庚': '단단한 광석',
  '辛': '세공된 보석',
  '壬': '큰 강과 바다',
  '癸': '이슬과 비',
};

const DAY_MASTER_DESCRIPTIONS: Record<Stem, string> = {
  '甲': '곧게 자라는 큰 나무처럼 원칙과 추진력이 분명한 성향입니다.',
  '乙': '바람을 타는 덩굴처럼 유연하고 섬세하게 관계를 읽는 성향입니다.',
  '丙': '햇빛처럼 밝게 드러나며 주변을 움직이게 하는 표현력이 강합니다.',
  '丁': '작은 불씨처럼 집중력과 지속력이 좋아 한 분야를 깊게 파고듭니다.',
  '戊': '넓은 땅처럼 안정감과 책임감이 강하고 중심을 잡는 힘이 있습니다.',
  '己': '잘 다듬어진 흙처럼 현실 감각과 조정 능력이 뛰어난 편입니다.',
  '庚': '광석을 다루듯 판단이 분명하고 결단이 빠른 편입니다.',
  '辛': '보석을 세공하듯 정교함과 예민한 안목이 살아 있는 성향입니다.',
  '壬': '큰 물줄기처럼 포용력과 확장성이 좋고 흐름을 크게 읽습니다.',
  '癸': '이슬비처럼 세밀하고 직관적으로 분위기를 감지하는 성향입니다.',
};

const BRANCH_HIDDEN_STEMS: Record<Branch, Stem[]> = {
  '子': ['癸'],
  '丑': ['己', '癸', '辛'],
  '寅': ['甲', '丙', '戊'],
  '卯': ['乙'],
  '辰': ['戊', '乙', '癸'],
  '巳': ['丙', '戊', '庚'],
  '午': ['丁', '己'],
  '未': ['己', '丁', '乙'],
  '申': ['庚', '壬', '戊'],
  '酉': ['辛'],
  '戌': ['戊', '辛', '丁'],
  '亥': ['壬', '甲'],
};

const SEASON_BY_BRANCH: Record<Branch, SeasonKey> = {
  '寅': 'spring',
  '卯': 'spring',
  '辰': 'earth',
  '巳': 'summer',
  '午': 'summer',
  '未': 'earth',
  '申': 'autumn',
  '酉': 'autumn',
  '戌': 'earth',
  '亥': 'winter',
  '子': 'winter',
  '丑': 'earth',
};

const SEASON_MAIN_ELEMENT: Record<SeasonKey, Element> = {
  spring: '목',
  summer: '화',
  autumn: '금',
  winter: '수',
  earth: '토',
};

const ELEMENT_SEQUENCE: Element[] = ['목', '화', '토', '금', '수'];
const TEN_GOD_KEYS: TenGodCode[] = ['비견', '겁재', '식신', '상관', '편재', '정재', '편관', '정관', '편인', '정인'];
const HIDDEN_STEM_WEIGHTS = [0.7, 0.4, 0.2];
const DEFAULT_HIDDEN_STEM_WEIGHT = HIDDEN_STEM_WEIGHTS[HIDDEN_STEM_WEIGHTS.length - 1] ?? 0.2;
const DAY_STEM_SCORE = 1.2;
const BRANCH_SCORE = 1.0;
const UNKNOWN_HOUR = 12;
const UNKNOWN_MINUTE = 0;
const KNOWN_MINUTE = 30;
const EIGHT_CHAR_SECT = 2;
const MAJOR_LUCK_COUNT = 10;
type SeasonalYongsinKey = `${Element}-${SeasonKey}`;

const GENERATED_BY_MAP: Record<Element, Element> = {
  목: '화',
  화: '토',
  토: '금',
  금: '수',
  수: '목',
};

const GENERATOR_OF_MAP: Record<Element, Element> = {
  목: '수',
  화: '목',
  토: '화',
  금: '토',
  수: '금',
};

const CONTROLLED_BY_MAP: Record<Element, Element> = {
  목: '토',
  화: '금',
  토: '수',
  금: '목',
  수: '화',
};

const CONTROLLER_OF_MAP: Record<Element, Element> = {
  목: '금',
  화: '수',
  토: '목',
  금: '화',
  수: '토',
};

export interface SajuDataV1 {
  schemaVersion: SajuDataVersion;
  input: SajuInputSnapshot;
  metadata: SajuComputationMetadata;
  pillars: SajuPillars;
  dayMaster: SajuDayMaster;
  fiveElements: SajuFiveElements;
  tenGods: SajuTenGodSummary | null;
  strength: SajuStrength | null;
  pattern: SajuPattern | null;
  yongsin: SajuYongsin | null;
  majorLuck: SajuMajorLuckCycle[] | null;
  currentLuck: SajuCurrentLuck | null;
  extensions: SajuDataExtensions | null;
}

export interface SajuInputSnapshot {
  calendar: 'solar';
  timezone: string;
  location: string | null;
  jasiMethod?: JasiMethod | null;
  birth: {
    year: number;
    month: number;
    day: number;
    hour: number | null;
    minute: number | null;
  };
  gender: 'male' | 'female' | null;
  hourKnown: boolean;
}

export interface SajuComputationMetadata {
  source: SajuComputationSource;
  engineVersion: string;
  calculatedAt: string;
  completeness: SajuCompleteness;
  pendingSections: SajuPendingSection[];
}

export interface SajuHiddenStem {
  stem: Stem;
  element: Element;
  order: number;
  tenGod: TenGodCode | null;
}

export interface SajuPillar {
  stem: Stem;
  branch: Branch;
  ganzi: string;
  stemElement: Element;
  branchElement: Element;
  yinYang: YinYang;
  /** 천간 십신. 일주 천간(일간)은 null */
  stemTenGod: TenGodCode | null;
  hiddenStems: SajuHiddenStem[];
}

export interface SajuPillars {
  year: SajuPillar;
  month: SajuPillar;
  day: SajuPillar;
  hour: SajuPillar | null;
}

export interface SajuDayMaster {
  stem: Stem;
  element: Element;
  yinYang: YinYang;
  metaphor: string | null;
  description: string | null;
}

export interface SajuFiveElementValue {
  count: number;
  score: number;
  percentage: number;
  state: FiveElementState;
}

export interface SajuFiveElements {
  byElement: Record<Element, SajuFiveElementValue>;
  dominant: Element;
  weakest: Element;
  totalCount: number;
  totalScore: number;
}

export interface SajuTenGodSummary {
  byType: Record<TenGodCode, number>;
  dominant: TenGodCode | null;
}

export interface SajuStrength {
  level: StrengthLevel;
  score: number;
  rationale: string[];
}

export interface SajuPattern {
  name: string;
  category: PatternCategory | null;
  tenGod: TenGodCode | null;
  rationale: string[];
}

export interface SajuSymbolRef {
  type: SajuSymbolType;
  value: string;
  label: string;
}

export interface SajuYongsin {
  primary: SajuSymbolRef;
  secondary: SajuSymbolRef[];
  kiyshin: SajuSymbolRef[];
  method: YongsinMethod;
  rationale: string[];
}

export interface SajuMajorLuckCycle {
  index: number;
  ganzi: string;
  startAge: number | null;
  endAge: number | null;
  notes: string[];
}

export interface SajuLuckDescriptor {
  ganzi: string;
  year: number | null;
  month: number | null;
  notes: string[];
}

export interface SajuCurrentLuck {
  currentMajorLuck: SajuMajorLuckCycle | null;
  saewoon: SajuLuckDescriptor | null;
  wolwoon: SajuLuckDescriptor | null;
}

export interface SajuDataExtensions {
  orrery?: SajuOrreryExtension | null;
}

export const SAJU_V1_PENDING_FROM_LEGACY: SajuPendingSection[] = [
  'tenGods',
  'strength',
  'pattern',
  'yongsin',
  'majorLuck',
  'currentLuck',
];

export function seedSajuDataV1FromLegacy(
  input: BirthInput,
  legacy: LegacySajuResult,
  options?: {
    timezone?: string;
    location?: string | null;
    calculatedAt?: string;
    engineVersion?: string;
  }
): SajuDataV1 {
  const calculatedAt = options?.calculatedAt ?? new Date().toISOString();

  const seed: SajuDataV1 = {
    schemaVersion: SAJU_DATA_V1,
    input: {
      calendar: 'solar',
      timezone: options?.timezone ?? 'Asia/Seoul',
      location: options?.location ?? null,
      jasiMethod: input.jasiMethod ?? null,
      birth: {
        year: input.year,
        month: input.month,
        day: input.day,
        hour: input.unknownTime ? null : input.hour ?? null,
        minute: input.unknownTime ? null : input.minute ?? null,
      },
      gender: input.gender ?? null,
      hourKnown: input.unknownTime ? false : input.hour !== undefined,
    },
    metadata: {
      source: 'legacy-typescript',
      engineVersion: options?.engineVersion ?? 'legacy-typescript-v0',
      calculatedAt,
      completeness: 'seed',
      pendingSections: [...SAJU_V1_PENDING_FROM_LEGACY],
    },
    pillars: {
      year: toSajuPillar(legacy.year),
      month: toSajuPillar(legacy.month),
      day: toSajuPillar(legacy.day),
      hour: legacy.hour ? toSajuPillar(legacy.hour) : null,
    },
    dayMaster: {
      stem: legacy.dayMaster,
      element: legacy.day.stemElement,
      yinYang: legacy.day.yinYang,
      metaphor: null,
      description: null,
    },
    fiveElements: toFiveElements(legacy),
    tenGods: null,
    strength: null,
    pattern: null,
    yongsin: null,
    majorLuck: null,
    currentLuck: null,
    extensions: null,
  };

  return enrichSajuDataV1(seed);
}

export function calculateSajuDataV1(
  input: BirthInput,
  options?: {
    timezone?: string;
    location?: string | null;
    calculatedAt?: string;
    engineVersion?: string;
  }
): SajuDataV1 {
  const legacy = calculateSaju(input);
  return seedSajuDataV1FromLegacy(input, legacy, {
    ...options,
    engineVersion: options?.engineVersion ?? 'legacy-typescript-v1-seed',
  });
}

export function normalizeToSajuDataV1(
  input: BirthInput,
  value: unknown,
  options?: {
    timezone?: string;
    location?: string | null;
  }
): SajuDataV1 {
  if (isSajuDataV1(value)) {
    return shouldPreserveSajuDataV1(value) ? value : enrichSajuDataV1(value);
  }

  if (isLegacySajuResult(value)) {
    return seedSajuDataV1FromLegacy(input, value, options);
  }

  return calculateSajuDataV1(input, options);
}

export function deriveLegacySajuResult(data: SajuDataV1): LegacySajuResult {
  const elements = Object.fromEntries(
    (Object.entries(data.fiveElements.byElement) as [Element, SajuFiveElementValue][]).map(
      ([element, value]) => [element, value.count]
    )
  ) as Record<Element, number>;

  return {
    year: toLegacyPillar(data.pillars.year),
    month: toLegacyPillar(data.pillars.month),
    day: toLegacyPillar(data.pillars.day),
    hour: data.pillars.hour ? toLegacyPillar(data.pillars.hour) : null,
    elements,
    dominantElement: data.fiveElements.dominant,
    weakestElement: data.fiveElements.weakest,
    dayMaster: data.dayMaster.stem,
  };
}

function toSajuPillar(pillar: LegacyPillar): SajuPillar {
  return {
    stem: pillar.stem,
    branch: pillar.branch,
    ganzi: `${pillar.stem}${pillar.branch}`,
    stemElement: pillar.stemElement,
    branchElement: pillar.branchElement,
    yinYang: pillar.yinYang,
    stemTenGod: null, // enrichPillar에서 채워짐
    hiddenStems: [],
  };
}

function toFiveElements(legacy: LegacySajuResult): SajuFiveElements {
  const totalCount = Object.values(legacy.elements).reduce((sum, count) => sum + count, 0);
  const highest = Math.max(...Object.values(legacy.elements));
  const lowest = Math.min(...Object.values(legacy.elements));

  const byElement = Object.fromEntries(
    (Object.entries(legacy.elements) as [Element, number][]).map(([element, count]) => [
      element,
      {
        count,
        score: count,
        percentage: totalCount > 0 ? Math.round((count / totalCount) * 1000) / 10 : 0,
        state: classifyElement(count, highest, lowest),
      },
    ])
  ) as Record<Element, SajuFiveElementValue>;

  return {
    byElement,
    dominant: legacy.dominantElement,
    weakest: legacy.weakestElement,
    totalCount,
    totalScore: totalCount,
  };
}

function enrichSajuDataV1(base: SajuDataV1): SajuDataV1 {
  const dayMasterStem = base.dayMaster.stem;
  const pillars = enrichPillars(base.pillars, dayMasterStem);
  const fiveElements = calculateFiveElements(pillars);
  const tenGods = calculateTenGodSummary(pillars, dayMasterStem);
  const strength = calculateStrength(pillars, dayMasterStem, fiveElements);
  const pattern = calculatePattern(pillars, dayMasterStem);
  const yongsin = calculateYongsin(pillars, base.dayMaster.element, fiveElements, strength);
  const computedLuck = calculateLuckData(base.input, base.metadata.calculatedAt);
  const majorLuck = computedLuck.majorLuck ?? base.majorLuck;
  const currentLuck = computedLuck.currentLuck ?? base.currentLuck;
  const pendingSections = getPendingSections({
    ...base,
    tenGods,
    strength,
    pattern,
    yongsin,
    majorLuck,
    currentLuck,
  });

  const next: SajuDataV1 = {
    ...base,
    metadata: {
      ...base.metadata,
      source: 'orrery-reference',
      engineVersion: 'orrery-reference-v1',
      completeness: pendingSections.length === 0 ? 'complete' : 'partial',
      pendingSections,
    },
    pillars,
    dayMaster: {
      ...base.dayMaster,
      metaphor: DAY_MASTER_METAPHORS[dayMasterStem],
      description: DAY_MASTER_DESCRIPTIONS[dayMasterStem],
    },
    fiveElements,
    tenGods,
    strength,
    pattern,
    yongsin,
    majorLuck,
    currentLuck,
  };

  return {
    ...next,
    extensions: {
      ...(next.extensions ?? {}),
      orrery: buildOrreryReferenceExtension(next),
    },
  };
}

function classifyElement(
  count: number,
  highest: number,
  lowest: number
): FiveElementState {
  if (count === 0) return 'missing';
  if (count === highest) return 'strong';
  if (count === lowest) return 'weak';
  return 'balanced';
}

function toLegacyPillar(pillar: SajuPillar): LegacyPillar {
  return {
    stem: pillar.stem,
    branch: pillar.branch,
    stemElement: pillar.stemElement,
    branchElement: pillar.branchElement,
    yinYang: pillar.yinYang,
  };
}

function isSajuDataV1(value: unknown): value is SajuDataV1 {
  return (
    isRecord(value) &&
    value.schemaVersion === SAJU_DATA_V1 &&
    isRecord(value.input) &&
    isRecord(value.pillars) &&
    isRecord(value.fiveElements) &&
    isRecord(value.metadata)
  );
}

function isLegacySajuResult(value: unknown): value is LegacySajuResult {
  return (
    isRecord(value) &&
    isRecord(value.year) &&
    isRecord(value.month) &&
    isRecord(value.day) &&
    isRecord(value.elements) &&
    typeof value.dayMaster === 'string' &&
    typeof value.dominantElement === 'string' &&
    typeof value.weakestElement === 'string'
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function shouldPreserveSajuDataV1(value: SajuDataV1) {
  if (value.metadata.source === 'python-engine') {
    return true;
  }

  if (
    value.metadata.source === 'rule-based-typescript' ||
    value.metadata.source === 'orrery-reference'
  ) {
    return Boolean(
      value.tenGods &&
        value.strength &&
        value.pattern &&
        value.yongsin &&
        value.majorLuck &&
        value.currentLuck &&
        value.extensions?.orrery
    );
  }

  return value.metadata.completeness === 'complete';
}

function getPendingSections(base: SajuDataV1): SajuPendingSection[] {
  const pending: SajuPendingSection[] = [];

  if (!base.tenGods) pending.push('tenGods');
  if (!base.strength) pending.push('strength');
  if (!base.pattern) pending.push('pattern');
  if (!base.yongsin) pending.push('yongsin');
  if (!base.majorLuck) pending.push('majorLuck');
  if (!base.currentLuck) pending.push('currentLuck');

  return pending;
}

function enrichPillars(pillars: SajuPillars, dayMasterStem: Stem): SajuPillars {
  return {
    year: enrichPillar(pillars.year, dayMasterStem, false),
    month: enrichPillar(pillars.month, dayMasterStem, false),
    day: enrichPillar(pillars.day, dayMasterStem, true),
    hour: pillars.hour ? enrichPillar(pillars.hour, dayMasterStem, false) : null,
  };
}

function enrichPillar(pillar: SajuPillar, dayMasterStem: Stem, isDayMaster: boolean): SajuPillar {
  const hiddenStems = BRANCH_HIDDEN_STEMS[pillar.branch].map((stem, index) => ({
    stem,
    element: STEM_ELEMENTS[stem],
    order: index + 1,
    tenGod: getTenGod(dayMasterStem, stem),
  }));

  return {
    ...pillar,
    stemTenGod: isDayMaster ? null : getTenGod(dayMasterStem, pillar.stem),
    hiddenStems,
  };
}

function calculateFiveElements(pillars: SajuPillars): SajuFiveElements {
  const counts = initializeElementRecord(0);
  const scores = initializeElementRecord(0);

  for (const pillar of [pillars.year, pillars.month, pillars.day, pillars.hour]) {
    if (!pillar) continue;

    counts[pillar.stemElement] += 1;
    counts[pillar.branchElement] += 1;

    scores[pillar.stemElement] += DAY_STEM_SCORE;
    scores[pillar.branchElement] += BRANCH_SCORE;

    pillar.hiddenStems.forEach((hiddenStem, index) => {
      scores[hiddenStem.element] += HIDDEN_STEM_WEIGHTS[index] ?? DEFAULT_HIDDEN_STEM_WEIGHT;
    });
  }

  const totalCount = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const totalScore = round1(Object.values(scores).reduce((sum, score) => sum + score, 0));
  const scoreValues = Object.values(scores);
  const highest = Math.max(...scoreValues);
  const lowest = Math.min(...scoreValues);
  const dominant = pickExtremum(scores, 'max');
  const weakest = pickExtremum(scores, 'min');

  return {
    byElement: Object.fromEntries(
      ELEMENT_SEQUENCE.map((element) => [
        element,
        {
          count: counts[element],
          score: round1(scores[element]),
          percentage: totalScore > 0 ? round1((scores[element] / totalScore) * 100) : 0,
          state: classifyElementScore(scores[element], highest, lowest),
        },
      ])
    ) as Record<Element, SajuFiveElementValue>,
    dominant,
    weakest,
    totalCount,
    totalScore,
  };
}

function calculateTenGodSummary(pillars: SajuPillars, dayMasterStem: Stem): SajuTenGodSummary {
  const byType = Object.fromEntries(TEN_GOD_KEYS.map((key) => [key, 0])) as Record<TenGodCode, number>;

  addTenGodScore(byType, getTenGod(dayMasterStem, pillars.year.stem), 1);
  addTenGodScore(byType, getTenGod(dayMasterStem, pillars.month.stem), 1);
  addTenGodScore(byType, getTenGod(dayMasterStem, pillars.hour?.stem ?? null), 1);

  for (const pillar of [pillars.year, pillars.month, pillars.day, pillars.hour]) {
    if (!pillar) continue;
    pillar.hiddenStems.forEach((hiddenStem, index) => {
      addTenGodScore(byType, hiddenStem.tenGod, HIDDEN_STEM_WEIGHTS[index] ?? DEFAULT_HIDDEN_STEM_WEIGHT);
    });
  }

  const dominant = (Object.entries(byType) as [TenGodCode, number][])
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    byType: Object.fromEntries(
      TEN_GOD_KEYS.map((key) => [key, round1(byType[key])])
    ) as Record<TenGodCode, number>,
    dominant,
  };
}

function calculateStrength(
  pillars: SajuPillars,
  dayMasterStem: Stem,
  fiveElements: SajuFiveElements
): SajuStrength {
  const dayMasterElement = STEM_ELEMENTS[dayMasterStem];
  const resourceElement = generatorOf(dayMasterElement);
  const outputElement = generatedBy(dayMasterElement);
  const wealthElement = controlledBy(dayMasterElement);
  const officerElement = controllerOf(dayMasterElement);
  const monthSeason = SEASON_BY_BRANCH[pillars.month.branch];
  const seasonElement = SEASON_MAIN_ELEMENT[monthSeason];
  const seasonBonus = getSeasonBonus(dayMasterElement, resourceElement, outputElement, wealthElement, officerElement, seasonElement);
  const rootCount = getRootCount(pillars, dayMasterStem, dayMasterElement);
  const supportScore =
    fiveElements.byElement[dayMasterElement].score +
    fiveElements.byElement[resourceElement].score * 0.85 +
    rootCount * 0.65;
  const drainScore =
    fiveElements.byElement[outputElement].score * 0.7 +
    fiveElements.byElement[wealthElement].score * 0.8 +
    fiveElements.byElement[officerElement].score * 1.0;
  const score = clampScore(50 + seasonBonus + (supportScore - drainScore) * 6);
  const level: StrengthLevel = score >= 67 ? '신강' : score <= 43 ? '신약' : '중화';
  const rationale = [
    buildSeasonRationale(monthSeason, dayMasterElement, seasonElement, seasonBonus),
    `일간(${dayMasterStem})을 돕는 ${formatElementLabel(dayMasterElement)}·${formatElementLabel(resourceElement)} 점수는 ${round1(supportScore)}점, 설기·재성·관성 쪽 소모 점수는 ${round1(drainScore)}점입니다.`,
    `뿌리로 잡히는 지지·지장간은 ${round1(rootCount)}개 수준으로 계산되어 ${level}으로 판정했습니다.`,
  ];

  return {
    level,
    score,
    rationale,
  };
}

function calculatePattern(pillars: SajuPillars, dayMasterStem: Stem): SajuPattern {
  const principal =
    pillars.month.hiddenStems[0] ??
    {
      stem: pillars.month.stem,
      element: STEM_ELEMENTS[pillars.month.stem],
      order: 1,
      tenGod: getTenGod(dayMasterStem, pillars.month.stem),
    };
  const tenGod = principal.tenGod ?? getTenGod(dayMasterStem, principal.stem);
  const name = getPatternName(tenGod);
  const category: PatternCategory | null =
    tenGod === '비견' || tenGod === '겁재' ? '특수격' : '정격';

  return {
    name,
    category,
    tenGod,
    rationale: [
      `${pillars.month.branch} 월지의 주기운을 ${principal.stem}로 보고, 이를 일간(${dayMasterStem}) 기준 십신으로 환산하면 ${tenGod}에 해당합니다.`,
      `${principal.stem}${pillars.month.branch} 월령의 성격을 중심으로 ${name} 방향에서 해석을 시작합니다.`,
    ],
  };
}

function calculateYongsin(
  pillars: SajuPillars,
  dayMasterElement: Element,
  fiveElements: SajuFiveElements,
  strength: SajuStrength
): SajuYongsin {
  const monthSeason = SEASON_BY_BRANCH[pillars.month.branch];
  const seasonalOverride = getSeasonalYongsin(dayMasterElement, monthSeason);

  if (seasonalOverride) {
    return {
      primary: toElementSymbolRef(seasonalOverride.primary),
      secondary: seasonalOverride.secondary.map(toElementSymbolRef),
      kiyshin: seasonalOverride.kiyshin.map(toElementSymbolRef),
      method: '조후용신',
      rationale: [
        seasonalOverride.reason,
        `${pillars.month.branch}월은 ${formatSeasonLabel(monthSeason)}이라 조후를 먼저 보고 ${formatElementLabel(seasonalOverride.primary)}을(를) 우선했습니다.`,
      ],
    };
  }

  if (strength.level === '신강') {
    const output = generatedBy(dayMasterElement);
    const officer = controllerOf(dayMasterElement);
    return {
      primary: toElementSymbolRef(output),
      secondary: [toElementSymbolRef(officer)],
      kiyshin: [toElementSymbolRef(dayMasterElement), toElementSymbolRef(generatorOf(dayMasterElement))],
      method: '억부용신',
      rationale: [
        `일간이 신강으로 계산되어 기운을 덜어내는 설기(${formatElementLabel(output)})와 관성(${formatElementLabel(officer)}) 쪽을 우선했습니다.`,
      ],
    };
  }

  if (strength.level === '신약') {
    const resource = generatorOf(dayMasterElement);
    return {
      primary: toElementSymbolRef(resource),
      secondary: [toElementSymbolRef(dayMasterElement)],
      kiyshin: [toElementSymbolRef(generatedBy(dayMasterElement)), toElementSymbolRef(controllerOf(dayMasterElement))],
      method: '억부용신',
      rationale: [
        `일간이 신약으로 계산되어 일간을 돕는 인성(${formatElementLabel(resource)})과 비겁(${formatElementLabel(dayMasterElement)}) 쪽을 우선했습니다.`,
      ],
    };
  }

  const weakest = fiveElements.weakest;
  return {
    primary: toElementSymbolRef(weakest),
    secondary: [toElementSymbolRef(generatorOf(weakest))],
    kiyshin: [toElementSymbolRef(fiveElements.dominant)],
    method: '희기신보정',
    rationale: [
      `중화 명식으로 보고 가장 약한 ${formatElementLabel(weakest)}을(를) 먼저 보완하는 방향으로 맞췄습니다.`,
    ],
  };
}

function getTenGod(dayMasterStem: Stem, targetStem: Stem | null): TenGodCode | null {
  if (!targetStem) return null;

  const masterElement = STEM_ELEMENTS[dayMasterStem];
  const targetElement = STEM_ELEMENTS[targetStem];
  const samePolarity = isYang(dayMasterStem) === isYang(targetStem);

  if (masterElement === targetElement) {
    return samePolarity ? '비견' : '겁재';
  }

  if (generatedBy(masterElement) === targetElement) {
    return samePolarity ? '식신' : '상관';
  }

  if (controlledBy(masterElement) === targetElement) {
    return samePolarity ? '편재' : '정재';
  }

  if (controllerOf(masterElement) === targetElement) {
    return samePolarity ? '편관' : '정관';
  }

  return samePolarity ? '편인' : '정인';
}

function generatedBy(element: Element): Element {
  return GENERATED_BY_MAP[element];
}

function generatorOf(element: Element): Element {
  return GENERATOR_OF_MAP[element];
}

function controlledBy(element: Element): Element {
  return CONTROLLED_BY_MAP[element];
}

function controllerOf(element: Element): Element {
  return CONTROLLER_OF_MAP[element];
}

function initializeElementRecord(value: number): Record<Element, number> {
  return {
    목: value,
    화: value,
    토: value,
    금: value,
    수: value,
  };
}

function pickExtremum(record: Record<Element, number>, mode: 'max' | 'min'): Element {
  return ELEMENT_SEQUENCE.reduce((picked, current) => {
    if (mode === 'max') {
      return record[current] > record[picked] ? current : picked;
    }

    return record[current] < record[picked] ? current : picked;
  }, ELEMENT_SEQUENCE[0]);
}

function classifyElementScore(
  score: number,
  highest: number,
  lowest: number
): FiveElementState {
  if (score <= 0) return 'missing';
  if (Math.abs(score - highest) < 0.001) return 'strong';
  if (Math.abs(score - lowest) < 0.001) return 'weak';
  return 'balanced';
}

function addTenGodScore(
  byType: Record<TenGodCode, number>,
  key: TenGodCode | null,
  weight: number
) {
  if (!key) return;
  byType[key] += weight;
}

function getRootCount(
  pillars: SajuPillars,
  dayMasterStem: Stem,
  dayMasterElement: Element
) {
  let roots = 0;

  for (const pillar of [pillars.year, pillars.month, pillars.day, pillars.hour]) {
    if (!pillar) continue;

    if (pillar.branchElement === dayMasterElement) roots += 1;
    for (const hiddenStem of pillar.hiddenStems) {
      if (hiddenStem.stem === dayMasterStem) {
        roots += 1;
      } else if (hiddenStem.element === dayMasterElement) {
        roots += 0.5;
      }
    }
  }

  return roots;
}

function getSeasonBonus(
  dayMasterElement: Element,
  resourceElement: Element,
  outputElement: Element,
  wealthElement: Element,
  officerElement: Element,
  seasonElement: Element
) {
  if (seasonElement === dayMasterElement) return 18;
  if (seasonElement === resourceElement) return 10;
  if (seasonElement === outputElement) return -6;
  if (seasonElement === wealthElement) return -8;
  if (seasonElement === officerElement) return -10;
  return 0;
}

function buildSeasonRationale(
  monthSeason: SeasonKey,
  dayMasterElement: Element,
  seasonElement: Element,
  seasonBonus: number
) {
  const direction =
    seasonBonus > 0
      ? '일간을 돕는 계절 보정'
      : seasonBonus < 0
        ? '일간을 누르는 계절 보정'
        : '중립적인 계절 보정';

  return `${formatSeasonLabel(monthSeason)}(${formatElementLabel(seasonElement)})에 태어나 ${direction}이 적용되었습니다. 일간 기준 핵심 오행은 ${formatElementLabel(dayMasterElement)}입니다.`;
}

function getPatternName(tenGod: TenGodCode | null) {
  switch (tenGod) {
    case '비견':
      return '건록격';
    case '겁재':
      return '양인격';
    case '편관':
      return '편관격';
    case '정관':
      return '정관격';
    case '편재':
      return '편재격';
    case '정재':
      return '정재격';
    case '식신':
      return '식신격';
    case '상관':
      return '상관격';
    case '편인':
      return '편인격';
    case '정인':
      return '정인격';
    default:
      return '격국 미확정';
  }
}

function getSeasonalYongsin(dayMasterElement: Element, monthSeason: SeasonKey) {
  const key = `${dayMasterElement}-${monthSeason}` as SeasonalYongsinKey;
  const overrides: Partial<
    Record<
      SeasonalYongsinKey,
      { primary: Element; secondary: Element[]; kiyshin: Element[]; reason: string }
    >
  > = {
    '목-spring': {
      primary: '화',
      secondary: ['금'],
      kiyshin: ['목', '수'],
      reason: '봄 목기는 왕하기 쉬워 화로 발현하고 금으로 다듬는 편이 균형에 유리합니다.',
    },
    '화-summer': {
      primary: '수',
      secondary: ['금'],
      kiyshin: ['화', '목'],
      reason: '한여름 화기는 과열되기 쉬워 수로 식히고 금으로 기운을 정리하는 편이 좋습니다.',
    },
    '토-earth': {
      primary: '목',
      secondary: ['수'],
      kiyshin: ['토', '화'],
      reason: '토기가 무거워지기 쉬운 계절이라 목으로 소통시키고 수로 적당히 윤택을 더하는 편이 좋습니다.',
    },
    '금-autumn': {
      primary: '화',
      secondary: ['목'],
      kiyshin: ['금', '토'],
      reason: '가을 금기는 차고 단단해지기 쉬워 화로 단련하고 목으로 쓰임을 넓히는 편이 유리합니다.',
    },
    '수-winter': {
      primary: '화',
      secondary: ['목'],
      kiyshin: ['수', '금'],
      reason: '겨울 수기는 냉해지기 쉬워 화로 온기를 보태고 목으로 순환을 돕는 편이 좋습니다.',
    },
  };

  return overrides[key] ?? null;
}

function calculateLuckData(
  input: SajuInputSnapshot,
  calculatedAt: string
): Pick<SajuDataV1, 'majorLuck' | 'currentLuck'> {
  const currentDateTime = getLocalDateTime(calculatedAt, input.timezone);
  const currentSolar = Solar.fromYmdHms(
    currentDateTime.year,
    currentDateTime.month,
    currentDateTime.day,
    currentDateTime.hour,
    currentDateTime.minute,
    0
  );
  const currentEightChar = currentSolar.getLunar().getEightChar();
  currentEightChar.setSect(EIGHT_CHAR_SECT);

  const saewoon = {
    ganzi: currentEightChar.getYear(),
    year: currentDateTime.year,
    month: null,
    notes: [`${currentDateTime.year}년 기준 세운입니다.`],
  } satisfies SajuLuckDescriptor;
  const wolwoon = {
    ganzi: currentEightChar.getMonth(),
    year: currentDateTime.year,
    month: currentDateTime.month,
    notes: [
      `${currentDateTime.year}년 ${currentDateTime.month}월 기준 월운입니다.`,
      '절입 기준 월간지를 사용했습니다.',
    ],
  } satisfies SajuLuckDescriptor;

  const genderValue = toYunGender(input.gender);
  if (genderValue === null) {
    return {
      majorLuck: null,
      currentLuck: {
        currentMajorLuck: null,
        saewoon,
        wolwoon,
      },
    };
  }

  const birthSolar = getBirthSolar(input);
  const birthEightChar = birthSolar.getLunar().getEightChar();
  const birthSect = toEightCharSect(input.jasiMethod);
  birthEightChar.setSect(birthSect);

  const yun = birthEightChar.getYun(genderValue, birthSect);
  const rawMajorLuck = yun
    .getDaYun(MAJOR_LUCK_COUNT + 1)
    .filter((cycle) => cycle.getIndex() > 0)
    .slice(0, MAJOR_LUCK_COUNT);
  const majorLuck = rawMajorLuck.map((cycle) => toMajorLuckCycle(cycle, yun.isForward()));
  const currentMajorRaw =
    rawMajorLuck.find(
      (cycle) =>
        currentDateTime.year >= cycle.getStartYear() && currentDateTime.year <= cycle.getEndYear()
    ) ?? null;
  const currentLiuNian =
    currentMajorRaw?.getLiuNian().find((yearFlow) => yearFlow.getYear() === currentDateTime.year) ??
    null;

  return {
    majorLuck,
    currentLuck: {
      currentMajorLuck: currentMajorRaw
        ? toMajorLuckCycle(currentMajorRaw, yun.isForward())
        : null,
      saewoon:
        currentLiuNian === null
          ? saewoon
          : {
              ...saewoon,
              ganzi: currentLiuNian.getGanZhi(),
              notes: [
                `${currentLiuNian.getYear()}년 세운입니다.`,
                `현재 대운 기준 나이는 ${currentLiuNian.getAge()}세로 계산되었습니다.`,
              ],
            },
      wolwoon,
    },
  };
}

function toMajorLuckCycle(
  cycle: {
    getIndex(): number;
    getGanZhi(): string;
    getStartYear(): number;
    getEndYear(): number;
    getStartAge(): number;
    getEndAge(): number;
  },
  isForward: boolean
): SajuMajorLuckCycle {
  return {
    index: cycle.getIndex(),
    ganzi: cycle.getGanZhi(),
    startAge: cycle.getStartAge(),
    endAge: cycle.getEndAge(),
    notes: [
      `${cycle.getStartYear()}년부터 ${cycle.getEndYear()}년까지의 흐름입니다.`,
      `${cycle.getStartAge()}세부터 ${cycle.getEndAge()}세까지 적용됩니다.`,
      `${isForward ? '순행' : '역행'} 대운 기준입니다.`,
      '절기 일수 미세보정 전 기본 계산값입니다.',
    ],
  };
}

function getBirthSolar(input: SajuInputSnapshot) {
  const hour = input.hourKnown ? input.birth.hour ?? UNKNOWN_HOUR : UNKNOWN_HOUR;
  const minute = input.hourKnown
    ? input.birth.minute ?? KNOWN_MINUTE
    : UNKNOWN_MINUTE;

  return Solar.fromYmdHms(
    input.birth.year,
    input.birth.month,
    input.birth.day,
    hour,
    minute,
    0
  );
}

function toEightCharSect(jasiMethod?: JasiMethod | null) {
  return jasiMethod === 'split' ? 1 : EIGHT_CHAR_SECT;
}

function toYunGender(gender: SajuInputSnapshot['gender']): 0 | 1 | null {
  if (gender === 'male') return 1;
  if (gender === 'female') return 0;
  return null;
}

function getLocalDateTime(
  calculatedAt: string,
  timeZone: string
): LocalDateTimeSnapshot {
  const parsed = new Date(calculatedAt);
  const sourceDate = Number.isNaN(parsed.getTime()) ? new Date() : parsed;

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hourCycle: 'h23',
    });
    const parts: Partial<Record<LocalDatePart, number>> = {};

    for (const part of formatter.formatToParts(sourceDate)) {
      if (
        part.type === 'year' ||
        part.type === 'month' ||
        part.type === 'day' ||
        part.type === 'hour' ||
        part.type === 'minute'
      ) {
        parts[part.type] = Number.parseInt(part.value, 10);
      }
    }

    if (
      parts.year !== undefined &&
      parts.month !== undefined &&
      parts.day !== undefined &&
      parts.hour !== undefined &&
      parts.minute !== undefined
    ) {
      return {
        year: parts.year,
        month: parts.month,
        day: parts.day,
        hour: parts.hour,
        minute: parts.minute,
      };
    }
  } catch {
    // Fall back to the UTC timestamp if the stored time zone is unavailable.
  }

  return {
    year: sourceDate.getUTCFullYear(),
    month: sourceDate.getUTCMonth() + 1,
    day: sourceDate.getUTCDate(),
    hour: sourceDate.getUTCHours(),
    minute: sourceDate.getUTCMinutes(),
  };
}

function toElementSymbolRef(element: Element): SajuSymbolRef {
  return {
    type: 'element',
    value: element,
    label: formatElementLabel(element),
  };
}

function formatElementLabel(element: Element) {
  return `${ELEMENT_HANJA[element]} (${element})`;
}

function formatSeasonLabel(season: SeasonKey) {
  return {
    spring: '봄철',
    summer: '여름철',
    autumn: '가을철',
    winter: '겨울철',
    earth: '토왕절',
  }[season];
}

function isYang(stem: Stem) {
  return ['甲', '丙', '戊', '庚', '壬'].includes(stem);
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function clampScore(value: number) {
  return Math.max(5, Math.min(95, Math.round(value)));
}
