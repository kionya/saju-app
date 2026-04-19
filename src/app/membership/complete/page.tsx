import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { COMPLETE_PLAN_GUIDE, type PlanSlug } from '@/content/moonlight';
import SiteHeader from '@/features/shared-navigation/site-header';
import { AppShell } from '@/shared/layout/app-shell';

interface Props {
  searchParams: Promise<{ plan?: string; slug?: string; payment?: string }>;
}

const PLAN_LABELS = {
  basic: 'Plus',
  premium: '프리미엄',
  lifetime: '평생 심층 리포트',
} as const;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '결제 완료',
    description: '결제가 완료된 뒤 첫 이용 흐름을 안내하는 화면입니다.',
  };
}

export default async function MembershipCompletePage({ searchParams }: Props) {
  const { plan, slug, payment } = await searchParams;
  const planSlug = ((plan as PlanSlug | undefined) ?? 'premium') as PlanSlug;
  const planLabel = PLAN_LABELS[planSlug] ?? PLAN_LABELS.premium;
  const completeGuide = COMPLETE_PLAN_GUIDE[planSlug] ?? COMPLETE_PLAN_GUIDE.premium;
  const shouldOpenPremiumResult =
    payment === 'confirmed' && slug && (planSlug === 'lifetime' || planSlug === 'premium');

  if (shouldOpenPremiumResult) {
    redirect(`/saju/${encodeURIComponent(slug)}/premium?payment=confirmed&plan=${planSlug}`);
  }

  const primaryHref =
    slug && (planSlug === 'lifetime' || planSlug === 'premium')
      ? `/saju/${slug}/premium`
      : completeGuide.primaryHref;

  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-12">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <section className="app-panel p-8 text-center sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[radial-gradient(circle,var(--app-gold-bright),var(--app-gold))] text-4xl text-[var(--app-bg)]">
            ✓
          </div>

          <div className="mt-6 flex justify-center">
            <Badge className="border-[var(--app-gold)]/25 bg-[var(--app-gold)]/10 text-[var(--app-gold-soft)]">
              {payment === 'confirmed' ? '결제 완료' : planLabel}
            </Badge>
          </div>

          <h1 className="mt-5 font-[var(--font-heading)] text-4xl text-[var(--app-ivory)] sm:text-5xl">
            달빛선생과의 인연이 시작되었습니다
          </h1>
          <p className="mt-4 text-base leading-8 text-[var(--app-copy)]">
            {planLabel} 이용이 시작되었습니다. {completeGuide.welcome}
          </p>

          <div className="mx-auto mt-8 max-w-md rounded-[1.5rem] border border-[var(--app-gold)]/24 bg-[linear-gradient(180deg,rgba(210,176,114,0.12),rgba(10,18,36,0.96))] px-6 py-6">
            <div className="app-caption">환영 선물</div>
            <div className="mt-3 font-[var(--font-heading)] text-2xl text-[var(--app-gold-text)]">
              {completeGuide.giftTitle}
            </div>
            <p className="mt-3 text-sm leading-7 text-[var(--app-copy-muted)]">
              {completeGuide.giftBody}
            </p>
          </div>

          <div className="mx-auto mt-6 max-w-2xl rounded-[1.4rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-6 py-6 text-left">
            <div className="app-caption">지금 바로 해보시면 좋은 것</div>
            <div className="mt-4 space-y-3">
              {completeGuide.nextSteps.map((item) => (
                <div key={item} className="text-sm leading-7 text-[var(--app-copy)]">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={primaryHref}
              className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--app-gold)] px-6 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-bright)]"
            >
              {slug && planSlug === 'lifetime' ? '열린 평생 리포트 보기' : completeGuide.primaryLabel}
            </Link>
            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-6 text-sm text-[var(--app-copy)] transition-colors hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
