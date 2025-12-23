const API_BASE = "https://vending-machine-api-1-5.onrender.com/api";

function vnd(n) {
  const num = Number(n) || 0;
  return new Intl.NumberFormat("vi-VN").format(num) + "₫";
}

async function getData(endpoint) {
  const token = sessionStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers,
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${text}`);
  }
  const json = await res.json();
  return json?.metadata ?? {};
}

async function loadStats() {
  try {
    // Gọi song song 3 API
    const [tx, slots, depositData] = await Promise.all([
      getData("/transactions"),
      getData("/slots"),
      fetch(
        "https://vending-machine-api-1-5.onrender.com/api/transactions/deposit"
      ).then((res) => res.json()),
    ]);

    const transactions = tx.transactions ?? [];
    const slotList = slots.slots ?? [];

    const totalTransactions = transactions.length;

    // Lấy currentMoney từ API deposit
    const currentMoney = depositData?.metadata?.currentMoney ?? 0;

    // Tìm slot có số lượng thấp nhất
    let lowestSlot = "N/A";
    if (slotList.length) {
      const minSlot = slotList.reduce((a, b) =>
        (a.quantity ?? Infinity) < (b.quantity ?? Infinity) ? a : b
      );
      lowestSlot = `Ô ${minSlot.slot_id} (${minSlot.quantity} chai)`;
    }

    // Cập nhật DOM
    document.getElementById("totalRevenue").textContent = vnd(currentMoney);
    document.getElementById("totalTransactions").textContent =
      totalTransactions;
    document.getElementById("lowestSlot").textContent = lowestSlot;
  } catch (err) {
    console.error(err);
    console.warn("⚠️ Lỗi khi tải thống kê:", err.message);
  }
}

loadStats();

setInterval(loadStats, 3000);
