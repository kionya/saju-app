import type { Metadata } from 'next';
import SiteHeader from '@/features/shared-navigation/site-header';
import { AppShell } from '@/shared/layout/app-shell';
import { DIALOGUE_GUARDRAILS, DIALOGUE_PRESETS } from '@/content/moonlight';
import { DialogueChatPanel } from '@/components/dialogue/dialogue-chat-panel';

export const metadata: Metadata = {
  title: '대화',
  description: '달빛선생께 자주 여쭙는 질문과 안전한 대화 원칙을 확인하세요.',
  alternates: { canonical: '/dialogue' },
};

const CATEGORY_COLORS: Record<string, string> = {
  '재물':      'border-[var(--app-gold)]/25 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]',
  '가족':      'border-[var(--app-jade)]/25 bg-[var(--app-jade)]/10 text-[var(--app-jade)]',
  '이동':      'border-[var(--app-sky)]/25 bg-[var(--app-sky)]/10 text-[var(--app-sky)]',
  '마음':      'border-[var(--app-plum)]/25 bg-[var(--app-plum)]/10 text-[var(--app-plum)]',
  '건강·생활': 'border-[var(--app-coral)]/25 bg-[var(--app-coral)]/10 text-[var(--app-coral)]',
  '생활':      'border-[var(--app-coral)]/25 bg-[var(--app-coral)]/10 text-[var(--app-coral)]',
};

export default async function DialoguePage({
  searchParams,
}: {
  searchParams: Promise<{
    question?: string;
    sourceSessionId?: string;
    concern?: string;
    from?: string;
    autoStart?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

        {/* ─── HERO ─── */}
        <section className="app-hero-card p-7 sm:p-9">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="app-caption mb-4">달빛선생과 대화</div>
              <h1 className="font-[var(--font-heading)] text-3xl leading-[1.32] tracking-tight text-[var(--app-ivory)] sm:text-4xl">
                대화 중에도 명식 기준은 바뀌지 않습니다
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-8 text-[var(--app-copy-muted)]">
                달빛선생과의 대화는 이미 계산된 명식과 운의 구조를 바탕으로 이어집니다. AI가 대화 중에 격국이나 용신을 새로 추측하지 않으며, 질문에 맞춰 설명의 우선순위만 다시 정리합니다. 처음 3회 대화는 무료로 이어지고, MY 프로필에 출생 정보가 있으면 명식을 바로 불러옵니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 lg:shrink-0">
              {['재물', '가족', '이동', '마음', '생활'].map((cat) => (
                <span
                  key={cat}
                  className={`rounded-full border px-3 py-1 text-xs ${CATEGORY_COLORS[cat] ?? 'border-[var(--app-line)] text-[var(--app-copy-muted)]'}`}
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CHAT PANEL ─── */}
        <section className="mt-6">
          <DialogueChatPanel
            presets={DIALOGUE_PRESETS.map((p) => ({
              category: p.category,
              question: p.question,
            }))}
            initialQuestion={params.question}
            sourceSessionId={params.sourceSessionId}
            concernId={params.concern}
            entrySource={params.from}
            autoStart={params.autoStart === '1'}
          />
        </section>

        {/* ─── PRESETS + GUARDRAILS ─── */}
        <section className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">

          <article className="app-panel p-6">
            <div className="app-caption mb-5">자주 여쭙는 이야기</div>
            <div className="grid gap-2.5">
              {DIALOGUE_PRESETS.map((preset, index) => {
                const badgeCls = CATEGORY_COLORS[preset.category] ?? 'border-[var(--app-line)] text-[var(--app-copy-muted)]';
                return (
                  <article key={preset.question} className="moon-preset-row">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 shrink-0 font-[var(--font-heading)] text-sm text-[var(--app-gold)]/50">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] tracking-[0.12em] ${badgeCls}`}>
                            {preset.category}
                          </span>
                          <span className="text-sm font-medium text-[var(--app-ivory)]">
                            {preset.question}
                          </span>
                        </div>
                        <p className="text-sm leading-7 text-[var(--app-copy)]">{preset.previewAnswer}</p>
                        <p className="mt-2 text-xs leading-6 text-[var(--app-copy-soft)]">{preset.followUp}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </article>

          <div className="flex flex-col gap-4">
            <article className="moon-lunar-panel p-6">
              <div className="app-starfield" />
              <div className="relative z-10">
                <div className="app-caption mb-4">이런 결로 답해드립니다</div>
                <div className="space-y-3">
                  {DIALOGUE_GUARDRAILS.map((rail) => (
                    <div
                      key={rail.title}
                      className="rounded-[1.15rem] border border-[var(--app-gold)]/14 bg-[var(--app-surface-muted)] px-4 py-4"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--app-gold)]/60" />
                        <div>
                          <div className="text-sm font-medium text-[var(--app-ivory)]">{rail.title}</div>
                          <p className="mt-1.5 text-sm leading-7 text-[var(--app-copy-muted)]">{rail.body}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <article className="app-panel p-5">
              <div className="app-caption mb-3">이용 방식</div>
              <div className="space-y-2">
                {[
                  ['✦', '처음 3회', '무료'],
                  ['○', '이후 3회 묶음', '코인 3개'],
                  ['◎', 'MY 프로필 등록', '명식 자동 적용'],
                ].map(([icon, label, value]) => (
                  <div key={label} className="flex items-center justify-between rounded-[0.9rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-[var(--font-heading)] text-sm text-[var(--app-gold)]/60">{icon}</span>
                      <span className="text-sm text-[var(--app-copy)]">{label}</span>
                    </div>
                    <span className="text-sm font-medium text-[var(--app-ivory)]">{value}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

      </div>
    </AppShell>
  );
}
