'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DetailContent {
  wealth: string;
  love: string;
  career: string;
  health: string;
  luckyColor: string;
  luckyKeywords: string[];
}

interface Props {
  slug: string;
}

const SECTIONS = [
  { key: 'wealth', label: '재물운' },
  { key: 'love', label: '애정운' },
  { key: 'career', label: '직업운' },
  { key: 'health', label: '건강운' },
] as const;

const DETAIL_SECTION_META: Record<
  (typeof SECTIONS)[number]['key'],
  {
    eyebrow: string;
    focus: string;
    guidance: string;
  }
> = {
  wealth: {
    eyebrow: '돈의 구조',
    focus: '핵심 재물 흐름',
    guidance: '수입·지출·기회 판단을 분리해서 읽어보세요.',
  },
  love: {
    eyebrow: '감정의 온도',
    focus: '핵심 애정 흐름',
    guidance: '상대의 반응보다 표현 방식과 속도에 주목해 보세요.',
  },
  career: {
    eyebrow: '역할과 성과',
    focus: '핵심 직업 흐름',
    guidance: '자리, 책임, 제안 타이밍을 나눠서 확인해 보세요.',
  },
  health: {
    eyebrow: '몸의 균형',
    focus: '핵심 건강 흐름',
    guidance: '강한 기운과 약한 기운이 생활 리듬에 주는 영향을 봅니다.',
  },
};

function splitSentences(text: string) {
  return (
    text
      .replace(/\s+/g, ' ')
      .match(/[^.!?。]+[.!?。]?/g)
      ?.map((sentence) => sentence.trim())
      .filter(Boolean) ?? [text.trim()]
  );
}

function chunkSentences(sentences: string[], size: number) {
  const chunks: string[] = [];

  for (let index = 0; index < sentences.length; index += size) {
    chunks.push(sentences.slice(index, index + size).join(' '));
  }

  return chunks;
}

function ReadableDetailText({
  text,
  focus,
}: {
  text: string;
  focus: string;
}) {
  const [lead = '', ...rest] = splitSentences(text);
  const paragraphs = chunkSentences(rest, 2);

  return (
    <div className="mt-4 space-y-4">
      <div className="rounded-[1.15rem] border border-[var(--app-gold)]/22 bg-[var(--app-gold)]/8 px-4 py-4">
        <div className="app-caption">{focus}</div>
        <p className="mt-2 text-base font-semibold leading-8 text-[var(--app-ivory)] sm:text-lg">
          {lead}
        </p>
      </div>

      {paragraphs.length > 0 ? (
        <div className="space-y-3">
          {paragraphs.map((paragraph) => (
            <p
              key={paragraph}
              className="text-sm leading-8 text-[var(--app-copy)] sm:text-[0.95rem]"
            >
              {paragraph}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function DetailUnlock({ slug }: Props) {
  const [state, setState] = useState<'locked' | 'loading' | 'unlocked' | 'error'>('locked');
  const [content, setContent] = useState<DetailContent | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [remaining, setRemaining] = useState<number | null>(null);
  const [access, setAccess] = useState<'charged' | 'reused' | null>(null);

  useEffect(() => {
    let active = true;

    async function checkExistingAccess() {
      try {
        const params = new URLSearchParams({
          feature: 'detail_report',
          slug,
        });
        const res = await fetch(`/api/credits/use?${params.toString()}`, {
          cache: 'no-store',
        });

        if (!active || !res.ok) return;

        const data = await res.json();
        if (data.unlocked && data.content) {
          setContent(data.content);
          setAccess('reused');
          setState('unlocked');
        }
      } catch {
        // 해금 상태 확인 실패는 결제 흐름을 막지 않습니다.
      }
    }

    checkExistingAccess();

    return () => {
      active = false;
    };
  }, [slug]);

  async function handleUnlock() {
    setState('loading');
    try {
      const res = await fetch('/api/credits/use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature: 'detail_report', slug }),
      });

      const data = await res.json();

      if (res.status === 401) {
        location.href = `/login?next=${encodeURIComponent(location.pathname)}`;
        return;
      }
      if (!res.ok) {
        setErrorMsg(data.error ?? '오류가 발생했습니다.');
        setRemaining(data.remaining ?? 0);
        setState('error');
        return;
      }

      setContent(data.content);
      setRemaining(data.remaining);
      if (typeof data.remaining === 'number') {
        window.dispatchEvent(
          new CustomEvent('moonlight:credits-updated', {
            detail: { remaining: data.remaining },
          })
        );
      }
      setAccess(data.access === 'daily_reuse' || data.access === 'reused' ? 'reused' : 'charged');
      setState('unlocked');
    } catch {
      setErrorMsg('서버 오류가 발생했습니다.');
      setState('error');
    }
  }

  if (state === 'unlocked' && content) {
    return (
      <section className="app-panel space-y-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="app-caption">분야별 깊이보기</div>
            <h2 className="mt-3 text-xl font-semibold text-[var(--app-ivory)]">
              분야별 해석이 열려 있습니다
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="border-[var(--app-gold)]/25 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]">
              {access === 'reused' ? '이미 구매함' : '해금 완료'}
            </Badge>
            {remaining !== null ? (
              <span className="text-xs text-[var(--app-copy-soft)]">잔여 코인 {remaining}개</span>
            ) : null}
          </div>
        </div>

        <p className="app-body-copy text-sm">
          {access === 'reused'
            ? '이전에 열었던 같은 결과라 코인 차감 없이 다시 보여드립니다.'
            : '재물, 애정, 직업, 건강 흐름을 현재 명식과 운세 문맥에 맞춰 확장해서 읽은 결과입니다.'}
        </p>

        <div className="grid gap-3">
          {SECTIONS.map(({ key, label }) => {
            const meta = DETAIL_SECTION_META[key];

            return (
              <article
                key={key}
                className="rounded-[24px] border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="app-caption">{meta.eyebrow}</div>
                    <div className="mt-2 text-lg font-semibold text-[var(--app-ivory)]">{label}</div>
                  </div>
                  <Badge className="border-[var(--app-line)] bg-[var(--app-surface-strong)] text-[var(--app-copy-muted)]">
                    심화
                  </Badge>
                </div>
                <p className="mt-3 text-xs leading-6 text-[var(--app-copy-soft)]">{meta.guidance}</p>
                <ReadableDetailText
                  text={content[key as keyof Pick<DetailContent, 'wealth' | 'love' | 'career' | 'health'>]}
                  focus={meta.focus}
                />
              </article>
            );
          })}
        </div>

        <div className="rounded-[24px] border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium text-[var(--app-ivory)]">행운 키워드</div>
            <Badge className="border-[var(--app-line)] bg-[var(--app-surface-strong)] text-[var(--app-copy-muted)]">
              추천 포인트
            </Badge>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {content.luckyKeywords.map((kw) => (
              <Badge
                key={kw}
                className="border text-xs"
                style={{
                  backgroundColor: `${content.luckyColor}18`,
                  borderColor: `${content.luckyColor}45`,
                  color: content.luckyColor,
                }}
              >
                {kw}
              </Badge>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (state === 'error') {
    return (
      <section className="app-panel space-y-4 border-rose-400/20 p-6 text-center">
        <div className="app-caption text-rose-200/80">분야별 깊이보기 오류</div>
        <p className="font-medium text-rose-200">{errorMsg}</p>
        {errorMsg.includes('부족') ? (
          <>
            <p className="app-body-copy text-sm">잔여 코인: {remaining}개</p>
            <Link href="/credits">
              <Button className="border border-[var(--app-gold)]/35 bg-[var(--app-gold)]/12 text-[var(--app-gold-text)] hover:bg-[var(--app-gold)]/18">
                코인 충전하기
              </Button>
            </Link>
          </>
        ) : (
          <Button
            onClick={() => setState('locked')}
            variant="outline"
            className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-ivory)] hover:bg-[var(--app-surface-strong)]"
          >
            다시 시도
          </Button>
        )}
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[var(--app-line-strong)] bg-[linear-gradient(180deg,rgba(7,19,39,0.92),rgba(4,10,24,0.98))] p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(210,176,114,0.16),transparent_42%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(2,8,23,0.72))]" />

      <div className="relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="app-caption">선택 심화</div>
            <h2 className="mt-3 text-xl font-semibold text-[var(--app-ivory)]">
              필요한 분야만 1코인으로 더 읽어보세요
            </h2>
          </div>
          <Badge className="border-[var(--app-gold)]/25 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]">
            코인 1개
          </Badge>
        </div>

        <p className="app-body-copy mt-4 max-w-2xl text-sm">
          기본 결과를 먼저 읽고, 재물·관계·일·생활 리듬 중 더 궁금한 장면만 선택해서 펼칩니다. 명리 기준서에는 이 흐름이 더 넓게 포함됩니다.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            '이미 충분하면 열지 않아도 되는 선택형 심화입니다.',
            '한 번 연 같은 결과는 다시 코인이 차감되지 않습니다.',
            '더 큰 흐름은 명리 기준서에서 한 번에 이어집니다.',
          ].map((item) => (
            <div
              key={item}
              className="rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-4 text-sm leading-7 text-[var(--app-copy)]"
            >
              {item}
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-3 blur-[1.5px] select-none pointer-events-none">
          {SECTIONS.map(({ key, label }) => (
            <div
              key={key}
              className="rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] p-4"
            >
              <div className="text-sm font-medium text-[var(--app-ivory)]">{label}</div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--app-copy)]">
                {getPreviewCopy(key)}
              </p>
            </div>
          ))}
        </div>

        <div className="relative z-20 mt-6 rounded-[24px] border border-[var(--app-line)] bg-[rgba(2,8,23,0.56)] p-5 text-center backdrop-blur-sm">
          <p className="font-semibold text-[var(--app-ivory)]">분야별 깊이보기</p>
          <p className="mt-2 text-sm text-[var(--app-copy-muted)]">
            재물·애정·직업·건강 4개 영역을 한 번에 열고, 같은 결과는 이후에도 다시 차감하지 않습니다.
          </p>
          <Button
            onClick={handleUnlock}
            disabled={state === 'loading'}
            className="mt-5 h-12 min-w-[200px] rounded-full border border-[var(--app-gold)]/40 bg-[var(--app-gold)]/16 px-10 text-base font-semibold text-[var(--app-gold-text)] shadow-[0_16px_48px_rgba(210,176,114,0.14)] hover:bg-[var(--app-gold)]/22"
          >
            {state === 'loading' ? '처리 중...' : '1코인으로 분야별 보기'}
          </Button>
          <p className="mt-3 text-xs text-[var(--app-copy-soft)]">
            이미 열었던 결과라면 이 버튼을 눌러도 코인이 다시 빠지지 않습니다.
          </p>
        </div>
      </div>
    </section>
  );
}

function getPreviewCopy(key: (typeof SECTIONS)[number]['key']) {
  switch (key) {
    case 'wealth':
      return '현재 운 흐름 안에서 금전 감각이 살아나는 구간과 지출을 조심할 구간을 함께 읽습니다.';
    case 'love':
      return '관계의 속도와 표현 강약을 지금 시점의 운세 문맥에 맞춰 차분하게 풀어드립니다.';
    case 'career':
      return '대운과 세운을 바탕으로 포지션 변화, 확장 타이밍, 일의 결을 더 구체적으로 읽습니다.';
    case 'health':
      return '과한 기운과 약한 기운을 함께 보고 생활 리듬에서 먼저 손볼 포인트를 제안합니다.';
  }
}
