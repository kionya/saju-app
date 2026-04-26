import type { TodayFortuneFreeResult } from '@/lib/today-fortune/types';

export function OpportunityRiskCards({
  result,
}: {
  result: TodayFortuneFreeResult;
}) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <article className="rounded-[1.45rem] border border-[var(--app-jade)]/24 bg-[rgba(52,211,153,0.08)] p-5">
        <div className="app-caption text-[var(--app-jade)]">오늘의 기회</div>
        <h3 className="mt-3 text-xl font-semibold text-[var(--app-ivory)]">{result.opportunity.title}</h3>
        <p className="mt-3 text-sm leading-8 text-[var(--app-copy)]">{result.opportunity.body}</p>
      </article>
      <article className="rounded-[1.45rem] border border-[var(--app-coral)]/24 bg-[rgba(248,113,113,0.08)] p-5">
        <div className="app-caption text-[var(--app-coral)]">오늘의 주의</div>
        <h3 className="mt-3 text-xl font-semibold text-[var(--app-ivory)]">{result.risk.title}</h3>
        <p className="mt-3 text-sm leading-8 text-[var(--app-copy)]">{result.risk.body}</p>
      </article>
    </section>
  );
}
