import type { CompatibilityRelationshipSlug } from '@/content/moonlight';
import type { BirthInput } from '@/lib/saju/types';

export const MANUAL_COMPATIBILITY_SESSION_KEY = 'moonlight:compatibility-manual-v1';

export interface ManualCompatibilityPayload {
  version: 1;
  relationship: CompatibilityRelationshipSlug;
  selfName: string;
  partnerName: string;
  selfBirthInput: BirthInput;
  partnerBirthInput: BirthInput;
  selfBirthSummary: string;
  partnerBirthSummary: string;
  createdAt: string;
}

function isBirthInput(value: unknown): value is BirthInput {
  if (!value || typeof value !== 'object') return false;

  const data = value as Record<string, unknown>;
  return (
    Number.isInteger(data.year) &&
    Number.isInteger(data.month) &&
    Number.isInteger(data.day) &&
    (data.hour === undefined || Number.isInteger(data.hour)) &&
    (data.minute === undefined || Number.isInteger(data.minute))
  );
}

export function isManualCompatibilityPayload(value: unknown): value is ManualCompatibilityPayload {
  if (!value || typeof value !== 'object') return false;

  const data = value as Record<string, unknown>;
  return (
    data.version === 1 &&
    (data.relationship === 'lover' ||
      data.relationship === 'family' ||
      data.relationship === 'friend' ||
      data.relationship === 'partner') &&
    typeof data.selfName === 'string' &&
    typeof data.partnerName === 'string' &&
    typeof data.selfBirthSummary === 'string' &&
    typeof data.partnerBirthSummary === 'string' &&
    typeof data.createdAt === 'string' &&
    isBirthInput(data.selfBirthInput) &&
    isBirthInput(data.partnerBirthInput)
  );
}
