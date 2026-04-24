import Link from 'next/link';
import type { Metadata } from 'next';
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
import { AppShell } from '@/shared/layout/app-shell';

interface Props {
  searchParams: Promise<{ relationship?: string; familyId?: string }>;
}

const RELATIONSHIP_GUIDE: Record<string, string> = {
  lover: '연인 · 배우자 궁합은 감정의 온도, 표현 속도, 서운함이 쌓이는 순서를 먼저 봅니다.',
  family: '부모 · 자녀 궁합은 정이 있는 만큼 말의 무게와 역할 기대가 어떻게 오가는지를 중요하게 봅니다.',
  friend: '형제 · 친구 궁합은 편안함의 정도, 거리감, 오래 갈 수 있는 연락 리듬을 중심으로 읽습니다.',
  partner: '동업 · 파트너 궁합은 결정 속도, 책임 분담, 재물 감각이 얼마나 맞는지를 먼저 봅니다.',
};

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
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="moon-lunar-panel p-7 sm:p-8">
          <div className="app-starfield" />
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-3">
              <Link
                href="/compatibility"
                className="text-sm text-[var(--app-gold-soft)] transition-colors hover:text-[var(--app-ivory)]"
              >
                ← 뒤로
              </Link>
              <Badge className="border-[var(--app-jade)]/25 bg-[var(--app-jade)]/10 text-[var(--app-jade)]">
                {selected.title}
              </Badge>
            </div>
            <h1 className="mt-5 font-[var(--font-heading)] text-4xl text-[var(--app-ivory)] sm:text-5xl">
              내 사람과의 궁합을 준비합니다
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--app-copy)]">
              이제 궁합은 고정 예시가 아니라, 로그인된 내 프로필과 저장해둔 사람의 생년월일을 바탕으로 실제로 비교해서 읽습니다.
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--app-copy-muted)]">
              {RELATIONSHIP_GUIDE[selected.slug]}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {COMPATIBILITY_RELATIONSHIPS.map((item) => (
                <Link
                  key={item.slug}
                  href={`/compatibility/input?relationship=${item.slug}`}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    item.slug === selected.slug
                      ? 'border-[var(--app-gold)]/34 bg-[var(--app-gold)]/12 text-[var(--app-gold-text)]'
                      : 'border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)] hover:text-[var(--app-ivory)]'
                  }`}
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.94fr_1.06fr]">
          <article className="app-panel p-6">
            <div className="app-caption">내 정보</div>
            <div className="mt-4 rounded-[1.2rem] border border-[var(--app-gold)]/24 bg-[var(--app-gold)]/10 px-4 py-4">
              <div className="font-[var(--font-heading)] text-2xl text-[var(--app-ivory)]">
                {displayName} 선생님
              </div>
              <p className="mt-2 text-sm leading-7 text-[var(--app-copy)]">
                {formatBirthSummary(data.profile)}
              </p>
            </div>

            {!selfReady ? (
              <div className="mt-4 rounded-[1.15rem] border border-[var(--app-coral)]/24 bg-[var(--app-coral)]/8 px-4 py-4 text-sm leading-7 text-[var(--app-copy)]">
                내 생년월일이 아직 비어 있어 궁합 계산을 시작할 수 없습니다. 먼저 MY 프로필에서 생년월일을 저장해 주세요.
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-3">
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
            </div>
          </article>

          <article className="app-panel p-6">
            <div className="app-caption">궁합에 필요한 데이터</div>
            <div className="mt-5 grid gap-3">
              {requirements.map((item, index) => (
                <div
                  key={item}
                  className="rounded-[1rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-4"
                >
                  <div className="text-xs tracking-[0.18em] text-[var(--app-gold)]/70">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <p className="mt-2 text-sm leading-7 text-[var(--app-copy)]">{item}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-8">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="app-caption">저장된 사람</div>
              <h2 className="mt-2 font-[var(--font-heading)] text-3xl text-[var(--app-ivory)]">
                궁합을 볼 사람을 고르세요
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[var(--app-copy-muted)]">
              가족, 연인, 친구, 동료 프로필을 저장해두면 관계 유형에 맞는 렌즈로 바로 읽을 수 있습니다.
            </p>
          </div>

          {sortedProfiles.length === 0 ? (
            <article className="app-panel p-6">
              <p className="text-sm leading-7 text-[var(--app-copy)]">
                아직 저장된 사람이 없습니다. 먼저 가까운 사람 한 분을 저장해 두면 궁합 결과 화면에서 실제 두 명식을 바로 비교할 수 있습니다.
              </p>
              <Link
                href="/my/profile"
                className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-jade)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:opacity-90"
              >
                가까운 사람 저장하러 가기
              </Link>
            </article>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {sortedProfiles.map((profile) => {
                const ready = hasCoreBirthProfile(profile);
                const matched = inferCompatibilityRelationshipSlug(profile.relationship) === selected.slug;

                return (
                  <article
                    key={profile.id}
                    className={`rounded-[1.35rem] border p-5 ${
                      matched
                        ? 'border-[var(--app-gold)]/28 bg-[var(--app-gold)]/8'
                        : 'border-[var(--app-line)] bg-[var(--app-surface-muted)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-lg font-semibold text-[var(--app-ivory)]">{profile.label}</div>
                        <div className="mt-1 text-xs text-[var(--app-copy-soft)]">{profile.relationship}</div>
                      </div>
                      {matched ? (
                        <Badge className="border-[var(--app-gold)]/24 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]">
                          이 관계 렌즈와 잘 맞음
                        </Badge>
                      ) : null}
                    </div>

                    <p className="mt-4 text-sm leading-7 text-[var(--app-copy)]">
                      {formatBirthSummary(profile)}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-3">
                      {ready && selfReady ? (
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
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
