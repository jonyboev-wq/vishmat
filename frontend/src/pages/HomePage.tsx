import { Link } from 'react-router-dom';

const highlights = [
  '10-дневный план: по 3 уравнения в день — всего 30 решений',
  'Подсказки в три уровня сложности',
  'Геймификация: streak, XP и достижения',
  'Режим экзамена — без подсказок, с таймером',
];

export default function HomePage() {
  return (
    <section className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-r from-black/10 via-accent/10 to-black/10 p-8 shadow">
        <h2 className="text-3xl font-bold">Сделай диффуры понятными за 10 дней</h2>
        <p className="mt-3 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          VishMat Trainer ведёт тебя по интенсивной программе: каждый день — новая связка приёмов и три свежих уравнения.
          За 10 дней ты решишь все 30 задач и выйдешь на уровень экзамена.
        </p>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row">
          <Link
            to="/practice"
            className="rounded-full bg-primary px-6 py-3 text-center font-semibold text-white shadow-lg shadow-black/30 transition hover:-translate-y-0.5"
          >
            Начать тренировку
          </Link>
          <Link
            to="/topics"
            className="rounded-full border border-primary px-6 py-3 text-center font-semibold text-primary transition hover:bg-primary/10"
          >
            Посмотреть темы
          </Link>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {highlights.map((text) => (
          <div key={text} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{text}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h3 className="text-xl font-semibold">Как устроена 10-дневная программа?</h3>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
            <li>Мини-теория и шпаргалка по теме дня.</li>
            <li>Три целевых уравнения на отработку навыка.</li>
            <li>Отмечаем прогресс, streak и XP.</li>
            <li>Экзаменационный микс без подсказок в финальный день.</li>
          </ol>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h3 className="text-xl font-semibold">Для кого этот прототип?</h3>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Студенты 1–2 курса, которые хотят закрыть пробелы перед экзаменом. Прототип легко расширяется — достаточно
            добавить шаблон задачи в JSON, и система сгенерирует варианты с параметрами.
          </p>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            В версии MVP доступен гостевой вход: прогресс хранится в базе и синхронизируется с устройства.
          </p>
        </article>
      </div>
    </section>
  );
}
