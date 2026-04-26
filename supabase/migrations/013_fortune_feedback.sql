CREATE TABLE IF NOT EXISTS fortune_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  source_session_id TEXT NOT NULL UNIQUE,
  concern_id TEXT NOT NULL,
  accuracy_label TEXT NOT NULL CHECK (accuracy_label IN ('correct', 'partial', 'miss')),
  accuracy_score INTEGER NOT NULL CHECK (accuracy_score IN (0, 1, 2)),
  responded_at_24h TIMESTAMPTZ NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fortune_feedback_user_recent
  ON fortune_feedback (user_id, responded_at_24h DESC);

CREATE INDEX IF NOT EXISTS idx_fortune_feedback_concern_recent
  ON fortune_feedback (concern_id, responded_at_24h DESC);

ALTER TABLE fortune_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own fortune feedback"
  ON fortune_feedback
  FOR SELECT
  USING (auth.uid() = user_id);
