export interface NavItem {
  label: string;
  href: string;
  matchPrefixes?: readonly string[];
  tone?: 'service' | 'acquisition';
}

const SEO_MATCH_PREFIXES = [
  '/today-fortune',
  '/tarot/daily',
  '/zodiac',
  '/star-sign',
  '/dream-interpretation',
] as const;

export const PRIMARY_NAV_ITEMS: readonly NavItem[] = [
  { label: '홈', href: '/' },
  { label: '정통사주', href: '/saju/new', tone: 'service' },
  { label: '궁합', href: '/#compatibility-lab', tone: 'service' },
  { label: '코인 센터', href: '/credits', tone: 'service' },
  { label: '멤버십', href: '/membership', tone: 'service' },
] as const;

export const SECONDARY_NAV_ITEM: NavItem = {
  label: '무료운세',
  href: '/today-fortune',
  matchPrefixes: SEO_MATCH_PREFIXES,
  tone: 'acquisition',
};

export const MOBILE_QUICK_LINKS: readonly NavItem[] = [
  { label: '사주 시작', href: '/saju/new', tone: 'service' },
  { label: '궁합 Lite', href: '/#compatibility-lab', tone: 'service' },
  { label: '코인', href: '/credits', tone: 'service' },
  {
    label: '무료운세',
    href: '/today-fortune',
    matchPrefixes: SEO_MATCH_PREFIXES,
    tone: 'acquisition',
  },
] as const;
