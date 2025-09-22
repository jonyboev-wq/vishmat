import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { fetchTopics } from '../services/api';
import { TopicDetail } from '../types';
import { coursePlan } from '../data/coursePlan';

export default function TopicsPage() {
  const [topics, setTopics] = useState<TopicDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchTopics()
      .then((data) => {
        if (mounted) {
          setTopics(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (mounted) {
          setError('Не удалось загрузить темы');
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const topicsById = useMemo(() => {
    return topics.reduce<Record<string, TopicDetail>>((acc, topic) => {
      acc[topic.id] = topic;
      return acc;
    }, {});
  }, [topics]);

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <h2 className="text-2xl font-bold">10-дневная программа на 30 уравнений</h2>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          Следуй плану: каждый день — чёткая цель, три уравнения и выход на экзаменационный уровень. Переключайся между
          заданиями в практике, чтобы закрепить материал темы дня.
        </p>
        {loading && <div className="animate-pulse text-slate-500">Загружаем темы...</div>}
        {error && <div className="text-slate-600">{error}</div>}
      </header>
      <div className="grid gap-6 lg:grid-cols-2">
        {coursePlan.map((day) => {
          const practiceTopics = day.topicIds.map((topicId) => topicsById[topicId]).filter(Boolean);
          return (
            <article
              key={day.day}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-semibold">День {day.day}. {day.title}</h3>
                <p className="text-xs uppercase tracking-wide text-slate-400">3 уравнения в фокусе</p>
              </div>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{day.description}</p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
                {day.equations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {practiceTopics.length > 0 && (
                <div className="mt-4 space-y-2 text-sm text-slate-500 dark:text-slate-300">
                  <span className="block font-medium text-slate-700 dark:text-slate-200">Темы дня:</span>
                  <ul className="list-disc pl-5">
                    {practiceTopics.map((topic) => (
                      <li key={topic.id}>{topic.title}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-5 flex flex-wrap gap-3">
                {day.topicIds.map((topicId) => {
                  const topic = topicsById[topicId];
                  const label = topic ? `Тренировка: ${topic.title}` : 'Перейти к практике';
                  return (
                    <Link
                      key={topicId}
                      to={`/practice?topic=${topicId}`}
                      className="rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
      <section className="space-y-3">
        <h3 className="text-xl font-semibold">Справочник тем</h3>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          Заглядывай сюда, когда нужна шпаргалка: краткая теория, цели и примеры помогут освежить знания перед практикой.
        </p>
        <div className="grid gap-6 lg:grid-cols-2">
          {topics.map((topic) => (
            <article
              key={topic.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <h4 className="text-lg font-semibold">{topic.title}</h4>
              <p className="mt-2 text-slate-600 dark:text-slate-300">{topic.summary}</p>
              <div className="mt-3 space-y-2 text-slate-600 dark:text-slate-300">
                <div>
                  <span className="font-medium text-slate-700 dark:text-slate-200">Цели:</span>
                  <ul className="mt-1 list-disc pl-5">
                    {topic.objectives.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-medium text-slate-700 dark:text-slate-200">Мини-теория:</span>
                  <ul className="mt-1 list-disc pl-5">
                    {topic.theory_points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-medium text-slate-700 dark:text-slate-200">Примеры:</span>
                  <ul className="mt-1 list-disc pl-5">
                    {topic.examples.map((example) => (
                      <li key={example}>{example}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                <div>Маршрут: {topic.recommended_path.join(' → ')}</div>
                <div>Экзамен: {topic.exam_reference}</div>
              </footer>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
