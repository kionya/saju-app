import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isValidBirthInput } from '@/lib/saju/pillars';
import { createReading } from '@/lib/saju/readings';
import type { BirthInput } from '@/lib/saju/types';

function toInt(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

function parseBirthInput(payload: unknown): BirthInput | null {
  if (!payload || typeof payload !== 'object') return null;

  const record = payload as Record<string, unknown>;
  const year = toInt(record.year);
  const month = toInt(record.month);
  const day = toInt(record.day);
  const hour =
    record.hour === undefined || record.hour === null || record.hour === ''
      ? undefined
      : toInt(record.hour);
  const gender =
    record.gender === 'male' || record.gender === 'female'
      ? record.gender
      : undefined;

  if (year === null || month === null || day === null || hour === null) {
    return null;
  }

  const input: BirthInput = {
    year,
    month,
    day,
    hour,
    gender,
  };

  return isValidBirthInput(input) ? input : null;
}

export async function POST(req: NextRequest) {
  const input = parseBirthInput(await req.json().catch(() => null));

  if (!input) {
    return NextResponse.json(
      { error: '생년월일시 정보가 올바르지 않습니다.' },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const id = await createReading(input, user?.id ?? null);
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
