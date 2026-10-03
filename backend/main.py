import json
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Annotated

from fastapi import FastAPI, HTTPException, Path as PathParam, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field, StringConstraints

Text = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=160)]
Category = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=60)]
BookId = Annotated[int, PathParam(gt=0)]


class BookCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    judul: Text = Field(description="Judul buku, wajib diisi.")
    penulis: Text = Field(description="Nama penulis, wajib diisi.")
    kategori: Category = Field(description="Kategori buku, wajib diisi.")
    stok: int = Field(strict=True, ge=0, le=1_000_000, description="Jumlah eksemplar, bilangan bulat 0–1.000.000.")


class Book(BookCreate):
    id: int = Field(strict=True, gt=0, description="ID unik yang dibuat oleh server.")


class ErrorResponse(BaseModel):
    detail: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_path = Path(__file__).with_name("seed.json")
    app.state.books = [Book.model_validate(row) for row in json.loads(seed_path.read_text(encoding="utf-8"))]
    ids = [book.id for book in app.state.books]
    if len(set(ids)) != len(ids):
        raise ValueError("ID pada seed.json harus unik.")
    app.state.next_id = max(ids, default=0) + 1
    yield


app = FastAPI(
    title="Ruang Baca — API Perpustakaan",
    description="UTS Soal A (NIM ganjil). Koleksi buku in-memory, diinisialisasi dari JSON pada setiap startup. Perubahan hilang saat server dimulai ulang.",
    version="1.0.0",
    lifespan=lifespan,
    openapi_tags=[{"name": "Buku", "description": "Lihat, tambah, ubah, dan hapus koleksi perpustakaan."}],
)

origins = os.getenv("CORS_ORIGINS", "http://localhost:5174,http://127.0.0.1:5174,http://localhost:4173,http://127.0.0.1:4173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in origins.split(",") if origin.strip()],
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type"],
)


@app.get("/api/books", response_model=list[Book], tags=["Buku"], summary="Ambil seluruh buku")
async def list_books():
    """Kembalikan seluruh koleksi; pencarian, pengurutan, dan statistik dihitung di Vue."""
    return app.state.books


@app.post("/api/books", response_model=Book, status_code=status.HTTP_201_CREATED, tags=["Buku"], summary="Tambah buku")
async def create_book(payload: BookCreate):
    """Buat buku dengan ID otomatis yang tidak digunakan ulang setelah penghapusan."""
    book = Book(id=app.state.next_id, **payload.model_dump())
    app.state.next_id += 1
    app.state.books.append(book)
    return book


def find_book_index(book_id: int) -> int:
    for index, book in enumerate(app.state.books):
        if book.id == book_id:
            return index
    raise HTTPException(status_code=404, detail="Buku tidak ditemukan.")


@app.put("/api/books/{book_id}", response_model=Book, tags=["Buku"], summary="Ubah buku", responses={404: {"model": ErrorResponse}})
async def update_book(book_id: BookId, payload: BookCreate):
    """Ganti seluruh field buku, termasuk stok; ID tetap sama."""
    index = find_book_index(book_id)
    book = Book(id=book_id, **payload.model_dump())
    app.state.books[index] = book
    return book


@app.delete("/api/books/{book_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Buku"], summary="Hapus buku", responses={404: {"model": ErrorResponse}})
async def delete_book(book_id: BookId):
    """Hapus buku dari koleksi di memori dan kembalikan respons tanpa body."""
    app.state.books.pop(find_book_index(book_id))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
