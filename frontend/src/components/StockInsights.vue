<script setup>
import { computed } from "vue";
import AppIcon from "./AppIcon.vue";
import { LOW_STOCK, number } from "../utils/books";
const props = defineProps({
  books: { type: Array, required: true },
  loading: Boolean,
  loadError: String,
});
defineEmits(["attention"]);
const availableCount = computed(
  () => props.books.filter((book) => book.stok > LOW_STOCK).length,
);
const emptyCount = computed(
  () => props.books.filter((book) => book.stok === 0).length,
);
const categoryStock = computed(() => {
  const totals = props.books.reduce((result, book) => {
    result[book.kategori] = (result[book.kategori] || 0) + book.stok;
    return result;
  }, Object.create(null));
  const maximum = Math.max(1, ...Object.values(totals));
  return Object.entries(totals)
    .map(([name, stock]) => ({ name, stock, width: (stock / maximum) * 100 }))
    .sort((a, b) => b.stock - a.stock || a.name.localeCompare(b.name, "id"));
});
</script>

<template>
  <section id="insights" class="insights-grid" aria-label="Ringkasan stok">
    <article class="panel chart-panel">
      <div class="panel-heading">
        <div>
          <h2>Di balik koleksi</h2>
          <p>Ringkasan stok per kategori</p>
        </div>
        <span class="subtle-label">EKSEMPLAR</span>
      </div>
      <div v-if="loading || loadError" class="insight-placeholder">
        {{ loading ? "Memuat ringkasan…" : "Ringkasan belum tersedia." }}
      </div>
      <div v-else-if="!categoryStock.length" class="insight-placeholder">
        Tambahkan buku untuk melihat ringkasan.
      </div>
      <div v-else class="bar-chart">
        <div
          v-for="(item, index) in categoryStock"
          :key="item.name"
          class="bar-row"
        >
          <span>{{ item.name }}</span>
          <div class="bar-track">
            <div
              class="bar-fill"
              :class="`bar-color-${index % 3}`"
              :style="{ width: `${item.width}%` }"
            ></div>
          </div>
          <strong>{{ number(item.stock) }}</strong>
        </div>
      </div>
    </article>
    <article class="stock-note">
      <div class="stock-note-heading">
        <span class="note-icon"><AppIcon name="book" :size="22" /></span
        ><span>RAK YANG TERAWAT</span
        ><span class="decorative-spark" aria-hidden="true">✧</span>
      </div>
      <h2>Koleksi siap.<br />Cerita berlanjut.</h2>
      <p v-if="!loading && !loadError">
        <strong>{{ availableCount }} judul</strong> memiliki stok yang cukup
        untuk menemani rasa ingin tahu pembaca.
      </p>
      <p v-else>
        Pantau ketersediaan buku agar setiap pembaca menemukan cerita
        berikutnya.
      </p>
      <div class="stock-note-footer">
        <span
          ><span class="tiny-dot"></span
          >{{
            !loading && !loadError
              ? `${emptyCount} judul kehabisan stok`
              : "Pantau stok koleksimu"
          }}</span
        ><button
          aria-label="Lihat buku dengan stok menipis atau habis"
          title="Lihat buku yang perlu perhatian"
          @click="$emit('attention')"
        >
          <AppIcon name="arrow" :size="20" />
        </button>
      </div>
    </article>
  </section>
</template>
