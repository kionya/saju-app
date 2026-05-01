import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { ActionCluster } from '@/components/layout/action-cluster';
import SavedReadingsList from '@/components/my/saved-readings-list';
import { FeatureCard } from '@/components/layout/feature-card';
import { SectionHeader } from '@/components/layout/section-header';
import { SectionSurface } from '@/components/layout/section-surface';
import { SupportRail } from '@/components/layout/support-rail';
import { getAccountDashboardData } from '@/lib/account';
import { PageHero } from '@/shared/layout/app-shell';

const RESULTS_PAGE_SIZE = 30;

interface MyResultsPageProps {
  searchParams?: Promise<{
    page?: string;
  }>;
}

function parsePageNumber(value: string | undefined) {
  const parsed = Number.parseInt(value ?? '1', 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function buildResultsPageHref(page: number) {
  return page <= 1 ? '/my/results' : `/my/results?page=${page}`;
}

export default async function MyResultsPage({ searchParams }: MyResultsPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const currentPage = parsePageNumber(params?.page);
  const readingOffset = (currentPage - 1) * RESULTS_PAGE_SIZE;
  const dashboard = await getAccountDashboardData('/my/results', {
    readingLimit: RESULTS_PAGE_SIZE,
    readingOffset,
    transactionLimit: 1,
  });
  const totalPages = Math.max(1, Math.ceil(dashboard.readingCount / RESULTS_PAGE_SIZE));

  if (dashboard.readingCount > 0 && currentPage > totalPages) {
    redirect(buildResultsPageHref(totalPages));
  }

  const firstVisibleIndex = dashboard.readingCount === 0 ? 0 : readingOffset + 1;
  const lastVisibleIndex = readingOffset + dashboard.recentReadings.length;
  const rangeLabel =
    dashboard.readingCount === 0 ? '보관된 결과 없음' : `${firstVisibleIndex}~${lastVisibleIndex}번째`;
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

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
        description="저장된 결과를 다시 보고, 질문 포커스를 바꿔 비교하면서 이어 읽을 수 있게 구성했습니다. 필요 없어진 결과는 보관함에서 삭제할 수 있고, 이미 해금한 상세 해석은 같은 항목으로 다시 코인이 나가지 않도록 처리합니다."
      />

      <section className="grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
        <SectionSurface surface="panel" size="lg">
          <SectionHeader
            eyebrow="저장된 결과"
            title="같은 기준을 다시 펼쳐볼 수 있도록 보관합니다"
            titleClassName="text-3xl"
            description={`전체 ${dashboard.readingCount}개 결과를 다시 열고 비교할 수 있도록 보관합니다. 삭제는 보관함 목록과 개수에 바로 반영됩니다.`}
            descriptionClassName="max-w-3xl text-[var(--app-copy)]"
            actions={
              <ActionCluster>
                <Badge className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]">
                  {dashboard.readingCount === 0 ? '보관함 비어 있음' : `${rangeLabel} 표시 중`}
                </Badge>
                {totalPages > 1 ? (
                  <Badge className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]">
                    {currentPage} / {totalPages} 페이지
                  </Badge>
                ) : null}
              </ActionCluster>
            }
          />
          <div className="mt-6">
            <SavedReadingsList
              readings={dashboard.recentReadings}
              totalCount={dashboard.readingCount}
              visibleStartIndex={firstVisibleIndex || 1}
            />
          </div>
          {totalPages > 1 ? (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--app-line)] pt-5">
              <p className="text-sm text-[var(--app-copy-muted)]">
                오래된 결과까지 다시 볼 수 있도록 30개씩 나눠 보여드립니다.
              </p>
              <div className="flex flex-wrap gap-2">
                {hasPreviousPage ? (
                  <Link
                    href={buildResultsPageHref(currentPage - 1)}
                    className="rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-2 text-sm text-[var(--app-copy)] transition-colors hover:border-[var(--app-gold)]/35 hover:text-[var(--app-ivory)]"
                  >
                    이전 30개
                  </Link>
                ) : null}
                {hasNextPage ? (
                  <Link
                    href={buildResultsPageHref(currentPage + 1)}
                    className="rounded-full border border-[var(--app-gold)]/28 bg-[var(--app-gold)]/10 px-4 py-2 text-sm text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/16"
                  >
                    다음 30개
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}
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
            description="이미 만든 결과는 보관함에서 다시 열 수 있고, 한 번 해금한 상세 항목은 같은 항목으로 중복 차감되지 않도록 처리합니다."
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
