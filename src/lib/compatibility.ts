import {
  normalizeToSajuDataV1,
  type SajuDataV1,
} from '@/domain/saju/engine/saju-data-v1';
import { buildSajuReport } from '@/domain/saju/report/build-report';
import { COMPATIBILITY_RESULT_LABELS, type CompatibilityRelationshipSlug } from '@/content/moonlight';
import { CONTROLS, ELEMENT_INFO, GENERATES, getLuckyElementsFromSajuData } from '@/lib/saju/elements';
import type { BirthInput, Branch, Element, Stem } from '@/lib/saju/types';

const STEM_SEQUENCE: Stem[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCH_SEQUENCE: Branch[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const STEM_COMBINATIONS = new Map<string, string>([
  ['甲-己', '토'],
  ['乙-庚', '금'],
  ['丙-辛', '수'],
  ['丁-壬', '목'],
  ['戊-癸', '화'],
]);

const STEM_CLASHES = new Set<string>(['甲-庚', '乙-辛', '丙-壬', '丁-癸']);

const BRANCH_SIX_HARMONIES = new Map<string, string>([
  ['子-丑', '토'],
  ['寅-亥', '목'],
  ['卯-戌', '화'],
  ['辰-酉', '금'],
  ['巳-申', '수'],
  ['午-未', '토'],
]);

const BRANCH_CLASHES = new Set<string>(['子-午', '丑-未', '寅-申', '卯-酉', '辰-戌', '巳-亥']);
const BRANCH_HARMS = new Set<string>(['子-未', '丑-午', '寅-巳', '卯-辰', '申-亥', '酉-戌']);
const BRANCH_BREAKS = new Set<string>(['子-酉', '卯-午', '辰-丑', '未-戌', '寅-亥', '巳-申']);
const BRANCH_PUNISHMENTS = new Set<string>([
  '寅-巳',
  '巳-申',
  '寅-申',
  '丑-未',
  '未-戌',
  '丑-戌',
  '子-卯',
  '辰-辰',
  '午-午',
  '酉-酉',
  '亥-亥',
]);

const HALF_HARMONIES = new Map<string, string>([
  ['申-子', '수 반합'],
  ['子-辰', '수 반합'],
  ['亥-卯', '목 반합'],
  ['卯-未', '목 반합'],
  ['寅-午', '화 반합'],
  ['午-戌', '화 반합'],
  ['巳-酉', '금 반합'],
  ['酉-丑', '금 반합'],
]);

const RELATIONSHIP_LENS: Record<
  CompatibilityRelationshipSlug,
  {
    title: string;
    positive: string;
    caution: string;
    practice: string;
  }
> = {
  lover: {
    title: '감정의 속도와 표현 방식',
    positive: '좋아하는 마음을 주고받는 온도와 가까워지는 속도를 함께 봅니다.',
    caution: '서운함이 커질 때 누가 바로 말하고, 누가 시간을 벌고 싶어 하는지 확인하는 것이 중요합니다.',
    practice: '감정 확인, 연락 빈도, 표현의 타이밍을 맞추는 쪽으로 풀어가면 관계가 훨씬 안정됩니다.',
  },
  family: {
    title: '역할 기대와 말의 무게',
    positive: '정과 책임이 이미 깔린 관계라, 기본 인연이 이어지는 힘을 먼저 봅니다.',
    caution: '가까운 사이일수록 충고와 간섭이 한 덩어리로 들릴 수 있어 말의 무게를 조절해야 합니다.',
    practice: '가르치려는 말보다 확인과 공감의 말을 먼저 두는 편이 가족 관계에는 더 잘 맞습니다.',
  },
  friend: {
    title: '편안함과 거리감의 균형',
    positive: '편하게 이어지는 관계는 리듬이 맞고 서로 부담이 적은 지점이 분명합니다.',
    caution: '친한 사이라도 기대가 말보다 앞서면 서운함이 쌓이기 쉽습니다.',
    practice: '연락 빈도, 부탁의 선, 돈 이야기의 타이밍을 분명히 할수록 오래 갑니다.',
  },
  partner: {
    title: '역할 분담과 결정 속도',
    positive: '함께 일하는 궁합은 누가 앞에서 열고 누가 뒤에서 정리하는지가 맞을 때 힘이 납니다.',
    caution: '판단 속도와 돈을 보는 감각이 다르면 신뢰보다 피로가 먼저 쌓일 수 있습니다.',
    practice: '의사결정 기준, 책임 범위, 돈 흐름을 초반에 분명히 나누는 것이 핵심입니다.',
  },
};

const RELATIONSHIP_HINTS = [
  '생년월일은 두 사람 모두 필수입니다.',
  '태어난 시간은 속마음, 생활 리듬, 세부 충돌 포인트를 더 정밀하게 봐줍니다.',
  '출생지와 분 정보가 있으면 경도 보정까지 반영해 더 정확하게 읽을 수 있습니다.',
  '관계 유형을 함께 알아야 같은 궁합도 연인, 가족, 친구, 동업 관계에 맞게 다르게 풀이할 수 있습니다.',
] as const;

export interface CompatibilityPerson {
  name: string;
  birthInput: BirthInput;
}

export interface CompatibilityEvidenceItem {
  title: string;
  body: string;
}

export interface CompatibilityInterpretation {
  relationship: CompatibilityRelationshipSlug;
  label: string;
  score: number;
  selfData: SajuDataV1;
  partnerData: SajuDataV1;
  headline: string;
  summary: string;
  supportiveSummary: string;
  cautionSummary: string;
  practiceSummary: string;
  currentFlowSummary: string;
  evidence: CompatibilityEvidenceItem[];
  dataNote: string | null;
  relationshipLensTitle: string;
  relationshipLensBody: string;
}

function canonicalPairKey<T extends string>(left: T, right: T, order: readonly T[]) {
  const leftIndex = order.indexOf(left);
  const rightIndex = order.indexOf(right);
  return leftIndex <= rightIndex ? `${left}-${right}` : `${right}-${left}`;
}

function clampScore(value: number) {
  return Math.max(52, Math.min(92, Math.round(value)));
}

function formatElementLabel(element: Element) {
  return ELEMENT_INFO[element].name;
}

function summarizeElementInteraction(selfData: SajuDataV1, partnerData: SajuDataV1) {
  const selfElement = selfData.dayMaster.element;
  const partnerElement = partnerData.dayMaster.element;

  if (selfElement === partnerElement) {
    return {
      label: '같은 결의 일간',
      score: 6,
      summary: `두 분의 일간은 모두 ${formatElementLabel(selfElement)}이라 기본 기질과 반응 속도가 비슷한 편입니다.`,
      caution: '서로를 빨리 이해하는 대신, 비슷한 약점도 같이 커질 수 있습니다.',
    };
  }

  if (GENERATES[selfElement] === partnerElement) {
    return {
      label: '내가 상대를 북돋우는 흐름',
      score: 8,
      summary: `${formatElementLabel(selfElement)} 기운이 ${formatElementLabel(partnerElement)}을 생하는 구조라, 내가 상대를 살려주는 결이 있습니다.`,
      caution: '한쪽이 늘 먼저 맞춰주면 피로가 누적될 수 있어 주고받는 균형을 봐야 합니다.',
    };
  }

  if (GENERATES[partnerElement] === selfElement) {
    return {
      label: '상대가 나를 북돋우는 흐름',
      score: 8,
      summary: `${formatElementLabel(partnerElement)} 기운이 ${formatElementLabel(selfElement)}을 생해, 상대가 나를 받쳐주는 결이 있습니다.`,
      caution: '의지하는 쪽과 책임지는 쪽이 고정되면 관계 온도가 한쪽으로 기울 수 있습니다.',
    };
  }

  if (CONTROLS[selfElement] === partnerElement) {
    return {
      label: '내가 상대를 세게 누를 수 있는 흐름',
      score: -6,
      summary: `${formatElementLabel(selfElement)}이 ${formatElementLabel(partnerElement)}을 극하는 관계라, 내 말과 판단이 상대에게 압박으로 들리기 쉽습니다.`,
      caution: '의도는 좋아도 강하게 밀면 상대는 간섭이나 지적으로 받아들일 수 있습니다.',
    };
  }

  return {
    label: '상대가 나를 세게 누를 수 있는 흐름',
    score: -6,
    summary: `${formatElementLabel(partnerElement)}이 ${formatElementLabel(selfElement)}을 극하는 관계라, 상대의 방식이 내게는 답답함이나 통제로 느껴질 수 있습니다.`,
    caution: '기준과 속도 차이를 먼저 인정하지 않으면 작은 일도 금방 예민해질 수 있습니다.',
  };
}

function summarizeStemInteraction(selfStem: Stem, partnerStem: Stem) {
  if (selfStem === partnerStem) {
    return {
      score: 4,
      title: '일간이 같은 관계',
      body: `두 분 모두 ${selfStem} 일간이라 세상을 읽는 기본 프레임이 비슷합니다. 공감은 빠르지만 양보하지 않는 지점도 닮아 있을 수 있습니다.`,
    };
  }

  const pairKey = canonicalPairKey(selfStem, partnerStem, STEM_SEQUENCE);
  const combined = STEM_COMBINATIONS.get(pairKey);

  if (combined) {
    return {
      score: 6,
      title: '일간 천간합이 잡히는 관계',
      body: `${selfStem}과 ${partnerStem}은 천간합으로 묶여 기본적으로 서로를 붙잡아 주는 힘이 있습니다. 관계를 이어가려는 의지는 비교적 강한 편입니다.`,
    };
  }

  if (STEM_CLASHES.has(pairKey)) {
    return {
      score: -5,
      title: '일간 충이 걸리는 관계',
      body: `${selfStem}과 ${partnerStem}은 생각을 밀어붙이는 방향이 달라, 결정을 빨리 내릴수록 마찰이 생기기 쉽습니다.`,
    };
  }

  return {
    score: 0,
    title: '일간의 결은 다르지만 보완 여지가 있는 관계',
    body: `${selfStem}과 ${partnerStem}은 같은 방식으로 움직이지는 않지만, 차이를 이해하면 오히려 역할 분담이 선명해질 수 있습니다.`,
  };
}

function summarizeBranchInteraction(selfBranch: Branch, partnerBranch: Branch) {
  const pairKey = canonicalPairKey(selfBranch, partnerBranch, BRANCH_SEQUENCE);
  const items: Array<{ label: string; detail: string; score: number }> = [];

  const sixHarmony = BRANCH_SIX_HARMONIES.get(pairKey);
  if (sixHarmony) {
    items.push({
      label: '육합',
      detail: `${selfBranch}와 ${partnerBranch}는 육합으로 묶여 기본 정이 이어지는 편입니다.`,
      score: 12,
    });
  }

  if (BRANCH_CLASHES.has(pairKey)) {
    items.push({
      label: '충',
      detail: `${selfBranch}와 ${partnerBranch}는 충이 있어 부딪힐 때 정면으로 맞서는 경향이 있습니다.`,
      score: -14,
    });
  }

  if (BRANCH_PUNISHMENTS.has(pairKey)) {
    items.push({
      label: '형',
      detail: `${selfBranch}와 ${partnerBranch}는 형 관계가 있어 긴장과 압박이 누적되기 쉽습니다.`,
      score: -10,
    });
  }

  if (BRANCH_BREAKS.has(pairKey)) {
    items.push({
      label: '파',
      detail: `${selfBranch}와 ${partnerBranch}는 파 관계라 기대가 어긋날 때 틈이 크게 느껴질 수 있습니다.`,
      score: -8,
    });
  }

  if (BRANCH_HARMS.has(pairKey)) {
    items.push({
      label: '해',
      detail: `${selfBranch}와 ${partnerBranch}는 해 관계로 겉보다 속피로가 오래 남기 쉽습니다.`,
      score: -8,
    });
  }

  const halfHarmony = HALF_HARMONIES.get(pairKey);
  if (halfHarmony) {
    items.push({
      label: '반합',
      detail: `${selfBranch}와 ${partnerBranch}는 ${halfHarmony}으로 이어져, 함께 움직일 때 자연스러운 합이 생길 수 있습니다.`,
      score: 8,
    });
  }

  if (items.length === 0) {
    return {
      totalScore: 0,
      supportive: null,
      caution: null,
      body: `${selfBranch}와 ${partnerBranch}는 큰 합충보다 생활 리듬과 말투 차이가 더 중요하게 작동하는 관계입니다.`,
    };
  }

  return {
    totalScore: items.reduce((sum, item) => sum + item.score, 0),
    supportive: items.find((item) => item.score > 0) ?? null,
    caution: items.find((item) => item.score < 0) ?? null,
    body: items.map((item) => `${item.label}: ${item.detail}`).join(' '),
  };
}

function summarizeElementBalance(selfData: SajuDataV1, partnerData: SajuDataV1) {
  const selfLucky = getLuckyElementsFromSajuData(selfData);
  const partnerLucky = getLuckyElementsFromSajuData(partnerData);
  const sharedLucky = selfLucky.filter((element) => partnerLucky.includes(element));
  const complement =
    selfData.fiveElements.weakest === partnerData.fiveElements.dominant ||
    partnerData.fiveElements.weakest === selfData.fiveElements.dominant;
  const sameWeakness = selfData.fiveElements.weakest === partnerData.fiveElements.weakest;

  let score = 0;
  const lines: string[] = [];

  if (sharedLucky.length > 0) {
    score += 5;
    lines.push(`두 분 모두 ${sharedLucky.map(formatElementLabel).join(' · ')} 기운을 살릴 때 관계가 편안해집니다.`);
  }

  if (complement) {
    score += 4;
    lines.push('한쪽의 강한 오행이 다른 쪽의 약한 부분을 메워주는 보완점이 있습니다.');
  }

  if (sameWeakness) {
    score -= 3;
    lines.push(`두 분 모두 ${formatElementLabel(selfData.fiveElements.weakest)} 축이 약해 같은 지점에서 함께 흔들릴 수 있습니다.`);
  }

  if (lines.length === 0) {
    lines.push('오행 분포는 한쪽이 압도적으로 끌고 가기보다 조율을 통해 균형을 맞추는 타입입니다.');
  }

  return {
    score,
    body: lines.join(' '),
  };
}

function inferCurrentFlowSummary(
  relationship: CompatibilityRelationshipSlug,
  selfInput: BirthInput,
  selfData: SajuDataV1,
  partnerInput: BirthInput,
  partnerData: SajuDataV1
) {
  const selfReport = buildSajuReport(selfInput, selfData, 'relationship');
  const partnerReport = buildSajuReport(partnerInput, partnerData, 'relationship');
  const average = Math.round(
    ((selfReport.scores.find((item) => item.key === 'relationship')?.score ?? 70) +
      (partnerReport.scores.find((item) => item.key === 'relationship')?.score ?? 70)) /
      2
  );

  const prefix =
    relationship === 'partner'
      ? '지금은 함께 일하는 흐름에서'
      : relationship === 'lover'
        ? '지금은 감정 교류의 흐름에서'
        : '지금은 관계의 흐름에서';

  return average >= 78
    ? `${prefix} 먼저 짧게 말을 건네도 답이 돌아오기 쉬운 때입니다. ${selfReport.primaryAction.description}`
    : `${prefix} 결론을 서두르기보다 온도와 속도를 먼저 맞추는 편이 좋습니다. ${partnerReport.cautionAction.description}`;
}

function buildHeadline(
  relationship: CompatibilityRelationshipSlug,
  label: string,
  score: number,
  selfName: string,
  partnerName: string
) {
  const relationshipWord =
    relationship === 'lover'
      ? '감정선'
      : relationship === 'family'
        ? '가족의 결'
        : relationship === 'friend'
          ? '사람 사이의 호흡'
          : '함께 움직이는 힘';

  if (score >= 80) {
    return `${selfName}님과 ${partnerName}님은 ${relationshipWord}이 비교적 잘 맞는 편입니다.`;
  }

  if (score >= 70) {
    return `${selfName}님과 ${partnerName}님은 다름이 있지만 맞춰갈 여지가 충분한 관계입니다.`;
  }

  return `${selfName}님과 ${partnerName}님은 결이 달라 조율이 중요하게 작동하는 관계입니다.`;
}

function buildRelationshipSummaries(
  relationship: CompatibilityRelationshipSlug,
  elementInteraction: ReturnType<typeof summarizeElementInteraction>,
  branchInteraction: ReturnType<typeof summarizeBranchInteraction>,
  balanceInteraction: ReturnType<typeof summarizeElementBalance>
) {
  const lens = RELATIONSHIP_LENS[relationship];
  const supportiveSummary = `${elementInteraction.summary} ${lens.positive} ${balanceInteraction.body}`;
  const cautionSummary = branchInteraction.caution
    ? `${branchInteraction.caution.detail} ${lens.caution}`
    : `${elementInteraction.caution} ${lens.caution}`;
  const relationshipLensBody = `${lens.positive} ${lens.caution} ${lens.practice}`;

  return {
    supportiveSummary,
    cautionSummary,
    relationshipLensTitle: lens.title,
    relationshipLensBody,
  };
}

function buildDataNote(selfInput: BirthInput, partnerInput: BirthInput) {
  const missing: string[] = [];

  if (selfInput.hour === undefined || partnerInput.hour === undefined) {
    missing.push('태어난 시간이 한쪽 또는 양쪽에서 빠져 있어 속마음과 생활 리듬 해석은 참고 수준으로 봅니다.');
  }

  if (!selfInput.birthLocation || !partnerInput.birthLocation) {
    missing.push('출생지가 빠진 쪽은 경도 보정 없이 일반 시각 기준으로 계산했습니다.');
  }

  return missing.length > 0 ? missing.join(' ') : null;
}

export function getCompatibilityDataRequirements() {
  return [...RELATIONSHIP_HINTS];
}

export function inferCompatibilityRelationshipSlug(
  relationship: string | null | undefined
): CompatibilityRelationshipSlug {
  const value = (relationship ?? '').trim();

  if (/배우자|연인|남편|아내|부부|재회|썸/.test(value)) return 'lover';
  if (/부모|엄마|아빠|어머니|아버지|자녀|아들|딸|며느리|사위|시어머니|장모|가족/.test(value)) {
    return 'family';
  }
  if (/동료|파트너|동업|상사|부하|팀원|거래처/.test(value)) return 'partner';
  return 'friend';
}

export function resolveProfileDisplayName(
  displayName: string | null | undefined,
  email?: string | null
) {
  const trimmed = displayName?.trim();
  if (trimmed) return trimmed;

  const fallback = email?.split('@')[0]?.trim();
  return fallback || '선생님';
}

export function buildCompatibilityInterpretation(
  relationship: CompatibilityRelationshipSlug,
  self: CompatibilityPerson,
  partner: CompatibilityPerson
): CompatibilityInterpretation {
  const selfData = normalizeToSajuDataV1(self.birthInput, null, {
    location: self.birthInput.birthLocation?.label ?? null,
  });
  const partnerData = normalizeToSajuDataV1(partner.birthInput, null, {
    location: partner.birthInput.birthLocation?.label ?? null,
  });

  const stemInteraction = summarizeStemInteraction(selfData.dayMaster.stem, partnerData.dayMaster.stem);
  const elementInteraction = summarizeElementInteraction(selfData, partnerData);
  const branchInteraction = summarizeBranchInteraction(
    selfData.pillars.day.branch,
    partnerData.pillars.day.branch
  );
  const balanceInteraction = summarizeElementBalance(selfData, partnerData);

  const score = clampScore(
    70 + stemInteraction.score + elementInteraction.score + branchInteraction.totalScore + balanceInteraction.score
  );

  const label =
    score >= 84
      ? COMPATIBILITY_RESULT_LABELS[0]
      : score >= 78
        ? COMPATIBILITY_RESULT_LABELS[1]
        : score >= 70
          ? COMPATIBILITY_RESULT_LABELS[2]
          : score >= 62
            ? COMPATIBILITY_RESULT_LABELS[3]
            : COMPATIBILITY_RESULT_LABELS[4];

  const headline = buildHeadline(relationship, label, score, self.name, partner.name);
  const { supportiveSummary, cautionSummary, relationshipLensTitle, relationshipLensBody } =
    buildRelationshipSummaries(relationship, elementInteraction, branchInteraction, balanceInteraction);

  const summary = [
    headline,
    `${self.name}님은 ${selfData.dayMaster.stem} 일간, ${partner.name}님은 ${partnerData.dayMaster.stem} 일간으로 읽힙니다.`,
    branchInteraction.body,
  ].join(' ');

  return {
    relationship,
    label,
    score,
    selfData,
    partnerData,
    headline,
    summary,
    supportiveSummary,
    cautionSummary,
    practiceSummary: RELATIONSHIP_LENS[relationship].practice,
    currentFlowSummary: inferCurrentFlowSummary(
      relationship,
      self.birthInput,
      selfData,
      partner.birthInput,
      partnerData
    ),
    evidence: [
      {
        title: '일간의 기본 결',
        body: stemInteraction.body,
      },
      {
        title: '오행 상호작용',
        body: `${elementInteraction.summary} ${elementInteraction.caution}`,
      },
      {
        title: '일지에서 보이는 관계 신호',
        body: branchInteraction.body,
      },
      {
        title: '오행 보완과 겹침',
        body: balanceInteraction.body,
      },
    ],
    dataNote: buildDataNote(self.birthInput, partner.birthInput),
    relationshipLensTitle,
    relationshipLensBody,
  };
}
