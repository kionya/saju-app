import Link from 'next/link';
import type { Metadata } from 'next';
import SiteHeader from '@/features/shared-navigation/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TAROT_TOPICS, getCardOfTheDay } from '@/lib/home-content';

export const metadata: Metadata = {
  title: '오늘의 타로 1장',
  description: '질문 없이 한 장만 뽑아도 오늘의 기분과 흐름을 읽는 무료 타로 페이지입니다.',
  alternates: {
    canonical: '/tarot/daily',
  },
};

export default function DailyTarotPage() {
  const card = getCardOfTheDay();

  return (
    <main className="min-h-screen bg-[#020817] text-white">
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <section className="grid gap-6 rounded-[32px] border border-[#d2b072]/18 bg-[linear-gradient(180deg,rgba(7,19,39,0.94),rgba(10,18,36,0.96))] p-7 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,#111c34_0%,#0a1224_100%)] p-6">
            <div className="text-xs uppercase tracking-[0.22em] text-white/42">{card.theme}</div>
            <div className="mt-3 text-4xl font-semibold text-[#f8f1df]">{card.name}</div>
            <div className="mt-8 h-72 rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(210,176,114,0.22),transparent_45%),linear-gradient(180deg,#17274a_0%,#0a1224_100%)]" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-[#d2b072]/30 bg-[#d2b072]/10 text-[#f5dfaa]">
                오늘의 타로 1장
              </Badge>
              <Badge className="border-white/10 bg-white/5 text-white/62">무입력 무료</Badge>
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[#f8f1df] sm:text-5xl">
              오늘의 카드가 말하는 한 줄
            </h1>
            <p className="mt-5 text-base leading-8 text-white/66">{card.message}</p>

            <div className="mt-6 rounded-[26px] border border-[#d2b072]/16 bg-[#d2b072]/8 p-5">
              <div className="text-sm text-[#d2b072]/82">오늘의 행동 제안</div>
              <p className="mt-3 text-sm leading-7 text-white/68">{card.focus}</p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/saju/new">
                <Button className="rounded-full bg-[#d2b072] px-6 text-[#111827] hover:bg-[#e3c68d]">
                  내 사주와 함께 보기
                </Button>
              </Link>
              <Link href="/today-fortune">
                <Button
                  variant="outline"
                  className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                >
                  오늘의 운세로 이동
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5">
            <div className="text-sm uppercase tracking-[0.22em] text-[#d2b072]/78">Next Topics</div>
            <h2 className="mt-3 text-2xl font-semibold text-[#f8f1df]">다음 단계로 확장될 주제형 타로</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {TAROT_TOPICS.map((topic) => (
              <article key={topic.title} className="rounded-[26px] border border-white/10 bg-white/[0.04] p-6">
                <div className="text-sm text-white/45">{topic.status}</div>
                <h3 className="mt-3 text-2xl font-semibold text-[#f8f1df]">{topic.title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/60">{topic.desc}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
