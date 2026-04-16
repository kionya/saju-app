import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FREE_EXPERIENCES } from '@/lib/home-content';
import { cn } from '@/lib/utils';

export default function FreeEntrySection() {
  return (
    <section id="free-content" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.24em] text-[#d2b072]/75">Free Entry</p>
          <h2 className="text-3xl font-semibold tracking-tight text-[#f8f1df]">오늘 가장 먼저 눌러보게 될 무료 운세</h2>
          <p className="max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
            홈은 검색 허브이면서 앱 첫 화면처럼 작동해야 합니다. 그래서 무입력 콘텐츠를 앞에 두고,
            그다음에 생년월일 기반 맞춤 운세로 자연스럽게 이어지게 설계합니다.
          </p>
        </div>
        <Link href="/#personalized-reading">
          <Button
            variant="outline"
            className="rounded-full border-white/15 bg-white/5 px-5 text-white hover:bg-white/10 hover:text-white"
          >
            맞춤 운세로 이어서 보기
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {FREE_EXPERIENCES.map((item) => (
          <article key={item.title} className="flex h-full flex-col rounded-[26px] border border-white/10 bg-white/[0.04] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#f8f1df]">{item.title}</h3>
                <Badge
                  className={cn(
                    'border text-xs',
                    item.status === '지금 보기'
                      ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
                      : 'border-white/10 bg-white/5 text-white/55'
                  )}
                >
                  {item.status}
                </Badge>
              </div>
              <p className="flex-1 text-sm leading-7 text-white/58">{item.body}</p>
              <Link href={item.href} className="mt-6 text-sm text-[#d2b072] underline underline-offset-4 hover:text-[#e3c68d]">
                무료 메뉴 열기
              </Link>
            </article>
          ))}
      </div>
    </section>
  );
}
