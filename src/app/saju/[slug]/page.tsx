import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type {
  SajuCurrentLuck,
  SajuLuckDescriptor,
  SajuMajorLuckCycle,
  SajuPillar,
} from '@/domain/saju/engine/saju-data-v1';
import { SajuAiInterpretationPanel } from '@/components/ai/saju-ai-interpretation-panel';
import { ClassicEvidencePanel } from '@/components/classics/classic-evidence-panel';
import { Badge } from '@/components/ui/badge';
import DetailUnlock from '@/components/detail-unlock';
import SajuScreenNav from '@/features/saju-detail/saju-screen-nav';
import SiteHeader from '@/features/shared-navigation/site-header';
import { ELEMENT_INFO } from '@/lib/saju/elements';
import type { Branch, Element, Stem } from '@/lib/saju/types';
import { isReadingId, resolveReading } from '@/lib/saju/readings';
import { buildSajuReport, FOCUS_TOPIC_META } from '@/domain/saju/report';
import type { ReportEvidenceCard, ReportScore, SajuReport } from '@/domain/saju/report';
import { buildFallbackInterpretation } from '@/server/ai/saju-interpretation';
import { cn } from '@/lib/utils';
import { AppPage, AppShell } from '@/shared/layout/app-shell';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ topic?: string }>;
}

export async function generateMetadata(_: Props): Promise<Metadata> {
  return {
    title: '사주 분석 결과',
    description: '개인 사주 분석 결과 페이지입니다.',
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  };
}

function formatBirthSummary(input: {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  gender?: 'male' | 'female';
  birthLocation?: { label: string } | null;
  solarTimeMode?: string;
}) {
  const minuteLabel =
    input.hour !== undefined && input.minute !== undefined
      ? ` ${String(input.minute).padStart(2, '0')}분`
      : '';
  const timeLabel = input.hour !== undefined ? `${input.hour}시${minuteLabel} 기준` : '태어난 시간 미입력';
  const genderLabel = input.gender
    ? input.gender === 'male'
      ? '남성'
      : '여성'
    : '성별 미선택';
  const locationLabel = input.birthLocation?.label
    ? `${input.birthLocation.label}${input.solarTimeMode === 'longitude' ? ' 경도 보정' : ''}`
    : '출생 지역 미입력';
  return `${input.year}년 ${input.month}월 ${input.day}일 · ${timeLabel} · ${genderLabel} · ${locationLabel}`;
}

const EVIDENCE_CARD_FULL_WIDTH_THRESHOLD = 320;

function getCompactTextLength(value: string | null | undefined) {
  return (value ?? '').replace(/\s+/g, '').length;
}

function shouldEvidenceCardUseFullRow(card: ReportEvidenceCard) {
  const textLength = [
    card.title,
    card.body,
    card.plainSummary,
    card.technicalSummary,
    ...card.details,
    ...(card.practicalActions ?? []),
    ...(card.explainers?.map((item) => `${item.term}${item.hanja ?? ''}${item.meaning}`) ?? []),
  ].reduce((total, item) => total + getCompactTextLength(item), 0);

  const supportingItemCount =
    card.details.length + (card.practicalActions?.length ?? 0) + (card.explainers?.length ?? 0);

  return textLength >= EVIDENCE_CARD_FULL_WIDTH_THRESHOLD || supportingItemCount >= 8;
}

function formatCurrentLuckTitle(currentLuck: SajuCurrentLuck | null) {
  if (!currentLuck) return '현재 운 계산 준비 중';

  const parts = [
    currentLuck.currentMajorLuck?.ganzi ? `대운 ${currentLuck.currentMajorLuck.ganzi}` : null,
    currentLuck.saewoon?.ganzi ? `세운 ${currentLuck.saewoon.ganzi}` : null,
    currentLuck.wolwoon?.ganzi ? `월운 ${currentLuck.wolwoon.ganzi}` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(' · ') : '현재 운 계산 준비 중';
}

function getTimelineItem(report: SajuReport, label: string) {
  return report.timeline.find((item) => item.label === label) ?? null;
}

const SCORE_CARD_VISUALS: Record<
  ReportScore['key'],
  {
    panel: string;
    caption: string;
    score: string;
    bar: string;
    glow: string;
  }
> = {
  overall: {
    panel: 'border-amber-300/34 bg-[linear-gradient(145deg,rgba(245,158,11,0.2),rgba(18,20,33,0.94))]',
    caption: 'text-amber-200',
    score: 'text-amber-50',
    bar: 'bg-amber-300',
    glow: 'bg-amber-300/18',
  },
  love: {
    panel: 'border-rose-300/30 bg-[linear-gradient(145deg,rgba(244,63,94,0.16),rgba(18,20,33,0.94))]',
    caption: 'text-rose-200',
    score: 'text-rose-50',
    bar: 'bg-rose-300',
    glow: 'bg-rose-300/16',
  },
  wealth: {
    panel: 'border-emerald-300/30 bg-[linear-gradient(145deg,rgba(16,185,129,0.17),rgba(18,20,33,0.94))]',
    caption: 'text-emerald-200',
    score: 'text-emerald-50',
    bar: 'bg-emerald-300',
    glow: 'bg-emerald-300/15',
  },
  career: {
    panel: 'border-sky-300/30 bg-[linear-gradient(145deg,rgba(14,165,233,0.16),rgba(18,20,33,0.94))]',
    caption: 'text-sky-200',
    score: 'text-sky-50',
    bar: 'bg-sky-300',
    glow: 'bg-sky-300/15',
  },
  relationship: {
    panel: 'border-fuchsia-300/26 bg-[linear-gradient(145deg,rgba(217,70,239,0.13),rgba(18,20,33,0.94))]',
    caption: 'text-fuchsia-200',
    score: 'text-fuchsia-50',
    bar: 'bg-fuchsia-300',
    glow: 'bg-fuchsia-300/14',
  },
};

function formatCurrentLuckBody(currentLuck: SajuCurrentLuck | null, report?: SajuReport) {
  if (!currentLuck) {
    return '현재 대운과 세운, 월운을 아직 계산하지 못했습니다. 운 계산이 연결되면 이 자리에 현재 시점 해석이 표시됩니다.';
  }

  const enriched = report
    ? [
        getTimelineItem(report, '대운 흐름')?.body,
        getTimelineItem(report, '이번 달')?.body,
      ].filter(Boolean)
    : [];

  if (enriched.length > 0) return enriched.join(' ');

  const notes = [
    ...(currentLuck.currentMajorLuck?.notes ?? []).slice(0, 2),
    ...(currentLuck.saewoon?.notes ?? []).slice(0, 1),
    ...(currentLuck.wolwoon?.notes ?? []).slice(0, 1),
  ];

  return notes.length > 0
    ? notes.join(' ')
    : '현재 운 정보는 계산되었지만 설명 문장은 아직 비어 있습니다.';
}

const STEM_READINGS: Record<Stem, string> = {
  '甲': '갑',
  '乙': '을',
  '丙': '병',
  '丁': '정',
  '戊': '무',
  '己': '기',
  '庚': '경',
  '辛': '신',
  '壬': '임',
  '癸': '계',
};

const BRANCH_READINGS: Record<Branch, string> = {
  '子': '자',
  '丑': '축',
  '寅': '인',
  '卯': '묘',
  '辰': '진',
  '巳': '사',
  '午': '오',
  '未': '미',
  '申': '신',
  '酉': '유',
  '戌': '술',
  '亥': '해',
};

function formatStemHint(pillar: SajuPillar) {
  return `${pillar.stem} · ${STEM_READINGS[pillar.stem]} · ${pillar.yinYang}${ELEMENT_INFO[pillar.stemElement].name.split(' ')[0]}`;
}

function formatBranchHint(pillar: SajuPillar) {
  return `${pillar.branch} · ${BRANCH_READINGS[pillar.branch]} · ${ELEMENT_INFO[pillar.branchElement].name.split(' ')[0]}`;
}

function formatHiddenStemHint(stem: Stem, element: Element) {
  return `${stem} · ${STEM_READINGS[stem]} · ${ELEMENT_INFO[element].name.split(' ')[0]}`;
}

function HanjaHint({
  character,
  hint,
  color,
  className,
}: {
  character: string;
  hint: string;
  color: string;
  className: string;
}) {
  return (
    <span
      className="group relative inline-flex cursor-help items-center justify-center outline-none"
      tabIndex={0}
      title={hint}
      aria-label={hint}
    >
      <span className={className} style={{ color }}>
        {character}
      </span>
      <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[var(--app-line)] bg-[rgba(8,10,18,0.96)] px-3 py-1 text-[11px] font-medium text-[var(--app-ivory)] opacity-0 shadow-[0_12px_32px_rgba(0,0,0,0.3)] transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
        {hint}
      </span>
    </span>
  );
}

function formatLuckDescriptorTitle(label: string, descriptor: SajuLuckDescriptor | null) {
  if (!descriptor) return `${label} 계산 준비 중`;

  const dateLabel =
    descriptor.month !== null
      ? `${descriptor.year}년 ${descriptor.month}월`
      : descriptor.year !== null
        ? `${descriptor.year}년`
        : null;

  return [descriptor.ganzi, dateLabel].filter(Boolean).join(' · ');
}

function formatLuckDescriptorBody(descriptor: SajuLuckDescriptor | null) {
  if (!descriptor) return '운 정보가 아직 비어 있습니다.';

  return descriptor.notes.length > 0
    ? descriptor.notes.join(' ')
    : '기본 간지 계산은 완료되었고 설명 문장은 아직 비어 있습니다.';
}

function formatMajorLuckWindow(cycle: SajuMajorLuckCycle) {
  if (cycle.startAge === null || cycle.endAge === null) return '시작 나이 계산 준비 중';
  return `${cycle.startAge}세 ~ ${cycle.endAge}세`;
}

function formatHiddenStems(pillar: SajuPillar) {
  if (pillar.hiddenStems.length === 0) return null;
  return pillar.hiddenStems.map((item) => item.stem).join(' · ');
}

function getPrimaryClassicEvidenceConcept(report: ReturnType<typeof buildSajuReport>) {
  const primaryEvidence =
    report.evidenceCards.find((card) => card.key === 'yongsin') ?? report.evidenceCards[0];

  switch (primaryEvidence?.key) {
    case 'yongsin':
      return '용신';
    case 'pattern':
      return '격국';
    case 'strength':
      return '강약';
    case 'relations':
      return '합충';
    case 'gongmang':
      return '공망';
    case 'specialSals':
      return '신살';
    default:
      return '용신';
  }
}

export default async function SajuResultPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { topic } = await searchParams;
  const reading = await resolveReading(slug);

  if (!reading) notFound();

  const { input, sajuData } = reading;
  const report = buildSajuReport(input, sajuData, topic);

  const pillars = [
    { label: '년주', pillar: sajuData.pillars.year },
    { label: '월주', pillar: sajuData.pillars.month },
    { label: '일주', pillar: sajuData.pillars.day },
    { label: '시주', pillar: sajuData.pillars.hour },
  ];
  const majorLuckPreview = sajuData.majorLuck?.slice(0, 6) ?? [];
  const currentMajorIndex = sajuData.currentLuck?.currentMajorLuck?.index ?? null;
  const classicEvidenceConcept = getPrimaryClassicEvidenceConcept(report);
  const currentMajorFlow = getTimelineItem(report, '대운 흐름');

  return (
    <AppShell header={<SiteHeader />}>
      <AppPage className="space-y-6">
        <SajuScreenNav slug={slug} current="result" />

        <section className="moon-result-hero p-6 sm:p-7">
          <div className="grid gap-8 lg:grid-cols-[1.18fr_0.82fr] lg:items-start">
            <div className="self-start">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-[var(--app-gold)]/25 bg-[var(--app-gold)]/10 text-[var(--app-gold-soft)]">
                  {report.focusBadge}
                </Badge>
                <Badge className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]">
                  개인 결과 페이지 · 검색 제외
                </Badge>
              </div>
              <p className="app-caption mt-5">{formatBirthSummary(input)}</p>
              <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-[var(--app-ivory)] sm:text-4xl">
                {report.headline}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--app-copy-muted)] sm:text-base">
                {report.dayMasterSummary}
              </p>
              <div className="mt-5 grid max-w-2xl gap-3">
                {report.summaryHighlights.map((summary) => (
                  <p
                    key={summary}
                    className="rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-3 text-sm leading-8 text-[var(--app-copy)] sm:text-base"
                  >
                    {summary}
                  </p>
                ))}
              </div>
            </div>

            <div className="grid self-start gap-4 lg:border-l lg:border-[var(--app-line)] lg:pl-6">
              <div className="moon-lunar-panel p-5">
                <div className="app-caption">사주 원국</div>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <div>
                    <div className="font-[var(--font-heading)] text-2xl font-semibold text-[var(--app-gold-text)]">
                      {sajuData.dayMaster.stem} 일간
                    </div>
                    <p className="mt-1 text-sm text-[var(--app-copy-muted)]">
                      네 기둥 중 일주를 중심으로 오늘의 해석을 엮습니다.
                    </p>
                  </div>
                  <Badge className="border-[var(--app-gold)]/28 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]">
                    원국
                  </Badge>
                </div>
                <div className="moon-saju-grid mt-5">
                  {pillars.map(({ label, pillar }) => (
                    <div key={label} className="moon-saju-pillar" data-day={label === '일주'}>
                      <div className="text-xs text-[var(--app-copy-soft)]">{label.replace('주', '')}</div>
                      {pillar ? (
                        <>
                          <div className="mt-2">
                            <HanjaHint
                              character={pillar.stem}
                              hint={formatStemHint(pillar)}
                              color={ELEMENT_INFO[pillar.stemElement].color}
                              className="font-[var(--font-heading)] text-[2rem] font-semibold leading-none sm:text-[2.25rem]"
                            />
                          </div>
                          <div className="mt-1">
                            <HanjaHint
                              character={pillar.branch}
                              hint={formatBranchHint(pillar)}
                              color={ELEMENT_INFO[pillar.branchElement].color}
                              className="font-[var(--font-heading)] text-[1.8rem] font-semibold leading-none sm:text-[2rem]"
                            />
                          </div>
                        </>
                      ) : (
                        <div className="mt-5 text-xs text-[var(--app-copy-soft)]">시간 미입력</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-[var(--app-gold)]/18 bg-[var(--app-gold)]/8 p-5">
                <div className="text-sm text-[var(--app-gold-soft)]">날짜 포인트</div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-[var(--app-copy-soft)]">좋은 날짜</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {report.luckyDates.map((date) => (
                        <span key={date} className="rounded-full border border-[var(--app-jade)]/25 bg-[var(--app-jade)]/10 px-3 py-1 text-sm text-[var(--app-jade)]">
                          {date}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-[var(--app-copy-soft)]">조심할 날짜</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {report.cautionDates.map((date) => (
                        <span key={date} className="rounded-full border border-[var(--app-coral)]/25 bg-[var(--app-coral)]/10 px-3 py-1 text-sm text-[var(--app-coral)]">
                          {date}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="app-panel p-6 sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="app-caption">분야별 흐름</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--app-ivory)]">
                오늘, 연애, 재물, 직장, 관계를 한 흐름 안에서 이어 봅니다.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[var(--app-copy-muted)]">
              위에서는 오늘의 큰 결을 보고, 아래에서는 분야를 고르면 실행 포인트와 주의 포인트가 바로 바뀝니다.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {report.scores.map((score) => {
              const isFocusedScore = report.focusScoreKey === score.key;
              const visual = SCORE_CARD_VISUALS[score.key];
              const topicKey = score.key === 'overall' ? 'today' : score.key;

              return (
                <Link
                  key={score.key}
                  href={`/saju/${slug}?topic=${topicKey}`}
                  scroll={false}
                  aria-current={isFocusedScore ? 'page' : undefined}
                  data-selected={isFocusedScore ? 'true' : 'false'}
                  className={cn(
                    'moon-topic-score-card group relative overflow-hidden rounded-[24px] border p-5 shadow-[0_18px_48px_rgba(0,0,0,0.22)]',
                    visual.panel,
                    isFocusedScore ? 'ring-1 ring-[var(--app-gold)]/45' : ''
                  )}
                >
                  <div className={cn('pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full blur-3xl', visual.glow)} />
                  <div className="relative">
                    <div className={cn('text-xs font-semibold uppercase tracking-[0.2em]', visual.caption)}>
                      {score.label}
                    </div>
                    <div className="mt-3 flex items-end gap-2">
                      <span className={cn('text-4xl font-semibold', visual.score)}>{score.score}</span>
                      <span className="pb-1 text-sm text-[var(--app-copy-soft)]">/ 100</span>
                    </div>
                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className={cn('h-full rounded-full', visual.bar)} style={{ width: `${score.score}%` }} />
                    </div>
                    <p className="mt-4 text-sm leading-7 text-[var(--app-copy)]">{score.summary}</p>
                    <div className="mt-5 flex items-center justify-between gap-3 text-xs">
                      <span
                        className={cn(
                          'rounded-full border px-2.5 py-1 transition-colors',
                          isFocusedScore
                            ? 'border-[var(--app-gold)]/35 bg-[var(--app-gold)]/14 text-[var(--app-gold-text)]'
                            : 'border-white/10 bg-white/5 text-[var(--app-copy-soft)] group-hover:border-white/20 group-hover:text-[var(--app-ivory)]'
                        )}
                      >
                        {isFocusedScore ? '현재 해석' : '눌러서 보기'}
                      </span>
                      <span
                        className={cn(
                          'text-sm transition-all duration-200',
                          isFocusedScore
                            ? 'translate-x-0 text-[var(--app-gold-text)]'
                            : 'text-[var(--app-copy-soft)] group-hover:translate-x-1 group-hover:text-[var(--app-ivory)]'
                        )}
                      >
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="moon-lunar-panel mt-4 overflow-hidden rounded-[24px] border-[var(--app-gold)]/22">
            <div className="grid gap-0 lg:grid-cols-2">
              <div className="p-4 sm:p-5">
                <div className="app-caption">{report.focusLabel} 실행 포인트</div>
                <div className="mt-2 text-lg font-semibold leading-7 text-[var(--app-ivory)]">
                  {report.primaryAction.title}
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">{report.primaryAction.description}</p>
              </div>
              <div className="border-t border-[var(--app-line)] p-4 sm:p-5 lg:border-l lg:border-t-0">
                <div className="app-caption">{report.focusLabel} 주의 포인트</div>
                <div className="mt-2 text-lg font-semibold leading-7 text-[var(--app-ivory)]">
                  {report.cautionAction.title}
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">{report.cautionAction.description}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="moon-lunar-panel p-6 sm:p-7">
          <div className="app-starfield" />
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="app-caption">연간 리포트 진입</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--app-ivory)]">
                2026 신년 리포트를 월별 흐름까지 길게 읽고 싶다면 여기서 이어집니다.
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--app-copy-muted)]">
                총론, 상반기·하반기, 일·재물·연애·관계·건강·이동 흐름, 12개월 요약까지 한 번에 정리한
                프리미엄 리포트를 심층 리포트 안에서 확인할 수 있습니다.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/saju/${slug}/premium#yearly-report`}
                className="rounded-full border border-[var(--app-gold)]/35 bg-[var(--app-gold)]/14 px-5 py-3 text-sm font-semibold text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/20"
              >
                2026 신년 리포트 보기
              </Link>
              <span className="text-xs text-[var(--app-copy-soft)]">
                심층 리포트 탭에서 열립니다
              </span>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {report.timeline.map((item) => (
            <article key={item.label} className="app-panel p-6">
              <div className="app-caption">{item.label}</div>
              <h2 className="mt-3 text-2xl font-semibold leading-8 text-[var(--app-ivory)]">{item.headline}</h2>
              <p className="app-body-copy mt-4 text-sm">{item.body}</p>
              {item.points && item.points.length > 0 ? (
                <div className="mt-5 grid gap-2">
                  {item.points.map((point) => (
                    <div
                      key={`${item.label}-${point}`}
                      className="rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-3 py-2 text-sm leading-7 text-[var(--app-copy)]"
                    >
                      {point}
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </section>

        <div>
          <DetailUnlock
            slug={slug}
            referenceChildren={
              <section className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="app-caption">왜 이렇게 읽는지</div>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--app-ivory)]">
                      처음에는 쉬운 풀이만 읽고, 필요할 때만 전문 근거를 펼쳐보세요.
                    </h2>
                  </div>
                  <p className="max-w-xl text-sm leading-7 text-[var(--app-copy-muted)]">
                    강약, 격국, 용신과 합충·공망·신살은 해석의 배경입니다. 카드마다 먼저 쉬운 설명을 보여드리고,
                    자세한 계산과 용어는 아래에 접어두었습니다.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {report.evidenceCards.map((card) => (
                    <article
                      key={card.key}
                      className={cn(
                        'moon-orbit-card p-5',
                        shouldEvidenceCardUseFullRow(card) ? 'md:col-span-2' : undefined
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="app-caption">{card.label}</div>
                        <span className="rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-2.5 py-1 text-[11px] text-[var(--app-copy-soft)]">
                          {card.confidence}
                        </span>
                      </div>
                      <h3 className="mt-3 text-xl font-semibold leading-8 text-[var(--app-ivory)]">{card.title}</h3>
                      <p className="mt-3 text-sm leading-8 text-[var(--app-copy)]">
                        {card.plainSummary || card.body}
                      </p>

                      <details className="mt-4 rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-3">
                        <summary className="cursor-pointer list-none text-sm font-medium text-[var(--app-gold-text)]">
                          전문 근거 펼치기
                        </summary>

                        <div className="mt-4 space-y-4">
                          {card.technicalSummary ? (
                            <p className="text-sm leading-7 text-[var(--app-copy-muted)]">{card.technicalSummary}</p>
                          ) : null}

                          <p className="app-body-copy text-sm">{card.body}</p>

                          {card.explainers && card.explainers.length > 0 ? (
                            <div className="border-t border-[var(--app-line)] pt-4">
                              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-gold-soft)]">
                                한자 풀이
                              </div>
                              <div className="mt-3 grid gap-2">
                                {card.explainers.map((item) => (
                                  <div key={`${card.key}-${item.term}`} className="text-sm leading-7 text-[var(--app-copy)]">
                                    <span className="font-semibold text-[var(--app-ivory)]">
                                      {item.term}{item.hanja ? `(${item.hanja})` : ''}
                                    </span>
                                    <span className="text-[var(--app-copy-soft)]"> · {item.meaning}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}

                          {card.practicalActions && card.practicalActions.length > 0 ? (
                            <div className="border-t border-[var(--app-line)] pt-4">
                              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-gold-soft)]">
                                생활 적용
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {card.practicalActions.map((action) => (
                                  <span
                                    key={`${card.key}-${action}`}
                                    className="rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-3 py-1 text-xs leading-5 text-[var(--app-copy)]"
                                  >
                                    {action}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : null}

                          <div className="flex flex-wrap gap-2 text-[11px]">
                            {card.source.map((source) => (
                              <span
                                key={`${card.key}-${source}`}
                                className="rounded-full border border-[var(--app-gold)]/20 bg-[var(--app-gold)]/8 px-2.5 py-1 text-[var(--app-gold-soft)]"
                              >
                                {source}
                              </span>
                            ))}
                            {card.topicMapping.map((topic) => (
                              <span
                                key={`${card.key}-${topic}`}
                                className="rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-2.5 py-1 text-[var(--app-copy-soft)]"
                              >
                                {FOCUS_TOPIC_META[topic].label}
                              </span>
                            ))}
                          </div>

                          <div className="grid gap-2">
                            {card.details.map((detail, index) => (
                              <div
                                key={`${card.key}-${index}-${detail}`}
                                className="rounded-2xl border border-[var(--app-line)] bg-[rgba(8,10,18,0.32)] px-3 py-2 text-sm leading-7 text-[var(--app-copy)]"
                              >
                                {detail}
                              </div>
                            ))}
                          </div>
                        </div>
                      </details>
                    </article>
                  ))}
                </div>
              </section>
            }
          >
            <section className="app-panel p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[var(--app-ivory)]">사주 명반</h2>
                <Badge className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]">
                  사주팔자 원국
                </Badge>
              </div>

              {/* 주 레이블 */}
              <div className="mt-5 grid grid-cols-4 gap-2 text-center">
                {pillars.map(({ label }) => (
                  <div key={label} className="text-[11px] font-medium tracking-widest text-[var(--app-copy-muted)]">
                    {label}
                  </div>
                ))}
              </div>

              {/* 십신 행 */}
              <div className="mt-2 grid grid-cols-4 gap-2 text-center">
                {pillars.map(({ label, pillar }) => (
                  <div key={label} className="flex h-7 items-center justify-center">
                    {pillar ? (
                      label === '일주' ? (
                        <span className="rounded-full border border-[var(--app-gold-soft)]/30 bg-[var(--app-gold-soft)]/10 px-2 py-0.5 text-[11px] text-[var(--app-gold-soft)]">
                          일간
                        </span>
                      ) : (
                        <span className="rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-2 py-0.5 text-[11px] text-[var(--app-copy-soft)]">
                          {pillar.stemTenGod}
                        </span>
                      )
                    ) : (
                      <span className="text-[11px] text-[var(--app-copy-muted)]">—</span>
                    )}
                  </div>
                ))}
              </div>

              {/* 천간 행 */}
              <div className="mt-1 grid grid-cols-4 gap-2 text-center">
                {pillars.map(({ label, pillar }) => (
                  <div key={label} className="flex h-16 items-center justify-center sm:h-20">
                    {pillar ? (
                      <HanjaHint
                        character={pillar.stem}
                        hint={formatStemHint(pillar)}
                        color={ELEMENT_INFO[pillar.stemElement].color}
                        className="font-[var(--font-heading)] text-[3rem] font-bold leading-none sm:text-[3.45rem]"
                      />
                    ) : (
                      <span className="text-xs text-[var(--app-copy-muted)]">시간</span>
                    )}
                  </div>
                ))}
              </div>

              {/* 지지 행 */}
              <div className="grid grid-cols-4 gap-2 border-t border-b border-[var(--app-line)] py-1 text-center">
                {pillars.map(({ label, pillar }) => (
                  <div key={label} className="flex h-16 items-center justify-center sm:h-20">
                    {pillar ? (
                      <HanjaHint
                        character={pillar.branch}
                        hint={formatBranchHint(pillar)}
                        color={ELEMENT_INFO[pillar.branchElement].color}
                        className="font-[var(--font-heading)] text-[3rem] font-bold leading-none sm:text-[3.45rem]"
                      />
                    ) : (
                      <span className="text-xs text-[var(--app-copy-muted)]">미입력</span>
                    )}
                  </div>
                ))}
              </div>

              {/* 지장간 행 (여기·중기 흐릿, 정기 강조) */}
              <div className="mt-2 grid grid-cols-4 gap-2 text-center">
                {pillars.map(({ label, pillar }) => (
                  <div key={label} className="flex min-h-[2rem] items-center justify-center">
                    {pillar && pillar.hiddenStems.length > 0 ? (
                      <div className="flex items-center gap-1">
                        {pillar.hiddenStems.map((hs, i) => {
                          const isMain = i === pillar.hiddenStems.length - 1;
                          return (
                            <span
                              key={`${hs.stem}-${i}`}
                              className={`transition-opacity ${isMain ? 'opacity-100' : 'opacity-35'}`}
                            >
                              <HanjaHint
                                character={hs.stem}
                                hint={formatHiddenStemHint(hs.stem, hs.element)}
                                color={ELEMENT_INFO[hs.element].color}
                                className="font-[var(--font-heading)] text-base font-medium leading-none"
                              />
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-[11px] text-[var(--app-copy-muted)]">{pillar ? '—' : '미입력'}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* 지지 십신 행 (정기 기준) */}
              <div className="mt-2 grid grid-cols-4 gap-2 text-center">
                {pillars.map(({ label, pillar }) => {
                  const mainHidden = pillar?.hiddenStems.at(-1);
                  return (
                    <div key={label} className="flex h-6 items-center justify-center">
                      {mainHidden?.tenGod ? (
                        <span className="rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)]/50 px-2 py-0.5 text-[11px] text-[var(--app-copy-muted)]">
                          {mainHidden.tenGod}
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {/* 오행 범례 */}
              <div className="mt-5 flex flex-wrap gap-3 border-t border-[var(--app-line)] pt-4">
                {(Object.entries(ELEMENT_INFO) as [Element, typeof ELEMENT_INFO[Element]][]).map(([el, info]) => (
                  <span key={el} className="flex items-center gap-1.5 text-xs text-[var(--app-copy-muted)]">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: info.color }} />
                    {info.name.split(' ')[0]}
                  </span>
                ))}
              </div>
            </section>

            <section className="grid gap-3">
              <div className="flex flex-col gap-3 rounded-[22px] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-4 lg:flex-row lg:items-center">
                <div className="min-w-40 text-sm font-semibold text-[var(--app-ivory)]">이번 흐름을 돕는 오행</div>
                <div className="flex flex-wrap gap-2">
                  {report.supportElements.map((element) => (
                    <span
                      key={element}
                      className="rounded-full border px-3 py-1 text-sm"
                      style={{
                        borderColor: `${ELEMENT_INFO[element].color}50`,
                        backgroundColor: `${ELEMENT_INFO[element].color}15`,
                        color: ELEMENT_INFO[element].color,
                      }}
                    >
                      {ELEMENT_INFO[element].name} · {ELEMENT_INFO[element].keywords.slice(0, 2).join(' · ')}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-[22px] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-4 lg:flex-row lg:items-center">
                <div className="min-w-40 text-sm font-semibold text-[var(--app-ivory)]">오행 분포</div>
                <div className="grid flex-1 gap-2 md:grid-cols-5">
                  {(Object.entries(sajuData.fiveElements.byElement) as [Element, (typeof sajuData.fiveElements.byElement)[Element]][]).map(([element, value]) => (
                    <div key={element} className="min-w-0">
                      <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                        <span style={{ color: ELEMENT_INFO[element].color }}>{ELEMENT_INFO[element].name.split(' ')[0]}</span>
                        <span className="text-[var(--app-copy-soft)]">{value.count}개</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[var(--app-surface-strong)]">
                        <div
                          className="h-1.5 rounded-full"
                          style={{ width: `${value.percentage}%`, backgroundColor: ELEMENT_INFO[element].color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <SajuAiInterpretationPanel
              readingId={slug}
              topic={report.focusTopic}
              focusLabel={report.focusLabel}
              fallbackInterpretation={buildFallbackInterpretation(report)}
              cacheEnabled={isReadingId(slug)}
            />

            <section className="grid gap-4 lg:grid-cols-[0.88fr_1.12fr]">
              <article className="app-panel p-6">
                <div className="app-caption">현재 운 흐름</div>
                <h2 className="mt-3 text-2xl font-semibold text-[var(--app-ivory)]">
                  {formatCurrentLuckTitle(sajuData.currentLuck)}
                </h2>
                <p className="app-body-copy mt-4 text-sm">{formatCurrentLuckBody(sajuData.currentLuck, report)}</p>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-[var(--app-copy-soft)]">현재 대운</div>
                    <div className="mt-2 text-lg font-semibold text-[var(--app-ivory)]">
                      {sajuData.currentLuck?.currentMajorLuck
                        ? `${sajuData.currentLuck.currentMajorLuck.ganzi} · ${formatMajorLuckWindow(sajuData.currentLuck.currentMajorLuck)}`
                        : '성별이 있어야 대운 방향을 확정할 수 있습니다.'}
                    </div>
                    <p className="app-body-copy mt-2 text-sm">
                      {currentMajorFlow?.body ??
                        '현재 저장본에는 대운 범위가 아직 비어 있습니다.'}
                    </p>
                    {currentMajorFlow?.points && currentMajorFlow.points.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {currentMajorFlow.points.map((point) => (
                          <span
                            key={`current-major-${point}`}
                            className="rounded-full border border-[var(--app-line)] bg-[rgba(8,10,18,0.24)] px-3 py-1 text-xs leading-5 text-[var(--app-copy-muted)]"
                          >
                            {point}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-[var(--app-copy-soft)]">세운</div>
                      <div className="mt-2 text-lg font-semibold text-[var(--app-ivory)]">
                        {formatLuckDescriptorTitle('세운', sajuData.currentLuck?.saewoon ?? null)}
                      </div>
                      <p className="app-body-copy mt-2 text-sm">
                        {formatLuckDescriptorBody(sajuData.currentLuck?.saewoon ?? null)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-[var(--app-copy-soft)]">월운</div>
                      <div className="mt-2 text-lg font-semibold text-[var(--app-ivory)]">
                        {formatLuckDescriptorTitle('월운', sajuData.currentLuck?.wolwoon ?? null)}
                      </div>
                      <p className="app-body-copy mt-2 text-sm">
                        {formatLuckDescriptorBody(sajuData.currentLuck?.wolwoon ?? null)}
                      </p>
                    </div>
                  </div>
                </div>
              </article>

              <article className="app-panel p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="app-caption">대운 10주기</div>
                    <h2 className="mt-3 text-2xl font-semibold text-[var(--app-ivory)]">인생 흐름 캘린더</h2>
                  </div>
                  <Badge className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]">
                    기본 계산
                  </Badge>
                </div>

                {majorLuckPreview.length > 0 ? (
                  <>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {majorLuckPreview.map((cycle) => {
                        const isCurrent = currentMajorIndex === cycle.index;

                        return (
                          <div
                            key={`${cycle.index}-${cycle.ganzi}`}
                            className={cn(
                              'rounded-2xl border p-4 transition-colors',
                              isCurrent
                                ? 'border-[var(--app-gold)]/40 bg-[var(--app-gold)]/10'
                                : 'border-[var(--app-line)] bg-[var(--app-surface-muted)]'
                            )}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="text-lg font-semibold text-[var(--app-ivory)]">{cycle.ganzi}</div>
                              {isCurrent ? (
                                <Badge className="border-[var(--app-gold)]/35 bg-[var(--app-gold)]/14 text-[var(--app-gold-soft)]">
                                  현재
                                </Badge>
                              ) : null}
                            </div>
                            <div className="mt-2 text-sm text-[var(--app-copy)]">{formatMajorLuckWindow(cycle)}</div>
                            <p className="app-body-copy mt-3 text-sm">{cycle.notes.slice(0, 2).join(' ')}</p>
                          </div>
                        );
                      })}
                    </div>
                    <p className="app-body-copy mt-4 text-sm">
                      {sajuData.majorLuck && sajuData.majorLuck.length > majorLuckPreview.length
                        ? `저장본에는 총 ${sajuData.majorLuck.length}개 대운 주기가 들어 있고, 화면에는 현재 흐름 파악이 쉬운 앞부분만 먼저 보여줍니다.`
                        : '절기 일수 미세보정 전 기본 계산값을 먼저 노출하고 있습니다.'}
                    </p>
                  </>
                ) : (
                  <p className="app-body-copy mt-5 text-sm">
                    성별이 있어야 대운 순행·역행을 확정할 수 있어 현재 저장본에는 대운 주기가 비어 있습니다.
                  </p>
                )}
              </article>
            </section>
          </DetailUnlock>
        </div>

        <div className="text-center">
          <Link
            href="/saju/new"
            className="text-sm text-[var(--app-gold-soft)] underline underline-offset-4 hover:text-[var(--app-ivory)]"
          >
            다른 생년월일로 새 리포트 만들기
          </Link>
        </div>

        <ClassicEvidencePanel concept={classicEvidenceConcept} />
      </AppPage>
    </AppShell>
  );
}
