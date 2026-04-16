import { notFound } from 'next/navigation';
import { calculateSaju, fromSlug } from '@/lib/saju/pillars';
import { ELEMENT_INFO, getPersonality, getLuckyElements } from '@/lib/saju/elements';
import { Badge } from '@/components/ui/badge';
import DetailUnlock from '@/components/detail-unlock';
import SiteHeader from '@/components/site-header';
import type { Metadata } from 'next';
import type { Element } from '@/lib/saju/types';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const input = fromSlug(slug);
  if (!input) return {};
  return {
    title: `${input.year}년 ${input.month}월 ${input.day}일 사주풀이 | 사주명리`,
    description: `${input.year}년 ${input.month}월 ${input.day}일생 무료 사주팔자 분석. 오행 분석, 일간 성격, 운세 확인.`,
  };
}

export default async function SajuResultPage({ params }: Props) {
  const { slug } = await params;
  const input = fromSlug(slug);
  if (!input) notFound();

  const result = calculateSaju(input);
  const luckyElements = getLuckyElements(result);
  const personality = getPersonality(result);

  const pillars = [
    { label: '연주', pillar: result.year },
    { label: '월주', pillar: result.month },
    { label: '일주', pillar: result.day },
    { label: '시주', pillar: result.hour },
  ];

  const totalElements = Object.values(result.elements).reduce((a, b) => a + b, 0);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-white">
      <SiteHeader />

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        {/* 제목 */}
        <div className="text-center">
          <p className="text-white/50 text-sm mb-1">
            {input.year}년 {input.month}월 {input.day}일
            {input.hour !== undefined ? ` ${input.hour}시` : ''} 생
            {input.gender ? (input.gender === 'male' ? ' · 남성' : ' · 여성') : ''}
          </p>
          <h1 className="text-2xl font-bold">사주팔자 분석 결과</h1>
        </div>

        {/* 사주팔자 표 */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-sm text-white/50 mb-4 font-medium">사주팔자</h2>
          <div className="grid grid-cols-4 gap-3">
            {pillars.map(({ label, pillar }) => (
              <div key={label} className="text-center">
                <div className="text-xs text-white/40 mb-2">{label}</div>
                {pillar ? (
                  <>
                    <div
                      className="text-2xl font-bold mb-1"
                      style={{ color: ELEMENT_INFO[pillar.stemElement].color }}
                    >
                      {pillar.stem}
                    </div>
                    <div
                      className="text-2xl font-bold"
                      style={{ color: ELEMENT_INFO[pillar.branchElement].color }}
                    >
                      {pillar.branch}
                    </div>
                    <div className="text-xs text-white/30 mt-1">
                      {pillar.stemElement} / {pillar.branchElement}
                    </div>
                  </>
                ) : (
                  <div className="text-white/20 text-sm pt-4">미입력</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 오행 분포 */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-sm text-white/50 mb-4 font-medium">오행 분포</h2>
          <div className="space-y-3">
            {(Object.entries(result.elements) as [Element, number][]).map(([el, count]) => {
              const pct = totalElements > 0 ? Math.round((count / totalElements) * 100) : 0;
              return (
                <div key={el} className="flex items-center gap-3">
                  <span className="text-sm w-12 text-white/70">{ELEMENT_INFO[el].name.split(' ')[0]}</span>
                  <div className="flex-1 bg-white/10 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: ELEMENT_INFO[el].color }}
                    />
                  </div>
                  <span className="text-sm text-white/50 w-8 text-right">{count}개</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex gap-2 flex-wrap">
            <span className="text-xs text-white/40">강한 오행:</span>
            <Badge style={{ backgroundColor: ELEMENT_INFO[result.dominantElement].color + '33', borderColor: ELEMENT_INFO[result.dominantElement].color + '66', color: ELEMENT_INFO[result.dominantElement].color }}>
              {ELEMENT_INFO[result.dominantElement].name}
            </Badge>
            <span className="text-xs text-white/40 ml-2">약한 오행:</span>
            <Badge style={{ backgroundColor: ELEMENT_INFO[result.weakestElement].color + '33', borderColor: ELEMENT_INFO[result.weakestElement].color + '66', color: ELEMENT_INFO[result.weakestElement].color }}>
              {ELEMENT_INFO[result.weakestElement].name}
            </Badge>
          </div>
        </div>

        {/* 일간 성격 (무료 미리보기) */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm text-white/50 font-medium">일간 성격 — {result.dayMaster}일간</h2>
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">무료</Badge>
          </div>
          <p className="text-white/80 leading-relaxed">{personality}</p>
          <div className="mt-3 flex gap-2 flex-wrap">
            {ELEMENT_INFO[result.day.stemElement].traits.map(t => (
              <span key={t} className="text-xs bg-white/10 px-2 py-1 rounded-full text-white/60">{t}</span>
            ))}
          </div>
        </div>

        {/* 용신 (무료) */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm text-white/50 font-medium">길한 오행 (용신)</h2>
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">무료</Badge>
          </div>
          <div className="flex gap-3">
            {luckyElements.map(el => (
              <div
                key={el}
                className="flex-1 rounded-xl p-4 text-center border"
                style={{ borderColor: ELEMENT_INFO[el].color + '50', backgroundColor: ELEMENT_INFO[el].color + '15' }}
              >
                <div className="text-lg font-bold mb-1" style={{ color: ELEMENT_INFO[el].color }}>
                  {ELEMENT_INFO[el].name}
                </div>
                <div className="text-xs text-white/50">
                  {ELEMENT_INFO[el].keywords.slice(0, 2).join(' · ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 상세 해석 잠금 — 과금 유도 */}
        <DetailUnlock slug={slug} />

        {/* 다시 보기 */}
        <div className="text-center pt-4">
          <a href="/" className="text-sm text-indigo-400 hover:text-indigo-300 underline underline-offset-4">
            다른 생년월일로 보기
          </a>
        </div>
      </div>
    </main>
  );
}