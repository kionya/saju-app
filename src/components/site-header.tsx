'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import type { User } from '@supabase/supabase-js';

export default function SiteHeader() {
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
    location.href = '/';
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
      <a href="/" className="text-xl font-bold tracking-tight">✦ 사주명리</a>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <a href="/credits" className="text-sm text-indigo-300 hover:text-indigo-200">
              ✦ {credits ?? '…'} 크레딧
            </a>
            <Button
              onClick={signOut}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              로그아웃
            </Button>
          </>
        ) : (
          <a href={`/login?next=${encodeURIComponent(location.pathname)}`}>
            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
              로그인
            </Button>
          </a>
        )}
      </div>
    </header>
  );
}