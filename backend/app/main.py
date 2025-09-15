from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from . import crud
from .database import init_db
from .schemas import (
    CheckRequest,
    CheckResponse,
    DailyGoalUpdate,
    Message,
    PracticeRequest,
    ProgressPayload,
    ProgressUpdate,
    TaskPayload,
    TopicDetail,
    UserSettingsUpdate,
    Hint,
)
from .services import task_service
from .data.topics import Task

app = FastAPI(title="Differential Equations Trainer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    init_db()
    crud.get_or_create_demo_user()


def _task_to_payload(task: Task) -> TaskPayload:
    return TaskPayload(
        id=task.id,
        topic_id=task.topic_id,
        title=task.title,
        type=task.type,  # type: ignore[arg-type]
        prompt=task.prompt,
        difficulty=task.difficulty,
        hints=[Hint(**hint) for hint in task.hints],
        options=task.options,
        pairs=task.pairs,
        validation=task.validation,
    )


@app.get("/api/topics", response_model=list[TopicDetail])
def list_topics() -> list[TopicDetail]:
    return [TopicDetail(**topic) for topic in task_service.list_topics()]


@app.get("/api/topics/{topic_id}", response_model=TopicDetail)
def get_topic(topic_id: str) -> TopicDetail:
    topic = task_service.get_topic_detail(topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Тема не найдена")
    return TopicDetail(**topic)


@app.post("/api/practice/generate", response_model=TaskPayload)
def generate_task(payload: PracticeRequest) -> TaskPayload:
    task = task_service.generate_task(payload.topic_id, payload.target_difficulty)
    return _task_to_payload(task)


@app.post("/api/practice/check", response_model=CheckResponse)
def check_task(payload: CheckRequest) -> CheckResponse:
    task, correct, feedback = task_service.grade_answer(
        payload.task_id, payload.topic_id, payload.user_answer
    )
    _, _, deltas = crud.upsert_progress(
        user_id=payload.user_id,
        topic_id=task.topic_id,
        correct=correct,
        difficulty=task.difficulty,
        time_spent_seconds=60,
    )
    xp_awarded = int(deltas["xp_gain"])
    mastery_delta = float(deltas["mastery_gain"])
    return CheckResponse(
        correct=correct,
        feedback=feedback,
        xp_awarded=xp_awarded,
        mastery_delta=mastery_delta,
    )


@app.post("/api/progress/update", response_model=ProgressPayload)
def update_progress(payload: ProgressUpdate) -> ProgressPayload:
    crud.upsert_progress(
        user_id=payload.user_id,
        topic_id=payload.topic_id,
        correct=payload.correct,
        difficulty=payload.difficulty,
        time_spent_seconds=payload.time_spent_seconds,
    )
    data = crud.get_progress_payload(payload.user_id)
    return ProgressPayload(**data)


@app.get("/api/progress/{user_id}", response_model=ProgressPayload)
def get_progress(user_id: int) -> ProgressPayload:
    data = crud.get_progress_payload(user_id)
    return ProgressPayload(**data)


@app.post("/api/user/settings", response_model=Message)
def update_settings(payload: UserSettingsUpdate) -> Message:
    crud.update_user_settings(payload.user_id, payload.preferred_language)
    return Message(message="Настройки обновлены")


@app.post("/api/user/daily-goal", response_model=Message)
def update_goal(payload: DailyGoalUpdate) -> Message:
    crud.update_daily_goal(payload.user_id, payload.minutes)
    return Message(message="Цель обновлена")
