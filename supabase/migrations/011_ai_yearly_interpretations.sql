CREATE TABLE IF NOT EXISTS ai_yearly_interpretations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reading_id UUID NOT NULL REFERENCES readings(id) ON DELETE CASCADE,
  target_year INTEGER NOT NULL CHECK (target_year >= 1900 AND target_year <= 2100),
  counselor_id TEXT NOT NULL CHECK (counselor_id IN ('female', 'male')),
  prompt_version TEXT NOT NULL,
  model TEXT,
  source TEXT NOT NULL CHECK (source IN ('openai', 'fallback')),
  fallback_reason TEXT,
  error_message TEXT,
  interpretation_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (reading_id, target_year, counselor_id, prompt_version)
);

ALTER TABLE ai_yearly_interpretations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their yearly AI interpretations"
  ON ai_yearly_interpretations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM readings
      WHERE readings.id = ai_yearly_interpretations.reading_id
        AND (readings.user_id = auth.uid() OR readings.user_id IS NULL)
    )
  );

CREATE INDEX IF NOT EXISTS idx_ai_yearly_interpretations_reading
  ON ai_yearly_interpretations (reading_id, target_year, updated_at DESC);
