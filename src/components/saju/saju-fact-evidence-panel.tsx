import type { SajuInterpretationGrounding } from '@/domain/saju/report';
import { GroundingDecisionTrace } from '@/components/saju/grounding-decision-trace';
import type { ClassicEvidenceItem } from '@/server/classics/evidence';
import type { KasiSingleInputComparison } from '@/domain/saju/validation/kasi-calendar';

function formatList(items: string[]) {
  return items.length > 0 ? items.join(' · ') : '없음';
}

export function SajuFactEvidencePanel({
  grounding,
  kasiComparison,
  primaryClassicItems = [],
}: {
  grounding: SajuInterpretationGrounding;
  kasiComparison?: KasiSingleInputComparison | null;
  primaryClassicItems?: ClassicEvidenceItem[];
}) {
  const { factJson, evidenceJson } = grounding;
  const yongsinCandidates = evidenceJson.yongsin.candidates.slice(0, 3);
  const hasKasiMatch = kasiComparison ? kasiComparison.issues.length === 0 : null;
  const primaryClassic = primaryClassicItems[0] ?? null;

  return (
    <section className="moon-lunar-panel p-6 sm:p-7">
      <div className="app-starfield" />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="app-caption">실제 계산값으로 읽은 핵심</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--app-ivory)]">
            이 해석은 아래 사실값과 근거를 먼저 계산한 뒤에 문장으로 풀었습니다.
          </h2>
        </div>
        <p className="max-w-2xl text-sm leading-7 text-[var(--app-copy-muted)]">
          오늘 보이는 문장이 막연한 요약이 아니라, 어떤 간지와 강약 점수, 격국 근거, 용신 후보를
          바탕으로 나왔는지 먼저 확인할 수 있습니다.
        </p>
      </div>

      <div className="mt-6">
        <GroundingDecisionTrace
          grounding={grounding}
          kasiComparison={kasiComparison}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="moon-orbit-card p-5">
          <div className="app-caption">fact_json · 명식 사실값</div>
          <div className="mt-3 text-xl font-semibold leading-8 text-[var(--app-ivory)]">
            {factJson.pillars.year.ganzi} · {factJson.pillars.month.ganzi} · {factJson.pillars.day.ganzi}
            {factJson.pillars.hour ? ` · ${factJson.pillars.hour.ganzi}` : ''}
          </div>
          <div className="mt-4 grid gap-2 text-sm leading-7 text-[var(--app-copy)]">
            <div>일간: {factJson.dayMaster.stem} · {factJson.dayMaster.element}</div>
            <div>강한 오행: {factJson.fiveElements.dominant}</div>
            <div>약한 오행: {factJson.fiveElements.weakest}</div>
            <div>
              현재 운: {evidenceJson.luckFlow.currentMajorLuck ?? '미계산'}
              {evidenceJson.luckFlow.saewoon ? ` · 세운 ${evidenceJson.luckFlow.saewoon}` : ''}
              {evidenceJson.luckFlow.wolwoon ? ` · 월운 ${evidenceJson.luckFlow.wolwoon}` : ''}
            </div>
          </div>
        </article>

        <article className="moon-orbit-card p-5">
          <div className="app-caption">evidence_json · 강약 / 격국</div>
          <div className="mt-3 text-xl font-semibold leading-8 text-[var(--app-ivory)]">
            {evidenceJson.strength.level ?? '미계산'} {evidenceJson.strength.score !== null ? `· ${evidenceJson.strength.score}점` : ''}
          </div>
          <div className="mt-4 grid gap-2">
            {evidenceJson.strength.rationale.slice(0, 3).map((line) => (
              <div
                key={`strength-${line}`}
                className="rounded-2xl border border-[var(--app-line)] bg-[rgba(8,10,18,0.32)] px-3 py-2 text-sm leading-7 text-[var(--app-copy)]"
              >
                {line}
              </div>
            ))}
            <div className="rounded-2xl border border-[var(--app-line)] bg-[rgba(8,10,18,0.32)] px-3 py-2 text-sm leading-7 text-[var(--app-copy)]">
              격국: {evidenceJson.pattern.name ?? '미계산'}
              {evidenceJson.pattern.tenGod ? ` · ${evidenceJson.pattern.tenGod}` : ''}
            </div>
          </div>
        </article>

        <article className="moon-orbit-card p-5">
          <div className="app-caption">evidence_json · 용신 후보</div>
          <div className="mt-3 text-xl font-semibold leading-8 text-[var(--app-ivory)]">
            {evidenceJson.yongsin.primary ?? '미계산'}
          </div>
          <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">
            방식: {evidenceJson.yongsin.method ?? '미계산'} · 신뢰도: {evidenceJson.yongsin.confidence ?? '미기재'}
          </p>
          <div className="mt-4 grid gap-3">
            {yongsinCandidates.map((candidate) => (
              <div
                key={`${candidate.method}-${candidate.primary}-${candidate.score}`}
                className="rounded-2xl border border-[var(--app-line)] bg-[rgba(8,10,18,0.32)] px-3 py-3"
              >
                <div className="text-sm font-medium text-[var(--app-ivory)]">
                  {candidate.primary} · {candidate.method} · {candidate.score}점
                </div>
                <div className="mt-2 text-sm leading-7 text-[var(--app-copy)]">{candidate.plainSummary}</div>
              </div>
            ))}
          </div>
        </article>

        <article className="moon-orbit-card p-5">
          <div className="app-caption">근거 카드와 고전 연결</div>
          <div className="mt-3 text-xl font-semibold leading-8 text-[var(--app-ivory)]">
            우선 개념은 {evidenceJson.primaryConcept} 중심으로 잡았습니다.
          </div>
          {primaryClassic ? (
            <div className="mt-4 rounded-2xl border border-[var(--app-gold)]/20 bg-[var(--app-gold)]/8 px-4 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-gold-soft)]">
                연결된 고전 근거
              </div>
              <div className="mt-2 text-sm font-medium text-[var(--app-ivory)]">
                {primaryClassic.work.titleKo} · {primaryClassic.section.path}
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">
                {primaryClassic.passage.commentaryKo ??
                  primaryClassic.passage.literalKo ??
                  `${primaryClassic.work.titleKo}의 ${primaryClassic.section.titleKo} 문단을 현재 ${evidenceJson.primaryConcept} 근거와 연결했습니다.`}
              </p>
            </div>
          ) : null}
          <div className="mt-4 grid gap-2 text-sm leading-7 text-[var(--app-copy)]">
            <div>합충 관계: {formatList(evidenceJson.relations.relations.slice(0, 4))}</div>
            <div>공망: {formatList(evidenceJson.relations.gongmang)}</div>
            <div>신살: {formatList(evidenceJson.relations.specialSals.slice(0, 6))}</div>
            <div>근거 카드: {evidenceJson.classics.cards.length}개</div>
          </div>
        </article>

        <article className="moon-orbit-card p-5 lg:col-span-2">
          <div className="app-caption">역법 대조</div>
          <div className="mt-3 text-xl font-semibold leading-8 text-[var(--app-ivory)]">
            {hasKasiMatch === null
              ? 'KASI 대조 정보가 아직 없습니다.'
              : hasKasiMatch
                ? '한국천문연구원 음양력 기준과 현재 계산이 일치합니다.'
                : 'KASI 대조에서 다시 확인이 필요한 항목이 있습니다.'}
          </div>
          <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">
            {hasKasiMatch === null
              ? '저장된 읽기 결과에는 아직 음양력 대조 정보가 없거나, 현재 환경에서 KASI 대조를 수행하지 않았습니다.'
              : `음력 ${kasiComparison?.local.lunarYear}년 ${kasiComparison?.local.lunarMonth}월 ${kasiComparison?.local.lunarDay}일 · 일진 ${kasiComparison?.local.dayPillar} 기준으로 비교했습니다.`}
          </p>
          {kasiComparison ? (
            <div className="mt-4 grid gap-2 text-sm leading-7 text-[var(--app-copy)]">
              <div>
                KASI 음력일: {kasiComparison.kasi.lunYear}년 {kasiComparison.kasi.lunMonth}월 {kasiComparison.kasi.lunDay}일
                {kasiComparison.kasi.lunLeapmonth === '윤' ? ' (윤달)' : ''}
              </div>
              <div>KASI 일진: {kasiComparison.kasi.lunIljin ?? '미기재'}</div>
              {kasiComparison.issues.length > 0 ? (
                <div className="rounded-2xl border border-[var(--app-coral)]/18 bg-[var(--app-coral)]/8 px-3 py-3 text-[var(--app-copy)]">
                  {kasiComparison.issues.map((issue) => `${issue.field}: KASI ${issue.expected} / 로컬 ${issue.actual}`).join(' · ')}
                </div>
              ) : (
                <div className="rounded-2xl border border-[var(--app-jade)]/18 bg-[var(--app-jade)]/8 px-3 py-3 text-[var(--app-copy)]">
                  음양력 변환과 일진 기준에서 현재 저장본과 KASI 대조값이 일치합니다.
                </div>
              )}
            </div>
          ) : null}
        </article>
      </div>
    </section>
  );
}
