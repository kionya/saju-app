import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { MEMBERSHIP_POINTS } from '@/features/home/content';
import { cn } from '@/lib/utils';

export default function MembershipSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="grid gap-6 rounded-[32px] border border-[#d2b072]/18 bg-[linear-gradient(135deg,rgba(210,176,114,0.08),rgba(7,19,39,0.95))] p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#d2b072]/70">Plus 멤버십</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#f8f1df] sm:text-3xl">
            더 깊이, 더 자주 — 매달 새 리포트가 기다립니다
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-[1.85] text-white/56">
            단발성 조회를 넘어 꾸준한 명리 흐름을 따라가고 싶다면 Plus 멤버십이 맞습니다.
            매월 심화 리포트가 제공되고, 저장된 리포트를 언제든 다시 꺼내볼 수 있습니다.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {MEMBERSHIP_POINTS.map((point) => (
              <span
                key={point}
                className="rounded-full border border-[#d2b072]/18 bg-[#d2b072]/7 px-3.5 py-1.5 text-sm text-[#f5dfaa]"
              >
                {point}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:min-w-[160px]">
          <Link
            href="/membership"
            className={cn(
              buttonVariants({ variant: 'default' }),
              'h-12 rounded-full bg-[#d2b072] px-6 text-sm font-semibold text-[#111827] shadow-[0_4px_20px_rgba(210,176,114,0.28)] hover:bg-[#e3c68d]'
            )}
          >
            멤버십 알아보기
          </Link>
          <Link
            href="/credits"
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'h-12 rounded-full border-white/14 bg-white/5 px-6 text-sm text-white/80 hover:bg-white/9 hover:text-white'
            )}
          >
            코인 충전
          </Link>
        </div>
      </div>
    </section>
  );
}
