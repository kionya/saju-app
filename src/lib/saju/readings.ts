import { createServiceClient } from '@/lib/supabase/server';
import { fromSlug } from './pillars';
import type { BirthInput, SajuResult as LegacySajuResult } from './types';
import {
  calculateSajuDataV1,
  deriveLegacySajuResult,
  normalizeToSajuDataV1,
  type SajuDataV1,
} from '@/domain/saju/engine/saju-data-v1';

const READING_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface ReadingRow {
  id: string;
  user_id: string | null;
  birth_year: number;
  birth_month: number;
  birth_day: number;
  birth_hour: number | null;
  gender: 'male' | 'female' | null;
  result_json: unknown;
}

export interface ReadingRecord {
  id: string;
  userId: string | null;
  input: BirthInput;
  sajuData: SajuDataV1;
  result: LegacySajuResult;
}

function deriveBirthInputFromSajuData(
  fallback: BirthInput,
  sajuData: SajuDataV1
): BirthInput {
  return {
    year: sajuData.input.birth.year,
    month: sajuData.input.birth.month,
    day: sajuData.input.birth.day,
    hour: sajuData.input.hourKnown ? sajuData.input.birth.hour ?? undefined : undefined,
    minute: sajuData.input.hourKnown ? sajuData.input.birth.minute ?? undefined : undefined,
    unknownTime: !sajuData.input.hourKnown,
    jasiMethod: sajuData.input.jasiMethod ?? sajuData.extensions?.orrery?.input.jasiMethod ?? fallback.jasiMethod,
    gender: sajuData.input.gender ?? fallback.gender ?? undefined,
  };
}

export function isReadingId(value: string): boolean {
  return READING_ID_PATTERN.test(value);
}

function mapReadingRow(row: ReadingRow): ReadingRecord {
  const input: BirthInput = {
    year: row.birth_year,
    month: row.birth_month,
    day: row.birth_day,
    hour: row.birth_hour ?? undefined,
    gender: row.gender ?? undefined,
  };
  const sajuData = normalizeToSajuDataV1(input, row.result_json);

  return {
    id: row.id,
    userId: row.user_id,
    input: deriveBirthInputFromSajuData(input, sajuData),
    sajuData,
    // Keep the legacy shape available while screens migrate to SajuDataV1.
    result: deriveLegacySajuResult(sajuData),
  };
}

export async function createReading(
  input: BirthInput,
  userId: string | null
): Promise<string> {
  const supabase = await createServiceClient();
  const sajuData = calculateSajuDataV1(input);

  const { data, error } = await supabase
    .from('readings')
    .insert({
      user_id: userId,
      birth_year: input.year,
      birth_month: input.month,
      birth_day: input.day,
      birth_hour: input.hour ?? null,
      gender: input.gender ?? null,
      result_json: sajuData,
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? '사주 결과를 저장하지 못했습니다.');
  }

  return data.id;
}

export async function getReadingById(id: string): Promise<ReadingRecord | null> {
  if (!isReadingId(id)) return null;

  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from('readings')
    .select(
      'id, user_id, birth_year, birth_month, birth_day, birth_hour, gender, result_json'
    )
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;

  return mapReadingRow(data as ReadingRow);
}

export async function deleteReadingForUser(id: string, userId: string): Promise<boolean> {
  if (!isReadingId(id)) return false;

  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from('readings')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
    .select('id')
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function resolveReading(
  identifier: string
): Promise<ReadingRecord | null> {
  if (isReadingId(identifier)) {
    return getReadingById(identifier);
  }

  const input = fromSlug(identifier);
  if (!input) return null;

  const sajuData = calculateSajuDataV1(input);

  return {
    id: identifier,
    userId: null,
    input: deriveBirthInputFromSajuData(input, sajuData),
    sajuData,
    result: deriveLegacySajuResult(sajuData),
  };
}
