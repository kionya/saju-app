import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import SiteHeader from '@/features/shared-navigation/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { STAR_SIGN_FORTUNES } from '@/lib/free-content-pages';

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
    return {
      title: '별자리 운세',
    };
  }

  return {
    title: `${item.label} 운세`,
    description: `${item.label}의 오늘 흐름과 행동 포인트를 짧고 선명하게 정리한 무료 별자리 운세 페이지입니다.`,
    alternates: {
      canonical: `/star-sign/${item.slug}`,
    },
  };
}

export default async function StarSignDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = getStarSign(slug);

  if (!item) {
    notFound();
  }

  const relatedItems = STAR_SIGN_FORTUNES.filter((entry) => entry.slug !== item.slug).slice(0, 3);

  return (
    <main className="min-h-screen bg-[#020817] text-white">
      <SiteHeader />

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <section className="rounded-[32px] border border-[#d2b072]/18 bg-[linear-gradient(180deg,rgba(7,19,39,0.94),rgba(10,18,36,0.96))] p-7">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-[#d2b072]/30 bg-[#d2b072]/10 text-[#f5dfaa]">
              별자리 운세 상세
            </Badge>
            <Badge className="border-white/10 bg-white/5 text-white/62">
              {item.dateRange}
            </Badge>
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[#f8f1df] sm:text-5xl">
            {item.label} 오늘의 운세
          </h1>
          <p className="mt-4 text-base leading-8 text-white/66">{item.summary}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <article className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
              <div className="text-sm text-white/45">오늘 집중 사인</div>
              <p className="mt-3 text-sm leading-7 text-white/66">{item.todayFocus}</p>
            </article>
            <article className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
              <div className="text-sm text-white/45">행동 제안</div>
              <p className="mt-3 text-sm leading-7 text-white/66">{item.action}</p>
            </article>
          </div>
        </section>

        <section className="mt-8 rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-2xl font-semibold text-[#f8f1df]">이 운세를 더 잘 쓰는 방법</h2>
          <div className="mt-5 space-y-3 text-sm leading-7 text-white/60">
            <p>별자리 운세는 오늘의 분위기와 감정선을 빠르게 읽는 무료 메뉴입니다.</p>
            <p>하루 전체를 점치기보다, 지금 가장 먼저 다뤄야 할 대화와 선택의 톤을 잡는 용도로 쓰면 더 유용합니다.</p>
            <p>조금 더 개인화된 리포트가 필요하면 생년월일 기반 사주 리포트나 오늘의 타로와 같이 보는 흐름이 자연스럽습니다.</p>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/tarot/daily">
              <Button className="rounded-full bg-[#d2b072] px-6 text-[#111827] hover:bg-[#e3c68d]">
                오늘의 타로 보기
              </Button>
            </Link>
            <Link href="/star-sign">
              <Button
                variant="outline"
                className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                별자리 목록으로 돌아가기
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
                href={`/star-sign/${entry.slug}`}
                className="rounded-[26px] border border-white/10 bg-white/[0.04] p-6 transition-colors hover:bg-white/[0.06]"
              >
                <div className="text-sm text-white/45">{entry.dateRange}</div>
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
