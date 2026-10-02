<script setup>
import { computed } from "vue";
import AppIcon from "./AppIcon.vue";
import { LOW_STOCK, number } from "../utils/books";
const props = defineProps({
  books: { type: Array, required: true },
  loading: Boolean,
  loadError: String,
});
// Statistik selalu dihitung dari seluruh koleksi, bukan hasil filter.
const totalBooks = computed(() => props.books.length);
const lowStockCount = computed(
  () => props.books.filter((book) => book.stok <= LOW_STOCK).length,
);
const categoryCount = computed(
  () => new Set(props.books.map((book) => book.kategori)).size,
);
const totalCopies = computed(() =>
  props.books.reduce((total, book) => total + book.stok, 0),
);
</script>

<template>
  <section
    class="stats-grid"
    aria-label="Statistik koleksi"
    :aria-busy="loading"
  >
    <article class="stat-card">
      <div class="stat-top">
        <span>Total Buku</span
        ><span class="stat-icon sand"><AppIcon name="book" /></span>
      </div>
      <strong data-testid="total-books">{{
        loading || loadError ? "—" : number(totalBooks)
      }}</strong>
      <p>Judul dalam koleksi <span class="stat-mini">buku</span></p>
    </article>
    <article class="stat-card">
      <div class="stat-top">
        <span>Stok Menipis + Habis</span
        ><span class="stat-icon amber"><AppIcon name="alert" /></span>
      </div>
      <strong data-testid="low-stock">{{
        loading || loadError ? "—" : number(lowStockCount)
      }}</strong>
      <p>
        Perlu perhatian
        <span class="stat-mini amber-text">≤ {{ LOW_STOCK }} stok</span>
      </p>
    </article>
    <article class="stat-card">
      <div class="stat-top">
        <span>Jumlah Kategori</span
        ><span class="stat-icon clay"><AppIcon name="layers" /></span>
      </div>
      <strong data-testid="categories">{{
        loading || loadError ? "—" : number(categoryCount)
      }}</strong>
      <p>Ragam pengetahuan <span class="stat-mini">kategori</span></p>
    </article>
    <article class="stat-card">
      <div class="stat-top">
        <span>Total Eksemplar</span
        ><span class="stat-icon taupe"><AppIcon name="library" /></span>
      </div>
      <strong data-testid="total-copies">{{
        loading || loadError ? "—" : number(totalCopies)
      }}</strong>
      <p>Jumlah seluruh stok <span class="stat-mini">eks.</span></p>
    </article>
  </section>
</template>
