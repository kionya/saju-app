import { buildSajuReport, normalizeFocusTopic } from '@/domain/saju/report';
import type { SajuPillar } from '@/domain/saju/engine/saju-data-v1';
import type { FocusTopic, ReportEvidenceKey } from '@/domain/saju/report/types';
import { isReadingId, resolveReading } from '@/lib/saju/readings';

const DEFAULT_AUDIT_SLUG = '1982-1-29-8-male';

export type SajuAuditStatus = 'ready' | 'not-found' | 'error';

export interface SajuVerificationCheck {
  key: string;
  label: string;
  ok: boolean;
  detail: string;
}

function conceptForEvidenceKey(key: ReportEvidenceKey | undefined) {
  switch (key) {
    case 'pattern':
      return '격국';
    case 'strength':
      return '강약';
    case 'relations':
      return '합충';
    case 'gongmang':
      return '공망';
    case 'specialSals':
      return '신살';
    case 'yongsin':
    default:
      return '용신';
  }
}

function chooseClassicConcept(report: ReturnType<typeof buildSajuReport>) {
  const primaryEvidence =
    report.evidenceCards.find((card) => card.key === 'yongsin') ?? report.evidenceCards[0];

  return conceptForEvidenceKey(primaryEvidence?.key);
}

function formatPillar(pillar: SajuPillar) {
  return {
    ganzi: pillar.ganzi,
    stem: pillar.stem,
    branch: pillar.branch,
    stemElement: pillar.stemElement,
    branchElement: pillar.branchElement,
    yinYang: pillar.yinYang,
    stemTenGod: pillar.stemTenGod,
    hiddenStems: pillar.hiddenStems,
  };
}

export async function getSajuVerificationAudit({
  slug = DEFAULT_AUDIT_SLUG,
  topic,
}: {
  slug?: string;
  topic?: string;
} = {}) {
  const generatedAt = new Date().toISOString();
  const normalizedTopic: FocusTopic = normalizeFocusTopic(topic);

  try {
    const reading = await resolveReading(slug);

    if (!reading) {
      return {
        generatedAt,
        status: 'not-found' as const,
        slug,
        topic: normalizedTopic,
        errors: ['사주 결과를 찾지 못했습니다. slug 또는 reading id를 확인하세요.'],
      };
    }

    const data = reading.sajuData;
    const report = buildSajuReport(reading.input, data, normalizedTopic);
    const conceptForClassics = chooseClassicConcept(report);
    const legacyCitations = Array.isArray(
      (report as unknown as Record<string, unknown>).classicalCitations
    )
      ? ((report as unknown as { classicalCitations: Array<{ statusLabel?: string }> })
          .classicalCitations)
      : [];
    const hasLegacyCitationLayer = legacyCitations.length > 0;
    const kasiKeyConfigured = Boolean(process.env.KASI_SERVICE_KEY?.trim());
    const checks: SajuVerificationCheck[] = [
      {
        key: 'pillars-present',
        label: '사주 네 기둥 계산',
        ok: Boolean(data.pillars.year && data.pillars.month && data.pillars.day) &&
          (!data.input.hourKnown || Boolean(data.pillars.hour)),
        detail: data.input.hourKnown
          ? '년주/월주/일주/시주가 모두 계산되어야 합니다.'
          : '시간 미입력 명식이라 시주는 의도적으로 비워둡니다.',
      },
      {
        key: 'strength-rationale',
        label: '강약 점수와 근거',
        ok: Boolean(data.strength?.level && data.strength.rationale.length > 0),
        detail: data.strength
          ? `${data.strength.level} ${data.strength.score}점`
          : '강약 계산값이 없습니다.',
      },
      {
        key: 'pattern-rationale',
        label: '격국 근거',
        ok: Boolean(data.pattern?.name && data.pattern.rationale.length > 0),
        detail: data.pattern?.name ?? '격국 계산값이 없습니다.',
      },
      {
        key: 'yongsin-rationale',
        label: '용신 방식과 근거',
        ok: Boolean(data.yongsin?.primary && data.yongsin.rationale.length > 0),
        detail: data.yongsin
          ? `${data.yongsin.method} · ${data.yongsin.primary.label}`
          : '용신 계산값이 없습니다.',
      },
      {
        key: 'report-grounding',
        label: '화면 문장 근거 카드',
        ok: report.evidenceCards.length > 0,
        detail: `${report.evidenceCards.length}개 근거 카드 생성`,
      },
      {
        key: 'kasi-calendar-key',
        label: 'KASI 절기 검증 키',
        ok: kasiKeyConfigured,
        detail: kasiKeyConfigured
          ? 'KASI_SERVICE_KEY가 설정되어 외부 달력 검증을 실행할 수 있습니다.'
          : 'KASI_SERVICE_KEY가 비어 있어 외부 절기 검증은 아직 못 돌립니다.',
      },
      {
        key: 'legacy-classical-citation-layer',
        label: '구형 고전 요약 레이어',
        ok: !hasLegacyCitationLayer,
        detail: hasLegacyCitationLayer
          ? 'buildSajuReport가 아직 구형 classicalCitations를 생성합니다. 화면/API/AI grounding에서 제거해야 합니다.'
          : '구형 고전 요약 레이어가 제거되었습니다.',
      },
    ];

    return {
      generatedAt,
      status: 'ready' as const,
      slug,
      readingId: reading.id,
      readingSource: isReadingId(slug) ? 'database-reading-id' : 'deterministic-slug',
      topic: normalizedTopic,
      conceptForClassics,
      input: reading.input,
      metadata: data.metadata,
      calculation: {
        pillars: {
          year: formatPillar(data.pillars.year),
          month: formatPillar(data.pillars.month),
          day: formatPillar(data.pillars.day),
          hour: data.pillars.hour ? formatPillar(data.pillars.hour) : null,
        },
        dayMaster: data.dayMaster,
        fiveElements: data.fiveElements,
        tenGods: data.tenGods,
        strength: data.strength,
        pattern: data.pattern,
        yongsin: data.yongsin,
        currentLuck: data.currentLuck,
        majorLuckPreview: data.majorLuck?.slice(0, 3) ?? [],
        orrery: {
          relations: data.extensions?.orrery?.relations ?? [],
          gongmang: data.extensions?.orrery?.gongmang ?? null,
          specialSals: data.extensions?.orrery?.specialSals ?? null,
        },
      },
      report: {
        headline: report.headline,
        summaryHighlights: report.summaryHighlights,
        scores: report.scores,
        evidenceCards: report.evidenceCards.map((card) => ({
          key: card.key,
          label: card.label,
          title: card.title,
          body: card.body,
          details: card.details,
          computed: card.computed,
          source: card.source,
          confidence: card.confidence,
          topicMapping: card.topicMapping,
        })),
        primaryAction: report.primaryAction,
        cautionAction: report.cautionAction,
        classicalCitationAudit: {
          count: legacyCitations.length,
          statusLabels: [...new Set(legacyCitations.map((item) => item.statusLabel).filter(Boolean))],
          warning: hasLegacyCitationLayer
            ? '이 값은 실제 passage DB 인용이 아니라 예전 요약 레이어입니다.'
            : null,
        },
      },
      checks,
      warnings: checks.filter((check) => !check.ok).map((check) => check.detail),
      errors: [],
    };
  } catch (error) {
    return {
      generatedAt,
      status: 'error' as const,
      slug,
      topic: normalizedTopic,
      errors: [error instanceof Error ? error.message : '사주 검증 정보를 만들지 못했습니다.'],
    };
  }
}
