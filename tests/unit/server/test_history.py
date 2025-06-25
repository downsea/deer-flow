import os
from fastapi.testclient import TestClient
import tempfile

from src.server.app import app
from src.server.history_db import init_db


def client_with_tmp_db(tmp_path):
    db_path = tmp_path / "history.db"
    os.environ["HISTORY_DB_PATH"] = str(db_path)
    init_db()
    return TestClient(app)


def test_history_endpoints(tmp_path):
    client = client_with_tmp_db(tmp_path)
    data = {
        "id": "t1",
        "title": "Test",
        "messages": [
            {"id": "m1", "role": "user", "content": "hi"},
            {"id": "m2", "role": "assistant", "content": "hello"},
        ],
    }
    resp = client.post("/api/history", json=data)
    assert resp.status_code == 200

    resp = client.get("/api/history")
    assert resp.status_code == 200
    assert any(t["id"] == "t1" for t in resp.json())

    resp = client.get("/api/history/t1")
    assert resp.status_code == 200
    msgs = resp.json()
    assert len(msgs) == 2
    assert msgs[0]["id"] == "m1"
