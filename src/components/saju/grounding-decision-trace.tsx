import { buildGroundingDecisionTrace } from '@/domain/saju/report/grounding-decision-trace';
import type { SajuInterpretationGrounding } from '@/domain/saju/report';
import type { KasiSingleInputComparison } from '@/domain/saju/validation/kasi-calendar';
import { DecisionTracePanel } from '@/components/report/decision-trace-panel';
import type { DecisionTraceItem, ReportMetadata } from '@/lib/saju/report-contract';

function formatTimeRuleLabel(grounding: SajuInterpretationGrounding) {
  const mode = grounding.factJson.calendarConversion.solarTimeMode;
  const jasi = grounding.factJson.calendarConversion.jasiMethod;

  if (mode === 'longitude') return '진태양시 기준';
  if (jasi === 'split') return '조자시 기준';
  if (jasi === 'unified') return '야자시 기준';
  return '표준시 기준';
}

function formatBirthInputLine(grounding: SajuInterpretationGrounding) {
  const { birthInput } = grounding.factJson;
  const base = `${birthInput.year}.${String(birthInput.month).padStart(2, '0')}.${String(birthInput.day).padStart(2, '0')}`;

  if (!birthInput.hourKnown || birthInput.hour === null) {
    return `${base} · 태어난 시간 미입력`;
  }

  const minute = birthInput.minute ?? 0;
  return `${base} · ${String(birthInput.hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function GroundingDecisionTrace({
  grounding,
  kasiComparison,
  title = '판정 근거 보기',
  compact = false,
}: {
  grounding: SajuInterpretationGrounding;
  kasiComparison?: KasiSingleInputComparison | null;
  title?: string;
  compact?: boolean;
}) {
  const trace = buildGroundingDecisionTrace(grounding, kasiComparison);
  const items: DecisionTraceItem[] = trace.steps.map((step, index) => {
    const input =
      index === 0
        ? formatBirthInputLine(grounding)
        : index === 1
          ? grounding.factJson.birthInput.birthLocationLabel
            ? `${grounding.factJson.birthInput.birthLocationLabel} · ${formatTimeRuleLabel(grounding)}`
            : formatTimeRuleLabel(grounding)
          : undefined;

    const rule =
      index === 0
        ? '양력/음력 변환과 절기 기준 확인'
        : index === 1
          ? '출생지와 시간 규칙에 따른 시각 보정'
          : index === 2
            ? '월령, 투출, 강약 순서로 격국 후보 검토'
            : index === 3
              ? '격국·강약·계절성을 묶어 용신/희신/기신 판정'
              : index === 4
                ? '대운·세운·월운을 현재 질문과 연결'
                : undefined;

    const result = [step.emphasis, step.body].filter(Boolean).join(' ');
    const note = index === trace.steps.length - 1 ? trace.notes.join(' ') : undefined;

    let confidence: DecisionTraceItem['confidence'] = 'orthodox';
    if (index === 1 && !grounding.factJson.birthInput.hourKnown) {
      confidence = 'input_limited';
    } else if (step.tone === 'caution') {
      confidence = index === 2 || index === 3 ? 'disputed' : 'reference';
    } else if (index === trace.steps.length - 1 && trace.notes.some((line) => line.includes('참고'))) {
      confidence = 'reference';
    }

    return {
      step: String(index + 1).padStart(2, '0'),
      title: step.title,
      input,
      rule,
      result,
      confidence,
      note,
    };
  });

  const metadata: ReportMetadata = {
    engineVersion: grounding.factJson.metadata.engineVersion,
    ruleSetVersion: grounding.factJson.metadata.ruleSetVersion,
    generatedAt: grounding.factJson.metadata.calculatedAt,
    birthInputSnapshot: grounding.factJson.birthInput,
    decisionTrace: items,
  };

  return (
    <DecisionTracePanel
      metadata={metadata}
      timeRule={formatTimeRuleLabel(grounding)}
      isTimeUnknown={!grounding.factJson.birthInput.hourKnown}
      title={title}
      compact={compact}
    />
  );
}
