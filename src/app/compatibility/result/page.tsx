import Link from 'next/link';
import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import {
  COMPATIBILITY_PREMIUM_EXPANSION,
  COMPATIBILITY_RELATIONSHIPS,
  COMPATIBILITY_RESULT_LABELS,
} from '@/content/moonlight';
import SiteHeader from '@/features/shared-navigation/site-header';
import { AppShell } from '@/shared/layout/app-shell';

interface Props {
  searchParams: Promise<{ relationship?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '궁합 결과',
    description: '관계별 궁합 결과 화면입니다.',
  };
}

export default async function CompatibilityResultPage({ searchParams }: Props) {
  const { relationship } = await searchParams;
  const selected =
    COMPATIBILITY_RELATIONSHIPS.find((item) => item.slug === relationship) ??
    COMPATIBILITY_RELATIONSHIPS[1];

  const resultLabel = COMPATIBILITY_RESULT_LABELS[2];
  const premiumExpansion = COMPATIBILITY_PREMIUM_EXPANSION[selected.slug];

  return (
    <AppShell header={<SiteHeader />} className="pb-24 md:pb-12">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="app-hero-card p-7 text-center sm:p-8">
          <div className="text-sm text-[var(--app-jade)]">김영희 선생님 & 큰아들</div>
          <h1 className="mt-4 font-[var(--font-heading)] text-4xl text-[var(--app-ivory)] sm:text-5xl">
            두 분의 인연
          </h1>
          <div className="mt-5 inline-flex rounded-full border border-[var(--app-jade)]/35 bg-[var(--app-jade)]/10 px-4 py-2 text-sm text-[var(--app-jade)]">
            {resultLabel}
          </div>
          <p className="mt-4 text-sm leading-7 text-[var(--app-copy-muted)]">
            {selected.title} 관계를 기준으로, 오행의 흐름과 서로 주고받는 힘을 평어로 풀어냅니다.
          </p>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <article className="app-panel p-6">
            <div className="app-caption">두 분의 기운</div>
            <div className="mt-6 flex items-center justify-around">
              <div className="text-center">
                <div className="font-[var(--font-heading)] text-5xl text-[var(--app-coral)]">火</div>
                <div className="mt-2 text-sm text-[var(--app-copy)]">선생님</div>
                <div className="text-xs text-[var(--app-copy-muted)]">한낮의 태양</div>
              </div>
              <div className="text-3xl text-[var(--app-gold-soft)]">→</div>
              <div className="text-center">
                <div className="font-[var(--font-heading)] text-5xl text-[var(--app-jade)]">木</div>
                <div className="mt-2 text-sm text-[var(--app-copy)]">상대방</div>
                <div className="text-xs text-[var(--app-copy-muted)]">큰 나무</div>
              </div>
            </div>
            <div className="mt-6 rounded-[1.2rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 py-5 text-center text-sm leading-7 text-[var(--app-copy)]">
              <span className="text-[var(--app-jade)]">나무(木)가 불(火)을 지피는</span>
              <br />
              자연스러운 상생(相生) 관계입니다.
            </div>
          </article>

          <article className="space-y-4">
            <div className="rounded-[1.35rem] border-l-[3px] border-[var(--app-jade)] bg-[var(--app-surface-muted)] px-5 py-5">
              <div className="app-caption">서로에게 주는 힘</div>
              <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
                상대는 선생님의 따뜻함 속에서 힘을 얻고, 선생님은 상대의 성실함과 성장성을 통해
                위안을 받으실 수 있는 관계입니다.
              </p>
            </div>

            <div className="rounded-[1.35rem] border-l-[3px] border-[var(--app-coral)] bg-[var(--app-surface-muted)] px-5 py-5">
              <div className="app-caption">서로 조심하실 점</div>
              <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
                선생님의 한 마디가 상대에게는 꽤 오래 남을 수 있습니다. 표현의 강약을 한 템포
                줄이시면 관계의 온도가 한층 부드러워집니다.
              </p>
            </div>

            <div className="rounded-[1.35rem] border border-[var(--app-gold)]/24 bg-[linear-gradient(135deg,rgba(210,176,114,0.12),rgba(10,18,36,0.92))] px-5 py-5">
              <div className="app-caption">2026년 두 분의 흐름</div>
              <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
                올해는 상대가 한 걸음 더 나아가는 해입니다. 응원과 믿음을 말로 전해주시면, 두
                분의 관계가 더 깊고 단단해지는 흐름으로 이어집니다.
              </p>
            </div>
          </article>
        </section>

        <section className="mt-8 app-panel p-6">
          <div className="flex flex-wrap gap-3">
            {COMPATIBILITY_RESULT_LABELS.map((label) => (
              <Badge
                key={label}
                className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]"
              >
                {label}
              </Badge>
            ))}
          </div>
          <p className="mt-5 text-sm leading-7 text-[var(--app-copy-muted)]">
            숫자 점수 대신 평어를 쓰는 이유는, 가족과 배우자 관계에 상처가 남지 않도록 결과의
            결을 부드럽게 읽기 위함입니다.
          </p>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
          <article className="app-panel p-6">
            <div className="app-caption">프리미엄에서 더 읽는 내용</div>
            <div className="mt-5 space-y-4">
              {premiumExpansion.preview.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.2rem] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 py-5"
                >
                  <div className="font-[var(--font-heading)] text-2xl text-[var(--app-ivory)]">
                    {item.title}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">{item.body}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[1.75rem] border border-[var(--app-jade)]/28 bg-[linear-gradient(180deg,rgba(107,166,139,0.12),rgba(10,18,36,0.96))] p-6">
            <div className="app-caption">이 관계를 더 깊게 보고 싶다면</div>
            <div className="mt-4 font-[var(--font-heading)] text-3xl text-[var(--app-ivory)]">
              {premiumExpansion.ctaTitle}
            </div>
            <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
              {premiumExpansion.ctaBody}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/membership/checkout?plan=premium"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-jade)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:opacity-90"
              >
                프리미엄으로 이 관계 이어보기
              </Link>
              <Link
                href="/dialogue"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 text-sm text-[var(--app-ivory)] transition-colors hover:bg-[var(--app-surface-strong)]"
              >
                달빛선생께 더 물어보기
              </Link>
            </div>
          </article>
        </section>

        <section className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/compatibility/input?relationship=${selected.slug}`}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 text-sm text-[var(--app-copy)] transition-colors hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]"
          >
            입력으로 돌아가기
          </Link>
          <Link
            href="/membership/checkout?plan=premium"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-jade)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:opacity-90"
          >
            프리미엄으로 더 깊게 보기
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
