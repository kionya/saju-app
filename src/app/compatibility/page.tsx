import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { COMPATIBILITY_RELATIONSHIPS } from '@/content/moonlight';
import SiteHeader from '@/features/shared-navigation/site-header';
import { AppShell } from '@/shared/layout/app-shell';

export const metadata: Metadata = {
  title: '궁합',
  description: '연인, 배우자, 부모자녀, 가족과의 궁합을 관계별 질문으로 살펴보는 궁합 페이지입니다.',
  alternates: {
    canonical: '/compatibility',
  },
};

export default function CompatibilityPage() {
  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-12">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="app-hero-card p-7 sm:p-8">
          <div className="app-caption">宮合</div>
          <h1 className="mt-4 font-[var(--font-heading)] text-4xl leading-[1.3] tracking-tight text-[var(--app-ivory)] sm:text-5xl">
            두 사람의 사주가 만나 어떤 이야기를 이루는지 살펴봅니다
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--app-copy)]">
            연인과 배우자, 부모자녀, 형제와 친구, 동업 파트너까지. 관계의 온도와 속도, 서로를 살리는 지점을 함께 짚어드립니다.
          </p>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {COMPATIBILITY_RELATIONSHIPS.map((item) => (
            <Link
              key={item.slug}
              href={`/compatibility/input?relationship=${item.slug}`}
              className="app-panel block p-6 transition-colors hover:bg-[var(--app-surface-strong)]"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{item.icon}</div>
                <div>
                  <div className="app-caption">{item.title}</div>
                  <p className="mt-4 text-lg leading-8 text-[var(--app-ivory)]">“{item.hook}”</p>
                </div>
              </div>
            </Link>
          ))}
        </section>

        <div className="mt-8 rounded-[1.3rem] border border-dashed border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 py-5 text-center">
          <Badge className="border-[var(--app-jade)]/25 bg-[var(--app-jade)]/10 text-[var(--app-jade)]">
            프리미엄 전용
          </Badge>
          <p className="mt-4 text-sm leading-7 text-[var(--app-copy-muted)]">
            처음이시라면 관계를 고르고 입력 화면까지 천천히 둘러보실 수 있습니다.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
