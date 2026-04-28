import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import SiteHeader from '@/features/shared-navigation/site-header';
import { AppPage, AppShell, PageHero } from '@/shared/layout/app-shell';
import {
  SAMPLE_DECISION_TRACE,
  SAMPLE_KEEP_VALUES,
  SAMPLE_REPORT_HERO,
  SAMPLE_SUBJECT,
  SAMPLE_SUMMARY,
  SAMPLE_TOC,
} from './sample-report.data';

export const metadata: Metadata = {
  title: '샘플 리포트',
  description:
    '달빛선생의 프리미엄 명리 리포트가 어떤 구조와 판정 근거로 펼쳐지는지 결제 전에 먼저 확인해보세요.',
  alternates: {
    canonical: '/sample-report',
  },
};

export default function SampleReportPage() {
  return (
    <AppShell header={<SiteHeader />}>
      <AppPage className="space-y-6">
        <PageHero
          badges={[
            <Badge
              key="sample"
              className="border-[var(--app-gold)]/24 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]"
            >
              {SAMPLE_REPORT_HERO.eyebrow}
            </Badge>,
            <Badge
              key="mock"
              className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]"
            >
              가상 인물 예시
            </Badge>,
          ]}
          title={SAMPLE_REPORT_HERO.title}
          description={SAMPLE_REPORT_HERO.description}
        />

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="moon-lunar-panel p-6 sm:p-7">
            <div className="app-starfield" />
            <div className="app-caption">샘플 대상</div>
            <h2 className="mt-3 font-display text-3xl text-[var(--app-gold-text)]">
              {SAMPLE_SUBJECT.label} {SAMPLE_SUBJECT.name}의 기준서 예시입니다
            </h2>
            <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
              {SAMPLE_SUBJECT.birth} · {SAMPLE_SUBJECT.place}
              <br />
              {SAMPLE_SUBJECT.note}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <section className="rounded-[20px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-4">
                <div className="app-caption">이 사주의 핵심 한 줄</div>
                <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">
                  {SAMPLE_SUMMARY.oneLine}
                </p>
              </section>
              <section className="rounded-[20px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-4">
                <div className="app-caption">유리한 선택 방식</div>
                <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">
                  {SAMPLE_SUMMARY.favorableChoice}
                </p>
              </section>
            </div>
          </article>

          <article className="app-panel p-6 sm:p-7">
            <div className="app-caption">다음 단계</div>
            <h2 className="mt-3 font-display text-3xl text-[var(--app-ivory)]">
              실제 리포트는 입력하신 출생 정보와 엔진 판정 기준에 따라 개별적으로 계산됩니다
            </h2>
            <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
              이 페이지는 계산 정확도를 시연하기보다, 달빛선생 리포트가 어디까지 펼쳐지는지
              결제 전에 먼저 보여드리기 위한 미리보기입니다.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/saju/new"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-gold)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-bright)]"
              >
                내 명리 기준서 만들기
              </Link>
              <Link
                href="/about-engine"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 text-sm text-[var(--app-copy)] transition-colors hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]"
              >
                엔진 기준서 보기
              </Link>
            </div>
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="app-panel p-6 sm:p-7">
            <div className="app-caption">올해 가장 강한 주제 3개</div>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-[var(--app-copy)]">
              {SAMPLE_SUMMARY.strongTopics.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-[var(--app-gold)]">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="app-panel p-6 sm:p-7">
            <div className="app-caption">조심해야 할 패턴 3개</div>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-[var(--app-copy)]">
              {SAMPLE_SUMMARY.cautionPatterns.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-[var(--app-gold)]">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="app-panel p-6 sm:p-7">
          <div className="app-caption">리포트 목차</div>
          <h2 className="mt-3 font-display text-3xl text-[var(--app-ivory)]">
            한 번의 해석이 어디까지 이어지는지, 14개 대섹션으로 먼저 보여드립니다
          </h2>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {SAMPLE_TOC.map((item, index) => (
              <article
                key={item}
                className="rounded-[20px] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-4"
              >
                <div className="flex items-start gap-3">
                  <span className="font-hanja text-sm text-[var(--app-gold)]/75">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="text-sm leading-7 text-[var(--app-copy)]">{item}</div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <article className="app-panel p-6 sm:p-7">
            <div className="app-caption">판정 근거 미리보기</div>
            <h2 className="mt-3 font-display text-3xl text-[var(--app-ivory)]">
              왜 이렇게 읽는지 남기는 구조가 달빛선생 리포트의 중심입니다
            </h2>
            <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
              실제 리포트에서는 양력/음력 변환, 시간 보정, 격국 후보, 용신 판단, 현재 운 연결을
              순서대로 펼쳐서 볼 수 있습니다.
            </p>

            <div className="mt-5 space-y-3">
              {SAMPLE_DECISION_TRACE.map((item) => (
                <details
                  key={item.step}
                  className="rounded-[18px] border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-4 py-4"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="font-hanja text-sm text-[var(--app-gold)]/75">{item.step}</span>
                      <span className="text-sm font-semibold text-[var(--app-ivory)]">{item.title}</span>
                    </div>
                    <span className="rounded-full border border-[var(--app-line)] px-3 py-1 text-xs text-[var(--app-copy-soft)]">
                      {item.confidence}
                    </span>
                  </summary>
                  <p className="mt-4 text-sm leading-7 text-[var(--app-copy)]">{item.result}</p>
                </details>
              ))}
            </div>
          </article>

          <article className="moon-lunar-panel p-6 sm:p-7">
            <div className="app-starfield" />
            <div className="app-caption">소장 가치 미리보기</div>
            <h2 className="mt-3 font-display text-3xl text-[var(--app-gold-text)]">
              한 번 읽고 끝나는 결과가 아니라, 다시 확인할 수 있는 기준서로 남기려 합니다
            </h2>

            <div className="mt-5 grid gap-3">
              {SAMPLE_KEEP_VALUES.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.04)] px-4 py-4"
                >
                  <div className="text-sm font-semibold text-[var(--app-ivory)]">{item.title}</div>
                  <p className="mt-2 text-sm leading-7 text-[var(--app-copy)]">{item.body}</p>
                </article>
              ))}
            </div>
          </article>
        </section>

        <section className="app-hero-card p-6 sm:p-7">
          <div className="app-caption">마지막 확인</div>
          <h2 className="mt-3 font-display text-3xl text-[var(--app-ivory)]">
            샘플 구조를 보셨다면, 이제 선생님의 기준서를 직접 만들어보셔도 좋습니다
          </h2>
          <p className="app-body-copy mt-4 max-w-3xl">
            실제 결과는 입력하신 출생 정보와 시간 기준에 따라 개별적으로 계산됩니다. 결제 전에는
            엔진 기준서와 멤버십 차이도 함께 살펴보실 수 있습니다.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/saju/new"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-gold)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-bright)]"
            >
              내 명리 기준서 만들기
            </Link>
            <Link
              href="/membership"
              className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 text-sm text-[var(--app-copy)] transition-colors hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]"
            >
              프리미엄 기준 보기
            </Link>
          </div>
        </section>
      </AppPage>
    </AppShell>
  );
}
