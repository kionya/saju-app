'use client';

import { useEffect, useMemo, useState } from 'react';
import { GroundingKasiSummary } from '@/components/ai/grounding-kasi-summary';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { SajuInterpretationGrounding } from '@/domain/saju/report';
import type { KasiSingleInputComparison } from '@/domain/saju/validation/kasi-calendar';
import { usePreferredCounselor } from '@/features/counselor/use-preferred-counselor';
import type { MoonlightCounselorId } from '@/lib/counselors';
import type { AiFallbackReason, AiGenerationSource } from '@/server/ai/openai-text';
import type {
  SajuYearlyAiInterpretation,
  SajuYearlyAiMonthlyFlow,
} from '@/server/ai/saju-yearly-interpretation';

interface Props {
  slug: string;
  targetYear: number;
}

interface YearlyInterpretationResponse {
  ok: boolean;
  readingId: string;
  resolvedReadingId: string;
  readingSource: 'database-reading-id' | 'deterministic-slug';
  targetYear: number;
  counselorId: MoonlightCounselorId;
  promptVersion: string;
  cached: boolean;
  cacheable: boolean;
  cacheKeyType: 'reading_id' | 'reading_slug' | 'unavailable';
  source: AiGenerationSource;
  model: string | null;
  fallbackReason: AiFallbackReason | null;
  errorMessage: string | null;
  generationMs: number;
  updatedAt?: string;
  grounding: SajuInterpretationGrounding;
  kasiComparison: KasiSingleInputComparison | null;
  interpretation: SajuYearlyAiInterpretation;
  reportText: string;
  stageResults: Array<{
    key: 'narrative' | 'monthly';
    source: AiGenerationSource;
    fallbackReason: AiFallbackReason | null;
    errorMessage: string | null;
    durationMs: number;
  }>;
}

const CATEGORY_ORDER = [
  { key: 'work', label: '일·직업운', color: '#38bdf8' },
  { key: 'wealth', label: '재물운', color: '#34d399' },
  { key: 'love', label: '연애·결혼운', color: '#fb7185' },
  { key: 'relationship', label: '인간관계운', color: '#f59e0b' },
  { key: 'health', label: '건강운', color: '#a78bfa' },
  { key: 'move', label: '이동·변화운', color: '#60a5fa' },
] as const;

function splitParagraphs(text: string) {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?。])\s+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function renderParagraphs(text: string) {
  return splitParagraphs(text).map((paragraph, index) => (
    <p key={`${paragraph.slice(0, 24)}-${index}`} className="text-sm leading-8 text-[var(--app-copy)]">
      {paragraph}
    </p>
  ));
}

function formatUpdatedAt(value?: string) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function MonthlyFlowCard({ flow }: { flow: SajuYearlyAiMonthlyFlow }) {
  return (
    <article className="rounded-[20px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-4">
      <div className="app-caption text-[var(--app-gold-soft)]">{flow.month}월</div>
      <div className="mt-3 space-y-3">{renderParagraphs(flow.summary)}</div>
    </article>
  );
}

export default function YearlyReportPanel({ slug, targetYear }: Props) {
  const { counselorId } = usePreferredCounselor();
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [data, setData] = useState<YearlyInterpretationResponse | null>(null);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setState('loading');
      setError('');

      try {
        const response = await fetch('/api/interpret/yearly', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            readingId: slug,
            targetYear,
            counselorId,
            regenerate: reloadToken > 0,
          }),
          signal: controller.signal,
        });

        const payload = (await response.json().catch(() => null)) as
          | YearlyInterpretationResponse
          | { error?: string }
          | null;

        if (!response.ok || !payload || !('ok' in payload) || payload.ok !== true) {
          setError(payload && 'error' in payload && payload.error ? payload.error : '연간 리포트를 불러오지 못했습니다.');
          setState('error');
          return;
        }

        setData(payload);
        setState('ready');
      } catch (fetchError) {
        if ((fetchError as Error).name === 'AbortError') return;
        setError('연간 리포트를 불러오는 중 오류가 발생했습니다.');
        setState('error');
      }
    }

    void load();

    return () => controller.abort();
  }, [slug, targetYear, counselorId, reloadToken]);

  const updatedAtLabel = useMemo(
    () => formatUpdatedAt(data?.updatedAt),
    [data?.updatedAt]
  );

  if (state === 'loading') {
    return (
      <section className="moon-lunar-panel p-6">
        <div className="app-starfield" />
        <div className="app-caption">연간 리포트 생성 중</div>
        <h2 className="mt-4 font-[var(--font-heading)] text-3xl text-[var(--app-ivory)]">
          {targetYear}년 신년 운세를 정리하고 있습니다
        </h2>
        <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
          원국, 세운, 월운, 대운을 다시 맞춰 한 해 전체 흐름을 장문 리포트로 재구성하고 있습니다.
        </p>
        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={`yearly-loading-${index}`}
              className="h-28 animate-pulse rounded-[20px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.04)]"
            />
          ))}
        </div>
      </section>
    );
  }

  if (state === 'error' || !data) {
    return (
      <section className="app-panel space-y-4 border-rose-400/20 p-6">
        <div className="app-caption text-rose-200/80">연간 리포트 오류</div>
        <p className="font-medium text-rose-200">{error || '연간 리포트를 불러오지 못했습니다.'}</p>
        <Button
          onClick={() => setReloadToken((value) => value + 1)}
          variant="outline"
          className="w-fit border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-ivory)] hover:bg-[var(--app-surface-strong)]"
        >
          다시 불러오기
        </Button>
      </section>
    );
  }

  const interpretation = data.interpretation;

  return (
    <section id="yearly-report" className="moon-lunar-panel p-6 sm:p-7">
      <div className="app-starfield" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="app-caption">{targetYear} 신년 운세 프리미엄 리포트</div>
          <h2 className="mt-4 font-[var(--font-heading)] text-3xl text-[var(--app-ivory)]">
            {targetYear}년 한 해의 큰 흐름을 먼저 읽어드립니다
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--app-copy-muted)]">
            명식, 세운, 월운, 대운의 계산 기준을 먼저 고정하고, 이 리포트는 그 결과를 한 해의 언어로 풀어냅니다.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="border-[var(--app-gold)]/28 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]">
            {data.counselorId === 'male' ? '달빛 남선생 기준' : '달빛 여선생 기준'}
          </Badge>
          <Badge className="border-[var(--app-line)] bg-[var(--app-surface-strong)] text-[var(--app-copy-muted)]">
            {data.source === 'openai' ? 'OpenAI 생성' : '근거 기반 fallback'}
          </Badge>
          {data.cached ? (
            <Badge className="border-[var(--app-line)] bg-[rgba(255,255,255,0.04)] text-[var(--app-copy-soft)]">
              캐시 사용
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-[var(--app-copy-soft)]">
        {updatedAtLabel ? <span>최근 생성: {updatedAtLabel}</span> : null}
        {data.model ? <span>모델: {data.model}</span> : null}
        {!data.cached ? <span>생성 시간: {data.generationMs}ms</span> : null}
        <span>cache key: {data.cacheKeyType}</span>
        <Button
          onClick={() => setReloadToken((value) => value + 1)}
          variant="outline"
          className="h-8 rounded-full border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-3 text-xs text-[var(--app-copy)] hover:bg-[rgba(255,255,255,0.06)]"
        >
          다시 생성
        </Button>
      </div>

      <div className="mt-6 rounded-[24px] border border-[var(--app-gold)]/18 bg-[rgba(210,176,114,0.08)] px-5 py-5">
        <div className="space-y-3">{renderParagraphs(interpretation.opening)}</div>
      </div>

      <div className="mt-6">
        <GroundingKasiSummary
          id="yearly-evidence"
          grounding={data.grounding}
          kasiComparison={data.kasiComparison}
          title="이 연간 리포트가 참고한 실제 계산 근거"
        />
      </div>

      <div className="mt-6">
        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--app-gold-soft)]">
          올해 핵심 키워드
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {interpretation.keywords.map((keyword) => (
            <Badge
              key={keyword}
              className="h-auto rounded-full border-[var(--app-line)] bg-[rgba(255,255,255,0.04)] px-3 py-2 text-left text-xs leading-6 text-[var(--app-copy)]"
            >
              {keyword}
            </Badge>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-[24px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-5 py-5">
          <div className="app-caption text-[var(--app-gold-soft)]">상반기 흐름 분석</div>
          <div className="mt-4 space-y-3">{renderParagraphs(interpretation.firstHalf)}</div>
        </article>
        <article className="rounded-[24px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-5 py-5">
          <div className="app-caption text-[var(--app-gold-soft)]">하반기 흐름 분석</div>
          <div className="mt-4 space-y-3">{renderParagraphs(interpretation.secondHalf)}</div>
        </article>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {CATEGORY_ORDER.map((item) => (
          <article
            key={item.key}
            className="rounded-[24px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-5 py-5"
          >
            <div className="app-caption" style={{ color: item.color }}>
              {item.label}
            </div>
            <div className="mt-4 space-y-3">{renderParagraphs(interpretation.categories[item.key])}</div>
          </article>
        ))}
      </div>

      <div className="mt-6">
        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--app-gold-soft)]">
          월별 흐름 요약
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {interpretation.monthlyFlows.map((flow) => (
            <MonthlyFlowCard key={`${flow.month}-${flow.summary.slice(0, 16)}`} flow={flow} />
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <article className="rounded-[24px] border border-emerald-400/20 bg-emerald-400/8 px-5 py-5">
          <div className="app-caption text-emerald-200">잘 풀리는 시기</div>
          <div className="mt-4 space-y-3">
            {data.interpretation.goodPeriods.map((item) => (
              <p key={item} className="text-sm leading-8 text-[var(--app-copy)]">
                {item}
              </p>
            ))}
          </div>
        </article>
        <article className="rounded-[24px] border border-rose-400/20 bg-rose-400/8 px-5 py-5">
          <div className="app-caption text-rose-200">조심해야 할 시기</div>
          <div className="mt-4 space-y-3">
            {data.interpretation.cautionPeriods.map((item) => (
              <p key={item} className="text-sm leading-8 text-[var(--app-copy)]">
                {item}
              </p>
            ))}
          </div>
        </article>
        <article className="rounded-[24px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-5 py-5">
          <div className="app-caption text-[var(--app-gold-soft)]">행동 조언</div>
          <div className="mt-4 space-y-3">
            {data.interpretation.actionAdvice.map((item) => (
              <p key={item} className="text-sm leading-8 text-[var(--app-copy)]">
                {item}
              </p>
            ))}
          </div>
        </article>
      </div>

      <div className="mt-6 rounded-[24px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-5 py-5">
        <div className="app-caption text-[var(--app-gold-soft)]">올해의 한 줄 요약</div>
        <p className="mt-4 text-lg font-semibold leading-8 text-[var(--app-ivory)]">
          {interpretation.oneLineSummary}
        </p>
      </div>
    </section>
  );
}
