import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { CheckResponse, ProgressEntry, ProgressPayload } from '../types';
import { fetchProgress, loadStoredProgress, saveProgressState } from '../services/api';

interface ProgressContextValue {
  userId: number;
  xp: number;
  streak: number;
  dailyGoalMinutes: number;
  progress: ProgressEntry[];
  refresh: () => Promise<void>;
  optimisticUpdate: (payload: CheckResponse, topicId: string) => void;
}

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

const INITIAL_STATE: ProgressPayload = loadStoredProgress();

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ProgressPayload>(INITIAL_STATE);

  const load = useCallback(async () => {
    try {
      const payload = await fetchProgress(state.user_id);
      setState(payload);
    } catch (error) {
      console.error('Не удалось загрузить прогресс', error);
    }
  }, [state.user_id]);

  useEffect(() => {
    void load();
  }, [load]);

  const optimisticUpdate = useCallback(
    (payload: CheckResponse, topicId: string) => {
      setState((prev) => {
        const xp = prev.xp + payload.xp_awarded;
        const nowIso = new Date().toISOString();
        const today = new Date().toDateString();
        const lastActiveDate = prev.last_active ? new Date(prev.last_active).toDateString() : today;
        let streak = prev.streak;
        if (payload.correct) {
          streak = lastActiveDate === today ? prev.streak + 1 : 1;
        } else if (lastActiveDate !== today) {
          streak = 0;
        }
        const progress = [...prev.progress];
        const existing = progress.find((entry) => entry.topic_id === topicId);
        if (existing) {
          existing.mastery = Math.min(1, existing.mastery + payload.mastery_delta);
          existing.completed_lessons += 1;
          existing.xp_earned += payload.xp_awarded;
          existing.best_score = Math.max(existing.best_score, payload.mastery_delta * 20);
        } else {
          progress.push({
            topic_id: topicId,
            mastery: Math.min(1, payload.mastery_delta),
            completed_lessons: 1,
            best_score: payload.mastery_delta * 20,
            xp_earned: payload.xp_awarded,
          });
        }
        const next = {
          ...prev,
          xp,
          streak,
          last_active: nowIso,
          progress,
        };
        saveProgressState(next);
        return next;
      });
    },
    []
  );

  const value = useMemo(
    () => ({
      userId: state.user_id,
      xp: state.xp,
      streak: state.streak,
      dailyGoalMinutes: state.daily_goal_minutes,
      progress: state.progress,
      refresh: load,
      optimisticUpdate,
    }),
    [state, load, optimisticUpdate]
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
};

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error('useProgress must be used inside ProgressProvider');
  }
  return ctx;
}
