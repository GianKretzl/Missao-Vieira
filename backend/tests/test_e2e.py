import importlib
import os
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from psycopg import connect


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


def _cleanup_database(db_url: str) -> None:
    with connect(db_url, autocommit=True) as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM submissions")


@pytest.fixture
def client():
    test_db_url = os.getenv("TEST_DATABASE_URL")
    if not test_db_url:
        pytest.skip("Defina TEST_DATABASE_URL para executar o teste E2E com PostgreSQL")

    os.environ["DATABASE_URL"] = test_db_url

    import main

    importlib.reload(main)
    main.init_db()
    _cleanup_database(test_db_url)

    with TestClient(main.app) as api_client:
        yield api_client

    _cleanup_database(test_db_url)


def test_e2e_system_integrity(client: TestClient):
    health = client.get("/api/health")
    assert health.status_code == 200
    health_json = health.json()
    assert health_json["status"] == "ok"
    assert health_json["database"] == "ok"

    login = client.post(
        "/api/admin/login",
        json={"username": "admin", "password": "missaovieira"},
    )
    assert login.status_code == 200
    assert login.json()["success"] is True

    chat = client.post(
        "/api/chat",
        json={
            "message": "Gosto de montar máquinas e trabalhar com ferramentas",
            "turn_count": 0,
            "history": [],
        },
    )
    assert chat.status_code == 200
    chat_json = chat.json()
    assert isinstance(chat_json["reply"], str)
    assert "scores" in chat_json
    assert chat_json["scores"]["eletromecanica"] >= 3

    payload = {
        "studentInfo": {
            "fullName": "Ana Integracao",
            "classGroup": "9ºA",
            "phone": "62999990000",
            "guardianName": "Maria Integracao",
        },
        "topPath": "eletromecanica",
        "topPathTitle": "Técnico em Eletromecânica",
        "matchPercentage": 91,
        "scores": {"regular": 4, "administracao": 2, "eletromecanica": 12},
    }

    create_1 = client.post("/api/submissions", json=payload)
    assert create_1.status_code == 200
    assert create_1.json()["success"] is True
    assert create_1.json()["totalSubmissions"] == 1

    fetch_1 = client.get("/api/submissions")
    assert fetch_1.status_code == 200
    data_1 = fetch_1.json()
    assert len(data_1) == 1
    assert data_1[0]["studentInfo"]["fullName"] == "Ana Integracao"

    updated_payload = {
        **payload,
        "matchPercentage": 95,
        "scores": {"regular": 5, "administracao": 3, "eletromecanica": 16},
    }

    create_2 = client.post("/api/submissions", json=updated_payload)
    assert create_2.status_code == 200
    assert create_2.json()["totalSubmissions"] == 1

    fetch_2 = client.get("/api/submissions")
    assert fetch_2.status_code == 200
    data_2 = fetch_2.json()
    assert len(data_2) == 1
    assert data_2[0]["matchPercentage"] == 95
    assert data_2[0]["scores"]["eletromecanica"] == 16

    clear = client.delete("/api/submissions")
    assert clear.status_code == 200
    assert clear.json()["success"] is True

    fetch_3 = client.get("/api/submissions")
    assert fetch_3.status_code == 200
    assert fetch_3.json() == []
