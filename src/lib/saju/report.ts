import { ELEMENT_INFO, getLuckyElements, getPersonality } from './elements';
import type { BirthInput, Element, SajuResult } from './types';

export type FocusTopic = 'today' | 'love' | 'wealth' | 'career' | 'relationship';

export interface ReportScore {
  key: 'overall' | 'love' | 'wealth' | 'career';
  label: string;
  score: number;
  summary: string;
}

export interface ReportAction {
  title: string;
  description: string;
}

export interface ReportInsight {
  title: string;
  eyebrow: string;
  body: string;
}

export interface ReportTimelineItem {
  label: string;
  headline: string;
  body: string;
}

export interface SajuReport {
  focusTopic: FocusTopic;
  focusLabel: string;
  focusBadge: string;
  headline: string;
  summary: string;
  scores: ReportScore[];
  primaryAction: ReportAction;
  cautionAction: ReportAction;
  insights: ReportInsight[];
  timeline: ReportTimelineItem[];
  luckyDates: string[];
  cautionDates: string[];
}

export const FOCUS_TOPIC_META: Record<
  FocusTopic,
  { label: string; badge: string; subtitle: string }
> = {
  today: {
    label: '오늘',
    badge: '오늘의 흐름',
    subtitle: '오늘 바로 체감되는 리듬을 먼저 읽습니다.',
  },
  love: {
    label: '연애',
    badge: '연애 포커스',
    subtitle: '표현 타이밍과 감정 온도를 중심으로 해석합니다.',
  },
  wealth: {
    label: '재물',
    badge: '재물 포커스',
    subtitle: '소비, 수입, 기회 포착에 유리한 흐름을 봅니다.',
  },
  career: {
    label: '직장',
    badge: '직장 포커스',
    subtitle: '성과, 이직, 협업 스트레스를 중심으로 봅니다.',
  },
  relationship: {
    label: '관계',
    badge: '관계 포커스',
    subtitle: '가까운 사람과의 거리감과 조율 포인트를 정리합니다.',
  },
};

const ACTION_COPY: Record<
  Element,
  { move: string; avoid: string; cue: string }
> = {
  목: {
    move: '새로운 일정이나 대화를 먼저 열어 흐름을 당겨오세요.',
    avoid: '계획 없이 여러 선택지를 동시에 벌리면 집중이 흐트러집니다.',
    cue: '확장',
  },
  화: {
    move: '감정을 숨기기보다 분명한 표현 한 번이 분위기를 바꿉니다.',
    avoid: '반응이 빠른 만큼 말의 온도가 높아지지 않게 조절하세요.',
    cue: '표현',
  },
  토: {
    move: '루틴과 정리, 돈 흐름 점검처럼 기반을 다지는 행동이 유리합니다.',
    avoid: '지나친 걱정으로 결정을 미루면 좋은 타이밍을 놓치기 쉽습니다.',
    cue: '정리',
  },
  금: {
    move: '중요한 기준을 선명하게 세우면 성과와 집중도가 함께 올라갑니다.',
    avoid: '완벽주의로 속도를 잃지 않게 80점 선에서 먼저 실행하세요.',
    cue: '결단',
  },
  수: {
    move: '관찰과 기록, 조용한 준비가 다음 기회를 크게 만듭니다.',
    avoid: '마음속 판단만 길어지면 흐름을 타기 어려우니 작은 실행을 곁들이세요.',
    cue: '회복',
  },
};

const FOCUS_LABELS: Record<ReportScore['key'], string> = {
  overall: '총운',
  love: '연애',
  wealth: '재물',
  career: '직장',
};

function clampScore(value: number) {
  return Math.max(46, Math.min(92, Math.round(value)));
}

function getElementSupportScore(result: SajuResult, element: Element) {
  return result.elements[element] * 3;
}

function getDateChip(monthOffset: number, value: number) {
  return `${monthOffset}일`;
}

function buildScores(result: SajuResult): ReportScore[] {
  const lucky = getLuckyElements(result);
  const dominantCount = result.elements[result.dominantElement];
  const weakestCount = result.elements[result.weakestElement];
  const dayElement = result.day.stemElement;

  const base = 66 + (dominantCount - weakestCount) * 4 + (result.hour ? 2 : -1);
  const overall = clampScore(base + lucky.length * 2);
  const love = clampScore(
    base +
      (dayElement === '목' || dayElement === '화' ? 8 : 3) +
      (result.dominantElement === '수' || result.dominantElement === '목' ? 4 : 0) -
      (result.weakestElement === '화' ? 5 : 0)
  );
  const wealth = clampScore(
    base +
      (result.dominantElement === '토' || result.dominantElement === '금' ? 8 : 2) +
      (lucky.includes('금') ? 5 : 0) -
      (result.weakestElement === '토' ? 5 : 0)
  );
  const career = clampScore(
    base +
      (result.dominantElement === '목' || result.dominantElement === '금' || result.dominantElement === '토'
        ? 7
        : 2) +
      (['甲', '庚', '戊', '辛'].includes(result.dayMaster) ? 4 : 0)
  );

  const summaries: Record<ReportScore['key'], string> = {
    overall:
      overall >= 80
        ? '전체 흐름이 또렷해서 먼저 움직이는 쪽이 유리합니다.'
        : overall >= 70
          ? '무리 없이 이어지는 구간이니 우선순위만 분명히 잡으면 됩니다.'
          : '속도를 낮추고 균형을 되찾을수록 결과가 좋아집니다.',
    love:
      love >= 80
        ? '표현력과 반응 속도가 좋은 날이라 대화 주도권을 잡기 좋습니다.'
        : love >= 70
          ? '거리 조절만 잘하면 감정선이 안정적으로 이어집니다.'
          : '감정 확인보다 해석이 앞서기 쉬워서 천천히 반응하는 편이 좋습니다.',
    wealth:
      wealth >= 80
        ? '작은 기회를 바로 잡는 실행력이 수익 흐름으로 이어질 가능성이 큽니다.'
        : wealth >= 70
          ? '계획적 소비와 반복 루틴이 재물운을 안정시키는 구간입니다.'
          : '즉흥 결정보다 점검과 보수적 선택이 더 좋은 결과를 만듭니다.',
    career:
      career >= 80
        ? '성과를 드러내기 좋은 구간이라 발표, 제안, 협상에 강합니다.'
        : career >= 70
          ? '정리된 커뮤니케이션이 평가와 협업을 매끄럽게 만듭니다.'
          : '과한 확장보다 현재 맡은 영역을 정교하게 다듬는 쪽이 안전합니다.',
  };

  return (Object.entries({
    overall,
    love,
    wealth,
    career,
  }) as [ReportScore['key'], number][])
    .map(([key, score]) => ({
      key,
      label: FOCUS_LABELS[key],
      score,
      summary: summaries[key],
    }));
}

function getHeadline(topic: FocusTopic, scores: ReportScore[]) {
  const scoreMap = Object.fromEntries(scores.map((score) => [score.key, score.score])) as Record<
    ReportScore['key'],
    number
  >;

  switch (topic) {
    case 'love':
      return scoreMap.love >= 78
        ? '이번 주 연애운은 상승 구간, 먼저 연락하는 쪽이 흐름을 잡습니다.'
        : '연애운은 조율 구간, 해석보다 질문을 먼저 던지는 편이 좋습니다.';
    case 'wealth':
      return scoreMap.wealth >= 78
        ? '재물운은 실행 우위, 작은 기회를 바로 잡는 쪽이 유리합니다.'
        : '재물운은 점검 우위, 새 지출보다 흐름 정리가 먼저입니다.';
    case 'career':
      return scoreMap.career >= 78
        ? '직장운은 전진 구간, 제안과 피드백을 먼저 꺼낼수록 좋습니다.'
        : '직장운은 정비 구간, 속도보다 품질을 높이는 편이 유리합니다.';
    case 'relationship':
      return scoreMap.love >= 76
        ? '관계운은 회복 흐름, 너무 늦기 전에 가볍게 먼저 다가가 보세요.'
        : '관계운은 거리 조절이 핵심, 감정 과열보다 명확한 선이 필요합니다.';
    case 'today':
    default:
      return scoreMap.overall >= 78
        ? '오늘 전체 흐름은 상승 구간, 먼저 움직이는 쪽에 운이 붙습니다.'
        : '오늘은 정리형 흐름, 무리한 확장보다 균형을 맞추는 선택이 좋습니다.';
  }
}

function buildInsights(result: SajuResult, topic: FocusTopic): ReportInsight[] {
  const lucky = getLuckyElements(result);
  const luckyNames = lucky.map((element) => ELEMENT_INFO[element].name.split(' ')[0]).join(' · ');

  return [
    {
      eyebrow: '일간 기질',
      title: `${result.dayMaster} 일간의 기본 온도`,
      body: getPersonality(result),
    },
    {
      eyebrow: '오행 균형',
      title: `${ELEMENT_INFO[result.dominantElement].name}이 앞에 서고 ${ELEMENT_INFO[result.weakestElement].name} 보완이 핵심입니다.`,
      body: `${ELEMENT_INFO[result.dominantElement].traits[0]}과 ${ELEMENT_INFO[result.dominantElement].traits[2]}이 드러나는 흐름입니다. 반대로 ${ELEMENT_INFO[result.weakestElement].name} 기운이 약해 ${ELEMENT_INFO[result.weakestElement].traits[0]}을 의식적으로 보충할수록 결과가 좋아집니다.`,
    },
    {
      eyebrow: '질문형 해석',
      title: `${FOCUS_TOPIC_META[topic].label} 질문에는 ${luckyNames || '균형'} 감각이 답이 됩니다.`,
      body: `${FOCUS_TOPIC_META[topic].subtitle} ${ELEMENT_INFO[result.dominantElement].keywords[0]} 성향의 행동을 전면에 두고, ${ELEMENT_INFO[result.weakestElement].keywords[0]}처럼 지나치게 약하거나 느슨한 패턴은 줄이는 것이 좋습니다.`,
    },
  ];
}

function buildTimeline(result: SajuResult, topic: FocusTopic): ReportTimelineItem[] {
  const lucky = getLuckyElements(result);
  const firstLucky = lucky[0] ?? result.weakestElement;
  const action = ACTION_COPY[firstLucky];
  const weakAction = ACTION_COPY[result.weakestElement];

  return [
    {
      label: '오늘',
      headline: `${action.cue}를 먼저 잡는 날`,
      body: `${FOCUS_TOPIC_META[topic].subtitle} 오늘은 ${action.move}`,
    },
    {
      label: '이번 주',
      headline: `${ELEMENT_INFO[result.dominantElement].name.split(' ')[0]} 흐름이 중심에 섭니다`,
      body: `${ELEMENT_INFO[result.dominantElement].traits[0]}과 ${ELEMENT_INFO[result.dominantElement].traits[2]}이 드러나는 주간입니다. 중요한 선택은 초반에, 세부 조정은 후반에 두는 편이 좋습니다.`,
    },
    {
      label: '이번 달',
      headline: `${ELEMENT_INFO[result.weakestElement].name.split(' ')[0]} 보완이 성패를 가릅니다`,
      body: `${weakAction.avoid} 장기전으로 갈수록 ${ELEMENT_INFO[firstLucky].keywords[0]} 리듬을 생활 안에 넣는 편이 유리합니다.`,
    },
  ];
}

function buildDates(input: BirthInput, result: SajuResult) {
  const dominantSeed = input.day + getElementSupportScore(result, result.dominantElement);
  const weakSeed = input.month + getElementSupportScore(result, result.weakestElement);

  return {
    luckyDates: [
      getDateChip(((dominantSeed % 21) + 7), dominantSeed),
      getDateChip(((dominantSeed % 17) + 11), dominantSeed),
    ],
    cautionDates: [
      getDateChip(((weakSeed % 16) + 5), weakSeed),
      getDateChip(((weakSeed % 19) + 9), weakSeed),
    ],
  };
}

export function normalizeFocusTopic(value?: string): FocusTopic {
  if (!value) return 'today';
  if (value in FOCUS_TOPIC_META) return value as FocusTopic;
  return 'today';
}

export function buildSajuReport(
  input: BirthInput,
  result: SajuResult,
  topicValue?: string
): SajuReport {
  const focusTopic = normalizeFocusTopic(topicValue);
  const meta = FOCUS_TOPIC_META[focusTopic];
  const scores = buildScores(result);
  const lucky = getLuckyElements(result);
  const bestActionElement = lucky[0] ?? result.weakestElement;
  const scoreMap = Object.fromEntries(scores.map((score) => [score.key, score.score])) as Record<
    ReportScore['key'],
    number
  >;
  const { luckyDates, cautionDates } = buildDates(input, result);

  return {
    focusTopic,
    focusLabel: meta.label,
    focusBadge: meta.badge,
    headline: getHeadline(focusTopic, scores),
    summary: `${ELEMENT_INFO[result.dominantElement].name}이 전면에 서는 명식이라 ${ELEMENT_INFO[result.dominantElement].traits[0]}과 ${ELEMENT_INFO[result.dominantElement].traits[2]}이 강점으로 작동합니다. ${ELEMENT_INFO[result.weakestElement].name} 보완을 의식하면 ${focusTopic === 'today' ? '오늘의 체감' : `${meta.label} 영역`}이 더 안정적으로 풀립니다.`,
    scores,
    primaryAction: {
      title: '오늘의 추천 행동',
      description: ACTION_COPY[bestActionElement].move,
    },
    cautionAction: {
      title: '오늘 피할 것',
      description: ACTION_COPY[result.weakestElement].avoid,
    },
    insights: buildInsights(result, focusTopic),
    timeline: buildTimeline(result, focusTopic),
    luckyDates,
    cautionDates,
  };
}
