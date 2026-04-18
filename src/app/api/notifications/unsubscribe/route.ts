import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { deactivatePushSubscription } from '@/lib/notification-preferences';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const payload = (await req.json().catch(() => null)) as { endpoint?: unknown } | null;
  if (!payload || typeof payload.endpoint !== 'string' || !payload.endpoint) {
    return NextResponse.json({ error: '해제할 endpoint가 필요합니다.' }, { status: 400 });
  }

  try {
    await deactivatePushSubscription(user.id, payload.endpoint);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '푸시 구독을 해제하지 못했습니다.' },
      { status: 500 }
    );
  }
}
