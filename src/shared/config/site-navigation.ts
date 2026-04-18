import {
  HEADER_SHORTCUTS,
  PRIMARY_TABS,
  type MoonlightNavItem,
} from '@/content/moonlight';

export type NavItem = MoonlightNavItem;

export const PRIMARY_NAV_ITEMS: readonly NavItem[] = PRIMARY_TABS;

export const MOBILE_PRIMARY_NAV_ITEMS: readonly NavItem[] = PRIMARY_TABS;

export const MOBILE_QUICK_LINKS: readonly NavItem[] = HEADER_SHORTCUTS;

export const HEADER_SECONDARY_NAV_ITEMS: readonly NavItem[] = HEADER_SHORTCUTS;
