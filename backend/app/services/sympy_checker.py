from __future__ import annotations

from typing import Any

import sympy as sp
from sympy.parsing.sympy_parser import parse_expr

from ..data.topics import Task


SYMBOLIC_LOCALS = {
    "sin": sp.sin,
    "cos": sp.cos,
    "exp": sp.exp,
    "ln": sp.log,
    "log": sp.log,
    "sqrt": sp.sqrt,
    "Eq": sp.Eq,
    "Derivative": sp.Derivative,
    "Integral": sp.integrate,
}

CONSTANTS = {name: sp.symbols(name) for name in ["C", "C1", "C2", "C3", "k"]}


class SympyValidationError(Exception):
    """Raised when answer cannot be parsed."""


def check_task_answer(task: Task, user_answer: Any) -> tuple[bool, str]:
    if task.type == "method-choice":
        return _check_method_choice(task, user_answer)
    if task.type == "theory":
        return _check_theory(task, user_answer)
    if task.type == "match":
        return _check_match(task, user_answer)
    if task.type == "numeric":
        return _check_numeric(task, user_answer)
    if task.type == "solve-ode":
        return _check_ode(task, user_answer)
    raise NotImplementedError(f"Unknown task type: {task.type}")


def _check_method_choice(task: Task, user_answer: Any) -> tuple[bool, str]:
    if not isinstance(user_answer, str):
        return False, "Ответ должен быть строкой"
    correct = task.expected == user_answer
    feedback = "Отлично!" if correct else f"Правильный ответ: {task.expected}"
    return correct, feedback


def _check_theory(task: Task, user_answer: Any) -> tuple[bool, str]:
    correct = bool(task.expected) == bool(user_answer)
    feedback = "Верно" if correct else "Уточните критерии точности"
    return correct, feedback


def _check_match(task: Task, user_answer: Any) -> tuple[bool, str]:
    if not isinstance(user_answer, list) or task.expected is None:
        return False, "Выберите соответствия"
    correct = list(task.expected) == list(user_answer)
    feedback = "Совпадение найдено" if correct else "Проверьте соответствия"
    return correct, feedback


def _check_numeric(task: Task, user_answer: Any) -> tuple[bool, str]:
    if task.expected is None:
        return False, "Нет эталонного ответа"
    try:
        value = float(user_answer)
    except (TypeError, ValueError):
        return False, "Введите числовой ответ"
    tolerance = task.validation.get("tolerance", 1e-3) if task.validation else 1e-3
    correct = abs(value - float(task.expected)) <= tolerance
    feedback = (
        "Приближение верное" if correct else f"Получилось {task.expected:.3f}. Проверьте формулу шага"
    )
    return correct, feedback


def _check_ode(task: Task, user_answer: Any) -> tuple[bool, str]:
    if task.validation is None:
        return False, "Нет данных для проверки"
    if not isinstance(user_answer, str) or not user_answer.strip():
        return False, "Введите аналитический ответ"

    symbol_name = task.validation.get("symbol", "x")
    equation_str = task.validation.get("equation")
    if not equation_str:
        return False, "Не задано уравнение"

    try:
        result = _validate_solution(equation_str, symbol_name, user_answer)
    except SympyValidationError as exc:
        return False, str(exc)

    if result:
        return True, "Решение удовлетворяет уравнению"
    return False, "Подстановка в уравнение не обнуляет левую часть"


def _validate_solution(equation_str: str, symbol_name: str, user_answer: str) -> bool:
    x = sp.symbols(symbol_name)
    y = sp.Function("y")

    local_dict = {**SYMBOLIC_LOCALS, symbol_name: x, "y": y, **CONSTANTS}
    try:
        equation = parse_expr(equation_str, local_dict)
        solution_expr = parse_expr(user_answer, local_dict)
    except Exception as exc:  # pragma: no cover - defensive
        raise SympyValidationError(f"Не удалось разобрать выражение: {exc}") from exc

    if isinstance(equation, sp.Equality):
        lhs = equation.lhs
        rhs = equation.rhs
    else:
        lhs = equation
        rhs = 0

    substituted = lhs.subs(y(x), solution_expr)
    rhs_substituted = rhs.subs(y(x), solution_expr)
    diff = sp.simplify(substituted - rhs_substituted)
    if diff == 0:
        return True

    # Попробуем упростить с помощью развёртки констант
    diff_free = sp.simplify(diff.diff(x))
    if diff_free == 0:
        return True

    # Дополнительная проверка по подстановке случайных значений
    for value in [0, 1, 2]:
        try:
            numeric = diff.subs(x, value)
        except Exception:  # pragma: no cover
            continue
        if numeric != 0:
            return False
    return True
