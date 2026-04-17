'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  MOBILE_QUICK_LINKS,
  PRIMARY_NAV_ITEMS,
  SECONDARY_NAV_ITEM,
  type NavItem,
} from '@/shared/config/site-navigation';

function matchesPath(item: NavItem, pathname: string, currentHash: string) {
  if (item.href === '/') return pathname === '/';

  if (item.href.startsWith('/#')) {
    return pathname === '/' && currentHash === item.href.slice(1);
  }

  if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
    return true;
  }

  return (
    item.matchPrefixes?.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    ) ?? false
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [currentHash, setCurrentHash] = useState('');

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
          .then(({ data: creditRow }) => {
            if (creditRow) {
              setCredits((creditRow.balance ?? 0) + (creditRow.subscription_balance ?? 0));
            }
          });
      }
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncHash = () => setCurrentHash(window.location.hash);
    syncHash();
    window.addEventListener('hashchange', syncHash);

    return () => window.removeEventListener('hashchange', syncHash);
  }, [pathname]);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  }

  const authHref = `/login?next=${encodeURIComponent(pathname)}`;

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--app-line)] bg-[rgba(2,8,23,0.82)] backdrop-blur supports-[backdrop-filter]:bg-[rgba(2,8,23,0.68)]">
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 py-4">
          <div className="flex min-w-0 items-center gap-5">
            <Link
              href="/"
              className="min-w-0 text-[var(--app-ivory)] transition-opacity hover:opacity-90"
            >
              <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--app-gold-soft)]/85">
                Senior-friendly Myeongri
              </div>
              <div className="truncate text-lg font-semibold tracking-tight sm:text-xl">
                사주명리
              </div>
            </Link>

            <div className="hidden items-center gap-3 xl:flex">
              <nav className="flex items-center gap-1 rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-2 py-1">
                {PRIMARY_NAV_ITEMS.map((item) => {
                  const active = matchesPath(item, pathname, currentHash);

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={cn(
                        'rounded-full px-3 py-2 text-sm transition-colors',
                        active
                          ? 'bg-[var(--app-surface-strong)] text-[var(--app-ivory)]'
                          : 'text-[var(--app-copy-muted)] hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]'
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="flex items-center gap-2 rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-2 py-1">
                <span className="px-2 text-[11px] uppercase tracking-[0.2em] text-[var(--app-copy-soft)]">
                  Free
                </span>
                <Link
                  href={SECONDARY_NAV_ITEM.href}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-sm transition-colors',
                    matchesPath(SECONDARY_NAV_ITEM, pathname, currentHash)
                      ? 'bg-[var(--app-gold)]/15 text-[var(--app-gold-soft)]'
                      : 'text-[var(--app-copy-muted)] hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]'
                  )}
                >
                  {SECONDARY_NAV_ITEM.label}
                </Link>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={SECONDARY_NAV_ITEM.href}
              className="hidden rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-3 py-1.5 text-sm text-[var(--app-copy-muted)] transition-colors hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)] lg:inline-flex xl:hidden"
            >
              무료운세
            </Link>

            {user && (
              <Link
                href="/my"
                className="hidden rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-3 py-1.5 text-sm text-[var(--app-copy)] transition-colors hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)] md:inline-flex"
              >
                MY
              </Link>
            )}

            <Link
              href="/credits"
              className="hidden rounded-full border border-[var(--app-gold)]/25 bg-[var(--app-gold)]/10 px-3 py-1.5 text-sm font-medium text-[var(--app-gold-soft)] transition-colors hover:bg-[var(--app-gold)]/15 hover:text-[var(--app-ivory)] sm:inline-flex"
            >
              {user ? `${credits ?? '...'} 코인` : '코인 센터'}
            </Link>

            <Link
              href="/membership"
              className="hidden rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-3 py-1.5 text-sm text-[var(--app-copy)] transition-colors hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)] md:inline-flex"
            >
              멤버십
            </Link>

            {user ? (
              <>
                <Link
                  href="/my"
                  className="rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-3 py-1.5 text-sm text-[var(--app-copy)] transition-colors hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)] md:hidden"
                >
                  MY
                </Link>
                <Link
                  href="/credits"
                  className="rounded-full border border-[var(--app-gold)]/25 bg-[var(--app-gold)]/10 px-3 py-1.5 text-sm font-medium text-[var(--app-gold-soft)] transition-colors hover:bg-[var(--app-gold)]/15 hover:text-[var(--app-ivory)] sm:hidden"
                >
                  {credits ?? '...'} 코인
                </Link>
                <Button
                  onClick={signOut}
                  variant="outline"
                  size="sm"
                  className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy)] hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]"
                >
                  로그아웃
                </Button>
              </>
            ) : (
              <Link
                href={authHref}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                  'border-[var(--app-line)] bg-[var(--app-surface-strong)] text-[var(--app-ivory)] shadow-sm shadow-black/10 hover:bg-[var(--app-surface)] hover:text-[var(--app-ivory)]'
                )}
              >
                로그인
              </Link>
            )}
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 xl:hidden">
          {MOBILE_QUICK_LINKS.map((item) => {
            const active = matchesPath(item, pathname, currentHash);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors',
                  active
                    ? 'border-[var(--app-gold)]/40 bg-[var(--app-gold)]/12 text-[var(--app-gold-soft)]'
                    : item.tone === 'acquisition'
                      ? 'border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)] hover:border-[var(--app-line-strong)] hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]'
                      : 'border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy)] hover:border-[var(--app-line-strong)] hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
