import { buildSajuReport, type ReportEvidenceCard, type ReportScore, type SajuReport } from '@/domain/saju/report';
import type { SajuDataV1 } from '@/domain/saju/engine/saju-data-v1';
import { ELEMENT_INFO, getLuckyElementsFromSajuData } from '@/lib/saju/elements';
import { resolveMoonlightCounselor, type MoonlightCounselorId } from '@/lib/counselors';
import { selectUpsell } from '@/lib/upsell';
import { getTodayConcern } from '@/lib/today-fortune/concerns';
import type {
  ConcernId,
  TodayCalendarType,
  TodayFortuneBirthPayload,
  TodayFortuneFreeResult,
  TodayFortunePremiumResult,
  TodayScoreItem,
  TodayTimeRule,
  TodayTimeWindow,
} from '@/lib/today-fortune/types';
import type { BirthInput } from '@/lib/saju/types';

interface TodayFortuneBuildOptions {
  concernId: ConcernId;
  sourceSessionId: string;
  calendarType: TodayCalendarType;
  timeRule: TodayTimeRule;
  counselorId?: MoonlightCounselorId | null;
}

const SCORE_LABELS: Record<TodayScoreItem['key'], string> = {
  overall: '총운',
  love: '연애',
  wealth: '재물',
  career: '직장',
  relationship: '관계',
  condition: '컨디션',
};

const ELEMENT_WINDOWS: Record<string, string[]> = {
  목: ['05:00 - 07:00', '07:00 - 09:00'],
  화: ['09:00 - 11:00', '11:00 - 13:00'],
  토: ['13:00 - 15:00', '19:00 - 21:00'],
  금: ['15:00 - 17:00', '17:00 - 19:00'],
  수: ['21:00 - 23:00', '23:00 - 01:00'],
};

function clampScore(value: number) {
  return Math.max(48, Math.min(92, Math.round(value)));
}

function getScore(report: SajuReport, key: ReportScore['key']) {
  return report.scores.find((item) => item.key === key);
}

function buildConditionScore(
  todayReport: SajuReport,
  loveReport: SajuReport,
  wealthReport: SajuReport,
  sajuData: SajuDataV1
) {
  const overall = getScore(todayReport, 'overall')?.score ?? 70;
  const love = getScore(loveReport, 'love')?.score ?? overall;
  const wealth = getScore(wealthReport, 'wealth')?.score ?? overall;
  const dominantCount = sajuData.fiveElements.byElement[sajuData.fiveElements.dominant]?.count ?? 0;
  const weakestCount = sajuData.fiveElements.byElement[sajuData.fiveElements.weakest]?.count ?? 0;
  const balancePenalty = Math.max(0, dominantCount - weakestCount) * 2;
  const strengthAdjust =
    sajuData.strength?.level === '신약' ? -4 : sajuData.strength?.level === '신강' ? 2 : 0;

  return clampScore((overall + love + wealth) / 3 - balancePenalty + strengthAdjust);
}

function buildReasonSnippet(
  evidenceCard: ReportEvidenceCard | undefined,
  unknownBirthTime: boolean
) {
  const base =
    evidenceCard?.plainSummary ||
    evidenceCard?.technicalSummary ||
    evidenceCard?.body ||
    '오늘 해석은 일간과 현재 운의 강약을 먼저 잡고, 그 위에 관계와 돈, 말의 속도를 겹쳐 읽습니다.';

  if (!unknownBirthTime) return base;

  return `${base} 다만 태어난 시간이 없어 시주(時柱) 기반 세부 타이밍은 보수적으로 줄여 읽습니다.`;
}

function buildOneLineBody(
  concernId: ConcernId,
  concernLabel: string,
  focusReport: SajuReport,
  todayReport: SajuReport,
  counselorId: MoonlightCounselorId
) {
  const baseSummary = focusReport.summaryHighlights[0] ?? focusReport.summary;

  switch (concernId) {
    case 'love_contact':
      return `${baseSummary} ${counselorId === 'male' ? '먼저 닿는 말의 강도보다 속도를 조절하는 쪽이 낫습니다.' : '먼저 닿는 말의 온도와 속도를 맞추는 쪽이 훨씬 자연스럽습니다.'}`;
    case 'money_spend':
      return `${baseSummary} 수입 확대보다 새는 돈을 막는 판단이 오늘 체감 차이를 크게 만듭니다.`;
    case 'work_meeting':
      return `${baseSummary} 회의나 계약은 결론을 서두르기보다 먼저 기준을 분명히 세우는 편이 좋습니다.`;
    case 'relationship_conflict':
      return `${baseSummary} 감정을 크게 밀기보다 질문 한 마디로 온도를 낮추는 쪽이 안전합니다.`;
    case 'energy_health':
      return `${todayReport.summaryHighlights[0] ?? todayReport.summary} 몸을 밀어붙이는 시간과 쉬어야 할 구간을 나눠 쓰는 것이 중요합니다.`;
    case 'general':
    default:
      return `${concernLabel}으로 읽으면 ${todayReport.summaryHighlights[0] ?? todayReport.summary}`;
  }
}

function toTodayScores(
  todayReport: SajuReport,
  loveReport: SajuReport,
  wealthReport: SajuReport,
  careerReport: SajuReport,
  relationshipReport: SajuReport,
  conditionScore: number
): TodayScoreItem[] {
  const baseScores: TodayScoreItem[] = [
    getScore(todayReport, 'overall'),
    getScore(loveReport, 'love'),
    getScore(wealthReport, 'wealth'),
    getScore(careerReport, 'career'),
    getScore(relationshipReport, 'relationship'),
  ]
    .filter((score): score is ReportScore => Boolean(score))
    .map((score) => ({
      key: score.key as TodayScoreItem['key'],
      label: SCORE_LABELS[score.key],
      score: score.score,
      summary: score.summary,
    }));

  baseScores.push({
    key: 'condition',
    label: SCORE_LABELS.condition,
    score: conditionScore,
    summary: '과로보다 리듬 조절이 중요합니다.',
  });

  return baseScores;
}

function buildTimeWindows(
  concernId: ConcernId,
  report: SajuReport,
  sajuData: SajuDataV1,
  type: 'favorable' | 'caution'
): TodayTimeWindow[] {
  const supportElements = getLuckyElementsFromSajuData(sajuData);
  const dominantElement = ELEMENT_INFO[sajuData.fiveElements.dominant].name.split(' ')[0];
  const baseElements =
    type === 'favorable'
      ? supportElements.slice(0, 2)
      : [sajuData.fiveElements.weakest, sajuData.fiveElements.dominant];

  return baseElements.slice(0, 2).flatMap((element, index) => {
    const elementLabel = typeof element === 'string' ? ELEMENT_INFO[element].name.split(' ')[0] : dominantElement;
    const ranges = ELEMENT_WINDOWS[element] ?? ELEMENT_WINDOWS.토;
    const range = ranges[index % ranges.length] ?? ranges[0];

    return [
      {
        range,
        mood: type,
        title:
          type === 'favorable'
            ? `${elementLabel} 흐름을 쓰기 좋은 시간`
            : `${elementLabel} 과열을 조심할 시간`,
        body:
          type === 'favorable'
            ? `${report.primaryAction.description} ${concernId === 'money_spend' ? '결제보다 정산을 먼저 보는 편이 맞습니다.' : '짧고 분명한 행동으로 흐름을 잡기 좋습니다.'}`
            : `${report.cautionAction.description} ${concernId === 'relationship_conflict' ? '감정 섞인 결론을 바로 꺼내지 않는 편이 안전합니다.' : '한 번 더 확인하고 속도를 낮추는 편이 좋습니다.'}`,
      },
    ];
  });
}

function buildScenarioComparison(concernId: ConcernId, report: SajuReport) {
  switch (concernId) {
    case 'love_contact':
      return [
        {
          title: '오늘 먼저 연락할 때',
          better: `${report.primaryAction.description} 안부처럼 가벼운 문장으로 시작하면 흐름이 덜 흔들립니다.`,
          watch: `${report.cautionAction.description} 감정 확인이나 결론 요구는 부담으로 읽힐 수 있습니다.`,
        },
        {
          title: '조금 늦춰 볼 때',
          better: '오후 흐름을 보고 톤을 다듬으면 말의 충돌을 줄이기 좋습니다.',
          watch: '지나치게 미루면 다시 말을 꺼내기 어려워질 수 있습니다.',
        },
      ];
    case 'money_spend':
      return [
        {
          title: '오늘 바로 결제할 때',
          better: '정해진 결제나 생활성 지출은 한 번에 정리하면 마음이 가벼워집니다.',
          watch: '기분 전환성 소비나 지인 권유 결제는 만족보다 피로를 남기기 쉽습니다.',
        },
        {
          title: '하루 보류할 때',
          better: '비교와 정산을 거치면 체감 손실을 줄이기 좋습니다.',
          watch: '정말 필요한 결제까지 미루면 일정이 꼬일 수 있어 우선순위를 나눠야 합니다.',
        },
      ];
    case 'work_meeting':
      return [
        {
          title: '오늘 미팅을 밀어붙일 때',
          better: '기준과 역할만 먼저 분명히 하면 결론이 빨라질 수 있습니다.',
          watch: '합의가 덜 된 상태에서 서명이나 확답을 먼저 주면 뒤에서 조정 비용이 커질 수 있습니다.',
        },
        {
          title: '한 번 더 조율할 때',
          better: '상대의 조건을 더 듣고 수정안을 꺼내면 흐름이 안정됩니다.',
          watch: '지나치게 미루면 주도권이 약해질 수 있으니 다음 약속은 바로 잡는 편이 좋습니다.',
        },
      ];
    case 'relationship_conflict':
      return [
        {
          title: '바로 말할 때',
          better: '사실 확인과 감정 분리를 먼저 하면 오해를 줄이기 좋습니다.',
          watch: '서운함을 결론처럼 말하면 작은 일도 관계의 상처로 남기 쉽습니다.',
        },
        {
          title: '조금 식힌 뒤 말할 때',
          better: '질문형 문장으로 바꾸면 상대도 방어를 덜 세웁니다.',
          watch: '너무 오래 미루면 혼자 해석이 커져 더 단단한 말로 튈 수 있습니다.',
        },
      ];
    case 'energy_health':
      return [
        {
          title: '일정을 강하게 밀어붙일 때',
          better: '짧은 성과는 낼 수 있지만 중간 회복 구간을 꼭 넣어야 합니다.',
          watch: '몰아서 움직이면 오후 후반부터 피로가 한꺼번에 밀릴 수 있습니다.',
        },
        {
          title: '중간에 쉬어갈 때',
          better: '집중 시간이 오히려 길어지고 판단이 차분해집니다.',
          watch: '완전히 늘어지기보다 쉬는 시간의 길이를 정해두는 편이 좋습니다.',
        },
      ];
    case 'general':
    default:
      return [
        {
          title: '바로 움직일 때',
          better: `${report.primaryAction.description} 작은 행동 하나를 먼저 끝내면 하루 전체가 정리되기 쉽습니다.`,
          watch: `${report.cautionAction.description} 큰 결론부터 잡으면 흐름을 과하게 소모할 수 있습니다.`,
        },
        {
          title: '흐름을 먼저 볼 때',
          better: '우선순위를 먼저 세우면 뒤쪽 선택이 훨씬 가벼워집니다.',
          watch: '생각만 길어지면 좋은 기회도 손에서 미끄러질 수 있습니다.',
        },
      ];
  }
}

function buildEvidenceLines(
  focusReport: SajuReport,
  todayReport: SajuReport,
  sajuData: SajuDataV1,
  unknownBirthTime: boolean
) {
  const lines = [
    `${focusReport.evidenceCards[0]?.label ?? '사주 근거'} · ${focusReport.evidenceCards[0]?.title ?? focusReport.summary}`,
    `대운·세운·월운 교차 · ${sajuData.currentLuck?.currentMajorLuck?.ganzi ?? '대운 준비 중'} / ${sajuData.currentLuck?.saewoon?.ganzi ?? '세운 준비 중'} / ${sajuData.currentLuck?.wolwoon?.ganzi ?? '월운 준비 중'}`,
    `보완축 · ${sajuData.yongsin?.plainSummary ?? '용신 보완축을 차분히 쓰는 편이 좋습니다.'}`,
  ];

  if (unknownBirthTime) {
    lines.push('태어난 시간이 없어 시주 기반 타이밍은 줄여 읽고, 일간·월령·현재 운 중심으로 판단했습니다.');
  }

  if (todayReport.evidenceCards[1]?.title) {
    lines.push(`${todayReport.evidenceCards[1].label} · ${todayReport.evidenceCards[1].title}`);
  }

  return lines;
}

export function buildTodayFortuneFreeResult(
  input: BirthInput,
  sajuData: SajuDataV1,
  options: TodayFortuneBuildOptions
): TodayFortuneFreeResult {
  const concern = getTodayConcern(options.concernId);
  const counselorId = resolveMoonlightCounselor(options.counselorId);
  const todayReport = buildSajuReport(input, sajuData, 'today');
  const loveReport = buildSajuReport(input, sajuData, 'love');
  const wealthReport = buildSajuReport(input, sajuData, 'wealth');
  const careerReport = buildSajuReport(input, sajuData, 'career');
  const relationshipReport = buildSajuReport(input, sajuData, 'relationship');
  const reportByTopic = {
    today: todayReport,
    love: loveReport,
    wealth: wealthReport,
    career: careerReport,
    relationship: relationshipReport,
  } as const;
  const focusReport = reportByTopic[concern.focusTopic];
  const conditionScore = buildConditionScore(todayReport, loveReport, wealthReport, sajuData);
  const scores = toTodayScores(
    todayReport,
    loveReport,
    wealthReport,
    careerReport,
    relationshipReport,
    conditionScore
  );
  const reasonBody = buildReasonSnippet(focusReport.evidenceCards[0], Boolean(input.unknownTime));
  const upsell = selectUpsell({ scores }, options.concernId);

  return {
    sourceSessionId: options.sourceSessionId,
    concernId: options.concernId,
    concernLabel: concern.label,
    concernHanja: concern.hanja,
    focusTopic: concern.focusTopic,
    birthMeta: {
      calendarType: options.calendarType,
      timeRule: options.timeRule,
      unknownBirthTime: Boolean(input.unknownTime),
      usesLocation: Boolean(input.birthLocation),
    },
    oneLine: {
      eyebrow: `${concern.prompt} · ${concern.hanja}`,
      headline: focusReport.headline,
      body: buildOneLineBody(options.concernId, concern.label, focusReport, todayReport, counselorId),
    },
    scores,
    opportunity: {
      title: `${concern.shortLabel} 쪽 기회`,
      body: focusReport.primaryAction.description,
    },
    risk: {
      title: `${concern.shortLabel} 쪽 주의`,
      body: focusReport.cautionAction.description,
    },
    reasonSnippet: {
      title: '사주 근거 한 줄',
      body: reasonBody,
    },
    nextAction: {
      copy: upsell.copy,
      product: 'TODAY_DEEP_READING',
      coinCost: 1,
    },
    followUpQuestions: concern.followUpQuestions,
  };
}

export function buildTodayFortunePremiumResult(
  input: BirthInput,
  sajuData: SajuDataV1,
  concernId: ConcernId
): TodayFortunePremiumResult {
  const concern = getTodayConcern(concernId);
  const todayReport = buildSajuReport(input, sajuData, 'today');
  const focusReport =
    concern.focusTopic === 'today'
      ? todayReport
      : buildSajuReport(input, sajuData, concern.focusTopic);

  return {
    productCode: 'TODAY_DEEP_READING',
    coinCost: 1,
    favorableWindows: buildTimeWindows(concernId, focusReport, sajuData, 'favorable'),
    cautionWindows: buildTimeWindows(concernId, focusReport, sajuData, 'caution'),
    avoidActions: [
      focusReport.cautionAction.description,
      concernId === 'money_spend'
        ? '가격 비교 없이 바로 결제하거나 지인 권유만 믿고 움직이지 않는 편이 좋습니다.'
        : concernId === 'relationship_conflict'
          ? '서운함을 결론처럼 크게 말하지 않는 편이 좋습니다.'
          : '확신이 덜 선 상태에서 큰 결론을 먼저 꺼내지 않는 편이 좋습니다.',
      input.unknownTime
        ? '태어난 시간이 없으니 시간대 판단은 무리해서 세게 믿지 않는 편이 안전합니다.'
        : '지금 좋다고 느껴도 같은 톤을 하루 종일 끌고 가지 않는 편이 좋습니다.',
    ],
    recommendedActions: [
      focusReport.primaryAction.description,
      concernId === 'work_meeting'
        ? '상대 조건과 내 기준을 두 문장으로 먼저 정리해 두는 편이 좋습니다.'
        : concernId === 'love_contact'
          ? '짧은 안부나 확인 메시지처럼 부담이 낮은 표현부터 쓰는 편이 좋습니다.'
          : '중요한 결정보다 작은 확인과 정산부터 끝내는 편이 좋습니다.',
      `보완축 ${sajuData.yongsin?.primary?.label ?? '용신'}을 생활 루틴으로 써보는 것이 도움이 됩니다.`,
    ],
    scenarios: buildScenarioComparison(concernId, focusReport),
    evidenceLines: buildEvidenceLines(focusReport, todayReport, sajuData, Boolean(input.unknownTime)),
    followUpQuestions: concern.followUpQuestions,
    safetyNote:
      concernId === 'energy_health'
        ? '건강운은 질병 진단이 아니라 컨디션, 휴식, 생활 리듬을 읽는 참고 조언으로 제한합니다.'
        : concernId === 'money_spend'
          ? '재물운은 투자 종목이나 매수·매도 지시가 아니라 돈이 새기 쉬운 패턴과 정산 타이밍을 읽는 참고 조언입니다.'
          : '관계와 선택의 흐름을 읽는 참고 해석이며, 이별·파혼·법적 판단처럼 큰 결론을 단정하지 않습니다.',
  };
}

export function buildBirthInputFromTodayPayload(
  payload: TodayFortuneBirthPayload
): Omit<TodayFortuneBuildOptions, 'sourceSessionId' | 'counselorId'> & {
  birthDraft: {
    year: string;
    month: string;
    day: string;
    hour: string;
    minute: string;
    gender: string;
    birthLocationCode: string;
    birthLocationLabel: string;
    birthLatitude: string;
    birthLongitude: string;
    unknownTime: boolean;
    jasiMethod: 'split' | 'unified';
    solarTimeMode: 'standard' | 'longitude';
  };
} {
  const timeRule = payload.timeRule;
  const unknownBirthTime = payload.unknownBirthTime;
  const hasLocation = Boolean(payload.birthLocationCode);
  const useLongitude = timeRule === 'trueSolarTime' && hasLocation;
  const usesSplit = timeRule === 'earlyZi';

  return {
    concernId: payload.concernId,
    calendarType: payload.calendarType,
    timeRule,
    birthDraft: {
      year: payload.year,
      month: payload.month,
      day: payload.day,
      hour: payload.hour,
      minute: payload.minute,
      gender: payload.gender,
      birthLocationCode: payload.birthLocationCode,
      birthLocationLabel: payload.birthLocationLabel,
      birthLatitude: payload.birthLatitude,
      birthLongitude: payload.birthLongitude,
      unknownTime: unknownBirthTime,
      jasiMethod: usesSplit ? 'split' : 'unified',
      solarTimeMode: useLongitude ? 'longitude' : 'standard',
    },
  };
}
