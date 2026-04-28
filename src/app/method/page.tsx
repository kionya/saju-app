import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/features/shared-navigation/site-header';
import { Badge } from '@/components/ui/badge';
import { AppPage, AppShell, PageHero } from '@/shared/layout/app-shell';
import { ENGINE_METHOD_ENTRIES } from '@/lib/engine-method-pages';

export const metadata: Metadata = {
  title: '엔진 읽을거리 | 달빛선생',
  description:
    'AI 사주가 왜 흔들리는지, 진태양시가 무엇인지, 용신 계산이 왜 어려운지 달빛선생 기준으로 풀어낸 읽을거리 모음입니다.',
  alternates: {
    canonical: '/method',
  },
  openGraph: {
    title: '달빛선생 엔진 읽을거리',
    description:
      '엔진 기준서와 함께 읽으면 좋은 AI 사주·진태양시·용신 해설 글을 모았습니다.',
    url: 'https://saju-app-lac.vercel.app/method',
    siteName: '달빛선생',
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function MethodIndexPage() {
  return (
    <AppShell header={<SiteHeader />}>
      <AppPage className="space-y-6">
        <PageHero
          badges={[
            <Badge
              key="method-guide"
              className="border-[var(--app-gold)]/24 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]"
            >
              엔진 읽을거리
            </Badge>,
            <Badge key="seo" className="border-white/10 bg-white/5 text-white/70">
              AI 사주 · 진태양시 · 용신 해설
            </Badge>,
          ]}
          title="기준서를 읽고 나면, 다음 질문이 더 선명해집니다"
          description={
            <>
              달빛선생 엔진 기준서를 바탕으로, 실제 사용자들이 가장 많이 궁금해하는 지점을 따로 풀어낸
              읽을거리입니다. “왜 AI마다 결과가 다른지”, “왜 출생지와 분 단위 시간이 필요한지”, “왜
              용신 계산이 어려운지”를 일반 사용자 언어로 정리했습니다.
            </>
          }
        />

        <section className="grid gap-4 lg:grid-cols-3">
          {ENGINE_METHOD_ENTRIES.map((entry) => (
            <Link
              key={entry.slug}
              href={`/method/${entry.slug}`}
              className="app-panel block p-6 transition-colors hover:bg-[rgba(255,255,255,0.05)]"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-[var(--app-gold)]/20 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]">
                  {entry.eyebrow}
                </Badge>
                <Badge className="border-white/10 bg-white/5 text-white/62">기준서 연계 글</Badge>
              </div>
              <h2 className="mt-5 text-3xl font-semibold text-[var(--app-ivory)]">{entry.title}</h2>
              <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">{entry.summary}</p>
              <div className="mt-5 rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-4 text-sm leading-7 text-[var(--app-copy-soft)]">
                {entry.question}
              </div>
              <div className="mt-5 text-sm font-semibold text-[var(--app-gold-text)]">상세 읽기</div>
            </Link>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="app-panel p-6 sm:p-7">
            <div className="app-caption">이런 분께 먼저 권합니다</div>
            <div className="mt-5 grid gap-3">
              {[
                '같은 생년월일인데 AI마다 격국과 용신이 다르게 나와 혼란스러웠던 경우',
                '출생지와 분 단위 시간을 왜 묻는지 납득이 잘 안 갔던 경우',
                '긴 리포트보다 먼저 계산 기준과 판정 근거를 확인하고 싶은 경우',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[18px] border border-[var(--app-line)] bg-[rgba(7,9,16,0.28)] px-4 py-4 text-sm leading-7 text-[var(--app-copy)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </article>

          <article className="moon-lunar-panel p-6 sm:p-7">
            <div className="app-starfield" />
            <div className="app-caption">바로 이어보기</div>
            <h2 className="mt-3 text-3xl font-semibold text-[var(--app-ivory)]">
              읽은 기준을 바로 리포트에서 확인해보세요
            </h2>
            <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
              기준서와 읽을거리는 설명의 문을 여는 역할입니다. 실제 결과 화면에서는 같은 기준이 판정
              근거, KASI 대조, 연간/평생 리포트 메타데이터로 이어집니다.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/about-engine"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-gold)]/35 bg-[var(--app-gold)]/12 px-5 text-sm text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/18"
              >
                엔진 기준서 보기
              </Link>
              <Link
                href="/saju/new"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-gold)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-bright)]"
              >
                사주 시작하기
              </Link>
            </div>
          </article>
        </section>
      </AppPage>
    </AppShell>
  );
}
