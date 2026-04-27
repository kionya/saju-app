import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ZODIAC_BLUEPRINT,
  ZODIAC_META,
} from '@/content/moonlight';
import SiteHeader from '@/features/shared-navigation/site-header';
import { ZODIAC_FORTUNES } from '@/lib/free-content-pages';
import { getOptionalSignedInProfile } from '@/lib/profile';
import { buildProfileReadingSlug, buildZodiacSlugFromProfile } from '@/lib/profile-personalization';
import { AppShell } from '@/shared/layout/app-shell';

interface Props {
  params: Promise<{ slug: string }>;
}

function getZodiac(slug: string) {
  return ZODIAC_FORTUNES.find((item) => item.slug === slug);
}

export async function generateStaticParams() {
  return ZODIAC_FORTUNES.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = getZodiac(slug);

  if (!item) return { title: '띠별 운세' };

  return {
    title: `${item.label} 운세`,
    description: `${item.label}의 연운 메시지와 오늘의 포인트를 함께 보는 달빛선생의 띠별 상세 화면입니다.`,
    alternates: {
      canonical: `/zodiac/${item.slug}`,
    },
  };
}

export default async function ZodiacDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = getZodiac(slug);

  if (!item) notFound();

  const profile = await getOptionalSignedInProfile();
  const personalizedSlug = buildZodiacSlugFromProfile(profile);
  const readingSlug = buildProfileReadingSlug(profile);
  const personalizedItem =
    personalizedSlug ? ZODIAC_FORTUNES.find((entry) => entry.slug === personalizedSlug) ?? null : null;
  const isPersonalizedMatch = personalizedSlug === item.slug;
  const meta = ZODIAC_META[item.slug as keyof typeof ZODIAC_META];
  const relatedItems = ZODIAC_FORTUNES.filter((entry) => entry.slug !== item.slug).slice(0, 3);

  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-12">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="app-hero-card p-7 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-[var(--app-gold)]/28 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]">
              {meta.symbol} {item.label}
            </Badge>
            <Badge className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]">
              {item.years}
            </Badge>
          </div>
          <h1 className="mt-5 font-[var(--font-heading)] text-4xl text-[var(--app-ivory)] sm:text-5xl">
            {item.label}의 {ZODIAC_BLUEPRINT.yearlyLabel}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--app-copy)]">
            {meta.yearlyMessage}. 오늘의 포인트와 올해의 기조를 함께 놓고 보시면, 급한 판단보다 생활의 리듬을 더 편안하게 가다듬으실 수 있습니다.
          </p>
          {personalizedItem ? (
            <div className="mt-5 rounded-[1.2rem] border border-[var(--app-gold)]/24 bg-[var(--app-gold)]/10 px-4 py-4 text-sm leading-7 text-[var(--app-copy)]">
              {isPersonalizedMatch ? (
                <>
                  저장된 MY 프로필 기준으로 보면 선생님의 띠는 <strong>{personalizedItem.label}</strong>
                  입니다. 지금 보고 계신 흐름이 바로 선생님 기준 연운입니다.
                </>
              ) : (
                <>
                  저장된 MY 프로필 기준으로는 <strong>{personalizedItem.label}</strong>가 선생님의 띠입니다.
                  지금은 <strong>{item.label}</strong> 흐름을 비교해서 보고 계십니다.
                </>
              )}
            </div>
          ) : null}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
          <article className="app-panel p-6 text-center">
            <div className="text-7xl">{meta.symbol}</div>
            <div className="mt-4 font-[var(--font-heading)] text-3xl text-[var(--app-gold-text)]">
              {item.label}
            </div>
            <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">{meta.yearlyMessage}</p>
          </article>

          <article className="space-y-4">
            <div className="app-panel p-6">
              <div className="app-caption">오늘 집중 포인트</div>
              <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">{item.todayFocus}</p>
            </div>

            <div className="app-panel p-6">
              <div className="app-caption">행동 제안</div>
              <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">{item.action}</p>
            </div>

            <div className="rounded-[1.45rem] border border-[var(--app-gold)]/24 bg-[var(--app-surface-muted)] px-5 py-5">
              <div className="app-caption">연운과 월운 읽는 법</div>
              <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
                띠별 운세는 연운으로 큰 방향을 보고, 월운으로 당장 조정할 생활 리듬을 읽는 데
                잘 어울립니다. 큰 결정보다는 관계, 일정, 소비의 우선순위를 고를 때 특히 더 도움이 됩니다.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {personalizedItem && !isPersonalizedMatch ? (
                <Link href={`/zodiac/${personalizedItem.slug}`}>
                  <Button className="rounded-full bg-[var(--app-gold)] px-6 text-[var(--app-bg)] hover:bg-[var(--app-gold-bright)]">
                    내 띠로 돌아가기
                  </Button>
                </Link>
              ) : null}
              <Link href={readingSlug ? `/saju/${readingSlug}` : '/saju/new'}>
                <Button className="rounded-full bg-[var(--app-gold)] px-6 text-[var(--app-bg)] hover:bg-[var(--app-gold-bright)]">
                  {readingSlug ? '내 사주로 이어보기' : '맞춤 사주로 이어보기'}
                </Button>
              </Link>
              <Link href="/zodiac">
                <Button
                  variant="outline"
                  className="rounded-full border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-ivory)] hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]"
                >
                  띠별 목록으로 돌아가기
                </Button>
              </Link>
            </div>
          </article>
        </section>

        <section className="mt-8">
          <div className="mb-5 app-caption">다른 띠도 보기</div>
          <div className="grid gap-4 md:grid-cols-3">
            {relatedItems.map((entry) => {
              const relatedMeta = ZODIAC_META[entry.slug as keyof typeof ZODIAC_META];

              return (
                <Link
                  key={entry.slug}
                  href={`/zodiac/${entry.slug}`}
                  className="app-panel block p-6 transition-colors hover:bg-[var(--app-surface-strong)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{relatedMeta.symbol}</div>
                    <div className="font-[var(--font-heading)] text-2xl text-[var(--app-ivory)]">
                      {entry.label}
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[var(--app-copy-muted)]">
                    {relatedMeta.yearlyMessage}
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
