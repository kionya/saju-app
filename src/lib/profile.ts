import { createServiceClient, hasSupabaseServerEnv, hasSupabaseServiceEnv } from '@/lib/supabase/server';
import { requireAccount } from '@/lib/account';

export interface BirthProfileFields {
  birthYear: number | null;
  birthMonth: number | null;
  birthDay: number | null;
  birthHour: number | null;
  birthMinute: number | null;
  gender: 'male' | 'female' | null;
  note: string;
}

export interface UserProfile extends BirthProfileFields {
  displayName: string;
}

export interface FamilyProfile extends BirthProfileFields {
  id: string;
  label: string;
  relationship: string;
  createdAt: string;
}

export type FamilyProfileInput = Omit<FamilyProfile, 'id' | 'createdAt'>;

const PROFILE_SELECT =
  'display_name, birth_year, birth_month, birth_day, birth_hour, gender, note';
const PROFILE_SELECT_WITH_MINUTE =
  'display_name, birth_year, birth_month, birth_day, birth_hour, birth_minute, gender, note';
const FAMILY_PROFILE_SELECT =
  'id, label, relationship, birth_year, birth_month, birth_day, birth_hour, gender, note, created_at';
const FAMILY_PROFILE_SELECT_WITH_MINUTE =
  'id, label, relationship, birth_year, birth_month, birth_day, birth_hour, birth_minute, gender, note, created_at';
const BIRTH_MINUTE_MIGRATION_ERROR =
  '운영 DB에 출생 분 저장 컬럼이 아직 적용되지 않았습니다. 005_profile_birth_minutes.sql 마이그레이션이 필요합니다.';

type ProfileRow = {
  display_name?: string | null;
  birth_year?: number | null;
  birth_month?: number | null;
  birth_day?: number | null;
  birth_hour?: number | null;
  birth_minute?: number | null;
  gender?: 'male' | 'female' | null;
  note?: string | null;
};

type FamilyProfileRow = ProfileRow & {
  id: string;
  label: string;
  relationship: string;
  created_at: string;
};

function toNumberOrNull(value: number | null | undefined) {
  return value ?? null;
}

function removeBirthMinute<T extends Record<string, unknown>>(payload: T) {
  const { birth_minute: _birthMinute, ...rest } = payload;
  return rest;
}

export function isMissingFamilyProfilesTableError(error: unknown) {
  if (!error || typeof error !== 'object') return false;

  const code = 'code' in error ? String(error.code ?? '') : '';
  const message = 'message' in error ? String(error.message ?? '') : '';

  return (
    code === 'PGRST205' ||
    code === '42P01' ||
    message.includes('public.family_profiles') ||
    message.includes("relation 'family_profiles' does not exist") ||
    message.includes('relation "family_profiles" does not exist')
  );
}

export function isMissingBirthMinuteColumnError(error: unknown) {
  if (!error || typeof error !== 'object') return false;

  const code = 'code' in error ? String(error.code ?? '') : '';
  const message = 'message' in error ? String(error.message ?? '') : '';
  const details = 'details' in error ? String(error.details ?? '') : '';
  const hint = 'hint' in error ? String(error.hint ?? '') : '';
  const combined = `${message} ${details} ${hint}`;

  return (
    combined.includes('birth_minute') &&
    (code === '42703' ||
      code === 'PGRST204' ||
      combined.includes('column') ||
      combined.includes('schema cache'))
  );
}

function mapUserProfile(row: ProfileRow | null | undefined): UserProfile {
  return {
    displayName: row?.display_name ?? '',
    birthYear: toNumberOrNull(row?.birth_year),
    birthMonth: toNumberOrNull(row?.birth_month),
    birthDay: toNumberOrNull(row?.birth_day),
    birthHour: toNumberOrNull(row?.birth_hour),
    birthMinute: toNumberOrNull(row?.birth_minute),
    gender: row?.gender ?? null,
    note: row?.note ?? '',
  };
}

function mapFamilyProfile(row: FamilyProfileRow): FamilyProfile {
  return {
    id: row.id,
    label: row.label,
    relationship: row.relationship,
    birthYear: toNumberOrNull(row.birth_year),
    birthMonth: toNumberOrNull(row.birth_month),
    birthDay: toNumberOrNull(row.birth_day),
    birthHour: toNumberOrNull(row.birth_hour),
    birthMinute: toNumberOrNull(row.birth_minute),
    gender: row.gender ?? null,
    note: row.note ?? '',
    createdAt: row.created_at,
  };
}

export async function getProfileSettingsData(redirectPath: string) {
  if (!hasSupabaseServerEnv || !hasSupabaseServiceEnv) {
    return {
      user: {
        id: 'local-preview',
        email: 'preview@dalbit.local',
      },
      profile: {
        displayName: '',
        birthYear: null,
        birthMonth: null,
        birthDay: null,
        birthHour: null,
        birthMinute: null,
        gender: null,
        note: '',
      } satisfies UserProfile,
      familyProfiles: [] satisfies FamilyProfile[],
    };
  }

  const { supabase, user } = await requireAccount(redirectPath);

  const loadProfile = (columns: string) =>
    supabase
      .from('profiles')
      .select(columns)
      .eq('user_id', user.id)
      .maybeSingle();

  const loadFamilyProfiles = (columns: string) =>
    supabase
      .from('family_profiles')
      .select(columns)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

  let profileResponse = await loadProfile(PROFILE_SELECT_WITH_MINUTE);

  if (profileResponse.error && isMissingBirthMinuteColumnError(profileResponse.error)) {
    profileResponse = await loadProfile(PROFILE_SELECT);
  }

  let familyResponse = await loadFamilyProfiles(FAMILY_PROFILE_SELECT_WITH_MINUTE);

  if (familyResponse.error && isMissingBirthMinuteColumnError(familyResponse.error)) {
    familyResponse = await loadFamilyProfiles(FAMILY_PROFILE_SELECT);
  }

  if (profileResponse.error) {
    throw new Error(profileResponse.error.message);
  }

  const profile = mapUserProfile(profileResponse.data as ProfileRow | null);

  if (familyResponse.error && !isMissingFamilyProfilesTableError(familyResponse.error)) {
    throw new Error(familyResponse.error.message);
  }

  const familyProfiles: FamilyProfile[] =
    familyResponse.error && isMissingFamilyProfilesTableError(familyResponse.error)
      ? []
      : ((familyResponse.data ?? []) as unknown as FamilyProfileRow[]).map((item) =>
          mapFamilyProfile(item)
        );

  return {
    user: {
      id: user.id,
      email: user.email ?? '',
    },
    profile,
    familyProfiles,
  };
}

export async function upsertProfile(userId: string, profile: UserProfile) {
  const service = await createServiceClient();

  const payload = {
    user_id: userId,
    display_name: profile.displayName || null,
    birth_year: profile.birthYear,
    birth_month: profile.birthMonth,
    birth_day: profile.birthDay,
    birth_hour: profile.birthHour,
    birth_minute: profile.birthMinute,
    gender: profile.gender,
    note: profile.note || null,
    updated_at: new Date().toISOString(),
  };

  let response = await service.from('profiles').upsert(payload);

  if (response.error && isMissingBirthMinuteColumnError(response.error)) {
    if (profile.birthMinute !== null) {
      throw new Error(BIRTH_MINUTE_MIGRATION_ERROR);
    }
    response = await service.from('profiles').upsert(removeBirthMinute(payload));
  }

  if (response.error) {
    throw new Error(response.error.message);
  }
}

export async function createFamilyProfile(
  userId: string,
  profile: FamilyProfileInput
) {
  const service = await createServiceClient();

  const payload = {
    user_id: userId,
    label: profile.label,
    relationship: profile.relationship,
    birth_year: profile.birthYear,
    birth_month: profile.birthMonth,
    birth_day: profile.birthDay,
    birth_hour: profile.birthHour,
    birth_minute: profile.birthMinute,
    gender: profile.gender,
    note: profile.note || null,
    updated_at: new Date().toISOString(),
  };

  let response = await service
    .from('family_profiles')
    .insert(payload)
    .select('id')
    .single();

  if (response.error && isMissingBirthMinuteColumnError(response.error)) {
    if (profile.birthMinute !== null) {
      throw new Error(BIRTH_MINUTE_MIGRATION_ERROR);
    }
    response = await service
      .from('family_profiles')
      .insert(removeBirthMinute(payload))
      .select('id')
      .single();
  }

  if (response.error || !response.data) {
    if (isMissingFamilyProfilesTableError(response.error)) {
      throw new Error('운영 DB에 가족 프로필 테이블이 아직 적용되지 않았습니다. 003_profiles.sql 마이그레이션이 필요합니다.');
    }
    throw new Error(response.error?.message ?? '가족 프로필을 저장하지 못했습니다.');
  }

  return response.data.id as string;
}

export async function updateFamilyProfile(
  userId: string,
  familyProfileId: string,
  profile: FamilyProfileInput
) {
  const service = await createServiceClient();

  const payload = {
    label: profile.label,
    relationship: profile.relationship,
    birth_year: profile.birthYear,
    birth_month: profile.birthMonth,
    birth_day: profile.birthDay,
    birth_hour: profile.birthHour,
    birth_minute: profile.birthMinute,
    gender: profile.gender,
    note: profile.note || null,
    updated_at: new Date().toISOString(),
  };

  let response = await service
    .from('family_profiles')
    .update(payload)
    .eq('id', familyProfileId)
    .eq('user_id', userId);

  if (response.error && isMissingBirthMinuteColumnError(response.error)) {
    if (profile.birthMinute !== null) {
      throw new Error(BIRTH_MINUTE_MIGRATION_ERROR);
    }
    response = await service
      .from('family_profiles')
      .update(removeBirthMinute(payload))
      .eq('id', familyProfileId)
      .eq('user_id', userId);
  }

  if (response.error) {
    if (isMissingFamilyProfilesTableError(response.error)) {
      throw new Error('운영 DB에 가족 프로필 테이블이 아직 적용되지 않았습니다. 003_profiles.sql 마이그레이션이 필요합니다.');
    }
    throw new Error(response.error.message);
  }
}

export async function deleteFamilyProfile(userId: string, familyProfileId: string) {
  const service = await createServiceClient();
  const { error } = await service
    .from('family_profiles')
    .delete()
    .eq('id', familyProfileId)
    .eq('user_id', userId);

  if (error) {
    if (isMissingFamilyProfilesTableError(error)) {
      throw new Error('운영 DB에 가족 프로필 테이블이 아직 적용되지 않았습니다. 003_profiles.sql 마이그레이션이 필요합니다.');
    }
    throw new Error(error.message);
  }
}
