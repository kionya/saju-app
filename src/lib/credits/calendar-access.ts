import { createServiceClient } from '@/lib/supabase/server';
import {
  deductCredits,
  getCredits,
} from './deduct';

export const FORTUNE_CALENDAR_MONTH_ACCESS_KIND = 'fortune_calendar_month_access';

export interface FortuneCalendarUnlockResult {
  success: boolean;
  remaining: number;
  reused: boolean;
  error?: string;
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

export function getFortuneCalendarMonthKey(year: number, month: number) {
  return `${year}-${pad(month)}`;
}

async function getRemainingCredits(userId: string) {
  const credits = await getCredits(userId);
  return (credits?.balance ?? 0) + (credits?.subscription_balance ?? 0);
}

export async function hasFortuneCalendarMonthAccess(
  userId: string,
  readingKey: string,
  year: number,
  month: number
) {
  const service = await createServiceClient();
  const yearMonth = getFortuneCalendarMonthKey(year, month);
  const { data, error } = await service
    .from('credit_transactions')
    .select('id')
    .eq('user_id', userId)
    .eq('type', 'use')
    .eq('feature', 'calendar')
    .contains('metadata', {
      kind: FORTUNE_CALENDAR_MONTH_ACCESS_KIND,
      readingKey,
      yearMonth,
    })
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data && data.length > 0);
}

export async function recordFortuneCalendarMonthAccess(
  userId: string,
  readingKey: string,
  year: number,
  month: number
) {
  const service = await createServiceClient();
  const yearMonth = getFortuneCalendarMonthKey(year, month);
  const { error } = await service.from('credit_transactions').insert({
    user_id: userId,
    amount: 0,
    type: 'use',
    feature: 'calendar',
    metadata: {
      kind: FORTUNE_CALENDAR_MONTH_ACCESS_KIND,
      readingKey,
      yearMonth,
      year,
      month,
    },
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function unlockFortuneCalendarMonth(
  userId: string,
  readingKey: string,
  year: number,
  month: number
): Promise<FortuneCalendarUnlockResult> {
  if (await hasFortuneCalendarMonthAccess(userId, readingKey, year, month)) {
    return {
      success: true,
      remaining: await getRemainingCredits(userId),
      reused: true,
    };
  }

  const deducted = await deductCredits(userId, 'calendar');

  if (!deducted.success) {
    return {
      success: false,
      remaining: deducted.remaining,
      reused: false,
      error: deducted.error,
    };
  }

  await recordFortuneCalendarMonthAccess(userId, readingKey, year, month);

  return {
    success: true,
    remaining: deducted.remaining,
    reused: false,
  };
}
