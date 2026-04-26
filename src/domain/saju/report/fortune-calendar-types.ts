export type FortuneCalendarTone = 'decision' | 'good' | 'average' | 'caution';

export interface FortuneCalendarDayEntry {
  isoDate: string;
  day: number;
  weekday: number;
  tone: FortuneCalendarTone;
  score: number;
  title: string;
  summary: string;
  actionHint: string;
}

export interface FortuneCalendarWeekRow {
  week: number;
  days: Array<FortuneCalendarDayEntry | null>;
}

export interface FortuneCalendarMonthSummary {
  headline: string;
  summary: string;
  toneCounts: Record<FortuneCalendarTone, number>;
  keyStrength: string;
  cautionLine: string;
  bestDays: string[];
  cautionDays: string[];
}

export interface FortuneCalendarMonthReport {
  year: number;
  month: number;
  monthLabel: string;
  totalDays: number;
  weeks: FortuneCalendarWeekRow[];
  days: FortuneCalendarDayEntry[];
  summary: FortuneCalendarMonthSummary;
}
