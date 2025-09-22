from __future__ import annotations

import os
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

from platformdirs import user_data_dir
from sqlmodel import Session, SQLModel, create_engine


def _resolve_database_file() -> Path:
    custom_dir = os.getenv("VISHMAT_DATA_DIR")
    if custom_dir:
        root = Path(custom_dir).expanduser()
    else:
        root = Path(user_data_dir(appname="VishMatTrainer", appauthor="VishMat"))
    root.mkdir(parents=True, exist_ok=True)
    return (root / "app.db").resolve()


DATABASE_FILE = _resolve_database_file()
DATABASE_URL = f"sqlite:///{DATABASE_FILE}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})


def init_db() -> None:
    SQLModel.metadata.create_all(bind=engine)


@contextmanager
def get_session() -> Iterator[Session]:
    with Session(engine) as session:
        yield session
