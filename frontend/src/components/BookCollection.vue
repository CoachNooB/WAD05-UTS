<script setup>
import AppIcon from "./AppIcon.vue";
import BookToolbar from "./BookToolbar.vue";
import BookTable from "./BookTable.vue";
import { useBookFilters } from "../composables/useBookFilters";
const props = defineProps({
  books: { type: Array, required: true },
  categories: { type: Array, required: true },
  loading: Boolean,
  loadError: String,
});
defineEmits(["refresh", "add", "edit", "delete"]);
const {
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
} = useBookFilters(
  () => props.books,
  () => props.categories,
);
// Parent dapat mengarahkan koleksi ke semua buku atau buku yang perlu perhatian.
defineExpose({ reset, showAttention });
</script>

<template>
  <section
    id="collection"
    class="panel collection-panel"
    aria-labelledby="collection-title"
  >
    <div class="panel-heading">
      <div class="section-title">
        <h2 id="collection-title">Koleksi buku</h2>
        <span class="count-pill">{{ books.length }} judul</span>
        <p>Temukan dan kelola seluruh buku perpustakaan.</p>
      </div>
      <button
        class="icon-button refresh-button"
        :disabled="loading"
        aria-label="Muat ulang koleksi"
        title="Muat ulang koleksi"
        @click="$emit('refresh')"
      >
        <AppIcon name="refresh" :class="{ spinning: loading }" />
      </button>
    </div>
    <BookToolbar
      :categories="categories"
      v-model:query="query"
      v-model:category="category"
      v-model:stock-filter="stockFilter"
      v-model:sort-ascending="sortAscending"
    />
    <div v-if="hasFilters" class="filter-summary">
      <span>{{ sortedBooks.length }} buku sesuai filter</span
      ><button class="text-button" @click="resetFilters">
        Reset filter <AppIcon name="close" :size="13" />
      </button>
    </div>

    <div v-if="loading" class="state-panel" role="status">
      <span class="loader"></span>
      <h3>Memuat koleksi buku…</h3>
      <p>Sebentar, kami sedang menyiapkan rakmu.</p>
    </div>
    <div v-else-if="loadError" class="state-panel error-state" role="alert">
      <span class="state-icon"><AppIcon name="alert" :size="28" /></span>
      <h3>Koleksi belum dapat dimuat</h3>
      <p>{{ loadError }}</p>
      <button class="button button-primary" @click="$emit('refresh')">
        <AppIcon name="refresh" :size="16" /> Coba lagi
      </button>
    </div>
    <div v-else-if="!sortedBooks.length" class="state-panel" role="status">
      <span class="state-icon"
        ><AppIcon :name="hasFilters ? 'search' : 'book'" :size="30"
      /></span>
      <h3>
        {{ hasFilters ? "Buku tidak ditemukan" : "Rak buku masih kosong" }}
      </h3>
      <p>
        {{
          hasFilters
            ? "Coba kata kunci lain atau ubah filter pencarianmu."
            : "Mulai koleksimu dengan menambahkan buku pertama."
        }}
      </p>
      <button
        class="button button-primary"
        @click="hasFilters ? resetFilters() : $emit('add')"
      >
        {{ hasFilters ? "Reset pencarian" : "Tambah buku pertama" }}
      </button>
    </div>
    <BookTable
      v-else
      :books="visibleBooks"
      :first-result="firstResult"
      :sort-ascending="sortAscending"
      @edit="$emit('edit', $event)"
      @delete="$emit('delete', $event)"
    />
    <div
      v-if="!loading && !loadError && sortedBooks.length"
      class="table-footer"
    >
      <p>
        Menampilkan
        <strong>{{ firstResult }}–{{ lastResult }}</strong> dari
        <strong>{{ sortedBooks.length }}</strong> buku
      </p>
      <nav class="pagination" aria-label="Halaman koleksi">
        <button
          class="page-button"
          :disabled="page === 1"
          aria-label="Halaman sebelumnya"
          @click="page--"
        >
          <AppIcon name="chevron" class="flip" :size="16" /></button
        ><span class="page-indicator"
          >{{ page }} <span>/ {{ pageCount }}</span></span
        ><button
          class="page-button"
          :disabled="page === pageCount"
          aria-label="Halaman berikutnya"
          @click="page++"
        >
          <AppIcon name="chevron" :size="16" />
        </button>
      </nav>
    </div>
  </section>
</template>
