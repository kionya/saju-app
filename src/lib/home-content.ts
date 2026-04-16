import type { FocusTopic } from './saju/report';

export const HOUR_OPTIONS = [
  { label: '모름', value: '' },
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
  { key: 'today', label: '오늘', hook: '지금 바로 흐름 보기' },
  { key: 'love', label: '연애', hook: '속마음과 연락 타이밍' },
  { key: 'wealth', label: '재물', hook: '소비와 기회 포착' },
  { key: 'career', label: '직장', hook: '이직·협업·성과' },
  { key: 'relationship', label: '관계', hook: '가까운 사람과의 거리감' },
];

export const TRUST_POINTS = [
  '태어난 시간 몰라도 시작 가능',
  '결과 자동 저장',
  '심화 리포트는 1코인부터',
];

export const FREE_EXPERIENCES = [
  {
    title: '오늘의 무료 타로',
    body: '질문 없이 한 장만 뽑아도 오늘의 기분과 흐름을 바로 읽을 수 있습니다.',
    status: '지금 보기',
    href: '/tarot/daily',
  },
  {
    title: '띠별 운세',
    body: '검색 유입용 가벼운 운세 메뉴. 로그인 없이 빠르게 훑어보는 입구입니다.',
    status: '지금 보기',
    href: '/zodiac',
  },
  {
    title: '별자리 운세',
    body: '생년월일 입력 전에 앱처럼 가볍게 소비하는 루틴형 콘텐츠로 확장합니다.',
    status: '지금 보기',
    href: '/star-sign',
  },
  {
    title: '꿈해몽',
    body: 'SEO 유입과 바이럴에 강한 메뉴. 짧은 설명과 연관 키워드 구조가 핵심입니다.',
    status: '지금 보기',
    href: '/dream-interpretation',
  },
] as const;

export const TAROT_CARDS = [
  {
    name: 'The Star',
    theme: '회복',
    message: '오늘은 결과를 서두르기보다 마음을 정리할수록 더 좋은 선택이 보입니다.',
    focus: '감정이 맑아지는 타이밍을 기다리세요.',
  },
  {
    name: 'The Sun',
    theme: '표현',
    message: '숨기고 있던 매력을 드러낼수록 관계와 일 모두 활기를 얻는 날입니다.',
    focus: '먼저 말 걸고 먼저 제안하는 쪽이 유리합니다.',
  },
  {
    name: 'Wheel of Fortune',
    theme: '전환',
    message: '흐름이 바뀌는 날에는 작아 보여도 바로 잡은 기회가 크게 이어집니다.',
    focus: '우연처럼 온 제안을 흘려보내지 마세요.',
  },
  {
    name: 'Justice',
    theme: '정리',
    message: '기준을 다시 세우는 것이 중요합니다. 모호한 관계와 지출부터 정리하세요.',
    focus: '한 번 더 확인하고 결정하면 손실을 줄일 수 있습니다.',
  },
  {
    name: 'The Lovers',
    theme: '선택',
    message: '누구와 무엇을 가까이 둘지 선명하게 정해야 마음도 가벼워집니다.',
    focus: '좋아하는 방향을 분명히 말할수록 관계가 편해집니다.',
  },
] as const;

export const TAROT_TOPICS = [
  { title: '속마음 타로', desc: '상대의 현재 감정선과 거리감을 짧게 읽는 테마형 리딩', status: '곧 오픈' },
  { title: '재회 타로', desc: '관계가 다시 움직일 여지가 있는지 시기와 감정 온도로 확인', status: '곧 오픈' },
  { title: '이직 타로', desc: '지금 떠나는 편이 맞는지, 조금 더 준비해야 하는지 판단 보조', status: '곧 오픈' },
] as const;

export const MEMBERSHIP_POINTS = [
  '광고 없이 보는 데일리 리포트',
  '월간 심화 리포트 2회',
  '결과 보관함과 운세 캘린더',
];

export function getCardOfTheDay() {
  const dayIndex = new Date().getDate() % TAROT_CARDS.length;
  return TAROT_CARDS[dayIndex];
}
