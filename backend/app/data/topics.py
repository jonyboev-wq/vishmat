from __future__ import annotations

import random
from dataclasses import dataclass
from typing import Any, Dict

from . import templates


@dataclass
class Task:
    id: str
    topic_id: str
    title: str
    type: str
    prompt: str
    difficulty: int
    hints: list[dict[str, Any]]
    options: list[str] | None = None
    pairs: list[dict[str, str]] | None = None
    expected: Any | None = None
    validation: dict[str, Any] | None = None


TOPICS: list[dict[str, Any]] = [
    {
        "id": "ode-first-order",
        "title": "ОДУ первого порядка",
        "summary": "Разбираемся с основными типами ОДУ первого порядка: разделяющиеся, линейные, точные.",
        "objectives": [
            "Распознавать тип уравнения",
            "Применять корректный метод интегрирования",
            "Проверять полученный ответ",
        ],
        "recommended_path": [
            "ode-first-order", "ode-second-order", "laplace-transform",
        ],
        "theory_points": [
            "Линейные ОДУ: y' + P(x)y = Q(x). Интегрирующий множитель μ(x) = e^{∫P(x)dx}.",
            "Разделяющиеся уравнения: приведение к виду g(y)dy = f(x)dx.",
            "Точные уравнения: dF(x, y) = 0, проверка условия ∂M/∂y = ∂N/∂x.",
        ],
        "examples": [
            "y' + y = e^x → μ(x) = e^{∫1 dx} = e^x → y = C e^{-x} + \frac{1}{2}e^x",
            "(2xy + y^2)dx + (x^2 + 2xy)dy = 0 → точное → F(x,y) = x^2 y + xy^2",
        ],
        "practice_outline": [
            "Выбор метода",
            "Решение линейного уравнения",
            "Решение точного уравнения",
            "Экзаменационная задача",
        ],
        "exam_reference": "Билет №2, задача 3: линейное уравнение с интегрирующим множителем",
    },
    {
        "id": "ode-second-order",
        "title": "ОДУ второго порядка",
        "summary": "Классические уравнения с постоянными коэффициентами и вариацией постоянных.",
        "objectives": [
            "Решать однородные уравнения с характеристическим уравнением",
            "Решать неоднородные уравнения методом вариации постоянных",
        ],
        "recommended_path": [
            "ode-second-order", "euler-cauchy", "laplace-transform",
        ],
        "theory_points": [
            "Характеристическое уравнение: r^2 + a r + b = 0.",
            "При кратных корнях решение имеет вид y = (C_1 + C_2 x)e^{rx}.",
            "Метод вариации постоянных: ищем y_p = u_1(x)y_1 + u_2(x)y_2.",
        ],
        "examples": [
            "y'' - 4y = 0 → y = C_1 e^{2x} + C_2 e^{-2x}",
            r"y'' + y = \sin x → y = C_1 \cos x + C_2 \sin x - \frac{1}{2}x \cos x",
        ],
        "practice_outline": [
            "Характеристическое уравнение",
            "Неоднородные решения",
        ],
        "exam_reference": "Билет №4, задача 2: дифференциальное уравнение второго порядка",
    },
    {
        "id": "euler-cauchy",
        "title": "Метод Эйлера–Коши",
        "summary": "Уравнения вида x^2 y'' + a x y' + b y = g(x).",
        "objectives": [
            "Понимать замену y = x^m",
            "Решать неоднородные уравнения с правой частью",
        ],
        "recommended_path": [
            "euler-cauchy", "ode-second-order", "variation-of-parameters",
        ],
        "theory_points": [
            "Подстановка y = x^m → характеристическое уравнение m(m-1)+am+b=0.",
            "Для неоднородных решений используем метод вариации постоянных или Анзаты.",
        ],
        "examples": [
            r"x^2 y'' - x y' + y = 0 → y = C_1 x + C_2 x \ln x",
        ],
        "practice_outline": [
            "Характеристический корень",
            "Неоднородное решение",
        ],
        "exam_reference": "Билет №5, задача 1",
    },
    {
        "id": "systems",
        "title": "Системы дифференциальных уравнений",
        "summary": "Линеаризация, диагонализация и численные методы для систем.",
        "objectives": [
            "Приводить систему к нормальной форме",
            "Использовать собственные значения",
        ],
        "recommended_path": [
            "systems", "laplace-transform", "numerical-methods",
        ],
        "theory_points": [
            "Записываем систему в матричном виде Y' = AY + B(x).",
            "Решение через e^{At} и метод вариации постоянных.",
        ],
        "examples": [
            r"Y' = \begin{pmatrix}0 & 1\\-2 & -3\end{pmatrix}Y → e^{At} = P e^{Dt} P^{-1}",
        ],
        "practice_outline": [
            "Нахождение собственных значений",
            "Решение системы",
        ],
        "exam_reference": "Билет №6, система 2×2",
    },
    {
        "id": "laplace-transform",
        "title": "Преобразование Лапласа",
        "summary": "Применение преобразования Лапласа для решения ОДУ.",
        "objectives": [
            "Выполнять прямое и обратное преобразование",
            "Использовать таблицы Лапласа",
        ],
        "recommended_path": [
            "laplace-transform", "ode-second-order", "systems",
        ],
        "theory_points": [
            r"\mathcal{L}\{f'\} = s F(s) - f(0).",
            "Обратное преобразование через разложение на простые дроби.",
        ],
        "examples": [
            r"y' + 2y = e^{-t}, y(0)=1 → Y(s) = \frac{1}{s+2} + \frac{1}{s+2} \cdot \frac{1}{s+1}",
        ],
        "practice_outline": [
            "Выбор изображения",
            "Решение ОДУ",
        ],
        "exam_reference": "Билет №7, задача 3",
    },
    {
        "id": "numerical-methods",
        "title": "Численные методы",
        "summary": "Методы Эйлера и Рунге–Кутты для аппроксимации решений.",
        "objectives": [
            "Использовать явный метод Эйлера",
            "Сравнивать с методом Рунге–Кутты",
        ],
        "recommended_path": [
            "numerical-methods", "systems",
        ],
        "theory_points": [
            "Метод Эйлера: y_{n+1} = y_n + h f(x_n, y_n).",
            "RK4: y_{n+1} = y_n + \frac{h}{6}(k_1 + 2k_2 + 2k_3 + k_4).",
        ],
        "examples": [
            "y' = x + y, y(0)=1, h=0.1 → y(0.1) ≈ 1.11",
        ],
        "practice_outline": [
            "Шаг Эйлера",
            "Шаг Рунге–Кутты",
        ],
        "exam_reference": "Билет №8, задача 1",
    },
]


TASK_BANK: Dict[str, Task] = {}


def register_task(task: Task) -> None:
    TASK_BANK[task.id] = task


def build_static_tasks() -> None:
    register_task(
        Task(
            id="fo-linear-1",
            topic_id="ode-first-order",
            title="Определи метод решения",
            type="method-choice",
            prompt="Какой метод решения подходит для уравнения y' + 3y = 2e^{-x}?",
            difficulty=1,
            hints=[
                {"level": 1, "text": "Уравнение линейное"},
                {"level": 2, "text": "Применяется интегрирующий множитель"},
            ],
            options=[
                "Метод разделения переменных",
                "Метод интегрирующего множителя",
                "Метод Бернулли",
            ],
            expected="Метод интегрирующего множителя",
        )
    )

    register_task(
        Task(
            id="fo-linear-2",
            topic_id="ode-first-order",
            title="Реши линейное уравнение",
            type="solve-ode",
            prompt="Решите уравнение y' + y = e^x",
            difficulty=2,
            hints=[
                {"level": 1, "text": "Вычислите μ(x) = e^{∫1 dx}"},
                {"level": 2, "text": "Получите (e^x y)' = e^{2x}"},
                {"level": 3, "text": "y = C e^{-x} + \frac{1}{2}e^x"},
            ],
            validation={
                "type": "ode",
                "equation": "Eq(Derivative(y(x), x) + y(x), exp(x))",
                "symbol": "x",
            },
        )
    )

    register_task(
        Task(
            id="fo-exact-1",
            topic_id="ode-first-order",
            title="Проверь точность",
            type="theory",
            prompt="Верно ли, что уравнение (2xy + y^2)dx + (x^2 + 2xy)dy = 0 является точным?",
            difficulty=2,
            hints=[
                {"level": 1, "text": "Сравните ∂M/∂y и ∂N/∂x"},
            ],
            expected=True,
        )
    )

    register_task(
        Task(
            id="so-characteristic-1",
            topic_id="ode-second-order",
            title="Корни характеристического уравнения",
            type="method-choice",
            prompt="Сколько различных корней имеет характеристическое уравнение y'' - 4y = 0?",
            difficulty=1,
            hints=[{"level": 1, "text": "Решите r^2 - 4 = 0"}],
            options=["Один", "Два", "Бесконечно много"],
            expected="Два",
        )
    )

    register_task(
        Task(
            id="so-solve-1",
            topic_id="ode-second-order",
            title="Общее решение",
            type="solve-ode",
            prompt="Найдите общее решение y'' - 4y = 0",
            difficulty=2,
            hints=[
                {"level": 1, "text": "Характеристическое уравнение r^2 - 4 = 0"},
                {"level": 2, "text": "Корни r = ±2"},
            ],
            validation={
                "type": "ode",
                "equation": "Eq(Derivative(y(x), (x, 2)) - 4*y(x), 0)",
                "symbol": "x",
            },
        )
    )

    register_task(
        Task(
            id="laplace-1",
            topic_id="laplace-transform",
            title="Выбор изображения",
            type="match",
            prompt="Соотнесите функции и их образы Лапласа",
            difficulty=2,
            hints=[{"level": 1, "text": "Вспомните таблицу преобразований"}],
            pairs=[
                {"left": "f(t) = 1", "right": "F(s) = 1/s"},
                {"left": "f(t) = e^{at}", "right": "F(s) = 1/(s-a)"},
                {"left": r"f(t) = \sin t", "right": "F(s) = 1/(s^2 + 1)"},
            ],
            expected=[0, 1, 2],
        )
    )

    register_task(
        Task(
            id="numeric-euler-1",
            topic_id="numerical-methods",
            title="Шаг метода Эйлера",
            type="numeric",
            prompt="Используя метод Эйлера с шагом h=0.1 для y' = x + y, y(0)=1, найдите приближение y(0.1)",
            difficulty=3,
            hints=[
                {"level": 1, "text": "y_{n+1} = y_n + h f(x_n, y_n)"},
                {"level": 2, "text": "f(0,1) = 1"},
            ],
            expected=1.1,
            validation={"type": "numeric", "tolerance": 1e-2},
        )
    )

    register_task(
        Task(
            id="systems-eigen-1",
            topic_id="systems",
            title="Собственные значения",
            type="method-choice",
            prompt="Найдите количество различных собственных значений матрицы [[0,1],[-2,-3]]",
            difficulty=2,
            hints=[{"level": 1, "text": r"Решите det(A-\lambda I)=0"}],
            options=["Одно", "Два", "Три"],
            expected="Два",
        )
    )

    register_task(
        Task(
            id="euler-cauchy-1",
            topic_id="euler-cauchy",
            title="Корень уравнения",
            type="theory",
            prompt=r"Верно ли, что y = C_1 x + C_2 x \ln x является решением x^2 y'' - x y' + y = 0?",
            difficulty=3,
            hints=[{"level": 1, "text": "Подставьте решение"}],
            expected=True,
        )
    )


build_static_tasks()


def get_topic(topic_id: str) -> dict[str, Any] | None:
    return next((topic for topic in TOPICS if topic["id"] == topic_id), None)


def sample_task(topic_id: str, target_difficulty: int) -> Task:
    candidates = [
        task for task in TASK_BANK.values() if task.topic_id == topic_id and task.difficulty <= target_difficulty
    ]
    if not candidates:
        candidates = [task for task in TASK_BANK.values() if task.topic_id == topic_id]
    return random.choice(candidates)


def generate_task(topic_id: str, target_difficulty: int) -> Task:
    template = templates.choose_template(topic_id, target_difficulty)
    if not template:
        return sample_task(topic_id, target_difficulty)
    payload = template()
    task = Task(**payload)
    register_task(task)
    return task
