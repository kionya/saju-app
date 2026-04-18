import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { savePushSubscription } from '@/lib/notification-preferences';
import { isWebPushConfigured } from '@/lib/web-push';

function parseSubscription(payload: unknown) {
  if (!payload || typeof payload !== 'object') return null;

  const data = payload as Record<string, unknown>;
  const keys =
    data.keys && typeof data.keys === 'object' ? (data.keys as Record<string, unknown>) : null;
  const expirationTime =
    typeof data.expirationTime === 'number' && Number.isFinite(data.expirationTime)
      ? data.expirationTime
      : typeof data.expirationTime === 'string' && data.expirationTime.length > 0
        ? new Date(data.expirationTime).getTime()
        : null;

  if (
    typeof data.endpoint !== 'string' ||
    !data.endpoint ||
    !keys ||
    typeof keys.p256dh !== 'string' ||
    typeof keys.auth !== 'string' ||
    (expirationTime !== null && !Number.isFinite(expirationTime))
  ) {
    return null;
  }

  return {
    endpoint: data.endpoint,
    expirationTime,
    keys: {
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
  };
}

export async function POST(req: NextRequest) {
  if (!isWebPushConfigured()) {
    return NextResponse.json(
      { error: '웹 푸시 VAPID 환경변수가 아직 설정되지 않았습니다.' },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const subscription = parseSubscription(await req.json().catch(() => null));
  if (!subscription) {
    return NextResponse.json({ error: '브라우저 푸시 구독 정보가 올바르지 않습니다.' }, { status: 400 });
  }

  try {
    await savePushSubscription(user.id, subscription, req.headers.get('user-agent'));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '푸시 구독을 저장하지 못했습니다.' },
      { status: 500 }
    );
  }
}
