export type MoonlightTone = 'gold' | 'jade' | 'plum' | 'sky';
export type MoonlightNavTone = 'service' | 'acquisition';
export type PlanSlug = 'basic' | 'premium' | 'lifetime';
export type CompatibilityRelationshipSlug = 'lover' | 'family' | 'friend' | 'partner';

export interface MoonlightNavItem {
  label: string;
  href: string;
  matchPrefixes?: readonly string[];
  tone?: MoonlightNavTone;
}

export interface MoonlightWisdomCard {
  slug: string;
  hanja: string;
  title: string;
  hook: string;
  description: string;
  href: string;
  tone: MoonlightTone;
}

export interface CompatibilityRelationship {
  slug: CompatibilityRelationshipSlug;
  icon: string;
  title: string;
  hook: string;
}

export interface MoonlightTarotQuestionOption {
  emoji: string;
  label: string;
}

export interface MoonlightTenGodCard {
  name: string;
  hanja: string;
  meaning: string;
  seniorCopy: string;
}

export interface MoonlightDialoguePreset {
  category: string;
  question: string;
  previewAnswer: string;
  followUp: string;
}

export interface MoonlightToneOption {
  value: 'friendly' | 'polite' | 'standard';
  label: string;
  description: string;
}

export type NotificationSlotKey =
  | 'morning'
  | 'lunch'
  | 'evening'
  | 'weekly'
  | 'monthly'
  | 'seasonal'
  | 'birthday'
  | 'returning';

export interface MoonlightNotificationSlot {
  key: NotificationSlotKey;
  title: string;
  body: string;
  timeLabel: string;
  cadence: string;
  tone: MoonlightTone;
}

export interface MoonlightWidgetBlueprint {
  size: 'small' | 'medium' | 'large';
  title: string;
  summary: string;
  details: readonly string[];
}

export interface MoonlightRetentionScenario {
  trigger: string;
  action: string;
  purpose: string;
}

export const PRIMARY_TABS: readonly MoonlightNavItem[] = [
  { label: '홈', href: '/' },
  {
    label: '해석',
    href: '/interpretation',
    matchPrefixes: ['/interpretation', '/saju', '/myeongri', '/compatibility', '/star-sign', '/zodiac', '/tarot'],
  },
  { label: '대화', href: '/dialogue', matchPrefixes: ['/dialogue'] },
  { label: '마이', href: '/my', matchPrefixes: ['/my', '/membership', '/credits'] },
] as const;

export const HEADER_SHORTCUTS: readonly MoonlightNavItem[] = [
  { label: '사주', href: '/saju/new', matchPrefixes: ['/saju'], tone: 'service' },
  { label: '명리', href: '/myeongri', matchPrefixes: ['/myeongri'], tone: 'service' },
  { label: '타로', href: '/tarot/daily', matchPrefixes: ['/tarot'], tone: 'service' },
  { label: '궁합', href: '/compatibility', matchPrefixes: ['/compatibility'], tone: 'service' },
  { label: '별자리', href: '/star-sign', matchPrefixes: ['/star-sign'], tone: 'service' },
  { label: '띠운세', href: '/zodiac', matchPrefixes: ['/zodiac'], tone: 'service' },
] as const;

export const HOME_DAILY_LINES = [
  {
    title: '오늘은 서두르기보다 마음을 고르게 하시면 길이 열립니다',
    subtitle: '가까운 분과 나누는 짧은 안부 한마디가 하루의 기운을 부드럽게 바꿉니다',
  },
  {
    title: '마음을 낮추실수록 반가운 소식이 먼저 닿는 날입니다',
    subtitle: '오후 무렵 닿는 연락 하나가 생각보다 오래 따뜻하게 남을 수 있습니다',
  },
  {
    title: '오래 미루신 일을 조용히 매듭지으시면 다음 흐름이 열립니다',
    subtitle: '큰 결심보다 작은 정리가 한 달의 리듬을 바로잡아 드립니다',
  },
] as const;

export const HOME_HERO_TOKENS = [
  { label: '행운 방향', value: '서북' },
  { label: '길한 시간', value: '오후 2시' },
  { label: '마음가짐', value: '차분함' },
] as const;

export const WISDOM_CARDS: readonly MoonlightWisdomCard[] = [
  {
    slug: 'saju',
    hanja: '四 柱',
    title: '사주',
    hook: '나는 어떤 사람으로 태어난 걸까',
    description: '태어난 때에 깃든 하늘의 결을 읽어, 선생님의 본성과 큰 흐름을 차분히 짚어드립니다.',
    href: '/saju/new',
    tone: 'gold',
  },
  {
    slug: 'myeongri',
    hanja: '命 理',
    title: '명리',
    hook: '왜 유독 이 부분에서 늘 걸리는 걸까',
    description: '오행과 십신의 움직임으로, 자꾸 반복되는 삶의 장면이 왜 생기는지 들려드립니다.',
    href: '/myeongri',
    tone: 'gold',
  },
  {
    slug: 'tarot',
    hanja: '塔 羅',
    title: '타로',
    hook: '지금 이 선택, 괜찮은 걸까',
    description: '지금 이 순간 마음 위로 스치는 기운을 한 장의 그림으로 읽어드립니다.',
    href: '/tarot/daily',
    tone: 'plum',
  },
  {
    slug: 'compatibility',
    hanja: '宮 合',
    title: '궁합',
    hook: '우리, 정말 잘 맞는 사이일까',
    description: '두 사람의 결이 어디에서 닮고 어디에서 어긋나는지, 살가운 말로 풀어드립니다.',
    href: '/compatibility',
    tone: 'jade',
  },
  {
    slug: 'star-sign',
    hanja: '星 座',
    title: '별자리',
    hook: '저 먼 별빛이 내게 전하는 말',
    description: '오늘 마음의 결을 별빛 언어로 먼저 살피고, 사주와 만나는 지점까지 이어드립니다.',
    href: '/star-sign',
    tone: 'plum',
  },
  {
    slug: 'zodiac',
    hanja: '十 二 支',
    title: '띠별 운세',
    hook: '올해 내 띠의 흐름은 어떠한가',
    description: '익숙한 띠의 흐름으로 오늘과 올 한 해의 기운을 부드럽게 짚어드립니다.',
    href: '/zodiac',
    tone: 'gold',
  },
] as const;

export const HOME_TODAY_SUMMARY = [
  { label: '재물', value: '양호', ratio: 65, tone: 'gold' as const },
  { label: '건강', value: '좋음', ratio: 80, tone: 'jade' as const },
  { label: '관계', value: '평이', ratio: 50, tone: 'sky' as const },
] as const;

export const INTERPRETATION_LAYERS = [
  {
    title: '깊이 헤아리는 해석',
    body: '사주와 명리는 태어난 바탕과 오래 이어지는 흐름을 읽어, “나는 왜 이럴까”라는 물음에 천천히 답합니다.',
    items: ['사주 원국과 일간의 본질', '오행 균형과 격국 해석', '용신, 대운, 세운 중심 심화 리포트'],
  },
  {
    title: '지금 마음에 닿는 해석',
    body: '타로와 궁합은 오늘의 선택과 관계를 가까운 말로 풀어, 막연한 마음을 조금 더 또렷하게 정리해드립니다.',
    items: ['질문별 타로 리딩', '연인·배우자·가족 궁합', '사주와 타로의 교차 해석'],
  },
  {
    title: '가볍게 펼쳐보는 운세',
    body: '별자리와 띠운세는 익숙한 언어로 오늘의 리듬을 먼저 보여드리는 친숙한 길입니다.',
    items: ['오늘의 별자리', '12띠 연운과 월운', '서양·동양 관점 크로스'],
  },
] as const;

export const SAJU_BASIC_SECTIONS = [
  {
    slug: 'nature',
    title: '타고난 성정',
    description: '나는 어떤 기질로 태어났는가',
  },
  {
    slug: 'elements',
    title: '오행 균형',
    description: '내 안에 무엇이 강하고 무엇이 부족한가',
  },
  {
    slug: 'today',
    title: '오늘의 흐름',
    description: '지금 이 순간 하늘의 메시지',
  },
] as const;

export const SAJU_PREMIUM_SECTIONS = [
  '일주 본질',
  '오행 균형',
  '격국(格局)',
  '용신(用神)',
  '대운(大運) 흐름',
  '2026 세운',
  '분야별 조망',
] as const;

export const COMPATIBILITY_RELATIONSHIPS: readonly CompatibilityRelationship[] = [
  {
    slug: 'lover',
    icon: '💑',
    title: '연인 · 배우자',
    hook: '우리, 정말 잘 맞는 사이일까',
  },
  {
    slug: 'family',
    icon: '👨‍👩‍👧',
    title: '부모 · 자녀',
    hook: '왜 저 아이와는 늘 부딪힐까',
  },
  {
    slug: 'friend',
    icon: '🤝',
    title: '형제 · 친구',
    hook: '오래도록 편한 사이일까',
  },
  {
    slug: 'partner',
    icon: '💼',
    title: '동업 · 파트너',
    hook: '함께 일해도 괜찮을 사이일까',
  },
] as const;

export const COMPATIBILITY_RESULT_LABELS = [
  '하늘이 맺어준 인연',
  '조화로운 인연',
  '노력으로 깊어질 인연',
  '서로의 다름을 배우는 인연',
  '이해로 품는 인연',
] as const;

export const DIALOGUE_PRESETS: readonly MoonlightDialoguePreset[] = [
  {
    category: '재물',
    question: '올해 재물 흐름은 어떤가요?',
    previewAnswer:
      '올해는 큰 한 번보다 새는 지출을 먼저 정리하실 때 재물운이 안정되는 흐름입니다. 들어오는 돈의 크기보다 남는 돈의 구조를 다듬는 편이 더 중요합니다.',
    followUp: '지금 지출부터 손봐야 할지, 새로운 기회를 잡아야 할지 이어서 여쭤보실 수 있습니다.',
  },
  {
    category: '가족',
    question: '큰 며느리와는 어떤 인연인가요?',
    previewAnswer:
      '가까운 가족 궁합은 좋고 나쁨보다 말의 온도와 기대하는 역할이 더 중요합니다. 두 분은 기본 인연은 이어지지만, 표현의 강약을 조절할 때 훨씬 편안해지는 관계로 읽힙니다.',
    followUp: '서운함이 커지는 이유나 대화 타이밍까지 더 물어보실 수 있습니다.',
  },
  {
    category: '이동',
    question: '이사를 하려는데 방향은 어떻게?',
    previewAnswer:
      '방향 질문은 사주의 길흉만 단정하지 않고, 현재 생활 리듬과 가족 흐름을 함께 봐야 합니다. 지금은 서두르기보다 몸이 편안해지는 방향과 생활 동선을 함께 맞춰보는 편이 좋습니다.',
    followUp: '이사 시기와 함께 보면 더 구체적인 답변으로 이어집니다.',
  },
  {
    category: '가족',
    question: '아이의 진로에 도움이 될 이야기',
    previewAnswer:
      '진로는 운보다 기질을 먼저 보는 편이 오래 갑니다. 아이가 힘을 얻는 방식과 지치기 쉬운 방식을 먼저 읽고, 그다음 올해 흐름이 어느 쪽을 밀어주는지 차분히 연결해드립니다.',
    followUp: '학업, 취업, 전환 중 어떤 고민인지 더 말씀해주시면 답이 선명해집니다.',
  },
  {
    category: '마음',
    question: '요즘 왜 이리 마음이 어수선할까요',
    previewAnswer:
      '마음이 어수선할 때는 사건보다 내 안의 리듬이 먼저 흐트러진 경우가 많습니다. 사주에서는 지금 외부 자극이 많은 구간인지, 쉬어야 하는 구간인지를 함께 읽어 불안을 작은 실천으로 바꿔드립니다.',
    followUp: '잠, 관계, 건강 중 어디에서 가장 먼저 흔들리는지도 이어서 보실 수 있습니다.',
  },
  {
    category: '재물',
    question: '은퇴 자금 관리에 도움될 이야기',
    previewAnswer:
      '은퇴 자금은 큰 수익보다 오래 지키는 흐름이 더 중요합니다. 지금은 공격적으로 불리기보다 새는 지출과 불안한 선택을 줄여 마음 편한 구조를 만드는 쪽이 먼저로 보입니다.',
    followUp: '투자, 부동산, 생활비 구조 중 무엇이 가장 걱정되는지 더 말씀해주시면 좋습니다.',
  },
  {
    category: '건강·생활',
    question: '요즘 몸이 피곤한데, 흐름상 어떤가요?',
    previewAnswer:
      '몸의 피로는 사주 해석으로 진단하지 않지만, 생활 리듬이 무너지는 구간인지 살펴 생활 조절 포인트를 드릴 수 있습니다. 다만 증상 판단은 꼭 의료진과 함께 보시는 편이 안전합니다.',
    followUp: '수면, 식사, 스트레스 중 어디가 먼저 무너지는지 기준으로 생활 팁을 이어드릴 수 있습니다.',
  },
  {
    category: '이동',
    question: '여행 가기 좋은 시기',
    previewAnswer:
      '여행운은 크게 나쁜 날을 피하기보다 몸과 마음이 풀리는 시기를 고르는 것이 핵심입니다. 지금은 무리한 일정보다 가까운 곳에서 숨 고를 수 있는 흐름이 더 잘 맞아 보입니다.',
    followUp: '국내인지 해외인지, 혼자인지 가족과 함께인지에 따라 더 다르게 읽어드릴 수 있습니다.',
  },
  {
    category: '마음',
    question: '무엇이 나를 이렇게 불안하게 할까요',
    previewAnswer:
      '불안은 한 가지 사건보다 오래 쌓인 피로와 관계 압박이 겹쳐질 때 커집니다. 대화에서는 선생님의 사주를 바탕으로 어디에서 에너지가 새는지 짚고, 오늘 바로 줄일 수 있는 실천까지 연결합니다.',
    followUp: '다만 위기감이 크거나 삶을 놓고 싶다는 마음이 드신다면 해석보다 안전 자원을 먼저 안내드립니다.',
  },
  {
    category: '생활',
    question: '이번 달 조심할 점',
    previewAnswer:
      '이번 달은 무리해서 한 번에 해결하려는 마음만 줄여도 훨씬 편안해질 수 있습니다. 관계와 재물 모두 속도를 낮추고, 말과 지출의 강약을 조절하는 것이 가장 큰 포인트입니다.',
    followUp: '재물, 관계, 건강 중 어느 쪽을 특히 조심하면 좋을지 더 좁혀서 보실 수 있습니다.',
  },
] as const;

export const DIALOGUE_GUARDRAILS = [
  {
    title: '마음을 먼저 듣습니다',
    body: '답을 서둘러 내리기보다, 지금 어떤 마음으로 여쭈셨는지 먼저 헤아리는 말투를 지킵니다.',
  },
  {
    title: '오늘의 실마리까지',
    body: '듣기 좋은 말로 끝내지 않고, 오늘 바로 해보실 수 있는 작은 실천 하나까지 함께 정리합니다.',
  },
  {
    title: 'SAFE_REDIRECT',
    body: '자해·극단 선택·응급 의료·법률·투자처럼 더 안전한 도움이 필요한 문제는 선을 넘지 않고 알맞은 도움처로 모십니다.',
  },
] as const;

export const SAFE_REDIRECT_RESOURCES = [
  {
    category: 'crisis',
    label: '자살예방 상담전화 109',
    phone: '109',
    detail: '대한민국 24시간 상담 · 국번 없이 연결',
    note: '마음이 위험한 순간에는 전문 상담사와 바로 이야기 나누실 수 있습니다.',
  },
  {
    category: 'crisis-us',
    label: '988 Suicide & Crisis Lifeline',
    phone: '988',
    detail: '미국/미국령 24시간 통화 · 문자 · 채팅',
    note: '미국에서 즉시 위기 지원이 필요하면 988, 생명이 급한 응급상황이면 911로 연결하세요.',
  },
  {
    category: 'medical',
    label: '의료 상담 안내',
    phone: '병원 찾기',
    detail: '증상 판단은 의료진과 상의',
    note: '사주 해석은 참고만 두고 실제 진료를 권합니다.',
  },
  {
    category: 'financial',
    label: '금융감독원',
    phone: '1332',
    detail: '불법 사금융 · 투자 피해 상담',
    note: '투자 판단은 금융 전문가와 상의하시는 편이 안전합니다.',
  },
  {
    category: 'legal',
    label: '대한법률구조공단',
    phone: '132',
    detail: '법률 구조 상담',
    note: '관계 흐름은 보되 법적 판단은 전문가 상담으로 이어드립니다.',
  },
  {
    category: 'fertility',
    label: '난임·임신 상담',
    phone: '1670-6230',
    detail: '전문 상담 연결',
    note: '마음의 부담을 덜고 의료 상담과 함께 보실 수 있습니다.',
  },
  {
    category: 'grief',
    label: '호스피스 상담',
    phone: '1577-8899',
    detail: '사별·상실 지원',
    note: '깊은 애도는 혼자 감당하지 않도록 지속 지원 자원을 안내합니다.',
  },
] as const;

export const ONBOARDING_THOUGHTS = [
  '요즘따라 왜 이렇게 마음이 어수선할까',
  '자녀와 나, 정말 맞는 사이일까',
  '올해는 어떤 해가 되려나',
] as const;

export const ONBOARDING_CONSENTS = [
  {
    title: '개인정보 수집·이용',
    detail: '사주 계산 목적 · 탈퇴 시 30일 내 파기',
    required: true,
  },
  {
    title: 'AI 모델 전송 동의',
    detail: '해석 생성을 위해 AI에 전송 · 학습에 사용되지 않음',
    required: true,
  },
  {
    title: '서비스 이용약관',
    detail: '결제와 환불, 저장형 콘텐츠 이용 조건 안내',
    required: true,
  },
  {
    title: '소식 받아보기',
    detail: '매월 첫째 주 새 기능과 이벤트 안내',
    required: false,
  },
] as const;

export const ONBOARDING_TONE_OPTIONS: readonly MoonlightToneOption[] = [
  {
    value: 'friendly',
    label: '친근하게',
    description: '가깝고 다정한 표현으로 먼저 말을 건넵니다.',
  },
  {
    value: 'polite',
    label: '정중하게',
    description: '기본 추천값입니다. 시니어 친화 톤으로 차분히 안내합니다.',
  },
  {
    value: 'standard',
    label: '표준',
    description: '정보 위주로 담백하게 정리해 드립니다.',
  },
] as const;

export const NOTIFICATION_SCHEDULE_BLUEPRINT: readonly MoonlightNotificationSlot[] = [
  {
    key: 'morning',
    title: '새 아침의 한 줄',
    body: '선생님, 오늘의 흐름이 준비되었습니다.',
    timeLabel: '07:00',
    cadence: '매일 아침',
    tone: 'gold',
  },
  {
    key: 'lunch',
    title: '점심 한 템포',
    body: '오후의 기운을 살펴보시겠어요?',
    timeLabel: '12:30',
    cadence: '매일 점심',
    tone: 'jade',
  },
  {
    key: 'evening',
    title: '하루를 돌아보며',
    body: '오늘 하루 어떠셨나요. 내일을 위한 한 말씀을 준비했습니다.',
    timeLabel: '20:00',
    cadence: '매일 저녁',
    tone: 'plum',
  },
  {
    key: 'weekly',
    title: '이번 주 세운',
    body: '이번 주 큰 흐름이 새롭게 열렸습니다.',
    timeLabel: '월요일 09:00',
    cadence: '주간',
    tone: 'gold',
  },
  {
    key: 'monthly',
    title: '새 달의 한 장',
    body: '새 달의 리듬을 미리 살펴보세요.',
    timeLabel: '매월 1일',
    cadence: '월간',
    tone: 'sky',
  },
  {
    key: 'seasonal',
    title: '절기 흐름 알림',
    body: '계절의 기운이 바뀌는 날, 삶의 리듬도 함께 짚어드립니다.',
    timeLabel: '입춘 · 입하 · 입추 · 입동',
    cadence: '절기',
    tone: 'jade',
  },
  {
    key: 'birthday',
    title: '생신 리듬 알림',
    body: '새로운 한 해의 흐름이 시작되는 날을 축하와 함께 전합니다.',
    timeLabel: '생일 08:00',
    cadence: '연간',
    tone: 'plum',
  },
  {
    key: 'returning',
    title: '재방문 리마인더',
    body: '달빛선생이 기다리고 있습니다. 오늘의 한 줄을 놓치지 마세요.',
    timeLabel: '3일 미접속',
    cadence: '리텐션',
    tone: 'gold',
  },
] as const;

export const HOME_WIDGET_BLUEPRINT: readonly MoonlightWidgetBlueprint[] = [
  {
    size: 'small',
    title: '작은 위젯 (2×2)',
    summary: '오늘의 한 줄과 행운 요소 2개를 한눈에 보여줍니다.',
    details: ['오늘의 한 줄', '행운 색상', '행운 숫자'],
  },
  {
    size: 'medium',
    title: '중간 위젯 (4×2)',
    summary: '한 줄, 사주 요약, 운세 게이지를 함께 보여줍니다.',
    details: ['오늘의 한 줄', '일간·오행 요약', '재물·건강·관계 게이지'],
  },
  {
    size: 'large',
    title: '큰 위젯 (4×4)',
    summary: '다음 마일스톤으로, 여섯 지혜 카드를 모두 펼쳐 보여주는 확장형입니다.',
    details: ['사주 심화 카드', '궁합·타로 바로가기', '오늘의 전체 리듬'],
  },
] as const;

export const RETENTION_SCENARIOS: readonly MoonlightRetentionScenario[] = [
  {
    trigger: '3일 미접속',
    action: '오늘의 한 줄과 함께 부드러운 재방문 리마인더 발송',
    purpose: '끊기기 쉬운 초반 루틴을 다시 잇기',
  },
  {
    trigger: '주간 시작',
    action: '월요일 오전 주간 세운 알림 발송',
    purpose: '주간 루틴과 저장한 결과 재열람 유도',
  },
  {
    trigger: '절기 변경',
    action: '절기 해설과 함께 계절 리듬 카드 노출',
    purpose: '명리 해석의 신뢰감과 재방문 이유 강화',
  },
  {
    trigger: '생일',
    action: '새 한 해 리듬 요약과 심층 리포트 진입 제안',
    purpose: '의미 있는 개인 이벤트를 유료 전환 지점으로 연결',
  },
] as const;

export const MY_MENU_BLUEPRINT = [
  {
    title: '내 사주 원국',
    description: '언제든 다시 살펴보기',
    href: '/my/results',
  },
  {
    title: '저장한 해석',
    description: '마음에 드셨던 이야기들',
    href: '/my/results',
  },
  {
    title: '가족 사주',
    description: '가까운 분들의 흐름 함께 살펴보기',
    href: '/my/profile',
  },
  {
    title: '프리미엄 플랜',
    description: '이용 기간과 혜택 관리하기',
    href: '/membership',
  },
  {
    title: '알림 센터',
    description: '푸시 · 위젯 · 재방문 루틴 관리',
    href: '/notifications',
  },
  {
    title: '설정',
    description: '알림 · 말투 · 글자 크기',
    href: '/my/settings',
  },
  {
    title: '문의 · 도움말',
    description: '궁금하신 점을 여쭈어보세요',
    href: '/dialogue',
  },
] as const;

export const PLAN_BLUEPRINT = [
  {
    slug: 'basic' as const,
    title: 'Plus',
    price: '월 4,900원',
    badge: '부담 없는 시작',
    summary: '가끔씩 마음이 궁금할 때, 큰 부담 없이 달빛선생의 해석을 곁에 두는 가장 가벼운 달빛 플랜입니다.',
    features: ['매일 해석 10회', '심층 리포트 월 2회', '고전 인용 표시', '대화 상담 월 30턴'],
    fit: '혼자 조용히 해석을 펼쳐보고 싶은 분',
    opens: ['마음이 흔들릴 때 짧게 여쭙는 대화', '월 2회 심층 리포트 맛보기', '광고 없이 차분히 읽는 해석'],
  },
  {
    slug: 'premium' as const,
    title: '프리미엄',
    price: '월 9,900원',
    badge: '가장 많이 고르세요',
    summary: '사주, 궁합, 가족 이야기, 대화까지 생활 가까운 질문을 가장 넉넉하게 이어보실 수 있는 중심 플랜입니다.',
    features: ['모든 해석 무제한', '궁합 분석 월 3회', '가족 사주 5명', '심층 리포트 월 10회', '대화 상담 무제한'],
    fit: '가족 이야기와 생활 고민을 꾸준히 들여다보고 싶은 분',
    opens: ['궁합과 가족 사주를 넉넉히 펼쳐보기', '심층 리포트 월 10회', '대화 상담 무제한'],
  },
  {
    slug: 'lifetime' as const,
    title: '평생 심층 리포트',
    price: '49,000원',
    badge: '한 번 결제 · 평생 소장',
    summary: '한 번의 결제로 깊은 해석 한 편을 오래 곁에 두고 싶은 분을 위한 소장형 리포트입니다.',
    features: ['7개 섹션 심층 해석', '고전 원문 인용', 'PDF 다운로드', '평생 무료 업데이트'],
    fit: '한 번의 결제로 완성본을 오래 보관하고 싶은 분',
    opens: ['격국·용신·대운을 한 편의 리포트로', 'PDF로 오래 간직하는 저장본', '해석이 다듬어질 때 다시 펼쳐보기'],
  },
] as const;

export const INTERPRETATION_ENTRY_GUIDE = [
  {
    title: '마음의 바탕이 궁금하시면 사주부터',
    body: '생년월일을 바탕으로 타고난 기질, 오행의 균형, 지금의 흐름을 가장 차분히 읽어드립니다.',
    href: '/saju/new',
    cta: '사주 시작하기',
  },
  {
    title: '사람 사이의 온도가 궁금하시면 궁합',
    body: '가족, 연인, 가까운 인연 사이에서 왜 마음이 엇갈리는지, 어디서 다시 다정해질 수 있는지 살펴봅니다.',
    href: '/compatibility',
    cta: '궁합 보기',
  },
  {
    title: '오늘 마음이 먼저 움직이신다면 타로',
    body: '질문 하나와 카드 한 장으로 지금의 감정선을 비추고, 필요하면 더 깊은 사주 해석으로 이어집니다.',
    href: '/tarot/daily',
    cta: '타로 뽑기',
  },
] as const;

export const INTERPRETATION_JOURNEY = [
  {
    title: '1. 먼저 가볍게 펼쳐봅니다',
    body: '부담 없는 첫 해석으로 지금 마음에 닿는 이야기를 먼저 만나봅니다.',
  },
  {
    title: '2. 마음에 남는 장면을 간직합니다',
    body: '다시 읽고 싶은 결과는 MY에 차곡차곡 모아, 가족 이야기나 올해의 흐름과 이어 봅니다.',
  },
  {
    title: '3. 필요할 때 더 깊이 들어갑니다',
    body: '격국, 용신, 대운처럼 오래 품고 볼 내용은 심층 리포트로 차분히 열어드립니다.',
  },
] as const;

export const SAJU_PREMIUM_PREVIEW = [
  {
    title: '격국이 보여주는 평생의 역할',
    body: '선생님이 어떤 자리에서 가장 힘을 발휘하시는지, 오래 쌓아온 역할감이 어디에서 빛나는지를 읽어드립니다.',
  },
  {
    title: '용신이 알려주는 균형 회복 포인트',
    body: '무엇을 더하고 무엇을 덜어야 편안해지는지, 생활 습관과 관계의 결까지 연결해 설명합니다.',
  },
  {
    title: '대운·세운이 답하는 지금의 타이밍',
    body: '원래 타고난 성향과 별개로 왜 유독 지금 흔들리는지, 혹은 왜 지금 기회가 열리는지 시기 언어로 읽습니다.',
  },
] as const;

export const SAJU_PREMIUM_VALUE_POINTS = [
  '원국만 설명하는 데서 멈추지 않고, 강약과 격국을 함께 엮어 해석합니다.',
  '현재 대운과 세운을 붙여 “왜 지금 이런가”를 한 화면에서 읽게 합니다.',
  '평생 소장형은 PDF와 업데이트 반영본까지 포함해 다시 꺼내보기 좋습니다.',
] as const;

export const COMPATIBILITY_DEEPENING_PREVIEW = [
  {
    title: '갈등이 반복되는 이유',
    body: '서로 상처받는 말투와 반응 순서를 짚어, 왜 비슷한 장면이 반복되는지 설명합니다.',
  },
  {
    title: '가까워지는 방식',
    body: '상대가 위로를 느끼는 말과 거리 두기를 원하는 순간을 읽어 관계의 온도를 조절하게 돕습니다.',
  },
  {
    title: '올해 두 분의 대화 타이밍',
    body: '올해와 이번 달 흐름을 겹쳐 어떤 때에 말하고, 어떤 때에 기다리는 편이 좋은지 읽습니다.',
  },
] as const;

export const COMPATIBILITY_PREMIUM_EXPANSION: Record<
  CompatibilityRelationshipSlug,
  {
    ctaTitle: string;
    ctaBody: string;
    preview: readonly { title: string; body: string }[];
  }
> = {
  lover: {
    ctaTitle: '연인 · 배우자는 감정의 타이밍까지 읽을 때 가장 또렷합니다',
    ctaBody:
      '좋아하는 마음과 서운함이 언제 엇갈리는지, 연락과 표현의 속도를 어떻게 맞추면 좋은지까지 프리미엄에서 더 구체적으로 이어집니다.',
    preview: [
      {
        title: '서운함이 커지는 순간',
        body: '누가 먼저 표현을 원하고, 누가 먼저 시간을 벌고 싶어 하는지 짚어 감정 충돌의 순서를 읽습니다.',
      },
      {
        title: '관계가 가까워지는 대화법',
        body: '상대가 안심을 느끼는 말투와 선생님의 진심이 잘 전달되는 타이밍을 함께 정리합니다.',
      },
      {
        title: '올해 관계 진전 포인트',
        body: '올해와 이번 달 흐름을 붙여, 말해야 할 때와 기다려야 할 때를 시기 언어로 설명합니다.',
      },
    ],
  },
  family: {
    ctaTitle: '부모 · 자녀는 말의 무게와 거리 조절을 함께 볼 때 달라집니다',
    ctaBody:
      '자녀에게 남는 말의 무게, 서로 지치기 쉬운 패턴, 응원으로 들리는 표현과 부담으로 남는 표현을 프리미엄에서 더 깊게 읽습니다.',
    preview: [
      {
        title: '갈등이 반복되는 이유',
        body: '서로 상처받는 말투와 반응 순서를 짚어, 왜 비슷한 장면이 반복되는지 설명합니다.',
      },
      {
        title: '가까워지는 방식',
        body: '상대가 위로를 느끼는 말과 거리 두기를 원하는 순간을 읽어 관계의 온도를 조절하게 돕습니다.',
      },
      {
        title: '올해 두 분의 대화 타이밍',
        body: '올해와 이번 달 흐름을 겹쳐 어떤 때에 말하고, 어떤 때에 기다리는 편이 좋은지 읽습니다.',
      },
    ],
  },
  friend: {
    ctaTitle: '형제 · 친구는 편안함 속 숨은 경쟁과 배려의 균형을 볼 때 선명해집니다',
    ctaBody:
      '오래된 친분 안에서 왜 어느 순간 서운함이 생기는지, 서로 기대하는 역할과 거리감의 차이를 프리미엄에서 더 세밀하게 읽습니다.',
    preview: [
      {
        title: '편안함이 깨지는 순간',
        body: '가벼운 말이 오해가 되는 지점과 서로 당연하게 기대하는 역할을 짚습니다.',
      },
      {
        title: '오래 가는 우정의 조건',
        body: '누가 먼저 연락을 열면 좋은지, 어느 정도 거리를 둘 때 관계가 더 오래 안정되는지 읽습니다.',
      },
      {
        title: '함께 움직이기 좋은 시기',
        body: '여행, 금전, 부탁 같은 현실 이슈를 언제 꺼내면 덜 무거운지 시기와 함께 설명합니다.',
      },
    ],
  },
  partner: {
    ctaTitle: '동업 · 파트너는 역할 분담과 재물 감각까지 봐야 판단이 섭니다',
    ctaBody:
      '누가 앞에서 끌고 가고 누가 뒤에서 정리하는지, 돈과 책임을 대하는 감각이 얼마나 맞는지 프리미엄에서 더 구체적으로 읽습니다.',
    preview: [
      {
        title: '역할이 엇갈리는 지점',
        body: '의사결정 속도와 책임감의 결이 어떻게 다른지 짚어 실무 충돌 포인트를 설명합니다.',
      },
      {
        title: '재물 감각의 차이',
        body: '확장과 보수, 투자와 관리 중 누가 어느 쪽에 가까운지 읽어 함께 돈을 다루는 방식을 제안합니다.',
      },
      {
        title: '함께 움직여도 좋은 시기',
        body: '계약, 확장, 정리 중 무엇을 먼저 보는 편이 좋은지 현재 흐름과 연결해 안내합니다.',
      },
    ],
  },
} as const;

export const TAROT_TO_SAJU_BRIDGE = [
  '타로는 지금의 감정과 장면을 읽고, 사주는 그 장면이 왜 반복되는지를 설명합니다.',
  '카드 한 장이 마음에 남았다면, 사주에서는 같은 질문을 대운과 오행의 구조까지 이어서 볼 수 있습니다.',
  '관계, 재물, 진로처럼 오래 붙드는 질문일수록 타로 뒤에 사주를 붙였을 때 해석의 깊이가 크게 달라집니다.',
] as const;

export const CHECKOUT_PLAN_GUIDE: Record<
  PlanSlug,
  {
    title: string;
    price: string;
    nextRange: string;
    reassurance: string;
    opens: readonly string[];
    notices: readonly string[];
  }
> = {
  basic: {
    title: 'Plus',
    price: '월 4,900원',
    nextRange: '첫 결제 후 30일 이용',
    reassurance: '가볍게 시작해도 핵심 해석 흐름은 충분히 경험하실 수 있습니다.',
    opens: ['심층 리포트 월 2회', '기본 해석과 대화 상담', '광고 없는 차분한 이용'],
    notices: ['첫 결제 후 30일 이용권으로 반영', '마이페이지에서 상태 확인 가능', '열람 전 환불 기준 함께 안내'],
  },
  premium: {
    title: '프리미엄',
    price: '월 9,900원',
    nextRange: '첫 결제 후 30일 이용',
    reassurance: '가족 사주, 궁합, 대화까지 가장 넓게 쓰실 수 있는 메인 플랜입니다.',
    opens: ['궁합 분석과 가족 사주 5명', '심층 리포트 월 10회', '대화 상담 무제한'],
    notices: ['첫 결제 후 30일 이용권으로 반영', '언제든 플랜 화면에서 상태 확인 가능', '이용 내역과 환불 기준을 한 번 더 고지'],
  },
  lifetime: {
    title: '평생 심층 리포트',
    price: '49,000원',
    nextRange: '한 번 결제 · 평생 소장',
    reassurance: '월 구독 없이 완성본 하나를 오래 보관하고 싶은 분께 맞는 선택입니다.',
    opens: ['7개 섹션 완성형 리포트', 'PDF 다운로드', '업데이트 반영본 재열람'],
    notices: ['자동 갱신 없음', '결제 즉시 전체 리포트 열람', '평생 보관용 저장본 제공'],
  },
} as const;

export const COMPLETE_PLAN_GUIDE: Record<
  PlanSlug,
  {
    welcome: string;
    giftTitle: string;
    giftBody: string;
    nextSteps: readonly string[];
    primaryHref: string;
    primaryLabel: string;
  }
> = {
  basic: {
    welcome: '가볍게 시작하셨지만, 핵심 해석을 읽기엔 충분한 첫걸음입니다.',
    giftTitle: '이번 달 심층 리포트 2회',
    giftBody: '기본 해석을 보다가 더 깊이 보고 싶은 결과가 나오면 바로 심층 리포트로 이어가실 수 있습니다.',
    nextSteps: ['사주 기본 해석부터 저장하기', '마음에 남는 질문을 대화로 이어보기', '첫 심층 리포트 1회 써보기'],
    primaryHref: '/saju/new',
    primaryLabel: '내 첫 해석 시작하기',
  },
  premium: {
    welcome: '프리미엄 멤버로 모시게 되어 기쁩니다. 가장 넓은 해석 흐름이 지금부터 열립니다.',
    giftTitle: '첫 심층 리포트',
    giftBody: '궁합, 가족 사주, 대화까지 함께 쓰실 수 있는 메인 플랜의 핵심 혜택이 바로 열렸습니다.',
    nextSteps: ['심층 리포트 1건 바로 열기', '가족 사주 한 분 저장하기', '궁합 결과를 프리미엄 버전으로 읽어보기'],
    primaryHref: '/saju/new',
    primaryLabel: '지금 심층 리포트 받기',
  },
  lifetime: {
    welcome: '한 번의 결제로 완성형 리포트를 오래 간직하실 수 있게 되었습니다.',
    giftTitle: '평생 소장 리포트',
    giftBody: '격국, 용신, 대운, 세운까지 담긴 7개 섹션 완성본과 PDF 저장본이 바로 준비됩니다.',
    nextSteps: ['내 명식으로 완성형 리포트 열기', 'PDF 저장본 확인하기', '업데이트 반영본 다시 보기'],
    primaryHref: '/saju/new',
    primaryLabel: '완성형 리포트 열기',
  },
} as const;

export const TAROT_QUESTION_OPTIONS: readonly MoonlightTarotQuestionOption[] = [
  { emoji: '💭', label: '오늘 하루 어떤 메시지가 있을까' },
  { emoji: '🤝', label: '지금 고민 중인 관계에 대하여' },
  { emoji: '🎯', label: '지금 결정해야 할 선택에 대하여' },
  { emoji: '🌱', label: '앞으로의 방향에 대하여' },
] as const;

export const TAROT_CARD_KEYWORDS = [
  ['The Fool', '새로운 발걸음, 두려워 마세요'],
  ['The Moon', '보이는 것 뒤에 숨은 것을 살피세요'],
  ['The Sun', '환한 시기가 옵니다'],
  ['The Hermit', '홀로 있는 시간이 답을 줍니다'],
  ['The Lovers', '마음이 향하는 쪽이 옳은 쪽입니다'],
  ['Death', '끝이 아니라 새로운 시작입니다'],
] as const;

export const TAROT_CARD_READING_COPY = {
  'The Fool': {
    arcana: '0',
    title: '바보 · The Fool',
    subtitle: '시작과 순수',
    guidance:
      '새롭게 움직여보라는 메시지입니다. 아직 확신이 다 서지 않았더라도 작은 발걸음을 떼는 쪽에서 기회가 생깁니다.',
    sajuBlend:
      '선생님의 사주 흐름과 만나면, 이 카드는 오래 망설인 일을 너무 무겁게만 보지 말고 한 번쯤 가볍게 시작해보라고 권합니다.',
    action:
      '완벽히 준비될 때까지 기다리기보다 오늘 할 수 있는 가장 작은 시작 하나를 정해보세요.',
  },
  'The Moon': {
    arcana: 'XVIII',
    title: '달(月) · The Moon',
    subtitle: '직관과 무의식',
    guidance:
      '보이는 것 뒤에 숨은 것을 살피라는 메시지입니다. 지금 관계에서 드러난 장면보다 드러나지 않은 진심이 더 중요합니다.',
    sajuBlend:
      '선생님의 사주와 만나면 이 카드는 앞서 나가려는 기운을 잠시 식혀주며, 감정을 먼저 드러내기보다 상대의 속내와 타이밍을 읽으라고 권합니다.',
    action:
      '말 한마디 전에 “혹시 이분은 어떤 마음일까”를 세 번쯤 헤아려보세요.',
  },
  'The Sun': {
    arcana: 'XIX',
    title: '태양(日) · The Sun',
    subtitle: '성취와 기쁨',
    guidance:
      '기운이 환하게 열리는 카드입니다. 움츠렸던 이야기나 관계를 조금 더 밝게 드러낼수록 흐름이 쉬워집니다.',
    sajuBlend:
      '사주 흐름과 만나면, 이 카드는 선생님의 장점과 진심을 감추지 말고 드러내는 편이 재물과 관계 모두에 더 도움이 된다고 읽습니다.',
    action:
      '감사나 칭찬, 반가운 마음을 한 번 더 표현해보세요. 좋은 흐름이 더 크게 열립니다.',
  },
  'The Hermit': {
    arcana: 'IX',
    title: '은둔자 · The Hermit',
    subtitle: '성찰과 내면의 등불',
    guidance:
      '서두르기보다 조용히 돌아보라는 카드입니다. 답은 바깥의 소란보다 내 안의 정리에서 먼저 찾아옵니다.',
    sajuBlend:
      '사주와 겹쳐 보면 지금은 많은 사람의 의견보다 선생님 스스로의 감각과 경험을 신뢰할 때라고 읽을 수 있습니다.',
    action:
      '혼자 차분히 생각할 시간을 조금 확보해보세요. 오늘의 답은 고요한 틈에서 더 선명해집니다.',
  },
  'The Lovers': {
    arcana: 'VI',
    title: '연인(戀人) · The Lovers',
    subtitle: '선택과 조화',
    guidance:
      '마음이 향하는 쪽을 분명히 하라는 메시지입니다. 사람과 일 모두에서 무엇을 가까이 둘지 선택이 필요합니다.',
    sajuBlend:
      '선생님의 사주 흐름과 만나면, 이 카드는 관계를 억지로 끌고 가기보다 진심이 통하는 방향을 또렷이 정할수록 더 편해진다고 읽습니다.',
    action:
      '좋아하는 방향과 지키고 싶은 관계를 오늘 안에 한 줄로 정리해보세요.',
  },
  Death: {
    arcana: 'XIII',
    title: '변화(變化) · Death',
    subtitle: '정리와 재출발',
    guidance:
      '끝이 아니라 새로운 시작을 알리는 카드입니다. 오래 붙들고 있던 방식 하나를 정리하면 다음 장면이 열립니다.',
    sajuBlend:
      '사주 흐름과 함께 보면, 이 카드는 선생님이 이미 충분히 해오신 일을 내려놓고 더 가벼운 방식으로 옮겨갈 시점이 왔음을 말해줍니다.',
    action:
      '미련보다 정리가 필요한 한 가지를 골라 오늘 조용히 마무리해보세요.',
  },
} as const;

export const TEN_GODS_GUIDE: readonly MoonlightTenGodCard[] = [
  {
    name: '정인',
    hanja: '正印',
    meaning: '학문 · 후원 · 어머니',
    seniorCopy: '나를 돌봐주는 손길, 그런 사람이 있으십니까',
  },
  {
    name: '편인',
    hanja: '偏印',
    meaning: '직관 · 전문기술',
    seniorCopy: '남다른 감각, 특별한 눈',
  },
  {
    name: '비견',
    hanja: '比肩',
    meaning: '동료 · 형제 · 자존',
    seniorCopy: '나와 같은 결의 사람들',
  },
  {
    name: '겁재',
    hanja: '劫財',
    meaning: '경쟁 · 재물 분산',
    seniorCopy: '가까운 듯 가까이 있으면 닳는 인연',
  },
  {
    name: '식신',
    hanja: '食神',
    meaning: '표현 · 여유 · 자녀',
    seniorCopy: '내가 키워내는 것, 자녀 혹은 결실',
  },
  {
    name: '상관',
    hanja: '傷官',
    meaning: '재능 · 반항',
    seniorCopy: '재주가 넘쳐 틀을 벗어나는 자유로움',
  },
  {
    name: '정재',
    hanja: '正財',
    meaning: '고정 재물 · 배우자',
    seniorCopy: '꾸준히 쌓아올리신 것들',
  },
  {
    name: '편재',
    hanja: '偏財',
    meaning: '유동 재물 · 활동',
    seniorCopy: '큰 물결처럼 들고 나는 재물',
  },
  {
    name: '정관',
    hanja: '正官',
    meaning: '명예 · 직장',
    seniorCopy: '나를 세워주는 자리, 그 이름',
  },
  {
    name: '편관',
    hanja: '偏官',
    meaning: '권력 · 경쟁',
    seniorCopy: '나를 단련시키는 힘',
  },
] as const;

export const MEMBERSHIP_REASSURANCE = [
  '해지는 언제든 가능하며, 남은 이용 기간은 끝까지 편히 보실 수 있습니다.',
  '열람 전 상태와 이용 기준을 먼저 보여드리고, 환불 기준도 같은 화면에서 확인하실 수 있습니다.',
  '현재 멤버십 결제는 30일 이용권으로 먼저 안전하게 반영하고, 자동 갱신 결제키 연동은 별도 단계로 다룹니다.',
] as const;

export const CHECKOUT_METHODS = [
  '카드 결제 또는 계좌이체 선택',
  '결제 승인 후 멤버십 자동 반영',
  '실패 시 권한 미반영 후 결제 화면 복귀',
] as const;

export const SETTINGS_BLUEPRINT = [
  {
    title: '글자 크기',
    options: '보통 · 크게 · 아주 크게',
    reason: '시력 개인차에 맞춰 읽기 부담을 줄입니다.',
  },
  {
    title: '말투',
    options: '정중 · 친근 · 표준',
    reason: '기본은 정중체로 두고 개인 취향을 반영합니다.',
  },
  {
    title: '한자 표기',
    options: '한자 병기 · 한글만',
    reason: '세대별 선호와 이해도를 함께 맞춥니다.',
  },
  {
    title: '알림 시간',
    options: '아침 · 점심 · 저녁',
    reason: '매일 같은 시간에 들어오게 만드는 루틴을 돕습니다.',
  },
  {
    title: '알림 스타일',
    options: '조용히 · 보통 · 소리',
    reason: '방해 수준을 스스로 선택할 수 있게 합니다.',
  },
  {
    title: '생체 인증',
    options: '지문 · 얼굴 · 4자리 비밀번호',
    reason: '복잡한 비밀번호 없이도 안전하게 다시 들어올 수 있습니다.',
  },
  {
    title: '데이터 관리',
    options: '내 데이터 내보내기 · 계정 삭제',
    reason: '개인정보와 보관 기록을 투명하게 관리할 수 있습니다.',
  },
] as const;

export const FAMILY_PLAN_LIMITS = [
  '무료·Plus: 본인만 저장',
  '프리미엄: 본인 + 가족 5명',
  '평생 심층: 본인 + 가족 10명',
] as const;

export const STAR_SIGN_BLUEPRINT = {
  featuredSlug: 'pisces',
  intro: '저 먼 별빛이 오늘 당신에게 전하는 한 마디',
  cross: '서양의 별빛과 동양의 명식을 나란히 놓고, 오늘 마음에 더 가까운 결을 함께 읽어드립니다.',
} as const;

export const STAR_SIGN_META = {
  aries: { symbol: '♈', seniorCopy: '한 번 결심하면 끝까지 가시는 분' },
  taurus: { symbol: '♉', seniorCopy: '뿌리 깊은 나무 같은 분' },
  gemini: { symbol: '♊', seniorCopy: '늘 새로운 것을 찾는 젊은 마음' },
  cancer: { symbol: '♋', seniorCopy: '가족을 품에 안는 따뜻한 분' },
  leo: { symbol: '♌', seniorCopy: '존재 자체로 빛나시는 분' },
  virgo: { symbol: '♍', seniorCopy: '세심함이 큰 재산인 분' },
  libra: { symbol: '♎', seniorCopy: '양쪽을 헤아리는 지혜를 지닌 분' },
  scorpio: { symbol: '♏', seniorCopy: '속마음이 깊은 분' },
  sagittarius: { symbol: '♐', seniorCopy: '멀리 보는 안목을 지닌 분' },
  capricorn: { symbol: '♑', seniorCopy: '묵묵히 쌓아오신 분' },
  aquarius: { symbol: '♒', seniorCopy: '남다른 시선을 가지신 분' },
  pisces: { symbol: '♓', seniorCopy: '마음으로 먼저 아시는 분' },
} as const;

export const ZODIAC_BLUEPRINT = {
  highlightedSlug: 'snake',
  yearlyLabel: '2026년 병오(丙午) · 말의 해',
} as const;

export const ZODIAC_META = {
  rat: { symbol: '🐭', yearlyMessage: '쌓아둔 씨앗이 싹을 틔우는 해' },
  ox: { symbol: '🐮', yearlyMessage: '묵묵히 한 걸음, 큰 열매를 맺는 해' },
  tiger: { symbol: '🐯', yearlyMessage: '오래 미뤄둔 일을 정리하실 해' },
  rabbit: { symbol: '🐰', yearlyMessage: '안팎의 균형을 다잡는 해' },
  dragon: { symbol: '🐲', yearlyMessage: '날아오를 준비를 마무리하는 해' },
  snake: { symbol: '🐍', yearlyMessage: '깊이 사고하고 때를 기다리는 해' },
  horse: { symbol: '🐴', yearlyMessage: '본인의 해, 크게 움직이기보다 중심을 잡는 해' },
  goat: { symbol: '🐑', yearlyMessage: '주변과의 관계가 더 따뜻해지는 해' },
  monkey: { symbol: '🐵', yearlyMessage: '새로운 만남과 배움이 활발한 해' },
  rooster: { symbol: '🐔', yearlyMessage: '오래 준비한 일이 빛을 보는 해' },
  dog: { symbol: '🐶', yearlyMessage: '가까운 이들과 더욱 돈독해지는 해' },
  pig: { symbol: '🐷', yearlyMessage: '풍요가 조용히 쌓이는 해' },
} as const;

export function toneClasses(tone: MoonlightTone) {
  switch (tone) {
    case 'jade':
      return {
        text: 'text-[var(--app-jade)]',
        border: 'border-[var(--app-jade)]/28',
        bg: 'bg-[var(--app-jade)]/10',
      };
    case 'plum':
      return {
        text: 'text-[var(--app-plum)]',
        border: 'border-[var(--app-plum)]/28',
        bg: 'bg-[var(--app-plum)]/10',
      };
    case 'sky':
      return {
        text: 'text-[var(--app-sky)]',
        border: 'border-[var(--app-sky)]/28',
        bg: 'bg-[var(--app-sky)]/10',
      };
    case 'gold':
    default:
      return {
        text: 'text-[var(--app-gold-text)]',
        border: 'border-[var(--app-gold)]/28',
        bg: 'bg-[var(--app-gold)]/10',
      };
  }
}
