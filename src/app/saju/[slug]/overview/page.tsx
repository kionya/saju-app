import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import {
  SAJU_BASIC_SECTIONS,
  SAJU_PREMIUM_SECTIONS,
} from '@/content/moonlight';
import SajuScreenNav from '@/features/saju-detail/saju-screen-nav';
import {
  formatBirthSummary,
  formatHiddenStems,
  getPillarEntries,
} from '@/features/saju-detail/saju-screen-helpers';
import SiteHeader from '@/features/shared-navigation/site-header';
import { resolveReading } from '@/lib/saju/readings';
import { AppPage, AppShell } from '@/shared/layout/app-shell';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '사주',
    description: '사주 원국과 기본 해석 진입 화면입니다.',
    robots: { index: false, follow: false },
  };
}

export default async function SajuOverviewPage({ params }: Props) {
  const { slug } = await params;
  const reading = await resolveReading(slug);

  if (!reading) notFound();

  const { input, sajuData } = reading;
  const pillars = getPillarEntries(sajuData);

  return (
    <AppShell header={<SiteHeader />}>
      <AppPage className="space-y-6">
        <SajuScreenNav slug={slug} current="overview" />

        <section className="app-hero-card p-7 sm:p-8">
          <div className="text-center">
            <div className="text-[11px] tracking-[0.5em] text-[var(--app-gold)]/72">四 柱</div>
            <h1 className="mt-4 font-[var(--font-heading)] text-4xl font-semibold text-[var(--app-gold-text)] sm:text-5xl">
              사주
            </h1>
            <p className="mt-4 text-base leading-8 text-[var(--app-copy)]">
              당신이 태어난 네 기둥, 하늘과 땅과 날과 시의 이야기입니다.
            </p>
          </div>
        </section>

        <section className="app-panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="app-caption">{formatBirthSummary(input)}</div>
              <h2 className="mt-3 font-[var(--font-heading)] text-3xl text-[var(--app-ivory)]">
                선생님의 四柱
              </h2>
            </div>
            <Badge className="border-[var(--app-gold)]/25 bg-[var(--app-gold)]/10 text-[var(--app-gold-soft)]">
              일간 {sajuData.dayMaster.stem}
            </Badge>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {pillars.map(({ label, pillar }) => (
              <article
                key={label}
                className={`rounded-[1.2rem] border px-4 py-4 text-center ${
                  label === '일'
                    ? 'border-[var(--app-gold)]/38 bg-[var(--app-gold)]/14'
                    : 'border-[var(--app-line)] bg-[var(--app-surface-muted)]'
                }`}
              >
                <div className="text-xs tracking-[0.22em] text-[var(--app-copy-soft)]">{label}</div>
                <div className="mt-3 font-[var(--font-heading)] text-3xl text-[var(--app-ivory)]">
                  {pillar?.ganzi ?? '미상'}
                </div>
                <div className="mt-2 text-sm text-[var(--app-copy-muted)]">
                  {formatHiddenStems(pillar) ?? '지장간 미표시'}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-[1.3rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 py-5 text-sm leading-8 text-[var(--app-copy)]">
            일간 <span className="text-[var(--app-gold-soft)]">{sajuData.dayMaster.stem}</span>은{' '}
            {sajuData.dayMaster.metaphor ?? '자연의 상징'}로 읽습니다. {sajuData.dayMaster.description}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_0.96fr]">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-[var(--font-heading)] text-3xl text-[var(--app-ivory)]">
                기본 해석
              </h2>
              <Badge className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]">
                무료
              </Badge>
            </div>

            {SAJU_BASIC_SECTIONS.map((section, index) => (
              <Link
                key={section.slug}
                href={
                  section.slug === 'nature'
                    ? `/saju/${slug}/nature`
                    : section.slug === 'elements'
                      ? `/saju/${slug}/elements`
                      : `/saju/${slug}`
                }
                className="app-panel block p-6 transition-colors hover:bg-[var(--app-surface-strong)]"
              >
                <div className="app-caption">{String(index + 1).padStart(2, '0')}</div>
                <div className="mt-3 text-2xl font-semibold text-[var(--app-ivory)]">
                  {section.title}
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--app-copy-muted)]">
                  {section.description}
                </p>
              </Link>
            ))}
          </div>

          <article className="rounded-[1.75rem] border border-[var(--app-gold)]/28 bg-[linear-gradient(180deg,rgba(210,176,114,0.12),rgba(10,18,36,0.96))] p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="font-[var(--font-heading)] text-2xl text-[var(--app-gold-text)]">
                심층 리포트
              </div>
              <Badge className="border-[var(--app-gold)]/28 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]">
                PREMIUM
              </Badge>
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--app-copy)]">
              7가지 항목을 평생 소장용 리포트로 정리합니다. 격국, 용신, 대운, 세운, 분야별
              조망까지 한 번에 이어집니다.
            </p>

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

            <div className="mt-6">
              <Link
                href={`/saju/${slug}/premium`}
                className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-gold)]/35 bg-[var(--app-gold)]/16 px-5 text-sm font-semibold text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/22"
              >
                자세히 보기
              </Link>
            </div>
          </article>
        </section>
      </AppPage>
    </AppShell>
  );
}
