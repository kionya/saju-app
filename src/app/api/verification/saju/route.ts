import { NextRequest, NextResponse } from 'next/server';
import { getSajuVerificationAudit } from '@/server/verification/saju-audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const slug = url.searchParams.get('slug') ?? undefined;
  const topic = url.searchParams.get('topic') ?? undefined;
  const audit = await getSajuVerificationAudit({ slug, topic });

  return NextResponse.json(audit, {
    status: audit.status === 'not-found' ? 404 : audit.status === 'error' ? 500 : 200,
  });
}
