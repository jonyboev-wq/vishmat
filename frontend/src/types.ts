export type TaskType = 'method-choice' | 'solve-ode' | 'match' | 'numeric' | 'theory';

export interface Hint {
  level: number;
  text: string;
}

export type MethodChoiceValidation = {
  type: 'method-choice';
  expected: string;
};

export type TheoryValidation = {
  type: 'theory';
  expected: boolean;
};

export type MatchValidation = {
  type: 'match';
  expected: number[];
};

export type NumericValidation = {
  type: 'numeric';
  expected: number;
  tolerance?: number;
};

export interface OdeValidationTerm {
  derivative: number;
  coefficient: string;
}

export type OdeValidation = {
  type: 'ode';
  variable?: string;
  terms: OdeValidationTerm[];
  rhs: string;
};

export type TaskValidation =
  | MethodChoiceValidation
  | TheoryValidation
  | MatchValidation
  | NumericValidation
  | OdeValidation;

export interface TaskPayload {
  id: string;
  topic_id: string;
  title: string;
  type: TaskType;
  prompt: string;
  difficulty: number;
  hints: Hint[];
  options?: string[];
  pairs?: { left: string; right: string }[];
  validation?: TaskValidation | null;
}

export interface TopicDetail {
  id: string;
  title: string;
  summary: string;
  objectives: string[];
  recommended_path: string[];
  theory_points: string[];
  examples: string[];
  practice_outline: string[];
  exam_reference: string;
}

export interface CheckResponse {
  correct: boolean;
  feedback: string;
  xp_awarded: number;
  mastery_delta: number;
}

export interface ProgressEntry {
  topic_id: string;
  mastery: number;
  completed_lessons: number;
  best_score: number;
  xp_earned: number;
}

export interface ProgressPayload {
  user_id: number;
  xp: number;
  streak: number;
  last_active: string;
  daily_goal_minutes: number;
  progress: ProgressEntry[];
}
