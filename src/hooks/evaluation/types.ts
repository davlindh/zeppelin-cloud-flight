export type EvaluationTargetType =
  | 'collaboration_project'
  | 'media'
  | 'funding_campaign';

export interface EvaluationDimensionConfig {
  key: string;
  label: string;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface EvaluationTemplate {
  id: string;
  key: string;
  label: string;
  description: string | null;
  dimensions: EvaluationDimensionConfig[];
}

export interface EvaluationSummaryData {
  count: number;
  avg_eckt: number;
  weighted_eckt: number;
  avg_rating: number;
}
