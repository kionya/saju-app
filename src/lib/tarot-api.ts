import tarotCardData from '@/data/tarot-card-data.json';

export type TarotOrientation = 'upright' | 'reversed';
export type TarotQuestionTone = 'daily' | 'relationship' | 'choice' | 'direction';
export type TarotDeckSource = 'api' | 'local';
export type TarotSuit = 'cups' | 'pentacles' | 'swords' | 'wands';

export interface TarotApiCard {
  type: 'major' | 'minor';
  name_short: string;
  name: string;
  value: string;
  value_int: number;
  meaning_up: string;
  meaning_rev: string;
  desc: string;
  suit?: TarotSuit;
}

export interface TarotReading {
  card: TarotApiCard;
  displayName: string;
  shortName: string;
  arcanaLabel: string;
  cardMarker: string;
  orientation: TarotOrientation;
  orientationLabel: string;
  tone: TarotQuestionTone;
  toneLabel: string;
  theme: string;
  subtitle: string;
  keyword: string;
  guidance: string;
  sajuBlend: string;
  action: string;
  source: TarotDeckSource;
  meaningExcerpt: string;
}

export interface TarotSpreadCard {
  position: string;
  reading: TarotReading;
}

const TAROT_API_CARDS_URL = 'https://tarotapi.dev/api/v1/cards';
const REVALIDATE_SECONDS = 60 * 60 * 12;
const TAROT_API_TIMEOUT_MS = 2_500;
const SUITS = ['cups', 'pentacles', 'swords', 'wands'] as const;
const FALLBACK_PAYLOAD = tarotCardData as unknown as { cards?: unknown };
const FALLBACK_CARDS = normalizeCards(FALLBACK_PAYLOAD.cards);

const TONE_LABELS: Record<TarotQuestionTone, string> = {
  daily: '오늘의 메시지',
  relationship: '관계 질문',
  choice: '선택 질문',
  direction: '방향 질문',
};

const ORIENTATION_LABELS: Record<TarotOrientation, string> = {
  upright: '정방향',
  reversed: '역방향',
};

const MAJOR_CARD_NAMES: Record<string, string> = {
  'The Fool': '바보',
  'The Magician': '마법사',
  'The High Priestess': '여사제',
  'The Empress': '여황제',
  'The Emperor': '황제',
  'The Hierophant': '교황',
  'The Lovers': '연인',
  'The Chariot': '전차',
  Fortitude: '힘',
  'Wheel Of Fortune': '운명의 수레바퀴',
  Justice: '정의',
  'The Hanged Man': '매달린 사람',
  Death: '변화',
  Temperance: '절제',
  'The Devil': '악마',
  'The Tower': '탑',
  'The Star': '별',
  'The Moon': '달',
  'The Sun': '태양',
  'The Last Judgment': '심판',
  'The World': '세계',
};

const MAJOR_THEMES: Record<
  string,
  {
    theme: string;
    focus: string;
    action: string;
    sajuElement: string;
  }
> = {
  'The Fool': {
    theme: '새로운 시작과 가벼운 용기',
    focus: '완벽한 확신보다 첫 발걸음',
    action: '오늘 할 수 있는 가장 작은 시작 하나를 정해보세요.',
    sajuElement: '새 운을 받아들이는 움직임',
  },
  'The Magician': {
    theme: '의지와 실행력',
    focus: '이미 가진 도구를 꺼내 쓰는 태도',
    action: '미뤄둔 연락이나 제안을 한 가지 실행해보세요.',
    sajuElement: '타고난 재능을 현실로 옮기는 힘',
  },
  'The High Priestess': {
    theme: '직관과 조용한 통찰',
    focus: '겉말보다 마음의 결을 읽는 일',
    action: '바로 답하지 말고 마음이 먼저 반응하는 지점을 적어보세요.',
    sajuElement: '내면의 기운을 차분히 보존하는 힘',
  },
  'The Empress': {
    theme: '풍요와 돌봄',
    focus: '관계와 일에 따뜻한 여지를 주는 태도',
    action: '나와 가까운 사람에게 작은 친절을 먼저 건네보세요.',
    sajuElement: '기운을 키우고 결실로 만드는 힘',
  },
  'The Emperor': {
    theme: '질서와 책임',
    focus: '흔들리는 일을 구조화하는 태도',
    action: '오늘 결정해야 할 기준을 세 가지로 좁혀보세요.',
    sajuElement: '중심을 세우고 흐름을 붙드는 힘',
  },
  'The Hierophant': {
    theme: '원칙과 배움',
    focus: '검증된 조언과 오래된 지혜',
    action: '혼자 단정하지 말고 믿을 만한 기준을 하나 더 확인해보세요.',
    sajuElement: '전통과 경험에서 길을 찾는 힘',
  },
  'The Lovers': {
    theme: '선택과 조화',
    focus: '마음이 향하는 방향을 분명히 하는 일',
    action: '지키고 싶은 관계와 내려놓을 기대를 한 줄씩 써보세요.',
    sajuElement: '인연의 결을 고르는 힘',
  },
  'The Chariot': {
    theme: '전진과 통제',
    focus: '마음을 모아 한 방향으로 움직이는 태도',
    action: '오늘은 여러 길보다 가장 중요한 한 길을 먼저 밀어보세요.',
    sajuElement: '운의 속도를 조절하며 나아가는 힘',
  },
  Fortitude: {
    theme: '용기와 부드러운 힘',
    focus: '밀어붙이기보다 다스리는 태도',
    action: '센 말보다 차분한 말로 상황을 안정시켜보세요.',
    sajuElement: '강한 기운을 온화하게 쓰는 힘',
  },
  'Wheel Of Fortune': {
    theme: '전환과 흐름',
    focus: '바뀌는 판을 읽고 맞춰 움직이는 태도',
    action: '계획 하나를 고집하기보다 대안을 함께 준비해보세요.',
    sajuElement: '시절의 흐름을 타는 감각',
  },
  Justice: {
    theme: '균형과 판단',
    focus: '감정과 사실을 나누어 보는 태도',
    action: '마음에 걸리는 일을 사실과 추측으로 나누어 정리해보세요.',
    sajuElement: '기운의 균형을 맞추는 판단력',
  },
  'The Hanged Man': {
    theme: '기다림과 관점 전환',
    focus: '서두르지 않고 다르게 바라보는 태도',
    action: '오늘은 답을 재촉하기보다 관점을 바꿔 다시 읽어보세요.',
    sajuElement: '멈춤 안에서 새 흐름을 찾는 힘',
  },
  Death: {
    theme: '정리와 재출발',
    focus: '끝처럼 보이는 장면 뒤의 새 시작',
    action: '묵은 방식 하나를 조용히 마무리해보세요.',
    sajuElement: '낡은 기운을 비우고 새 운을 들이는 힘',
  },
  Temperance: {
    theme: '조율과 회복',
    focus: '서로 다른 마음을 섞어 균형을 찾는 태도',
    action: '극단의 답보다 중간에서 살릴 수 있는 방법을 찾아보세요.',
    sajuElement: '오행의 균형을 맞추는 조화력',
  },
  'The Devil': {
    theme: '집착을 알아차리는 힘',
    focus: '나를 묶는 욕심과 불안을 부드럽게 풀어내는 일',
    action: '오늘은 꼭 붙들어야 할 것과 잠시 내려놓을 것을 구분해보세요.',
    sajuElement: '강한 욕망을 현실 감각으로 다루는 힘',
  },
  'The Tower': {
    theme: '각성과 재정비',
    focus: '흔들림 속에서 새 질서를 세우는 태도',
    action: '불편한 신호를 덮지 말고 고칠 수 있는 부분부터 손보세요.',
    sajuElement: '막힌 기운을 깨고 새 길을 내는 힘',
  },
  'The Star': {
    theme: '희망과 회복',
    focus: '멀리 있는 빛을 보며 마음을 회복하는 일',
    action: '오늘은 나를 살리는 작은 루틴 하나를 다시 시작해보세요.',
    sajuElement: '약해진 기운을 맑게 회복하는 힘',
  },
  'The Moon': {
    theme: '직관과 숨은 마음',
    focus: '보이지 않는 불안을 천천히 살피는 태도',
    action: '확인되지 않은 걱정은 잠시 내려두고 실제 신호만 보세요.',
    sajuElement: '감정의 물결을 읽는 감각',
  },
  'The Sun': {
    theme: '환함과 성취',
    focus: '감추지 않고 밝게 드러내는 태도',
    action: '감사나 칭찬, 반가운 마음을 한 번 더 표현해보세요.',
    sajuElement: '기운을 밖으로 펼쳐 결실을 부르는 힘',
  },
  'The Last Judgment': {
    theme: '부름과 재평가',
    focus: '지나온 일을 다시 보고 새 답을 듣는 태도',
    action: '오래 미뤘던 판단을 오늘의 눈으로 다시 살펴보세요.',
    sajuElement: '때가 되어 다시 깨어나는 운의 신호',
  },
  'The World': {
    theme: '완성과 통합',
    focus: '흩어진 경험을 하나의 결론으로 모으는 일',
    action: '마무리할 일 하나를 끝내고 다음 단계의 이름을 붙여보세요.',
    sajuElement: '운의 한 주기를 완성하는 힘',
  },
};

const SUIT_THEMES: Record<
  TarotSuit,
  {
    korean: string;
    marker: string;
    theme: string;
    focus: string;
    sajuElement: string;
  }
> = {
  cups: {
    korean: '컵',
    marker: '水',
    theme: '감정과 관계',
    focus: '마음의 온도와 관계의 흐름',
    sajuElement: '수기처럼 흐르는 감정의 결',
  },
  pentacles: {
    korean: '펜타클',
    marker: '土',
    theme: '현실과 재물',
    focus: '손에 잡히는 안정과 생활의 기반',
    sajuElement: '토기처럼 쌓아가는 현실 감각',
  },
  swords: {
    korean: '소드',
    marker: '風',
    theme: '생각과 판단',
    focus: '말, 판단, 경계의 선',
    sajuElement: '금기처럼 분별하고 가르는 힘',
  },
  wands: {
    korean: '완드',
    marker: '火',
    theme: '의욕과 행동',
    focus: '움직임과 표현의 속도',
    sajuElement: '화기처럼 밖으로 뻗는 추진력',
  },
};

const VALUE_THEMES: Record<
  string,
  {
    korean: string;
    focus: string;
    action: string;
  }
> = {
  ace: {
    korean: '에이스',
    focus: '처음 솟는 가능성',
    action: '아직 작아도 시작 신호를 놓치지 마세요.',
  },
  two: {
    korean: '2',
    focus: '균형과 선택',
    action: '둘 중 무엇이 마음을 덜 소모시키는지 살펴보세요.',
  },
  three: {
    korean: '3',
    focus: '성장과 협력',
    action: '혼자 품기보다 함께 나눌 사람을 떠올려보세요.',
  },
  four: {
    korean: '4',
    focus: '기반과 안정',
    action: '오늘은 새 시도보다 기본을 단단히 다져보세요.',
  },
  five: {
    korean: '5',
    focus: '갈등과 조정',
    action: '불편함을 피하기보다 어디서 어긋났는지 부드럽게 확인해보세요.',
  },
  six: {
    korean: '6',
    focus: '회복과 주고받음',
    action: '받은 것과 줄 수 있는 것을 균형 있게 맞춰보세요.',
  },
  seven: {
    korean: '7',
    focus: '점검과 인내',
    action: '결과를 재촉하기보다 지금 쌓이는 과정을 확인해보세요.',
  },
  eight: {
    korean: '8',
    focus: '반복과 숙련',
    action: '잘 되는 방식을 한 번 더 반복해 흐름을 굳혀보세요.',
  },
  nine: {
    korean: '9',
    focus: '성숙과 결실',
    action: '이미 얻은 것을 인정하고 다음 욕심은 천천히 보세요.',
  },
  ten: {
    korean: '10',
    focus: '완성과 다음 단계',
    action: '마무리할 일과 이어갈 일을 나누어 정리해보세요.',
  },
  page: {
    korean: '페이지',
    focus: '소식과 배움',
    action: '새로 들어온 말이나 신호를 가볍게 흘리지 마세요.',
  },
  knight: {
    korean: '기사',
    focus: '움직임과 추진',
    action: '마음이 움직이는 방향을 작게라도 행동으로 옮겨보세요.',
  },
  queen: {
    korean: '여왕',
    focus: '수용과 보살핌',
    action: '상황을 품되 내 마음까지 소진하지 않게 경계를 세워보세요.',
  },
  king: {
    korean: '왕',
    focus: '주도권과 책임',
    action: '오늘은 피하지 말고 필요한 결정을 차분히 맡아보세요.',
  },
};

const TONE_FOCUS: Record<TarotQuestionTone, (theme: string, focus: string) => string> = {
  daily: (theme, focus) => `오늘 하루에는 ${theme}의 흐름이 올라옵니다. 특히 ${focus}을 차분히 살피면 하루의 결이 부드러워집니다.`,
  relationship: (theme, focus) => `관계에서는 ${theme}이 중요한 장면으로 보입니다. 상대의 말보다 ${focus}을 먼저 읽으면 마음의 거리를 더 정확히 잡을 수 있습니다.`,
  choice: (theme, focus) => `선택 앞에서는 ${theme}이 기준이 됩니다. 지금은 ${focus}을 기준으로 두면 흔들림이 줄어듭니다.`,
  direction: (theme, focus) => `앞으로의 방향은 ${theme}에서 실마리가 보입니다. 멀리 보려 하기보다 ${focus}부터 정리해보세요.`,
};

export async function getTarotDeck(): Promise<{ cards: TarotApiCard[]; source: TarotDeckSource }> {
  try {
    const signal =
      typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
        ? AbortSignal.timeout(TAROT_API_TIMEOUT_MS)
        : undefined;

    const response = await fetch(TAROT_API_CARDS_URL, {
      headers: { Accept: 'application/json' },
      ...(signal ? { signal } : {}),
      next: { revalidate: REVALIDATE_SECONDS },
    } as RequestInit & { next: { revalidate: number } });

    if (response.ok) {
      const payload = (await response.json()) as { cards?: unknown };
      const cards = normalizeCards(payload.cards);

      if (cards.length === 78) {
        return { cards, source: 'api' };
      }
    }
  } catch {
    // The local deck below keeps daily readings available when the public API is unavailable.
  }

  return { cards: FALLBACK_CARDS, source: 'local' };
}

export async function getTodayTarotPreview() {
  const deck = await getTarotDeck();
  const seed = `${getKoreaDateKey()}:daily-preview`;
  const card = pickCard(deck.cards, seed);
  const orientation = pickOrientation(`${seed}:${card.name_short}`);

  return buildTarotReading({
    card,
    orientation,
    question: '오늘 하루 어떤 메시지가 있을까',
    source: deck.source,
  });
}

export async function getTarotReadingForQuestion({
  question,
  cardId,
  orientation,
}: {
  question?: string;
  cardId?: string;
  orientation?: string;
}) {
  const deck = await getTarotDeck();
  const normalizedQuestion = normalizeQuestion(question);
  const seed = buildQuestionSeed(normalizedQuestion);
  const fallbackCard = pickCard(deck.cards, seed);
  const card = deck.cards.find((item) => item.name_short === cardId) ?? fallbackCard;
  const normalizedOrientation = normalizeOrientation(orientation);

  return buildTarotReading({
    card,
    orientation: normalizedOrientation ?? pickOrientation(`${seed}:${card.name_short}`),
    question: normalizedQuestion,
    source: deck.source,
  });
}

export async function getTarotSpreadForQuestion(question?: string): Promise<TarotSpreadCard[]> {
  const deck = await getTarotDeck();
  const normalizedQuestion = normalizeQuestion(question);
  const seed = buildQuestionSeed(normalizedQuestion);
  const usedCards = new Set<string>();
  const positions = ['현재 흐름', '숨은 원인', '오늘의 조언'];

  return positions.map((position, index) => {
    const card = pickCard(deck.cards, `${seed}:spread:${index}`, usedCards);
    usedCards.add(card.name_short);

    return {
      position,
      reading: buildTarotReading({
        card,
        orientation: pickOrientation(`${seed}:spread:${index}:${card.name_short}`),
        question: normalizedQuestion,
        source: deck.source,
      }),
    };
  });
}

export function normalizeQuestion(question?: string) {
  return question?.trim() || '오늘 하루 어떤 메시지가 있을까';
}

function buildTarotReading({
  card,
  orientation,
  question,
  source,
}: {
  card: TarotApiCard;
  orientation: TarotOrientation;
  question: string;
  source: TarotDeckSource;
}): TarotReading {
  const tone = detectQuestionTone(question);
  const theme = getCardTheme(card);
  const meaning = orientation === 'upright' ? card.meaning_up : card.meaning_rev;
  const orientationAdvice =
    orientation === 'upright'
      ? '이 힘은 비교적 바깥으로 드러나 있으니 작은 행동으로 흐름을 살릴 수 있습니다.'
      : '다만 지금은 이 힘이 안쪽으로 접혀 있으니 서두르기보다 조절과 확인이 먼저입니다.';

  return {
    card,
    displayName: getDisplayName(card),
    shortName: card.name_short.toUpperCase(),
    arcanaLabel: getArcanaLabel(card),
    cardMarker: getCardMarker(card),
    orientation,
    orientationLabel: ORIENTATION_LABELS[orientation],
    tone,
    toneLabel: TONE_LABELS[tone],
    theme: theme.theme,
    subtitle: `${ORIENTATION_LABELS[orientation]} · ${theme.focus}`,
    keyword: getKeyword(card, theme),
    guidance: `${getDisplayName(card)}은 ${theme.theme}을 말합니다. ${TONE_FOCUS[tone](theme.theme, theme.focus)} ${orientationAdvice}`,
    sajuBlend: `사주 흐름과 겹쳐 보면, 이 카드는 ${theme.sajuElement}을 통해 지금 질문의 반복되는 이유를 살피게 합니다. 타로가 오늘의 장면을 보여준다면 사주는 그 장면이 왜 익숙하게 느껴지는지를 설명해줍니다.`,
    action: theme.action,
    source,
    meaningExcerpt: compactMeaning(meaning),
  };
}

function getCardTheme(card: TarotApiCard) {
  if (card.type === 'major') {
    return (
      MAJOR_THEMES[card.name] ?? {
        theme: '큰 흐름과 전환',
        focus: '지금 삶의 큰 장면',
        action: '오늘 마음에 가장 크게 남는 신호를 하나만 붙들어보세요.',
        sajuElement: '큰 운의 방향을 읽는 감각',
      }
    );
  }

  const suitTheme = card.suit ? SUIT_THEMES[card.suit] : SUIT_THEMES.cups;
  const valueTheme = VALUE_THEMES[card.value] ?? {
    korean: card.value,
    focus: '지금 필요한 균형',
    action: '오늘 눈에 들어오는 작은 신호를 놓치지 말고 정리해보세요.',
  };

  return {
    theme: `${valueTheme.focus}, 그리고 ${suitTheme.theme}`,
    focus: `${suitTheme.focus} 안에서 ${valueTheme.focus}`,
    action: valueTheme.action,
    sajuElement: suitTheme.sajuElement,
  };
}

function getDisplayName(card: TarotApiCard) {
  if (card.type === 'major') {
    const korean = MAJOR_CARD_NAMES[card.name];
    return korean ? `${korean} · ${card.name}` : card.name;
  }

  const suit = card.suit ? SUIT_THEMES[card.suit] : SUIT_THEMES.cups;
  const value = VALUE_THEMES[card.value]?.korean ?? card.value;

  return `${value} ${suit.korean} · ${card.name}`;
}

function getKeyword(card: TarotApiCard, theme: { theme: string; focus: string }) {
  const base = card.type === 'major' ? theme.theme : theme.focus;
  return `${base}을 오늘의 언어로 부드럽게 읽어보세요.`;
}

function getCardMarker(card: TarotApiCard) {
  if (card.type === 'major') {
    return '大';
  }

  return card.suit ? SUIT_THEMES[card.suit].marker : '月';
}

function getArcanaLabel(card: TarotApiCard) {
  if (card.type === 'major') {
    return 'Major Arcana';
  }

  return `${card.suit ? SUIT_THEMES[card.suit].korean : 'Minor'} Arcana`;
}

function detectQuestionTone(question: string): TarotQuestionTone {
  if (/(관계|연애|사랑|상대|마음|재회|인연)/.test(question)) {
    return 'relationship';
  }

  if (/(선택|결정|해야|말아|괜찮|갈까|할까)/.test(question)) {
    return 'choice';
  }

  if (/(앞으로|방향|미래|진로|흐름|계획)/.test(question)) {
    return 'direction';
  }

  return 'daily';
}

function pickCard(cards: TarotApiCard[], seed: string, excluded = new Set<string>()) {
  const availableCards = cards.filter((card) => !excluded.has(card.name_short));
  const pool = availableCards.length > 0 ? availableCards : cards;
  return pool[stableHash(seed) % pool.length];
}

function pickOrientation(seed: string): TarotOrientation {
  return stableHash(seed) % 100 < 22 ? 'reversed' : 'upright';
}

function normalizeOrientation(value?: string): TarotOrientation | null {
  return value === 'upright' || value === 'reversed' ? value : null;
}

function buildQuestionSeed(question: string) {
  return `${getKoreaDateKey()}:${question}`;
}

function getKoreaDateKey(date = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function stableHash(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function compactMeaning(meaning: string) {
  const normalized = meaning.replace(/\s+/g, ' ').trim();

  if (normalized.length <= 180) {
    return normalized;
  }

  return `${normalized.slice(0, 177).trim()}...`;
}

function normalizeCards(value: unknown): TarotApiCard[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((card) => {
    const normalized = normalizeCard(card);
    return normalized ? [normalized] : [];
  });
}

function normalizeCard(value: unknown): TarotApiCard | null {
  if (!isRecord(value)) {
    return null;
  }

  const type = value.type === 'major' || value.type === 'minor' ? value.type : null;
  const nameShort = typeof value.name_short === 'string' ? value.name_short : null;
  const name = typeof value.name === 'string' ? value.name : null;
  const meaningUp = typeof value.meaning_up === 'string' ? value.meaning_up : null;
  const meaningRev = typeof value.meaning_rev === 'string' ? value.meaning_rev : null;
  const desc = typeof value.desc === 'string' ? value.desc : '';

  if (!type || !nameShort || !name || !meaningUp || !meaningRev) {
    return null;
  }

  const valueText = typeof value.value === 'string' ? value.value : String(value.value ?? '');
  const valueInt =
    typeof value.value_int === 'number' ? value.value_int : Number.parseInt(valueText, 10) || 0;
  const suit = typeof value.suit === 'string' && isTarotSuit(value.suit) ? value.suit : undefined;

  return {
    type,
    name_short: nameShort,
    name,
    value: valueText,
    value_int: valueInt,
    meaning_up: meaningUp,
    meaning_rev: meaningRev,
    desc,
    ...(suit ? { suit } : {}),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isTarotSuit(value: string): value is TarotSuit {
  return (SUITS as readonly string[]).includes(value);
}
