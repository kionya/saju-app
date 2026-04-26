import { NextRequest, NextResponse } from 'next/server';
import { normalizeMoonlightCounselor } from '@/lib/counselors';
import { normalizeConcernId } from '@/lib/today-fortune/concerns';
import { getTodayFortuneVerificationAudit } from '@/server/verification/today-fortune-audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const slug = searchParams.get('slug')?.trim() || undefined;
  const concernId = normalizeConcernId(searchParams.get('concern'));
  const counselorId = normalizeMoonlightCounselor(searchParams.get('counselor')) ?? undefined;

  const audit = await getTodayFortuneVerificationAudit({
    slug,
    concernId,
    counselorId,
  });

  const statusCode =
    audit.status === 'ready' ? 200 : audit.status === 'not-found' ? 404 : 500;

  return NextResponse.json(audit, { status: statusCode });
}
