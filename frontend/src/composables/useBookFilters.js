import { computed, ref, watch } from "vue";
import { LOW_STOCK, stockStatus } from "../utils/books";

export function useBookFilters(getBooks, getCategories) {
  const query = ref("");
  const category = ref("");
  const stockFilter = ref("");
  const sortAscending = ref(true);
  const page = ref(1);
  const pageSize = 10;
  // Rantai computed: pencarian/filter → pengurutan judul → halaman aktif.
  const filteredBooks = computed(() => {
    const term = query.value.trim().toLocaleLowerCase("id");
    return getBooks().filter(
      (book) =>
        (book.judul.toLocaleLowerCase("id").includes(term) ||
          book.penulis.toLocaleLowerCase("id").includes(term)) &&
        (!category.value || book.kategori === category.value) &&
        (!stockFilter.value ||
          (stockFilter.value === "attention"
            ? book.stok <= LOW_STOCK
            : stockStatus(book.stok) === stockFilter.value)),
    );
  });
  const sortedBooks = computed(() =>
    [...filteredBooks.value].sort(
      (a, b) =>
        (sortAscending.value ? 1 : -1) * a.judul.localeCompare(b.judul, "id"),
    ),
  );
  const pageCount = computed(() =>
    Math.max(1, Math.ceil(sortedBooks.value.length / pageSize)),
  );
  const visibleBooks = computed(() =>
    sortedBooks.value.slice((page.value - 1) * pageSize, page.value * pageSize),
  );
  const firstResult = computed(() =>
    sortedBooks.value.length ? (page.value - 1) * pageSize + 1 : 0,
  );
  const lastResult = computed(() =>
    Math.min(page.value * pageSize, sortedBooks.value.length),
  );
  const hasFilters = computed(() =>
    Boolean(query.value || category.value || stockFilter.value),
  );

  watch([query, category, stockFilter, sortAscending], () => {
    page.value = 1;
  });
  watch(pageCount, (count) => {
    page.value = Math.min(page.value, count);
  });

  watch(getCategories, (names) => {
    if (category.value && !names.includes(category.value)) category.value = "";
  });
  function resetFilters() {
    query.value = "";
    category.value = "";
    stockFilter.value = "";
  }

  function reset() {
    resetFilters();
    page.value = 1;
  }
  function showAttention() {
    reset();
    stockFilter.value = "attention";
  }
  return {
    query,
    category,
    stockFilter,
    sortAscending,
    page,
    sortedBooks,
    pageCount,
    visibleBooks,
    firstResult,
    lastResult,
    hasFilters,
    resetFilters,
    reset,
    showAttention,
  };
}
