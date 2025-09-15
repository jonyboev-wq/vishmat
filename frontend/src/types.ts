export type TaskType = 'method-choice' | 'solve-ode' | 'match' | 'numeric' | 'theory';

export interface Hint {
  level: number;
  text: string;
}

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
  validation?: Record<string, unknown> | null;
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
