import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/features/shared-navigation/site-header';
import { AppShell } from '@/shared/layout/app-shell';
import { DIALOGUE_GUARDRAILS, DIALOGUE_PRESETS } from '@/content/moonlight';
import { DialogueChatPanel } from '@/components/dialogue/dialogue-chat-panel';

export const metadata: Metadata = {
  title: '대화',
  description: '달빛선생께 자주 여쭙는 질문과 안전한 대화 원칙을 확인하세요.',
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
            달빛선생께 드리는 질문은 마음을 먼저 헤아리는 말에서 시작됩니다
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--app-copy)]">
            처음부터 길게 적지 않으셔도 괜찮습니다. 많이들 여쭙는 질문을 먼저 고르셔도 되고, 편한 말로 한 줄만 남기셔도 됩니다.
            처음 3회 대화는 무료로 이어지고, 그 뒤에는 3회 묶음마다 3코인으로 차분하게 이어집니다.
            로그인 후 MY 프로필에 출생 정보가 저장돼 있으면 그 명식을 기본값으로 불러와 바로 답합니다.
            더 조심스러운 문제는 무리하게 해석하지 않고 알맞은 도움으로 안내드립니다.
          </p>
        </section>

        <section className="mt-8">
          <DialogueChatPanel
            presets={DIALOGUE_PRESETS.slice(0, 4).map((preset) => ({
              category: preset.category,
              question: preset.question,
            }))}
          />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="app-panel p-6">
            <div className="app-caption">자주 여쭙는 이야기</div>
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
              <div className="app-caption">이런 결로 답해드립니다</div>
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
                마음이 많이 아프거나 도움이 급한 순간에는 어떤 말로 공감하고 어디로 모시는지 살펴보실 수 있습니다.
              </p>
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
