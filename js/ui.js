import { getSlots, getProduct, updateSlotQuantity } from "./api.js";

let isBusy = false;
let currentSlotId = null;

const $ = (sel) => document.querySelector(sel);

export function setBusy(v) {
  isBusy = !!v;
  document.body.classList.toggle("is-busy", isBusy);
}
export function getBusy() {
  return isBusy;
}

export function vnd(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return "-";
  return new Intl.NumberFormat("vi-VN").format(num) + "₫";
}

export async function renderAll() {
  const container = document.querySelector("#drinkContainer");
  if (!container) {
    console.error("Missing #drinkContainer in HTML");
    return;
  }

  const slots = await getSlots();

  const frags = await Promise.all(
    slots.map(async (slot) => {
      const product =
        slot.product && typeof slot.product === "object"
          ? slot.product
          : slot.product_id
          ? await getProduct(slot.product_id)
          : null;

      const name =
        product?.name ??
        (slot.product_id
          ? `Sản phẩm #${slot.product_id}`
          : "Chưa gán sản phẩm");

      const price = product?.price != null ? vnd(product.price) : "-";

      const isEmpty = Number(slot.quantity) === 0;

      return `
        <div class="drink-box ${isEmpty ? "empty" : ""}" data-slot-id="${
        slot.slot_id
      }">
          <h3>Ô ${slot.slot_id}</h3>
          <p class="drink-name">${escapeHtml(name)}</p>
          <p class="price">Giá: ${price}</p>
          <div class="quantity">
            <span class="count" aria-live="polite">${slot.quantity}</span>
          </div>
          ${isEmpty ? `<div class="empty-badge">⚠️ Hết hàng</div>` : ""}
          <button type="button" class="update-btn btn-update">Cập nhật</button>
          ${
            product
              ? `<a href="edit_drink.html?id=${slot.slot_id}" class="gear-icon" title="Chỉnh sửa sản phẩm">
                   <img src="https://cdn-icons-png.flaticon.com/512/3524/3524659.png" alt="edit" />
                 </a>`
              : ""
          }
        </div>
      `;
    })
  );

  container.innerHTML = frags.join("");
}

export function setupEventDelegation() {
  const container = $("#drinkContainer");
  const modal = $("#modal");
  const modalInput = $("#modalInput");
  const btnConfirm = $("#confirmUpdate");
  const btnClose = $("#closeModal");

  if (!container || !modal || !modalInput || !btnConfirm || !btnClose) {
    console.error(
      "Thiếu phần tử UI bắt buộc. Kiểm tra lại id trong drink.html"
    );
    return;
  }

  // Delegation cho +/- và update
  container.addEventListener("click", (e) => {
    const box = e.target.closest(".drink-box");
    if (!box) return;

    const countEl = box.querySelector(".count");
    const slotId = Number(box.dataset.slotId);

    if (e.target.closest(".btn-inc")) {
      countEl.textContent = Number(countEl.textContent) + 1;
    } else if (e.target.closest(".btn-dec")) {
      const cur = Number(countEl.textContent);
      if (cur > 0) countEl.textContent = cur - 1;
    } else if (e.target.closest(".btn-update")) {
      // mở modal
      currentSlotId = slotId;
      modal.style.display = "flex";
      modal.setAttribute("aria-hidden", "false");
      modalInput.value = countEl.textContent;
      setTimeout(() => modalInput.focus(), 0);
    }
  });

  // Xác nhận lưu
  btnConfirm.addEventListener("click", async () => {
    const newValue = Number(modalInput.value);
    if (!Number.isInteger(newValue) || newValue < 0) {
      alert("Vui lòng nhập số hợp lệ (>= 0).");
      return;
    }
    if (currentSlotId == null) return;

    try {
      setBusy(true);
      const box = document.querySelector(
        `.drink-box[data-slot-id="${currentSlotId}"]`
      );
      if (box) box.querySelector(".count").textContent = String(newValue);

      await updateSlotQuantity(currentSlotId, newValue);

      if (box) {
        const countEl = box.querySelector(".count");
        countEl.textContent = newValue;

        const isEmpty = newValue === 0;

        // Thêm / gỡ class "empty"
        box.classList.toggle("empty", isEmpty);

        // Cập nhật trạng thái nút
        box.querySelectorAll(".btn-dec, .btn-inc").forEach((btn) => {
          btn.disabled = isEmpty;
        });

        // Cập nhật badge hết hàng
        const badge = box.querySelector(".empty-badge");
        if (isEmpty) {
          if (!badge) {
            const newBadge = document.createElement("div");
            newBadge.className = "empty-badge";
            newBadge.textContent = "⚠️ Hết hàng";
            box.appendChild(newBadge);
          }
        } else if (badge) {
          badge.remove();
        }
      }

      closeModal();
    } catch (err) {
      alert("Lưu thất bại: " + err.message);
    } finally {
      setBusy(false);
    }
  });

  // Đóng modal
  btnClose.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "flex") closeModal();
  });
}

export function closeModal() {
  const modal = $("#modal");
  if (!modal) return;
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
  currentSlotId = null;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
