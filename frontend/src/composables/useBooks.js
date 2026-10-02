import { computed, ref } from "vue";
import { request } from "../api";

// Koleksi API tunggal dipakai oleh seluruh komponen dashboard.
export function useBooks() {
  const books = ref([]);
  const loading = ref(true);
  const loadError = ref("");
  const categories = computed(() =>
    [...new Set(books.value.map((book) => book.kategori))].sort((a, b) =>
      a.localeCompare(b, "id"),
    ),
  );
  async function loadBooks() {
    loading.value = true;
    loadError.value = "";
    try {
      books.value = await request("/api/books");
    } catch (error) {
      loadError.value = error.message;
    } finally {
      loading.value = false;
    }
  }

  return { books, loading, loadError, categories, loadBooks };
}
