<script setup>
import { nextTick, ref } from "vue";
import AppIcon from "./AppIcon.vue";
import { request } from "../api";
import { LOW_STOCK } from "../utils/books";
const props = defineProps({ categories: { type: Array, required: true } });
const emit = defineEmits(["saved"]);
const formDialog = ref(null);
const titleInput = ref(null);
const editingId = ref(null);
const saving = ref(false);
const formError = ref("");
const form = ref({ judul: "", penulis: "", kategori: "", stok: 1 });
async function openForm(book = null) {
  editingId.value = book?.id ?? null;
  form.value = book
    ? {
        judul: book.judul,
        penulis: book.penulis,
        kategori: book.kategori,
        stok: book.stok,
      }
    : { judul: "", penulis: "", kategori: "", stok: 1 };
  formError.value = "";
  formDialog.value.showModal();
  await nextTick();
  titleInput.value?.focus();
}

async function saveBook() {
  if (saving.value) return;
  const payload = {
    judul: form.value.judul.trim(),
    penulis: form.value.penulis.trim(),
    kategori: form.value.kategori.trim(),
    stok: form.value.stok,
  };
  if (!payload.judul || !payload.penulis || !payload.kategori) {
    formError.value = "Judul, penulis, dan kategori wajib diisi.";
    return;
  }
  if (
    !Number.isInteger(payload.stok) ||
    payload.stok < 0 ||
    payload.stok > 1000000
  ) {
    formError.value = "Stok harus bilangan bulat antara 0 dan 1.000.000.";
    return;
  }
  // Gunakan ejaan kategori yang sudah ada agar perbedaan kapital tidak menggandakan kategori.
  payload.kategori =
    props.categories.find(
      (name) => name.toLowerCase() === payload.kategori.toLowerCase(),
    ) || payload.kategori;
  saving.value = true;
  formError.value = "";
  const isEdit = editingId.value !== null;
  try {
    await request(isEdit ? `/api/books/${editingId.value}` : "/api/books", {
      method: isEdit ? "PUT" : "POST",
      body: JSON.stringify(payload),
    });
    formDialog.value.close();
    emit("saved", { isEdit });
  } catch (error) {
    formError.value = error.message;
  } finally {
    saving.value = false;
  }
}

defineExpose({ open: openForm });
</script>

<template>
  <dialog
    ref="formDialog"
    class="modal"
    aria-labelledby="form-title"
    @cancel="saving && $event.preventDefault()"
  >
    <form @submit.prevent="saveBook">
      <div class="modal-heading">
        <div>
          <span class="eyebrow">KOLEKSI PERPUSTAKAAN</span>
          <h2 id="form-title">
            {{ editingId !== null ? "Edit buku" : "Tambah buku baru" }}
          </h2>
        </div>
        <button
          type="button"
          class="icon-button"
          aria-label="Tutup formulir"
          :disabled="saving"
          @click="formDialog.close()"
        >
          <AppIcon name="close" />
        </button>
      </div>
      <p class="modal-description">
        {{
          editingId !== null
            ? "Perbarui detail dan jumlah stok buku di rakmu."
            : "Lengkapi detail buku untuk memperkaya koleksimu."
        }}
      </p>
      <fieldset :disabled="saving">
        <label
          >Judul buku <span>*</span
          ><input
            ref="titleInput"
            v-model="form.judul"
            required
            maxlength="160"
            placeholder="Contoh: Catatan dari Kota Hujan" /></label
        ><label
          >Penulis <span>*</span
          ><input
            v-model="form.penulis"
            required
            maxlength="160"
            placeholder="Nama penulis"
        /></label>
        <div class="form-row">
          <label
            >Kategori <span>*</span
            ><input
              v-model="form.kategori"
              required
              maxlength="60"
              list="category-options"
              placeholder="Pilih atau ketik kategori" /><datalist
              id="category-options"
            >
              <option
                v-for="name in categories"
                :key="name"
                :value="name"
              /></datalist></label
          ><label
            >Stok (eksemplar) <span>*</span
            ><input
              v-model.number="form.stok"
              type="number"
              required
              min="0"
              max="1000000"
              step="1"
          /></label>
        </div>
      </fieldset>
      <p class="form-hint">
        Semua field wajib diisi. Stok 0–{{ LOW_STOCK }} akan ditandai perlu
        perhatian.
      </p>
      <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>
      <div class="modal-actions">
        <button
          type="button"
          class="button"
          :disabled="saving"
          @click="formDialog.close()"
        >
          Batal</button
        ><button type="submit" class="button button-primary" :disabled="saving">
          <AppIcon :name="editingId !== null ? 'check' : 'plus'" :size="17" />{{
            saving
              ? "Menyimpan…"
              : editingId !== null
                ? "Simpan perubahan"
                : "Tambah buku"
          }}
        </button>
      </div>
    </form>
  </dialog>
</template>
