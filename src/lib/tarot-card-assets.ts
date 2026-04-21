export const TAROT_CARD_IMAGE_DIRECTORY = '/images/tarot/cards';
export const TAROT_CARD_IMAGE_EXTENSION = 'webp';

export type TarotCardVisualFamily = 'major' | 'cups' | 'pentacles' | 'swords' | 'wands';

export interface TarotCardVisualTone {
  family: TarotCardVisualFamily;
  label: string;
  marker: string;
  accentClassName: string;
  backgroundClassName: string;
  borderClassName: string;
  motifClassName: string;
}

const VISUAL_TONES: Record<TarotCardVisualFamily, TarotCardVisualTone> = {
  major: {
    family: 'major',
    label: 'Major Arcana',
    marker: '大',
    accentClassName: 'text-[var(--app-gold)]',
    backgroundClassName:
      'bg-[radial-gradient(circle_at_50%_18%,rgba(210,176,114,0.22),transparent_36%),linear-gradient(160deg,rgba(86,62,122,0.98),rgba(19,23,47,0.98))]',
    borderClassName: 'border-[var(--app-gold)]/60',
    motifClassName: 'border-[var(--app-gold)]/35 bg-[rgba(210,176,114,0.12)]',
  },
  cups: {
    family: 'cups',
    label: 'Cups',
    marker: '水',
    accentClassName: 'text-[var(--app-sky)]',
    backgroundClassName:
      'bg-[radial-gradient(circle_at_50%_18%,rgba(108,173,205,0.24),transparent_36%),linear-gradient(160deg,rgba(42,79,116,0.98),rgba(12,24,45,0.98))]',
    borderClassName: 'border-[var(--app-sky)]/55',
    motifClassName: 'border-[var(--app-sky)]/35 bg-[rgba(108,173,205,0.12)]',
  },
  pentacles: {
    family: 'pentacles',
    label: 'Pentacles',
    marker: '土',
    accentClassName: 'text-[var(--app-jade)]',
    backgroundClassName:
      'bg-[radial-gradient(circle_at_50%_18%,rgba(121,178,139,0.22),transparent_36%),linear-gradient(160deg,rgba(45,86,72,0.98),rgba(16,31,37,0.98))]',
    borderClassName: 'border-[var(--app-jade)]/55',
    motifClassName: 'border-[var(--app-jade)]/35 bg-[rgba(121,178,139,0.12)]',
  },
  swords: {
    family: 'swords',
    label: 'Swords',
    marker: '風',
    accentClassName: 'text-[var(--app-ivory)]',
    backgroundClassName:
      'bg-[radial-gradient(circle_at_50%_18%,rgba(232,229,214,0.16),transparent_36%),linear-gradient(160deg,rgba(57,67,88,0.98),rgba(15,19,32,0.98))]',
    borderClassName: 'border-[var(--app-ivory)]/45',
    motifClassName: 'border-[var(--app-ivory)]/25 bg-[rgba(232,229,214,0.08)]',
  },
  wands: {
    family: 'wands',
    label: 'Wands',
    marker: '火',
    accentClassName: 'text-[var(--app-coral)]',
    backgroundClassName:
      'bg-[radial-gradient(circle_at_50%_18%,rgba(211,129,103,0.24),transparent_36%),linear-gradient(160deg,rgba(116,62,58,0.98),rgba(34,19,31,0.98))]',
    borderClassName: 'border-[var(--app-coral)]/55',
    motifClassName: 'border-[var(--app-coral)]/35 bg-[rgba(211,129,103,0.12)]',
  },
};

export function getTarotCardImagePath(cardId: string) {
  const safeCardId = normalizeTarotCardId(cardId);
  return `${TAROT_CARD_IMAGE_DIRECTORY}/${safeCardId}.${TAROT_CARD_IMAGE_EXTENSION}`;
}

export function getTarotCardVisualTone(cardId: string) {
  return VISUAL_TONES[getTarotCardVisualFamily(cardId)];
}

function getTarotCardVisualFamily(cardId: string): TarotCardVisualFamily {
  const normalized = normalizeTarotCardId(cardId);

  if (normalized.startsWith('cu')) return 'cups';
  if (normalized.startsWith('pe')) return 'pentacles';
  if (normalized.startsWith('sw')) return 'swords';
  if (normalized.startsWith('wa')) return 'wands';

  return 'major';
}

function normalizeTarotCardId(cardId: string) {
  return cardId.toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'unknown';
}
