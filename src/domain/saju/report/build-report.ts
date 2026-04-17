import { ELEMENT_INFO, getLuckyElements, getPersonality } from '@/lib/saju/elements';
import type { BirthInput, Element, SajuResult } from '@/lib/saju/types';
import type {
  FocusTopic,
  FocusTopicMeta,
  FocusTopicOption,
  ReportInsight,
  ReportScore,
  ReportTimelineItem,
  SajuReport,
} from './types';

export const FOCUS_TOPIC_META: Record<FocusTopic, FocusTopicMeta> = {
  today: {
    label: '오늘',
    badge: '오늘의 흐름',
    subtitle: '오늘 바로 체감되는 흐름과 행동 포인트를 압축해서 보여줍니다.',
  },
  love: {
    label: '연애',
    badge: '연애 포커스',
    subtitle: '감정의 온도와 표현의 타이밍을 중심으로 읽어드립니다.',
  },
  wealth: {
    label: '재물',
    badge: '재물 포커스',
    subtitle: '돈의 흐름, 지출 감각, 기회 포착 포인트를 정리합니다.',
  },
  career: {
    label: '직장',
    badge: '직장 포커스',
    subtitle: '성과, 역할 변화, 이직 타이밍을 현실적으로 정리합니다.',
  },
  relationship: {
    label: '관계',
    badge: '관계 포커스',
    subtitle: '가까운 사람과의 거리감과 조율 포인트를 읽어드립니다.',
  },
};

export const FOCUS_TOPIC_OPTIONS: FocusTopicOption[] = [
  { key: 'today', label: '오늘' },
  { key: 'love', label: '연애' },
  { key: 'wealth', label: '재물' },
  { key: 'career', label: '직장' },
  { key: 'relationship', label: '관계' },
];

const SCORE_LABELS: Record<ReportScore['key'], string> = {
  overall: '총운',
  love: '연애',
  wealth: '재물',
  career: '직장',
};

function clampScore(value: number) {
  return Math.max(48, Math.min(92, Math.round(value)));
}

function getElementEntries(result: SajuResult) {
  return (Object.entries(result.elements) as [Element, number][]).sort((a, b) => b[1] - a[1]);
}

function getElementTone(element: Element) {
  const info = ELEMENT_INFO[element];
  const label = info.name.split(' ')[0];

  return {
    label,
    move: `${label} 기운이 강한 날이라 ${info.traits[0]}과 ${info.traits[1]}을 살려서 작게라도 바로 움직이는 편이 좋습니다.`,
    avoid: `${label}의 장점만 밀어붙이기보다 ${info.keywords[0]}처럼 속도를 한 번 정리하고 과한 확신은 줄이는 편이 안정적입니다.`,
    cue: info.keywords[0],
  };
}

function buildScores(input: BirthInput, result: SajuResult): ReportScore[] {
  const entries = getElementEntries(result);
  const strongest = entries[0]?.[1] ?? 0;
  const weakest = entries.at(-1)?.[1] ?? 0;
  const spread = strongest - weakest;
  const uniqueCount = entries.filter(([, count]) => count > 0).length;
  const hourBonus = result.hour ? 4 : 0;
  const datePulse = ((input.day + input.month) % 7) - 3;
  const yearPulse = (input.year % 6) - 2;
  const balanceBase = 66 + uniqueCount * 3 - spread * 4 + hourBonus;

  const overall = clampScore(balanceBase + datePulse);
  const love = clampScore(balanceBase + datePulse + (uniqueCount >= 4 ? 4 : 1) + (input.day % 5) - 2);
  const wealth = clampScore(balanceBase + yearPulse + strongest * 2 - weakest);
  const career = clampScore(balanceBase + hourBonus + (input.month % 5) - 1 + (strongest >= 2 ? 3 : 0));

  const summaries: Record<ReportScore['key'], string> = {
    overall:
      overall >= 80
        ? '전체 흐름이 살아 있어 먼저 움직이는 쪽이 유리합니다.'
        : overall >= 70
          ? '무리하지 않고 우선순위만 선명하게 잡으면 좋은 결과로 이어집니다.'
          : '속도를 줄이고 균형을 맞출수록 결과가 안정됩니다.',
    love:
      love >= 80
        ? '표현을 조금 더 먼저 꺼내도 괜찮은 흐름입니다.'
        : love >= 70
          ? '감정 확인보다 분위기 조율이 더 중요한 구간입니다.'
          : '상대의 반응을 살피며 천천히 호흡을 맞추는 편이 좋습니다.',
    wealth:
      wealth >= 80
        ? '작은 기회를 빠르게 연결하면 체감 수익으로 이어질 수 있습니다.'
        : wealth >= 70
          ? '지출 정리와 루틴 관리가 재물운을 안정시키는 날입니다.'
          : '새 투자보다 보수적인 선택이 더 유리합니다.',
    career:
      career >= 80
        ? '성과를 보여주기 좋은 흐름이라 제안과 발표에 힘이 붙습니다.'
        : career >= 70
          ? '정리된 커뮤니케이션이 일의 흐름을 매끈하게 만듭니다.'
          : '확장보다 현재 역할의 완성도를 높이는 편이 좋습니다.',
  };

  return [
    { key: 'overall', label: SCORE_LABELS.overall, score: overall, summary: summaries.overall },
    { key: 'love', label: SCORE_LABELS.love, score: love, summary: summaries.love },
    { key: 'wealth', label: SCORE_LABELS.wealth, score: wealth, summary: summaries.wealth },
    { key: 'career', label: SCORE_LABELS.career, score: career, summary: summaries.career },
  ];
}

function getHeadline(topic: FocusTopic, scoreMap: Record<ReportScore['key'], number>) {
  switch (topic) {
    case 'love':
      return scoreMap.love >= 78
        ? '연애운이 상승 구간입니다. 먼저 분위기를 여는 쪽이 유리합니다.'
        : '연애운은 조율 구간입니다. 해답보다 대화의 온도가 더 중요합니다.';
    case 'wealth':
      return scoreMap.wealth >= 78
        ? '재물운이 살아 있습니다. 작은 기회를 바로 잡는 감각이 중요합니다.'
        : '재물운은 정리 구간입니다. 지출 구조를 먼저 가볍게 다듬어보세요.';
    case 'career':
      return scoreMap.career >= 78
        ? '직장운이 전진 구간입니다. 제안과 피드백에 힘이 붙습니다.'
        : '직장운은 정비 구간입니다. 속도보다 완성도를 먼저 챙기세요.';
    case 'relationship':
      return scoreMap.love >= 76
        ? '관계운이 따뜻하게 풀립니다. 짧은 안부가 흐름을 바꿉니다.'
        : '관계운은 거리 조절이 핵심입니다. 감정보다 명확한 표현이 필요합니다.';
    case 'today':
    default:
      return scoreMap.overall >= 78
        ? '오늘은 먼저 움직이는 쪽에 운이 붙는 날입니다.'
        : '오늘은 정리와 균형이 더 큰 성과로 이어지는 날입니다.';
  }
}

function buildInsights(result: SajuResult, topic: FocusTopic): ReportInsight[] {
  const supportElements = getLuckyElements(result);
  const supportLabels = supportElements.map((element) => ELEMENT_INFO[element].name.split(' ')[0]).join(', ');
  const dominant = ELEMENT_INFO[result.dominantElement].name.split(' ')[0];
  const weakest = ELEMENT_INFO[result.weakestElement].name.split(' ')[0];

  return [
    {
      eyebrow: '일간 성향',
      title: `${result.dayMaster} 일간의 기본 태도`,
      body: getPersonality(result),
    },
    {
      eyebrow: '오행 흐름',
      title: `${dominant}가 강하고 ${weakest} 보완이 필요한 흐름입니다.`,
      body: `${dominant}의 장점을 살릴수록 흐름이 부드럽게 풀리고, ${weakest} 기운을 생활 리듬 안에서 보완할수록 결과가 더 안정됩니다.`,
    },
    {
      eyebrow: '질문 포커스',
      title: `${FOCUS_TOPIC_META[topic].label} 해석은 ${supportLabels || dominant} 기운을 먼저 활용하는 것이 좋습니다.`,
      body: `${FOCUS_TOPIC_META[topic].subtitle} 먼저 체감되는 장점을 살리고, 조급함보다는 반복 가능한 행동으로 연결하는 편이 좋습니다.`,
    },
  ];
}

function buildTimeline(result: SajuResult, topic: FocusTopic): ReportTimelineItem[] {
  const bestTone = getElementTone(getLuckyElements(result)[0] ?? result.dominantElement);
  const cautionTone = getElementTone(result.weakestElement);
  const dominant = ELEMENT_INFO[result.dominantElement].name.split(' ')[0];

  return [
    {
      label: '오늘',
      headline: `${bestTone.cue}을 먼저 살리는 날`,
      body: `${FOCUS_TOPIC_META[topic].subtitle} 오늘은 ${bestTone.move}`,
    },
    {
      label: '이번 주',
      headline: `${dominant} 중심 루틴을 만들면 흐름이 붙습니다.`,
      body: '초반에는 정리와 조율, 후반에는 실행과 연결에 힘이 붙는 패턴입니다. 중요한 선택은 한 번에 몰지 않는 편이 안정적입니다.',
    },
    {
      label: '이번 달',
      headline: `${cautionTone.label} 보완이 성과 차이를 만듭니다.`,
      body: cautionTone.avoid,
    },
  ];
}

function toMonth(value: number) {
  return ((value - 1) % 12 + 12) % 12 + 1;
}

function toDay(value: number) {
  return ((value - 1) % 28 + 28) % 28 + 1;
}

function formatDateChip(month: number, day: number) {
  return `${month}월 ${day}일`;
}

function buildDates(input: BirthInput, result: SajuResult) {
  const entries = getElementEntries(result);
  const strongest = entries[0]?.[1] ?? 0;
  const weakest = entries.at(-1)?.[1] ?? 0;
  const hourSeed = input.hour ?? 6;

  const luckySeed = input.day + strongest + hourSeed;
  const cautionSeed = input.month + weakest + hourSeed;

  return {
    luckyDates: [
      formatDateChip(toMonth(input.month + 1), toDay(luckySeed + 3)),
      formatDateChip(toMonth(input.month + 2), toDay(luckySeed + 11)),
    ],
    cautionDates: [
      formatDateChip(toMonth(input.month + 1), toDay(cautionSeed + 5)),
      formatDateChip(toMonth(input.month + 3), toDay(cautionSeed + 9)),
    ],
  };
}

export function normalizeFocusTopic(value?: string): FocusTopic {
  if (!value) return 'today';
  if (value in FOCUS_TOPIC_META) return value as FocusTopic;
  return 'today';
}

export function buildSajuReport(input: BirthInput, result: SajuResult, topicValue?: string): SajuReport {
  const focusTopic = normalizeFocusTopic(topicValue);
  const meta = FOCUS_TOPIC_META[focusTopic];
  const scores = buildScores(input, result);
  const scoreMap = Object.fromEntries(scores.map((score) => [score.key, score.score])) as Record<
    ReportScore['key'],
    number
  >;
  const supportElements = getLuckyElements(result);
  const dominant = ELEMENT_INFO[result.dominantElement].name.split(' ')[0];
  const weakest = ELEMENT_INFO[result.weakestElement].name.split(' ')[0];
  const bestTone = getElementTone(supportElements[0] ?? result.dominantElement);
  const cautionTone = getElementTone(result.weakestElement);
  const { luckyDates, cautionDates } = buildDates(input, result);

  return {
    focusTopic,
    focusLabel: meta.label,
    focusBadge: meta.badge,
    headline: getHeadline(focusTopic, scoreMap),
    summary: `${dominant} 기운이 전면에 서 있는 명식이라 추진력과 표현력이 강점으로 작동합니다. 반대로 ${weakest} 보완을 의식할수록 ${meta.label} 흐름이 더 안정적으로 이어집니다.`,
    scores,
    primaryAction: {
      title: `${bestTone.label} 기운을 살리는 한 가지`,
      description: bestTone.move,
    },
    cautionAction: {
      title: `오늘 피할 흐름`,
      description: cautionTone.avoid,
    },
    insights: buildInsights(result, focusTopic),
    timeline: buildTimeline(result, focusTopic),
    luckyDates,
    cautionDates,
    supportElements,
  };
}
