import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { deductCredits, type Feature } from '@/lib/credits/deduct';
import { calculateSaju, fromSlug } from '@/lib/saju/pillars';
import { ELEMENT_INFO, getLuckyElements } from '@/lib/saju/elements';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const { feature, slug } = await req.json();

  const result = await deductCredits(user.id, feature as Feature);
  if (!result.success) {
    return NextResponse.json({ error: '크레딧이 부족합니다.', remaining: result.remaining }, { status: 402 });
  }

  // feature에 따라 콘텐츠 생성
  let content = null;
  if (feature === 'detail_report' && slug) {
    const input = fromSlug(slug);
    if (input) {
      const saju = calculateSaju(input);
      const lucky = getLuckyElements(saju);
      const dominant = ELEMENT_INFO[saju.dominantElement];
      const weakest = ELEMENT_INFO[saju.weakestElement];

      content = {
        wealth: `${dominant.name} 기운이 강한 ${saju.dayMaster}일간은 재물운에서 ${dominant.traits[0]}이(가) 두드러집니다. ${weakest.name} 기운을 보완하는 ${lucky[0]} 계열의 활동에서 금전적 기회가 생깁니다. 특히 ${dominant.keywords[0]} 시기에 중요한 결정을 내리는 것이 유리합니다.`,
        love: `${saju.dayMaster}일간은 ${ELEMENT_INFO[saju.day.stemElement].traits[1]} 성향으로 인간관계에서 신중한 편입니다. ${lucky.map(e => ELEMENT_INFO[e].name.split(' ')[0]).join('·')} 기운의 사람과 잘 맞으며, ${dominant.keywords[1]} 방향에서 인연이 찾아올 가능성이 높습니다.`,
        career: `강한 ${dominant.name} 기운은 직업적으로 ${dominant.traits[2]} 분야에서 두각을 나타냅니다. ${dominant.keywords[0]} 관련 업종이나 ${dominant.traits[0]}이(가) 필요한 직무에서 성과를 냅니다. 약한 ${weakest.name} 보완을 위해 ${weakest.keywords[0]} 계열의 부업이나 자기계발도 추천합니다.`,
        health: `${saju.dayMaster}일간의 건강은 ${dominant.keywords[3]} 기관을 주의해야 합니다. 강한 오행이 과하면 오히려 해당 장기에 부담이 올 수 있습니다. ${weakest.name} 기운과 관련된 ${weakest.keywords[3]} 기관을 꾸준히 관리하고, ${lucky[0] ? ELEMENT_INFO[lucky[0]].keywords[0] : ''} 계열 음식을 섭취하면 균형이 잡힙니다.`,
        luckyColor: dominant.color,
        luckyKeywords: lucky.flatMap(e => ELEMENT_INFO[e].keywords.slice(0, 2)),
      };
    }
  }

  return NextResponse.json({ success: true, remaining: result.remaining, content });
}