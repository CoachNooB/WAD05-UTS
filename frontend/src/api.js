export const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001"
).replace(/\/$/, "");

export async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw new Error(
      "Tidak dapat terhubung ke server. Pastikan backend berjalan, lalu coba lagi.",
    );
  }
  if (!response.ok) {
    let message = `Permintaan gagal (HTTP ${response.status}). Silakan coba lagi.`;
    try {
      const body = await response.json();
      if (typeof body.detail === "string") message = body.detail;
      else if (Array.isArray(body.detail)) {
        message = body.detail
          .map((error) => `${error.loc.at(-1)}: ${error.msg}`)
          .join("; ");
      }
    } catch {
      /* Respons non-JSON tetap menampilkan pesan HTTP. */
    }
    throw new Error(message);
  }
  return response.status === 204 ? null : response.json();
}
