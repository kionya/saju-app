import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  STAR_SIGN_BLUEPRINT,
  STAR_SIGN_META,
} from '@/content/moonlight';
import SiteHeader from '@/features/shared-navigation/site-header';
import { STAR_SIGN_FORTUNES } from '@/lib/free-content-pages';
import { getOptionalSignedInProfile } from '@/lib/profile';
import { buildProfileReadingSlug, buildStarSignSlugFromProfile } from '@/lib/profile-personalization';
import { AppShell } from '@/shared/layout/app-shell';

interface Props {
  params: Promise<{ slug: string }>;
}

function getStarSign(slug: string) {
  return STAR_SIGN_FORTUNES.find((item) => item.slug === slug);
}

export async function generateStaticParams() {
  return STAR_SIGN_FORTUNES.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = getStarSign(slug);

  if (!item) {
    return { title: '별자리' };
  }

  return {
    title: `${item.label} 별자리`,
    description: `${item.label}의 오늘 흐름과 사주 크로스 관점을 함께 보는 달빛선생의 별자리 상세 화면입니다.`,
    alternates: {
      canonical: `/star-sign/${item.slug}`,
    },
  };
}

export default async function StarSignDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = getStarSign(slug);

  if (!item) notFound();

  const profile = await getOptionalSignedInProfile();
  const personalizedSlug = buildStarSignSlugFromProfile(profile);
  const readingSlug = buildProfileReadingSlug(profile);
  const personalizedItem =
    personalizedSlug
      ? STAR_SIGN_FORTUNES.find((entry) => entry.slug === personalizedSlug) ?? null
      : null;
  const isPersonalizedMatch = personalizedSlug === item.slug;
  const meta = STAR_SIGN_META[item.slug as keyof typeof STAR_SIGN_META];
  const relatedItems = STAR_SIGN_FORTUNES.filter((entry) => entry.slug !== item.slug).slice(0, 3);

  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-12">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="app-hero-card p-7 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-[var(--app-plum)]/28 bg-[var(--app-plum)]/10 text-[var(--app-plum)]">
              {meta.symbol} {item.label}
            </Badge>
            <Badge className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]">
              {item.dateRange}
            </Badge>
          </div>
          <h1 className="mt-5 font-[var(--font-heading)] text-4xl text-[var(--app-ivory)] sm:text-5xl">
            {item.label}에게 오늘 별빛이 전하는 말
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--app-copy)]">
            {item.summary} 달빛선생은 이 흐름을 “{meta.seniorCopy}”라는 한 문장으로 먼저
            받아들인 뒤, 오늘의 감정선과 선택의 온도를 차분히 읽어드립니다.
          </p>
          {personalizedItem ? (
            <div className="mt-5 rounded-[1.2rem] border border-[var(--app-sky)]/24 bg-[var(--app-sky)]/10 px-4 py-4 text-sm leading-7 text-[var(--app-copy)]">
              {isPersonalizedMatch ? (
                <>
                  저장된 MY 프로필 기준으로 보면 선생님의 별자리는 <strong>{personalizedItem.label}</strong>
                  입니다. 지금 보고 계신 상세 해석이 바로 선생님 기준 흐름입니다.
                </>
              ) : (
                <>
                  저장된 MY 프로필 기준으로는 <strong>{personalizedItem.label}</strong>이 선생님의
                  별자리입니다. 지금은 <strong>{item.label}</strong> 흐름을 비교해서 보고 계십니다.
                </>
              )}
            </div>
          ) : null}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.94fr_1.06fr]">
          <article className="app-panel p-6 text-center">
            <div className="text-7xl">{meta.symbol}</div>
            <div className="mt-4 font-[var(--font-heading)] text-3xl text-[var(--app-plum)]">
              {item.label}
            </div>
            <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
              {item.todayFocus}
            </p>
          </article>

          <article className="space-y-4">
            <div className="app-panel p-6">
              <div className="app-caption">오늘의 별자리</div>
              <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">{item.summary}</p>
            </div>

            <div className="app-panel p-6">
              <div className="app-caption">행동 제안</div>
              <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">{item.action}</p>
            </div>

            <div className="rounded-[1.45rem] border border-[var(--app-gold)]/28 bg-[linear-gradient(135deg,rgba(210,176,114,0.12),rgba(166,124,181,0.08))] px-5 py-5">
              <div className="app-caption">별자리 × 사주 크로스</div>
              <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
                별자리는 선생님의 감수성과 관계 온도를 빠르게 읽고, 사주는 태어난 순간의 큰
                구조와 반복 패턴을 읽습니다. {STAR_SIGN_BLUEPRINT.cross}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {personalizedItem && !isPersonalizedMatch ? (
                <Link href={`/star-sign/${personalizedItem.slug}`}>
                  <Button className="rounded-full bg-[var(--app-plum)] px-6 text-white hover:opacity-90">
                    내 별자리로 돌아가기
                  </Button>
                </Link>
              ) : null}
              <Link href={readingSlug ? `/saju/${readingSlug}` : '/saju/new'}>
                <Button className="rounded-full bg-[var(--app-gold)] px-6 text-[var(--app-bg)] hover:bg-[var(--app-gold-bright)]">
                  {readingSlug ? '내 사주와 함께 보기' : '사주와 함께 보기'}
                </Button>
              </Link>
              <Link href="/star-sign">
                <Button
                  variant="outline"
                  className="rounded-full border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-ivory)] hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]"
                >
                  별자리 목록으로 돌아가기
                </Button>
              </Link>
            </div>
          </article>
        </section>

        <section className="mt-8">
          <div className="mb-5 app-caption">다른 별자리도 보기</div>
          <div className="grid gap-4 md:grid-cols-3">
            {relatedItems.map((entry) => {
              const relatedMeta = STAR_SIGN_META[entry.slug as keyof typeof STAR_SIGN_META];

              return (
                <Link
                  key={entry.slug}
                  href={`/star-sign/${entry.slug}`}
                  className="app-panel block p-6 transition-colors hover:bg-[var(--app-surface-strong)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{relatedMeta.symbol}</div>
                    <div>
                      <div className="font-[var(--font-heading)] text-2xl text-[var(--app-ivory)]">
                        {entry.label}
                      </div>
                      <div className="text-sm text-[var(--app-copy-muted)]">{entry.dateRange}</div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[var(--app-copy-muted)]">
                    {entry.summary}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
