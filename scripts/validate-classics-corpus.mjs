#!/usr/bin/env node

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  createSupabaseServiceClient,
  loadLocalEnv,
} from './lib/classics/upsert-classic-corpus.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const EXPECTED_WIKISOURCE_REFS = [
  'title=滴天髓',
  'title=穷通宝鉴',
  'title=三命通會_(四庫全書本)',
];

async function main() {
  const args = parseArgs(process.argv.slice(2));
  loadLocalEnv(projectRoot);
  const supabase = createSupabaseServiceClient();

  const rows = [];
  for (const sourceWorkRef of EXPECTED_WIKISOURCE_REFS) {
    rows.push(await validateWorkVersion(supabase, sourceWorkRef));
  }

  const orphanCount = await countOrphanPassages(supabase);
  const suspectCount = await countSuspectPassages(supabase);
  const latestRuns = await loadLatestRuns(supabase);

  console.table(rows);
  console.log(`orphan_passages=${orphanCount}`);
  console.log(`suspect_passages=${suspectCount}`);
  console.log('latest_ingest_runs=');
  for (const run of latestRuns) {
    console.log(
      `  ${run.started_at} ${run.job_name} ${run.run_status} records=${run.records_written} errors=${run.error_count}`
    );
  }

  const minPassages = Number.parseInt(args.minPassages, 10);
  const tooSmall = rows.filter((row) => row.passage_count < minPassages);
  if (tooSmall.length > 0) {
    console.error(
      `Expected at least ${minPassages} passages for each work, but these were too small: ${tooSmall
        .map((row) => row.source_work_ref)
        .join(', ')}`
    );
    process.exit(1);
  }

  if (orphanCount > 0) {
    console.error('Found orphan classic_passages rows.');
    process.exit(1);
  }
}

function parseArgs(argv) {
  const args = {
    minPassages: '1',
  };

  for (const arg of argv) {
    if (arg.startsWith('--min-passages=')) {
      args.minPassages = arg.slice('--min-passages='.length);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

async function validateWorkVersion(supabase, sourceWorkRef) {
  const { data: version, error: versionError } = await supabase
    .from('classic_work_versions')
    .select('work_version_id, source_work_ref, source_item_title, public_release_status, verification_status')
    .eq('source_work_ref', sourceWorkRef)
    .single();

  if (versionError) {
    throw new Error(`Missing work version ${sourceWorkRef}: ${versionError.message}`);
  }

  const { count: sectionCount, error: sectionError } = await supabase
    .from('classic_sections')
    .select('section_id', { count: 'exact', head: true })
    .eq('work_version_id', version.work_version_id);

  if (sectionError) {
    throw new Error(`Could not count sections for ${sourceWorkRef}: ${sectionError.message}`);
  }

  const { count: passageCount, error: passageError } = await supabase
    .from('classic_passages')
    .select('passage_id', { count: 'exact', head: true })
    .eq('work_version_id', version.work_version_id);

  if (passageError) {
    throw new Error(`Could not count passages for ${sourceWorkRef}: ${passageError.message}`);
  }

  return {
    source_work_ref: version.source_work_ref,
    title: version.source_item_title,
    release: version.public_release_status,
    verification: version.verification_status,
    section_count: sectionCount ?? 0,
    passage_count: passageCount ?? 0,
    concept_tag_count: await countConceptTagsForWorkVersion(
      supabase,
      version.work_version_id
    ),
  };
}

async function countConceptTagsForWorkVersion(supabase, workVersionId) {
  const passageRows = await loadAllRows(
    supabase,
    'classic_passages',
    'passage_id, work_version_id'
  );
  const passageIds = passageRows
    .filter((row) => row.work_version_id === workVersionId)
    .map((row) => row.passage_id);

  let count = 0;
  for (const batch of chunk(passageIds, 100)) {
    const { count: batchCount, error } = await supabase
      .from('classic_passage_concept_tags')
      .select('passage_id', { count: 'exact', head: true })
      .in('passage_id', batch);

    if (error) {
      throw new Error(`Could not count concept tags: ${error.message}`);
    }

    count += batchCount ?? 0;
  }

  return count;
}

async function countOrphanPassages(supabase) {
  const sectionRows = await loadAllRows(supabase, 'classic_sections', 'section_id');
  const sectionIds = new Set(sectionRows.map((row) => row.section_id));
  const passageRows = await loadAllRows(supabase, 'classic_passages', 'passage_id, section_id');

  return passageRows.filter((row) => !sectionIds.has(row.section_id)).length;
}

async function countSuspectPassages(supabase) {
  const { count, error } = await supabase
    .from('classic_passages')
    .select('passage_id', { count: 'exact', head: true })
    .eq('is_suspect', true);

  if (error) {
    throw new Error(`Could not count suspect passages: ${error.message}`);
  }

  return count ?? 0;
}

async function loadLatestRuns(supabase) {
  const { data, error } = await supabase
    .from('classic_ingest_runs')
    .select('started_at, job_name, run_status, records_written, error_count')
    .order('started_at', { ascending: false })
    .limit(8);

  if (error) {
    throw new Error(`Could not load latest ingest runs: ${error.message}`);
  }

  return data ?? [];
}

async function loadAllRows(supabase, table, select) {
  const rows = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(from, from + 999);

    if (error) {
      throw new Error(`Could not load ${table}: ${error.message}`);
    }

    rows.push(...(data ?? []));
    if (!data || data.length < 1000) break;
    from += 1000;
  }

  return rows;
}

function chunk(values, size) {
  const chunks = [];
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }
  return chunks;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
