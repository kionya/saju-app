import type { TodayFortuneFreeResult } from '@/lib/today-fortune/types';

export function TodayFortuneSummaryCard({
  result,
}: {
  result: TodayFortuneFreeResult;
}) {
  return (
    <section className="moon-lunar-panel p-6 sm:p-7">
      <div className="app-starfield" />
      <div className="relative z-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[var(--app-gold)]/28 bg-[var(--app-gold)]/10 px-3 py-1 text-xs text-[var(--app-gold-text)]">
            {result.oneLine.eyebrow}
          </span>
          <span className="rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-3 py-1 text-xs text-[var(--app-copy-muted)]">
            무료 결과
          </span>
        </div>
        <h2 className="mt-4 font-[var(--font-heading)] text-3xl leading-tight text-[var(--app-ivory)] sm:text-4xl">
          {result.oneLine.headline}
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-[var(--app-copy)]">
          {result.oneLine.body}
        </p>
      </div>
    </section>
  );
}
