import type { Metadata } from 'next';
import Link from 'next/link';
import { ActionCluster } from '@/components/layout/action-cluster';
import { BulletList } from '@/components/layout/bullet-list';
import { FeatureCard } from '@/components/layout/feature-card';
import { ProductGrid } from '@/components/layout/product-grid';
import { SectionHeader } from '@/components/layout/section-header';
import { SectionSurface } from '@/components/layout/section-surface';
import { SupportRail } from '@/components/layout/support-rail';
import { Badge } from '@/components/ui/badge';
import SiteHeader from '@/features/shared-navigation/site-header';
import { getOptionalSignedInProfile } from '@/lib/profile';
import { buildProfileReadingSlug } from '@/lib/profile-personalization';
import { AppPage, AppShell, PageHero } from '@/shared/layout/app-shell';

export const metadata: Metadata = {
  title: '명리',
  description: '일간, 오행, 십신을 내 명식 위에 얹어 반복되는 인생 패턴의 이유를 읽는 명리 기준 화면입니다.',
  alternates: {
    canonical: '/myeongri',
  },
};

const EXPLORATIONS = [
  {
    title: '일주와 기본 기질',
    body: '태어난 날의 기둥을 중심으로 성정과 반응 방식, 삶의 기본 결을 읽습니다.',
    hook: '나는 어떤 결의 사람인가',
    href: '/saju/new',
    badge: '日柱',
  },
  {
    title: '오행의 강약과 균형',
    body: '무엇이 강하고 무엇이 메마른지, 왜 늘 같은 장면에서 힘이 붙거나 꺼지는지 살펴봅니다.',
    hook: '내 안의 다섯 기운은 어디서 흔들리는가',
    href: '/saju/new',
    badge: '五行',
  },
  {
    title: '십신과 관계 패턴',
    body: '돈, 일, 사람, 역할이 반복되는 방식과 삶에 자주 등장하는 장면을 십신으로 풉니다.',
    hook: '왜 늘 비슷한 관계와 역할이 반복되는가',
    href: '/myeongri/ten-gods',
    badge: '十神',
  },
] as const;

const MYEONGRI_RULES = [
  '명리는 점괘보다 구조 해석에 가깝습니다. 먼저 타고난 결을 읽고, 그 위에 관계와 선택을 올립니다.',
  '하나의 개념만 단독으로 보기보다, 일간·오행·십신을 같이 놓고 읽어야 왜 그런 해석이 나오는지 더 분명해집니다.',
  '설명만 읽는 것보다 내 명식 결과와 번갈아 보는 편이 훨씬 빠르게 이해됩니다.',
] as const;

export default async function MyeongriPage() {
  const profile = await getOptionalSignedInProfile();
  const readingSlug = buildProfileReadingSlug(profile);

  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-12">
      <AppPage className="space-y-6">
        <PageHero
          badges={[
            <Badge
              key="myeongri"
              className="border-[var(--app-gold)]/25 bg-[var(--app-gold)]/10 text-[var(--app-gold-soft)]"
            >
              명리 기준
            </Badge>,
            <Badge
              key="scope"
              className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]"
            >
              일간 · 오행 · 십신
            </Badge>,
          ]}
          title="개념을 따로 외우기보다, 내 사주 위에서 바로 읽는 명리 화면입니다"
          description="명리는 성격 테스트가 아니라 원국의 결, 강약, 관계 패턴을 읽는 기준입니다. 설명만 따로 늘어놓지 않고, 실제 사주 결과와 이어지는 언어로 정리했습니다."
        />

        <section className="grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
          <SectionSurface surface="lunar" size="lg">
            <div className="app-starfield" />
            <SectionHeader
              eyebrow="명리 읽는 순서"
              title="먼저 바탕을 보고, 그다음 반복되는 장면을 해석합니다"
              titleClassName="text-3xl text-[var(--app-gold-text)]"
              description="일간과 오행은 바탕을, 십신은 사람과 역할의 패턴을 설명합니다. 달빛선생에서는 이 셋을 따로 떼지 않고, 결과 화면과 연결되는 순서로 읽게 두었습니다."
              descriptionClassName="max-w-3xl text-[var(--app-copy)]"
            />

            <ProductGrid columns={3} className="mt-6">
              {EXPLORATIONS.map((item) => (
                <FeatureCard
                  key={item.title}
                  surface="soft"
                  eyebrow={item.badge}
                  title={item.title}
                  description={`${item.hook} · ${item.body}`}
                />
              ))}
            </ProductGrid>
          </SectionSurface>

          <SupportRail
            surface="panel"
            eyebrow="읽기 기준"
            title="명리는 겁을 주는 말이 아니라 반복되는 이유를 설명하는 언어입니다"
            description="개념을 많이 보여주는 것보다, 왜 그 판단이 나왔는지와 내 선택에 어떻게 연결되는지를 더 먼저 보이도록 정리했습니다."
          >
            <BulletList items={MYEONGRI_RULES} />

            <FeatureCard
              className="mt-5"
              surface="soft"
              eyebrow="바로 이어보기"
              description={
                readingSlug
                  ? '저장된 사주 결과가 있다면, 개념 설명보다 먼저 내 명식으로 바로 확인하는 편이 가장 이해가 빠릅니다.'
                  : '저장된 사주 결과가 없다면, 명리 설명을 읽다가 바로 사주 시작 화면으로 넘어가도 흐름이 끊기지 않게 두었습니다.'
              }
            />
          </SupportRail>
        </section>

        {readingSlug ? (
          <SectionSurface surface="panel" size="lg">
            <SectionHeader
              eyebrow="내 사주로 이어보기"
              title="개념 설명보다, 선생님의 명식 위에서 바로 확인할 수 있습니다"
              titleClassName="text-3xl"
              description="읽다가 궁금해진 개념은 실제 결과 화면으로 넘어가면 훨씬 빠르게 이해됩니다. 내 사주를 기준으로 일간, 오행, 십신을 번갈아 확인해 보세요."
              descriptionClassName="max-w-3xl text-[var(--app-copy)]"
              actions={
                <ActionCluster>
                  <Link
                    href={`/saju/${readingSlug}`}
                    className="moon-action-primary"
                  >
                    내 통합 결과 보기
                  </Link>
                  <Link
                    href={`/saju/${readingSlug}/elements`}
                    className="moon-action-muted"
                  >
                    내 오행 바로 보기
                  </Link>
                </ActionCluster>
              }
            />
          </SectionSurface>
        ) : null}

        <SectionSurface surface="panel" size="lg">
          <SectionHeader
            eyebrow="탐구 주제"
            title="명리 안에서 가장 자주 다시 보게 되는 세 갈래"
            titleClassName="text-3xl"
            description="설명을 길게 늘어놓기보다, 실제로 많이 다시 보게 되는 세 갈래만 먼저 정리했습니다."
            descriptionClassName="max-w-3xl text-[var(--app-copy)]"
          />

          <ProductGrid columns={3} className="mt-6">
            {EXPLORATIONS.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-5 py-5 transition-colors hover:bg-[rgba(255,255,255,0.05)]"
              >
                <div className="app-caption text-[var(--app-gold-soft)]">{item.badge}</div>
                <div className="mt-3 text-xl font-semibold text-[var(--app-ivory)]">{item.title}</div>
                <p className="mt-3 text-sm leading-7 text-[var(--app-copy-muted)]">{item.body}</p>
                <div className="mt-4 text-sm font-medium text-[var(--app-gold-text)] transition-transform group-hover:translate-x-1">
                  {item.hook} →
                </div>
              </Link>
            ))}
          </ProductGrid>
        </SectionSurface>
      </AppPage>
    </AppShell>
  );
}
