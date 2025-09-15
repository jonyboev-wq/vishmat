from __future__ import annotations

from datetime import date

from sqlmodel import select

from .database import get_session
from .models import TopicProgress, User


DEFAULT_USER_EMAIL = "student@example.com"


def get_or_create_demo_user() -> User:
    with get_session() as session:
        user = session.exec(select(User).where(User.email == DEFAULT_USER_EMAIL)).first()
        if not user:
            user = User(email=DEFAULT_USER_EMAIL, display_name="Demo Student")
            session.add(user)
            session.commit()
            session.refresh(user)
        return user


def update_user_settings(user_id: int, preferred_language: str) -> User:
    with get_session() as session:
        user = session.get(User, user_id)
        if not user:
            raise ValueError("User not found")
        user.preferred_language = preferred_language
        session.add(user)
        session.commit()
        session.refresh(user)
        return user


def update_daily_goal(user_id: int, minutes: int) -> User:
    with get_session() as session:
        user = session.get(User, user_id)
        if not user:
            raise ValueError("User not found")
        user.daily_goal_minutes = minutes
        session.add(user)
        session.commit()
        session.refresh(user)
        return user


def upsert_progress(
    *,
    user_id: int,
    topic_id: str,
    correct: bool,
    difficulty: int,
    time_spent_seconds: int,
) -> tuple[User, TopicProgress, dict[str, float]]:
    mastery_gain = 0.05 * difficulty if correct else 0.01
    xp_gain = 20 * difficulty if correct else 5

    with get_session() as session:
        user = session.get(User, user_id)
        if not user:
            raise ValueError("User not found")

        progress = session.exec(
            select(TopicProgress).where(
                TopicProgress.user_id == user_id,
                TopicProgress.topic_id == topic_id,
            )
        ).first()
        if not progress:
            progress = TopicProgress(user_id=user_id, topic_id=topic_id)
            session.add(progress)
            session.flush()

        progress.completed_lessons += 1
        progress.mastery = min(1.0, progress.mastery + mastery_gain)
        if correct:
            progress.best_score = max(progress.best_score, mastery_gain * 20)
        progress.xp_earned += xp_gain

        today = date.today()
        if user.last_active == today:
            user.streak += 1 if correct else 0
        else:
            user.streak = 1 if correct else 0
        user.last_active = today
        user.xp += xp_gain

        session.add(progress)
        session.add(user)
        session.commit()
        session.refresh(progress)
        session.refresh(user)

        return user, progress, {"xp_gain": xp_gain, "mastery_gain": mastery_gain}


def get_progress_payload(user_id: int) -> dict:
    with get_session() as session:
        user = session.get(User, user_id)
        if not user:
            raise ValueError("User not found")
        progress_entries = session.exec(
            select(TopicProgress).where(TopicProgress.user_id == user_id)
        ).all()
        return {
            "user_id": user.id,
            "xp": user.xp,
            "streak": user.streak,
            "last_active": user.last_active,
            "daily_goal_minutes": user.daily_goal_minutes,
            "progress": [
                {
                    "topic_id": entry.topic_id,
                    "mastery": entry.mastery,
                    "completed_lessons": entry.completed_lessons,
                    "best_score": entry.best_score,
                    "xp_earned": entry.xp_earned,
                }
                for entry in progress_entries
            ],
        }
