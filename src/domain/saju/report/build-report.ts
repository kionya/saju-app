import type { SajuDataV1, SajuSymbolRef, TenGodCode } from '@/domain/saju/engine/saju-data-v1';
import {
  ELEMENT_INFO,
  getLuckyElementsFromSajuData,
  getPersonalityFromSajuData,
} from '@/lib/saju/elements';
import type { BirthInput, Element } from '@/lib/saju/types';
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

const STRENGTH_INTERPRETATION: Record<'신강' | '중화' | '신약', string> = {
  신강:
    '기본적으로 스스로 판을 끌고 가는 힘이 강한 편이라, 장점은 추진력으로 드러나지만 과하면 혼자 짊어지는 피로로 바뀌기 쉽습니다.',
  중화:
    '밀고 당기는 힘이 크게 한쪽으로 치우치지 않아 상황을 읽고 조율하는 감각이 살아 있습니다. 다만 결정이 늦어지지 않도록 기준을 먼저 세우는 편이 좋습니다.',
  신약:
    '외부 환경과 관계의 온도에 영향을 더 많이 받는 명식이라, 무리해서 버티기보다 나를 돕는 환경과 사람을 잘 고르는 것이 성패를 크게 가릅니다.',
};

const TEN_GOD_INTERPRETATION: Record<TenGodCode, string> = {
  비견: '나와 비슷한 사람, 동료, 형제 같은 결의 관계가 삶에서 자주 부각됩니다. 스스로 서려는 마음이 강하지만 양보가 어려워질 때도 있습니다.',
  겁재: '가까운 사람과 재물이나 역할을 나누는 문제에서 갈등이 생기기 쉬운 십신입니다. 정이 깊을수록 경계를 분명히 할 필요가 있습니다.',
  식신: '내가 키워내고 길러내는 힘이 좋아 자녀, 취미, 결과물, 생활의 여유 같은 주제가 삶을 따뜻하게 만듭니다.',
  상관: '표현력과 재주는 뛰어나지만 답답한 틀을 견디기 어려운 편입니다. 재능이 잘 쓰이면 매력이 되고, 억눌리면 불편함이 커집니다.',
  편재: '사람과 기회를 넓게 움직이며 돈과 활동의 물결이 크게 드나드는 흐름입니다. 잘 맞으면 기회가 크지만 흩어지지 않게 관리가 필요합니다.',
  정재: '꾸준히 쌓아 안정적으로 지키는 재물 감각이 돋보입니다. 한 번 믿은 구조를 오래 가져가지만 변화에는 시간이 걸릴 수 있습니다.',
  편관: '경쟁, 압박, 책임 속에서 단련되며 힘이 생기는 십신입니다. 버텨내는 힘은 강하지만 긴장을 오래 품지 않도록 조절이 필요합니다.',
  정관: '자리, 책임, 명예, 질서를 중시하는 흐름이라 역할을 바르게 감당하려는 마음이 큽니다. 스스로 기준이 높아 피로가 쌓일 수 있습니다.',
  편인: '남다른 감각과 직관, 혼자 깊이 파고드는 힘이 강합니다. 보통 사람보다 다른 방식으로 이해하고 받아들이는 재능이 있습니다.',
  정인: '돌봄, 후원, 배움의 흐름이 삶에서 중요한 힘으로 작용합니다. 누군가를 품고, 또 누군가에게 도움을 받는 인연이 크게 남습니다.',
};

function clampScore(value: number) {
  return Math.max(48, Math.min(92, Math.round(value)));
}

function getElementEntries(data: SajuDataV1) {
  return (Object.entries(data.fiveElements.byElement) as [Element, SajuDataV1['fiveElements']['byElement'][Element]][])
    .map(([element, value]) => [element, value.count] as [Element, number])
    .sort((a, b) => b[1] - a[1]);
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

function describeStrengthNarrative(strength: SajuDataV1['strength']) {
  if (!strength) return '';
  return `${strength.level}으로 읽혀 ${STRENGTH_INTERPRETATION[strength.level]} ${strength.rationale[0] ?? ''}`.trim();
}

function describePatternNarrative(pattern: SajuDataV1['pattern']) {
  if (!pattern) return '';
  return `${pattern.name} 기준으로 읽기 시작하는 명식이라 ${pattern.tenGod ? `${pattern.tenGod}의 역할감과 관계 패턴이 삶의 전면에 나오기 쉽습니다.` : '월령의 성격이 해석의 첫머리를 잡습니다.'} ${pattern.rationale[1] ?? ''}`.trim();
}

function describeYongsinNarrative(yongsin: SajuDataV1['yongsin']) {
  if (!yongsin) return '';
  return `용신은 ${formatSymbolList([yongsin.primary, ...yongsin.secondary])} 쪽으로 잡혀 있어, 삶에서는 이 기운을 보태는 환경과 리듬을 만들수록 균형이 좋아집니다. ${yongsin.rationale[0] ?? ''}`.trim();
}

function describeCurrentLuckNarrative(
  currentLuck: SajuDataV1['currentLuck'],
  focusLabel: string
) {
  if (!currentLuck) return '';

  const currentMajor = currentLuck.currentMajorLuck;
  const saewoon = currentLuck.saewoon;
  const wolwoon = currentLuck.wolwoon;
  const parts = [
    currentMajor?.ganzi ? `현재는 ${currentMajor.ganzi} 대운권에 있어 삶의 큰 방향을 길게 보는 편이 좋습니다.` : '',
    saewoon?.ganzi ? `${saewoon.ganzi} 세운이 겹친 해라 ${focusLabel}와 관련된 사건이 눈앞에 드러나기 쉽습니다.` : '',
    wolwoon?.ganzi ? `${wolwoon.ganzi} 월운 기준으로는 이번 달 말과 행동의 속도를 조금만 조절해도 체감 차이가 납니다.` : '',
  ].filter(Boolean);

  return parts.join(' ');
}

function describeTenGodNarrative(tenGods: SajuDataV1['tenGods']) {
  if (!tenGods?.dominant) return '';
  return TEN_GOD_INTERPRETATION[tenGods.dominant];
}

function formatElementDistribution(data: SajuDataV1) {
  const dominant = data.fiveElements.byElement[data.fiveElements.dominant];
  const weakest = data.fiveElements.byElement[data.fiveElements.weakest];
  const dominantLabel = ELEMENT_INFO[data.fiveElements.dominant].name.split(' ')[0];
  const weakestLabel = ELEMENT_INFO[data.fiveElements.weakest].name.split(' ')[0];

  return `${dominantLabel} 기운이 ${dominant.percentage}%로 전면에 서 있고, ${weakestLabel} 기운은 ${weakest.percentage}% 수준이라 이 약한 축을 어떻게 보완하느냐가 해석의 핵심이 됩니다.`;
}

function buildScores(input: BirthInput, data: SajuDataV1): ReportScore[] {
  const entries = getElementEntries(data);
  const strongest = entries[0]?.[1] ?? 0;
  const weakest = entries.at(-1)?.[1] ?? 0;
  const spread = strongest - weakest;
  const uniqueCount = entries.filter(([, count]) => count > 0).length;
  const hourBonus = data.pillars.hour ? 4 : 0;
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

function buildInsights(data: SajuDataV1, topic: FocusTopic): ReportInsight[] {
  const supportElements = getLuckyElementsFromSajuData(data);
  const supportLabels = supportElements.map((element) => ELEMENT_INFO[element].name.split(' ')[0]).join(', ');
  const dominant = ELEMENT_INFO[data.fiveElements.dominant].name.split(' ')[0];
  const weakest = ELEMENT_INFO[data.fiveElements.weakest].name.split(' ')[0];
  const dayHiddenStems = data.pillars.day.hiddenStems.map((item) => item.stem).join(' · ');

  const insights: ReportInsight[] = [
    {
      eyebrow: '일간 성향',
      title: data.dayMaster.metaphor
        ? `${data.dayMaster.stem} 일간 · ${data.dayMaster.metaphor}`
        : `${data.dayMaster.stem} 일간의 기본 태도`,
      body: `${getPersonalityFromSajuData(data)}${dayHiddenStems ? ` 일지 안쪽에는 ${dayHiddenStems} 기운이 숨어 있어 겉으로 드러나는 성향과 속마음의 결이 완전히 같지만은 않습니다.` : ''}`,
    },
    {
      eyebrow: '오행 흐름',
      title: `${dominant}가 강하고 ${weakest} 보완이 필요한 흐름입니다.`,
      body: `${formatElementDistribution(data)} ${dominant}의 장점을 살릴수록 흐름이 부드럽게 풀리고, ${weakest} 기운을 생활 리듬 안에서 보완할수록 결과가 더 안정됩니다.`,
    },
    {
      eyebrow: '질문 포커스',
      title: `${FOCUS_TOPIC_META[topic].label} 해석은 ${supportLabels || dominant} 기운을 먼저 활용하는 것이 좋습니다.`,
      body: `${FOCUS_TOPIC_META[topic].subtitle} 먼저 체감되는 장점을 살리고, 조급함보다는 반복 가능한 행동으로 연결하는 편이 좋습니다.`,
    },
  ];

  if (data.tenGods?.dominant) {
    insights.push({
      eyebrow: '십신 패턴',
      title: `${data.tenGods.dominant} 기운이 자주 드러나는 명식입니다.`,
      body: describeTenGodNarrative(data.tenGods),
    });
  }

  if (data.pattern || data.yongsin || data.strength || data.currentLuck) {
    insights.push({
      eyebrow: '명리 심화',
      title: data.pattern
        ? `${data.pattern.name} 흐름을 기준으로 읽습니다.`
        : '강약과 용신 기준의 해석이 이어집니다.',
      body: buildStructuredReadingNote(data, topic),
    });
  }

  return insights;
}

function buildTimeline(data: SajuDataV1, topic: FocusTopic): ReportTimelineItem[] {
  const bestTone = getElementTone(
    getLuckyElementsFromSajuData(data)[0] ?? data.fiveElements.dominant
  );
  const cautionTone = getElementTone(data.fiveElements.weakest);
  const dominant = ELEMENT_INFO[data.fiveElements.dominant].name.split(' ')[0];
  const currentMajor = data.currentLuck?.currentMajorLuck;
  const saewoon = data.currentLuck?.saewoon;
  const wolwoon = data.currentLuck?.wolwoon;

  return [
    {
      label: '오늘',
      headline: `${bestTone.cue}을 먼저 살리는 날`,
      body: `${FOCUS_TOPIC_META[topic].subtitle} 오늘은 ${bestTone.move}${wolwoon?.ganzi ? ` 현재 월운은 ${wolwoon.ganzi}라 작은 말투와 생활 리듬의 조절이 실제 체감 차이로 이어집니다.` : ''}`,
    },
    {
      label: '이번 달',
      headline: `${dominant} 중심 루틴을 만들면 흐름이 붙습니다.`,
      body: saewoon?.ganzi
        ? `${saewoon.ganzi} 세운이 들어온 해라 ${topic === 'wealth' ? '돈의 흐름을 넓히기보다 새는 지출을 먼저 정리하는 편이' : topic === 'love' || topic === 'relationship' ? '관계의 결론을 서두르기보다 반복되는 감정 패턴을 읽어보는 편이' : topic === 'career' ? '일의 방향을 길게 보고 역할 정리를 먼저 하는 편이' : '우선순위를 나눠 보는 편이'} 더 유리합니다.`
        : '초반에는 정리와 조율, 후반에는 실행과 연결에 힘이 붙는 패턴입니다. 중요한 선택은 한 번에 몰지 않는 편이 안정적입니다.',
    },
    {
      label: '대운 흐름',
      headline: currentMajor?.ganzi
        ? `${currentMajor.ganzi} 대운의 큰 방향을 읽어야 할 시기입니다.`
        : `${cautionTone.label} 보완이 성과 차이를 만듭니다.`,
      body: currentMajor
        ? `${currentMajor.notes.slice(0, 2).join(' ')} 지금은 단기 결과 하나보다 앞으로 몇 해를 끌고 갈 선택의 결을 먼저 보는 편이 좋습니다.`
        : cautionTone.avoid,
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

function buildDates(input: BirthInput, data: SajuDataV1) {
  const entries = getElementEntries(data);
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

export function buildSajuReport(
  input: BirthInput,
  data: SajuDataV1,
  topicValue?: string
): SajuReport {
  const focusTopic = normalizeFocusTopic(topicValue);
  const meta = FOCUS_TOPIC_META[focusTopic];
  const scores = buildScores(input, data);
  const scoreMap = Object.fromEntries(scores.map((score) => [score.key, score.score])) as Record<
    ReportScore['key'],
    number
  >;
  const supportElements = getLuckyElementsFromSajuData(data);
  const dominant = ELEMENT_INFO[data.fiveElements.dominant].name.split(' ')[0];
  const weakest = ELEMENT_INFO[data.fiveElements.weakest].name.split(' ')[0];
  const bestTone = getElementTone(supportElements[0] ?? data.fiveElements.dominant);
  const cautionTone = getElementTone(data.fiveElements.weakest);
  const { luckyDates, cautionDates } = buildDates(input, data);

  const structuredSummary = buildStructuredSummary(data, meta.label, dominant, weakest);

  return {
    focusTopic,
    focusLabel: meta.label,
    focusBadge: meta.badge,
    headline: getHeadline(focusTopic, scoreMap),
    summary: structuredSummary,
    scores,
    primaryAction: {
      title: `${bestTone.label} 기운을 살리는 한 가지`,
      description: bestTone.move,
    },
    cautionAction: {
      title: `오늘 피할 흐름`,
      description: cautionTone.avoid,
    },
    insights: buildInsights(data, focusTopic),
    timeline: buildTimeline(data, focusTopic),
    luckyDates,
    cautionDates,
    supportElements,
  };
}

function buildStructuredSummary(
  data: SajuDataV1,
  focusLabel: string,
  dominant: string,
  weakest: string
) {
  const segments = [
    data.dayMaster.metaphor
      ? `${data.dayMaster.stem} 일간은 ${data.dayMaster.metaphor}의 결을 지녀 ${data.dayMaster.description ?? getPersonalityFromSajuData(data)}`
      : getPersonalityFromSajuData(data),
    `${dominant} 기운이 전면에 서 있어 장점은 빠르게 드러나지만, ${weakest} 보완을 의식할수록 ${focusLabel} 흐름이 더 오래 안정적으로 이어집니다.`,
    formatElementDistribution(data),
  ];

  segments.push(describeStrengthNarrative(data.strength));
  segments.push(describePatternNarrative(data.pattern));
  segments.push(describeYongsinNarrative(data.yongsin));
  segments.push(describeCurrentLuckNarrative(data.currentLuck, focusLabel));

  return segments.filter(Boolean).join(' ');
}

function buildStructuredReadingNote(data: SajuDataV1, topic: FocusTopic) {
  const notes: string[] = [];

  if (data.strength) {
    notes.push(describeStrengthNarrative(data.strength));
  }

  if (data.pattern) {
    notes.push(`${data.pattern.name}으로 정리되며${data.pattern.tenGod ? ` ${data.pattern.tenGod} 중심 흐름을 봅니다.` : ' 월령의 성격을 중심으로 해석합니다.'}`);
  }

  if (data.yongsin) {
    notes.push(`${formatSymbolList([data.yongsin.primary, ...data.yongsin.secondary])}을(를) 보완 축으로 두는 구조라 ${topic === 'wealth' ? '재물 판단도 속도보다 균형을 먼저 맞출수록' : topic === 'love' || topic === 'relationship' ? '관계도 감정만 앞세우기보다 리듬을 맞출수록' : topic === 'career' ? '일도 확장보다 쓰임을 정확히 고를수록' : '생활 리듬도 무리보다 균형을 지킬수록'} 유리합니다.`);
  }

  if (data.currentLuck) {
    notes.push(describeCurrentLuckNarrative(data.currentLuck, FOCUS_TOPIC_META[topic].label));
  }

  if (notes.length === 0) {
    return '현재 저장본은 오행과 일간 중심의 seed 데이터이며, 격국과 용신 값이 채워지면 이 카드가 즉시 실제 해석으로 바뀝니다.';
  }

  return notes.join(' ');
}

function formatSymbolList(symbols: SajuSymbolRef[]) {
  return symbols.map((symbol) => symbol.label).join(' · ');
}
