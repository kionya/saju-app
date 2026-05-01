'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { trackMoonlightEvent } from '@/lib/analytics';
import type { FortuneCalendarMonthReport, FortuneCalendarTone } from '@/domain/saju/report';

interface Props {
  slug: string;
  targetYear: number;
  hasLifetimeAccess: boolean;
}

interface FortuneCalendarResponse {
  ok: boolean;
  access: 'lifetime' | 'month_unlock' | 'locked';
  targetYear: number;
  month: number;
  monthLabel: string;
  coinCost: number;
  hasLifetimeAccess: boolean;
  report: FortuneCalendarMonthReport | null;
}

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

const TONE_META: Record<
  FortuneCalendarTone,
  {
    label: string;
    cellClassName: string;
    badgeClassName: string;
  }
> = {
  decision: {
    label: '결정일',
    cellClassName: 'border-[var(--app-gold)]/40 bg-[rgba(210,176,114,0.16)] text-[var(--app-gold-text)]',
    badgeClassName: 'border-[var(--app-gold)]/35 bg-[var(--app-gold)]/12 text-[var(--app-gold-text)]',
  },
  good: {
    label: '좋은 날',
    cellClassName: 'border-emerald-400/24 bg-emerald-400/10 text-emerald-100',
    badgeClassName: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100',
  },
  average: {
    label: '보통 날',
    cellClassName: 'border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] text-[var(--app-copy)]',
    badgeClassName: 'border-[var(--app-line)] bg-[rgba(255,255,255,0.04)] text-[var(--app-copy-soft)]',
  },
  caution: {
    label: '주의 날',
    cellClassName: 'border-rose-400/24 bg-rose-400/10 text-rose-100',
    badgeClassName: 'border-rose-400/25 bg-rose-400/10 text-rose-100',
  },
};

function getInitialMonth(targetYear: number) {
  const now = new Date();
  const thisYear = now.getFullYear();
  return targetYear === thisYear ? now.getMonth() + 1 : 1;
}

function buildPlaceholderWeeks(year: number, month: number) {
  const totalDays = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const days = Array.from({ length: totalDays }, (_, index) => ({
    day: index + 1,
    weekday: new Date(year, month - 1, index + 1).getDay(),
  }));

  const weeks: Array<Array<{ day: number } | null>> = [];
  let cursor = 0;
  let first = true;

  while (cursor < days.length) {
    const week: Array<{ day: number } | null> = Array.from({ length: 7 }, () => null);

    if (first) {
      for (let slot = firstWeekday; slot < 7 && cursor < days.length; slot += 1) {
        week[slot] = { day: days[cursor]!.day };
        cursor += 1;
      }
      first = false;
    } else {
      for (let slot = 0; slot < 7 && cursor < days.length; slot += 1) {
        week[slot] = { day: days[cursor]!.day };
        cursor += 1;
      }
    }

    weeks.push(week);
  }

  return weeks;
}

function MonthChip({
  month,
  active,
  onClick,
}: {
  month: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? 'rounded-full border border-[var(--app-gold)]/35 bg-[var(--app-gold)]/12 px-3 py-1.5 text-xs font-semibold text-[var(--app-gold-text)]'
          : 'rounded-full border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-3 py-1.5 text-xs text-[var(--app-copy)] transition-colors hover:bg-[rgba(255,255,255,0.06)]'
      }
    >
      {month}월
    </button>
  );
}

function isFortuneCalendarEntry(
  cell: FortuneCalendarMonthReport['days'][number] | { day: number }
): cell is FortuneCalendarMonthReport['days'][number] {
  return 'tone' in cell;
}

function formatDayLabel(entry: FortuneCalendarMonthReport['days'][number]) {
  const year = Number(entry.isoDate.slice(0, 4));
  const month = Number(entry.isoDate.slice(5, 7));
  return `${year}.${String(month).padStart(2, '0')}.${String(entry.day).padStart(2, '0')}`;
}

function pickToneEntries(
  report: FortuneCalendarMonthReport,
  tones: FortuneCalendarTone[],
  limit: number,
  direction: 'high' | 'low'
) {
  return [...report.days]
    .filter((entry) => tones.includes(entry.tone))
    .sort((left, right) => (direction === 'high' ? right.score - left.score : left.score - right.score))
    .slice(0, limit);
}

function CalendarHintGroup({
  title,
  tone,
  entries,
}: {
  title: string;
  tone: FortuneCalendarTone;
  entries: FortuneCalendarMonthReport['days'];
}) {
  if (entries.length === 0) return null;

  return (
    <div className="rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.025)] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="app-caption text-[var(--app-gold-soft)]">{title}</div>
        <Badge className={TONE_META[tone].badgeClassName}>{TONE_META[tone].label}</Badge>
      </div>
      <div className="mt-3 grid gap-3">
        {entries.map((entry) => (
          <div key={`${title}-${entry.isoDate}`} className="rounded-[14px] bg-[rgba(255,255,255,0.03)] px-3 py-3">
            <div className="text-sm font-semibold text-[var(--app-ivory)]">{formatDayLabel(entry)}</div>
            <p className="mt-2 text-sm leading-7 text-[var(--app-copy)]">{entry.actionHint}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FortuneCalendarPanel({
  slug,
  targetYear,
  hasLifetimeAccess,
}: Props) {
  const [selectedMonth, setSelectedMonth] = useState(() => getInitialMonth(targetYear));
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const [data, setData] = useState<FortuneCalendarResponse | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setState('loading');
      setError('');

      try {
        const response = await fetch(
          `/api/fortune-calendar?slug=${encodeURIComponent(slug)}&targetYear=${targetYear}&month=${selectedMonth}`,
          {
            signal: controller.signal,
          }
        );
        const payload = (await response.json().catch(() => null)) as
          | FortuneCalendarResponse
          | { error?: string }
          | null;

        if (!response.ok || !payload || !('ok' in payload) || payload.ok !== true) {
          setError(payload && 'error' in payload && payload.error ? payload.error : '운세 캘린더를 불러오지 못했습니다.');
          setState('error');
          return;
        }

        setData(payload);
        setState('ready');
      } catch (fetchError) {
        if ((fetchError as Error).name === 'AbortError') return;
        setError('운세 캘린더를 불러오는 중 오류가 발생했습니다.');
        setState('error');
      }
    }

    void load();

    return () => controller.abort();
  }, [slug, targetYear, selectedMonth]);

  const placeholderWeeks = useMemo(
    () => buildPlaceholderWeeks(targetYear, selectedMonth),
    [targetYear, selectedMonth]
  );
  const calendarRows = useMemo(
    () =>
      data?.report
        ? data.report.weeks
        : placeholderWeeks.map((days, index) => ({
            week: index + 1,
            days,
          })),
    [data?.report, placeholderWeeks]
  );

  async function handleUnlock() {
    trackMoonlightEvent('unlock_clicked', {
      from: 'fortune-calendar',
      slug,
      targetYear,
      month: selectedMonth,
      productCode: 'FORTUNE_CALENDAR_MONTH',
    });

    setUnlocking(true);
    setError('');

    try {
      const response = await fetch('/api/fortune-calendar/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          targetYear,
          month: selectedMonth,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            success: true;
            access: 'lifetime' | 'month_unlock';
            remaining: number | null;
            report: FortuneCalendarMonthReport;
          }
        | {
            error?: string;
            remaining?: number;
          }
        | null;

      if (response.status === 401) {
        window.location.href = `/login?next=${encodeURIComponent(`/saju/${slug}/premium#fortune-calendar`)}`;
        return;
      }

      if (response.status === 402) {
        window.location.href = `/credits?from=fortune-calendar&slug=${encodeURIComponent(slug)}`;
        return;
      }

      if (!response.ok || !payload || !('success' in payload) || payload.success !== true) {
        setError(payload && 'error' in payload && payload.error ? payload.error : '월간 캘린더를 열지 못했습니다.');
        return;
      }

      setRemaining(payload.remaining);
      setData({
        ok: true,
        access: payload.access,
        targetYear,
        month: selectedMonth,
        monthLabel: payload.report.monthLabel,
        coinCost: 0,
        hasLifetimeAccess: payload.access === 'lifetime' || hasLifetimeAccess,
        report: payload.report,
      });
    } finally {
      setUnlocking(false);
    }
  }

  return (
    <section id="fortune-calendar" className="moon-lunar-panel p-6 sm:p-7">
      <div className="app-starfield" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="app-caption">Fortune Calendar</div>
          <h2 className="mt-4 font-[var(--font-heading)] text-3xl text-[var(--app-ivory)]">
            달별로 한눈에 보는 결정일과 주의 날
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-8 text-[var(--app-copy)]">
            평생 소장권이 있으면 12개월을 자유롭게 보고, 그렇지 않으면 필요한 달만 2코인으로 열어 한 달 흐름을 집중해서 볼 수 있습니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className={hasLifetimeAccess ? TONE_META.decision.badgeClassName : TONE_META.average.badgeClassName}>
            {hasLifetimeAccess ? 'Lifetime 무료 열람' : '월 단위 2코인 잠금 해제'}
          </Badge>
          {data?.access === 'month_unlock' ? (
            <Badge className={TONE_META.good.badgeClassName}>이번 달 해제됨</Badge>
          ) : null}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
          <MonthChip
            key={month}
            month={month}
            active={month === selectedMonth}
            onClick={() => setSelectedMonth(month)}
          />
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(['decision', 'good', 'average', 'caution'] as FortuneCalendarTone[]).map((tone) => (
          <Badge key={tone} className={TONE_META[tone].badgeClassName}>
            {TONE_META[tone].label}
          </Badge>
        ))}
      </div>

      {state === 'loading' ? (
        <div className="mt-6 grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="h-[360px] animate-pulse rounded-[24px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.04)]" />
          <div className="h-[360px] animate-pulse rounded-[24px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.04)]" />
        </div>
      ) : state === 'error' ? (
        <div className="mt-6 rounded-[22px] border border-rose-400/20 bg-rose-400/10 px-5 py-5 text-sm text-rose-100">
          {error}
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <article className="rounded-[26px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="app-caption">{data?.monthLabel ?? `${targetYear}년 ${selectedMonth}월`}</div>
                <div className="mt-2 text-lg font-semibold text-[var(--app-ivory)]">
                  {data?.report?.summary.headline ?? '이 달의 흐름을 해제하면 날별 결을 바로 읽을 수 있습니다.'}
                </div>
              </div>
              {remaining !== null ? (
                <div className="text-xs text-[var(--app-copy-soft)]">잔여 코인 {remaining}개</div>
              ) : null}
            </div>

            <div className="mt-5 grid grid-cols-7 gap-2">
              {WEEKDAY_LABELS.map((label) => (
                <div key={label} className="text-center text-xs font-semibold text-[var(--app-copy-soft)]">
                  {label}
                </div>
              ))}

              {calendarRows.flatMap((week, weekIndex) =>
                week.days.map((cell, cellIndex) => {
                  if (!cell) {
                    return (
                      <div
                        key={`empty-${weekIndex}-${cellIndex}`}
                        className="aspect-square rounded-[18px] border border-dashed border-[var(--app-line)]/60 bg-[rgba(255,255,255,0.015)]"
                      />
                    );
                  }

                  const tone = data?.report && isFortuneCalendarEntry(cell)
                    ? cell.tone
                    : ('average' as FortuneCalendarTone);

                  return (
                    <div
                      key={`${selectedMonth}-${cell.day}-${weekIndex}-${cellIndex}`}
                      className={`relative aspect-square overflow-hidden rounded-[18px] border px-2 py-2 ${TONE_META[tone].cellClassName}`}
                    >
                      <div className="text-sm font-semibold">{cell.day}</div>
                      {data?.report && isFortuneCalendarEntry(cell) ? (
                        <div className="mt-2 text-[10px] leading-4 opacity-90">{TONE_META[cell.tone].label}</div>
                      ) : (
                        <div className="mt-2 text-[10px] leading-4 opacity-60">잠금</div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </article>

          <article className="rounded-[26px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] p-5">
            {data?.report ? (
              <>
                <div className="app-caption">월간 해설</div>
                <div className="mt-3 space-y-3">
                  <p className="text-sm leading-8 text-[var(--app-copy)]">{data.report.summary.summary}</p>
                  <p className="text-sm leading-8 text-[var(--app-copy)]">{data.report.summary.keyStrength}</p>
                  <p className="text-sm leading-8 text-[var(--app-copy)]">{data.report.summary.cautionLine}</p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[18px] border border-[var(--app-gold)]/22 bg-[var(--app-gold)]/10 px-4 py-4">
                    <div className="app-caption text-[var(--app-gold-text)]">결정일</div>
                    <p className="mt-3 text-sm leading-7 text-[var(--app-ivory)]">
                      {data.report.summary.decisionDays.join(' · ')}
                    </p>
                  </div>
                  <div className="rounded-[18px] border border-emerald-400/20 bg-emerald-400/10 px-4 py-4">
                    <div className="app-caption text-emerald-100">밀어도 되는 날</div>
                    <p className="mt-3 text-sm leading-7 text-emerald-50">
                      {data.report.summary.goodDays.join(' · ')}
                    </p>
                  </div>
                  <div className="rounded-[18px] border border-rose-400/20 bg-rose-400/10 px-4 py-4">
                    <div className="app-caption text-rose-100">한 번 더 확인할 날</div>
                    <p className="mt-3 text-sm leading-7 text-rose-50">{data.report.summary.cautionDays.join(' · ')}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  <CalendarHintGroup
                    title="먼저 잡아볼 날"
                    tone="decision"
                    entries={pickToneEntries(data.report, ['decision'], 3, 'high')}
                  />
                  <CalendarHintGroup
                    title="가볍게 밀어도 되는 날"
                    tone="good"
                    entries={pickToneEntries(data.report, ['good'], 3, 'high')}
                  />
                  <CalendarHintGroup
                    title="한 번 더 확인할 날"
                    tone="caution"
                    entries={pickToneEntries(data.report, ['caution'], 3, 'low')}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="app-caption">잠금 안내</div>
                <h3 className="mt-3 font-[var(--font-heading)] text-2xl text-[var(--app-gold-text)]">
                  {selectedMonth}월 흐름을 열면 좋은 날과 주의 날이 바로 갈립니다
                </h3>
                <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
                  이 달의 캘린더를 열면 결정일, 좋은 날, 보통 날, 주의 날이 색으로 정리되고, 각 날짜에 무엇을 밀고 무엇을 늦춰야 하는지 바로 읽을 수 있습니다.
                </p>
                <div className="mt-5 rounded-[20px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-4">
                  <div className="app-caption text-[var(--app-gold-soft)]">열리면 보이는 것</div>
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--app-copy)]">
                    <li>• 날짜별 결정일 / 좋은 날 / 주의 날 분류</li>
                    <li>• 그 달에 바로 밀어도 되는 결정일 4개</li>
                    <li>• 그 달에 가볍게 밀어도 되는 좋은 날 4개</li>
                    <li>• 한 번 더 확인해야 할 날 4개</li>
                    <li>• 날짜별 짧은 행동 힌트</li>
                  </ul>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button
                    onClick={() => void handleUnlock()}
                    disabled={unlocking}
                    className="rounded-full bg-[var(--app-gold)] px-5 text-sm font-semibold text-[var(--app-bg)] hover:bg-[var(--app-gold-bright)]"
                  >
                    {unlocking ? '여는 중...' : `${selectedMonth}월 캘린더 2코인으로 열기`}
                  </Button>
                  <Link
                    href={`/credits?from=fortune-calendar&slug=${encodeURIComponent(slug)}`}
                    className="inline-flex h-8 items-center justify-center rounded-full border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 text-sm text-[var(--app-copy)] transition-colors hover:bg-[rgba(255,255,255,0.06)]"
                  >
                    월간 코인팩 보기
                  </Link>
                </div>
              </>
            )}
          </article>
        </div>
      )}
    </section>
  );
}
