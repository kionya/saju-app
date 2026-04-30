import { NextResponse } from 'next/server';
import { getProfileLinkageVerificationAudit } from '@/server/verification/profile-linkage-audit';
import { requireVerificationApiAccess } from '@/lib/verification-access';

export async function GET() {
  const deniedResponse = await requireVerificationApiAccess();
  if (deniedResponse) return deniedResponse;

  return NextResponse.json(getProfileLinkageVerificationAudit());
}
