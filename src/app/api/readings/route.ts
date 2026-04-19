import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseBirthInputDraft } from '@/domain/saju/validators/birth-input';
import { toSlug } from '@/lib/saju/pillars';
import { createReading, deleteReadingForUser } from '@/lib/saju/readings';

export async function POST(req: NextRequest) {
  const parsed = parseBirthInputDraft(await req.json().catch(() => null));

  if (!parsed.ok) {
    return NextResponse.json(
      { error: parsed.error },
      { status: 400 }
    );
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json(
      {
        id: toSlug(parsed.input),
        mode: 'preview',
      },
      { status: 200 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const id = await createReading(parsed.input, user?.id ?? null);
    return NextResponse.json({ id });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : '사주 결과를 생성하지 못했습니다.',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const payload = await req.json().catch(() => null);
  const id =
    payload && typeof payload === 'object' && 'id' in payload
      ? String(payload.id ?? '').trim()
      : '';

  if (!id) {
    return NextResponse.json({ error: '삭제할 결과가 필요합니다.' }, { status: 400 });
  }

  try {
    const deleted = await deleteReadingForUser(id, user.id);

    if (!deleted) {
      return NextResponse.json({ error: '삭제할 결과를 찾지 못했습니다.' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : '결과를 삭제하지 못했습니다.',
      },
      { status: 500 }
    );
  }
}
