<script setup>
import { ref } from "vue";
import AppIcon from "./AppIcon.vue";
import { LOW_STOCK } from "../utils/books";
const helpDialog = ref(null);
defineExpose({ open: () => helpDialog.value.showModal() });
</script>

<template>
  <dialog ref="helpDialog" class="modal" aria-labelledby="help-title">
    <div class="modal-heading">
      <h2 id="help-title">Panduan ruangbaca</h2>
      <button
        class="icon-button"
        aria-label="Tutup panduan"
        @click="helpDialog.close()"
      >
        <AppIcon name="close" />
      </button>
    </div>
    <div class="help-content">
      <p>
        Cari buku berdasarkan <strong>judul atau penulis</strong>. Gunakan
        filter kategori, status stok, dan tombol A–Z untuk mengatur hasil.
      </p>
      <p>
        Klik <strong>Tambah Buku</strong> untuk membuat koleksi baru. Ikon
        pensil mengubah detail buku; ikon tempat sampah menghapusnya setelah
        konfirmasi.
      </p>
      <div class="threshold-list">
        <span class="status-badge status-available">Tersedia</span
        ><span>{{ LOW_STOCK + 1 }} eksemplar atau lebih</span
        ><span class="status-badge status-low">Menipis</span
        ><span>1–{{ LOW_STOCK }} eksemplar</span
        ><span class="status-badge status-empty">Stok Habis</span
        ><span>0 eksemplar</span>
      </div>
      <p>
        Empat statistik dan grafik selalu merangkum
        <strong>seluruh koleksi</strong>, termasuk saat hasil pencarian
        difilter.
      </p>
      <p>
        Data demo tersimpan selama server berjalan. Memulai ulang server
        mengembalikan koleksi awal.
      </p>
    </div>
    <div class="modal-actions">
      <button class="button button-primary" @click="helpDialog.close()">
        Mengerti
      </button>
    </div>
  </dialog>
</template>
