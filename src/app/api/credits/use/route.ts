import { NextRequest, NextResponse } from 'next/server';
import type { SajuCurrentLuck, SajuSymbolRef } from '@/domain/saju/engine/saju-data-v1';
import { createClient } from '@/lib/supabase/server';
import { deductCredits, type Feature } from '@/lib/credits/deduct';
import { resolveReading } from '@/lib/saju/readings';
import {
  ELEMENT_INFO,
  getLuckyElementsFromSajuData,
  getPersonalityFromSajuData,
} from '@/lib/saju/elements';
import { buildSajuReport } from '@/domain/saju/report';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const { feature, slug } = await req.json();

  const result = await deductCredits(user.id, feature as Feature);
  if (!result.success) {
    return NextResponse.json({ error: '코인이 부족합니다.', remaining: result.remaining }, { status: 402 });
  }

  // feature에 따라 콘텐츠 생성
  let content = null;
  if (feature === 'detail_report' && slug) {
    const reading = await resolveReading(slug);
    if (reading) {
      const saju = reading.sajuData;
      const lucky = getLuckyElementsFromSajuData(saju);
      const wealthReport = buildSajuReport(reading.input, saju, 'wealth');
      const loveReport = buildSajuReport(reading.input, saju, 'love');
      const careerReport = buildSajuReport(reading.input, saju, 'career');
      const relationshipReport = buildSajuReport(reading.input, saju, 'relationship');
      const evidenceSummary = formatReportEvidence(wealthReport.evidenceCards);
      const dominant = ELEMENT_INFO[saju.fiveElements.dominant];
      const weakest = ELEMENT_INFO[saju.fiveElements.weakest];
      const personality = getPersonalityFromSajuData(saju);
      const yongsinLabel = formatSymbolList(
        saju.yongsin ? [saju.yongsin.primary, ...saju.yongsin.secondary] : []
      );
      const patternLabel = saju.pattern?.name;
      const strengthLabel = saju.strength?.level;
      const currentFlowLabel = formatCurrentLuckLabel(saju.currentLuck);
      const currentFlowSummary = formatCurrentLuckSummary(saju.currentLuck);
      const currentMajorLabel = saju.currentLuck?.currentMajorLuck?.ganzi;
      const saewoonLabel = saju.currentLuck?.saewoon?.ganzi;
      const wolwoonLabel = saju.currentLuck?.wolwoon?.ganzi;

      content = {
        wealth: joinNarrative([
          wealthReport.headline,
          wealthReport.summary,
          wealthReport.primaryAction.description,
          evidenceSummary,
          currentFlowLabel
            ? `지금 재물 판단은 ${currentFlowLabel} 흐름을 함께 보며 속도를 조절하는 편이 좋습니다.`
            : '',
          currentFlowSummary,
        ]),
        love: joinNarrative([
          loveReport.headline,
          `${personality} 인간관계에서는 ${ELEMENT_INFO[saju.pillars.day.stemElement].traits[1]} 성향이 드러나기 쉬우며, ${lucky.map((element) => ELEMENT_INFO[element].name.split(' ')[0]).join('·')} 기운의 사람과 조화가 좋습니다.`,
          loveReport.summary,
          formatReportEvidence(relationshipReport.evidenceCards),
          strengthLabel ? `현재 저장본 기준으로는 ${strengthLabel} 흐름이라 관계 속도 조절이 중요합니다.` : '',
          saewoonLabel ? `특히 ${saewoonLabel} 세운에서는 감정 표현의 강약을 세심하게 맞추는 편이 유리합니다.` : '',
        ]),
        career: joinNarrative([
          careerReport.headline,
          careerReport.summary,
          formatReportEvidence(careerReport.evidenceCards),
          `강한 ${dominant.name} 기운은 직업적으로 ${dominant.traits[2]} 분야에서 두각을 나타냅니다. ${dominant.keywords[0]} 관련 업종이나 ${dominant.traits[0]}이(가) 필요한 직무에서 성과를 냅니다.`,
          patternLabel ? `${patternLabel} 흐름을 기준으로 역할과 자리의 무게를 읽으면 직업 해석이 훨씬 선명해집니다.` : '',
          currentMajorLabel ? `지금은 ${currentMajorLabel} 대운권이라 단기 성과보다 방향성과 포지션을 길게 잡는 해석이 잘 맞습니다.` : '',
        ]),
        health: joinNarrative([
          `${saju.dayMaster.stem}일간의 건강은 ${dominant.keywords[3]} 기관에 과부하가 걸리지 않도록 생활 리듬을 고르게 지키는 쪽이 중요합니다.`,
          `강한 오행이 과하면 오히려 해당 장기에 부담이 올 수 있으니, ${weakest.name} 기운과 관련된 ${weakest.keywords[3]} 기관을 꾸준히 관리하며 균형을 잡는 편이 좋습니다.`,
          yongsinLabel ? `현재 보완 포인트는 ${yongsinLabel} 쪽이라 몸을 차분히 회복시키는 환경을 일부러 만들어주는 것이 도움이 됩니다.` : '',
          wolwoonLabel ? `이번 달은 ${wolwoonLabel} 월운 기준으로 수면과 생활 리듬을 고르게 유지하는 편이 좋습니다.` : '',
          lucky[0] ? `${ELEMENT_INFO[lucky[0]].keywords[0]} 계열 루틴을 일상에 넣으면 몸의 균형을 회복하는 데 보탬이 됩니다.` : '',
        ]),
        luckyColor: dominant.color,
        luckyKeywords: [...new Set(lucky.flatMap((element) => ELEMENT_INFO[element].keywords.slice(0, 2)))],
      };
    }
  }

  return NextResponse.json({ success: true, remaining: result.remaining, content });
}

function formatSymbolList(symbols: SajuSymbolRef[]) {
  return symbols.map((symbol) => symbol.label).join(' · ');
}

function formatCurrentLuckLabel(currentLuck: SajuCurrentLuck | null) {
  if (!currentLuck) return '';

  return [
    currentLuck.currentMajorLuck?.ganzi ? `${currentLuck.currentMajorLuck.ganzi} 대운` : null,
    currentLuck.saewoon?.ganzi ? `${currentLuck.saewoon.ganzi} 세운` : null,
    currentLuck.wolwoon?.ganzi ? `${currentLuck.wolwoon.ganzi} 월운` : null,
  ]
    .filter(Boolean)
    .join(' · ');
}

function formatCurrentLuckSummary(currentLuck: SajuCurrentLuck | null) {
  if (!currentLuck) return '';

  const notes = [
    ...(currentLuck.currentMajorLuck?.notes ?? []).slice(0, 1),
    ...(currentLuck.saewoon?.notes ?? []).slice(0, 1),
  ];

  return notes.join(' ');
}

function formatReportEvidence(cards: ReturnType<typeof buildSajuReport>['evidenceCards']) {
  return cards
    .map((card) => `${card.label}: ${card.title}. ${card.body} ${card.details.slice(0, 2).join(' ')}`)
    .join(' ');
}

function joinNarrative(parts: Array<string | undefined>) {
  return parts
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ');
}
