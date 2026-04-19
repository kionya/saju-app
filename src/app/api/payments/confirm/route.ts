import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSubscriptionPackage } from '@/lib/payments/catalog';
import { confirmPayment, getPackage } from '@/lib/payments/toss';
import { addCredits } from '@/lib/credits/deduct';
import { grantLifetimeReportEntitlement } from '@/lib/report-entitlements';
import { activateMembershipSubscription } from '@/lib/subscription';

export async function POST(req: NextRequest) {
  const { paymentKey, orderId, amount, packageId, slug } = await req.json();
  const parsedAmount = Number(amount);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const pkg = getPackage(packageId);
  if (!pkg || pkg.price !== parsedAmount) {
    return NextResponse.json({ error: '잘못된 결제 정보입니다.' }, { status: 400 });
  }

  // 토스페이먼츠 결제 승인
  const payment = await confirmPayment(paymentKey, orderId, parsedAmount).catch(err => {
    return NextResponse.json({ error: err.message }, { status: 400 });
  });

  if (payment instanceof NextResponse) return payment;

  if (pkg.credits > 0) {
    await addCredits(user.id, pkg.credits, pkg.kind === 'subscription' ? 'subscription' : 'purchase', {
      orderId,
      packageId: pkg.id,
      paymentKey,
    });
  }

  const subscription = isSubscriptionPackage(pkg)
    ? await activateMembershipSubscription(user.id, {
        plan: pkg.subscriptionPlan,
      })
    : null;

  const entitlement =
    pkg.kind === 'lifetime_report' && typeof slug === 'string' && slug.trim().length > 0
      ? await grantLifetimeReportEntitlement(user.id, slug.trim(), {
          orderId,
          paymentKey,
          amount: parsedAmount,
        })
      : null;

  return NextResponse.json({
    success: true,
    credits: pkg.credits,
    subscription,
    entitlement,
    plan: 'planSlug' in pkg ? pkg.planSlug : null,
  });
}
