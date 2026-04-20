'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import {
  Bell,
  BookOpenText,
  CreditCard,
  LogOut,
  MessageCircleMore,
  MoonStar,
  Settings2,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { LayoutModeControl } from '@/features/layout-preference/layout-mode-control';
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

const NAV_META: Record<string, { glyph: string; accent: string; description: string }> = {
  홈: { glyph: '月', accent: 'var(--app-gold)', description: '오늘의 흐름' },
  해석: { glyph: '解', accent: 'var(--app-gold-text)', description: '사주·명리·궁합' },
  대화: { glyph: '對', accent: 'var(--app-jade)', description: '질문과 상담' },
  마이: { glyph: '我', accent: 'var(--app-copy-muted)', description: '기록과 결제' },
  사주: { glyph: '四', accent: 'var(--app-gold)', description: '네 기둥의 해석' },
  명리: { glyph: '命', accent: 'var(--app-gold-soft)', description: '반복되는 삶의 이유' },
  타로: { glyph: '塔', accent: 'var(--app-plum)', description: '지금 선택의 지혜' },
  궁합: { glyph: '宮', accent: 'var(--app-jade)', description: '두 사람의 결' },
  별자리: { glyph: '星', accent: 'var(--app-sky)', description: '별빛의 오늘' },
  띠운세: { glyph: '支', accent: 'var(--app-coral)', description: '한 해의 리듬' },
};

function matchesPath(item: NavItem, pathname: string) {
  if (item.href === '/') return pathname === '/';
  if (pathname === item.href || pathname.startsWith(`${item.href}/`)) return true;

  return (
    item.matchPrefixes?.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    ) ?? false
  );
}

function getNavMeta(item: NavItem) {
  return NAV_META[item.label] ?? {
    glyph: item.label.slice(0, 1),
    accent: 'var(--app-gold)',
    description: '달빛선생',
  };
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

function DesktopNavLink({
  item,
  pathname,
  compact = false,
}: {
  item: NavItem;
  pathname: string;
  compact?: boolean;
}) {
  const active = matchesPath(item, pathname);
  const meta = getNavMeta(item);

  return (
    <Link
      href={item.href}
      scroll={false}
      onClick={(event) => {
        if (active) event.preventDefault();
      }}
      data-active={active}
      className={cn(
        'app-nav-card flex items-center text-[var(--app-copy-muted)]',
        compact ? 'gap-2 px-2.5 py-1.5' : 'gap-2.5 px-3 py-2'
      )}
    >
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-xl border bg-[var(--app-surface-muted)] font-[var(--font-heading)] font-semibold',
          compact ? 'h-7 w-7 text-xs' : 'h-8 w-8 text-sm'
        )}
        style={{
          borderColor: active ? meta.accent : 'var(--app-line)',
          color: meta.accent,
        }}
      >
        {meta.glyph}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-[var(--app-ivory)]">
          {item.label}
        </span>
        {!compact ? (
          <span className="mt-0.5 block truncate text-[11px] text-[var(--app-copy-soft)]">
            {meta.description}
          </span>
        ) : null}
      </span>
      {active ? (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: meta.accent }}
        />
      ) : null}
    </Link>
  );
}

function DesktopNavChip({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = matchesPath(item, pathname);
  const meta = getNavMeta(item);

  return (
    <Link
      href={item.href}
      scroll={false}
      onClick={(event) => {
        if (active) event.preventDefault();
      }}
      data-active={active}
      className="app-nav-card flex min-h-10 items-center justify-center gap-1.5 px-2 py-2 text-xs font-medium text-[var(--app-copy-muted)]"
    >
      <span
        className="font-[var(--font-heading)] text-xs"
        style={{ color: meta.accent }}
      >
        {meta.glyph}
      </span>
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function DesktopSidebar({
  pathname,
  user,
  credits,
  authHref,
  onSignOut,
}: {
  pathname: string;
  user: User | null;
  credits: number | null;
  authHref: string;
  onSignOut: () => Promise<void>;
}) {
  const displayName = user?.email?.split('@')[0] ?? '방문자';

  return (
    <aside className="app-desktop-sidebar hidden flex-col overflow-hidden lg:flex">
      <div className="app-starfield" />

      <div className="relative z-10 border-b border-[var(--app-line)] px-6 py-5">
        <Link href="/" className="group block">
          <div className="font-[var(--font-heading)] text-[11px] tracking-[0.48em] text-[var(--app-gold)]/72">
            月 光 先 生
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="app-moon-orb h-10 w-10" />
            <div>
              <div className="font-[var(--font-heading)] text-2xl font-medium tracking-tight text-[var(--app-gold-text)] transition-colors group-hover:text-[var(--app-ivory)]">
                달빛선생
              </div>
              <div className="text-xs text-[var(--app-copy-soft)]">천 년의 지혜</div>
            </div>
          </div>
        </Link>
      </div>

      <div className="relative z-10 border-b border-[var(--app-line)] px-5 py-3">
        <div className="rounded-[1.2rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--app-gold)]/35 bg-[var(--app-gold)]/16 font-[var(--font-heading)] text-lg text-[var(--app-gold-text)]">
              {user ? '我' : '月'}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-[var(--app-ivory)]">
                {displayName} 선생님
              </div>
              <div className="mt-1 text-xs text-[var(--app-copy-soft)]">
                {user ? `${credits ?? '...'} 코인 보유` : '로그인하면 기록 저장'}
              </div>
            </div>
          </div>

          <div className="mt-3 grid gap-2">
            {user ? (
              <button
                type="button"
                onClick={onSignOut}
                className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-full border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-3 text-xs font-medium text-[var(--app-copy-muted)] transition-colors hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]"
              >
                <LogOut className="h-3.5 w-3.5" />
                로그아웃
              </button>
            ) : (
              <Link
                href={authHref}
                scroll={false}
                className="inline-flex h-9 w-full items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-strong)] px-3 text-xs font-medium text-[var(--app-ivory)] transition-colors hover:bg-[var(--app-surface)]"
              >
                로그인
              </Link>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/credits"
                scroll={false}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-3 text-xs text-[var(--app-copy)] transition-colors hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]"
              >
                <CreditCard className="h-3.5 w-3.5" />
                코인 충전
              </Link>
              <Link
                href="/membership"
                scroll={false}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-[var(--app-gold)]/25 bg-[var(--app-gold)]/12 px-3 text-xs font-semibold text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/18"
              >
                <Sparkles className="h-3.5 w-3.5" />
                프리미엄
              </Link>
            </div>
          </div>
        </div>
      </div>

      <nav className="relative z-10 flex-1 space-y-3 px-4 py-3">
        <div>
          <div className="app-caption px-2">주요 여정</div>
          <div className="mt-2 space-y-1.5">
            {PRIMARY_NAV_ITEMS.map((item) => (
              <DesktopNavLink key={item.label} item={item} pathname={pathname} />
            ))}
          </div>
        </div>

        <div>
          <div className="app-caption px-2">여섯 지혜</div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {HEADER_SECONDARY_NAV_ITEMS.map((item) => (
              <DesktopNavChip key={item.label} item={item} pathname={pathname} />
            ))}
          </div>
        </div>
      </nav>

      <div className="relative z-10 border-t border-[var(--app-line)] px-5 py-3">
        <div className="app-caption mb-2">보기 방식</div>
        <LayoutModeControl />
      </div>
    </aside>
  );
}

function MobileChrome({
  pathname,
  user,
  credits,
  authHref,
  onSignOut,
}: {
  pathname: string;
  user: User | null;
  credits: number | null;
  authHref: string;
  onSignOut: () => Promise<void>;
}) {
  return (
    <>
      <header className="app-top-header sticky top-0 z-40 border-b border-[var(--app-line)] bg-[rgba(8,10,18,0.9)] backdrop-blur lg:hidden">
        <div className="app-top-header-inner app-top-header-main px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="app-top-brand min-w-0">
              <div className="truncate font-[var(--font-heading)] text-[10px] tracking-[0.42em] text-[var(--app-gold)]/72">
                月 光 先 生
              </div>
              <div className="truncate text-xl font-semibold tracking-tight text-[var(--app-ivory)]">
                달빛선생
              </div>
            </Link>

            <nav className="app-top-primary-nav hidden flex-1 items-center justify-center gap-1 lg:flex">
              {PRIMARY_NAV_ITEMS.map((item) => {
                const active = matchesPath(item, pathname);

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    data-active={active}
                    className={cn(
                      'relative rounded-full px-4 py-2 text-sm transition-colors',
                      active
                        ? 'bg-[var(--app-gold)]/12 text-[var(--app-gold-text)]'
                        : 'text-[var(--app-copy-muted)] hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-ivory)]'
                    )}
                  >
                    {item.label}
                    {active ? (
                      <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--app-gold)]" />
                    ) : null}
                  </Link>
                );
              })}
            </nav>

            <div className="app-top-actions flex items-center gap-2">
              <Link href="/membership" className="app-top-action-link hidden lg:inline-flex">
                멤버십
              </Link>
              <Link href="/credits" className="app-top-action-link hidden lg:inline-flex">
                플랜
              </Link>
              <div className="hidden sm:block">
                <LayoutModeControl compact />
              </div>
              <Link
                href="/notifications"
                className="app-top-icon-link inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)] transition-colors hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]"
                aria-label="알림"
              >
                <Bell className="h-4 w-4" />
              </Link>
              <Link
                href="/my/settings"
                className="app-top-icon-link inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)] transition-colors hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]"
                aria-label="설정"
              >
                <Settings2 className="h-4 w-4" />
              </Link>
              {user ? (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="app-top-login hidden h-9 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-strong)] px-3 text-xs text-[var(--app-ivory)] sm:inline-flex"
                >
                  로그아웃
                </button>
              ) : (
                <Link
                  href={authHref}
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'sm' }),
                    'app-top-login border-[var(--app-line)] bg-[var(--app-surface-strong)] text-[var(--app-ivory)] hover:bg-[var(--app-surface)] hover:text-[var(--app-ivory)]'
                  )}
                >
                  로그인
                </Link>
              )}
            </div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            <LayoutModeControl compact className="shrink-0 sm:hidden" />
            <Link
              href="/credits"
              className="shrink-0 rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-3 py-1.5 text-sm text-[var(--app-copy)]"
            >
              {user ? `${credits ?? '...'} 코인` : '플랜'}
            </Link>
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

        <div className="app-top-header-shortcuts hidden border-t border-[var(--app-line)] bg-[var(--app-surface-muted)] lg:block">
          <div className="app-top-category-inner mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-8 py-3">
            <Link
              href="/credits"
              className="app-top-category-chip shrink-0 rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-3 py-1.5 text-sm text-[var(--app-copy)]"
            >
              {user ? `${credits ?? '...'} 코인` : '플랜'}
            </Link>
            {HEADER_SECONDARY_NAV_ITEMS.map((item) => {
              const active = matchesPath(item, pathname);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  data-active={active}
                  className={cn(
                    'app-top-category-chip shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors',
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

      <nav className="app-mobile-dock fixed inset-x-0 bottom-0 z-40 px-4 py-3 lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
          {MOBILE_PRIMARY_NAV_ITEMS.map((item) => {
            const active = matchesPath(item, pathname);

            return (
              <Link
                key={item.label}
                href={item.href}
                data-active={active}
                className="app-mobile-dock-link flex flex-col items-center px-2 py-2 text-center"
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
      <DesktopSidebar
        pathname={pathname}
        user={user}
        credits={credits}
        authHref={authHref}
        onSignOut={signOut}
      />
      <MobileChrome
        pathname={pathname}
        user={user}
        credits={credits}
        authHref={authHref}
        onSignOut={signOut}
      />
    </>
  );
}
