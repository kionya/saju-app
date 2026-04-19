export const SITE_NAME = '달빛선생';
export const DEFAULT_DESCRIPTION =
  '문득 궁금하신 날, 당신을 위한 여섯 가지 지혜. 사주, 명리, 타로, 궁합, 별자리, 띠운세를 품격 있는 흐름으로 잇는 사주 웹앱 달빛선생입니다.';
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
