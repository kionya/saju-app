'use client';

import { FormEvent, startTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AiSourceBadge } from '@/components/ai/ai-source-badge';

type AiSource = 'openai' | 'fallback' | 'safe_redirect';
type FallbackReason = 'ai_not_configured' | 'empty_ai_response' | 'openai_error';
type ChatStatus = 'idle' | 'loading' | 'error';

interface DialoguePresetOption {
  category: string;
  question: string;
}

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

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  source?: AiSource;
  model?: string | null;
  fallbackReason?: FallbackReason | null;
  errorMessage?: string | null;
}

interface DialogueChatPanelProps {
  presets: DialoguePresetOption[];
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 'assistant-intro',
  role: 'assistant',
  source: 'fallback',
  fallbackReason: null,
  model: null,
  errorMessage: null,
  text:
    '편하게 한 줄로 남겨주세요. 먼저 안전 신호를 살피고, OpenAI가 연결되어 있으면 AI 답변을, 연결 전이면 기본 해석 fallback을 보여드립니다.',
};

function createMessageId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getBadgeState(status: ChatStatus, latestAssistant?: ChatMessage) {
  if (status === 'loading') return 'loading';
  if (status === 'error') return 'error';
  if (latestAssistant?.source === 'openai') return 'openai';
  if (latestAssistant?.source === 'safe_redirect') return 'safe_redirect';
  if (latestAssistant?.source === 'fallback') return 'fallback';
  return 'idle';
}

function getFallbackLabel(reason: FallbackReason | null | undefined) {
  switch (reason) {
    case 'ai_not_configured':
      return 'OpenAI 키 또는 결제가 연결되지 않아 기본 답변으로 표시 중입니다.';
    case 'empty_ai_response':
      return 'AI 응답이 비어 있어 기본 답변으로 표시 중입니다.';
    case 'openai_error':
      return 'AI 호출 실패로 기본 답변을 표시 중입니다.';
    default:
      return '기본 답변으로 표시 중입니다.';
  }
}

export function DialogueChatPanel({ presets }: DialogueChatPanelProps) {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const latestAssistant = messages.findLast((message) => message.role === 'assistant');
  const badgeState = getBadgeState(status, latestAssistant);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput) {
      setStatus('error');
      setErrorMessage('확인할 질문을 한 줄 이상 적어 주세요.');
      return;
    }

    const userMessage: ChatMessage = {
      id: createMessageId('user'),
      role: 'user',
      text: trimmedInput,
    };

    setStatus('loading');
    setErrorMessage(null);
    startTransition(() => {
      setMessages((current) => [...current, userMessage]);
      setInput('');
    });

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'dialogue', message: trimmedInput }),
      });
      const payload = (await response.json()) as DialogueAiResponse;

      if (payload.source === 'safe_redirect' && payload.redirectPath) {
        router.push(payload.redirectPath);
        return;
      }

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? 'AI 답변을 불러오지 못했습니다.');
      }

      const assistantMessage: ChatMessage = {
        id: createMessageId('assistant'),
        role: 'assistant',
        source: payload.source ?? 'fallback',
        text: payload.text ?? '기본 안내를 불러왔습니다.',
        model: payload.model ?? null,
        fallbackReason: payload.fallbackReason ?? null,
        errorMessage: payload.errorMessage ?? null,
      };

      startTransition(() => {
        setMessages((current) => [...current, assistantMessage]);
      });
      setStatus('idle');
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : '잠시 후 다시 확인해 주세요.'
      );
    }
  }

  return (
    <article className="app-panel overflow-hidden p-0">
      <div className="border-b border-[var(--app-line)] bg-[linear-gradient(135deg,rgba(210,176,114,0.12),rgba(10,18,36,0.96))] p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="app-caption">AI 대화</div>
            <h2 className="mt-3 font-[var(--font-heading)] text-3xl text-[var(--app-ivory)]">
              질문을 남기면 안전 감지 후 답변을 이어갑니다
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--app-copy)]">
              현재 대화는 비스트리밍 응답입니다. 위기·의료·법률·투자 판단은
              답변 생성 전에 SAFE_REDIRECT로 전환하고, OpenAI 연결 전에는 기본
              해석 fallback으로 안전하게 내려갑니다.
            </p>
          </div>
          <AiSourceBadge state={badgeState} />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.question}
              type="button"
              onClick={() => {
                setInput(preset.question);
                setErrorMessage(null);
                if (status === 'error') setStatus('idle');
              }}
              className="rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-3 py-1.5 text-xs text-[var(--app-copy)] transition-colors hover:border-[var(--app-line-strong)] hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]"
            >
              {preset.category} · {preset.question}
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-[32rem] space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
        {messages.map((message) => {
          const isUser = message.role === 'user';

          return (
            <div
              key={message.id}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[min(100%,42rem)] rounded-[1.25rem] border px-4 py-4 ${
                  isUser
                    ? 'border-[var(--app-gold)]/28 bg-[var(--app-gold)]/12 text-[var(--app-ivory)]'
                    : 'border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy)]'
                }`}
              >
                <p className="whitespace-pre-line text-sm leading-8">{message.text}</p>
                {!isUser ? (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs leading-6 text-[var(--app-copy-soft)]">
                    {message.source === 'openai' ? (
                      <span>AI 생성됨 · 모델 {message.model ?? 'OpenAI'}</span>
                    ) : (
                      <span>{getFallbackLabel(message.fallbackReason)}</span>
                    )}
                    {message.errorMessage ? <span>오류: {message.errorMessage}</span> : null}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}

        {status === 'loading' ? (
          <div className="flex justify-start">
            <div className="rounded-[1.25rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-3 text-sm leading-7 text-[var(--app-copy-muted)]">
              답변을 확인하고 있습니다. 안전 감지를 먼저 통과한 뒤 응답합니다.
            </div>
          </div>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-[var(--app-line)] bg-[var(--app-surface-muted)] p-5 sm:p-6">
        <label className="block text-sm font-medium text-[var(--app-gold-text)]">
          지금 묻고 싶은 말
        </label>
        <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
          <textarea
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              if (status === 'error') {
                setStatus('idle');
                setErrorMessage(null);
              }
            }}
            rows={3}
            className="min-h-24 w-full resize-y rounded-[1.15rem] border border-[var(--app-line)] bg-[var(--app-surface-strong)] px-4 py-3 text-sm leading-7 text-[var(--app-ivory)] outline-none transition-colors placeholder:text-[var(--app-copy-soft)] focus:border-[var(--app-gold)]/60"
            placeholder="예: 이번 달 관계운을 차분하게 보고 싶어요."
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--app-gold)] px-6 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-text)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'loading' ? '답변 확인 중' : '보내기'}
          </button>
        </div>
        <p className="mt-3 text-xs leading-6 text-[var(--app-copy-soft)]">
          위기 문장은 일반 답변을 막고 안전 안내로 이동합니다. 대화 저장은 아직
          하지 않으며, 새로고침하면 현재 화면의 메시지는 사라집니다.
        </p>

        {errorMessage ? (
          <div className="mt-4 rounded-[1.1rem] border border-[var(--app-coral)]/30 bg-[var(--app-coral)]/10 px-4 py-3 text-sm leading-7 text-[var(--app-ivory)]">
            {errorMessage}
          </div>
        ) : null}
      </form>
    </article>
  );
}
