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
