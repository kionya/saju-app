export const SITE_NAME = '사주명리';
export const DEFAULT_DESCRIPTION =
  '오늘의 운세부터 정통 사주 리포트, 타로, 궁합, 멤버십까지 앱처럼 이어지는 운세 플랫폼 사주명리입니다.';
export const DEFAULT_OG_IMAGE = '/og-image.png';

const FALLBACK_SITE_URL = 'https://saju-app-lac.vercel.app';

function normalizeSiteUrl(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/\/$/, '');
  }

  return `https://${trimmed.replace(/\/$/, '')}`;
}

export function getSiteUrl(): string {
  return (
    normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalizeSiteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    normalizeSiteUrl(process.env.VERCEL_URL) ??
    FALLBACK_SITE_URL
  );
}
