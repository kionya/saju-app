import { createServiceClient } from '@/lib/supabase/server';

export type Feature =
  | 'detail_report'   // 1 크레딧
  | 'compat'          // 2 크레딧
  | 'ai_chat'         // 1 크레딧
  | 'daewoon'         // 3 크레딧
  | 'calendar';       // 2 크레딧

const CREDIT_COSTS: Record<Feature, number> = {
  detail_report: 1,
  compat: 2,
  ai_chat: 1,
  daewoon: 3,
  calendar: 2,
};

export function isFeature(value: unknown): value is Feature {
  return typeof value === 'string' && value in CREDIT_COSTS;
}

export function getFeatureCost(feature: Feature) {
  return CREDIT_COSTS[feature];
}

export async function getCredits(userId: string): Promise<{ balance: number; subscription_balance: number } | null> {
  const supabase = await createServiceClient();
  const { data } = await supabase
    .from('user_credits')
    .select('balance, subscription_balance')
    .eq('user_id', userId)
    .single();
  return data;
}

export async function deductCredits(
  userId: string,
  feature: Feature
): Promise<{ success: boolean; remaining: number; error?: string }> {
  const cost = CREDIT_COSTS[feature];
  const supabase = await createServiceClient();

  // 원자적 차감: RPC 사용
  const { data, error } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_cost: cost,
    p_feature: feature,
  });

  if (error || !data?.success) {
    return { success: false, remaining: 0, error: error?.message ?? '코인이 부족합니다.' };
  }

  return { success: true, remaining: data.remaining };
}

export async function addCredits(
  userId: string,
  amount: number,
  type: 'purchase' | 'subscription',
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const supabase = await createServiceClient();

  await supabase.rpc('add_credits', {
    p_user_id: userId,
    p_amount: amount,
    p_type: type,
    p_metadata: metadata,
  });
}
