<script setup>
defineProps({
  name: { type: String, default: "book" },
  size: { type: [Number, String], default: 20 },
});
const paths = {
  book: "M12 7C9 4 5 4 2 5v15c4-2 7-2 10 0 3-2 6-2 10 0V5c-3-1-7-1-10 2Zm0 0v13",
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  library: "M4 4h4v16H4zM10 4h4v16h-4zM16 5l4-1 4 15-4 1z",
  search: "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  plus: "M12 5v14M5 12h14",
  arrow: "M5 12h14m-5-5 5 5-5 5",
  sort: "M8 4v16m-4-4 4 4 4-4M16 4h5M16 9h4M16 14h3",
  chevron: "m9 5 7 7-7 7",
  down: "m6 9 6 6 6-6",
  edit: "m16 3 5 5M4 15 16 3a2 2 0 0 1 5 5L9 20l-6 1z",
  trash: "M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7",
  close: "m6 6 12 12M6 18 18 6",
  check: "m5 12 4 4L19 6",
  alert: "m12 3 10 18H2zM12 9v5M12 17h.01",
  layers: "m12 3 10 5-10 5L2 8zM2 12l10 5 10-5M2 16l10 5 10-5",
  chart: "M4 3v18h17M9 16v-5M14 16V6M19 16v-8",
  help: "M9 9a3 3 0 1 1 5 2c-2 1-2 2-2 3M12 17h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  refresh: "M20 7v5h-5M4 17v-5h5M6 6a8 8 0 0 1 13 2M5 16a8 8 0 0 0 13 2",
  logout: "M9 5H4v14h5M10 12h11m-4-4 4 4-4 4",
  calendar: "M3 5h18v16H3zM7 3v4M17 3v4M3 10h18",
};
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path :d="paths[name] || paths.book" />
  </svg>
</template>
