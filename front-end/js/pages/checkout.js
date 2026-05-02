import { request } from "../api/api.js";

const DELIVERY_FEE = 1.5;
const FREE_DELIVERY_THRESHOLD = 10.0;

// ---- State ----
let cart = null;
let currentStep = 1;
let formData = {
  receiverName: "",
  receiverPhone: "",
  receiverAddress: "",
  note: "",
  paymentMethod: "COD",
};

// ================================================
// API
// ================================================
// async function apiFetch(url, options = {}) {
//   let token = localStorage.getItem("AccessToken");
//   if (!token) {
//     window.location.href = "../../pages/auth/login.html";
//     return;
//   }

//   const res = await fetch(BASE_URL + url, {
//     ...options,
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//       ...options.headers,
//     },
//   });

//   if (res.status === 401) {
//     window.location.href = "../../pages/auth/login.html";
//     return;
//   }

//   return res;
// }

async function loadCart() {
  try {
    const res = await request("/cart");
    return await res;
  } catch {
    return null;
  }
}

async function placeOrder() {
  const res = await request("/orders", {
    method: "POST",
    body: JSON.stringify({
      receiverName: formData.receiverName,
      receiverAddress: formData.receiverAddress,
      receiverPhoneNumber: formData.receiverPhone,
      paymentMethod: formData.paymentMethod,
    }),
  });
  return await res;
}

// ================================================
// RENDER SUMMARY SIDEBAR
// ================================================
function renderSummary() {
  const loadingEl = document.getElementById("summary-loading");
  const itemsEl = document.getElementById("summary-items");

  if (!cart || !cart.items?.length) {
    loadingEl.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> Cart is empty`;
    return;
  }

  loadingEl.style.display = "none";

  itemsEl.innerHTML = cart.items
    .map(
      (item) => `
        <div class="summary-item">
            <img class="summary-item__img" src="${item.image}" alt="${item.productName}" />
            <div class="summary-item__info">
                <p class="summary-item__name">${item.productName}</p>
                <p class="summary-item__meta">Size ${item.sizeName} × ${item.quantity}</p>
            </div>
            <span class="summary-item__price">$${item.total.toFixed(2)}</span>
        </div>
    `,
    )
    .join("");

  const subtotal = cart.totalAmount;
  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + delivery;

  document.getElementById("summary-subtotal").textContent =
    `$${subtotal.toFixed(2)}`;
  document.getElementById("summary-delivery").textContent =
    delivery === 0 ? "Free 🎉" : `$${delivery.toFixed(2)}`;
  document.getElementById("summary-total").textContent = `$${total.toFixed(2)}`;
}

// ================================================
// STEPS
// ================================================
function goToStep(step) {
  // Hide all panels
  document
    .querySelectorAll(".checkout-panel")
    .forEach((p) => p.classList.remove("active"));
  document.getElementById(`step-${step}`).classList.add("active");

  // Update step indicators
  document.querySelectorAll(".checkout-step").forEach((el, i) => {
    el.classList.remove("active", "done");
    if (i + 1 === step) el.classList.add("active");
    if (i + 1 < step) el.classList.add("done");
  });

  currentStep = step;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ================================================
// VALIDATION
// ================================================
function validateDelivery() {
  let valid = true;

  const name = document.getElementById("receiver-name").value.trim();
  const phone = document.getElementById("receiver-phone").value.trim();
  const address = document.getElementById("receiver-address").value.trim();

  // Reset errors
  document.getElementById("error-name").textContent = "";
  document.getElementById("error-phone").textContent = "";
  document.getElementById("error-address").textContent = "";
  document.getElementById("receiver-name").classList.remove("error");
  document.getElementById("receiver-phone").classList.remove("error");
  document.getElementById("receiver-address").classList.remove("error");

  if (!name) {
    document.getElementById("error-name").textContent =
      "Please enter your full name";
    document.getElementById("receiver-name").classList.add("error");
    valid = false;
  }

  if (!phone || !/^[0-9]{9,11}$/.test(phone)) {
    document.getElementById("error-phone").textContent =
      "Please enter a valid phone number";
    document.getElementById("receiver-phone").classList.add("error");
    valid = false;
  }

  if (!address) {
    document.getElementById("error-address").textContent =
      "Please enter your delivery address";
    document.getElementById("receiver-address").classList.add("error");
    valid = false;
  }

  if (valid) {
    formData.receiverName = name;
    formData.receiverPhone = phone;
    formData.receiverAddress = address;
    formData.note = document.getElementById("order-note").value.trim();
  }

  return valid;
}

// ================================================
// RENDER CONFIRM STEP
// ================================================
function renderConfirm() {
  document.getElementById("confirm-name").innerHTML = `
        <p id="confirm-name">
            <i class="fa-regular fa-user"></i> ${formData.receiverName}
        </p>
    `;
  document.getElementById("confirm-phone").innerHTML = `   
        <p id="confirm-phone">
            <i class="fa-solid fa-phone"></i> ${formData.receiverPhone}
        </p>
    `;
  document.getElementById("confirm-address").innerHTML = `
        <p id="confirm-address">
            <i class="fa-solid fa-location-dot"></i> ${formData.receiverAddress}
        </p>
    `;
  document.getElementById("confirm-payment").innerHTML =
    formData.paymentMethod === "COD"
      ? `
            <p id="confirm-payment">
                <i class="fa-solid fa-money-bills"></i> Cash on Delivery
            </p>
        `
      : `
            <p id="confirm-payment">
                <i class="fa-solid fa-mobile-screen"></i> Online Payment (VNPay / MoMo)
            </p>
        `;

  const confirmItems = document.getElementById("confirm-items");
  if (!cart?.items?.length) return;

  confirmItems.innerHTML = cart.items
    .map(
      (item) => `
        <div class="confirm-item">
            <img class="confirm-item__img" src="${item.image}" alt="${item.productName}" />
            <div class="confirm-item__info">
                <p class="confirm-item__name">${item.productName}</p>
                <p class="confirm-item__meta">Size ${item.sizeName} × ${item.quantity}</p>
            </div>
            <span class="confirm-item__price">$${item.total.toFixed(2)}</span>
        </div>
    `,
    )
    .join("");
}

// ================================================
// SUCCESS MODAL
// ================================================
function showSuccessModal(order) {
  const modal = document.getElementById("order-modal");
  const info = document.getElementById("modal-order-info");

  const subtotal = order.totalPrice;
  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + delivery;

  info.innerHTML = `
        <strong>Order ID:</strong> #${order.orderId.slice(0, 8).toUpperCase()}<br/>
        <strong>Total:</strong> $${total.toFixed(2)}<br/>
        <strong>Payment:</strong> ${formData.paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}<br/>
        <strong>Deliver to:</strong> ${order.receiverAddress}
    `;

  modal.classList.add("show");
}

// ================================================
// EVENTS
// ================================================

// Step 1 → 2
document.getElementById("btn-to-payment").addEventListener("click", () => {
  if (validateDelivery()) goToStep(2);
});

// Step 2 → 1
document
  .getElementById("btn-back-to-delivery")
  .addEventListener("click", () => {
    goToStep(1);
  });

// Step 2 → 3
document.getElementById("btn-to-confirm").addEventListener("click", () => {
  formData.paymentMethod = document.querySelector(
    'input[name="payment"]:checked',
  ).value;
  renderConfirm();
  goToStep(3);
});

// Step 3 → 2
document.getElementById("btn-back-to-payment").addEventListener("click", () => {
  goToStep(2);
});

// Edit buttons in confirm step
document.querySelectorAll(".confirm-edit-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    goToStep(parseInt(btn.dataset.goto));
  });
});

// Payment option toggle
document.querySelectorAll(".payment-option").forEach((option) => {
  option.addEventListener("click", () => {
    document
      .querySelectorAll(".payment-option")
      .forEach((o) => o.classList.remove("active"));
    option.classList.add("active");
    option.querySelector("input").checked = true;
  });
});

// Place order
document
  .getElementById("btn-place-order")
  .addEventListener("click", async () => {
    if (!cart?.items?.length) return;

    const btn = document.getElementById("btn-place-order");
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Placing Order...`;

    try {
      const order = await placeOrder();
      showSuccessModal(order);

      // Sync header cart count to 0
      const badge = document.querySelector(".header__cart-count");
      if (badge) badge.textContent = "0";
    } catch {
      btn.disabled = false;
      btn.innerHTML = `<i class="fa-solid fa-bag-shopping"></i> Place Order`;
      alert("Failed to place order. Please try again.");
    }
  });

// ================================================
// INIT
// ================================================
async function init() {
  const token = localStorage.getItem("AccessToken");
  if (!token) {
    localStorage.clear();
    window.location.href = "../../pages/auth/login.html";
    return;
  }

  cart = await loadCart();

  if (!cart?.items?.length) {
    window.location.href = "../../pages/cart.html";
    return;
  }

  renderSummary();
  goToStep(1);
}

init();
