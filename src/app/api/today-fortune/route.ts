import { NextRequest, NextResponse } from 'next/server';
import { calculateSajuDataV1 } from '@/domain/saju/engine/saju-data-v1';
import { createClient } from '@/lib/supabase/server';
import { createReading } from '@/lib/saju/readings';
import { toSlug } from '@/lib/saju/pillars';
import { normalizeMoonlightCounselor } from '@/lib/counselors';
import { buildTodayFortuneFreeResult } from '@/server/today-fortune/build-today-fortune';
import type { TodayFortuneBirthPayload } from '@/lib/today-fortune/types';
import { resolveUnifiedBirthInput } from '@/lib/saju/unified-birth-entry';

export const runtime = 'nodejs';

function parseTodayPayload(payload: unknown): TodayFortuneBirthPayload | null {
  if (!payload || typeof payload !== 'object') return null;
  const data = payload as Record<string, unknown>;

  return {
    concernId:
      typeof data.concernId === 'string' ? (data.concernId as TodayFortuneBirthPayload['concernId']) : 'general',
    calendarType: data.calendarType === 'lunar' ? 'lunar' : 'solar',
    timeRule:
      data.timeRule === 'trueSolarTime' ||
      data.timeRule === 'nightZi' ||
      data.timeRule === 'earlyZi'
        ? (data.timeRule as TodayFortuneBirthPayload['timeRule'])
        : 'standard',
    year: typeof data.year === 'string' ? data.year : '',
    month: typeof data.month === 'string' ? data.month : '',
    day: typeof data.day === 'string' ? data.day : '',
    hour: typeof data.hour === 'string' ? data.hour : '',
    minute: typeof data.minute === 'string' ? data.minute : '',
    unknownBirthTime: data.unknownBirthTime === true,
    gender: typeof data.gender === 'string' ? data.gender : '',
    birthLocationCode: typeof data.birthLocationCode === 'string' ? data.birthLocationCode : '',
    birthLocationLabel: typeof data.birthLocationLabel === 'string' ? data.birthLocationLabel : '',
    birthLatitude: typeof data.birthLatitude === 'string' ? data.birthLatitude : '',
    birthLongitude: typeof data.birthLongitude === 'string' ? data.birthLongitude : '',
  };
}

export async function POST(req: NextRequest) {
  const rawPayload = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const payload = parseTodayPayload(rawPayload);

  if (!payload) {
    return NextResponse.json({ error: '오늘 운세 요청 정보가 올바르지 않습니다.' }, { status: 400 });
  }

  const parsed = resolveUnifiedBirthInput(payload, {
    requireGender: false,
  });

  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const sajuData = calculateSajuDataV1(parsed.input);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const counselorId = normalizeMoonlightCounselor(rawPayload?.counselorId);

  let sourceSessionId = toSlug(parsed.input);

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    try {
      sourceSessionId = await createReading(parsed.input, user?.id ?? null);
    } catch {
      sourceSessionId = toSlug(parsed.input);
    }
  }

  const result = buildTodayFortuneFreeResult(parsed.input, sajuData, {
    concernId: payload.concernId,
    sourceSessionId,
    calendarType: payload.calendarType,
    timeRule: payload.timeRule,
    counselorId,
  });

  return NextResponse.json({
    ok: true,
    result,
  });
}
