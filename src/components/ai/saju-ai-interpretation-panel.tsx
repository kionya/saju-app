'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CounselorSelector } from '@/components/counselor/counselor-selector';
import type { FocusTopic } from '@/domain/saju/report';
import { usePreferredCounselor } from '@/features/counselor/use-preferred-counselor';
import type { MoonlightCounselorId } from '@/lib/counselors';
import type { SajuAiInterpretation } from '@/server/ai/saju-interpretation';
import { cn } from '@/lib/utils';
import { AiSourceBadge } from './ai-source-badge';

type AiSource = 'openai' | 'fallback';
type FallbackReason = 'ai_not_configured' | 'empty_ai_response' | 'openai_error';

interface InterpretResponse {
  ok?: boolean;
  source?: AiSource;
  model?: string | null;
  cached?: boolean;
  cacheable?: boolean;
  fallbackReason?: FallbackReason | null;
  errorMessage?: string | null;
  counselorId?: MoonlightCounselorId | null;
  interpretation?: SajuAiInterpretation;
  error?: string;
}

interface InterpretationState {
  source: AiSource;
  model: string | null;
  cached: boolean;
  fallbackReason: FallbackReason | null;
  errorMessage: string | null;
  counselorId: MoonlightCounselorId;
  interpretation: SajuAiInterpretation;
  fromApi: boolean;
}

interface SajuAiInterpretationPanelProps {
  readingId: string;
  topic: FocusTopic;
  focusLabel: string;
  fallbackInterpretation: SajuAiInterpretation;
  cacheEnabled: boolean;
}

const INSIGHT_FULL_WIDTH_THRESHOLD = 96;

function getCompactTextLength(value: string) {
  return value.replace(/\s+/g, '').length;
}

function shouldInsightUseFullRow(insight: string) {
  return getCompactTextLength(insight) >= INSIGHT_FULL_WIDTH_THRESHOLD;
}

function getFallbackReasonLabel(reason: FallbackReason | null, fromApi: boolean) {
  if (!fromApi) return '기본 리포트 문장을 먼저 표시 중입니다.';

  switch (reason) {
    case 'ai_not_configured':
      return 'OpenAI 키가 연결되지 않아 기본 해석으로 표시 중입니다.';
    case 'empty_ai_response':
      return 'AI 응답이 비어 있어 기본 해석으로 표시 중입니다.';
    case 'openai_error':
      return 'AI 호출이 실패해 기본 해석으로 안전하게 전환했습니다.';
    default:
      return '기본 해석으로 표시 중입니다.';
  }
}

export function SajuAiInterpretationPanel({
  readingId,
  topic,
  focusLabel,
  fallbackInterpretation,
  cacheEnabled,
}: SajuAiInterpretationPanelProps) {
  const autoLoadedRef = useRef(false);
  const { counselorId, hydrated: counselorReady, selectCounselor } = usePreferredCounselor();
  const [status, setStatus] = useState<'ready' | 'loading' | 'answered' | 'error'>(
    cacheEnabled ? 'loading' : 'ready'
  );
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InterpretationState>({
    source: 'fallback',
    model: null,
    cached: false,
    fallbackReason: null,
    errorMessage: null,
    counselorId,
    interpretation: fallbackInterpretation,
    fromApi: false,
  });

  const loadInterpretation = useCallback(async (requestedCounselorId?: MoonlightCounselorId) => {
    const activeCounselorId = requestedCounselorId ?? counselorId;
    setStatus('loading');
    setError(null);

    try {
      const response = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readingId, topic, counselorId: activeCounselorId }),
      });
      const payload = (await response.json()) as InterpretResponse;

      if (!response.ok || !payload.ok || !payload.interpretation) {
        throw new Error(payload.error ?? 'AI 해석을 불러오지 못했습니다.');
      }

      setResult({
        source: payload.source ?? 'fallback',
        model: payload.model ?? null,
        cached: payload.cached === true,
        fallbackReason: payload.fallbackReason ?? null,
        errorMessage: payload.errorMessage ?? null,
        counselorId: payload.counselorId ?? activeCounselorId,
        interpretation: payload.interpretation,
        fromApi: true,
      });
      setStatus('answered');
    } catch (requestError) {
      setStatus('error');
      setError(
        requestError instanceof Error
          ? requestError.message
          : '잠시 후 다시 시도해 주세요.'
      );
    }
  }, [counselorId, readingId, topic]);

  useEffect(() => {
    if (!cacheEnabled || autoLoadedRef.current || !counselorReady) return;

    autoLoadedRef.current = true;
    void loadInterpretation();
  }, [cacheEnabled, counselorReady, loadInterpretation]);

  const badgeState =
    status === 'loading'
      ? 'loading'
      : status === 'error'
        ? 'error'
        : result.source === 'openai'
          ? 'openai'
          : 'fallback';
  const interpretation =
    status === 'loading' && !result.fromApi ? fallbackInterpretation : result.interpretation;

  return (
    <section className="rounded-[1.75rem] border border-[var(--app-gold)]/28 bg-[linear-gradient(135deg,rgba(210,176,114,0.13),rgba(10,18,36,0.96)_45%,rgba(7,19,39,0.94))] p-6 sm:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="app-caption">AI 신뢰 해석 · {focusLabel}</div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--app-ivory)]">
            {interpretation.headline}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--app-copy)]">
            {status === 'loading'
              ? '계산 근거를 바탕으로 해석 문장을 정리하는 중입니다.'
              : interpretation.summary}
          </p>
          <div className="mt-4 max-w-4xl">
            <CounselorSelector
              value={counselorId}
              onChange={(nextCounselor) => {
                void selectCounselor(nextCounselor);
                void loadInterpretation(nextCounselor);
              }}
              variant="compact"
              title="사주를 읽는 선생"
              description="같은 명식을 어떤 말결로 듣고 싶은지 골라보세요. 선택한 선생 기준으로 AI 해석이 다시 정리됩니다."
            />
          </div>
        </div>
        <AiSourceBadge state={badgeState} />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {interpretation.insights.map((insight, index) => (
          <div
            key={`${index}-${insight}`}
            className={cn(
              'rounded-[1.25rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-4',
              shouldInsightUseFullRow(insight) ? 'md:col-span-2' : undefined
            )}
          >
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-copy-soft)]">
              Insight {index + 1}
            </div>
            <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">{insight}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs leading-6 text-[var(--app-copy-soft)]">
        <span>{result.counselorId === 'male' ? '달빛 남선생 기준' : '달빛 여선생 기준'}</span>
        {result.source === 'openai' ? (
          <span>
            모델: {result.model ?? 'OpenAI'}{result.cached ? ' · 캐시됨' : ' · 새로 생성됨'}
          </span>
        ) : (
          <span>{getFallbackReasonLabel(result.fallbackReason, result.fromApi)}</span>
        )}
        {result.errorMessage ? <span>오류: {result.errorMessage}</span> : null}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void loadInterpretation()}
          disabled={status === 'loading'}
          className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-gold)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-text)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'loading' ? '불러오는 중' : cacheEnabled ? '캐시 확인' : 'AI 해석 생성'}
        </button>
        {!cacheEnabled ? (
          <span className="text-xs leading-6 text-[var(--app-copy-soft)]">
            저장된 reading UUID가 아니면 캐시 없이 한 번만 확인합니다.
          </span>
        ) : null}
      </div>

      {error ? (
        <div className="mt-4 rounded-[1.1rem] border border-[var(--app-coral)]/30 bg-[var(--app-coral)]/10 px-4 py-3 text-sm leading-7 text-[var(--app-ivory)]">
          {error}
        </div>
      ) : null}
    </section>
  );
}
