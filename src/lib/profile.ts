import { createServiceClient, hasSupabaseServerEnv, hasSupabaseServiceEnv } from '@/lib/supabase/server';
import { requireAccount } from '@/lib/account';

export interface BirthProfileFields {
  birthYear: number | null;
  birthMonth: number | null;
  birthDay: number | null;
  birthHour: number | null;
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

function toNumberOrNull(value: number | null | undefined) {
  return value ?? null;
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
        gender: null,
        note: '',
      } satisfies UserProfile,
      familyProfiles: [] satisfies FamilyProfile[],
    };
  }

  const { supabase, user } = await requireAccount(redirectPath);

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

  const profile: UserProfile = {
    displayName: profileResponse.data?.display_name ?? '',
    birthYear: toNumberOrNull(profileResponse.data?.birth_year),
    birthMonth: toNumberOrNull(profileResponse.data?.birth_month),
    birthDay: toNumberOrNull(profileResponse.data?.birth_day),
    birthHour: toNumberOrNull(profileResponse.data?.birth_hour),
    gender: profileResponse.data?.gender ?? null,
    note: profileResponse.data?.note ?? '',
  };

  if (familyResponse.error && !isMissingFamilyProfilesTableError(familyResponse.error)) {
    throw new Error(familyResponse.error.message);
  }

  const familyProfiles: FamilyProfile[] =
    familyResponse.error && isMissingFamilyProfilesTableError(familyResponse.error)
      ? []
      : familyResponse.data?.map((item) => ({
          id: item.id,
          label: item.label,
          relationship: item.relationship,
          birthYear: toNumberOrNull(item.birth_year),
          birthMonth: toNumberOrNull(item.birth_month),
          birthDay: toNumberOrNull(item.birth_day),
          birthHour: toNumberOrNull(item.birth_hour),
          gender: item.gender ?? null,
          note: item.note ?? '',
          createdAt: item.created_at,
        })) ?? [];

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

  const { error } = await service.from('profiles').upsert({
    user_id: userId,
    display_name: profile.displayName || null,
    birth_year: profile.birthYear,
    birth_month: profile.birthMonth,
    birth_day: profile.birthDay,
    birth_hour: profile.birthHour,
    gender: profile.gender,
    note: profile.note || null,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function createFamilyProfile(
  userId: string,
  profile: FamilyProfileInput
) {
  const service = await createServiceClient();

  const { data, error } = await service
    .from('family_profiles')
    .insert({
      user_id: userId,
      label: profile.label,
      relationship: profile.relationship,
      birth_year: profile.birthYear,
      birth_month: profile.birthMonth,
      birth_day: profile.birthDay,
      birth_hour: profile.birthHour,
      gender: profile.gender,
      note: profile.note || null,
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error || !data) {
    if (isMissingFamilyProfilesTableError(error)) {
      throw new Error('운영 DB에 가족 프로필 테이블이 아직 적용되지 않았습니다. 003_profiles.sql 마이그레이션이 필요합니다.');
    }
    throw new Error(error?.message ?? '가족 프로필을 저장하지 못했습니다.');
  }

  return data.id as string;
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
