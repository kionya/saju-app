import type { PlanSlug } from '@/content/moonlight';

export type PaymentPackageKind = 'credits' | 'subscription' | 'lifetime_report';
export type SubscriptionPlan = 'plus_monthly' | 'premium_monthly';

export interface PaymentPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  kind: PaymentPackageKind;
  planSlug?: PlanSlug;
  subscriptionPlan?: SubscriptionPlan;
}

export const PAYMENT_PACKAGES = [
  { id: 'credit_1', name: '체험 1 코인', credits: 1, price: 500, kind: 'credits' },
  { id: 'credit_3', name: '스타터 3 코인', credits: 3, price: 990, kind: 'credits' },
  { id: 'credit_7', name: '기본 7 코인', credits: 7, price: 2000, kind: 'credits' },
  {
    id: 'subscription_30',
    name: 'Plus 30 코인',
    credits: 30,
    price: 9900,
    kind: 'subscription',
    subscriptionPlan: 'plus_monthly',
  },
  {
    id: 'membership_plus',
    name: 'Plus 월간 멤버십',
    credits: 2,
    price: 4900,
    kind: 'subscription',
    planSlug: 'basic',
    subscriptionPlan: 'plus_monthly',
  },
  {
    id: 'membership_premium',
    name: '프리미엄 월간 멤버십',
    credits: 10,
    price: 9900,
    kind: 'subscription',
    planSlug: 'premium',
    subscriptionPlan: 'premium_monthly',
  },
  {
    id: 'lifetime_report',
    name: '평생 심층 리포트',
    credits: 0,
    price: 49000,
    kind: 'lifetime_report',
    planSlug: 'lifetime',
  },
] as const satisfies readonly PaymentPackage[];

export type PackageId = (typeof PAYMENT_PACKAGES)[number]['id'];

const MEMBERSHIP_PACKAGE_BY_PLAN: Record<PlanSlug, PackageId> = {
  basic: 'membership_plus',
  premium: 'membership_premium',
  lifetime: 'lifetime_report',
};

export function getPackage(id: unknown) {
  if (typeof id !== 'string') return undefined;
  return PAYMENT_PACKAGES.find((pkg) => pkg.id === id);
}

export function getMembershipPackage(plan: PlanSlug) {
  return getPackage(MEMBERSHIP_PACKAGE_BY_PLAN[plan]);
}

export function isSubscriptionPackage(
  pkg: PaymentPackage
): pkg is PaymentPackage & { subscriptionPlan: SubscriptionPlan } {
  return pkg.kind === 'subscription' && Boolean(pkg.subscriptionPlan);
}
