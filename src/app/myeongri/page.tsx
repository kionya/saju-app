import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import SiteHeader from '@/features/shared-navigation/site-header';
import { AppShell } from '@/shared/layout/app-shell';

export const metadata: Metadata = {
  title: '명리',
  description: '일주, 오행, 십신을 통해 반복되는 인생 패턴의 이유를 살펴보는 명리 탐구 공간입니다.',
  alternates: {
    canonical: '/myeongri',
  },
};

const EXPLORATIONS = [
  {
    title: '일주 이야기',
    body: '태어난 날의 기둥을 중심으로 성정과 기질의 본질을 읽습니다.',
    hook: '나는 어떤 그림의 사람인가',
    href: '/saju/new',
    badge: '日柱',
  },
  {
    title: '오행의 흐름',
    body: '다섯 기운의 균형과 부족한 지점을 시각적으로 이해하도록 돕습니다.',
    hook: '내 안의 다섯 기운은 어떻게 흐르는가',
    href: '/saju/new',
    badge: '五行',
  },
  {
    title: '열 가지 인연',
    body: '내 삶에 유난히 반복되는 관계와 역할의 패턴을 십신으로 풀어드립니다.',
    hook: '내 삶에 등장하는 열 가지 관계',
    href: '/myeongri/ten-gods',
    badge: '十神',
  },
] as const;

export default function MyeongriPage() {
  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-12">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="app-hero-card p-7 sm:p-8">
          <div className="app-caption">命 理</div>
          <h1 className="mt-4 font-[var(--font-heading)] text-4xl leading-[1.3] tracking-tight text-[var(--app-ivory)] sm:text-5xl">
            왜 유독 이 부분에서 늘 걸리는지, 명리는 그 이유를 묻습니다
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--app-copy)]">
            일주와 오행, 십신을 시각화해 반복되는 장면의 까닭을 차분히 짚어보는 공간입니다.
            공부하듯 하나씩 살펴보실 수 있게 흐름을 단순하고 또렷하게 정리했습니다.
          </p>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {EXPLORATIONS.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="app-panel block p-6 transition-colors hover:bg-[var(--app-surface-strong)]"
            >
              <Badge className="border-[var(--app-gold)]/25 bg-[var(--app-gold)]/10 text-[var(--app-gold-soft)]">
                {item.badge}
              </Badge>
              <div className="mt-4 font-[var(--font-heading)] text-3xl text-[var(--app-ivory)]">
                {item.title}
              </div>
              <p className="mt-3 text-sm text-[var(--app-gold-soft)]">“{item.hook}”</p>
              <p className="mt-4 text-sm leading-7 text-[var(--app-copy)]">{item.body}</p>
            </Link>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <article className="app-panel p-6">
            <div className="app-caption">명리를 보는 세 가지 축</div>
            <div className="mt-5 space-y-4">
              {[
                '일주는 내가 본래 어떤 결의 사람인지 알려줍니다.',
                '오행은 내 안에서 무엇이 강하고 무엇이 메마른지 보여줍니다.',
                '십신은 사람과 역할, 재물과 자리의 패턴이 어떻게 반복되는지 읽게 해줍니다.',
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
            <div className="app-caption">가장 많이 찾는 탐구</div>
            <div className="mt-3 font-[var(--font-heading)] text-3xl text-[var(--app-gold-text)]">
              십신 · 열 가지 인연
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--app-copy)]">
              자녀, 배우자, 동료, 재물, 명예처럼 삶에서 자주 부딪히는 관계의 결을 십신으로
              읽으면 “왜 늘 이 장면이 반복되는지”가 더 또렷해집니다.
            </p>
            <div className="mt-6">
              <Link
                href="/myeongri/ten-gods"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-gold)]/35 bg-[var(--app-gold)]/16 px-5 text-sm font-semibold text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/22"
              >
                십신 상세 보기
              </Link>
            </div>
          </article>
        </section>
      </div>
    </AppShell>
  );
}
