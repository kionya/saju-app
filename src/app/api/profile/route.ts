import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { upsertProfile, type UserProfile } from '@/lib/profile';

function parseOptionalInt(value: unknown, min: number, max: number) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) return null;
  return parsed;
}

function parseProfile(payload: unknown): UserProfile | null {
  if (!payload || typeof payload !== 'object') return null;

  const data = payload as Record<string, unknown>;
  const displayName = typeof data.displayName === 'string' ? data.displayName.trim() : '';
  const note = typeof data.note === 'string' ? data.note.trim() : '';
  const gender =
    data.gender === 'male' || data.gender === 'female' ? data.gender : null;

  const birthYear =
    data.birthYear === '' || data.birthYear === undefined || data.birthYear === null
      ? null
      : parseOptionalInt(data.birthYear, 1900, new Date().getFullYear());
  const birthMonth =
    data.birthMonth === '' || data.birthMonth === undefined || data.birthMonth === null
      ? null
      : parseOptionalInt(data.birthMonth, 1, 12);
  const birthDay =
    data.birthDay === '' || data.birthDay === undefined || data.birthDay === null
      ? null
      : parseOptionalInt(data.birthDay, 1, 31);
  const birthHour =
    data.birthHour === '' || data.birthHour === undefined || data.birthHour === null
      ? null
      : parseOptionalInt(data.birthHour, 0, 23);

  if (
    (data.birthYear !== '' && data.birthYear !== undefined && data.birthYear !== null && birthYear === null) ||
    (data.birthMonth !== '' && data.birthMonth !== undefined && data.birthMonth !== null && birthMonth === null) ||
    (data.birthDay !== '' && data.birthDay !== undefined && data.birthDay !== null && birthDay === null) ||
    (data.birthHour !== '' && data.birthHour !== undefined && data.birthHour !== null && birthHour === null)
  ) {
    return null;
  }

  return {
    displayName,
    birthYear,
    birthMonth,
    birthDay,
    birthHour,
    gender,
    note,
  };
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const profile = parseProfile(await req.json().catch(() => null));
  if (!profile) {
    return NextResponse.json({ error: '프로필 정보가 올바르지 않습니다.' }, { status: 400 });
  }

  try {
    await upsertProfile(user.id, profile);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : '프로필을 저장하지 못했습니다.',
      },
      { status: 500 }
    );
  }
}
