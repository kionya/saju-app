'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePreferredCounselor } from '@/features/counselor/use-preferred-counselor';

type DetailSectionKey = 'wealth' | 'love' | 'career' | 'health';

interface DetailTopicBlock {
  title: string;
  body: string;
  keywords?: string[];
  tone?: 'core' | 'basis' | 'action' | 'caution' | 'flow' | 'safety';
}

interface DetailTopicContent {
  lead: string;
  scoreLabel?: string;
  highlights?: string[];
  blocks: DetailTopicBlock[];
}

interface DetailContent {
  wealth: string;
  love: string;
  career: string;
  health: string;
  detailSections?: Partial<Record<DetailSectionKey, DetailTopicContent>>;
  luckyColor: string;
  luckyKeywords: string[];
}

interface Props {
  slug: string;
  children?: ReactNode;
  referenceChildren?: ReactNode;
}

const SECTIONS = [
  { key: 'wealth', label: '재물운' },
  { key: 'love', label: '연애운' },
  { key: 'career', label: '직업운' },
  { key: 'health', label: '건강운' },
] as const;

const DETAIL_SECTION_META: Record<
  DetailSectionKey,
  {
    eyebrow: string;
    focus: string;
    guidance: string;
    color: string;
    soft: string;
    line: string;
    label: string;
  }
> = {
  wealth: {
    eyebrow: '돈의 구조',
    focus: '핵심 재물 흐름',
    guidance: '수입·지출·기회 판단을 분리해서 읽어보세요.',
    color: '#34d399',
    soft: 'rgba(52,211,153,0.11)',
    line: 'rgba(52,211,153,0.35)',
    label: '재물',
  },
  love: {
    eyebrow: '감정의 온도',
    focus: '핵심 애정 흐름',
    guidance: '상대의 반응보다 표현 방식과 속도에 주목해 보세요.',
    color: '#fb7185',
    soft: 'rgba(251,113,133,0.11)',
    line: 'rgba(251,113,133,0.34)',
    label: '연애',
  },
  career: {
    eyebrow: '역할과 성과',
    focus: '핵심 직업 흐름',
    guidance: '자리, 책임, 제안 타이밍을 나눠서 확인해 보세요.',
    color: '#38bdf8',
    soft: 'rgba(56,189,248,0.11)',
    line: 'rgba(56,189,248,0.34)',
    label: '직업',
  },
  health: {
    eyebrow: '몸의 균형',
    focus: '핵심 건강 흐름',
    guidance: '강한 기운과 약한 기운이 생활 리듬에 주는 영향을 봅니다.',
    color: '#a78bfa',
    soft: 'rgba(167,139,250,0.12)',
    line: 'rgba(167,139,250,0.34)',
    label: '건강',
  },
};

const TONE_LABELS: Record<NonNullable<DetailTopicBlock['tone']>, string> = {
  core: '핵심',
  basis: '근거',
  action: '실천',
  caution: '주의',
  flow: '운 흐름',
  safety: '안전',
};

function splitReadableParagraphs(text: string) {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?。])\s+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function HighlightedText({
  text,
  keywords = [],
  color,
}: {
  text: string;
  keywords?: string[];
  color: string;
}) {
  const cleanKeywords = [...new Set(keywords.map((keyword) => keyword.trim()).filter(Boolean))]
    .sort((a, b) => b.length - a.length);

  if (cleanKeywords.length === 0) return <>{text}</>;

  const pattern = new RegExp(`(${cleanKeywords.map(escapeRegExp).join('|')})`, 'g');
  const exact = new Set(cleanKeywords);

  return (
    <>
      {text.split(pattern).map((part, index) =>
        exact.has(part) ? (
          <strong key={`${part}-${index}`} className="font-semibold" style={{ color }}>
            {part}
          </strong>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        )
      )}
    </>
  );
}

function fallbackTopicContent(text: string): DetailTopicContent {
  const [lead = '', ...rest] = splitReadableParagraphs(text);

  return {
    lead,
    blocks: rest.map((body, index) => ({
      title: index === 0 ? '세부 풀이' : `세부 풀이 ${index + 1}`,
      body,
      tone: index === 0 ? 'basis' : 'flow',
    })),
  };
}

function DetailTopicReport({
  topic,
  label,
  content,
}: {
  topic: DetailSectionKey;
  label: string;
  content: DetailTopicContent;
}) {
  const meta = DETAIL_SECTION_META[topic];

  return (
    <article
      className="overflow-hidden rounded-[26px] border bg-[rgba(255,255,255,0.035)]"
      style={{ borderColor: meta.line }}
    >
      <div
        className="border-b px-5 py-5"
        style={{
          borderColor: meta.line,
          background: `linear-gradient(135deg, ${meta.soft}, rgba(8,10,18,0.72))`,
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="app-caption" style={{ color: meta.color }}>
              {meta.eyebrow}
            </div>
            <div className="mt-2 text-xl font-semibold text-[var(--app-ivory)]">{label}</div>
          </div>
          <Badge
            className="border text-xs"
            style={{
              borderColor: meta.line,
              backgroundColor: meta.soft,
              color: meta.color,
            }}
          >
            {meta.label} 심화
          </Badge>
        </div>
        <p className="mt-3 text-sm leading-7 text-[var(--app-copy-soft)]">{meta.guidance}</p>
      </div>

      <div className="grid gap-4 p-5">
        <div
          className="rounded-[22px] border px-4 py-4"
          style={{
            borderColor: meta.line,
            backgroundColor: meta.soft,
          }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="app-caption" style={{ color: meta.color }}>
              {meta.focus}
            </span>
            {content.scoreLabel ? (
              <span
                className="rounded-full border px-2.5 py-1 text-xs font-semibold"
                style={{ borderColor: meta.line, color: meta.color }}
              >
                {content.scoreLabel}
              </span>
            ) : null}
          </div>
          <p className="mt-3 text-base font-semibold leading-8 text-[var(--app-ivory)] sm:text-lg">
            <HighlightedText text={content.lead} keywords={content.highlights} color={meta.color} />
          </p>
          {content.highlights && content.highlights.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {content.highlights.map((keyword) => (
                <span
                  key={`${topic}-${keyword}`}
                  className="rounded-full border px-3 py-1 text-xs font-semibold"
                  style={{
                    borderColor: meta.line,
                    backgroundColor: 'rgba(255,255,255,0.035)',
                    color: meta.color,
                  }}
                >
                  {keyword}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {content.blocks.map((block, index) => (
            <section
              key={`${topic}-${block.title}-${index}`}
              className="rounded-[22px] border border-[var(--app-line)] bg-[rgba(8,10,18,0.3)] px-4 py-4"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: block.tone === 'caution' ? '#fb7185' : meta.color }}
                />
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-copy-soft)]">
                  {block.tone ? TONE_LABELS[block.tone] : '풀이'}
                </div>
              </div>
              <h3 className="mt-3 text-base font-semibold text-[var(--app-ivory)]">{block.title}</h3>
              <p className="mt-3 text-sm leading-8 text-[var(--app-copy)]">
                <HighlightedText
                  text={block.body}
                  keywords={[...(content.highlights ?? []), ...(block.keywords ?? [])]}
                  color={block.tone === 'caution' ? '#fb7185' : meta.color}
                />
              </p>
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}

function getTopicContent(
  content: DetailContent,
  topic: DetailSectionKey
): DetailTopicContent {
  const structured = content.detailSections?.[topic];
  if (structured?.lead && structured.blocks.length > 0) {
    return structured;
  }

  return fallbackTopicContent(content[topic]);
}

export default function DetailUnlock({ slug, children, referenceChildren }: Props) {
  const { counselorId } = usePreferredCounselor();
  const [state, setState] = useState<'locked' | 'loading' | 'unlocked' | 'error'>('locked');
  const [content, setContent] = useState<DetailContent | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [remaining, setRemaining] = useState<number | null>(null);
  const [access, setAccess] = useState<'charged' | 'daily_reuse' | null>(null);

  async function handleUnlock() {
    setState('loading');
    try {
      const res = await fetch('/api/credits/use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature: 'detail_report', slug, counselorId }),
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
      setAccess(data.access === 'daily_reuse' ? 'daily_reuse' : 'charged');
      setState('unlocked');
    } catch {
      setErrorMsg('서버 오류가 발생했습니다.');
      setState('error');
    }
  }

  if (state === 'unlocked' && content) {
    return (
      <section className="relative overflow-hidden rounded-[32px] border border-[var(--app-gold)]/26 bg-[linear-gradient(180deg,rgba(14,18,34,0.98),rgba(5,10,22,0.98))] p-5 sm:p-7">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(210,176,114,0.62),transparent)]" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="app-caption">상세 해석 리포트</div>
            <h2 className="mt-3 text-xl font-semibold text-[var(--app-ivory)]">
              재물·연애·직업·생활 리듬 심화 해석이 열렸습니다
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="border-[var(--app-gold)]/25 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]">
              {access === 'daily_reuse' ? '오늘 재열람' : '해금 완료'}
            </Badge>
            <Badge className="border-[var(--app-line)] bg-[var(--app-surface-strong)] text-[var(--app-copy-muted)]">
              {counselorId === 'male' ? '달빛 남선생 기준' : '달빛 여선생 기준'}
            </Badge>
            {remaining !== null ? (
              <span className="text-xs text-[var(--app-copy-soft)]">잔여 코인 {remaining}개</span>
            ) : null}
          </div>
        </div>

        <p className="app-body-copy text-sm">
          {access === 'daily_reuse'
            ? '오늘 이미 열어본 상세 해석이라 코인 차감 없이 다시 보여드립니다.'
            : '좋은 말만 길게 나열하지 않고, 지금 실제로 궁금한 장면부터 읽을 수 있게 분야별 핵심과 주의 포인트를 먼저 정리했습니다.'}
        </p>

        {children ? <div className="mt-6 space-y-5">{children}</div> : null}

        <div className="mt-6 grid gap-4">
          {SECTIONS.map(({ key, label }) => (
            <DetailTopicReport
              key={key}
              topic={key}
              label={label}
              content={getTopicContent(content, key)}
            />
          ))}
        </div>

        <div className="rounded-[24px] border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium text-[var(--app-ivory)]">이번 심화 해석에서 기억할 키워드</div>
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

        {referenceChildren ? <div className="mt-6 space-y-5">{referenceChildren}</div> : null}
      </section>
    );
  }

  if (state === 'error') {
    return (
      <section className="app-panel space-y-4 border-rose-400/20 p-6 text-center">
        <div className="app-caption text-rose-200/80">상세 해석 오류</div>
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
            <div className="app-caption">상세 해석 잠금</div>
            <h2 className="mt-3 text-xl font-semibold text-[var(--app-ivory)]">
              지금 더 궁금한 장면만 1코인으로 깊게 펼쳐보세요
            </h2>
          </div>
          <Badge className="border-[var(--app-gold)]/25 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]">
            코인 1개
          </Badge>
        </div>

        <p className="app-body-copy mt-4 max-w-2xl text-sm">
          재물, 애정, 직업, 건강 흐름을 현재 대운·세운 문맥과 함께 더 구체적으로 풀이합니다.
          {' '}
          {counselorId === 'male'
            ? '선택한 달빛 남선생 기준으로 결론, 보류, 확인 순서를 먼저 잡아드립니다.'
            : '선택한 달빛 여선생 기준으로 흐름의 맥락과 관계의 온도까지 섬세하게 풀어드립니다.'}
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            '현재 대운과 세운을 붙여 “왜 지금 이런가”를 읽습니다.',
            '재물·애정·직업·건강을 분야별로 나눠 바로 필요한 장면부터 읽게 풉니다.',
            '무엇을 밀고, 무엇을 보류하고, 무엇을 확인할지까지 함께 정리합니다.',
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
          <p className="font-semibold text-[var(--app-ivory)]">상세 해석 열기</p>
          <p className="mt-2 text-sm text-[var(--app-copy-muted)]">
            재물·애정·직업·건강 4개 영역을 한 번에 열고, 같은 결과는 오늘 하루 동안 재차감 없이 다시 볼 수 있습니다
          </p>
          <Button
            onClick={handleUnlock}
            disabled={state === 'loading'}
            className="mt-5 h-12 min-w-[200px] rounded-full border border-[var(--app-gold)]/40 bg-[var(--app-gold)]/16 px-10 text-base font-semibold text-[var(--app-gold-text)] shadow-[0_16px_48px_rgba(210,176,114,0.14)] hover:bg-[var(--app-gold)]/22"
          >
            {state === 'loading' ? '처리 중...' : '코인 1개로 지금 열기'}
          </Button>
          <p className="mt-3 text-xs text-[var(--app-copy-soft)]">
            오늘 이미 열었던 같은 결과는 코인 차감 없이 다시 열립니다.
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
