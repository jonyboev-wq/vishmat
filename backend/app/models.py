from datetime import date
from typing import List, Optional

from sqlmodel import Field, Relationship, SQLModel


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    display_name: str
    xp: int = Field(default=0)
    streak: int = Field(default=0)
    last_active: date = Field(default_factory=date.today)
    daily_goal_minutes: int = Field(default=10)
    preferred_language: str = Field(default="ru")

    progress: List["TopicProgress"] = Relationship(back_populates="user")


class TopicProgress(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    topic_id: str
    mastery: float = Field(default=0.0)
    completed_lessons: int = Field(default=0)
    best_score: float = Field(default=0.0)
    xp_earned: int = Field(default=0)

    user: "User" = Relationship(back_populates="progress")
