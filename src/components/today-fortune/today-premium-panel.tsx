import type { TodayFortunePremiumResult } from '@/lib/today-fortune/types';

export function TodayPremiumPanel({
  result,
}: {
  result: TodayFortunePremiumResult;
}) {
  return (
    <section className="space-y-5 rounded-[1.8rem] border border-[var(--app-gold)]/24 bg-[linear-gradient(180deg,rgba(10,16,32,0.98),rgba(6,10,22,0.98))] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="app-caption">오늘 심화풀이</div>
          <h3 className="mt-3 text-2xl font-semibold text-[var(--app-ivory)]">시간대와 선택 시나리오까지 열렸습니다</h3>
        </div>
        <span className="rounded-full border border-[var(--app-gold)]/24 bg-[var(--app-gold)]/10 px-3 py-1 text-xs text-[var(--app-gold-text)]">
          TODAY_DEEP_READING
        </span>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-[1.35rem] border border-[var(--app-jade)]/24 bg-[rgba(52,211,153,0.08)] p-5">
          <div className="app-caption text-[var(--app-jade)]">시간대별 유리 행동</div>
          <div className="mt-4 space-y-3">
            {result.favorableWindows.map((item) => (
              <div key={`${item.range}-${item.title}`} className="rounded-[1rem] border border-[var(--app-jade)]/16 bg-[rgba(255,255,255,0.03)] p-4">
                <div className="text-xs tracking-[0.18em] text-[var(--app-jade)]">{item.range}</div>
                <div className="mt-2 text-base font-semibold text-[var(--app-ivory)]">{item.title}</div>
                <p className="mt-2 text-sm leading-7 text-[var(--app-copy)]">{item.body}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[1.35rem] border border-[var(--app-coral)]/24 bg-[rgba(248,113,113,0.08)] p-5">
          <div className="app-caption text-[var(--app-coral)]">시간대별 주의 행동</div>
          <div className="mt-4 space-y-3">
            {result.cautionWindows.map((item) => (
              <div key={`${item.range}-${item.title}`} className="rounded-[1rem] border border-[var(--app-coral)]/16 bg-[rgba(255,255,255,0.03)] p-4">
                <div className="text-xs tracking-[0.18em] text-[var(--app-coral)]">{item.range}</div>
                <div className="mt-2 text-base font-semibold text-[var(--app-ivory)]">{item.title}</div>
                <p className="mt-2 text-sm leading-7 text-[var(--app-copy)]">{item.body}</p>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-[1.35rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-5">
          <div className="app-caption">추천 행동 3가지</div>
          <div className="mt-4 space-y-3">
            {result.recommendedActions.map((item) => (
              <div key={item} className="rounded-[1rem] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm leading-7 text-[var(--app-copy)]">
                {item}
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-[1.35rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-5">
          <div className="app-caption">피해야 할 행동 3가지</div>
          <div className="mt-4 space-y-3">
            {result.avoidActions.map((item) => (
              <div key={item} className="rounded-[1rem] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm leading-7 text-[var(--app-copy)]">
                {item}
              </div>
            ))}
          </div>
        </article>
      </div>

      <article className="rounded-[1.35rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-5">
        <div className="app-caption">선택 시나리오 비교</div>
        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {result.scenarios.map((scenario) => (
            <section key={scenario.title} className="rounded-[1rem] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] p-4">
              <div className="text-base font-semibold text-[var(--app-ivory)]">{scenario.title}</div>
              <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">{scenario.better}</p>
              <p className="mt-3 text-sm leading-7 text-[var(--app-copy-soft)]">{scenario.watch}</p>
            </section>
          ))}
        </div>
      </article>

      <article className="rounded-[1.35rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-5">
        <div className="app-caption">사주 단서 상세</div>
        <div className="mt-2 text-xs tracking-[0.18em] text-[var(--app-gold-soft)]">
          핵심 기준 · {result.groundingSummary.primaryConcept}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {result.groundingSummary.factLines.map((item) => (
            <span
              key={item}
              className="rounded-full border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-3 py-1 text-xs leading-6 text-[var(--app-copy-soft)]"
            >
              {item}
            </span>
          ))}
        </div>
        <div className="mt-4 space-y-3">
          {result.groundingSummary.evidenceLines.map((item) => (
            <div key={item} className="rounded-[1rem] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm leading-7 text-[var(--app-copy)]">
              {item}
            </div>
          ))}
          {result.evidenceLines.map((item) => (
            <div key={item} className="rounded-[1rem] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm leading-7 text-[var(--app-copy)]">
              {item}
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs leading-6 text-[var(--app-copy-soft)]">{result.groundingSummary.kasi.summary}</p>
        <p className="mt-3 text-xs leading-6 text-[var(--app-copy-soft)]">{result.safetyNote}</p>
      </article>
    </section>
  );
}
