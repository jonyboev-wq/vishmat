from __future__ import annotations

import itertools
import random
from typing import Callable, Optional

COUNTER = itertools.count(1)

TemplateFn = Callable[[], dict]


LINEAR_COEFFICIENTS = [1, 2, 3]
RHS_COEFFICIENTS = [1, 2, 3]


def _ode_linear_variant() -> dict:
    idx = next(COUNTER)
    k = random.choice(LINEAR_COEFFICIENTS)
    rhs_coeff = random.choice(RHS_COEFFICIENTS)
    task_id = f"fo-linear-generated-{idx}"
    prompt = f"Решите уравнение y' + {k} y = {rhs_coeff} e^x"
    return {
        "id": task_id,
        "topic_id": "ode-first-order",
        "title": "Генератор: линейное ОДУ",
        "type": "solve-ode",
        "prompt": prompt,
        "difficulty": 2,
        "hints": [
            {"level": 1, "text": "Интегрирующий множитель μ(x) = e^{∫{k} dx}"},
            {"level": 2, "text": f"Получите (e^{{{k}x}} y)' = {rhs_coeff} e^{{(1+{k})x}}"},
        ],
        "validation": {
            "type": "ode",
            "equation": f"Eq(Derivative(y(x), x) + {k}*y(x), {rhs_coeff}*exp(x))",
            "symbol": "x",
        },
    }


def _method_choice_variant() -> dict:
    idx = next(COUNTER)
    equation = random.choice([
        "y' + 2xy = 0",
        "y' - y/x = 0",
    ])
    correct_method = (
        "Метод разделения переменных" if "xy" in equation else "Метод интегрирующего множителя"
    )
    return {
        "id": f"fo-method-generated-{idx}",
        "topic_id": "ode-first-order",
        "title": "Выбор метода",
        "type": "method-choice",
        "prompt": f"Какой метод подходит для уравнения {equation}?",
        "difficulty": 1,
        "hints": [
            {"level": 1, "text": "Посмотрите на структуру правой части"},
        ],
        "options": [
            "Метод разделения переменных",
            "Метод интегрирующего множителя",
            "Метод Бернулли",
        ],
        "expected": correct_method,
    }


def _numeric_euler_variant() -> dict:
    idx = next(COUNTER)
    slope = random.choice(["x + y", "y - x"])
    h = random.choice([0.1, 0.2])
    prompt = f"Сделайте один шаг метода Эйлера (h={h}) для y' = {slope}, y(0)=1"
    f0 = 1 if slope == "x + y" else 1
    y1 = 1 + h * f0
    return {
        "id": f"numeric-euler-generated-{idx}",
        "topic_id": "numerical-methods",
        "title": "Генератор шага Эйлера",
        "type": "numeric",
        "prompt": prompt,
        "difficulty": 3,
        "hints": [
            {"level": 1, "text": "y_{n+1} = y_n + h f(x_n, y_n)"},
        ],
        "expected": round(y1, 3),
        "validation": {"type": "numeric", "tolerance": 1e-2},
    }


def choose_template(topic_id: str, target_difficulty: int) -> Optional[TemplateFn]:
    if topic_id == "ode-first-order":
        return random.choice([_ode_linear_variant, _method_choice_variant])
    if topic_id == "numerical-methods":
        return _numeric_euler_variant
    return None
