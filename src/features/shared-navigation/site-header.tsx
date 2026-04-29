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
const HEADER_CREDIT_CACHE_KEY = 'moonlight:header-credit-cache-v1';
const HEADER_CREDIT_REFRESH_MS = 45 * 1000;

interface HeaderCreditSnapshot {
  userId: string;
  credits: number;
  fetchedAt: number;
}

let cachedHeaderUser: User | null | undefined;
let cachedHeaderCredits: HeaderCreditSnapshot | null = null;
let creditRefreshPromise: Promise<HeaderCreditSnapshot | null> | null = null;
let creditRefreshUserId: string | null = null;
let creditCacheVersion = 0;

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

function findActiveItem(items: readonly NavItem[], pathname: string) {
  return items.find((item) => matchesPath(item, pathname)) ?? null;
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

function creditLabel(user: User | null, credits: number | null) {
  return user ? `${credits ?? '...'} 코인` : '코인';
}

function readStoredCreditSnapshot(userId: string) {
  try {
    const raw = window.sessionStorage.getItem(HEADER_CREDIT_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<HeaderCreditSnapshot>;
    if (
      parsed.userId !== userId ||
      typeof parsed.credits !== 'number' ||
      typeof parsed.fetchedAt !== 'number'
    ) {
      return null;
    }

    cachedHeaderCredits = {
      userId,
      credits: parsed.credits,
      fetchedAt: parsed.fetchedAt,
    };
    return cachedHeaderCredits;
  } catch {
    return null;
  }
}

function getCachedCreditSnapshot(userId: string) {
  if (cachedHeaderCredits?.userId === userId) return cachedHeaderCredits;
  return readStoredCreditSnapshot(userId);
}

function saveCreditSnapshot(snapshot: HeaderCreditSnapshot) {
  cachedHeaderCredits = snapshot;

  try {
    window.sessionStorage.setItem(HEADER_CREDIT_CACHE_KEY, JSON.stringify(snapshot));
  } catch {}
}

function clearCreditSnapshot() {
  cachedHeaderCredits = null;
  creditCacheVersion += 1;

  try {
    window.sessionStorage.removeItem(HEADER_CREDIT_CACHE_KEY);
  } catch {}
}

function shouldRefreshCreditSnapshot(snapshot: HeaderCreditSnapshot | null) {
  return !snapshot || Date.now() - snapshot.fetchedAt > HEADER_CREDIT_REFRESH_MS;
}

function refreshCreditSnapshot(userId: string, loadCredits: () => Promise<number>) {
  if (creditRefreshPromise && creditRefreshUserId === userId) return creditRefreshPromise;

  const refreshVersion = creditCacheVersion;

  creditRefreshUserId = userId;
  creditRefreshPromise = loadCredits()
    .then((credits) => {
      if (creditCacheVersion !== refreshVersion || cachedHeaderUser?.id !== userId) {
        return null;
      }

      const snapshot = { userId, credits, fetchedAt: Date.now() };
      saveCreditSnapshot(snapshot);
      return snapshot;
    })
    .catch(() => null)
    .finally(() => {
      if (creditRefreshUserId === userId) {
        creditRefreshPromise = null;
        creditRefreshUserId = null;
      }
    });

  return creditRefreshPromise;
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
  const activePrimaryItem = findActiveItem(PRIMARY_NAV_ITEMS, pathname);
  const activeShortcutItem = findActiveItem(HEADER_SECONDARY_NAV_ITEMS, pathname);
  const activePrimaryMeta = activePrimaryItem ? getNavMeta(activePrimaryItem) : null;
  const activeShortcutMeta = activeShortcutItem ? getNavMeta(activeShortcutItem) : null;
  const contextDescription =
    activeShortcutMeta?.description ??
    activePrimaryMeta?.description ??
    '프리미엄 명리 기준서';

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
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {activePrimaryItem ? (
                  <span className="app-top-context-chip">
                    <span
                      className="font-[var(--font-heading)]"
                      style={{ color: activePrimaryMeta?.accent ?? 'var(--app-gold)' }}
                    >
                      {activePrimaryMeta?.glyph}
                    </span>
                    <span>{activePrimaryItem.label}</span>
                  </span>
                ) : null}
                {activeShortcutItem && activeShortcutItem.label !== activePrimaryItem?.label ? (
                  <span className="app-top-context-chip app-top-context-chip-muted">
                    <span
                      className="font-[var(--font-heading)]"
                      style={{ color: activeShortcutMeta?.accent ?? 'var(--app-copy-muted)' }}
                    >
                      {activeShortcutMeta?.glyph}
                    </span>
                    <span>{activeShortcutItem.label}</span>
                  </span>
                ) : null}
              </div>
              <div className="mt-1 truncate text-[11px] text-[var(--app-copy-soft)]">
                {contextDescription}
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
              <Link href="/credits" className="app-top-credit-chip">
                <CreditCard className="h-3.5 w-3.5" />
                {creditLabel(user, credits)}
              </Link>
            </nav>

            <div className="app-top-actions flex items-center gap-2">
              <Link href="/membership" className="app-top-action-link hidden lg:inline-flex">
                멤버십
              </Link>
              <div className="hidden sm:block">
                <LayoutModeControl compact />
              </div>
              <Link
                href="/credits"
                className="app-top-credit-chip inline-flex lg:hidden"
                aria-label={`보유 코인 ${creditLabel(user, credits)}`}
              >
                <CreditCard className="h-3.5 w-3.5" />
                {creditLabel(user, credits)}
              </Link>
              <div className="app-top-utility-cluster">
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
                    className="app-top-login inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-strong)] text-[var(--app-ivory)] transition-colors hover:bg-[var(--app-surface)] sm:w-auto sm:gap-1.5 sm:px-3 sm:text-xs"
                    aria-label="로그아웃"
                  >
                    <LogOut className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                    <span className="hidden sm:inline">로그아웃</span>
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
          </div>

          <div className="mt-4 lg:hidden">
            <div className="app-top-service-label">빠른 이동</div>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {HEADER_SECONDARY_NAV_ITEMS.map((item) => {
                const active = matchesPath(item, pathname);
                const meta = getNavMeta(item);

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      'app-top-service-chip shrink-0 rounded-full border px-3 py-2 text-sm transition-colors',
                      active
                        ? 'border-[var(--app-gold)]/40 bg-[var(--app-gold)]/12 text-[var(--app-gold-text)]'
                        : 'border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)] hover:border-[var(--app-line-strong)] hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]'
                    )}
                  >
                    <span
                      className="app-top-service-glyph font-[var(--font-heading)]"
                      style={{ color: meta.accent }}
                    >
                      {meta.glyph}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="app-top-header-shortcuts hidden border-t border-[var(--app-line)] bg-[var(--app-surface-muted)] lg:block">
          <div className="app-top-category-inner mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-8 py-3">
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

      <nav className="app-mobile-dock fixed inset-x-0 bottom-0 z-40 px-4 py-3 lg:hidden" aria-label="주 메뉴">
        <div className="app-mobile-dock-inner mx-auto grid max-w-md grid-cols-4">
          {MOBILE_PRIMARY_NAV_ITEMS.map((item) => {
            const active = matchesPath(item, pathname);

            return (
              <Link
                key={item.label}
                href={item.href}
                data-active={active}
                aria-current={active ? 'page' : undefined}
                className="app-mobile-dock-link flex flex-col items-center justify-center px-2 py-2 text-center"
              >
                <span className="app-mobile-dock-icon">
                  <DockIcon label={item.label} />
                </span>
                <span className="app-mobile-dock-label mt-1 text-[11px] font-medium">{item.label}</span>
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
  const [user, setUser] = useState<User | null>(cachedHeaderUser ?? null);
  const [credits, setCredits] = useState<number | null>(cachedHeaderCredits?.credits ?? null);

  useEffect(() => {
    if (!hasSupabaseBrowserEnv) return;

    let isActive = true;
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      if (!isActive) return;

      cachedHeaderUser = data.user;
      setUser(data.user);

      if (data.user) {
        const cachedCredits = getCachedCreditSnapshot(data.user.id);
        if (cachedCredits) {
          setCredits(cachedCredits.credits);
        }

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

        if (!shouldRefreshCreditSnapshot(cachedCredits)) return;

        void refreshCreditSnapshot(data.user.id, async () => {
          const { data: creditRow } = await supabase
            .from('user_credits')
            .select('balance, subscription_balance')
            .eq('user_id', data.user.id)
            .maybeSingle();

          return (creditRow?.balance ?? 0) + (creditRow?.subscription_balance ?? 0);
        }).then((snapshot) => {
          if (isActive && snapshot?.userId === data.user?.id) {
            setCredits(snapshot.credits);
          }
        });
      } else {
        clearCreditSnapshot();
        setCredits(null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isActive) return;

      cachedHeaderUser = session?.user ?? null;
      setUser(session?.user ?? null);

      if (!session?.user) {
        clearCreditSnapshot();
        setCredits(null);
        return;
      }

      const cachedCredits = getCachedCreditSnapshot(session.user.id);
      if (cachedCredits) {
        setCredits(cachedCredits.credits);
      }

      if (!shouldRefreshCreditSnapshot(cachedCredits)) return;

      void refreshCreditSnapshot(session.user.id, async () => {
        const { data: creditRow } = await supabase
          .from('user_credits')
          .select('balance, subscription_balance')
          .eq('user_id', session.user.id)
          .maybeSingle();

        return (creditRow?.balance ?? 0) + (creditRow?.subscription_balance ?? 0);
      }).then((snapshot) => {
        if (isActive && snapshot?.userId === session.user.id) {
          setCredits(snapshot.credits);
        }
      });
    });

    const syncCreditsFromEvent = (event: Event) => {
      if (!isActive || !cachedHeaderUser) return;

      const detail = (event as CustomEvent<{ credits?: number; remaining?: number }>).detail;
      const nextCredits =
        typeof detail?.credits === 'number'
          ? detail.credits
          : typeof detail?.remaining === 'number'
            ? detail.remaining
            : null;

      if (nextCredits === null) return;

      saveCreditSnapshot({
        userId: cachedHeaderUser.id,
        credits: nextCredits,
        fetchedAt: Date.now(),
      });
      setCredits(nextCredits);
    };

    window.addEventListener('moonlight:credits-updated', syncCreditsFromEvent);

    return () => {
      isActive = false;
      subscription.unsubscribe();
      window.removeEventListener('moonlight:credits-updated', syncCreditsFromEvent);
    };
  }, []);

  async function signOut() {
    if (!hasSupabaseBrowserEnv) {
      router.push('/');
      return;
    }

    const supabase = createClient();
    await supabase.auth.signOut();
    cachedHeaderUser = null;
    clearCreditSnapshot();
    setUser(null);
    setCredits(null);
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
