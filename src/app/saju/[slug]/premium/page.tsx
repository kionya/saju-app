import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import FortuneCalendarPanel from '@/components/ai/fortune-calendar-panel';
import LifetimeReportPanel from '@/components/ai/lifetime-report-panel';
import YearlyReportPanel from '@/components/ai/yearly-report-panel';
import { EngineMethodLinks } from '@/components/content/engine-method-links';
import {
  REPORT_SAMPLE_HREF,
  SAJU_PREMIUM_SECTIONS,
  SAJU_PREMIUM_PREVIEW,
  SAJU_PREMIUM_VALUE_POINTS,
} from '@/content/moonlight';
import { SwipeSectionDeck, SwipeSectionSlide } from '@/components/layout/swipe-section-deck';
import { buildSajuReport } from '@/domain/saju/report';
import {
  ELEMENT_INFO,
  getLuckyElementsFromSajuData,
  getPersonalityFromSajuData,
} from '@/lib/saju/elements';
import { toSlug } from '@/lib/saju/pillars';
import SajuScreenNav from '@/features/saju-detail/saju-screen-nav';
import SiteHeader from '@/features/shared-navigation/site-header';
import { getLifetimeReportEntitlement } from '@/lib/report-entitlements';
import { resolveReading } from '@/lib/saju/readings';
import {
  createClient,
  hasSupabaseServerEnv,
  hasSupabaseServiceEnv,
} from '@/lib/supabase/server';
import { getManagedSubscription } from '@/lib/subscription';
import { AppPage, AppShell } from '@/shared/layout/app-shell';

interface Props {
  params: Promise<{ slug: string }>;
}

type ReadingRecord = NonNullable<Awaited<ReturnType<typeof resolveReading>>>;

interface PremiumReportSection {
  eyebrow: string;
  title: string;
  lead: string;
  decision: string;
  paragraphs: string[];
  keyPoints?: string[];
  actionItems?: string[];
  highlights?: string[];
}

function compactStrings(strings: Array<string | null | undefined>) {
  return strings.filter((item): item is string => Boolean(item && item.trim().length > 0));
}

function formatElementName(element: keyof typeof ELEMENT_INFO) {
  return ELEMENT_INFO[element].name.split(' ')[0];
}

function formatSymbolList(symbols: Array<{ label: string }> | null | undefined) {
  return symbols && symbols.length > 0 ? symbols.map((symbol) => symbol.label).join(' · ') : '';
}

function formatLuckRange(cycle: { startAge: number | null; endAge: number | null }) {
  if (cycle.startAge === null && cycle.endAge === null) return '나이 미산정';
  if (cycle.startAge !== null && cycle.endAge !== null) return `${cycle.startAge}-${cycle.endAge}세`;
  if (cycle.startAge !== null) return `${cycle.startAge}세 이후`;
  return `${cycle.endAge}세 이전`;
}

function formatMajorLuckLine(cycle: NonNullable<ReadingRecord['sajuData']['majorLuck']>[number]) {
  const note = cycle.notes.slice(0, 2).join(' ') || '이 시기의 대운 흐름은 세부 해석 보강 대상입니다.';
  return `${formatLuckRange(cycle)} · ${cycle.ganzi}: ${note}`;
}

function getTimelineItem(report: ReturnType<typeof buildSajuReport>, label: string) {
  return report.timeline.find((item) => item.label === label) ?? null;
}

function compactList(items: Array<string | null | undefined>, max = 4) {
  return [...new Set(compactStrings(items))].slice(0, max);
}

function formatScoreFocus(report: ReturnType<typeof buildSajuReport>) {
  const focused = report.scores.find((score) => score.key === report.focusScoreKey);
  return focused ? `${report.focusLabel} ${focused.score}점 · ${focused.summary}` : '';
}

function buildUnlockedReportSections(reading: ReadingRecord): PremiumReportSection[] {
  const { input, sajuData } = reading;
  const todayReport = buildSajuReport(input, sajuData, 'today');
  const loveReport = buildSajuReport(input, sajuData, 'love');
  const wealthReport = buildSajuReport(input, sajuData, 'wealth');
  const careerReport = buildSajuReport(input, sajuData, 'career');
  const relationshipReport = buildSajuReport(input, sajuData, 'relationship');
  const evidenceByKey = Object.fromEntries(
    todayReport.evidenceCards.map((card) => [card.key, card])
  );
  const dominant = formatElementName(sajuData.fiveElements.dominant);
  const weakest = formatElementName(sajuData.fiveElements.weakest);
  const supportLabels =
    getLuckyElementsFromSajuData(sajuData).map(formatElementName).join(' · ') || dominant;
  const pillars = [
    `년주 ${sajuData.pillars.year.ganzi}`,
    `월주 ${sajuData.pillars.month.ganzi}`,
    `일주 ${sajuData.pillars.day.ganzi}`,
    sajuData.pillars.hour ? `시주 ${sajuData.pillars.hour.ganzi}` : '시주 미입력',
  ];
  const strength = evidenceByKey.strength;
  const pattern = evidenceByKey.pattern;
  const yongsin = evidenceByKey.yongsin;
  const relations = evidenceByKey.relations;
  const gongmang = evidenceByKey.gongmang;
  const specialSals = evidenceByKey.specialSals;
  const majorLuckHighlights = sajuData.majorLuck?.slice(0, 10).map(formatMajorLuckLine) ?? [];
  const currentMajor = sajuData.currentLuck?.currentMajorLuck;
  const saewoon = sajuData.currentLuck?.saewoon;
  const wolwoon = sajuData.currentLuck?.wolwoon;
  const todayFlow = getTimelineItem(todayReport, '오늘');
  const monthlyFlow = getTimelineItem(todayReport, '이번 달');
  const majorFlow = getTimelineItem(todayReport, '대운 흐름');
  const yongsinLabel = sajuData.yongsin
    ? formatSymbolList([sajuData.yongsin.primary, ...sajuData.yongsin.secondary])
    : yongsin?.title ?? '';

  return [
    {
      eyebrow: '타고난 결',
      title: '1. 일주와 기본 성향',
      lead: compactStrings([
        `선생님의 일주는 ${sajuData.pillars.day.ganzi}입니다.`,
        sajuData.dayMaster.metaphor
          ? `${sajuData.dayMaster.stem} 일간은 ${sajuData.dayMaster.metaphor}의 결을 지녀 삶의 방향을 읽을 때 이 상징을 먼저 봅니다.`
          : null,
      ]).join(' '),
      decision: `${sajuData.dayMaster.stem} 일간은 타고난 반응 속도와 자기 표현 방식의 중심입니다. 이 리포트에서는 성격 묘사보다 “어떤 환경에서 실력이 잘 나오는가”를 먼저 봅니다.`,
      paragraphs: compactStrings([
        getPersonalityFromSajuData(sajuData),
        todayReport.summaryHighlights[0],
      ]),
      keyPoints: compactList([
        `원국: ${pillars.join(' · ')}`,
        `월령 기준: ${sajuData.pillars.month.ganzi}`,
        `일간 상징: ${sajuData.dayMaster.metaphor ?? sajuData.dayMaster.stem}`,
      ]),
      actionItems: compactList([
        '내가 빨리 반응하는 상황과 늦게 결정해야 하는 상황을 구분하세요.',
        '성향을 장점/단점으로만 보지 말고 잘 맞는 환경을 찾는 기준으로 쓰세요.',
      ], 2),
    },
    {
      eyebrow: '균형 진단',
      title: '2. 오행 분포와 강약',
      lead: `${dominant} 기운이 가장 앞에 있고, ${weakest} 기운을 어떻게 보완하느냐가 평생 균형의 핵심입니다.`,
      decision: strength?.body ?? `${dominant}은 쓰기 쉬운 장점이고, ${weakest}은 의식적으로 보완해야 하는 약한 축입니다.`,
      paragraphs: compactStrings([
        strength?.title ? `강약 기준은 ${strength.title}입니다.` : null,
        todayReport.summaryHighlights[1],
      ]),
      keyPoints: compactList([
        strength ? `${strength.title} · ${strength.confidence}` : null,
        `강한 오행: ${dominant}`,
        `보완 오행: ${weakest}`,
      ]),
      actionItems: strength?.practicalActions?.slice(0, 3),
      highlights: Object.entries(sajuData.fiveElements.byElement).map(
        ([element, value]) => `${formatElementName(element as keyof typeof ELEMENT_INFO)} ${value.percentage}% · ${value.state}`
      ),
    },
    {
      eyebrow: '명식 구조',
      title: '3. 격국과 용신',
      lead: compactStrings([
        pattern ? `${pattern.title}을 기준으로 삶의 역할과 관계 패턴을 먼저 읽습니다.` : null,
        yongsinLabel ? `보완 축은 ${yongsinLabel}입니다.` : null,
      ]).join(' '),
      decision: yongsin?.body ?? `이 명식은 ${supportLabels} 기운을 어떻게 쓰느냐가 균형의 핵심입니다.`,
      paragraphs: compactStrings([
        pattern?.title ? `격국 기준은 ${pattern.title}입니다.` : null,
        yongsin?.title ? `보완 축 메모: ${yongsin.title}` : null,
        `평생 운을 볼 때는 타고난 구조를 고정값으로 단정하기보다, ${supportLabels} 기운을 생활 환경과 선택 안에 얼마나 안정적으로 들이는지가 중요합니다.`,
      ]),
      keyPoints: compactList([
        pattern ? `격국: ${pattern.title}` : null,
        yongsinLabel ? `보완 축: ${yongsinLabel}` : null,
        yongsin?.details.find((detail) => detail.includes('후보')),
      ]),
      actionItems: compactList([
        ...(yongsin?.practicalActions ?? []),
        ...(pattern?.practicalActions ?? []),
      ], 4),
    },
    {
      eyebrow: '인생 큰 흐름',
      title: '4. 대운으로 보는 장기 운세',
      lead: currentMajor
        ? `현재는 ${currentMajor.ganzi} 대운권에 있어 ${formatLuckRange(currentMajor)} 구간의 선택이 다음 흐름을 여는 기준이 됩니다.`
        : '대운은 10년 단위로 삶의 배경이 바뀌는 큰 흐름입니다.',
      decision: majorFlow?.body ?? '대운은 사건 하나를 맞히는 항목이 아니라, 선택의 배경과 장기 과제를 읽는 항목입니다.',
      paragraphs: compactStrings([
        majorFlow?.headline,
        '아래 대운 목록은 특정 사건을 단정하기보다, 어느 시기에 확장·정리·관계 조율의 과제가 커지는지 보는 장기 지도입니다.',
      ]),
      keyPoints: majorFlow?.points,
      actionItems: compactList([
        majorFlow?.points?.find((point) => point.startsWith('장기 실행')),
        '올해 결정은 지금 대운의 장기 과제와 맞는지 먼저 확인하세요.',
      ], 2),
      highlights: majorLuckHighlights.length > 0
        ? majorLuckHighlights
        : ['성별 또는 생시 정보가 부족해 대운 시작 시점은 아직 산정되지 않았습니다.'],
    },
    {
      eyebrow: '현재 운',
      title: '5. 세운과 월운',
      lead: compactStrings([
        saewoon?.ganzi ? `${saewoon.ganzi} 세운` : null,
        wolwoon?.ganzi ? `${wolwoon.ganzi} 월운` : null,
      ]).join(' · ') || '현재 세운과 월운은 기본 흐름 중심으로 해석합니다.',
      decision: compactStrings([
        todayFlow?.body,
        monthlyFlow?.body,
      ]).join(' ') || '현재 운은 세운과 월운을 함께 놓고 오늘의 선택 속도와 이번 달 루틴을 조절하는 방식으로 봅니다.',
      paragraphs: compactStrings([
        saewoon?.notes.join(' '),
        wolwoon?.notes.join(' '),
      ]),
      keyPoints: compactList([
        todayFlow?.headline,
        monthlyFlow?.headline,
        majorFlow?.headline,
      ]),
      actionItems: compactList([
        ...(todayFlow?.points ?? []),
        ...(monthlyFlow?.points ?? []),
      ], 4),
    },
    {
      eyebrow: '생활 분야',
      title: '6. 재물·연애·직장·관계',
      lead: '평생 리포트에서는 한 분야만 따로 떼어 보지 않고, 돈·마음·역할·사람 사이의 균형을 함께 봅니다.',
      decision: '유료 상세에서는 분야별 운을 길게 늘어놓기보다, 지금 실제로 판단해야 할 우선순위를 나눠 보여줍니다.',
      paragraphs: compactStrings([
        `재물: ${wealthReport.primaryAction.description}`,
        `연애: ${loveReport.primaryAction.description}`,
        `직장: ${careerReport.primaryAction.description}`,
        `관계: ${relationshipReport.primaryAction.description}`,
      ]),
      keyPoints: compactList([
        formatScoreFocus(wealthReport),
        formatScoreFocus(loveReport),
        formatScoreFocus(careerReport),
        formatScoreFocus(relationshipReport),
      ]),
      actionItems: compactList([
        wealthReport.cautionAction.description,
        loveReport.cautionAction.description,
        careerReport.cautionAction.description,
        relationshipReport.cautionAction.description,
      ]),
    },
    {
      eyebrow: '활용 전략',
      title: '7. 합충·공망·신살을 반영한 평생 조언',
      lead: `좋은 운은 ${supportLabels} 기운을 현실의 루틴으로 만들 때 오래 갑니다.`,
      decision: '합충·공망·신살은 겁을 주는 장식이 아니라, 어디서 속도가 붙고 어디서 확인 절차가 필요한지 알려주는 보조 신호입니다.',
      paragraphs: compactStrings([
        relations?.body,
        gongmang?.body,
        specialSals?.body,
        '운의 강한 구간에서는 속도를 내되, 약한 축이 드러나는 시기에는 결정을 늦추고 확인 절차를 늘리는 방식이 가장 현실적인 보완책입니다.',
      ]),
      keyPoints: compactList([
        relations ? `합충: ${relations.title}` : null,
        gongmang ? `공망: ${gongmang.title}` : null,
        specialSals ? `신살: ${specialSals.title}` : null,
      ]),
      actionItems: compactList([
        ...(relations?.practicalActions ?? []),
        ...(gongmang?.practicalActions ?? []),
        ...(specialSals?.practicalActions ?? []),
      ], 4),
    },
  ];
}

function canUseSubscriptionForPremiumReport(subscription: Awaited<ReturnType<typeof getManagedSubscription>>) {
  return (
    subscription?.status === 'active' &&
    (subscription.plan === 'plus_monthly' || subscription.plan === 'premium_monthly')
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '명리 기준서',
    description: '사주 명리 기준서와 연간 부록의 미리보기 및 열람 화면입니다.',
    robots: { index: false, follow: false },
  };
}

export default async function SajuPremiumPage({ params }: Props) {
  const { slug } = await params;
  const reading = await resolveReading(slug);

  if (!reading) notFound();

  const { sajuData } = reading;
  const readingKey = toSlug(reading.input);
  const encodedSlug = encodeURIComponent(slug);
  let hasLifetimeAccess = false;
  let yearlyAccessLabel: string | null = null;

  if (hasSupabaseServerEnv && hasSupabaseServiceEnv) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const [entitlement, subscription] = await Promise.all([
        getLifetimeReportEntitlement(user.id, readingKey, [slug]),
        getManagedSubscription(user.id),
      ]);

      if (entitlement) {
        hasLifetimeAccess = true;
        yearlyAccessLabel = '평생 소장 권한';
      } else if (subscription && canUseSubscriptionForPremiumReport(subscription)) {
        yearlyAccessLabel = subscription.plan === 'premium_monthly' ? 'Premium 이용권' : '라이트 이용권';
      }
    }
  }

  const targetYear = new Date().getFullYear();

  return (
    <AppShell header={<SiteHeader />}>
      <AppPage className="space-y-6">
        <SajuScreenNav slug={slug} current="premium" />

        <section className="moon-lunar-panel p-7 sm:p-8">
          <div className="app-starfield" />
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-[var(--app-gold)]/28 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]">
              {hasLifetimeAccess
                ? '명리 기준서 · 전체 열람'
                : yearlyAccessLabel
                  ? '연간 전략 부록 · 전체 열람'
                  : '명리 기준서 · 미리보기'}
            </Badge>
          </div>
          <h1 className="mt-5 font-display text-4xl text-[var(--app-ivory)] sm:text-5xl">
            {hasLifetimeAccess
              ? '명리 기준서와 올해 부록이 열렸습니다'
              : yearlyAccessLabel
                ? `${targetYear} 연간 전략 부록이 열렸습니다`
                : '명리 기준서 전체 보기'}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--app-copy)]">
            명리 기준서는 원국의 바탕을 읽는 본문이고, 올해 부록은 같은 기준 위에서 올해의 흐름을
            적용해 보는 확장판입니다.
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--app-copy-muted)]">
            격국, 용신, 대운의 판정은 계산 기준을 먼저 고정하고, AI는 그 결과를 읽기 쉬운 문장으로만 풀어드립니다.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/about-engine"
              className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 text-sm text-[var(--app-copy)] transition-colors hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]"
            >
              계산 기준서 보기
            </Link>
            <Link
              href={
                hasLifetimeAccess
                  ? '#lifetime-evidence'
                  : yearlyAccessLabel
                    ? '#yearly-evidence'
                    : '/about-engine#decision-trace'
              }
              className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-gold)]/35 bg-[var(--app-gold)]/12 px-5 text-sm text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/18"
            >
              {hasLifetimeAccess || yearlyAccessLabel ? '판정 근거 먼저 보기' : '판정 근거 예시 보기'}
            </Link>
          </div>
        </section>

        <SwipeSectionDeck
          title="명리 기준서를 한 화면씩 넘겨 봅니다"
          description="기준 글, 본문, 연간 부록, 월간 달력을 나눠서 너무 길게 내려가지 않도록 정리했습니다."
        >
          <SwipeSectionSlide
            eyebrow="기준"
            title="이 리포트와 이어지는 기준 글"
            description="격국, 용신, 대운처럼 실제 판정을 바꾸는 기준만 먼저 모았습니다."
            navLabel="기준"
          >
            <EngineMethodLinks
              title="지금 보고 있는 명리 기준서와 가장 직접적으로 이어지는 기준 글"
              description="격국, 용신, 대운, 시간 기준처럼 실제 판정과 행동 조언을 바꾸는 항목만 골라 바로 이어볼 수 있게 두었습니다."
              slugs={[
                'why-pattern-judgments-diverge',
                'why-yongsin-is-hard',
                'how-to-read-daewoon-and-sewoon-together',
                'how-far-to-trust-gongmang-and-shinsal',
              ]}
              ctaHref="/method"
              ctaLabel="연결된 읽을거리 전체 보기"
            />
          </SwipeSectionSlide>

        {hasLifetimeAccess ? (
          <>
            <SwipeSectionSlide
              eyebrow="평생 기준서"
              title="명리 기준서 본문"
              description="원국과 평생 흐름을 보관형 본문으로 읽습니다."
              navLabel="기준서"
            >
              <LifetimeReportPanel slug={slug} targetYear={targetYear} />
            </SwipeSectionSlide>
            <SwipeSectionSlide
              eyebrow="연간"
              title={`${targetYear} 연간 전략 부록`}
              description="올해 흐름과 분야별 판단 기준을 별도 화면으로 확인합니다."
              navLabel="연간"
            >
              <YearlyReportPanel slug={slug} targetYear={targetYear} />
            </SwipeSectionSlide>
            <SwipeSectionSlide
              eyebrow="월간"
              title="달별로 보는 흐름"
              description="좋은 날, 주의할 날, 결정일을 월별 화면에서 확인합니다."
              navLabel="달력"
            >
              <FortuneCalendarPanel slug={slug} targetYear={targetYear} hasLifetimeAccess />
            </SwipeSectionSlide>
          </>
        ) : yearlyAccessLabel ? (
          <>
            <SwipeSectionSlide
              eyebrow="연간"
              title={`${targetYear} 연간 전략 부록`}
              description="구독 권한으로 열린 연간 흐름을 먼저 읽습니다."
              navLabel="연간"
            >
              <YearlyReportPanel slug={slug} targetYear={targetYear} />
            </SwipeSectionSlide>
            <SwipeSectionSlide
              eyebrow="월간"
              title="달별로 보는 흐름"
              description="월별 타이밍은 별도 화면에서 넘기며 확인합니다."
              navLabel="달력"
            >
              <FortuneCalendarPanel slug={slug} targetYear={targetYear} hasLifetimeAccess={false} />
            </SwipeSectionSlide>
            <SwipeSectionSlide
              eyebrow="확장"
              title="명리 기준서로 확장하기"
              description="연간 부록과 평생 소장 기준서의 차이를 정리했습니다."
              navLabel="확장"
            >
              <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
              <article className="moon-lunar-panel p-6">
                <div className="app-starfield" />
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
                    {yearlyAccessLabel}
                  </Badge>
                  <Badge className="border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] text-[var(--app-copy-soft)]">
                    기준서 본문은 별도 권한
                  </Badge>
                </div>
                <h2 className="mt-4 font-display text-3xl text-[var(--app-gold-text)]">
                  연간 전략 부록은 열려 있고, 명리 기준서는 별도로 보관합니다
                </h2>
                <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
                  지금 권한으로는 올해 흐름과 월별 타이밍을 모두 읽을 수 있습니다. 다만 평생 소장권은 원국의
                  본질, 강약, 격국, 용신, 관계 패턴, 재물 체질, 직업 방향, 건강 리듬, 대운 10년 지도를
                  장기 기준서로 보관하는 별도 상품입니다.
                </p>
                <div className="mt-6 grid gap-3">
                  {SAJU_PREMIUM_SECTIONS.map((item) => (
                    <div key={item} className="moon-payment-row px-4 py-3 text-sm leading-7 text-[var(--app-copy)]">
                      {item}
                    </div>
                  ))}
                </div>
              </article>
              <article className="moon-plan-card p-6" data-featured="true">
                <div className="font-display text-2xl text-[var(--app-gold-text)]">
                  평생 소장 기준서로 확장하기
                </div>
                <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
                  연간 전략 부록이 “올해의 흐름”이라면, 평생 소장 기준서는 “내 사주의 원본 해설서”입니다.
                  같은 근거를 쓰더라도 역할이 다르기 때문에, 원국 중심 기준서는 별도의 보관형 본문으로
                  나뉘어야 합니다.
                </p>
                <div className="mt-5 grid gap-3">
                  {SAJU_PREMIUM_VALUE_POINTS.map((item) => (
                    <div key={item} className="moon-payment-row px-4 py-3 text-sm leading-7 text-[var(--app-copy)]">
                      {item}
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-[1.2rem] border border-[var(--app-gold)]/18 bg-[rgba(255,255,255,0.02)] px-5 py-5 text-center">
                  <div className="font-display text-2xl text-[var(--app-gold-text)]">명리 기준서 · 49,000원</div>
                  <p className="mt-3 text-sm leading-7 text-[var(--app-copy-muted)]">
                    기준서 본문과 올해 부록을 함께 열고, 같은 명식으로 다시 들어와도 계속
                    읽으실 수 있습니다.
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    <Link
                      href={`/membership/checkout?plan=lifetime&slug=${encodedSlug}&from=saju-premium`}
                      className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-gold)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-bright)]"
                    >
                      기준서 열기
                    </Link>
                    <Link
                      href={`/saju/${slug}`}
                      className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-gold)]/35 bg-[var(--app-gold)]/12 px-5 text-sm text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/18"
                    >
                      기본 결과로 돌아가기
                    </Link>
                  </div>
                </div>
              </article>
              </section>
            </SwipeSectionSlide>
          </>
        ) : (
        <>
        <SwipeSectionSlide
          eyebrow="미리보기"
          title="명리 기준서 미리보기와 구매 선택"
          description="결제 전 확인할 내용과 기준서 열기 버튼을 한 화면에 모았습니다."
          navLabel="미리보기"
        >
        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="moon-lunar-panel p-6">
            <div className="app-starfield" />
            <div className="app-caption">결제 전 미리보기</div>
            <div className="mt-4 font-display text-2xl text-[var(--app-ivory)]">
              ① 기준서 첫 섹션 미리보기
            </div>
            <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
              선생님의 일주는 {sajuData.pillars.day.ganzi}입니다. {sajuData.dayMaster.metaphor ?? '자연의 상징'}이
              깊은 밤의 물결과 만나는 형상처럼, 밖으로는 밝고 따뜻하시지만 안쪽에는 사유의
              결이 함께 흐르는 모습입니다.
            </p>

            <div className="relative mt-6 overflow-hidden rounded-[1.3rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 py-5">
              <div className="select-none blur-[5px] opacity-65">
                <p className="text-sm leading-8 text-[var(--app-copy)]">
                  병화 일주의 특징은 태양이 그러하듯 숨김이 없는 성정입니다. 생각한 것을 곧 말로
                  꺼내시는 편이고, 한 번 마음을 정하면 곧장 움직이시는 추진력이 큰 장점으로
                  드러납니다. 다만 그 열기가 오래 이어지면 관계 속에서 피로를 만들 수도 있습니다.
                </p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-5xl text-[var(--app-gold-text)]/90">
                🔒
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {SAJU_PREMIUM_PREVIEW.map((item) => (
                <div
                  key={item.title}
                  className="moon-payment-row px-4 py-4"
                >
                  <div className="text-sm font-medium text-[var(--app-ivory)]">{item.title}</div>
                  <p className="mt-2 text-sm leading-7 text-[var(--app-copy-muted)]">{item.body}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="moon-plan-card p-6" data-featured="true">
            <div className="font-display text-2xl text-[var(--app-gold-text)]">
              7개 섹션 완성형 기준서
            </div>
            <div className="mt-5 grid gap-2">
              {SAJU_PREMIUM_SECTIONS.map((item) => (
                <div
                  key={item}
                  className="moon-payment-row px-4 py-3 text-sm text-[var(--app-copy)]"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[1.2rem] border border-[var(--app-gold)]/18 bg-[rgba(255,255,255,0.02)] px-5 py-5">
              <div className="app-caption">왜 여기서 기준서로 넘어가실까요?</div>
              <div className="mt-4 space-y-3">
                {SAJU_PREMIUM_VALUE_POINTS.map((item) => (
                  <div key={item} className="text-sm leading-7 text-[var(--app-copy)]">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-[1.2rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 py-5">
              <div className="app-caption">소장 가치</div>
              <div className="mt-4 grid gap-3">
                {[
                  '판정 근거와 본문이 함께 남는 PDF 저장본',
                  'MY 보관함에서 다시 여는 기준서 본문',
                  '업데이트 반영본을 나중에 다시 확인하는 재열람 구조',
                ].map((item) => (
                  <div key={item} className="text-sm leading-7 text-[var(--app-copy)]">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-[1.2rem] border border-[var(--app-gold)]/18 bg-[rgba(255,255,255,0.02)] px-5 py-5 text-center">
              <div className="font-display text-2xl text-[var(--app-gold-text)]">명리 기준서 · 49,000원</div>
              <p className="mt-3 text-sm leading-7 text-[var(--app-copy-muted)]">
                오늘 바로 7개 섹션 본문과 PDF 저장, MY 보관함 재열람, 이후 업데이트 반영이 함께 열립니다.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link
                  href={`/membership/checkout?plan=lifetime&slug=${encodedSlug}&from=saju-premium`}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-gold)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-bright)]"
                >
                  기준서 열기
                </Link>
                <Link
                  href={`/membership/checkout?plan=premium&slug=${encodedSlug}&from=saju-premium`}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-gold)]/35 bg-[var(--app-gold)]/12 px-5 text-sm text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/18"
                >
                  멤버십으로 먼저 보기
                </Link>
                <Link
                  href={REPORT_SAMPLE_HREF}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 text-sm text-[var(--app-copy)] transition-colors hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]"
                >
                  샘플 기준서 다시 보기
                </Link>
              </div>
            </div>
          </article>
        </section>
        </SwipeSectionSlide>
        <SwipeSectionSlide
          eyebrow="월간"
          title="달별로 보는 흐름"
          description="기준서 구매 전에도 월간 흐름 구조를 별도 화면에서 확인합니다."
          navLabel="달력"
        >
        <FortuneCalendarPanel slug={slug} targetYear={targetYear} hasLifetimeAccess={false} />
        </SwipeSectionSlide>
        </>
        )}
        </SwipeSectionDeck>
      </AppPage>
    </AppShell>
  );
}
