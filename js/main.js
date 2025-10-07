// js/main.js
import { renderAll, setupEventDelegation, getBusy } from "./ui.js";

let refreshTimer = null;
const REFRESH_MS = 15000;

init();

async function init() {
  setupEventDelegation();
  await renderAll(); 
  startAutoRefresh();
}

function startAutoRefresh() {
  stopAutoRefresh();
  refreshTimer = setInterval(async () => {
    if (getBusy()) return; // tạm dừng khi đang thao tác
    await renderAll();
  }, REFRESH_MS);
}

function stopAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}
