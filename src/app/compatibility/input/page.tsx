import Link from 'next/link';
import type { Metadata } from 'next';
import { ActionCluster } from '@/components/layout/action-cluster';
import { BulletList } from '@/components/layout/bullet-list';
import { FeatureCard } from '@/components/layout/feature-card';
import { ProductGrid } from '@/components/layout/product-grid';
import { SectionHeader } from '@/components/layout/section-header';
import { SectionSurface } from '@/components/layout/section-surface';
import { SupportRail } from '@/components/layout/support-rail';
import { Badge } from '@/components/ui/badge';
import { COMPATIBILITY_RELATIONSHIPS } from '@/content/moonlight';
import SiteHeader from '@/features/shared-navigation/site-header';
import {
  getCompatibilityDataRequirements,
  inferCompatibilityRelationshipSlug,
  resolveProfileDisplayName,
} from '@/lib/compatibility';
import {
  getProfileSettingsData,
  hasCoreBirthProfile,
  type BirthProfileFields,
  type FamilyProfile,
} from '@/lib/profile';
import { AppPage, AppShell, PageHero } from '@/shared/layout/app-shell';

interface Props {
  searchParams: Promise<{ relationship?: string; familyId?: string }>;
}

const RELATIONSHIP_GUIDE: Record<string, string> = {
  lover: '연인 · 배우자 궁합은 감정의 온도, 표현 속도, 서운함이 쌓이는 순서를 먼저 봅니다.',
  family: '부모 · 자녀 궁합은 정이 있는 만큼 말의 무게와 역할 기대가 어떻게 오가는지를 중요하게 봅니다.',
  friend: '형제 · 친구 궁합은 편안함의 정도, 거리감, 오래 갈 수 있는 연락 리듬을 중심으로 읽습니다.',
  partner: '동업 · 파트너 궁합은 결정 속도, 책임 분담, 재물 감각이 얼마나 맞는지를 먼저 봅니다.',
};

const INPUT_FLOW_POINTS = [
  '먼저 내 정보가 준비돼 있는지 확인하고, 그 다음 저장된 사람 중 한 분을 고릅니다.',
  '관계 렌즈는 연인, 가족, 친구, 동업처럼 질문의 결에 맞게 바뀝니다.',
  '결과 화면에서는 두 사람의 결, 실전 포인트, 프리미엄 확장 순서로 이어집니다.',
] as const;

function formatBirthSummary(profile: BirthProfileFields) {
  if (!hasCoreBirthProfile(profile)) {
    return '생년월일이 아직 비어 있습니다.';
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

function sortProfilesByRelationship(
  profiles: FamilyProfile[],
  selectedRelationship: string
) {
  return [...profiles].sort((left, right) => {
    const leftMatch = inferCompatibilityRelationshipSlug(left.relationship) === selectedRelationship ? 0 : 1;
    const rightMatch = inferCompatibilityRelationshipSlug(right.relationship) === selectedRelationship ? 0 : 1;

    if (leftMatch !== rightMatch) return leftMatch - rightMatch;
    return right.createdAt.localeCompare(left.createdAt);
  });
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '궁합 입력',
    description: '내 정보와 저장된 사람 정보를 바탕으로 궁합을 준비하는 화면입니다.',
  };
}

export default async function CompatibilityInputPage({ searchParams }: Props) {
  const { relationship, familyId } = await searchParams;
  const selected =
    COMPATIBILITY_RELATIONSHIPS.find((item) => item.slug === relationship) ??
    COMPATIBILITY_RELATIONSHIPS[0];
  const redirectPath = `/compatibility/input?relationship=${selected.slug}${familyId ? `&familyId=${familyId}` : ''}`;
  const data = await getProfileSettingsData(redirectPath);
  const displayName = resolveProfileDisplayName(data.profile.displayName, data.user.email);
  const selfReady = hasCoreBirthProfile(data.profile);
  const sortedProfiles = sortProfilesByRelationship(data.familyProfiles, selected.slug);
  const requirements = getCompatibilityDataRequirements();

  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-12">
      <AppPage className="space-y-6">
        <PageHero
          badges={[
            <Badge
              key="input"
              className="border-[var(--app-jade)]/25 bg-[var(--app-jade)]/10 text-[var(--app-jade)]"
            >
              궁합 입력
            </Badge>,
            <Badge
              key="relationship"
              className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]"
            >
              {selected.title}
            </Badge>,
          ]}
          title="내 사람과의 궁합을 준비합니다"
          description="저장된 내 프로필과 가까운 사람의 생년월일을 바탕으로, 실제 두 명식을 비교해 관계의 결을 읽습니다."
        />

        <section className="grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
          <SectionSurface surface="lunar" size="lg" className="app-mobile-safe-section">
            <div className="app-starfield" />
            <SectionHeader
              eyebrow="관계 렌즈"
              title={`${selected.title} 궁합은 이 장면부터 먼저 읽습니다`}
              titleClassName="text-3xl text-[var(--app-gold-text)]"
              description={RELATIONSHIP_GUIDE[selected.slug]}
              descriptionClassName="max-w-3xl text-[var(--app-copy)]"
              actions={
                <ActionCluster>
                  <Link
                    href="/compatibility"
                    className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-gold)]/30 bg-[var(--app-gold)]/12 px-5 text-sm text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/18"
                  >
                    궁합 허브로
                  </Link>
                  <Link
                    href="/my/profile"
                    className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface)] px-5 text-sm text-[var(--app-ivory)] transition-colors hover:bg-[var(--app-surface-strong)]"
                  >
                    저장된 사람 관리
                  </Link>
                </ActionCluster>
              }
            />

            <ProductGrid columns={4} className="mt-5 grid-cols-2 md:grid-cols-2 xl:grid-cols-4">
              {COMPATIBILITY_RELATIONSHIPS.map((item) => (
                <FeatureCard
                  key={item.slug}
                  surface="soft"
                  eyebrow={item.title}
                  badge={
                    item.slug === selected.slug ? (
                      <Badge className="border-[var(--app-gold)]/24 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]">
                        현재 선택
                      </Badge>
                    ) : null
                  }
                  footer={
                    <Link
                      href={`/compatibility/input?relationship=${item.slug}`}
                      className="inline-flex items-center gap-2 text-sm text-[var(--app-gold-text)] underline underline-offset-4 hover:text-[var(--app-ivory)]"
                    >
                      선택하기
                    </Link>
                  }
                />
              ))}
            </ProductGrid>
          </SectionSurface>

          <SupportRail
            surface="panel"
            eyebrow="준비 순서"
            title="궁합은 내 정보와 상대 정보가 함께 준비돼야 읽을 수 있습니다"
            description="허브에서 관계를 고른 뒤, 실제 입력과 결과 화면으로 자연스럽게 이어지도록 준비 순서를 한 화면에 정리했습니다."
          >
            <BulletList items={INPUT_FLOW_POINTS} />
            <FeatureCard
              className="mt-5"
              surface="soft"
              eyebrow="필요한 데이터"
              title="왜 생년월일이 필요한가요?"
              description="일간과 표현 속도, 관계의 보완축을 함께 비교하기 위해 두 사람 모두의 생년월일과 가능한 범위의 출생 시간이 필요합니다."
            />
          </SupportRail>
        </section>

        <SectionSurface surface="panel" size="lg">
          <SectionHeader
            eyebrow="저장된 사람"
            title="이제 실제로 궁합을 볼 사람을 고르세요"
            titleClassName="text-3xl"
            description="관계 렌즈를 고른 뒤에는 저장된 사람을 바로 선택해 결과 화면으로 이어갈 수 있습니다."
            descriptionClassName="max-w-3xl text-[var(--app-copy)]"
          />

          {sortedProfiles.length === 0 ? (
            <FeatureCard
              className="mt-6"
              surface="muted"
              description="아직 저장된 사람이 없습니다. 먼저 가까운 사람 한 분을 저장해 두면 궁합 결과 화면에서 실제 두 명식을 바로 비교할 수 있습니다."
              footer={
                <Link
                  href="/my/profile"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-jade)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:opacity-90"
                >
                  가까운 사람 저장하러 가기
                </Link>
              }
            />
          ) : (
            <ProductGrid columns={2} className="mt-6">
              {sortedProfiles.map((profile) => {
                const ready = hasCoreBirthProfile(profile);
                const matched = inferCompatibilityRelationshipSlug(profile.relationship) === selected.slug;

                return (
                  <FeatureCard
                    key={profile.id}
                    surface="soft"
                    className={matched ? 'border-[var(--app-gold)]/28 bg-[var(--app-gold)]/8' : undefined}
                    eyebrow={profile.relationship}
                    title={profile.label}
                    badge={
                      matched ? (
                        <Badge className="border-[var(--app-gold)]/24 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]">
                          이 렌즈와 잘 맞음
                        </Badge>
                      ) : null
                    }
                    description={formatBirthSummary(profile)}
                    footer={
                      ready && selfReady ? (
                        <Link
                          href={`/compatibility/result?relationship=${selected.slug}&familyId=${profile.id}`}
                          className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-jade)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:opacity-90"
                        >
                          {profile.label}님과 궁합 보기
                        </Link>
                      ) : (
                        <Link
                          href="/my/profile"
                          className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-strong)] px-5 text-sm text-[var(--app-ivory)] transition-colors hover:bg-[var(--app-surface)]"
                        >
                          정보 먼저 보완하기
                        </Link>
                      )
                    }
                  />
                );
              })}
            </ProductGrid>
          )}
        </SectionSurface>

        <section className="grid gap-6 lg:grid-cols-[0.98fr_1.02fr]">
          <SectionSurface surface="panel" size="lg">
            <SectionHeader
              eyebrow="내 정보"
              title="먼저, 내 기준이 되는 프로필이 준비돼 있는지 확인합니다"
              titleClassName="text-3xl"
              description="궁합 결과는 항상 내 정보와 상대 정보를 함께 비교해서 만듭니다. 내 프로필이 비어 있으면 먼저 저장해 주세요."
              descriptionClassName="max-w-3xl text-[var(--app-copy)]"
            />

            <FeatureCard
              className="mt-6"
              surface="soft"
              eyebrow="현재 프로필"
              title={`${displayName} 선생님`}
              description={formatBirthSummary(data.profile)}
            />

            {!selfReady ? (
              <FeatureCard
                className="mt-4 border-[var(--app-coral)]/24 bg-[var(--app-coral)]/8"
                surface="soft"
                eyebrow="먼저 필요한 일"
                description="내 생년월일이 아직 비어 있어 궁합 계산을 시작할 수 없습니다. MY 프로필에서 생년월일을 저장해 주세요."
              />
            ) : null}

            <ActionCluster className="mt-6">
              <Link
                href="/my/profile"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 text-sm text-[var(--app-ivory)] transition-colors hover:bg-[var(--app-surface-strong)]"
              >
                내 정보 수정하기
              </Link>
              <Link
                href="/my/profile"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-jade)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:opacity-90"
              >
                저장된 사람 관리하기
              </Link>
            </ActionCluster>
          </SectionSurface>

          <SectionSurface surface="panel" size="lg">
            <SectionHeader
              eyebrow="궁합에 필요한 데이터"
              title="결과 화면에 들어가기 전에 이 정보들이 준비돼 있으면 좋습니다"
              titleClassName="text-3xl"
              description="궁합은 단순한 찬반 판정보다, 두 사람의 결이 어디에서 맞고 어긋나는지를 읽는 데 집중합니다."
              descriptionClassName="max-w-3xl text-[var(--app-copy)]"
            />

            <ProductGrid columns={2} className="mt-6">
              {requirements.map((item, index) => (
                <FeatureCard
                  key={item}
                  surface="soft"
                  eyebrow={String(index + 1).padStart(2, '0')}
                  description={item}
                />
              ))}
            </ProductGrid>
          </SectionSurface>
        </section>

      </AppPage>
    </AppShell>
  );
}
