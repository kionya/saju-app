# Classics corpus ingestion

This app now has the first production-oriented slice for classical saju evidence:

- Vendor input: `external/saju_corpus_package/`
- Migration: `supabase/migrations/006_classics_corpus.sql`
- Evidence route: `GET /api/classics/evidence?concept=용신`
- UI surface: saju result page, below the existing classical citation summary

## Current scope

The first pass is metadata-first and offline-first. It creates tables for source, work, version, section, passage, Korean reading, Korean translation, commentary, concept tags, ingest runs, and validation runs. It also seeds source and version metadata from the provided manifest for the public-safe candidates:

- `滴天髓`
- `窮通寶鑑`
- `三命通會 (四庫全書本)`

No live scraping is part of this milestone.

## Applying the schema

Apply the Supabase migrations in order, including `006_classics_corpus.sql`.

The evidence route uses the `SUPABASE_SERVICE_ROLE_KEY` path because corpus reads are served through the app API, not directly from the browser. If the schema is not applied yet, the route returns a setup-required state instead of breaking the page.

## Passage ingestion sequence

1. Pick one `classic_work_versions` row whose `public_release_status` is `live` and whose `verification_status` is `provisional` or `reviewed`.
2. Load source text from approved local/offline material first. If a future collector is used, confirm the source allows that access mode before running it.
3. Insert `classic_sections` with stable `section_key`, `section_path`, source references, and sort order.
4. Insert `classic_passages` with `original_text_zh`, optional `normalized_text_zh`, `source_line_ref`, and `provenance_hash`.
5. Add `classic_readings_ko`, `classic_translations_ko`, and `classic_commentaries` only when their generation source and review state are explicit.
6. Attach `classic_passage_concept_tags` for concepts such as `용신`, `조후`, `격국`, `강약`, `합충`, `공망`, and `신살`.
7. Record each batch in `classic_ingest_runs`.

## Provenance checklist

Every passage should preserve:

- Source name and URL through `classic_sources` and `classic_work_versions`
- Source work reference, edition name, edition type, completeness status, and verification status
- Source line or section reference when available
- License label or source-specific license override
- Suspect flags for OCR, missing sections, unclear source, or incomplete pages

## Release gates

Only expose passages through the evidence API when:

- `public_release_status = 'live'`
- `verification_status IN ('reviewed', 'provisional')`
- The source license/terms allow the intended display
- The passage has passage-level provenance

Keep these blocked or reference-only until manually reviewed:

- General `三命通會` Wikisource page with missing 권10-권12
- `淵海子平` Wikisource page marked unfinished/source-unclear
- `子平真詮評注` when it is being treated as if it were the base text
- CText OCR/community text as a standalone public source

## Verification

After ingesting passages, verify:

- `GET /api/classics/evidence?concept=용신` returns only live/reviewed or live/provisional rows.
- The saju result page renders original text, source reference, and license label.
- `npm run typecheck` still passes.
- Any ingest script logs a `classic_ingest_runs` row with record counts and errors.
