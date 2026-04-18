import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/features/shared-navigation/site-header';
import { AppShell } from '@/shared/layout/app-shell';
import {
  INTERPRETATION_ENTRY_GUIDE,
  INTERPRETATION_JOURNEY,
  INTERPRETATION_LAYERS,
  WISDOM_CARDS,
  toneClasses,
} from '@/content/moonlight';

export const metadata: Metadata = {
  title: '해석',
  description: '사주, 명리, 타로, 궁합, 별자리, 띠운세 여섯 가지 지혜를 한곳에서 살펴보세요.',
  alternates: {
    canonical: '/interpretation',
  },
};

export default function InterpretationPage() {
  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-12">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="app-hero-card p-7 sm:p-8">
          <div className="app-caption">해석</div>
          <h1 className="mt-4 font-[var(--font-heading)] text-4xl leading-[1.3] tracking-tight text-[var(--app-ivory)] sm:text-5xl">
            여섯 가지 지혜가 서로 다른 질문에 답합니다
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--app-copy)]">
            사주와 명리는 삶의 큰 흐름을, 타로와 궁합은 지금의 선택과 관계를, 별자리와 띠운세는 더 가벼운 입구를 담당합니다.
            어디부터 시작해도 달빛선생의 한 문장으로 다시 이어집니다.
          </p>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {WISDOM_CARDS.map((card) => {
            const tone = toneClasses(card.tone);

            return (
              <Link
                key={card.slug}
                href={card.href}
                className="moon-wisdom-card block"
              >
                <div className={`moon-wisdom-hanja ${tone.text}`}>{card.hanja}</div>
                <div className={`mt-3 font-[var(--font-heading)] text-2xl font-semibold ${tone.text}`}>
                  {card.title}
                </div>
                <p className="mt-3 text-base leading-7 text-[var(--app-ivory)]">“{card.hook}”</p>
                <p className="mt-4 text-sm leading-7 text-[var(--app-copy-muted)]">{card.description}</p>
              </Link>
            );
          })}
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          {INTERPRETATION_LAYERS.map((layer) => (
            <article key={layer.title} className="app-panel p-6">
              <div className="app-caption">{layer.title}</div>
              <p className="mt-4 text-sm leading-7 text-[var(--app-copy)]">{layer.body}</p>
              <ul className="mt-4 space-y-2 text-sm text-[var(--app-copy)]">
                {layer.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-[0.38rem] h-1.5 w-1.5 rounded-full bg-[var(--app-gold)]/70" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
          <article className="app-panel p-6">
            <div className="app-caption">어디서 시작하면 좋을까요?</div>
            <div className="mt-5 space-y-4">
              {INTERPRETATION_ENTRY_GUIDE.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.2rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 py-5"
                >
                  <div className="font-[var(--font-heading)] text-2xl text-[var(--app-ivory)]">
                    {item.title}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">{item.body}</p>
                  <div className="mt-4">
                    <Link
                      href={item.href}
                      className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--app-gold)]/28 bg-[var(--app-gold)]/12 px-4 text-sm font-medium text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/18"
                    >
                      {item.cta}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[1.75rem] border border-[var(--app-gold)]/28 bg-[linear-gradient(180deg,rgba(210,176,114,0.12),rgba(10,18,36,0.96))] p-6">
            <div className="app-caption">무료에서 심화로 이어지는 흐름</div>
            <div className="mt-4 font-[var(--font-heading)] text-3xl text-[var(--app-gold-text)]">
              좋은 해석은 한 번 보고 끝나지 않습니다
            </div>
            <div className="mt-5 space-y-4">
              {INTERPRETATION_JOURNEY.map((step) => (
                <div
                  key={step.title}
                  className="rounded-[1.15rem] border border-[var(--app-gold)]/14 bg-[rgba(255,255,255,0.02)] px-4 py-4"
                >
                  <div className="text-sm font-medium text-[var(--app-ivory)]">{step.title}</div>
                  <p className="mt-2 text-sm leading-7 text-[var(--app-copy-muted)]">{step.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/membership"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-gold)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-bright)]"
              >
                플랜 비교 보기
              </Link>
              <Link
                href="/saju/new"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-gold)]/32 bg-[var(--app-gold)]/14 px-5 text-sm text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/20"
              >
                바로 사주 시작하기
              </Link>
            </div>
          </article>
        </section>
      </div>
    </AppShell>
  );
}
