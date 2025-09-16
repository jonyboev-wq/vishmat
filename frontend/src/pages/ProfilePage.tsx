import { FormEvent, useEffect, useState } from 'react';

import { useProgress } from '../context/ProgressContext';
import { fetchSettings, updateDailyGoal, updateSettings } from '../services/api';

const languages = [
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' },
];

export default function ProfilePage() {
  const { userId, dailyGoalMinutes, refresh } = useProgress();
  const [language, setLanguage] = useState('ru');
  const [goal, setGoal] = useState(dailyGoalMinutes);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings()
      .then((settings) => setLanguage(settings.preferredLanguage))
      .catch((error) => {
        console.error('Не удалось загрузить настройки', error);
      });
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await updateSettings(userId, language);
      await updateDailyGoal(userId, goal);
      await refresh();
      setMessage('Настройки сохранены');
    } catch (error) {
      console.error(error);
      setMessage('Не удалось сохранить настройки');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-2xl font-bold">Профиль</h2>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          Гостевой аккаунт активирован. Подключи почту позже, чтобы переносить прогресс между устройствами.
        </p>
      </header>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <div className="space-y-1">
          <label className="text-xs uppercase text-slate-500">Язык интерфейса</label>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="w-full rounded border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-900"
          >
            {languages.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs uppercase text-slate-500">Ежедневная цель (мин)</label>
          <input
            type="number"
            min={5}
            max={120}
            value={goal}
            onChange={(event) => setGoal(Number(event.target.value))}
            className="w-full rounded border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-900"
          />
        </div>
        <div className="space-y-1 text-sm text-slate-500 dark:text-slate-300">
          <p>Достижения синхронизируются автоматически после каждого задания. Прогресс хранится локально и доступен без сервера.</p>
        </div>
        {message && (
          <div
            className={`rounded border px-3 py-2 text-sm ${
              message.includes('Не удалось')
                ? 'border-red-400 bg-red-50 text-red-600 dark:bg-red-900/40'
                : 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30'
            }`}
          >
            {message}
          </div>
        )}
        <button
          type="submit"
          className="rounded-full bg-primary px-5 py-2 font-semibold text-white hover:-translate-y-0.5 disabled:opacity-60"
          disabled={loading}
        >
          Сохранить изменения
        </button>
      </form>
    </section>
  );
}
