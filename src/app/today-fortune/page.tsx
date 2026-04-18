import Link from 'next/link';
import type { Metadata } from 'next';
import SiteHeader from '@/features/shared-navigation/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { buildTodayFortune } from '@/lib/free-content-pages';

export const metadata: Metadata = {
  title: '오늘의 운세',
  description: '오늘의 흐름, 연애운, 재물운, 직장운을 짧고 선명하게 보는 무료 운세 페이지입니다.',
  alternates: {
    canonical: '/today-fortune',
  },
};

export default function TodayFortunePage() {
  const todayFortune = buildTodayFortune();

  return (
    <main className="min-h-screen bg-[#020817] text-white">
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <section className="rounded-[32px] border border-[#d2b072]/18 bg-[radial-gradient(circle_at_top_left,_rgba(210,176,114,0.16),_transparent_30%),linear-gradient(180deg,rgba(7,19,39,0.94),rgba(10,18,36,0.96))] p-7">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-[#d2b072]/30 bg-[#d2b072]/10 text-[#f5dfaa]">
              무료 운세
            </Badge>
            <Badge className="border-white/10 bg-white/5 text-white/62">
              가볍게 펼쳐보는 오늘의 흐름
            </Badge>
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[#f8f1df] sm:text-5xl">
            오늘의 운세
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-white/66">
            {todayFortune.headline} {todayFortune.summary}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/68">
              오늘의 컬러 · {todayFortune.luckyColor}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/68">
              움직이기 좋은 시간 · {todayFortune.luckyTime}
            </span>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {todayFortune.sections.map((section) => (
            <article key={section.title} className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
              <div className="text-sm text-[#d2b072]/78">{section.title}</div>
              <p className="mt-4 text-sm leading-7 text-white/60">{section.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-2xl font-semibold text-[#f8f1df]">맞춤 결과로 더 깊게 보기</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60">
            오늘의 운세는 하루의 결을 먼저 살피는 가벼운 한 장입니다. 선생님만의 생년월일로 더 차분한 이야기를 보고 싶으시다면 맞춤 사주 리포트로 이어보세요.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/saju/new">
              <Button className="rounded-full bg-[#d2b072] px-6 text-[#111827] hover:bg-[#e3c68d]">
                맞춤 사주 리포트 보기
              </Button>
            </Link>
            <Link href="/tarot/daily">
              <Button
                variant="outline"
                className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                오늘의 타로 보기
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
