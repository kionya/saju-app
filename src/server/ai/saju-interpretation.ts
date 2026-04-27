import type { FocusTopic, ReportScore, SajuReport } from '@/domain/saju/report/types';
import {
  buildSajuInterpretationGrounding,
  type SajuInterpretationGrounding,
} from '@/domain/saju/report';
import {
  buildReportCounselorInstructions,
  type MoonlightCounselorId,
} from '@/lib/counselors';

export const SAJU_INTERPRETATION_PROMPT_VERSION = 'saju-interpret-v4';

export interface SajuAiInterpretation {
  headline: string;
  summary: string;
  insights: string[];
}

export interface ParsedSajuAiInterpretation {
  ok: boolean;
  interpretation: SajuAiInterpretation;
  errorMessage: string | null;
}

const MAX_HEADLINE_LENGTH = 80;
const MAX_SUMMARY_LENGTH = 520;
const MAX_INSIGHT_LENGTH = 220;
const MAX_INSIGHTS = 4;

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function normalizeInsights(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => cleanText(item, MAX_INSIGHT_LENGTH))
    .filter(Boolean)
    .slice(0, MAX_INSIGHTS);
}

export function getInterpretationPromptVersion(counselorId: MoonlightCounselorId) {
  return `${SAJU_INTERPRETATION_PROMPT_VERSION}-${counselorId}`;
}

export function buildFallbackInterpretation(
  report: SajuReport,
  counselorId: MoonlightCounselorId = 'female',
  grounding?: SajuInterpretationGrounding
): SajuAiInterpretation {
  const summaryPrefix =
    counselorId === 'male' ? '핵심부터 보면, ' : '흐름을 차분히 읽어보면, ';
  const evidenceCards = grounding?.evidenceJson.classics.cards ?? [];
  const primaryConcept = grounding?.evidenceJson.primaryConcept ?? null;
  const strengthSummary =
    grounding?.evidenceJson.strength.level && grounding?.evidenceJson.strength.score !== null
      ? `강약은 ${grounding.evidenceJson.strength.level} ${grounding.evidenceJson.strength.score}점으로 읽힙니다.`
      : null;
  const patternSummary = grounding?.evidenceJson.pattern.name
    ? `격국은 ${grounding.evidenceJson.pattern.name}${grounding.evidenceJson.pattern.tenGod ? ` · ${grounding.evidenceJson.pattern.tenGod}` : ''} 흐름입니다.`
    : null;
  const yongsinSummary = grounding?.evidenceJson.yongsin.primary
    ? `용신은 ${grounding.evidenceJson.yongsin.primary}${grounding.evidenceJson.yongsin.support.length > 0 ? `, 보조는 ${grounding.evidenceJson.yongsin.support.join(' · ')}` : ''}로 잡힙니다.`
    : null;
  const luckSummary = grounding?.evidenceJson.luckFlow.currentMajorLuck
    ? `현재 ${grounding.evidenceJson.luckFlow.currentMajorLuck} 대운이 함께 작동합니다.`
    : grounding?.evidenceJson.luckFlow.saewoon
      ? `현재 ${grounding.evidenceJson.luckFlow.saewoon} 세운이 크게 작동합니다.`
      : null;
  const summaryCore = cleanText(
    compactStrings([
      primaryConcept ? `${primaryConcept} 기준을 먼저 세우고 읽었습니다.` : null,
      strengthSummary,
      patternSummary,
      yongsinSummary,
      luckSummary,
    ]).join(' '),
    MAX_SUMMARY_LENGTH
  );

  const groundingInsights = evidenceCards
    .slice(0, 3)
    .map((card) =>
      cleanText(`${card.label}: ${card.plainSummary || `${card.title} 흐름이 핵심입니다.`}`, MAX_INSIGHT_LENGTH)
    )
    .filter(Boolean);

  const reportInsights = report.insights
    .map((insight) => cleanText(`${insight.title}: ${insight.body}`, MAX_INSIGHT_LENGTH))
    .filter(Boolean)
    .slice(0, 3);

  return {
    headline: cleanText(report.headline, MAX_HEADLINE_LENGTH),
    summary: cleanText(
      `${summaryPrefix}${summaryCore || report.summary}`,
      MAX_SUMMARY_LENGTH
    ),
    insights:
      groundingInsights.length > 0
        ? groundingInsights
        : reportInsights.length > 0
          ? reportInsights
        : report.summaryHighlights
            .map((item) => cleanText(item, MAX_INSIGHT_LENGTH))
            .filter(Boolean)
            .slice(0, 3),
  };
}

function compactStrings(parts: Array<string | null | undefined>) {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));
}

function extractJsonCandidate(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1);
  }

  return text;
}

export function parseInterpretationText(
  text: string,
  fallback: SajuAiInterpretation
): ParsedSajuAiInterpretation {
  try {
    const parsed = JSON.parse(extractJsonCandidate(text)) as Record<string, unknown>;
    const headline = cleanText(parsed.headline, MAX_HEADLINE_LENGTH);
    const summary = cleanText(parsed.summary, MAX_SUMMARY_LENGTH);
    const insights = normalizeInsights(parsed.insights);

    if (!headline || !summary || insights.length === 0) {
      return {
        ok: false,
        interpretation: fallback,
        errorMessage: 'AI interpretation JSON is missing headline, summary, or insights.',
      };
    }

    return {
      ok: true,
      interpretation: { headline, summary, insights },
      errorMessage: null,
    };
  } catch (error) {
    return {
      ok: false,
      interpretation: fallback,
      errorMessage:
        error instanceof Error ? error.message : 'AI interpretation JSON could not be parsed.',
    };
  }
}

export function createInterpretationPrompt(
  grounding: SajuInterpretationGrounding,
  focus: {
    topic: FocusTopic;
    label: string;
    scoreKey: ReportScore['key'];
  },
  counselorId: MoonlightCounselorId = 'female',
  recentFeedbackSummary?: string | null
) {
  const promptPayload = {
    counselor: {
      id: counselorId,
    },
    focus: {
      topic: focus.topic,
      label: focus.label,
      scoreKey: focus.scoreKey,
    },
    recentFeedbackSummary: recentFeedbackSummary ?? null,
    factJson: grounding.factJson,
    evidenceJson: grounding.evidenceJson,
  };

  return {
    instructions: [
      '당신은 한국 명리학 리포트를 쓰는 전문 해석 에디터입니다.',
      '제공된 factJson과 evidenceJson 안에서만 해석하고, 없는 신살·격국·고전 출처를 새로 만들지 않습니다.',
      'factJson은 계산된 사실값, evidenceJson은 왜 그렇게 읽었는지에 대한 근거입니다. 두 JSON 바깥의 상식을 끌어오지 않습니다.',
      '사용자가 바로 이해할 수 있도록 결론을 먼저 말하고, 근거와 생활 적용을 자연스럽게 이어 설명합니다.',
      '명리 용어는 필요한 경우에만 쓰고, 처음 등장할 때는 쉬운 한국어 풀이를 함께 붙입니다.',
      '점수나 계산값을 그대로 반복 나열하지 말고, 지금 어떤 흐름이 강한지와 왜 그렇게 읽는지를 evidenceJson 기준으로 풀어 씁니다.',
      'recentFeedbackSummary가 있으면 최근 사용자 반응을 참고해 단정 표현의 강도만 조절하되, 계산 근거보다 앞세우지 않습니다.',
      '문장은 부드럽고 단정한 한국어로 쓰되, 과장하거나 운명을 단정하는 표현은 피합니다.',
      '의학, 법률, 투자, 생명·안전 문제는 단정하지 말고 생활 조언 수준으로 제한합니다.',
      '근거 없는 일반론을 길게 늘어놓지 말고, evidenceJson.cards에 있는 핵심 근거를 최소 두 개 이상 요약에 반영합니다.',
      '응답은 반드시 JSON 객체 하나만 반환합니다. Markdown, 설명 문장, 코드블록을 붙이지 않습니다.',
      'JSON 스키마: {"headline":"짧은 제목","summary":"2~3문장의 자연어 요약","insights":["근거 기반 통찰 1","근거 기반 통찰 2","근거 기반 통찰 3"]}',
      'headline은 38자 안팎으로, 사용자가 지금 가장 먼저 알아야 할 흐름을 바로 드러냅니다.',
      'summary는 2~3문장으로 쓰고, 첫 문장에는 현재 흐름의 핵심 해석을 넣습니다.',
      'insights는 3~4개로 작성하며, 각 항목은 서로 겹치지 않게 강점/주의점/행동 제안/관계 또는 일의 포인트를 나눠 담습니다.',
      ...buildReportCounselorInstructions(counselorId),
    ].join('\n'),
    input: JSON.stringify(promptPayload, null, 2),
  };
}
