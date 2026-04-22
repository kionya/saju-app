/**
 * nextjs_reference_api.ts
 *
 * Next.js Route Handler 예시
 * 목적: 사이트 내 "고전 근거" 블록에 passage 단위 데이터를 공급
 *
 * 가정:
 * - PostgreSQL 사용
 * - /api/classics/evidence?concept=용신
 * - domain_type = 'mingli' 우선
 */

import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

type EvidenceRow = {
  canonical_slug: string;
  canonical_title_zh_hant: string;
  canonical_title_ko: string;
  edition_name: string | null;
  section_path: string;
  section_title_zh: string;
  section_title_ko: string;
  passage_id: string;
  passage_no: number;
  original_text_zh: string;
  reading_ko: string | null;
  literal_translation_ko: string | null;
  commentary_ko: string | null;
  source_name: string;
  source_work_ref: string;
  effective_license_label: string | null;
};

function normalizeQuery(q: string): string {
  return q.trim().replace(/\s+/g, " ");
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const concept = normalizeQuery(url.searchParams.get("concept") ?? "");
  const limit = Number(url.searchParams.get("limit") ?? "5");

  if (!concept) {
    return NextResponse.json(
      { error: "concept query parameter is required" },
      { status: 400 }
    );
  }

  const client = await pool.connect();

  try {
    /**
     * 전략:
     * 1) concept tag 직접 hit
     * 2) commentary_ko / translation_ko / original_text_zh fallback 검색
     * 3) live + reviewed source 우선
     */
    const sql = `
      WITH tagged AS (
        SELECT
          v.*
        FROM v_classic_export_flat v
        JOIN passages p ON p.passage_id = v.passage_id
        JOIN passage_concept_tags pct ON pct.passage_id = p.passage_id
        JOIN concept_tags ct ON ct.concept_tag_id = pct.concept_tag_id
        WHERE ct.concept_name_ko = $1
           OR ct.concept_slug = $1
      ),
      fallback AS (
        SELECT
          v.*
        FROM v_classic_export_flat v
        WHERE v.public_release_status = 'live'
          AND v.verification_status IN ('reviewed', 'provisional')
          AND (
               COALESCE(v.commentary_ko, '') ILIKE '%' || $1 || '%'
            OR COALESCE(v.literal_translation_ko, '') ILIKE '%' || $1 || '%'
            OR COALESCE(v.section_title_ko, '') ILIKE '%' || $1 || '%'
            OR COALESCE(v.original_text_zh, '') ILIKE '%' || $2 || '%'
          )
      )
      SELECT DISTINCT *
      FROM (
        SELECT * FROM tagged
        UNION ALL
        SELECT * FROM fallback
      ) x
      ORDER BY canonical_slug, section_path, passage_no
      LIMIT $3
    `;

    const hanjaFallback = concept; // 운영 시 ko->zh 용어 사전을 두는 편이 좋다.
    const { rows } = await client.query<EvidenceRow>(sql, [concept, hanjaFallback, limit]);

    return NextResponse.json({
      concept,
      count: rows.length,
      items: rows.map((row) => ({
        work: {
          slug: row.canonical_slug,
          titleZh: row.canonical_title_zh_hant,
          titleKo: row.canonical_title_ko,
          editionName: row.edition_name
        },
        section: {
          path: row.section_path,
          titleZh: row.section_title_zh,
          titleKo: row.section_title_ko
        },
        passage: {
          id: row.passage_id,
          no: row.passage_no,
          originalZh: row.original_text_zh,
          readingKo: row.reading_ko,
          literalKo: row.literal_translation_ko,
          commentaryKo: row.commentary_ko
        },
        provenance: {
          sourceName: row.source_name,
          sourceRef: row.source_work_ref,
          license: row.effective_license_label
        }
      }))
    });
  } finally {
    client.release();
  }
}