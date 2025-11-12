// js/api.js
const API_BASE = "http://172.20.10.2:5000";
export const API_PRODUCT_BASE = `${API_BASE}/api/products/`;
export const API_SLOTS = `${API_BASE}/api/slots`;

export function getAuthHeaders() {
  const token = sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchJSON(url, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function getSlots() {
  const json = await fetchJSON(API_SLOTS);
  return json?.metadata?.slots ?? [];
}

const productCache = new Map();
export async function getProduct(productId) {
  if (!productId) return null;
  if (productCache.has(productId)) return productCache.get(productId);

  try {
    const json = await fetchJSON(
      API_PRODUCT_BASE + encodeURIComponent(productId)
    );
    const product = json?.metadata?.product ?? null;
    productCache.set(productId, product);
    return product;
  } catch (e) {
    productCache.set(productId, null);
    return null;
  }
}

export async function updateSlotQuantity(slotId, quantity) {
  return fetchJSON(`${API_SLOTS}/${encodeURIComponent(slotId)}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });
}
