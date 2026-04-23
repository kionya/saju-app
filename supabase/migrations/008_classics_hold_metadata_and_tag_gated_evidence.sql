-- Keep deferred/unsafe classics in the catalog as reference-only rows and
-- require concept tags before a passage can be returned by the evidence API.

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
    (SELECT work_id FROM classic_works WHERE canonical_slug = 'yuanhai-ziping'),
    (SELECT source_id FROM classic_sources WHERE source_code = 'zh_wikisource'),
    'title=淵海子平',
    'https://zh.wikisource.org/wiki/淵海子平',
    '淵海子平',
    'Wikisource unfinished',
    'wiki_text',
    'trad',
    'partial',
    'blocked',
    'hold',
    FALSE,
    TRUE,
    DATE '2026-04-21',
    '未完成 및 來源不明 경고가 있어 DB에는 reference-only로만 보존하고 공개 API에서는 제외한다.'
  ),
  (
    (SELECT work_id FROM classic_works WHERE canonical_slug = 'ziping-zhenquan'),
    (SELECT source_id FROM classic_sources WHERE source_code = 'zh_wikisource'),
    'title=子平真詮',
    'https://zh.wikisource.org/wiki/子平真詮',
    '子平真詮',
    'Wikisource redlink',
    'wiki_text',
    'trad',
    'missing',
    'blocked',
    'hold',
    FALSE,
    TRUE,
    DATE '2026-04-21',
    '위키문헌 과학기술 포털 목록에는 보이나 실제 본문 페이지는 redlink이므로 공개/수집 대상이 아니다.'
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
    'blocked',
    'hold',
    FALSE,
    TRUE,
    DATE '2026-04-21',
    'CTP community/annotated text. 원전 子平真詮과 동일 취급하지 않고 자동 대량 수집 없이 비교용으로만 둔다.'
  ),
  (
    (SELECT work_id FROM classic_works WHERE canonical_slug = 'yuanhai-ziping'),
    (SELECT source_id FROM classic_sources WHERE source_code = 'ctext'),
    'ctp:wb727782',
    'https://ctext.org/wiki.pl?if=gb&remap=gb&res=727782',
    '淵海子平',
    'CTP reference',
    'wiki_text',
    'trad',
    'uncertain',
    'blocked',
    'hold',
    FALSE,
    TRUE,
    DATE '2026-04-21',
    'CTP community text. 자동 대량 다운로드 없이 Wikisource/스캔본 대조용 reference-only로만 보존한다.'
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
    'blocked',
    'hold',
    FALSE,
    TRUE,
    DATE '2026-04-21',
    '任鐵樵의 闡微 주석본. 기본 滴天髓 원문과 동일 취급하지 않고 비교용 reference-only로 둔다.'
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
    'blocked',
    'hold',
    FALSE,
    TRUE,
    DATE '2026-04-21',
    'CTP community/위키 계열 대조본. 공개용 기본본이 아니므로 reference-only로 둔다.'
  ),
  (
    (SELECT work_id FROM classic_works WHERE canonical_slug = 'sanming-tonghui'),
    (SELECT source_id FROM classic_sources WHERE source_code = 'ctext'),
    'ctp:wb758991',
    'https://ctext.org/wiki.pl?if=en&res=758991',
    '三命通會',
    'CTP OCR reference',
    'ocr',
    'trad',
    'uncertain',
    'blocked',
    'hold',
    FALSE,
    TRUE,
    DATE '2026-04-21',
    'CTP OCR/alternative digital reference. 四庫全書本 공개본과 분리하며 공개 API에서는 제외한다.'
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
  matching_tags AS (
    SELECT ct.concept_tag_id
    FROM normalized n
    JOIN classic_concept_tags ct
      ON n.query_text <> ''
     AND (
       ct.concept_slug = n.query_text
       OR ct.concept_name_ko = n.query_text
       OR ct.concept_name_zh = n.query_text
     )
  ),
  tagged_passages AS (
    SELECT
      pct.passage_id,
      pct.confidence
    FROM classic_passage_concept_tags pct
    JOIN matching_tags mt ON mt.concept_tag_id = pct.concept_tag_id
  ),
  ranked_passages AS (
    SELECT
      v.passage_id,
      CASE
        WHEN COALESCE(v.section_title_ko, '') ILIKE '%' || n.query_text || '%' THEN 120
        WHEN COALESCE(v.commentary_ko, '') ILIKE '%' || n.query_text || '%' THEN 115
        WHEN COALESCE(v.literal_translation_ko, '') ILIKE '%' || n.query_text || '%' THEN 110
        WHEN COALESCE(v.original_text_zh, '') ILIKE '%' || n.query_text || '%' THEN 105
        ELSE 100
      END + COALESCE((MAX(tp.confidence) * 10)::INTEGER, 0) AS match_rank
    FROM normalized n
    JOIN tagged_passages tp ON TRUE
    JOIN v_classic_evidence_flat v ON v.passage_id = tp.passage_id
    WHERE v.public_release_status = 'live'
      AND v.verification_status IN ('reviewed', 'provisional')
      AND v.source_url IS NOT NULL
      AND v.source_work_ref IS NOT NULL
      AND v.effective_license_label IS NOT NULL
    GROUP BY
      v.passage_id,
      n.query_text,
      v.section_title_ko,
      v.commentary_ko,
      v.literal_translation_ko,
      v.original_text_zh
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
    MAX(r.match_rank)::INTEGER AS rank_score
  FROM v_classic_evidence_flat v
  JOIN ranked_passages r ON r.passage_id = v.passage_id
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
