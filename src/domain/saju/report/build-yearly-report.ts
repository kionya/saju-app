import { Solar } from 'lunar-typescript';
import {
  calculateSajuDataV1,
  type SajuDataV1,
} from '@/domain/saju/engine/saju-data-v1';
import {
  ELEMENT_INFO,
  getLuckyElementsFromSajuData,
  getPersonalityFromSajuData,
} from '@/lib/saju/elements';
import type { BirthInput, Branch, Element, Stem } from '@/lib/saju/types';
import {
  buildSajuReport,
  FOCUS_TOPIC_META,
} from './build-report';
import type { FocusTopic, ReportScore, SajuReport } from './types';
import type {
  SajuYearlyReport,
  YearlyActionGuide,
  YearlyCategoryKey,
  YearlyCategorySection,
  YearlyComputationMeta,
  YearlyFlowContext,
  YearlyHalfFlow,
  YearlyKeyword,
  YearlyMomentum,
  YearlyMonthFlow,
  YearlyReferenceReport,
  YearlyReferenceTopic,
  YearlyTimingWindow,
} from './yearly-types';

const YEARLY_REFERENCE_TOPICS: YearlyReferenceTopic[] = [
  'today',
  'love',
  'wealth',
  'career',
  'relationship',
];

const STEM_ELEMENT_MAP: Record<Stem, Element> = {
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

const BRANCH_ELEMENT_MAP: Record<Branch, Element> = {
  '子': '수',
  '丑': '토',
  '寅': '목',
  '卯': '목',
  '辰': '토',
  '巳': '화',
  '午': '화',
  '未': '토',
  '申': '금',
  '酉': '금',
  '戌': '토',
  '亥': '수',
};

export const YEARLY_CATEGORY_ORDER: YearlyCategoryKey[] = [
  'work',
  'wealth',
  'love',
  'relationship',
  'health',
  'move',
];

const CATEGORY_MONTH_MAP: Record<YearlyCategoryKey, number[]> = {
  work: [2, 3, 7, 9, 12],
  wealth: [2, 7, 8, 9, 11],
  love: [3, 4, 5, 10],
  relationship: [1, 4, 10, 11],
  health: [1, 6, 11, 12],
  move: [5, 6, 10, 12],
};

const MONTH_AREA_PLAN: Record<
  number,
  { relatedAreas: YearlyCategoryKey[]; theme: string }
> = {
  1: { relatedAreas: ['health', 'relationship'], theme: '한 해의 리듬과 관계의 온도를 정리하는 달' },
  2: { relatedAreas: ['work', 'wealth'], theme: '판을 세우고 돈과 일의 기준을 잡는 달' },
  3: { relatedAreas: ['work', 'love'], theme: '실행과 표현이 함께 움직이는 달' },
  4: { relatedAreas: ['love', 'relationship'], theme: '가까운 관계의 거리감이 중요해지는 달' },
  5: { relatedAreas: ['love', 'move'], theme: '표현과 변화 욕구가 함께 커지는 달' },
  6: { relatedAreas: ['health', 'move'], theme: '속도 조절과 생활 리듬 점검이 필요한 달' },
  7: { relatedAreas: ['work', 'wealth'], theme: '성과와 계산이 현실화되는 달' },
  8: { relatedAreas: ['wealth', 'work'], theme: '정산과 수익 구조를 손보는 달' },
  9: { relatedAreas: ['work', 'relationship'], theme: '평가와 협업의 균형을 맞추는 달' },
  10: { relatedAreas: ['relationship', 'move'], theme: '사람과 자리의 변화를 조정하는 달' },
  11: { relatedAreas: ['health', 'wealth'], theme: '체력과 지출 구조를 함께 다듬는 달' },
  12: { relatedAreas: ['health', 'work'], theme: '마무리와 재정비가 우선되는 달' },
};

const YEARLY_CATEGORY_LABEL: Record<YearlyCategoryKey, string> = {
  work: '일·직업',
  wealth: '재물',
  love: '연애',
  relationship: '인간관계',
  health: '건강',
  move: '이동·변화',
};

interface MonthlyEvidenceBundle {
  month: number;
  referenceDate: string;
  data: SajuDataV1;
  context: YearlyFlowContext;
  reports: ReturnType<typeof getReportMap>;
  categories: Record<YearlyCategoryKey, YearlyCategorySection>;
}

function compactStrings(values: Array<string | null | undefined | false>) {
  return values
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter(Boolean);
}

function getElementShortLabel(element: Element) {
  return ELEMENT_INFO[element].name.split(' ')[0] ?? element;
}

function formatElementList(elements: Element[]) {
  return [...new Set(elements)].map(getElementShortLabel).join(' · ');
}

function getGanziElements(ganzi?: string | null) {
  if (!ganzi) return [];

  const [gan, ji] = Array.from(ganzi);
  const elements = [
    STEM_ELEMENT_MAP[gan as Stem],
    BRANCH_ELEMENT_MAP[ji as Branch],
  ].filter((element): element is Element => Boolean(element));

  return [...new Set(elements)];
}

function getCategoryScore(section: YearlyCategorySection) {
  return section.score ?? 68;
}

function formatCategoryScores(
  areas: YearlyCategoryKey[],
  categories: Record<YearlyCategoryKey, YearlyCategorySection>
) {
  return areas
    .map((area) => `${YEARLY_CATEGORY_LABEL[area]} ${getCategoryScore(categories[area])}점`)
    .join(' · ');
}

function toYearlyReferenceDate(targetYear: number, month = 6) {
  return `${targetYear}-${String(month).padStart(2, '0')}-15T12:00:00.000Z`;
}

function getYearGanji(targetYear: number, targetData: SajuDataV1) {
  return (
    targetData.currentLuck?.saewoon?.ganzi ??
    Solar.fromYmd(targetYear, 6, 15).getLunar().getYearInGanZhi()
  );
}

function getFocusedScore(report: SajuReport) {
  return (
    report.scores.find((score) => score.key === report.focusScoreKey)?.score ?? null
  );
}

function createReferenceReport(
  topic: YearlyReferenceTopic,
  report: SajuReport
): YearlyReferenceReport {
  return {
    topic,
    focusLabel: FOCUS_TOPIC_META[topic].label,
    headline: report.headline,
    summary: report.summary,
    score: getFocusedScore(report),
    primaryAction: report.primaryAction.description,
    cautionAction: report.cautionAction.description,
    highlights: report.summaryHighlights,
    timeline: report.timeline,
    luckyDates: report.luckyDates,
    cautionDates: report.cautionDates,
  };
}

function getReportMap(input: BirthInput, targetData: SajuDataV1) {
  const today = buildSajuReport(input, targetData, 'today');
  const love = buildSajuReport(input, targetData, 'love');
  const wealth = buildSajuReport(input, targetData, 'wealth');
  const career = buildSajuReport(input, targetData, 'career');
  const relationship = buildSajuReport(input, targetData, 'relationship');

  return { today, love, wealth, career, relationship };
}

function buildMonthlyEvidence(
  input: BirthInput,
  sourceData: SajuDataV1,
  targetYear: number,
  month: number
): MonthlyEvidenceBundle {
  const referenceDate = toYearlyReferenceDate(targetYear, month);
  const data = calculateSajuDataV1(input, {
    timezone: sourceData.input.timezone,
    location: sourceData.input.location,
    calculatedAt: referenceDate,
    engineVersion: 'legacy-typescript-v1-yearly-monthly',
  });
  const context = createYearlyContext(targetYear, data);
  const reports = getReportMap(input, data);
  const categories = createCategorySections(reports, data, context);

  return {
    month,
    referenceDate,
    data,
    context,
    reports,
    categories,
  };
}

function createYearlyContext(
  targetYear: number,
  targetData: SajuDataV1
): YearlyFlowContext {
  const supportElements = getLuckyElementsFromSajuData(targetData);
  const cautionElements = [targetData.fiveElements.weakest];
  const yongsinLabels = targetData.yongsin
    ? [targetData.yongsin.primary, ...targetData.yongsin.secondary].map(
        (symbol) => symbol.label
      )
    : [];

  return {
    yearGanji: getYearGanji(targetYear, targetData),
    currentMajorLuck: targetData.currentLuck?.currentMajorLuck?.ganzi ?? null,
    strength: targetData.strength?.level ?? null,
    pattern: targetData.pattern?.name ?? null,
    yongsinLabels: [...new Set(yongsinLabels)],
    supportElements,
    cautionElements,
  };
}

function createComputationMeta(
  targetYear: number,
  timezone: string
): YearlyComputationMeta {
  return {
    detailLevel: 'monthly-evidence',
    monthlyPrecision: 'monthly-ganji',
    referenceDate: toYearlyReferenceDate(targetYear),
    timezone,
  };
}

function createYearlyKeywords(
  context: YearlyFlowContext,
  targetData: SajuDataV1
): YearlyKeyword[] {
  const dominant = getElementShortLabel(targetData.fiveElements.dominant);
  const weakest = getElementShortLabel(targetData.fiveElements.weakest);
  const support = formatElementList(context.supportElements);

  return compactStrings([
    context.yearGanji ? `${context.yearGanji}|해 전체를 읽는 가장 큰 바탕입니다.` : null,
    support ? `${support}|부족한 축을 살리고 기회를 넓히는 보완 포인트입니다.` : null,
    weakest ? `${weakest} 보완|과하거나 비어 있는 부분을 다듬어야 흐름이 오래 갑니다.` : null,
    context.pattern
      ? `${context.pattern}|반복해서 맡게 되는 역할과 책임의 결을 보여줍니다.`
      : null,
    context.strength
      ? `${context.strength}|올해 밀어붙일지, 조율할지의 기준이 됩니다.`
      : null,
    dominant ? `${dominant} 활용|가장 익숙하고 강한 기운을 어떻게 잘 써야 하는지 알려줍니다.` : null,
  ])
    .slice(0, 5)
    .map((entry) => {
      const [label, reason] = entry.split('|');
      return {
        label: label ?? '',
        reason: reason ?? '',
      };
    });
}

function createOverview(
  context: YearlyFlowContext,
  reports: ReturnType<typeof getReportMap>,
  targetData: SajuDataV1
) {
  const personality = getPersonalityFromSajuData(targetData);
  const support = formatElementList(context.supportElements);
  const caution = formatElementList(context.cautionElements);

  return {
    headline: `${context.yearGanji} 흐름에서 올해의 중심축을 먼저 세워야 합니다.`,
    summary: compactStrings([
      `${personality} ${reports.today.summaryHighlights[0] ?? reports.today.summary}`,
      context.currentMajorLuck
        ? `현재는 ${context.currentMajorLuck} 대운 위에 ${context.yearGanji} 세운이 겹쳐 들어오는 구조라, 올해는 단기 성과보다 흐름의 방향을 먼저 읽는 편이 좋습니다.`
        : `올해는 ${context.yearGanji} 세운이 전면으로 들어오므로, 원국의 강약과 용신을 기준으로 한 해의 선택을 조율하는 편이 좋습니다.`,
      support
        ? `${support} 기운은 기회 활용의 축이고, ${caution || '과해지는 축'}은 조절 포인트로 보시면 됩니다.`
        : null,
    ]).join(' '),
    basis: compactStrings([
      `일간 기준 성향: ${targetData.dayMaster.description ?? targetData.dayMaster.metaphor}`,
      context.strength ? `강약: ${context.strength}` : null,
      context.pattern ? `격국: ${context.pattern}` : null,
      context.yongsinLabels.length > 0
        ? `용신·보완축: ${context.yongsinLabels.join(' · ')}`
        : null,
      reports.today.evidenceCards[0]?.title
        ? `핵심 근거: ${reports.today.evidenceCards[0].label} ${reports.today.evidenceCards[0].title}`
        : null,
    ]),
  };
}

function createCategorySectionFromReport(
  key: YearlyCategoryKey,
  report: SajuReport
): YearlyCategorySection {
  return {
    key,
    headline: report.headline,
    summary: report.summary,
    opportunity: report.primaryAction.description,
    caution: report.cautionAction.description,
    action: report.primaryAction.description,
    score: getFocusedScore(report) ?? undefined,
    relatedMonths: CATEGORY_MONTH_MAP[key],
    basis: compactStrings([
      report.summaryHighlights[0],
      report.summaryHighlights[1],
      report.evidenceCards[0]?.title
        ? `${report.evidenceCards[0].label}: ${report.evidenceCards[0].title}`
        : null,
      report.timeline[0]?.headline ? `${report.timeline[0].label}: ${report.timeline[0].headline}` : null,
    ]),
  };
}

function createHealthSection(
  reports: ReturnType<typeof getReportMap>,
  targetData: SajuDataV1,
  context: YearlyFlowContext
): YearlyCategorySection {
  const dominant = getElementShortLabel(targetData.fiveElements.dominant);
  const weakest = getElementShortLabel(targetData.fiveElements.weakest);

  return {
    key: 'health',
    headline: `건강운은 무리한 확장보다 생활 리듬을 일정하게 붙드는 쪽이 좋습니다.`,
    summary: compactStrings([
      `${dominant} 기운이 앞에 서는 명식이라 과열되거나 한쪽으로 치우칠 때 피로가 쌓이기 쉽습니다.`,
      `${weakest} 보완이 필요한 해라 수면, 식사, 움직임처럼 반복 가능한 루틴을 먼저 고정하는 편이 좋습니다.`,
      reports.today.cautionAction.description,
    ]).join(' '),
    opportunity: `보완축 ${formatElementList(context.supportElements)}를 생활 습관으로 옮기면 체감 회복력이 올라갑니다.`,
    caution: `운세 해석보다 실제 증상과 회복 신호를 먼저 보셔야 합니다. 특히 과로와 수면 불균형은 오래 끌지 않는 편이 좋습니다.`,
    action: `무리한 계획보다 반복 가능한 루틴을 먼저 고정하세요. 생활 리듬을 버티는 방식으로 접근하는 편이 유리합니다.`,
    score: reports.today.scores.find((score) => score.key === 'overall')?.score ?? undefined,
    relatedMonths: CATEGORY_MONTH_MAP.health,
    basis: compactStrings([
      `강한 오행: ${dominant}`,
      `보완 오행: ${weakest}`,
      context.yongsinLabels.length > 0
        ? `용신·보완축: ${context.yongsinLabels.join(' · ')}`
        : null,
      reports.today.evidenceCards.find((card) => card.key === 'strength')?.title ?? null,
    ]),
  };
}

function createMoveSection(
  reports: ReturnType<typeof getReportMap>,
  context: YearlyFlowContext
): YearlyCategorySection {
  return {
    key: 'move',
    headline: `이동과 변화운은 성급한 점프보다 순서를 설계하는 쪽이 더 잘 맞습니다.`,
    summary: compactStrings([
      context.currentMajorLuck
        ? `${context.currentMajorLuck} 대운 위에서 ${context.yearGanji} 세운이 겹치므로, 자리를 바꾸거나 생활 패턴을 크게 손댈 때는 명분과 timing을 같이 보는 편이 좋습니다.`
        : `${context.yearGanji} 세운에서는 변화 욕구가 커질 수 있어도, 이유와 순서를 함께 세우는 편이 더 안정적입니다.`,
      reports.career.summaryHighlights[0] ?? reports.career.summary,
      reports.relationship.summaryHighlights[0] ?? reports.relationship.summary,
    ]).join(' '),
    opportunity: `일과 관계의 판이 같이 움직일 때가 기회입니다. 제안, 이동, 협업 변화는 준비된 근거가 있을수록 힘을 받습니다.`,
    caution: `계약, 이사, 자리 이동은 감정이 올라온 날 바로 확정하기보다 한 번 더 검토하는 편이 좋습니다.`,
    action: `변화는 세 단계로 나누세요. 정보 확인, 조건 비교, 실행 날짜 확정 순서로 가면 흔들림이 줄어듭니다.`,
    relatedMonths: CATEGORY_MONTH_MAP.move,
    basis: compactStrings([
      context.currentMajorLuck ? `현재 대운: ${context.currentMajorLuck}` : null,
      `세운: ${context.yearGanji}`,
      reports.relationship.evidenceCards.find((card) => card.key === 'relations')?.title ?? null,
      reports.career.timeline[1]?.headline ?? null,
    ]),
  };
}

function createCategorySections(
  reports: ReturnType<typeof getReportMap>,
  targetData: SajuDataV1,
  context: YearlyFlowContext
): Record<YearlyCategoryKey, YearlyCategorySection> {
  return {
    work: createCategorySectionFromReport('work', reports.career),
    wealth: createCategorySectionFromReport('wealth', reports.wealth),
    love: createCategorySectionFromReport('love', reports.love),
    relationship: createCategorySectionFromReport('relationship', reports.relationship),
    health: createHealthSection(reports, targetData, context),
    move: createMoveSection(reports, context),
  };
}

function getMonthlyMomentum(
  monthly: MonthlyEvidenceBundle
): YearlyMomentum {
  const plan = MONTH_AREA_PLAN[monthly.month];
  const monthElements = getGanziElements(monthly.data.currentLuck?.wolwoon?.ganzi);
  const supportMatch = monthElements.some((element) =>
    monthly.context.supportElements.includes(element)
  );
  const cautionMatch = monthElements.some((element) =>
    monthly.context.cautionElements.includes(element)
  );
  const areaScores = plan.relatedAreas
    .map((area) => getCategoryScore(monthly.categories[area]))
    .sort((a, b) => b - a);
  const strongestAreaScore = areaScores[0] ?? 68;
  const weakestAreaScore = areaScores[areaScores.length - 1] ?? 68;

  if (supportMatch && strongestAreaScore >= 72) {
    return 'rise';
  }

  if (cautionMatch || weakestAreaScore <= 62) {
    return 'caution';
  }

  if (strongestAreaScore >= 78) {
    return 'rise';
  }

  return 'steady';
}

function createMonthlyFlow(
  monthly: MonthlyEvidenceBundle
): YearlyMonthFlow {
  const plan = MONTH_AREA_PLAN[monthly.month];
  const momentum = getMonthlyMomentum(monthly);
  const primary = monthly.categories[plan.relatedAreas[0]];
  const secondary = monthly.categories[plan.relatedAreas[1]];
  const monthlyGanji = monthly.data.currentLuck?.wolwoon?.ganzi ?? null;
  const monthlyElements = getGanziElements(monthlyGanji);
  const monthlyElementLabel = formatElementList(monthlyElements);
  const yearlyGanji = monthly.data.currentLuck?.saewoon?.ganzi ?? monthly.context.yearGanji;
  const focusLabel = plan.relatedAreas.map((area) => YEARLY_CATEGORY_LABEL[area]).join(' · ');
  const theme =
    monthlyGanji && monthlyElementLabel
      ? `${monthlyGanji} 월운이 ${plan.theme}`
      : plan.theme;

  const summary =
    momentum === 'rise'
      ? `${monthly.month}월은 ${monthlyGanji ?? '이번 달'} 흐름이 ${focusLabel}에 힘을 싣는 달입니다. ${primary.summary.split('. ')[0]?.replace(/\.$/, '')} 쪽을 실제 성과로 연결하기 좋습니다.`
      : momentum === 'caution'
        ? `${monthly.month}월은 ${monthlyGanji ?? '이번 달'} 흐름이 예민하게 작동해 ${focusLabel}에서 판단이 흔들리기 쉬운 달입니다. ${secondary.caution.replace(/\.$/, '')} 장면을 먼저 줄이는 편이 좋습니다.`
        : `${monthly.month}월은 ${theme}의 성격이 강합니다. ${primary.summary.split('. ')[0]?.replace(/\.$/, '')} 흐름을 급하게 몰기보다 기준을 정교하게 다듬는 편이 맞습니다.`;

  return {
    month: monthly.month,
    label: `${monthly.month}월`,
    monthlyGanji,
    momentum,
    theme,
    summary,
    opportunity: primary.opportunity,
    caution: secondary.caution,
    action: primary.action,
    relatedAreas: plan.relatedAreas,
    basis: compactStrings([
      monthlyGanji ? `월운: ${monthlyGanji}` : null,
      monthlyElementLabel ? `월운 오행: ${monthlyElementLabel}` : null,
      `세운: ${yearlyGanji}`,
      `관련 분야 점수: ${formatCategoryScores(plan.relatedAreas, monthly.categories)}`,
      primary.basis[0],
      secondary.basis[0],
      monthly.data.currentLuck?.wolwoon?.notes[1] ?? monthly.data.currentLuck?.wolwoon?.notes[0] ?? null,
    ]),
  };
}

function groupMonthsByMomentum(
  monthlyFlows: YearlyMonthFlow[],
  momentum: YearlyMomentum
) {
  const selected = monthlyFlows.filter((flow) => flow.momentum === momentum);
  if (selected.length === 0) return [];

  const groups: number[][] = [];

  for (const flow of selected) {
    const lastGroup = groups[groups.length - 1];

    if (lastGroup && lastGroup[lastGroup.length - 1] === flow.month - 1) {
      lastGroup.push(flow.month);
      continue;
    }

    groups.push([flow.month]);
  }

  return groups;
}

function createTimingWindows(
  monthlyFlows: YearlyMonthFlow[],
  momentum: YearlyMomentum,
  labelPrefix: string
): YearlyTimingWindow[] {
  const grouped = groupMonthsByMomentum(monthlyFlows, momentum);
  const fallbackGroups =
    grouped.length > 0
      ? grouped
      : momentum === 'rise'
        ? groupMonthsByMomentum(monthlyFlows, 'steady').slice(0, 1)
        : [monthlyFlows.slice(-2).map((flow) => flow.month)];

  return fallbackGroups
    .filter((months) => months.length > 0)
    .slice(0, 2)
    .map((months, index) => {
      const representative = monthlyFlows.find((flow) => flow.month === months[0])!;
      return {
        label: `${labelPrefix} ${index + 1}`,
        months,
        reason: representative.summary,
        strategy:
          momentum === 'rise'
            ? representative.opportunity
            : representative.caution,
      };
    });
}

function findMostRepeatedArea(monthlyFlows: YearlyMonthFlow[]) {
  const counts = new Map<YearlyCategoryKey, number>();

  for (const flow of monthlyFlows) {
    for (const area of flow.relatedAreas) {
      counts.set(area, (counts.get(area) ?? 0) + 1);
    }
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'work';
}

function createHalfFlow(
  label: 'firstHalf' | 'secondHalf',
  monthlyFlows: YearlyMonthFlow[],
  categories: Record<YearlyCategoryKey, YearlyCategorySection>
): YearlyHalfFlow {
  const topArea = findMostRepeatedArea(monthlyFlows);
  const section = categories[topArea];
  const riseCount = monthlyFlows.filter((flow) => flow.momentum === 'rise').length;
  const cautionCount = monthlyFlows.filter((flow) => flow.momentum === 'caution').length;

  return {
    label,
    headline:
      label === 'firstHalf'
        ? `${section.headline.replace(/\.$/, '')} 흐름이 상반기의 큰 줄기가 됩니다.`
        : `${section.headline.replace(/\.$/, '')} 흐름이 하반기 판단의 기준이 됩니다.`,
    summary:
      riseCount >= cautionCount
        ? `${section.summary} ${label === 'firstHalf' ? '상반기에는 준비해 온 것을 꺼내는 힘이 더 크고,' : '하반기에는 구조를 현실화하는 힘이 더 커지며,'} 다만 조급함만 줄이면 훨씬 안정적으로 풀립니다.`
        : `${section.summary} ${label === 'firstHalf' ? '상반기에는 속도보다 기준을 세우는 편이 좋고,' : '하반기에는 확정보다 조율이 먼저인 흐름이 강해,'} 경계선을 먼저 정하는 쪽이 유리합니다.`,
    opportunity: section.opportunity,
    caution: section.caution,
    action: section.action,
    relatedMonths: monthlyFlows.map((flow) => flow.month),
    basis: compactStrings([
      monthlyFlows[0]?.basis[0],
      monthlyFlows[1]?.basis[1],
      section.basis[0],
      section.basis[1],
    ]),
  };
}

function createActionGuide(
  context: YearlyFlowContext,
  categories: Record<YearlyCategoryKey, YearlyCategorySection>
): YearlyActionGuide {
  const support = formatElementList(context.supportElements);
  const caution = formatElementList(context.cautionElements);

  return {
    useWhenStrong: compactStrings([
      support
        ? `${support} 기운이 받쳐줄 때는 일과 돈에서 방향을 먼저 정하고 실행을 붙이세요.`
        : null,
      categories.work.action,
      categories.wealth.action,
      categories.love.action,
    ]).slice(0, 4),
    defendWhenWeak: compactStrings([
      caution
        ? `${caution} 축이 흔들릴 때는 큰 결정보다 생활 리듬과 지출 구조부터 다잡는 편이 좋습니다.`
        : null,
      categories.health.caution,
      categories.move.caution,
      categories.relationship.caution,
    ]).slice(0, 4),
  };
}

function createOneLineSummary(
  targetYear: number,
  context: YearlyFlowContext,
  categories: Record<YearlyCategoryKey, YearlyCategorySection>
) {
  return compactStrings([
    `${targetYear}년은 ${context.yearGanji}의 흐름 아래에서`,
    `${categories.work.headline.replace(/\.$/, '')}과`,
    `${categories.relationship.headline.replace(/\.$/, '')}를`,
    `같이 조율해야 한 해가 안정적으로 풀립니다.`,
  ]).join(' ');
}

export function buildYearlyReport(
  input: BirthInput,
  data: SajuDataV1,
  targetYear: number
): SajuYearlyReport {
  const timezone = data.input.timezone || input.birthLocation?.timezone || 'Asia/Seoul';
  const referenceDate = toYearlyReferenceDate(targetYear);
  const targetData = calculateSajuDataV1(input, {
    timezone,
    location: data.input.location ?? input.birthLocation?.label ?? null,
    calculatedAt: referenceDate,
    engineVersion: 'legacy-typescript-v1-yearly-foundation',
  });
  const reports = getReportMap(input, targetData);
  const annualContext = createYearlyContext(targetYear, targetData);
  const referenceReports = Object.fromEntries(
    YEARLY_REFERENCE_TOPICS.map((topic) => [topic, createReferenceReport(topic, reports[topic])])
  ) as Record<YearlyReferenceTopic, YearlyReferenceReport>;
  const categories = createCategorySections(reports, targetData, annualContext);
  const monthlyEvidence = Array.from({ length: 12 }, (_, index) =>
    buildMonthlyEvidence(input, data, targetYear, index + 1)
  );
  const monthlyFlows = monthlyEvidence.map((monthly) =>
    createMonthlyFlow(monthly)
  );
  const firstHalf = createHalfFlow(
    'firstHalf',
    monthlyFlows.filter((flow) => flow.month <= 6),
    categories
  );
  const secondHalf = createHalfFlow(
    'secondHalf',
    monthlyFlows.filter((flow) => flow.month >= 7),
    categories
  );

  return {
    year: targetYear,
    yearLabel: `${targetYear}년 ${annualContext.yearGanji}`,
    computation: createComputationMeta(targetYear, timezone),
    annualContext,
    overview: createOverview(annualContext, reports, targetData),
    coreKeywords: createYearlyKeywords(annualContext, targetData),
    firstHalf,
    secondHalf,
    categoryOrder: YEARLY_CATEGORY_ORDER,
    categories,
    monthlyFlows,
    goodPeriods: createTimingWindows(monthlyFlows, 'rise', '잘 풀리는 시기'),
    cautionPeriods: createTimingWindows(monthlyFlows, 'caution', '조심할 시기'),
    actionGuide: createActionGuide(annualContext, categories),
    oneLineSummary: createOneLineSummary(targetYear, annualContext, categories),
    evidenceCards: reports.today.evidenceCards,
    scores: reports.today.scores,
    referenceReports,
  };
}
