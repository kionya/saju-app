'use client';

import { Lock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { trackMoonlightEvent } from '@/lib/analytics';

interface PremiumLockCardProps {
  copy: string;
  coinCost: number;
  onUnlock: () => void;
  loading: boolean;
  sourceSessionId: string;
  concernId: string;
  errorMessage?: string | null;
}

export function PremiumLockCard({
  copy,
  coinCost,
  onUnlock,
  loading,
  sourceSessionId,
  concernId,
  errorMessage,
}: PremiumLockCardProps) {
  return (
    <section className="relative overflow-hidden rounded-[1.8rem] border border-[var(--app-gold)]/26 bg-[linear-gradient(180deg,rgba(14,18,34,0.98),rgba(5,10,22,0.98))] p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(210,176,114,0.18),transparent_42%)]" />
      <div className="relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="app-caption">다음 행동</div>
            <h3 className="mt-3 text-xl font-semibold text-[var(--app-ivory)]">오늘 심화풀이 1코인</h3>
          </div>
          <span className="rounded-full border border-[var(--app-gold)]/28 bg-[var(--app-gold)]/10 px-3 py-1 text-xs text-[var(--app-gold-text)]">
            {coinCost}코인
          </span>
        </div>
        <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">{copy}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[
            '시간대별 유리/주의 행동',
            '피해야 할 행동 3가지와 추천 행동 3가지',
            '선택 시나리오와 대운·세운·월운·일진 근거',
          ].map((item) => (
            <div
              key={item}
              className="rounded-[1.05rem] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-4 text-sm text-[var(--app-copy)]"
            >
              {item}
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            disabled={loading}
            onClick={() => {
              trackMoonlightEvent('unlock_clicked', {
                from: 'today-fortune',
                concern: concernId,
                sourceSessionId,
                productCode: 'TODAY_DEEP_READING',
              });
              onUnlock();
            }}
            className="h-12 rounded-full bg-[var(--app-gold)] px-6 text-sm font-semibold text-[var(--app-bg)] hover:bg-[var(--app-gold-text)]"
          >
            <Lock className="mr-2 h-4 w-4" />
            {loading ? '열어보는 중...' : '오늘 심화풀이 1코인으로 열기'}
          </Button>
          <Link href="/credits?from=today-fortune" className="inline-flex">
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-full border-[var(--app-line)] bg-[var(--app-surface-muted)] px-6 text-sm text-[var(--app-copy)] hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]"
            >
              코인 충전 보기
            </Button>
          </Link>
        </div>
        {errorMessage ? (
          <p className="mt-4 text-sm text-[var(--app-coral)]">{errorMessage}</p>
        ) : null}
      </div>
    </section>
  );
}
