import Link from 'next/link';
import type { Metadata } from 'next';
import SiteHeader from '@/features/shared-navigation/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DREAM_ENTRIES } from '@/lib/free-content-pages';

export const metadata: Metadata = {
  title: '꿈해몽',
  description: '자주 찾는 꿈해몽 키워드를 짧고 선명하게 정리한 무료 페이지입니다.',
  alternates: {
    canonical: '/dream-interpretation',
  },
};

export default function DreamInterpretationPage() {
  return (
    <main className="min-h-screen bg-[#020817] text-white">
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <section className="rounded-[32px] border border-[#d2b072]/18 bg-[linear-gradient(180deg,rgba(7,19,39,0.94),rgba(10,18,36,0.96))] p-7">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-[#d2b072]/30 bg-[#d2b072]/10 text-[#f5dfaa]">
              꿈해몽
            </Badge>
            <Badge className="border-white/10 bg-white/5 text-white/62">
              검색과 바이럴에 강한 무료 메뉴
            </Badge>
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[#f8f1df] sm:text-5xl">
            자주 찾는 꿈해몽
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-white/66">
            꿈해몽은 정답을 단정하는 페이지보다, 상징을 짧게 이해하고 현재 감정 상태와 연결해보는 입구가 더 유용합니다. 그래서 자주 찾는 꿈 장면을 짧고 읽기 쉽게 정리했습니다.
          </p>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {DREAM_ENTRIES.map((item) => (
            <Link
              key={item.slug}
              href={`/dream-interpretation/${item.slug}`}
              className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 transition-colors hover:bg-white/[0.06]"
            >
              <h2 className="text-2xl font-semibold text-[#f8f1df]">{item.title}</h2>
              <p className="mt-4 text-sm leading-7 text-white/60">{item.summary}</p>
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-sm text-white/45">보통 이렇게 해석합니다</div>
                <p className="mt-2 text-sm leading-7 text-white/68">{item.meaning}</p>
              </div>
              <p className="mt-4 text-sm leading-7 text-white/58">{item.action}</p>
              <div className="mt-5 text-sm font-medium text-[#d2b072]">상세 해석 보기</div>
            </Link>
          ))}
        </section>

        <section className="mt-8 rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-2xl font-semibold text-[#f8f1df]">감정 흐름을 더 정교하게 보고 싶다면</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60">
            꿈해몽은 상징을 빠르게 이해하는 무료 메뉴입니다. 더 개인화된 질문이나 현재 흐름이 궁금하다면 오늘의 타로나 사주 리포트로 연결해보는 편이 좋습니다.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/tarot/daily">
              <Button className="rounded-full bg-[#d2b072] px-6 text-[#111827] hover:bg-[#e3c68d]">
                오늘의 타로 보기
              </Button>
            </Link>
            <Link href="/saju/new">
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
