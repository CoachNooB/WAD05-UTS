<script setup>
import { ref } from "vue";
import AppIcon from "./AppIcon.vue";
import { request } from "../api";
const emit = defineEmits(["deleted"]);
const deleteDialog = ref(null);
const deletingBook = ref(null);
const saving = ref(false);
const formError = ref("");
function confirmDelete(book) {
  deletingBook.value = book;
  formError.value = "";
  deleteDialog.value.showModal();
}

async function deleteBook() {
  if (saving.value || !deletingBook.value) return;
  saving.value = true;
  formError.value = "";
  try {
    await request(`/api/books/${deletingBook.value.id}`, { method: "DELETE" });
    deleteDialog.value.close();
    emit("deleted");
  } catch (error) {
    formError.value = error.message;
  } finally {
    saving.value = false;
  }
}

defineExpose({ open: confirmDelete });
</script>

<template>
  <dialog
    ref="deleteDialog"
    class="modal delete-modal"
    aria-labelledby="delete-title"
    @cancel="saving && $event.preventDefault()"
  >
    <span class="state-icon danger"><AppIcon name="trash" :size="25" /></span>
    <h2 id="delete-title">Hapus buku dari koleksi?</h2>
    <p class="modal-description">
      Buku <strong>“{{ deletingBook?.judul }}”</strong> akan dihapus. Tindakan
      ini tidak dapat dibatalkan.
    </p>
    <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>
    <div class="modal-actions">
      <button
        class="button"
        autofocus
        :disabled="saving"
        @click="deleteDialog.close()"
      >
        Batal</button
      ><button
        class="button button-danger"
        :disabled="saving"
        @click="deleteBook"
      >
        {{ saving ? "Menghapus…" : "Ya, hapus buku" }}
      </button>
    </div>
  </dialog>
</template>
