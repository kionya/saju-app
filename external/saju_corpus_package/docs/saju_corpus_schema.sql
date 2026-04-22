-- saju_corpus_schema.sql
-- PostgreSQL 14+
-- 목적: 명리/역학/철학/역사 고전 코퍼스의 판본-섹션-문단-해설 구조화

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- 선택: pgvector 설치 환경에서만 활성화
-- CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS sources (
    source_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_code TEXT NOT NULL UNIQUE,
    source_name TEXT NOT NULL,
    source_type TEXT NOT NULL, -- api | file | html | portal | academic | public_data
    base_url TEXT NOT NULL,
    license_label TEXT,
    requires_auth BOOLEAN NOT NULL DEFAULT FALSE,
    bulk_allowed BOOLEAN NOT NULL DEFAULT FALSE,
    legal_notes TEXT,
    quality_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS works (
    work_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_slug TEXT NOT NULL UNIQUE,
    canonical_title_zh_hant TEXT NOT NULL,
    canonical_title_zh_hans TEXT,
    canonical_title_ko TEXT,
    canonical_title_en TEXT,
    domain_type TEXT NOT NULL, -- mingli | yixue | philosophy | history | astronomy | reference
    author_name_zh TEXT,
    author_name_ko TEXT,
    author_era TEXT,
    composition_period TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS work_versions (
    work_version_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_id UUID NOT NULL REFERENCES works(work_id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES sources(source_id) ON DELETE RESTRICT,
    source_work_ref TEXT NOT NULL, -- URN / title / dataset id / page title
    source_url TEXT,
    source_item_title TEXT NOT NULL,
    edition_name TEXT,
    edition_type TEXT NOT NULL, -- base_text | commentary | annotated | ocr | wiki_text | public_dump
    script_type TEXT, -- trad | simp | mixed | ko_hanja
    language_code TEXT DEFAULT 'zh',
    completeness_status TEXT NOT NULL, -- complete | partial | missing | uncertain
    verification_status TEXT NOT NULL DEFAULT 'unreviewed', -- unreviewed | provisional | reviewed | blocked
    public_release_status TEXT NOT NULL DEFAULT 'hold', -- live | hold | internal
    license_override TEXT,
    is_primary_source BOOLEAN NOT NULL DEFAULT FALSE,
    is_reference_only BOOLEAN NOT NULL DEFAULT FALSE,
    source_last_verified_at DATE,
    notes TEXT,
    UNIQUE (source_id, source_work_ref)
);

CREATE INDEX IF NOT EXISTS idx_work_versions_work_id ON work_versions(work_id);
CREATE INDEX IF NOT EXISTS idx_work_versions_source_id ON work_versions(source_id);
CREATE INDEX IF NOT EXISTS idx_work_versions_release ON work_versions(public_release_status, verification_status);

CREATE TABLE IF NOT EXISTS sections (
    section_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_version_id UUID NOT NULL REFERENCES work_versions(work_version_id) ON DELETE CASCADE,
    parent_section_id UUID REFERENCES sections(section_id) ON DELETE CASCADE,
    depth SMALLINT NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL,
    section_no TEXT,
    section_key TEXT NOT NULL,
    section_title_zh TEXT NOT NULL,
    section_title_ko TEXT,
    section_path TEXT NOT NULL,
    source_section_ref TEXT,
    anchor_start TEXT,
    anchor_end TEXT,
    UNIQUE (work_version_id, section_key),
    UNIQUE (work_version_id, section_path)
);

CREATE INDEX IF NOT EXISTS idx_sections_work_version ON sections(work_version_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_sections_parent ON sections(parent_section_id);

CREATE TABLE IF NOT EXISTS passages (
    passage_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_version_id UUID NOT NULL REFERENCES work_versions(work_version_id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(section_id) ON DELETE CASCADE,
    passage_no INTEGER NOT NULL,
    original_text_zh TEXT NOT NULL,
    normalized_text_zh TEXT,
    script_type TEXT, -- trad | simp | mixed
    char_count INTEGER GENERATED ALWAYS AS (char_length(original_text_zh)) STORED,
    provenance_hash TEXT,
    source_line_ref TEXT,
    is_suspect BOOLEAN NOT NULL DEFAULT FALSE,
    suspect_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (section_id, passage_no)
);

CREATE INDEX IF NOT EXISTS idx_passages_section ON passages(section_id, passage_no);
CREATE INDEX IF NOT EXISTS idx_passages_work_version ON passages(work_version_id);
CREATE INDEX IF NOT EXISTS idx_passages_suspect ON passages(is_suspect);

CREATE TABLE IF NOT EXISTS readings_ko (
    reading_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passage_id UUID NOT NULL REFERENCES passages(passage_id) ON DELETE CASCADE,
    reading_system TEXT NOT NULL DEFAULT 'hangul_hanja',
    reading_ko TEXT NOT NULL,
    generated_by TEXT NOT NULL DEFAULT 'manual', -- manual | ai | hybrid
    review_status TEXT NOT NULL DEFAULT 'unreviewed', -- unreviewed | reviewed | approved
    reviewer TEXT,
    reviewed_at TIMESTAMPTZ,
    notes TEXT,
    UNIQUE (passage_id, reading_system)
);

CREATE TABLE IF NOT EXISTS translations_ko (
    translation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passage_id UUID NOT NULL REFERENCES passages(passage_id) ON DELETE CASCADE,
    translation_type TEXT NOT NULL, -- literal | idiomatic
    translation_ko TEXT NOT NULL,
    generated_by TEXT NOT NULL DEFAULT 'manual', -- manual | ai | hybrid
    review_status TEXT NOT NULL DEFAULT 'unreviewed',
    reviewer TEXT,
    reviewed_at TIMESTAMPTZ,
    notes TEXT,
    UNIQUE (passage_id, translation_type)
);

CREATE TABLE IF NOT EXISTS commentaries (
    commentary_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_version_id UUID REFERENCES work_versions(work_version_id) ON DELETE CASCADE,
    section_id UUID REFERENCES sections(section_id) ON DELETE CASCADE,
    passage_id UUID REFERENCES passages(passage_id) ON DELETE CASCADE,
    commentary_type TEXT NOT NULL, -- doctrinal | editorial | ui_summary | cross_reference | caution
    commentary_ko TEXT NOT NULL,
    generated_by TEXT NOT NULL DEFAULT 'manual',
    review_status TEXT NOT NULL DEFAULT 'unreviewed',
    reviewer TEXT,
    reviewed_at TIMESTAMPTZ,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_commentaries_passage ON commentaries(passage_id);
CREATE INDEX IF NOT EXISTS idx_commentaries_section ON commentaries(section_id);

CREATE TABLE IF NOT EXISTS concept_tags (
    concept_tag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concept_slug TEXT NOT NULL UNIQUE,
    concept_name_ko TEXT NOT NULL,
    concept_name_zh TEXT,
    concept_group TEXT NOT NULL, -- 오행 | 십신 | 격국 | 용신 | 조후 | 신살 | 운세
    description_ko TEXT
);

CREATE TABLE IF NOT EXISTS passage_concept_tags (
    passage_id UUID NOT NULL REFERENCES passages(passage_id) ON DELETE CASCADE,
    concept_tag_id UUID NOT NULL REFERENCES concept_tags(concept_tag_id) ON DELETE CASCADE,
    confidence NUMERIC(5,4),
    tagging_source TEXT NOT NULL DEFAULT 'manual',
    PRIMARY KEY (passage_id, concept_tag_id)
);

CREATE INDEX IF NOT EXISTS idx_passage_concept_tags_tag ON passage_concept_tags(concept_tag_id, confidence DESC);

CREATE TABLE IF NOT EXISTS crossrefs (
    crossref_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_passage_id UUID NOT NULL REFERENCES passages(passage_id) ON DELETE CASCADE,
    to_passage_id UUID NOT NULL REFERENCES passages(passage_id) ON DELETE CASCADE,
    relation_type TEXT NOT NULL, -- same_topic | quotation | commentary | parallel_passage | contradiction
    confidence NUMERIC(5,4),
    notes TEXT,
    UNIQUE (from_passage_id, to_passage_id, relation_type)
);

CREATE TABLE IF NOT EXISTS validation_runs (
    validation_run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_type TEXT NOT NULL, -- edition_diff | ocr_review | license_audit | completeness_audit
    left_work_version_id UUID REFERENCES work_versions(work_version_id) ON DELETE CASCADE,
    right_work_version_id UUID REFERENCES work_versions(work_version_id) ON DELETE CASCADE,
    run_status TEXT NOT NULL DEFAULT 'running',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    summary TEXT
);

CREATE TABLE IF NOT EXISTS validation_diffs (
    validation_diff_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    validation_run_id UUID NOT NULL REFERENCES validation_runs(validation_run_id) ON DELETE CASCADE,
    section_key TEXT,
    left_passage_id UUID REFERENCES passages(passage_id) ON DELETE SET NULL,
    right_passage_id UUID REFERENCES passages(passage_id) ON DELETE SET NULL,
    diff_level TEXT NOT NULL, -- work | section | passage | char
    diff_metric TEXT, -- levenshtein | missing | duplicate | title_mismatch
    diff_score NUMERIC(10,4),
    left_excerpt TEXT,
    right_excerpt TEXT,
    needs_review BOOLEAN NOT NULL DEFAULT TRUE,
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_by TEXT,
    resolved_at TIMESTAMPTZ,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_validation_diffs_run ON validation_diffs(validation_run_id, needs_review, resolved);

CREATE TABLE IF NOT EXISTS ingest_runs (
    ingest_run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES sources(source_id) ON DELETE CASCADE,
    work_version_id UUID REFERENCES work_versions(work_version_id) ON DELETE CASCADE,
    job_name TEXT NOT NULL,
    run_status TEXT NOT NULL DEFAULT 'running', -- running | success | failed | partial
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    records_written INTEGER NOT NULL DEFAULT 0,
    error_count INTEGER NOT NULL DEFAULT 0,
    log_excerpt TEXT
);

-- 선택: 임베딩 저장용 테이블
-- CREATE TABLE IF NOT EXISTS passage_embeddings (
--     passage_id UUID PRIMARY KEY REFERENCES passages(passage_id) ON DELETE CASCADE,
--     model_name TEXT NOT NULL,
--     embedding vector(1536) NOT NULL,
--     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- );

CREATE OR REPLACE VIEW v_classic_export_flat AS
SELECT
    w.canonical_slug,
    w.canonical_title_zh_hant,
    COALESCE(w.canonical_title_ko, w.canonical_title_zh_hant) AS canonical_title_ko,
    wv.work_version_id,
    wv.source_item_title,
    wv.edition_name,
    wv.edition_type,
    wv.verification_status,
    wv.public_release_status,
    s.section_id,
    s.section_path,
    s.section_title_zh,
    COALESCE(s.section_title_ko, s.section_title_zh) AS section_title_ko,
    p.passage_id,
    p.passage_no,
    p.original_text_zh,
    rk.reading_ko,
    tl.translation_ko AS literal_translation_ko,
    ck.commentary_ko,
    src.source_name,
    wv.source_work_ref,
    COALESCE(wv.license_override, src.license_label) AS effective_license_label
FROM works w
JOIN work_versions wv ON wv.work_id = w.work_id
JOIN sources src ON src.source_id = wv.source_id
JOIN sections s ON s.work_version_id = wv.work_version_id
JOIN passages p ON p.section_id = s.section_id
LEFT JOIN readings_ko rk
    ON rk.passage_id = p.passage_id
   AND rk.reading_system = 'hangul_hanja'
LEFT JOIN translations_ko tl
    ON tl.passage_id = p.passage_id
   AND tl.translation_type = 'literal'
LEFT JOIN LATERAL (
    SELECT commentary_ko
    FROM commentaries c
    WHERE c.passage_id = p.passage_id
    ORDER BY c.review_status DESC, c.reviewed_at DESC NULLS LAST
    LIMIT 1
) ck ON TRUE;

COMMIT;