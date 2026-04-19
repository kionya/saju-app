import type { Element } from '@/lib/saju/types';

export type FocusTopic = 'today' | 'love' | 'wealth' | 'career' | 'relationship';

export interface ReportScore {
  key: 'overall' | 'love' | 'wealth' | 'career';
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
}

export type ReportEvidenceKey =
  | 'strength'
  | 'pattern'
  | 'yongsin'
  | 'relations'
  | 'gongmang'
  | 'specialSals';

export interface ReportEvidenceCard {
  key: ReportEvidenceKey;
  label: string;
  title: string;
  body: string;
  details: string[];
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
  headline: string;
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
}
