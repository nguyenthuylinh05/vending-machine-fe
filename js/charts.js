// js/charts.js
import { vnd } from "./stats.js";

const chartInstances = new Map();

/**
 * Vẽ/refresh bar chart doanh thu theo tên sản phẩm
 * @param {HTMLCanvasElement} canvas
 * @param {{labels: string[], values: number[]}} data
 * @param {string} title
 */
export function renderRevenueBarChart(canvas, data, title) {
  if (!canvas) return;
  if (typeof Chart === "undefined") {
    console.error(
      "Chart.js chưa được nạp. Hãy chèn chart.umd.min.js trước module này."
    );
    return;
  }

  const id = canvas.id || Symbol("chart");
  const prev = chartInstances.get(id);
  if (prev) prev.destroy();

  const instance = new Chart(canvas.getContext("2d"), {
    type: "bar",
    data: {
      labels: data.labels,
      datasets: [
        {
          label: "Doanh thu",
          data: data.values,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: title },
        tooltip: {
          callbacks: { label: (ctx) => ` ${vnd(ctx.parsed.y)}` },
        },
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: (val) => vnd(val) },
        },
        x: { ticks: { autoSkip: false, maxRotation: 45, minRotation: 0 } },
      },
    },
  });

  chartInstances.set(id, instance);
}

let drinkChart = null;
let timeChart = null;

/**
 * Biểu đồ cột kép: doanh thu & số lượng bán theo loại nước
 * @param {Object.<string,{sold:number,total:number}>} summary
 */
export function drawDrinkChart(summary) {
  const ctx = document.getElementById("drinkChart")?.getContext("2d");
  if (!ctx) {
    console.warn("Không tìm thấy canvas drinkChart");
    return;
  }

  const labels = Object.keys(summary);
  const sold = labels.map((k) => summary[k].sold);
  const rev = labels.map((k) => summary[k].total);

  if (drinkChart) drinkChart.destroy();

  drinkChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Số lượng bán",
          data: sold,
          backgroundColor: "rgba(54,162,235,0.7)",
          yAxisID: "y1",
        },
        {
          label: "Doanh thu (VNĐ)",
          data: rev,
          backgroundColor: "rgba(255,99,132,0.7)",
          yAxisID: "y2",
        },
      ],
    },
    options: {
      responsive: true,
      interaction: { mode: "index", intersect: false },
      stacked: false,
      plugins: {
        title: { display: true, text: "Thống kê theo loại nước" },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              ctx.dataset.label.includes("Doanh thu")
                ? `${ctx.dataset.label}: ${vnd(ctx.parsed.y)}`
                : `${ctx.dataset.label}: ${ctx.parsed.y}`,
          },
        },
      },
      scales: {
        y1: {
          type: "linear",
          position: "left",
          beginAtZero: true,
          title: { display: true, text: "Số lượng bán" },
        },
        y2: {
          type: "linear",
          position: "right",
          beginAtZero: true,
          grid: { drawOnChartArea: false },
          ticks: { callback: (v) => vnd(v) },
          title: { display: true, text: "Doanh thu (VNĐ)" },
        },
      },
    },
  });
}

/**
 * Biểu đồ đường: doanh thu & số lượng theo thời gian (ngày/tháng/năm)
 * @param {Object.<string,{sold:number,total:number}>} summary
 * @param {"day"|"month"|"year"} mode
 */
export function drawTimeChart(summary, mode) {
  const ctx = document.getElementById("timeChart")?.getContext("2d");
  if (!ctx) {
    console.warn("Không tìm thấy canvas timeChart");
    return;
  }

  const labels = Object.keys(summary).sort();
  const sold = labels.map((k) => summary[k].sold);
  const rev = labels.map((k) => summary[k].total);

  if (timeChart) timeChart.destroy();

  timeChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Số lượng bán",
          data: sold,
          borderColor: "rgba(54,162,235,0.9)",
          fill: false,
          yAxisID: "y1",
          tension: 0.25,
        },
        {
          label: "Doanh thu (VNĐ)",
          data: rev,
          borderColor: "rgba(255,99,132,0.9)",
          fill: false,
          yAxisID: "y2",
          tension: 0.25,
        },
      ],
    },
    options: {
      responsive: true,
      interaction: { mode: "index", intersect: false },
      plugins: {
        title: {
          display: true,
          text: `Biểu đồ theo ${
            mode === "day" ? "ngày" : mode === "month" ? "tháng" : "năm"
          }`,
        },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              ctx.dataset.label.includes("Doanh thu")
                ? `${ctx.dataset.label}: ${vnd(ctx.parsed.y)}`
                : `${ctx.dataset.label}: ${ctx.parsed.y}`,
          },
        },
      },
      scales: {
        y1: {
          type: "linear",
          position: "left",
          beginAtZero: true,
          title: { display: true, text: "Số lượng bán" },
        },
        y2: {
          type: "linear",
          position: "right",
          beginAtZero: true,
          grid: { drawOnChartArea: false },
          ticks: { callback: (v) => vnd(v) },
          title: { display: true, text: "Doanh thu (VNĐ)" },
        },
      },
    },
  });
}
