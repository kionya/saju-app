import type { SajuDataV1, SajuSymbolRef, TenGodCode } from '@/domain/saju/engine/saju-data-v1';
import type { OrreryRelation } from '@/domain/saju/engine/orrery-adapter';
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
  ReportEvidenceCard,
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

const TOPIC_SCORE_KEYS: Record<FocusTopic, ReportScore['key']> = {
  today: 'overall',
  love: 'love',
  wealth: 'wealth',
  career: 'career',
  relationship: 'love',
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

function hasBatchim(value: string) {
  const trimmed = value.trim();
  const lastChar = trimmed.charAt(trimmed.length - 1);
  if (!lastChar) return false;

  const code = lastChar.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return false;

  return code % 28 !== 0;
}

function withParticle(value: string, consonantParticle: string, vowelParticle: string) {
  return `${value}${hasBatchim(value) ? consonantParticle : vowelParticle}`;
}

function getElementEntries(data: SajuDataV1) {
  return (Object.entries(data.fiveElements.byElement) as [Element, SajuDataV1['fiveElements']['byElement'][Element]][])
    .map(([element, value]) => [element, value.count] as [Element, number])
    .sort((a, b) => b[1] - a[1]);
}

function getElementTone(element: Element) {
  const info = ELEMENT_INFO[element];
  const label = info.name.split(' ')[0];
  const firstTrait = info.traits[0] ?? label;
  const secondTrait = info.traits[1] ?? '장점';

  return {
    label,
    move: `${label} 기운이 강한 날이라 ${withParticle(firstTrait, '과', '와')} ${withParticle(secondTrait, '을', '를')} 살려서 작게라도 바로 움직이는 편이 좋습니다.`,
    avoid: `${label}의 장점만 밀어붙이기보다 ${info.keywords[0]}처럼 속도를 한 번 정리하고 과한 확신은 줄이는 편이 안정적입니다.`,
    cue: info.keywords[0],
  };
}

function getOrreryExtension(data: SajuDataV1) {
  return data.extensions?.orrery ?? null;
}

function hasIndexedSpecialSal(value: number[] | null | undefined) {
  return Boolean(value && value.length > 0);
}

function getSpecialSalGroups(data: SajuDataV1) {
  const specialSals = getOrreryExtension(data)?.specialSals;
  const supportive: string[] = [];
  const cautionary: string[] = [];

  if (!specialSals) return { supportive, cautionary };

  if (hasIndexedSpecialSal(specialSals.cheonul)) supportive.push('천을귀인');
  if (hasIndexedSpecialSal(specialSals.cheonduk)) supportive.push('천덕귀인');
  if (hasIndexedSpecialSal(specialSals.wolduk)) supportive.push('월덕귀인');
  if (hasIndexedSpecialSal(specialSals.munchang)) supportive.push('문창귀인');
  if (hasIndexedSpecialSal(specialSals.geumyeo)) supportive.push('금여');
  if (hasIndexedSpecialSal(specialSals.dohwa)) cautionary.push('도화');
  if (hasIndexedSpecialSal(specialSals.yangin)) cautionary.push('양인');
  if (specialSals.baekho) cautionary.push('백호');
  if (specialSals.goegang) cautionary.push('괴강');
  if (specialSals.hongyeom) cautionary.push('홍염');

  return { supportive, cautionary };
}

function compactStrings(parts: Array<string | null | undefined>) {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));
}

function describeCurrentLuckHighlight(currentLuck: SajuDataV1['currentLuck']) {
  if (!currentLuck) return '';

  const currentMajor = currentLuck.currentMajorLuck?.ganzi;
  const saewoon = currentLuck.saewoon?.ganzi;
  const wolwoon = currentLuck.wolwoon?.ganzi;

  if (currentMajor && saewoon) {
    return `현재는 ${currentMajor} 대운과 ${saewoon} 세운이 함께 작동하므로, 단기 반응보다 앞으로 몇 달의 선택 방향을 먼저 정리하는 편이 좋습니다.`;
  }

  if (currentMajor) {
    return `현재는 ${currentMajor} 대운권에 있어 지금의 선택을 길게 이어질 생활 구조와 함께 보는 것이 좋습니다.`;
  }

  if (saewoon || wolwoon) {
    return `${[saewoon ? `${saewoon} 세운` : null, wolwoon ? `${wolwoon} 월운` : null].filter(Boolean).join('과 ')} 흐름이 들어와 있어 오늘의 판단은 속도보다 균형을 우선하는 편이 안정적입니다.`;
  }

  return '';
}

function getDayMasterSummary(data: SajuDataV1) {
  return data.dayMaster.metaphor
    ? `${data.dayMaster.stem} 일간은 ${data.dayMaster.metaphor}의 결을 지녀 ${data.dayMaster.description ?? getPersonalityFromSajuData(data)}`
    : getPersonalityFromSajuData(data);
}

function getSupportElementLabels(data: SajuDataV1) {
  return getLuckyElementsFromSajuData(data)
    .map((element) => ELEMENT_INFO[element].name.split(' ')[0])
    .join(' · ');
}

function buildSummaryHighlights(
  data: SajuDataV1,
  topic: FocusTopic,
  scoreMap: Record<ReportScore['key'], number>,
  dominant: string,
  weakest: string
) {
  const dayMasterSummary = getDayMasterSummary(data);
  const supportLabels = getSupportElementLabels(data) || dominant;
  const currentLuck = describeCurrentLuckHighlight(data.currentLuck);

  switch (topic) {
    case 'love':
      return compactStrings([
        `${dayMasterSummary} 연애에서는 감정을 크게 몰아가기보다 상대의 리듬을 넓게 받아들이는 방식이 잘 맞습니다.`,
        `연애 흐름은 ${scoreMap.love}점으로, ${supportLabels} 기운을 표현 방식에 보태면 마음을 전하는 속도가 더 부드러워집니다.`,
        currentLuck || `${dominant} 기운은 매력을 빠르게 드러내지만, ${weakest} 보완을 의식할수록 관계의 온도가 오래 안정됩니다.`,
      ]).slice(0, 3);
    case 'wealth':
      return compactStrings([
        `${dayMasterSummary} 재물에서는 큰 흐름을 읽는 감각이 장점이지만, 당장의 기회보다 구조를 먼저 보는 편이 좋습니다.`,
        `재물 흐름은 ${scoreMap.wealth}점으로, ${dominant} 기운의 장점을 살리되 ${weakest} 축이 약해지는 지출 습관을 먼저 정리해야 합니다.`,
        currentLuck || formatElementDistribution(data),
      ]).slice(0, 3);
    case 'career':
      return compactStrings([
        `${dayMasterSummary} 직장에서는 판을 넓게 보고 역할의 순서를 정리하는 힘이 성과로 이어집니다.`,
        `직장 흐름은 ${scoreMap.career}점으로, ${supportLabels} 기운을 활용하면 제안, 정리, 피드백의 힘이 더 살아납니다.`,
        data.pattern
          ? `${data.pattern.name} 흐름을 기준으로 책임과 자리의 무게를 읽으면 오늘의 업무 판단이 더 선명해집니다.`
          : currentLuck || formatElementDistribution(data),
      ]).slice(0, 3);
    case 'relationship':
      return compactStrings([
        `${dayMasterSummary} 관계에서는 한 번에 결론을 내기보다 말의 순서와 거리감을 조율하는 쪽이 편합니다.`,
        `관계 흐름은 ${scoreMap.love}점으로, ${supportLabels} 기운을 살리면 가까운 사람과의 오해를 줄이고 대화의 온도를 맞추기 좋습니다.`,
        currentLuck || `${dominant} 기운이 앞서기 쉬운 날이라 ${weakest} 보완을 의식할수록 감정의 균형이 안정됩니다.`,
      ]).slice(0, 3);
    case 'today':
    default:
      return compactStrings([
        dayMasterSummary,
        `${dominant} 기운이 전면에 서 있어 장점은 빠르게 드러나지만, ${weakest} 보완을 의식할수록 오늘 흐름이 더 오래 안정적으로 이어집니다.`,
        currentLuck || formatElementDistribution(data),
      ]).slice(0, 3);
  }
}

function buildStrengthEvidenceCard(strength: SajuDataV1['strength']): ReportEvidenceCard {
  if (!strength) {
    return {
      key: 'strength',
      label: '강약',
      title: '강약 계산 준비 중',
      body: '현재 저장본은 seed 데이터라 강약 점수와 근거가 아직 비어 있습니다.',
      details: ['강약 계산이 연결되면 일간을 돕는 힘과 누르는 힘의 균형을 이 카드에서 먼저 보여줍니다.'],
    };
  }

  return {
    key: 'strength',
    label: '강약',
    title: `${strength.level} · ${strength.score}점`,
    body: STRENGTH_INTERPRETATION[strength.level],
    details: strength.rationale.length > 0
      ? strength.rationale.slice(0, 3)
      : ['강약 점수는 계산되었고, 세부 근거 문장은 다음 단계에서 보강됩니다.'],
  };
}

function buildPatternEvidenceCard(pattern: SajuDataV1['pattern']): ReportEvidenceCard {
  if (!pattern) {
    return {
      key: 'pattern',
      label: '격국',
      title: '격국 계산 준비 중',
      body: '격국 필드가 비어 있어도 카드 자리는 유지합니다.',
      details: ['월령과 십신 기준의 rule-based 계산이 들어오면 격국 근거가 이 카드로 정리됩니다.'],
    };
  }

  return {
    key: 'pattern',
    label: '격국',
    title: pattern.tenGod ? `${pattern.name} · ${pattern.tenGod}` : pattern.name,
    body: pattern.tenGod
      ? `${pattern.tenGod}의 역할감과 관계 패턴이 해석의 첫 기준으로 올라옵니다.`
      : '월령의 성격을 기준으로 명식의 큰 구조를 먼저 읽습니다.',
    details: pattern.rationale.length > 0
      ? pattern.rationale.slice(0, 3)
      : ['격국명은 준비되었고 상세 근거 문장은 다음 단계에서 보강됩니다.'],
  };
}

function buildYongsinEvidenceCard(yongsin: SajuDataV1['yongsin']): ReportEvidenceCard {
  if (!yongsin) {
    return {
      key: 'yongsin',
      label: '용신',
      title: '용신 계산 준비 중',
      body: '용신과 기신 자리가 열려 있습니다.',
      details: ['조후와 억부 판정이 채워지면 보완해야 할 기운과 피해야 할 기운을 분리해 보여줍니다.'],
    };
  }

  const yongsinLabel = formatSymbolList([yongsin.primary, ...yongsin.secondary]);
  const kiyshinLabel = yongsin.kiyshin.length > 0 ? formatSymbolList(yongsin.kiyshin) : '기신 미기재';

  return {
    key: 'yongsin',
    label: '용신',
    title: yongsinLabel,
    body: `${yongsin.method} 기준으로 ${yongsinLabel}을 보완 축으로 보고, 기신은 ${kiyshinLabel}입니다.`,
    details: yongsin.rationale.length > 0
      ? yongsin.rationale.slice(0, 3)
      : ['용신 값은 준비되었고 상세 판정 근거는 다음 단계에서 보강됩니다.'],
  };
}

function formatRelationEvidenceLine(relation: OrreryRelation) {
  const pair = relation.target ? `${relation.source}-${relation.target}` : relation.source;
  return `${pair}: ${relation.label}${relation.detail ? ` · ${relation.detail}` : ''}`;
}

function buildRelationEvidenceCard(data: SajuDataV1): ReportEvidenceCard {
  const relations = getOrreryExtension(data)?.relations ?? [];
  const tension = relations.find((relation) =>
    ['충', '형', '해', '파', '천간충'].includes(relation.label)
  );
  const support = relations.find((relation) =>
    ['천간합', '육합', '반합', '삼합', '방합'].includes(relation.label)
  );
  const selected = [tension, support, ...relations].filter(
    (relation, index, array): relation is OrreryRelation =>
      Boolean(relation) && array.findIndex((item) => item === relation) === index
  ).slice(0, 4);
  const labels = [...new Set(selected.map((relation) => relation.label))];

  return {
    key: 'relations',
    label: '합충',
    title: labels.length > 0 ? labels.join(' · ') : '합충 근거 없음',
    body: selected.length > 0
      ? '합충은 명식 안에서 기운이 묶이거나 부딪히는 지점을 보는 근거입니다.'
      : '현재 명식에서 화면에 우선 표시할 합충 관계는 아직 확인되지 않았습니다.',
    details: selected.length > 0
      ? selected.map(formatRelationEvidenceLine)
      : ['합충 데이터가 들어오면 어떤 글자끼리 작용하는지 이 카드에 분리해 표시됩니다.'],
  };
}

function formatPillarSlot(slot: string) {
  switch (slot) {
    case 'year':
      return '년주';
    case 'month':
      return '월주';
    case 'day':
      return '일주';
    case 'hour':
      return '시주';
    default:
      return slot;
  }
}

function buildGongmangEvidenceCard(data: SajuDataV1): ReportEvidenceCard {
  const gongmang = getOrreryExtension(data)?.gongmang;
  const branches = gongmang?.branches?.join('·') ?? '';
  const slots = gongmang?.pillarSlots.map(formatPillarSlot) ?? [];

  return {
    key: 'gongmang',
    label: '공망',
    title: branches ? `${branches} 공망` : '공망 근거 없음',
    body: branches
      ? '공망은 비어 보이거나 지연되기 쉬운 축을 확인해 약속, 일정, 마무리 방식을 조정하는 근거입니다.'
      : '현재 저장본에서 공망 값은 아직 확인되지 않았습니다.',
    details: slots.length > 0
      ? [`작용 위치: ${slots.join(' · ')}`]
      : ['공망 글자가 특정 주에 닿으면 이곳에 작용 위치가 함께 표시됩니다.'],
  };
}

function buildSpecialSalsEvidenceCard(data: SajuDataV1): ReportEvidenceCard {
  const { supportive, cautionary } = getSpecialSalGroups(data);
  const names = [...supportive, ...cautionary];
  const details = compactStrings([
    supportive.length > 0 ? `도움: ${supportive.join(' · ')}` : null,
    cautionary.length > 0 ? `주의: ${cautionary.join(' · ')}` : null,
  ]);

  return {
    key: 'specialSals',
    label: '신살',
    title: names.length > 0 ? names.slice(0, 5).join(' · ') : '주요 신살 없음',
    body: names.length > 0
      ? '신살은 도움을 받는 통로와 주의해야 할 속도를 함께 보는 보조 근거입니다.'
      : '현재 명식에서 우선 표시할 주요 신살은 아직 확인되지 않았습니다.',
    details: details.length > 0 ? details : ['신살 데이터가 들어오면 도움/주의 흐름을 나누어 표시합니다.'],
  };
}

function buildEvidenceCards(data: SajuDataV1): ReportEvidenceCard[] {
  return [
    buildStrengthEvidenceCard(data.strength),
    buildPatternEvidenceCard(data.pattern),
    buildYongsinEvidenceCard(data.yongsin),
    buildRelationEvidenceCard(data),
    buildGongmangEvidenceCard(data),
    buildSpecialSalsEvidenceCard(data),
  ];
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

function buildTopicActions(
  data: SajuDataV1,
  topic: FocusTopic,
  supportElements: Element[]
) {
  const bestTone = getElementTone(supportElements[0] ?? data.fiveElements.dominant);
  const cautionTone = getElementTone(data.fiveElements.weakest);

  switch (topic) {
    case 'love':
      return {
        primaryAction: {
          title: '관계 온도를 여는 한 가지',
          description: `${bestTone.label} 기운을 살려 먼저 부드러운 안부를 건네보세요. 결론보다 분위기를 여는 표현이 연애 흐름을 더 편하게 만듭니다.`,
        },
        cautionAction: {
          title: '연애에서 피할 흐름',
          description: '상대의 반응을 바로 확정하려 하기보다, 오늘은 말의 속도와 감정의 온도를 한 번 낮춰 보는 편이 좋습니다.',
        },
      };
    case 'wealth':
      return {
        primaryAction: {
          title: '돈 흐름을 정리하는 한 가지',
          description: `${bestTone.label} 기운을 활용해 오늘 들어오고 나가는 돈을 한 번 표로 정리해 보세요. 새 기회보다 새는 곳을 잡는 힘이 먼저입니다.`,
        },
        cautionAction: {
          title: '재물에서 피할 흐름',
          description: `${cautionTone.label} 기운이 약해지는 방식의 즉흥 지출은 줄이고, 확정 전 한 번 더 비교하는 편이 안정적입니다.`,
        },
      };
    case 'career':
      return {
        primaryAction: {
          title: '일의 우선순위를 잡는 한 가지',
          description: `${bestTone.label} 기운을 살려 오늘 해야 할 일을 세 단계로 나누세요. 제안이나 보고는 결론부터 정리하면 힘이 붙습니다.`,
        },
        cautionAction: {
          title: '직장에서 피할 흐름',
          description: '여러 일을 동시에 넓히기보다, 지금 맡은 역할의 마감선과 책임 범위를 먼저 확인하는 편이 좋습니다.',
        },
      };
    case 'relationship':
      return {
        primaryAction: {
          title: '관계를 부드럽게 여는 한 가지',
          description: `${bestTone.label} 기운을 살려 짧은 안부나 감사 표현을 먼저 건네보세요. 큰 대화보다 작은 확인이 흐름을 바꿉니다.`,
        },
        cautionAction: {
          title: '관계에서 피할 흐름',
          description: '서운함을 바로 결론처럼 말하기보다, 사실과 감정을 나눠 말하면 불필요한 오해를 줄일 수 있습니다.',
        },
      };
    case 'today':
    default:
      return {
        primaryAction: {
          title: `${bestTone.label} 기운을 살리는 한 가지`,
          description: bestTone.move,
        },
        cautionAction: {
          title: '오늘 피할 흐름',
          description: cautionTone.avoid,
        },
      };
  }
}

function buildQuestionFocusInsight(
  topic: FocusTopic,
  supportLabels: string,
  dominant: string
): ReportInsight {
  switch (topic) {
    case 'love':
      return {
        eyebrow: '연애 포커스',
        title: `${supportLabels || dominant} 기운으로 표현의 온도를 조절하는 날입니다.`,
        body: '좋아하는 마음을 크게 증명하려 하기보다, 상대가 받아들이기 쉬운 말투와 속도를 먼저 고르는 편이 좋습니다. 오늘의 연애운은 결론보다 분위기 회복에 더 민감합니다.',
      };
    case 'wealth':
      return {
        eyebrow: '재물 포커스',
        title: `${supportLabels || dominant} 기운을 돈의 구조 정리에 쓰면 좋습니다.`,
        body: '수입을 크게 늘리는 선택보다 반복 지출, 미뤄둔 정산, 약속된 금액을 확인하는 쪽이 오늘 재물운을 안정시킵니다. 작은 정리가 다음 기회를 잡는 기반이 됩니다.',
      };
    case 'career':
      return {
        eyebrow: '직장 포커스',
        title: `${supportLabels || dominant} 기운을 역할 정리와 피드백에 쓰세요.`,
        body: '오늘의 직장운은 무리한 확장보다 정확한 전달에서 힘이 납니다. 보고, 제안, 일정 조율은 핵심을 먼저 말하고 세부를 붙이는 방식이 유리합니다.',
      };
    case 'relationship':
      return {
        eyebrow: '관계 포커스',
        title: `${supportLabels || dominant} 기운으로 가까운 사람과의 거리감을 조율합니다.`,
        body: '가족, 친구, 동료와의 관계에서는 맞고 틀림보다 서로의 입장을 확인하는 과정이 중요합니다. 짧은 확인과 부드러운 선 긋기가 오해를 줄입니다.',
      };
    case 'today':
    default:
      return {
        eyebrow: '오늘 포커스',
        title: `${FOCUS_TOPIC_META[topic].label} 해석은 ${supportLabels || dominant} 기운을 먼저 활용하는 것이 좋습니다.`,
        body: `${FOCUS_TOPIC_META[topic].subtitle} 먼저 체감되는 장점을 살리고, 조급함보다는 반복 가능한 행동으로 연결하는 편이 좋습니다.`,
      };
  }
}

function buildInsights(data: SajuDataV1, topic: FocusTopic): ReportInsight[] {
  const supportElements = getLuckyElementsFromSajuData(data);
  const supportLabels = supportElements.map((element) => ELEMENT_INFO[element].name.split(' ')[0]).join(' · ');
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
    buildQuestionFocusInsight(topic, supportLabels, dominant),
  ];

  if (data.tenGods?.dominant) {
    insights.push({
      eyebrow: '십신 패턴',
      title: `${data.tenGods.dominant} 기운이 자주 드러나는 명식입니다.`,
      body: describeTenGodNarrative(data.tenGods),
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
  const focusScoreKey = TOPIC_SCORE_KEYS[focusTopic];
  const supportElements = getLuckyElementsFromSajuData(data);
  const dominant = ELEMENT_INFO[data.fiveElements.dominant].name.split(' ')[0];
  const weakest = ELEMENT_INFO[data.fiveElements.weakest].name.split(' ')[0];
  const { primaryAction, cautionAction } = buildTopicActions(data, focusTopic, supportElements);
  const { luckyDates, cautionDates } = buildDates(input, data);

  const summaryHighlights = buildSummaryHighlights(data, focusTopic, scoreMap, dominant, weakest);
  const evidenceCards = buildEvidenceCards(data);

  return {
    focusTopic,
    focusLabel: meta.label,
    focusBadge: meta.badge,
    focusScoreKey,
    headline: getHeadline(focusTopic, scoreMap),
    summary: summaryHighlights.join(' '),
    summaryHighlights,
    evidenceCards,
    scores,
    primaryAction,
    cautionAction,
    insights: buildInsights(data, focusTopic),
    timeline: buildTimeline(data, focusTopic),
    luckyDates,
    cautionDates,
    supportElements,
  };
}

function formatSymbolList(symbols: SajuSymbolRef[]) {
  return symbols.map((symbol) => symbol.label).join(' · ');
}
