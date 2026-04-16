export const SITE_NAME = '사주명리';
export const DEFAULT_DESCRIPTION =
  '생년월일시를 바탕으로 사주팔자와 오행 분석을 확인하고, 상세 해석과 상담 기능까지 이용할 수 있는 사주 웹앱입니다.';
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
