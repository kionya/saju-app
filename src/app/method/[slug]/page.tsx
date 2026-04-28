import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/features/shared-navigation/site-header';
import { Badge } from '@/components/ui/badge';
import { AppPage, AppShell } from '@/shared/layout/app-shell';
import {
  ENGINE_METHOD_ENTRIES,
  type EngineMethodEntry,
  getEngineMethodEntriesBySlug,
  getEngineMethodEntry,
} from '@/lib/engine-method-pages';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return ENGINE_METHOD_ENTRIES.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = getEngineMethodEntry(slug);

  if (!item) {
    return {
      title: '엔진 읽을거리',
    };
  }

  return {
    title: `${item.title} | 달빛선생`,
    description: item.description,
    keywords: item.keywords,
    alternates: {
      canonical: `/method/${item.slug}`,
    },
    openGraph: {
      title: `${item.title} | 달빛선생`,
      description: item.description,
      url: `https://saju-app-lac.vercel.app/method/${item.slug}`,
      siteName: '달빛선생',
      locale: 'ko_KR',
      type: 'article',
    },
  };
}

function buildMethodFaqs(item: EngineMethodEntry) {
  const firstSection = item.sections[0];
  const secondSection = item.sections[1];
  const visibleChecks = item.checklist.slice(0, 3).join(', ');

  return [
    {
      question: item.question,
      answer: item.lead,
    },
    {
      question: `${item.title}에서 먼저 확인해야 할 기준은 무엇인가요?`,
      answer: firstSection
        ? `${firstSection.body} 달빛선생에서는 ${visibleChecks} 같은 기준을 결과 화면에서 함께 확인할 수 있습니다.`
        : `${visibleChecks} 같은 기준을 먼저 확인하는 편이 좋습니다.`,
    },
    {
      question: '달빛선생에서는 이 주제를 어떤 방식으로 보여주나요?',
      answer: secondSection
        ? `${secondSection.body} 결과 화면에서는 판정 근거와 체크 포인트를 같이 보여주고, 필요한 경우 엔진 기준서와 명리 기준서로 이어서 확인할 수 있습니다.`
        : '결과 화면에서는 판정 근거와 체크 포인트를 같이 보여주고, 필요한 경우 엔진 기준서와 명리 기준서로 이어서 확인할 수 있습니다.',
    },
  ];
}

export default async function MethodDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = getEngineMethodEntry(slug);

  if (!item) {
    notFound();
  }

  const guidedItems = getEngineMethodEntriesBySlug(item.relatedSlugs);
  const secondaryItems = ENGINE_METHOD_ENTRIES.filter(
    (entry) => entry.slug !== item.slug && !item.relatedSlugs.includes(entry.slug)
  ).slice(0, 3);
  const faqs = buildMethodFaqs(item);
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: item.title,
    description: item.description,
    inLanguage: 'ko-KR',
    isAccessibleForFree: true,
    mainEntityOfPage: `https://saju-app-lac.vercel.app/method/${item.slug}`,
    url: `https://saju-app-lac.vercel.app/method/${item.slug}`,
    articleSection: item.eyebrow,
    keywords: item.keywords,
    author: {
      '@type': 'Organization',
      name: '달빛선생',
    },
    publisher: {
      '@type': 'Organization',
      name: '달빛선생',
      url: 'https://saju-app-lac.vercel.app',
    },
    about: item.keywords.map((keyword) => ({
      '@type': 'Thing',
      name: keyword,
    })),
  };
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <AppShell header={<SiteHeader />}>
      <AppPage className="space-y-6">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <section className="app-panel px-6 py-7 sm:px-8 sm:py-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-[var(--app-gold)]/24 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]">
              {item.eyebrow}
            </Badge>
            <Badge className="border-white/10 bg-white/5 text-white/68">엔진 기준서 연계 글</Badge>
          </div>
          <h1 className="font-display mt-5 text-4xl font-semibold tracking-tight text-[var(--app-ivory)] sm:text-5xl">
            {item.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--app-copy)]">{item.summary}</p>

          <div className="mt-6 rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] p-5">
            <div className="text-sm text-[var(--app-copy-soft)]">이 글이 답하려는 질문</div>
            <p className="font-display mt-3 text-lg font-semibold text-[var(--app-ivory)]">{item.question}</p>
            <p className="mt-3 text-sm leading-8 text-[var(--app-copy)]">{item.lead}</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <article className="space-y-4">
            {item.sections.map((section) => (
              <section key={section.title} className="app-panel p-6 sm:p-7">
                <h2 className="font-display text-3xl font-semibold text-[var(--app-ivory)]">
                  {section.title}
                </h2>
                <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">{section.body}</p>
              </section>
            ))}
          </article>

          <aside className="space-y-4">
            <section className="moon-lunar-panel p-6 sm:p-7">
              <div className="app-starfield" />
              <div className="app-caption">체크 포인트</div>
              <h2 className="font-display mt-3 text-3xl font-semibold text-[var(--app-ivory)]">
                달빛선생에서는 이 기준이 실제로 보입니다
              </h2>
              <div className="mt-5 space-y-3">
                {item.checklist.map((check) => (
                  <div
                    key={check}
                    className="rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-4 text-sm leading-7 text-[var(--app-copy)]"
                  >
                    {check}
                  </div>
                ))}
              </div>
            </section>

            <section className="app-panel p-6 sm:p-7">
              <div className="app-caption">자주 이어지는 질문</div>
              <div className="mt-4 space-y-4">
                {faqs.map((faq) => (
                  <div
                    key={faq.question}
                    className="rounded-[18px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] px-4 py-4"
                  >
                <h2 className="font-display text-sm font-semibold text-[var(--app-ivory)]">
                  {faq.question}
                </h2>
                    <p className="mt-2 text-sm leading-7 text-[var(--app-copy)]">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="app-panel p-6 sm:p-7">
              <div className="app-caption">마무리 문장</div>
              <p className="mt-4 text-sm leading-8 text-[var(--app-copy)]">{item.closing}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/about-engine"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--app-gold)]/35 bg-[var(--app-gold)]/12 px-5 text-sm text-[var(--app-gold-text)] transition-colors hover:bg-[var(--app-gold)]/18"
                >
                  엔진 기준서 보기
                </Link>
                <Link
                  href="/membership"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-white/12 bg-white/6 px-5 text-sm text-[var(--app-copy)] transition-colors hover:bg-white/10 hover:text-[var(--app-ivory)]"
                >
                  멤버십 기준 보기
                </Link>
                <Link
                  href="/saju/new"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--app-gold)] px-5 text-sm font-semibold text-[var(--app-bg)] transition-colors hover:bg-[var(--app-gold-bright)]"
                >
                  사주 시작하기
                </Link>
              </div>
            </section>
          </aside>
        </section>

        <section className="app-panel p-6 sm:p-7">
          <div className="app-caption">다음으로 읽으면 좋은 글</div>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--app-copy)]">
            이 글을 읽고 보통 이어지는 질문만 먼저 골라 두었습니다. 비슷한 말만 반복되는 목록보다,
            판정 흐름이 자연스럽게 이어지는 순서로 읽는 편이 이해가 훨씬 쉬워집니다.
          </p>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {guidedItems.map((entry) => (
              <Link
                key={entry.slug}
                href={`/method/${entry.slug}`}
                className="rounded-[22px] border border-[var(--app-gold)]/20 bg-[rgba(255,255,255,0.03)] p-5 transition-colors hover:bg-[rgba(255,255,255,0.05)]"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm text-[var(--app-gold-text)]">{entry.eyebrow}</div>
                  <Badge className="border-[var(--app-gold)]/24 bg-[var(--app-gold)]/10 text-[var(--app-gold-text)]">
                    이어 읽기
                  </Badge>
                </div>
                <h2 className="font-display mt-3 text-2xl font-semibold text-[var(--app-ivory)]">
                  {entry.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">{entry.summary}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="app-panel p-6 sm:p-7">
          <div className="app-caption">넓게 이어보기</div>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {secondaryItems.map((entry) => (
              <Link
                key={entry.slug}
                href={`/method/${entry.slug}`}
                className="rounded-[22px] border border-[var(--app-line)] bg-[rgba(255,255,255,0.03)] p-5 transition-colors hover:bg-[rgba(255,255,255,0.05)]"
              >
                <div className="text-sm text-[var(--app-gold-text)]">{entry.eyebrow}</div>
                <h2 className="font-display mt-3 text-2xl font-semibold text-[var(--app-ivory)]">
                  {entry.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[var(--app-copy)]">{entry.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      </AppPage>
    </AppShell>
  );
}
