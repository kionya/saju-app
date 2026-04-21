'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { FocusTopic } from '@/domain/saju/report';
import type { SajuAiInterpretation } from '@/server/ai/saju-interpretation';
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
  interpretation?: SajuAiInterpretation;
  error?: string;
}

interface InterpretationState {
  source: AiSource;
  model: string | null;
  cached: boolean;
  fallbackReason: FallbackReason | null;
  errorMessage: string | null;
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
    interpretation: fallbackInterpretation,
    fromApi: false,
  });

  const loadInterpretation = useCallback(async () => {
    setStatus('loading');
    setError(null);

    try {
      const response = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readingId, topic }),
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
  }, [readingId, topic]);

  useEffect(() => {
    if (!cacheEnabled || autoLoadedRef.current) return;

    autoLoadedRef.current = true;
    void loadInterpretation();
  }, [cacheEnabled, loadInterpretation]);

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
        </div>
        <AiSourceBadge state={badgeState} />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {interpretation.insights.map((insight, index) => (
          <div
            key={`${index}-${insight}`}
            className="rounded-[1.25rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-4"
          >
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-copy-soft)]">
              Insight {index + 1}
            </div>
            <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">{insight}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs leading-6 text-[var(--app-copy-soft)]">
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
