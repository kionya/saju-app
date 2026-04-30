'use client';

import { useEffect, useMemo, useState } from 'react';
import { GroundingKasiSummary } from '@/components/ai/grounding-kasi-summary';
import { EngineMethodLinks } from '@/components/content/engine-method-links';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { SajuInterpretationGrounding } from '@/domain/saju/report';
import type {
  SajuYearlyReport,
  YearlyMonthFlow,
  YearlyTimingWindow,
} from '@/domain/saju/report/yearly-types';
import type { KasiSingleInputComparison } from '@/domain/saju/validation/kasi-calendar';
import { usePreferredCounselor } from '@/features/counselor/use-preferred-counselor';
import type { MoonlightCounselorId } from '@/lib/counselors';
import type { SajuReportRuntimeMetadata } from '@/lib/saju/report-metadata';
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
  metadata: SajuReportRuntimeMetadata;
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
  report: SajuYearlyReport;
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

const CORE_CATEGORY_ORDER = ['work', 'wealth', 'love', 'relationship'] as const;

const CORE_CATEGORY_GUIDE = {
  work: {
    label: '직장운',
    eyebrow: '일과 평가',
    opportunityLabel: '평가가 붙는 장면',
    cautionLabel: '한 번 더 확인할 장면',
    actionLabel: '올해 행동 기준',
  },
  wealth: {
    label: '재물운',
    eyebrow: '돈의 흐름',
    opportunityLabel: '돈이 붙는 장면',
    cautionLabel: '새기 쉬운 장면',
    actionLabel: '올해 돈 기준',
  },
  love: {
    label: '연애운',
    eyebrow: '가까운 관계',
    opportunityLabel: '마음이 통하는 장면',
    cautionLabel: '오해가 커지는 장면',
    actionLabel: '올해 표현 기준',
  },
  relationship: {
    label: '관계운',
    eyebrow: '사람과 거리',
    opportunityLabel: '사람을 살리는 장면',
    cautionLabel: '마찰이 커지는 장면',
    actionLabel: '올해 관계 기준',
  },
} as const;

const MOMENTUM_META: Record<
  YearlyMonthFlow['momentum'],
  { label: string; badgeClassName: string }
> = {
  rise: {
    label: '밀어도 되는 달',
    badgeClassName: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100',
  },
  steady: {
    label: '정리하는 달',
    badgeClassName: 'border-[var(--app-line)] bg-[rgba(255,255,255,0.04)] text-[var(--app-copy-soft)]',
  },
  caution: {
    label: '한 번 더 확인할 달',
    badgeClassName: 'border-rose-400/25 bg-rose-400/10 text-rose-100',
  },
};

const YEARLY_AREA_LABEL: Record<YearlyMonthFlow['relatedAreas'][number], string> = {
  work: '일',
  wealth: '돈',
  love: '연애',
  relationship: '관계',
  health: '생활 리듬',
  move: '변화',
};

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

function renderCompactParagraphs(text: string, limit = 2) {
  return splitParagraphs(text)
    .slice(0, limit)
    .map((paragraph, index) => (
      <p key={`${paragraph.slice(0, 24)}-${index}`} className="text-sm leading-7 text-[var(--app-copy)]">
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

function buildMonthlyFallback(flow: SajuYearlyAiMonthlyFlow): YearlyMonthFlow {
  return {
    month: flow.month,
    label: `${flow.month}월`,
    monthlyGanji: null,
    momentum: 'steady',
    theme: `${flow.month}월 흐름`,
    focusQuestion: `${flow.month}월에는 무엇을 먼저 확인해야 할까요?`,
    summary: flow.summary,
    opportunity: '이미 준비된 선택 한두 가지를 먼저 꺼내 보세요.',
    caution: '확정 전에 한 번 더 비교하고 확인하는 편이 좋습니다.',
    action: '욕심을 넓히기보다 기준을 먼저 세우고 움직이세요.',
    relatedAreas: ['work', 'wealth'],
    basis: [],
  };
}

function normalizeMonthlyFlows(
  report: SajuYearlyReport | undefined,
  interpretation: SajuYearlyAiInterpretation
) {
  if (report?.monthlyFlows?.length) return report.monthlyFlows;
  return interpretation.monthlyFlows.map(buildMonthlyFallback);
}

function MonthlyFlowCard({ flow }: { flow: YearlyMonthFlow }) {
  const momentumMeta = MOMENTUM_META[flow.momentum];
  const areaLabel = flow.relatedAreas.map((area) => YEARLY_AREA_LABEL[area]).join(' · ');

  return (
    <article className="rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="app-caption text-[var(--app-gold-soft)]">{flow.month}월</div>
        <Badge className={momentumMeta.badgeClassName}>{momentumMeta.label}</Badge>
      </div>

      <p className="mt-3 text-sm leading-7 text-[var(--app-ivory)]">{flow.summary}</p>
      <div className="mt-4 rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.025)] px-4 py-3">
        <div className="app-caption text-[var(--app-gold-soft)]">이번 달 질문</div>
        <p className="mt-2 text-sm leading-7 text-[var(--app-copy)]">{flow.focusQuestion}</p>
      </div>

      <div className="mt-4 grid gap-3">
        <div className="rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.025)] px-4 py-3">
          <div className="app-caption text-[var(--app-gold-soft)]">먼저 밀어볼 것</div>
          <p className="mt-2 text-sm leading-7 text-[var(--app-copy)]">{flow.opportunity}</p>
        </div>
        <div className="rounded-[18px] border border-rose-400/18 bg-rose-400/6 px-4 py-3">
          <div className="app-caption text-rose-100">한 번 더 확인할 장면</div>
          <p className="mt-2 text-sm leading-7 text-[var(--app-copy)]">{flow.caution}</p>
        </div>
        <div className="rounded-[18px] border border-emerald-400/18 bg-emerald-400/6 px-4 py-3">
          <div className="app-caption text-emerald-100">이번 달 행동 기준</div>
          <p className="mt-2 text-sm leading-7 text-[var(--app-copy)]">{flow.action}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge className="border-[var(--app-line)] bg-[rgba(255,255,255,0.04)] text-[var(--app-copy-soft)]">
          {flow.monthlyGanji ?? `${flow.month}월`}
        </Badge>
        <Badge className="border-[var(--app-line)] bg-[rgba(255,255,255,0.04)] text-[var(--app-copy-soft)]">
          {areaLabel}
        </Badge>
      </div>
    </article>
  );
}

function CoreAreaCard({
  item,
  prose,
}: {
  item: {
    key: (typeof CORE_CATEGORY_ORDER)[number];
    label: string;
    eyebrow: string;
    scoreLabel: string | null;
    summary: string;
    opportunity: string;
    caution: string;
    action: string;
  };
  prose: string;
}) {
  const meta = CORE_CATEGORY_GUIDE[item.key];

  return (
    <article className="rounded-[24px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-5 py-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="app-caption text-[var(--app-gold-soft)]">{meta.eyebrow}</div>
        {item.scoreLabel ? (
          <Badge className="border-[var(--app-line)] bg-[rgba(255,255,255,0.04)] text-[var(--app-copy-soft)]">
            {item.scoreLabel}
          </Badge>
        ) : null}
      </div>
      <h3 className="mt-3 text-xl font-semibold text-[var(--app-ivory)]">{item.label}</h3>
      <div className="mt-4 grid gap-3">
        <div className="rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.025)] px-4 py-3">
          <div className="app-caption text-[var(--app-gold-soft)]">올해 핵심</div>
          <p className="mt-2 text-sm leading-7 text-[var(--app-copy)]">{item.summary}</p>
        </div>
        <div className="rounded-[18px] border border-emerald-400/18 bg-emerald-400/6 px-4 py-3">
          <div className="app-caption text-emerald-100">{meta.opportunityLabel}</div>
          <p className="mt-2 text-sm leading-7 text-[var(--app-copy)]">{item.opportunity}</p>
        </div>
        <div className="rounded-[18px] border border-rose-400/18 bg-rose-400/6 px-4 py-3">
          <div className="app-caption text-rose-100">{meta.cautionLabel}</div>
          <p className="mt-2 text-sm leading-7 text-[var(--app-copy)]">{item.caution}</p>
        </div>
        <div className="rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.025)] px-4 py-3">
          <div className="app-caption text-[var(--app-gold-soft)]">{meta.actionLabel}</div>
          <p className="mt-2 text-sm leading-7 text-[var(--app-copy)]">{item.action}</p>
        </div>
      </div>
      <details className="group mt-4">
        <summary className="cursor-pointer list-none rounded-xl border border-[var(--app-line)] px-4 py-3 text-sm font-semibold text-[var(--app-copy)] transition-colors group-open:border-[var(--app-gold)]/25 group-open:text-[var(--app-ivory)]">
          선생 풀이 전문 보기
        </summary>
        <div className="mt-3 space-y-3 rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.025)] px-4 py-4">
          {renderCompactParagraphs(prose, 3)}
        </div>
      </details>
    </article>
  );
}

function SupportAreaCard({
  label,
  eyebrow,
  section,
  prose,
}: {
  label: string;
  eyebrow: string;
  section: SajuYearlyReport['categories']['health'];
  prose: string;
}) {
  return (
    <article className="rounded-[24px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-5 py-5">
      <div className="app-caption text-[var(--app-gold-soft)]">{eyebrow}</div>
      <h3 className="mt-3 text-lg font-semibold text-[var(--app-ivory)]">{label}</h3>
      <div className="mt-4 space-y-3">
        <p className="text-sm leading-7 text-[var(--app-copy)]">{section.summary}</p>
        <p className="text-sm leading-7 text-[var(--app-copy-muted)]">{section.caution}</p>
        <p className="text-sm leading-7 text-[var(--app-copy)]">{section.action}</p>
      </div>
      <details className="group mt-4">
        <summary className="cursor-pointer list-none rounded-xl border border-[var(--app-line)] px-4 py-3 text-sm font-semibold text-[var(--app-copy)] transition-colors group-open:border-[var(--app-gold)]/25 group-open:text-[var(--app-ivory)]">
          선생 풀이 전문 보기
        </summary>
        <div className="mt-3 space-y-3 rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.025)] px-4 py-4">
          {renderCompactParagraphs(prose, 2)}
        </div>
      </details>
    </article>
  );
}

function TimingWindowCard({
  title,
  windows,
  tone,
}: {
  title: string;
  windows: YearlyTimingWindow[];
  tone: 'good' | 'caution';
}) {
  const cardClassName =
    tone === 'good'
      ? 'border-emerald-400/20 bg-emerald-400/8'
      : 'border-rose-400/20 bg-rose-400/8';
  const captionClassName = tone === 'good' ? 'text-emerald-100' : 'text-rose-100';

  return (
    <article className={`rounded-[22px] border px-4 py-4 ${cardClassName}`}>
      <div className={`app-caption ${captionClassName}`}>{title}</div>
      <div className="mt-4 grid gap-3">
        {windows.map((window) => (
          <div
            key={`${title}-${window.label}-${window.months.join('-')}`}
            className="rounded-[16px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-3"
          >
            <div className="text-sm font-semibold text-[var(--app-ivory)]">
              {window.months.map((month) => `${month}월`).join(' · ')}
            </div>
            <p className="mt-2 text-sm leading-7 text-[var(--app-copy)]">{window.reason}</p>
            <p className="mt-2 text-sm leading-7 text-[var(--app-copy-muted)]">{window.strategy}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function buildMonthlySectionTitle(report: SajuYearlyReport) {
  return `${report.year}년 1월부터 12월까지, 실제로 먼저 확인할 장면을 달별로 정리했습니다`;
}

function buildMonthlySectionDescription(report: SajuYearlyReport) {
  const repeatedAreas = [...new Set(report.monthlyFlows.flatMap((flow) => flow.relatedAreas))]
    .map((area) => YEARLY_AREA_LABEL[area])
    .slice(0, 4)
    .join(' · ');

  return `좋은 말만 길게 적지 않고, 사람들이 실제로 궁금해하는 ${repeatedAreas} 중심으로 “이번 달 밀어도 되는 일 / 한 번 더 확인할 일 / 행동 기준”을 먼저 읽게 정리했습니다.`;
}

function YearlyMonthlySection({
  report,
  interpretation,
}: {
  report?: SajuYearlyReport;
  interpretation: SajuYearlyAiInterpretation;
}) {
  const monthlyFlows = normalizeMonthlyFlows(report, interpretation);
  const title = report ? buildMonthlySectionTitle(report) : '1월부터 12월까지 핵심 장면을 먼저 정리했습니다';
  const description = report
    ? buildMonthlySectionDescription(report)
    : '월별 핵심 문장만 빠르게 확인하고, 필요한 달만 다시 펼쳐보실 수 있게 정리했습니다.';

  return (
    <div className="mt-6">
      <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--app-gold-soft)]">
        월별 핵심 장면
      </div>
      <h3 className="mt-3 text-xl font-semibold text-[var(--app-ivory)]">{title}</h3>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--app-copy-muted)]">{description}</p>

      {report ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <TimingWindowCard title="밀어도 되는 시기" windows={report.goodPeriods} tone="good" />
          <TimingWindowCard title="한 번 더 확인할 시기" windows={report.cautionPeriods} tone="caution" />
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {monthlyFlows.map((flow) => (
          <MonthlyFlowCard key={`${flow.month}-${flow.summary.slice(0, 12)}`} flow={flow} />
        ))}
      </div>
    </div>
  );
}

function TimingSummaryBlock({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: 'good' | 'caution';
}) {
  const eyebrowClassName = tone === 'good' ? 'text-emerald-100' : 'text-rose-100';

  return (
    <article className="rounded-[24px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-5 py-5">
      <div className={`app-caption ${eyebrowClassName}`}>{title}</div>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <p key={item} className="text-sm leading-7 text-[var(--app-copy)]">
            {item}
          </p>
        ))}
      </div>
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
          setError(payload && 'error' in payload && payload.error ? payload.error : '연간 전략 부록을 불러오지 못했습니다.');
          setState('error');
          return;
        }

        setData(payload);
        setState('ready');
      } catch (fetchError) {
        if ((fetchError as Error).name === 'AbortError') return;
        setError('연간 전략 부록을 불러오는 중 오류가 발생했습니다.');
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
        <div className="app-caption">연간 전략 부록 생성 중</div>
        <h2 className="font-display mt-4 text-3xl text-[var(--app-ivory)]">
          {targetYear}년 올해 전략 부록을 정리하고 있습니다
        </h2>
        <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
          원국, 세운, 월운, 대운의 근거를 다시 맞추고, 같은 기준 위에서 올해의 선택 포인트를 재구성하고 있습니다.
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
        <div className="app-caption text-rose-200/80">연간 전략 부록 오류</div>
        <p className="font-medium text-rose-200">{error || '연간 전략 부록을 불러오지 못했습니다.'}</p>
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
  const coreCards = CORE_CATEGORY_ORDER.map((key) => {
    const section = data.report.categories[key];
    const referenceTopic = key === 'work' ? 'career' : key;
    const reference = data.report.referenceReports[referenceTopic];
    const scoreLabel = reference.score !== null ? `${reference.focusLabel} ${reference.score}점` : null;

    return {
      key,
      label: CORE_CATEGORY_GUIDE[key].label,
      eyebrow: CORE_CATEGORY_GUIDE[key].eyebrow,
      scoreLabel,
      summary: section.summary,
      opportunity: section.opportunity,
      caution: section.caution,
      action: section.action,
    };
  });

  return (
    <section id="yearly-report" className="moon-lunar-panel p-6 sm:p-7">
      <div className="app-starfield" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="app-caption">{targetYear} 연간 전략 부록</div>
          <h2 className="font-display mt-4 text-3xl text-[var(--app-ivory)]">
            {targetYear}년 한 해를 월별 판단 기준까지 먼저 정리해드립니다
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--app-copy-muted)]">
            명리 기준서가 평생 기준을 남기는 본문이라면, 이 부록은 같은 근거 위에서 올해의 기회 달, 주의 달, 관계·돈·일의 판단 시점을 읽어드리는 연간 전략편입니다.
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
        <div className="app-caption text-[var(--app-gold-soft)]">올해 한 줄 먼저</div>
        <p className="font-display mt-4 text-lg font-semibold leading-8 text-[var(--app-ivory)]">
          {interpretation.oneLineSummary}
        </p>
        <div className="mt-4 space-y-3">{renderCompactParagraphs(interpretation.opening, 2)}</div>
      </div>

      <div className="mt-6">
        <GroundingKasiSummary
          id="yearly-evidence"
          grounding={data.grounding}
          kasiComparison={data.kasiComparison}
          metadata={data.metadata}
          title="이 연간 전략 부록이 참고한 실제 계산 근거"
        />
      </div>

      <div className="mt-6">
        <EngineMethodLinks
          title="연간 흐름을 읽을 때 같이 보면 좋은 기준"
          description="대운과 세운을 어떻게 같이 읽는지, 시간을 모를 때 어디까지 보수적으로 낮춰야 하는지, 공망과 신살은 어느 선까지 참고해야 하는지를 함께 정리했습니다."
          slugs={[
            'how-to-read-daewoon-and-sewoon-together',
            'what-if-birth-hour-is-unknown',
            'how-far-to-trust-gongmang-and-shinsal',
          ]}
          ctaHref="/method"
          ctaLabel="관련 기준 더 보기"
          compact
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
          <div className="app-caption text-[var(--app-gold-soft)]">상반기 먼저 볼 것</div>
          <div className="mt-4 space-y-3">{renderCompactParagraphs(interpretation.firstHalf, 3)}</div>
        </article>
        <article className="rounded-[24px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-5 py-5">
          <div className="app-caption text-[var(--app-gold-soft)]">하반기 먼저 볼 것</div>
          <div className="mt-4 space-y-3">{renderCompactParagraphs(interpretation.secondHalf, 3)}</div>
        </article>
      </div>

      <div className="mt-6">
        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--app-gold-soft)]">
          올해 사람들이 가장 많이 묻는 4가지
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--app-copy-muted)]">
          직장운, 재물운, 연애운, 관계운은 긴 총평보다 “무슨 장면이 핵심인지 / 무엇을 조심할지 / 어떻게 움직일지”가 먼저 보이게 정리했습니다.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {coreCards.map((item) => (
            <CoreAreaCard
              key={item.key}
              item={item}
              prose={interpretation.categories[item.key]}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <SupportAreaCard
          label="건강·생활 리듬"
          eyebrow="리듬 관리"
          section={data.report.categories.health}
          prose={interpretation.categories.health}
        />
        <SupportAreaCard
          label="이동·변화"
          eyebrow="자리와 이동"
          section={data.report.categories.move}
          prose={interpretation.categories.move}
        />
      </div>

      <YearlyMonthlySection report={data.report} interpretation={interpretation} />

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <TimingSummaryBlock title="좋은 시기 활용법" items={data.interpretation.goodPeriods} tone="good" />
        <TimingSummaryBlock title="조심해야 할 시기" items={data.interpretation.cautionPeriods} tone="caution" />
        <article className="rounded-[24px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-5 py-5">
          <div className="app-caption text-[var(--app-gold-soft)]">행동 조언</div>
          <div className="mt-4 space-y-3">
            {data.interpretation.actionAdvice.map((item) => (
              <p key={item} className="text-sm leading-7 text-[var(--app-copy)]">
                {item}
              </p>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
