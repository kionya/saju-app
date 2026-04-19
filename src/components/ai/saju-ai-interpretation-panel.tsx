'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { FocusTopic } from '@/domain/saju/report';
import { AiSourceBadge } from './ai-source-badge';

type AiSource = 'openai' | 'fallback' | 'safe_redirect';
type FallbackReason = 'ai_not_configured' | 'empty_ai_response' | 'openai_error';

interface AiReportResponse {
  ok?: boolean;
  source?: AiSource;
  text?: string;
  model?: string | null;
  fallbackReason?: FallbackReason | null;
  errorMessage?: string | null;
  redirectPath?: string | null;
  error?: string;
}

interface AiReportState {
  source: AiSource;
  text: string;
  model: string | null;
  fallbackReason: FallbackReason | null;
  errorMessage: string | null;
  fromApi: boolean;
}

interface SajuAiInterpretationPanelProps {
  readingId: string;
  topic: FocusTopic;
  focusLabel: string;
  fallbackText: string;
}

function getFallbackReasonLabel(reason: FallbackReason | null, fromApi: boolean) {
  if (!fromApi) return '아직 AI를 호출하지 않아 기본 리포트 문장을 먼저 표시 중입니다.';

  switch (reason) {
    case 'ai_not_configured':
      return 'OpenAI 키 또는 결제가 연결되지 않아 기본 해석으로 표시 중입니다.';
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
  fallbackText,
}: SajuAiInterpretationPanelProps) {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [status, setStatus] = useState<'ready' | 'loading' | 'answered' | 'error'>('ready');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AiReportState>({
    source: 'fallback',
    text: fallbackText,
    model: null,
    fallbackReason: null,
    errorMessage: null,
    fromApi: false,
  });

  const badgeState =
    status === 'loading'
      ? 'loading'
      : status === 'error'
        ? 'error'
        : result.source === 'openai'
          ? 'openai'
          : result.source === 'safe_redirect'
            ? 'safe_redirect'
            : 'fallback';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setError(null);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'saju-report',
          readingId,
          topic,
          question: question.trim() || undefined,
        }),
      });
      const payload = (await response.json()) as AiReportResponse;

      if (payload.source === 'safe_redirect' && payload.redirectPath) {
        router.push(payload.redirectPath);
        return;
      }

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? 'AI 해석을 불러오지 못했습니다.');
      }

      setResult({
        source: payload.source ?? 'fallback',
        text: payload.text ?? fallbackText,
        model: payload.model ?? null,
        fallbackReason: payload.fallbackReason ?? null,
        errorMessage: payload.errorMessage ?? null,
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
  }

  return (
    <section className="rounded-[1.75rem] border border-[var(--app-gold)]/28 bg-[linear-gradient(135deg,rgba(210,176,114,0.13),rgba(10,18,36,0.96)_45%,rgba(7,19,39,0.94))] p-6 sm:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="app-caption">AI 확장 해석</div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--app-ivory)]">
            {focusLabel} 흐름을 AI 문장으로 다시 정리합니다
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--app-copy)]">
            기본 리포트 근거를 먼저 보여주고, OpenAI가 연결되어 있으면 같은
            명식 근거를 바탕으로 더 자연스러운 개인화 문장으로 확장합니다.
          </p>
        </div>
        <AiSourceBadge state={badgeState} />
      </div>

      <div className="mt-5 rounded-[1.25rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-4">
        <p className="whitespace-pre-line text-sm leading-8 text-[var(--app-copy)]">
          {status === 'loading' ? 'AI 해석을 불러오는 중입니다. 잠시만 기다려 주세요.' : result.text}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs leading-6 text-[var(--app-copy-soft)]">
        {result.source === 'openai' ? (
          <span>모델: {result.model ?? 'OpenAI'}</span>
        ) : (
          <span>{getFallbackReasonLabel(result.fallbackReason, result.fromApi)}</span>
        )}
        {result.errorMessage ? <span>오류: {result.errorMessage}</span> : null}
      </div>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
        <label className="block">
          <span className="text-sm font-medium text-[var(--app-gold-text)]">
            더 묻고 싶은 내용
          </span>
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            rows={3}
            className="mt-2 min-h-24 w-full resize-y rounded-[1.1rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-3 text-sm leading-7 text-[var(--app-ivory)] outline-none transition-colors placeholder:text-[var(--app-copy-soft)] focus:border-[var(--app-gold)]/60"
            placeholder="예: 지금 관계 쪽에서 특히 조심할 점만 더 풀어줘"
          />
        </label>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--app-gold)] px-6 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-text)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'loading' ? '불러오는 중' : 'AI 해석 불러오기'}
        </button>
      </form>

      {error ? (
        <div className="mt-4 rounded-[1.1rem] border border-[var(--app-coral)]/30 bg-[var(--app-coral)]/10 px-4 py-3 text-sm leading-7 text-[var(--app-ivory)]">
          {error}
        </div>
      ) : null}
    </section>
  );
}
