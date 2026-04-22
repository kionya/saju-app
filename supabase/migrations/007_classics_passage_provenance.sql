-- Store passage-level provenance fields directly on each passage row.
-- The evidence view still joins work/source metadata, but each passage now
-- carries the operational release/license snapshot required for audit/export.

ALTER TABLE classic_passages
  ADD COLUMN IF NOT EXISTS section_path TEXT,
  ADD COLUMN IF NOT EXISTS license_label TEXT,
  ADD COLUMN IF NOT EXISTS verification_status TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'classic_passages_verification_status_check'
  ) THEN
    ALTER TABLE classic_passages
      ADD CONSTRAINT classic_passages_verification_status_check
      CHECK (verification_status IN ('unreviewed', 'provisional', 'reviewed', 'blocked'));
  END IF;
END $$;

UPDATE classic_passages p
SET
  section_path = s.section_path,
  license_label = COALESCE(wv.license_override, src.license_label),
  verification_status = wv.verification_status
FROM classic_sections s
JOIN classic_work_versions wv ON wv.work_version_id = s.work_version_id
JOIN classic_sources src ON src.source_id = wv.source_id
WHERE p.section_id = s.section_id
  AND (
    p.section_path IS NULL
    OR p.license_label IS NULL
    OR p.verification_status IS NULL
  );

ALTER TABLE classic_passages
  ALTER COLUMN section_path SET NOT NULL,
  ALTER COLUMN source_line_ref SET NOT NULL,
  ALTER COLUMN provenance_hash SET NOT NULL,
  ALTER COLUMN license_label SET NOT NULL,
  ALTER COLUMN verification_status SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_classic_passages_verification_status
  ON classic_passages(verification_status);

CREATE OR REPLACE VIEW v_classic_evidence_flat AS
SELECT
  w.canonical_slug,
  w.canonical_title_zh_hant,
  COALESCE(w.canonical_title_ko, w.canonical_title_zh_hant) AS canonical_title_ko,
  wv.work_version_id,
  wv.source_item_title,
  wv.edition_name,
  wv.edition_type,
  p.verification_status,
  wv.public_release_status,
  s.section_id,
  p.section_path,
  s.section_title_zh,
  COALESCE(s.section_title_ko, s.section_title_zh) AS section_title_ko,
  p.passage_id,
  p.passage_no,
  p.original_text_zh,
  rk.reading_ko,
  tl.translation_ko AS literal_translation_ko,
  ck.commentary_ko,
  src.source_name,
  src.source_type,
  wv.source_url,
  wv.source_work_ref,
  p.license_label AS effective_license_label
FROM classic_works w
JOIN classic_work_versions wv ON wv.work_id = w.work_id
JOIN classic_sources src ON src.source_id = wv.source_id
JOIN classic_sections s ON s.work_version_id = wv.work_version_id
JOIN classic_passages p ON p.section_id = s.section_id
LEFT JOIN classic_readings_ko rk
  ON rk.passage_id = p.passage_id
 AND rk.reading_system = 'hangul_hanja'
LEFT JOIN classic_translations_ko tl
  ON tl.passage_id = p.passage_id
 AND tl.translation_type = 'literal'
LEFT JOIN LATERAL (
  SELECT c.commentary_ko
  FROM classic_commentaries c
  WHERE c.passage_id = p.passage_id
  ORDER BY
    CASE c.review_status
      WHEN 'approved' THEN 3
      WHEN 'reviewed' THEN 2
      ELSE 1
    END DESC,
    c.reviewed_at DESC NULLS LAST
  LIMIT 1
) ck ON TRUE;
