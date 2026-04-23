import Link from 'next/link';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import SiteHeader from '@/features/shared-navigation/site-header';
import { Badge } from '@/components/ui/badge';
import { AppPage, AppShell } from '@/shared/layout/app-shell';
import {
  DEFAULT_CLASSICS_AUDIT_CONCEPT,
  getClassicsVerificationAudit,
  type ClassicEvidenceAuditItem,
  type ClassicGateCheck,
  type ClassicHoldAudit,
  type ClassicWorkAudit,
} from '@/server/verification/classics-audit';
import { getSajuVerificationAudit, type SajuVerificationCheck } from '@/server/verification/saju-audit';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface VerificationPageProps {
  searchParams: Promise<{
    concept?: string;
    slug?: string;
    topic?: string;
  }>;
}

export const metadata: Metadata = {
  title: '검증 대시보드',
  description: '고전 원문 적재와 사주 계산 근거를 확인하는 내부 검증 화면입니다.',
  robots: {
    index: false,
    follow: false,
  },
};

function statusTone(ok: boolean) {
  return ok
    ? 'border-emerald-300/30 bg-emerald-400/10 text-emerald-100'
    : 'border-amber-300/35 bg-amber-400/10 text-amber-100';
}

function StatusBadge({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <Badge className={cn('border px-3 py-1', statusTone(ok))}>
      {children}
    </Badge>
  );
}

function JsonLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-2 text-sm text-[var(--app-copy)] transition-colors hover:border-[var(--app-gold)]/35 hover:text-[var(--app-ivory)]"
    >
      JSON API
    </Link>
  );
}

function formatMaybeDate(value: string | null | undefined) {
  if (!value) return '없음';
  return value.slice(0, 19).replace('T', ' ');
}

function ClassicWorkRows({ works }: { works: ClassicWorkAudit[] }) {
  if (works.length === 0) {
    return <p className="app-body-copy mt-4 text-sm">live 대상 고전 상태를 불러오지 못했습니다.</p>;
  }

  return (
    <div className="mt-5 overflow-x-auto">
      <table className="min-w-[920px] text-left text-sm">
        <thead className="text-xs uppercase tracking-[0.18em] text-[var(--app-copy-soft)]">
          <tr>
            <th className="py-3 pr-4">작품</th>
            <th className="py-3 pr-4">상태</th>
            <th className="py-3 pr-4">본문</th>
            <th className="py-3 pr-4">태그</th>
            <th className="py-3 pr-4">풀이</th>
            <th className="py-3 pr-4">누락</th>
            <th className="py-3 pr-4">출처</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--app-line)]">
          {works.map((work) => (
            <tr key={work.sourceWorkRef} className="align-top">
              <td className="py-4 pr-4">
                <div className="font-semibold text-[var(--app-ivory)]">{work.title ?? work.sourceWorkRef}</div>
                <div className="mt-1 break-all text-xs text-[var(--app-copy-soft)]">{work.sourceWorkRef}</div>
              </td>
              <td className="py-4 pr-4">
                <StatusBadge ok={work.ok}>{work.ok ? 'OK' : work.reason}</StatusBadge>
                <div className="mt-2 text-xs text-[var(--app-copy-soft)]">
                  {work.release} · {work.verification} · {work.completeness}
                </div>
              </td>
              <td className="py-4 pr-4 text-[var(--app-copy)]">
                {work.sectionCount.toLocaleString()} sections / {work.passageCount.toLocaleString()} passages
              </td>
              <td className="py-4 pr-4 text-[var(--app-copy)]">{work.conceptTagCount.toLocaleString()}</td>
              <td className="py-4 pr-4 text-[var(--app-copy)]">{work.uiSummaryCount.toLocaleString()}</td>
              <td className="py-4 pr-4">
                <StatusBadge ok={work.requiredFieldMissingCount === 0}>
                  {work.requiredFieldMissingCount.toLocaleString()}
                </StatusBadge>
              </td>
              <td className="py-4 pr-4">
                {work.sourceUrl ? (
                  <Link
                    href={work.sourceUrl}
                    className="break-all text-[var(--app-gold-text)] underline-offset-4 hover:underline"
                  >
                    {work.sourceName ?? work.sourceUrl}
                  </Link>
                ) : (
                  <span className="text-[var(--app-copy-soft)]">없음</span>
                )}
                <div className="mt-1 text-xs text-[var(--app-copy-soft)]">{work.license ?? 'license 없음'}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GateChecks({ checks }: { checks: ClassicGateCheck[] }) {
  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {checks.map((check) => (
        <div key={check.key} className="rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-4">
          <StatusBadge ok={check.ok}>{check.ok ? '통과' : '확인 필요'}</StatusBadge>
          <div className="mt-3 font-semibold text-[var(--app-ivory)]">{check.label}</div>
          <p className="mt-2 text-sm text-[var(--app-copy-muted)]">{check.detail}</p>
        </div>
      ))}
    </div>
  );
}

function EvidenceSample({ item }: { item: ClassicEvidenceAuditItem }) {
  return (
    <article className="rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-5">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge ok={item.hasRequestedConceptTag}>태그 {item.hasRequestedConceptTag ? '일치' : '불일치'}</StatusBadge>
        <Badge className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]">
          rank {item.rankScore}
        </Badge>
      </div>
      <div className="mt-4 text-sm font-semibold text-[var(--app-ivory)]">
        {item.workTitleKo} · {item.sectionPath} · #{item.passageNo}
      </div>
      {item.commentaryKo ? (
        <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">{item.commentaryKo}</p>
      ) : null}
      <details className="group mt-4">
        <summary className="cursor-pointer list-none rounded-xl border border-[var(--app-line)] px-4 py-3 text-sm font-semibold text-[var(--app-copy)]">
          원문 보기
        </summary>
        <blockquote lang="zh-Hant" className="mt-3 break-words text-sm leading-8 text-[var(--app-gold-text)]">
          {item.originalTextZh}
        </blockquote>
      </details>
      <div className="mt-4 grid gap-2 text-xs text-[var(--app-copy-soft)]">
        <div className="break-all">source_ref: {item.sourceRef}</div>
        <div className="break-all">line_ref: {item.sourceLineRef ?? '없음'}</div>
        <div className="break-all">hash: {item.provenanceHash ?? '없음'}</div>
        <div>license: {item.license ?? '없음'}</div>
        <div>
          tags: {item.conceptTags.map((tag) => `${tag.nameKo}/${tag.slug}`).join(', ') || '없음'}
        </div>
      </div>
    </article>
  );
}

function HoldRows({ holds }: { holds: ClassicHoldAudit[] }) {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {holds.map((hold) => (
        <div key={hold.sourceWorkRef} className="rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-4">
          <StatusBadge ok={hold.ok}>{hold.ok ? 'hold' : '확인 필요'}</StatusBadge>
          <div className="mt-3 break-all text-sm font-semibold text-[var(--app-ivory)]">
            {hold.title ?? hold.sourceWorkRef}
          </div>
          <p className="mt-2 break-all text-xs text-[var(--app-copy-soft)]">{hold.sourceWorkRef}</p>
          <p className="mt-2 text-xs text-[var(--app-copy-muted)]">
            {hold.release} · {hold.verification} · referenceOnly={String(hold.referenceOnly)}
          </p>
        </div>
      ))}
    </div>
  );
}

function SajuChecks({ checks }: { checks?: SajuVerificationCheck[] }) {
  if (!checks) return null;

  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {checks.map((check) => (
        <div key={check.key} className="rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-4">
          <StatusBadge ok={check.ok}>{check.ok ? '통과' : '확인 필요'}</StatusBadge>
          <div className="mt-3 font-semibold text-[var(--app-ivory)]">{check.label}</div>
          <p className="mt-2 text-sm leading-6 text-[var(--app-copy-muted)]">{check.detail}</p>
        </div>
      ))}
    </div>
  );
}

export default async function VerificationPage({ searchParams }: VerificationPageProps) {
  const params = await searchParams;
  const concept = params.concept?.trim() || DEFAULT_CLASSICS_AUDIT_CONCEPT;
  const slug = params.slug?.trim() || '1982-1-29-8-male';
  const topic = params.topic?.trim() || 'today';
  const [classicsAudit, sajuAudit] = await Promise.all([
    getClassicsVerificationAudit({ concept, limit: 5 }),
    getSajuVerificationAudit({ slug, topic }),
  ]);
  const classicsApiHref = `/api/verification/classics?concept=${encodeURIComponent(concept)}&limit=5`;
  const sajuApiHref = `/api/verification/saju?slug=${encodeURIComponent(slug)}&topic=${encodeURIComponent(topic)}`;

  return (
    <AppShell header={<SiteHeader />}>
      <AppPage className="space-y-6">
        <section className="app-hero-card p-6 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge ok={classicsAudit.status === 'ready'}>고전 {classicsAudit.status}</StatusBadge>
            <StatusBadge ok={sajuAudit.status === 'ready'}>사주 {sajuAudit.status}</StatusBadge>
            <Badge className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]">
              검색 제외
            </Badge>
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[var(--app-ivory)] sm:text-4xl">
            검증 대시보드
          </h1>
          <p className="app-body-copy mt-4 max-w-3xl">
            원문 DB 적재, evidence API 게이트, 사주 계산 중간값을 한 화면에서 확인합니다. 이 화면은
            “실제 데이터가 들어왔는지”와 “해석 문장이 어떤 계산값에서 나왔는지”를 추적하기 위한 내부 점검용입니다.
          </p>

          <form action="/verification" className="mt-6 grid gap-3 md:grid-cols-[1fr_1.5fr_1fr_auto]">
            <label className="grid gap-2 text-sm text-[var(--app-copy)]">
              고전 개념
              <input
                name="concept"
                defaultValue={concept}
                className="rounded-xl border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-3 text-[var(--app-ivory)] outline-none focus:border-[var(--app-gold)]/45"
              />
            </label>
            <label className="grid gap-2 text-sm text-[var(--app-copy)]">
              사주 slug 또는 reading id
              <input
                name="slug"
                defaultValue={slug}
                className="rounded-xl border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-3 text-[var(--app-ivory)] outline-none focus:border-[var(--app-gold)]/45"
              />
            </label>
            <label className="grid gap-2 text-sm text-[var(--app-copy)]">
              topic
              <select
                name="topic"
                defaultValue={topic}
                className="rounded-xl border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-3 text-[var(--app-ivory)] outline-none focus:border-[var(--app-gold)]/45"
              >
                <option value="today">today</option>
                <option value="love">love</option>
                <option value="wealth">wealth</option>
                <option value="career">career</option>
                <option value="relationship">relationship</option>
              </select>
            </label>
            <button
              type="submit"
              className="self-end rounded-xl border border-[var(--app-gold)]/35 bg-[var(--app-gold)]/14 px-5 py-3 text-sm font-semibold text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/20"
            >
              새로고침
            </button>
          </form>
        </section>

        <section className="app-panel p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="app-caption">고전 원문 DB</div>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--app-ivory)]">
                3종 live 적재와 API 게이트
              </h2>
            </div>
            <JsonLink href={classicsApiHref} />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-4">
              <div className="app-caption">live works</div>
              <div className="mt-2 text-2xl font-semibold text-[var(--app-ivory)]">{classicsAudit.overview.liveWorkCount}/3</div>
            </div>
            <div className="rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-4">
              <div className="app-caption">passages</div>
              <div className="mt-2 text-2xl font-semibold text-[var(--app-ivory)]">
                {classicsAudit.overview.livePassageCount.toLocaleString()}
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-4">
              <div className="app-caption">concept tags</div>
              <div className="mt-2 text-2xl font-semibold text-[var(--app-ivory)]">
                {classicsAudit.overview.liveConceptTagCount.toLocaleString()}
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-4">
              <div className="app-caption">hold refs</div>
              <div className="mt-2 text-2xl font-semibold text-[var(--app-ivory)]">
                {classicsAudit.overview.holdReferenceCount}/{classicsAudit.expectedHoldRefs.length}
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-4">
              <div className="app-caption">latest ingest</div>
              <div className="mt-2 text-sm font-semibold text-[var(--app-ivory)]">
                {formatMaybeDate(classicsAudit.overview.latestIngestRunAt)}
              </div>
            </div>
          </div>
          {classicsAudit.errors.length > 0 ? (
            <div className="mt-5 rounded-2xl border border-amber-300/30 bg-amber-400/10 p-4 text-sm text-amber-100">
              {classicsAudit.errors.join(' ')}
            </div>
          ) : null}
          <ClassicWorkRows works={classicsAudit.works} />
          <GateChecks checks={classicsAudit.gateChecks} />
        </section>

        <section className="app-panel p-6">
          <div className="app-caption">evidence sample</div>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--app-ivory)]">
            “{classicsAudit.concept}” API가 반환한 실제 passage
          </h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {classicsAudit.evidenceSamples.map((item) => (
              <EvidenceSample key={item.passageId} item={item} />
            ))}
          </div>
        </section>

        <section className="app-panel p-6">
          <div className="app-caption">public hold</div>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--app-ivory)]">
            보류 대상이 화면 API에서 빠지는지 확인
          </h2>
          <HoldRows holds={classicsAudit.holds} />
        </section>

        <section className="app-panel p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="app-caption">사주 계산 추적</div>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--app-ivory)]">
                {sajuAudit.status === 'ready' ? `${sajuAudit.calculation.dayMaster.stem} 일간 계산 로그` : '계산 로그 없음'}
              </h2>
            </div>
            <JsonLink href={sajuApiHref} />
          </div>

          {sajuAudit.status === 'ready' ? (
            <>
              <div className="mt-5 grid gap-3 lg:grid-cols-5">
                <div className="rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-4">
                  <div className="app-caption">engine</div>
                  <div className="mt-2 text-sm font-semibold text-[var(--app-ivory)]">
                    {sajuAudit.metadata.source}
                  </div>
                  <p className="mt-1 text-xs text-[var(--app-copy-soft)]">{sajuAudit.metadata.engineVersion}</p>
                </div>
                <div className="rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-4">
                  <div className="app-caption">pillars</div>
                  <div className="mt-2 text-sm font-semibold text-[var(--app-ivory)]">
                    {[
                      sajuAudit.calculation.pillars.year.ganzi,
                      sajuAudit.calculation.pillars.month.ganzi,
                      sajuAudit.calculation.pillars.day.ganzi,
                      sajuAudit.calculation.pillars.hour?.ganzi ?? '시주 없음',
                    ].join(' · ')}
                  </div>
                </div>
                <div className="rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-4">
                  <div className="app-caption">strength</div>
                  <div className="mt-2 text-sm font-semibold text-[var(--app-ivory)]">
                    {sajuAudit.calculation.strength?.level ?? '없음'} · {sajuAudit.calculation.strength?.score ?? '-'}점
                  </div>
                </div>
                <div className="rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-4">
                  <div className="app-caption">location</div>
                  <div className="mt-2 text-sm font-semibold text-[var(--app-ivory)]">
                    {sajuAudit.calculation.birthTimeCorrection
                      ? `${sajuAudit.input.birthLocation?.label ?? '출생지'} ${sajuAudit.calculation.birthTimeCorrection.offsetMinutes}분`
                      : '보정 없음'}
                  </div>
                </div>
                <div className="rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-4">
                  <div className="app-caption">classic concept</div>
                  <div className="mt-2 text-sm font-semibold text-[var(--app-ivory)]">{sajuAudit.conceptForClassics}</div>
                </div>
              </div>
              <SajuChecks checks={sajuAudit.checks} />
              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-4">
                  <div className="app-caption">오행 점수</div>
                  <div className="mt-3 grid gap-2 text-sm text-[var(--app-copy)]">
                    {Object.entries(sajuAudit.calculation.fiveElements.byElement).map(([element, value]) => (
                      <div key={element} className="flex justify-between gap-3">
                        <span>{element}</span>
                        <span>{value.score}점 · {value.percentage}% · {value.state}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-4">
                  <div className="app-caption">격국/용신 근거</div>
                  <div className="mt-3 text-sm leading-7 text-[var(--app-copy)]">
                    <p>{sajuAudit.calculation.pattern?.rationale.join(' ') ?? '격국 근거 없음'}</p>
                    <p className="mt-3">{sajuAudit.calculation.yongsin?.rationale.join(' ') ?? '용신 근거 없음'}</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-4">
                  <div className="app-caption">화면 문장</div>
                  <div className="mt-3 text-sm leading-7 text-[var(--app-copy)]">
                    <p className="font-semibold text-[var(--app-ivory)]">{sajuAudit.report.headline}</p>
                    <p className="mt-3">{sajuAudit.report.summaryHighlights.join(' ')}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="mt-5 rounded-2xl border border-amber-300/30 bg-amber-400/10 p-4 text-sm text-amber-100">
              {sajuAudit.errors.join(' ')}
            </div>
          )}
        </section>
      </AppPage>
    </AppShell>
  );
}
