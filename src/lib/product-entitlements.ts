import {
  createServiceClient,
  hasSupabaseServiceEnv,
} from '@/lib/supabase/server';
import type { TasteProductId } from '@/lib/payments/catalog';

export interface TasteProductEntitlement {
  id: string;
  userId: string;
  productId: TasteProductId;
  scopeKey: string | null;
  orderId: string | null;
  paymentKey: string | null;
  amount: number | null;
  packageId: string | null;
  createdAt: string;
}

interface EntitlementTransactionRow {
  id: string;
  user_id: string;
  metadata: Record<string, unknown> | null;
  amount: number | null;
  created_at: string;
}

export function buildReadingProductScopeKey(readingKey: string) {
  return `reading:${readingKey}`;
}

export function buildTodayDetailScopeKey(sourceSessionId: string) {
  return `today:${sourceSessionId}`;
}

export function buildMonthlyCalendarScopeKey(readingKey: string, year: number, month: number) {
  return `calendar:${readingKey}:${year}-${String(month).padStart(2, '0')}`;
}

function mapEntitlement(row: EntitlementTransactionRow): TasteProductEntitlement {
  const metadata = row.metadata ?? {};

  return {
    id: row.id,
    userId: row.user_id,
    productId: metadata.productId as TasteProductId,
    scopeKey: typeof metadata.scopeKey === 'string' ? metadata.scopeKey : null,
    orderId: typeof metadata.orderId === 'string' ? metadata.orderId : null,
    paymentKey: typeof metadata.paymentKey === 'string' ? metadata.paymentKey : null,
    amount: typeof metadata.amount === 'number' ? metadata.amount : row.amount,
    packageId: typeof metadata.packageId === 'string' ? metadata.packageId : null,
    createdAt: row.created_at,
  };
}

function matchesProductScope(metadata: Record<string, unknown>, scopeKey: string | null) {
  if (!scopeKey) return metadata.scopeKey === undefined || metadata.scopeKey === null || metadata.scopeKey === '';
  return metadata.scopeKey === scopeKey || metadata.scopeKey === undefined || metadata.scopeKey === null;
}

export async function getTasteProductEntitlement(
  userId: string | null | undefined,
  productId: TasteProductId,
  scopeKey: string | null = null
): Promise<TasteProductEntitlement | null> {
  if (!userId || !hasSupabaseServiceEnv) return null;

  const service = await createServiceClient();
  const { data, error } = await service
    .from('credit_transactions')
    .select('id, user_id, metadata, amount, created_at')
    .eq('user_id', userId)
    .eq('type', 'purchase')
    .eq('feature', 'taste_product')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const matched = (data as EntitlementTransactionRow[] | null)?.find((row) => {
    const metadata = row.metadata ?? {};
    return (
      metadata.kind === 'taste_product' &&
      metadata.productId === productId &&
      matchesProductScope(metadata, scopeKey)
    );
  });

  return matched ? mapEntitlement(matched) : null;
}

export async function grantTasteProductEntitlement(
  userId: string,
  productId: TasteProductId,
  options: {
    scopeKey?: string | null;
    orderId?: string | null;
    paymentKey?: string | null;
    amount?: number | null;
    packageId?: string | null;
  } = {}
) {
  const scopeKey = options.scopeKey ?? null;
  const existing = await getTasteProductEntitlement(userId, productId, scopeKey);
  if (existing) return existing;

  const service = await createServiceClient();
  const { data, error } = await service
    .from('credit_transactions')
    .insert({
      user_id: userId,
      amount: 0,
      type: 'purchase',
      feature: 'taste_product',
      metadata: {
        kind: 'taste_product',
        productId,
        scopeKey,
        orderId: options.orderId ?? null,
        paymentKey: options.paymentKey ?? null,
        amount: options.amount ?? null,
        packageId: options.packageId ?? null,
      },
    })
    .select('id, user_id, metadata, amount, created_at')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? '소액 상품 이용권을 저장하지 못했습니다.');
  }

  return mapEntitlement(data as EntitlementTransactionRow);
}
