import { request } from "../api/api.js";

const FREE_DELIVERY_THRESHOLD = 10.0;
const DELIVERY_FEE = 1.5;
const VALID_COUPONS = {
  TRIBEAN10: { type: "percent", value: 10, label: "10% off" },
  FREESHIP: { type: "delivery", value: 0, label: "Free delivery" },
  WELCOME5: { type: "fixed", value: 5, label: "$5 off your order" },
};

// ---- State ----
let cart = null; // { cartId, userId, items: [], totalAmount }
let coupon = null;

// ---- DOM refs ----
const cartItemsEl = document.getElementById("cart-items");
const cartEmptyEl = document.getElementById("cart-empty");
const cartCouponEl = document.getElementById("cart-coupon");
// const cartSuggestEl = document.getElementById("cart-suggest");
const countEl = document.getElementById("cart-total-count");
const subtotalEl = document.getElementById("summary-subtotal");
const discountRowEl = document.getElementById("summary-discount-row");
const discountEl = document.getElementById("summary-discount");
const deliveryEl = document.getElementById("summary-delivery");
const totalEl = document.getElementById("summary-total");
const checkoutBtn = document.getElementById("checkout-btn");
const deliveryFill = document.getElementById("delivery-fill");
const deliveryLabel = document.getElementById("delivery-label");

// ================================================
// API CALLS
// ================================================
async function fetchCart() {
  try {
    return await request("/cart");
  } catch {
    return null;
  }
}

async function apiAddItem(productId, sizeId, quantity = 1) {
  return await request("/cart/items", {
    method: "POST",
    body: JSON.stringify({ productId, sizeId, quantity }),
  });
}

async function apiUpdateItem(productId, sizeId, quantity) {
  return await request("/cart/items", {
    method: "PUT",
    body: JSON.stringify({ productId, sizeId, quantity }),
  });
}

async function apiRemoveItem(productId, sizeId) {
  return await request(
    `/cart/items?productId=${encodeURIComponent(productId)}&sizeId=${encodeURIComponent(sizeId)}`,
    { method: "DELETE" },
  );
}

async function apiClearCart() {
  return await request("/cart", { method: "DELETE" });
}

// ================================================
// RENDER
// ================================================
function renderCart() {
  cartItemsEl.innerHTML = "";
  const items = cart?.items ?? [];
  const isEmpty = items.length === 0;

  cartEmptyEl.hidden = !isEmpty;
  cartCouponEl.style.display = isEmpty ? "none" : "";
  //   cartSuggestEl.style.display = isEmpty ? "none" : "";
  checkoutBtn.disabled = isEmpty;

  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  countEl.textContent = `${totalQty} item${totalQty !== 1 ? "s" : ""}`;

  if (isEmpty) {
    updateSummary();
    return;
  }

  items.forEach((item, idx) => {
    const lineTotal = (item.finalPrice * item.quantity).toFixed(2);
    const el = document.createElement("div");
    el.className = "cart-item";
    el.dataset.idx = idx;
    el.innerHTML = `
      <div class="cart-item__img-wrap">
        <img class="cart-item__img" src="${item.image}" alt="${item.productName}" />
      </div>
      <div class="cart-item__info">
        <span class="cart-item__cat">${item.categoryName}</span>
        <p class="cart-item__name">${item.productName}</p>
        <div class="cart-item__opts">
          ${item.sizeName ? `<span class="cart-item__opt">${item.sizeName}</span>` : ""}
        </div>
        <p class="cart-item__unit-price">$${item.finalPrice.toFixed(2)} each</p>
      </div>
      <div class="cart-item__controls">
        <span class="cart-item__price">$${lineTotal}</span>
        <div class="cart-item__qty">
          <button class="cart-item__qty-btn" data-action="dec" data-idx="${idx}">
            <i class="fa-solid fa-minus"></i>
          </button>
          <span class="cart-item__qty-val">${item.quantity}</span>
          <button class="cart-item__qty-btn" data-action="inc" data-idx="${idx}">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
        <button class="cart-item__remove" data-action="remove" data-idx="${idx}" aria-label="Remove">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `;
    cartItemsEl.appendChild(el);
  });

  updateSummary();
}

// ================================================
// SUMMARY + DELIVERY BAR
// ================================================
function updateSummary() {
  const items = cart?.items ?? [];
  const subtotal = items.reduce((s, i) => s + i.finalPrice * i.quantity, 0);

  let discount = 0;
  let delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;

  if (coupon) {
    if (coupon.type === "percent") discount = (subtotal * coupon.value) / 100;
    else if (coupon.type === "fixed")
      discount = Math.min(coupon.value, subtotal);
    else if (coupon.type === "delivery") delivery = 0;
  }

  const total = Math.max(0, subtotal - discount + delivery);

  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  discountRowEl.style.display = discount > 0 ? "" : "none";
  if (discount > 0) discountEl.textContent = `-$${discount.toFixed(2)}`;
  deliveryEl.textContent =
    delivery === 0 ? "Free 🎉" : `$${delivery.toFixed(2)}`;
  totalEl.textContent = `$${total.toFixed(2)}`;

  if (subtotal >= FREE_DELIVERY_THRESHOLD || coupon?.type === "delivery") {
    deliveryFill.style.width = "100%";
    deliveryLabel.innerHTML =
      "🎉 You've unlocked <strong>free delivery!</strong>";
  } else {
    const pct = Math.min((subtotal / FREE_DELIVERY_THRESHOLD) * 100, 100);
    const remaining = (FREE_DELIVERY_THRESHOLD - subtotal).toFixed(2);
    deliveryFill.style.width = pct + "%";
    deliveryLabel.innerHTML = `Add <strong>$${remaining}</strong> more for free delivery 🚀`;
  }

  syncHeaderCount();
}

// ================================================
// EVENTS — qty / remove / clear
// ================================================
cartItemsEl.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;

  const idx = parseInt(btn.dataset.idx);
  const item = cart.items[idx];
  const action = btn.dataset.action;

  if (action === "inc") {
    cart = await apiUpdateItem(item.productId, item.sizeId, item.quantity + 1);
    renderCart();
  } else if (action === "dec") {
    if (item.quantity <= 1) {
      // Xóa luôn nếu qty về 0
      animateRemove(btn.closest(".cart-item"), async () => {
        cart = await apiRemoveItem(item.productId, item.sizeId);
        renderCart();
      });
    } else {
      cart = await apiUpdateItem(
        item.productId,
        item.sizeId,
        item.quantity - 1,
      );
      renderCart();
    }
  } else if (action === "remove") {
    animateRemove(btn.closest(".cart-item"), async () => {
      cart = await apiRemoveItem(item.productId, item.sizeId);
      renderCart();
    });
  }
});

function animateRemove(el, cb) {
  el.style.transition = "opacity 0.2s, transform 0.2s";
  el.style.opacity = "0";
  el.style.transform = "translateX(20px)";
  setTimeout(cb, 220);
}

document
  .getElementById("cart-clear-all")
  .addEventListener("click", async () => {
    if (!cart?.items?.length) return;
    if (!confirm("Remove all items from your cart?")) return;
    cart = await apiClearCart();
    coupon = null;
    document.getElementById("coupon-input").value = "";
    document.getElementById("coupon-msg").textContent = "";
    renderCart();
  });

// ================================================
// COUPON
// ================================================
document.getElementById("coupon-apply").addEventListener("click", applyCoupon);
document.getElementById("coupon-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") applyCoupon();
});

function applyCoupon() {
  const code = document
    .getElementById("coupon-input")
    .value.trim()
    .toUpperCase();
  const msgEl = document.getElementById("coupon-msg");

  if (!code) {
    msgEl.textContent = "Please enter a coupon code.";
    msgEl.className = "cart-coupon__msg error";
    return;
  }

  if (VALID_COUPONS[code]) {
    coupon = VALID_COUPONS[code];
    msgEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> "${code}" applied — ${coupon.label}!`;
    msgEl.className = "cart-coupon__msg success";
  } else {
    coupon = null;
    msgEl.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Invalid or expired code.`;
    msgEl.className = "cart-coupon__msg error";
  }

  updateSummary();
}

// ================================================
// CHECKOUT
// ================================================
checkoutBtn.addEventListener("click", () => {
  if (!cart?.items?.length) return;
  // TODO: redirect to checkout
  window.location.href = "../pages/checkout.html";
});

// ================================================
// SYNC HEADER
// ================================================
function syncHeaderCount() {
  const badge = document.querySelector(".header__cart-count");
  if (!badge) return;
  const total = (cart?.items ?? []).reduce((s, i) => s + i.quantity, 0);
  badge.textContent = total;
}

// ================================================
// INIT
// ================================================
async function init() {
  const token = localStorage.getItem("AccessToken");
  if (!token) {
    // Chưa login → show empty, redirect khi checkout
    renderCart();
    return;
  }

  cart = await fetchCart();
  renderCart();
  setTimeout(syncHeaderCount, 600);
}

init();
