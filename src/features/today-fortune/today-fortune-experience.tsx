'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { BirthInfoStepper } from '@/components/today-fortune/birth-info-stepper';
import { FollowUpQuestionChips } from '@/components/today-fortune/follow-up-question-chips';
import { HitMemoWidget } from '@/components/today-fortune/hit-memo-widget';
import { OpportunityRiskCards } from '@/components/today-fortune/opportunity-risk-cards';
import { PremiumLockCard } from '@/components/today-fortune/premium-lock-card';
import { SajuReasonSnippet } from '@/components/today-fortune/saju-reason-snippet';
import { TodayConcernSelector } from '@/components/today-fortune/today-concern-selector';
import { TodayFortuneScoreGrid } from '@/components/today-fortune/today-fortune-score-grid';
import { TodayFortuneSummaryCard } from '@/components/today-fortune/today-fortune-summary-card';
import { TodayPremiumPanel } from '@/components/today-fortune/today-premium-panel';
import { usePreferredCounselor } from '@/features/counselor/use-preferred-counselor';
import { trackMoonlightEvent } from '@/lib/analytics';
import type { FortuneFeedbackAccuracyLabel } from '@/lib/fortune-feedback';
import { normalizeConcernId } from '@/lib/today-fortune/concerns';
import {
  getPendingHitMemoSession,
  markHitMemoResponded,
  rememberHitMemoSession,
  type StoredHitMemoSession,
} from '@/lib/today-fortune/hit-memo';
import type {
  ConcernId,
  TodayFortuneBirthPayload,
  TodayFortuneFreeResult,
  TodayFortunePremiumResult,
} from '@/lib/today-fortune/types';

const INITIAL_DRAFT: TodayFortuneBirthPayload = {
  concernId: 'general',
  calendarType: 'solar',
  timeRule: 'standard',
  year: '',
  month: '',
  day: '',
  hour: '',
  minute: '',
  unknownBirthTime: false,
  gender: '',
  birthLocationCode: '',
  birthLocationLabel: '',
  birthLatitude: '',
  birthLongitude: '',
};

const RELATED_LINKS: Record<ConcernId, Array<{ label: string; href: string; body: string }>> = {
  love_contact: [
    { label: '궁합으로 이어보기', href: '/compatibility', body: '상대와의 거리감과 템포를 더 넓게 봅니다.' },
    { label: '대화로 더 묻기', href: '/dialogue', body: '왜 오늘 연락을 조심해야 하는지 바로 이어서 물을 수 있습니다.' },
  ],
  money_spend: [
    { label: '상세 사주 보기', href: '/saju/new', body: '재물 감각과 지출 패턴을 원국 중심으로 더 깊게 봅니다.' },
    { label: '대화로 더 묻기', href: '/dialogue', body: '오늘 돈이 새는 행동을 한 번 더 좁혀 물을 수 있습니다.' },
  ],
  work_meeting: [
    { label: '상세 사주 보기', href: '/saju/new', body: '직업 방향과 역할의 기준을 더 분명하게 정리합니다.' },
    { label: '대화로 더 묻기', href: '/dialogue', body: '미팅에서 피할 말과 강조할 말을 바로 이어서 물을 수 있습니다.' },
  ],
  relationship_conflict: [
    { label: '궁합으로 이어보기', href: '/compatibility', body: '관계의 온도와 갈등 포인트를 두 사람 기준으로 읽습니다.' },
    { label: '대화로 더 묻기', href: '/dialogue', body: '오해를 줄이는 말의 결을 바로 이어서 물을 수 있습니다.' },
  ],
  energy_health: [
    { label: '상세 사주 보기', href: '/saju/new', body: '생활 리듬과 회복 패턴을 원국 기준으로 더 깊게 읽습니다.' },
    { label: '대화로 더 묻기', href: '/dialogue', body: '무리하면 바로 티 나는 구간을 더 구체적으로 물을 수 있습니다.' },
  ],
  general: [
    { label: '타로로 보완하기', href: '/tarot/daily', body: '지금 마음의 결을 한 장의 카드로 가볍게 더 확인합니다.' },
    { label: '상세 사주 보기', href: '/saju/new', body: '오늘 흐름을 넘어서 내 명식의 큰 바탕까지 이어집니다.' },
  ],
};

interface TodayFortuneApiResponse {
  ok?: boolean;
  result?: TodayFortuneFreeResult;
  error?: string;
}

interface TodayFortuneUnlockResponse {
  ok?: boolean;
  result?: TodayFortunePremiumResult;
  error?: string;
  remaining?: number;
}

export function TodayFortuneExperience({
  initialConcernId,
}: {
  initialConcernId?: string;
}) {
  const { counselorId } = usePreferredCounselor();
  const [expanded, setExpanded] = useState(false);
  const [concernId, setConcernId] = useState<ConcernId>(normalizeConcernId(initialConcernId));
  const [draft, setDraft] = useState<TodayFortuneBirthPayload>({
    ...INITIAL_DRAFT,
    concernId: normalizeConcernId(initialConcernId),
  });
  const [hasTrackedBirthStart, setHasTrackedBirthStart] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [freeResult, setFreeResult] = useState<TodayFortuneFreeResult | null>(null);
  const [premiumResult, setPremiumResult] = useState<TodayFortunePremiumResult | null>(null);
  const [remainingCredits, setRemainingCredits] = useState<number | null>(null);
  const [pendingHitMemo, setPendingHitMemo] = useState<StoredHitMemoSession | null>(null);

  const relatedLinks = useMemo(() => RELATED_LINKS[concernId], [concernId]);

  useEffect(() => {
    if (freeResult) {
      window.localStorage.setItem('moonlight:fortune-session:last', freeResult.sourceSessionId);
      rememberHitMemoSession({
        sourceSessionId: freeResult.sourceSessionId,
        concernId: freeResult.concernId,
        headline: freeResult.oneLine.headline,
        createdAt: new Date().toISOString(),
      });
      setPendingHitMemo(getPendingHitMemoSession());
      trackMoonlightEvent('premium_teaser_viewed', {
        from: 'today-fortune',
        concern: freeResult.concernId,
        sourceSessionId: freeResult.sourceSessionId,
      });
    }
  }, [freeResult]);

  useEffect(() => {
    setPendingHitMemo(getPendingHitMemoSession());
  }, []);

  function updateDraft(patch: Partial<TodayFortuneBirthPayload>) {
    setDraft((current) => ({ ...current, ...patch, concernId }));
  }

  function handleStarted() {
    if (hasTrackedBirthStart) return;
    trackMoonlightEvent('birth_form_started', {
      from: 'today-fortune',
      concern: concernId,
    });
    setHasTrackedBirthStart(true);
  }

  async function handleSubmit() {
    setLoading(true);
    setErrorMessage(null);
    setUnlockError(null);
    setPremiumResult(null);

    try {
      const response = await fetch('/api/today-fortune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...draft,
          concernId,
          counselorId,
        }),
      });
      const data = (await response.json().catch(() => null)) as TodayFortuneApiResponse | null;

      if (!response.ok || !data?.ok || !data.result) {
        setErrorMessage(data?.error ?? '무료 결과를 만드는 중 오류가 있었습니다.');
        return;
      }

      setFreeResult(data.result);
      trackMoonlightEvent('birth_form_completed', {
        from: 'today-fortune',
        concern: concernId,
      });
      trackMoonlightEvent('today_free_result_viewed', {
        from: 'today-fortune',
        concern: data.result.concernId,
        sourceSessionId: data.result.sourceSessionId,
      });
    } catch {
      setErrorMessage('무료 결과를 만드는 중 네트워크 오류가 있었습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUnlock() {
    if (!freeResult) return;

    setUnlocking(true);
    setUnlockError(null);

    try {
      const response = await fetch('/api/today-fortune/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceSessionId: freeResult.sourceSessionId,
          concernId: freeResult.concernId,
          counselorId,
        }),
      });
      const data = (await response.json().catch(() => null)) as TodayFortuneUnlockResponse | null;

      if (response.status === 401) {
        window.location.href = `/login?next=${encodeURIComponent(`/today-fortune?concern=${freeResult.concernId}`)}`;
        return;
      }

      if (!response.ok || !data?.ok || !data.result) {
        setUnlockError(data?.error ?? '심화풀이를 여는 중 오류가 있었습니다.');
        setRemainingCredits(data?.remaining ?? null);
        return;
      }

      setPremiumResult(data.result);
      setRemainingCredits(data.remaining ?? null);
      trackMoonlightEvent('premium_result_viewed', {
        from: 'today-fortune',
        concern: freeResult.concernId,
        sourceSessionId: freeResult.sourceSessionId,
      });
    } catch {
      setUnlockError('심화풀이를 여는 중 네트워크 오류가 있었습니다.');
    } finally {
      setUnlocking(false);
    }
  }

  async function handleHitMemoSubmit(accuracyLabel: FortuneFeedbackAccuracyLabel) {
    if (!pendingHitMemo) return;

    markHitMemoResponded(pendingHitMemo.sourceSessionId, accuracyLabel);
    setPendingHitMemo(null);

    trackMoonlightEvent('feedback_submitted', {
      from: 'today-fortune',
      concern: pendingHitMemo.concernId,
      sourceSessionId: pendingHitMemo.sourceSessionId,
      accuracyLabel,
    });
    trackMoonlightEvent(
      accuracyLabel === 'correct'
        ? 'hit_memo_response_correct'
        : accuracyLabel === 'partial'
          ? 'hit_memo_response_partial'
          : 'hit_memo_response_miss',
      {
        from: 'today-fortune',
        concern: pendingHitMemo.concernId,
        sourceSessionId: pendingHitMemo.sourceSessionId,
      }
    );

    await fetch('/api/today-fortune/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceSessionId: pendingHitMemo.sourceSessionId,
        concernId: pendingHitMemo.concernId,
        accuracyLabel,
      }),
    }).catch(() => null);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <section className="moon-lunar-panel p-7 sm:p-8">
        <div className="app-starfield" />
        <div className="relative z-10">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-[var(--app-gold)]/28 bg-[var(--app-gold)]/10 px-3 py-1 text-xs text-[var(--app-gold-text)]">
              오늘 운세 무료 결과
            </span>
            <span className="rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-3 py-1 text-xs text-[var(--app-copy-muted)]">
              오늘 고민 기반 진입
            </span>
          </div>
          <h1 className="mt-5 font-[var(--font-heading)] text-4xl leading-tight text-[var(--app-ivory)] sm:text-5xl">
            오늘, 무엇을 먼저 확인하시겠습니까?
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--app-copy)]">
            연락, 돈, 미팅, 말실수처럼 오늘 가장 걸리는 한 가지를 먼저 고르시면 무료 결과로 짧고 분명하게 보여드리고,
            더 깊은 판단은 1코인 심화풀이로 이어드리겠습니다.
          </p>

          <div className="mt-6">
            <TodayConcernSelector
              value={concernId}
              onChange={(next) => {
                setConcernId(next);
                setDraft((current) => ({ ...current, concernId: next }));
                setFreeResult(null);
                setPremiumResult(null);
                setUnlockError(null);
                trackMoonlightEvent('today_concern_selected', {
                  from: 'today-fortune',
                  concern: next,
                });
              }}
              expanded={expanded}
              onToggleExpanded={() => setExpanded((current) => !current)}
            />
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6">
        {pendingHitMemo ? (
          <HitMemoWidget
            session={pendingHitMemo}
            onSubmit={handleHitMemoSubmit}
          />
        ) : null}

        <BirthInfoStepper
          draft={draft}
          onChange={updateDraft}
          onStarted={handleStarted}
          onSubmit={handleSubmit}
          loading={loading}
          errorMessage={errorMessage}
        />

        {freeResult ? (
          <>
            <TodayFortuneSummaryCard result={freeResult} />
            <TodayFortuneScoreGrid result={freeResult} />
            <OpportunityRiskCards result={freeResult} />
            <SajuReasonSnippet result={freeResult} />

            {premiumResult ? (
              <TodayPremiumPanel result={premiumResult} />
            ) : (
              <PremiumLockCard
                copy={freeResult.nextAction.copy}
                coinCost={freeResult.nextAction.coinCost}
                onUnlock={handleUnlock}
                loading={unlocking}
                sourceSessionId={freeResult.sourceSessionId}
                concernId={freeResult.concernId}
                errorMessage={
                  unlockError ||
                  (remainingCredits !== null ? `현재 잔여 코인 ${remainingCredits}개` : null)
                }
              />
            )}

            <section className="app-panel p-6">
              <FollowUpQuestionChips
                questions={(premiumResult ?? freeResult).followUpQuestions}
                sourceSessionId={freeResult.sourceSessionId}
                concernId={freeResult.concernId}
              />
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              {relatedLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group rounded-[1.45rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--app-gold)]/28"
                >
                  <div className="app-caption">다른 기능으로 이어보기</div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <h3 className="text-xl font-semibold text-[var(--app-ivory)]">{item.label}</h3>
                    <ArrowRight className="h-4 w-4 text-[var(--app-gold)] transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">{item.body}</p>
                </Link>
              ))}
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}
