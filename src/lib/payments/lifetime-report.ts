export const PENDING_LIFETIME_REPORT_SLUG_KEY = 'moonlight:pending-lifetime-report-slug';

export function savePendingLifetimeReportSlug(slug: string) {
  try {
    window.localStorage.setItem(PENDING_LIFETIME_REPORT_SLUG_KEY, slug);
  } catch {
    // URL query params still carry the slug; localStorage is only a recovery path.
  }
}

export function readPendingLifetimeReportSlug() {
  try {
    return window.localStorage.getItem(PENDING_LIFETIME_REPORT_SLUG_KEY);
  } catch {
    return null;
  }
}

export function clearPendingLifetimeReportSlug() {
  try {
    window.localStorage.removeItem(PENDING_LIFETIME_REPORT_SLUG_KEY);
  } catch {
    // Nothing to clear when browser storage is unavailable.
  }
}
