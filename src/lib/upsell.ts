import { getTodayConcern, pickLowestConcernFromScores } from '@/lib/today-fortune/concerns';
import type { ConcernId, TodayFortuneFreeResult } from '@/lib/today-fortune/types';

export function selectUpsell(
  result: Pick<TodayFortuneFreeResult, 'scores'>,
  concernId: ConcernId
) {
  const resolvedConcernId =
    concernId === 'general' ? pickLowestConcernFromScores(result.scores) : concernId;
  const concern = getTodayConcern(resolvedConcernId);

  return {
    copy: concern.staticUpsellCopy,
    product: 'TODAY_DEEP_READING' as const,
  };
}

