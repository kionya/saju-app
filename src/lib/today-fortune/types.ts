import type { FocusTopic } from '@/domain/saju/report';

export type ConcernId =
  | 'love_contact'
  | 'money_spend'
  | 'work_meeting'
  | 'relationship_conflict'
  | 'energy_health'
  | 'general';

export type TodayCalendarType = 'solar' | 'lunar';
export type TodayTimeRule = 'standard' | 'trueSolarTime' | 'nightZi' | 'earlyZi';

export interface TodayConcernDefinition {
  id: ConcernId;
  label: string;
  hanja: string;
  shortLabel: string;
  prompt: string;
  focusTopic: FocusTopic;
  staticUpsellCopy: string;
  followUpQuestions: string[];
}

export interface TodayScoreItem {
  key: 'overall' | 'love' | 'wealth' | 'career' | 'relationship' | 'condition';
  label: string;
  score: number;
  summary: string;
}

export interface TodayFortuneFreeResult {
  sourceSessionId: string;
  concernId: ConcernId;
  concernLabel: string;
  concernHanja: string;
  focusTopic: FocusTopic;
  birthMeta: {
    calendarType: TodayCalendarType;
    timeRule: TodayTimeRule;
    unknownBirthTime: boolean;
    usesLocation: boolean;
  };
  oneLine: {
    eyebrow: string;
    headline: string;
    body: string;
  };
  scores: TodayScoreItem[];
  opportunity: {
    title: string;
    body: string;
  };
  risk: {
    title: string;
    body: string;
  };
  reasonSnippet: {
    title: string;
    body: string;
  };
  nextAction: {
    copy: string;
    product: 'TODAY_DEEP_READING';
    coinCost: 1;
  };
  followUpQuestions: string[];
}

export interface TodayTimeWindow {
  range: string;
  mood: 'favorable' | 'caution';
  title: string;
  body: string;
}

export interface TodayScenarioComparison {
  title: string;
  better: string;
  watch: string;
}

export interface TodayFortunePremiumResult {
  productCode: 'TODAY_DEEP_READING';
  coinCost: 1;
  favorableWindows: TodayTimeWindow[];
  cautionWindows: TodayTimeWindow[];
  avoidActions: string[];
  recommendedActions: string[];
  scenarios: TodayScenarioComparison[];
  evidenceLines: string[];
  followUpQuestions: string[];
  safetyNote: string;
}

export interface TodayFortuneBirthPayload {
  concernId: ConcernId;
  calendarType: TodayCalendarType;
  timeRule: TodayTimeRule;
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  unknownBirthTime: boolean;
  gender: string;
  birthLocationCode: string;
  birthLocationLabel: string;
  birthLatitude: string;
  birthLongitude: string;
}
