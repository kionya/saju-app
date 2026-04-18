import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type {
  SajuCurrentLuck,
  SajuLuckDescriptor,
  SajuMajorLuckCycle,
  SajuPattern,
  SajuPillar,
  SajuStrength,
  SajuSymbolRef,
  SajuYongsin,
} from '@/domain/saju/engine/saju-data-v1';
import { Badge } from '@/components/ui/badge';
import DetailUnlock from '@/components/detail-unlock';
import SajuScreenNav from '@/features/saju-detail/saju-screen-nav';
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

function formatStrengthTitle(strength: SajuStrength | null) {
  if (!strength) return '강약 계산 준비 중';
  return `${strength.level} · ${strength.score}점`;
}

function formatStrengthBody(strength: SajuStrength | null) {
  if (!strength) {
    return '현재 저장본은 seed 데이터라 강약 점수와 근거가 아직 비어 있습니다. 다음 계산 단계에서 바로 연결됩니다.';
  }

  return strength.rationale.length > 0
    ? strength.rationale.join(' ')
    : '일간 강약 점수는 계산되었지만 설명 문장은 아직 채워지지 않았습니다.';
}

function formatPatternTitle(pattern: SajuPattern | null) {
  if (!pattern) return '격국 계산 준비 중';
  return pattern.tenGod ? `${pattern.name} · ${pattern.tenGod}` : pattern.name;
}

function formatPatternBody(pattern: SajuPattern | null) {
  if (!pattern) {
    return '격국 필드가 비어 있어도 카드 자리는 유지합니다. 이후 rule-based 계산이 들어오면 이 자리에 근거와 함께 표시됩니다.';
  }

  return pattern.rationale.length > 0
    ? pattern.rationale.join(' ')
    : '격국명은 준비되었고 상세 근거 문장은 다음 단계에서 보강됩니다.';
}

function formatYongsinTitle(yongsin: SajuYongsin | null) {
  if (!yongsin) return '용신 계산 준비 중';
  return formatSymbolList([yongsin.primary, ...yongsin.secondary]);
}

function formatYongsinBody(yongsin: SajuYongsin | null) {
  if (!yongsin) {
    return '용신과 기신 자리가 열려 있습니다. 다음 단계에서 조후/억부 판정이 채워지면 바로 실제 값으로 교체됩니다.';
  }

  const kiyshin = yongsin.kiyshin.length > 0 ? formatSymbolList(yongsin.kiyshin) : '기신 미기재';
  return `${yongsin.method} 기준으로 읽고, 기신은 ${kiyshin}입니다.`;
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

function formatSymbolList(symbols: SajuSymbolRef[]) {
  return symbols.map((symbol) => symbol.label).join(' · ');
}

function formatHiddenStems(pillar: SajuPillar) {
  if (pillar.hiddenStems.length === 0) return null;
  return pillar.hiddenStems.map((item) => item.stem).join(' · ');
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
            <p className="app-body-copy mt-4 max-w-2xl text-base sm:text-lg">{report.summary}</p>

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
            <div className="app-panel p-5">
              <div className="app-caption">오늘의 행동 제안</div>
              <div className="mt-3 text-xl font-semibold text-[var(--app-ivory)]">{report.primaryAction.title}</div>
              <p className="app-body-copy mt-3 text-sm">{report.primaryAction.description}</p>
            </div>
            <div className="app-panel p-5">
              <div className="app-caption">오늘 피할 포인트</div>
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

        <section className="grid gap-4 lg:grid-cols-3">
          <article className="app-panel p-6">
            <div className="app-caption">강약</div>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--app-ivory)]">
              {formatStrengthTitle(sajuData.strength)}
            </h2>
            <p className="app-body-copy mt-4 text-sm">{formatStrengthBody(sajuData.strength)}</p>
          </article>

          <article className="app-panel p-6">
            <div className="app-caption">격국</div>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--app-ivory)]">
              {formatPatternTitle(sajuData.pattern)}
            </h2>
            <p className="app-body-copy mt-4 text-sm">{formatPatternBody(sajuData.pattern)}</p>
          </article>

          <article className="app-panel p-6">
            <div className="app-caption">용신</div>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--app-ivory)]">
              {formatYongsinTitle(sajuData.yongsin)}
            </h2>
            <p className="app-body-copy mt-4 text-sm">{formatYongsinBody(sajuData.yongsin)}</p>
          </article>
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
