import Link from 'next/link';
import type { Metadata } from 'next';
import SiteHeader from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { STAR_SIGN_FORTUNES } from '@/lib/free-content-pages';

export const metadata: Metadata = {
  title: '별자리 운세',
  description: '양자리부터 물고기자리까지 오늘의 별자리 운세를 가볍게 보는 무료 페이지입니다.',
  alternates: {
    canonical: '/star-sign',
  },
};

export default function StarSignPage() {
  return (
    <main className="min-h-screen bg-[#020817] text-white">
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <section className="rounded-[32px] border border-[#d2b072]/18 bg-[linear-gradient(180deg,rgba(7,19,39,0.94),rgba(10,18,36,0.96))] p-7">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-[#d2b072]/30 bg-[#d2b072]/10 text-[#f5dfaa]">
              별자리 운세
            </Badge>
            <Badge className="border-white/10 bg-white/5 text-white/62">
              루틴형 무료 콘텐츠
            </Badge>
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[#f8f1df] sm:text-5xl">
            오늘의 별자리 운세
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-white/66">
            별자리 운세는 생년월일을 넣기 전에도 편하게 소비할 수 있는 루틴형 무료 메뉴입니다. 앱처럼 자주 들어오게 만드는 데일리 입구로 쓰이기 좋은 콘텐츠입니다.
          </p>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {STAR_SIGN_FORTUNES.map((item) => (
            <Link
              key={item.slug}
              href={`/star-sign/${item.slug}`}
              className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 transition-colors hover:bg-white/[0.06]"
            >
              <div className="text-sm text-[#d2b072]/82">{item.dateRange}</div>
              <h2 className="mt-3 text-2xl font-semibold text-[#f8f1df]">{item.label}</h2>
              <p className="mt-4 text-sm leading-7 text-white/60">{item.summary}</p>
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-sm text-white/45">오늘 집중 포인트</div>
                <p className="mt-2 text-sm leading-7 text-white/68">{item.todayFocus}</p>
              </div>
              <p className="mt-4 text-sm leading-7 text-white/58">{item.action}</p>
              <div className="mt-5 text-sm font-medium text-[#d2b072]">상세 운세 보기</div>
            </Link>
          ))}
        </section>

        <section className="mt-8 rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-2xl font-semibold text-[#f8f1df]">더 깊은 해석이 필요할 때</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60">
            별자리 운세는 가볍게 보는 오늘의 흐름에 가깝습니다. 더 맞춤형 질문이 생기면 사주 리포트나 오늘의 타로와 함께 이어서 보는 편이 좋습니다.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/tarot/daily">
              <Button className="rounded-full bg-[#d2b072] px-6 text-[#111827] hover:bg-[#e3c68d]">
                오늘의 타로 보기
              </Button>
            </Link>
            <Link href="/#personalized-reading">
              <Button
                variant="outline"
                className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                맞춤 사주 리포트 보기
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
