from __future__ import annotations

from datetime import date
from typing import Any, Literal, Optional

from pydantic import BaseModel, Field


class Hint(BaseModel):
    level: int
    text: str


class TaskPayload(BaseModel):
    id: str
    topic_id: str
    title: str
    type: Literal[
        "method-choice",
        "solve-ode",
        "match",
        "numeric",
        "theory",
    ]
    prompt: str
    difficulty: int = Field(ge=1, le=5)
    hints: list[Hint]
    options: Optional[list[str]] = None
    pairs: Optional[list[dict[str, str]]] = None
    expected: Optional[Any] = None
    validation: Optional[dict[str, Any]] = None


class PracticeRequest(BaseModel):
    topic_id: str
    target_difficulty: int = Field(default=2, ge=1, le=5)
    exam_mode: bool = False


class CheckRequest(BaseModel):
    task_id: str
    topic_id: str
    user_answer: Any
    user_id: int = 1


class CheckResponse(BaseModel):
    correct: bool
    feedback: str
    xp_awarded: int
    mastery_delta: float


class TopicMiniTheory(BaseModel):
    id: str
    title: str
    summary: str
    objectives: list[str]
    recommended_path: list[str]


class TopicDetail(TopicMiniTheory):
    theory_points: list[str]
    examples: list[str]
    practice_outline: list[str]
    exam_reference: str


class ProgressEntry(BaseModel):
    topic_id: str
    mastery: float
    completed_lessons: int
    best_score: float
    xp_earned: int


class ProgressPayload(BaseModel):
    user_id: int
    xp: int
    streak: int
    last_active: date
    daily_goal_minutes: int
    progress: list[ProgressEntry]


class ProgressUpdate(BaseModel):
    user_id: int
    topic_id: str
    correct: bool
    difficulty: int
    time_spent_seconds: int


class UserSettingsUpdate(BaseModel):
    user_id: int
    preferred_language: str


class DailyGoalUpdate(BaseModel):
    user_id: int
    minutes: int


class Message(BaseModel):
    message: str
