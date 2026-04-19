import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { COMPATIBILITY_RELATIONSHIPS } from '@/content/moonlight';
import SiteHeader from '@/features/shared-navigation/site-header';
import { WisdomCategoryHero } from '@/features/shared-navigation/wisdom-category-hero';
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
      <div className="wisdom-category-page">
        <WisdomCategoryHero slug="compatibility" />
        <div className="wisdom-category-body">
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
      </div>
    </AppShell>
  );
}
