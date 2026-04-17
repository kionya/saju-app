import { Badge } from '@/components/ui/badge';
import ProfileManager from '@/components/my/profile-manager';
import { getProfileSettingsData } from '@/lib/profile';
import { PageHero } from '@/shared/layout/app-shell';

export default async function MyProfilePage() {
  const data = await getProfileSettingsData('/my/profile');

  return (
    <>
      <PageHero
        badges={
          <>
            <Badge className="border-[var(--app-gold)]/25 bg-[var(--app-gold)]/10 text-[var(--app-gold-soft)]">
              Profile
            </Badge>
            <Badge className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]">
              필요한 만큼만 채우는 점진형 프로필
            </Badge>
          </>
        }
        title="내 프로필과 가족 프로필을 차근차근 관리하세요"
        description="처음부터 모든 정보를 강하게 요구하지 않고, 저장 가치가 생길 때 필요한 정보만 채우는 구조를 유지합니다. 이 화면은 다시보기와 궁합 확장을 위한 기본 프로필 허브입니다."
      />

      <section className="app-panel p-4 sm:p-6">
        <ProfileManager
          initialProfile={data.profile}
          initialFamilyProfiles={data.familyProfiles}
        />
      </section>
    </>
  );
}
