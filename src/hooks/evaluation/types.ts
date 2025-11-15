// Canonical evaluation target types (5 types only)
export type EvaluationTargetType =
  | 'project'          // public showcase projects
  | 'media'            // media items
  | 'funding_campaign' // funding entities
  | 'person'           // endorsements
  | 'proposal';        // governance / statements / funding ideas

export type EvaluationContextScope = 'global' | 'event' | 'series';

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
