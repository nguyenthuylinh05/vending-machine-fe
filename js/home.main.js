// js/home.main.js
const API_BASE = "http://localhost:5000/api";

function vnd(n) {
  const num = Number(n) || 0;
  return new Intl.NumberFormat("vi-VN").format(num) + "₫";
}

async function getData(endpoint) {
  const token = sessionStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${API_BASE}${endpoint}`, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${text}`);
  }
  const json = await res.json();
  return json?.metadata ?? {};
}

async function loadStats() {
  try {
    // Gọi song song hai API
    const [tx, slots] = await Promise.all([
      getData("/transactions"),
      getData("/slots"),
    ]);

    const transactions = tx.transactions ?? [];
    const slotList = slots.slots ?? [];

    const totalTransactions = transactions.length;
    const totalRevenue = transactions.reduce(
      (sum, t) => sum + (Number(t.total_price) || 0),
      0
    );

    // Vị trí ít nước nhất
    let lowestSlot = "N/A";
    if (slotList.length) {
      const minSlot = slotList.reduce((a, b) =>
        (a.quantity ?? Infinity) < (b.quantity ?? Infinity) ? a : b
      );
      lowestSlot = `Ô ${minSlot.slot_id} (${minSlot.quantity} chai)`;
    }

    document.getElementById("totalRevenue").textContent = vnd(totalRevenue);
    document.getElementById("totalTransactions").textContent =
      totalTransactions;
    document.getElementById("lowestSlot").textContent = lowestSlot;
  } catch (err) {
    console.error(err);
    alert("Không thể tải thống kê: " + err.message);
  }
}

loadStats();
