import Link from 'next/link';
import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import { TEN_GODS_GUIDE } from '@/content/moonlight';
import SiteHeader from '@/features/shared-navigation/site-header';
import { AppShell } from '@/shared/layout/app-shell';

export const metadata: Metadata = {
  title: '십신',
  description: '십신으로 열 가지 관계와 역할의 패턴을 읽는 달빛선생의 명리 탐구 화면입니다.',
  alternates: {
    canonical: '/myeongri/ten-gods',
  },
};

export default function TenGodsPage() {
  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-12">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="app-hero-card p-7 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/myeongri"
              className="text-sm text-[var(--app-gold-soft)] transition-colors hover:text-[var(--app-ivory)]"
            >
              ← 명리 탐구로 돌아가기
            </Link>
            <Badge className="border-[var(--app-gold)]/25 bg-[var(--app-gold)]/10 text-[var(--app-gold-soft)]">
              06-2 · 十神
            </Badge>
          </div>
          <div className="mt-8">
            <div className="app-caption">열 가지 인연</div>
            <h1 className="mt-4 font-[var(--font-heading)] text-4xl text-[var(--app-ivory)] sm:text-5xl">
              십신 · 열 가지 인연
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--app-copy)]">
              십신은 삶에 등장하는 사람과 자리, 재물과 역할의 패턴을 읽는 언어입니다. 같은
              질문이 왜 반복되는지, 어떤 관계가 나를 돕고 어떤 관계가 나를 닳게 하는지 차분히
              짚어보는 기준이 됩니다.
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {TEN_GODS_GUIDE.map((item) => (
            <article key={item.hanja} className="app-panel p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs tracking-[0.24em] text-[var(--app-gold)]/72">
                    {item.hanja}
                  </div>
                  <div className="mt-2 font-[var(--font-heading)] text-3xl text-[var(--app-ivory)]">
                    {item.name}
                  </div>
                </div>
                <Badge className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]">
                  {item.meaning}
                </Badge>
              </div>
              <p className="mt-5 text-base leading-8 text-[var(--app-gold-text)]">
                “{item.seniorCopy}”
              </p>
              <p className="mt-4 text-sm leading-7 text-[var(--app-copy-muted)]">
                명리에서는 이 기운이 강하게 드러날수록 {item.meaning.replaceAll(' · ', ', ')} 같은
                주제가 삶에서 더 자주 부각된다고 읽습니다.
              </p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.94fr_1.06fr]">
          <article className="app-panel p-6">
            <div className="app-caption">십신을 읽는 방법</div>
            <div className="mt-5 space-y-4">
              {[
                '정인과 편인은 돌봄, 배움, 감각의 방식이 어떻게 다른지 봅니다.',
                '비견과 겁재는 나와 비슷한 사람들과의 거리 조절을 보여줍니다.',
                '정재·편재, 정관·편관은 재물과 자리, 책임을 대하는 방식을 드러냅니다.',
              ].map((line) => (
                <div
                  key={line}
                  className="rounded-[1.1rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-4 text-sm leading-7 text-[var(--app-copy)]"
                >
                  {line}
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[1.75rem] border border-[var(--app-gold)]/28 bg-[linear-gradient(180deg,rgba(210,176,114,0.12),rgba(10,18,36,0.96))] p-6">
            <div className="app-caption">내 사주와 연결해 보기</div>
            <div className="mt-3 font-[var(--font-heading)] text-3xl text-[var(--app-gold-text)]">
              실제 명식에 얹으면 더 또렷합니다
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--app-copy)]">
              십신은 단독 지식보다 내 사주 원국 위에 올려놓았을 때 훨씬 선명합니다. 일간과
              오행 균형, 대운 흐름과 함께 보면 지금 가장 두드러지는 관계 패턴을 더 정확히 읽을
              수 있습니다.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/saju/new"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-gold)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-bright)]"
              >
                내 사주 시작하기
              </Link>
              <Link
                href="/interpretation"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 text-sm text-[var(--app-ivory)] transition-colors hover:bg-[var(--app-surface-strong)]"
              >
                다른 해석도 보기
              </Link>
            </div>
          </article>
        </section>
      </div>
    </AppShell>
  );
}
