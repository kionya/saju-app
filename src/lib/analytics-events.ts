export const MOONLIGHT_ANALYTICS_EVENTS = [
  'home_view',
  'today_concern_selected',
  'birth_form_started',
  'birth_form_completed',
  'today_free_result_viewed',
  'premium_teaser_viewed',
  'unlock_clicked',
  'payment_started',
  'payment_completed',
  'premium_result_viewed',
  'followup_question_clicked',
  'dialogue_started_from_result',
  'feedback_submitted',
  'hit_memo_response_correct',
  'hit_memo_response_partial',
  'hit_memo_response_miss',
] as const;

export type MoonlightAnalyticsEvent = (typeof MOONLIGHT_ANALYTICS_EVENTS)[number];
