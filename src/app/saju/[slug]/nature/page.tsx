import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import SajuScreenNav from '@/features/saju-detail/saju-screen-nav';
import { formatBirthSummary } from '@/features/saju-detail/saju-screen-helpers';
import SiteHeader from '@/features/shared-navigation/site-header';
import { resolveReading } from '@/lib/saju/readings';
import { AppPage, AppShell } from '@/shared/layout/app-shell';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '타고난 성정',
    description: '사주 기본 해석 중 타고난 성정 화면입니다.',
    robots: { index: false, follow: false },
  };
}

export default async function SajuNaturePage({ params }: Props) {
  const { slug } = await params;
  const reading = await resolveReading(slug);

  if (!reading) notFound();

  const { input, sajuData } = reading;
  const metaphor = sajuData.dayMaster.metaphor ?? '자연의 상징';
  const description =
    sajuData.dayMaster.description ??
    '선생님의 기질은 자연의 리듬처럼 밝음과 고요함이 함께 흐르는 모습입니다.';

  return (
    <AppShell header={<SiteHeader />}>
      <AppPage className="space-y-6">
        <SajuScreenNav slug={slug} current="nature" />

        <section className="app-hero-card p-7 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-[var(--app-gold)]/25 bg-[var(--app-gold)]/10 text-[var(--app-gold-soft)]">
              사주 · 기본 해석
            </Badge>
            <Badge className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]">
              {formatBirthSummary(input)}
            </Badge>
          </div>
          <h1 className="mt-5 font-[var(--font-heading)] text-4xl text-[var(--app-ivory)] sm:text-5xl">
            타고난 성정 (性情)
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--app-copy)]">
            자연물의 비유로 먼저 읽고, 그 안의 기질과 유의점을 함께 짚어드리는 화면입니다.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.84fr_1.16fr]">
          <article className="app-panel p-6 text-center">
            <div className="font-[var(--font-heading)] text-6xl text-[var(--app-gold-text)]">
              {sajuData.dayMaster.stem}
            </div>
            <div className="mt-4 text-lg text-[var(--app-ivory)]">
              {sajuData.dayMaster.stem}
              {sajuData.dayMaster.element}
            </div>
            <div className="mt-2 text-xs tracking-[0.3em] text-[var(--app-gold)]/72">
              {metaphor}
            </div>
          </article>

          <article className="space-y-4">
            <div className="app-panel p-6">
              <p className="text-sm leading-8 text-[var(--app-copy)]">
                선생님의 본질은 <span className="text-[var(--app-gold-soft)]">{metaphor}</span>과
                같습니다. {description}
              </p>
            </div>

            <div className="rounded-[1.35rem] border-l-[3px] border-[var(--app-gold)]/45 bg-[var(--app-surface-muted)] px-5 py-5">
              <div className="app-caption">양면의 지혜</div>
              <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
                빛이 강한 만큼 그림자도 또렷하게 드러납니다. 좋은 점은 따뜻함과 추진력이지만,
                감정이 먼저 나가거나 표현이 강해질 수 있으니 한 템포 쉬는 여유가 큰 힘이 됩니다.
              </p>
            </div>

            <div className="app-panel p-6">
              <div className="app-caption">참고 고전</div>
              <div className="mt-4 rounded-[1rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-4">
                <div className="font-[var(--font-heading)] text-lg text-[var(--app-gold-soft)]">
                  適天髓闡微 · 天干論
                </div>
                <div className="mt-3 font-[var(--font-heading)] text-xl leading-8 text-[var(--app-ivory)]">
                  五陽皆陽丙爲最
                </div>
                <p className="mt-2 text-sm leading-7 text-[var(--app-copy-muted)]">
                  “다섯 양간 중 병화가 가장 양이다”라는 고전 문장처럼, 밝고 외향적인 힘을 먼저
                  읽는 방식으로 성정을 풀어냅니다.
                </p>
              </div>
            </div>
          </article>
        </section>

        <section className="flex flex-wrap gap-3">
          <Link
            href={`/saju/${slug}/overview`}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 text-sm text-[var(--app-copy)] transition-colors hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]"
          >
            이전
          </Link>
          <Link
            href={`/saju/${slug}/elements`}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-gold)]/35 bg-[var(--app-gold)]/16 px-5 text-sm font-semibold text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/22"
          >
            다음: 오행
          </Link>
        </section>
      </AppPage>
    </AppShell>
  );
}
