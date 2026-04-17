import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import DetailUnlock from '@/components/detail-unlock';
import SiteHeader from '@/features/shared-navigation/site-header';
import { ELEMENT_INFO } from '@/lib/saju/elements';
import type { Element } from '@/lib/saju/types';
import { resolveReading } from '@/lib/saju/readings';
import { buildSajuReport, FOCUS_TOPIC_OPTIONS } from '@/domain/saju/report';
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
  gender?: 'male' | 'female';
}) {
  const timeLabel = input.hour !== undefined ? `${input.hour}시` : '시간 미입력';
  const genderLabel = input.gender
    ? input.gender === 'male'
      ? '남성'
      : '여성'
    : '';
  const parts = [`${input.year}년 ${input.month}월 ${input.day}일`, timeLabel];
  if (genderLabel) parts.push(genderLabel);
  return parts.join(' · ');
}

function ScoreCard({ label, score, summary }: { label: string; score: number; summary: string }) {
  const color =
    score >= 80 ? '#5a9e5a'
    : score >= 70 ? '#d2b072'
    : '#e05252';

  return (
    <article className="app-panel p-5">
      <div className="app-label">{label}</div>
      <div className="mt-3 flex items-end gap-2">
        <span className="text-4xl font-semibold" style={{ color }}>
          {score}
        </span>
        <span className="mb-1 text-xs text-white/35">/ 100</span>
      </div>
      <div className="app-score-bar mt-3">
        <div
          className="app-score-bar-fill"
          style={{
            width: `${score}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
          }}
        />
      </div>
      <p className="app-body-copy mt-3 text-xs leading-[1.75]">{summary}</p>
    </article>
  );
}

export default async function SajuResultPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { topic } = await searchParams;
  const reading = await resolveReading(slug);

  if (!reading) notFound();

  const { input, result } = reading;
  const report = buildSajuReport(input, result, topic);
  const totalElements = Object.values(result.elements).reduce((sum, count) => sum + count, 0);

  const pillars = [
    { label: '년주 (年柱)', pillar: result.year },
    { label: '월주 (月柱)', pillar: result.month },
    { label: '일주 (日柱)', pillar: result.day },
    { label: '시주 (時柱)', pillar: result.hour },
  ];

  return (
    <AppShell header={<SiteHeader />}>
      <AppPage className="space-y-5">

        {/* ─── Header card ─────────────────────────────── */}
        <section className="app-hero-card p-7 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-[var(--app-gold)]/28 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]">
              {report.focusBadge}
            </Badge>
          </div>

          <p className="app-caption mt-5">{formatBirthSummary(input)}</p>
          <h1 className="mt-2 max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-[var(--app-ivory)] sm:text-[2.4rem]">
            {report.headline}
          </h1>
          <p className="app-body-copy mt-4 max-w-2xl text-sm sm:text-base">{report.summary}</p>

          {/* Topic switcher */}
          <div className="mt-6">
            <div className="app-subnav inline-flex">
              {FOCUS_TOPIC_OPTIONS.map((option) => (
                <Link
                  key={option.key}
                  href={`/saju/${slug}?topic=${option.key}`}
                  className="app-subnav-link"
                  data-active={report.focusTopic === option.key ? 'true' : undefined}
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Scores ──────────────────────────────────── */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {report.scores.map((score) => (
            <ScoreCard key={score.key} label={score.label} score={score.score} summary={score.summary} />
          ))}
        </section>

        {/* ─── Insights ────────────────────────────────── */}
        <section className="grid gap-4 lg:grid-cols-3">
          {report.insights.map((insight) => (
            <article key={insight.title} className="app-panel p-6">
              <div className="app-caption">{insight.eyebrow}</div>
              <h2 className="mt-3 text-base font-semibold leading-[1.5] text-[var(--app-ivory)] sm:text-lg">
                {insight.title}
              </h2>
              <div className="app-divider my-4" />
              <p className="app-body-copy text-sm leading-[1.85]">{insight.body}</p>
            </article>
          ))}
        </section>

        {/* ─── Timeline ────────────────────────────────── */}
        <section className="grid gap-4 lg:grid-cols-3">
          {report.timeline.map((item, index) => (
            <article
              key={item.label}
              className={cn(
                'rounded-[1.75rem] border p-6',
                index === 0
                  ? 'border-[var(--app-gold)]/22 bg-[radial-gradient(ellipse_at_top_left,rgba(210,176,114,0.09),transparent_50%),rgba(255,255,255,0.025)]'
                  : 'app-panel'
              )}
            >
              <div className={cn('app-label', index === 0 && 'text-[var(--app-gold-text)]/65')}>
                {item.label}
              </div>
              <h2 className="mt-3 text-lg font-semibold text-[var(--app-ivory)]">{item.headline}</h2>
              <p className="app-body-copy mt-3 text-sm leading-[1.85]">{item.body}</p>
            </article>
          ))}
        </section>

        {/* ─── Actions + dates ─────────────────────────── */}
        <section className="grid gap-4 lg:grid-cols-[1fr_1fr_0.9fr]">
          <div className="app-panel p-6">
            <div className="app-caption">오늘의 행동 제안</div>
            <h2 className="mt-3 text-base font-semibold text-[var(--app-ivory)]">
              {report.primaryAction.title}
            </h2>
            <div className="app-divider my-4" />
            <p className="app-body-copy text-sm leading-[1.85]">{report.primaryAction.description}</p>
          </div>

          <div className="app-panel p-6">
            <div className="app-caption">주의할 흐름</div>
            <h2 className="mt-3 text-base font-semibold text-[var(--app-ivory)]">
              {report.cautionAction.title}
            </h2>
            <div className="app-divider my-4" />
            <p className="app-body-copy text-sm leading-[1.85]">{report.cautionAction.description}</p>
          </div>

          <div className="app-panel-gold p-6">
            <div className="app-caption">날짜 포인트</div>
            <div className="mt-4 space-y-4">
              <div>
                <p className="app-label mb-2">좋은 날</p>
                <div className="flex flex-wrap gap-2">
                  {report.luckyDates.map((date) => (
                    <span
                      key={date}
                      className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300"
                    >
                      {date}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="app-label mb-2">주의할 날</p>
                <div className="flex flex-wrap gap-2">
                  {report.cautionDates.map((date) => (
                    <span
                      key={date}
                      className="rounded-full border border-rose-500/20 bg-rose-500/8 px-3 py-1 text-xs font-medium text-rose-300"
                    >
                      {date}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Elements ────────────────────────────────── */}
        <section className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
          {/* Support elements */}
          <div className="app-panel p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[var(--app-ivory)]">이번 흐름에 도움되는 오행</h2>
              <Badge className="border-emerald-500/20 bg-emerald-500/8 text-emerald-300 text-xs">용신</Badge>
            </div>
            <p className="app-body-copy mt-2 text-xs">
              현재 명식에서 보완이 필요한 기운입니다. 색깔·방위·음식으로 일상에서 활용해 보세요.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {report.supportElements.map((element) => {
                const info = ELEMENT_INFO[element];
                return (
                  <div
                    key={element}
                    className="rounded-2xl border p-4"
                    style={{
                      borderColor: `${info.color}40`,
                      background: `${info.color}12`,
                    }}
                  >
                    <div className="text-base font-semibold" style={{ color: info.color }}>
                      {info.name}
                    </div>
                    <div className="mt-1.5 text-xs leading-[1.7] text-white/55">
                      {info.traits.slice(0, 2).join(' · ')}
                    </div>
                    <div className="mt-2 text-[10px] text-white/38">
                      {info.keywords.slice(0, 2).join(' · ')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Element distribution */}
          <div className="app-panel p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[var(--app-ivory)]">오행 분포</h2>
              <Badge className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)] text-xs">
                명식 근거
              </Badge>
            </div>
            <div className="mt-5 space-y-3.5">
              {(Object.entries(result.elements) as [Element, number][]).map(([element, count]) => {
                const percentage = totalElements > 0 ? Math.round((count / totalElements) * 100) : 0;
                const info = ELEMENT_INFO[element];
                return (
                  <div key={element} className="flex items-center gap-3">
                    <span
                      className="w-12 text-xs font-medium"
                      style={{ color: info.color }}
                    >
                      {info.name.split(' ')[0]}
                    </span>
                    <div className="app-score-bar flex-1">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: info.color,
                        }}
                      />
                    </div>
                    <span className="w-8 text-right text-xs text-white/40">{count}개</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <span
                className="rounded-full border px-3 py-1 text-xs font-medium"
                style={{
                  borderColor: `${ELEMENT_INFO[result.dominantElement].color}50`,
                  backgroundColor: `${ELEMENT_INFO[result.dominantElement].color}18`,
                  color: ELEMENT_INFO[result.dominantElement].color,
                }}
              >
                강한 오행 · {ELEMENT_INFO[result.dominantElement].name}
              </span>
              <span
                className="rounded-full border px-3 py-1 text-xs font-medium"
                style={{
                  borderColor: `${ELEMENT_INFO[result.weakestElement].color}50`,
                  backgroundColor: `${ELEMENT_INFO[result.weakestElement].color}18`,
                  color: ELEMENT_INFO[result.weakestElement].color,
                }}
              >
                보완 필요 · {ELEMENT_INFO[result.weakestElement].name}
              </span>
            </div>
          </div>
        </section>

        {/* ─── Pillars (명식 원본) ─────────────────────── */}
        <section className="app-panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[var(--app-ivory)]">명식 원본 (사주팔자)</h2>
              <p className="app-body-copy mt-1 text-xs">천간(天干)과 지지(地支)로 구성된 네 개의 기둥</p>
            </div>
            <Badge className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)] text-xs">
              기본 정보
            </Badge>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {pillars.map(({ label, pillar }) => (
              <div key={label} className="app-pillar-card">
                <p className="text-[10px] text-white/40">{label}</p>
                {pillar ? (
                  <>
                    <div
                      className="mt-3 text-4xl font-semibold"
                      style={{ color: ELEMENT_INFO[pillar.stemElement].color }}
                    >
                      {pillar.stem}
                    </div>
                    <div
                      className="mt-1 text-4xl font-semibold"
                      style={{ color: ELEMENT_INFO[pillar.branchElement].color }}
                    >
                      {pillar.branch}
                    </div>
                    <div className="mt-3 text-[10px] text-white/38">
                      {pillar.stemElement} / {pillar.branchElement}
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-xs text-white/30">미입력</div>
                )}
              </div>
            ))}
          </div>
          <p className="app-body-copy mt-4 text-xs">
            천간은 양(陽)의 기운을 대표하며 사회적 모습을, 지지는 음(陰)의 기운을 담아 내면과 환경을 나타냅니다.
          </p>
        </section>

        {/* ─── Paywall ─────────────────────────────────── */}
        <div>
          <DetailUnlock slug={slug} />
        </div>

        {/* ─── New reading link ─────────────────────────── */}
        <div className="pb-4 text-center">
          <Link
            href="/saju/new"
            className="text-sm text-[var(--app-gold-text)]/70 underline underline-offset-4 transition-colors hover:text-[var(--app-ivory)]"
          >
            다른 생년월일로 새 리포트 만들기
          </Link>
        </div>

      </AppPage>
    </AppShell>
  );
}
