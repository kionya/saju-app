import Link from 'next/link';
import type { Metadata } from 'next';
import SiteHeader from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ZODIAC_FORTUNES } from '@/lib/free-content-pages';

export const metadata: Metadata = {
  title: '띠별 운세',
  description: '쥐띠부터 돼지띠까지 오늘의 띠별 운세를 한눈에 보는 무료 페이지입니다.',
  alternates: {
    canonical: '/zodiac',
  },
};

export default function ZodiacPage() {
  return (
    <main className="min-h-screen bg-[#020817] text-white">
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <section className="rounded-[32px] border border-[#d2b072]/18 bg-[linear-gradient(180deg,rgba(7,19,39,0.94),rgba(10,18,36,0.96))] p-7">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-[#d2b072]/30 bg-[#d2b072]/10 text-[#f5dfaa]">
              띠별 운세
            </Badge>
            <Badge className="border-white/10 bg-white/5 text-white/62">
              검색 유입형 무료 콘텐츠
            </Badge>
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[#f8f1df] sm:text-5xl">
            오늘의 띠별 운세
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-white/66">
            띠별 운세는 가장 가볍게 들어오는 무료 입구 중 하나입니다. 오늘의 흐름을 짧게 확인하고, 더 맞춤형 해석이 필요해질 때 사주 리포트로 자연스럽게 이어지게 설계합니다.
          </p>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ZODIAC_FORTUNES.map((item) => (
            <Link
              key={item.slug}
              href={`/zodiac/${item.slug}`}
              className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 transition-colors hover:bg-white/[0.06]"
            >
              <div className="text-sm text-[#d2b072]/82">{item.years}</div>
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
          <h2 className="text-2xl font-semibold text-[#f8f1df]">개인화 리포트로 이어보기</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60">
            띠별 운세는 빠른 체감용 콘텐츠입니다. 생년월일 기준으로 더 정교한 해석을 보고 싶다면 질문형 사주 리포트가 더 적합합니다.
          </p>
          <div className="mt-6">
            <Link href="/#personalized-reading">
              <Button className="rounded-full bg-[#d2b072] px-6 text-[#111827] hover:bg-[#e3c68d]">
                맞춤 사주 리포트 보기
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
