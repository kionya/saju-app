import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { FREE_EXPERIENCES } from '@/features/home/content';
import { cn } from '@/lib/utils';

export default function SeoEntrySection() {
  return (
    <section id="seo-entry" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.22em] text-[#d2b072]/72">무료 콘텐츠</p>
          <h2 className="text-3xl font-semibold tracking-tight text-[#f8f1df]">
            로그인 없이 바로 시작할 수 있어요
          </h2>
          <p className="max-w-xl text-sm leading-[1.85] text-white/58 sm:text-base">
            오늘의 운세·타로·띠별·꿈해몽은 생년월일 없이도 바로 확인할 수 있는 무료 서비스입니다.
          </p>
        </div>

        <Link
          href="/saju/new"
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'flex-shrink-0 rounded-full border-white/14 bg-white/5 px-5 text-white/80 hover:bg-white/9 hover:text-white'
          )}
        >
          사주 분석으로 이동
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {FREE_EXPERIENCES.map((item) => (
          <article key={item.title} className="flex h-full flex-col rounded-[26px] border border-white/10 bg-white/[0.04] p-6 transition-colors hover:border-white/16 hover:bg-white/[0.06]">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-[#f8f1df]">{item.title}</h3>
              <span className="flex-shrink-0 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                {item.status}
              </span>
            </div>
            <p className="flex-1 text-sm leading-[1.85] text-white/55">{item.body}</p>
            <Link
              href={item.href}
              className="mt-5 text-sm text-[#d2b072] underline underline-offset-4 hover:text-[#e3c68d]"
            >
              바로 가기
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
