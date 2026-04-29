import type { Element } from '@/lib/saju/types';
import type { ReportMetadata } from '@/lib/saju/report-contract';

export type FocusTopic = 'today' | 'love' | 'wealth' | 'career' | 'relationship';

export interface ReportScore {
  key: 'overall' | 'love' | 'wealth' | 'career' | 'relationship';
  label: string;
  score: number;
  summary: string;
}

export interface ReportAction {
  title: string;
  description: string;
}

export interface ReportInsight {
  title: string;
  eyebrow: string;
  body: string;
}

export interface ReportTimelineItem {
  label: string;
  headline: string;
  body: string;
  points?: string[];
}

export type ReportEvidenceKey =
  | 'strength'
  | 'pattern'
  | 'yongsin'
  | 'relations'
  | 'gongmang'
  | 'specialSals';

export type ReportEvidenceSource =
  | '계산값'
  | '운세 룰'
  | '자평진전'
  | '적천수'
  | '궁통보감'
  | '삼명통회'
  | '연해자평'
  | 'orrery-reference';

export type ReportEvidenceConfidence = '확정' | '보통' | '참고';

export interface ReportEvidenceComputed {
  dayMaster?: string;
  dayMasterElement?: Element;
  monthPillar?: string;
  fiveElementRatio?: Partial<Record<Element, number>>;
  strength?: string | null;
  strengthScore?: number | null;
  pattern?: string | null;
  tenGod?: string | null;
  yongsin?: string[];
  currentLuck?: string[];
  relations?: string[];
  gongmang?: string[];
  specialSals?: string[];
}

export interface ReportEvidenceExplainer {
  term: string;
  hanja?: string;
  meaning: string;
}

export interface ReportEvidenceCard {
  key: ReportEvidenceKey;
  label: string;
  title: string;
  body: string;
  details: string[];
  plainSummary?: string;
  technicalSummary?: string;
  practicalActions?: string[];
  explainers?: ReportEvidenceExplainer[];
  computed: ReportEvidenceComputed;
  source: ReportEvidenceSource[];
  confidence: ReportEvidenceConfidence;
  topicMapping: FocusTopic[];
}

export interface FocusTopicMeta {
  label: string;
  badge: string;
  subtitle: string;
}

export interface FocusTopicOption {
  key: FocusTopic;
  label: string;
}

export interface SajuReport {
  focusTopic: FocusTopic;
  focusLabel: string;
  focusBadge: string;
  focusScoreKey: ReportScore['key'];
  headline: string;
  dayMasterSummary: string;
  summary: string;
  summaryHighlights: string[];
  evidenceCards: ReportEvidenceCard[];
  scores: ReportScore[];
  primaryAction: ReportAction;
  cautionAction: ReportAction;
  insights: ReportInsight[];
  timeline: ReportTimelineItem[];
  luckyDates: string[];
  cautionDates: string[];
  supportElements: Element[];
  metadata?: ReportMetadata;
}
