import { NextRequest, NextResponse } from 'next/server';
import { detectSafeRedirect } from '@/domain/safety/safe-redirect';
import {
  FOCUS_TOPIC_META,
  buildSajuReport,
  normalizeFocusTopic,
} from '@/domain/saju/report/build-report';
import type { SajuReport } from '@/domain/saju/report/types';
import { resolveReading, type ReadingRecord } from '@/lib/saju/readings';
import { generateAiText } from '@/server/ai/openai-text';

export const runtime = 'nodejs';
export const maxDuration = 20;

type AiMode = 'dialogue' | 'saju-report';

interface DialogueAiRequest {
  mode: 'dialogue';
  message: string;
}

interface SajuReportAiRequest {
  mode: 'saju-report';
  readingId: string;
  topic?: string;
  question?: string;
}

type ParsedAiRequest = DialogueAiRequest | SajuReportAiRequest;

function readString(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return typeof value === 'string' ? value.trim() : '';
}

function parseAiRequest(payload: unknown): ParsedAiRequest | null {
  if (!payload || typeof payload !== 'object') return null;

  const data = payload as Record<string, unknown>;
  const mode = readString(data, 'mode') as AiMode;

  if (mode === 'dialogue') {
    const message = readString(data, 'message');
    return message ? { mode, message } : null;
  }

  if (mode === 'saju-report') {
    const readingId = readString(data, 'readingId');
    if (!readingId) return null;

    return {
      mode,
      readingId,
      topic: readString(data, 'topic') || undefined,
      question: readString(data, 'question') || undefined,
    };
  }

  return null;
}

function createSafetyResponse(message: string) {
  const safety = detectSafeRedirect(message);

  if (!safety.shouldBlockResponse) return null;

  return NextResponse.json({
    ok: false,
    mode: 'safe_redirect',
    source: 'safe_redirect',
    text: safety.userMessage,
    safety,
    redirectPath: safety.redirectPath,
  });
}

function buildDialogueFallback(message: string) {
  return [
    'AI 대화 연결이 아직 준비되지 않아 기본 안내로 답변드립니다.',
    `남겨주신 질문: “${message}”`,
    '지금은 사주 결과 페이지의 핵심 요약, 강약, 격국, 용신, 합충·공망·신살 근거를 먼저 확인해 주세요. OpenAI 키와 결제가 연결되면 이 자리에 개인화된 대화 답변이 표시됩니다.',
  ].join('\n\n');
}

function createDialoguePrompt(message: string) {
  return {
    instructions: [
      '당신은 한국어 사주 서비스 달빛선생의 AI 해석 보조자입니다.',
      '사용자의 질문에 차분하고 현실적인 한국어로 답합니다.',
      '자살, 자해, 응급 의료, 법률, 투자 판단은 절대 해석으로 대신하지 않습니다.',
      '출생 정보나 명식 데이터가 없는 경우 확정적으로 말하지 말고, 필요한 정보와 다음 행동을 안내합니다.',
      '고전 원문이나 출처는 제공된 근거가 없으면 인용하지 않습니다.',
    ].join('\n'),
    input: `사용자 질문:\n${message}`,
  };
}

function formatEvidenceCards(report: SajuReport) {
  return report.evidenceCards.map((card) => ({
    label: card.label,
    title: card.title,
    body: card.body,
    details: card.details,
  }));
}

function formatClassicalCitations(report: SajuReport) {
  return report.classicalCitations.map((citation) => ({
    sourceTitle: citation.sourceTitle,
    sourceLabel: citation.sourceLabel,
    theme: citation.theme,
    title: citation.title,
    sourceNote: citation.sourceNote,
    interpretation: citation.interpretation,
    matchedEvidenceKeys: citation.matchedEvidenceKeys,
    statusLabel: citation.statusLabel,
  }));
}

function buildReportFallback(report: SajuReport) {
  const highlights = report.summaryHighlights.length
    ? report.summaryHighlights.map((item) => `- ${item}`).join('\n')
    : report.summary;
  const evidence = report.evidenceCards
    .slice(0, 6)
    .map((card) => `- ${card.label}: ${card.title}`)
    .join('\n');

  return [
    `${report.headline}`,
    highlights,
    `오늘의 행동 제안: ${report.primaryAction.title} - ${report.primaryAction.description}`,
    `주의 포인트: ${report.cautionAction.title} - ${report.cautionAction.description}`,
    evidence ? `근거 요약:\n${evidence}` : '',
    'AI 해석이 연결되면 위 근거를 바탕으로 더 자연스러운 개인화 문장으로 확장됩니다.',
  ]
    .filter(Boolean)
    .join('\n\n');
}

function createReportGrounding(record: ReadingRecord, report: SajuReport) {
  const data = record.sajuData;

  return {
    birth: {
      year: record.input.year,
      month: record.input.month,
      day: record.input.day,
      hour: record.input.hour ?? null,
      gender: record.input.gender ?? null,
    },
    focus: {
      topic: report.focusTopic,
      label: report.focusLabel,
      badge: report.focusBadge,
      subtitle: FOCUS_TOPIC_META[report.focusTopic].subtitle,
    },
    pillars: {
      year: data.pillars.year.ganzi,
      month: data.pillars.month.ganzi,
      day: data.pillars.day.ganzi,
      hour: data.pillars.hour?.ganzi ?? null,
    },
    dayMaster: data.dayMaster,
    fiveElements: data.fiveElements,
    tenGods: data.tenGods,
    strength: data.strength,
    pattern: data.pattern,
    yongsin: data.yongsin,
    currentLuck: data.currentLuck,
    orrery: {
      relations: data.extensions?.orrery?.relations ?? [],
      gongmang: data.extensions?.orrery?.gongmang ?? null,
      specialSals: data.extensions?.orrery?.specialSals ?? null,
    },
    report: {
      headline: report.headline,
      summaryHighlights: report.summaryHighlights,
      evidenceCards: formatEvidenceCards(report),
      classicalCitations: formatClassicalCitations(report),
      scores: report.scores,
      primaryAction: report.primaryAction,
      cautionAction: report.cautionAction,
      insights: report.insights,
      timeline: report.timeline,
    },
  };
}

function createReportPrompt(
  record: ReadingRecord,
  report: SajuReport,
  question?: string
) {
  return {
    instructions: [
      '당신은 한국어 사주 서비스 달빛선생의 AI 해석 보조자입니다.',
      '반드시 제공된 JSON 근거 안에서만 해석하고, 없는 명리 정보나 고전 인용을 지어내지 않습니다.',
      'classicalCitations의 sourceNote가 원문 직접 인용 전 단계라고 되어 있으면, 이를 고전 원문 인용처럼 바꿔 쓰지 않습니다.',
      '문장은 차분하고 고급스럽게 쓰되, 사용자가 바로 읽기 쉽도록 4~6개의 짧은 단락으로 나눕니다.',
      '강약, 격국, 용신, 합충/공망/신살 중 제공된 근거가 있으면 자연스럽게 반영합니다.',
      '의료·법률·투자 결론은 피하고, 필요한 경우 전문가 확인을 권합니다.',
    ].join('\n'),
    input: [
      question ? `사용자 추가 질문:\n${question}` : null,
      `명식/리포트 근거 JSON:\n${JSON.stringify(createReportGrounding(record, report), null, 2)}`,
    ]
      .filter(Boolean)
      .join('\n\n'),
  };
}

async function handleDialogue(request: DialogueAiRequest) {
  const safetyResponse = createSafetyResponse(request.message);
  if (safetyResponse) return safetyResponse;

  const prompt = createDialoguePrompt(request.message);
  const fallbackText = buildDialogueFallback(request.message);
  const result = await generateAiText({
    ...prompt,
    fallbackText,
    maxOutputTokens: 600,
  });

  return NextResponse.json({
    ok: true,
    mode: request.mode,
    ...result,
  });
}

async function handleSajuReport(request: SajuReportAiRequest) {
  const safetyResponse = request.question
    ? createSafetyResponse(request.question)
    : null;
  if (safetyResponse) return safetyResponse;

  const reading = await resolveReading(request.readingId);

  if (!reading) {
    return NextResponse.json(
      { ok: false, error: '사주 결과를 찾지 못했습니다.' },
      { status: 404 }
    );
  }

  const topic = normalizeFocusTopic(request.topic);
  const report = buildSajuReport(reading.input, reading.sajuData, topic);
  const prompt = createReportPrompt(reading, report, request.question);
  const result = await generateAiText({
    ...prompt,
    fallbackText: buildReportFallback(report),
    maxOutputTokens: 900,
  });

  return NextResponse.json({
    ok: true,
    mode: request.mode,
    readingId: request.readingId,
    topic,
    report: {
      headline: report.headline,
      summaryHighlights: report.summaryHighlights,
      evidenceCards: report.evidenceCards,
      classicalCitations: report.classicalCitations,
      primaryAction: report.primaryAction,
      cautionAction: report.cautionAction,
    },
    ...result,
  });
}

export async function POST(req: NextRequest) {
  const parsed = parseAiRequest(await req.json().catch(() => null));

  if (!parsed) {
    return NextResponse.json(
      {
        ok: false,
        error:
          '요청 형식이 올바르지 않습니다. mode는 dialogue 또는 saju-report여야 합니다.',
      },
      { status: 400 }
    );
  }

  if (parsed.mode === 'dialogue') {
    return handleDialogue(parsed);
  }

  return handleSajuReport(parsed);
}
