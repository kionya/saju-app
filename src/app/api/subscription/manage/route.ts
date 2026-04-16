import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateSubscriptionStatus } from '@/lib/subscription';

function parseAction(payload: unknown) {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const action = (payload as Record<string, unknown>).action;
  if (action === 'cancel' || action === 'resume') {
    return action;
  }

  return null;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const action = parseAction(await req.json().catch(() => null));
  if (!action) {
    return NextResponse.json({ error: '요청 액션이 올바르지 않습니다.' }, { status: 400 });
  }

  try {
    const subscription = await updateSubscriptionStatus(
      user.id,
      action === 'cancel' ? 'cancelled' : 'active'
    );

    return NextResponse.json({ success: true, subscription });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : '구독 상태를 변경하지 못했습니다.',
      },
      { status: 500 }
    );
  }
}
