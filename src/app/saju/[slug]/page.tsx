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
import { Badge } from '@/components/ui/badge';
import DetailUnlock from '@/components/detail-unlock';
import SajuScreenNav from '@/features/saju-detail/saju-screen-nav';
import SiteHeader from '@/features/shared-navigation/site-header';
import { ELEMENT_INFO } from '@/lib/saju/elements';
import type { Element } from '@/lib/saju/types';
import { getLifetimeReportEntitlement } from '@/lib/report-entitlements';
import { resolveReading } from '@/lib/saju/readings';
import { buildSajuReport, FOCUS_TOPIC_META, FOCUS_TOPIC_OPTIONS } from '@/domain/saju/report';
import { cn } from '@/lib/utils';
import {
  createClient,
  hasSupabaseServerEnv,
  hasSupabaseServiceEnv,
} from '@/lib/supabase/server';
import {
  canUseSubscriptionForPremiumReport,
  getManagedSubscription,
} from '@/lib/subscription';
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
  gender?: 'male' | 'female';
}) {
  const timeLabel = input.hour !== undefined ? `${input.hour}시 기준` : '태어난 시간 미입력';
  const genderLabel = input.gender
    ? input.gender === 'male'
      ? '남성'
      : '여성'
    : '성별 미선택';
  return `${input.year}년 ${input.month}월 ${input.day}일 · ${timeLabel} · ${genderLabel}`;
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

function formatCurrentLuckBody(currentLuck: SajuCurrentLuck | null) {
  if (!currentLuck) {
    return '현재 대운과 세운, 월운을 아직 계산하지 못했습니다. 운 계산이 연결되면 이 자리에 현재 시점 해석이 표시됩니다.';
  }

  const notes = [
    ...(currentLuck.currentMajorLuck?.notes ?? []).slice(0, 2),
    ...(currentLuck.saewoon?.notes ?? []).slice(0, 1),
    ...(currentLuck.wolwoon?.notes ?? []).slice(0, 1),
  ];

  return notes.length > 0
    ? notes.join(' ')
    : '현재 운 정보는 계산되었지만 설명 문장은 아직 비어 있습니다.';
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

function formatEvidenceKeyLabel(key: string) {
  switch (key) {
    case 'strength':
      return '강약';
    case 'pattern':
      return '격국';
    case 'yongsin':
      return '용신';
    case 'relations':
      return '합충';
    case 'gongmang':
      return '공망';
    case 'specialSals':
      return '신살';
    default:
      return key;
  }
}

function buildAiFallbackText(report: ReturnType<typeof buildSajuReport>) {
  const highlights = report.summaryHighlights.map((summary) => `- ${summary}`).join('\n');
  const evidence = report.evidenceCards
    .map((card) => `- ${card.label}: ${card.title}. ${card.advice.todayAction}`)
    .join('\n');
  const citations = report.classicalCitations
    .map((citation) => `- ${citation.sourceTitle}: ${citation.title}`)
    .join('\n');

  return [
    report.headline,
    highlights,
    `행동 제안: ${report.primaryAction.title} - ${report.primaryAction.description}`,
    `주의 포인트: ${report.cautionAction.title} - ${report.cautionAction.description}`,
    `근거 요약:\n${evidence}`,
    citations ? `고전 근거/RAG 준비:\n${citations}` : '',
  ].filter(Boolean).join('\n\n');
}

async function getPremiumReportAccessLabel(slug: string) {
  if (!hasSupabaseServerEnv || !hasSupabaseServiceEnv) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [entitlement, subscription] = await Promise.all([
    getLifetimeReportEntitlement(user.id, slug),
    getManagedSubscription(user.id),
  ]);

  if (entitlement) return '평생 소장 권한';
  if (canUseSubscriptionForPremiumReport(subscription)) {
    return subscription?.plan === 'premium_monthly' ? '프리미엄 이용권' : 'Plus 이용권';
  }

  return null;
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
  const premiumAccessLabel = await getPremiumReportAccessLabel(slug);
  const premiumHref = `/saju/${encodeURIComponent(slug)}/premium`;

  return (
    <AppShell header={<SiteHeader />}>
      <AppPage className="space-y-6">
        <SajuScreenNav slug={slug} current="result" />

        <div className="grid gap-6 lg:grid-cols-[1.18fr_0.82fr] lg:items-start">
          <section className="app-hero-card self-start p-6 sm:p-7">
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
            <div className="mt-5 grid max-w-2xl gap-3">
              {report.summaryHighlights.map((summary, index) => (
                <p
                  key={`${index}-${summary}`}
                  className={cn(
                    'rounded-2xl border bg-[var(--app-surface-muted)] px-4 py-3 leading-8',
                    index === 0
                      ? 'border-[var(--app-gold)]/24 text-base text-[var(--app-ivory)] sm:text-lg'
                      : 'border-[var(--app-line)] text-sm text-[var(--app-copy)] sm:text-base'
                  )}
                >
                  {summary}
                </p>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {FOCUS_TOPIC_OPTIONS.map((option) => (
                <Link
                  key={option.key}
                  href={`/saju/${slug}?topic=${option.key}`}
                  className={cn(
                    'rounded-full border px-4 py-2 text-sm transition-colors',
                    report.focusTopic === option.key
                      ? 'border-[var(--app-gold)]/55 bg-[var(--app-gold)]/14 text-[var(--app-gold-soft)]'
                      : 'border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy)] hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]'
                  )}
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </section>

          <section className="grid self-start gap-4">
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
                        <div
                          className="mt-2 font-[var(--font-heading)] text-2xl font-semibold"
                          style={{ color: ELEMENT_INFO[pillar.stemElement].color }}
                        >
                          {pillar.stem}
                        </div>
                        <div
                          className="mt-1 font-[var(--font-heading)] text-xl font-semibold"
                          style={{ color: ELEMENT_INFO[pillar.branchElement].color }}
                        >
                          {pillar.branch}
                        </div>
                      </>
                    ) : (
                      <div className="mt-5 text-xs text-[var(--app-copy-soft)]">미입력</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="app-panel p-5">
              <div className="app-caption">{report.focusLabel} 행동 제안</div>
              <div className="mt-3 text-xl font-semibold text-[var(--app-ivory)]">{report.primaryAction.title}</div>
              <p className="app-body-copy mt-3 text-sm">{report.primaryAction.description}</p>
            </div>
            <div className="app-panel p-5">
              <div className="app-caption">{report.focusLabel} 피할 포인트</div>
              <div className="mt-3 text-xl font-semibold text-[var(--app-ivory)]">{report.cautionAction.title}</div>
              <p className="app-body-copy mt-3 text-sm">{report.cautionAction.description}</p>
            </div>
            <div className="rounded-[24px] border border-[var(--app-gold)]/18 bg-[var(--app-gold)]/8 p-5">
              <div className="text-sm text-[var(--app-gold-soft)]">날짜 포인트</div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-[var(--app-copy-soft)]">좋은 날짜</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {report.luckyDates.map((date) => (
                      <span key={date} className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-200">
                        {date}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-[var(--app-copy-soft)]">조심할 날짜</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {report.cautionDates.map((date) => (
                      <span key={date} className="rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-sm text-rose-200">
                        {date}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <SajuAiInterpretationPanel
          readingId={slug}
          topic={report.focusTopic}
          focusLabel={report.focusLabel}
          fallbackText={buildAiFallbackText(report)}
        />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {report.scores.map((score) => {
            const isFocusedScore = report.focusScoreKey === score.key;

            return (
              <article
                key={score.key}
                className={cn(
                  'app-panel p-5',
                  isFocusedScore
                    ? 'border-[var(--app-gold)]/35 bg-[linear-gradient(180deg,rgba(210,176,114,0.12),rgba(15,18,32,0.92))]'
                    : ''
                )}
              >
                <div className="app-caption">{score.label}</div>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-4xl font-semibold text-[var(--app-ivory)]">{score.score}</span>
                  <span className="pb-1 text-sm text-[var(--app-copy-soft)]">/ 100</span>
                </div>
                <p className="app-body-copy mt-4 text-sm">{score.summary}</p>
              </article>
            );
          })}
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="app-caption">현실 조언 정리</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--app-ivory)]">
                전문 근거를 오늘의 행동으로 바꿔 봅니다.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[var(--app-copy-muted)]">
              어려운 용어는 작게 두고, 무슨 뜻인지·삶에서 어떻게 보이는지·오늘 무엇을 하면 좋은지로 나눴습니다.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {report.evidenceCards.map((card) => {
              const adviceRows = [
                { label: '뜻', value: card.advice.meaning },
                { label: '현실', value: card.advice.lifePattern },
                { label: '오늘', value: card.advice.todayAction },
              ];

              return (
                <article key={card.key} className="moon-orbit-card p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="app-caption">{card.label}</div>
                    <span className="rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-2.5 py-1 text-[11px] text-[var(--app-copy-soft)]">
                      {card.confidence}
                    </span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold leading-8 text-[var(--app-ivory)]">{card.title}</h3>
                  <p className="app-body-copy mt-3 text-sm">{card.body}</p>

                  <div className="mt-5 divide-y divide-[var(--app-line)] border-y border-[var(--app-line)]">
                    {adviceRows.map((row) => (
                      <div key={`${card.key}-${row.label}`} className="grid gap-2 py-3 sm:grid-cols-[4.5rem_1fr]">
                        <div className="text-xs font-medium tracking-[0.18em] text-[var(--app-gold-soft)]">
                          {row.label}
                        </div>
                        <p className="text-sm leading-7 text-[var(--app-copy)]">{row.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
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

                  <details className="mt-4 border-t border-[var(--app-line)] pt-4">
                    <summary className="cursor-pointer text-xs tracking-[0.18em] text-[var(--app-copy-soft)] transition-colors hover:text-[var(--app-ivory)]">
                      계산 근거 보기
                    </summary>
                    <ul className="mt-3 space-y-2">
                      {card.details.map((detail, index) => (
                        <li key={`${card.key}-${index}-${detail}`} className="text-sm leading-7 text-[var(--app-copy-muted)]">
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </details>
                </article>
              );
            })}
          </div>
        </section>

        {report.classicalCitations.length > 0 ? (
          <section className="rounded-[28px] border border-[var(--app-gold)]/20 bg-[linear-gradient(135deg,rgba(210,176,114,0.1),rgba(7,19,39,0.88)_44%,rgba(255,255,255,0.035))] p-5 sm:p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="app-caption">고전 근거/RAG</div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--app-ivory)]">
                  고전의 관점과 현재 명식 근거를 연결해 봅니다.
                </h2>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-[var(--app-copy-muted)]">
                현재는 검증된 고전 원문 DB가 연결되기 전 단계라 직접 인용이 아니라 출처별 해석 관점으로 표시합니다.
                추후 RAG 코퍼스가 붙으면 이 카드에 원문 출처와 인용 위치를 함께 노출할 수 있습니다.
              </p>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {report.classicalCitations.map((citation) => (
                <article
                  key={citation.key}
                  className="moon-classic-quote p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="border-[var(--app-gold)]/30 bg-[var(--app-gold)]/12 text-[var(--app-gold-text)]">
                      {citation.sourceTitle}
                    </Badge>
                    <Badge className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]">
                      {citation.statusLabel}
                    </Badge>
                  </div>
                  <div className="mt-4 text-xs uppercase tracking-[0.22em] text-[var(--app-copy-soft)]">
                    {citation.sourceLabel} · {citation.theme}
                  </div>
                  <h3 className="mt-3 text-xl font-semibold leading-8 text-[var(--app-ivory)]">{citation.title}</h3>
                  <p className="mt-4 rounded-2xl border border-[var(--app-gold)]/14 bg-[var(--app-gold)]/8 px-4 py-3 text-sm leading-7 text-[var(--app-gold-text)]">
                    {citation.sourceNote}
                  </p>
                  <p className="app-body-copy mt-4 text-sm">{citation.interpretation}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {citation.matchedEvidenceKeys.map((key) => (
                      <span
                        key={`${citation.key}-${key}`}
                        className="rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-3 py-1 text-xs text-[var(--app-copy)]"
                      >
                        연결 근거 · {formatEvidenceKeyLabel(key)}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-3">
          {report.insights.map((insight) => (
            <article key={insight.title} className="app-panel p-6">
              <div className="text-xs uppercase tracking-[0.22em] text-[var(--app-gold-soft)]/78">{insight.eyebrow}</div>
              <h2 className="mt-3 text-xl font-semibold leading-8 text-[var(--app-ivory)]">{insight.title}</h2>
              <p className="app-body-copy mt-4 text-sm">{insight.body}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {report.timeline.map((item) => (
            <article key={item.label} className="app-panel p-6">
              <div className="app-caption">{item.label}</div>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--app-ivory)]">{item.headline}</h2>
              <p className="app-body-copy mt-4 text-sm">{item.body}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.88fr_1.12fr]">
          <article className="app-panel p-6">
            <div className="app-caption">현재 운 흐름</div>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--app-ivory)]">
              {formatCurrentLuckTitle(sajuData.currentLuck)}
            </h2>
            <p className="app-body-copy mt-4 text-sm">{formatCurrentLuckBody(sajuData.currentLuck)}</p>

            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--app-copy-soft)]">현재 대운</div>
                <div className="mt-2 text-lg font-semibold text-[var(--app-ivory)]">
                  {sajuData.currentLuck?.currentMajorLuck
                    ? `${sajuData.currentLuck.currentMajorLuck.ganzi} · ${formatMajorLuckWindow(sajuData.currentLuck.currentMajorLuck)}`
                    : '성별이 있어야 대운 방향을 확정할 수 있습니다.'}
                </div>
                <p className="app-body-copy mt-2 text-sm">
                  {sajuData.currentLuck?.currentMajorLuck?.notes.slice(0, 2).join(' ') ??
                    '현재 저장본에는 대운 범위가 아직 비어 있습니다.'}
                </p>
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

        <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="app-panel p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--app-ivory)]">이번 흐름을 돕는 오행</h2>
              <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-200">무료</Badge>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {report.supportElements.map((element) => (
                <div
                  key={element}
                  className="rounded-2xl border p-4"
                  style={{
                    borderColor: `${ELEMENT_INFO[element].color}50`,
                    backgroundColor: `${ELEMENT_INFO[element].color}15`,
                  }}
                >
                  <div className="text-lg font-semibold" style={{ color: ELEMENT_INFO[element].color }}>
                    {ELEMENT_INFO[element].name}
                  </div>
                  <div className="mt-2 text-sm text-[var(--app-copy)]">
                    {ELEMENT_INFO[element].keywords.slice(0, 2).join(' · ')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="app-panel p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--app-ivory)]">오행 분포</h2>
              <Badge className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]">
                해석 근거
              </Badge>
            </div>
            <div className="mt-5 space-y-3">
              {(Object.entries(sajuData.fiveElements.byElement) as [Element, (typeof sajuData.fiveElements.byElement)[Element]][]).map(([element, value]) => {
                return (
                  <div key={element} className="flex items-center gap-3">
                    <span className="w-16 text-sm text-[var(--app-copy)]">{ELEMENT_INFO[element].name.split(' ')[0]}</span>
                    <div className="h-2 flex-1 rounded-full bg-[var(--app-surface-strong)]">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${value.percentage}%`, backgroundColor: ELEMENT_INFO[element].color }}
                      />
                    </div>
                    <span className="w-10 text-right text-sm text-[var(--app-copy-soft)]">{value.count}개</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge
                style={{
                  backgroundColor: `${ELEMENT_INFO[sajuData.fiveElements.dominant].color}33`,
                  borderColor: `${ELEMENT_INFO[sajuData.fiveElements.dominant].color}66`,
                  color: ELEMENT_INFO[sajuData.fiveElements.dominant].color,
                }}
              >
                강한 오행 · {ELEMENT_INFO[sajuData.fiveElements.dominant].name}
              </Badge>
              <Badge
                style={{
                  backgroundColor: `${ELEMENT_INFO[sajuData.fiveElements.weakest].color}33`,
                  borderColor: `${ELEMENT_INFO[sajuData.fiveElements.weakest].color}66`,
                  color: ELEMENT_INFO[sajuData.fiveElements.weakest].color,
                }}
              >
                보완 포인트 · {ELEMENT_INFO[sajuData.fiveElements.weakest].name}
              </Badge>
            </div>
          </div>
        </section>

        <section className="app-panel p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--app-ivory)]">명식 원본</h2>
            <Badge className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]">
              기본 정보
            </Badge>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {pillars.map(({ label, pillar }) => (
              <div
                key={label}
                className="moon-saju-pillar p-4"
                data-day={label === '일주'}
              >
                <div className="text-xs text-[var(--app-copy-soft)]">{label}</div>
                {pillar ? (
                  <>
                    <div className="mt-3 text-3xl font-semibold" style={{ color: ELEMENT_INFO[pillar.stemElement].color }}>
                      {pillar.stem}
                    </div>
                    <div className="mt-1 text-3xl font-semibold" style={{ color: ELEMENT_INFO[pillar.branchElement].color }}>
                      {pillar.branch}
                    </div>
                    <div className="mt-3 text-xs text-[var(--app-copy-soft)]">
                      {pillar.stemElement} / {pillar.branchElement}
                    </div>
                    {formatHiddenStems(pillar) ? (
                      <div className="mt-2 text-xs text-[var(--app-copy-soft)]">
                        지장간 · {formatHiddenStems(pillar)}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="pt-10 text-sm text-[var(--app-copy-soft)]">미입력</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {premiumAccessLabel ? (
          <section className="app-panel overflow-hidden p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl">
                <div className="app-caption">이미 포함된 심층 해석</div>
                <h2 className="mt-3 text-xl font-semibold text-[var(--app-ivory)]">
                  명리 기준서에서 이어서 보시면 됩니다
                </h2>
                <p className="app-body-copy mt-3 text-sm">
                  이 결과는 {premiumAccessLabel}으로 전체 리포트 열람이 가능합니다. 기본 결과 아래에서
                  1코인을 다시 쓰게 하지 않고, 명리 기준서로 바로 이어가도록 정리했습니다.
                </p>
              </div>
              <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
                추가 차감 없음
              </Badge>
            </div>
            <Link
              href={premiumHref}
              className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--app-gold)]/38 bg-[var(--app-gold)]/14 px-6 text-sm font-semibold text-[var(--app-gold-text)] shadow-[0_16px_42px_rgba(210,176,114,0.12)] transition hover:bg-[var(--app-gold)]/20"
            >
              명리 기준서 이어보기
            </Link>
          </section>
        ) : (
          <section className="space-y-3">
            <div>
              <div className="app-caption">선택 심화</div>
              <h2 className="mt-2 text-xl font-semibold text-[var(--app-ivory)]">
                더 궁금한 분야만 따로 펼쳐보세요
              </h2>
              <p className="app-body-copy mt-2 text-sm">
                기본 결과를 읽은 뒤 부족한 분야가 있을 때만 여는 소액 심화입니다. 명리 기준서 구매 전
                가볍게 확인하는 용도로 둡니다.
              </p>
            </div>
            <DetailUnlock slug={slug} />
          </section>
        )}

        <div className="text-center">
          <Link
            href="/saju/new"
            className="text-sm text-[var(--app-gold-soft)] underline underline-offset-4 hover:text-[var(--app-ivory)]"
          >
            다른 생년월일로 새 리포트 만들기
          </Link>
        </div>
      </AppPage>
    </AppShell>
  );
}
