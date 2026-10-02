<script setup>
import AppIcon from "./AppIcon.vue";
import { LOW_STOCK, number, stockStatus, statusLabels } from "../utils/books";
defineProps({
  books: { type: Array, required: true },
  firstResult: { type: Number, required: true },
  sortAscending: Boolean,
});
defineEmits(["edit", "delete"]);
</script>

<template>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th scope="col" class="number-column">NO.</th>
          <th
            scope="col"
            class="title-column"
            :aria-sort="sortAscending ? 'ascending' : 'descending'"
          >
            BUKU <span>{{ sortAscending ? "↑" : "↓" }}</span>
          </th>
          <th scope="col">KATEGORI</th>
          <th scope="col" class="stock-column">STOK</th>
          <th scope="col">STATUS</th>
          <th scope="col" class="actions-column">AKSI</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(book, index) in books" :key="book.id">
          <td class="number-column">
            {{ String(firstResult + index).padStart(2, "0") }}
          </td>
          <td class="book-cell">
            <div class="book-info">
              <div
                class="book-cover"
                :class="`cover-${book.id % 6}`"
                aria-hidden="true"
              >
                <AppIcon name="book" :size="21" /><span>{{
                  book.judul.charAt(0)
                }}</span>
              </div>
              <div>
                <strong>{{ book.judul }}</strong
                ><span class="author">{{ book.penulis }}</span>
              </div>
            </div>
          </td>
          <td data-label="Kategori">
            <span class="category-label">{{ book.kategori }}</span>
          </td>
          <td class="stock-column" data-label="Stok">
            <strong>{{ number(book.stok) }}</strong
            ><span class="mobile-unit"> eks.</span>
          </td>
          <td data-label="Status">
            <span
              class="status-badge"
              :class="{
                'status-available': book.stok > LOW_STOCK,
                'status-low': book.stok > 0 && book.stok <= LOW_STOCK,
                'status-empty': book.stok === 0,
              }"
              ><span></span>{{ statusLabels[stockStatus(book.stok)] }}</span
            >
          </td>
          <td class="actions-column">
            <div class="row-actions">
              <button
                class="icon-button"
                :aria-label="`Edit ${book.judul}`"
                title="Edit buku"
                @click="$emit('edit', book)"
              >
                <AppIcon name="edit" :size="17" /></button
              ><button
                class="icon-button delete-button"
                :aria-label="`Hapus ${book.judul}`"
                title="Hapus buku"
                @click="$emit('delete', book)"
              >
                <AppIcon name="trash" :size="17" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
