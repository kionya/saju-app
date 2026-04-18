import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/features/shared-navigation/site-header';
import { AppShell } from '@/shared/layout/app-shell';
import { DIALOGUE_GUARDRAILS, DIALOGUE_PRESETS } from '@/content/moonlight';

export const metadata: Metadata = {
  title: '대화',
  description: '달빛선생께 묻는 질문 프리셋과 안전한 대화 원칙을 확인하세요.',
  alternates: {
    canonical: '/dialogue',
  },
};

export default function DialoguePage() {
  const featuredPreset = DIALOGUE_PRESETS[0];

  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-12">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="app-hero-card p-7 sm:p-8">
          <div className="app-caption">대화</div>
          <h1 className="mt-4 font-[var(--font-heading)] text-4xl leading-[1.3] tracking-tight text-[var(--app-ivory)] sm:text-5xl">
            달빛선생께 여쭙는 질문은 공감과 안전 위에서 시작됩니다
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--app-copy)]">
            처음부터 길게 쓰지 않으셔도 됩니다. 시니어가 실제로 많이 묻는 질문 프리셋을 먼저 고르고,
            필요한 순간에는 의료·법률·금전 판단을 전문가 상담으로 부드럽게 잇는 SAFE_REDIRECT 원칙을 지킵니다.
          </p>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="app-panel p-6">
            <div className="app-caption">자주 여쭙는 질문</div>
            <div className="mt-5 grid gap-3">
              {DIALOGUE_PRESETS.map((preset, index) => (
                <article
                  key={preset.question}
                  className="rounded-[1.25rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-4 transition-colors hover:border-[var(--app-line-strong)] hover:bg-[var(--app-surface-strong)]"
                >
                  <div className="flex items-start gap-3 text-left">
                    <span className="font-[var(--font-heading)] text-sm text-[var(--app-gold)]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs tracking-[0.2em] text-[var(--app-copy-soft)]">
                        {preset.category}
                      </div>
                      <div className="mt-2 text-sm leading-7 text-[var(--app-ivory)]">
                        {preset.question}
                      </div>
                      <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">
                        {preset.previewAnswer}
                      </p>
                      <p className="mt-2 text-xs leading-6 text-[var(--app-copy-soft)]">
                        {preset.followUp}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <div className="grid gap-4">
            <article className="rounded-[1.75rem] border border-[var(--app-gold)]/28 bg-[linear-gradient(180deg,rgba(210,176,114,0.12),rgba(10,18,36,0.96))] p-6">
              <div className="app-caption">답변은 이런 결로 이어집니다</div>
              <div className="mt-4 text-xs tracking-[0.2em] text-[var(--app-gold-soft)]">
                {featuredPreset.category}
              </div>
              <h2 className="mt-3 font-[var(--font-heading)] text-3xl text-[var(--app-gold-text)]">
                {featuredPreset.question}
              </h2>
              <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
                {featuredPreset.previewAnswer}
              </p>
              <p className="mt-4 text-sm leading-7 text-[var(--app-copy-muted)]">
                {featuredPreset.followUp}
              </p>
            </article>

            {DIALOGUE_GUARDRAILS.map((item) => (
              <article key={item.title} className="app-panel p-6">
                <div className="app-caption">{item.title}</div>
                <p className="mt-4 text-sm leading-7 text-[var(--app-copy)]">{item.body}</p>
              </article>
            ))}

            <Link
              href="/dialogue/safe-redirect"
              className="app-panel block p-6 transition-colors hover:bg-[var(--app-surface-strong)]"
            >
              <div className="app-caption">SAFE_REDIRECT 예시</div>
              <p className="mt-4 text-sm leading-7 text-[var(--app-copy)]">
                위기 키워드를 감지했을 때 어떤 식으로 공감하고, 어디로 연결하는지 전용 상태 화면으로 확인하실 수 있습니다.
              </p>
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
