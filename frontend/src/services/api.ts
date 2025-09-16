import { CheckResponse, ProgressEntry, ProgressPayload, TaskPayload, TaskValidation, TopicDetail } from '../types';

type UserSettings = {
  preferredLanguage: string;
};

const STORAGE_KEYS = {
  progress: 'vishmat-progress',
  settings: 'vishmat-settings',
};

const DEFAULT_PROGRESS: ProgressPayload = {
  user_id: 1,
  xp: 0,
  streak: 0,
  last_active: new Date().toISOString(),
  daily_goal_minutes: 10,
  progress: [],
};

const DEFAULT_SETTINGS: UserSettings = {
  preferredLanguage: 'ru',
};

const ALLOWED_FUNCTIONS = new Set(['exp', 'sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'abs']);
const ALLOWED_SYMBOLS = new Set(['x', 'C', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'k', 'pi', 'PI', 'e', 'E']);
const SAMPLE_POINTS = [-1, -0.5, 0, 0.5, 1, 2];
const LINEAR_COEFFICIENTS = [1, 2, 3] as const;
const RHS_COEFFICIENTS = [1, 2, 3] as const;

const TOPICS: TopicDetail[] = [
  {
    id: 'ode-first-order',
    title: 'ОДУ первого порядка',
    summary: 'Разбираемся с основными типами ОДУ первого порядка: разделяющиеся, линейные, точные.',
    objectives: [
      'Распознавать тип уравнения',
      'Применять корректный метод интегрирования',
      'Проверять полученный ответ',
    ],
    recommended_path: ['ode-first-order', 'ode-second-order', 'laplace-transform'],
    theory_points: [
      "Линейные ОДУ: y' + P(x)y = Q(x). Интегрирующий множитель μ(x) = e^{∫P(x)dx}.",
      'Разделяющиеся уравнения: приведение к виду g(y)dy = f(x)dx.',
      'Точные уравнения: dF(x, y) = 0, проверка условия ∂M/∂y = ∂N/∂x.',
    ],
    examples: [
      "y' + y = e^x → μ(x) = e^{∫1 dx} = e^x → y = C e^{-x} + \\frac{1}{2}e^x",
      '(2xy + y^2)dx + (x^2 + 2xy)dy = 0 → точное → F(x,y) = x^2 y + xy^2',
    ],
    practice_outline: ['Выбор метода', 'Решение линейного уравнения', 'Решение точного уравнения', 'Экзаменационная задача'],
    exam_reference: 'Билет №2, задача 3: линейное уравнение с интегрирующим множителем',
  },
  {
    id: 'ode-second-order',
    title: 'ОДУ второго порядка',
    summary: 'Классические уравнения с постоянными коэффициентами и вариацией постоянных.',
    objectives: [
      'Решать однородные уравнения с характеристическим уравнением',
      'Решать неоднородные уравнения методом вариации постоянных',
    ],
    recommended_path: ['ode-second-order', 'euler-cauchy', 'laplace-transform'],
    theory_points: [
      'Характеристическое уравнение: r^2 + a r + b = 0.',
      'При кратных корнях решение имеет вид y = (C_1 + C_2 x)e^{rx}.',
      'Метод вариации постоянных: ищем y_p = u_1(x)y_1 + u_2(x)y_2.',
    ],
    examples: [
      "y'' - 4y = 0 → y = C_1 e^{2x} + C_2 e^{-2x}",
      "y'' + y = sin x → y = C_1 cos x + C_2 sin x - \\frac{1}{2}x cos x",
    ],
    practice_outline: ['Характеристическое уравнение', 'Неоднородные решения'],
    exam_reference: 'Билет №4, задача 2: дифференциальное уравнение второго порядка',
  },
  {
    id: 'euler-cauchy',
    title: 'Метод Эйлера–Коши',
    summary: "Уравнения вида x^2 y'' + a x y' + b y = g(x).",
    objectives: ['Понимать замену y = x^m', 'Решать неоднородные уравнения с правой астью'],
    recommended_path: ['euler-cauchy', 'ode-second-order', 'variation-of-parameters'],
    theory_points: [
      'Подстановка y = x^m → характеристическое уравнение m(m-1)+am+b=0.',
      'Для неоднородных решений используем метод вариации постоянных или Анзаты.',
    ],
    examples: ["x^2 y'' - x y' + y = 0 → y = C_1 x + C_2 x ln x"],
    practice_outline: ['Характеристический корень', 'Неоднородное решение'],
    exam_reference: 'Билет №5, задача 1',
  },
  {
    id: 'systems',
    title: 'Системы дифференциальных уравнений',
    summary: 'Линеаризация, диагонализация и численные методы для систем.',
    objectives: ['Приводить систему к нормальной форме', 'Использовать собственные значения'],
    recommended_path: ['systems', 'laplace-transform', 'numerical-methods'],
    theory_points: [
      "Записываем систему в матричном виде Y' = AY + B(x).",
      'Решение через e^{At} и метод вариации постоянных.',
    ],
    examples: ["Y' = \\begin{pmatrix}0 & 1\\-2 & -3\\end{pmatrix}Y → e^{At} = P e^{Dt} P^{-1}"],
    practice_outline: ['Нахождение собственных значений', 'Решение системы'],
    exam_reference: 'Билет №6, система 2×2',
  },
  {
    id: 'laplace-transform',
    title: 'Преобразование Лапласа',
    summary: 'Применение преобразования Лапласа для решения ОДУ.',
    objectives: ['Выполнять прямое и обратное преобразование', 'Использовать таблицы Лапласа'],
    recommended_path: ['laplace-transform', 'ode-second-order', 'systems'],
    theory_points: ["\\mathcal{L}\\{f'\\} = s F(s) - f(0).", 'Обратное преобразование через разложение на простые дроби.'],
    examples: ["y' + 2y = e^{-t}, y(0)=1 → Y(s) = \\frac{1}{s+2} + \\frac{1}{s+2} \\cdot \\frac{1}{s+1}"],
    practice_outline: ['Выбор изображения', 'Решение ОДУ'],
    exam_reference: 'Билет №7, задача 3',
  },
  {
    id: 'numerical-methods',
    title: 'Численные методы',
    summary: 'Методы Эйлера и Рунге–Кутты для аппроксимации решений.',
    objectives: ['Использовать явный метод Эйлера', 'Сравнивать с методом Рунге–Кутты'],
    recommended_path: ['numerical-methods', 'systems'],
    theory_points: [
      'Метод Эйлера: y_{n+1} = y_n + h f(x_n, y_n).',
      'RK4: y_{n+1} = y_n + \\frac{h}{6}(k_1 + 2k_2 + 2k_3 + k_4).',
    ],
    examples: ["y' = x + y, y(0)=1, h=0.1 → y(0.1) ≈ 1.11"],
    practice_outline: ['Шаг Эйлера', 'Шаг Рунге–Кутты'],
    exam_reference: 'Билет №8, задача 1',
  },
];

const STATIC_TASKS: TaskPayload[] = [
  {
    id: 'fo-linear-1',
    topic_id: 'ode-first-order',
    title: 'Определи метод решения',
    type: 'method-choice',
    prompt: "Какой метод решения подходит для уравнения y' + 3y = 2e^{-x}?",
    difficulty: 1,
    hints: [
      { level: 1, text: 'Уравнение линейное' },
      { level: 2, text: 'Применяется интегрирующий множитель' },
    ],
    options: ['Метод интегрирующего множителя', 'Метод разделения переменных', 'Метод Бернулли'],
    validation: {
      type: 'method-choice',
      expected: 'Метод интегрирующего множителя',
    },
  },
  {
    id: 'fo-linear-2',
    topic_id: 'ode-first-order',
    title: 'Реши линейное уравнение',
    type: 'solve-ode',
    prompt: "Решите уравнение y' + y = e^x",
    difficulty: 2,
    hints: [
      { level: 1, text: 'Вычислите μ(x) = e^{∫1 dx}' },
      { level: 2, text: 'Получите (e^{x} y)' },
      { level: 3, text: 'y = C e^{-x} + \\frac{1}{2}e^x' },
    ],
    validation: {
      type: 'ode',
      variable: 'x',
      terms: [
        { derivative: 1, coefficient: '1' },
        { derivative: 0, coefficient: '1' },
      ],
      rhs: 'exp(x)',
    },
  },
  {
    id: 'fo-exact-1',
    topic_id: 'ode-first-order',
    title: 'Проверь точность',
    type: 'theory',
    prompt: 'Верно ли, что уравнение (2xy + y^2)dx + (x^2 + 2xy)dy = 0 является точным?',
    difficulty: 2,
    hints: [{ level: 1, text: 'Сравните ∂M/∂y и ∂N/∂x' }],
    validation: {
      type: 'theory',
      expected: true,
    },
  },
  {
    id: 'so-characteristic-1',
    topic_id: 'ode-second-order',
    title: 'Корни характеристического уравнения',
    type: 'method-choice',
    prompt: "Сколько различных корней имеет характеристическое уравнение y'' - 4y = 0?",
    difficulty: 1,
    hints: [{ level: 1, text: 'Решите r^2 - 4 = 0' }],
    options: ['Один', 'Два', 'Бесконечно много'],
    validation: {
      type: 'method-choice',
      expected: 'Два',
    },
  },
  {
    id: 'so-solve-1',
    topic_id: 'ode-second-order',
    title: 'Общее решение',
    type: 'solve-ode',
    prompt: "Найдите общее решение y'' - 4y = 0",
    difficulty: 2,
    hints: [
      { level: 1, text: 'Характеристическое уравнение r^2 - 4 = 0' },
      { level: 2, text: 'Корни r = ±2' },
    ],
    validation: {
      type: 'ode',
      variable: 'x',
      terms: [
        { derivative: 2, coefficient: '1' },
        { derivative: 0, coefficient: '-4' },
      ],
      rhs: '0',
    },
  },
  {
    id: 'laplace-1',
    topic_id: 'laplace-transform',
    title: 'Выбор изображения',
    type: 'match',
    prompt: 'Соотнесите функции и их образы Лапласа',
    difficulty: 2,
    hints: [{ level: 1, text: 'Вспомните таблицу преобразований' }],
    pairs: [
      { left: 'f(t) = 1', right: 'F(s) = 1/s' },
      { left: 'f(t) = e^{at}', right: 'F(s) = 1/(s-a)' },
      { left: 'f(t) = sin t', right: 'F(s) = 1/(s^2 + 1)' },
    ],
    validation: {
      type: 'match',
      expected: [0, 1, 2],
    },
  },
  {
    id: 'numeric-euler-1',
    topic_id: 'numerical-methods',
    title: 'Шаг метода Эйлера',
    type: 'numeric',
    prompt: "Используя метод Эйлера с шагом h=0.1 для y' = x + y, y(0)=1, найдите приближение y(0.1)",
    difficulty: 3,
    hints: [
      { level: 1, text: 'y_{n+1} = y_n + h f(x_n, y_n)' },
      { level: 2, text: 'f(0,1) = 1' },
    ],
    validation: {
      type: 'numeric',
      expected: 1.1,
      tolerance: 1e-2,
    },
  },
  {
    id: 'systems-eigen-1',
    topic_id: 'systems',
    title: 'Собственные значения',
    type: 'method-choice',
    prompt: 'Найдите количество различных собственных значений матрицы [[0,1],[-2,-3]]',
    difficulty: 2,
    hints: [{ level: 1, text: 'Решите det(A-λI)=0' }],
    options: ['Одно', 'Два', 'Три'],
    validation: {
      type: 'method-choice',
      expected: 'Два',
    },
  },
  {
    id: 'euler-cauchy-1',
    topic_id: 'euler-cauchy',
    title: 'Корень уравнения',
    type: 'theory',
    prompt: "Верно ли, что y = C_1 x + C_2 x ln x является решением x^2 y'' - x y' + y = 0?",
    difficulty: 3,
    hints: [{ level: 1, text: 'Подставьте решение' }],
    validation: {
      type: 'theory',
      expected: true,
    },
  },
];

const taskBank = new Map<string, TaskPayload>();

for (const task of STATIC_TASKS) {
  taskBank.set(task.id, cloneTask(task));
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function cloneProgress(progress: ProgressPayload): ProgressPayload {
  return {
    ...progress,
    progress: progress.progress.map((entry) => ({ ...entry })),
  };
}

function cloneValidation(validation?: TaskValidation | null): TaskValidation | null | undefined {
  if (!validation) {
    return validation;
  }
  if (validation.type === 'ode') {
    return {
      type: 'ode',
      variable: validation.variable,
      terms: validation.terms.map((term) => ({ ...term })),
      rhs: validation.rhs,
    };
  }
  if (validation.type === 'match') {
    return { ...validation, expected: [...validation.expected] };
  }
  return { ...validation };
}

function cloneTask(task: TaskPayload): TaskPayload {
  return {
    ...task,
    hints: task.hints.map((hint) => ({ ...hint })),
    options: task.options ? [...task.options] : undefined,
    pairs: task.pairs ? task.pairs.map((pair) => ({ ...pair })) : undefined,
    validation: cloneValidation(task.validation),
  };
}

function cloneTopic(topic: TopicDetail): TopicDetail {
  return {
    ...topic,
    objectives: [...topic.objectives],
    recommended_path: [...topic.recommended_path],
    theory_points: [...topic.theory_points],
    examples: [...topic.examples],
    practice_outline: [...topic.practice_outline],
  };
}

function writeProgress(progress: ProgressPayload): void {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(progress));
}

function readProgress(): ProgressPayload {
  if (!isBrowser()) {
    return cloneProgress(DEFAULT_PROGRESS);
  }
  const raw = window.localStorage.getItem(STORAGE_KEYS.progress);
  if (!raw) {
    const fallback = cloneProgress(DEFAULT_PROGRESS);
    writeProgress(fallback);
    return fallback;
  }
  try {
    const parsed = JSON.parse(raw) as ProgressPayload;
    const base = cloneProgress(DEFAULT_PROGRESS);
    const entries = Array.isArray(parsed.progress)
      ? parsed.progress.map<ProgressEntry>((entry) => ({
          topic_id: entry.topic_id,
          mastery: entry.mastery ?? 0,
          completed_lessons: entry.completed_lessons ?? 0,
          best_score: entry.best_score ?? 0,
          xp_earned: entry.xp_earned ?? 0,
        }))
      : [];
    return {
      user_id: parsed.user_id ?? base.user_id,
      xp: parsed.xp ?? base.xp,
      streak: parsed.streak ?? base.streak,
      last_active: parsed.last_active ?? base.last_active,
      daily_goal_minutes: parsed.daily_goal_minutes ?? base.daily_goal_minutes,
      progress: entries,
    };
  } catch {
    const fallback = cloneProgress(DEFAULT_PROGRESS);
    writeProgress(fallback);
    return fallback;
  }
}

function writeSettings(settings: UserSettings): void {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

function readSettings(): UserSettings {
  if (!isBrowser()) {
    return { ...DEFAULT_SETTINGS };
  }
  const raw = window.localStorage.getItem(STORAGE_KEYS.settings);
  if (!raw) {
    writeSettings(DEFAULT_SETTINGS);
    return { ...DEFAULT_SETTINGS };
  }
  try {
    const parsed = JSON.parse(raw) as UserSettings;
    return {
      preferredLanguage: parsed.preferredLanguage ?? DEFAULT_SETTINGS.preferredLanguage,
    };
  } catch {
    writeSettings(DEFAULT_SETTINGS);
    return { ...DEFAULT_SETTINGS };
  }
}

function randomChoice<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function sampleTask(topicId: string, targetDifficulty: number): TaskPayload {
  const allTasks = Array.from(taskBank.values()).filter((task) => task.topic_id === topicId);
  if (allTasks.length === 0) {
    throw new Error('Нет заданий для указанной темы');
  }
  const candidates = allTasks.filter((task) => task.difficulty <= targetDifficulty);
  const selected = candidates.length > 0 ? randomChoice(candidates) : randomChoice(allTasks);
  return cloneTask(selected);
}

type TemplateFactory = () => TaskPayload;

function templateLinearOde(): TaskPayload {
  const k = randomChoice(LINEAR_COEFFICIENTS);
  const rhs = randomChoice(RHS_COEFFICIENTS);
  return {
    id: createId('fo-linear-generated'),
    topic_id: 'ode-first-order',
    title: 'Генератор: линейное ОДУ',
    type: 'solve-ode',
    prompt: `Решите уравнение y' + ${k} y = ${rhs} e^x`,
    difficulty: 2,
    hints: [
      { level: 1, text: `Интегрирующий множитель μ(x) = e^{∫${k} dx}` },
      { level: 2, text: `Получите (e^{${k}x} y)' = ${rhs} e^{(1+${k})x}` },
    ],
    validation: {
      type: 'ode',
      variable: 'x',
      terms: [
        { derivative: 1, coefficient: '1' },
        { derivative: 0, coefficient: String(k) },
      ],
      rhs: `${rhs} * exp(x)`,
    },
  };
}

function templateMethodChoice(): TaskPayload {
  const equation = randomChoice(["y' + 2xy = 0", "y' - y/x = 0"]);
  const expected = equation.includes('xy') ? 'Метод разделения переменных' : 'Метод интегрирующего множителя';
  return {
    id: createId('fo-method-generated'),
    topic_id: 'ode-first-order',
    title: 'Выбор метода',
    type: 'method-choice',
    prompt: `Какой метод подходит для уравнения ${equation}?`,
    difficulty: 1,
    hints: [{ level: 1, text: 'Посмотрите на структуру правой части' }],
    options: ['Метод разделения переменных', 'Метод интегрирующего множителя', 'Метод Бернулли'],
    validation: {
      type: 'method-choice',
      expected,
    },
  };
}

function templateNumericEuler(): TaskPayload {
  const slope = randomChoice(['x + y', 'y - x']);
  const h = randomChoice([0.1, 0.2]);
  const f0 = slope === 'x + y' ? 1 : 1;
  const approximation = 1 + h * f0;
  return {
    id: createId('numeric-euler-generated'),
    topic_id: 'numerical-methods',
    title: 'Генератор шага Эйлера',
    type: 'numeric',
    prompt: `Сделайте один шаг метода Эйлера (h=${h}) для y' = ${slope}, y(0)=1`,
    difficulty: 3,
    hints: [{ level: 1, text: 'y_{n+1} = y_n + h f(x_n, y_n)' }],
    validation: {
      type: 'numeric',
      expected: Number(approximation.toFixed(3)),
      tolerance: 1e-2,
    },
  };
}

function chooseTemplate(topicId: string): TemplateFactory | null {
  if (topicId === 'ode-first-order') {
    return randomChoice([templateLinearOde, templateMethodChoice]);
  }
  if (topicId === 'numerical-methods') {
    return templateNumericEuler;
  }
  return null;
}

type CheckResult = {
  correct: boolean;
  feedback: string;
};

function parseExpression(raw: string): { expression: string; symbols: Set<string> } {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error('Введите аналитический ответ');
  }
  const condensed = trimmed.replace(/\s+/g, '');
  if (/[^0-9A-Za-z+\-*/^().,_]/.test(condensed)) {
    throw new Error('Обнаружены недопустимые символы');
  }
  const words = condensed.match(/[A-Za-z_]\w*/g) ?? [];
  const symbols = new Set<string>();
  for (const word of words) {
    const lower = word.toLowerCase();
    if (ALLOWED_FUNCTIONS.has(lower)) {
      continue;
    }
    if (!ALLOWED_SYMBOLS.has(word)) {
      throw new Error(`Недопустимый идентификатор «${word}»`);
    }
    if (lower !== 'x' && lower !== 'pi' && lower !== 'e') {
      symbols.add(word);
    }
  }
  const normalized = condensed
    .replace(/\^/g, '**')
    .replace(/\bln\b/g, 'log')
    .replace(/\bpi\b/gi, 'PI')
    .replace(/\be\b/g, 'E');
  return { expression: normalized, symbols };
}

function compileExpression(raw: string): { evaluate: (x: number, constants: Record<string, number>) => number; symbols: Set<string> } {
  const { expression, symbols } = parseExpression(raw);
  const evaluator = new Function(
    'x',
    'C',
    'C1',
    'C2',
    'C3',
    'C4',
    'C5',
    'C6',
    'k',
    'exp',
    'sin',
    'cos',
    'tan',
    'sqrt',
    'log',
    'abs',
    'E',
    'PI',
    `'use strict'; return (${expression});`,
  ) as (...args: number[]) => number;
  const evaluate = (x: number, constants: Record<string, number>) =>
    evaluator(
      x,
      constants.C ?? 0,
      constants.C1 ?? 0,
      constants.C2 ?? 0,
      constants.C3 ?? 0,
      constants.C4 ?? 0,
      constants.C5 ?? 0,
      constants.C6 ?? 0,
      constants.k ?? 0,
      Math.exp,
      Math.sin,
      Math.cos,
      Math.tan,
      Math.sqrt,
      Math.log,
      Math.abs,
      Math.E,
      Math.PI,
    );
  return { evaluate, symbols };
}

function randomConstant(): number {
  return Math.random() * 4 - 2;
}

function derivativeAt(fn: (x: number) => number, x: number, order: number): number {
  const h = 1e-4;
  if (order === 0) {
    return fn(x);
  }
  if (order === 1) {
    return (fn(x + h) - fn(x - h)) / (2 * h);
  }
  if (order === 2) {
    return (fn(x + h) - 2 * fn(x) + fn(x - h)) / (h * h);
  }
  throw new Error('Проверка высокой производной не поддерживается');
}

function evaluateOde(task: TaskPayload, userAnswer: string): CheckResult {
  if (!task.validation || task.validation.type !== 'ode') {
    return { correct: false, feedback: 'Нет данных для проверки' };
  }
  try {
    const compiledAnswer = compileExpression(userAnswer);
    const termEvaluators = task.validation.terms.map((term) => compileExpression(term.coefficient));
    const rhsEvaluator = compileExpression(task.validation.rhs);
    const allSymbols = new Set<string>(compiledAnswer.symbols);
    termEvaluators.forEach((item) => item.symbols.forEach((symbol) => allSymbols.add(symbol)));
    rhsEvaluator.symbols.forEach((symbol) => allSymbols.add(symbol));
    const constants: Record<string, number> = {};
    allSymbols.forEach((symbol) => {
      if (symbol === 'k') {
        constants[symbol] = constants[symbol] ?? randomConstant();
      } else {
        constants[symbol] = randomConstant();
      }
    });
    let maxResidual = 0;
    for (const point of SAMPLE_POINTS) {
      const evalWithConstants = (value: number) => compiledAnswer.evaluate(value, constants);
      const lhs = task.validation.terms.reduce((acc, term, index) => {
        const coeff = termEvaluators[index].evaluate(point, constants);
        const derivative = derivativeAt(evalWithConstants, point, term.derivative);
        if (!Number.isFinite(coeff) || !Number.isFinite(derivative)) {
          throw new Error('Не удалось вычислить подстановку');
        }
        return acc + coeff * derivative;
      }, 0);
      const rhs = rhsEvaluator.evaluate(point, constants);
      if (!Number.isFinite(lhs) || !Number.isFinite(rhs)) {
        throw new Error('Получено бесконечное значение');
      }
      maxResidual = Math.max(maxResidual, Math.abs(lhs - rhs));
    }
    if (maxResidual < 1e-2) {
      return { correct: true, feedback: 'Решение удовлетворяет уравнению' };
    }
    return { correct: false, feedback: 'Подстановка в уравнение не обнуляет левую часть' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Не удалось проверить решение';
    return { correct: false, feedback: message };
  }
}

function evaluateMatch(task: TaskPayload, userAnswer: unknown): CheckResult {
  if (!task.validation || task.validation.type !== 'match') {
    return { correct: false, feedback: 'Нет эталонного ответа' };
  }
  if (!Array.isArray(userAnswer)) {
    return { correct: false, feedback: 'Выберите соответствия' };
  }
  const correct = task.validation.expected.length === userAnswer.length && task.validation.expected.every((value, index) => value === userAnswer[index]);
  return { correct, feedback: correct ? 'Совпадение найдено' : 'Проверьте соответствия' };
}

function evaluateNumeric(task: TaskPayload, userAnswer: unknown): CheckResult {
  if (!task.validation || task.validation.type !== 'numeric') {
    return { correct: false, feedback: 'Нет эталонного ответа' };
  }
  const value = Number(userAnswer);
  if (!Number.isFinite(value)) {
    return { correct: false, feedback: 'Введите числовой ответ' };
  }
  const tolerance = task.validation.tolerance ?? 1e-3;
  const correct = Math.abs(value - task.validation.expected) <= tolerance;
  const feedback = correct ? 'Приближение верное' : `Получилось ${task.validation.expected.toFixed(3)}. Проверьте формулу шага`;
  return { correct, feedback };
}

function evaluateTheory(task: TaskPayload, userAnswer: unknown): CheckResult {
  if (!task.validation || task.validation.type !== 'theory') {
    return { correct: false, feedback: 'Нет эталонного ответа' };
  }
  const correct = Boolean(userAnswer) === Boolean(task.validation.expected);
  return { correct, feedback: correct ? 'Верно' : 'Уточните критерии точности' };
}

function evaluateMethodChoice(task: TaskPayload, userAnswer: unknown): CheckResult {
  if (!task.validation || task.validation.type !== 'method-choice') {
    return { correct: false, feedback: 'Нет эталонного ответа' };
  }
  if (typeof userAnswer !== 'string') {
    return { correct: false, feedback: 'Ответ должен быть строкой' };
  }
  const correct = task.validation.expected === userAnswer;
  return { correct, feedback: correct ? 'Отлично!' : `Правильный ответ: ${task.validation.expected}` };
}

function evaluateTask(task: TaskPayload, userAnswer: unknown): CheckResult {
  switch (task.type) {
    case 'solve-ode':
      return evaluateOde(task, typeof userAnswer === 'string' ? userAnswer : '');
    case 'match':
      return evaluateMatch(task, userAnswer);
    case 'numeric':
      return evaluateNumeric(task, userAnswer);
    case 'theory':
      return evaluateTheory(task, userAnswer);
    case 'method-choice':
      return evaluateMethodChoice(task, userAnswer);
    default:
      return { correct: false, feedback: 'Неизвестный тип задания' };
  }
}

function storeTask(task: TaskPayload): TaskPayload {
  const stored = cloneTask(task);
  taskBank.set(task.id, stored);
  return cloneTask(stored);
}

function getTask(taskId: string): TaskPayload | undefined {
  const task = taskBank.get(taskId);
  return task ? cloneTask(task) : undefined;
}

export function fetchTopics(): Promise<TopicDetail[]> {
  return Promise.resolve(TOPICS.map((topic) => cloneTopic(topic)));
}

export function generateTask(topicId: string, targetDifficulty: number, _examMode: boolean): Promise<TaskPayload> {
  const template = chooseTemplate(topicId);
  if (template) {
    const generated = template();
    return Promise.resolve(storeTask(generated));
  }
  return Promise.resolve(sampleTask(topicId, targetDifficulty));
}

export function checkTask(taskId: string, topicId: string, userAnswer: unknown): Promise<CheckResponse> {
  const task = getTask(taskId) ?? sampleTask(topicId, 3);
  const { correct, feedback } = evaluateTask(task, userAnswer);
  const xp_awarded = correct ? 20 * task.difficulty : 5;
  const mastery_delta = correct ? 0.05 * task.difficulty : 0.01;
  return Promise.resolve({ correct, feedback, xp_awarded, mastery_delta });
}

export function fetchProgress(_userId = 1): Promise<ProgressPayload> {
  return Promise.resolve(cloneProgress(readProgress()));
}

export function saveProgressState(payload: ProgressPayload): void {
  writeProgress(cloneProgress(payload));
}

export function updateDailyGoal(_userId: number, minutes: number): Promise<void> {
  const progress = readProgress();
  const next = { ...progress, daily_goal_minutes: minutes };
  writeProgress(next);
  return Promise.resolve();
}

export function updateSettings(_userId: number, preferredLanguage: string): Promise<void> {
  const current = readSettings();
  writeSettings({ ...current, preferredLanguage });
  return Promise.resolve();
}

export function fetchSettings(): Promise<UserSettings> {
  return Promise.resolve({ ...readSettings() });
}

export function loadStoredProgress(): ProgressPayload {
  return cloneProgress(readProgress());
}

