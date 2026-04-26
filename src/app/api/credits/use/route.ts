import { NextRequest, NextResponse } from 'next/server';
import type { SajuCurrentLuck, SajuSymbolRef } from '@/domain/saju/engine/saju-data-v1';
import {
  resolveMoonlightCounselor,
  type MoonlightCounselorId,
} from '@/lib/counselors';
import { createClient } from '@/lib/supabase/server';
import { deductCredits } from '@/lib/credits/deduct';
import {
  unlockDailyDetailReport,
  validateCreditUsePayload,
} from '@/lib/credits/detail-report-access';
import { getUserProfileById } from '@/lib/profile';
import { resolveReading } from '@/lib/saju/readings';
import {
  ELEMENT_INFO,
  getLuckyElementsFromSajuData,
  getPersonalityFromSajuData,
} from '@/lib/saju/elements';
import { buildSajuReport, type ReportEvidenceKey } from '@/domain/saju/report';

type DetailBlockTone = 'core' | 'basis' | 'action' | 'caution' | 'flow' | 'safety';

interface DetailReportBlock {
  tone: DetailBlockTone;
  title: string;
  body: string;
  keywords?: string[];
}

interface DetailTopicReportContent {
  lead: string;
  scoreLabel?: string;
  highlights: string[];
  blocks: DetailReportBlock[];
}

export async function POST(req: NextRequest) {
  const requestBody = await req.json().catch(() => null);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const validation = validateCreditUsePayload(requestBody);

  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { feature, slug } = validation.payload;
  const profile = await getUserProfileById(user.id);
  const counselorId = resolveMoonlightCounselor(
    requestBody && typeof requestBody === 'object' ? (requestBody as Record<string, unknown>).counselorId : null,
    profile.preferredCounselor
  );

  // feature에 따라 콘텐츠 생성
  let content = null;
  if (feature === 'detail_report' && slug) {
    const reading = await resolveReading(slug);

    if (!reading) {
      return NextResponse.json({ error: '사주 결과를 찾지 못했습니다.' }, { status: 404 });
    }

    if (reading.userId && reading.userId !== user.id) {
      return NextResponse.json({ error: '본인의 결과만 열 수 있습니다.' }, { status: 403 });
    }

    const result = await unlockDailyDetailReport(user.id, slug);
    if (!result.success) {
      return NextResponse.json({ error: '코인이 부족합니다.', remaining: result.remaining }, { status: 402 });
    }

    content = buildDetailReportContent(reading, counselorId);

    return NextResponse.json({
      success: true,
      remaining: result.remaining,
      content,
      counselorId,
      access: result.reused ? 'daily_reuse' : 'charged',
    });
  }

  const result = await deductCredits(user.id, feature);
  if (!result.success) {
    return NextResponse.json({ error: '코인이 부족합니다.', remaining: result.remaining }, { status: 402 });
  }

  return NextResponse.json({ success: true, remaining: result.remaining, content, counselorId, access: 'charged' });
}

function buildDetailReportContent(
  reading: NonNullable<Awaited<ReturnType<typeof resolveReading>>>,
  counselorId: MoonlightCounselorId
) {
  const saju = reading.sajuData;
  const lucky = getLuckyElementsFromSajuData(saju);
  const todayReport = buildSajuReport(reading.input, saju, 'today');
  const wealthReport = buildSajuReport(reading.input, saju, 'wealth');
  const loveReport = buildSajuReport(reading.input, saju, 'love');
  const careerReport = buildSajuReport(reading.input, saju, 'career');
  const relationshipReport = buildSajuReport(reading.input, saju, 'relationship');
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
  const supportLabels = formatElementNames(lucky);
  const overallScore = getReportScore(todayReport, 'overall');
  const wealthScore = getReportScore(wealthReport, 'wealth');
  const loveScore = getReportScore(loveReport, 'love');
  const careerScore = getReportScore(careerReport, 'career');
  const isMaleCounselor = counselorId === 'male';
  const wealthDetail: DetailTopicReportContent = {
    lead: isMaleCounselor
      ? `${wealthReport.headline} 재물운은 ${wealthScore}점입니다. 큰돈이 들어온다는 예언으로 볼 일이 아니라, 지금 돈을 다루는 판단력과 흐름의 안정도를 먼저 보셔야 합니다.`
      : `${wealthReport.headline} 재물운은 ${wealthScore}점으로, 무조건 돈이 들어온다는 약속이 아니라 지금 내 판단력과 금전 흐름의 결을 살피는 점수입니다.`,
    scoreLabel: `${wealthScore}점`,
    highlights: ['재물운', `${wealthScore}점`, '지출 구조', '정산', '보류'],
    blocks: [
      {
        tone: 'basis' as const,
        title: '명식 근거',
        body: `${dominant.name} 기운이 강하게 드러나고 ${weakest.name} 보완이 필요한 명식입니다. ${formatEvidencePoint(wealthReport, 'yongsin')} ${isMaleCounselor ? '그래서 오늘 재물 판단은 수입 확대보다 지출 구조와 약속된 금액부터 점검하는 쪽이 맞습니다.' : '그래서 오늘의 재물 판단은 수입 확대보다 지출 구조와 약속된 금액을 먼저 살피는 편이 훨씬 안정적입니다.'}`,
        keywords: [dominant.name, weakest.name, '용신', '보완', '지출 구조'],
      },
      {
        tone: 'action' as const,
        title: '오늘 먼저 할 일',
        body: `${wealthReport.primaryAction.description} 고정비, 미뤄둔 정산, 결제 예정액처럼 이미 정해진 돈의 흐름을 먼저 보면 체감 재물운이 안정됩니다.`,
        keywords: ['고정비', '정산', '결제 예정액', '체감 재물운'],
      },
      {
        tone: 'caution' as const,
        title: '피해야 할 선택',
        body: `${wealthReport.cautionAction.description} ${isMaleCounselor ? '가격 비교 없이 결제하거나 지인 제안만 믿고 움직이면 흐름이 흐트러집니다. 오늘은 한 번 더 보류하십시오.' : '가격 비교 없이 결제하거나 지인 제안만 믿고 움직이는 선택은 만족보다 피로를 남길 수 있어요. 오늘은 한 번 더 보류하는 편이 좋습니다.'}`,
        keywords: ['가격 비교', '지인 제안', '보류'],
      },
      {
        tone: 'flow' as const,
        title: '대운·세운 흐름',
        body: currentFlowLabel
          ? `지금 재물 판단은 ${currentFlowLabel} 흐름 위에서 봅니다. 당장 커 보이는 기회보다 몇 달 뒤에도 유지 가능한 선택인지 확인하는 편이 좋습니다. ${currentFlowSummary}`
          : currentFlowSummary || '현재 운 흐름이 비어 있어 원국의 강약과 용신 기준을 먼저 참고합니다.',
        keywords: compactText(['대운', '세운', '월운', currentFlowLabel]),
      },
    ],
  };
  const loveDetail: DetailTopicReportContent = {
    lead: isMaleCounselor
      ? `${loveReport.headline} 연애운은 ${loveScore}점입니다. 상대 행동을 단정하는 예측이 아니라, 지금 관계에서 내가 어떤 표현과 속도를 써야 하는지 보는 값입니다.`
      : `${loveReport.headline} 연애운은 ${loveScore}점으로, 상대를 단정하는 예언이 아니라 내가 관계 안에서 어떤 표현과 온도를 쓰기 쉬운지 읽는 값입니다.`,
    scoreLabel: `${loveScore}점`,
    highlights: ['연애운', `${loveScore}점`, '표현 방식', '속도 조절', '안부'],
    blocks: [
      {
        tone: 'core' as const,
        title: '관계의 핵심',
        body: `${personality} ${isMaleCounselor ? '연애에서는 마음이 커질수록 표현도 커지기 쉽습니다. 오늘은 감정을 증명하려 들기보다 상대가 받아들일 수 있는 속도로 말하는 편이 맞습니다.' : '연애에서는 마음이 커질수록 표현의 폭도 함께 넓어질 수 있어요. 오늘은 감정을 증명하려 하기보다 상대가 받아들이기 쉬운 속도로 말하는 것이 좋습니다.'}`,
        keywords: ['표현', '속도', '상대'],
      },
      {
        tone: 'basis' as const,
        title: '명식 근거',
        body: `${supportLabels ? `이번 흐름을 돕는 오행은 ${supportLabels}입니다.` : ''} ${formatEvidencePoint(relationshipReport, 'relations')} 이 흐름은 친밀감을 밀어붙이기보다 안부, 칭찬, 약속 확인처럼 부담이 낮은 표현에 쓰는 편이 안정적입니다.`,
        keywords: compactText(['돕는 오행', supportLabels, '안부', '칭찬', '약속 확인']),
      },
      {
        tone: 'action' as const,
        title: '오늘 표현법',
        body: loveReport.primaryAction.description,
        keywords: ['짧은 안부', '가벼운 칭찬', '분위기'],
      },
      {
        tone: 'caution' as const,
        title: '오해를 줄이는 선',
        body: `${loveReport.cautionAction.description} ${strengthLabel ? `현재 저장본 기준으로는 ${strengthLabel} 흐름이라 관계 속도 조절이 중요합니다.` : ''} ${saewoonLabel ? isMaleCounselor ? `특히 ${saewoonLabel} 세운에서는 감정 표현의 강약을 분명히 조절하는 편이 좋습니다.` : `특히 ${saewoonLabel} 세운에서는 감정 표현의 강약을 세심하게 맞추는 편이 유리합니다.` : ''}`,
        keywords: compactText(['확인 압박', '속도 조절', '감정 표현', strengthLabel, saewoonLabel]),
      },
    ],
  };
  const careerDetail: DetailTopicReportContent = {
    lead: isMaleCounselor
      ? `${careerReport.headline} 직업운은 ${careerScore}점입니다. 합격이나 승진을 단정할 값이 아니라, 지금 명식에서 일의 추진력과 평가 흐름을 어떻게 써야 하는지 보는 참고 점수입니다.`
      : `${careerReport.headline} 직업운은 ${careerScore}점으로, 합격이나 승진을 단정하는 값이 아니라 현재 명식에서 일의 추진력, 정리력, 평가 흐름을 함께 읽는 참고 점수입니다.`,
    scoreLabel: `${careerScore}점`,
    highlights: ['직업운', `${careerScore}점`, '역할', '마감선', '평가'],
    blocks: [
      {
        tone: 'basis' as const,
        title: '일의 성향',
        body: `강한 ${dominant.name} 기운은 직업적으로 ${dominant.traits[2]}과 ${dominant.traits[0]}이 필요한 역할에서 장점으로 쓰기 좋습니다. 다만 ${weakest.name} 축이 약해지는 방식으로 일을 넓히면 피로가 커질 수 있습니다.`,
        keywords: [dominant.name, weakest.name, dominant.traits[2], dominant.traits[0]],
      },
      {
        tone: 'basis' as const,
        title: '격국과 역할 근거',
        body: `${formatEvidencePoint(careerReport, 'pattern')} ${patternLabel ? `${patternLabel} 흐름을 기준으로 역할과 자리의 무게를 읽으면 직업 해석이 더 선명해집니다.` : ''}`,
        keywords: compactText(['격국', '역할', patternLabel]),
      },
      {
        tone: 'action' as const,
        title: '오늘 일 처리',
        body: careerReport.primaryAction.description,
        keywords: ['보고', '제안', '결론', '근거'],
      },
      {
        tone: 'caution' as const,
        title: '업무에서 조심할 점',
        body: `${careerReport.cautionAction.description} ${currentMajorLabel ? isMaleCounselor ? `지금은 ${currentMajorLabel} 대운권이라 단기 성과에 매달리기보다 방향성과 포지션을 길게 잡는 해석이 맞습니다.` : `지금은 ${currentMajorLabel} 대운권이라 단기 성과보다 방향성과 포지션을 길게 잡는 해석이 더 자연스럽습니다.` : ''}`,
        keywords: compactText(['업무 범위', '마감선', '책임', currentMajorLabel]),
      },
    ],
  };
  const healthDetail: DetailTopicReportContent = {
    lead: isMaleCounselor
      ? `건강운은 의학적 진단이 아닙니다. 명식의 강한 기운과 부족한 기운이 생활 리듬에 주는 부담을 읽는 참고 해석으로 보셔야 하고, 전체 흐름은 ${overallScore}점 기준이되 몸 상태는 실제 증상과 의료 판단을 우선해야 합니다.`
      : `건강운은 의학적 진단이 아니라 명식의 강한 기운과 부족한 기운이 생활 리듬에 주는 부담을 읽는 참고 해석입니다. 전체 흐름은 ${overallScore}점 기준으로 보되, 몸 상태는 실제 증상과 의료 판단을 우선해야 합니다.`,
    scoreLabel: `${overallScore}점`,
    highlights: ['건강운', '참고 해석', '생활 리듬', '의료 판단'],
    blocks: [
      {
        tone: 'basis' as const,
        title: '몸의 리듬 근거',
        body: `${saju.dayMaster.stem}일간은 ${dominant.name} 기운이 강하게 드러나는 명식이라, 과로하거나 한쪽 리듬으로 몰릴 때 피로가 쌓이기 쉽습니다. 그래서 오늘은 강하게 밀어붙이는 관리보다 수면, 식사, 움직임의 균형을 먼저 잡는 편이 안전합니다.`,
        keywords: [saju.dayMaster.stem, dominant.name, '수면', '식사', '움직임'],
      },
      {
        tone: 'action' as const,
        title: '보완 루틴',
        body: `보완 포인트는 ${weakest.name}입니다. 특정 질병을 뜻하는 것이 아니라, 부족한 기운의 성질처럼 휴식, 정리, 속도 조절을 생활 안에 넣어야 균형이 잡힌다는 의미입니다.`,
        keywords: [weakest.name, '휴식', '정리', '속도 조절'],
      },
      {
        tone: 'flow' as const,
        title: '이번 달 관리',
        body: `${yongsinLabel ? `용신·보완축 ${yongsinLabel}는 몸과 마음이 한쪽으로 치우치지 않게 돕는 기준으로만 참고하세요.` : ''} ${wolwoonLabel ? `이번 달은 ${wolwoonLabel} 월운 기준으로 무리한 변화보다 반복 가능한 루틴을 유지하는 편이 좋습니다.` : ''}`,
        keywords: compactText(['용신', '보완축', '반복 가능한 루틴', yongsinLabel, wolwoonLabel]),
      },
      {
        tone: 'safety' as const,
        title: '안전 기준',
        body: '통증, 불면, 소화 문제처럼 실제 증상이 있으면 운세 해석보다 의료 전문가의 진단과 치료를 우선해야 합니다.',
        keywords: ['실제 증상', '의료 전문가', '진단', '치료'],
      },
    ],
  };

  return {
    wealth: flattenDetailTopic(wealthDetail),
    love: flattenDetailTopic(loveDetail),
    career: flattenDetailTopic(careerDetail),
    health: flattenDetailTopic(healthDetail),
    detailSections: {
      wealth: wealthDetail,
      love: loveDetail,
      career: careerDetail,
      health: healthDetail,
    },
    luckyColor: dominant.color,
    luckyKeywords: [...new Set(lucky.flatMap((element) => ELEMENT_INFO[element].keywords.slice(0, 2)))],
  };
}

function getReportScore(
  report: ReturnType<typeof buildSajuReport>,
  key: ReturnType<typeof buildSajuReport>['scores'][number]['key']
) {
  return report.scores.find((score) => score.key === key)?.score ?? 0;
}

function formatElementNames(elements: ReturnType<typeof getLuckyElementsFromSajuData>) {
  return elements.map((element) => ELEMENT_INFO[element].name.split(' ')[0]).join(' · ');
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

function formatEvidencePoint(
  report: ReturnType<typeof buildSajuReport>,
  key: ReportEvidenceKey
) {
  const card = report.evidenceCards.find((item) => item.key === key);
  if (!card) return '';

  return `${card.label}은 ${card.title}으로 계산됩니다. ${card.plainSummary ?? card.body}`;
}

function flattenDetailTopic(topic: DetailTopicReportContent) {
  return joinNarrative([
    topic.lead,
    ...topic.blocks.map((block) => `${block.title}: ${block.body}`),
  ]);
}

function compactText(values: Array<string | null | undefined | false>) {
  return values
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter(Boolean);
}

function joinNarrative(parts: Array<string | undefined>) {
  return parts
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ');
}
