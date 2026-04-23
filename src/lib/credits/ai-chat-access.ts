import { getFeatureCost } from './deduct';
import type { AiGenerationSource } from '@/server/ai/openai-text';

export type AiChatBillingStatus =
  | 'charged'
  | 'not_charged_fallback'
  | 'not_charged_safe_redirect'
  | 'auth_required'
  | 'insufficient_credits';

export interface AiChatBillingSummary {
  feature: 'ai_chat';
  cost: number;
  status: AiChatBillingStatus;
  remaining: number | null;
}

export function getAvailableCreditsTotal(
  credits: { balance: number; subscription_balance: number } | null | undefined
) {
  return Math.max(0, (credits?.balance ?? 0) + (credits?.subscription_balance ?? 0));
}

export function shouldChargeAiChat(source: AiGenerationSource) {
  return source === 'openai';
}

export function createAiChatBillingSummary(
  status: AiChatBillingStatus,
  remaining: number | null
): AiChatBillingSummary {
  return {
    feature: 'ai_chat',
    cost: getFeatureCost('ai_chat'),
    status,
    remaining,
  };
}
