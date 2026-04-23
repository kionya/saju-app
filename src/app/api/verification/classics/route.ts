import { NextRequest, NextResponse } from 'next/server';
import {
  DEFAULT_CLASSICS_AUDIT_CONCEPT,
  getClassicsVerificationAudit,
} from '@/server/verification/classics-audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const concept = url.searchParams.get('concept') ?? DEFAULT_CLASSICS_AUDIT_CONCEPT;
  const limit = Number(url.searchParams.get('limit') ?? 5);
  const audit = await getClassicsVerificationAudit({ concept, limit });

  return NextResponse.json(audit, {
    status: audit.status === 'db-error' ? 503 : 200,
  });
}
