import Link from 'next/link';
import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ZODIAC_BLUEPRINT,
  ZODIAC_META,
} from '@/content/moonlight';
import SiteHeader from '@/features/shared-navigation/site-header';
import { WisdomCategoryHero } from '@/features/shared-navigation/wisdom-category-hero';
import { ZODIAC_FORTUNES } from '@/lib/free-content-pages';
import { AppShell } from '@/shared/layout/app-shell';

export const metadata: Metadata = {
  title: '띠별 운세',
  description:
    '12띠 전체의 흐름과 연운 메시지를 한 화면에서 차분히 살펴보세요.',
  alternates: {
    canonical: '/zodiac',
  },
};

export default function ZodiacPage() {
  const featured =
    ZODIAC_FORTUNES.find((item) => item.slug === ZODIAC_BLUEPRINT.highlightedSlug) ??
    ZODIAC_FORTUNES[0];
  const featuredMeta = ZODIAC_META[featured.slug as keyof typeof ZODIAC_META];

  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-12">
      <div className="wisdom-category-page">
        <WisdomCategoryHero slug="zodiac" />
        <div className="wisdom-category-body">
        <section className="mt-8 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <article className="app-panel p-6 text-center">
            <div className="text-6xl">{featuredMeta.symbol}</div>
            <div className="mt-4 font-[var(--font-heading)] text-3xl text-[var(--app-gold-text)]">
              선생님은 {featured.label}
            </div>
            <div className="mt-2 text-sm tracking-[0.22em] text-[var(--app-copy-muted)]">
              {featured.years}
            </div>
            <div className="mt-6 rounded-[1.35rem] border border-[var(--app-gold)]/24 bg-[var(--app-surface-muted)] px-5 py-5">
              <div className="app-caption">{featured.label}의 2026년</div>
              <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
                {featuredMeta.yearlyMessage}. 봄에는 새로운 배움과 관계의 움직임이, 가을에는 그동안
                준비한 결실이 차분히 드러나는 흐름입니다.
              </p>
            </div>
          </article>

          <article className="app-panel p-6">
            <div className="app-caption">다른 띠 보기</div>
            <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {ZODIAC_FORTUNES.map((item) => {
                const meta = ZODIAC_META[item.slug as keyof typeof ZODIAC_META];
                const active = item.slug === featured.slug;
                const currentYear = item.slug === 'horse';

                return (
                  <Link
                    key={item.slug}
                    href={`/zodiac/${item.slug}`}
                    className="moon-zodiac-item"
                    data-active={active ? 'true' : undefined}
                    data-year={currentYear ? 'true' : undefined}
                  >
                    <div className="text-3xl">{meta.symbol}</div>
                    <div className="mt-2 text-sm font-medium text-[var(--app-ivory)]">
                      {item.label.replace('띠', '')}
                    </div>
                    <div className="mt-1 text-[11px] text-[var(--app-copy-muted)]">
                      {currentYear ? '태세' : '보기'}
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-6 rounded-[1.35rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 py-5">
              <div className="app-caption">오늘의 포인트</div>
              <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">{featured.todayFocus}</p>
              <p className="mt-3 text-sm leading-8 text-[var(--app-copy-muted)]">
                {featured.action}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/zodiac/${featured.slug}`}>
                <Button className="rounded-full bg-[var(--app-gold)] px-6 text-[var(--app-bg)] hover:bg-[var(--app-gold-bright)]">
                  {featured.label} 자세히 보기
                </Button>
              </Link>
              <Link href="/saju/new">
                <Button
                  variant="outline"
                  className="rounded-full border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-ivory)] hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]"
                >
                  맞춤 사주 보기
                </Button>
              </Link>
            </div>
          </article>
        </section>

        <section className="mt-8 app-panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-[var(--font-heading)] text-3xl text-[var(--app-ivory)]">
              12띠 연운 한 줄
            </h2>
            <Badge className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]">
              2026년 총운
            </Badge>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {ZODIAC_FORTUNES.map((item) => {
              const meta = ZODIAC_META[item.slug as keyof typeof ZODIAC_META];

              return (
                <article
                  key={item.slug}
                  className="rounded-[1.2rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{meta.symbol}</div>
                    <div className="font-[var(--font-heading)] text-xl text-[var(--app-ivory)]">
                      {item.label}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--app-copy-muted)]">
                    {meta.yearlyMessage}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
        </div>
      </div>
    </AppShell>
  );
}
