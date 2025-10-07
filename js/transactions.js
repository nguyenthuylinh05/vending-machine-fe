// js/transactions.js
const API_BASE = "http://localhost:5000";
const API_TRANSACTIONS = `${API_BASE}/api/transactions/`;
const API_PRODUCT_BASE = `${API_BASE}/api/products/`;

function getAuthHeaders() {
  const token = sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchJSON(url, init = {}) {
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

export async function getTransactions() {
  const json = await fetchJSON(API_TRANSACTIONS);
  return json?.metadata?.transactions ?? [];
}

/** Lấy tên sản phẩm theo id; cache để giảm request */
const productCache = new Map();
export async function getProductName(productId) {
  if (!productId) return null;
  if (productCache.has(productId)) return productCache.get(productId);

  try {
    const json = await fetchJSON(
      API_PRODUCT_BASE + encodeURIComponent(productId)
    );
    const name = json?.metadata?.product?.name ?? `Sản phẩm #${productId}`;
    productCache.set(productId, name);
    return name;
  } catch {
    const fallback = `Sản phẩm #${productId}`;
    productCache.set(productId, fallback);
    return fallback;
  }
}

/** Map product_id -> name cho toàn bộ transactions */
export async function buildProductNameMap(transactions) {
  const ids = [
    ...new Set(transactions.map((t) => t.product_id).filter(Boolean)),
  ];
  const entries = await Promise.all(
    ids.map(async (id) => [id, await getProductName(id)])
  );
  return new Map(entries);
}
