import { Badge } from '@/components/ui/badge';
import SavedReadingsList from '@/components/my/saved-readings-list';
import { getAccountDashboardData } from '@/lib/account';
import { PageHero } from '@/shared/layout/app-shell';

export default async function MyResultsPage() {
  const dashboard = await getAccountDashboardData('/my/results', {
    readingLimit: 30,
    transactionLimit: 1,
  });

  return (
    <>
      <PageHero
        badges={
          <>
            <Badge className="border-[var(--app-gold)]/25 bg-[var(--app-gold)]/10 text-[var(--app-gold-soft)]">
              Result Archive
            </Badge>
            <Badge className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]">
              로그인 후 생성한 결과 자동 보관
            </Badge>
          </>
        }
        title="결과보관함"
        description="저장된 결과를 다시 보고, 질문 포커스를 바꿔 비교하면서 이어 읽을 수 있게 구성했습니다. 필요 없어진 결과는 보관함에서 삭제할 수 있고, 이미 열었던 분야별 깊이보기는 같은 결과에 다시 코인이 나가지 않도록 처리합니다."
      />

      <section>
        <SavedReadingsList readings={dashboard.recentReadings} />
      </section>
    </>
  );
}
