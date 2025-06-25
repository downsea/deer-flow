import os
import sqlite3
from pathlib import Path
from typing import List, Dict, Any

DB_PATH = Path(os.environ.get("HISTORY_DB_PATH", Path(__file__).parent / "history.db"))


def init_db() -> None:
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        "CREATE TABLE IF NOT EXISTS threads(id TEXT PRIMARY KEY, title TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
    )
    c.execute(
        "CREATE TABLE IF NOT EXISTS messages(id TEXT PRIMARY KEY, thread_id TEXT, role TEXT, agent TEXT, content TEXT, FOREIGN KEY(thread_id) REFERENCES threads(id))"
    )
    conn.commit()
    conn.close()


def save_thread(thread_id: str, title: str, messages: List[Dict[str, Any]]) -> None:
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        "INSERT OR REPLACE INTO threads(id, title) VALUES (?, ?)",
        (thread_id, title),
    )
    for m in messages:
        c.execute(
            "INSERT OR REPLACE INTO messages(id, thread_id, role, agent, content) VALUES (?, ?, ?, ?, ?)",
            (
                m.get("id"),
                thread_id,
                m.get("role"),
                m.get("agent"),
                m.get("content"),
            ),
        )
    conn.commit()
    conn.close()


def list_threads() -> List[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, title, created_at FROM threads ORDER BY created_at DESC")
    rows = c.fetchall()
    conn.close()
    return [{"id": row[0], "title": row[1], "created_at": row[2]} for row in rows]


def get_thread(thread_id: str) -> List[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        "SELECT id, role, agent, content FROM messages WHERE thread_id=? ORDER BY rowid",
        (thread_id,),
    )
    rows = c.fetchall()
    conn.close()
    return [
        {"id": row[0], "role": row[1], "agent": row[2], "content": row[3]}
        for row in rows
    ]
