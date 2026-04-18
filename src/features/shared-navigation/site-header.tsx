'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import {
  Bell,
  BookOpenText,
  MessageCircleMore,
  MoonStar,
  Settings2,
  UserRound,
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import {
  HEADER_SECONDARY_NAV_ITEMS,
  MOBILE_PRIMARY_NAV_ITEMS,
  PRIMARY_NAV_ITEMS,
  type NavItem,
} from '@/shared/config/site-navigation';

const hasSupabaseBrowserEnv = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const NOTIFICATION_HEARTBEAT_KEY = 'moonlight:notification-heartbeat-sent-at';

function matchesPath(item: NavItem, pathname: string) {
  if (item.href === '/') return pathname === '/';
  if (pathname === item.href || pathname.startsWith(`${item.href}/`)) return true;

  return (
    item.matchPrefixes?.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    ) ?? false
  );
}

function DockIcon({ label }: { label: string }) {
  switch (label) {
    case '홈':
      return <MoonStar className="h-4 w-4" />;
    case '해석':
      return <BookOpenText className="h-4 w-4" />;
    case '대화':
      return <MessageCircleMore className="h-4 w-4" />;
    case '마이':
      return <UserRound className="h-4 w-4" />;
    default:
      return <MoonStar className="h-4 w-4" />;
  }
}

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    if (!hasSupabaseBrowserEnv) return;

    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);

      if (data.user) {
        try {
          const previous = window.localStorage.getItem(NOTIFICATION_HEARTBEAT_KEY);
          const shouldSendHeartbeat =
            !previous ||
            Date.now() - new Date(previous).getTime() > 6 * 60 * 60 * 1000;

          if (shouldSendHeartbeat) {
            void fetch('/api/notifications/heartbeat', {
              method: 'POST',
            })
              .then(() => {
                window.localStorage.setItem(
                  NOTIFICATION_HEARTBEAT_KEY,
                  new Date().toISOString()
                );
              })
              .catch(() => undefined);
          }
        } catch {}

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

  async function signOut() {
    if (!hasSupabaseBrowserEnv) {
      router.push('/');
      return;
    }

    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  }

  const authHref = `/login?next=${encodeURIComponent(pathname)}`;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--app-line)] bg-[rgba(8,10,18,0.88)] backdrop-blur supports-[backdrop-filter]:bg-[rgba(8,10,18,0.72)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-4">
            <div className="flex min-w-0 items-center gap-4">
              <Link href="/" className="min-w-0 transition-opacity hover:opacity-90">
                <div className="truncate font-[var(--font-heading)] text-[11px] tracking-[0.4em] text-[var(--app-gold)]/72">
                  月 光 先 生
                </div>
                <div className="truncate text-xl font-semibold tracking-tight text-[var(--app-ivory)] sm:text-2xl">
                  달빛선생
                </div>
              </Link>

              <nav className="hidden items-center gap-2 rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-1 lg:flex">
                {PRIMARY_NAV_ITEMS.map((item) => {
                  const active = matchesPath(item, pathname);

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={cn(
                        'rounded-full px-4 py-2 text-sm transition-colors',
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
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/notifications"
                className="hidden h-9 w-9 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)] transition-colors hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)] md:inline-flex"
                aria-label="알림"
              >
                <Bell className="h-4 w-4" />
              </Link>
              <Link
                href="/my/settings"
                className="hidden h-9 w-9 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)] transition-colors hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)] md:inline-flex"
                aria-label="설정"
              >
                <Settings2 className="h-4 w-4" />
              </Link>

              <Link
                href="/membership"
                className="hidden rounded-full border border-[var(--app-gold)]/28 bg-[var(--app-gold)]/10 px-3 py-1.5 text-sm text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/16 md:inline-flex"
              >
                멤버십
              </Link>

              <Link
                href="/credits"
                className="hidden rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-3 py-1.5 text-sm text-[var(--app-copy)] transition-colors hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)] sm:inline-flex"
              >
                {user ? `${credits ?? '...'} 코인` : '플랜'}
              </Link>

              {user ? (
                <Button
                  onClick={signOut}
                  variant="outline"
                  size="sm"
                  className="border-[var(--app-line)] bg-[var(--app-surface-strong)] text-[var(--app-ivory)] hover:bg-[var(--app-surface)] hover:text-[var(--app-ivory)]"
                >
                  로그아웃
                </Button>
              ) : (
                <Link
                  href={authHref}
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'sm' }),
                    'border-[var(--app-line)] bg-[var(--app-surface-strong)] text-[var(--app-ivory)] hover:bg-[var(--app-surface)] hover:text-[var(--app-ivory)]'
                  )}
                >
                  로그인
                </Link>
              )}
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-4 lg:pb-5">
            {HEADER_SECONDARY_NAV_ITEMS.map((item) => {
              const active = matchesPath(item, pathname);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors',
                    active
                      ? 'border-[var(--app-gold)]/40 bg-[var(--app-gold)]/12 text-[var(--app-gold-text)]'
                      : 'border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)] hover:border-[var(--app-line-strong)] hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--app-line)] bg-[rgba(8,10,18,0.94)] px-4 py-3 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
          {MOBILE_PRIMARY_NAV_ITEMS.map((item) => {
            const active = matchesPath(item, pathname);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'flex flex-col items-center rounded-[1.15rem] border px-2 py-2 text-center transition-colors',
                  active
                    ? 'border-[var(--app-gold)]/40 bg-[var(--app-gold)]/12 text-[var(--app-gold-text)]'
                    : 'border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]'
                )}
              >
                <DockIcon label={item.label} />
                <span className="mt-1 text-[11px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
