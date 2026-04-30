import { NextResponse } from 'next/server';
import { createClient, hasSupabaseServerEnv } from '@/lib/supabase/server';

type VerificationAccessStatus = 'allowed' | 'unauthenticated' | 'forbidden';

function getAllowedVerificationEmails() {
  const raw = process.env.INTERNAL_VERIFICATION_EMAILS ?? '';

  return raw
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

function isAllowedVerificationEmail(email: string | null | undefined) {
  const allowlist = getAllowedVerificationEmails();

  if (allowlist.length === 0) {
    return true;
  }

  return email ? allowlist.includes(email.toLowerCase()) : false;
}

export async function getVerificationAccessStatus(): Promise<{
  status: VerificationAccessStatus;
  email: string | null;
}> {
  if (!hasSupabaseServerEnv) {
    return {
      status: 'allowed',
      email: null,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: 'unauthenticated',
      email: null,
    };
  }

  if (!isAllowedVerificationEmail(user.email)) {
    return {
      status: 'forbidden',
      email: user.email ?? null,
    };
  }

  return {
    status: 'allowed',
    email: user.email ?? null,
  };
}

export async function requireVerificationApiAccess() {
  const access = await getVerificationAccessStatus();

  if (access.status === 'allowed') {
    return null;
  }

  if (access.status === 'unauthenticated') {
    return NextResponse.json(
      {
        error: '로그인 후 내부 검증 데이터를 확인해 주세요.',
      },
      { status: 401 }
    );
  }

  return NextResponse.json(
    {
      error: '이 검증 데이터는 내부 계정으로만 확인할 수 있습니다.',
    },
    { status: 404 }
  );
}
