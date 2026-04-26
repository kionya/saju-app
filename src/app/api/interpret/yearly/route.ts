import { NextRequest, NextResponse } from 'next/server';
import { buildYearlyReport } from '@/domain/saju/report';
import {
  normalizeMoonlightCounselor,
  resolveMoonlightCounselor,
  type MoonlightCounselorId,
} from '@/lib/counselors';
import { getUserProfileById } from '@/lib/profile';
import { resolveReading, isReadingId } from '@/lib/saju/readings';
import { createServiceClient, hasSupabaseServiceEnv } from '@/lib/supabase/server';
import {
  buildFallbackYearlyInterpretation,
  createYearlyInterpretationPrompt,
  getYearlyInterpretationPromptVersion,
  parseYearlyInterpretationText,
  renderYearlyInterpretationReport,
  type SajuYearlyAiInterpretation,
} from '@/server/ai/saju-yearly-interpretation';
import {
  generateAiText,
  getOpenAIInterpretationModel,
  type AiFallbackReason,
  type AiGenerationSource,
} from '@/server/ai/openai-text';

export const runtime = 'nodejs';
export const maxDuration = 35;

interface InterpretYearlyRequest {
  readingId: string;
  targetYear?: number;
  regenerate?: boolean;
  counselorId?: MoonlightCounselorId;
}

interface CachedYearlyInterpretationRow {
  interpretation_json: SajuYearlyAiInterpretation;
  model: string | null;
  source: AiGenerationSource;
  fallback_reason: AiFallbackReason | null;
  error_message: string | null;
  updated_at: string;
}

function readString(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return typeof value === 'string' ? value.trim() : '';
}

function getCurrentKoreaYear() {
  const formatted = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
  }).format(new Date());
  const parsed = Number.parseInt(formatted, 10);

  return Number.isInteger(parsed) ? parsed : new Date().getFullYear();
}

function parseTargetYear(value: unknown) {
  const year =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number.parseInt(value, 10)
        : getCurrentKoreaYear();

  return Number.isInteger(year) && year >= 1900 && year <= 2100
    ? year
    : getCurrentKoreaYear();
}

function parseInterpretYearlyRequest(payload: unknown): InterpretYearlyRequest | null {
  if (!payload || typeof payload !== 'object') return null;

  const data = payload as Record<string, unknown>;
  const readingId = readString(data, 'readingId');
  if (!readingId) return null;

  return {
    readingId,
    targetYear: parseTargetYear(data.targetYear),
    regenerate: data.regenerate === true,
    counselorId: normalizeMoonlightCounselor(data.counselorId) ?? undefined,
  };
}

async function readCachedInterpretation(
  readingId: string,
  targetYear: number,
  counselorId: MoonlightCounselorId
) {
  if (!hasSupabaseServiceEnv || !isReadingId(readingId)) return null;
  const promptVersion = getYearlyInterpretationPromptVersion(counselorId);

  try {
    const supabase = await createServiceClient();
    const { data, error } = await supabase
      .from('ai_yearly_interpretations')
      .select('interpretation_json, model, source, fallback_reason, error_message, updated_at')
      .eq('reading_id', readingId)
      .eq('target_year', targetYear)
      .eq('counselor_id', counselorId)
      .eq('prompt_version', promptVersion)
      .maybeSingle();

    if (error || !data) return null;
    return data as CachedYearlyInterpretationRow;
  } catch {
    return null;
  }
}

async function writeCachedInterpretation(input: {
  readingId: string;
  targetYear: number;
  counselorId: MoonlightCounselorId;
  interpretation: SajuYearlyAiInterpretation;
  model: string | null;
  source: AiGenerationSource;
  fallbackReason: AiFallbackReason | null;
  errorMessage: string | null;
}) {
  if (!hasSupabaseServiceEnv || !isReadingId(input.readingId)) return;
  if (input.source !== 'openai') return;
  const promptVersion = getYearlyInterpretationPromptVersion(input.counselorId);

  try {
    const supabase = await createServiceClient();
    await supabase.from('ai_yearly_interpretations').upsert(
      {
        reading_id: input.readingId,
        target_year: input.targetYear,
        counselor_id: input.counselorId,
        prompt_version: promptVersion,
        interpretation_json: input.interpretation,
        model: input.model,
        source: input.source,
        fallback_reason: input.fallbackReason,
        error_message: input.errorMessage,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'reading_id,target_year,counselor_id,prompt_version' }
    );
  } catch {
    // Cache writes must never block the user-facing response.
  }
}

export async function POST(req: NextRequest) {
  const parsed = parseInterpretYearlyRequest(await req.json().catch(() => null));

  if (!parsed) {
    return NextResponse.json(
      { ok: false, error: 'readingId가 필요합니다.' },
      { status: 400 }
    );
  }

  const reading = await resolveReading(parsed.readingId);

  if (!reading) {
    return NextResponse.json(
      { ok: false, error: '사주 결과를 찾지 못했습니다.' },
      { status: 404 }
    );
  }

  const targetYear = parsed.targetYear ?? getCurrentKoreaYear();
  const cacheable = isReadingId(parsed.readingId);
  const storedCounselor =
    reading.userId && hasSupabaseServiceEnv
      ? (await getUserProfileById(reading.userId)).preferredCounselor
      : null;
  const counselorId = resolveMoonlightCounselor(parsed.counselorId, storedCounselor);

  if (cacheable && !parsed.regenerate) {
    const cached = await readCachedInterpretation(parsed.readingId, targetYear, counselorId);
    if (cached) {
      return NextResponse.json({
        ok: true,
        readingId: parsed.readingId,
        targetYear,
        counselorId,
        cached: true,
        cacheable,
        source: cached.source,
        model: cached.model,
        fallbackReason: cached.fallback_reason,
        errorMessage: cached.error_message,
        interpretation: cached.interpretation_json,
        reportText: renderYearlyInterpretationReport(cached.interpretation_json),
        updatedAt: cached.updated_at,
      });
    }
  }

  const yearlyReport = buildYearlyReport(reading.input, reading.sajuData, targetYear);
  const fallback = buildFallbackYearlyInterpretation(yearlyReport, counselorId);
  const prompt = createYearlyInterpretationPrompt(reading, yearlyReport, counselorId);
  const model = getOpenAIInterpretationModel();
  const aiResult = await generateAiText({
    ...prompt,
    fallbackText: JSON.stringify(fallback),
    model,
    maxOutputTokens: 3600,
  });
  const parsedInterpretation = parseYearlyInterpretationText(aiResult.text, fallback);
  const source: AiGenerationSource =
    aiResult.source === 'openai' && parsedInterpretation.ok ? 'openai' : 'fallback';
  const fallbackReason =
    source === 'fallback' ? aiResult.fallbackReason ?? 'empty_ai_response' : null;
  const errorMessage =
    source === 'fallback'
      ? aiResult.errorMessage ?? parsedInterpretation.errorMessage
      : null;

  await writeCachedInterpretation({
    readingId: parsed.readingId,
    targetYear,
    counselorId,
    interpretation: parsedInterpretation.interpretation,
    model: aiResult.model,
    source,
    fallbackReason,
    errorMessage,
  });

  return NextResponse.json({
    ok: true,
    readingId: parsed.readingId,
    targetYear,
    counselorId,
    cached: false,
    cacheable,
    source,
    model: aiResult.model,
    fallbackReason,
    errorMessage,
    interpretation: parsedInterpretation.interpretation,
    reportText: renderYearlyInterpretationReport(parsedInterpretation.interpretation),
  });
}
