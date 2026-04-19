'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AiSourceBadge } from '@/components/ai/ai-source-badge';

type AiSource = 'openai' | 'fallback' | 'safe_redirect';
type FallbackReason = 'ai_not_configured' | 'empty_ai_response' | 'openai_error';

interface DialogueAiResponse {
  ok?: boolean;
  source?: AiSource;
  text?: string;
  model?: string | null;
  fallbackReason?: FallbackReason | null;
  errorMessage?: string | null;
  redirectPath?: string | null;
  error?: string;
}

interface DialogueAiResult {
  source: AiSource;
  text: string;
  model: string | null;
  fallbackReason: FallbackReason | null;
  errorMessage: string | null;
}

const DEFAULT_MESSAGE =
  '요즘 마음이 복잡해서 제 사주 흐름으로 어디를 먼저 정리하면 좋을지 보고 싶어요.';

export function DialogueSafetyChecker() {
  const router = useRouter();
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [status, setStatus] = useState<'idle' | 'checking' | 'answered' | 'error'>(
    'idle'
  );
  const [result, setResult] = useState<DialogueAiResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const badgeState =
    status === 'checking'
      ? 'loading'
      : status === 'error'
        ? 'error'
        : result?.source === 'openai'
          ? 'openai'
          : result?.source === 'safe_redirect'
            ? 'safe_redirect'
            : result?.source === 'fallback'
              ? 'fallback'
              : 'idle';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!message.trim()) {
      setStatus('error');
      setErrorMessage('확인할 문장을 한 줄 이상 적어 주세요.');
      return;
    }

    setStatus('checking');
    setResult(null);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'dialogue', message }),
      });
      const payload = (await response.json()) as DialogueAiResponse;

      if (payload.source === 'safe_redirect' && payload.redirectPath) {
        router.push(payload.redirectPath);
        return;
      }

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? 'AI 답변을 불러오지 못했습니다.');
      }

      setResult({
        source: payload.source ?? 'fallback',
        text: payload.text ?? '기본 안내를 불러왔습니다.',
        model: payload.model ?? null,
        fallbackReason: payload.fallbackReason ?? null,
        errorMessage: payload.errorMessage ?? null,
      });
      setStatus('answered');
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '잠시 후 다시 확인해 주세요.'
      );
    }
  }

  return (
    <article className="app-panel p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="app-caption">AI 대화 연결</div>
          <h2 className="mt-3 font-[var(--font-heading)] text-3xl text-[var(--app-ivory)]">
            질문을 남기면 안전 감지 후 답변을 시도합니다
          </h2>
        </div>
        <AiSourceBadge state={badgeState} />
      </div>
      <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">
        위기·의료·법률·투자처럼 해석으로 대신하면 안 되는 문장은 답변을
        만들기 전에 안전 안내로 전환합니다. OpenAI가 연결되어 있으면 AI 답변,
        없거나 실패하면 기본 해석 fallback을 보여드립니다.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <label className="block text-sm font-medium text-[var(--app-gold-text)]">
          지금 묻고 싶은 말
        </label>
        <textarea
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
            if (status !== 'checking') {
              setStatus('idle');
              setResult(null);
              setErrorMessage(null);
            }
          }}
          rows={5}
          className="min-h-32 w-full resize-y rounded-[1.2rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-3 text-sm leading-7 text-[var(--app-ivory)] outline-none transition-colors placeholder:text-[var(--app-copy-soft)] focus:border-[var(--app-gold)]/60"
          placeholder="예: 요즘 마음이 복잡해서 제 사주 흐름으로 어디를 먼저 정리하면 좋을지 보고 싶어요."
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={status === 'checking'}
            className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--app-gold)] px-6 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-text)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'checking' ? '답변 확인 중' : 'AI 답변 확인'}
          </button>
          <span className="text-xs leading-6 text-[var(--app-copy-soft)]">
            위기 문장은 일반 답변을 막고 SAFE_REDIRECT로 이동합니다.
          </span>
        </div>
      </form>

      {result ? (
        <div className="mt-5 rounded-[1.1rem] border border-[var(--app-line-strong)] bg-[var(--app-surface-muted)] px-4 py-4">
          <p className="whitespace-pre-line text-sm leading-8 text-[var(--app-copy)]">
            {result.text}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs leading-6 text-[var(--app-copy-soft)]">
            {result.source === 'openai' ? (
              <span>모델: {result.model ?? 'OpenAI'}</span>
            ) : (
              <span>
                {result.fallbackReason === 'ai_not_configured'
                  ? 'OpenAI 키 또는 결제가 연결되지 않아 기본 답변으로 표시 중입니다.'
                  : result.fallbackReason === 'openai_error'
                    ? 'AI 호출 실패로 기본 답변을 표시 중입니다.'
                    : '기본 답변으로 표시 중입니다.'}
              </span>
            )}
            {result.errorMessage ? <span>오류: {result.errorMessage}</span> : null}
          </div>
        </div>
      ) : null}

      {errorMessage ? (
        <div
          className="mt-5 rounded-[1.1rem] border border-[var(--app-coral)]/30 bg-[var(--app-coral)]/10 px-4 py-3 text-sm leading-7 text-[var(--app-ivory)]"
        >
          {errorMessage}
        </div>
      ) : null}
    </article>
  );
}
