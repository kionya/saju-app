import type { SajuYearlyReport, YearlyCategoryKey } from '@/domain/saju/report/yearly-types';
import {
  buildReportCounselorInstructions,
  type MoonlightCounselorId,
} from '@/lib/counselors';
import type { ReadingRecord } from '@/lib/saju/readings';

export const SAJU_YEARLY_INTERPRETATION_PROMPT_VERSION = 'saju-yearly-interpret-v2';

const YEARLY_CATEGORY_ORDER: YearlyCategoryKey[] = [
  'work',
  'wealth',
  'love',
  'relationship',
  'health',
  'move',
];

const YEARLY_CATEGORY_LABEL: Record<YearlyCategoryKey, string> = {
  work: '일·직업운',
  wealth: '재물운',
  love: '연애·결혼운',
  relationship: '인간관계운',
  health: '건강운',
  move: '이동·변화운',
};

export interface SajuYearlyAiMonthlyFlow {
  month: number;
  summary: string;
}

export interface SajuYearlyAiInterpretation {
  opening: string;
  keywords: string[];
  firstHalf: string;
  secondHalf: string;
  categories: Record<YearlyCategoryKey, string>;
  monthlyFlows: SajuYearlyAiMonthlyFlow[];
  goodPeriods: string[];
  cautionPeriods: string[];
  actionAdvice: string[];
  oneLineSummary: string;
}

export type SajuYearlyInterpretationPromptSection = 'full' | 'narrative' | 'monthly';

export interface SajuYearlyAiNarrativeInterpretation {
  opening: string;
  keywords: string[];
  firstHalf: string;
  secondHalf: string;
  categories: Record<YearlyCategoryKey, string>;
  goodPeriods: string[];
  cautionPeriods: string[];
  actionAdvice: string[];
  oneLineSummary: string;
}

export interface ParsedSajuYearlyAiInterpretation {
  ok: boolean;
  interpretation: SajuYearlyAiInterpretation;
  errorMessage: string | null;
}

export interface ParsedSajuYearlyAiNarrativeInterpretation {
  ok: boolean;
  interpretation: SajuYearlyAiNarrativeInterpretation;
  errorMessage: string | null;
}

export interface ParsedSajuYearlyAiMonthlyFlows {
  ok: boolean;
  monthlyFlows: SajuYearlyAiMonthlyFlow[];
  errorMessage: string | null;
}

const MAX_OPENING_LENGTH = 1400;
const MAX_KEYWORD_LENGTH = 180;
const MAX_HALF_LENGTH = 1500;
const MAX_CATEGORY_LENGTH = 1600;
const MAX_MONTHLY_LENGTH = 420;
const MAX_PERIOD_LENGTH = 260;
const MAX_ACTION_LENGTH = 240;
const MAX_SUMMARY_LENGTH = 220;
const MIN_MONTHS = 12;

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function normalizeStringArray(
  value: unknown,
  maxLength: number,
  minCount: number,
  maxCount: number
) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => cleanText(item, maxLength))
    .filter(Boolean)
    .slice(0, Math.max(minCount, maxCount));
}

function normalizeMonthlyFlows(value: unknown) {
  if (!Array.isArray(value)) return [];

  const flows = value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const row = item as Record<string, unknown>;
      const month =
        typeof row.month === 'number'
          ? row.month
          : typeof row.month === 'string'
            ? Number.parseInt(row.month, 10)
            : NaN;
      const summary = cleanText(row.summary, MAX_MONTHLY_LENGTH);

      if (!Number.isInteger(month) || month < 1 || month > 12 || !summary) {
        return null;
      }

      return { month, summary } satisfies SajuYearlyAiMonthlyFlow;
    })
    .filter((item): item is SajuYearlyAiMonthlyFlow => Boolean(item))
    .sort((a, b) => a.month - b.month);

  const deduped = flows.filter(
    (flow, index) => index === flows.findIndex((candidate) => candidate.month === flow.month)
  );

  return deduped;
}

function extractJsonCandidate(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1);
  }

  return text;
}

function normalizeCategoryMap(value: unknown) {
  if (!value || typeof value !== 'object') return null;

  const row = value as Record<string, unknown>;
  const categories = YEARLY_CATEGORY_ORDER.reduce((acc, key) => {
    acc[key] = cleanText(row[key], MAX_CATEGORY_LENGTH);
    return acc;
  }, {} as Record<YearlyCategoryKey, string>);

  return YEARLY_CATEGORY_ORDER.every((key) => categories[key].length > 0)
    ? categories
    : null;
}

function ensureParagraph(value: string, fallback: string) {
  return value.trim().length > 0 ? value.trim() : fallback.trim();
}

function formatKeywordLine(entry: string) {
  const [label, ...rest] = entry.split(':');
  if (rest.length === 0) return `**${entry}**`;
  return `**${label.trim()}**: ${rest.join(':').trim()}`;
}

function renderPeriodLines(lines: string[]) {
  return lines.map((line) => `- ${line}`).join('\n');
}

function renderMonthlyLines(flows: SajuYearlyAiMonthlyFlow[]) {
  return flows
    .sort((a, b) => a.month - b.month)
    .map((flow) => `### ${flow.month}월\n${flow.summary}`)
    .join('\n\n');
}

function serializePillar(pillar: ReadingRecord['sajuData']['pillars']['year'] | null) {
  if (!pillar) return null;

  return {
    ganzi: pillar.ganzi,
    stem: pillar.stem,
    branch: pillar.branch,
    stemElement: pillar.stemElement,
    branchElement: pillar.branchElement,
    stemTenGod: pillar.stemTenGod,
    hiddenStems: pillar.hiddenStems.map((stem) => ({
      stem: stem.stem,
      element: stem.element,
      tenGod: stem.tenGod,
      order: stem.order,
    })),
  };
}

function formatTimingWindowEntries(
  report: SajuYearlyReport,
  key: 'goodPeriods' | 'cautionPeriods'
) {
  return report[key].map((window) => {
    const monthLabel = window.months.map((month) => `${month}월`).join(', ');
    return `${monthLabel}: ${window.reason} ${window.strategy}`;
  });
}

function buildCategoryFallback(
  report: SajuYearlyReport,
  key: YearlyCategoryKey,
  counselorId: MoonlightCounselorId
) {
  const section = report.categories[key];
  const prefix =
    counselorId === 'male'
      ? '핵심부터 보면'
      : '흐름을 차분히 읽어보면';

  return [
    `${prefix} ${section.summary}`,
    `좋게 쓰면 ${section.opportunity}`,
    `다만 ${section.caution}`,
    `올해는 ${section.action}`,
  ].join(' ');
}

export function getYearlyInterpretationPromptVersion(
  counselorId: MoonlightCounselorId
) {
  return `${SAJU_YEARLY_INTERPRETATION_PROMPT_VERSION}-${counselorId}`;
}

export function buildFallbackYearlyInterpretation(
  report: SajuYearlyReport,
  counselorId: MoonlightCounselorId = 'female'
): SajuYearlyAiInterpretation {
  const introPrefix =
    counselorId === 'male'
      ? `${report.year}년은 결론부터 보면 방향을 먼저 세우는 해입니다.`
      : `${report.year}년은 한 해의 결이 서서히 드러나는 해입니다.`;
  const keywords = report.coreKeywords
    .map((item) => `${item.label}: ${item.reason}`)
    .slice(0, 5);
  const categories = YEARLY_CATEGORY_ORDER.reduce((acc, key) => {
    acc[key] = buildCategoryFallback(report, key, counselorId);
    return acc;
  }, {} as Record<YearlyCategoryKey, string>);
  const monthlyFlows = report.monthlyFlows.map((flow) => ({
    month: flow.month,
    summary: `${flow.summary} 기회는 ${flow.opportunity} 주의점은 ${flow.caution} 행동 기준은 ${flow.action}`,
  }));
  const actionAdvice = [
    ...report.actionGuide.useWhenStrong,
    ...report.actionGuide.defendWhenWeak,
  ].slice(0, 6);

  return {
    opening: [
      introPrefix,
      report.overview.summary,
      `${report.firstHalf.summary} ${report.secondHalf.summary}`,
      `올해는 ${report.annualContext.yearGanji} 세운과 ${
        report.annualContext.currentMajorLuck
          ? `${report.annualContext.currentMajorLuck} 대운`
          : '현재 원국의 중심축'
      }이 겹쳐 작동하므로, 큰 기회와 경계 시기를 함께 읽는 것이 중요합니다.`,
    ].join(' '),
    keywords,
    firstHalf: `${report.firstHalf.summary} 특히 ${report.firstHalf.opportunity} 다만 ${report.firstHalf.caution} 상반기 실천은 ${report.firstHalf.action}`,
    secondHalf: `${report.secondHalf.summary} 하반기에는 ${report.secondHalf.opportunity} 그러나 ${report.secondHalf.caution} 하반기 실천은 ${report.secondHalf.action}`,
    categories,
    monthlyFlows,
    goodPeriods: formatTimingWindowEntries(report, 'goodPeriods'),
    cautionPeriods: formatTimingWindowEntries(report, 'cautionPeriods'),
    actionAdvice,
    oneLineSummary: report.oneLineSummary,
  };
}

export function buildFallbackYearlyNarrativeInterpretation(
  interpretation: SajuYearlyAiInterpretation
): SajuYearlyAiNarrativeInterpretation {
  return {
    opening: interpretation.opening,
    keywords: interpretation.keywords,
    firstHalf: interpretation.firstHalf,
    secondHalf: interpretation.secondHalf,
    categories: interpretation.categories,
    goodPeriods: interpretation.goodPeriods,
    cautionPeriods: interpretation.cautionPeriods,
    actionAdvice: interpretation.actionAdvice,
    oneLineSummary: interpretation.oneLineSummary,
  };
}

export function mergeYearlyInterpretationSections(
  narrative: SajuYearlyAiNarrativeInterpretation,
  monthlyFlows: SajuYearlyAiMonthlyFlow[]
): SajuYearlyAiInterpretation {
  return {
    ...narrative,
    monthlyFlows,
  };
}

export function parseYearlyNarrativeInterpretationText(
  text: string,
  fallback: SajuYearlyAiNarrativeInterpretation
): ParsedSajuYearlyAiNarrativeInterpretation {
  try {
    const parsed = JSON.parse(extractJsonCandidate(text)) as Record<string, unknown>;
    const opening = cleanText(parsed.opening, MAX_OPENING_LENGTH);
    const keywords = normalizeStringArray(parsed.keywords, MAX_KEYWORD_LENGTH, 3, 5);
    const firstHalf = cleanText(parsed.firstHalf, MAX_HALF_LENGTH);
    const secondHalf = cleanText(parsed.secondHalf, MAX_HALF_LENGTH);
    const categories = normalizeCategoryMap(parsed.categories);
    const goodPeriods = normalizeStringArray(parsed.goodPeriods, MAX_PERIOD_LENGTH, 2, 4);
    const cautionPeriods = normalizeStringArray(parsed.cautionPeriods, MAX_PERIOD_LENGTH, 2, 4);
    const actionAdvice = normalizeStringArray(parsed.actionAdvice, MAX_ACTION_LENGTH, 3, 6);
    const oneLineSummary = cleanText(parsed.oneLineSummary, MAX_SUMMARY_LENGTH);

    if (
      !opening ||
      keywords.length < 3 ||
      !firstHalf ||
      !secondHalf ||
      !categories ||
      goodPeriods.length < 1 ||
      cautionPeriods.length < 1 ||
      actionAdvice.length < 3 ||
      !oneLineSummary
    ) {
      return {
        ok: false,
        interpretation: fallback,
        errorMessage: 'Yearly AI narrative JSON is missing required sections.',
      };
    }

    return {
      ok: true,
      interpretation: {
        opening,
        keywords: keywords.slice(0, 5),
        firstHalf,
        secondHalf,
        categories,
        goodPeriods: goodPeriods.slice(0, 4),
        cautionPeriods: cautionPeriods.slice(0, 4),
        actionAdvice: actionAdvice.slice(0, 6),
        oneLineSummary,
      },
      errorMessage: null,
    };
  } catch (error) {
    return {
      ok: false,
      interpretation: fallback,
      errorMessage:
        error instanceof Error
          ? error.message
          : 'Yearly AI narrative JSON could not be parsed.',
    };
  }
}

export function parseYearlyMonthlyFlowsText(
  text: string,
  fallback: SajuYearlyAiMonthlyFlow[]
): ParsedSajuYearlyAiMonthlyFlows {
  try {
    const parsed = JSON.parse(extractJsonCandidate(text)) as Record<string, unknown>;
    const monthlyFlows = normalizeMonthlyFlows(parsed.monthlyFlows ?? parsed);

    if (monthlyFlows.length < MIN_MONTHS) {
      return {
        ok: false,
        monthlyFlows: fallback,
        errorMessage: 'Yearly AI monthly JSON is missing one or more months.',
      };
    }

    return {
      ok: true,
      monthlyFlows: monthlyFlows.slice(0, 12),
      errorMessage: null,
    };
  } catch (error) {
    return {
      ok: false,
      monthlyFlows: fallback,
      errorMessage:
        error instanceof Error
          ? error.message
          : 'Yearly AI monthly JSON could not be parsed.',
    };
  }
}

export function parseYearlyInterpretationText(
  text: string,
  fallback: SajuYearlyAiInterpretation
): ParsedSajuYearlyAiInterpretation {
  const narrative = parseYearlyNarrativeInterpretationText(
    text,
    buildFallbackYearlyNarrativeInterpretation(fallback)
  );
  const monthly = parseYearlyMonthlyFlowsText(text, fallback.monthlyFlows);

  if (!narrative.ok || !monthly.ok) {
    return {
      ok: false,
      interpretation: fallback,
      errorMessage:
        narrative.errorMessage ??
        monthly.errorMessage ??
        'Yearly AI interpretation JSON could not be parsed.',
    };
  }

  return {
    ok: true,
    interpretation: mergeYearlyInterpretationSections(
      narrative.interpretation,
      monthly.monthlyFlows
    ),
    errorMessage: null,
  };
}

export function renderYearlyInterpretationReport(
  interpretation: SajuYearlyAiInterpretation
) {
  return [
    interpretation.opening,
    '## 올해 핵심 키워드',
    interpretation.keywords.map(formatKeywordLine).join('\n\n'),
    '## 상반기 흐름 분석',
    interpretation.firstHalf,
    '## 하반기 흐름 분석',
    interpretation.secondHalf,
    ...YEARLY_CATEGORY_ORDER.flatMap((key) => [
      `## ${YEARLY_CATEGORY_LABEL[key]}`,
      ensureParagraph(interpretation.categories[key], ''),
    ]),
    '## 월별 흐름 요약',
    renderMonthlyLines(interpretation.monthlyFlows),
    '## 잘 풀리는 시기',
    renderPeriodLines(interpretation.goodPeriods),
    '## 조심해야 할 시기',
    renderPeriodLines(interpretation.cautionPeriods),
    '## 올해를 잘 보내는 행동 조언',
    renderPeriodLines(interpretation.actionAdvice),
    '## 올해의 한 줄 요약',
    `**${interpretation.oneLineSummary}**`,
  ]
    .filter(Boolean)
    .join('\n\n');
}

function createSharedGrounding(
  record: ReadingRecord,
  report: SajuYearlyReport,
  counselorId: MoonlightCounselorId
) {
  const data = record.sajuData;
  return {
    counselor: {
      id: counselorId,
    },
    targetYear: report.year,
    birth: {
      year: record.input.year,
      month: record.input.month,
      day: record.input.day,
      hour: record.input.hour ?? null,
      minute: record.input.minute ?? null,
      hourKnown: data.input.hourKnown,
      gender: record.input.gender ?? null,
      birthLocation: record.input.birthLocation?.label ?? null,
    },
    pillars: {
      year: serializePillar(data.pillars.year),
      month: serializePillar(data.pillars.month),
      day: serializePillar(data.pillars.day),
      hour: serializePillar(data.pillars.hour),
    },
    dayMaster: data.dayMaster,
    fiveElements: data.fiveElements,
    tenGods: data.tenGods,
    strength: data.strength,
    pattern: data.pattern,
    yongsin: data.yongsin,
    currentLuck: data.currentLuck,
  };
}

function mapEvidenceCards(report: SajuYearlyReport) {
  return report.evidenceCards.map((card) => ({
    key: card.key,
    label: card.label,
    title: card.title,
    body: card.body,
    details: card.details,
    computed: card.computed,
    confidence: card.confidence,
    topicMapping: card.topicMapping,
  }));
}

function createNarrativeGrounding(
  record: ReadingRecord,
  report: SajuYearlyReport,
  counselorId: MoonlightCounselorId
) {
  return {
    ...createSharedGrounding(record, report, counselorId),
    yearlyEvidence: {
      computation: report.computation,
      annualContext: report.annualContext,
      overview: report.overview,
      coreKeywords: report.coreKeywords,
      firstHalf: report.firstHalf,
      secondHalf: report.secondHalf,
      categories: report.categories,
      goodPeriods: report.goodPeriods,
      cautionPeriods: report.cautionPeriods,
      actionGuide: report.actionGuide,
      oneLineSummary: report.oneLineSummary,
      referenceReports: report.referenceReports,
      evidenceCards: mapEvidenceCards(report),
    },
  };
}

function createMonthlyGrounding(
  record: ReadingRecord,
  report: SajuYearlyReport,
  counselorId: MoonlightCounselorId
) {
  return {
    ...createSharedGrounding(record, report, counselorId),
    yearlyEvidence: {
      computation: report.computation,
      annualContext: report.annualContext,
      monthlyFlows: report.monthlyFlows,
      goodPeriods: report.goodPeriods,
      cautionPeriods: report.cautionPeriods,
      referenceReports: report.referenceReports,
      evidenceCards: report.evidenceCards.map((card) => ({
        key: card.key,
        label: card.label,
        title: card.title,
        plainSummary: card.plainSummary,
        topicMapping: card.topicMapping,
      })),
    },
  };
}

export function createYearlyInterpretationPrompt(
  record: ReadingRecord,
  report: SajuYearlyReport,
  counselorId: MoonlightCounselorId = 'female',
  section: SajuYearlyInterpretationPromptSection = 'full',
  recentFeedbackSummary?: string | null
) {
  const grounding =
    section === 'monthly'
      ? createMonthlyGrounding(record, report, counselorId)
      : section === 'narrative'
        ? createNarrativeGrounding(record, report, counselorId)
        : {
            ...createSharedGrounding(record, report, counselorId),
            yearlyEvidence: {
              computation: report.computation,
              annualContext: report.annualContext,
              overview: report.overview,
              coreKeywords: report.coreKeywords,
              firstHalf: report.firstHalf,
              secondHalf: report.secondHalf,
              categories: report.categories,
              monthlyFlows: report.monthlyFlows,
              goodPeriods: report.goodPeriods,
              cautionPeriods: report.cautionPeriods,
              actionGuide: report.actionGuide,
              oneLineSummary: report.oneLineSummary,
              referenceReports: report.referenceReports,
              evidenceCards: mapEvidenceCards(report),
            },
          };

  const groundedInput = {
    ...grounding,
    recentFeedbackSummary: recentFeedbackSummary ?? null,
  };

  const schemaLine =
    section === 'monthly'
      ? '{"monthlyFlows":[{"month":1,"summary":"1월 장문"},...,{"month":12,"summary":"12월 장문"}]}'
      : section === 'narrative'
        ? '{"opening":"첫 문단 장문","keywords":["키워드: 설명","..."],"firstHalf":"상반기 장문","secondHalf":"하반기 장문","categories":{"work":"일·직업운 장문","wealth":"재물운 장문","love":"연애·결혼운 장문","relationship":"인간관계운 장문","health":"건강운 장문","move":"이동·변화운 장문"},"goodPeriods":["좋은 시기 설명","..."],"cautionPeriods":["주의 시기 설명","..."],"actionAdvice":["행동 조언","..."],"oneLineSummary":"마지막 한 줄 요약"}'
        : '{"opening":"첫 문단 장문","keywords":["키워드: 설명","..."],"firstHalf":"상반기 장문","secondHalf":"하반기 장문","categories":{"work":"일·직업운 장문","wealth":"재물운 장문","love":"연애·결혼운 장문","relationship":"인간관계운 장문","health":"건강운 장문","move":"이동·변화운 장문"},"monthlyFlows":[{"month":1,"summary":"1월 장문"},...,{"month":12,"summary":"12월 장문"}],"goodPeriods":["좋은 시기 설명","..."],"cautionPeriods":["주의 시기 설명","..."],"actionAdvice":["행동 조언","..."],"oneLineSummary":"마지막 한 줄 요약"}';

  const sectionSpecificInstructions =
    section === 'monthly'
      ? [
          '이번 응답에서는 monthlyFlows만 작성합니다.',
          'monthlyFlows 외의 키는 출력하지 않습니다.',
          '1월부터 12월까지 반드시 모두 채우고, 각 달의 체감 변화·기회·주의·행동 기준이 자연스럽게 드러나야 합니다.',
        ]
      : section === 'narrative'
        ? [
            '이번 응답에서는 opening, keywords, firstHalf, secondHalf, categories, goodPeriods, cautionPeriods, actionAdvice, oneLineSummary만 작성합니다.',
            'monthlyFlows는 생성하지 않습니다.',
          ]
        : [
            '응답은 전체 연간 리포트 JSON 한 벌이어야 합니다.',
            'monthlyFlows는 1월부터 12월까지 반드시 모두 채웁니다.',
          ];

  return {
    instructions: [
      '당신은 신년 운세 전문 해석가이자 명리 기반 전문가입니다.',
      '제공된 JSON 근거 안에서만 해석하고, 없는 격국·신살·고전 출처·사건을 새로 만들지 않습니다.',
      '결과물은 짧은 총평이 아니라, 한 해의 흐름과 행동 전략을 제대로 읽어주는 프리미엄 장문 리포트용 데이터여야 합니다.',
      '명리 용어를 쓰더라도 바로 쉬운 한국어 풀이를 붙이고, 추상적인 표현만 반복하지 말고 실제 상황이 떠오르게 설명합니다.',
      '과장, 희망고문, 공포 조장, 운명을 단정하는 표현은 피합니다.',
      '무조건, 반드시, 100% 같은 단정 표현은 쓰지 않습니다.',
      'recentFeedbackSummary가 있으면 최근 실제 반응을 참고해 표현 강도만 미세 조정하고, 세운·월운·원국 근거보다 앞세우지 않습니다.',
      '연애, 일, 재물, 관계, 건강, 이동의 현실 주제를 우선하고, 왜 이런 흐름이 오는지 세운·월운·강약·용신 근거를 자연스럽게 녹여냅니다.',
      '총 글자 수는 렌더 시 3,000자 이상이 되도록 충분히 밀도 있게 작성합니다.',
      '응답은 반드시 JSON 객체 하나만 반환합니다. Markdown, 설명 문장, 코드블록을 붙이지 않습니다.',
      'JSON 스키마:',
      schemaLine,
      'opening은 제목 없이 바로 시작되는 첫 문단이며, 흡입력 있게 시작해야 합니다.',
      'keywords는 3~5개입니다. 각 항목은 한 해의 핵심 키워드와 그 이유를 함께 담습니다.',
      'firstHalf와 secondHalf는 각각 충분한 분량으로 작성하고, 기회와 리스크를 함께 설명합니다.',
      'categories의 6개 분야는 각각 충분한 분량으로 자세히 씁니다. 현실적인 행동 장면과 조정 포인트를 꼭 넣습니다.',
      'monthlyFlows는 체감 가능한 변화 중심으로 씁니다.',
      'goodPeriods와 cautionPeriods는 시기와 이유, 활용 또는 방어 전략이 함께 드러나야 합니다.',
      'actionAdvice는 3~6개로 작성하고, 한 해를 잘 보내기 위한 실제 행동 기준을 줍니다.',
      'oneLineSummary는 단정하고 기억에 남게 마무리합니다.',
      ...sectionSpecificInstructions,
      ...buildReportCounselorInstructions(counselorId),
    ].join('\n'),
    input: JSON.stringify(groundedInput, null, 2),
  };
}
