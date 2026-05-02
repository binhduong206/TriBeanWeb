import { authStore } from "./authStore.js";

const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const submitBtn = document.getElementById("login-submit");
const errorEmail = document.getElementById("error-email");
const errorPassword = document.getElementById("error-password");

// ---- Live validation ----
emailInput.addEventListener("blur", () => {
  const val = emailInput.value.trim();
  if (!val) {
    showError("field-email", "Email is required.");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
    showError("field-email", "Please enter a valid email.");
  } else {
    showSuccess("field-email");
  }
});

emailInput.addEventListener("input", () => clearState("field-email"));
passwordInput.addEventListener("input", () => clearState("field-password"));

// ---- Submit ----
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Reset lỗi cũ
  errorEmail.textContent = "";
  errorPassword.textContent = "";

  const emailValue = emailInput.value.trim();
  const passwordValue = passwordInput.value.trim();

  // Validate client-side
  let isValid = true;
  if (!emailValue) {
    showError("field-email", "Please enter your email.");
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
    showError("field-email", "Please enter a valid email.");
    isValid = false;
  }

  if (!passwordValue) {
    showError("field-password", "Please enter your password.");
    isValid = false;
  }

  if (!isValid) return;

  // Bật loading
  setLoading(submitBtn, true);

  try {
    const response = await fetch("http://localhost:5262/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailValue,
        password: passwordValue,
      }),
    });

    const data = await response.json();

    if (response.ok && data.accessToken) {
      // Thành công — lưu token và redirect
      localStorage.setItem("AccessToken", data.accessToken);
      localStorage.setItem("RefreshToken", data.refreshToken);
      localStorage.setItem("AccessTokenExpiration", data.accessTokenExpiration);
      localStorage.setItem(
        "RefreshTokenExpiration",
        data.refreshTokenExpiration,
      );
      localStorage.setItem("UserInfo", JSON.stringify(data.user));

      submitBtn.querySelector(".auth-submit__text").textContent =
        "Welcome back! ☕";
      submitBtn.style.background = "#27ae60";

      setTimeout(() => {
        window.location.href = "../../index.html";
      }, 1000);
    } else {
      // Server trả lỗi (401, sai mật khẩu...)
      showError("field-password", data.message || "Invalid email or password.");
    }
  } catch (error) {
    console.error("Lỗi kết nối Server:", error);
    showError(
      "field-password",
      "Cannot connect to the server. Please try again later.",
    );
  } finally {
    // Chỉ tắt loading nếu chưa redirect thành công
    if (!localStorage.getItem("AccessToken")) {
      setLoading(submitBtn, false);
      submitBtn.style.background = "";
    }
  }

  function saveAuth(data) {
    authStore.accessToken = data.accessToken;
    authStore.refreshToken = data.refreshToken;
    authStore.accessTokenExp = data.accessTokenExpiration;
    authStore.refreshTokenExp = data.refreshTokenExpiration;
    authStore.user = JSON.stringify(data.user);
  }
});
