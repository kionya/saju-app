import { NextResponse } from 'next/server';
import { getProfileLinkageVerificationAudit } from '@/server/verification/profile-linkage-audit';

export async function GET() {
  return NextResponse.json(getProfileLinkageVerificationAudit());
}
