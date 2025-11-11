// js/stats.js

export function vnd(n) {
  const num = Number(n) || 0;
  return new Intl.NumberFormat("vi-VN").format(num) + "₫";
}

export function toLocalYMD(dateLike) {
  const d =
    typeof dateLike === "string" ? new Date(dateLike) : new Date(dateLike);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function toLocalYM(dateLike) {
  const d =
    typeof dateLike === "string" ? new Date(dateLike) : new Date(dateLike);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function filterByDay(transactions, ymd) {
  return transactions.filter((t) => toLocalYMD(t.created_at) === ymd);
}

export function filterByMonth(transactions, ym) {
  return transactions.filter((t) => toLocalYM(t.created_at) === ym);
}

/** Gộp doanh thu theo tên sản phẩm (sum total_price) */
export function revenueByProduct(transactions, productNameMap) {
  const acc = new Map(); // name -> sum
  for (const t of transactions) {
    const name =
      productNameMap.get(t.product_id) ?? `Sản phẩm #${t.product_id}`;
    const prev = acc.get(name) || 0;
    acc.set(name, prev + Number(t.total_price || 0));
  }
  // Trả về { labels: [...], values: [...] } sorted desc
  const entries = [...acc.entries()].sort((a, b) => b[1] - a[1]);
  return {
    labels: entries.map((e) => e[0]),
    values: entries.map((e) => e[1]),
  };
}
