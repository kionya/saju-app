import { buildGroundingDecisionTrace } from '@/domain/saju/report/grounding-decision-trace';
import type { SajuInterpretationGrounding } from '@/domain/saju/report';
import type { KasiSingleInputComparison } from '@/domain/saju/validation/kasi-calendar';
import { cn } from '@/lib/utils';

const BADGE_TONE_CLASS = {
  gold: 'border-[var(--app-gold)]/24 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]',
  jade: 'border-[var(--app-jade)]/24 bg-[var(--app-jade)]/10 text-[var(--app-jade)]',
  rose: 'border-[var(--app-coral)]/24 bg-[var(--app-coral)]/10 text-[var(--app-coral)]',
  muted: 'border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] text-[var(--app-copy-soft)]',
} as const;

export function GroundingDecisionTrace({
  grounding,
  kasiComparison,
  title = '판정 근거 보기',
  compact = false,
}: {
  grounding: SajuInterpretationGrounding;
  kasiComparison?: KasiSingleInputComparison | null;
  title?: string;
  compact?: boolean;
}) {
  const trace = buildGroundingDecisionTrace(grounding, kasiComparison);

  return (
    <details className="rounded-[20px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-4">
      <summary className="cursor-pointer list-none">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-[var(--app-ivory)]">{title}</div>
            <p className="mt-1 text-xs leading-6 text-[var(--app-copy-soft)]">
              명식 계산 기준, 시간 보정, 격국/용신 판정, 현재 운 연결을 한 번에 확인할 수 있습니다.
            </p>
          </div>
          <span className="rounded-full border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-3 py-1 text-xs text-[var(--app-copy-soft)]">
            펼쳐서 보기
          </span>
        </div>
      </summary>

      <div className="mt-4 flex flex-wrap gap-2">
        {trace.badges.map((badge) => (
          <span
            key={badge.label}
            className={cn(
              'rounded-full border px-3 py-1 text-xs leading-6',
              BADGE_TONE_CLASS[badge.tone]
            )}
          >
            {badge.label}
          </span>
        ))}
      </div>

      <div className={cn('mt-4 grid gap-3', compact ? 'lg:grid-cols-1' : 'lg:grid-cols-2')}>
        {trace.steps.map((step, index) => (
          <article
            key={step.title}
            className={cn(
              'rounded-[18px] border border-[var(--app-line)] bg-[rgba(7,9,16,0.28)] px-4 py-4',
              step.tone === 'caution' ? 'border-[var(--app-coral)]/18 bg-[var(--app-coral)]/6' : ''
            )}
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 font-[var(--font-heading)] text-sm text-[var(--app-gold)]/60">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[var(--app-ivory)]">{step.title}</div>
                {step.emphasis ? (
                  <div className="mt-2 text-sm leading-7 text-[var(--app-gold-text)]">{step.emphasis}</div>
                ) : null}
                <p className="mt-2 text-sm leading-7 text-[var(--app-copy)]">{step.body}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-4">
        <div className="app-caption text-[var(--app-gold-soft)]">논쟁적 / 참고 해석 표시</div>
        <div className="mt-3 space-y-2">
          {trace.notes.map((note) => (
            <p key={note} className="text-sm leading-7 text-[var(--app-copy)]">
              {note}
            </p>
          ))}
        </div>
      </div>
    </details>
  );
}
