import { Badge } from '@/components/ui/badge';
import ProfileManager from '@/components/my/profile-manager';
import {
  FAMILY_PLAN_LIMITS,
} from '@/content/moonlight';
import { getProfileSettingsData } from '@/lib/profile';
import { PageHero } from '@/shared/layout/app-shell';

function formatBirthSummary(profile: {
  birthYear: number | null;
  birthMonth: number | null;
  birthDay: number | null;
  birthHour: number | null;
}) {
  if (!profile.birthYear || !profile.birthMonth || !profile.birthDay) {
    return '생년월일을 아직 입력하지 않았습니다.';
  }

  const hourLabel = profile.birthHour === null ? '시간 미입력' : `${profile.birthHour}시`;
  return `${profile.birthYear}.${profile.birthMonth}.${profile.birthDay} · ${hourLabel}`;
}

export default async function MyProfilePage() {
  const data = await getProfileSettingsData('/my/profile');
  const remainingSlots = Math.max(0, 5 - data.familyProfiles.length);

  return (
    <div className="space-y-6">
      <PageHero
        badges={
          <>
            <Badge className="border-[var(--app-jade)]/25 bg-[var(--app-jade)]/10 text-[var(--app-jade)]">
              가족 사주
            </Badge>
            <Badge className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]">
              가장 가까운 분들의 흐름을 한곳에 저장
            </Badge>
          </>
        }
        title="가족 사주를 저장하고, 언제든 다시 살펴보세요"
        description="가족 저장은 시니어에게 가장 감정적 가치가 큰 기능입니다. 남편, 자녀, 며느리처럼 가까운 분들의 사주를 남겨두고 다시보기와 궁합 흐름으로 이어가실 수 있습니다."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <article className="app-panel p-5">
          <div className="app-caption">등록된 가족 수</div>
          <div className="mt-3 text-3xl font-semibold text-[var(--app-ivory)]">
            {data.familyProfiles.length} / 5
          </div>
          <p className="mt-2 text-sm leading-7 text-[var(--app-copy-muted)]">
            프리미엄 기준으로 최대 다섯 분까지 저장할 수 있습니다.
          </p>
        </article>
        <article className="app-panel p-5">
          <div className="app-caption">내 기본 프로필</div>
          <div className="mt-3 text-xl font-semibold text-[var(--app-ivory)]">
            {data.profile.displayName || '이름 미입력'}
          </div>
          <p className="mt-2 text-sm leading-7 text-[var(--app-copy-muted)]">
            {formatBirthSummary(data.profile)}
          </p>
        </article>
        <article className="app-panel p-5">
          <div className="app-caption">남은 자리</div>
          <div className="mt-3 text-3xl font-semibold text-[var(--app-ivory)]">
            {remainingSlots}
          </div>
          <p className="mt-2 text-sm leading-7 text-[var(--app-copy-muted)]">
            더 저장해두면 이후 궁합과 가족 리포트로 곧바로 이어집니다.
          </p>
        </article>
      </section>

      <section className="app-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="app-caption">저장된 가족</div>
            <h2 className="mt-2 font-[var(--font-heading)] text-3xl text-[var(--app-ivory)]">
              내 가족 사주 보관함
            </h2>
          </div>
          <Badge className="border-[var(--app-jade)]/25 bg-[var(--app-jade)]/10 text-[var(--app-jade)]">
            리텐션 핵심
          </Badge>
        </div>

        <div className="mt-5 space-y-3">
          {data.familyProfiles.length > 0 ? (
            data.familyProfiles.map((profile) => (
              <article
                key={profile.id}
                className="flex flex-col gap-4 rounded-[1.25rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 py-4 sm:flex-row sm:items-center"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--app-gold)]/28 bg-[var(--app-gold)]/10 font-[var(--font-heading)] text-lg text-[var(--app-gold-text)]">
                  {profile.label.slice(0, 1) || '家'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-base font-medium text-[var(--app-ivory)]">
                    {profile.label} · {profile.relationship}
                  </div>
                  <div className="mt-1 text-sm text-[var(--app-copy-muted)]">
                    {formatBirthSummary(profile)}
                  </div>
                </div>
                <Badge className="border-[var(--app-jade)]/25 bg-[var(--app-jade)]/10 text-[var(--app-jade)]">
                  궁합 보기
                </Badge>
              </article>
            ))
          ) : (
            <div className="rounded-[1.25rem] border border-dashed border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 py-6 text-sm leading-7 text-[var(--app-copy-muted)]">
              아직 가족 사주가 없습니다. 가장 가까운 분부터 한 분씩 저장해두면, 나중에 다시
              보기와 궁합 흐름이 훨씬 편해집니다.
            </div>
          )}

          {remainingSlots > 0 ? (
            <div className="rounded-[1.25rem] border-2 border-dashed border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 py-6 text-center">
              <div className="text-2xl text-[var(--app-gold)]/72">+</div>
              <p className="mt-2 text-sm leading-7 text-[var(--app-copy-muted)]">
                가족 한 분 더 추가하기
                <br />
                {remainingSlots}자리가 남아 있습니다.
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="app-panel p-6">
          <div className="app-caption">저장 규칙</div>
          <div className="mt-5 space-y-3">
            {FAMILY_PLAN_LIMITS.map((item) => (
              <div
                key={item}
                className="rounded-[1.1rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-3 text-sm leading-7 text-[var(--app-copy)]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="app-panel p-4 sm:p-6">
          <ProfileManager
            initialProfile={data.profile}
            initialFamilyProfiles={data.familyProfiles}
          />
        </div>
      </section>
    </div>
  );
}
