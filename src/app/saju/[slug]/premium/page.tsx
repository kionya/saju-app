import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import {
  SAJU_PREMIUM_SECTIONS,
  SAJU_PREMIUM_PREVIEW,
  SAJU_PREMIUM_VALUE_POINTS,
} from '@/content/moonlight';
import { buildSajuReport } from '@/domain/saju/report';
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

function compactStrings(strings: Array<string | null | undefined>) {
  return strings.filter((item): item is string => Boolean(item && item.trim().length > 0));
}

function buildUnlockedReportSections(reading: NonNullable<Awaited<ReturnType<typeof resolveReading>>>) {
  const { input, sajuData } = reading;
  const report = buildSajuReport(input, sajuData, 'today');

  return [
    {
      title: '1. 일주 본질',
      body: compactStrings([
        `선생님의 일주는 ${sajuData.pillars.day.ganzi}입니다.`,
        sajuData.dayMaster.metaphor
          ? `${sajuData.dayMaster.stem} 일간은 ${sajuData.dayMaster.metaphor}의 결을 지녀 삶의 방향을 읽을 때 이 상징을 먼저 봅니다.`
          : null,
        report.summaryHighlights[0],
      ]).join(' '),
    },
    ...report.evidenceCards.map((card, index) => ({
      title: `${index + 2}. ${card.label} · ${card.title}`,
      body: compactStrings([card.body, ...card.details.slice(0, 3)]).join(' '),
    })),
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
    title: '심층 리포트',
    description: '사주 심층 리포트 유료벽 화면입니다.',
    robots: { index: false, follow: false },
  };
}

export default async function SajuPremiumPage({ params }: Props) {
  const { slug } = await params;
  const reading = await resolveReading(slug);

  if (!reading) notFound();

  const { sajuData } = reading;
  const encodedSlug = encodeURIComponent(slug);
  let accessLabel: string | null = null;

  if (hasSupabaseServerEnv && hasSupabaseServiceEnv) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const [entitlement, subscription] = await Promise.all([
        getLifetimeReportEntitlement(user.id, slug),
        getManagedSubscription(user.id),
      ]);

      if (entitlement) {
        accessLabel = '평생 소장 권한';
      } else if (subscription && canUseSubscriptionForPremiumReport(subscription)) {
        accessLabel = subscription.plan === 'premium_monthly' ? '프리미엄 이용권' : 'Plus 이용권';
      }
    }
  }

  const unlockedSections = accessLabel ? buildUnlockedReportSections(reading) : [];

  return (
    <AppShell header={<SiteHeader />}>
      <AppPage className="space-y-6">
        <SajuScreenNav slug={slug} current="premium" />

        <section className="app-hero-card p-7 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-[var(--app-gold)]/28 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]">
              심층 리포트 · 미리보기
            </Badge>
          </div>
          <h1 className="mt-5 font-[var(--font-heading)] text-4xl text-[var(--app-ivory)] sm:text-5xl">
            나머지 6개 섹션, 전체 해석 보기
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--app-copy)]">
            격국, 용신, 대운, 세운을 포함한 일생의 큰 그림을 한 번에 열고, 평생 소장용 리포트로
            간직하실 수 있습니다.
          </p>
        </section>

        {accessLabel ? (
          <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <article className="app-panel p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="app-caption">심층 리포트 전체 열람</div>
                  <h2 className="mt-3 text-2xl font-semibold text-[var(--app-ivory)]">
                    7개 섹션이 열렸습니다
                  </h2>
                </div>
                <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
                  {accessLabel}
                </Badge>
              </div>
              <div className="mt-6 grid gap-4">
                {unlockedSections.map((section) => (
                  <article
                    key={section.title}
                    className="rounded-[1.25rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 py-5"
                  >
                    <h3 className="text-base font-semibold text-[var(--app-ivory)]">{section.title}</h3>
                    <p className="mt-3 text-sm leading-8 text-[var(--app-copy)]">{section.body}</p>
                  </article>
                ))}
              </div>
            </article>

            <aside className="rounded-[1.75rem] border border-[var(--app-gold)]/28 bg-[linear-gradient(180deg,rgba(210,176,114,0.12),rgba(10,18,36,0.96))] p-6">
              <div className="app-caption">저장형 리포트</div>
              <h2 className="mt-4 font-[var(--font-heading)] text-3xl text-[var(--app-gold-text)]">
                이 명식의 핵심 근거를 다시 펼쳐볼 수 있습니다
              </h2>
              <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
                현재 화면은 결제 또는 멤버십 권한을 확인한 뒤 보여주는 심층 본문입니다. 평생 소장 결제는
                같은 명식으로 다시 들어와도 계속 열람할 수 있습니다.
              </p>
              <div className="mt-6 grid gap-3">
                {SAJU_PREMIUM_VALUE_POINTS.map((item) => (
                  <div
                    key={item}
                    className="rounded-[1rem] border border-[var(--app-gold)]/14 bg-[rgba(255,255,255,0.02)] px-4 py-3 text-sm leading-7 text-[var(--app-copy)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/saju/${slug}`}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-gold)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-bright)]"
                >
                  기본 결과로 돌아가기
                </Link>
                <Link
                  href="/my/results"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-gold)]/35 bg-[var(--app-gold)]/12 px-5 text-sm text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/18"
                >
                  보관함 보기
                </Link>
              </div>
            </aside>
          </section>
        ) : (
        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="app-panel p-6">
            <div className="app-caption">미리보기</div>
            <div className="mt-4 font-[var(--font-heading)] text-2xl text-[var(--app-ivory)]">
              ① 일주(日柱) 본질
            </div>
            <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
              선생님의 일주는 {sajuData.pillars.day.ganzi}입니다. {sajuData.dayMaster.metaphor ?? '자연의 상징'}이
              깊은 밤의 물결과 만나는 형상처럼, 밖으로는 밝고 따뜻하시지만 안쪽에는 사유의
              결이 함께 흐르는 모습으로 읽힙니다.
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
                  className="rounded-[1.15rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-4"
                >
                  <div className="text-sm font-medium text-[var(--app-ivory)]">{item.title}</div>
                  <p className="mt-2 text-sm leading-7 text-[var(--app-copy-muted)]">{item.body}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[1.75rem] border border-[var(--app-gold)]/28 bg-[linear-gradient(180deg,rgba(210,176,114,0.12),rgba(10,18,36,0.96))] p-6">
            <div className="font-[var(--font-heading)] text-2xl text-[var(--app-gold-text)]">
              7개 섹션 완성본
            </div>
            <div className="mt-5 grid gap-2">
              {SAJU_PREMIUM_SECTIONS.map((item) => (
                <div
                  key={item}
                  className="rounded-[1rem] border border-[var(--app-gold)]/14 bg-[rgba(255,255,255,0.02)] px-4 py-3 text-sm text-[var(--app-copy)]"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[1.2rem] border border-[var(--app-gold)]/18 bg-[rgba(255,255,255,0.02)] px-5 py-5">
              <div className="app-caption">왜 여기서 심층으로 넘어가실까요?</div>
              <div className="mt-4 space-y-3">
                {SAJU_PREMIUM_VALUE_POINTS.map((item) => (
                  <div key={item} className="text-sm leading-7 text-[var(--app-copy)]">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-[1.2rem] border border-[var(--app-gold)]/18 bg-[rgba(255,255,255,0.02)] px-5 py-5 text-center">
              <div className="font-[var(--font-heading)] text-2xl text-[var(--app-gold-text)]">
                평생 소장하기 · 49,000원
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--app-copy-muted)]">
                오늘 바로 전체 7개 섹션이 열리고, 고전 원문 인용, PDF 저장, 이후 업데이트 반영까지 함께 포함됩니다.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link
                  href={`/membership/checkout?plan=lifetime&slug=${encodedSlug}`}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-gold)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-bright)]"
                >
                  완성형 리포트 열기
                </Link>
                <Link
                  href={`/membership/checkout?plan=premium&slug=${encodedSlug}`}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-gold)]/35 bg-[var(--app-gold)]/12 px-5 text-sm text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/18"
                >
                  월 구독으로 먼저 보기
                </Link>
              </div>
            </div>
          </article>
        </section>
        )}
      </AppPage>
    </AppShell>
  );
}
