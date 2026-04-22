import { NextRequest, NextResponse } from 'next/server';
import {
  DEFAULT_CLASSIC_EVIDENCE_LIMIT,
  getClassicEvidence,
  normalizeClassicEvidenceQuery,
} from '@/server/classics/evidence';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const concept = normalizeClassicEvidenceQuery(url.searchParams.get('concept') ?? '');

  if (!concept) {
    return NextResponse.json(
      { error: 'concept query parameter is required' },
      { status: 400 }
    );
  }

  const requestedLimit = Number(url.searchParams.get('limit') ?? DEFAULT_CLASSIC_EVIDENCE_LIMIT);
  const result = await getClassicEvidence({
    concept,
    limit: requestedLimit,
  });

  return NextResponse.json(result, {
    status: result.status === 'db-error' ? 503 : 200,
  });
}
