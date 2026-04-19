import { NextRequest, NextResponse } from 'next/server';
import { detectSafeRedirect } from '@/domain/safety/safe-redirect';

function readMessage(payload: unknown) {
  if (!payload || typeof payload !== 'object' || !('message' in payload)) {
    return null;
  }

  const message = (payload as { message: unknown }).message;
  return typeof message === 'string' ? message : null;
}

export async function POST(req: NextRequest) {
  const message = readMessage(await req.json().catch(() => null));

  if (!message?.trim()) {
    return NextResponse.json(
      { error: '확인할 문장을 입력해 주세요.' },
      { status: 400 }
    );
  }

  const detection = detectSafeRedirect(message);

  return NextResponse.json({
    ...detection,
    blocked: detection.shouldBlockResponse,
  });
}
