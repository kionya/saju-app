import type { FocusTopic } from '@/lib/saju/report';

export const HOUR_OPTIONS = [
  { label: '모름 (시주 미입력)', value: '' },
  { label: '자시 (23~01시)', value: '0' },
  { label: '축시 (01~03시)', value: '2' },
  { label: '인시 (03~05시)', value: '4' },
  { label: '묘시 (05~07시)', value: '6' },
  { label: '진시 (07~09시)', value: '8' },
  { label: '사시 (09~11시)', value: '10' },
  { label: '오시 (11~13시)', value: '12' },
  { label: '미시 (13~15시)', value: '14' },
  { label: '신시 (15~17시)', value: '16' },
  { label: '유시 (17~19시)', value: '18' },
  { label: '술시 (19~21시)', value: '20' },
  { label: '해시 (21~23시)', value: '22' },
] as const;

export const QUESTION_CHIPS: Array<{ key: FocusTopic; label: string; hook: string }> = [
  { key: 'today', label: '오늘의 흐름', hook: '지금 체감되는 흐름 먼저 보기' },
  { key: 'love', label: '연애운', hook: '연락 타이밍과 감정 온도' },
  { key: 'wealth', label: '재물운', hook: '지출, 기회, 수입 흐름' },
  { key: 'career', label: '직장운', hook: '성과, 협업, 이직 판단' },
  { key: 'relationship', label: '인간관계', hook: '가까운 사람과의 거리감' },
];

export const TRUST_POINTS = [
  '생년월일만으로 바로 시작',
  '태어난 시간 몰라도 OK',
  '결과 자동 저장',
  '30초 이내 첫 결과',
];

export const HERO_REPORT_PREVIEW: Record<
  FocusTopic,
  { score: number; summary: string; signal: string; action: string }
> = {
  today: {
    score: 82,
    summary: '오늘은 한 번에 많은 결정을 하기보다, 먼저 해야 할 한 가지를 선명하게 잡는 편이 유리합니다.',
    signal: '총운이 부드럽게 올라오는 날',
    action: '늦은 오후 전에 중요한 연락을 먼저 여세요.',
  },
  love: {
    score: 78,
    summary: '감정 표현을 아끼기보다 타이밍을 맞춰 꺼낼수록 관계가 자연스럽게 움직입니다.',
    signal: '연애운이 회복 국면으로 들어갑니다',
    action: '먼저 답장을 미루지 않는 쪽이 흐름을 가져갑니다.',
  },
  wealth: {
    score: 74,
    summary: '큰 한 방보다 새는 지출을 정리하는 쪽이 체감 이익으로 이어질 가능성이 높습니다.',
    signal: '재물운은 정리형 접근이 유리합니다',
    action: '오늘은 소비 전 체크리스트를 꼭 한 번 더 보세요.',
  },
  career: {
    score: 80,
    summary: '직장운은 꾸준히 올라오고 있고, 협업에서 역할을 먼저 정리할수록 피로가 줄어듭니다.',
    signal: '직장운은 안정적 상승 흐름입니다',
    action: '애매한 업무 경계는 오전에 먼저 정리해 두세요.',
  },
  relationship: {
    score: 76,
    summary: '관계운은 말의 톤을 조금만 부드럽게 조정해도 체감 차이가 크게 나는 날입니다.',
    signal: '관계는 속도보다 온도 조절이 중요합니다',
    action: '감정이 올라오면 결론보다 질문을 먼저 던지세요.',
  },
};

export const SERVICE_ENTRY_CARDS = [
  {
    eyebrow: '정통 사주',
    title: '사주팔자 리포트',
    body: '생년월일만으로 총운·연애·재물·직장 흐름을 요약 카드로 받아보세요. 태어난 시간을 더하면 시주까지 반영한 정밀 결과로 이어집니다.',
    cta: '사주 시작하기',
    href: '/saju/new',
  },
  {
    eyebrow: '궁합 분석',
    title: '두 사람의 사주 궁합',
    body: '두 사람의 오행 구조와 일간의 조화를 분석합니다. 감정 온도, 가치관의 충돌 지점, 장기적 궁합 포인트까지 살펴볼 수 있습니다.',
    cta: '궁합 보기',
    href: '/#compatibility-lab',
  },
  {
    eyebrow: '저장 · 관리',
    title: '내 리포트 보관함',
    body: '로그인 후 생성한 리포트를 언제든 다시 꺼내볼 수 있습니다. 코인으로 심화 해석을 추가하거나, 멤버십으로 매달 새 리포트를 받으세요.',
    cta: 'MY 보관함',
    href: '/my',
  },
] as const;

export const FREE_EXPERIENCES = [
  {
    title: '오늘의 운세',
    body: '로그인 없이 오늘 날짜 기반으로 바로 확인할 수 있는 무료 일일 운세입니다.',
    status: '무료',
    href: '/today-fortune',
  },
  {
    title: '오늘의 타로',
    body: '질문 없이 한 장만 뽑아도 오늘의 기분과 흐름을 바로 읽을 수 있는 무료 타로입니다.',
    status: '무료',
    href: '/tarot/daily',
  },
  {
    title: '띠별 · 별자리',
    body: '띠와 별자리로 간단하게 운세 흐름을 살펴보는 가벼운 콘텐츠입니다.',
    status: '무료',
    href: '/zodiac',
  },
  {
    title: '꿈해몽',
    body: '꿈에서 본 상징과 상황의 의미를 풀어드립니다. 무료로 바로 검색해보세요.',
    status: '무료',
    href: '/dream-interpretation',
  },
] as const;

export const TAROT_TOPICS = [
  {
    title: '속마음 타로',
    desc: '상대의 현재 감정선과 거리감을 짧게 읽는 테마형 리딩',
    status: '곧 오픈',
  },
  {
    title: '재회 타로',
    desc: '관계가 다시 움직일 여지가 있는지 시기와 감정 온도로 확인',
    status: '곧 오픈',
  },
  {
    title: '이직 타로',
    desc: '지금 떠나는 편이 맞는지, 조금 더 준비해야 하는지 판단을 돕는 타로',
    status: '곧 오픈',
  },
] as const;

export const MEMBERSHIP_POINTS = [
  '광고 없는 데일리 리포트',
  '매월 심화 리포트 2회',
  '리포트 보관함 무제한',
  '운세 캘린더 제공',
];

export const MOBILE_HOME_DOCK_ITEMS = [
  { label: '사주 시작', href: '/saju/new', tone: 'service' },
  { label: '궁합', href: '/#compatibility-lab', tone: 'service' },
  { label: '코인', href: '/credits', tone: 'service' },
  { label: '무료운세', href: '/today-fortune', tone: 'acquisition' },
] as const;
