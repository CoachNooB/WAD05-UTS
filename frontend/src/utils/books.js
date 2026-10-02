// Satu sumber aturan stok untuk filter, badge, ringkasan, dan panduan.
export const LOW_STOCK = 3;
export const statusLabels = {
  empty: "Stok Habis",
  low: "Menipis",
  available: "Tersedia",
};
export function stockStatus(stock) {
  if (stock === 0) return "empty";
  return stock <= LOW_STOCK ? "low" : "available";
}
const formatter = new Intl.NumberFormat("id-ID");
export const number = (value) => formatter.format(value);
