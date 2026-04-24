import Link from 'next/link';
import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import {
  COMPATIBILITY_PREMIUM_EXPANSION,
  COMPATIBILITY_RELATIONSHIPS,
} from '@/content/moonlight';
import SiteHeader from '@/features/shared-navigation/site-header';
import {
  buildCompatibilityInterpretation,
  inferCompatibilityRelationshipSlug,
  resolveProfileDisplayName,
} from '@/lib/compatibility';
import {
  getProfileSettingsData,
  hasCoreBirthProfile,
  toBirthInputFromProfile,
  type BirthProfileFields,
} from '@/lib/profile';
import { AppShell } from '@/shared/layout/app-shell';

interface Props {
  searchParams: Promise<{ relationship?: string; familyId?: string }>;
}

const PRACTICAL_CARD_STYLES = {
  coral: {
    border: 'border-[var(--app-coral)]/26',
    glow: 'bg-[linear-gradient(180deg,rgba(223,136,115,0.12),rgba(10,18,36,0.96))]',
    label: 'text-[var(--app-coral)]',
  },
  sky: {
    border: 'border-[var(--app-sky)]/26',
    glow: 'bg-[linear-gradient(180deg,rgba(108,162,224,0.12),rgba(10,18,36,0.96))]',
    label: 'text-[var(--app-sky)]',
  },
  gold: {
    border: 'border-[var(--app-gold)]/24',
    glow: 'bg-[linear-gradient(180deg,rgba(210,176,114,0.12),rgba(10,18,36,0.96))]',
    label: 'text-[var(--app-gold-soft)]',
  },
  jade: {
    border: 'border-[var(--app-jade)]/26',
    glow: 'bg-[linear-gradient(180deg,rgba(107,166,139,0.12),rgba(10,18,36,0.96))]',
    label: 'text-[var(--app-jade)]',
  },
} as const;

function formatBirthSummary(profile: BirthProfileFields) {
  if (!hasCoreBirthProfile(profile)) {
    return '생년월일이 아직 완성되지 않았습니다.';
  }

  const timeLabel =
    profile.birthHour === null
      ? '시간 미입력'
      : `${profile.birthHour}시${profile.birthMinute === null ? '' : ` ${String(profile.birthMinute).padStart(2, '0')}분`}`;
  const genderLabel =
    profile.gender === 'male' ? '남성' : profile.gender === 'female' ? '여성' : '성별 미입력';
  const locationLabel = profile.birthLocationLabel
    ? ` · ${profile.birthLocationLabel}${profile.solarTimeMode === 'longitude' ? ' 경도 보정' : ''}`
    : '';

  return `${profile.birthYear}.${profile.birthMonth}.${profile.birthDay} · ${timeLabel} · ${genderLabel}${locationLabel}`;
}

function SetupState({
  relationshipHref,
  body,
}: {
  relationshipHref: string;
  body: string;
}) {
  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-12">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="app-panel p-7 sm:p-8">
          <div className="app-caption">궁합 준비가 더 필요합니다</div>
          <h1 className="mt-4 font-[var(--font-heading)] text-4xl text-[var(--app-ivory)]">
            먼저 두 사람의 정보를 갖춰 주세요
          </h1>
          <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">{body}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={relationshipHref}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-jade)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:opacity-90"
            >
              입력 화면으로 돌아가기
            </Link>
            <Link
              href="/my/profile"
              className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 text-sm text-[var(--app-ivory)] transition-colors hover:bg-[var(--app-surface-strong)]"
            >
              MY 프로필 열기
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '궁합 결과',
    description: '저장된 두 사람의 명식을 비교해 관계의 결을 읽는 궁합 결과 화면입니다.',
  };
}

export default async function CompatibilityResultPage({ searchParams }: Props) {
  const { relationship, familyId } = await searchParams;
  const selectedRelationship = relationship
    ? COMPATIBILITY_RELATIONSHIPS.find((item) => item.slug === relationship)?.slug
    : undefined;
  const redirectPath = `/compatibility/result${relationship || familyId ? `?${new URLSearchParams({ ...(relationship ? { relationship } : {}), ...(familyId ? { familyId } : {}) }).toString()}` : ''}`;
  const data = await getProfileSettingsData(redirectPath);
  const displayName = resolveProfileDisplayName(data.profile.displayName, data.user.email);
  const selectedFamily = data.familyProfiles.find((profile) => profile.id === familyId) ?? null;
  const resolvedRelationship =
    selectedRelationship ??
    (selectedFamily ? inferCompatibilityRelationshipSlug(selectedFamily.relationship) : 'lover');
  const selected =
    COMPATIBILITY_RELATIONSHIPS.find((item) => item.slug === resolvedRelationship) ??
    COMPATIBILITY_RELATIONSHIPS[0];

  if (!selectedFamily) {
    return (
      <SetupState
        relationshipHref={`/compatibility/input?relationship=${selected.slug}`}
        body="궁합을 볼 사람을 아직 고르지 않았습니다. 저장된 사람 중 한 분을 선택하면 실제 두 명식을 비교해서 읽어드립니다."
      />
    );
  }

  if (!hasCoreBirthProfile(data.profile)) {
    return (
      <SetupState
        relationshipHref={`/compatibility/input?relationship=${selected.slug}`}
        body="내 생년월일이 비어 있어 궁합 계산을 시작할 수 없습니다. MY 프로필에서 내 정보를 먼저 저장해 주세요."
      />
    );
  }

  if (!hasCoreBirthProfile(selectedFamily)) {
    return (
      <SetupState
        relationshipHref={`/compatibility/input?relationship=${selected.slug}`}
        body={`${selectedFamily.label}님의 생년월일이 아직 완성되지 않았습니다. 저장된 사람 정보에서 생년월일을 먼저 보완해 주세요.`}
      />
    );
  }

  const premiumExpansion = COMPATIBILITY_PREMIUM_EXPANSION[selected.slug];
  const compatibility = buildCompatibilityInterpretation(
    selected.slug,
    {
      name: displayName,
      birthInput: toBirthInputFromProfile(data.profile),
    },
    {
      name: selectedFamily.label,
      birthInput: toBirthInputFromProfile(selectedFamily),
    }
  );

  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-12">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="moon-lunar-panel p-7 sm:p-8">
          <div className="app-starfield" />
          <div className="relative z-10 text-center">
            <div className="text-sm text-[var(--app-jade)]">
              {displayName} 선생님 & {selectedFamily.label}
            </div>
            <h1 className="mt-4 font-[var(--font-heading)] text-4xl text-[var(--app-ivory)] sm:text-5xl">
              {compatibility.headline}
            </h1>
            <div className="mt-5 inline-flex rounded-full border border-[var(--app-jade)]/35 bg-[var(--app-jade)]/10 px-4 py-2 text-sm text-[var(--app-jade)]">
              {compatibility.label}
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--app-copy-muted)]">
              {selected.title} 관계를 기준으로 두 사람의 일간, 일지, 오행 보완축을 함께 비교해 읽었습니다.
            </p>
            {compatibility.dataNote ? (
              <p className="mt-3 text-xs leading-6 text-[var(--app-copy-soft)]">
                {compatibility.dataNote}
              </p>
            ) : null}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.94fr_1.06fr]">
          <article className="app-panel p-6">
            <div className="app-caption">두 분의 기본 결</div>
            <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              <div className="text-center">
                <div className="font-[var(--font-heading)] text-5xl text-[var(--app-coral)]">
                  {compatibility.selfData.dayMaster.stem}
                </div>
                <div className="mt-2 text-sm text-[var(--app-copy)]">{displayName} 선생님</div>
                <div className="text-xs text-[var(--app-copy-muted)]">
                  {compatibility.selfData.dayMaster.metaphor ?? '일간 해석 준비 중'}
                </div>
              </div>
              <div className="text-center text-3xl text-[var(--app-gold-soft)]">↔</div>
              <div className="text-center">
                <div className="font-[var(--font-heading)] text-5xl text-[var(--app-jade)]">
                  {compatibility.partnerData.dayMaster.stem}
                </div>
                <div className="mt-2 text-sm text-[var(--app-copy)]">{selectedFamily.label}</div>
                <div className="text-xs text-[var(--app-copy-muted)]">
                  {compatibility.partnerData.dayMaster.metaphor ?? '일간 해석 준비 중'}
                </div>
              </div>
            </div>
            <div className="mt-6 rounded-[1.2rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 py-5 text-sm leading-7 text-[var(--app-copy)]">
              {compatibility.summary}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-4">
                <div className="text-xs tracking-[0.18em] text-[var(--app-copy-soft)]">내 정보</div>
                <p className="mt-2 text-sm leading-7 text-[var(--app-copy)]">
                  {formatBirthSummary(data.profile)}
                </p>
              </div>
              <div className="rounded-[1rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-4">
                <div className="text-xs tracking-[0.18em] text-[var(--app-copy-soft)]">상대 정보</div>
                <p className="mt-2 text-sm leading-7 text-[var(--app-copy)]">
                  {formatBirthSummary(selectedFamily)}
                </p>
              </div>
            </div>
          </article>

          <article className="space-y-4">
            <div className="rounded-[1.35rem] border-l-[3px] border-[var(--app-jade)] bg-[var(--app-surface-muted)] px-5 py-5">
              <div className="app-caption">잘 맞는 지점</div>
              <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
                {compatibility.supportiveSummary}
              </p>
            </div>

            <div className="rounded-[1.35rem] border-l-[3px] border-[var(--app-coral)] bg-[var(--app-surface-muted)] px-5 py-5">
              <div className="app-caption">조심하실 지점</div>
              <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
                {compatibility.cautionSummary}
              </p>
            </div>

            <div className="rounded-[1.35rem] border border-[var(--app-gold)]/24 bg-[linear-gradient(135deg,rgba(210,176,114,0.12),rgba(10,18,36,0.92))] px-5 py-5">
              <div className="app-caption">지금 관계를 살리는 방식</div>
              <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
                {compatibility.currentFlowSummary}
              </p>
            </div>
          </article>
        </section>

        <section className="mt-8">
          <div className="px-1">
            <div className="app-caption">실전 궁합 포인트</div>
            <h2 className="mt-3 font-[var(--font-heading)] text-3xl text-[var(--app-ivory)]">
              같이 지낼수록 바로 체감되는 네 가지
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--app-copy-muted)]">
              단순히 잘 맞는지보다, 어디서 부딪히고 어떻게 풀어야 오래 편한지를 중심으로 정리했습니다.
            </p>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {compatibility.practicalCards.map((card) => {
              const styles = PRACTICAL_CARD_STYLES[card.tone];

              return (
                <article
                  key={card.key}
                  className={`h-full rounded-[1.5rem] border p-6 ${styles.border} ${styles.glow}`}
                >
                  <div className={`text-xs tracking-[0.18em] ${styles.label}`}>{card.eyebrow}</div>
                  <h3 className="mt-3 font-[var(--font-heading)] text-2xl text-[var(--app-ivory)]">
                    {card.title}
                  </h3>
                  <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">{card.summary}</p>
                  <div className="mt-5 rounded-[1rem] border border-white/8 bg-[rgba(255,255,255,0.03)] px-4 py-4">
                    <div className="text-xs tracking-[0.18em] text-[var(--app-copy-soft)]">
                      관계를 살리는 방식
                    </div>
                    <p className="mt-2 text-sm leading-7 text-[var(--app-copy)]">{card.practice}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          <article className="app-panel p-6">
            <div className="app-caption">이 관계를 보는 렌즈</div>
            <h2 className="mt-3 font-[var(--font-heading)] text-2xl text-[var(--app-ivory)]">
              {compatibility.relationshipLensTitle}
            </h2>
            <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
              {compatibility.relationshipLensBody}
            </p>
            <p className="mt-4 text-sm leading-8 text-[var(--app-copy-muted)]">
              {compatibility.practiceSummary}
            </p>
          </article>

          <article className="app-panel p-6">
            <div className="app-caption">왜 이렇게 읽었나</div>
            <div className="mt-5 space-y-3">
              {compatibility.evidence.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-4"
                >
                  <div className="text-sm font-semibold text-[var(--app-ivory)]">{item.title}</div>
                  <p className="mt-2 text-sm leading-7 text-[var(--app-copy)]">{item.body}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
          <article className="app-panel p-6">
            <div className="app-caption">프리미엄에서 더 읽는 내용</div>
            <div className="mt-5 space-y-4">
              {premiumExpansion.preview.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.2rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 py-5"
                >
                  <div className="font-[var(--font-heading)] text-2xl text-[var(--app-ivory)]">
                    {item.title}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">{item.body}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[1.75rem] border border-[var(--app-jade)]/28 bg-[linear-gradient(180deg,rgba(107,166,139,0.12),rgba(10,18,36,0.96))] p-6">
            <div className="app-caption">이 관계를 더 깊게 보고 싶다면</div>
            <div className="mt-4 font-[var(--font-heading)] text-3xl text-[var(--app-ivory)]">
              {premiumExpansion.ctaTitle}
            </div>
            <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
              {premiumExpansion.ctaBody}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/membership/checkout?plan=premium"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-jade)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:opacity-90"
              >
                프리미엄으로 이 관계 이어보기
              </Link>
              <Link
                href={`/compatibility/input?relationship=${selected.slug}`}
                className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 text-sm text-[var(--app-ivory)] transition-colors hover:bg-[var(--app-surface-strong)]"
              >
                다른 사람 선택하기
              </Link>
            </div>
          </article>
        </section>
      </div>
    </AppShell>
  );
}
