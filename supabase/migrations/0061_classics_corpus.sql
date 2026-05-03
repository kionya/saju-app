-- Classical saju corpus metadata, provenance, and evidence lookup.
-- First pass is offline-first: this stores source/version metadata now and
-- leaves passage ingestion to a reviewed local pipeline.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS classic_sources (
  source_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_code TEXT NOT NULL UNIQUE,
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (
    source_type IN ('api', 'file', 'html', 'portal', 'academic', 'public_data')
  ),
  base_url TEXT NOT NULL,
  license_label TEXT,
  requires_auth BOOLEAN NOT NULL DEFAULT FALSE,
  bulk_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  legal_notes TEXT,
  quality_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS classic_works (
  work_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_slug TEXT NOT NULL UNIQUE,
  canonical_title_zh_hant TEXT NOT NULL,
  canonical_title_zh_hans TEXT,
  canonical_title_ko TEXT,
  canonical_title_en TEXT,
  domain_type TEXT NOT NULL CHECK (
    domain_type IN ('mingli', 'yixue', 'philosophy', 'history', 'astronomy', 'reference')
  ),
  author_name_zh TEXT,
  author_name_ko TEXT,
  author_era TEXT,
  composition_period TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS classic_work_versions (
  work_version_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id UUID NOT NULL REFERENCES classic_works(work_id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES classic_sources(source_id) ON DELETE RESTRICT,
  source_work_ref TEXT NOT NULL,
  source_url TEXT,
  source_item_title TEXT NOT NULL,
  edition_name TEXT,
  edition_type TEXT NOT NULL CHECK (
    edition_type IN ('base_text', 'commentary', 'annotated', 'ocr', 'wiki_text', 'public_dump')
  ),
  script_type TEXT CHECK (script_type IS NULL OR script_type IN ('trad', 'simp', 'mixed', 'ko_hanja')),
  language_code TEXT NOT NULL DEFAULT 'zh',
  completeness_status TEXT NOT NULL CHECK (
    completeness_status IN ('complete', 'partial', 'missing', 'uncertain')
  ),
  verification_status TEXT NOT NULL DEFAULT 'unreviewed' CHECK (
    verification_status IN ('unreviewed', 'provisional', 'reviewed', 'blocked')
  ),
  public_release_status TEXT NOT NULL DEFAULT 'hold' CHECK (
    public_release_status IN ('live', 'hold', 'internal')
  ),
  license_override TEXT,
  is_primary_source BOOLEAN NOT NULL DEFAULT FALSE,
  is_reference_only BOOLEAN NOT NULL DEFAULT FALSE,
  source_last_verified_at DATE,
  notes TEXT,
  UNIQUE (source_id, source_work_ref)
);

CREATE INDEX IF NOT EXISTS idx_classic_work_versions_work_id
  ON classic_work_versions(work_id);
CREATE INDEX IF NOT EXISTS idx_classic_work_versions_source_id
  ON classic_work_versions(source_id);
CREATE INDEX IF NOT EXISTS idx_classic_work_versions_release
  ON classic_work_versions(public_release_status, verification_status);

CREATE TABLE IF NOT EXISTS classic_sections (
  section_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_version_id UUID NOT NULL REFERENCES classic_work_versions(work_version_id) ON DELETE CASCADE,
  parent_section_id UUID REFERENCES classic_sections(section_id) ON DELETE CASCADE,
  depth SMALLINT NOT NULL DEFAULT 1 CHECK (depth > 0),
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

CREATE INDEX IF NOT EXISTS idx_classic_sections_work_version
  ON classic_sections(work_version_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_classic_sections_parent
  ON classic_sections(parent_section_id);

CREATE TABLE IF NOT EXISTS classic_passages (
  passage_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_version_id UUID NOT NULL REFERENCES classic_work_versions(work_version_id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES classic_sections(section_id) ON DELETE CASCADE,
  passage_no INTEGER NOT NULL CHECK (passage_no > 0),
  original_text_zh TEXT NOT NULL,
  normalized_text_zh TEXT,
  script_type TEXT CHECK (script_type IS NULL OR script_type IN ('trad', 'simp', 'mixed')),
  char_count INTEGER GENERATED ALWAYS AS (char_length(original_text_zh)) STORED,
  provenance_hash TEXT,
  source_line_ref TEXT,
  is_suspect BOOLEAN NOT NULL DEFAULT FALSE,
  suspect_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (section_id, passage_no)
);

CREATE INDEX IF NOT EXISTS idx_classic_passages_section
  ON classic_passages(section_id, passage_no);
CREATE INDEX IF NOT EXISTS idx_classic_passages_work_version
  ON classic_passages(work_version_id);
CREATE INDEX IF NOT EXISTS idx_classic_passages_suspect
  ON classic_passages(is_suspect);

CREATE TABLE IF NOT EXISTS classic_readings_ko (
  reading_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passage_id UUID NOT NULL REFERENCES classic_passages(passage_id) ON DELETE CASCADE,
  reading_system TEXT NOT NULL DEFAULT 'hangul_hanja',
  reading_ko TEXT NOT NULL,
  generated_by TEXT NOT NULL DEFAULT 'manual' CHECK (generated_by IN ('manual', 'ai', 'hybrid')),
  review_status TEXT NOT NULL DEFAULT 'unreviewed' CHECK (
    review_status IN ('unreviewed', 'reviewed', 'approved')
  ),
  reviewer TEXT,
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE (passage_id, reading_system)
);

CREATE TABLE IF NOT EXISTS classic_translations_ko (
  translation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passage_id UUID NOT NULL REFERENCES classic_passages(passage_id) ON DELETE CASCADE,
  translation_type TEXT NOT NULL CHECK (translation_type IN ('literal', 'idiomatic')),
  translation_ko TEXT NOT NULL,
  generated_by TEXT NOT NULL DEFAULT 'manual' CHECK (generated_by IN ('manual', 'ai', 'hybrid')),
  review_status TEXT NOT NULL DEFAULT 'unreviewed' CHECK (
    review_status IN ('unreviewed', 'reviewed', 'approved')
  ),
  reviewer TEXT,
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE (passage_id, translation_type)
);

CREATE TABLE IF NOT EXISTS classic_commentaries (
  commentary_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_version_id UUID REFERENCES classic_work_versions(work_version_id) ON DELETE CASCADE,
  section_id UUID REFERENCES classic_sections(section_id) ON DELETE CASCADE,
  passage_id UUID REFERENCES classic_passages(passage_id) ON DELETE CASCADE,
  commentary_type TEXT NOT NULL CHECK (
    commentary_type IN ('doctrinal', 'editorial', 'ui_summary', 'cross_reference', 'caution')
  ),
  commentary_ko TEXT NOT NULL,
  generated_by TEXT NOT NULL DEFAULT 'manual' CHECK (generated_by IN ('manual', 'ai', 'hybrid')),
  review_status TEXT NOT NULL DEFAULT 'unreviewed' CHECK (
    review_status IN ('unreviewed', 'reviewed', 'approved')
  ),
  reviewer TEXT,
  reviewed_at TIMESTAMPTZ,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_classic_commentaries_passage
  ON classic_commentaries(passage_id);
CREATE INDEX IF NOT EXISTS idx_classic_commentaries_section
  ON classic_commentaries(section_id);

CREATE TABLE IF NOT EXISTS classic_concept_tags (
  concept_tag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_slug TEXT NOT NULL UNIQUE,
  concept_name_ko TEXT NOT NULL,
  concept_name_zh TEXT,
  concept_group TEXT NOT NULL,
  description_ko TEXT
);

CREATE TABLE IF NOT EXISTS classic_passage_concept_tags (
  passage_id UUID NOT NULL REFERENCES classic_passages(passage_id) ON DELETE CASCADE,
  concept_tag_id UUID NOT NULL REFERENCES classic_concept_tags(concept_tag_id) ON DELETE CASCADE,
  confidence NUMERIC(5,4),
  tagging_source TEXT NOT NULL DEFAULT 'manual',
  PRIMARY KEY (passage_id, concept_tag_id)
);

CREATE INDEX IF NOT EXISTS idx_classic_passage_concept_tags_tag
  ON classic_passage_concept_tags(concept_tag_id, confidence DESC);

CREATE TABLE IF NOT EXISTS classic_validation_runs (
  validation_run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_type TEXT NOT NULL CHECK (
    run_type IN ('edition_diff', 'ocr_review', 'license_audit', 'completeness_audit')
  ),
  left_work_version_id UUID REFERENCES classic_work_versions(work_version_id) ON DELETE CASCADE,
  right_work_version_id UUID REFERENCES classic_work_versions(work_version_id) ON DELETE CASCADE,
  run_status TEXT NOT NULL DEFAULT 'running' CHECK (
    run_status IN ('running', 'success', 'failed', 'partial')
  ),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  summary TEXT
);

CREATE TABLE IF NOT EXISTS classic_ingest_runs (
  ingest_run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES classic_sources(source_id) ON DELETE CASCADE,
  work_version_id UUID REFERENCES classic_work_versions(work_version_id) ON DELETE CASCADE,
  job_name TEXT NOT NULL,
  run_status TEXT NOT NULL DEFAULT 'running' CHECK (
    run_status IN ('running', 'success', 'failed', 'partial')
  ),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  records_written INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  log_excerpt TEXT
);

ALTER TABLE classic_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE classic_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE classic_work_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE classic_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE classic_passages ENABLE ROW LEVEL SECURITY;
ALTER TABLE classic_readings_ko ENABLE ROW LEVEL SECURITY;
ALTER TABLE classic_translations_ko ENABLE ROW LEVEL SECURITY;
ALTER TABLE classic_commentaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE classic_concept_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE classic_passage_concept_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE classic_validation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE classic_ingest_runs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE VIEW v_classic_evidence_flat AS
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
  src.source_type,
  wv.source_url,
  wv.source_work_ref,
  COALESCE(wv.license_override, src.license_label) AS effective_license_label
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

CREATE OR REPLACE FUNCTION search_classic_evidence(
  p_concept TEXT,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  canonical_slug TEXT,
  canonical_title_zh_hant TEXT,
  canonical_title_ko TEXT,
  work_version_id UUID,
  source_item_title TEXT,
  edition_name TEXT,
  edition_type TEXT,
  verification_status TEXT,
  public_release_status TEXT,
  section_id UUID,
  section_path TEXT,
  section_title_zh TEXT,
  section_title_ko TEXT,
  passage_id UUID,
  passage_no INTEGER,
  original_text_zh TEXT,
  reading_ko TEXT,
  literal_translation_ko TEXT,
  commentary_ko TEXT,
  source_name TEXT,
  source_type TEXT,
  source_url TEXT,
  source_work_ref TEXT,
  effective_license_label TEXT,
  rank_score INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH normalized AS (
    SELECT btrim(regexp_replace(COALESCE(p_concept, ''), '\s+', ' ', 'g')) AS query_text
  ),
  direct_tag_matches AS (
    SELECT
      pct.passage_id,
      100 AS match_rank
    FROM normalized n
    JOIN classic_concept_tags ct
      ON n.query_text <> ''
     AND (
       ct.concept_slug = n.query_text
       OR ct.concept_name_ko = n.query_text
       OR ct.concept_name_zh = n.query_text
     )
    JOIN classic_passage_concept_tags pct ON pct.concept_tag_id = ct.concept_tag_id
  ),
  text_matches AS (
    SELECT
      v.passage_id,
      CASE
        WHEN COALESCE(v.section_title_ko, '') ILIKE '%' || n.query_text || '%' THEN 70
        WHEN COALESCE(v.commentary_ko, '') ILIKE '%' || n.query_text || '%' THEN 60
        WHEN COALESCE(v.literal_translation_ko, '') ILIKE '%' || n.query_text || '%' THEN 50
        WHEN COALESCE(v.original_text_zh, '') ILIKE '%' || n.query_text || '%' THEN 40
        ELSE 10
      END AS match_rank
    FROM normalized n
    JOIN v_classic_evidence_flat v ON n.query_text <> ''
    WHERE v.public_release_status = 'live'
      AND v.verification_status IN ('reviewed', 'provisional')
      AND (
        COALESCE(v.section_title_ko, '') ILIKE '%' || n.query_text || '%'
        OR COALESCE(v.commentary_ko, '') ILIKE '%' || n.query_text || '%'
        OR COALESCE(v.literal_translation_ko, '') ILIKE '%' || n.query_text || '%'
        OR COALESCE(v.original_text_zh, '') ILIKE '%' || n.query_text || '%'
      )
  ),
  matched_passages AS (
    SELECT passage_id, match_rank FROM direct_tag_matches
    UNION ALL
    SELECT passage_id, match_rank FROM text_matches
  )
  SELECT
    v.canonical_slug,
    v.canonical_title_zh_hant,
    v.canonical_title_ko,
    v.work_version_id,
    v.source_item_title,
    v.edition_name,
    v.edition_type,
    v.verification_status,
    v.public_release_status,
    v.section_id,
    v.section_path,
    v.section_title_zh,
    v.section_title_ko,
    v.passage_id,
    v.passage_no,
    v.original_text_zh,
    v.reading_ko,
    v.literal_translation_ko,
    v.commentary_ko,
    v.source_name,
    v.source_type,
    v.source_url,
    v.source_work_ref,
    v.effective_license_label,
    MAX(m.match_rank)::INTEGER AS rank_score
  FROM v_classic_evidence_flat v
  JOIN matched_passages m ON m.passage_id = v.passage_id
  WHERE v.public_release_status = 'live'
    AND v.verification_status IN ('reviewed', 'provisional')
  GROUP BY
    v.canonical_slug,
    v.canonical_title_zh_hant,
    v.canonical_title_ko,
    v.work_version_id,
    v.source_item_title,
    v.edition_name,
    v.edition_type,
    v.verification_status,
    v.public_release_status,
    v.section_id,
    v.section_path,
    v.section_title_zh,
    v.section_title_ko,
    v.passage_id,
    v.passage_no,
    v.original_text_zh,
    v.reading_ko,
    v.literal_translation_ko,
    v.commentary_ko,
    v.source_name,
    v.source_type,
    v.source_url,
    v.source_work_ref,
    v.effective_license_label
  ORDER BY rank_score DESC, v.canonical_slug, v.section_path, v.passage_no
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 5), 1), 20);
$$;

REVOKE EXECUTE ON FUNCTION search_classic_evidence(TEXT, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION search_classic_evidence(TEXT, INTEGER) TO service_role;

INSERT INTO classic_sources (
  source_code,
  source_name,
  source_type,
  base_url,
  license_label,
  requires_auth,
  bulk_allowed,
  legal_notes,
  quality_notes
) VALUES
  (
    'zh_wikisource',
    'zh.wikisource',
    'api',
    'https://zh.wikisource.org',
    '작품 PD-old 성격 + 사이트 텍스트 CC BY-SA 4.0',
    FALSE,
    TRUE,
    '작품별 완전성, 출처 경고, 판본 차이를 수동 검수한 뒤 공개한다.',
    '작품마다 출처/완전성 차이가 있으므로 work_version 단위로 상태를 분리한다.'
  ),
  (
    'ctext',
    'Chinese Text Project',
    'api',
    'https://ctext.org',
    '자동 다운로드 금지, 요청 제한 존재',
    TRUE,
    FALSE,
    '대량 수집 금지. URN 기반 메타데이터와 선택적 비교 소스로만 사용한다.',
    'Community text, OCR, 대체 디지털판이 섞일 수 있어 reference-only 기본값을 둔다.'
  ),
  (
    'data_go_kr',
    '공공데이터포털',
    'public_data',
    'https://www.data.go.kr',
    '데이터셋별 이용허락범위 확인 필요',
    FALSE,
    TRUE,
    '각 파일 데이터의 이용허락범위와 제공기관 고지를 보존한다.',
    '한국고전번역원, 국사편찬위원회, 기상청 데이터의 메타데이터 기반층.'
  )
ON CONFLICT (source_code) DO UPDATE SET
  source_name = EXCLUDED.source_name,
  source_type = EXCLUDED.source_type,
  base_url = EXCLUDED.base_url,
  license_label = EXCLUDED.license_label,
  requires_auth = EXCLUDED.requires_auth,
  bulk_allowed = EXCLUDED.bulk_allowed,
  legal_notes = EXCLUDED.legal_notes,
  quality_notes = EXCLUDED.quality_notes;

INSERT INTO classic_works (
  canonical_slug,
  canonical_title_zh_hant,
  canonical_title_zh_hans,
  canonical_title_ko,
  domain_type,
  author_name_zh,
  author_era,
  notes
) VALUES
  ('yuanhai-ziping', '淵海子平', '渊海子平', '연해자평', 'mingli', '徐子平', '宋', '공개 전 수동 검수 필수. 위키문헌은 미완성/출처 불명 경고가 있다.'),
  ('ziping-zhenquan', '子平真詮', '子平真诠', '자평진전', 'mingli', NULL, NULL, '원전과 評注본을 분리 저장해야 한다.'),
  ('ditian-sui', '滴天髓', '滴天髓', '적천수', 'mingli', NULL, NULL, '일간과 기세 해석의 공개 가능 1차 후보.'),
  ('qiongtong-baojian', '窮通寶鑑', '穷通宝鉴', '궁통보감', 'mingli', '馀春台', '明', '월령, 조후, 용신 해석의 공개 가능 1차 후보.'),
  ('sanming-tonghui', '三命通會', '三命通会', '삼명통회', 'mingli', NULL, NULL, '四庫全書本을 기본 공개 후보로 사용하고 일반 위키문헌 결락본은 보류한다.')
ON CONFLICT (canonical_slug) DO UPDATE SET
  canonical_title_zh_hant = EXCLUDED.canonical_title_zh_hant,
  canonical_title_zh_hans = EXCLUDED.canonical_title_zh_hans,
  canonical_title_ko = EXCLUDED.canonical_title_ko,
  domain_type = EXCLUDED.domain_type,
  author_name_zh = EXCLUDED.author_name_zh,
  author_era = EXCLUDED.author_era,
  notes = EXCLUDED.notes;

INSERT INTO classic_work_versions (
  work_id,
  source_id,
  source_work_ref,
  source_url,
  source_item_title,
  edition_name,
  edition_type,
  script_type,
  completeness_status,
  verification_status,
  public_release_status,
  is_primary_source,
  is_reference_only,
  source_last_verified_at,
  notes
) VALUES
  (
    (SELECT work_id FROM classic_works WHERE canonical_slug = 'ditian-sui'),
    (SELECT source_id FROM classic_sources WHERE source_code = 'zh_wikisource'),
    'title=滴天髓',
    'https://zh.wikisource.org/wiki/滴天髓',
    '滴天髓',
    'Wikisource',
    'wiki_text',
    'trad',
    'complete',
    'provisional',
    'live',
    TRUE,
    FALSE,
    DATE '2026-04-21',
    '공개용 1차 본문 후보. 원문 적재 전 passage-level 검수 필요.'
  ),
  (
    (SELECT work_id FROM classic_works WHERE canonical_slug = 'qiongtong-baojian'),
    (SELECT source_id FROM classic_sources WHERE source_code = 'zh_wikisource'),
    'title=穷通宝鉴',
    'https://zh.wikisource.org/wiki/穷通宝鉴',
    '穷通宝鉴',
    'Wikisource',
    'wiki_text',
    'simp',
    'complete',
    'provisional',
    'live',
    TRUE,
    FALSE,
    DATE '2026-04-21',
    '명리 월령/용신 해석 레이어의 핵심 기본본 후보.'
  ),
  (
    (SELECT work_id FROM classic_works WHERE canonical_slug = 'sanming-tonghui'),
    (SELECT source_id FROM classic_sources WHERE source_code = 'zh_wikisource'),
    'title=三命通會_(四庫全書本)',
    'https://zh.wikisource.org/wiki/三命通會_(四庫全書本)',
    '三命通會 (四庫全書本)',
    '四庫全書本',
    'wiki_text',
    'trad',
    'complete',
    'provisional',
    'live',
    TRUE,
    FALSE,
    DATE '2026-04-21',
    '권1~권12 완전본으로 일반 三命通會 결락본보다 우선한다.'
  ),
  (
    (SELECT work_id FROM classic_works WHERE canonical_slug = 'sanming-tonghui'),
    (SELECT source_id FROM classic_sources WHERE source_code = 'zh_wikisource'),
    'title=三命通會',
    'https://zh.wikisource.org/wiki/三命通會',
    '三命通會',
    'Wikisource incomplete',
    'wiki_text',
    'trad',
    'partial',
    'blocked',
    'hold',
    FALSE,
    TRUE,
    DATE '2026-04-21',
    '권10~권12 결락. 공개용 소스로 사용하지 않는다.'
  ),
  (
    (SELECT work_id FROM classic_works WHERE canonical_slug = 'yuanhai-ziping'),
    (SELECT source_id FROM classic_sources WHERE source_code = 'zh_wikisource'),
    'title=淵海子平',
    'https://zh.wikisource.org/wiki/淵海子平',
    '淵海子平',
    'Wikisource unfinished',
    'wiki_text',
    'trad',
    'partial',
    'unreviewed',
    'hold',
    FALSE,
    TRUE,
    DATE '2026-04-21',
    '未完成 및 來源不明 경고가 있어 공개 전 수동 검수가 필요하다.'
  ),
  (
    (SELECT work_id FROM classic_works WHERE canonical_slug = 'ziping-zhenquan'),
    (SELECT source_id FROM classic_sources WHERE source_code = 'ctext'),
    'ctp:wb631975',
    'https://ctext.org/wiki.pl?if=en&remap=gb&res=631975',
    '子平真詮評注',
    '評注本',
    'annotated',
    'trad',
    'uncertain',
    'unreviewed',
    'hold',
    FALSE,
    TRUE,
    DATE '2026-04-21',
    '정확히는 評注본이며 원전과 주석본을 분리해야 한다.'
  ),
  (
    (SELECT work_id FROM classic_works WHERE canonical_slug = 'ditian-sui'),
    (SELECT source_id FROM classic_sources WHERE source_code = 'ctext'),
    'ctp:wb221357',
    'https://ctext.org/wiki.pl?if=en&remap=gb&res=221357',
    '滴天髓闡微',
    '闡微本',
    'commentary',
    'trad',
    'uncertain',
    'unreviewed',
    'hold',
    FALSE,
    TRUE,
    DATE '2026-04-21',
    '任鐵樵의 闡微본으로 기본 원전과 동일 취급하지 않는다.'
  ),
  (
    (SELECT work_id FROM classic_works WHERE canonical_slug = 'qiongtong-baojian'),
    (SELECT source_id FROM classic_sources WHERE source_code = 'ctext'),
    'ctp:wb346166',
    'https://ctext.org/wiki.pl?if=gb&remap=gb&res=346166',
    '窮通寶鑑',
    'CTP reference',
    'wiki_text',
    'trad',
    'uncertain',
    'unreviewed',
    'hold',
    FALSE,
    TRUE,
    DATE '2026-04-21',
    '보조 대조본. 자동 대량 다운로드 없이 필요한 경우만 비교한다.'
  )
ON CONFLICT (source_id, source_work_ref) DO UPDATE SET
  source_url = EXCLUDED.source_url,
  source_item_title = EXCLUDED.source_item_title,
  edition_name = EXCLUDED.edition_name,
  edition_type = EXCLUDED.edition_type,
  script_type = EXCLUDED.script_type,
  completeness_status = EXCLUDED.completeness_status,
  verification_status = EXCLUDED.verification_status,
  public_release_status = EXCLUDED.public_release_status,
  is_primary_source = EXCLUDED.is_primary_source,
  is_reference_only = EXCLUDED.is_reference_only,
  source_last_verified_at = EXCLUDED.source_last_verified_at,
  notes = EXCLUDED.notes;

INSERT INTO classic_concept_tags (
  concept_slug,
  concept_name_ko,
  concept_name_zh,
  concept_group,
  description_ko
) VALUES
  ('yongsin', '용신', '用神', '용신', '명식의 균형을 회복하기 위해 우선 보태는 기운.'),
  ('johhu', '조후', '調候', '조후', '계절과 온습도 균형을 보는 해석 축.'),
  ('gyeokguk', '격국', '格局', '격국', '월령과 십신 구조로 보는 명식의 기본 틀.'),
  ('gangyak', '강약', '强弱', '강약', '일간과 주변 오행의 힘을 나누어 보는 판단.'),
  ('hapchung', '합충', '合沖', '합충', '지지와 천간의 묶임, 충돌, 변화 신호.'),
  ('gongmang', '공망', '空亡', '공망', '기운이 비어 있거나 지연되는 영역을 보는 보조 신호.'),
  ('sinsal', '신살', '神煞', '신살', '큰 구조 위에 얹어 보는 보조 신호.')
ON CONFLICT (concept_slug) DO UPDATE SET
  concept_name_ko = EXCLUDED.concept_name_ko,
  concept_name_zh = EXCLUDED.concept_name_zh,
  concept_group = EXCLUDED.concept_group,
  description_ko = EXCLUDED.description_ko;
