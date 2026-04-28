import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import SiteHeader from '@/features/shared-navigation/site-header';
import { AppPage, AppShell, PageHero } from '@/shared/layout/app-shell';

export const metadata: Metadata = {
  title: '엔진 기준서',
  description: '달빛선생이 사주를 계산하고 설명하는 기준을 한곳에 정리한 페이지입니다.',
  alternates: { canonical: '/about-engine' },
};

const ENGINE_BADGES = [
  '절기 기준 명식',
  '출생지 시간 보정',
  '격국 · 용신 · 대운',
  'AI 설명 레이어',
] as const;

const ENGINE_PRINCIPLES = [
  {
    title: '왜 AI만으로 사주를 보지 않나요?',
    body:
      '사주 해석에서 가장 크게 흔들리는 부분은 말투가 아니라 판정 기준입니다. 달빛선생은 명식과 운의 구조를 AI에게 맡기지 않고, 먼저 계산 엔진으로 고정한 뒤 설명만 AI가 맡도록 분리합니다.',
  },
  {
    title: '계산과 설명은 어떻게 나뉘나요?',
    body:
      '출생 정보가 들어오면 명식, 강약, 격국, 용신, 대운·세운을 먼저 계산합니다. 그다음 선생의 말투는 이미 계산된 구조를 사용자가 이해하기 쉬운 문장으로만 풀어냅니다.',
  },
  {
    title: '말투가 달라도 기준은 왜 같나요?',
    body:
      '여선생과 남선생은 설명의 결만 다르고, 판정에 쓰는 엔진은 같습니다. 그래서 선생을 바꿔도 격국, 용신, 현재 운의 핵심 구조가 뒤집히지 않도록 설계했습니다.',
  },
] as const;

const TIME_RULES = [
  {
    label: '표준시',
    body: '기본적인 출생 시각 기준입니다. 출생지 보정이 필요하지 않을 때 가장 먼저 씁니다.',
  },
  {
    label: '진태양시',
    body: '출생지 경도를 반영해 분 단위 시간을 보정합니다. 절기와 시주 경계가 가까운 경우 더 정밀한 기준이 됩니다.',
  },
  {
    label: '야자시 / 조자시',
    body: '자시를 어느 날에 붙여 읽을지에 대한 규칙입니다. 경계 시간에 따라 일주나 시주 해석이 달라질 수 있어 선택 기준을 분리해 둡니다.',
  },
] as const;

const DECISION_STEPS = [
  '양력/음력 변환과 절기 기준 확인',
  '출생지와 시간 규칙에 따른 시각 보정',
  '월령, 투출, 강약 순서로 격국 후보 검토',
  '격국·강약·계절성을 묶어 용신/희신/기신 판정',
  '대운·세운·월운을 현재 질문과 연결',
  '논쟁적 해석은 참고 단계로 낮춰 표시',
] as const;

const SAFETY_RULES = [
  '의료, 법률, 투자, 위기 판단은 사주 해석과 분리합니다.',
  '길흉을 공포스럽게 단정하지 않습니다.',
  '출생시각이 불명확하면 시주 판단을 줄이고 일간·월령·현재 운 중심으로 읽습니다.',
  '대화 중에도 격국·용신을 새로 추측하지 않고 계산된 결과를 설명합니다.',
] as const;

const VERSION_FIELDS = [
  'engine_version',
  'rule_set_version',
  'birth_input_snapshot',
  'decision_trace',
  'llm_model',
  'prompt_version',
] as const;

export default function AboutEnginePage() {
  return (
    <AppShell header={<SiteHeader />}>
      <AppPage className="space-y-6">
        <PageHero
          badges={ENGINE_BADGES.map((item) => (
            <Badge
              key={item}
              className="border-[var(--app-gold)]/24 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]"
            >
              {item}
            </Badge>
          ))}
          title="달빛선생은 어떻게 사주를 계산하나요?"
          description={
            <>
              달빛선생은 AI가 사주를 맞히는 서비스가 아니라, 계산된 명리 구조를 AI가 이해하기 쉽게
              설명하는 서비스입니다. 계산은 엔진이 먼저 맡고, 선생의 말투는 그 결과를 풀어내는
              설명 레이어로만 사용합니다.
            </>
          }
        />

        <section className="grid gap-4 lg:grid-cols-3">
          {ENGINE_PRINCIPLES.map((item) => (
            <article key={item.title} className="app-panel p-6">
              <div className="app-caption">제품 원칙</div>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--app-ivory)]">{item.title}</h2>
              <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">{item.body}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <article className="moon-lunar-panel p-6 sm:p-7">
            <div className="app-starfield" />
            <div className="app-caption">시간 기준</div>
            <h2 className="mt-3 text-3xl font-semibold text-[var(--app-ivory)]">
              출생시각과 출생지는 왜 끝까지 묻나요?
            </h2>
            <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
              사주는 시주와 절기 경계에서 몇 분 차이로도 해석의 중심이 달라질 수 있습니다. 그래서
              달빛선생은 시간이 정확한 경우 분 단위 출생시각과 출생지를 함께 보고, 시간이 불확실할 때는
              시주 해석을 줄여 안전한 기준으로 읽습니다.
            </p>
            <div className="mt-5 grid gap-3">
              {TIME_RULES.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-4"
                >
                  <div className="text-sm font-semibold text-[var(--app-ivory)]">{item.label}</div>
                  <p className="mt-2 text-sm leading-7 text-[var(--app-copy)]">{item.body}</p>
                </div>
              ))}
            </div>
          </article>

          <article id="decision-trace" className="app-panel p-6 sm:p-7">
            <div className="app-caption">판정 근거 보기</div>
            <h2 className="mt-3 text-3xl font-semibold text-[var(--app-ivory)]">
              리포트에서는 이 순서대로 근거를 펼쳐드립니다
            </h2>
            <div className="mt-5 space-y-3">
              {DECISION_STEPS.map((item, index) => (
                <div
                  key={item}
                  className="rounded-[18px] border border-[var(--app-line)] bg-[rgba(7,9,16,0.28)] px-4 py-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 font-[var(--font-heading)] text-sm text-[var(--app-gold)]/60">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <p className="text-sm leading-7 text-[var(--app-copy)]">{item}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-7 text-[var(--app-copy-muted)]">
              실제 결과 화면에서는 강약 점수, 격국 후보, 용신 후보, KASI 대조, 참고 해석 여부까지 함께
              보여드리며, 긴 문장보다 판정 기준을 먼저 확인할 수 있게 구성합니다.
            </p>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <article className="app-panel p-6 sm:p-7">
            <div className="app-caption">격국 · 용신 기준</div>
            <h2 className="mt-3 text-3xl font-semibold text-[var(--app-ivory)]">
              격국과 용신은 말맛이 아니라 판정 순서에서 갈립니다
            </h2>
            <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
              달빛선생은 월령, 투출, 강약, 계절성을 함께 보고 격국과 용신을 판정합니다. 계산이 어려운
              구간은 “참고 해석”으로 낮춰 표시하고, 다른 학파에서 해석이 갈릴 수 있는 지점도 숨기지
              않습니다.
            </p>
            <div className="mt-5 rounded-[20px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-5 py-5">
              <div className="app-caption text-[var(--app-gold-soft)]">리포트에서 보이는 항목</div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {[
                  '강약 점수와 판정 근거',
                  '격국 후보와 최종 격국',
                  '용신 / 희신 / 기신',
                  '대운 · 세운 · 월운 연결',
                  'KASI 대조 여부',
                  '참고 해석 / 논쟁적 해석 표시',
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm text-[var(--app-copy)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="moon-lunar-panel p-6 sm:p-7">
            <div className="app-starfield" />
            <div className="app-caption">고전 근거와 안전 원칙</div>
            <h2 className="mt-3 text-3xl font-semibold text-[var(--app-ivory)]">
              원전은 근거로 쓰고, 단정은 낮춥니다
            </h2>
            <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
              고전 인용은 리포트의 분위기를 꾸미는 장식이 아니라, 왜 이런 판정이 나왔는지 보여주는
              근거입니다. 동시에 의료·법률·투자·위기상황처럼 높은 책임이 필요한 판단은 사주 해석과
              분리합니다.
            </p>
            <div className="mt-5 space-y-2">
              {SAFETY_RULES.map((item) => (
                <div
                  key={item}
                  className="rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm leading-7 text-[var(--app-copy)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="app-panel p-6 sm:p-7">
            <div className="app-caption">버전과 업데이트</div>
            <h2 className="mt-3 text-3xl font-semibold text-[var(--app-ivory)]">
              계산 기준이 바뀌어도 다시 추적할 수 있게 남깁니다
            </h2>
            <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
              리포트 저장 시에는 엔진 버전, 규칙 버전, 입력 스냅샷, 판정 흐름, 설명 레이어 버전을 함께
              남깁니다. 같은 명식이라도 기준이 어떻게 바뀌었는지 추적할 수 있어야 신뢰가 유지된다고 보기
              때문입니다.
            </p>
            <div className="mt-5 rounded-[20px] border border-[var(--app-line)] bg-[rgba(7,9,16,0.32)] px-5 py-5">
              <div className="app-caption text-[var(--app-gold-soft)]">저장 메타데이터 예시</div>
              <div className="mt-4 grid gap-2 font-mono text-xs leading-6 text-[var(--app-copy)]">
                {VERSION_FIELDS.map((item) => (
                  <div key={item}>{item}</div>
                ))}
              </div>
            </div>
          </article>

          <article className="moon-lunar-panel p-6 sm:p-7">
            <div className="app-starfield" />
            <div className="app-caption">바로 이어보기</div>
            <h2 className="mt-3 text-3xl font-semibold text-[var(--app-gold-text)]">
              기준서를 읽었다면, 이제 해석을 같은 눈으로 보실 수 있습니다
            </h2>
            <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">
              달빛선생은 AI가 사주를 맞히는 서비스가 아니라, 계산된 명리 구조를 AI가 이해하기 쉽게
              설명하는 서비스입니다. 실제 리포트와 심층 결과에서는 이 기준이 그대로 드러나도록
              설계돼 있습니다.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/saju/new"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-gold)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-bright)]"
              >
                사주 시작하기
              </Link>
              <Link
                href="/membership"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-gold)]/35 bg-[var(--app-gold)]/12 px-5 text-sm text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/18"
              >
                멤버십 기준 보기
              </Link>
            </div>
          </article>
        </section>
      </AppPage>
    </AppShell>
  );
}
