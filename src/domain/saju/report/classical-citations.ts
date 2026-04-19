import type { SajuDataV1 } from '@/domain/saju/engine/saju-data-v1';
import { ELEMENT_INFO, getLuckyElementsFromSajuData } from '@/lib/saju/elements';
import type { Element } from '@/lib/saju/types';
import type {
  FocusTopic,
  ReportClassicalCitation,
  ReportEvidenceCard,
  ReportEvidenceKey,
} from './types';

const DIRECT_QUOTE_PENDING =
  '원문 직접 인용 전 단계입니다. 현재는 검증된 고전 원문 DB가 연결되기 전이라, 출처별 해석 관점과 현재 명식 근거를 연결해 표시합니다.';

const SOURCE_STATUS = 'RAG 연결 전 기준 요약';

function elementLabel(element: Element) {
  return ELEMENT_INFO[element].name.split(' ')[0];
}

function getEvidenceKeys(evidenceCards: ReportEvidenceCard[]) {
  return new Set(evidenceCards.map((card) => card.key));
}

function includesAny(source: Set<ReportEvidenceKey>, keys: ReportEvidenceKey[]) {
  return keys.some((key) => source.has(key));
}

function getMatchedKeys(source: Set<ReportEvidenceKey>, keys: ReportEvidenceKey[]) {
  return keys.filter((key) => source.has(key));
}

function buildSeasonBalanceCitation(
  data: SajuDataV1,
  evidenceKeys: Set<ReportEvidenceKey>
): ReportClassicalCitation | null {
  const matchedEvidenceKeys = getMatchedKeys(evidenceKeys, ['strength', 'yongsin']);
  if (matchedEvidenceKeys.length === 0) return null;

  const dominant = elementLabel(data.fiveElements.dominant);
  const weakest = elementLabel(data.fiveElements.weakest);
  const supportLabels = getLuckyElementsFromSajuData(data).map(elementLabel).join(' · ');
  const strengthLabel = data.strength?.level ?? '강약 계산 준비 중';
  const yongsinLabel = data.yongsin
    ? [data.yongsin.primary, ...data.yongsin.secondary].map((item) => item.label).join(' · ')
    : supportLabels || weakest;

  return {
    key: 'gungtong-season-balance',
    sourceTitle: '궁통보감',
    sourceLabel: '조후 · 계절 균형',
    theme: '용신 · 강약',
    title: '계절과 약한 축을 함께 보아 보완 방향을 잡습니다.',
    sourceNote: DIRECT_QUOTE_PENDING,
    interpretation:
      `${strengthLabel} 흐름 안에서 ${dominant} 기운이 앞서고 ${weakest} 보완이 필요하므로, ` +
      `오늘 해석은 ${yongsinLabel} 쪽을 생활 리듬에 보태는 방식으로 읽는 편이 자연스럽습니다.`,
    matchedEvidenceKeys,
    statusLabel: SOURCE_STATUS,
  };
}

function buildDayMasterCitation(
  data: SajuDataV1,
  evidenceKeys: Set<ReportEvidenceKey>,
  topic: FocusTopic
): ReportClassicalCitation | null {
  const matchedEvidenceKeys = getMatchedKeys(evidenceKeys, ['strength']);
  if (matchedEvidenceKeys.length === 0) return null;

  const dayMaster = data.dayMaster.metaphor
    ? `${data.dayMaster.stem} 일간 · ${data.dayMaster.metaphor}`
    : `${data.dayMaster.stem} 일간`;
  const focusLabel = topic === 'today' ? '오늘의 판단' : `${topic} 포커스`;

  return {
    key: 'jeokcheonsu-daymaster-flow',
    sourceTitle: '적천수',
    sourceLabel: '일간 · 기세',
    theme: '일간 중심 해석',
    title: '일간의 기세를 먼저 보고, 돕는 힘과 누르는 힘을 나눕니다.',
    sourceNote: DIRECT_QUOTE_PENDING,
    interpretation:
      `${dayMaster}을 기준으로 ${focusLabel}을 읽습니다. ` +
      '강약 카드는 스스로 밀고 가는 힘과 주변에서 받쳐주는 힘을 분리해, 무리할 지점과 살릴 장점을 구분하는 근거가 됩니다.',
    matchedEvidenceKeys,
    statusLabel: SOURCE_STATUS,
  };
}

function buildPatternCitation(
  data: SajuDataV1,
  evidenceKeys: Set<ReportEvidenceKey>
): ReportClassicalCitation | null {
  const matchedEvidenceKeys = getMatchedKeys(evidenceKeys, ['pattern']);
  if (matchedEvidenceKeys.length === 0) return null;

  const patternTitle = data.pattern?.tenGod
    ? `${data.pattern.name} · ${data.pattern.tenGod}`
    : data.pattern?.name ?? '격국 계산 준비 중';

  return {
    key: 'japyeong-pattern-frame',
    sourceTitle: '자평진전',
    sourceLabel: '월령 · 격국',
    theme: '격국 구조',
    title: '월령과 격국을 통해 삶의 기본 역할감을 잡습니다.',
    sourceNote: DIRECT_QUOTE_PENDING,
    interpretation:
      `${patternTitle} 기준으로 명식의 큰 방향을 읽습니다. ` +
      '격국 카드는 성향 설명을 길게 늘이기보다, 책임·관계·성과가 어떤 방식으로 전면에 나오는지 확인하는 출발점입니다.',
    matchedEvidenceKeys,
    statusLabel: SOURCE_STATUS,
  };
}

function buildOrreryCitation(
  data: SajuDataV1,
  evidenceKeys: Set<ReportEvidenceKey>
): ReportClassicalCitation | null {
  const targetKeys: ReportEvidenceKey[] = ['relations', 'gongmang', 'specialSals'];
  const matchedEvidenceKeys = getMatchedKeys(evidenceKeys, targetKeys);
  if (matchedEvidenceKeys.length === 0) return null;

  const relations = data.extensions?.orrery?.relations ?? [];
  const relationLabels = [...new Set(relations.map((relation) => relation.label))].slice(0, 3);
  const relationText = relationLabels.length > 0
    ? `${relationLabels.join(' · ')} 흐름`
    : '합충·공망·신살 보조 근거';

  return {
    key: 'sammyeong-supporting-signals',
    sourceTitle: '삼명통회',
    sourceLabel: '합충 · 신살 보조',
    theme: '관계 작용',
    title: '큰 구조를 흔드는 보조 신호는 따로 분리해 확인합니다.',
    sourceNote: DIRECT_QUOTE_PENDING,
    interpretation:
      `${relationText}은 결론을 단독으로 확정하는 근거가 아니라, ` +
      '강약·격국·용신 위에 얹어 사건의 속도와 관계의 마찰 지점을 세밀하게 보는 보조 근거로 다룹니다.',
    matchedEvidenceKeys,
    statusLabel: SOURCE_STATUS,
  };
}

export function buildClassicalCitations(
  data: SajuDataV1,
  evidenceCards: ReportEvidenceCard[],
  topic: FocusTopic
): ReportClassicalCitation[] {
  const evidenceKeys = getEvidenceKeys(evidenceCards);
  const citations = [
    buildSeasonBalanceCitation(data, evidenceKeys),
    buildPatternCitation(data, evidenceKeys),
    buildDayMasterCitation(data, evidenceKeys, topic),
    buildOrreryCitation(data, evidenceKeys),
  ].filter((citation): citation is ReportClassicalCitation => Boolean(citation));

  if (!includesAny(evidenceKeys, ['strength', 'pattern', 'yongsin', 'relations', 'gongmang', 'specialSals'])) {
    return [];
  }

  return citations.slice(0, 4);
}
