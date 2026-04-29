import { Badge } from '@/components/ui/badge';
import SavedReadingsList from '@/components/my/saved-readings-list';
import { FeatureCard } from '@/components/layout/feature-card';
import { SectionHeader } from '@/components/layout/section-header';
import { SectionSurface } from '@/components/layout/section-surface';
import { SupportRail } from '@/components/layout/support-rail';
import { getAccountDashboardData } from '@/lib/account';
import { PageHero } from '@/shared/layout/app-shell';

export default async function MyResultsPage() {
  const dashboard = await getAccountDashboardData('/my/results', {
    readingLimit: 30,
    transactionLimit: 1,
  });

  return (
    <div className="space-y-6">
      <PageHero
        badges={[
          <Badge
            key="archive"
            className="border-[var(--app-gold)]/25 bg-[var(--app-gold)]/10 text-[var(--app-gold-soft)]"
          >
            Result Archive
          </Badge>,
          <Badge
            key="saved"
            className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]"
          >
            로그인 후 생성한 결과 자동 보관
          </Badge>,
        ]}
        title="결과보관함"
        description="저장된 결과를 다시 보고, 질문 포커스를 바꿔 비교하면서 이어 읽을 수 있게 구성했습니다. 필요 없어진 결과는 보관함에서 삭제할 수 있고, 이미 열었던 상세 해석은 같은 날 같은 결과에 다시 코인이 나가지 않도록 처리합니다."
      />

      <section className="grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
        <SectionSurface surface="panel" size="lg">
          <SectionHeader
            eyebrow="저장된 결과"
            title="같은 기준을 다시 펼쳐볼 수 있도록 보관합니다"
            titleClassName="text-3xl"
            description="보관함은 단순 목록이 아니라, 이미 만든 결과를 비교하고 다시 질문을 이어갈 수 있는 기준서 창고 역할을 합니다."
            descriptionClassName="max-w-3xl text-[var(--app-copy)]"
          />
          <div className="mt-6">
            <SavedReadingsList readings={dashboard.recentReadings} />
          </div>
        </SectionSurface>

        <SupportRail
          surface="lunar"
          eyebrow="보관함 기준"
          title="다시 여는 흐름도 처음과 같은 문법으로 정리합니다"
          description="보관함은 새 결과를 만드는 흐름과 분리되지 않고, 이미 만든 결과를 다시 열고 질문을 바꾸어 비교하는 흐름으로 이어집니다."
        >
          <FeatureCard
            surface="soft"
            eyebrow="다시 보기"
            description="이미 만든 결과는 보관함에서 다시 열 수 있고, 같은 날 같은 결과에 다시 코인이 나가지 않도록 처리합니다."
          />
          <FeatureCard
            className="mt-4"
            surface="soft"
            eyebrow="정리하기"
            description="더 이상 필요 없는 결과는 보관함에서 직접 삭제할 수 있어, 개인 공간이 불필요하게 무거워지지 않도록 관리합니다."
          />
        </SupportRail>
      </section>
    </div>
  );
}
