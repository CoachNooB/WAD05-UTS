<script setup>
import { onMounted, ref } from "vue";
import AppIcon from "./components/AppIcon.vue";
import BookStats from "./components/BookStats.vue";
import BookCollection from "./components/BookCollection.vue";
import StockInsights from "./components/StockInsights.vue";
import BookFormDialog from "./components/BookFormDialog.vue";
import DeleteBookDialog from "./components/DeleteBookDialog.vue";
import DashboardHelpDialog from "./components/DashboardHelpDialog.vue";
import NotificationToast from "./components/NotificationToast.vue";
import { useBooks } from "./composables/useBooks";

// App menghubungkan komponen; setiap komponen mengelola state UI miliknya.
const { books, loading, loadError, categories, loadBooks } = useBooks();
const collection = ref(null);
const formDialog = ref(null);
const deleteDialog = ref(null);
const helpDialog = ref(null);
const toast = ref(null);

async function onBookSaved({ isEdit }) {
  if (!isEdit) collection.value.reset();
  toast.value.show(
    isEdit
      ? "Perubahan buku berhasil disimpan."
      : "Buku baru berhasil ditambahkan ke koleksi.",
  );
  await loadBooks();
}

async function onBookDeleted() {
  toast.value.show("Buku berhasil dihapus dari koleksi.");
  await loadBooks();
}

function showAttention() {
  collection.value.showAttention();
  document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
}

onMounted(loadBooks);
</script>

<template>
  <div class="app-shell">
    <div class="main-shell">
      <main id="dashboard">
        <div class="page-heading">
          <div>
            <h1>Dashboard Perpustakaan<span>.</span></h1>
            <p>Selamat datang! Ada cerita baru di setiap sudut rakmu.</p>
          </div>
          <button class="button button-primary" @click="formDialog.open()">
            <AppIcon name="plus" :size="18" /> Tambah Buku
          </button>
        </div>

        <BookStats :books="books" :loading="loading" :load-error="loadError" />
        <BookCollection
          ref="collection"
          :books="books"
          :categories="categories"
          :loading="loading"
          :load-error="loadError"
          @refresh="loadBooks"
          @add="formDialog.open()"
          @edit="formDialog.open($event)"
          @delete="deleteDialog.open($event)"
        />
        <StockInsights
          :books="books"
          :loading="loading"
          :load-error="loadError"
          @attention="showAttention"
        />
        <footer class="page-footer">
          <button class="text-button" @click="helpDialog.open()">
            <AppIcon name="help" :size="14" /> Panduan dashboard
          </button>
          <span
            >ruangbaca <span class="footer-divider">/</span> Tempat cerita
            bertumbuh.</span
          ><span
            v-if="!loading && !loadError"
            class="connection-state"
            role="status"
            ><span class="tiny-dot"></span> Koleksi berhasil dimuat</span
          ><span v-else>{{
            loading ? "Menghubungkan ke perpustakaan…" : "Koneksi terputus"
          }}</span>
        </footer>
      </main>
    </div>
    <BookFormDialog
      ref="formDialog"
      :categories="categories"
      @saved="onBookSaved"
    />
    <DeleteBookDialog ref="deleteDialog" @deleted="onBookDeleted" />
    <DashboardHelpDialog ref="helpDialog" />
    <NotificationToast ref="toast" />
  </div>
</template>
