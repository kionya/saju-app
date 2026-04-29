import Link from 'next/link';
import type { Metadata } from 'next';
import { ActionCluster } from '@/components/layout/action-cluster';
import { FeatureCard } from '@/components/layout/feature-card';
import { ProductGrid } from '@/components/layout/product-grid';
import { SectionHeader } from '@/components/layout/section-header';
import { SectionSurface } from '@/components/layout/section-surface';
import { SupportRail } from '@/components/layout/support-rail';
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
import { AppPage, AppShell, PageHero } from '@/shared/layout/app-shell';

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
      <AppPage className="space-y-6">
        <PageHero
          badges={[
            <Badge
              key="setup"
              className="border-[var(--app-jade)]/25 bg-[var(--app-jade)]/10 text-[var(--app-jade)]"
            >
              궁합 준비
            </Badge>,
          ]}
          title="먼저 두 사람의 정보를 갖춰 주세요"
          description={body}
        />
        <SectionSurface surface="panel" size="lg">
          <SectionHeader
            eyebrow="다음 단계"
            title="준비가 끝나면 바로 결과 화면으로 이어집니다"
            titleClassName="text-3xl"
            description="내 정보와 저장된 사람의 생년월일이 갖춰지면, 두 사람의 결을 비교한 궁합 결과와 프리미엄 확장 흐름을 바로 읽을 수 있습니다."
            descriptionClassName="max-w-3xl text-[var(--app-copy)]"
            actions={
              <ActionCluster>
                <Link
                  href={relationshipHref}
                  className="moon-cta-primary"
                >
                  입력 화면으로 돌아가기
                </Link>
                <Link
                  href="/my/profile"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 text-sm text-[var(--app-ivory)] transition-colors hover:bg-[var(--app-surface-strong)]"
                >
                  MY 프로필 열기
                </Link>
              </ActionCluster>
            }
          />
        </SectionSurface>
      </AppPage>
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
      <AppPage className="space-y-6">
        <PageHero
          badges={[
            <Badge
              key="result"
              className="border-[var(--app-jade)]/25 bg-[var(--app-jade)]/10 text-[var(--app-jade)]"
            >
              궁합 결과
            </Badge>,
            <Badge
              key="relationship"
              className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]"
            >
              {selected.title}
            </Badge>,
          ]}
          title={compatibility.headline}
          description={`${selected.title} 관계를 기준으로 두 사람의 일간, 일지, 오행 보완축을 함께 비교해 읽었습니다.`}
        />

        <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <SectionSurface surface="lunar" size="lg">
            <div className="app-starfield" />
            <SectionHeader
              eyebrow={`${displayName} 선생님 · ${selectedFamily.label}`}
              title={compatibility.label}
              titleClassName="text-3xl text-[var(--app-gold-text)]"
              description={compatibility.dataNote ?? compatibility.summary}
              descriptionClassName="max-w-3xl text-[var(--app-copy)]"
            />

            <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              <FeatureCard
                surface="soft"
                className="text-center"
                eyebrow="내 기준"
                title={compatibility.selfData.dayMaster.stem}
                titleClassName="text-5xl text-[var(--app-coral)]"
                description={
                  <>
                    <span className="block text-[var(--app-copy)]">{displayName} 선생님</span>
                    <span className="mt-2 block text-xs leading-6 text-[var(--app-copy-muted)]">
                      {compatibility.selfData.dayMaster.metaphor ?? '일간 해석 준비 중'}
                    </span>
                  </>
                }
              />
              <div className="text-center text-3xl text-[var(--app-gold-soft)]">↔</div>
              <FeatureCard
                surface="soft"
                className="text-center"
                eyebrow="상대 결"
                title={compatibility.partnerData.dayMaster.stem}
                titleClassName="text-5xl text-[var(--app-jade)]"
                description={
                  <>
                    <span className="block text-[var(--app-copy)]">{selectedFamily.label}</span>
                    <span className="mt-2 block text-xs leading-6 text-[var(--app-copy-muted)]">
                      {compatibility.partnerData.dayMaster.metaphor ?? '일간 해석 준비 중'}
                    </span>
                  </>
                }
              />
            </div>

            <FeatureCard
              className="mt-6"
              surface="soft"
              eyebrow="두 분의 기본 결"
              description={compatibility.summary}
            />

            <ProductGrid columns={2} className="mt-5">
              <FeatureCard
                surface="soft"
                eyebrow="내 정보"
                description={formatBirthSummary(data.profile)}
              />
              <FeatureCard
                surface="soft"
                eyebrow="상대 정보"
                description={formatBirthSummary(selectedFamily)}
              />
            </ProductGrid>
          </SectionSurface>

          <SupportRail
            surface="panel"
            eyebrow="1분 요약"
            title="먼저 같이 맞는 지점과 조심할 지점을 짚어드립니다"
            description="긴 설명보다 먼저 관계의 결이 어디에서 맞고, 어디에서 어긋나기 쉬운지를 빠르게 읽을 수 있게 정리했습니다."
          >
            <FeatureCard
              surface="soft"
              eyebrow="잘 맞는 지점"
              description={compatibility.supportiveSummary}
            />
            <FeatureCard
              className="mt-4"
              surface="soft"
              eyebrow="조심하실 지점"
              description={compatibility.cautionSummary}
            />
            <FeatureCard
              className="mt-4"
              surface="panel"
              eyebrow="지금 관계를 살리는 방식"
              description={compatibility.currentFlowSummary}
            />
          </SupportRail>
        </section>

        <SectionSurface surface="panel" size="lg">
          <SectionHeader
            eyebrow="실전 궁합 포인트"
            title="같이 지낼수록 바로 체감되는 네 가지"
            titleClassName="text-3xl"
            description="단순히 잘 맞는지보다, 어디서 부딪히고 어떻게 풀어야 오래 편한지를 중심으로 정리했습니다."
            descriptionClassName="max-w-3xl text-[var(--app-copy)]"
          />

          <ProductGrid columns={2} className="mt-6">
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
          </ProductGrid>
        </SectionSurface>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <SectionSurface surface="panel" size="lg">
            <SectionHeader
              eyebrow="이 관계를 보는 렌즈"
              title={compatibility.relationshipLensTitle}
              titleClassName="text-3xl"
              description={compatibility.relationshipLensBody}
              descriptionClassName="max-w-3xl text-[var(--app-copy)]"
            />
            <FeatureCard
              className="mt-6"
              surface="soft"
              eyebrow="관계를 다루는 방식"
              description={compatibility.practiceSummary}
            />
          </SectionSurface>

          <SectionSurface surface="panel" size="lg">
            <SectionHeader
              eyebrow="왜 이렇게 읽었나"
              title="이 결과를 만든 근거"
              titleClassName="text-3xl"
              description="두 사람의 일간과 관계 축, 표현 리듬, 오행 보완 흐름을 중심으로 실제 비교 근거를 모았습니다."
              descriptionClassName="max-w-3xl text-[var(--app-copy)]"
            />
            <ProductGrid columns={2} className="mt-6">
              {compatibility.evidence.map((item) => (
                <FeatureCard
                  key={item.title}
                  surface="soft"
                  title={item.title}
                  titleClassName="text-xl"
                  description={item.body}
                />
              ))}
            </ProductGrid>
          </SectionSurface>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
          <SectionSurface surface="panel" size="lg">
            <SectionHeader
              eyebrow="프리미엄에서 더 읽는 내용"
              title="이 관계를 더 길게 읽고 싶다면"
              titleClassName="text-3xl"
              description="기본 궁합 결과 위에, 갈등 구조와 보완점, 관계 전략을 더 길고 차분하게 이어서 볼 수 있도록 준비했습니다."
              descriptionClassName="max-w-3xl text-[var(--app-copy)]"
            />
            <ProductGrid columns={2} className="mt-6">
              {premiumExpansion.preview.map((item) => (
                <FeatureCard
                  key={item.title}
                  surface="soft"
                  title={item.title}
                  titleClassName="text-xl"
                  description={item.body}
                />
              ))}
            </ProductGrid>
          </SectionSurface>

          <SectionSurface
            surface="lunar"
            size="lg"
            className="border-[var(--app-jade)]/28 bg-[linear-gradient(180deg,rgba(107,166,139,0.12),rgba(10,18,36,0.96))]"
          >
            <SectionHeader
              eyebrow="이 관계를 더 깊게 보고 싶다면"
              title={premiumExpansion.ctaTitle}
              titleClassName="text-3xl text-[var(--app-ivory)]"
              description={premiumExpansion.ctaBody}
              descriptionClassName="max-w-3xl text-[var(--app-copy)]"
              actions={
                <ActionCluster>
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
                </ActionCluster>
              }
            />
          </SectionSurface>
        </section>
      </AppPage>
    </AppShell>
  );
}
