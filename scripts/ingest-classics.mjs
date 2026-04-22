#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  collectWikisourceWork,
  selectWikisourceWorks,
  WIKISOURCE_WORKS,
} from './lib/classics/wikisource-normalize.mjs';
import {
  createSupabaseServiceClient,
  loadLocalEnv,
  upsertClassicWorkCorpus,
} from './lib/classics/upsert-classic-corpus.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  if (args.source !== 'wikisource') {
    throw new Error('Only --source=wikisource is supported in this PR.');
  }

  if (args.apply && args.dryRun) {
    throw new Error('Use either --dry-run or --apply, not both.');
  }

  const mode = args.apply ? 'apply' : 'dry-run';
  const selectedWorks = selectWikisourceWorks(args.work);
  const requestDelayMs = Number.parseInt(args.requestDelayMs, 10);
  const maxPassageChars = Number.parseInt(args.maxPassageChars, 10);

  if (mode === 'apply') {
    loadLocalEnv(projectRoot);
  }

  const supabase = mode === 'apply' ? createSupabaseServiceClient() : null;
  const summaries = [];

  console.log(`Classics ingest source=wikisource mode=${mode}`);
  console.log(`Works: ${selectedWorks.map((work) => work.key).join(', ')}`);

  for (const work of selectedWorks) {
    console.log(`\nCollecting ${work.key} (${work.title})...`);
    const collected = await collectWikisourceWork(work, {
      requestDelayMs,
      maxPassageChars,
    });

    printCollectedSummary(collected);

    let applyResult = null;
    if (mode === 'apply') {
      applyResult = await upsertClassicWorkCorpus({
        supabase,
        collected,
        replace: Boolean(args.replace),
      });
      console.log(
        `Applied ${work.key}: sections=${applyResult.sectionsWritten} passages=${applyResult.passagesWritten} conceptTags=${applyResult.conceptTagsWritten} run=${applyResult.ingestRunId}`
      );
    }

    summaries.push(buildSummary(collected, applyResult));
  }

  if (args.out) {
    const outputPath = path.resolve(projectRoot, args.out);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${JSON.stringify({ mode, summaries }, null, 2)}\n`);
    console.log(`\nWrote summary JSON: ${outputPath}`);
  }

  console.log('\nDone.');
}

function parseArgs(argv) {
  const args = {
    source: 'wikisource',
    work: 'all',
    dryRun: false,
    apply: false,
    replace: false,
    out: '',
    requestDelayMs: '120',
    maxPassageChars: '900',
    help: false,
  };

  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') args.help = true;
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--apply') args.apply = true;
    else if (arg === '--replace') args.replace = true;
    else if (arg.startsWith('--source=')) args.source = arg.slice('--source='.length);
    else if (arg.startsWith('--work=')) args.work = arg.slice('--work='.length);
    else if (arg.startsWith('--out=')) args.out = arg.slice('--out='.length);
    else if (arg.startsWith('--request-delay-ms=')) {
      args.requestDelayMs = arg.slice('--request-delay-ms='.length);
    } else if (arg.startsWith('--max-passage-chars=')) {
      args.maxPassageChars = arg.slice('--max-passage-chars='.length);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function printHelp() {
  console.log(`Usage:
  node scripts/ingest-classics.mjs --source=wikisource --dry-run
  node scripts/ingest-classics.mjs --source=wikisource --work=ditian-sui --apply
  node scripts/ingest-classics.mjs --source=wikisource --work=all --apply --replace

Options:
  --work=all|${WIKISOURCE_WORKS.map((work) => work.key).join('|')}
  --dry-run                 Collect and normalize without writing to Supabase. Default mode.
  --apply                   Upsert sections/passages and write classic_ingest_runs.
  --replace                 Delete existing sections/passages for the target work before applying.
  --out=path.json           Write collection summary JSON.
  --request-delay-ms=120    Delay between page requests.
  --max-passage-chars=900   Sentence-aware split target for long passage rows.
`);
}

function printCollectedSummary(collected) {
  const charCount = collected.passages.reduce(
    (total, passage) => total + passage.originalTextZh.length,
    0
  );
  const conceptTagCount = collected.passages.reduce(
    (total, passage) => total + (passage.conceptSlugs?.length ?? 0),
    0
  );
  console.log(
    `Collected ${collected.work.key}: pages=${collected.pages.length} sections=${collected.sections.length} passages=${collected.passages.length} conceptTags=${conceptTagCount} chars=${charCount}`
  );

  for (const page of collected.pages.slice(0, 5)) {
    console.log(`  page ${page.requestedTitle}@oldid=${page.revisionId}`);
  }
  if (collected.pages.length > 5) {
    console.log(`  ... ${collected.pages.length - 5} more pages`);
  }

  for (const warning of collected.warnings) {
    console.warn(`  warning: ${warning}`);
  }
}

function buildSummary(collected, applyResult) {
  return {
    workKey: collected.work.key,
    sourceWorkRef: collected.work.sourceWorkRef,
    pages: collected.pages.map((page) => ({
      requestedTitle: page.requestedTitle,
      title: page.title,
      revisionId: page.revisionId,
    })),
    sectionCount: collected.sections.length,
    passageCount: collected.passages.length,
    conceptTagCount: collected.passages.reduce(
      (total, passage) => total + (passage.conceptSlugs?.length ?? 0),
      0
    ),
    charCount: collected.passages.reduce(
      (total, passage) => total + passage.originalTextZh.length,
      0
    ),
    samplePassages: collected.passages.slice(0, 5).map((passage) => ({
      sectionKey: passage.sectionKey,
      passageNo: passage.passageNo,
      sourceLineRef: passage.sourceLineRef,
      text: passage.originalTextZh.slice(0, 160),
    })),
    warnings: collected.warnings,
    applyResult,
  };
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
