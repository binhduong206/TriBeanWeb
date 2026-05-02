import { getCategoryQuantity } from "../api/category.api.js";
import { renderProductCard } from "../components/product-card.js";
import { fetchMenuProducts } from "../services/product.services.js";

// ================= STATE =================
export let state = {
  pageNumber: 1,
  pageSize: 9,
  price: 0,
  categoryName: "all",
  sort: "default",
  search: "",
  isLoading: false,
};
// let pageNumber = 1;
// let pageSize = 9;
// let currentCategory = "all";
// let productName = "";

let productList = document.getElementById("menu-grid");
const resetProductList = () => (productList.innerHTML = "");

async function loadMenuProducts() {
  const products = await fetchMenuProducts(state);

  productList.innerHTML += products.map((p) => renderProductCard(p)).join("");

  setStateLoadMoreButton(products);

  setDisplayProductList(products);
}

loadMenuProducts();

// =============================================================
// ===                  Load more products                   ===
// =============================================================
const loadMoreMenuButton = document.querySelector(".menu-showmore__button");

loadMoreMenuButton.addEventListener("click", () => {
  state.pageNumber++;
  loadMenuProducts();
});

const setStateLoadMoreButton = (products) => {
  if (products.length !== state.pageSize) {
    loadMoreMenuButton.style.display = "none";
  } else {
    loadMoreMenuButton.style.display = "block";
  }
};

// =============================================================
// ===                     Search Products                   ===
// =============================================================
const searchInput = document.getElementById("menu-search-input");
const clearBtn = document.getElementById("search-clear");

searchInput.addEventListener("input", () => {
  if (searchInput.value.length > 0) {
    clearBtn.classList.remove("is-hidden");
  } else {
    clearBtn.classList.add("is-hidden");
  }
});

clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  state.search = "";
  state.pageNumber = 1;
  resetProductList();
  loadMenuProducts();
  clearBtn.classList.add("is-hidden");
  searchInput.focus();
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const query = searchInput.value.trim();
    if (query) {
      state.search = query;
      state.pageNumber = 1;
      resetProductList();
      loadMenuProducts();
    }
  }
});

const setDisplayProductList = (products) => {
  if (products.length === 0 && state.pageNumber === 1) {
    productList.innerHTML = "Product not found";
  }
};

// =============================================================
// ===                     Filter Products                   ===
// =============================================================
const categoryItems = document.querySelectorAll(".menu-cat-item");
let activeCategoryItem = categoryItems[0];

categoryItems.forEach((c) =>
  c.addEventListener("click", () => {
    // UI active
    activeCategoryItem.classList.remove("active");
    activeCategoryItem = c;
    c.classList.add("active");

    // Update state
    state.categoryName = c.dataset.cat;
    state.pageNumber = 1;

    // Reset Product List
    resetProductList();
    loadMoreMenuButton.style.display = "none";

    // Load lại data
    loadMenuProducts();
  }),
);

// =============================================================
// ===                     FILTER BY PRICE                   ===
// =============================================================
const priceSliderInput = document.getElementById("price-slider");
const priceValue = document.getElementById("price-val");

// Debounce Function
function debounce(func, delay = 500) {
  let timer;

  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}

const applyPriceFilter = () => {
  state.pageNumber = 1;
  resetProductList();
  loadMoreMenuButton.style.display = "none";
  loadMenuProducts();
};

const debouncePriceFilter = debounce(applyPriceFilter, 500);

const updatePriceSliderUI = () => {
  state.price = parseFloat(priceSliderInput.value);
  priceValue.textContent = state.price.toFixed(state.price % 1 === 0 ? 0 : 2);
};

priceSliderInput.addEventListener("input", updatePriceSliderUI);
priceSliderInput.addEventListener("change", () => {
  debouncePriceFilter();
});

// =============================================================
// ===                         SORT                          ===
// =============================================================
const sortButtons = document.querySelectorAll(".menu-sort-btn");
let currentSortButton = sortButtons[0];
sortButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentSortButton.classList.remove("active");
    button.classList.add("active");
    state.sort = button.dataset.sort;
    currentSortButton = button;

    state.pageNumber = 1;
    loadMoreMenuButton.style.display = "none";

    resetProductList();
    loadMenuProducts();
  });
});

// =============================================================
// ===                      RESET FILTER                     ===
// =============================================================
const resetState = document.getElementById("reset-filters");
resetState.addEventListener("click", () => {
  state.pageNumber = 1;
  state.pageSize = 9;
  state.price = 0;
  state.categoryName = "all";
  state.sort = "default";
  state.search = "";
  resetUI();
  resetProductList();
  loadMenuProducts();
});

const resetSearchInput = () => {
  searchInput.value = "";
  clearBtn.classList.add("is-hidden");
};

const resetFilterByCategory = () => {
  activeCategoryItem.classList.remove("active");
  activeCategoryItem = categoryItems[0];
  activeCategoryItem.classList.add("active");
};

const resetFilterByPriceRange = () => {
  priceValue.textContent = priceSliderInput.max;
  priceSliderInput.value = "10";
};

const resetSort = () => {
  currentSortButton.classList.remove("active");
  currentSortButton = sortButtons[0];
  currentSortButton.classList.add("active");
};

const resetUI = () => {
  resetSearchInput();
  resetFilterByCategory();
  resetFilterByPriceRange();
  resetSort();
};

// ================= CATEGORY QUANTITY =================
let allQuantity = document.getElementById("count-all");
let allCoffee = document.getElementById("count-coffee");
let allTea = document.getElementById("count-tea");
let allMatcha = document.getElementById("count-matcha");
let allLatte = document.getElementById("count-latte");
let allJuice = document.getElementById("count-juice");
let allSpecials = document.getElementById("count-special");

async function loadCategoryQuantity() {
  const data = await getCategoryQuantity();

  let total = 0;

  data.forEach((item) => {
    total += item.quantity;

    const name = item.categoryName.toLowerCase();

    if (name === "coffee") allCoffee.innerHTML = item.quantity;
    if (name === "tea") allTea.innerHTML = item.quantity;
    if (name === "matcha") allMatcha.innerHTML = item.quantity;
    if (name === "latte") allLatte.innerHTML = item.quantity;
    if (name === "juice") allJuice.innerHTML = item.quantity;
    if (name === "specials") allSpecials.innerHTML = item.quantity;
  });

  allQuantity.innerHTML = total;
}

loadCategoryQuantity();
