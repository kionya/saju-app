import {
  buildSajuReport,
  type ReportEvidenceCard,
  type ReportScore,
  type SajuInterpretationGrounding,
  type SajuReport,
} from '@/domain/saju/report';
import {
  getTopicInterpretationRule,
  selectEvidenceCard,
  toEvidenceSnippet,
} from '@/domain/saju/report/interpretation-rule-table';
import type { KasiSingleInputComparison } from '@/domain/saju/validation/kasi-calendar';
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
  grounding?: SajuInterpretationGrounding | null;
  kasiComparison?: KasiSingleInputComparison | null;
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

const CONCERN_WINDOW_COPY: Record<
  ConcernId,
  {
    favorableTitle: string;
    favorableTail: string;
    cautionTitle: string;
    cautionTail: string;
    actNowTitle: string;
    waitTitle: string;
    actNowTail: string;
    waitTail: string;
  }
> = {
  love_contact: {
    favorableTitle: '먼저 닿는 말을 쓰기 좋은 시간',
    favorableTail: '짧은 안부나 확인처럼 부담이 낮은 표현부터 꺼내는 편이 맞습니다.',
    cautionTitle: '감정 해석이 과열되기 쉬운 시간',
    cautionTail: '반응을 재촉하거나 감정의 결론을 묻는 말은 한 템포 늦추는 편이 안전합니다.',
    actNowTitle: '오늘 먼저 연락할 때',
    waitTitle: '조금 늦춰서 연락할 때',
    actNowTail: '안부처럼 가벼운 첫 문장을 쓰면 흐름을 열기 쉽습니다.',
    waitTail: '말의 온도와 길이를 다듬으면 충돌을 줄이기 좋습니다.',
  },
  money_spend: {
    favorableTitle: '정산과 확인을 끝내기 좋은 시간',
    favorableTail: '수입 확대보다 약속된 금액과 고정비를 먼저 정리하는 편이 정확합니다.',
    cautionTitle: '과신 결제가 새기 쉬운 시간',
    cautionTail: '비교 없이 결제하거나 권유만 믿고 움직이는 선택은 한 번 더 확인하세요.',
    actNowTitle: '오늘 바로 결제할 때',
    waitTitle: '하루 보류하고 다시 볼 때',
    actNowTail: '정해진 생활성 지출은 구조를 분명히 하고 끝내는 쪽이 낫습니다.',
    waitTail: '비교와 정산을 거치면 손실 체감이 확실히 줄어듭니다.',
  },
  work_meeting: {
    favorableTitle: '기준과 역할을 먼저 세우기 좋은 시간',
    favorableTail: '회의나 계약은 결론보다 조건과 책임 범위를 선명히 하는 쪽이 더 강합니다.',
    cautionTitle: '확답이 부담으로 남기 쉬운 시간',
    cautionTail: '합의가 덜 된 상태에서 바로 확답하거나 서명하는 흐름은 조심해야 합니다.',
    actNowTitle: '오늘 미팅을 바로 진행할 때',
    waitTitle: '한 번 더 조율하고 진행할 때',
    actNowTail: '기준과 역할만 분명하면 속도는 충분히 붙습니다.',
    waitTail: '수정안과 다음 약속을 함께 잡으면 주도권을 덜 잃습니다.',
  },
  relationship_conflict: {
    favorableTitle: '말의 순서를 조율하기 좋은 시간',
    favorableTail: '큰 대화보다 짧은 확인과 사실 정리를 먼저 두는 편이 흐름을 덜 흔듭니다.',
    cautionTitle: '서운함이 결론처럼 커지기 쉬운 시간',
    cautionTail: '단정형 표현이나 감정의 잔상을 크게 남기는 말은 줄이는 편이 좋습니다.',
    actNowTitle: '바로 말할 때',
    waitTitle: '조금 식힌 뒤 말할 때',
    actNowTail: '사실과 감정을 분리해 말하면 오해를 줄이기 쉽습니다.',
    waitTail: '질문형 문장으로 바꾸면 상대의 방어를 낮추는 데 도움이 됩니다.',
  },
  energy_health: {
    favorableTitle: '힘을 써도 버틸 수 있는 시간',
    favorableTail: '집중해야 할 일은 짧게 끊어 밀고, 중간 회복 구간을 분명히 두는 편이 맞습니다.',
    cautionTitle: '피로가 누적되기 쉬운 시간',
    cautionTail: '몰아서 움직이기보다 쉬는 길이와 강도를 미리 정해두는 편이 안전합니다.',
    actNowTitle: '일정을 강하게 밀어붙일 때',
    waitTitle: '중간에 쉬어가며 쓸 때',
    actNowTail: '짧은 성과는 날 수 있지만 회복 구간이 없으면 뒷심이 급히 떨어질 수 있습니다.',
    waitTail: '집중 시간은 오히려 길어지고 판단도 차분해지기 쉽습니다.',
  },
  general: {
    favorableTitle: '하루의 첫 행동을 정하기 좋은 시간',
    favorableTail: '큰 결론보다 작은 행동 하나를 먼저 끝내는 편이 전체 흐름을 안정시킵니다.',
    cautionTitle: '균형이 무너지기 쉬운 시간',
    cautionTail: '생각만 길어지거나 반대로 너무 서두르면 좋은 흐름도 거칠어질 수 있습니다.',
    actNowTitle: '바로 움직일 때',
    waitTitle: '흐름을 먼저 보고 움직일 때',
    actNowTail: '작게라도 먼저 끝내는 행동이 하루 전체의 기준을 만들어 줍니다.',
    waitTail: '우선순위를 먼저 세우면 뒤쪽 선택이 훨씬 가벼워집니다.',
  },
};

function clampScore(value: number) {
  return Math.max(48, Math.min(92, Math.round(value)));
}

function compactStrings(parts: Array<string | null | undefined>) {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));
}

function splitSentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeSentenceKey(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

function stripEvidenceBoilerplate(text: string) {
  return text
    .replace(/^쉽게 말하면\s*/g, '')
    .replace(/^전문적으로는\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getLastReadableChar(value: string) {
  for (let index = value.length - 1; index >= 0; index -= 1) {
    const char = value[index];
    if (!char) continue;
    if (/\s/.test(char)) continue;
    if (/["'“”‘’)\]}.,!?]/.test(char)) continue;
    return char;
  }

  return '';
}

function hasBatchimLike(value: string) {
  const lastChar = getLastReadableChar(value);
  if (!lastChar) return false;

  const code = lastChar.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return false;

  return code % 28 !== 0;
}

function endsWithRieulBatchim(value: string) {
  const lastChar = getLastReadableChar(value);
  if (!lastChar) return false;

  const code = lastChar.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return false;

  return code % 28 === 8;
}

function withKoreanParticle(value: string, consonantParticle: string, vowelParticle: string) {
  if (consonantParticle === '으로' && vowelParticle === '로' && endsWithRieulBatchim(value)) {
    return `${value}${vowelParticle}`;
  }

  return `${value}${hasBatchimLike(value) ? consonantParticle : vowelParticle}`;
}

function polishFortuneCopy(text: string) {
  return text
    .replace(/([^\s]+\s*\([^)]+\))\([^)]+\)/g, '$1')
    .replace(/([^\s]+(?:\s*\([^)]+\))?)을\(를\)/g, (_, value: string) => withKoreanParticle(value, '을', '를'))
    .replace(/([0-9]+점)로 계산되어/g, (_, value: string) => `${withKoreanParticle(value, '으로', '로')} 계산되어`)
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeEvidenceTitleForSentence(
  key: ReportEvidenceCard['key'],
  title: string
) {
  if (key === 'strength') {
    return title.replace(/\s*·\s*/g, ' ');
  }

  return title.replace(/\s*·\s*/g, ' · ');
}

function joinUniqueSentences(parts: Array<string | null | undefined>) {
  const seen = new Set<string>();
  const sentences: string[] = [];

  for (const part of compactStrings(parts)) {
    for (const sentence of splitSentences(part)) {
      const key = normalizeSentenceKey(sentence);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      sentences.push(sentence);
    }
  }

  return sentences.join(' ');
}

function uniqueStrings(parts: Array<string | null | undefined>, limit?: number) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const part of compactStrings(parts)) {
    if (seen.has(part)) continue;
    seen.add(part);
    result.push(part);
    if (limit && result.length >= limit) break;
  }

  return result;
}

function compactActionDescription(
  description: string,
  evidenceSnippet: string | null
) {
  const withoutScorePrefix = description.replace(/^[^.!?]+점 기준입니다\.\s*/, '').trim();
  const withoutEvidence = evidenceSnippet
    ? withoutScorePrefix.replace(evidenceSnippet, '').trim()
    : withoutScorePrefix;

  return joinUniqueSentences([withoutEvidence]);
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
  const defaultBase =
    '오늘 해석은 일간과 현재 운의 강약을 먼저 잡고, 그 위에 관계와 돈, 말의 속도를 겹쳐 읽습니다.';

  const normalizedTitle = evidenceCard?.title?.replace(/\s*·\s*/g, ' ').trim();
  const normalizedBody = evidenceCard?.body ? stripEvidenceBoilerplate(evidenceCard.body) : '';

  let base = defaultBase;
  if (evidenceCard && normalizedTitle && normalizedBody) {
    const sentenceTitle = normalizeEvidenceTitleForSentence(evidenceCard.key, normalizedTitle);

    switch (evidenceCard.key) {
      case 'strength':
        base = `${evidenceCard.label}은 ${withKoreanParticle(sentenceTitle, '으로', '로')} 계산되어 ${normalizedBody}`;
        break;
      case 'pattern':
        base = `${evidenceCard.label}은 ${sentenceTitle}로 잡히며 ${normalizedBody}`;
        break;
      case 'yongsin':
        base = `${evidenceCard.label}은 ${sentenceTitle}로 읽으며 ${normalizedBody}`;
        break;
      case 'relations':
        base = `${evidenceCard.label}은 ${sentenceTitle}로 읽히고 ${normalizedBody}`;
        break;
      default:
        base = `${evidenceCard.label}은 ${sentenceTitle}로 읽으며 ${normalizedBody}`;
        break;
    }
  } else if (evidenceCard?.plainSummary || evidenceCard?.technicalSummary || evidenceCard?.body) {
    base = stripEvidenceBoilerplate(
      evidenceCard.plainSummary || evidenceCard.technicalSummary || evidenceCard.body
    );
  }

  if (!unknownBirthTime) return polishFortuneCopy(base);

  return polishFortuneCopy(
    `${base} 다만 태어난 시간이 없어 시주(時柱) 기반 세부 타이밍은 보수적으로 줄여 읽습니다.`
  );
}

function buildKasiSummary(kasiComparison: KasiSingleInputComparison | null | undefined) {
  if (!kasiComparison) {
    return {
      available: false,
      ok: true,
      summary: '역법 대조 정보는 아직 함께 저장되지 않았습니다.',
    };
  }

  const lunarDate = `${kasiComparison.kasi.lunYear}.${kasiComparison.kasi.lunMonth}.${kasiComparison.kasi.lunDay}${kasiComparison.kasi.lunLeapmonth === '윤' ? ' 윤달' : ''}`;
  if (kasiComparison.issues.length === 0) {
    return {
      available: true,
      ok: true,
      summary: `KASI 역법과 대조했을 때 음력일과 일진이 일치합니다. 기준 음력일은 ${lunarDate}, 일진은 ${kasiComparison.kasi.lunIljin ?? '미제공'}입니다.`,
    };
  }

  const issueSummary = kasiComparison.issues
    .slice(0, 2)
    .map((issue) => `${issue.field} 차이`)
    .join(', ');

  return {
    available: true,
    ok: false,
    summary: `KASI 대조에서 ${issueSummary}가 확인됐습니다. 기준 음력일은 ${lunarDate}, 일진은 ${kasiComparison.kasi.lunIljin ?? '미제공'}입니다.`,
  };
}

function buildTodayGroundingSummary(
  grounding: SajuInterpretationGrounding | null | undefined,
  kasiComparison: KasiSingleInputComparison | null | undefined,
  focusReport: SajuReport,
  sajuData: SajuDataV1
) {
  const evidenceCards =
    focusReport.focusTopic === 'today'
      ? grounding?.evidenceJson.classics.cards ?? focusReport.evidenceCards
      : focusReport.evidenceCards;
  const primaryConcept = focusReport.evidenceCards[0]?.label ?? grounding?.evidenceJson.primaryConcept ?? '용신';
  const strengthLine =
    grounding?.evidenceJson.strength.level && grounding?.evidenceJson.strength.score !== null
      ? `강약 ${grounding.evidenceJson.strength.level} · ${grounding.evidenceJson.strength.score}점`
      : `강약 ${sajuData.strength?.level ?? '판정 준비 중'}`;
  const patternLine =
    grounding?.evidenceJson.pattern.name
      ? `격국 ${grounding.evidenceJson.pattern.name}${grounding.evidenceJson.pattern.tenGod ? ` · ${grounding.evidenceJson.pattern.tenGod}` : ''}`
      : `격국 ${sajuData.pattern?.name ?? '판정 준비 중'}`;
  const yongsinLine =
    grounding?.evidenceJson.yongsin.primary
      ? `용신 ${grounding.evidenceJson.yongsin.primary}${grounding.evidenceJson.yongsin.support.length > 0 ? ` · 보조 ${grounding.evidenceJson.yongsin.support.join(' · ')}` : ''}`
      : `용신 ${sajuData.yongsin?.primary?.label ?? '판정 준비 중'}`;
  const luckLine = grounding?.evidenceJson.luckFlow.currentMajorLuck
    ? `현재 대운 ${grounding.evidenceJson.luckFlow.currentMajorLuck}`
    : grounding?.evidenceJson.luckFlow.saewoon
      ? `현재 세운 ${grounding.evidenceJson.luckFlow.saewoon}`
      : `현재 운 ${sajuData.currentLuck?.saewoon?.ganzi ?? '정리 중'}`;

  return {
    primaryConcept,
    factLines: [
      `일간 ${sajuData.dayMaster.stem}${sajuData.dayMaster.element ? ` · ${sajuData.dayMaster.element}` : ''}`,
      strengthLine,
      patternLine,
      yongsinLine,
      luckLine,
    ],
    evidenceLines: evidenceCards
      .slice(0, 3)
      .map((card) => polishFortuneCopy(`${card.label} · ${card.plainSummary || card.title}`)),
    kasi: buildKasiSummary(kasiComparison),
  };
}

function buildOpportunityBody(
  concernId: ConcernId,
  focusReport: SajuReport,
  sajuData: SajuDataV1
) {
  const concernCopy = CONCERN_WINDOW_COPY[concernId];
  const evidenceSnippet = getTodayEvidenceSnippet(focusReport);
  const actionLead = compactActionDescription(
    focusReport.primaryAction.description,
    evidenceSnippet
  );
  const leadHint = getEvidenceActionHints(focusReport, 'lead', 1)[0];
  const luckFact = getLuckFactLine(sajuData);

  return joinUniqueSentences([
    evidenceSnippet,
    actionLead,
    leadHint ? `오늘은 "${leadHint}"부터 먼저 잡는 편이 좋습니다.` : null,
    luckFact ? `지금은 ${luckFact}을 함께 보며 ${concernCopy.favorableTail}` : concernCopy.favorableTail,
  ]);
}

function buildRiskBody(
  concernId: ConcernId,
  focusReport: SajuReport,
  sajuData: SajuDataV1
) {
  const concernCopy = CONCERN_WINDOW_COPY[concernId];
  const cautionCard = getTodayEvidenceCard(focusReport, 'caution');
  const evidenceSnippet = cautionCard ? toEvidenceSnippet(cautionCard) : null;
  const actionLead = compactActionDescription(
    focusReport.cautionAction.description,
    evidenceSnippet
  );
  const cautionHint = getEvidenceActionHints(focusReport, 'caution', 1)[0];
  const luckFact = getLuckFactLine(sajuData);

  return joinUniqueSentences([
    evidenceSnippet,
    actionLead,
    cautionHint ? `오늘은 ${withKoreanParticle(`"${cautionHint}"`, '을', '를')} 놓치면 흐름이 급히 거칠어질 수 있습니다.` : null,
    luckFact ? `지금은 ${luckFact}이 겹쳐 보여 단기 반응을 크게 믿지 않는 편이 안전합니다.` : concernCopy.cautionTail,
  ].map((part) => (part ? polishFortuneCopy(part) : part)));
}

function getTodayEvidenceSnippet(report: SajuReport) {
  const rule = getTopicInterpretationRule(report.focusTopic);
  const card = selectEvidenceCard(report.evidenceCards, rule.evidencePriority);
  return toEvidenceSnippet(card);
}

function getTodayEvidenceCard(
  report: SajuReport,
  type: 'lead' | 'caution'
) {
  const rule = getTopicInterpretationRule(report.focusTopic);
  const priorities = type === 'lead' ? rule.evidencePriority : rule.cautionPriority;
  return selectEvidenceCard(report.evidenceCards, priorities);
}

function getEvidenceActionHints(
  report: SajuReport,
  type: 'lead' | 'caution',
  limit = 2
) {
  return uniqueStrings(getTodayEvidenceCard(report, type)?.practicalActions ?? [], limit);
}

function getLuckFactLine(sajuData: SajuDataV1) {
  return compactStrings([
    sajuData.currentLuck?.currentMajorLuck?.ganzi
      ? `${sajuData.currentLuck.currentMajorLuck.ganzi} 대운`
      : null,
    sajuData.currentLuck?.saewoon?.ganzi
      ? `${sajuData.currentLuck.saewoon.ganzi} 세운`
      : null,
    sajuData.currentLuck?.wolwoon?.ganzi
      ? `${sajuData.currentLuck.wolwoon.ganzi} 월운`
      : null,
  ]).join(' / ');
}

function buildLeadNarrative(report: SajuReport) {
  const baseSummary = report.summaryHighlights[0] ?? report.summary;
  const evidenceSnippet = getTodayEvidenceSnippet(report);

  if (!baseSummary) {
    return evidenceSnippet ?? '';
  }

  if (!evidenceSnippet) {
    return joinUniqueSentences([baseSummary]);
  }

  return joinUniqueSentences([baseSummary]);
}

function getElementWindowTail(
  element: string,
  type: 'favorable' | 'caution',
  index: number
) {
  const info =
    ELEMENT_INFO[(Object.keys(ELEMENT_INFO) as Array<keyof typeof ELEMENT_INFO>).find(
      (key) => ELEMENT_INFO[key].name.startsWith(element)
    ) ?? '토'];

  if (type === 'favorable') {
    return index === 0
      ? `${info.keywords[0]}처럼 첫 말을 짧게 정리하면 흐름을 가볍게 열 수 있습니다.`
      : `${info.keywords[1] ?? info.keywords[0]} 감각으로 확인과 마무리를 하면 뒤쪽 선택이 더 편해집니다.`;
  }

  return index === 0
    ? `${info.keywords[0]} 쪽으로 과하게 밀면 작은 반응도 크게 받아들이기 쉽습니다.`
    : `${withKoreanParticle(info.keywords[1] ?? info.keywords[0], '을', '를')} 놓치면 같은 오해가 뒤에서 다시 커질 수 있습니다.`;
}

function buildOneLineBody(
  concernId: ConcernId,
  concernLabel: string,
  focusReport: SajuReport,
  todayReport: SajuReport,
  counselorId: MoonlightCounselorId
) {
  const focusLead = buildLeadNarrative(focusReport);
  const todayLead = buildLeadNarrative(todayReport);

  switch (concernId) {
    case 'love_contact':
      return joinUniqueSentences([
        focusLead,
        counselorId === 'male'
          ? '먼저 닿는 말의 강도보다 속도를 조절하는 쪽이 낫습니다.'
          : '먼저 닿는 말의 온도와 속도를 맞추는 쪽이 훨씬 자연스럽습니다.',
      ]);
    case 'money_spend':
      return joinUniqueSentences([focusLead, '수입 확대보다 새는 돈을 막는 판단이 오늘 체감 차이를 크게 만듭니다.']);
    case 'work_meeting':
      return joinUniqueSentences([focusLead, '회의나 계약은 결론을 서두르기보다 먼저 기준을 분명히 세우는 편이 좋습니다.']);
    case 'relationship_conflict':
      return joinUniqueSentences([focusLead, '감정을 크게 밀기보다 질문 한 마디로 온도를 낮추는 쪽이 안전합니다.']);
    case 'energy_health':
      return joinUniqueSentences([
        todayLead,
        '몸을 밀어붙이는 시간과 쉬어야 할 구간을 나눠 쓰는 것이 중요합니다.',
      ]);
    case 'general':
    default:
      return joinUniqueSentences([
        `${concernLabel}으로 읽으면 ${todayLead}`,
      ]);
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
  const concernCopy = CONCERN_WINDOW_COPY[concernId];
  const supportElements = getLuckyElementsFromSajuData(sajuData);
  const dominantElement = ELEMENT_INFO[sajuData.fiveElements.dominant].name.split(' ')[0];
  const baseElements =
    type === 'favorable'
      ? supportElements.slice(0, 2)
      : [sajuData.fiveElements.weakest, sajuData.fiveElements.dominant];
  const evidenceSnippet = getTodayEvidenceSnippet(report);
  const actionHints = getEvidenceActionHints(report, type === 'favorable' ? 'lead' : 'caution', 2);
  const actionLead = compactActionDescription(
    type === 'favorable' ? report.primaryAction.description : report.cautionAction.description,
    evidenceSnippet
  );
  const luckFact = getLuckFactLine(sajuData);

  return baseElements.slice(0, 2).flatMap((element, index) => {
    const elementLabel = typeof element === 'string' ? ELEMENT_INFO[element].name.split(' ')[0] : dominantElement;
    const ranges = ELEMENT_WINDOWS[element] ?? ELEMENT_WINDOWS.토;
    const range = ranges[index % ranges.length] ?? ranges[0];
    const hint = actionHints[index] ?? actionHints[0];

    return [
      {
        range,
        mood: type,
        title:
          type === 'favorable'
            ? `${elementLabel} · ${concernCopy.favorableTitle}`
            : `${elementLabel} · ${concernCopy.cautionTitle}`,
        body:
          type === 'favorable'
            ? joinUniqueSentences([
                evidenceSnippet,
                hint ? `오늘은 "${hint}" 쪽으로 먼저 움직이기 좋습니다.` : null,
                actionLead,
                luckFact ? `지금은 ${luckFact}을 함께 보고 움직이면 흐름을 덜 놓칩니다.` : null,
                getElementWindowTail(elementLabel, type, index),
                concernCopy.favorableTail,
              ])
            : joinUniqueSentences([
                evidenceSnippet,
                hint ? `오늘은 ${withKoreanParticle(`"${hint}"`, '을', '를')} 먼저 점검해야 과열을 줄일 수 있습니다.` : null,
                actionLead,
                luckFact ? `지금은 ${luckFact}이 겹쳐 보여 단기 반응을 크게 믿지 않는 편이 안전합니다.` : null,
                getElementWindowTail(elementLabel, type, index),
                concernCopy.cautionTail,
              ]),
      },
    ];
  });
}

function buildScenarioComparison(
  concernId: ConcernId,
  report: SajuReport,
  sajuData: SajuDataV1
) {
  const concernCopy = CONCERN_WINDOW_COPY[concernId];
  const evidenceSnippet = getTodayEvidenceSnippet(report);
  const leadHints = getEvidenceActionHints(report, 'lead', 2);
  const cautionHints = getEvidenceActionHints(report, 'caution', 2);
  const leadHint = leadHints[0];
  const secondaryLeadHint = leadHints[1] ?? leadHints[0];
  const cautionHint = cautionHints[0];
  const secondaryCautionHint = cautionHints[1] ?? cautionHints[0];
  const luckFact = getLuckFactLine(sajuData);
  const primaryAction = compactActionDescription(report.primaryAction.description, evidenceSnippet);
  const cautionAction = compactActionDescription(report.cautionAction.description, evidenceSnippet);

  return [
    {
      title: concernCopy.actNowTitle,
      better: joinUniqueSentences([
        evidenceSnippet,
        primaryAction,
        leadHint ? `특히 "${leadHint}"부터 잡고 들어가면 흐름을 덜 놓칩니다.` : null,
        concernCopy.actNowTail,
      ]),
      watch: joinUniqueSentences([
        cautionAction,
        cautionHint ? `${withKoreanParticle(`"${cautionHint}"`, '을', '를')} 같이 놓치면 작은 선택도 피로로 바뀌기 쉽습니다.` : null,
        luckFact ? `특히 ${luckFact}이 겹친 날이라 단기 반응을 과신하지 않는 편이 좋습니다.` : null,
      ]),
    },
    {
      title: concernCopy.waitTitle,
      better: joinUniqueSentences([
        evidenceSnippet,
        secondaryLeadHint ? `${withKoreanParticle(`"${secondaryLeadHint}"`, '을', '를')} 먼저 정리하고 움직이면 결과가 더 매끈해집니다.` : null,
        concernCopy.waitTail,
      ]),
      watch: joinUniqueSentences([
        secondaryCautionHint
          ? `${withKoreanParticle(`"${secondaryCautionHint}"`, '을', '를')} 미루기만 하면 같은 빈틈이 뒤에서 다시 커질 수 있습니다.`
          : null,
        '우선순위 없이 미루기만 하면 좋은 흐름도 손에서 미끄러질 수 있습니다.',
      ]),
    },
  ];
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

function buildRecommendedActions(
  concernId: ConcernId,
  focusReport: SajuReport,
  sajuData: SajuDataV1
) {
  const concernCopy = CONCERN_WINDOW_COPY[concernId];
  const leadHints = getEvidenceActionHints(focusReport, 'lead', 3);
  const leadEvidenceSnippet = getTodayEvidenceSnippet(focusReport);
  const primaryAction = compactActionDescription(
    focusReport.primaryAction.description,
    leadEvidenceSnippet
  );
  const actions = uniqueStrings(
    [
      primaryAction,
      ...leadHints.map((item) => `${item} 흐름부터 먼저 잡아보세요.`),
      getLuckFactLine(sajuData)
        ? `지금은 ${getLuckFactLine(sajuData)}을 같이 보며 ${concernCopy.favorableTail}`
        : concernCopy.favorableTail,
      `보완축 ${sajuData.yongsin?.primary?.label ?? '용신'}을 생활 루틴으로 쓰면 체감 안정감이 더 큽니다.`,
    ],
    3
  );

  return actions;
}

function buildAvoidActions(
  concernId: ConcernId,
  focusReport: SajuReport,
  input: BirthInput,
  sajuData: SajuDataV1
) {
  const concernCopy = CONCERN_WINDOW_COPY[concernId];
  const cautionHints = getEvidenceActionHints(focusReport, 'caution', 3);
  const cautionEvidenceSnippet = getTodayEvidenceSnippet(focusReport);
  const cautionAction = compactActionDescription(
    focusReport.cautionAction.description,
    cautionEvidenceSnippet
  );
  const actions = uniqueStrings(
    [
      cautionAction,
      ...cautionHints.map((item) => `${item}을 놓친 채 밀어붙이지 않는 편이 좋습니다.`),
      input.unknownTime
        ? '태어난 시간이 없으니 세부 타이밍보다 큰 흐름을 먼저 믿는 편이 안전합니다.'
        : getLuckFactLine(sajuData)
          ? `${getLuckFactLine(sajuData)}이 겹친 날이라 반응이 좋더라도 같은 속도로 하루 종일 밀지 않는 편이 낫습니다.`
          : concernCopy.cautionTail,
    ],
    3
  );

  return actions;
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
  const groundingSummary = buildTodayGroundingSummary(
    options.grounding,
    options.kasiComparison,
    focusReport,
    sajuData
  );
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
      body: buildOpportunityBody(options.concernId, focusReport, sajuData),
    },
    risk: {
      title: `${concern.shortLabel} 쪽 주의`,
      body: buildRiskBody(options.concernId, focusReport, sajuData),
    },
    reasonSnippet: {
      title: '사주 근거 한 줄',
      body: reasonBody,
    },
    groundingSummary,
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
  concernId: ConcernId,
  grounding?: SajuInterpretationGrounding | null,
  kasiComparison?: KasiSingleInputComparison | null
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
    groundingSummary: buildTodayGroundingSummary(
      grounding,
      kasiComparison,
      focusReport,
      sajuData
    ),
    favorableWindows: buildTimeWindows(concernId, focusReport, sajuData, 'favorable'),
    cautionWindows: buildTimeWindows(concernId, focusReport, sajuData, 'caution'),
    avoidActions: buildAvoidActions(concernId, focusReport, input, sajuData),
    recommendedActions: buildRecommendedActions(concernId, focusReport, sajuData),
    scenarios: buildScenarioComparison(concernId, focusReport, sajuData),
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
