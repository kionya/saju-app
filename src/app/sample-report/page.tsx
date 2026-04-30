import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { SafetyNotice } from "@/components/common/safety-notice";
import { TrackedLink } from "@/components/common/tracked-link";
import { SpecialistMentorGrid } from "@/components/counselor/specialist-mentor-grid";
import { DecisionTracePanel } from "@/components/report/decision-trace-panel";
import { ReportKeepsakeSection } from "@/components/report/report-keepsake-section";
import { ActionCluster } from "@/components/layout/action-cluster";
import { BulletList } from "@/components/layout/bullet-list";
import { EvidenceStrip } from "@/components/layout/evidence-strip";
import { FeatureCard } from "@/components/layout/feature-card";
import { ProductGrid } from "@/components/layout/product-grid";
import { SectionHeader } from "@/components/layout/section-header";
import { SectionSurface } from "@/components/layout/section-surface";
import { SupportRail } from "@/components/layout/support-rail";
import SiteHeader from "@/features/shared-navigation/site-header";
import { AppPage, AppShell, PageHero } from "@/shared/layout/app-shell";
import {
  SAMPLE_DECISION_TRACE,
  SAMPLE_PREVIEW_GUIDE,
  SAMPLE_REPORT_HERO,
  SAMPLE_REPORT_SCOPE,
  SAMPLE_REPORT_TEASERS,
  SAMPLE_SUBJECT,
  SAMPLE_SUMMARY,
  SAMPLE_TOC,
} from "./sample-report.data";

export const metadata: Metadata = {
  title: "샘플 리포트",
  description:
    "달빛선생의 프리미엄 명리 리포트가 어떤 구조와 판정 근거로 펼쳐지는지 결제 전에 먼저 확인해보세요.",
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
          <SectionSurface as="article" surface="lunar">
            <div className="app-starfield" />
            <SectionHeader
              eyebrow="샘플 대상"
              title={`${SAMPLE_SUBJECT.label} ${SAMPLE_SUBJECT.name}의 기준서 예시입니다`}
              titleClassName="text-3xl text-[var(--app-gold-text)]"
              description={
                <>
                  {SAMPLE_SUBJECT.birth} · {SAMPLE_SUBJECT.place}
                  <br />
                  {SAMPLE_SUBJECT.note}
                </>
              }
              descriptionClassName="text-[var(--app-copy)]"
              actions={
                <ActionCluster>
                  <TrackedLink
                    href="/saju/new"
                    eventName="sample_report_start_click"
                    eventParams={{ from: "sample_report_hero" }}
                    className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-gold)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-bright)]"
                  >
                    내 명리 기준서 만들기
                  </TrackedLink>
                  <TrackedLink
                    href="/about-engine"
                    eventName="sample_report_engine_click"
                    eventParams={{ from: "sample_report_hero" }}
                    className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 text-sm text-[var(--app-copy)] transition-colors hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]"
                  >
                    계산 기준서 보기
                  </TrackedLink>
                </ActionCluster>
              }
            />

            <p className="app-body-copy mt-6 max-w-3xl">
              이 미리보기는 계산 정확도 시연보다, 실제로 받게 될 결과물이 어떤 순서와 밀도로
              펼쳐지는지 먼저 보여드리는 브로셔형 예시입니다.
            </p>

            <ProductGrid columns={3} className="mt-6">
              {SAMPLE_REPORT_TEASERS.map((item) => (
                <FeatureCard
                  key={item.label}
                  surface="soft"
                  eyebrow={item.label}
                  description={item.body}
                />
              ))}
            </ProductGrid>
          </SectionSurface>

          <SupportRail
            eyebrow="이 미리보기에서 먼저 보는 것"
            title="결과 흐름을 먼저 짧게 훑어보실 수 있습니다"
            description="달빛선생 리포트는 한 줄 요약에서 끝나지 않고, 판정 근거와 소장 가치까지 한 번에 이어지는 구조로 설계했습니다."
          >
            <BulletList items={SAMPLE_PREVIEW_GUIDE} />
            <div className="mt-5 rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-4 text-sm leading-7 text-[var(--app-copy-soft)]">
              실제 리포트는 입력하신 출생 정보와 계산 기준에 따라 달라지며, 이 페이지는
              결과물의 깊이와 위계를 먼저 확인하실 수 있도록 준비한 미리보기입니다.
            </div>
          </SupportRail>
        </section>

        <SectionSurface surface="panel">
          <SectionHeader
            eyebrow="1분 미리보기"
            title="리포트 첫 1분 안에 무엇을 확인하게 되는지 먼저 보여드립니다"
            titleClassName="text-3xl"
            description="처음부터 긴 본문을 펼치기보다, 핵심 요약과 조심할 패턴, 유리한 선택 방식을 먼저 보게 되는 흐름입니다."
            descriptionClassName="text-[var(--app-copy)]"
          />

          <ProductGrid columns={2} className="mt-6">
            <FeatureCard surface="soft" eyebrow="이 사주의 핵심 한 줄" description={SAMPLE_SUMMARY.oneLine} />
            <FeatureCard surface="soft" eyebrow="유리한 선택 방식" description={SAMPLE_SUMMARY.favorableChoice} />
            <FeatureCard
              surface="soft"
              eyebrow="올해 가장 강한 주제 3개"
              children={<BulletList items={SAMPLE_SUMMARY.strongTopics} />}
            />
            <FeatureCard
              surface="soft"
              eyebrow="조심해야 할 패턴 3개"
              children={<BulletList items={SAMPLE_SUMMARY.cautionPatterns} />}
            />
          </ProductGrid>
        </SectionSurface>

        <SectionSurface surface="panel">
          <SectionHeader
            eyebrow="기준서 구성"
            title="한 권의 기준서가 어떻게 펼쳐지는지, 14개 대섹션으로 압축해 보여드립니다"
            titleClassName="text-3xl"
            description="샘플 기준서는 한 줄 총평에서 시작해 원국, 운의 흐름, 실행 전략, 판정 로그까지 한 번의 해석을 순서대로 이어가도록 설계했습니다."
            descriptionClassName="text-[var(--app-copy)]"
          />

          <div className="mt-6 grid gap-6 lg:grid-cols-[0.86fr_1.14fr]">
            <div className="space-y-4">
              <p className="app-body-copy">
                실제 결과 화면에서는 모든 항목을 한 번에 길게 밀어내기보다, 먼저 핵심을 짚고
                필요할 때 더 깊은 층으로 들어가도록 위계를 나눕니다.
              </p>
              <EvidenceStrip items={SAMPLE_REPORT_SCOPE} />
            </div>

            <ol className="grid gap-3 md:grid-cols-2">
              {SAMPLE_TOC.map((item, index) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm leading-7 text-[var(--app-copy)]"
                >
                  <span className="font-hanja text-sm text-[var(--app-gold)]/75">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </SectionSurface>

        <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <SectionSurface as="article" surface="panel">
            <SectionHeader
              eyebrow="판정 근거 미리보기"
              title="왜 이렇게 읽는지, 결과 옆에서 바로 펼쳐볼 수 있습니다"
              titleClassName="text-3xl"
              description="달빛선생은 중심 결론만 보여드리지 않고, 어떤 순서로 검토했는지를 결과 화면 안에서 함께 남겨둡니다."
              descriptionClassName="text-[var(--app-copy)]"
            />
            <div className="mt-6">
              <DecisionTracePanel
                metadata={{
                  decisionTrace: SAMPLE_DECISION_TRACE,
                }}
                timeRule="표준시 기준"
                compact
              />
            </div>
          </SectionSurface>

          <SectionSurface as="article" surface="lunar">
            <div className="app-starfield" />
            <SectionHeader
              eyebrow="고전과 생활 언어"
              title="원전 인용과 현대 해석은 같은 층으로 섞지 않습니다"
              titleClassName="text-3xl text-[var(--app-gold-text)]"
              description="한자와 고전 원문은 맥락을 보여주는 층으로, 생활 언어 해석은 실행에 옮기기 위한 층으로 나누어 제시합니다."
              descriptionClassName="text-[var(--app-copy)]"
            />
            <blockquote className="mt-5 rounded-[20px] border border-[var(--app-gold)]/16 bg-[var(--app-gold)]/8 px-5 py-5 font-classic text-base leading-8 text-[var(--app-gold-text)]">
              用神은 부족한 오행을 기계적으로 채우는 표기가 아니라, 격국과 계절, 강약의
              균형을 함께 보고 판단하는 보완 축입니다.
            </blockquote>
            <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
              실제 리포트에서는 <span className="font-hanja">甲木 · 用神 · 格局</span> 같은
              표기를 별도 역할로 보여주고, 고전 원문은 해석문과 섞지 않고 분리해 제시합니다.
            </p>
          </SectionSurface>
        </section>

        <ReportKeepsakeSection />

        <SectionSurface surface="hero">
          <SectionHeader
            eyebrow="다음 단계"
            title="샘플 구조가 마음에 드셨다면, 이제 선생님의 기준서를 직접 만들어보셔도 좋습니다"
            titleClassName="text-3xl"
            description="실제 결과는 입력하신 출생 정보, 시간 기준, 판정 근거에 따라 개별적으로 계산됩니다. 어떤 질문을 먼저 풀고 싶은지에 따라 전문 선생과 리포트의 방향도 함께 고르실 수 있습니다."
            descriptionClassName="text-[var(--app-copy)]"
            actions={
              <ActionCluster>
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
              </ActionCluster>
            }
          />

          <div className="mt-6 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <EvidenceStrip
              items={[
                {
                  title: "개별 계산",
                  body: "실제 리포트는 출생 정보와 시간 기준에 따라 새로 계산되며, 이 샘플 문구를 그대로 복사하지 않습니다.",
                },
                {
                  title: "전환 전 확인",
                  body: "샘플 리포트와 멤버십 기준을 먼저 확인한 뒤, 필요한 경우 대화형 상담으로 이어볼 수 있습니다.",
                },
              ]}
            />

            <div className="rounded-[24px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-5 py-5 sm:px-6 sm:py-6">
              <SpecialistMentorGrid
                showHeader={false}
                className="text-left"
              />
            </div>
          </div>
        </SectionSurface>

        <SafetyNotice className="mb-2" />
      </AppPage>
    </AppShell>
  );
}
