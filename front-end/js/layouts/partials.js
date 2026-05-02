async function loadPartial(selector, filePath, callback) {
  const res = await fetch(filePath);
  const html = await res.text();
  document.querySelector(selector).innerHTML = html;
  if (typeof callback === "function") callback();
}

// ---- HEADER ----
loadPartial("#header", "/layouts/header.html", function () {
  initHeaderAuth();
  syncCartCount();
});

async function syncCartCount() {
  const token = localStorage.getItem("AccessToken");
  if (!token) return;

  try {
    const res = await fetch("http://localhost:5262/api/cart", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;

    const cart = await res.json();
    const total = (cart.items ?? []).reduce((s, i) => s + i.quantity, 0);

    const badge = document.querySelector(".header__cart-count");
    if (badge) badge.textContent = total;
  } catch {}
}

// ---- FOOTER ----
loadPartial("#footer", "/layouts/footer.html", function () {
  const yearEl = document.getElementById("footer-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const input = document.querySelector(".footer__newsletter-input");
  const btn = document.querySelector(".footer__newsletter-btn");
  if (btn && input) {
    btn.addEventListener("click", function () {
      const email = input.value.trim();
      if (!email || !email.includes("@")) {
        input.focus();
        return;
      }
      btn.textContent = "Done!";
      btn.style.background = "#27ae60";
      btn.disabled = true;
      input.disabled = true;
    });
  }
});

// ================================================
//                    AUTH STATE
// ================================================
function initHeaderAuth() {
  const token = localStorage.getItem("AccessToken");
  const userRaw = localStorage.getItem("UserInfo");

  const guestEl = document.getElementById("header-guest");
  const userEl = document.getElementById("header-user");

  if (!guestEl || !userEl) return;

  if (token && userRaw) {
    // ---- Đã đăng nhập ----
    let user;
    try {
      user = JSON.parse(userRaw);
    } catch (e) {
      console.error("Lỗi parse triBeanUser:", e);
      guestEl.style.display = "flex";
      userEl.style.display = "none";
      return;
    }

    const fullName = user.fullName || user.name || "User";
    const email = user.email || "";
    const avatar = user.avatar || "";

    // Lấy chữ cái đầu của tên (từ đầu tiên)
    const firstName = fullName.trim().split(" ")[0];
    const initial = firstName[0].toUpperCase();

    // Helper: render avatar hoặc initial vào một element
    function renderAvatar(el, imgClass) {
      if (!el) return;
      if (avatar) {
        el.innerHTML = `<img src="${avatar}" alt="${fullName}" class="${imgClass}" onerror="this.parentElement.textContent='${initial}'" />`;
      } else {
        el.textContent = initial;
      }
    }

    // Hiển thị block user, ẩn block guest
    guestEl.style.display = "none";
    userEl.style.display = "flex";

    // ---- Điền thông tin vào header ----
    const headerName = document.getElementById("header-user-name");
    if (headerName) headerName.textContent = fullName;

    renderAvatar(
      document.getElementById("header-avatar-initials"),
      "header__avatar-img",
    );

    // ---- Điền thông tin vào dropdown ----
    const dropName = document.getElementById("dropdown-name");
    if (dropName) dropName.textContent = fullName;

    const dropEmail = document.getElementById("dropdown-email");
    if (dropEmail) dropEmail.textContent = email;

    renderAvatar(
      document.getElementById("dropdown-avatar-initials"),
      "header__dropdown-avatar-img",
    );

    // ---- Toggle dropdown khi click vào avatar ----
    const avatarBtn = document.getElementById("header-avatar-btn");
    const dropdown = document.getElementById("header-dropdown");
    if (avatarBtn) {
      avatarBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        userEl.classList.toggle("open");
      });
    }

    // Đóng dropdown khi click ra ngoài
    document.addEventListener("click", () => {
      userEl.classList.remove("open");
    });

    // Giữ dropdown mở khi click bên trong
    if (dropdown) {
      dropdown.addEventListener("click", (e) => e.stopPropagation());
    }

    // ---- Logout ----
    const logoutBtn = document.getElementById("header-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        window.location.reload();
      });
    }
  } else {
    // ---- Chưa đăng nhập ----
    guestEl.style.display = "flex";
    userEl.style.display = "none";
  }
}
