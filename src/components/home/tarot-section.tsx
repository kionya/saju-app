import { Badge } from '@/components/ui/badge';
import { TAROT_TOPICS } from '@/lib/home-content';

export default function TarotSection() {
  return (
    <section id="tarot-lab" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-[#d2b072]/75">Tarot Topics</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#f8f1df]">타로는 가볍게, 주제는 선명하게 확장</h2>
        </div>
        <p className="max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
          오늘의 무료 타로는 무입력 첫 경험을 담당하고, 이후 속마음·재회·이직처럼 과금 가능한 주제형 타로로 확장합니다.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {TAROT_TOPICS.map((topic) => (
          <article key={topic.title} className="rounded-[26px] border border-white/10 bg-white/[0.04] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#f8f1df]">{topic.title}</h3>
              <Badge className="border-white/10 bg-white/5 text-white/55">{topic.status}</Badge>
            </div>
            <p className="text-sm leading-7 text-white/58">{topic.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
