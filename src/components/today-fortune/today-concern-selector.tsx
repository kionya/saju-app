'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { getTodayConcernEntries } from '@/lib/today-fortune/concerns';
import type { ConcernId } from '@/lib/today-fortune/types';
import { cn } from '@/lib/utils';

interface TodayConcernSelectorProps {
  value: ConcernId;
  onChange: (value: ConcernId) => void;
  expanded?: boolean;
  onToggleExpanded?: () => void;
  compact?: boolean;
}

export function TodayConcernSelector({
  value,
  onChange,
  expanded = false,
  onToggleExpanded,
  compact = false,
}: TodayConcernSelectorProps) {
  const items = getTodayConcernEntries(expanded);

  return (
    <div className="space-y-3">
      <div className={cn('flex flex-wrap gap-2.5', compact ? 'justify-center' : '')}>
        {items.map((item) => {
          const active = item.id === value;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                'group inline-flex min-h-12 items-center gap-2 rounded-full border px-4 py-2 text-left transition-all duration-200',
                active
                  ? 'border-[var(--app-gold)]/38 bg-[var(--app-gold)]/14 text-[var(--app-ivory)] shadow-[0_16px_48px_rgba(210,176,114,0.14)]'
                  : 'border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy)] hover:-translate-y-0.5 hover:border-[var(--app-gold)]/28 hover:text-[var(--app-ivory)]'
              )}
            >
              <span
                className={cn(
                  'rounded-full border px-2 py-0.5 text-[11px] font-semibold tracking-[0.18em]',
                  active
                    ? 'border-[var(--app-gold)]/35 bg-[var(--app-gold)]/12 text-[var(--app-gold-text)]'
                    : 'border-[var(--app-line)] text-[var(--app-copy-soft)] group-hover:border-[var(--app-gold)]/28 group-hover:text-[var(--app-gold-text)]'
                )}
              >
                {item.hanja}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>

      {onToggleExpanded ? (
        <button
          type="button"
          onClick={onToggleExpanded}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--app-copy-soft)] transition-colors hover:text-[var(--app-ivory)]"
        >
          {expanded ? (
            <>
              접기 <ChevronUp className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              더 보기 <ChevronDown className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      ) : null}
    </div>
  );
}
