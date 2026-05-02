import { request } from "../api/api.js";

// const BASE_URL = "http://localhost:5262/api";
const PAGE_SIZE = 9;

// ---- State ----
let currentPage = 1;
let currentStatus = "All";
let currentOrderId = null;

// ================================================
// API CALLS
// ================================================
async function fetchOrders(status, page) {
  const params = new URLSearchParams({
    pageNumber: page,
    pageSizeAll: PAGE_SIZE,
  });
  if (status && status !== "All") params.append("symbol", status);
  try {
    return await request(`/orders?${params}`);
  } catch {
    return null;
  }
}

async function confirmDelivered(orderId) {
  try {
    return await request(`/orders/${orderId}/confirm-delivered`, {
      method: "PUT",
    });
  } catch {
    return null;
  }
}

async function cancelOrder(orderId) {
  try {
    return await request(`/orders/${orderId}/cancel`, { method: "PUT" });
  } catch {
    return null;
  }
}

async function submitReview(productId, orderId, rating, comment) {
  try {
    await request("/reviews", {
      method: "POST",
      body: JSON.stringify({ productId, orderId, rating, comment }),
    });
    return true;
  } catch {
    return false;
  }
}

// ================================================
// HELPERS
// ================================================
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusBadge(status) {
  const map = {
    Pending: "status--pending",
    Confirmed: "status--confirmed",
    Shipping: "status--shipping",
    Delivered: "status--delivered",
    Cancelled: "status--cancelled",
  };
  return `<span class="order-card__status ${map[status] ?? ""}">${status}</span>`;
}

// ================================================
// LOAD & RENDER
// ================================================
async function loadOrders() {
  const loadingEl = document.getElementById("orders-loading");
  const emptyEl = document.getElementById("orders-empty");
  const gridEl = document.getElementById("orders-grid");
  const paginationEl = document.getElementById("orders-pagination");

  loadingEl.style.display = "flex";
  emptyEl.hidden = true;
  gridEl.innerHTML = "";
  paginationEl.hidden = true;

  const data = await fetchOrders(currentStatus, currentPage);
  loadingEl.style.display = "none";

  if (!data || data.orders.length === 0) {
    emptyEl.hidden = false;
    return;
  }

  gridEl.innerHTML = data.orders
    .map((order) => renderOrderCard(order))
    .join("");
  attachCardEvents(data.orders);

  if (data.totalPages > 1) {
    paginationEl.hidden = false;
    renderPagination(data.currentPage, data.totalPages);
  }
}

function renderOrderCard(order) {
  const visibleItems = order.items.slice(0, 4);
  const extraCount = order.items.length - 4;
  const images = visibleItems
    .map(
      (i) =>
        `<img class="order-card__item-img" src="${i.image}" alt="${i.productName}" title="${i.productName}" />`,
    )
    .join("");
  const extra =
    extraCount > 0
      ? `<div class="order-card__item-img--more">+${extraCount}</div>`
      : "";

  let actions = "";
  if (order.status === "Pending") {
    actions = `<div class="order-card__actions"><button class="order-card__btn order-card__btn--cancel" data-action="cancel" data-id="${order.orderId}"><i class="fa-solid fa-xmark"></i> Cancel Order</button></div>`;
  } else if (order.status === "Shipping") {
    actions = `<div class="order-card__actions"><button class="order-card__btn order-card__btn--confirm" data-action="confirm" data-id="${order.orderId}"><i class="fa-solid fa-circle-check"></i> Confirm Received</button></div>`;
  } else if (order.status === "Delivered") {
    actions = `<div class="order-card__actions"><button class="order-card__btn order-card__btn--review" data-action="review" data-id="${order.orderId}"><i class="fa-regular fa-star"></i> Write a Review</button></div>`;
  }

  return `
    <div class="order-card" data-id="${order.orderId}">
      <div class="order-card__header">
        <span class="order-card__id">#${order.orderId.slice(0, 8).toUpperCase()}</span>
        ${statusBadge(order.status)}
      </div>
      <div class="order-card__items">${images}${extra}</div>
      <div class="order-card__footer">
        <span class="order-card__date">${formatDate(order.orderDate)}</span>
        <span class="order-card__total">$${order.totalPrice.toFixed(2)}</span>
      </div>
      ${actions}
    </div>`;
}

function attachCardEvents(orders) {
  document.querySelectorAll(".order-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("[data-action]")) return;
      const order = orders.find((o) => o.orderId === card.dataset.id);
      if (order) openDetailModal(order);
    });
  });

  document.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const { action, id: orderId } = btn.dataset;

      if (action === "cancel") {
        if (!confirm("Are you sure you want to cancel this order?")) return;
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Cancelling...`;
        const result = await cancelOrder(orderId);
        if (result) {
          showToast("Order cancelled successfully");
          loadOrders();
        } else {
          showToast("Failed to cancel order", "error");
          btn.disabled = false;
          btn.innerHTML = `<i class="fa-solid fa-xmark"></i> Cancel Order`;
        }
      }

      if (action === "confirm") {
        if (!confirm("Confirm that you have received your order?")) return;
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Confirming...`;
        const result = await confirmDelivered(orderId);
        if (result) {
          showToast("Order confirmed! Thank you ☕");
          loadOrders();
          setTimeout(
            () => openReviewModal(result.order, result.productIds),
            1000,
          );
        } else {
          showToast("Failed to confirm order", "error");
          btn.disabled = false;
          btn.innerHTML = `<i class="fa-solid fa-circle-check"></i> Confirm Received`;
        }
      }

      if (action === "review") {
        const order = orders.find((o) => o.orderId === orderId);
        if (order)
          openReviewModal(
            order,
            order.items.map((i) => i.productId),
          );
      }
    });
  });
}

// ================================================
// DETAIL MODAL
// ================================================
function openDetailModal(order) {
  document.getElementById("modal-body").innerHTML = `
    <div class="detail-section">
      <p class="detail-section__title">Order Info</p>
      <div class="detail-info">
        <strong>Order ID:</strong> #${order.orderId.slice(0, 8).toUpperCase()}<br/>
        <strong>Date:</strong> ${formatDate(order.orderDate)}<br/>
        <strong>Status:</strong> ${order.status}<br/>
        <strong>Payment:</strong> ${order.paymentStatus}
      </div>
    </div>
    <div class="detail-divider"></div>
    <div class="detail-section">
      <p class="detail-section__title">Delivery</p>
      <div class="detail-info">${order.receiverName}<br/>${order.receiverPhoneNumber}<br/>${order.receiverAddress}</div>
    </div>
    <div class="detail-divider"></div>
    <div class="detail-section">
      <p class="detail-section__title">Items</p>
      ${order.items
        .map(
          (item) => `
        <div class="detail-item">
          <img class="detail-item__img" src="${item.image}" alt="${item.productName}" />
          <div class="detail-item__info">
            <p class="detail-item__name">${item.productName}</p>
            <p class="detail-item__meta">Size ${item.sizeName} × ${item.quantity}</p>
          </div>
          <span class="detail-item__price">$${item.total.toFixed(2)}</span>
        </div>`,
        )
        .join("")}
      <div class="detail-total"><span>Total</span><span>$${order.totalPrice.toFixed(2)}</span></div>
    </div>`;

  const modal = document.getElementById("order-detail-modal");
  modal.classList.add("show");
  modal.hidden = false;
}

function closeDetailModal() {
  const modal = document.getElementById("order-detail-modal");
  modal.classList.remove("show");
  modal.hidden = true;
}

document
  .getElementById("modal-close")
  .addEventListener("click", closeDetailModal);
document
  .getElementById("modal-backdrop")
  .addEventListener("click", closeDetailModal);

// ================================================
// REVIEW MODAL
// ================================================
function openReviewModal(order, productIds) {
  currentOrderId = order.orderId;
  const reviewableItems = order.items.filter((item) =>
    productIds.includes(item.productId),
  );
  const ratings = new Array(reviewableItems.length).fill(0);

  document.getElementById("review-items").innerHTML = reviewableItems
    .map(
      (item, idx) => `
    <div class="review-item" data-product-id="${item.productId}">
      <div class="review-item__product">
        <img class="review-item__img" src="${item.image}" alt="${item.productName}" />
        <div><p class="review-item__name">${item.productName}</p><p class="review-item__size">Size ${item.sizeName}</p></div>
      </div>
      <div class="star-rating" data-idx="${idx}">
        ${[1, 2, 3, 4, 5].map((star) => `<span class="star-rating__star" data-star="${star}" data-idx="${idx}"><i class="fa-regular fa-star"></i></span>`).join("")}
      </div>
      <textarea class="review-item__textarea" placeholder="Share your experience (optional)..." data-idx="${idx}"></textarea>
    </div>`,
    )
    .join("");

  document.querySelectorAll(".star-rating__star").forEach((star) => {
    star.addEventListener("click", () => {
      const idx = parseInt(star.dataset.idx);
      const value = parseInt(star.dataset.star);
      ratings[idx] = value;
      document
        .querySelectorAll(`.star-rating__star[data-idx="${idx}"]`)
        .forEach((s) => {
          const v = parseInt(s.dataset.star);
          s.innerHTML =
            v <= value
              ? '<i class="fa-solid fa-star"></i>'
              : '<i class="fa-regular fa-star"></i>';
          s.style.color = v <= value ? "#f39c12" : "#ddd";
        });
    });
    star.addEventListener("mouseenter", () => {
      const idx = parseInt(star.dataset.idx),
        value = parseInt(star.dataset.star);
      document
        .querySelectorAll(`.star-rating__star[data-idx="${idx}"]`)
        .forEach((s) => {
          s.style.color =
            parseInt(s.dataset.star) <= value ? "#f39c12" : "#ddd";
        });
    });
    star.addEventListener("mouseleave", () => {
      const idx = parseInt(star.dataset.idx);
      document
        .querySelectorAll(`.star-rating__star[data-idx="${idx}"]`)
        .forEach((s) => {
          s.style.color =
            parseInt(s.dataset.star) <= ratings[idx] ? "#f39c12" : "#ddd";
        });
    });
  });

  const submitBtn = document.getElementById("review-submit");
  submitBtn.onclick = async () => {
    if (ratings.some((r) => r === 0)) {
      showToast("Please rate all items", "error");
      return;
    }
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Submitting...`;
    let allSuccess = true;
    for (let i = 0; i < reviewableItems.length; i++) {
      const comment = document
        .querySelector(`.review-item__textarea[data-idx="${i}"]`)
        .value.trim();
      const ok = await submitReview(
        reviewableItems[i].productId,
        currentOrderId,
        ratings[i],
        comment,
      );
      if (!ok) allSuccess = false;
    }
    closeReviewModal();
    showToast(
      allSuccess
        ? "Thank you for your reviews! ☕"
        : "Some reviews may have already been submitted",
      allSuccess ? "success" : "error",
    );
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Submit Reviews`;
  };

  const modal = document.getElementById("review-modal");
  modal.classList.add("show");
  modal.hidden = false;
}

function closeReviewModal() {
  const modal = document.getElementById("review-modal");
  modal.classList.remove("show");
  modal.hidden = true;
}

document
  .getElementById("review-close")
  .addEventListener("click", closeReviewModal);
document
  .getElementById("review-backdrop")
  .addEventListener("click", closeReviewModal);

// ================================================
// FILTER + PAGINATION + TOAST
// ================================================
document.querySelectorAll(".orders-filter__btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".orders-filter__btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentStatus = btn.dataset.status;
    currentPage = 1;
    loadOrders();
  });
});

function renderPagination(currentPg, totalPages) {
  const pagesEl = document.getElementById("pagination-pages");
  const prevBtn = document.getElementById("btn-prev");
  const nextBtn = document.getElementById("btn-next");

  prevBtn.disabled = currentPg === 1;
  nextBtn.disabled = currentPg === totalPages;

  pagesEl.innerHTML = Array.from({ length: totalPages }, (_, i) => i + 1)
    .map(
      (pg) =>
        `<button class="pagination-page ${pg === currentPg ? "active" : ""}" data-page="${pg}">${pg}</button>`,
    )
    .join("");

  pagesEl.querySelectorAll(".pagination-page").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentPage = parseInt(btn.dataset.page);
      loadOrders();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  prevBtn.onclick = () => {
    currentPage--;
    loadOrders();
  };
  nextBtn.onclick = () => {
    currentPage++;
    loadOrders();
  };
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:99999;background:${type === "success" ? "#3a7d44" : "#c0392b"};color:white;padding:12px 20px;border-radius:8px;display:flex;align-items:center;gap:8px;font-size:14px;font-weight:500;box-shadow:0 4px 12px rgba(0,0,0,.15);font-family:inherit;`;
  toast.innerHTML = `<i class="fa-solid ${type === "success" ? "fa-circle-check" : "fa-circle-xmark"}"></i> ${message}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ================================================
// INIT
// ================================================
(function init() {
  if (!localStorage.getItem("AccessToken")) {
    window.location.href = "../../pages/auth/login.html";
    return;
  }
  loadOrders();
})();
