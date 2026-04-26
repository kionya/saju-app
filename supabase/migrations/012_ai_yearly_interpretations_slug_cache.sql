ALTER TABLE ai_yearly_interpretations
  ALTER COLUMN reading_id DROP NOT NULL;

ALTER TABLE ai_yearly_interpretations
  ADD COLUMN IF NOT EXISTS reading_slug TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_yearly_interpretations_slug_unique
  ON ai_yearly_interpretations (reading_slug, target_year, counselor_id, prompt_version)
  WHERE reading_slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ai_yearly_interpretations_slug_lookup
  ON ai_yearly_interpretations (reading_slug, target_year, updated_at DESC)
  WHERE reading_slug IS NOT NULL;
