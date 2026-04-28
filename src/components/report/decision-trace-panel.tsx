import { cn } from '@/lib/utils';
import type {
  DecisionTraceConfidence,
  DecisionTraceItem,
  ReportMetadata,
} from '@/lib/saju/report-contract';

export type DecisionTracePanelProps = {
  items?: DecisionTraceItem[];
  metadata?: ReportMetadata | null;
  engineVersion?: string;
  ruleSetVersion?: string;
  timeRule?: string;
  isTimeUnknown?: boolean;
  title?: string;
  description?: string;
  compact?: boolean;
};

const FALLBACK_DECISION_TRACE: DecisionTraceItem[] = [
  {
    step: '01',
    title: '명식 계산 기준',
    rule: '양력/음력 변환과 절기 기준 확인',
    result:
      '현재 화면에 연결된 리포트 기준을 바탕으로, 양력/음력 변환과 절기 기준부터 먼저 정리해 보여드립니다.',
    confidence: 'orthodox',
  },
  {
    step: '02',
    title: '시간 보정 검토',
    rule: '출생지와 시간 규칙에 따른 시각 보정',
    result:
      '출생시각과 출생지 정보가 충분하면 시간 보정을 함께 검토하고, 부족하면 시주 판단을 줄여 보수적으로 읽습니다.',
    confidence: 'input_limited',
  },
  {
    step: '03',
    title: '격국 후보 검토',
    rule: '월령, 투출, 강약 순서로 격국 후보 검토',
    result:
      '격국은 한 가지 이름만 바로 고정하지 않고, 월령과 투출, 강약 순서를 놓고 먼저 후보를 정리합니다.',
    confidence: 'orthodox',
  },
  {
    step: '04',
    title: '용신 판단',
    rule: '격국·강약·계절성을 묶어 용신/희신/기신 판정',
    result:
      '용신은 부족한 오행을 기계적으로 채우는 방식보다, 격국 유지와 계절 균형을 함께 보는 순서로 판단합니다.',
    confidence: 'orthodox',
  },
  {
    step: '05',
    title: '현재 운 연결',
    rule: '대운·세운·월운을 현재 질문과 연결',
    result:
      '현재 질문은 대운, 세운, 월운의 겹침을 함께 보고 연결하며, 한 시점의 감각만으로 단정하지 않습니다.',
    confidence: 'reference',
  },
  {
    step: '06',
    title: '참고 단계 분리',
    rule: '논쟁적 해석은 참고 단계로 낮춰 표시',
    result:
      '학파 차이가 큰 구간이나 보조 해석은 중심 판정과 분리해 두고, 참고 단계로 낮춰 보여드립니다.',
    confidence: 'disputed',
  },
];

const CONFIDENCE_META: Record<
  DecisionTraceConfidence,
  { label: string; className: string }
> = {
  orthodox: {
    label: '정통 기준',
    className:
      'border-[var(--app-gold)]/24 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]',
  },
  disputed: {
    label: '논쟁 기준',
    className:
      'border-[var(--app-coral)]/24 bg-[var(--app-coral)]/10 text-[var(--app-coral)]',
  },
  reference: {
    label: '참고 기준',
    className:
      'border-[var(--app-jade)]/24 bg-[var(--app-jade)]/10 text-[var(--app-jade)]',
  },
  input_limited: {
    label: '입력 제한',
    className:
      'border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] text-[var(--app-copy-soft)]',
  },
};

function buildMetaLine({
  engineVersion,
  ruleSetVersion,
  timeRule,
  isTimeUnknown,
}: Pick<
  DecisionTracePanelProps,
  'engineVersion' | 'ruleSetVersion' | 'timeRule' | 'isTimeUnknown'
>) {
  const parts: string[] = [];

  if (engineVersion) parts.push(`engine ${engineVersion}`);
  if (ruleSetVersion) parts.push(`rules ${ruleSetVersion}`);
  if (timeRule) parts.push(timeRule);
  if (isTimeUnknown) parts.push('출생시각 미입력 기준');

  return parts.length > 0 ? parts.join(' · ') : '현재 리포트 기준으로 표시합니다.';
}

export function DecisionTracePanel({
  items = [],
  metadata,
  engineVersion,
  ruleSetVersion,
  timeRule,
  isTimeUnknown = false,
  title = '판정 근거 보기',
  description = '아래 내용은 달빛선생 엔진이 어떤 순서로 명식과 운의 구조를 검토했는지 요약한 것입니다.',
  compact = false,
}: DecisionTracePanelProps) {
  const resolvedItems =
    items.length > 0
      ? items
      : metadata?.decisionTrace && metadata.decisionTrace.length > 0
        ? metadata.decisionTrace
        : FALLBACK_DECISION_TRACE;
  const resolvedEngineVersion = engineVersion ?? metadata?.engineVersion;
  const resolvedRuleSetVersion = ruleSetVersion ?? metadata?.ruleSetVersion;

  return (
    <details className="rounded-[20px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-4">
      <summary className="cursor-pointer list-none">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-[var(--app-ivory)]">{title}</div>
            <p className="mt-1 text-xs leading-6 text-[var(--app-copy-soft)]">{description}</p>
          </div>
          <span className="rounded-full border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-3 py-1 text-xs text-[var(--app-copy-soft)]">
            펼쳐서 보기
          </span>
        </div>
      </summary>

      <div className={cn('mt-4 grid gap-3', compact ? 'lg:grid-cols-1' : 'lg:grid-cols-2')}>
        {resolvedItems.map((item) => {
          const confidence = CONFIDENCE_META[item.confidence];

          return (
            <article
              key={`${item.step}-${item.title}`}
              className="rounded-[18px] border border-[var(--app-line)] bg-[rgba(7,9,16,0.28)] px-4 py-4"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 font-hanja text-sm text-[var(--app-gold)]/60">{item.step}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm font-semibold text-[var(--app-ivory)]">{item.title}</div>
                    <span className={cn('rounded-full border px-3 py-1 text-xs leading-6', confidence.className)}>
                      {confidence.label}
                    </span>
                  </div>

                  {item.input ? (
                    <div className="mt-3 rounded-[14px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-xs leading-6 text-[var(--app-copy-soft)]">
                      입력 기준 · {item.input}
                    </div>
                  ) : null}

                  {item.rule ? (
                    <div className="mt-2 text-xs leading-6 text-[var(--app-gold-text)]">검토 기준 · {item.rule}</div>
                  ) : null}

                  <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">{item.result}</p>

                  {item.note ? (
                    <p className="mt-2 text-xs leading-6 text-[var(--app-copy-soft)]">{item.note}</p>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-4 rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-4">
        <div className="app-caption text-[var(--app-gold-soft)]">리포트 기준 정보</div>
        <p className="mt-3 text-xs leading-6 text-[var(--app-copy-soft)]">
          {buildMetaLine({
            engineVersion: resolvedEngineVersion,
            ruleSetVersion: resolvedRuleSetVersion,
            timeRule,
            isTimeUnknown,
          })}
        </p>
      </div>
    </details>
  );
}
