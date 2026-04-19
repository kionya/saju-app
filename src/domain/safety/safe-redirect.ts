export type SafeRedirectCategory = 'crisis' | 'medical' | 'financial' | 'legal';

export type SafeRedirectSeverity = 'none' | 'redirect';

export interface SafeRedirectDetection {
  category: SafeRedirectCategory | null;
  severity: SafeRedirectSeverity;
  shouldRedirect: boolean;
  shouldBlockResponse: boolean;
  matchedKeyword: string | null;
  redirectPath: string | null;
  resourceCategory: string | null;
  userMessage: string;
}

interface SafeRedirectRuleSet {
  category: SafeRedirectCategory;
  resourceCategory: string;
  keywords: readonly string[];
  message: string;
}

const CRISIS_KEYWORDS = [
  '죽고 싶',
  '죽고싶',
  '죽어버리고 싶',
  '살고 싶지',
  '살고싶지',
  '그만 살고 싶',
  '그만살고싶',
  '그만 살래',
  '삶을 끝내',
  '끝내고 싶',
  '생을 마감',
  '자살',
  '극단적 선택',
  '목숨 끊',
  '목숨을 끊',
  '스스로 죽',
  '나를 해치',
  '해치고 싶',
  '자해',
  '손목 긋',
  '뛰어내리',
  '투신',
  '목매',
  '번개탄',
  '수면제 먹',
  '유서',
  '사라지고 싶',
  '없어지고 싶',
  'kill myself',
  'suicide',
  'end my life',
  'hurt myself',
  'self harm',
] as const;

const MEDICAL_KEYWORDS = [
  '응급실 가야',
  '숨이 안 쉬',
  '숨이안쉬',
  '가슴 통증',
  '피가 멈추',
  '약을 얼마나',
  '복용량',
  '처방해',
  '진단해',
  '수술해야',
  '암인가',
  '임신 중 약',
  '태아 괜찮',
] as const;

const FINANCIAL_KEYWORDS = [
  '전재산 투자',
  '대출 받아 투자',
  '대출받아 투자',
  '몰빵',
  '코인 사야',
  '주식 사야',
  '매수해야',
  '매도해야',
  '투자해도 돼',
  '투자해도되',
  '사기 당한',
  '불법 사금융',
] as const;

const LEGAL_KEYWORDS = [
  '고소해야',
  '소송해야',
  '이혼소송',
  '형사처벌',
  '체포될',
  '구속될',
  '계약서 문제',
  '법적으로',
  '불법인가',
  '합의금',
] as const;

const SAFE_REDIRECT_RULES: readonly SafeRedirectRuleSet[] = [
  {
    category: 'crisis',
    resourceCategory: 'crisis',
    keywords: CRISIS_KEYWORDS,
    message:
      '지금은 사주 해석보다 안전 연결이 먼저입니다. 혼자 견디지 않도록 바로 도움을 받을 수 있는 곳으로 안내드릴게요.',
  },
  {
    category: 'medical',
    resourceCategory: 'medical',
    keywords: MEDICAL_KEYWORDS,
    message:
      '건강과 응급 판단은 해석으로 대신할 수 없습니다. 지금 증상이 급하거나 불안하다면 의료진과 먼저 연결해 주세요.',
  },
  {
    category: 'financial',
    resourceCategory: 'financial',
    keywords: FINANCIAL_KEYWORDS,
    message:
      '투자와 큰 금전 결정은 운세만으로 판단하지 않도록 멈춤선을 둡니다. 공식 상담 또는 전문가 확인을 먼저 권합니다.',
  },
  {
    category: 'legal',
    resourceCategory: 'legal',
    keywords: LEGAL_KEYWORDS,
    message:
      '법률 판단은 사주 해석보다 정확한 법률 상담이 우선입니다. 기록을 보존하고 전문 상담으로 이어가 주세요.',
  },
] as const;

function normalizeSafetyText(value: string) {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\s"'`.,!?;:()[\]{}<>·…~_\-–—]+/g, '');
}

function findMatchedKeyword(input: string, keywords: readonly string[]) {
  const normalizedInput = normalizeSafetyText(input);

  return (
    keywords.find((keyword) =>
      normalizedInput.includes(normalizeSafetyText(keyword))
    ) ?? null
  );
}

export function detectSafeRedirect(input: string): SafeRedirectDetection {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return {
      category: null,
      severity: 'none',
      shouldRedirect: false,
      shouldBlockResponse: false,
      matchedKeyword: null,
      redirectPath: null,
      resourceCategory: null,
      userMessage: '',
    };
  }

  for (const rule of SAFE_REDIRECT_RULES) {
    const matchedKeyword = findMatchedKeyword(trimmedInput, rule.keywords);

    if (matchedKeyword) {
      return {
        category: rule.category,
        severity: 'redirect',
        shouldRedirect: true,
        shouldBlockResponse: true,
        matchedKeyword,
        redirectPath: `/dialogue/safe-redirect?category=${rule.resourceCategory}`,
        resourceCategory: rule.resourceCategory,
        userMessage: rule.message,
      };
    }
  }

  return {
    category: null,
    severity: 'none',
    shouldRedirect: false,
    shouldBlockResponse: false,
    matchedKeyword: null,
    redirectPath: null,
    resourceCategory: null,
    userMessage:
      '안전 감지는 통과했습니다. AI 대화 연결 전에는 프리셋 질문과 결과 페이지를 먼저 이용하실 수 있습니다.',
  };
}
