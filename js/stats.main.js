// js/stats.main.js
import { getTransactions, buildProductNameMap } from "./transactions.js";
import {
  toLocalYMD,
  toLocalYM,
  filterByDay,
  filterByMonth,
  revenueByProduct,
} from "./stats.js";
import { renderRevenueBarChart } from "./charts.js";

const $ = (sel) => document.querySelector(sel);

async function loadAndRender() {

  const transactions = await getTransactions();
  const productNameMap = await buildProductNameMap(transactions);

  const now = new Date();
  const ymd = toLocalYMD(now); 
  const ym = toLocalYM(now); 

  const dayData = revenueByProduct(
    filterByDay(transactions, ymd),
    productNameMap
  );
  const monthData = revenueByProduct(
    filterByMonth(transactions, ym),
    productNameMap
  );
  const allData = revenueByProduct(transactions, productNameMap);

  //Vẽ Chart
  renderRevenueBarChart(
    $("#chartDay"),
    dayData,
    `Doanh thu theo sản phẩm - Ngày ${ymd}`
  );
  renderRevenueBarChart(
    $("#chartMonth"),
    monthData,
    `Doanh thu theo sản phẩm - Tháng ${ym}`
  );
  renderRevenueBarChart(
    $("#chartAll"),
    allData,
    "Doanh thu theo sản phẩm - Từ trước tới nay"
  );
}

loadAndRender().catch((err) => {
  console.error(err);
  alert("Tải thống kê thất bại: " + err.message);
});

let _cache = null;
export async function setDay(ymd) {
  if (!_cache) {
    const transactions = await getTransactions();
    const productNameMap = await buildProductNameMap(transactions);
    _cache = { transactions, productNameMap };
  }
  const { transactions, productNameMap } = _cache;
  const dayData = revenueByProduct(
    filterByDay(transactions, ymd),
    productNameMap
  );
  renderRevenueBarChart(
    document.getElementById("chartDay"),
    dayData,
    `Doanh thu theo sản phẩm - Ngày ${ymd}`
  );
}

export async function setMonth(ym) {
  if (!_cache) {
    const transactions = await getTransactions();
    const productNameMap = await buildProductNameMap(transactions);
    _cache = { transactions, productNameMap };
  }
  const { transactions, productNameMap } = _cache;
  const monthData = revenueByProduct(
    filterByMonth(transactions, ym),
    productNameMap
  );
  renderRevenueBarChart(
    document.getElementById("chartMonth"),
    monthData,
    `Doanh thu theo sản phẩm - Tháng ${ym}`
  );
}
