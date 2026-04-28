import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import SiteHeader from "@/features/shared-navigation/site-header";
import { AppPage, AppShell, PageHero } from "@/shared/layout/app-shell";

const SAMPLE_REPORT_TARGET = "/saju/1982-1-29-8-male/premium?targetYear=2026";

const SAMPLE_SECTIONS = [
  "한 줄 총평과 올해의 강한 주제",
  "격국 후보와 최종 판정 근거",
  "용신 · 희신 · 기신 정리",
  "대운 · 세운 · 월운 연결",
  "PDF 저장과 MY 보관함 재열람",
] as const;

export const metadata: Metadata = {
  title: "샘플 기준서",
  description:
    "달빛선생의 명리 기준서가 어떤 구조와 판정 근거로 펼쳐지는지 결제 전에 미리 살펴보세요.",
  alternates: {
    canonical: "/sample-report",
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
              샘플 기준서
            </Badge>,
            <Badge
              key="preview"
              className="border-[var(--app-line)] bg-[var(--app-surface-muted)] text-[var(--app-copy-muted)]"
            >
              결제 전 미리보기
            </Badge>,
          ]}
          title="당신의 사주를 한 권의 기준서로 남기는 방식부터 먼저 보셔도 괜찮습니다"
          description="샘플 기준서는 명식 계산 결과를 어떻게 펼쳐 보이는지, 판정 근거와 PDF·보관함 가치가 어떤 순서로 이어지는지 확인하기 위한 미리보기 화면입니다."
        />

        <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <article className="moon-lunar-panel p-6 sm:p-7">
            <div className="app-starfield" />
            <div className="app-caption">샘플 기준서에서 먼저 보이는 것</div>
            <h2 className="mt-3 font-display text-3xl text-[var(--app-gold-text)]">
              길이보다 먼저, 판정 근거와 소장 가치가 보이도록 구성했습니다
            </h2>
            <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
              달빛선생의 기준서는 한 줄 총평에서 끝나지 않습니다. 강약, 격국 후보, 용신 후보,
              현재 운 연결, PDF 저장, MY 보관함 재열람까지 한 번의 읽기 흐름으로 이어집니다.
            </p>

            <div className="mt-5 grid gap-3">
              {SAMPLE_SECTIONS.map((item, index) => (
                <div
                  key={item}
                  className="rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="font-hanja text-sm text-[var(--app-gold)]/70">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="text-sm leading-7 text-[var(--app-copy)]">{item}</div>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="app-panel p-6 sm:p-7">
            <div className="app-caption">인용 미리보기</div>
            <h2 className="mt-3 font-display text-3xl text-[var(--app-ivory)]">
              고전 원문과 현대 해석은 같은 결이 아니라, 다른 층으로 나누어 보여드립니다
            </h2>
            <blockquote className="mt-5 rounded-[20px] border border-[var(--app-gold)]/16 bg-[var(--app-gold)]/8 px-5 py-5 font-classic text-base leading-8 text-[var(--app-gold-text)]">
              用神은 부족한 오행을 기계적으로 채우는 표기가 아니라, 격국과 계절, 강약의 균형을
              함께 보고 판단하는 보완 축입니다.
            </blockquote>
            <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
              실제 기준서에서는 고전 원문, 한글 풀이, 판정 근거, 참고 해석 여부를 나누어 보여주며,
              한자 표기는 <span className="font-hanja">甲木 · 用神 · 格局</span>처럼 glyph가
              흔들리지 않도록 별도 역할을 둡니다.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={SAMPLE_REPORT_TARGET}
                className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-gold)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-bright)]"
              >
                샘플 기준서 열기
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
      </AppPage>
    </AppShell>
  );
}
