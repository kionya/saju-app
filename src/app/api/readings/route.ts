import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseBirthInputDraft } from '@/domain/saju/validators/birth-input';
import { createReading } from '@/lib/saju/readings';

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
        error:
          'Supabase 환경변수가 없어 로컬에서 reading 저장을 진행할 수 없습니다.',
      },
      { status: 503 }
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
