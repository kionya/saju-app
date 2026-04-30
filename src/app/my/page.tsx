import Link from 'next/link';
import { BookOpen, Coins, Star } from 'lucide-react';
import { ActionCluster } from '@/components/layout/action-cluster';
import { FeatureCard } from '@/components/layout/feature-card';
import { ProductGrid } from '@/components/layout/product-grid';
import { SectionHeader } from '@/components/layout/section-header';
import { SectionSurface } from '@/components/layout/section-surface';
import { SupportRail } from '@/components/layout/support-rail';
import { Badge } from '@/components/ui/badge';
import { MY_MENU_BLUEPRINT } from '@/content/moonlight';
import { getAccountDashboardData } from '@/lib/account';
import {
  getSubscriptionPlanLabel,
  getSubscriptionStatusLabel,
} from '@/lib/subscription';
import { PageHero } from '@/shared/layout/app-shell';

function formatBirthLabel(reading: {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number | null;
  gender: 'male' | 'female' | null;
}) {
  const hourLabel = reading.birthHour === null ? '시간 미입력' : `${reading.birthHour}시`;
  const genderLabel =
    reading.gender === 'male' ? '남성' : reading.gender === 'female' ? '여성' : '성별 미선택';
  return `${reading.birthYear}.${reading.birthMonth}.${reading.birthDay} · ${hourLabel} · ${genderLabel}`;
}

function formatRenewalLabel(value: string | null) {
  if (!value) return '다음 갱신일 미정';

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));
}

const MENU_ICONS: Record<string, string> = {
  '내 사주 원국': '四',
  '저장한 해석': '卷',
  '가족 사주': '家',
  '프리미엄 플랜': '✦',
  '알림 센터': '鐘',
  '설정': '⚙',
  '문의 · 도움말': '?',
};

export default async function MyPage() {
  const dashboard = await getAccountDashboardData('/my', {
    readingLimit: 4,
    transactionLimit: 4,
  });

  const mostRecentReading = dashboard.recentReadings[0];
  const displayName = dashboard.user.email?.split('@')[0] ?? '선생님';
  const sigil = mostRecentReading?.dayMasterStem ?? '月';
  const isPremium = Boolean(dashboard.subscription);
  const planTitle = dashboard.subscription
    ? getSubscriptionPlanLabel(dashboard.subscription.plan)
    : '미가입';
  const planSummary = dashboard.subscription
    ? `${getSubscriptionStatusLabel(dashboard.subscription.status)} · ${formatRenewalLabel(
        dashboard.subscription.renewsAt
      )}`
    : '무료 이용 중 · 멤버십 가입 전';

  const stats = [
    {
      label: '저장한 해석',
      value: dashboard.readingCount,
      sub:
        dashboard.readingCount > 0
          ? `전체 ${dashboard.readingCount}개 · 결과보관함에서 다시 보기`
          : '저장된 결과 없음',
      href: '/my/results',
      icon: BookOpen,
      tone: 'text-[var(--app-gold-text)]',
    },
    {
      label: '사용 가능한 코인',
      value: dashboard.credits.total,
      sub: `일반 ${dashboard.credits.balance} · 멤버십 ${dashboard.credits.subscriptionBalance}`,
      href: '/credits',
      icon: Coins,
      tone: 'text-[var(--app-jade)]',
    },
    {
      label: '플랜 상태',
      value: planTitle,
      sub: isPremium ? planSummary : '무료 이용 중 · 플랜 가입으로 더 깊이 보기',
      href: isPremium ? '/my/billing' : '/membership',
      icon: Star,
      tone: isPremium ? 'text-[var(--app-plum)]' : 'text-[var(--app-copy-muted)]',
    },
  ] as const;

  return (
    <div className="space-y-6">
      <PageHero
        badges={[
          <Badge
            key="my"
            className="border-[var(--app-gold)]/25 bg-[var(--app-gold)]/10 text-[var(--app-gold-soft)]"
          >
            MY
          </Badge>,
          <Badge
            key="archive"
            className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]"
          >
            보관 · 결제 · 가족 정보
          </Badge>,
        ]}
        title="내 사주, 내 기록, 내 흐름을 한곳에 모았습니다"
        description="저장된 결과, 가족 정보, 결제 상태, 알림과 설정을 같은 문법으로 정리해두었습니다. 다시 열어볼 때도 어떤 흐름으로 이어지는지 바로 이해할 수 있게 구성했습니다."
      />

      <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <SectionSurface surface="lunar" size="lg">
          <div className="app-starfield" />
          <SectionHeader
            eyebrow="내 기준"
            title={`${displayName} 선생님`}
            titleClassName="text-3xl text-[var(--app-gold-text)]"
            description={
              mostRecentReading
                ? formatBirthLabel(mostRecentReading)
                : '첫 사주를 저장하시면 원국과 기록이 이곳에 이어집니다.'
            }
            descriptionClassName="max-w-3xl text-[var(--app-copy)]"
          />

          <div className="mt-6 flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[var(--app-gold)]/35 bg-[radial-gradient(circle_at_34%_34%,rgba(212,176,106,0.28),rgba(31,37,64,0.96))] font-display text-4xl font-semibold text-[var(--app-gold-text)]">
              {sigil}
            </div>
            <div className="space-y-2">
              <Badge className={isPremium ? 'border-[var(--app-gold)]/28 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]' : 'border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]'}>
                {isPremium ? planTitle : '무료 이용 중'}
              </Badge>
              <Badge className="border-[var(--app-jade)]/25 bg-[var(--app-jade)]/8 text-[var(--app-jade)]">
                코인 {dashboard.credits.total}
              </Badge>
              {isPremium ? (
                <div className="text-xs text-[var(--app-copy-soft)]">{planSummary}</div>
              ) : null}
              {mostRecentReading?.dayPillarLabel ? (
                <div className="font-hanja text-xs tracking-[0.28em] text-[var(--app-gold)]/72">
                  {mostRecentReading.dayPillarLabel}
                </div>
              ) : null}
            </div>
          </div>

          <ActionCluster className="mt-6">
            <Link href="/my/results" className="moon-cta-primary">
              저장한 결과 보기
            </Link>
            <Link href="/my/profile" className="moon-cta-secondary">
              가족 정보 관리
            </Link>
          </ActionCluster>
        </SectionSurface>

        <SupportRail
          surface="panel"
          eyebrow="이 공간이 하는 일"
          title="매번 다시 입력하지 않고 같은 기준으로 이어갑니다"
          description="MY는 결과와 결제, 가족 정보와 알림을 따로 흩어두지 않고, 같은 기준 위에서 다시 열 수 있게 모아둔 공간입니다."
        >
          <FeatureCard
            surface="soft"
            eyebrow="가족 사주"
            description="가족, 연인, 친구 정보를 같은 기준으로 저장해두면 궁합과 가족 리포트로 바로 이어갈 수 있습니다."
          />
          <FeatureCard
            className="mt-4"
            surface="soft"
            eyebrow="플랜과 코인"
            description="남은 코인과 현재 플랜 상태를 함께 두어, 결제와 이용 흐름이 한눈에 이어지도록 정리했습니다."
          />
        </SupportRail>
      </section>

      <SectionSurface surface="panel" size="lg">
        <SectionHeader
          eyebrow="자주 여는 항목"
          title="지금 바로 들어갈 곳을 고르시면 됩니다"
          titleClassName="text-3xl"
          description="기능을 길게 설명하기보다, 실제로 자주 여는 공간을 카드형으로 정리해 다시 올 때도 망설이지 않게 구성했습니다."
          descriptionClassName="max-w-3xl text-[var(--app-copy)]"
        />

        <ProductGrid columns={3} className="mt-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <FeatureCard
                key={stat.label}
                surface="soft"
                eyebrow={stat.label}
                title={stat.value}
                titleClassName={stat.tone}
                description={stat.sub}
                icon={
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)]">
                    <Icon className={`h-4 w-4 ${stat.tone}`} />
                  </div>
                }
                footer={
                  <Link
                    href={stat.href}
                    className="inline-flex items-center gap-2 text-sm text-[var(--app-gold-soft)] underline underline-offset-4 hover:text-[var(--app-ivory)]"
                  >
                    바로가기
                  </Link>
                }
              />
            );
          })}
        </ProductGrid>
      </SectionSurface>

      <SectionSurface surface="panel" size="lg">
        <SectionHeader
          eyebrow="내 기록 메뉴"
          title="보관, 가족, 결제, 알림을 같은 톤으로 이어 둡니다"
          titleClassName="text-3xl"
          description="한 화면 안에서 어떤 항목을 눌러도 같은 문법으로 이어지도록, 관리 메뉴도 카드 밀도와 정보 위계를 맞췄습니다."
          descriptionClassName="max-w-3xl text-[var(--app-copy)]"
        />

        <ProductGrid columns={3} className="mt-6">
          {MY_MENU_BLUEPRINT.map((item) => (
            <FeatureCard
              key={item.title}
              surface="soft"
              eyebrow={MENU_ICONS[item.title] ?? item.title.slice(0, 1)}
              title={item.title}
              description={item.description}
              footer={
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-2 text-sm text-[var(--app-gold-soft)] underline underline-offset-4 hover:text-[var(--app-ivory)]"
                >
                  이 메뉴 열기
                </Link>
              }
            />
          ))}
        </ProductGrid>
      </SectionSurface>
    </div>
  );
}
