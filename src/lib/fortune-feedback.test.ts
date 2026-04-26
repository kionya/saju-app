import assert from 'node:assert/strict';
import { buildRecentFortuneFeedbackSummary } from './fortune-feedback';

declare const test: (name: string, fn: () => void) => void;

test('recent fortune feedback summary counts responses and points out weaker concerns', () => {
  const summary = buildRecentFortuneFeedbackSummary([
    {
      concern_id: 'money_spend',
      accuracy_label: 'correct',
      accuracy_score: 2,
      responded_at_24h: '2026-04-27T00:00:00.000Z',
    },
    {
      concern_id: 'money_spend',
      accuracy_label: 'partial',
      accuracy_score: 1,
      responded_at_24h: '2026-04-26T00:00:00.000Z',
    },
    {
      concern_id: 'relationship_conflict',
      accuracy_label: 'miss',
      accuracy_score: 0,
      responded_at_24h: '2026-04-25T00:00:00.000Z',
    },
  ]);

  assert.match(summary ?? '', /피드백 3건/);
  assert.match(summary ?? '', /맞았다 1건/);
  assert.match(summary ?? '', /비슷했다 1건/);
  assert.match(summary ?? '', /빗나갔다 1건/);
  assert.match(summary ?? '', /돈과 지출|관계와 말실수/);
});
