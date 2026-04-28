'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { GroundingKasiSummary } from '@/components/ai/grounding-kasi-summary';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { SajuInterpretationGrounding } from '@/domain/saju/report';
import type { KasiSingleInputComparison } from '@/domain/saju/validation/kasi-calendar';
import { usePreferredCounselor } from '@/features/counselor/use-preferred-counselor';
import type { MoonlightCounselorId } from '@/lib/counselors';
import type { AiFallbackReason, AiGenerationSource } from '@/server/ai/openai-text';
import type { SajuLifetimeReport } from '@/domain/saju/report/lifetime-types';
import type { SajuLifetimeAiInterpretation } from '@/server/ai/saju-lifetime-interpretation';

interface Props {
  slug: string;
  targetYear: number;
}

interface LifetimeInterpretationResponse {
  ok: boolean;
  readingId: string;
  resolvedReadingId: string;
  readingSource: 'database-reading-id' | 'deterministic-slug';
  targetYear: number;
  counselorId: MoonlightCounselorId;
  promptVersion: string;
  cached: false;
  cacheable: false;
  source: AiGenerationSource;
  model: string | null;
  fallbackReason: AiFallbackReason | null;
  errorMessage: string | null;
  generationMs: number;
  grounding: SajuInterpretationGrounding;
  kasiComparison: KasiSingleInputComparison | null;
  interpretation: SajuLifetimeAiInterpretation;
  report: SajuLifetimeReport;
  reportText: string;
  stageResults: Array<{
    key: 'full';
    source: AiGenerationSource;
    fallbackReason: AiFallbackReason | null;
    errorMessage: string | null;
    durationMs: number;
  }>;
}

const SECTION_META = [
  { key: 'coreIdentity', label: '원국의 본질' },
  { key: 'strengthBalance', label: '강약 / 오행 균형' },
  { key: 'patternAndYongsin', label: '격국 / 용신' },
  { key: 'relationshipPattern', label: '관계 패턴' },
  { key: 'wealthStyle', label: '재물 감각' },
  { key: 'careerDirection', label: '직업 방향' },
  { key: 'healthRhythm', label: '건강 리듬' },
  { key: 'majorLuckTimeline', label: '대운 10년 흐름 지도' },
  { key: 'lifetimeStrategy', label: '평생 활용 전략' },
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

function FactCard({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-4">
      <div className="app-caption text-[var(--app-gold-soft)]">{label}</div>
      <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">{body}</p>
    </div>
  );
}

function LifetimeSectionBody({
  sectionKey,
  interpretation,
  report,
}: {
  sectionKey: (typeof SECTION_META)[number]['key'];
  interpretation: SajuLifetimeAiInterpretation;
  report: SajuLifetimeReport;
}) {
  switch (sectionKey) {
    case 'coreIdentity':
      return (
        <>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            <FactCard label="반응 방식" body={report.coreIdentity.reactionStyle} />
            <FactCard label="강점 환경" body={report.coreIdentity.bestEnvironment} />
            <FactCard label="무너지기 쉬운 패턴" body={report.coreIdentity.weakPattern} />
          </div>
          <details className="group mt-5">
            <summary className="cursor-pointer list-none rounded-xl border border-[var(--app-line)] px-4 py-3 text-sm font-semibold text-[var(--app-copy)]">
              계산 근거 펼치기
            </summary>
            <div className="mt-3 grid gap-2">
              {report.coreIdentity.basis.map((line) => (
                <div key={line} className="rounded-xl bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm leading-7 text-[var(--app-copy-muted)]">
                  {line}
                </div>
              ))}
            </div>
          </details>
        </>
      );
    case 'strengthBalance':
      return (
        <>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <FactCard label="강한 축" body={report.strengthBalance.strongAxis} />
            <FactCard label="약한 축" body={report.strengthBalance.weakAxis} />
            <FactCard label="에너지 소모 방식" body={report.strengthBalance.energyDrain} />
            <FactCard label="회복 방식" body={report.strengthBalance.recovery} />
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {report.strengthBalance.elementHighlights.map((item) => (
              <div key={item} className="rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm text-[var(--app-copy)]">
                {item}
              </div>
            ))}
          </div>
          <details className="group mt-5">
            <summary className="cursor-pointer list-none rounded-xl border border-[var(--app-line)] px-4 py-3 text-sm font-semibold text-[var(--app-copy)]">
              생활 균형 포인트 보기
            </summary>
            <div className="mt-3 flex flex-wrap gap-2">
              {report.strengthBalance.balanceGuide.map((item) => (
                <span key={item} className="rounded-full border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-3 py-1 text-xs leading-6 text-[var(--app-copy)]">
                  {item}
                </span>
              ))}
            </div>
          </details>
        </>
      );
    case 'patternAndYongsin':
      return (
        <>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            <FactCard label="삶의 역할" body={report.patternAndYongsin.patternRole} />
            <FactCard label="보완 방향" body={report.patternAndYongsin.yongsinDirection} />
            <FactCard label="평생 선택 기준" body={report.patternAndYongsin.choiceRule} />
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <div className="rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-4">
              <div className="app-caption text-[var(--app-gold-soft)]">살려야 할 기운</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {report.patternAndYongsin.supportSymbols.map((item) => (
                  <span key={item} className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-100">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-4">
              <div className="app-caption text-[var(--app-gold-soft)]">조절할 기운</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {report.patternAndYongsin.cautionSymbols.map((item) => (
                  <span key={item} className="rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-xs text-rose-100">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <details className="group mt-5">
            <summary className="cursor-pointer list-none rounded-xl border border-[var(--app-line)] px-4 py-3 text-sm font-semibold text-[var(--app-copy)]">
              희신 / 기신 / 계산 상세 보기
            </summary>
            <div className="mt-3 grid gap-2">
              {report.patternAndYongsin.detailLines.map((line) => (
                <div key={line} className="rounded-xl bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm leading-7 text-[var(--app-copy-muted)]">
                  {line}
                </div>
              ))}
            </div>
          </details>
        </>
      );
    case 'relationshipPattern':
      return (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <FactCard label="거리감" body={report.relationshipPattern.distanceStyle} />
          <FactCard label="감정 표현 방식" body={report.relationshipPattern.expressionStyle} />
          <FactCard label="갈등 지점" body={report.relationshipPattern.conflictTriggers} />
          <FactCard label="오래 가는 법" body={report.relationshipPattern.longevityGuide} />
        </div>
      );
    case 'wealthStyle':
      return (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <FactCard label="돈을 버는 방식" body={report.wealthStyle.earningStyle} />
          <FactCard label="돈을 지키는 방식" body={report.wealthStyle.keepingStyle} />
          <FactCard label="지출 실수 패턴" body={report.wealthStyle.spendingMistakes} />
          <FactCard label="맞는 운영 스타일" body={report.wealthStyle.operatingStyle} />
        </div>
      );
    case 'careerDirection':
      return (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <FactCard label="잘 맞는 일의 구조" body={report.careerDirection.fitStructure} />
          <FactCard label="버티는 일 vs 빛나는 일" body={report.careerDirection.endureVsShine} />
          <FactCard label="독립 / 조직 적성" body={report.careerDirection.independenceStyle} />
          <FactCard label="인정받는 방식" body={report.careerDirection.recognitionStyle} />
        </div>
      );
    case 'healthRhythm':
      return (
        <>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <FactCard label="무너질 때 신호" body={report.healthRhythm.warningSignals} />
            <FactCard label="회복 루틴" body={report.healthRhythm.recoveryRoutine} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {report.healthRhythm.habitPoints.map((item) => (
              <span key={item} className="rounded-full border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-3 py-1 text-xs leading-6 text-[var(--app-copy)]">
                {item}
              </span>
            ))}
          </div>
        </>
      );
    case 'majorLuckTimeline':
      return (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {report.majorLuckTimeline.cycles.map((cycle) => (
            <article key={`${cycle.ageLabel}-${cycle.ganzi}`} className="rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-[var(--app-line)] bg-[rgba(255,255,255,0.04)] text-[var(--app-copy-soft)]">
                  {cycle.ageLabel}
                </Badge>
                <Badge
                  className={
                    cycle.phase === '확장기'
                      ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100'
                      : cycle.phase === '정리기'
                        ? 'border-sky-400/20 bg-sky-400/10 text-sky-100'
                        : 'border-[var(--app-gold)]/25 bg-[var(--app-gold)]/12 text-[var(--app-gold-text)]'
                  }
                >
                  {cycle.phase}
                </Badge>
                {cycle.isCurrent ? (
                  <Badge className="border-[var(--app-gold)]/25 bg-[var(--app-gold)]/12 text-[var(--app-gold-text)]">
                    현재 대운
                  </Badge>
                ) : null}
              </div>
              <h4 className="mt-3 text-lg font-semibold text-[var(--app-ivory)]">{cycle.ganzi}</h4>
              <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">{cycle.summary}</p>
              <p className="mt-3 text-sm leading-7 text-[var(--app-copy-muted)]">{cycle.task}</p>
            </article>
          ))}
        </div>
      );
    case 'lifetimeStrategy':
      return (
        <>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <FactCard label="잘 될 때의 태도" body={report.lifetimeStrategy.useWhenStrong.join(' ')} />
            <FactCard label="흔들릴 때의 방어법" body={report.lifetimeStrategy.defendWhenShaken.join(' ')} />
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {interpretation.rememberRules.map((item) => (
              <div key={item} className="rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm leading-7 text-[var(--app-copy)]">
                {item}
              </div>
            ))}
          </div>
        </>
      );
  }
}

export default function LifetimeReportPanel({ slug, targetYear }: Props) {
  const { counselorId } = usePreferredCounselor();
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [data, setData] = useState<LifetimeInterpretationResponse | null>(null);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setState('loading');
      setError('');

      try {
        const response = await fetch('/api/interpret/lifetime', {
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
          | LifetimeInterpretationResponse
          | { error?: string }
          | null;

        if (!response.ok || !payload || !('ok' in payload) || payload.ok !== true) {
          setError(payload && 'error' in payload && payload.error ? payload.error : '평생 리포트를 불러오지 못했습니다.');
          setState('error');
          return;
        }

        setData(payload);
        setState('ready');
      } catch (fetchError) {
        if ((fetchError as Error).name === 'AbortError') return;
        setError('평생 리포트를 불러오는 중 오류가 발생했습니다.');
        setState('error');
      }
    }

    void load();

    return () => controller.abort();
  }, [slug, targetYear, counselorId, reloadToken]);

  const updatedAtLabel = useMemo(() => formatUpdatedAt(undefined), []);

  if (state === 'loading') {
    return (
      <section id="lifetime-report" className="moon-lunar-panel p-6 sm:p-7">
        <div className="app-starfield" />
        <div className="app-caption">평생 소장 리포트 생성 중</div>
        <h2 className="mt-4 font-[var(--font-heading)] text-3xl text-[var(--app-ivory)]">
          원국 중심 기준서를 정리하고 있습니다
        </h2>
        <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
          일간, 강약, 격국, 용신, 대운 10년 흐름을 묶어 평생 참고할 수 있는 기준서로 재구성하고 있습니다.
        </p>
        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={`lifetime-loading-${index}`}
              className="h-28 animate-pulse rounded-[20px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.04)]"
            />
          ))}
        </div>
      </section>
    );
  }

  if (state === 'error' || !data) {
    return (
      <section id="lifetime-report" className="app-panel space-y-4 border-rose-400/20 p-6">
        <div className="app-caption text-rose-200/80">평생 리포트 오류</div>
        <p className="font-medium text-rose-200">{error || '평생 리포트를 불러오지 못했습니다.'}</p>
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
  const report = data.report;

  return (
    <section id="lifetime-report" className="space-y-6">
      <section className="moon-lunar-panel p-6 sm:p-7">
        <div className="app-starfield" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="app-caption">평생 소장 리포트</div>
            <h2 className="mt-4 font-[var(--font-heading)] text-3xl text-[var(--app-ivory)]">
              내 사주의 원본 해설서를 평생 기준서로 정리했습니다
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--app-copy-muted)]">
              일간, 강약, 격국, 용신, 대운의 판정을 먼저 고정하고, 이 리포트는 그 구조를 평생 기준서 문장으로만 풀어냅니다.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-[var(--app-gold)]/28 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]">
              {data.counselorId === 'male' ? '달빛 남선생 기준' : '달빛 여선생 기준'}
            </Badge>
            <Badge className="border-[var(--app-line)] bg-[var(--app-surface-strong)] text-[var(--app-copy-muted)]">
              {data.source === 'openai' ? 'OpenAI 생성' : '근거 기반 fallback'}
            </Badge>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-[var(--app-copy-soft)]">
          {updatedAtLabel ? <span>최근 생성: {updatedAtLabel}</span> : null}
          {data.model ? <span>모델: {data.model}</span> : null}
          <span>생성 시간: {data.generationMs}ms</span>
          <Button
            onClick={() => setReloadToken((value) => value + 1)}
            variant="outline"
            className="h-8 rounded-full border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-3 text-xs text-[var(--app-copy)] hover:bg-[rgba(255,255,255,0.06)]"
          >
            다시 생성
          </Button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[24px] border border-[var(--app-gold)]/18 bg-[rgba(210,176,114,0.08)] px-5 py-5">
            <div className="space-y-3">{renderParagraphs(interpretation.opening)}</div>
            <div className="mt-5 rounded-[18px] border border-[var(--app-line)] bg-[rgba(7,9,16,0.28)] px-4 py-4">
              <div className="app-caption text-[var(--app-gold-soft)]">이 사주의 평생 기준</div>
              <p className="mt-3 text-sm leading-8 text-[var(--app-copy)]">{interpretation.lifetimeRule}</p>
            </div>
          </div>
          <div className="rounded-[24px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-5 py-5">
            <div className="app-caption text-[var(--app-gold-soft)]">사주명반</div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                ['년주', report.pillars.year],
                ['월주', report.pillars.month],
                ['일주', report.pillars.day],
                ['시주', report.pillars.hour ?? '미입력'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-4 text-center">
                  <div className="app-caption">{label}</div>
                  <div className="mt-3 text-2xl font-semibold text-[var(--app-ivory)]">{value}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 grid gap-2">
              {interpretation.keywords.map((keyword) => (
                <div key={keyword} className="rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm leading-7 text-[var(--app-copy)]">
                  {keyword}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6">
          <GroundingKasiSummary
            grounding={data.grounding}
            kasiComparison={data.kasiComparison}
            title="이 평생 리포트가 참고한 실제 계산 근거"
          />
        </div>
      </section>

      {SECTION_META.map((section) => {
        const reportSection = report[section.key];

        return (
          <section key={section.key} className="app-panel p-6 sm:p-7">
            <div className="app-caption">{section.label}</div>
            <h3 className="mt-3 font-[var(--font-heading)] text-2xl text-[var(--app-ivory)]">
              {reportSection.headline}
            </h3>
            <div className="mt-4 rounded-[20px] border border-[var(--app-gold)]/18 bg-[rgba(210,176,114,0.08)] px-5 py-5">
              <div className="space-y-3">
                {renderParagraphs(interpretation.sections[section.key])}
              </div>
            </div>
            <LifetimeSectionBody
              sectionKey={section.key}
              interpretation={interpretation}
              report={report}
            />
          </section>
        );
      })}

      <section className="rounded-[28px] border border-[var(--app-plum)]/30 bg-[rgba(127,92,176,0.12)] p-6 sm:p-7">
        <div className="app-caption text-[var(--app-plum)]">부록: 올해 요약</div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge className="border-[var(--app-plum)]/30 bg-[rgba(127,92,176,0.14)] text-[var(--app-copy)]">
            {report.yearlyAppendix.yearLabel}
          </Badge>
          <Badge className="border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] text-[var(--app-copy-soft)]">
            {report.yearlyAppendix.yearGanji}
          </Badge>
        </div>
        <h3 className="mt-4 font-[var(--font-heading)] text-2xl text-[var(--app-ivory)]">
          {report.yearlyAppendix.headline}
        </h3>
        <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
          {report.yearlyAppendix.oneLineSummary}
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <FactCard label="상반기" body={report.yearlyAppendix.firstHalf} />
          <FactCard label="하반기" body={report.yearlyAppendix.secondHalf} />
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <FactCard label="잘 풀리는 시기" body={report.yearlyAppendix.goodPeriods.join(' ')} />
          <FactCard label="조심할 시기" body={report.yearlyAppendix.cautionPeriods.join(' ')} />
          <FactCard label="행동 조언" body={report.yearlyAppendix.actionAdvice.join(' ')} />
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={report.yearlyAppendix.ctaAnchor}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-gold)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-bright)]"
          >
            {report.yearlyAppendix.ctaLabel}
          </Link>
        </div>
      </section>
    </section>
  );
}
