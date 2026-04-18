import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { markNotificationHeartbeat } from '@/lib/notification-preferences';

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    await markNotificationHeartbeat(user.id, new Date().toISOString());
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '방문 시각을 갱신하지 못했습니다.' },
      { status: 500 }
    );
  }
}
