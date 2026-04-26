import { createServiceClient, hasSupabaseServiceEnv } from '@/lib/supabase/server';
import {
  generateYearlyInterpretation,
  type YearlyCacheKeyType,
  type YearlyGenerationStageResult,
} from '@/server/ai/saju-yearly-service';

const DEFAULT_YEARLY_AUDIT_SLUG = '1982-1-29-8-male';
const DEFAULT_YEARLY_AUDIT_YEAR = 2026;

export type YearlyAuditStatus = 'ready' | 'not-found' | 'error';

export interface YearlyVerificationCheck {
  key: string;
  label: string;
  ok: boolean;
  detail: string;
}

interface YearlyCacheSchemaAudit {
  envReady: boolean;
  tableExists: boolean;
  readingSlugColumn: boolean;
  readingIdNullable: boolean;
  latestMigration: '011-missing' | '011-ready-012-missing' | '011-012-ready' | 'unknown';
  errorMessage: string | null;
}

async function inspectYearlyCacheSchema(): Promise<YearlyCacheSchemaAudit> {
  if (!hasSupabaseServiceEnv) {
    return {
      envReady: false,
      tableExists: false,
      readingSlugColumn: false,
      readingIdNullable: false,
      latestMigration: '011-missing',
      errorMessage: 'SUPABASE_SERVICE_ROLE_KEY가 없어 yearly cache 스키마를 조회할 수 없습니다.',
    };
  }

  try {
    const supabase = await createServiceClient();
    const { data: tableRows, error: tableError } = await supabase
      .schema('information_schema')
      .from('tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'ai_yearly_interpretations');

    if (tableError) {
      return {
        envReady: true,
        tableExists: false,
        readingSlugColumn: false,
        readingIdNullable: false,
        latestMigration: 'unknown',
        errorMessage: tableError.message,
      };
    }

    if (!tableRows || tableRows.length === 0) {
      return {
        envReady: true,
        tableExists: false,
        readingSlugColumn: false,
        readingIdNullable: false,
        latestMigration: '011-missing',
        errorMessage: null,
      };
    }

    const { data: columns, error: columnError } = await supabase
      .schema('information_schema')
      .from('columns')
      .select('column_name, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', 'ai_yearly_interpretations');

    if (columnError) {
      return {
        envReady: true,
        tableExists: true,
        readingSlugColumn: false,
        readingIdNullable: false,
        latestMigration: 'unknown',
        errorMessage: columnError.message,
      };
    }

    const readingSlugColumn = columns?.some((column) => column.column_name === 'reading_slug') ?? false;
    const readingIdNullable =
      columns?.find((column) => column.column_name === 'reading_id')?.is_nullable === 'YES';

    return {
      envReady: true,
      tableExists: true,
      readingSlugColumn,
      readingIdNullable,
      latestMigration: readingSlugColumn && readingIdNullable
        ? '011-012-ready'
        : '011-ready-012-missing',
      errorMessage: null,
    };
  } catch (error) {
    return {
      envReady: true,
      tableExists: false,
      readingSlugColumn: false,
      readingIdNullable: false,
      latestMigration: 'unknown',
      errorMessage: error instanceof Error ? error.message : 'yearly cache schema 조회 실패',
    };
  }
}

function describeCacheKeyType(cacheKeyType: YearlyCacheKeyType) {
  switch (cacheKeyType) {
    case 'reading_id':
      return 'DB reading id 기준으로 캐시를 읽고 씁니다.';
    case 'reading_slug':
      return 'slug 기준 캐시 경로를 사용합니다. migration 012가 반영돼야 서버 캐시가 완전히 작동합니다.';
    default:
      return '현재 요청은 캐시 키를 만들 수 없는 상태입니다.';
  }
}

function summarizeStage(stage: YearlyGenerationStageResult) {
  return `${stage.key} · ${stage.source} · ${stage.durationMs}ms${
    stage.fallbackReason ? ` · ${stage.fallbackReason}` : ''
  }`;
}

export async function getYearlyVerificationAudit({
  slug = DEFAULT_YEARLY_AUDIT_SLUG,
  targetYear = DEFAULT_YEARLY_AUDIT_YEAR,
  counselorId = 'female',
}: {
  slug?: string;
  targetYear?: number;
  counselorId?: 'female' | 'male';
} = {}) {
  const generatedAt = new Date().toISOString();
  const schema = await inspectYearlyCacheSchema();

  try {
    const result = await generateYearlyInterpretation({
      readingIdentifier: slug,
      targetYear,
      counselorId,
      regenerate: false,
    });

    if (!result) {
      return {
        generatedAt,
        status: 'not-found' as const,
        slug,
        targetYear,
        counselorId,
        schema,
        errors: ['연간 리포트를 만들 대상 사주 결과를 찾지 못했습니다.'],
      };
    }

    const checks: YearlyVerificationCheck[] = [
      {
        key: 'yearly-api-response',
        label: '연간 리포트 API 응답',
        ok: true,
        detail: `${result.targetYear}년 리포트 응답이 생성되었습니다.`,
      },
      {
        key: 'yearly-openai-source',
        label: 'OpenAI 생성 여부',
        ok: result.source === 'openai',
        detail:
          result.source === 'openai'
            ? '전체 연간 리포트가 OpenAI 단계 생성으로 완료되었습니다.'
            : `현재는 ${result.fallbackReason ?? 'fallback'} 사유로 일부 또는 전체가 fallback입니다.`,
      },
      {
        key: 'yearly-cache-schema',
        label: 'yearly cache 스키마',
        ok: schema.latestMigration === '011-012-ready',
        detail:
          schema.latestMigration === '011-012-ready'
            ? '011, 012 migration까지 반영되어 slug 캐시도 서버에서 사용할 수 있습니다.'
            : schema.latestMigration === '011-ready-012-missing'
              ? '011은 보이지만 012가 없어 slug 기반 서버 캐시는 아직 완전하지 않습니다.'
              : schema.latestMigration === '011-missing'
                ? '011 migration 테이블이 아직 보이지 않습니다.'
                : schema.errorMessage ?? 'yearly cache schema 상태를 확정하지 못했습니다.',
      },
      {
        key: 'yearly-cache-hit',
        label: '캐시 적중',
        ok: result.cached,
        detail: result.cached
          ? `${result.cacheKeyType} 기준으로 캐시를 재사용했습니다.`
          : `${result.cacheKeyType} 기준 재생성 응답입니다.`,
      },
      {
        key: 'yearly-generation-time',
        label: '생성 시간',
        ok: result.cached || result.generationMs <= 45_000,
        detail: result.cached
          ? '캐시 응답이라 생성 시간이 들지 않았습니다.'
          : `${result.generationMs}ms · ${result.stageResults.map(summarizeStage).join(' / ')}`,
      },
    ];

    return {
      generatedAt,
      status: 'ready' as const,
      slug,
      targetYear,
      counselorId: result.counselorId,
      readingId: result.readingId,
      resolvedReadingId: result.resolvedReadingId,
      readingSource: result.readingSource,
      promptVersion: result.promptVersion,
      cache: {
        cached: result.cached,
        cacheable: result.cacheable,
        cacheKeyType: result.cacheKeyType,
        cacheKeyDetail: describeCacheKeyType(result.cacheKeyType),
        updatedAt: result.updatedAt ?? null,
      },
      generation: {
        source: result.source,
        model: result.model,
        fallbackReason: result.fallbackReason,
        errorMessage: result.errorMessage,
        generationMs: result.generationMs,
        stageResults: result.stageResults,
      },
      interpretationSummary: {
        openingPreview: result.interpretation.opening.slice(0, 180),
        keywordCount: result.interpretation.keywords.length,
        monthlyCount: result.interpretation.monthlyFlows.length,
        reportLength: result.reportText.length,
      },
      schema,
      checks,
      warnings: checks.filter((check) => !check.ok).map((check) => check.detail),
      errors: [],
    };
  } catch (error) {
    return {
      generatedAt,
      status: 'error' as const,
      slug,
      targetYear,
      counselorId,
      schema,
      errors: [error instanceof Error ? error.message : '연간 리포트 검증을 만들지 못했습니다.'],
    };
  }
}
