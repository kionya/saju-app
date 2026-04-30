import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ActionCluster } from '@/components/layout/action-cluster';
import { BulletList } from '@/components/layout/bullet-list';
import { EvidenceStrip } from '@/components/layout/evidence-strip';
import { FeatureCard } from '@/components/layout/feature-card';
import { ProductGrid } from '@/components/layout/product-grid';
import { SectionHeader } from '@/components/layout/section-header';
import { SectionSurface } from '@/components/layout/section-surface';
import { SupportRail } from '@/components/layout/support-rail';
import SiteHeader from '@/features/shared-navigation/site-header';
import { ENGINE_METHOD_ENTRIES } from '@/lib/engine-method-pages';
import { AppPage, AppShell, PageHero } from '@/shared/layout/app-shell';

export const metadata: Metadata = {
  title: '달빛선생 엔진 기준서 | AI 사주 계산 기준',
  description:
    '달빛선생이 AI 사주를 어떻게 계산하고 설명하는지, 진태양시·격국·용신·대운 판정 기준과 리포트 근거 구조를 정리한 엔진 기준서입니다.',
  keywords: [
    'AI 사주',
    '사주 계산 기준',
    '진태양시 사주',
    '격국 판정',
    '용신 계산',
    '대운 세운',
    '달빛선생 엔진 기준서',
  ],
  alternates: { canonical: '/about-engine' },
  openGraph: {
    title: '달빛선생 엔진 기준서',
    description:
      '명식 계산은 엔진이 먼저 맡고, AI는 계산된 구조를 설명하는 역할만 한다는 달빛선생의 기준을 정리했습니다.',
    url: 'https://saju-app-lac.vercel.app/about-engine',
    siteName: '달빛선생',
    locale: 'ko_KR',
    type: 'article',
  },
};

const ENGINE_BADGES = [
  'AI 사주 계산 기준',
  '진태양시 · 절기 · 자시 규칙',
  '격국 · 용신 · 대운 판정',
  '판정 근거 · KASI 대조 · 메타데이터',
] as const;

const PAGE_SECTIONS = [
  { href: '#why-not-just-ai', label: '왜 AI만으로 보지 않나' },
  { href: '#time-precision', label: '출생시각·출생지 정밀도' },
  { href: '#decision-trace', label: '판정 근거 펼치기' },
  { href: '#report-ux', label: '리포트에서 무엇이 보이나' },
  { href: '#metadata', label: '엔진 버전과 저장 메타' },
  { href: '#faq', label: '자주 묻는 질문' },
] as const;

const ENGINE_PRINCIPLES = [
  {
    title: '명식 계산은 엔진이 먼저 맡습니다',
    body:
      '달빛선생은 출생 정보로 명식과 운의 구조를 먼저 계산합니다. 격국, 용신, 대운처럼 결과를 크게 바꾸는 항목은 AI가 대화 중에 새로 추측하지 않도록 분리합니다.',
  },
  {
    title: 'AI는 설명 레이어로만 사용합니다',
    body:
      '선생의 말투는 이미 계산된 구조를 이해하기 쉬운 문장으로 풀어내는 역할만 합니다. 그래서 여선생과 남선생은 표현의 결만 다르고, 계산 기준은 같습니다.',
  },
  {
    title: '판정 기준은 리포트 안에 드러나야 합니다',
    body:
      '좋은 사주 리포트는 길이보다 기준이 중요합니다. 달빛선생은 강약 점수, 격국 후보, 용신 후보, KASI 대조, 참고 해석 여부를 함께 보여주는 쪽을 택합니다.',
  },
] as const;

const COMPARISON_ROWS = [
  [
    '명식 계산',
    '대화 문맥만으로 간지나 오행을 추측할 수 있습니다.',
    '출생 정보로 먼저 명식과 운의 구조를 계산합니다.',
  ],
  [
    '격국·용신',
    '프롬프트 길이와 모델 스타일에 따라 설명이 흔들릴 수 있습니다.',
    '월령, 투출, 강약, 계절성을 같이 보고 고정된 순서로 판정합니다.',
  ],
  [
    '시간 처리',
    '입력된 시각을 그대로 소비하는 경우가 많습니다.',
    '출생지, 진태양시, 야자시, 조자시를 분리해 적용합니다.',
  ],
  [
    '리포트 근거',
    '긴 문장은 많아도 왜 그렇게 읽었는지 숨겨질 수 있습니다.',
    '판정 근거, KASI 대조, 참고 해석 여부를 함께 보여줍니다.',
  ],
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

const REPORT_VISIBLE_ITEMS = [
  '강약 점수와 판정 근거',
  '격국 후보와 최종 격국',
  '용신 / 희신 / 기신',
  '대운 · 세운 · 월운 연결',
  'KASI 대조 여부',
  '참고 해석 / 논쟁적 해석 표시',
] as const;

const SAFETY_RULES = [
  '의료, 법률, 투자, 위기 판단은 사주 해석과 분리합니다.',
  '길흉을 공포스럽게 단정하지 않습니다.',
  '출생시각이 불명확하면 시주 판단을 줄이고 일간·월령·현재 운 중심으로 읽습니다.',
  '대화 중에도 격국·용신을 새로 추측하지 않고 계산된 결과를 설명합니다.',
  '의심이 남는 구간은 “참고 해석”으로 낮춰 보여줍니다.',
] as const;

const VERSION_FIELDS = [
  'engine_version',
  'rule_set_version',
  'birth_input_snapshot',
  'decision_trace',
  'llm_model',
  'prompt_version',
] as const;

const FAQS = [
  {
    question: 'AI가 직접 사주를 계산하지 않는다는 뜻은 무엇인가요?',
    answer:
      '달빛선생은 출생 정보에서 명식, 강약, 격국, 용신, 대운·세운을 먼저 계산한 뒤 AI가 그 결과를 설명합니다. 대화 중에 AI가 격국이나 용신을 새로 추측하지 않도록 역할을 분리합니다.',
  },
  {
    question: '왜 분 단위 출생시각과 출생지를 같이 묻나요?',
    answer:
      '사주는 시주와 절기 경계에서 몇 분 차이로도 해석의 중심이 달라질 수 있습니다. 특히 자시 경계나 진태양시 보정이 필요한 경우 출생지 경도까지 알아야 해석이 더 안정됩니다.',
  },
  {
    question: '여선생과 남선생은 왜 해석이 비슷한가요?',
    answer:
      '두 선생은 같은 계산 결과를 보고 말투만 다르게 설명합니다. 표현의 결은 달라도 격국, 용신, 현재 운의 뼈대는 같아야 신뢰가 유지된다고 보기 때문입니다.',
  },
  {
    question: '리포트의 긴 글이 정말 계산 근거를 반영한 것인지 어떻게 확인하나요?',
    answer:
      '리포트 안에는 강약 점수, 격국 후보, 용신 후보, KASI 대조, 참고 해석 여부가 함께 보입니다. 달빛선생은 긴 글보다 먼저 판정 근거를 펼쳐보는 UX를 유지합니다.',
  },
  {
    question: '사주 리포트만으로 투자나 의료 판단을 해도 되나요?',
    answer:
      '아니요. 달빛선생은 의료, 법률, 투자, 위기 상황을 사주 해석과 분리합니다. 사주는 참고용 구조 해석으로만 사용하고, 고위험 판단은 별도 전문 기준을 따라야 합니다.',
  },
] as const;

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

export default function AboutEnginePage() {
  return (
    <AppShell header={<SiteHeader />}>
      <AppPage className="space-y-6">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />

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
          description="달빛선생은 계산된 명리 구조를 AI가 이해하기 쉽게 설명하는 서비스입니다. 계산은 엔진이 먼저 맡고, 선생의 말투는 설명 레이어로만 사용합니다."
        />

        <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <SectionSurface surface="lunar">
            <div className="app-starfield" />
            <SectionHeader
              eyebrow="엔진 기준서 요약"
              title="이 문서는 계산과 설명이 어디서 갈리는지 먼저 보여드립니다"
              titleClassName="text-3xl text-[var(--app-gold-text)]"
              description="명식 계산, 시간 보정, 격국·용신 판정, 저장 메타데이터가 어떤 순서로 이어지는지 문서형으로 정리한 페이지입니다."
              descriptionClassName="text-[var(--app-copy)]"
            />

            <ProductGrid columns={3} className="mt-6">
              {ENGINE_PRINCIPLES.map((item) => (
                <FeatureCard
                  key={item.title}
                  surface="soft"
                  eyebrow="제품 원칙"
                  title={item.title}
                  titleClassName="text-2xl"
                  description={item.body}
                />
              ))}
            </ProductGrid>
          </SectionSurface>

          <SupportRail
            surface="muted"
            eyebrow="문서 길잡이"
            title="이 순서로 읽으시면 기준이 훨씬 빠르게 잡힙니다"
            description="처음에는 AI만으로 보지 않는 이유와 시간 기준을 먼저 보고, 그다음 실제 리포트에서 무엇이 드러나는지 확인하시면 좋습니다."
          >
            <nav className="app-reading-nav">
              <div className="app-caption mb-3">섹션 이동</div>
              <div className="app-reading-nav-list">
                {PAGE_SECTIONS.map((item) => (
                  <Link key={item.href} href={item.href} className="app-reading-nav-link">
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>

            <ActionCluster>
              <Link
                href="/saju/new"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-gold)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-bright)]"
              >
                사주 시작하기
              </Link>
              <Link
                href="/sample-report"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 text-sm text-[var(--app-copy)] transition-colors hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]"
              >
                샘플 리포트 보기
              </Link>
            </ActionCluster>

            <div className="rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-4 text-sm leading-7 text-[var(--app-copy-soft)]">
              이 기준서는 홈, 입력 화면, 결과 화면, 대화, 멤버십까지 같은 메시지로 이어지도록
              설계된 문서입니다.
            </div>
          </SupportRail>
        </section>

        <div className="app-reading-layout">
          <div className="app-reading-stack">
            <SectionSurface id="why-not-just-ai" surface="panel" className="scroll-mt-28">
              <SectionHeader
                eyebrow="왜 AI만으로 보지 않나"
                title="일반 AI 사주와 달빛선생의 차이는 말투보다 판정 순서에 있습니다"
                titleClassName="text-3xl"
                description="일반적인 대화형 AI는 설명을 잘 쓰지만, 명식 계산과 격국·용신 판정은 입력 방식과 프롬프트 길이에 따라 흔들릴 수 있습니다. 달빛선생은 계산과 설명을 분리해, 흔들리기 쉬운 부분을 엔진 기준으로 먼저 고정합니다."
                descriptionClassName="app-reading-prose text-[var(--app-copy)]"
              />

              <div className="mt-6 overflow-hidden rounded-[20px] border border-[var(--app-line)]">
                <div className="grid grid-cols-[0.92fr_1fr_1fr] border-b border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] text-xs text-[var(--app-copy-soft)]">
                  <div className="px-4 py-3">구분</div>
                  <div className="px-4 py-3">일반 AI 해석</div>
                  <div className="px-4 py-3">달빛선생</div>
                </div>
                {COMPARISON_ROWS.map(([label, left, right]) => (
                  <div
                    key={label}
                    className="grid grid-cols-[0.92fr_1fr_1fr] border-b border-[var(--app-line)] last:border-b-0"
                  >
                    <div className="px-4 py-4 text-sm font-semibold text-[var(--app-ivory)]">{label}</div>
                    <div className="px-4 py-4 text-sm leading-7 text-[var(--app-copy)]">{left}</div>
                    <div className="px-4 py-4 text-sm leading-7 text-[var(--app-copy)]">{right}</div>
                  </div>
                ))}
              </div>
            </SectionSurface>

            <SectionSurface id="time-precision" surface="panel" className="scroll-mt-28">
              <SectionHeader
                eyebrow="출생시각·출생지 정밀도"
                title="출생시각과 출생지는 왜 끝까지 묻는가"
                titleClassName="text-3xl"
                description="사주는 시주와 절기 경계에서 몇 분 차이로도 해석의 중심이 달라질 수 있습니다. 그래서 시간이 정확한 경우 분 단위 출생시각과 출생지를 함께 보고, 시간이 불확실할 때는 시주 해석을 줄여 안전한 기준으로 읽습니다."
                descriptionClassName="app-reading-prose text-[var(--app-copy)]"
              />

              <ProductGrid columns={3} className="mt-6">
                {TIME_RULES.map((item) => (
                  <FeatureCard
                    key={item.label}
                    surface="soft"
                    eyebrow={item.label}
                    description={item.body}
                  />
                ))}
              </ProductGrid>

              <EvidenceStrip
                className="mt-6"
                items={[
                  {
                    title: '정밀도 메시지',
                    body: '자시 경계나 절기 직전처럼 경계 구간에서는 분 단위 입력이 실제로 중요합니다.',
                  },
                  {
                    title: '안전한 읽기',
                    body: '시간이 불확실하면 시주 판단을 줄이고 일간·월령·현재 운 중심으로 더 보수적으로 읽습니다.',
                  },
                ]}
              />
            </SectionSurface>

            <SectionSurface id="decision-trace" surface="panel" className="scroll-mt-28">
              <SectionHeader
                eyebrow="판정 근거 펼치기"
                title="리포트에서는 이 순서대로 근거를 펼쳐드립니다"
                titleClassName="text-3xl"
                description="달빛선생의 명리 기준서는 긴 글보다 먼저, 어떤 기준으로 검토했는지를 보여주고 그 위에 설명이 따라오도록 설계합니다."
                descriptionClassName="app-reading-prose text-[var(--app-copy)]"
              />

              <div className="mt-6 app-reading-stack">
                {DECISION_STEPS.map((item, index) => (
                  <div
                    key={item}
                    className="rounded-[18px] border border-[var(--app-line)] bg-[rgba(7,9,16,0.28)] px-4 py-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-hanja mt-0.5 text-sm text-[var(--app-gold)]/60">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <p className="text-sm leading-7 text-[var(--app-copy)]">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionSurface>

            <SectionSurface id="report-ux" surface="panel" className="scroll-mt-28">
              <SectionHeader
                eyebrow="리포트에서 무엇이 보이나"
                title="긴 글보다 먼저, 무엇을 근거로 읽었는지가 보여야 합니다"
                titleClassName="text-3xl"
                description="실제 결과 화면에서는 강약 점수, 격국 후보, 용신, 현재 운 연결, KASI 대조, 참고 해석 여부가 본문보다 먼저 드러나도록 구성합니다."
                descriptionClassName="app-reading-prose text-[var(--app-copy)]"
              />

              <ProductGrid columns={3} className="mt-6">
                {REPORT_VISIBLE_ITEMS.map((item) => (
                  <FeatureCard key={item} surface="soft" description={item} />
                ))}
              </ProductGrid>
            </SectionSurface>

            <SectionSurface id="metadata" surface="panel" className="scroll-mt-28">
              <SectionHeader
                eyebrow="엔진 버전과 저장 메타"
                title="계산 기준이 바뀌어도 다시 추적할 수 있게 남깁니다"
                titleClassName="text-3xl"
                description="리포트 저장 시에는 엔진 버전, 규칙 버전, 입력 스냅샷, 판정 흐름, 설명 레이어 버전을 함께 남깁니다. 같은 명식이라도 기준이 어떻게 바뀌었는지 추적할 수 있어야 신뢰가 유지된다고 보기 때문입니다."
                descriptionClassName="app-reading-prose text-[var(--app-copy)]"
              />

              <div className="mt-6 grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
                <div className="rounded-[20px] border border-[var(--app-line)] bg-[rgba(7,9,16,0.32)] px-5 py-5">
                  <div className="app-caption text-[var(--app-gold-soft)]">저장 메타데이터 예시</div>
                  <div className="font-hanja mt-4 grid gap-2 text-xs leading-6 text-[var(--app-copy)]">
                    {VERSION_FIELDS.map((item) => (
                      <div key={item}>{item}</div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="app-caption">고전 근거와 안전 원칙</div>
                  <BulletList items={SAFETY_RULES} />
                </div>
              </div>
            </SectionSurface>

            <SectionSurface id="faq" surface="panel" className="scroll-mt-28">
              <SectionHeader
                eyebrow="FAQ"
                title="엔진 기준서에서 가장 자주 묻는 질문"
                titleClassName="text-3xl"
              />
              <div className="mt-6 space-y-3">
                {FAQS.map((item) => (
                  <details
                    key={item.question}
                    className="rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-4"
                  >
                    <summary className="font-display cursor-pointer list-none text-sm font-semibold text-[var(--app-ivory)]">
                      {item.question}
                    </summary>
                    <p className="mt-3 text-sm leading-8 text-[var(--app-copy)]">{item.answer}</p>
                  </details>
                ))}
              </div>
            </SectionSurface>
          </div>

          <aside className="app-reading-rail">
            <SectionSurface surface="muted">
              <SectionHeader
                eyebrow="핵심 문장"
                title="좋은 해석은 말맛보다 기준에서 먼저 갈립니다"
                titleClassName="text-2xl"
                description="달빛선생은 명식, 절기, 격국, 용신, 대운의 판정을 고정된 계산 기준으로 먼저 잡고, 선생의 말투는 그 결과를 이해하기 쉽게 풀어주는 설명 레이어로만 사용합니다."
                descriptionClassName="text-[var(--app-copy)]"
              />
            </SectionSurface>

            <SupportRail
              surface="panel"
              eyebrow="바로 이어보기"
              title="기준을 읽었다면, 이제 결과 화면에서 같은 눈으로 확인해보세요"
              description="샘플 리포트와 실제 결과 화면에서는 이 기준이 판정 근거, KASI 대조, 메타데이터로 이어집니다."
            >
              <ActionCluster>
                <Link
                  href="/sample-report"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-gold)]/35 bg-[var(--app-gold)]/12 px-5 text-sm text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/18"
                >
                  샘플 리포트 보기
                </Link>
                <Link
                  href="/membership"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-line)] bg-[var(--app-surface-muted)] px-5 text-sm text-[var(--app-copy)] transition-colors hover:bg-[var(--app-surface-strong)] hover:text-[var(--app-ivory)]"
                >
                  멤버십 기준 보기
                </Link>
              </ActionCluster>
            </SupportRail>
          </aside>
        </div>

        <SectionSurface surface="panel">
          <SectionHeader
            eyebrow="다음으로 읽으면 좋은 글"
            title="기준을 읽고 나면, 보통 이 주제들로 질문이 이어집니다"
            titleClassName="text-3xl"
            description="비슷한 말만 반복되는 목록보다, 판정 흐름이 자연스럽게 이어지는 순서로 읽는 편이 이해가 훨씬 쉽습니다."
            descriptionClassName="text-[var(--app-copy)]"
          />
          <ProductGrid columns={3} className="mt-6">
            {ENGINE_METHOD_ENTRIES.map((entry) => (
              <FeatureCard
                key={entry.slug}
                surface="soft"
                eyebrow={entry.eyebrow}
                title={entry.title}
                titleClassName="text-2xl"
                description={entry.summary}
                footer={
                  <Link
                    href={`/method/${entry.slug}`}
                    className="text-sm text-[var(--app-gold-text)] underline underline-offset-4 hover:text-[var(--app-ivory)]"
                  >
                    기준서와 연결된 글 보기
                  </Link>
                }
              />
            ))}
          </ProductGrid>
        </SectionSurface>
      </AppPage>
    </AppShell>
  );
}
