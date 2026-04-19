'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

interface SafetyCheckResponse {
  shouldRedirect?: boolean;
  redirectPath?: string | null;
  userMessage?: string;
  matchedKeyword?: string | null;
  error?: string;
}

const DEFAULT_MESSAGE =
  '요즘 마음이 복잡해서 제 사주 흐름으로 어디를 먼저 정리하면 좋을지 보고 싶어요.';

export function DialogueSafetyChecker() {
  const router = useRouter();
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [status, setStatus] = useState<'idle' | 'checking' | 'safe' | 'error'>(
    'idle'
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!message.trim()) {
      setStatus('error');
      setFeedback('확인할 문장을 한 줄 이상 적어 주세요.');
      return;
    }

    setStatus('checking');
    setFeedback(null);

    try {
      const response = await fetch('/api/dialogue/safety', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const payload = (await response.json()) as SafetyCheckResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? '안전 감지를 완료하지 못했습니다.');
      }

      if (payload.shouldRedirect && payload.redirectPath) {
        router.push(payload.redirectPath);
        return;
      }

      setStatus('safe');
      setFeedback(
        payload.userMessage ??
          '안전 감지는 통과했습니다. AI 대화는 다음 단계에서 연결됩니다.'
      );
    } catch (error) {
      setStatus('error');
      setFeedback(
        error instanceof Error
          ? error.message
          : '잠시 후 다시 확인해 주세요.'
      );
    }
  }

  return (
    <article className="app-panel p-6">
      <div className="app-caption">안전 감지 먼저</div>
      <h2 className="mt-3 font-[var(--font-heading)] text-3xl text-[var(--app-ivory)]">
        질문을 남기기 전에 위험 신호를 먼저 살핍니다
      </h2>
      <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">
        이 입력창은 실시간 채팅의 첫 단추입니다. 위기·의료·법률·투자처럼
        해석으로 대신하면 안 되는 문장은 답변을 만들기 전에 안전 안내로
        전환합니다.
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
              setFeedback(null);
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
            {status === 'checking' ? '안전 확인 중' : '안전 감지 테스트'}
          </button>
          <span className="text-xs leading-6 text-[var(--app-copy-soft)]">
            위기 문장은 일반 답변을 막고 SAFE_REDIRECT로 이동합니다.
          </span>
        </div>
      </form>

      {feedback ? (
        <div
          className={`mt-5 rounded-[1.1rem] border px-4 py-3 text-sm leading-7 ${
            status === 'error'
              ? 'border-[var(--app-coral)]/30 bg-[var(--app-coral)]/10 text-[var(--app-ivory)]'
              : 'border-[var(--app-line-strong)] bg-[var(--app-surface-muted)] text-[var(--app-copy)]'
          }`}
        >
          {feedback}
        </div>
      ) : null}
    </article>
  );
}
