import type { SajuInterpretationGrounding } from '@/domain/saju/report';
import type { KasiSingleInputComparison } from '@/domain/saju/validation/kasi-calendar';

function buildKasiLine(kasiComparison: KasiSingleInputComparison | null | undefined) {
  if (!kasiComparison) {
    return '역법 대조 정보가 아직 함께 저장되지 않았습니다.';
  }

  const lunarDate = `${kasiComparison.kasi.lunYear}.${kasiComparison.kasi.lunMonth}.${kasiComparison.kasi.lunDay}${kasiComparison.kasi.lunLeapmonth === '윤' ? ' 윤달' : ''}`;
  if (kasiComparison.issues.length === 0) {
    return `KASI 대조 기준 음력일 ${lunarDate}, 일진 ${kasiComparison.kasi.lunIljin ?? '미제공'}과 현재 계산이 일치합니다.`;
  }

  const issueSummary = kasiComparison.issues
    .slice(0, 2)
    .map((issue) => issue.field)
    .join(', ');

  return `KASI 대조 기준 음력일 ${lunarDate}, 일진 ${kasiComparison.kasi.lunIljin ?? '미제공'}과 비교했을 때 ${issueSummary} 차이가 감지되었습니다.`;
}

function buildFactLines(grounding: SajuInterpretationGrounding) {
  return [
    `일간 ${grounding.factJson.dayMaster.stem} · ${grounding.factJson.dayMaster.element}`,
    grounding.evidenceJson.strength.level && grounding.evidenceJson.strength.score !== null
      ? `강약 ${grounding.evidenceJson.strength.level} · ${grounding.evidenceJson.strength.score}점`
      : null,
    grounding.evidenceJson.pattern.name
      ? `격국 ${grounding.evidenceJson.pattern.name}${grounding.evidenceJson.pattern.tenGod ? ` · ${grounding.evidenceJson.pattern.tenGod}` : ''}`
      : null,
    grounding.evidenceJson.yongsin.primary
      ? `용신 ${grounding.evidenceJson.yongsin.primary}`
      : null,
    grounding.evidenceJson.luckFlow.currentMajorLuck
      ? `현재 대운 ${grounding.evidenceJson.luckFlow.currentMajorLuck}`
      : grounding.evidenceJson.luckFlow.saewoon
        ? `현재 세운 ${grounding.evidenceJson.luckFlow.saewoon}`
        : null,
  ].filter((line): line is string => Boolean(line));
}

export function GroundingKasiSummary({
  grounding,
  kasiComparison,
  title = '이 리포트가 보는 실제 근거',
}: {
  grounding: SajuInterpretationGrounding;
  kasiComparison?: KasiSingleInputComparison | null;
  title?: string;
}) {
  const factLines = buildFactLines(grounding);
  const evidenceLines = grounding.evidenceJson.classics.cards
    .slice(0, 3)
    .map((card) => `${card.label} · ${card.plainSummary}`);

  return (
    <section className="rounded-[24px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-5 py-5">
      <div className="app-caption text-[var(--app-gold-soft)]">{title}</div>
      <div className="mt-4 flex flex-wrap gap-2">
        {factLines.map((line) => (
          <span
            key={line}
            className="rounded-full border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-3 py-1 text-xs leading-6 text-[var(--app-copy-soft)]"
          >
            {line}
          </span>
        ))}
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {evidenceLines.map((line) => (
          <div
            key={line}
            className="rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-4 text-sm leading-7 text-[var(--app-copy)]"
          >
            {line}
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs leading-6 text-[var(--app-copy-soft)]">{buildKasiLine(kasiComparison)}</p>
    </section>
  );
}
