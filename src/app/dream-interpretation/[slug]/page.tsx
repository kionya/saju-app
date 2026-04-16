import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import SiteHeader from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DREAM_ENTRIES } from '@/lib/free-content-pages';

interface Props {
  params: Promise<{ slug: string }>;
}

function getDreamEntry(slug: string) {
  return DREAM_ENTRIES.find((item) => item.slug === slug);
}

export async function generateStaticParams() {
  return DREAM_ENTRIES.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = getDreamEntry(slug);

  if (!item) {
    return {
      title: '꿈해몽',
    };
  }

  return {
    title: `${item.title} 꿈해몽`,
    description: `${item.title}이 반복해서 떠오를 때 참고할 수 있는 무료 꿈해몽 상세 페이지입니다.`,
    alternates: {
      canonical: `/dream-interpretation/${item.slug}`,
    },
  };
}

export default async function DreamInterpretationDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = getDreamEntry(slug);

  if (!item) {
    notFound();
  }

  const relatedItems = DREAM_ENTRIES.filter((entry) => entry.slug !== item.slug).slice(0, 3);

  return (
    <main className="min-h-screen bg-[#020817] text-white">
      <SiteHeader />

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <section className="rounded-[32px] border border-[#d2b072]/18 bg-[linear-gradient(180deg,rgba(7,19,39,0.94),rgba(10,18,36,0.96))] p-7">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-[#d2b072]/30 bg-[#d2b072]/10 text-[#f5dfaa]">
              꿈해몽 상세
            </Badge>
            <Badge className="border-white/10 bg-white/5 text-white/62">
              검색 유입형 무료 메뉴
            </Badge>
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[#f8f1df] sm:text-5xl">
            {item.title}
          </h1>
          <p className="mt-4 text-base leading-8 text-white/66">{item.summary}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <article className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
              <div className="text-sm text-white/45">보통 이렇게 읽습니다</div>
              <p className="mt-3 text-sm leading-7 text-white/66">{item.meaning}</p>
            </article>
            <article className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
              <div className="text-sm text-white/45">오늘의 행동 제안</div>
              <p className="mt-3 text-sm leading-7 text-white/66">{item.action}</p>
            </article>
          </div>
        </section>

        <section className="mt-8 rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-2xl font-semibold text-[#f8f1df]">꿈해몽을 볼 때 기억할 기준</h2>
          <div className="mt-5 space-y-3 text-sm leading-7 text-white/60">
            <p>꿈해몽은 정답을 단정하는 메뉴보다, 지금의 감정과 무의식 흐름을 읽는 가벼운 힌트에 가깝습니다.</p>
            <p>같은 꿈도 최근 상황과 기분에 따라 읽는 방식이 달라질 수 있으니, 상징만 보지 말고 내 일상과 연결해서 보는 편이 좋습니다.</p>
            <p>개인 질문이 더 중요해지는 순간에는 타로나 사주 리포트처럼 방향을 좁혀주는 메뉴가 더 잘 맞습니다.</p>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/tarot/daily">
              <Button className="rounded-full bg-[#d2b072] px-6 text-[#111827] hover:bg-[#e3c68d]">
                오늘의 타로 보기
              </Button>
            </Link>
            <Link href="/dream-interpretation">
              <Button
                variant="outline"
                className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                꿈해몽 목록으로 돌아가기
              </Button>
            </Link>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5 text-sm uppercase tracking-[0.22em] text-[#d2b072]/78">Related Dreams</div>
          <div className="grid gap-4 md:grid-cols-3">
            {relatedItems.map((entry) => (
              <Link
                key={entry.slug}
                href={`/dream-interpretation/${entry.slug}`}
                className="rounded-[26px] border border-white/10 bg-white/[0.04] p-6 transition-colors hover:bg-white/[0.06]"
              >
                <h2 className="text-2xl font-semibold text-[#f8f1df]">{entry.title}</h2>
                <p className="mt-4 text-sm leading-7 text-white/58">{entry.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
