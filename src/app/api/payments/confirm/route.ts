import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { confirmPayment, getPackage, type PackageId } from '@/lib/payments/toss';
import { addCredits } from '@/lib/credits/deduct';

export async function POST(req: NextRequest) {
  const { paymentKey, orderId, amount, packageId } = await req.json();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const pkg = getPackage(packageId as PackageId);
  if (!pkg || pkg.price !== amount) {
    return NextResponse.json({ error: '잘못된 결제 정보입니다.' }, { status: 400 });
  }

  // 토스페이먼츠 결제 승인
  const payment = await confirmPayment(paymentKey, orderId, amount).catch(err => {
    return NextResponse.json({ error: err.message }, { status: 400 });
  });

  if (payment instanceof NextResponse) return payment;

  // 크레딧 충전
  const type = ('isSubscription' in pkg && pkg.isSubscription) ? 'subscription' : 'purchase';
  await addCredits(user.id, pkg.credits, type, { orderId, packageId });

  return NextResponse.json({ success: true, credits: pkg.credits });
}