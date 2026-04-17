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
  const timeLabel = input.hour !== undefined ? `${input.hour}시 기준` : '태어난 시간 미입력';
  const genderLabel = input.gender
    ? input.gender === 'male'
      ? '남성'
      : '여성'
    : '성별 미선택';
  return `${input.year}년 ${input.month}월 ${input.day}일 · ${timeLabel} · ${genderLabel}`;
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
    { label: '년주', pillar: result.year },
    { label: '월주', pillar: result.month },
    { label: '일주', pillar: result.day },
    { label: '시주', pillar: result.hour },
  ];

  return (
    <AppShell header={<SiteHeader />}>
      <AppPage className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="app-hero-card p-7">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-[var(--app-gold)]/25 bg-[var(--app-gold)]/10 text-[var(--app-gold-soft)]">
                {report.focusBadge}
              </Badge>
              <Badge className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]">
                개인 결과 페이지 · 검색 제외
              </Badge>
            </div>
            <p className="app-caption mt-5">{formatBirthSummary(input)}</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-[var(--app-ivory)] sm:text-4xl">
              {report.headline}
            </h1>
            <p className="app-body-copy mt-4 max-w-3xl text-base sm:text-lg">{report.summary}</p>

            <div className="mt-6 flex flex-wrap gap-2">
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

          <section className="grid gap-4">
            <div className="app-panel p-6">
              <div className="app-caption">오늘의 행동 제안</div>
              <div className="mt-3 text-xl font-semibold text-[var(--app-ivory)]">{report.primaryAction.title}</div>
              <p className="app-body-copy mt-3 text-sm">{report.primaryAction.description}</p>
            </div>
            <div className="app-panel p-6">
              <div className="app-caption">오늘 피할 포인트</div>
              <div className="mt-3 text-xl font-semibold text-[var(--app-ivory)]">{report.cautionAction.title}</div>
              <p className="app-body-copy mt-3 text-sm">{report.cautionAction.description}</p>
            </div>
            <div className="rounded-[28px] border border-[var(--app-gold)]/18 bg-[var(--app-gold)]/8 p-6">
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

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {report.scores.map((score) => (
            <article key={score.key} className="app-panel p-5">
              <div className="app-caption">{score.label}</div>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-4xl font-semibold text-[var(--app-ivory)]">{score.score}</span>
                <span className="pb-1 text-sm text-[var(--app-copy-soft)]">/ 100</span>
              </div>
              <p className="app-body-copy mt-4 text-sm">{score.summary}</p>
            </article>
          ))}
        </section>

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
              {(Object.entries(result.elements) as [Element, number][]).map(([element, count]) => {
                const percentage = totalElements > 0 ? Math.round((count / totalElements) * 100) : 0;
                return (
                  <div key={element} className="flex items-center gap-3">
                    <span className="w-16 text-sm text-[var(--app-copy)]">{ELEMENT_INFO[element].name.split(' ')[0]}</span>
                    <div className="h-2 flex-1 rounded-full bg-[var(--app-surface-strong)]">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%`, backgroundColor: ELEMENT_INFO[element].color }}
                      />
                    </div>
                    <span className="w-10 text-right text-sm text-[var(--app-copy-soft)]">{count}개</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge
                style={{
                  backgroundColor: `${ELEMENT_INFO[result.dominantElement].color}33`,
                  borderColor: `${ELEMENT_INFO[result.dominantElement].color}66`,
                  color: ELEMENT_INFO[result.dominantElement].color,
                }}
              >
                강한 오행 · {ELEMENT_INFO[result.dominantElement].name}
              </Badge>
              <Badge
                style={{
                  backgroundColor: `${ELEMENT_INFO[result.weakestElement].color}33`,
                  borderColor: `${ELEMENT_INFO[result.weakestElement].color}66`,
                  color: ELEMENT_INFO[result.weakestElement].color,
                }}
              >
                보완 포인트 · {ELEMENT_INFO[result.weakestElement].name}
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
                className="rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-4 text-center"
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
                  </>
                ) : (
                  <div className="pt-10 text-sm text-[var(--app-copy-soft)]">미입력</div>
                )}
              </div>
            ))}
          </div>
        </section>

        <div>
          <DetailUnlock slug={slug} />
        </div>

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
