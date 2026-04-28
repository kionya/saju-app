export const SAMPLE_REPORT_HERO = {
  eyebrow: '샘플 리포트',
  title: '결제 전에, 달빛선생 리포트의 구조를 먼저 확인하세요',
  description:
    '아래 샘플은 가상 인물을 기준으로 구성한 예시입니다. 실제 리포트는 입력하신 출생 정보와 엔진 판정 기준에 따라 달라집니다.',
} as const;

export const SAMPLE_SUBJECT = {
  name: '윤서',
  label: '가상 인물',
  birth: '1991년 10월 18일 19:20',
  place: '서울',
  note: '실제 사용자 정보가 아닌 샘플 리포트용 예시입니다.',
} as const;

export const SAMPLE_SUMMARY = {
  oneLine: '정교한 기준을 세워 움직일수록 강점이 길게 남는 사주입니다.',
  strongTopics: [
    '일의 우선순위를 다시 세울 때 성과가 커집니다.',
    '관계에서는 말의 결보다 기준 정리가 먼저 힘을 냅니다.',
    '올해는 무리한 확장보다 구조를 다듬는 편이 유리합니다.',
  ],
  cautionPatterns: [
    '즉흥적인 결론이나 급한 결정은 흐름을 흔들 수 있습니다.',
    '다른 사람의 속도에 맞추느라 본래 기준을 놓치기 쉽습니다.',
    '잘할수록 과하게 책임을 끌어안는 패턴을 조심해야 합니다.',
  ],
  favorableChoice:
    '크게 벌이기보다 기준을 먼저 적고, 그 기준에 맞는 선택지만 남기는 방식이 가장 잘 맞습니다.',
} as const;

export const SAMPLE_TOC = [
  '한 줄 총평',
  '명식 원국',
  '일간과 기질',
  '격국 후보',
  '최종 격국',
  '용신·희신·기신',
  '재물 구조',
  '직업·사업 구조',
  '관계 구조',
  '건강·생활 리듬',
  '대운 흐름',
  '올해 세운',
  '실행 전략',
  '판정 로그',
] as const;

export const SAMPLE_DECISION_TRACE: DecisionTraceItem[] = [
  {
    step: '01',
    title: '월령 기준',
    input: '양력 1991-10-18 19:20 · 서울',
    rule: '양력/음력 변환과 절기 기준 확인',
    result:
      '월령이 전체 분위기를 강하게 잡고 있어 계절성 판단을 먼저 두고 읽습니다. 이 샘플에서는 계절성과 월령의 방향이 강약 해석의 첫 기준이 됩니다.',
    confidence: 'orthodox',
  },
  {
    step: '02',
    title: '일간 강약',
    rule: '월령과 오행 분포를 함께 보며 일간 강약 확인',
    result:
      '일간은 스스로 밀어붙이기보다 외부 구조를 활용할 때 힘을 더 안정적으로 씁니다. 강약은 단순 점수표로 끝나지 않고, 실제 생활에서 에너지를 쓰는 방식까지 연결해 설명합니다.',
    confidence: 'orthodox',
  },
  {
    step: '03',
    title: '격국 후보',
    rule: '월령, 투출, 강약 순서로 격국 후보 검토',
    result:
      '한 가지 격만 단정하지 않고, 우선 후보와 보조 후보를 함께 검토합니다. 달빛선생은 격국 후보를 먼저 보여드리고, 왜 한 판정을 우선했는지 이어서 설명하는 흐름을 유지합니다.',
    confidence: 'orthodox',
  },
  {
    step: '04',
    title: '최종 판정',
    rule: '격국 후보 중 투출과 생조 관계를 함께 비교',
    result:
      '투출과 생조 관계를 함께 보아 한 가지 해석을 우선 기준으로 세웁니다. 최종 격국은 보기 좋게만 요약하지 않고, 왜 다른 후보보다 이쪽이 앞서는지 근거를 남깁니다.',
    confidence: 'orthodox',
  },
  {
    step: '05',
    title: '용신 판단',
    rule: '격국·강약·계절성을 묶어 용신/희신/기신 판정',
    result:
      '용신은 부족한 오행을 기계적으로 채우기보다, 격국 유지와 계절 균형을 함께 보며 판단합니다. 실제 결과 화면에서는 용신·희신·기신을 나누고, 어떤 상황에서 도움이 되는지까지 생활 언어로 이어집니다.',
    confidence: 'orthodox',
  },
  {
    step: '06',
    title: '참고 / 논쟁 해석',
    rule: '논쟁적 해석은 참고 단계로 낮춰 분리 표시',
    result:
      '학파 차이가 있는 구간은 참고 해석으로 낮추고, 중심 판정과 분리해서 보여드립니다. 공망이나 특수한 해석 항목은 중심 결론을 흔들지 않도록 별도 층으로 정리합니다.',
    confidence: 'reference',
  },
] as const;

export const SAMPLE_REPORT_METADATA: ReportMetadata = {
  engineVersion: 'saju-engine/v1',
  ruleSetVersion: 'rule-set/2026-04',
  promptVersion: 'sample-report/v1',
  generatedAt: '2026-04-29T00:00:00.000Z',
  birthInputSnapshot: {
    year: 1991,
    month: 10,
    day: 18,
    hour: 19,
    minute: 20,
    place: '서울',
  },
  decisionTrace: SAMPLE_DECISION_TRACE,
};

export const SAMPLE_KEEP_VALUES = [
  {
    title: 'PDF 소장',
    body: '표지, 목차, 요약, 본문, 판정 근거를 한 편의 리포트로 오래 남길 수 있도록 준비합니다.',
  },
  {
    title: 'MY 보관함',
    body: '다시 보고 싶은 해석을 저장하고, 이후 월운과 궁합·가족 리포트로 이어볼 수 있습니다.',
  },
  {
    title: '대화 연결',
    body: '리포트 기준 위에서 달빛선생에게 이어서 질문하는 구조를 전제로 설계합니다.',
  },
  {
    title: '업데이트',
    body: '연간·월간 흐름은 같은 명리 기준 위에서 다시 정리되도록 이어집니다.',
  },
] as const;
import type { DecisionTraceItem, ReportMetadata } from '@/lib/saju/report-contract';
