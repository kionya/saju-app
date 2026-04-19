import { NextRequest, NextResponse } from 'next/server';
import { createClient, hasSupabaseServerEnv } from '@/lib/supabase/server';
import {
  isMissingFamilyProfilesTableError,
  upsertProfile,
  type UserProfile,
} from '@/lib/profile';

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

export async function GET() {
  if (!hasSupabaseServerEnv) {
    return NextResponse.json({
      authenticated: false,
      profile: null,
      familyProfiles: [],
    });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({
      authenticated: false,
      profile: null,
      familyProfiles: [],
    });
  }

  const [profileResponse, familyResponse] = await Promise.all([
    supabase
      .from('profiles')
      .select('display_name, birth_year, birth_month, birth_day, birth_hour, gender, note')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('family_profiles')
      .select('id, label, relationship, birth_year, birth_month, birth_day, birth_hour, gender, note, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ]);

  if (profileResponse.error) {
    return NextResponse.json({ error: profileResponse.error.message }, { status: 500 });
  }

  if (familyResponse.error && !isMissingFamilyProfilesTableError(familyResponse.error)) {
    return NextResponse.json({ error: familyResponse.error.message }, { status: 500 });
  }

  return NextResponse.json({
    authenticated: true,
    profile: {
      displayName: profileResponse.data?.display_name ?? '',
      birthYear: profileResponse.data?.birth_year ?? null,
      birthMonth: profileResponse.data?.birth_month ?? null,
      birthDay: profileResponse.data?.birth_day ?? null,
      birthHour: profileResponse.data?.birth_hour ?? null,
      gender: profileResponse.data?.gender ?? null,
      note: profileResponse.data?.note ?? '',
    },
    familyProfiles: familyResponse.error && isMissingFamilyProfilesTableError(familyResponse.error)
      ? []
      : familyResponse.data?.map((profile) => ({
          id: profile.id,
          label: profile.label,
          relationship: profile.relationship,
          birthYear: profile.birth_year ?? null,
          birthMonth: profile.birth_month ?? null,
          birthDay: profile.birth_day ?? null,
          birthHour: profile.birth_hour ?? null,
          gender: profile.gender ?? null,
          note: profile.note ?? '',
          createdAt: profile.created_at,
        })) ?? [],
  });
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
