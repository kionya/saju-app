'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button, buttonVariants } from '@/components/ui/button';
import type { User } from '@supabase/supabase-js';
import { cn } from '@/lib/utils';

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        supabase
          .from('user_credits')
          .select('balance, subscription_balance')
          .eq('user_id', data.user.id)
          .single()
          .then(({ data: c }) => {
            if (c) setCredits((c.balance ?? 0) + (c.subscription_balance ?? 0));
          });
      }
    });
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  }

  const authHref = `/login?next=${encodeURIComponent(pathname)}`;

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-slate-950/70 sm:px-6">
      <Link
        href="/"
        className="text-lg font-bold tracking-tight text-white transition-opacity hover:opacity-90 sm:text-xl"
      >
        ✦ 사주명리
      </Link>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link
              href="/credits"
              className="rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1.5 text-sm font-medium text-indigo-200 transition-colors hover:bg-indigo-400/15 hover:text-white"
            >
              ✦ {credits ?? '…'} 크레딧
            </Link>
            <Button
              onClick={signOut}
              variant="outline"
              size="sm"
              className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              로그아웃
            </Button>
          </>
        ) : (
          <Link
            href={authHref}
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'border-white/15 bg-white/10 text-white shadow-sm shadow-black/10 hover:bg-white/15 hover:text-white'
            )}
          >
            로그인
          </Link>
        )}
      </div>
    </header>
  );
}
