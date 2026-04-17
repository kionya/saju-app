import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { SERVICE_ENTRY_CARDS } from '@/features/home/content';
import { cn } from '@/lib/utils';

export default function ServiceEntrySection() {
  return (
    <section id="core-service" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mb-10 space-y-3">
        <p className="text-xs uppercase tracking-[0.22em] text-[#d2b072]/72">서비스 안내</p>
        <h2 className="text-3xl font-semibold tracking-tight text-[#f8f1df]">
          지금 어디서 시작하면 될까요?
        </h2>
        <p className="max-w-xl text-sm leading-[1.85] text-white/58 sm:text-base">
          사주팔자 분석부터 궁합, 리포트 저장까지. 원하는 서비스를 바로 시작하세요.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {SERVICE_ENTRY_CARDS.map((card, index) => (
          <article
            key={card.title}
            className={cn(
              'flex h-full flex-col rounded-[28px] border p-6 transition-colors',
              index === 0
                ? 'border-[#d2b072]/22 bg-[radial-gradient(ellipse_at_top_left,rgba(210,176,114,0.1),transparent_50%),rgba(255,255,255,0.03)]'
                : 'border-white/10 bg-white/[0.04] hover:border-white/16 hover:bg-white/[0.06]'
            )}
          >
            <div className="text-[10px] uppercase tracking-[0.22em] text-[#d2b072]/70">{card.eyebrow}</div>
            <h3 className="mt-3 text-xl font-semibold text-[#f8f1df]">{card.title}</h3>
            <p className="mt-3 flex-1 text-sm leading-[1.85] text-white/56">{card.body}</p>
            <Link
              href={card.href}
              className={cn(
                buttonVariants({ variant: index === 0 ? 'default' : 'outline' }),
                'mt-6 rounded-full px-5',
                index === 0
                  ? 'bg-[#d2b072] text-[#111827] shadow-[0_4px_16px_rgba(210,176,114,0.25)] hover:bg-[#e3c68d]'
                  : 'border-white/14 bg-white/5 text-white/80 hover:bg-white/9 hover:text-white'
              )}
            >
              {card.cta}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
