import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import SiteHeader from '@/features/shared-navigation/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ZODIAC_FORTUNES } from '@/lib/free-content-pages';

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

  if (!item) {
    return {
      title: '띠별 운세',
    };
  }

  return {
    title: `${item.label} 운세`,
    description: `${item.label} 오늘의 흐름과 집중 포인트를 가볍게 보는 무료 띠별 운세 페이지입니다.`,
    alternates: {
      canonical: `/zodiac/${item.slug}`,
    },
  };
}

export default async function ZodiacDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = getZodiac(slug);
  if (!item) notFound();

  const relatedItems = ZODIAC_FORTUNES.filter((entry) => entry.slug !== item.slug).slice(0, 3);

  return (
    <main className="min-h-screen bg-[#020817] text-white">
      <SiteHeader />

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <section className="rounded-[32px] border border-[#d2b072]/18 bg-[linear-gradient(180deg,rgba(7,19,39,0.94),rgba(10,18,36,0.96))] p-7">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-[#d2b072]/30 bg-[#d2b072]/10 text-[#f5dfaa]">
              띠별 운세 상세
            </Badge>
            <Badge className="border-white/10 bg-white/5 text-white/62">
              {item.years}
            </Badge>
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[#f8f1df] sm:text-5xl">
            {item.label} 오늘의 운세
          </h1>
          <p className="mt-4 text-base leading-8 text-white/66">{item.summary}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <article className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
              <div className="text-sm text-white/45">오늘 집중 포인트</div>
              <p className="mt-3 text-sm leading-7 text-white/66">{item.todayFocus}</p>
            </article>
            <article className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
              <div className="text-sm text-white/45">행동 제안</div>
              <p className="mt-3 text-sm leading-7 text-white/66">{item.action}</p>
            </article>
          </div>
        </section>

        <section className="mt-8 rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-2xl font-semibold text-[#f8f1df]">이 띠 운세를 어떻게 활용하면 좋을까</h2>
          <div className="mt-5 space-y-3 text-sm leading-7 text-white/60">
            <p>띠별 운세는 오늘의 리듬을 가볍게 읽는 무료 입구입니다.</p>
            <p>결정을 크게 내리기보다는, 관계·지출·일정 중 무엇을 먼저 챙길지 우선순위를 잡는 데 쓰는 편이 좋습니다.</p>
            <p>더 개인화된 해석이 필요하면 생년월일 기준 사주 리포트로 이어지는 것이 자연스럽습니다.</p>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/saju/new">
              <Button className="rounded-full bg-[#d2b072] px-6 text-[#111827] hover:bg-[#e3c68d]">
                맞춤 사주 리포트 보기
              </Button>
            </Link>
            <Link href="/zodiac">
              <Button
                variant="outline"
                className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                띠별 목록으로 돌아가기
              </Button>
            </Link>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5 text-sm uppercase tracking-[0.22em] text-[#d2b072]/78">Related Signs</div>
          <div className="grid gap-4 md:grid-cols-3">
            {relatedItems.map((entry) => (
              <Link
                key={entry.slug}
                href={`/zodiac/${entry.slug}`}
                className="rounded-[26px] border border-white/10 bg-white/[0.04] p-6 transition-colors hover:bg-white/[0.06]"
              >
                <div className="text-sm text-white/45">{entry.years}</div>
                <h2 className="mt-3 text-2xl font-semibold text-[#f8f1df]">{entry.label}</h2>
                <p className="mt-4 text-sm leading-7 text-white/58">{entry.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
