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
    subtitle: '오늘 하루 전체 운기와 가장 중요한 행동 포인트를 명식 기반으로 읽어드립니다.',
  },
  love: {
    label: '연애',
    badge: '연애운 포커스',
    subtitle: '현재 감정의 온도, 표현 타이밍, 상대와의 기운 조화를 중심으로 분석합니다.',
  },
  wealth: {
    label: '재물',
    badge: '재물운 포커스',
    subtitle: '돈의 흐름, 지출 감각, 투자 타이밍, 기회 포착 포인트를 명식으로 정리합니다.',
  },
  career: {
    label: '직장',
    badge: '직장운 포커스',
    subtitle: '성과 흐름, 역할 변화, 협업 방식, 이직·승진 타이밍을 구체적으로 살펴봅니다.',
  },
  relationship: {
    label: '관계',
    badge: '관계운 포커스',
    subtitle: '가까운 사람들과의 에너지 조화와 거리 조절, 갈등 예방 포인트를 읽어드립니다.',
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
  love: '연애운',
  wealth: '재물운',
  career: '직장운',
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
    move: `${label} 기운이 활성화되어 있어 ${info.traits[0]}과 ${info.traits[1]}을(를) 살려서 작게라도 바로 움직이는 편이 유리합니다.`,
    avoid: `${label}의 장점만 밀어붙이기보다 ${info.keywords[0]}처럼 속도를 한 번 점검하고, 과한 확신은 줄이는 편이 안정적입니다.`,
    cue: info.keywords[0],
    color: info.color,
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
        ? '오행이 고르게 활성화되어 있어 전체적인 기운이 살아 있습니다. 먼저 움직이는 쪽에 성과가 따릅니다.'
        : overall >= 70
          ? '기운이 고르게 흐르고 있어 무리하지 않고 우선순위를 선명하게 잡으면 좋은 결과로 이어집니다.'
          : '오행 중 한 기운이 과중하거나 부족해 균형 조율이 우선입니다. 속도보다 안정을 먼저 챙기세요.',
    love:
      love >= 80
        ? '감정 표현을 조금 더 먼저 꺼내도 괜찮은 흐름입니다. 상대가 기다리고 있을 수 있습니다.'
        : love >= 70
          ? '감정 확인보다 분위기 조율이 더 중요한 구간입니다. 말보다 행동으로 보여주는 것이 효과적입니다.'
          : '연애운이 정비 구간에 있습니다. 기대치를 낮추고 상대의 페이스에 맞추며 천천히 호흡을 맞추세요.',
    wealth:
      wealth >= 80
        ? '작은 기회가 체감 수익으로 연결되는 흐름입니다. 망설이지 말고 빠르게 결정하세요.'
        : wealth >= 70
          ? '지출 구조를 정리하고 루틴을 관리하는 것이 재물운을 안정시키는 핵심입니다.'
          : '새 투자나 큰 지출보다 현재 자산을 지키는 보수적인 접근이 더 유리한 시기입니다.',
    career:
      career >= 80
        ? '성과를 드러내기 좋은 흐름입니다. 제안, 발표, 피드백 모두 힘이 붙을 때입니다.'
        : career >= 70
          ? '꼼꼼한 커뮤니케이션이 업무 흐름을 매끈하게 만들어줍니다. 협업에 집중하세요.'
          : '확장보다 현재 역할에서 완성도를 높이는 편이 더 큰 결과로 이어집니다.',
  };

  return [
    { key: 'overall', label: SCORE_LABELS.overall, score: overall, summary: summaries.overall },
    { key: 'love', label: SCORE_LABELS.love, score: love, summary: summaries.love },
    { key: 'wealth', label: SCORE_LABELS.wealth, score: wealth, summary: summaries.wealth },
    { key: 'career', label: SCORE_LABELS.career, score: career, summary: summaries.career },
  ];
}

function getHeadline(topic: FocusTopic, scoreMap: Record<ReportScore['key'], number>, dominantLabel: string) {
  switch (topic) {
    case 'love':
      return scoreMap.love >= 80
        ? `연애운이 상승 흐름입니다. ${dominantLabel} 기운을 살려 먼저 분위기를 열어보세요.`
        : scoreMap.love >= 68
          ? '연애운이 조율 구간입니다. 해답보다 대화의 온도와 진심이 더 중요한 때입니다.'
          : '연애운이 다소 정체되어 있습니다. 서두르지 말고 상대의 감정 리듬에 맞춰가세요.';
    case 'wealth':
      return scoreMap.wealth >= 80
        ? `재물운에 활기가 있습니다. ${dominantLabel} 기운으로 작은 기회를 빠르게 연결하세요.`
        : scoreMap.wealth >= 68
          ? '재물운은 정리와 점검의 구간입니다. 지출 구조를 먼저 가볍게 다듬는 것이 중요합니다.'
          : '재물운이 소강 국면입니다. 무리한 투자보다 현재 재원을 지키는 것을 우선하세요.';
    case 'career':
      return scoreMap.career >= 80
        ? `직장운이 전진하고 있습니다. ${dominantLabel} 기운을 앞세워 제안과 성과를 드러내세요.`
        : scoreMap.career >= 68
          ? '직장운이 정비 구간입니다. 속도보다 완성도, 경쟁보다 협력이 더 효과적입니다.'
          : '직장운이 조용한 시기입니다. 결과보다 과정의 내실을 다지는 것이 먼저입니다.';
    case 'relationship':
      return scoreMap.love >= 76
        ? `관계운이 따뜻하게 풀립니다. ${dominantLabel} 기운으로 짧은 안부가 큰 변화를 만들 수 있습니다.`
        : scoreMap.love >= 64
          ? '관계운은 거리 조절이 핵심입니다. 너무 다가가거나 너무 물러서지 않는 균형이 중요합니다.'
          : '관계에서 오해가 생기기 쉬운 구간입니다. 감정보다 명확한 표현을 먼저 택하세요.';
    case 'today':
    default:
      return scoreMap.overall >= 80
        ? `오늘은 먼저 움직이는 쪽에 운이 붙는 날입니다. ${dominantLabel} 기운을 적극 활용하세요.`
        : scoreMap.overall >= 68
          ? '오늘은 정리와 균형이 더 큰 성과로 이어지는 날입니다. 한 가지씩 차분하게 처리하세요.'
          : '오늘은 에너지를 아끼고 중요한 결정은 내일로 미루는 편이 안전합니다.';
  }
}

function buildSummary(result: SajuResult, topic: FocusTopic): string {
  const dominant = ELEMENT_INFO[result.dominantElement].name.split(' ')[0];
  const weakest = ELEMENT_INFO[result.weakestElement].name.split(' ')[0];
  const meta = FOCUS_TOPIC_META[topic];

  const dominantDesc = ELEMENT_INFO[result.dominantElement].traits[0];
  const weakestDesc = ELEMENT_INFO[result.weakestElement].traits[0];

  return `${dominant} 기운이 강한 명식으로 ${dominantDesc}이(가) 자연스럽게 드러납니다. `
    + `${weakest} 기운은 상대적으로 약해 ${weakestDesc}을(를) 의식적으로 보완할수록 `
    + `${meta.label} 흐름이 더 안정적으로 이어집니다.`;
}

function buildInsights(result: SajuResult, topic: FocusTopic): ReportInsight[] {
  const supportElements = getLuckyElements(result);
  const supportLabels = supportElements.map((element) => ELEMENT_INFO[element].name.split(' ')[0]).join(', ');
  const dominant = ELEMENT_INFO[result.dominantElement];
  const weakest = ELEMENT_INFO[result.weakestElement];
  const dominantLabel = dominant.name.split(' ')[0];
  const weakestLabel = weakest.name.split(' ')[0];

  return [
    {
      eyebrow: '일간(日干) 성향',
      title: `${result.dayMaster} 일간 — ${dominant.traits[0]}과 ${dominant.traits[1]}이 핵심 강점`,
      body: getPersonality(result),
    },
    {
      eyebrow: '오행 흐름 분석',
      title: `${dominantLabel} 과다, ${weakestLabel} 부족 — 균형 잡기가 관건`,
      body: `${dominantLabel}의 ${dominant.traits.slice(0, 2).join(', ')}은 이미 충분히 작동하고 있습니다. `
        + `반면 ${weakestLabel}의 ${weakest.traits.slice(0, 2).join(', ')} 기운이 부족해 `
        + `${weakest.keywords[0]} 관련 활동으로 보완하면 전체 흐름이 더 균형잡힙니다.`,
    },
    {
      eyebrow: `${FOCUS_TOPIC_META[topic].label} 포커스 해석`,
      title: `${supportLabels || dominantLabel} 기운이 ${FOCUS_TOPIC_META[topic].label} 흐름을 돕습니다`,
      body: `${FOCUS_TOPIC_META[topic].subtitle} `
        + `지금 명식의 흐름에서는 ${supportLabels || dominantLabel}을(를) 먼저 살리는 쪽이 `
        + `${FOCUS_TOPIC_META[topic].label}운에서 가장 체감이 빠릅니다. `
        + `조급한 결과보다 반복 가능한 작은 행동으로 연결해보세요.`,
    },
  ];
}

function buildTimeline(result: SajuResult, topic: FocusTopic): ReportTimelineItem[] {
  const bestTone = getElementTone(getLuckyElements(result)[0] ?? result.dominantElement);
  const cautionTone = getElementTone(result.weakestElement);
  const dominant = ELEMENT_INFO[result.dominantElement].name.split(' ')[0];
  const meta = FOCUS_TOPIC_META[topic];

  return [
    {
      label: '오늘',
      headline: `${bestTone.label} 기운으로 먼저 움직이는 날`,
      body: `${meta.subtitle} 오늘은 ${bestTone.move}`,
    },
    {
      label: '이번 주',
      headline: `${dominant} 중심 루틴이 탄력을 만들어줍니다`,
      body: '주 초반은 정리와 조율에, 후반은 실행과 연결에 집중하는 것이 효과적입니다. '
        + '중요한 판단은 한 번에 몰아서 하기보다 분산해서 하는 편이 실수를 줄여줍니다.',
    },
    {
      label: '이번 달',
      headline: `${cautionTone.label} 기운 보완이 이달의 핵심 과제`,
      body: cautionTone.avoid
        + ` 이달은 ${cautionTone.label}과 관련된 습관 하나를 의식적으로 만들어두면 다음 달 흐름이 눈에 띄게 달라집니다.`,
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
  const dominantLabel = ELEMENT_INFO[result.dominantElement].name.split(' ')[0];
  const weakestLabel = ELEMENT_INFO[result.weakestElement].name.split(' ')[0];
  const bestTone = getElementTone(supportElements[0] ?? result.dominantElement);
  const cautionTone = getElementTone(result.weakestElement);
  const { luckyDates, cautionDates } = buildDates(input, result);

  return {
    focusTopic,
    focusLabel: meta.label,
    focusBadge: meta.badge,
    headline: getHeadline(focusTopic, scoreMap, dominantLabel),
    summary: buildSummary(result, focusTopic),
    scores,
    primaryAction: {
      title: `${bestTone.label} 기운을 살리는 오늘의 한 가지`,
      description: bestTone.move,
    },
    cautionAction: {
      title: `${cautionTone.label} 과잉에 주의`,
      description: cautionTone.avoid,
    },
    insights: buildInsights(result, focusTopic),
    timeline: buildTimeline(result, focusTopic),
    luckyDates,
    cautionDates,
    supportElements,
  };
}
