import { NextRequest, NextResponse } from 'next/server';
import {
  normalizeMoonlightCounselor,
  type MoonlightCounselorId,
} from '@/lib/counselors';
import { updatePreferredCounselor } from '@/lib/profile';
import { createClient } from '@/lib/supabase/server';

function parsePreferredCounselor(payload: unknown): MoonlightCounselorId | null {
  if (!payload || typeof payload !== 'object') return null;

  const data = payload as Record<string, unknown>;
  return normalizeMoonlightCounselor(data.preferredCounselor);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const preferredCounselor = parsePreferredCounselor(await req.json().catch(() => null));
  if (!preferredCounselor) {
    return NextResponse.json({ error: '선생 선택 값이 올바르지 않습니다.' }, { status: 400 });
  }

  try {
    const result = await updatePreferredCounselor(user.id, preferredCounselor);

    return NextResponse.json({
      success: true,
      persisted: result.persisted,
      preferredCounselor,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : '선생 선택을 저장하지 못했습니다.',
      },
      { status: 500 }
    );
  }
}
