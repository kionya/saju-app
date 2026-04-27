import Link from 'next/link';
import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  STAR_SIGN_BLUEPRINT,
  STAR_SIGN_META,
} from '@/content/moonlight';
import SiteHeader from '@/features/shared-navigation/site-header';
import { WisdomCategoryHero } from '@/features/shared-navigation/wisdom-category-hero';
import { STAR_SIGN_FORTUNES } from '@/lib/free-content-pages';
import { getOptionalSignedInProfile } from '@/lib/profile';
import { buildProfileReadingSlug, buildStarSignSlugFromProfile } from '@/lib/profile-personalization';
import { AppShell } from '@/shared/layout/app-shell';

export const metadata: Metadata = {
  title: '별자리',
  description:
    '별자리 메인 화면에서 오늘의 별자리와 사주 크로스 관점을 함께 읽어보세요.',
  alternates: {
    canonical: '/star-sign',
  },
};

export default async function StarSignPage() {
  const profile = await getOptionalSignedInProfile();
  const personalizedSlug = buildStarSignSlugFromProfile(profile);
  const readingSlug = buildProfileReadingSlug(profile);
  const featured =
    STAR_SIGN_FORTUNES.find(
      (item) => item.slug === (personalizedSlug ?? STAR_SIGN_BLUEPRINT.featuredSlug)
    ) ??
    STAR_SIGN_FORTUNES[0];

  const featuredMeta = STAR_SIGN_META[featured.slug as keyof typeof STAR_SIGN_META];
  const hasPersonalizedProfile = Boolean(profile && personalizedSlug);

  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-12">
      <div className="wisdom-category-page">
        <WisdomCategoryHero slug="star-sign" />
        <div className="wisdom-category-body">
        <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="app-panel p-6 text-center">
            <div className="text-6xl">{featuredMeta.symbol}</div>
            <div className="mt-4 font-[var(--font-heading)] text-3xl text-[var(--app-plum)]">
              {hasPersonalizedProfile ? `선생님은 ${featured.label}` : featured.label}
            </div>
            <div className="mt-2 text-sm tracking-[0.22em] text-[var(--app-copy-muted)]">
              {featured.dateRange}
            </div>
            <div className="moon-lunar-panel mt-6 rounded-[1.3rem] border-[var(--app-plum)]/22 px-5 py-5">
              <div className="app-caption">
                {hasPersonalizedProfile ? 'MY 프로필 기준 별자리' : '오늘의 별자리'}
              </div>
              <div className="mt-4 font-[var(--font-heading)] text-2xl leading-[1.5] text-[var(--app-ivory)]">
                {featured.summary}
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--app-copy-muted)]">
                {featured.action}
              </p>
            </div>
          </article>

          <article className="space-y-4">
            {hasPersonalizedProfile ? (
              <div className="rounded-[1.35rem] border border-[var(--app-sky)]/26 bg-[var(--app-sky)]/10 px-5 py-5">
                <div className="app-caption">약한 개인화 연결</div>
                <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
                  저장된 MY 프로필 생일 기준으로 선생님의 별자리를 먼저 보여드렸습니다.
                  별자리 흐름은 가볍게 읽고, 더 깊은 흐름은 사주 결과로 이어보시는 구성이 가장
                  자연스럽습니다.
                </p>
              </div>
            ) : null}

            <div className="app-panel p-6">
              <div className="app-caption">이번 주 흐름</div>
              <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
                관계와 감정의 결을 읽기 좋은 주간입니다. 특히 중반에는 대화와 연락의 흐름이
                부드럽게 이어지고, 후반에는 혼자 정리하는 시간이 오히려 좋은 선택을 돕습니다.
              </p>
            </div>

            <div className="moon-lunar-panel rounded-[1.45rem] border-[var(--app-gold)]/24 px-5 py-5">
              <div className="app-caption">별자리 × 사주 크로스</div>
              <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
                서양은 선생님을 {featured.label}의 직관과 감수성으로 읽고, 동양은 태어난 시각의
                오행과 일간으로 중심 기운을 읽습니다. {STAR_SIGN_BLUEPRINT.cross}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href={`/star-sign/${featured.slug}`}>
                <Button className="rounded-full bg-[var(--app-plum)] px-6 text-white hover:opacity-90">
                  {hasPersonalizedProfile ? '내 별자리 바로 보기' : '별자리 흐름 자세히 보기'}
                </Button>
              </Link>
              <Link href={readingSlug ? `/saju/${readingSlug}` : '/saju/new'}>
                <Button
                  variant="outline"
                  className="rounded-full border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-ivory)] hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]"
                >
                  {readingSlug ? '내 사주와 함께 보기' : '사주와 함께 보기'}
                </Button>
              </Link>
            </div>
          </article>
        </section>

        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <div className="app-caption">12별자리</div>
              <h2 className="mt-2 font-[var(--font-heading)] text-3xl text-[var(--app-ivory)]">
                각 별자리의 한 줄 인상
              </h2>
            </div>
            <Badge className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]">
              오늘 마음에 닿는 한 줄
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {STAR_SIGN_FORTUNES.map((item) => {
              const meta = STAR_SIGN_META[item.slug as keyof typeof STAR_SIGN_META];

              return (
                <Link
                  key={item.slug}
                  href={`/star-sign/${item.slug}`}
                  className="moon-wisdom-link-card"
                  data-tone="sky"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{meta.symbol}</div>
                    <div>
                      <div className="font-[var(--font-heading)] text-2xl text-[var(--app-ivory)]">
                        {item.label}
                      </div>
                      <div className="text-sm text-[var(--app-copy-muted)]">{item.dateRange}</div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[var(--app-copy)]">
                    {meta.seniorCopy}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[var(--app-copy-muted)]">
                    {item.todayFocus}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
        </div>
      </div>
    </AppShell>
  );
}
