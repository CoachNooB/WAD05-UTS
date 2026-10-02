<script setup>
import { onBeforeUnmount, ref } from "vue";
import AppIcon from "./AppIcon.vue";
const notification = ref("");
let toastTimer;
function show(message) {
  notification.value = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    notification.value = "";
  }, 5000);
}
onBeforeUnmount(() => clearTimeout(toastTimer));
defineExpose({ show });
</script>

<template>
  <Transition name="toast"
    ><div v-if="notification" class="toast" role="status">
      <span class="toast-check"><AppIcon name="check" :size="17" /></span
      >{{ notification
      }}<button
        class="icon-button"
        aria-label="Tutup notifikasi"
        @click="notification = ''"
      >
        <AppIcon name="close" :size="17" />
      </button></div
  ></Transition>
</template>
