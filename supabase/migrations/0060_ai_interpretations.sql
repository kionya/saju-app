CREATE TABLE IF NOT EXISTS ai_interpretations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reading_id UUID NOT NULL REFERENCES readings(id) ON DELETE CASCADE,
  topic TEXT NOT NULL CHECK (topic IN ('today', 'love', 'wealth', 'career', 'relationship')),
  prompt_version TEXT NOT NULL,
  model TEXT,
  source TEXT NOT NULL CHECK (source IN ('openai', 'fallback')),
  fallback_reason TEXT,
  error_message TEXT,
  interpretation_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (reading_id, topic, prompt_version)
);

ALTER TABLE ai_interpretations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their AI interpretations"
  ON ai_interpretations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM readings
      WHERE readings.id = ai_interpretations.reading_id
        AND (readings.user_id = auth.uid() OR readings.user_id IS NULL)
    )
  );

CREATE INDEX IF NOT EXISTS idx_ai_interpretations_reading
  ON ai_interpretations (reading_id, topic, updated_at DESC);
