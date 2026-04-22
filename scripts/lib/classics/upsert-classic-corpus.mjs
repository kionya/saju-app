import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

export function loadLocalEnv(projectRoot) {
  const envPath = path.join(projectRoot, '.env.local');
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const separatorIndex = line.indexOf('=');
    if (separatorIndex <= 0) continue;

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] ??= value;
  }
}

export function createSupabaseServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for --apply.'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function upsertClassicWorkCorpus({ supabase, collected, replace = false }) {
  const workVersion = await loadWorkVersion(supabase, collected.work.sourceWorkRef);
  const licenseLabel = await loadEffectiveLicenseLabel(supabase, workVersion);
  const ingestRun = await startIngestRun({
    supabase,
    sourceId: workVersion.source_id,
    workVersionId: workVersion.work_version_id,
    jobName: `wikisource:${collected.work.key}`,
  });

  try {
    if (replace) {
      await assertNoReviewedDerivedRows(supabase, workVersion.work_version_id);
      await deleteExistingPassages(supabase, workVersion.work_version_id);
      await deleteExistingSections(supabase, workVersion.work_version_id);
    }

    const sectionIdByKey = await upsertSections({
      supabase,
      workVersionId: workVersion.work_version_id,
      sections: collected.sections,
    });
    const sectionByKey = new Map(
      collected.sections.map((section) => [section.sectionKey, section])
    );

    const passageInputs = collected.passages.map((passage) => {
      const section = sectionByKey.get(passage.sectionKey);
      const sectionId = sectionIdByKey.get(passage.sectionKey);
      if (!sectionId) {
        throw new Error(`Missing section id for passage section key ${passage.sectionKey}`);
      }
      if (!section) {
        throw new Error(`Missing section metadata for passage section key ${passage.sectionKey}`);
      }

      return {
        conceptSlugs: passage.conceptSlugs ?? [],
        row: {
          work_version_id: workVersion.work_version_id,
          section_id: sectionId,
          passage_no: passage.passageNo,
          section_path: section.sectionPath,
          original_text_zh: passage.originalTextZh,
          normalized_text_zh: passage.normalizedTextZh,
          script_type: passage.scriptType,
          provenance_hash: passage.provenanceHash,
          source_line_ref: passage.sourceLineRef,
          license_label: licenseLabel,
          verification_status: workVersion.verification_status,
          is_suspect: false,
          suspect_reason: null,
        },
      };
    });

    const passageResult = await upsertPassages(
      supabase,
      passageInputs.map((input) => input.row)
    );
    const tagCount = await upsertPassageConceptTags({
      supabase,
      passageInputs,
      passageIdBySectionAndNo: passageResult.passageIdBySectionAndNo,
    });
    const recordsWritten = collected.sections.length + passageResult.written + tagCount;

    await finishIngestRun({
      supabase,
      ingestRunId: ingestRun.ingest_run_id,
      status: 'success',
      recordsWritten,
      errorCount: 0,
      logExcerpt: buildLogExcerpt(collected),
    });

    return {
      workVersionId: workVersion.work_version_id,
      recordsWritten,
      sectionsWritten: collected.sections.length,
      passagesWritten: passageResult.written,
      conceptTagsWritten: tagCount,
      ingestRunId: ingestRun.ingest_run_id,
    };
  } catch (error) {
    await finishIngestRun({
      supabase,
      ingestRunId: ingestRun.ingest_run_id,
      status: 'failed',
      recordsWritten: 0,
      errorCount: 1,
      logExcerpt: error instanceof Error ? error.message : 'Unknown classics ingest failure.',
    });
    throw error;
  }
}

async function loadWorkVersion(supabase, sourceWorkRef) {
  const { data, error } = await supabase
    .from('classic_work_versions')
    .select('work_version_id, source_id, source_work_ref, license_override, verification_status')
    .eq('source_work_ref', sourceWorkRef)
    .single();

  if (error) {
    throw new Error(`Could not load classic_work_versions row for ${sourceWorkRef}: ${error.message}`);
  }

  return data;
}

async function loadEffectiveLicenseLabel(supabase, workVersion) {
  if (workVersion.license_override) return workVersion.license_override;

  const { data, error } = await supabase
    .from('classic_sources')
    .select('license_label')
    .eq('source_id', workVersion.source_id)
    .single();

  if (error) {
    throw new Error(`Could not load license label for source ${workVersion.source_id}: ${error.message}`);
  }

  if (!data.license_label) {
    throw new Error(`Missing license label for source ${workVersion.source_id}`);
  }

  return data.license_label;
}

async function startIngestRun({ supabase, sourceId, workVersionId, jobName }) {
  const { data, error } = await supabase
    .from('classic_ingest_runs')
    .insert({
      source_id: sourceId,
      work_version_id: workVersionId,
      job_name: jobName,
      run_status: 'running',
    })
    .select('ingest_run_id')
    .single();

  if (error) {
    throw new Error(`Could not start classic_ingest_runs row: ${error.message}`);
  }

  return data;
}

async function finishIngestRun({
  supabase,
  ingestRunId,
  status,
  recordsWritten,
  errorCount,
  logExcerpt,
}) {
  const { error } = await supabase
    .from('classic_ingest_runs')
    .update({
      run_status: status,
      ended_at: new Date().toISOString(),
      records_written: recordsWritten,
      error_count: errorCount,
      log_excerpt: logExcerpt.slice(0, 4000),
    })
    .eq('ingest_run_id', ingestRunId);

  if (error) {
    throw new Error(`Could not finish classic_ingest_runs row: ${error.message}`);
  }
}

async function assertNoReviewedDerivedRows(supabase, workVersionId) {
  const passageIds = await loadPassageIdsForWorkVersion(supabase, workVersionId);
  let readingCount = 0;
  let translationCount = 0;

  for (const batch of chunk(passageIds, 100)) {
    const { count: batchReadingCount, error: readingError } = await supabase
      .from('classic_readings_ko')
      .select('reading_id', { count: 'exact', head: true })
      .in('passage_id', batch)
      .in('review_status', ['reviewed', 'approved']);

    if (readingError) {
      throw new Error(`Could not check reviewed readings before replace: ${readingError.message}`);
    }

    const { count: batchTranslationCount, error: translationError } = await supabase
      .from('classic_translations_ko')
      .select('translation_id', { count: 'exact', head: true })
      .in('passage_id', batch)
      .in('review_status', ['reviewed', 'approved']);

    if (translationError) {
      throw new Error(
        `Could not check reviewed translations before replace: ${translationError.message}`
      );
    }

    readingCount += batchReadingCount ?? 0;
    translationCount += batchTranslationCount ?? 0;
  }

  if ((readingCount ?? 0) > 0 || (translationCount ?? 0) > 0) {
    throw new Error(
      'Refusing --replace because reviewed/approved Korean derived rows already exist for this work version.'
    );
  }
}

async function loadPassageIdsForWorkVersion(supabase, workVersionId) {
  const passageIds = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from('classic_passages')
      .select('passage_id')
      .eq('work_version_id', workVersionId)
      .range(from, from + 999);

    if (error) {
      throw new Error(`Could not load passages before replace: ${error.message}`);
    }

    passageIds.push(...(data ?? []).map((row) => row.passage_id));
    if (!data || data.length < 1000) break;
    from += 1000;
  }

  return passageIds;
}

async function deleteExistingPassages(supabase, workVersionId) {
  const { error } = await supabase
    .from('classic_passages')
    .delete()
    .eq('work_version_id', workVersionId);

  if (error) {
    throw new Error(`Could not delete existing classic_passages rows: ${error.message}`);
  }
}

async function deleteExistingSections(supabase, workVersionId) {
  const { error } = await supabase
    .from('classic_sections')
    .delete()
    .eq('work_version_id', workVersionId);

  if (error) {
    throw new Error(`Could not delete existing classic_sections rows: ${error.message}`);
  }
}

async function upsertSections({ supabase, workVersionId, sections }) {
  const sectionIdByKey = new Map();
  const depths = [...new Set(sections.map((section) => section.depth))].sort((a, b) => a - b);

  for (const depth of depths) {
    const rows = sections
      .filter((section) => section.depth === depth)
      .map((section) => ({
        work_version_id: workVersionId,
        parent_section_id: section.parentSectionKey
          ? sectionIdByKey.get(section.parentSectionKey) ?? null
          : null,
        depth: section.depth,
        sort_order: section.sortOrder,
        section_no: section.sectionNo,
        section_key: section.sectionKey,
        section_title_zh: section.sectionTitleZh,
        section_path: section.sectionPath,
        source_section_ref: section.sourceSectionRef,
      }));

    for (const batch of chunk(rows, 250)) {
      const { data, error } = await supabase
        .from('classic_sections')
        .upsert(batch, {
          onConflict: 'work_version_id,section_key',
        })
        .select('section_id, section_key');

      if (error) {
        throw new Error(`Could not upsert classic_sections batch: ${error.message}`);
      }

      for (const row of data ?? []) {
        sectionIdByKey.set(row.section_key, row.section_id);
      }
    }
  }

  return sectionIdByKey;
}

async function upsertPassages(supabase, passageRows) {
  let written = 0;
  const passageIdBySectionAndNo = new Map();
  for (const batch of chunk(passageRows, 250)) {
    const { data, error } = await supabase
      .from('classic_passages')
      .upsert(batch, {
        onConflict: 'section_id,passage_no',
      })
      .select('passage_id, section_id, passage_no');

    if (error) {
      throw new Error(`Could not upsert classic_passages batch: ${error.message}`);
    }

    for (const row of data ?? []) {
      passageIdBySectionAndNo.set(`${row.section_id}:${row.passage_no}`, row.passage_id);
    }

    written += batch.length;
  }

  return { written, passageIdBySectionAndNo };
}

async function upsertPassageConceptTags({
  supabase,
  passageInputs,
  passageIdBySectionAndNo,
}) {
  const conceptSlugs = [
    ...new Set(passageInputs.flatMap((input) => input.conceptSlugs).filter(Boolean)),
  ];

  if (conceptSlugs.length === 0) return 0;

  const { data: conceptRows, error: conceptError } = await supabase
    .from('classic_concept_tags')
    .select('concept_tag_id, concept_slug')
    .in('concept_slug', conceptSlugs);

  if (conceptError) {
    throw new Error(`Could not load classic_concept_tags: ${conceptError.message}`);
  }

  const conceptIdBySlug = new Map(
    (conceptRows ?? []).map((row) => [row.concept_slug, row.concept_tag_id])
  );
  const tagRows = [];

  for (const input of passageInputs) {
    const passageId = passageIdBySectionAndNo.get(
      `${input.row.section_id}:${input.row.passage_no}`
    );
    if (!passageId) continue;

    for (const conceptSlug of input.conceptSlugs) {
      const conceptTagId = conceptIdBySlug.get(conceptSlug);
      if (!conceptTagId) continue;

      tagRows.push({
        passage_id: passageId,
        concept_tag_id: conceptTagId,
        confidence: 0.72,
        tagging_source: 'wikisource_exact_keyword',
      });
    }
  }

  let written = 0;
  for (const batch of chunk(tagRows, 500)) {
    const { error } = await supabase.from('classic_passage_concept_tags').upsert(batch, {
      onConflict: 'passage_id,concept_tag_id',
    });

    if (error) {
      throw new Error(`Could not upsert classic_passage_concept_tags batch: ${error.message}`);
    }

    written += batch.length;
  }

  return written;
}

function buildLogExcerpt(collected) {
  const pageRefs = collected.pages
    .map((page) => `${page.requestedTitle}@oldid=${page.revisionId}`)
    .join(', ');
  const warningLine =
    collected.warnings.length > 0 ? ` warnings=${collected.warnings.join(' | ')}` : '';

  return `work=${collected.work.key} pages=${collected.pages.length} sections=${collected.sections.length} passages=${collected.passages.length} refs=${pageRefs}${warningLine}`;
}

function chunk(values, size) {
  const chunks = [];
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }
  return chunks;
}
