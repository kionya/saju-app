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
  showDecisionTrace = true,
}: {
  grounding: SajuInterpretationGrounding;
  kasiComparison?: KasiSingleInputComparison | null;
  primaryClassicItems?: ClassicEvidenceItem[];
  showDecisionTrace?: boolean;
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
          <div className="app-caption">내 사주를 읽은 핵심 단서</div>
          <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight text-[var(--app-ivory)]">
            이 풀이는 명식의 중심과 현재 운의 흐름을 함께 보고 정리했습니다.
          </h2>
        </div>
        <p className="max-w-2xl text-sm leading-7 text-[var(--app-copy-muted)]">
          어려운 용어를 외우기보다, 내 기운이 어디에 쏠리고 무엇을 보완하면 좋은지 생활 언어로 확인할 수 있습니다.
        </p>
      </div>

      {showDecisionTrace ? (
        <div className="mt-6">
          <GroundingDecisionTrace
            grounding={grounding}
            kasiComparison={kasiComparison}
          />
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="moon-orbit-card p-5">
          <div className="app-caption">내 명식의 핵심</div>
          <div className="font-hanja mt-3 text-xl font-semibold leading-8 text-[var(--app-ivory)]">
            {factJson.pillars.year.ganzi} · {factJson.pillars.month.ganzi} · {factJson.pillars.day.ganzi}
            {factJson.pillars.hour ? ` · ${factJson.pillars.hour.ganzi}` : ''}
          </div>
          <div className="mt-4 grid gap-2 text-sm leading-7 text-[var(--app-copy)]">
            <div>
              일간: <span className="font-hanja">{factJson.dayMaster.stem}</span> · {factJson.dayMaster.element}
            </div>
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
          <div className="app-caption">기운의 세기와 중심</div>
          <div className="font-display mt-3 text-xl font-semibold leading-8 text-[var(--app-ivory)]">
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
          <div className="app-caption">보완하면 좋은 기운</div>
          <div className="font-hanja mt-3 text-xl font-semibold leading-8 text-[var(--app-ivory)]">
            {evidenceJson.yongsin.primary ?? '미계산'}
          </div>
          <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">
            지금 명식에서 균형을 잡는 데 먼저 참고할 기운입니다.
          </p>
          <div className="mt-4 grid gap-3">
            {yongsinCandidates.map((candidate) => (
              <div
                key={`${candidate.method}-${candidate.primary}-${candidate.score}`}
                className="rounded-2xl border border-[var(--app-line)] bg-[rgba(8,10,18,0.32)] px-3 py-3"
              >
                <div className="font-hanja text-sm font-medium text-[var(--app-ivory)]">
                  {candidate.primary} · {candidate.method} · {candidate.score}점
                </div>
                {candidate.plainSummary ? (
                  <div className="mt-2 text-xs leading-6 text-[var(--app-copy-soft)]">{candidate.plainSummary}</div>
                ) : null}
              </div>
            ))}
          </div>
        </article>

        <article className="moon-orbit-card p-5">
          <div className="app-caption">참고한 전통 기준</div>
          <div className="font-display mt-3 text-xl font-semibold leading-8 text-[var(--app-ivory)]">
            우선 개념은 {evidenceJson.primaryConcept} 중심으로 잡았습니다.
          </div>
          {primaryClassic ? (
            <div className="mt-4 rounded-2xl border border-[var(--app-gold)]/20 bg-[var(--app-gold)]/8 px-4 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-gold-soft)]">
                연결된 고전 참고자료
              </div>
              <div className="mt-2 text-sm font-medium text-[var(--app-ivory)]">
                {primaryClassic.work.titleKo} · {primaryClassic.section.path}
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">
                {primaryClassic.passage.commentaryKo ??
                  primaryClassic.passage.literalKo ??
                  `${primaryClassic.work.titleKo}의 ${primaryClassic.section.titleKo} 문단을 현재 ${evidenceJson.primaryConcept} 단서와 연결했습니다.`}
              </p>
            </div>
          ) : null}
          <div className="mt-4 grid gap-2 text-sm leading-7 text-[var(--app-copy)]">
            <div>합충 관계: {formatList(evidenceJson.relations.relations.slice(0, 4))}</div>
            <div>공망: {formatList(evidenceJson.relations.gongmang)}</div>
            <div>신살: {formatList(evidenceJson.relations.specialSals.slice(0, 6))}</div>
            <div>참고 단서: {evidenceJson.classics.cards.length}개</div>
          </div>
        </article>

        <article className="moon-orbit-card p-5 lg:col-span-2">
          <div className="app-caption">음양력 확인</div>
          <div className="mt-3 text-xl font-semibold leading-8 text-[var(--app-ivory)]">
            {hasKasiMatch === null
              ? '공식 음양력 대조 정보가 아직 없습니다.'
              : hasKasiMatch
                ? '공식 음양력 기준과 현재 계산이 일치합니다.'
                : '공식 음양력 대조에서 다시 확인이 필요한 항목이 있습니다.'}
          </div>
          <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">
            {hasKasiMatch === null
              ? '저장된 결과에는 아직 음양력 대조 정보가 없거나, 현재 환경에서 공식 대조를 수행하지 않았습니다.'
              : `음력 ${kasiComparison?.local.lunarYear}년 ${kasiComparison?.local.lunarMonth}월 ${kasiComparison?.local.lunarDay}일 · 일진 ${kasiComparison?.local.dayPillar} 기준으로 비교했습니다.`}
          </p>
          {kasiComparison ? (
            <div className="mt-4 grid gap-2 text-sm leading-7 text-[var(--app-copy)]">
              <div>
                공식 음력일: {kasiComparison.kasi.lunYear}년 {kasiComparison.kasi.lunMonth}월 {kasiComparison.kasi.lunDay}일
                {kasiComparison.kasi.lunLeapmonth === '윤' ? ' (윤달)' : ''}
              </div>
              <div>공식 일진: {kasiComparison.kasi.lunIljin ?? '미기재'}</div>
              {kasiComparison.issues.length > 0 ? (
                <div className="rounded-2xl border border-[var(--app-coral)]/18 bg-[var(--app-coral)]/8 px-3 py-3 text-[var(--app-copy)]">
                  {kasiComparison.issues.map((issue) => `${issue.field}: 공식 ${issue.expected} / 현재 ${issue.actual}`).join(' · ')}
                </div>
              ) : (
                <div className="rounded-2xl border border-[var(--app-jade)]/18 bg-[var(--app-jade)]/8 px-3 py-3 text-[var(--app-copy)]">
                  음양력 변환과 일진 기준에서 현재 저장본과 공식 대조값이 일치합니다.
                </div>
              )}
            </div>
          ) : null}
        </article>
      </div>
    </section>
  );
}
