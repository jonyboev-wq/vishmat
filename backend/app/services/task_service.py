from __future__ import annotations

from typing import Any

from ..data import topics
from ..data.topics import Task
from . import sympy_checker


def list_topics() -> list[dict[str, Any]]:
    return topics.TOPICS


def get_topic_detail(topic_id: str) -> dict[str, Any] | None:
    return topics.get_topic(topic_id)


def generate_task(topic_id: str, target_difficulty: int) -> Task:
    return topics.generate_task(topic_id, target_difficulty)


def grade_answer(task_id: str, topic_id: str, user_answer: Any) -> tuple[Task, bool, str]:
    task = topics.TASK_BANK.get(task_id)
    if not task:
        task = topics.sample_task(topic_id, target_difficulty=3)
    correct, feedback = sympy_checker.check_task_answer(task, user_answer)
    return task, correct, feedback
