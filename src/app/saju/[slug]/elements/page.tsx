import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import SajuScreenNav from '@/features/saju-detail/saju-screen-nav';
import SiteHeader from '@/features/shared-navigation/site-header';
import { resolveReading } from '@/lib/saju/readings';
import { ELEMENT_INFO } from '@/lib/saju/elements';
import type { Element } from '@/lib/saju/types';
import { AppPage, AppShell } from '@/shared/layout/app-shell';

interface Props {
  params: Promise<{ slug: string }>;
}

const ELEMENT_ORDER: Element[] = ['목', '화', '토', '금', '수'];
const ELEMENT_TONE: Record<Element, string> = {
  목: 'var(--app-jade)',
  화: 'var(--app-coral)',
  토: 'var(--app-gold-bright)',
  금: 'var(--app-copy-soft)',
  수: 'var(--app-sky)',
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '오행 균형',
    description: '사주 기본 해석 중 오행 균형 시각화 화면입니다.',
    robots: { index: false, follow: false },
  };
}

export default async function SajuElementsPage({ params }: Props) {
  const { slug } = await params;
  const reading = await resolveReading(slug);

  if (!reading) notFound();

  const { sajuData } = reading;

  return (
    <AppShell header={<SiteHeader />}>
      <AppPage className="space-y-6">
        <SajuScreenNav slug={slug} current="elements" />

        <section className="app-hero-card p-7 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-[var(--app-gold)]/25 bg-[var(--app-gold)]/10 text-[var(--app-gold-soft)]">
              사주 · 기본 해석
            </Badge>
          </div>
          <h1 className="mt-5 font-[var(--font-heading)] text-4xl text-[var(--app-ivory)] sm:text-5xl">
            오행(五行) 균형
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--app-copy)]">
            당신 안의 다섯 기운이 어떻게 흐르는지 시각적으로 읽고, 부족한 것과 넘치는 것을
            생활 속 작은 습관으로 조율하는 화면입니다.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
          <article className="app-panel p-6">
            <div className="space-y-5">
              {ELEMENT_ORDER.map((element) => {
                const value = sajuData.fiveElements.byElement[element];
                const width = Math.max(0, Math.min(100, Math.round(value.percentage)));

                return (
                  <div key={element}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span style={{ color: ELEMENT_TONE[element] }}>
                        {ELEMENT_INFO[element].name}
                      </span>
                      <span className="text-[var(--app-ivory)]">
                        {width}%
                        {sajuData.fiveElements.dominant === element ? (
                          <span className="ml-2 text-xs text-[var(--app-gold-soft)]">주도</span>
                        ) : null}
                        {sajuData.fiveElements.weakest === element ? (
                          <span className="ml-2 text-xs text-[var(--app-coral)]">부족</span>
                        ) : null}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--app-line)]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${width}%`,
                          background: ELEMENT_TONE[element],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="space-y-4">
            <div className="app-panel p-6">
              <p className="text-sm leading-8 text-[var(--app-copy)]">
                선생님의 사주는{' '}
                <span className="text-[var(--app-gold-soft)]">
                  {ELEMENT_INFO[sajuData.fiveElements.dominant].name}
                </span>
                의 기운이 주도하고,{' '}
                <span className="text-[var(--app-coral)]">
                  {ELEMENT_INFO[sajuData.fiveElements.weakest].name}
                </span>
                의 자리가 상대적으로 비어 있습니다. 따뜻함과 추진력이 강한 대신, 한 번씩 마음을
                다잡는 단단함과 정리의 힘을 보강해주면 균형이 좋아집니다.
              </p>
            </div>

            <div className="rounded-[1.35rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 py-5">
              <div className="app-caption">균형을 위한 작은 습관</div>
              <div className="mt-4 grid gap-2">
                {[
                  '흰색·은색 아이템을 가까이 두기',
                  '서쪽·북쪽 방향에서 짧게 쉬기',
                  '금속 소재의 식기나 장신구 활용하기',
                  '가을 저녁 산책처럼 기운을 가라앉히는 시간 만들기',
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[1rem] border border-[var(--app-line)] bg-[rgba(255,255,255,0.02)] px-4 py-3 text-sm text-[var(--app-copy)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </article>
        </section>

        <section className="flex flex-wrap gap-3">
          <Link
            href={`/saju/${slug}/nature`}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 text-sm text-[var(--app-copy)] transition-colors hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]"
          >
            이전
          </Link>
          <Link
            href={`/saju/${slug}/premium`}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-gold)]/35 bg-[var(--app-gold)]/16 px-5 text-sm font-semibold text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/22"
          >
            다음: 심층 리포트
          </Link>
        </section>
      </AppPage>
    </AppShell>
  );
}
