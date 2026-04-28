export type DecisionTraceConfidence = 'orthodox' | 'disputed' | 'reference' | 'input_limited';

export type DecisionTraceItem = {
  step: string;
  title: string;
  input?: string;
  rule?: string;
  result: string;
  confidence: DecisionTraceConfidence;
  note?: string;
};

export type ReportMetadata = {
  engineVersion?: string;
  ruleSetVersion?: string;
  tzdataVersion?: string;
  promptVersion?: string;
  llmModel?: string;
  birthInputSnapshot?: unknown;
  decisionTrace?: DecisionTraceItem[];
  generatedAt?: string;
};
