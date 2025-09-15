import { CheckResponse, ProgressPayload, TaskPayload, TopicDetail } from '../types';

type HttpMethod = 'GET' | 'POST';

const API_URL = import.meta.env.VITE_API_URL ?? '';

async function request<T>(path: string, method: HttpMethod = 'GET', body?: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Ошибка запроса');
  }
  return (await response.json()) as T;
}

export function fetchTopics(): Promise<TopicDetail[]> {
  return request<TopicDetail[]>('/api/topics');
}

export function generateTask(topicId: string, targetDifficulty: number, examMode: boolean): Promise<TaskPayload> {
  return request<TaskPayload>('/api/practice/generate', 'POST', {
    topic_id: topicId,
    target_difficulty: targetDifficulty,
    exam_mode: examMode,
  });
}

export function checkTask(
  taskId: string,
  topicId: string,
  answer: unknown,
  userId = 1
): Promise<CheckResponse> {
  return request<CheckResponse>('/api/practice/check', 'POST', {
    task_id: taskId,
    topic_id: topicId,
    user_answer: answer,
    user_id: userId,
  });
}

export function fetchProgress(userId = 1): Promise<ProgressPayload> {
  return request<ProgressPayload>(`/api/progress/${userId}`);
}

export function updateSettings(userId: number, preferredLanguage: string): Promise<void> {
  return request('/api/user/settings', 'POST', {
    user_id: userId,
    preferred_language: preferredLanguage,
  });
}

export function updateDailyGoal(userId: number, minutes: number): Promise<void> {
  return request('/api/user/daily-goal', 'POST', {
    user_id: userId,
    minutes,
  });
}
