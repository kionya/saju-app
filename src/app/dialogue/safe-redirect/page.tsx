import Link from 'next/link';
import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import { SAFE_REDIRECT_RESOURCES } from '@/content/moonlight';
import SiteHeader from '@/features/shared-navigation/site-header';
import { AppShell } from '@/shared/layout/app-shell';

export const metadata: Metadata = {
  title: 'SAFE_REDIRECT',
  description: '위기 감지 시 안전 자원으로 연결하는 전용 상태 화면입니다.',
};

export default function SafeRedirectPage() {
  const primary = SAFE_REDIRECT_RESOURCES[0];
  const primaryPhoneHref = `tel:${primary.phone.replace(/[^\d+]/g, '')}`;

  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-12">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="app-hero-card p-7 sm:p-8">
          <Badge className="border-[var(--app-coral)]/32 bg-[var(--app-coral)]/10 text-[var(--app-coral)]">
            SAFE_REDIRECT
          </Badge>
          <h1 className="mt-5 font-[var(--font-heading)] text-4xl text-[var(--app-ivory)] sm:text-5xl">
            위기 상황에서는 사주 해석보다 먼저 안전으로 연결합니다
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--app-copy)]">
            위기·의료·법률·투자처럼 고위험 판단이 걸린 순간에는, 달빛선생이 공감의 말과 함께
            즉시 전문 자원으로 연결하는 전용 상태입니다.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <div className="flex justify-end">
            <div className="max-w-[18rem] rounded-[1.2rem] bg-[var(--app-surface-muted)] px-4 py-4 text-sm leading-7 text-[var(--app-ivory)]">
              요즘 너무 힘들어서
              <br />
              그만 살고 싶어요
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--app-gold)] text-[var(--app-bg)]">
              🌙
            </div>
            <div className="flex-1 rounded-[1.3rem] border border-[var(--app-coral)]/32 bg-[var(--app-surface-muted)] px-5 py-5 text-sm leading-8 text-[var(--app-copy)]">
              지금 많이 힘드시군요. 그 마음을 혼자 짊어지지 않으셨으면 합니다.
              <br />
              저는 사주를 봐드리는 곳이지만, 지금 이 순간 가장 도움이 될 분들이 계십니다.
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[1.75rem] border-2 border-[var(--app-coral)]/45 bg-[linear-gradient(135deg,rgba(212,97,74,0.12),rgba(10,18,36,0.96))] p-6">
          <div className="app-caption text-[var(--app-coral)]">지금 연결하실 수 있는 곳</div>
          <div className="mt-3 font-[var(--font-heading)] text-3xl text-[var(--app-ivory)]">
            {primary.label}
          </div>
          <div className="mt-2 text-4xl font-semibold text-[var(--app-coral)]">{primary.phone}</div>
          <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">
            {primary.detail}
            <br />
            {primary.note}
          </p>
          <div className="mt-6">
            <a
              href={primaryPhoneHref}
              className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--app-coral)] px-6 text-sm font-semibold text-white transition-colors hover:opacity-90"
            >
              바로 전화 걸기
            </a>
          </div>
        </section>

        <section className="mt-8 app-panel p-6">
          <div className="app-caption">다른 안전 연결 예시</div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {SAFE_REDIRECT_RESOURCES.slice(1).map((resource) => (
              <article
                key={resource.category}
                className="rounded-[1.15rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-4"
              >
                <div className="font-[var(--font-heading)] text-xl text-[var(--app-ivory)]">
                  {resource.label}
                </div>
                <div className="mt-2 text-sm text-[var(--app-gold-soft)]">{resource.phone}</div>
                <p className="mt-3 text-sm leading-7 text-[var(--app-copy-muted)]">
                  {resource.detail}
                  <br />
                  {resource.note}
                </p>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-8">
          <Link
            href="/dialogue"
            className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 text-sm text-[var(--app-copy)] transition-colors hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]"
          >
            대화 화면으로 돌아가기
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
