import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ActionCluster } from '@/components/layout/action-cluster';
import { BulletList } from '@/components/layout/bullet-list';
import { FeatureCard } from '@/components/layout/feature-card';
import { ProductGrid } from '@/components/layout/product-grid';
import { SectionHeader } from '@/components/layout/section-header';
import { SectionSurface } from '@/components/layout/section-surface';
import { SupportRail } from '@/components/layout/support-rail';
import SiteHeader from '@/features/shared-navigation/site-header';
import { AppPage, AppShell, PageHero } from '@/shared/layout/app-shell';
import { ENGINE_METHOD_ENTRIES } from '@/lib/engine-method-pages';

export const metadata: Metadata = {
  title: '엔진 읽을거리 | 달빛선생',
  description:
    'AI 사주가 왜 흔들리는지, 진태양시가 무엇인지, 용신 계산이 왜 어려운지 달빛선생 기준으로 풀어낸 읽을거리 모음입니다.',
  alternates: {
    canonical: '/method',
  },
  openGraph: {
    title: '달빛선생 엔진 읽을거리',
    description:
      '엔진 기준서와 함께 읽으면 좋은 AI 사주·진태양시·용신 해설 글을 모았습니다.',
    url: 'https://saju-app-lac.vercel.app/method',
    siteName: '달빛선생',
    locale: 'ko_KR',
    type: 'website',
  },
};

const READING_GUIDE = [
  '같은 생년월일인데 AI마다 결과가 달라 혼란스러웠던 경우',
  '출생지와 분 단위 시간을 왜 묻는지 납득이 잘 안 갔던 경우',
  '긴 리포트보다 먼저 계산 기준과 판정 근거를 확인하고 싶은 경우',
] as const;

const READING_ORDER = [
  'AI 사주가 왜 흔들리는가',
  '진태양시란 무엇인가',
  '용신 계산은 왜 어려운가',
] as const;

export default function MethodIndexPage() {
  return (
    <AppShell header={<SiteHeader />}>
      <AppPage className="space-y-6">
        <PageHero
          badges={[
            <Badge
              key="method-guide"
              className="border-[var(--app-gold)]/24 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]"
            >
              엔진 읽을거리
            </Badge>,
            <Badge key="seo" className="border-white/10 bg-white/5 text-white/70">
              AI 사주 · 진태양시 · 용신 해설
            </Badge>,
          ]}
          title="기준서를 읽고 나면, 다음 질문이 더 선명해집니다"
          description="달빛선생 엔진 기준서를 바탕으로, 실제 사용자들이 가장 많이 궁금해하는 지점을 따로 풀어낸 읽을거리입니다. 왜 AI마다 결과가 다른지, 왜 출생지와 분 단위 시간이 필요한지를 일반 사용자 언어로 정리했습니다."
        />

        <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <SectionSurface surface="panel">
            <SectionHeader
              eyebrow="이런 분께 먼저 권합니다"
              title="읽는 순서를 조금만 잡아도 기준이 훨씬 덜 흔들립니다"
              titleClassName="text-3xl"
              description="먼저 왜 결과가 갈리는지 보고, 그다음 시간과 용신 같은 민감한 축을 읽으면 각 글이 훨씬 덜 따로 놀게 됩니다."
              descriptionClassName="text-[var(--app-copy)]"
            />

            <div className="mt-6 grid gap-6 lg:grid-cols-[0.94fr_1.06fr]">
              <BulletList items={READING_GUIDE} />

              <div className="rounded-[20px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-5 py-5">
                <div className="app-caption mb-3">먼저 읽기 좋은 순서</div>
                <BulletList items={READING_ORDER} />
              </div>
            </div>
          </SectionSurface>

          <SupportRail
            surface="lunar"
            eyebrow="바로 이어보기"
            title="읽은 기준을 실제 결과 화면에서 바로 확인해보세요"
            description="이 글들은 설명의 문을 여는 역할입니다. 실제 결과 화면에서는 같은 기준이 판정 근거, KASI 대조, 메타데이터로 이어집니다."
          >
            <ActionCluster>
              <Link
                href="/about-engine"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-gold)]/35 bg-[var(--app-gold)]/12 px-5 text-sm text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/18"
              >
                엔진 기준서 보기
              </Link>
              <Link
                href="/saju/new"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-gold)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-bright)]"
              >
                사주 시작하기
              </Link>
            </ActionCluster>
          </SupportRail>
        </section>

        <SectionSurface surface="panel">
          <SectionHeader
            eyebrow="엔진 읽을거리 목록"
            title="설명은 길게 흩어놓기보다, 질문 단위로 나누어 읽기 좋게 정리했습니다"
            titleClassName="text-3xl"
            description="각 글은 하나의 질문에만 집중하고, 마지막에는 다음으로 읽기 좋은 주제를 이어서 제안합니다."
            descriptionClassName="text-[var(--app-copy)]"
          />

          <ProductGrid columns={2} className="mt-6">
            {ENGINE_METHOD_ENTRIES.map((entry) => (
              <FeatureCard
                key={entry.slug}
                surface="soft"
                badge={
                  <Badge className="border-white/10 bg-white/5 text-white/62">기준서 연계 글</Badge>
                }
                eyebrow={entry.eyebrow}
                title={entry.title}
                titleClassName="text-3xl"
                description={
                  <>
                    <p>{entry.summary}</p>
                    <div className="mt-4 rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-4 text-sm leading-7 text-[var(--app-copy-soft)]">
                      {entry.question}
                    </div>
                  </>
                }
                footer={
                  <Link
                    href={`/method/${entry.slug}`}
                    className="text-sm text-[var(--app-gold-text)] underline underline-offset-4 hover:text-[var(--app-ivory)]"
                  >
                    상세 읽기
                  </Link>
                }
              />
            ))}
          </ProductGrid>
        </SectionSurface>
      </AppPage>
    </AppShell>
  );
}
