import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from backend.main import app


@pytest.fixture
def client():
    # Lifespan me-reset seed agar perubahan pada satu test tidak bocor ke test lain.
    with TestClient(app) as test_client:
        yield test_client


def new_book(**changes):
    return {"judul": "Buku Uji", "penulis": "Penulis Uji", "kategori": "Pengujian", "stok": 5, **changes}


def test_seed_matches_json_and_has_twenty_unique_books(client):
    response = client.get("/api/books")
    assert response.status_code == 200
    books = response.json()
    expected = json.loads((Path(__file__).resolve().parents[1] / "seed.json").read_text(encoding="utf-8"))
    assert books == expected
    assert len(books) >= 20
    assert len({book["id"] for book in books}) == len(books)
    assert {0, 1, 3, 4}.issubset({book["stok"] for book in books})


def test_create_update_delete_and_never_reuse_id(client):
    initial = client.get("/api/books").json()
    created = client.post("/api/books", json=new_book(judul="  Buku Uji  "))
    assert created.status_code == 201
    book = created.json()
    assert book["judul"] == "Buku Uji"
    assert len(client.get("/api/books").json()) == len(initial) + 1
    updated = client.put(f'/api/books/{book["id"]}', json=new_book(stok=0))
    assert updated.status_code == 200
    assert updated.json()["stok"] == 0
    assert client.get("/api/books").json()[-1]["stok"] == 0
    deleted = client.delete(f'/api/books/{book["id"]}')
    assert deleted.status_code == 204
    assert deleted.content == b""
    assert client.get("/api/books").json() == initial
    next_book = client.post("/api/books", json=new_book()).json()
    assert next_book["id"] > book["id"]


@pytest.mark.parametrize("stock", ["5", "0", -1, 1.5, 3.0, True, None, 1_000_001])
def test_stock_rejects_non_integer_or_out_of_range_values(client, stock):
    assert client.post("/api/books", json=new_book(stok=stock)).status_code == 422
    assert client.put("/api/books/1", json=new_book(stok=stock)).status_code == 422


@pytest.mark.parametrize("field", ["judul", "penulis", "kategori", "stok"])
def test_required_fields(client, field):
    payload = new_book()
    del payload[field]
    assert client.post("/api/books", json=payload).status_code == 422


@pytest.mark.parametrize("field", ["judul", "penulis", "kategori"])
def test_whitespace_and_oversized_text_rejected(client, field):
    assert client.post("/api/books", json=new_book(**{field: "  "})).status_code == 422
    assert client.post("/api/books", json=new_book(**{field: "a" * 161})).status_code == 422


def test_unknown_fields_rejected(client):
    assert client.post("/api/books", json=new_book(id=999)).status_code == 422


def test_missing_book_and_invalid_id(client):
    assert client.put("/api/books/999999", json=new_book()).status_code == 404
    assert client.delete("/api/books/999999").status_code == 404
    assert client.delete("/api/books/0").status_code == 422
    assert client.delete("/api/books/not-a-number").status_code == 422


def test_cors_allows_local_frontend(client):
    response = client.options("/api/books", headers={
        "Origin": "http://localhost:5174",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
    })
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5174"
    rejected = client.options("/api/books", headers={
        "Origin": "https://unrelated.example", "Access-Control-Request-Method": "POST",
    })
    assert rejected.status_code == 400


def test_openapi_has_all_operations_and_response_schema(client):
    schema = client.get("/openapi.json").json()
    assert {"get", "post"}.issubset(schema["paths"]["/api/books"])
    assert {"put", "delete"}.issubset(schema["paths"]["/api/books/{book_id}"])
    assert schema["components"]["schemas"]["BookCreate"]["properties"]["stok"]["type"] == "integer"


def test_restart_restores_seed():
    with TestClient(app) as client:
        original = client.get("/api/books").json()
        client.post("/api/books", json=new_book())
    with TestClient(app) as client:
        assert client.get("/api/books").json() == original
