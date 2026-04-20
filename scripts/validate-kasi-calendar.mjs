import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const Module = require('node:module');
const ts = require('typescript');

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(projectRoot, 'src');
const originalResolveFilename = Module._resolveFilename;

function loadLocalEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex <= 0) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] ??= value;
  }
}

loadLocalEnvFile(path.join(projectRoot, '.env.local'));

Module._resolveFilename = function resolveWithProjectAliases(request, parent, isMain, options) {
  if (request.startsWith('@/')) {
    return originalResolveFilename.call(
      this,
      path.join(sourceRoot, request.slice(2)),
      parent,
      isMain,
      options
    );
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};

require.extensions['.ts'] = function loadTypeScriptModule(module, filename) {
  const source = fs.readFileSync(filename, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filename,
  });

  module._compile(output.outputText, filename);
};

const serviceKey = process.env.KASI_SERVICE_KEY ?? process.env.PUBLIC_DATA_SERVICE_KEY;

if (!serviceKey) {
  console.error('KASI_SERVICE_KEY 또는 PUBLIC_DATA_SERVICE_KEY 환경변수가 필요합니다.');
  process.exit(1);
}

const {
  runKasiCalendarValidation,
} = require('../src/domain/saju/validation/kasi-calendar.ts');

const results = await runKasiCalendarValidation(serviceKey);
let issueCount = 0;

for (const result of results) {
  const status = result.issues.length === 0 ? 'ok' : 'not ok';
  console.log(`${status} - ${result.sample.id}: ${result.sample.label}`);
  console.log(
    `  KASI 음력 ${result.kasi.lunYear}.${String(result.kasi.lunMonth).padStart(2, '0')}.${String(result.kasi.lunDay).padStart(2, '0')} ${result.kasi.lunLeapmonth} / 일진 ${result.kasi.lunIljin ?? '미제공'}`
  );
  console.log(
    `  Local 음력 ${result.local.lunarYear}.${String(result.local.lunarMonth).padStart(2, '0')}.${String(result.local.lunarDay).padStart(2, '0')} ${result.local.lunarLeapMonth ? '윤' : '평'} / 일주 ${result.local.dayPillar}`
  );

  for (const issue of result.issues) {
    issueCount += 1;
    console.log(
      `  - ${issue.field}: KASI=${String(issue.expected)} Local=${String(issue.actual)} (${issue.severity})`
    );
  }
}

if (issueCount > 0) {
  console.error(`\nKASI 대조에서 ${issueCount}개 차이가 발견되었습니다.`);
  process.exit(1);
}

console.log(`\n${results.length}개 KASI 샘플 대조 통과`);
