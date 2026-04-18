'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const ACCOUNT_NAV_ITEMS = [
  { label: 'MY 홈', href: '/my' },
  { label: '가족 사주', href: '/my/profile' },
  { label: '결과보관함', href: '/my/results' },
  { label: '결제 관리', href: '/my/billing' },
  { label: '설정', href: '/my/settings' },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AccountShellNav() {
  const pathname = usePathname();

  return (
    <nav className="app-subnav">
      {ACCOUNT_NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          data-active={isActive(pathname, item.href)}
          className={cn('app-subnav-link')}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
