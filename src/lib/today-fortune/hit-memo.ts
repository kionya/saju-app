import type { ConcernId } from '@/lib/today-fortune/types';
import type { FortuneFeedbackAccuracyLabel } from '@/lib/fortune-feedback';

export interface StoredHitMemoSession {
  sourceSessionId: string;
  concernId: ConcernId;
  headline: string;
  createdAt: string;
  respondedAt?: string;
  accuracyLabel?: FortuneFeedbackAccuracyLabel;
}

const HIT_MEMO_STORAGE_KEY = 'moonlight:fortune-hit-memo:sessions';
const HIT_MEMO_THRESHOLD_MS = 24 * 60 * 60 * 1000;

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function readStoredHitMemoSessions() {
  if (!canUseStorage()) return [] as StoredHitMemoSession[];

  try {
    const raw = window.localStorage.getItem(HIT_MEMO_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is StoredHitMemoSession =>
            Boolean(
              item &&
                typeof item === 'object' &&
                typeof item.sourceSessionId === 'string' &&
                typeof item.concernId === 'string' &&
                typeof item.headline === 'string' &&
                typeof item.createdAt === 'string'
            )
        )
      : [];
  } catch {
    return [];
  }
}

function writeStoredHitMemoSessions(entries: StoredHitMemoSession[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(HIT_MEMO_STORAGE_KEY, JSON.stringify(entries.slice(0, 12)));
}

export function rememberHitMemoSession(entry: StoredHitMemoSession) {
  const current = readStoredHitMemoSessions().filter(
    (item) => item.sourceSessionId !== entry.sourceSessionId
  );
  writeStoredHitMemoSessions([entry, ...current]);
}

export function markHitMemoResponded(
  sourceSessionId: string,
  accuracyLabel: FortuneFeedbackAccuracyLabel
) {
  const current = readStoredHitMemoSessions().map((item) =>
    item.sourceSessionId === sourceSessionId
      ? {
          ...item,
          respondedAt: new Date().toISOString(),
          accuracyLabel,
        }
      : item
  );
  writeStoredHitMemoSessions(current);
}

export function getPendingHitMemoSession(now = Date.now()) {
  return readStoredHitMemoSessions()
    .filter((item) => !item.respondedAt)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .find((item) => now - new Date(item.createdAt).getTime() >= HIT_MEMO_THRESHOLD_MS) ?? null;
}
