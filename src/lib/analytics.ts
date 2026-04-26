'use client';

export type MoonlightAnalyticsEvent =
  | 'home_view'
  | 'today_concern_selected'
  | 'birth_form_started'
  | 'birth_form_completed'
  | 'today_free_result_viewed'
  | 'premium_teaser_viewed'
  | 'unlock_clicked'
  | 'payment_started'
  | 'payment_completed'
  | 'premium_result_viewed'
  | 'followup_question_clicked'
  | 'dialogue_started_from_result'
  | 'feedback_submitted'
  | 'hit_memo_response_correct'
  | 'hit_memo_response_partial'
  | 'hit_memo_response_miss';

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
