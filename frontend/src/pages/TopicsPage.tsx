import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { fetchTopics } from '../services/api';
import { TopicDetail } from '../types';

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

  if (loading) {
    return <div className="animate-pulse text-slate-500">Загружаем темы...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold">Темы курса</h2>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          Каждая тема включает шпаргалку, примеры и набор практических заданий. Можно начать с любой, но мы предлагаем путь от
          простых линейных ОДУ к системам и численным методам.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-2">
        {topics.map((topic) => (
          <article key={topic.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">{topic.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{topic.summary}</p>
              </div>
              <Link
                to={`/practice?topic=${topic.id}`}
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow hover:-translate-y-0.5"
              >
                Тренироваться
              </Link>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Цели:</span>
                <ul className="mt-1 list-disc pl-5">
                  {topic.objectives.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Мини-теория:</span>
                <ul className="mt-1 list-disc pl-5">
                  {topic.theory_points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">Примеры:</span>
                <ul className="mt-1 list-disc pl-5">
                  {topic.examples.map((example) => (
                    <li key={example}>{example}</li>
                  ))}
                </ul>
              </div>
            </div>
            <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div>
                Рекомендуемый маршрут: {topic.recommended_path.join(' → ')}
              </div>
              <div>Экзамен: {topic.exam_reference}</div>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}
