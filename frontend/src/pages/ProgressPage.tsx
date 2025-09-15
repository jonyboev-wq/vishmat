import { useMemo } from 'react';

import { useProgress } from '../context/ProgressContext';

export default function ProgressPage() {
  const { xp, streak, dailyGoalMinutes, progress } = useProgress();

  const achievements = useMemo(() => {
    const badges: string[] = [];
    if (streak >= 3) badges.push('Серия 3+ дней');
    if (xp >= 200) badges.push('200 XP: уверенный старт');
    if (progress.some((item) => item.mastery >= 0.8)) badges.push('Мастер темы');
    return badges;
  }, [xp, streak, progress]);

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Прогресс и достижения</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300">Планируй занятия и отслеживай своё продвижение к экзамену.</p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="rounded bg-primary/10 px-4 py-2 text-primary">XP: {xp}</div>
          <div className="rounded bg-accent/10 px-4 py-2 text-accent">🔥 Streak: {streak}</div>
          <div className="rounded bg-slate-200 px-4 py-2 text-slate-700 dark:bg-slate-700 dark:text-slate-100">
            Цель: {dailyGoalMinutes} мин/день
          </div>
        </div>
      </header>
      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h3 className="text-lg font-semibold">Освоение тем</h3>
          <div className="mt-4 space-y-4">
            {progress.length === 0 && <p className="text-sm text-slate-500">Пока нет завершённых заданий. Попробуй режим практики!</p>}
            {progress.map((entry) => (
              <div key={entry.topic_id} className="space-y-2">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>{entry.topic_id}</span>
                  <span>{Math.round(entry.mastery * 100)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.min(100, Math.round(entry.mastery * 100))}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {entry.completed_lessons} заданий • Лучшая серия: {Math.round(entry.best_score)} • XP: {entry.xp_earned}
                </div>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h3 className="text-lg font-semibold">Бейджи и мотивация</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {achievements.length === 0 && <li>Собери streak хотя бы 3 дня подряд, чтобы получить первый бейдж!</li>}
            {achievements.map((item) => (
              <li key={item} className="rounded border border-primary/30 bg-primary/5 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-6 text-xs text-slate-500 dark:text-slate-400">
            Совет: выполняй минимум {dailyGoalMinutes} минут практики в день. Старайся закрывать все темы на mastery ≥ 80%, чтобы
            быть готовым к сложному билету.
          </div>
        </article>
      </div>
    </section>
  );
}
