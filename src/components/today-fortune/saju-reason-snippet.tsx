import type { TodayFortuneFreeResult } from '@/lib/today-fortune/types';

export function SajuReasonSnippet({
  result,
}: {
  result: TodayFortuneFreeResult;
}) {
  return (
    <section className="rounded-[1.45rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-5">
      <div className="app-caption">사주 근거 1줄</div>
      <p className="mt-3 text-sm leading-8 text-[var(--app-copy)]">{result.reasonSnippet.body}</p>
    </section>
  );
}
