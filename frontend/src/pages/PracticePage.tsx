import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { FormulaInput } from '../components/FormulaInput';
import { useCountdown } from '../hooks/useCountdown';
import { useProgress } from '../context/ProgressContext';
import { checkTask, fetchTopics, generateTask } from '../services/api';
import { Hint, TaskPayload, TopicDetail } from '../types';

const EXAM_DURATION = 180;

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function PracticePage() {
  const query = useQuery();
  const { optimisticUpdate } = useProgress();
  const [topics, setTopics] = useState<TopicDetail[]>([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [targetDifficulty, setTargetDifficulty] = useState(2);
  const [task, setTask] = useState<TaskPayload | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [examMode, setExamMode] = useState(false);
  const [result, setResult] = useState<{ message: string; correct: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expression, setExpression] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [truthValue, setTruthValue] = useState<boolean | null>(null);
  const [numericAnswer, setNumericAnswer] = useState('');
  const [matchAnswers, setMatchAnswers] = useState<string[]>([]);

  const timerActive = examMode && Boolean(task);
  const remaining = useCountdown(timerActive, EXAM_DURATION);
  const isTimerExpired = timerActive && remaining === 0;

  useEffect(() => {
    let mounted = true;
    fetchTopics()
      .then((data) => {
        if (!mounted) return;
        setTopics(data);
        const topicFromQuery = query.get('topic') ?? data[0]?.id ?? '';
        setSelectedTopic(topicFromQuery);
      })
      .catch((err) => {
        console.error(err);
        if (mounted) setError('Не удалось загрузить темы');
      });
    return () => {
      mounted = false;
    };
  }, [query]);

  useEffect(() => {
    if (selectedTopic && !task) {
      void handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTopic]);

  useEffect(() => {
    if (!task) return;
    if (examMode) {
      setHintLevel(0);
    } else if (hintLevel === 0) {
      setHintLevel(1);
    }
  }, [examMode, task, hintLevel]);
  useEffect(() => {
    if (isTimerExpired) {
      setResult({ message: 'Время вышло! Попробуйте снова или отключите режим экзамена.', correct: false });
    }
  }, [isTimerExpired]);

  const hintsToShow = useMemo(() => {
    if (!task) return [];
    return task.hints.filter((hint) => hint.level <= hintLevel);
  }, [task, hintLevel]);

  const resetLocalState = (nextTask: TaskPayload) => {
    setTask(nextTask);
    setHintLevel(examMode ? 0 : 1);
    setResult(null);
    setExpression('');
    setSelectedOption('');
    setTruthValue(null);
    setNumericAnswer('');
    setMatchAnswers(new Array(nextTask.pairs?.length ?? 0).fill(''));
  };

  const handleGenerate = async () => {
    if (!selectedTopic) return;
    setLoading(true);
    setError(null);
    try {
      const generated = await generateTask(selectedTopic, targetDifficulty, examMode);
      resetLocalState(generated);
    } catch (err) {
      console.error(err);
      setError('Не удалось получить задание');
    } finally {
      setLoading(false);
    }
  };

  const handleHint = () => {
    if (!task) return;
    const maxLevel = task.hints.length ? Math.max(...task.hints.map((hint) => hint.level)) : 0;
    if (maxLevel === 0) return;
    setHintLevel((prev) => Math.min(maxLevel, prev + 1));
  };

  const prepareAnswer = () => {
    if (!task) return null;
    switch (task.type) {
      case 'solve-ode':
        return expression.trim() ? expression.trim() : null;
      case 'method-choice':
        return selectedOption || null;
      case 'theory':
        return truthValue;
      case 'numeric':
        return numericAnswer.trim() ? Number(numericAnswer) : null;
      case 'match':
        if (!task.pairs) return null;
        return matchAnswers.map((answer) => task.pairs?.findIndex((pair) => pair.right === answer));
      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    if (!task || loading) return;
    const answer = prepareAnswer();
    if (answer === null || (Array.isArray(answer) && answer.some((index) => index < 0))) {
      setResult({ message: 'Введите ответ, прежде чем проверять.', correct: false });
      return;
    }

    setLoading(true);
    try {
      const response = await checkTask(task.id, task.topic_id, answer);
      optimisticUpdate(response, task.topic_id);
      setResult({ message: response.feedback, correct: response.correct });
    } catch (err) {
      console.error(err);
      setResult({ message: 'Не удалось проверить решение', correct: false });
    } finally {
      setLoading(false);
    }
  };

  const renderAnswerField = () => {
    if (!task) return null;
    switch (task.type) {
      case 'solve-ode':
        return (
          <FormulaInput
            value={expression}
            onChange={setExpression}
            placeholder="Например: C1*exp(2*x) + C2*exp(-2*x)"
            disabled={loading || isTimerExpired}
          />
        );
      case 'method-choice':
        return (
          <div className="space-y-2">
            {task.options?.map((option) => (
              <label key={option} className="flex items-center gap-2 rounded border border-slate-200 p-2 dark:border-slate-700">
                <input
                  type="radio"
                  name="method"
                  value={option}
                  checked={selectedOption === option}
                  onChange={(event) => setSelectedOption(event.target.value)}
                  disabled={loading || isTimerExpired}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );
      case 'theory':
        return (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setTruthValue(true)}
              className={`rounded px-4 py-2 ${
                truthValue === true ? 'bg-primary text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100'
              }`}
              disabled={loading || isTimerExpired}
            >
              Верно
            </button>
            <button
              type="button"
              onClick={() => setTruthValue(false)}
              className={`rounded px-4 py-2 ${
                truthValue === false
                  ? 'bg-primary text-white'
                  : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100'
              }`}
              disabled={loading || isTimerExpired}
            >
              Неверно
            </button>
          </div>
        );
      case 'numeric':
        return (
          <input
            type="number"
            value={numericAnswer}
            step="0.001"
            onChange={(event) => setNumericAnswer(event.target.value)}
            disabled={loading || isTimerExpired}
            className="w-40 rounded border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-800"
          />
        );
      case 'match':
        return (
          <div className="space-y-3">
            {task.pairs?.map((pair, index) => (
              <div key={pair.left} className="flex items-center gap-3">
                <span className="flex-1 rounded bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {pair.left}
                </span>
                <select
                  value={matchAnswers[index] ?? ''}
                  onChange={(event) =>
                    setMatchAnswers((prev) => {
                      const next = [...prev];
                      next[index] = event.target.value;
                      return next;
                    })
                  }
                  disabled={loading || isTimerExpired}
                  className="flex-1 rounded border border-slate-300 p-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                >
                  <option value="">—</option>
                  {task.pairs?.map((candidate) => (
                    <option key={candidate.right} value={candidate.right}>
                      {candidate.right}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const currentTopic = topics.find((topic) => topic.id === selectedTopic);

  return (
    <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <div className="space-y-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">{currentTopic?.title ?? 'Выбери тему'}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-300">{currentTopic?.summary}</p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={examMode}
                  onChange={(event) => setExamMode(event.target.checked)}
                />
                Режим экзамена
              </label>
              {timerActive && (
                <span className="font-mono text-lg text-accent">{Math.floor(remaining / 60)}:{`${remaining % 60}`.padStart(2, '0')}</span>
              )}
            </div>
          </div>
          {task ? (
            <div className="mt-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{task.title}</h3>
                <p className="mt-2 whitespace-pre-line text-slate-700 dark:text-slate-200">{task.prompt}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">Сложность: {task.difficulty}/5</p>
              </div>
              {!examMode && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleHint}
                    className="rounded-full border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
                    disabled={loading}
                  >
                    Показать подсказку
                  </button>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-slate-500 dark:text-slate-300">
                    {hintsToShow.map((hint: Hint) => (
                      <li key={hint.level}>{hint.text}</li>
                    ))}
                  </ul>
                </div>
              )}
              {renderAnswerField()}
              {result && (
                <div className={`rounded-xl border px-4 py-3 text-sm ${result.correct ? 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30' : 'border-red-400 bg-red-50 text-red-600 dark:bg-red-900/40'}`}>
                  {result.message}
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || isTimerExpired}
                  className="rounded-full bg-primary px-5 py-2 font-semibold text-white hover:-translate-y-0.5 disabled:opacity-60"
                >
                  Проверить ответ
                </button>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="rounded-full border border-primary px-5 py-2 font-semibold text-primary hover:bg-primary/10"
                  disabled={loading}
                >
                  Сгенерировать похожее
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm text-slate-500">Выберите тему и нажмите «Сгенерировать похожее», чтобы получить задачу.</p>
          )}
        </div>
        {error && <div className="text-red-500">{error}</div>}
      </div>
      <aside className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h3 className="text-lg font-semibold">Параметры тренировки</h3>
          <div className="mt-4 space-y-4">
            <div className="space-y-1">
              <label className="text-xs uppercase text-slate-500">Тема</label>
              <select
                value={selectedTopic}
                onChange={(event) => {
                  setSelectedTopic(event.target.value);
                  setTask(null);
                }}
                className="w-full rounded border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-900"
              >
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase text-slate-500">Целевая сложность</label>
              <input
                type="range"
                min={1}
                max={5}
                value={targetDifficulty}
                onChange={(event) => setTargetDifficulty(Number(event.target.value))}
                className="w-full"
              />
              <div className="text-xs text-slate-500">{targetDifficulty} / 5</div>
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase text-slate-500">Подсказки</label>
              <p className="text-slate-600 dark:text-slate-300">
                В обычном режиме подсказки открываются последовательно. В режиме экзамена они отключены и активируется таймер.
              </p>
            </div>
          </div>
        </div>
        {task && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h3 className="text-lg font-semibold">Шпаргалка по теме</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600 dark:text-slate-300">
              {currentTopic?.practice_outline.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </section>
  );
}
