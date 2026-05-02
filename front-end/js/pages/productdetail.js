// ================================================
// ===              Get Product Data            ===
// ================================================

import { fetchProductDetail } from "../services/product.services.js";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
console.log(id);

let productData;

async function loadProductDetail() {
  productData = await fetchProductDetail(id);
}

await loadProductDetail();

console.log(productData);

// ================================================
// ===             Display Left Data            ===
// ================================================

// display breadcrumb name
const displayBreadcrumbName = document.getElementById("pd-breadcrumb-name");
displayBreadcrumbName.textContent = `${productData.productName}`;

// display image
const mainImage = document.getElementById("gallery-main-img");
mainImage.src = `${productData.mainImgUrl}`;

// process favourite button
const favouriteButton = document.getElementById("fav-btn");
let isFavBtn = false;
favouriteButton.addEventListener("click", () => {
  if (isFavBtn) {
    favouriteButton.classList.remove("active");
    isFavBtn = false;
  } else {
    favouriteButton.classList.add("active");
    isFavBtn = true;
  }
});

// display gallery thumbs
const imageLists = [
  productData.mainImgUrl,
  productData.mainImgUrl,
  productData.mainImgUrl,
];
const imageGalleryContainer = document.getElementById("pd-thumbs");
imageGalleryContainer.innerHTML = imageLists
  .map((item, index) => {
    return `                                
    <div class="pd-gallery__thumb ${index === 0 ? "active" : ""}" data-src="">
      <img src="${item}" alt="View 1" />
    </div>
  `;
  })
  .join("");

const imageGallery = document.querySelectorAll(".pd-gallery__thumb");
let currentGalleryThumb = document.querySelector(".pd-gallery__thumb.active");

imageGallery.forEach((item) => {
  item.addEventListener("click", () => {
    currentGalleryThumb.classList.remove("active");
    currentGalleryThumb = item;
    item.classList.add("active");
  });
});

// ================================================
// ===            Display Right Data            ===
// ================================================
function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function setHTML(id, value) {
  const element = document.getElementById(id);
  if (element) element.innerHTML = value;
}

setText("pd-tag-cat", productData.categoryName);
setText("pd-name", productData.productName);

function renderStars(score) {
  const full = Math.floor(score);
  const half = score % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    '<i class="fa-solid fa-star"></i>'.repeat(full) +
    (half ? '<i class="fa-solid fa-star-half-stroke"></i>' : "") +
    '<i class="fa-regular fa-star"></i>'.repeat(empty)
  );
}
const rating = Number(productData.rating || 0);
setHTML("pd-stars-hero", renderStars(rating));
setText("pd-rating-score", rating.toFixed(1));
setText("pd-rating-count", `(${productData.reviewQuantity} reviews)`);
setText("pd-sold", `${productData.quantitySold} sold`);
setText("pd-desc", productData.description);
setText("pd-price", `$${productData.newPrice}`);
const discountPercentTag = document.getElementById("pd-price-badge");
if (productData.discount === 0) {
  setText("pd-price-old", "");
  setText("pd-price-badge", "");
  discountPercentTag.classList.add("is-hidden");
} else {
  setText("pd-price-old", `$${productData.oldPrice}`);
  setText("pd-price-badge", `-${productData.discount}%`);
  discountPercentTag.classList.remove("is-hidden");
}

// ================================================
// ===              Add To Cart                 ===
// ================================================

const BASE_URL = "http://localhost:5262/api";

// --- Load sizes từ API ---
let sizes = [];
let selectedSize = null;
let quantity = 1;

async function loadSizes() {
  const res = await fetch(`${BASE_URL}/sizes`);
  sizes = await res.json();

  const sizeGroup = document.getElementById("size-group");
  sizeGroup.innerHTML = sizes
    .map(
      (s, i) => `
      <button class="pd-opt-btn ${i === 0 ? "active" : ""}" 
              data-id="${s.id}" 
              data-price="${s.price}">
        ${s.sizeName}${s.price > 0 ? ` + $${s.price.toFixed(2)}` : ""}
      </button>
    `,
    )
    .join("");

  // Mặc định chọn size đầu tiên
  selectedSize = sizes[0];
  updateCartPrice();

  // Gắn sự kiện click size
  sizeGroup.querySelectorAll(".pd-opt-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      sizeGroup
        .querySelectorAll(".pd-opt-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedSize = sizes.find((s) => s.id === btn.dataset.id);
      updateCartPrice();
    });
  });
}

// --- Cập nhật giá hiển thị trên nút ---
function updateCartPrice() {
  const basePrice = productData.newPrice;
  const sizePrice = selectedSize?.price ?? 0;
  const total = ((basePrice + sizePrice) * quantity).toFixed(2);
  document.getElementById("cart-price").textContent = `$${total}`;
}

// --- Quantity ---
document.getElementById("qty-minus").addEventListener("click", () => {
  if (quantity <= 1) return;
  quantity--;
  document.getElementById("qty-val").textContent = quantity;
  updateCartPrice();
});

document.getElementById("qty-plus").addEventListener("click", () => {
  if (quantity >= 20) return;
  quantity++;
  document.getElementById("qty-val").textContent = quantity;
  updateCartPrice();
});

// --- Toast ---
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${type === "success" ? "fa-circle-check" : "fa-circle-xmark"}"></i>
    ${message}
  `;
  toast.style.cssText = `
    position: fixed; bottom: 24px; right: 24px; z-index: 9999;
    background: ${type === "success" ? "#3a7d44" : "#c0392b"};
    color: white; padding: 12px 20px; border-radius: 8px;
    display: flex; align-items: center; gap: 8px;
    font-size: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// --- Sync header cart count ---
async function syncHeaderCount() {
  const token = localStorage.getItem("AccessToken");
  if (!token) return;

  try {
    const res = await fetch(`${BASE_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const cart = await res.json();
    const total = cart.items.reduce((s, i) => s + i.quantity, 0);
    const badge = document.querySelector(".header__cart-count");
    if (badge) badge.textContent = total;
  } catch {}
}

// --- Add to cart ---
document.getElementById("add-to-cart").addEventListener("click", async () => {
  const token = localStorage.getItem("AccessToken");
  if (!token) {
    window.location.href = "../../pages/auth/login.html";
    return;
  }

  if (!selectedSize) {
    showToast("Vui lòng chọn size", "error");
    return;
  }

  const btn = document.getElementById("add-to-cart");
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Adding...`;

  try {
    const res = await fetch(`${BASE_URL}/cart/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        productId: productData.id,
        sizeId: selectedSize.id,
        quantity: quantity,
      }),
    });

    if (!res.ok) throw new Error();

    showToast(`${productData.productName} đã được thêm vào giỏ hàng!`);
    await syncHeaderCount();
  } catch {
    showToast("Thêm vào giỏ hàng thất bại", "error");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-bag-shopping"></i> Add to cart — <span id="cart-price">$${((productData.newPrice + (selectedSize?.price ?? 0)) * quantity).toFixed(2)}</span>`;
  }
});

// Tab Nav process
const pdTabNavButtonList = document.querySelectorAll(".pd-tab-btn");
const pdTabPanel = document.querySelectorAll(".pd-tab-panel");
let currentPdNavBtn = document.querySelector(".pd-tab-btn.active");
let currentPdTabPanel = document.querySelector(".pd-tab-panel.active");
pdTabNavButtonList.forEach((item) => {
  item.addEventListener("click", () => {
    currentPdNavBtn.classList.remove("active");
    currentPdTabPanel.classList.remove("active");
    if (item.dataset.tab === "description") {
      currentPdNavBtn = item;
      item.classList.add("active");
      currentPdTabPanel = document.getElementById("tab-description");
      currentPdTabPanel.classList.add("active");
    } else if (item.dataset.tab === "nutrition") {
      currentPdNavBtn = item;
      item.classList.add("active");
      currentPdTabPanel = document.getElementById("tab-nutrition");
      currentPdTabPanel.classList.add("active");
    } else {
      currentPdNavBtn = item;
      item.classList.add("active");
      currentPdTabPanel = document.getElementById("tab-reviews");
      currentPdTabPanel.classList.add("active");
    }
  });
});

// ================================================
// ===              Reviews Tab                 ===
// ================================================

async function loadReviews() {
  const res = await fetch(`${BASE_URL}/reviews/${productData.id}`);
  if (!res.ok) return;
  const reviews = await res.json();

  // Cập nhật số lượng reviews trên tab button
  const reviewTab = document.querySelector('.pd-tab-btn[data-tab="reviews"]');
  if (reviewTab) reviewTab.textContent = `Reviews (${reviews.length})`;

  // Tính rating trung bình
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  // Cập nhật summary
  document.getElementById("pd-reviews-big").textContent = avgRating.toFixed(1);
  document.getElementById("pd-reviews-total").textContent =
    `${reviews.length} reviews`;
  document.getElementById("pd-reviews-stars").innerHTML =
    renderStars(avgRating);

  // Tính % từng mức sao
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length
      ? Math.round(
          (reviews.filter((r) => r.rating === star).length / reviews.length) *
            100,
        )
      : 0,
  }));

  document.querySelector(".pd-reviews__bars").innerHTML = counts
    .map(
      ({ star, pct }) => `
    <div class="pd-bar-row">
      <span>${star}★</span>
      <div class="pd-bar">
        <div class="pd-bar__fill" style="width: ${pct}%"></div>
      </div>
      <span>${pct}%</span>
    </div>
  `,
    )
    .join("");

  // Render danh sách reviews
  const listEl = document.querySelector(".pd-reviews__list");
  if (reviews.length === 0) {
    listEl.innerHTML = `
      <div style="text-align:center; padding: 40px; color: #888;">
        <i class="fa-regular fa-star" style="font-size:32px; margin-bottom:12px; display:block;"></i>
        No reviews yet. Be the first to review!
      </div>`;
    return;
  }

  listEl.innerHTML = reviews
    .map((r) => {
      const initials = r.userName
        .trim()
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
      const date = new Date(r.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      return `
      <div class="pd-review-card">
        <div class="pd-review-card__top">
          <div class="pd-review-card__avatar">${initials}</div>
          <div>
            <p class="pd-review-card__name">${r.userName}</p>
            <div class="pd-review-card__stars">
              ${renderStars(r.rating)}
            </div>
          </div>
          <span class="pd-review-card__date">${date}</span>
        </div>
        ${r.comment ? `<p class="pd-review-card__text">${r.comment}</p>` : ""}
      </div>
    `;
    })
    .join("");
}

await loadReviews();

// --- Init ---
await loadSizes();
