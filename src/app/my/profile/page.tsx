import SiteHeader from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import ProfileManager from '@/components/my/profile-manager';
import { getProfileSettingsData } from '@/lib/profile';

export default async function MyProfilePage() {
  const data = await getProfileSettingsData('/my/profile');

  return (
    <main className="min-h-screen bg-[#020817] text-white">
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <section className="rounded-[32px] border border-[#d2b072]/18 bg-[radial-gradient(circle_at_top_left,_rgba(210,176,114,0.14),_transparent_30%),linear-gradient(180deg,rgba(7,19,39,0.94),rgba(10,18,36,0.96))] p-7">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-[#d2b072]/30 bg-[#d2b072]/10 text-[#f5dfaa]">
              Profile
            </Badge>
            <Badge className="border-white/10 bg-white/5 text-white/62">
              저장 가치가 느껴지는 시점의 개인화
            </Badge>
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[#f8f1df] sm:text-5xl">
            내 프로필과 가족 프로필 관리
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-white/64">
            초반에는 무입력과 저입력으로 진입하고, 저장 가치가 생긴 뒤에만 프로필을 채우게 하는 것이 더 자연스럽습니다.
            이 화면은 그 다음 단계에서 다시보기와 가족 확장을 돕는 기반 역할을 합니다.
          </p>
        </section>

        <div className="mt-8">
          <ProfileManager
            initialProfile={data.profile}
            initialFamilyProfiles={data.familyProfiles}
          />
        </div>
      </div>
    </main>
  );
}
