"use client";

// Replaces the original lib/axios.js. Since the API routes live in this
// same Next.js app, the session cookie is sent automatically on same-origin
// fetches — no Authorization header / token management needed like the
// old cross-origin Express backend required.
async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const message = body?.message || `Request failed (${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    error.data = body?.data ?? null;
    throw error;
  }

  return body; // { success, message, data }
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path, body) =>
    request(path, { method: "DELETE", ...(body !== undefined && { body: JSON.stringify(body) }) }),
};
