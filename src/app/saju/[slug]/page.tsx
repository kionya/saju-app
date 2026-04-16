import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ELEMENT_INFO, getLuckyElements } from '@/lib/saju/elements';
import { Badge } from '@/components/ui/badge';
import DetailUnlock from '@/components/detail-unlock';
import SiteHeader from '@/components/site-header';
import type { Metadata } from 'next';
import type { Element } from '@/lib/saju/types';
import { resolveReading } from '@/lib/saju/readings';
import { QUESTION_CHIPS } from '@/lib/home-content';
import { buildSajuReport } from '@/lib/saju/report';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ topic?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: '사주 분석 결과 | 사주명리',
    description: '개인 사주 분석 결과 페이지입니다.',
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  };
}

export default async function SajuResultPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { topic } = await searchParams;
  const reading = await resolveReading(slug);
  if (!reading) notFound();

  const { input, result } = reading;
  const luckyElements = getLuckyElements(result);
  const report = buildSajuReport(input, result, topic);

  const pillars = [
    { label: '연주', pillar: result.year },
    { label: '월주', pillar: result.month },
    { label: '일주', pillar: result.day },
    { label: '시주', pillar: result.hour },
  ];

  const totalElements = Object.values(result.elements).reduce((a, b) => a + b, 0);

  return (
    <main className="min-h-screen bg-[#020817] text-white">
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <section className="rounded-[32px] border border-[#d2b072]/18 bg-[radial-gradient(circle_at_top_left,_rgba(210,176,114,0.14),_transparent_32%),linear-gradient(180deg,rgba(7,19,39,0.94),rgba(10,18,36,0.96))] p-7">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-[#d2b072]/30 bg-[#d2b072]/10 text-[#f5dfaa]">
                {report.focusBadge}
              </Badge>
              <Badge className="border-white/10 bg-white/5 text-white/62">개인 결과 링크는 검색 제외</Badge>
            </div>
            <p className="mt-5 text-sm text-white/48">
              {input.year}년 {input.month}월 {input.day}일
              {input.hour !== undefined ? ` ${input.hour}시` : ' 시간 미입력'} ·
              {input.gender ? (input.gender === 'male' ? ' 남성' : ' 여성') : ' 성별 미선택'}
            </p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-[#f8f1df] sm:text-4xl">
              {report.headline}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-white/68">{report.summary}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {QUESTION_CHIPS.map((chip) => (
                <Link
                  key={chip.key}
                  href={`/saju/${slug}?topic=${chip.key}`}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    report.focusTopic === chip.key
                      ? 'border-[#d2b072]/55 bg-[#d2b072]/14 text-[#fff1cb]'
                      : 'border-white/10 bg-white/5 text-white/65 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {chip.label}
                </Link>
              ))}
            </div>
          </section>

          <section className="grid gap-4">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
              <div className="text-sm text-white/45">오늘의 추천 행동</div>
              <div className="mt-3 text-xl font-semibold text-[#f8f1df]">{report.primaryAction.title}</div>
              <p className="mt-3 text-sm leading-7 text-white/62">{report.primaryAction.description}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
              <div className="text-sm text-white/45">오늘 피할 것</div>
              <div className="mt-3 text-xl font-semibold text-[#f8f1df]">{report.cautionAction.title}</div>
              <p className="mt-3 text-sm leading-7 text-white/62">{report.cautionAction.description}</p>
            </div>
            <div className="rounded-[28px] border border-[#d2b072]/18 bg-[#d2b072]/8 p-6">
              <div className="text-sm text-[#d2b072]/80">날짜 포인트</div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-white/42">좋은 날짜</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {report.luckyDates.map((date) => (
                      <span key={date} className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-200">
                        {date}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-white/42">조심할 날짜</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {report.cautionDates.map((date) => (
                      <span key={date} className="rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-sm text-rose-200">
                        {date}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {report.scores.map((score) => (
            <article key={score.key} className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
              <div className="text-sm text-white/45">{score.label}</div>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-4xl font-semibold text-[#f8f1df]">{score.score}</span>
                <span className="pb-1 text-sm text-white/40">/ 100</span>
              </div>
              <p className="mt-4 text-sm leading-7 text-white/58">{score.summary}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          {report.insights.map((insight) => (
            <article key={insight.title} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
              <div className="text-xs uppercase tracking-[0.22em] text-[#d2b072]/78">{insight.eyebrow}</div>
              <h2 className="mt-3 text-xl font-semibold leading-8 text-[#f8f1df]">{insight.title}</h2>
              <p className="mt-4 text-sm leading-7 text-white/60">{insight.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          {report.timeline.map((item) => (
            <article key={item.label} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
              <div className="text-sm text-white/42">{item.label}</div>
              <h2 className="mt-3 text-2xl font-semibold text-[#f8f1df]">{item.headline}</h2>
              <p className="mt-4 text-sm leading-7 text-white/58">{item.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#f8f1df]">길한 오행</h2>
              <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-200">무료</Badge>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {luckyElements.map((el) => (
                <div
                  key={el}
                  className="rounded-2xl border p-4"
                  style={{ borderColor: `${ELEMENT_INFO[el].color}50`, backgroundColor: `${ELEMENT_INFO[el].color}15` }}
                >
                  <div className="text-lg font-semibold" style={{ color: ELEMENT_INFO[el].color }}>
                    {ELEMENT_INFO[el].name}
                  </div>
                  <div className="mt-2 text-sm text-white/60">
                    {ELEMENT_INFO[el].keywords.slice(0, 2).join(' · ')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#f8f1df]">오행 분포</h2>
              <Badge className="border-white/10 bg-white/5 text-white/62">해석 근거</Badge>
            </div>
            <div className="mt-5 space-y-3">
              {(Object.entries(result.elements) as [Element, number][]).map(([el, count]) => {
                const pct = totalElements > 0 ? Math.round((count / totalElements) * 100) : 0;
                return (
                  <div key={el} className="flex items-center gap-3">
                    <span className="w-12 text-sm text-white/70">{ELEMENT_INFO[el].name.split(' ')[0]}</span>
                    <div className="h-2 flex-1 rounded-full bg-white/10">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: ELEMENT_INFO[el].color }}
                      />
                    </div>
                    <span className="w-8 text-right text-sm text-white/50">{count}개</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge
                style={{
                  backgroundColor: `${ELEMENT_INFO[result.dominantElement].color}33`,
                  borderColor: `${ELEMENT_INFO[result.dominantElement].color}66`,
                  color: ELEMENT_INFO[result.dominantElement].color,
                }}
              >
                강한 오행 · {ELEMENT_INFO[result.dominantElement].name}
              </Badge>
              <Badge
                style={{
                  backgroundColor: `${ELEMENT_INFO[result.weakestElement].color}33`,
                  borderColor: `${ELEMENT_INFO[result.weakestElement].color}66`,
                  color: ELEMENT_INFO[result.weakestElement].color,
                }}
              >
                보완 포인트 · {ELEMENT_INFO[result.weakestElement].name}
              </Badge>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(7,19,39,0.94),rgba(3,7,18,0.96))] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#f8f1df]">명식 원본</h2>
            <Badge className="border-white/10 bg-white/5 text-white/62">기술 해석 층</Badge>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {pillars.map(({ label, pillar }) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
                <div className="text-xs text-white/40">{label}</div>
                {pillar ? (
                  <>
                    <div
                      className="mt-3 text-3xl font-semibold"
                      style={{ color: ELEMENT_INFO[pillar.stemElement].color }}
                    >
                      {pillar.stem}
                    </div>
                    <div
                      className="mt-1 text-3xl font-semibold"
                      style={{ color: ELEMENT_INFO[pillar.branchElement].color }}
                    >
                      {pillar.branch}
                    </div>
                    <div className="mt-3 text-xs text-white/34">
                      {pillar.stemElement} / {pillar.branchElement}
                    </div>
                  </>
                ) : (
                  <div className="pt-10 text-sm text-white/24">미입력</div>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="mt-6">
          <DetailUnlock slug={slug} />
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-[#d2b072] underline underline-offset-4 hover:text-[#e3c68d]">
            다른 생년월일로 새 리포트 만들기
          </Link>
        </div>
      </div>
    </main>
  );
}
