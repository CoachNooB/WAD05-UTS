import { expect, test } from "@playwright/test";

const api = "http://127.0.0.1:8001/api/books";
const collection = (page) => page.locator("#collection");

test("search, sorting, filters, pagination, and computed totals", async ({
  page,
  request,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const books = await (await request.get(api)).json();
  await page.goto("/");
  await expect(page.getByTestId("total-books")).toHaveText(
    String(books.length),
  );
  await expect(page.getByTestId("low-stock")).toHaveText(
    String(books.filter((book) => book.stok <= 3).length),
  );
  await expect(page.getByTestId("categories")).toHaveText(
    String(new Set(books.map((book) => book.kategori)).size),
  );
  await expect(page.getByTestId("total-copies")).toHaveText(
    new Intl.NumberFormat("id-ID").format(
      books.reduce((sum, book) => sum + book.stok, 0),
    ),
  );
  const sorted = [...books].sort((a, b) =>
    a.judul.localeCompare(b.judul, "id"),
  );
  await expect(page.locator("tbody tr").first()).toContainText(sorted[0].judul);
  await page.getByRole("button", { name: "Halaman berikutnya" }).click();
  await expect(page.locator("tbody tr").first()).toContainText(sorted[8].judul);
  await page.getByRole("button", { name: "Urutkan judul Z–A" }).click();
  await expect(page.locator("tbody tr").first()).toContainText(
    sorted.at(-1).judul,
  );
  const search = page.getByRole("searchbox");
  await search.fill("NADIA");
  await expect(page.locator("tbody tr")).toHaveCount(2);
  await expect(page.getByTestId("total-books")).toHaveText(
    String(books.length),
  );
  await search.fill("buku-tidak-ada-123");
  await expect(
    page.getByText("Buku tidak ditemukan", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset pencarian" }).click();
  await page.getByLabel("Filter status stok").selectOption("empty");
  await expect(page.locator("tbody tr")).toHaveCount(
    books.filter((book) => book.stok === 0).length,
  );
  await expect(page.locator("tbody .status-empty")).toHaveCount(
    books.filter((book) => book.stok === 0).length,
  );
  await page.getByRole("button", { name: "Reset filter" }).click();
  await page.getByLabel("Filter kategori").selectOption("Teknologi");
  await expect(page.locator("tbody tr")).toHaveCount(4);
  expect(errors).toEqual([]);
});

test("add, edit stock thresholds, cancel deletion, and delete through the API", async ({
  page,
  request,
}) => {
  const original = await (await request.get(api)).json();
  const title = `Buku Pengujian Browser ${Date.now()}`;
  let createdId;
  try {
    await page.goto("/");
    await expect(page.getByTestId("total-books")).toHaveText(
      String(original.length),
    );
    await page
      .getByRole("button", { name: "Tambah Buku", exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Judul buku").fill(title);
    await dialog.getByLabel("Penulis").fill("Penulis Pengujian");
    await dialog.getByLabel("Kategori").fill("Kategori Uji");
    await dialog.getByLabel("Stok (eksemplar)").fill("4");
    await dialog
      .getByRole("button", { name: "Tambah buku", exact: true })
      .click();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByTestId("total-books")).toHaveText(
      String(original.length + 1),
    );
    let books = await (await request.get(api)).json();
    const created = books.find((book) => book.judul === title);
    createdId = created.id;
    expect(created.stok).toBe(4);
    await page.getByRole("searchbox").fill(title);
    await expect(page.locator("tbody .status-available")).toHaveText(
      "Tersedia",
    );
    for (const [stock, status] of [
      ["3", "Menipis"],
      ["0", "Stok Habis"],
    ]) {
      await page
        .getByRole("button", { name: `Edit ${title}`, exact: true })
        .click();
      await dialog.getByLabel("Stok (eksemplar)").fill(stock);
      await dialog.getByRole("button", { name: "Simpan perubahan" }).click();
      await expect(dialog).not.toBeVisible();
      await expect(page.locator("tbody .status-badge")).toHaveText(status);
      books = await (await request.get(api)).json();
      expect(books.find((book) => book.id === createdId).stok).toBe(
        Number(stock),
      );
    }
    await page
      .getByRole("button", { name: `Hapus ${title}`, exact: true })
      .click();
    await dialog.getByRole("button", { name: "Batal", exact: true }).click();
    await expect(page.locator("tbody tr")).toHaveCount(1);
    await page
      .getByRole("button", { name: `Hapus ${title}`, exact: true })
      .click();
    await dialog.getByRole("button", { name: "Ya, hapus buku" }).click();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByTestId("total-books")).toHaveText(
      String(original.length),
    );
    expect(
      (await (await request.get(api)).json()).some(
        (book) => book.id === createdId,
      ),
    ).toBe(false);
  } finally {
    // Hapus hanya buku milik test; seed pengguna tidak disentuh.
    const books = await (await request.get(api)).json();
    for (const book of books.filter((book) => book.judul === title)) {
      await request.delete(`${api}/${book.id}`);
    }
  }
});

test("loading, failure, retry, and empty collection states", async ({
  page,
}) => {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route("**/api/books", async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto("/");
  await expect(
    page.getByText("Memuat koleksi buku…", { exact: true }),
  ).toBeVisible();
  release();
  await expect(page.locator("tbody tr")).toHaveCount(8);
  await page.unroute("**/api/books");
  await page.route("**/api/books", (route) => route.abort());
  await page.getByRole("button", { name: "Muat ulang koleksi" }).click();
  await expect(page.getByText("Koleksi belum dapat dimuat")).toBeVisible();
  await page.unroute("**/api/books");
  await page.getByRole("button", { name: "Coba lagi" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(8);
  await page.route("**/api/books", (route) => route.fulfill({ json: [] }));
  await page.getByRole("button", { name: "Muat ulang koleksi" }).click();
  await expect(page.getByText("Rak buku masih kosong")).toBeVisible();
  await expect(page.getByTestId("total-copies")).toHaveText("0");
});

test("failed mutation keeps the form and entered values for retry", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("tbody tr")).toHaveCount(8);
  await page.getByRole("button", { name: "Tambah Buku", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Judul buku").fill("Tetap di Form");
  await dialog.getByLabel("Penulis").fill("Penulis Uji");
  await dialog.getByLabel("Kategori").fill("Fiksi");
  await page.route("**/api/books", (route) =>
    route.request().method() === "POST" ? route.abort() : route.continue(),
  );
  await dialog
    .getByRole("button", { name: "Tambah buku", exact: true })
    .click();
  await expect(dialog.getByRole("alert")).toContainText(
    "Tidak dapat terhubung",
  );
  await expect(dialog.getByLabel("Judul buku")).toHaveValue("Tetap di Form");
  await dialog.getByRole("button", { name: "Batal" }).click();
});

for (const width of [375, 768, 1024, 1440]) {
  test(`responsive layout and usable form at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.locator("tbody tr")).toHaveCount(8);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await expect(collection(page).getByRole("searchbox")).toBeVisible();
    await page.getByRole("searchbox").fill("Algoritma");
    await expect(page.locator("tbody tr")).toHaveCount(1);
    await page
      .getByRole("button", {
        name: "Edit Algoritma di Balik Secangkir Kopi",
        exact: true,
      })
      .click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const bounds = await dialog.boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
    await dialog.getByRole("button", { name: "Batal" }).click();
  });
}
