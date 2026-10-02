<script setup>
import AppIcon from "./AppIcon.vue";
defineProps({ categories: { type: Array, required: true } });
const query = defineModel("query", { type: String, required: true });
const category = defineModel("category", { type: String, required: true });
const stockFilter = defineModel("stockFilter", {
  type: String,
  required: true,
});
const sortAscending = defineModel("sortAscending", {
  type: Boolean,
  required: true,
});
</script>

<template>
  <div class="toolbar">
    <label class="search-field"
      ><AppIcon name="search" :size="19" /><input
        v-model="query"
        type="search"
        aria-label="Cari judul atau penulis"
        placeholder="Cari judul buku atau penulis…"
    /></label>
    <div class="filter-controls">
      <label class="select-wrap"
        ><select v-model="category" aria-label="Filter kategori">
          <option value="">Semua kategori</option>
          <option v-for="name in categories" :key="name">
            {{ name }}
          </option></select
        ><AppIcon name="down" :size="14"
      /></label>
      <label class="select-wrap"
        ><select v-model="stockFilter" aria-label="Filter status stok">
          <option value="">Semua status</option>
          <option value="available">Tersedia</option>
          <option value="low">Menipis</option>
          <option value="empty">Stok Habis</option>
          <option value="attention">Perlu perhatian</option></select
        ><AppIcon name="down" :size="14"
      /></label>
      <button
        class="button sort-button"
        :aria-label="`Urutkan judul ${sortAscending ? 'Z–A' : 'A–Z'}`"
        @click="sortAscending = !sortAscending"
      >
        <AppIcon name="sort" :size="17" />{{ sortAscending ? "A–Z" : "Z–A" }}
      </button>
    </div>
  </div>
</template>
