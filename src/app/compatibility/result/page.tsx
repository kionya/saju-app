import Link from 'next/link';
import type { Metadata } from 'next';
import { ActionCluster } from '@/components/layout/action-cluster';
import { SectionHeader } from '@/components/layout/section-header';
import { SectionSurface } from '@/components/layout/section-surface';
import { Badge } from '@/components/ui/badge';
import { COMPATIBILITY_RELATIONSHIPS } from '@/content/moonlight';
import { CompatibilityResultView } from '@/features/compatibility/compatibility-result-view';
import { ManualCompatibilityResultClient } from '@/features/compatibility/manual-compatibility-result-client';
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
  searchParams: Promise<{ relationship?: string; familyId?: string; source?: string }>;
}

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
            title="저장된 정보가 없어도 직접 입력으로 바로 이어갈 수 있습니다"
            titleClassName="text-3xl"
            description="내 정보와 상대 정보를 이 화면에서 함께 입력하면, 저장된 사람을 고르지 않아도 바로 궁합 결과를 열 수 있습니다."
            descriptionClassName="max-w-3xl text-[var(--app-copy)]"
            actions={
              <ActionCluster>
                <Link href={relationshipHref} className="moon-cta-primary">
                  두 사람 정보 입력하기
                </Link>
                <Link
                  href="/my/profile"
                  className="moon-action-muted"
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
    description: '두 사람의 명식을 비교해 관계의 결을 읽는 궁합 결과 화면입니다.',
  };
}

export default async function CompatibilityResultPage({ searchParams }: Props) {
  const { relationship, familyId, source } = await searchParams;

  if (source === 'manual') {
    return <ManualCompatibilityResultClient relationship={relationship} />;
  }

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
        body="궁합을 볼 사람을 아직 고르지 않았습니다. 저장된 사람을 선택하거나, 두 사람 정보를 직접 입력하면 실제 두 명식을 비교해서 읽어드립니다."
      />
    );
  }

  if (!hasCoreBirthProfile(data.profile)) {
    return (
      <SetupState
        relationshipHref={`/compatibility/input?relationship=${selected.slug}`}
        body="내 생년월일이 비어 있어 저장된 사람과의 궁합 계산을 시작할 수 없습니다. 직접 입력으로 바로 보거나 MY 프로필에서 내 정보를 먼저 저장해 주세요."
      />
    );
  }

  if (!hasCoreBirthProfile(selectedFamily)) {
    return (
      <SetupState
        relationshipHref={`/compatibility/input?relationship=${selected.slug}`}
        body={`${selectedFamily.label}님의 생년월일이 아직 완성되지 않았습니다. 직접 입력으로 바로 보거나 저장된 사람 정보에서 생년월일을 먼저 보완해 주세요.`}
      />
    );
  }

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
        <CompatibilityResultView
          selected={selected}
          compatibility={compatibility}
          selfName={displayName}
          partnerName={selectedFamily.label}
          selfBirthSummary={formatBirthSummary(data.profile)}
          partnerBirthSummary={formatBirthSummary(selectedFamily)}
          retakeHref={`/compatibility/input?relationship=${selected.slug}`}
        />
      </AppPage>
    </AppShell>
  );
}
