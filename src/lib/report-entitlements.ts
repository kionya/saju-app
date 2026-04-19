import {
  createServiceClient,
  hasSupabaseServiceEnv,
} from '@/lib/supabase/server';

export interface LifetimeReportEntitlement {
  id: string;
  userId: string;
  readingKey: string;
  orderId: string | null;
  paymentKey: string | null;
  amount: number | null;
  createdAt: string;
}

interface EntitlementTransactionRow {
  id: string;
  user_id: string;
  metadata: Record<string, unknown> | null;
  amount: number | null;
  created_at: string;
}

function mapEntitlement(row: EntitlementTransactionRow): LifetimeReportEntitlement {
  const metadata = row.metadata ?? {};

  return {
    id: row.id,
    userId: row.user_id,
    readingKey: typeof metadata.readingKey === 'string' ? metadata.readingKey : '',
    orderId: typeof metadata.orderId === 'string' ? metadata.orderId : null,
    paymentKey: typeof metadata.paymentKey === 'string' ? metadata.paymentKey : null,
    amount: typeof metadata.amount === 'number' ? metadata.amount : row.amount,
    createdAt: row.created_at,
  };
}

export async function getLifetimeReportEntitlement(
  userId: string | null | undefined,
  readingKey: string
): Promise<LifetimeReportEntitlement | null> {
  if (!userId || !hasSupabaseServiceEnv) return null;

  const service = await createServiceClient();
  const { data, error } = await service
    .from('credit_transactions')
    .select('id, user_id, metadata, amount, created_at')
    .eq('user_id', userId)
    .eq('type', 'purchase')
    .eq('feature', 'lifetime_report')
    .contains('metadata', { kind: 'lifetime_report', readingKey })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapEntitlement(data as EntitlementTransactionRow) : null;
}

export async function grantLifetimeReportEntitlement(
  userId: string,
  readingKey: string,
  options: {
    orderId?: string | null;
    paymentKey?: string | null;
    amount?: number | null;
  } = {}
) {
  const existing = await getLifetimeReportEntitlement(userId, readingKey);
  if (existing) return existing;

  const service = await createServiceClient();
  const { data, error } = await service
    .from('credit_transactions')
    .insert({
      user_id: userId,
      amount: 0,
      type: 'purchase',
      feature: 'lifetime_report',
      metadata: {
        kind: 'lifetime_report',
        readingKey,
        orderId: options.orderId ?? null,
        paymentKey: options.paymentKey ?? null,
        amount: options.amount ?? null,
      },
    })
    .select('id, user_id, metadata, amount, created_at')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? '평생 리포트 권한을 저장하지 못했습니다.');
  }

  return mapEntitlement(data as EntitlementTransactionRow);
}
