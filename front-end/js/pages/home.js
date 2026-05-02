import { renderProductCard } from "../components/product-card.js";
import { fetchHomeProducts } from "../services/product.services.js";

// ===============================================
// =============== BESTSELLER LOGIC ==============
// ===============================================
let currentIndex = 0; // Đưa currentIndex ra scope toàn cục để filter có thể reset

async function loadBestSellerProducts() {
  const products = await fetchHomeProducts();
  const productList = document.querySelector(".bestseller__list");
  productList.innerHTML = products
    .map(
      (p) => `
        <div class="bestseller__item">
          ${renderProductCard(p)}
        </div>`,
    )
    .join("");

  // 1. Cập nhật con số hiển thị trên mỗi pill
  updatePillCounts();

  // 2. Khởi tạo slider
  initBestSellerSlider();

  // 3. Khởi tạo sự kiện filter
  initBestsellerFilter();

  // 4. Tự động click vào tab "All" khi vào trang
  const allPill = document.querySelector('.bestseller__pill[data-cat="all"]');
  if (allPill) {
    allPill.click();
  }
}

loadBestSellerProducts();

function updatePillCounts() {
  const items = document.querySelectorAll(".bestseller__item");
  const counts = {
    all: items.length,
    coffee: 0,
    tea: 0,
    matcha: 0,
    special: 0,
  };

  // Quét qua tất cả item vừa render để đếm từng category
  items.forEach((item) => {
    const catEl = item.querySelector(".card__category span");
    const itemCat = catEl ? catEl.textContent.trim().toLowerCase() : "";
    if (counts[itemCat] !== undefined) {
      counts[itemCat]++;
    }
  });

  // Đổ số liệu đếm được lên DOM
  const filterPills = document.querySelectorAll(".bestseller__pill");
  filterPills.forEach((pill) => {
    const cat = pill.dataset.cat;
    const countSpan = pill.querySelector(".bestseller__pill-count");
    if (countSpan && counts[cat] !== undefined) {
      countSpan.textContent = counts[cat];
    }
  });
}

function updateBestsellerSlide() {
  const bestsellerList = document.querySelector(".bestseller__list");
  const bestsellerItems = document.querySelectorAll(".bestseller__item");

  if (!bestsellerItems || bestsellerItems.length === 0) return;

  // Lấy width của item đang hiển thị (để tránh lỗi offsetWidth = 0 khi item bị filter ẩn đi)
  const visibleItem =
    Array.from(bestsellerItems).find((item) => item.style.display !== "none") ||
    bestsellerItems[0];
  const itemWidth = visibleItem.offsetWidth;

  const offset = currentIndex * itemWidth;
  bestsellerList.style.transform = `translateX(-${offset}px)`;
  bestsellerList.style.transition = "transform 0.3s ease";
}

function initBestSellerSlider() {
  const btnNext = document.querySelector(".bestseller__button-next");
  const btnPrev = document.querySelector(".bestseller__button-prev");
  const itemsPerPage = 4;

  if (!btnNext || !btnPrev) return;

  btnNext.addEventListener("click", () => {
    // Chỉ đếm những item không bị ẩn bởi filter
    const visibleItems = document.querySelectorAll(
      '.bestseller__item:not([style*="display: none"])',
    );
    const totalItems = visibleItems.length;

    if (currentIndex + itemsPerPage < totalItems) {
      currentIndex += 1;
    } else {
      currentIndex = 0;
    }
    updateBestsellerSlide();
  });

  btnPrev.addEventListener("click", () => {
    if (currentIndex - 1 >= 0) {
      currentIndex -= 1;
    } else {
      currentIndex = 0;
    }
    updateBestsellerSlide();
  });
}

function initBestsellerFilter() {
  const filterPills = document.querySelectorAll(".bestseller__pill");
  const filterCount = document.getElementById("filter-count");

  if (filterPills.length === 0) return;

  const catLabels = {
    all: "all",
    coffee: "Coffee",
    tea: "Tea",
    matcha: "Matcha",
    special: "Specials",
  };

  filterPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      // Đổi class active
      filterPills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");

      const cat = pill.dataset.cat;
      const items = document.querySelectorAll(".bestseller__item");

      let visibleCount = 0;

      items.forEach((item) => {
        if (cat === "all") {
          item.style.display = "";
          visibleCount++;
        } else {
          const catEl = item.querySelector(".card__category span");
          const itemCat = catEl ? catEl.textContent.trim().toLowerCase() : "";
          if (itemCat === cat) {
            item.style.display = "";
            visibleCount++;
          } else {
            item.style.display = "none";
          }
        }
      });

      // Cập nhật text hiển thị tổng số
      if (filterCount) {
        filterCount.textContent =
          cat === "all"
            ? `Showing all ${visibleCount} items`
            : `Showing ${visibleCount} item${visibleCount !== 1 ? "s" : ""} in ${catLabels[cat]}`;
      }

      // Reset slider về vị trí ban đầu
      currentIndex = 0;
      updateBestsellerSlide();
    });
  });
}

//===============================================
//=============== Image slide  ==================
//===============================================
let list = document.querySelector(".banner__container .banner__list");
let items = document.querySelectorAll(
  ".banner__container .banner__list .banner__item",
);
let dots = document.querySelectorAll(".banner__container .banner__dot li");
let prev = document.querySelector(".banner__container .banner__button-prev");
let next = document.querySelector(".banner__container .banner__button-next");

let active = 0;
let lengthItems = items.length - 1;
next.onclick = function () {
  if (active + 1 > lengthItems) {
    active = 0;
  } else {
    active += 1;
  }
  reloadSlider();
};

prev.onclick = function () {
  if (active - 1 < 0) {
    active = lengthItems;
  } else {
    active -= 1;
  }
  reloadSlider();
};

let refreshSlider = setInterval(() => {
  next.click();
}, 5000);

function reloadSlider() {
  let checkLeft = items[active].offsetLeft;
  list.style.left = -checkLeft + "px";

  let lastActiveDot = document.querySelector(
    ".banner__container .banner__dot li.active",
  );
  lastActiveDot.classList.remove("active");
  dots[active].classList.add("active");
  clearInterval(refreshSlider);
  refreshSlider = setInterval(() => {
    next.click();
  }, 5000);
}

dots.forEach((li, key) => {
  li.addEventListener("click", function () {
    active = key;
    reloadSlider();
  });
});

// ===== WHY TRIBEAN — Scroll Reveal =====
const whyCards = document.querySelectorAll(".whytribean__card");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const card = entry.target;
        const delay = card.dataset.delay || 0;
        setTimeout(() => {
          card.classList.add("visible");
        }, Number(delay));
        revealObserver.unobserve(card);
      }
    });
  },
  { threshold: 0.15 },
);

whyCards.forEach((card) => revealObserver.observe(card));
