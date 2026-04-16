import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getManagedSubscription } from '@/lib/subscription';

export interface AccountCredits {
  balance: number;
  subscriptionBalance: number;
  total: number;
}

export interface AccountSubscription {
  status: 'active' | 'cancelled' | 'expired';
  plan: string;
  renewsAt: string | null;
  createdAt: string;
}

export interface AccountReading {
  id: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number | null;
  gender: 'male' | 'female' | null;
  createdAt: string;
}

export interface AccountTransaction {
  id: string;
  amount: number;
  type: 'purchase' | 'subscription' | 'use' | 'signup_bonus';
  feature: string | null;
  createdAt: string;
  metadata: Record<string, unknown> | null;
}

export interface AccountDashboardData {
  user: {
    id: string;
    email: string | null;
  };
  credits: AccountCredits;
  subscription: AccountSubscription | null;
  recentReadings: AccountReading[];
  recentTransactions: AccountTransaction[];
}

export async function requireAccount(redirectPath: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(redirectPath)}`);
  }

  return { supabase, user };
}

export async function getAccountDashboardData(
  redirectPath: string,
  options: { readingLimit?: number; transactionLimit?: number } = {}
): Promise<AccountDashboardData> {
  const { supabase, user } = await requireAccount(redirectPath);
  const readingLimit = options.readingLimit ?? 5;
  const transactionLimit = options.transactionLimit ?? 6;

  const [creditsResponse, subscription, readingsResponse, transactionsResponse] =
    await Promise.all([
      supabase
        .from('user_credits')
        .select('balance, subscription_balance')
        .eq('user_id', user.id)
        .maybeSingle(),
      getManagedSubscription(user.id),
      supabase
        .from('readings')
        .select('id, birth_year, birth_month, birth_day, birth_hour, gender, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(readingLimit),
      supabase
        .from('credit_transactions')
        .select('id, amount, type, feature, metadata, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(transactionLimit),
    ]);

  const balance = creditsResponse.data?.balance ?? 0;
  const subscriptionBalance = creditsResponse.data?.subscription_balance ?? 0;

  return {
    user: {
      id: user.id,
      email: user.email ?? null,
    },
    credits: {
      balance,
      subscriptionBalance,
      total: balance + subscriptionBalance,
    },
    subscription: subscription
      ? {
          status: subscription.status,
          plan: subscription.plan,
          renewsAt: subscription.renewsAt,
          createdAt: subscription.createdAt,
        }
      : null,
    recentReadings:
      readingsResponse.data?.map((reading) => ({
        id: reading.id,
        birthYear: reading.birth_year,
        birthMonth: reading.birth_month,
        birthDay: reading.birth_day,
        birthHour: reading.birth_hour,
        gender: reading.gender,
        createdAt: reading.created_at,
      })) ?? [],
    recentTransactions:
      transactionsResponse.data?.map((transaction) => ({
        id: transaction.id,
        amount: transaction.amount,
        type: transaction.type,
        feature: transaction.feature,
        createdAt: transaction.created_at,
        metadata:
          transaction.metadata && typeof transaction.metadata === 'object'
            ? (transaction.metadata as Record<string, unknown>)
            : null,
      })) ?? [],
  };
}
