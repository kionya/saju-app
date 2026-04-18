import Link from 'next/link';
import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import { COMPATIBILITY_RELATIONSHIPS } from '@/content/moonlight';
import SiteHeader from '@/features/shared-navigation/site-header';
import { AppShell } from '@/shared/layout/app-shell';

interface Props {
  searchParams: Promise<{ relationship?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '궁합 입력',
    description: '상대방 정보 입력 화면입니다.',
  };
}

export default async function CompatibilityInputPage({ searchParams }: Props) {
  const { relationship } = await searchParams;
  const selected =
    COMPATIBILITY_RELATIONSHIPS.find((item) => item.slug === relationship) ??
    COMPATIBILITY_RELATIONSHIPS[0];

  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-12">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="app-hero-card p-7 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/compatibility"
              className="text-sm text-[var(--app-gold-soft)] transition-colors hover:text-[var(--app-ivory)]"
            >
              ← 뒤로
            </Link>
            <Badge className="border-[var(--app-jade)]/25 bg-[var(--app-jade)]/10 text-[var(--app-jade)]">
              {selected.title}
            </Badge>
          </div>
          <h1 className="mt-5 font-[var(--font-heading)] text-4xl text-[var(--app-ivory)] sm:text-5xl">
            상대방의 생시를 알려주세요
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--app-copy)]">
            내 정보와 상대 정보를 같은 화면에 놓고 비교할 수 있도록, 관계별 입력 흐름을 간단하고
            차분하게 정리한 단계입니다.
          </p>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="app-panel p-6">
            <div className="app-caption">선생님 (나)</div>
            <div className="mt-4 rounded-[1.2rem] border border-[var(--app-gold)]/24 bg-[var(--app-gold)]/10 px-4 py-4 text-sm leading-7 text-[var(--app-copy)]">
              김영희 · 1965.03.20 未時 · 여성
            </div>
          </article>

          <article className="app-panel p-6">
            <div className="app-caption">상대방</div>
            <div className="mt-4 space-y-3">
              <div className="rounded-[1rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-3 text-sm text-[var(--app-copy-muted)]">
                예: 남편, 큰아들, 민수 등
              </div>
              <div className="grid grid-cols-3 gap-3">
                {['년', '월', '일'].map((item) => (
                  <div
                    key={item}
                    className="rounded-[1rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-3 text-center text-sm text-[var(--app-copy-muted)]"
                  >
                    {item} ▼
                  </div>
                ))}
              </div>
              <div className="rounded-[1rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-3 text-center text-sm text-[var(--app-copy-muted)]">
                시 ▼ (모르시면 건너뛰기)
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[1rem] bg-[var(--app-gold)] px-4 py-3 text-center text-sm font-semibold text-[var(--app-bg)]">
                  여성
                </div>
                <div className="rounded-[1rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-3 text-center text-sm text-[var(--app-copy-muted)]">
                  남성
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href={`/compatibility/result?relationship=${selected.slug}`}
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[var(--app-jade)] px-6 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:opacity-90"
              >
                두 분의 인연을 살펴보기
              </Link>
            </div>
          </article>
        </section>
      </div>
    </AppShell>
  );
}
