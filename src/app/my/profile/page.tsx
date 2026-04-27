import { Badge } from '@/components/ui/badge';
import ProfileManager from '@/components/my/profile-manager';
import { FAMILY_PLAN_LIMITS } from '@/content/moonlight';
import { getProfileSettingsData } from '@/lib/profile';
import { PageHero } from '@/shared/layout/app-shell';

function formatBirthSummary(profile: {
  calendarType: 'solar' | 'lunar';
  timeRule: 'standard' | 'trueSolarTime' | 'nightZi' | 'earlyZi';
  birthYear: number | null;
  birthMonth: number | null;
  birthDay: number | null;
  birthHour: number | null;
  birthMinute: number | null;
  birthLocationLabel?: string;
}) {
  if (!profile.birthYear || !profile.birthMonth || !profile.birthDay) {
    return '생년월일을 아직 입력하지 않았습니다.';
  }

  const calendarLabel = profile.calendarType === 'lunar' ? '음력' : '양력';
  const hourLabel =
    profile.birthHour === null
      ? '시간 미입력'
      : `${profile.birthHour}시${
          profile.birthMinute === null
            ? ''
            : ` ${String(profile.birthMinute).padStart(2, '0')}분`
        }`;
  const locationLabel = profile.birthLocationLabel ? ` · ${profile.birthLocationLabel}` : '';
  const timeRuleLabel =
    profile.timeRule === 'trueSolarTime'
      ? ' · 진태양시'
      : profile.timeRule === 'nightZi'
        ? ' · 야자시'
        : profile.timeRule === 'earlyZi'
          ? ' · 조자시'
          : '';

  return `${calendarLabel} ${profile.birthYear}.${profile.birthMonth}.${profile.birthDay} · ${hourLabel}${locationLabel}${timeRuleLabel}`;
}

export default async function MyProfilePage() {
  const data = await getProfileSettingsData('/my/profile');

  return (
    <div className="space-y-6">
      <PageHero
        badges={
          <>
            <Badge className="border-[var(--app-jade)]/25 bg-[var(--app-jade)]/10 text-[var(--app-jade)]">
              가족 사주
            </Badge>
            <Badge className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]">
              오늘운세 · 사주 시작하기 · 궁합 공통 입력
            </Badge>
          </>
        }
        title="내 정보와 가족 정보를 같은 기준으로 보관하세요"
        description="양력·음력, 시간 모름, 출생지, 시각 규칙을 한 번 정리해두면 오늘운세와 사주 시작하기, 궁합 흐름이 같은 기준으로 이어집니다."
      />

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="moon-orbit-card p-5">
          <div className="app-caption">내 기본 프로필</div>
          <div className="mt-3 text-xl font-semibold text-[var(--app-ivory)]">
            {data.profile.displayName || '이름 미입력'}
          </div>
          <p className="mt-2 text-sm leading-7 text-[var(--app-copy-muted)]">
            {formatBirthSummary(data.profile)}
          </p>
        </article>

        <article className="moon-lunar-panel p-5">
          <div className="app-starfield" />
          <div className="app-caption">등록된 가족 수</div>
          <div className="mt-3 font-[var(--font-heading)] text-4xl font-semibold text-[var(--app-ivory)]">
            {data.familyProfiles.length}
          </div>
          <p className="mt-2 text-sm leading-7 text-[var(--app-copy-muted)]">
            가족, 연인, 친구처럼 자주 보는 분을 저장해두면 궁합과 비교 해석으로 바로 이어집니다.
          </p>
        </article>

        <article className="moon-orbit-card p-5">
          <div className="app-caption">저장 기준</div>
          <div className="mt-3 space-y-2 text-sm leading-7 text-[var(--app-copy-muted)]">
            <p>양력·음력 구분</p>
            <p>시간 모름 / 진태양시 / 야자시 / 조자시</p>
            <p>출생지와 위도·경도 보관</p>
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.82fr_1.18fr]">
        <article className="app-panel p-6">
          <div className="app-caption">이 정보로 이어지는 곳</div>
          <h2 className="mt-2 font-[var(--font-heading)] text-2xl text-[var(--app-ivory)]">
            저장해두면 매번 다시 묻지 않습니다
          </h2>
          <div className="mt-5 space-y-3">
            {[
              '오늘운세에서 MY 프로필 불러오기',
              '사주 시작하기에서 같은 출생정보 이어받기',
              '궁합에서 가족/연인 정보를 바로 선택하기',
            ].map((item) => (
              <div
                key={item}
                className="moon-orbit-card px-4 py-3 text-sm leading-7 text-[var(--app-copy)]"
              >
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className="app-panel p-6">
          <div className="app-caption">플랜별 저장 범위</div>
          <div className="mt-5 space-y-3">
            {FAMILY_PLAN_LIMITS.map((item) => (
              <div
                key={item}
                className="moon-orbit-card px-4 py-3 text-sm leading-7 text-[var(--app-copy)]"
              >
                {item}
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-7 text-[var(--app-copy-muted)]">
            가족 프로필은 궁합과 비교 해석에서 쓰는 기준 정보입니다. 생일 형식과 시간 기준을 정확히 남겨둘수록 다시 볼 때 덜 헷갈립니다.
          </p>
        </article>
      </section>

      <ProfileManager
        initialProfile={data.profile}
        initialFamilyProfiles={data.familyProfiles}
      />
    </div>
  );
}
