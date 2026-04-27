export type ProfileLinkageStatus = 'ready' | 'partial' | 'independent';

export interface ProfileLinkageServiceAudit {
  key:
    | 'my-profile'
    | 'home'
    | 'today-fortune'
    | 'saju-new'
    | 'saju-result'
    | 'compatibility'
    | 'dialogue'
    | 'tarot'
    | 'star-sign'
    | 'zodiac'
    | 'myeongri';
  label: string;
  status: ProfileLinkageStatus;
  usesSelfProfile: boolean;
  usesFamilyProfiles: boolean;
  usesSharedBirthSchema: boolean;
  usesSajuEngine: boolean;
  detail: string;
  continuity: string;
  sourceRefs: string[];
}

export interface ProfileLinkageAudit {
  status: 'ready';
  overview: {
    linkedServiceCount: number;
    partialServiceCount: number;
    independentServiceCount: number;
  };
  checks: Array<{
    key: string;
    label: string;
    ok: boolean;
    detail: string;
  }>;
  services: ProfileLinkageServiceAudit[];
  warnings: string[];
}

const SERVICES: ProfileLinkageServiceAudit[] = [
  {
    key: 'my-profile',
    label: 'MY 프로필 / 가족정보',
    status: 'ready',
    usesSelfProfile: true,
    usesFamilyProfiles: true,
    usesSharedBirthSchema: true,
    usesSajuEngine: false,
    detail:
      '양력·음력, 시간 모름, 출생지, timeRule을 저장하는 기준 저장소입니다. 오늘운세, 사주 시작하기, 궁합에서 같은 입력값을 다시 불러옵니다.',
    continuity: '공통 입력의 기준 저장소',
    sourceRefs: [
      '/src/components/my/profile-manager.tsx',
      '/src/app/api/profile/route.ts',
      '/src/app/api/family-profiles/route.ts',
    ],
  },
  {
    key: 'home',
    label: '홈 개인화',
    status: 'partial',
    usesSelfProfile: true,
    usesFamilyProfiles: false,
    usesSharedBirthSchema: false,
    usesSajuEngine: false,
    detail:
      '홈은 프로필 생년월일과 선생 선택을 읽어 개인화 카피와 오늘 흐름 미리보기를 만듭니다. 다만 실제 사주 엔진이 아니라 홈 전용 간단 개인화 계산을 씁니다.',
    continuity: '프로필 기반 미리보기만 연결됨',
    sourceRefs: ['/src/app/page.tsx', '/src/features/home/personalized-today.ts'],
  },
  {
    key: 'today-fortune',
    label: '오늘의 운세',
    status: 'ready',
    usesSelfProfile: true,
    usesFamilyProfiles: false,
    usesSharedBirthSchema: true,
    usesSajuEngine: true,
    detail:
      '로그인 사용자는 MY 프로필을 자동 기본값 또는 불러오기 버튼으로 가져오고, 공통 birth schema를 거쳐 실제 사주 엔진으로 무료/유료 결과를 만듭니다.',
    continuity: '공통 입력 → 공통 엔진 → 오늘운세 결과',
    sourceRefs: [
      '/src/components/today-fortune/birth-info-stepper.tsx',
      '/src/features/today-fortune/today-fortune-experience.tsx',
      '/src/app/api/today-fortune/route.ts',
    ],
  },
  {
    key: 'saju-new',
    label: '사주 시작하기',
    status: 'ready',
    usesSelfProfile: true,
    usesFamilyProfiles: true,
    usesSharedBirthSchema: true,
    usesSajuEngine: true,
    detail:
      '내 정보와 가족 프로필을 불러와 같은 입력 블록으로 읽고, unified birth schema를 거쳐 기본 사주 결과를 생성합니다.',
    continuity: '공통 입력 → 읽기 생성 → 사주 결과',
    sourceRefs: ['/src/features/saju-intake/saju-intake-page.tsx', '/src/app/api/readings/route.ts'],
  },
  {
    key: 'saju-result',
    label: '사주 결과 / 심층 / 평생 / 연간',
    status: 'partial',
    usesSelfProfile: true,
    usesFamilyProfiles: false,
    usesSharedBirthSchema: false,
    usesSajuEngine: true,
    detail:
      '결과 자체는 생성된 reading slug를 기준으로 움직이고, 선생 선택과 일부 AI 레이어는 저장된 프로필 선호값을 다시 읽습니다. 즉 결과는 reading 중심, 페르소나는 profile 중심입니다.',
    continuity: 'reading 기반 결과 + profile 기반 선생 설정',
    sourceRefs: [
      '/src/app/saju/[slug]/page.tsx',
      '/src/app/api/interpret/route.ts',
      '/src/server/ai/saju-yearly-service.ts',
      '/src/server/ai/saju-lifetime-service.ts',
    ],
  },
  {
    key: 'compatibility',
    label: '궁합',
    status: 'ready',
    usesSelfProfile: true,
    usesFamilyProfiles: true,
    usesSharedBirthSchema: false,
    usesSajuEngine: true,
    detail:
      '내 프로필과 저장된 가족/연인/친구 프로필을 함께 읽어 실제 두 사람 명식을 비교합니다. 가족정보 저장 품질이 궁합 정확도에 직접 연결됩니다.',
    continuity: '내 프로필 + 가족 프로필 → 두 명식 비교',
    sourceRefs: [
      '/src/app/compatibility/input/page.tsx',
      '/src/app/compatibility/result/page.tsx',
      '/src/lib/compatibility.ts',
    ],
  },
  {
    key: 'dialogue',
    label: 'AI 대화',
    status: 'partial',
    usesSelfProfile: true,
    usesFamilyProfiles: false,
    usesSharedBirthSchema: false,
    usesSajuEngine: false,
    detail:
      'AI 대화는 저장된 MY 프로필을 grounding으로 읽고, 오늘운세 sourceSessionId가 있으면 그 결과 맥락도 이어받습니다. 하지만 가족 프로필을 자동 전환해 읽는 구조는 아닙니다.',
    continuity: '프로필 grounding + today result session 연결',
    sourceRefs: ['/src/app/api/ai/route.ts', '/src/components/dialogue/dialogue-chat-panel.tsx'],
  },
  {
    key: 'tarot',
    label: '타로',
    status: 'independent',
    usesSelfProfile: false,
    usesFamilyProfiles: false,
    usesSharedBirthSchema: false,
    usesSajuEngine: false,
    detail:
      '타로는 현재 질문과 카드 뽑기 흐름 중심입니다. 사주 프로필을 자동으로 불러오지 않고, 질문 텍스트와 카드 조합만으로 리딩합니다.',
    continuity: '질문 기반 독립 기능',
    sourceRefs: ['/src/app/tarot/daily/page.tsx', '/src/lib/tarot-api.ts'],
  },
  {
    key: 'star-sign',
    label: '별자리',
    status: 'independent',
    usesSelfProfile: false,
    usesFamilyProfiles: false,
    usesSharedBirthSchema: false,
    usesSajuEngine: false,
    detail:
      '별자리는 현재 정적 콘텐츠/slug 기반 흐름입니다. 사주 프로필과 직접 연동되지 않고, 사주 시작하기로 보내는 교차 CTA만 있습니다.',
    continuity: '콘텐츠형 독립 기능',
    sourceRefs: ['/src/app/star-sign/page.tsx', '/src/app/star-sign/[slug]/page.tsx'],
  },
  {
    key: 'zodiac',
    label: '띠운세',
    status: 'independent',
    usesSelfProfile: false,
    usesFamilyProfiles: false,
    usesSharedBirthSchema: false,
    usesSajuEngine: false,
    detail:
      '띠운세는 현재 정적 연운/slug 기반 페이지입니다. 사주 프로필과 직접 연결되지 않고, 맞춤 사주 보기 CTA만 제공합니다.',
    continuity: '콘텐츠형 독립 기능',
    sourceRefs: ['/src/app/zodiac/page.tsx', '/src/app/zodiac/[slug]/page.tsx'],
  },
  {
    key: 'myeongri',
    label: '명리 탐구',
    status: 'independent',
    usesSelfProfile: false,
    usesFamilyProfiles: false,
    usesSharedBirthSchema: false,
    usesSajuEngine: false,
    detail:
      '명리 탐구는 십신/개념을 설명하는 학습형 페이지입니다. 아직 내 프로필에 맞춰 내용을 개인화하지 않습니다.',
    continuity: '개념 학습형 독립 기능',
    sourceRefs: ['/src/app/myeongri/page.tsx', '/src/app/myeongri/ten-gods/page.tsx'],
  },
];

export function getProfileLinkageVerificationAudit(): ProfileLinkageAudit {
  const linkedServiceCount = SERVICES.filter((service) => service.status === 'ready').length;
  const partialServiceCount = SERVICES.filter((service) => service.status === 'partial').length;
  const independentServiceCount = SERVICES.filter(
    (service) => service.status === 'independent'
  ).length;

  return {
    status: 'ready',
    overview: {
      linkedServiceCount,
      partialServiceCount,
      independentServiceCount,
    },
    checks: [
      {
        key: 'profile-api-unified-schema',
        label: '프로필 저장 API가 새 공통 입력 스키마를 받는가',
        ok: true,
        detail:
          'MY 프로필과 가족정보 저장 API가 birthYear뿐 아니라 year/month/day/hour/minute 키도 함께 받아 today-fortune와 /saju/new의 공통 입력을 그대로 저장합니다.',
      },
      {
        key: 'today-fortune-prefill',
        label: '오늘운세가 로그인 프로필을 기본값으로 이어받는가',
        ok: true,
        detail:
          '오늘운세는 로그인 사용자의 MY 프로필을 자동 기본값으로 불러오고, 수동 불러오기 버튼도 유지합니다.',
      },
      {
        key: 'shared-birth-engine',
        label: '공통 입력이 기존 사주 엔진으로 그대로 들어가는가',
        ok: true,
        detail:
          'today-fortune와 /saju/new는 unified birth schema를 resolve한 뒤 기존 BirthInput과 calculateSajuDataV1 경로를 계속 사용합니다.',
      },
      {
        key: 'content-services-standalone',
        label: '타로/별자리/띠운세/명리 탐구가 현재 독립 기능임을 명확히 표시했는가',
        ok: true,
        detail:
          '이 기능들은 현재 프로필 자동 연동보다 질문/콘텐츠 중심으로 동작하므로, 사주 프로필과 완전 연동됐다고 가정하면 안 됩니다.',
      },
    ],
    services: SERVICES,
    warnings: [
      '타로, 별자리, 띠운세, 명리 탐구는 아직 사주 프로필과 자동 연동되지 않습니다.',
      '사주 결과/AI 대화는 일부 profile 기반 설정을 읽지만, 본문 해석 자체는 생성된 reading이나 질문 컨텍스트 중심으로 이어집니다.',
    ],
  };
}
