from __future__ import annotations

import socket
import threading
import time
from typing import Tuple

import uvicorn
import webview

from backend.app import app as fastapi_app

SERVER_HOST = "127.0.0.1"
SERVER_PORT = 8321
_SERVER_READY_TIMEOUT = 20.0


def _wait_for_server(host: str, port: int, timeout: float) -> None:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with socket.create_connection((host, port), timeout=1.0):
                return
        except OSError:
            time.sleep(0.1)
    raise RuntimeError("Не удалось запустить встроенный API-сервер")


def start_backend() -> Tuple[uvicorn.Server, threading.Thread]:
    config = uvicorn.Config(
        fastapi_app,
        host=SERVER_HOST,
        port=SERVER_PORT,
        log_level="warning",
        reload=False,
    )
    server = uvicorn.Server(config=config)
    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()
    _wait_for_server(SERVER_HOST, SERVER_PORT, _SERVER_READY_TIMEOUT)
    return server, thread


def stop_backend(server: uvicorn.Server, thread: threading.Thread) -> None:
    server.should_exit = True
    thread.join(timeout=5)
    if thread.is_alive():
        server.force_exit = True
        thread.join(timeout=1)


def main() -> None:
    server, thread = start_backend()
    try:
        webview.create_window(
            title="VishMat Trainer",
            url=f"http://{SERVER_HOST}:{SERVER_PORT}",
            width=1280,
            height=720,
            resizable=True,
        )
        webview.start()
    finally:
        stop_backend(server, thread)


if __name__ == "__main__":
    main()
