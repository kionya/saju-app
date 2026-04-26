'use client';

import {
  MOONLIGHT_ANALYTICS_EVENTS,
  type MoonlightAnalyticsEvent,
} from '@/lib/analytics-events';

export { MOONLIGHT_ANALYTICS_EVENTS };

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function trackMoonlightEvent(
  event: MoonlightAnalyticsEvent,
  params: Record<string, unknown> = {}
) {
  if (typeof window === 'undefined') return;

  const payload = {
    event,
    ...params,
  };

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);
  window.dispatchEvent(
    new CustomEvent('moonlight:analytics', {
      detail: payload,
    })
  );
}
