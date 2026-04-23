#!/usr/bin/env node

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  createSupabaseServiceClient,
  loadLocalEnv,
} from './lib/classics/upsert-classic-corpus.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const HOLD_WORK_VERSIONS = [
  {
    workSlug: 'yuanhai-ziping',
    sourceCode: 'zh_wikisource',
    source_work_ref: 'title=淵海子平',
    source_url: 'https://zh.wikisource.org/wiki/淵海子平',
    source_item_title: '淵海子平',
    edition_name: 'Wikisource unfinished',
    edition_type: 'wiki_text',
    script_type: 'trad',
    completeness_status: 'partial',
    verification_status: 'blocked',
    notes:
      '未完成 및 來源不明 경고가 있어 DB에는 reference-only로만 보존하고 공개 API에서는 제외한다.',
  },
  {
    workSlug: 'ziping-zhenquan',
    sourceCode: 'zh_wikisource',
    source_work_ref: 'title=子平真詮',
    source_url: 'https://zh.wikisource.org/wiki/子平真詮',
    source_item_title: '子平真詮',
    edition_name: 'Wikisource redlink',
    edition_type: 'wiki_text',
    script_type: 'trad',
    completeness_status: 'missing',
    verification_status: 'blocked',
    notes:
      '위키문헌 과학기술 포털 목록에는 보이나 실제 본문 페이지는 redlink이므로 공개/수집 대상이 아니다.',
  },
  {
    workSlug: 'ziping-zhenquan',
    sourceCode: 'ctext',
    source_work_ref: 'ctp:wb631975',
    source_url: 'https://ctext.org/wiki.pl?if=en&remap=gb&res=631975',
    source_item_title: '子平真詮評注',
    edition_name: '評注本',
    edition_type: 'annotated',
    script_type: 'trad',
    completeness_status: 'uncertain',
    verification_status: 'blocked',
    notes:
      'CTP community/annotated text. 원전 子平真詮과 동일 취급하지 않고 자동 대량 수집 없이 비교용으로만 둔다.',
  },
  {
    workSlug: 'yuanhai-ziping',
    sourceCode: 'ctext',
    source_work_ref: 'ctp:wb727782',
    source_url: 'https://ctext.org/wiki.pl?if=gb&remap=gb&res=727782',
    source_item_title: '淵海子平',
    edition_name: 'CTP reference',
    edition_type: 'wiki_text',
    script_type: 'trad',
    completeness_status: 'uncertain',
    verification_status: 'blocked',
    notes:
      'CTP community text. 자동 대량 다운로드 없이 Wikisource/스캔본 대조용 reference-only로만 보존한다.',
  },
  {
    workSlug: 'ditian-sui',
    sourceCode: 'ctext',
    source_work_ref: 'ctp:wb221357',
    source_url: 'https://ctext.org/wiki.pl?if=en&remap=gb&res=221357',
    source_item_title: '滴天髓闡微',
    edition_name: '闡微本',
    edition_type: 'commentary',
    script_type: 'trad',
    completeness_status: 'uncertain',
    verification_status: 'blocked',
    notes:
      '任鐵樵의 闡微 주석본. 기본 滴天髓 원문과 동일 취급하지 않고 비교용 reference-only로 둔다.',
  },
  {
    workSlug: 'qiongtong-baojian',
    sourceCode: 'ctext',
    source_work_ref: 'ctp:wb346166',
    source_url: 'https://ctext.org/wiki.pl?if=gb&remap=gb&res=346166',
    source_item_title: '窮通寶鑑',
    edition_name: 'CTP reference',
    edition_type: 'wiki_text',
    script_type: 'trad',
    completeness_status: 'uncertain',
    verification_status: 'blocked',
    notes:
      'CTP community/위키 계열 대조본. 공개용 기본본이 아니므로 reference-only로 둔다.',
  },
  {
    workSlug: 'sanming-tonghui',
    sourceCode: 'ctext',
    source_work_ref: 'ctp:wb758991',
    source_url: 'https://ctext.org/wiki.pl?if=en&res=758991',
    source_item_title: '三命通會',
    edition_name: 'CTP OCR reference',
    edition_type: 'ocr',
    script_type: 'trad',
    completeness_status: 'uncertain',
    verification_status: 'blocked',
    notes:
      'CTP OCR/alternative digital reference. 四庫全書本 공개본과 분리하며 공개 API에서는 제외한다.',
  },
];

async function main() {
  const args = parseArgs(process.argv.slice(2));
  loadLocalEnv(projectRoot);
  const supabase = createSupabaseServiceClient();

  const works = await loadWorks(supabase);
  const sources = await loadSources(supabase);
  const rows = HOLD_WORK_VERSIONS.map((item) => toWorkVersionRow({ item, works, sources }));

  console.log(
    `Classic hold metadata seed mode=${args.apply ? 'apply' : 'dry-run'} rows=${rows.length}`
  );
  for (const row of rows) {
    console.log(
      `  ${row.source_work_ref}: release=${row.public_release_status} referenceOnly=${row.is_reference_only} verification=${row.verification_status}`
    );
  }

  if (!args.apply) return;

  const { error } = await supabase
    .from('classic_work_versions')
    .upsert(rows, { onConflict: 'source_id,source_work_ref' });

  if (error) {
    throw new Error(`Could not upsert hold metadata: ${error.message}`);
  }

  console.log('Classic hold metadata applied.');
}

function parseArgs(argv) {
  const args = {
    apply: false,
  };

  for (const arg of argv) {
    if (arg === '--apply') {
      args.apply = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

async function loadWorks(supabase) {
  const { data, error } = await supabase
    .from('classic_works')
    .select('work_id, canonical_slug');

  if (error) {
    throw new Error(`Could not load classic works: ${error.message}`);
  }

  return new Map((data ?? []).map((row) => [row.canonical_slug, row.work_id]));
}

async function loadSources(supabase) {
  const { data, error } = await supabase
    .from('classic_sources')
    .select('source_id, source_code');

  if (error) {
    throw new Error(`Could not load classic sources: ${error.message}`);
  }

  return new Map((data ?? []).map((row) => [row.source_code, row.source_id]));
}

function toWorkVersionRow({ item, works, sources }) {
  const workId = works.get(item.workSlug);
  if (!workId) throw new Error(`Missing classic work for ${item.workSlug}`);

  const sourceId = sources.get(item.sourceCode);
  if (!sourceId) throw new Error(`Missing classic source for ${item.sourceCode}`);

  return {
    work_id: workId,
    source_id: sourceId,
    source_work_ref: item.source_work_ref,
    source_url: item.source_url,
    source_item_title: item.source_item_title,
    edition_name: item.edition_name,
    edition_type: item.edition_type,
    script_type: item.script_type,
    completeness_status: item.completeness_status,
    verification_status: item.verification_status,
    public_release_status: 'hold',
    is_primary_source: false,
    is_reference_only: true,
    source_last_verified_at: '2026-04-21',
    notes: item.notes,
  };
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
