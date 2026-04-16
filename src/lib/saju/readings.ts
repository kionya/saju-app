import { createServiceClient } from '@/lib/supabase/server';
import { calculateSaju, fromSlug } from './pillars';
import type { BirthInput, SajuResult } from './types';

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
  result_json: SajuResult;
}

export interface ReadingRecord {
  id: string;
  userId: string | null;
  input: BirthInput;
  result: SajuResult;
}

export function isReadingId(value: string): boolean {
  return READING_ID_PATTERN.test(value);
}

function mapReadingRow(row: ReadingRow): ReadingRecord {
  return {
    id: row.id,
    userId: row.user_id,
    input: {
      year: row.birth_year,
      month: row.birth_month,
      day: row.birth_day,
      hour: row.birth_hour ?? undefined,
      gender: row.gender ?? undefined,
    },
    result: row.result_json,
  };
}

export async function createReading(
  input: BirthInput,
  userId: string | null
): Promise<string> {
  const supabase = await createServiceClient();
  const result = calculateSaju(input);

  const { data, error } = await supabase
    .from('readings')
    .insert({
      user_id: userId,
      birth_year: input.year,
      birth_month: input.month,
      birth_day: input.day,
      birth_hour: input.hour ?? null,
      gender: input.gender ?? null,
      result_json: result,
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

export async function resolveReading(
  identifier: string
): Promise<ReadingRecord | null> {
  if (isReadingId(identifier)) {
    return getReadingById(identifier);
  }

  const input = fromSlug(identifier);
  if (!input) return null;

  return {
    id: identifier,
    userId: null,
    input,
    result: calculateSaju(input),
  };
}
